// Diagnostic only: reproduce real tithi/nakshatra intervals at the fixed audit point.
// This is NOT a pass/fail fixture for astronomical correctness; independent
// same-coordinate reference values must be recorded before asserting exact times.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = Object.freeze({
  latitude: 30.1265,
  longitude: 80.4817,
  elevation: 0,
  timezoneOffset: 330
});
const observer = new Observer(
  LOCATION.latitude,
  LOCATION.longitude,
  LOCATION.elevation
);

// Stage 1: major cities first. Coordinates are representative city-center
// points, not claimed to match any publisher's undisclosed coordinates.
const CITY_LOCATIONS = Object.freeze([
  { city: "Mumbai", latitude: 19.0760, longitude: 72.8777, elevation: 0, timezoneOffset: 330 },
  { city: "Delhi", latitude: 28.6139, longitude: 77.2090, elevation: 0, timezoneOffset: 330 }
]);
const DATES = [
  "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25", "2026-08-26",
  "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24"
];

function atISTNoon(date) {
  return new Date(date + "T12:00:00+05:30");
}
function asTime(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function normalize(items, sourceDate, kind) {
  return (Array.isArray(items) ? items : []).map(item => ({
    kind,
    index: item?.index ?? null,
    name: item?.name ?? null,
    startUTC: asTime(item?.startTime ?? item?.start),
    endUTC: asTime(item?.endTime ?? item?.end),
    sourceQueryDate: sourceDate
  })).filter(item => item.startUTC && item.endUTC);
}

test("diagnostic: emit pinned-library tithi/nakshatra intervals for fixed audit coordinates", () => {
  const byKey = new Map();
  for (const date of DATES) {
    const p = getPanchangam(atISTNoon(date), observer, {
      timezoneOffset: LOCATION.timezoneOffset
    });
    assert.ok(p && typeof p === "object", date + ": no Panchang result");
    for (const item of [
      ...normalize(p.tithis, date, "tithi"),
      ...normalize(p.nakshatras, date, "nakshatra")
    ]) {
      const key = [item.kind, item.index, item.startUTC, item.endUTC].join("|");
      if (!byKey.has(key)) byKey.set(key, item);
    }
  }
  const intervals = [...byKey.values()].sort((a, b) =>
    a.startUTC.localeCompare(b.startUTC) || a.kind.localeCompare(b.kind)
  );
  assert.ok(intervals.some(item => item.kind === "tithi"), "no tithi intervals returned");
  assert.ok(intervals.some(item => item.kind === "nakshatra"), "no nakshatra intervals returned");
  const cityDiagnostics = CITY_LOCATIONS.map(city => {
    const cityObserver = new Observer(city.latitude, city.longitude, city.elevation);
    const cityByKey = new Map();
    for (const date of DATES) {
      const p = getPanchangam(atISTNoon(date), cityObserver, {
        timezoneOffset: city.timezoneOffset
      });
      assert.ok(p && typeof p === "object", city.city + " " + date + ": no Panchang result");
      for (const item of [
        ...normalize(p.tithis, date, "tithi"),
        ...normalize(p.nakshatras, date, "nakshatra")
      ]) {
        const key = [item.kind, item.index, item.startUTC, item.endUTC].join("|");
        if (!cityByKey.has(key)) cityByKey.set(key, item);
      }
    }
    const cityIntervals = [...cityByKey.values()].sort((a, b) =>
      a.startUTC.localeCompare(b.startUTC) || a.kind.localeCompare(b.kind)
    );
    assert.ok(cityIntervals.some(item => item.kind === "tithi"), city.city + ": no tithi intervals returned");
    assert.ok(cityIntervals.some(item => item.kind === "nakshatra"), city.city + ": no nakshatra intervals returned");
    return {
      city: city.city,
      location: {
        latitude: city.latitude,
        longitude: city.longitude,
        elevation: city.elevation,
        timezoneOffset: city.timezoneOffset
      },
      note: "Representative city-center coordinates; public web calendar pages may use different coordinates/settings.",
      intervals: cityIntervals
    };
  });

  const report = {
    status: "diagnostic-only-not-independent-validation",
    library: "@ishubhamx/panchangam-js@3.0.0",
    location: LOCATION,
    stage1MajorCityLocations: CITY_LOCATIONS,
    stage1MajorCityDiagnostics: cityDiagnostics,
    datesQueried: DATES,
    externalReferences: {
      note: "Source values are rounded to minutes and Astroica location is 30.2, 80.8; these are comparison references, not correctness assertions.",
      astroica: [
        { kind: "tithi", name: "Shukla Ekadashi", startUTC: "2026-08-22T20:30:00.000Z", endUTC: "2026-08-23T22:49:00.000Z", source: "Astroica transcription supplied by user; 30.2,80.8; Asia/Kolkata" },
        { kind: "tithi", name: "Shukla Ekadashi", startUTC: "2026-09-21T14:31:00.000Z", endUTC: "2026-09-22T16:13:00.000Z", source: "Astroica transcription supplied by user; 30.2,80.8; Asia/Kolkata" },
        { kind: "tithi", name: "Shukla Dwadashi", startUTC: "2026-09-22T16:13:00.000Z", endUTC: "2026-09-23T17:21:00.000Z", source: "Astroica transcription supplied by user; 30.2,80.8; Asia/Kolkata" },
        { kind: "nakshatra", name: "Shravana", startUTC: "2026-09-22T01:36:00.000Z", endUTC: "2026-09-23T03:39:00.000Z", source: "Astroica transcription supplied by user; 30.2,80.8; Asia/Kolkata" }
      ],
      prokeralaDrikCrossCheck: {
        ekadashiEndUTC: "2026-09-22T16:13:00.000Z",
        dwadashiEndUTC: "2026-09-23T17:20:00.000Z",
        shravanaEndUTC: "2026-09-23T03:39:00.000Z",
        sources: [
          "https://www.prokerala.com/astrology/panchang/2026-september-22.html",
          "https://www.drikpanchang.com/panchang/day-panchang.html?date=23%2F09%2F2026&time-format=12hour"
        ]
      }
    },
    generatedAtUTC: new Date().toISOString(),
    intervals
  };
  const outputDir = path.join(process.cwd(), "artifacts");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "vrata-real-date-diagnostic.json"),
    JSON.stringify(report, null, 2) + "\n",
    "utf8"
  );
  console.log("VRATA_REAL_DATE_DIAGNOSTIC " + JSON.stringify(report));
});
