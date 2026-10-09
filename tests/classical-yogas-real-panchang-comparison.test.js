const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const patchedSource = fs.readFileSync("classical-yogas.js", "utf8");
const baselineSource = patchedSource
  .replace(
    "return ohdNormalizeTransitionIntervals(p?.nakshatras);",
    "return Array.isArray(p?.nakshatras) ? p.nakshatras : [];"
  )
  .replace(
    "return ohdNormalizeTransitionIntervals(p?.tithis);",
    "return Array.isArray(p?.tithis) ? p.tithis : [];"
  );

assert.notEqual(baselineSource, patchedSource, "Baseline harness must remove both normalizers");

function loadEngine(source) {
  const sandbox = {
    window: {},
    console: { info() {}, warn() {}, error() {} },
    Date, Array, Number, Math, Object, String
  };
  vm.runInNewContext(source, sandbox, { filename: "classical-yogas.js" });
  return sandbox.window.OHDPanchangClassicalYogas;
}

const baselineEngine = loadEngine(baselineSource);
const patchedEngine = loadEngine(patchedSource);

const dates = ["2026-09-18", "2026-09-19", "2026-09-20", "2026-10-09"];
const locations = [
  { name: "Pithoragarh", lat: 29.5828, lon: 80.2182, elevation: 1650 },
  { name: "Delhi", lat: 28.6139, lon: 77.2090, elevation: 216 }
];

function dateAtISTNoon(isoDate) {
  return new Date(isoDate + "T12:00:00+05:30");
}

function nextIsoDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

function serialize(result) {
  return {
    available: result.available,
    yogas: (result.yogas || []).map(y => ({
      name: y.name,
      category: y.category,
      intervals: (y.intervals || []).map(i => ({
        start: new Date(i.start).getTime(),
        end: new Date(i.end).getTime()
      }))
    })),
    anandadi: (result.anandadi || []).map(y => ({
      name: y.name,
      category: y.category,
      intervals: (y.intervals || []).map(i => ({
        start: new Date(i.start).getTime(),
        end: new Date(i.end).getTime()
      }))
    }))
  };
}

// Reproduce the legacy app.js weekday/nakshatra tables and interval builder
// for Amrit Siddhi and Sarvartha Siddhi, so the new module is checked against
// the actual old rules—not only against an unpatched copy of itself.
const LEGACY_AMRIT_TABLE = {
  0:[12], 1:[4], 2:[0], 3:[16], 4:[7], 5:[26], 6:[3]
};
const LEGACY_SARVARTHA_TABLE = {
  0:[0,7,11,12,18,20,25],
  1:[3,4,7,16,21],
  2:[0,2,8,25],
  3:[2,3,4,12,16],
  4:[0,6,7,16,26],
  5:[0,6,16,21,26],
  6:[3,14,21]
};

function legacyYogaIntervals(p, allowedIndexes, sunriseValue, nextSunriseValue) {
  const sunrise = new Date(sunriseValue).getTime();
  const nextSunrise = new Date(nextSunriseValue).getTime();
  const intervals = [];

  for (const nak of (Array.isArray(p.nakshatras) ? p.nakshatras : [])) {
    if (!nak || typeof nak.index !== "number" || !allowedIndexes.includes(nak.index)) continue;
    const rawStart = new Date(nak.startTime).getTime();
    const rawEnd = new Date(nak.endTime).getTime();
    if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) continue;
    const start = Math.max(rawStart, sunrise);
    const end = Math.min(rawEnd, nextSunrise);
    if (end > start) intervals.push({ start: new Date(start), end: new Date(end) });
  }

  intervals.sort((a,b) => a.start.getTime() - b.start.getTime());
  const merged = [];
  for (const item of intervals) {
    const last = merged[merged.length - 1];
    if (last && item.start.getTime() <= last.end.getTime() + 60000) {
      if (item.end > last.end) last.end = item.end;
    } else {
      merged.push({ start: new Date(item.start), end: new Date(item.end) });
    }
  }
  return merged.map(i => ({ start: i.start.getTime(), end: i.end.getTime() }));
}

function intervalTimes(intervals) {
  return (intervals || []).map(i => ({
    start: new Date(i.start).getTime(),
    end: new Date(i.end).getTime()
  }));
}

function duration(intervals) {
  return intervals.reduce((sum, item) => sum + item.end - item.start, 0);
}

function gapCount(items) {
  if (!Array.isArray(items)) return 0;
  let count = 0;
  for (let i = 1; i < items.length; i++) {
    const previous = items[i - 1];
    const current = items[i];
    if (!previous || !current) continue;
    const end = new Date(previous.endTime ?? previous.end).getTime();
    const start = new Date(current.startTime ?? current.start).getTime();
    if (Number.isFinite(end) && Number.isFinite(start) && start - end === 60000) count++;
  }
  return count;
}

