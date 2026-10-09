const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const source = fs.readFileSync("classical-yogas.js", "utf8");
const sandbox = {
  window: {},
  console: { info() {}, warn() {}, error() {} },
  Date, Array, Number, Math, Object, String
};
vm.runInNewContext(source, sandbox, { filename: "classical-yogas.js" });
const engine = sandbox.window.OHDPanchangClassicalYogas;
const legacyCorrectionSandbox = {
  window: {},
  console: { info() {}, warn() {}, error() {} },
  Date, Array, Number, Math, Object, String
};
const legacyCorrectionSource = source.replace(
  "const OHN_SUN_NAKSHATRA_BOUNDARY_CORRECTION = 0;",
  "const OHN_SUN_NAKSHATRA_BOUNDARY_CORRECTION = 0.0054;"
);
if (legacyCorrectionSource === source) throw new Error("Could not isolate legacy-correction diagnostic");
vm.runInNewContext(legacyCorrectionSource, legacyCorrectionSandbox, { filename: "classical-yogas-legacy-correction.js" });
const legacyCorrectionEngine = legacyCorrectionSandbox.window.OHDPanchangClassicalYogas;
const observer = new Observer(29.5828, 80.2182, 1650);

function atISTNoon(date) {
  return new Date(date + "T12:00:00+05:30");
}

function nextDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

function localIST(value) {
  return new Date(value + "+05:30").getTime();
}

function getDetails(date, engineToUse = engine) {
  const next = nextDate(date);
  const p = getPanchangam(atISTNoon(date), observer, { timezoneOffset: 330 });
  const nextP = getPanchangam(atISTNoon(next), observer, { timezoneOffset: 330 });
  const sunSegments = engineToUse.buildSunNakshatraSegments(
    p.sunrise,
    nextP.sunrise,
    instant => {
      const snapshot = getPanchangam(new Date(instant), observer, { timezoneOffset: 330 });
      const longitude = snapshot?.planetaryPositions?.sun?.longitude;
      return Number.isFinite(longitude) ? longitude : null;
    }
  );
  return engineToUse.getClassicalYogas(p, {
    selectedDate: date,
    nextSunrise: nextP.sunrise,
    sunSegments
  });
}

// Times transcribed from the user's Pithoragarh Drik Panchang reference set.
// Each date is the Panchang day: sunrise on that date to sunrise on the next date.
// A four-minute tolerance allows minute-rounded reference display and small
// ephemeris differences; larger differences need investigation, not auto-correction.
const references = [
  ["सर्वार्थ सिद्धि योग", "2026-10-05", "2026-10-05T06:04", "2026-10-05T23:09"],
  ["सर्वार्थ सिद्धि योग", "2026-10-06", "2026-10-06T06:05", "2026-10-06T22:17"],
  ["सर्वार्थ सिद्धि योग", "2026-10-14", "2026-10-14T06:10", "2026-10-15T04:03"],
  ["सर्वार्थ सिद्धि योग", "2026-10-18", "2026-10-18T12:49", "2026-10-19T06:13"],
  ["सर्वार्थ सिद्धि योग", "2026-10-19", "2026-10-19T15:38", "2026-10-20T06:14"],
  ["सर्वार्थ सिद्धि योग", "2026-10-25", "2026-10-25T19:22", "2026-10-26T06:18"],
  ["सर्वार्थ सिद्धि योग", "2026-10-27", "2026-10-27T15:39", "2026-10-28T06:19"],
  ["सर्वार्थ सिद्धि योग", "2026-10-28", "2026-10-28T06:19", "2026-10-29T06:20"],
  ["अमृत सिद्धि योग", "2026-10-14", "2026-10-14T06:10", "2026-10-15T04:03"],
  ["अमृत सिद्धि योग", "2026-11-11", "2026-11-11T06:30", "2026-11-11T11:38"],
  ["रवि योग", "2026-10-13", "2026-10-14T01:43", "2026-10-14T06:10"],
  ["रवि योग", "2026-10-14", "2026-10-14T06:10", "2026-10-15T04:03"],
  ["रवि योग", "2026-10-16", "2026-10-16T06:47", "2026-10-17T06:12"],
  ["रवि योग", "2026-10-17", "2026-10-17T06:12", "2026-10-17T09:47"],
  ["रवि योग", "2026-10-19", "2026-10-19T15:38", "2026-10-20T06:14"],
  ["द्विपुष्कर योग", "2026-10-11", "2026-10-11T21:30", "2026-10-11T22:32"],
  ["द्विपुष्कर योग", "2026-12-05", "2026-12-05T06:49", "2026-12-05T11:48"],
  ["त्रिपुष्कर योग", "2026-10-27", "2026-10-27T15:39", "2026-10-28T04:06"],
  ["त्रिपुष्कर योग", "2026-10-31", "2026-10-31T16:57", "2026-11-01T05:39"],
  ["रवि पुष्य योग", "2026-11-01", "2026-11-01T06:22", "2026-11-02T04:30"],
  ["रवि पुष्य योग", "2026-11-29", "2026-11-29T06:45", "2026-11-29T10:59"],
  ["गुरु पुष्य योग", "2027-02-18", "2027-02-18T21:05", "2027-02-19T06:45"],
  ["गुरु पुष्य योग", "2027-03-18", "2027-03-18T06:16", "2027-03-19T03:21"]
];

