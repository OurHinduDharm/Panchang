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

test("real Panchang comparison: baseline vs 60-second-gap patch across dates and locations", () => {
  const report = [];
  let cases = 0;
  let changedYogaCount = 0;
  let totalAddedMs = 0;
  let totalSourceGaps = 0;

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

      const args = { selectedDate: isoDate, nextSunrise: nextP.sunrise, sunSegments: [] };
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
    changedYogaOutputs: changedYogaCount,
    totalAddedMinutesAcrossYogaOutputs: Number((totalAddedMs / 60000).toFixed(3)),
    changes: report
  }));

  assert.ok(cases === dates.length * locations.length, "Not all date/location cases ran");
  assert.ok(totalSourceGaps > 0, "No exact 60-second source gaps were found in the selected real Panchang cases");
});
