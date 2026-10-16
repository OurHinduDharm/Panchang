import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";

const locations = [
  { name: "Pithoragarh", latitude: 30.1265, longitude: 80.4817, elevation: 0 },
  { name: "Delhi", latitude: 28.6139, longitude: 77.2090, elevation: 216 },
  { name: "Mumbai", latitude: 19.0760, longitude: 72.8777, elevation: 14 },
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707, elevation: 6 }
];

const sampleInstants = [
  "2026-01-15T06:30:00.000Z",
  "2026-04-14T06:30:00.000Z",
  "2026-07-16T06:30:00.000Z",
  "2026-10-16T06:30:00.000Z",
  "2026-12-15T06:30:00.000Z"
];

const eventFields = [
  "tithiStartTime", "tithiEndTime",
  "nakshatraStartTime", "nakshatraEndTime",
  "yogaStartTime", "yogaEndTime",
  "karanaStartTime", "karanaEndTime"
];

const toIso = value => {
  if (value === undefined || value === null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
};

const report = {
  purpose: "Research-only check: do event boundary timestamps agree within 2 seconds across locations?",
  engine: "@ishubhamx/panchangam-js@3.0.0",
  sampleCount: sampleInstants.length,
  locations: locations.map(({name}) => name),
  results: [],
  verdict: "pending"
};

for (const instant of sampleInstants) {
  const perLocation = locations.map(location => {
    const observer = new Observer(location.latitude, location.longitude, location.elevation);
    const p = getPanchangam(new Date(instant), observer, { timezoneOffset: 330 });
    const fields = {};
    for (const field of eventFields) fields[field] = toIso(p?.[field]);
    const normalizeIntervals = (items, kind) => (Array.isArray(items) ? items : []).map(item => ({
      kind,
      index: item?.index ?? null,
      name: item?.name ?? null,
      startUTC: toIso(item?.startTime ?? item?.start),
      endUTC: toIso(item?.endTime ?? item?.end)
    })).filter(item => item.startUTC && item.endUTC);
    return {
      location: location.name,
      tithi: p?.tithi?.name ?? p?.tithiName ?? p?.tithi ?? null,
      nakshatra: p?.nakshatra?.name ?? p?.nakshatraName ?? p?.nakshatra ?? null,
      yoga: p?.yoga?.name ?? p?.yogaName ?? p?.yoga ?? null,
      sunrise: toIso(p?.sunrise),
      sunset: toIso(p?.sunset),
      fields,
      intervals: [
        ...normalizeIntervals(p?.tithis, "tithi"),
        ...normalizeIntervals(p?.nakshatras, "nakshatra"),
        ...normalizeIntervals(p?.yogas, "yoga")
      ]
    };
  });

  const fieldChecks = {};
  for (const field of eventFields) {
    const values = perLocation.map(row => row.fields[field]).filter(value => value !== null);
    const missingCount = perLocation.filter(row => row.fields[field] === null).length;
    const milliseconds = values.map(value => Date.parse(value)).filter(Number.isFinite);
    const maxSpreadSeconds = milliseconds.length
      ? (Math.max(...milliseconds) - Math.min(...milliseconds)) / 1000
      : null;
    fieldChecks[field] = {
      comparable: missingCount === 0 && milliseconds.length === values.length,
      // The library may use location-dependent topocentric corrections. Treat
      // boundaries as shareable only if all city results agree within 2 seconds.
      sameAcrossLocations: missingCount === 0 &&
        milliseconds.length === values.length &&
        maxSpreadSeconds <= 2,
      distinctValues: [...new Set(values)].length,
      maxSpreadSeconds,
      missingCount
    };
  }

  report.results.push({ instant, fieldChecks, perLocation });
}

const checks = report.results.flatMap(result =>
  Object.entries(result.fieldChecks).map(([field, check]) => ({ instant: result.instant, field, ...check }))
);
const comparable = checks.filter(check => check.comparable);
const mismatches = comparable.filter(check => !check.sameAcrossLocations);
const intervalKeys = new Map();
for (const result of report.results) {
  for (const row of result.perLocation) {
    for (const interval of row.intervals) {
      // Daily interval arrays may clip their first/last item at sunrise.
      // Keep all rows in diagnostics, but do not call these shared event
      // boundaries until independently matched across cities and dates.
      const key = [interval.kind, interval.index, interval.name, interval.startUTC, interval.endUTC].join("|");
      if (!intervalKeys.has(key)) intervalKeys.set(key, []);
      intervalKeys.get(key).push(row.location);
    }
  }
}
const intervalInventory = [...intervalKeys.entries()].map(([key, locations]) => {
  const parts = key.split("|");
  return { kind: parts[0], index: parts[1], name: parts[2], startUTC: parts[3], endUTC: parts[4], locations };
});
report.summary = {
  checkedScalarBoundaryValues: checks.length,
  comparableScalarBoundaryChecks: comparable.length,
  scalarFieldsNeverExposed: eventFields.filter(field => checks.every(check => check.field !== field || !check.comparable)),
  scalarCrossLocationMismatches: mismatches,
  intervalRecords: report.results.reduce((sum, result) => sum + result.perLocation.reduce((n, row) => n + row.intervals.length, 0), 0),
  exactIntervalRecordsRepeatedAcrossLocations: intervalInventory.filter(item => new Set(item.locations).size > 1).length,
  note: "A successful script run only confirms diagnostic execution. It does not certify shared timestamps. p.tithis/p.nakshatras/p.yogas are local sunrise-window segments and may be clipped at sunrise; exact event boundaries need separate validation.",
  intervalSamples: intervalInventory.slice(0, 60)
};
report.verdict = "diagnostic-only-needs-exact-boundary-validation";

console.log(JSON.stringify(report, null, 2));
if (mismatches.length) {
  console.error("Shared-event assumption failed: one or more event boundary timestamps differ by location.");
  process.exitCode = 1;
}