test("Pithoragarh special-yoga intervals match supplied Drik references", () => {
  let scoreCacheLegacy;
  const byDate = new Map();
  for (const [, date] of references) {
    if (!byDate.has(date)) byDate.set(date, getDetails(date));
  }

  const failures = [];
  for (const [name, date, expectedStartText, expectedEndText] of references) {
    const details = byDate.get(date);
    assert.equal(details?.available, true, date + ": Panchang calculation unavailable");
    const yoga = (details.yogas || []).find(item => item.name === name);
    const intervals = yoga?.intervals || [];
    const expectedStart = localIST(expectedStartText);
    const expectedEnd = localIST(expectedEndText);

    const nearest = intervals
      .map(interval => ({
        start: new Date(interval.start).getTime(),
        end: new Date(interval.end).getTime()
      }))
      .sort((a, b) =>
        Math.abs(a.start - expectedStart) + Math.abs(a.end - expectedEnd) -
        (Math.abs(b.start - expectedStart) + Math.abs(b.end - expectedEnd))
      )[0];

    if (!nearest) {
      failures.push({ name, date, expectedStartText, expectedEndText, actual: [] });
      continue;
    }

    const startDeltaMinutes = (nearest.start - expectedStart) / 60000;
    const endDeltaMinutes = (nearest.end - expectedEnd) / 60000;
    if (Math.abs(startDeltaMinutes) > 4 || Math.abs(endDeltaMinutes) > 4) {
      failures.push({
        name, date, expectedStartText, expectedEndText,
        actualStart: new Date(nearest.start).toISOString(),
        actualEnd: new Date(nearest.end).toISOString(),
        startDeltaMinutes, endDeltaMinutes,
        allIntervals: intervals.map(i => ({
          start: new Date(i.start).toISOString(),
          end: new Date(i.end).toISOString()
        }))
      });
    }
  }

  const raviReferences = references.filter(item => item[0] === "रवि योग");
  let correctedScoreMs = 0;
  let legacyCorrectionScoreMs = 0;
  for (const [name, date, expectedStartText, expectedEndText] of raviReferences) {
    const expectedStart = localIST(expectedStartText);
    const expectedEnd = localIST(expectedEndText);
    const score = details => {
      const intervals = (details.yogas || []).find(item => item.name === name)?.intervals || [];
      if (!intervals.length) return 1e12;
      return Math.min(...intervals.map(interval =>
        Math.abs(new Date(interval.start).getTime() - expectedStart) +
        Math.abs(new Date(interval.end).getTime() - expectedEnd)
      ));
    };
    correctedScoreMs += score(byDate.get(date));
    scoreCacheLegacy ??= new Map();
    if (!scoreCacheLegacy.has(date)) scoreCacheLegacy.set(date, getDetails(date, legacyCorrectionEngine));
    legacyCorrectionScoreMs += score(scoreCacheLegacy.get(date));
  }

  console.log("DRIK_REFERENCE_COMPARISON " + JSON.stringify({
    location: "Pithoragarh",
    toleranceMinutes: 4,
    referenceCount: references.length,
    failures
  }));
  console.log("SUN_BOUNDARY_CORRECTION_DIAGNOSTIC " + JSON.stringify({
    raviReferenceCount: raviReferences.length,
    totalEndpointErrorMinutesWithExactBoundary: Number((correctedScoreMs / 60000).toFixed(3)),
    totalEndpointErrorMinutesWithLegacyCorrection: Number((legacyCorrectionScoreMs / 60000).toFixed(3))
  }));
  assert.deepEqual(failures, [], "Some classical-yoga intervals differ from the supplied reference data");
});