function compareGroup(label, beforeItems, afterItems, report) {
  const beforeMap = new Map(beforeItems.map(x => [x.name, x]));
  const afterMap = new Map(afterItems.map(x => [x.name, x]));
  assert.deepEqual([...beforeMap.keys()], [...afterMap.keys()], label + ": yoga list/name order changed");

  let changedCount = 0;
  let totalAddedMs = 0;

  for (const name of beforeMap.keys()) {
    const before = beforeMap.get(name).intervals || [];
    const after = afterMap.get(name).intervals || [];
    const beforeMs = duration(before);
    const afterMs = duration(after);

    assert.ok(afterMs >= beforeMs, label + " / " + name + ": patch unexpectedly reduced active duration");
    if (beforeMs !== afterMs || JSON.stringify(before) !== JSON.stringify(after)) {
      changedCount++;
      totalAddedMs += afterMs - beforeMs;
      report.push({
        case: label,
        yoga: name,
        beforeIntervals: before.length,
        afterIntervals: after.length,
        beforeMinutes: Number((beforeMs / 60000).toFixed(3)),
        afterMinutes: Number((afterMs / 60000).toFixed(3)),
        addedSeconds: Number(((afterMs - beforeMs) / 1000).toFixed(3))
      });
    }
  }
  return { changedCount, totalAddedMs };
}

// Mirror app.js's existing solar-nakshatra transition convention for test inputs.
// The 0.0054° correction is deliberately confined to this test harness;
// it is not presented as independently proven astronomical truth.
const SUN_NAKSHATRA_SIZE = 360 / 27;
const SUN_NAKSHATRA_BOUNDARY_CORRECTION = 0.0054;

function sunLongitudeAt(instant, observer) {
  const snapshot = getPanchangam(new Date(instant), observer, { timezoneOffset: 330 });
  const longitude = snapshot?.planetaryPositions?.sun?.longitude;
  return typeof longitude === "number" && Number.isFinite(longitude)
    ? ((longitude % 360) + 360) % 360
    : null;
}

function findSunNakshatraTransition(observer, startValue, endValue) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    return null;
  }

  const startLongitude = sunLongitudeAt(start, observer);
  const endLongitude = sunLongitudeAt(end, observer);
  if (startLongitude === null || endLongitude === null) return null;

  const startIndex = Math.floor(startLongitude / SUN_NAKSHATRA_SIZE);
  let boundary = (startIndex + 1) * SUN_NAKSHATRA_SIZE + SUN_NAKSHATRA_BOUNDARY_CORRECTION;
  if (boundary >= 360) boundary -= 360;

  let unwrappedEnd = endLongitude;
  if (unwrappedEnd < startLongitude) unwrappedEnd += 360;
  if (boundary < startLongitude) boundary += 360;
  if (boundary < startLongitude || boundary > unwrappedEnd) return null;

  let low = start.getTime();
  let high = end.getTime();
  for (let i = 0; i < 40; i++) {
    const mid = Math.floor((low + high) / 2);
    let longitude = sunLongitudeAt(new Date(mid), observer);
    if (longitude === null) return null;
    if (longitude < startLongitude) longitude += 360;
    if (longitude < boundary) low = mid;
    else high = mid;
  }
  return new Date(high);
}

function buildSunSegments(observer, sunriseValue, nextSunriseValue) {
  const sunrise = new Date(sunriseValue);
  const nextSunrise = new Date(nextSunriseValue);
  const sunriseLongitude = sunLongitudeAt(sunrise, observer);
  if (sunriseLongitude === null || nextSunrise <= sunrise) return [];

  const sunriseIndex = Math.floor(sunriseLongitude / SUN_NAKSHATRA_SIZE);
  const transition = findSunNakshatraTransition(observer, sunrise, nextSunrise);
  if (!transition) {
    return [{ start: sunrise, end: nextSunrise, sunIndex: sunriseIndex }];
  }

  const transitionLongitude = sunLongitudeAt(transition, observer);
  if (transitionLongitude === null) {
    return [{ start: sunrise, end: nextSunrise, sunIndex: sunriseIndex }];
  }
  const transitionIndex = Math.floor(transitionLongitude / SUN_NAKSHATRA_SIZE);
  if (transitionIndex === sunriseIndex) {
    // Avoid creating two segments with the same index if the library's
    // longitude rounding places the corrected boundary on the prior side.
    return [{ start: sunrise, end: nextSunrise, sunIndex: sunriseIndex }];
  }

  return [
    { start: sunrise, end: transition, sunIndex: sunriseIndex },
    { start: transition, end: nextSunrise, sunIndex: transitionIndex }
  ];
}

test("real Panchang comparison: baseline vs 60-second-gap patch across dates and locations", () => {
  const report = [];
  let cases = 0;
  let changedYogaCount = 0;
  let totalAddedMs = 0;
  let totalSourceGaps = 0;
  let totalSunSegments = 0;
  let casesWithRaviIntervals = 0;

  for (const location of locations) {
    const observer = new Observer(location.lat, location.lon, location.elevation);

    for (const isoDate of dates) {
      const date = dateAtISTNoon(isoDate);
      const nextDate = dateAtISTNoon(nextIsoDate(isoDate));
      const p = getPanchangam(date, observer, { timezoneOffset: 330 });
      const nextP = getPanchangam(nextDate, observer, { timezoneOffset: 330 });

      assert.ok(p.sunrise instanceof Date || p.sunrise, location.name + " " + isoDate + ": sunrise missing");
      assert.ok(nextP.sunrise, location.name + " " + isoDate + ": next sunrise missing");

      const gaps = gapCount(p.tithis) + gapCount(p.nakshatras);
      totalSourceGaps += gaps;

      const sunSegments = buildSunSegments(observer, p.sunrise, nextP.sunrise);
      assert.ok(sunSegments.length > 0, location.name + " " + isoDate + ": real Sun segments missing");
      totalSunSegments += sunSegments.length;
      const args = { selectedDate: isoDate, nextSunrise: nextP.sunrise, sunSegments };
      const before = serialize(baselineEngine.getClassicalYogas(p, args));
      const after = serialize(patchedEngine.getClassicalYogas(p, args));

      assert.equal(before.available, true, location.name + " " + isoDate + ": baseline result unavailable");
      assert.equal(after.available, true, location.name + " " + isoDate + ": patched result unavailable");

      const sunriseMs = new Date(p.sunrise).getTime();
      const nextSunriseMs = new Date(nextP.sunrise).getTime();
      for (const group of [after.yogas, after.anandadi]) {
        for (const yoga of group) {
          for (const interval of yoga.intervals) {
            assert.ok(interval.start >= sunriseMs, location.name + " " + isoDate + " / " + yoga.name + ": interval starts before sunrise");
            assert.ok(interval.end <= nextSunriseMs, location.name + " " + isoDate + " / " + yoga.name + ": interval ends after next sunrise");
            assert.ok(interval.end > interval.start, location.name + " " + isoDate + " / " + yoga.name + ": invalid interval");
          }
        }
      }

      const weekday = new Date(isoDate + "T00:00:00").getDay();
      for (const check of [
        ["अमृत सिद्धि योग", LEGACY_AMRIT_TABLE[weekday] || []],
        ["सर्वार्थ सिद्धि योग", LEGACY_SARVARTHA_TABLE[weekday] || []]
      ]) {
        const current = after.yogas.find(y => y.name === check[0]);
        assert.deepEqual(
          intervalTimes(current?.intervals),
          legacyYogaIntervals(p, check[1], p.sunrise, nextP.sunrise),
          location.name + " " + isoDate + " / " + check[0] + ": new module differs from legacy app.js rules"
        );
      }

      const ravi = after.yogas.find(y => y.name === "रवि योग");
      if ((ravi?.intervals || []).length > 0) casesWithRaviIntervals++;

      const summary = [];
      const standard = compareGroup(location.name + " " + isoDate, before.yogas, after.yogas, summary);
      const anandadi = compareGroup(location.name + " " + isoDate + " Anandadi", before.anandadi, after.anandadi, summary);
      changedYogaCount += standard.changedCount + anandadi.changedCount;
      totalAddedMs += standard.totalAddedMs + anandadi.totalAddedMs;
      report.push(...summary);
      cases++;
    }
  }

  console.log("REAL_PANCHANG_COMPARISON " + JSON.stringify({
    dates,
    locations: locations.map(x => x.name),
    cases,
    exact60SecondSourceGaps: totalSourceGaps,
    realSunSegments: totalSunSegments,
    casesWithRaviIntervals,
    changedYogaOutputs: changedYogaCount,
    totalAddedMinutesAcrossYogaOutputs: Number((totalAddedMs / 60000).toFixed(3)),
    changes: report
  }));

  assert.ok(cases === dates.length * locations.length, "Not all date/location cases ran");
  assert.ok(totalSourceGaps > 0, "No exact 60-second source gaps were found in the selected real Panchang cases");
  assert.ok(totalSunSegments >= cases, "Real Sun segments were not supplied for every date/location case");
  assert.ok(casesWithRaviIntervals > 0, "Ravi Yoga was not exercised by any selected real date/location case");
});
