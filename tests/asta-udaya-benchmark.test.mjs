import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const datasetPath = resolve(here, "../data/asta-udaya-benchmark.json");
const dataset = JSON.parse(readFileSync(datasetPath, "utf8"));

test("Asta-Udaya benchmark has explicit source provenance for every active case", () => {
  assert.equal(dataset.schemaVersion, 1);
  assert.ok(dataset.sources);
  assert.ok(Array.isArray(dataset.cases));
  for (const entry of dataset.cases) {
    assert.ok(entry.id, "each case needs a stable id");
    assert.ok(entry.planet, "each case needs a planet");
    assert.ok(entry.eventModel, "each case needs an explicit event model");
    assert.ok(dataset.sources[entry.sourceId], `missing source for ${entry.id}`);
    assert.ok(entry.precision, "each case needs a precision declaration");
    assert.ok(entry.boundaries, "each case needs boundary data");
    assert.equal(typeof entry.sourceLocation, "string");
    assert.ok(["city-label-only", "coordinate-exact"].includes(entry.comparisonLevel));
    assert.ok(entry.sourceObserver?.coordinateStatus);
  }
});

test("exact-time benchmark entries have timezone-aware timestamps and ordered boundaries", () => {
  const exactCases = dataset.cases.filter(entry => entry.precision === "minute");
  assert.ok(exactCases.length >= 1);
  for (const entry of exactCases) {
    const { astaStart, astaEnd } = entry.boundaries;
    assert.match(astaStart, /(?:Z|[+-]\d{2}:\d{2})$/, `${entry.id}: start needs an explicit timezone`);
    assert.match(astaEnd, /(?:Z|[+-]\d{2}:\d{2})$/, `${entry.id}: end needs an explicit timezone`);
    assert.ok(Date.parse(astaStart) < Date.parse(astaEnd), `${entry.id}: Asta start must precede end`);
  }
});

test("date-only official visibility data is never represented as an exact clock time", () => {
  const dateOnlyCases = dataset.cases.filter(entry => entry.precision === "date-only");
  assert.ok(dateOnlyCases.length >= 1);
  for (const entry of dateOnlyCases) {
    for (const value of Object.values(entry.boundaries)) {
      assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
    }
    assert.equal(entry.eventModel, "rashtriya-panchang-visibility-period");
  }
});

test("source city labels and our observer coordinates are never conflated", () => {
  const pithoragarh = dataset.cases.filter(entry => entry.sourceLocation === "Pithoragarh, Uttarakhand, India");
  const delhi = dataset.cases.filter(entry => entry.sourceLocation === "New Delhi, NCT, India");
  assert.ok(pithoragarh.length >= 1);
  assert.ok(delhi.length >= 1);
  for (const entry of pithoragarh) {
    assert.equal(entry.testObserver.timeZone, "Asia/Kolkata");
    assert.equal(entry.testObserver.latitude, 29.5828);
    assert.equal(entry.testObserver.longitude, 80.2182);
    assert.equal(entry.comparisonLevel, "city-label-only");
    assert.equal(entry.sourceObserver.coordinates, null);
  }
  for (const entry of delhi) {
    assert.equal(entry.testObserver.latitude, undefined, "Delhi coordinates must not be borrowed from Pithoragarh");
    assert.equal(entry.testObserver.longitude, undefined, "Delhi coordinates must not be borrowed from Pithoragarh");
    assert.equal(entry.comparisonLevel, "city-label-only");
    assert.equal(entry.sourceObserver.coordinates, null);
  }
});

test("New Delhi Venus 2026 and 2027 pairs are independently confirmed but remain city-label-only", () => {
  const source = dataset.sources["drik-venus-2026-2027-city-benchmarks"];
  assert.ok(source);
  assert.equal(source.independentChecks.length, 2);
  for (const check of source.independentChecks) {
    assert.equal(check.city, "New Delhi");
    assert.equal(check.status, "independently-confirmed");
    const entry = dataset.cases.find(item => item.id === `venus-new-delhi-${check.year}`);
    assert.ok(entry);
    assert.equal(entry.status, "independently-confirmed-city-label-only");
    assert.equal(entry.acceptanceEligible, true);
    assert.equal(entry.boundaries.astaStart, check.verifiedStartLocal);
    assert.equal(entry.boundaries.astaEnd, check.verifiedEndLocal);
    assert.equal(entry.sourceLocation, "New Delhi, NCT, India");
  }
});

test("unverified historical transcriptions are explicitly quarantined from active acceptance cases", () => {
  assert.ok(Array.isArray(dataset.excludedUnverifiedData));
  const excludedIds = new Set(dataset.excludedUnverifiedData.map(entry => entry.id));
  assert.ok(excludedIds.has("old-pithoragarh-2026-venus-transcription"));
  assert.ok(excludedIds.has("old-pithoragarh-2027-jupiter-transcription"));
  assert.ok(!dataset.cases.some(entry => excludedIds.has(entry.id)));
});

test("Pithoragarh 2027 and Varanasi transcriptions remain provisional, not acceptance targets", () => {
  assert.ok(Array.isArray(dataset.provisionalTranscriptions));
  const expected = new Set([
    "venus-pithoragarh-2027-unverified",
    "venus-varanasi-2026-unverified",
    "venus-varanasi-2027-unverified"
  ]);
  const actual = new Set(dataset.provisionalTranscriptions.map(entry => entry.id));
  for (const id of expected) assert.ok(actual.has(id), `missing provisional reference ${id}`);
  for (const entry of dataset.provisionalTranscriptions) {
    assert.equal(entry.status, "transcription-unverified");
    assert.equal(entry.acceptanceEligible, false);
    assert.ok(entry.reason);
    assert.ok(!dataset.cases.some(active => active.id === entry.id), "provisional data must not enter active cases");
  }
});

test("Rashtriya Panchang Central Station is kept separate from every city-level Drik reference", () => {
  const central = dataset.cases.find(entry => entry.id === "venus-central-station-2026-visibility-period");
  assert.ok(central);
  assert.equal(central.comparisonLevel, "coordinate-exact");
  assert.equal(central.testObserver.latitude, central.sourceObserver.latitude);
  assert.equal(central.testObserver.longitude, central.sourceObserver.longitude);
  assert.equal(central.sourceLocation, "Central Station of India");
  assert.ok(dataset.cases.filter(entry => entry.sourceLocation !== central.sourceLocation)
    .every(entry => entry.comparisonLevel === "city-label-only"));
});


test("Drik New Delhi Mercury source ledger preserves all 2026 and 2027 multi-window events", () => {
  const source = dataset.sources["drik-new-delhi-mercury-2026-2027-multiwindow"];
  assert.ok(source);
  assert.equal(source.location, "New Delhi, NCT, India");
  assert.equal(source.timezone, "Asia/Kolkata");
  assert.equal(source.sourceObserver.coordinates, null);
  assert.match(source.rawNotation, /24\+ hour notation/);
  const y2026 = dataset.eventWindows["drik-new-delhi-mercury-2026"];
  const y2027 = dataset.eventWindows["drik-new-delhi-mercury-2027"];
  assert.equal(y2026.length, 7);
  assert.equal(y2027.length, 7);
  for (const [year, windows] of [[2026, y2026], [2027, y2027]]) {
    for (let i = 0; i < windows.length; i++) {
      const entry = windows[i];
      assert.equal(entry.pageYear, year);
      assert.equal(entry.sequence, i + 1);
      assert.equal(entry.status, "source-captured; normalization rule explicit; city-label-only");
      assert.ok(Date.parse(entry.start.normalizedLocal) < Date.parse(entry.end.normalizedLocal));
      assert.match(entry.start.normalizedLocal, /\+05:30$/);
      assert.match(entry.end.normalizedLocal, /\+05:30$/);
      if (i) {
        assert.ok(Date.parse(windows[i - 1].start.normalizedLocal) < Date.parse(entry.start.normalizedLocal));
        assert.ok(Date.parse(windows[i - 1].end.normalizedLocal) < Date.parse(entry.start.normalizedLocal),
          "separate apparition windows must not overlap after normalization");
      }
    }
  }
});

test("Drik 24+ hour timestamps normalize to the next civil date without losing raw source notation", () => {
  const y2026 = dataset.eventWindows["drik-new-delhi-mercury-2026"];
  const y2027 = dataset.eventWindows["drik-new-delhi-mercury-2027"];
  assert.equal(y2026[0].start.panchangDate, "2026-01-01");
  assert.equal(y2026[0].start.rawLocalTime, "30:29+");
  assert.equal(y2026[0].start.normalizedLocal, "2026-01-02T06:29:00+05:30");
  assert.equal(y2026[1].end.normalizedLocal, "2026-03-18T05:30:00+05:30");
  assert.equal(y2027[1].end.normalizedLocal, "2027-02-27T05:52:00+05:30");
  assert.equal(y2027[6].start.normalizedLocal, "2027-11-25T06:07:00+05:30");
  assert.equal(y2027[6].end.normalizedLocal, "2028-01-02T18:28:00+05:30");
  assert.equal(y2026[6].start.normalizedLocal, y2027[0].start.normalizedLocal,
    "overlapping annual pages must preserve the same shared event boundary");
  assert.equal(y2026[6].end.normalizedLocal, y2027[0].end.normalizedLocal);
});


test("New Delhi 2026–2027 Drik ledger covers captured Tara planets without inventing missing Mars data", () => {
  const expected = [
    ["Venus", "drik-new-delhi-venus-2026", 2],
    ["Venus", "drik-new-delhi-venus-2027", 1],
    ["Jupiter", "drik-new-delhi-jupiter-2026", 1],
    ["Jupiter", "drik-new-delhi-jupiter-2027", 1],
    ["Saturn", "drik-new-delhi-saturn-2026", 1],
    ["Saturn", "drik-new-delhi-saturn-2027", 1],
    ["Mars", "drik-new-delhi-mars-2026", 1]
  ];
  for (const [planet, key, count] of expected) {
    const windows = dataset.eventWindows[key];
    assert.ok(Array.isArray(windows), `missing event stream ${key}`);
    assert.equal(windows.length, count);
    for (const entry of windows) {
      assert.equal(entry.planet, planet);
      assert.equal(entry.status, "source-captured; city-label-only");
      assert.equal(entry.sourceId, "drik-new-delhi-other-planets-2026-2027");
      assert.match(entry.start.normalizedLocal, /\+05:30$/);
      assert.match(entry.end.normalizedLocal, /\+05:30$/);
      assert.ok(Date.parse(entry.start.normalizedLocal) < Date.parse(entry.end.normalizedLocal));
    }
  }
  assert.deepEqual(dataset.eventWindows["drik-new-delhi-mars-2027"], []);
  assert.equal(dataset.eventWindowsMetadata["drik-new-delhi-mars-2027"].status, "not-captured");
});


test("IMD Central Station heliacal event ledger preserves source family, raw times, and normalized instants", () => {
  const source = dataset.sources["rashtriya-2026-27-heliacal-central-station"];
  const events = dataset.eventWindows["rashtriya-central-station-heliacal-2026-2027"];
  const metadata = dataset.eventWindowsMetadata["rashtriya-central-station-heliacal-2026-2027"];
  assert.ok(source);
  assert.equal(source.sourceType, "official-heliacal-rising-setting-event-times");
  assert.equal(source.location, "Central Station of India");
  assert.equal(source.eventDefinition, "Heliacal rising/setting; eastern/western horizon events. Not Drik Tara Asta/combustion boundaries.");
  assert.equal(events.length, 20);
  assert.equal(metadata.rowCount, 20);
  assert.equal(metadata.eventDefinition, "heliacal-rising-setting");
  for (const event of events) {
    assert.equal(event.sourceId, "rashtriya-2026-27-heliacal-central-station");
    assert.equal(event.sourceLocation, "Central Station of India");
    assert.equal(event.status, "official-independent-heliacal-cross-check");
    assert.match(event.instant, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:30$/);
    assert.match(event.rawSourceTime, /^\d{2}:\d{2}$/);
    assert.match(event.sourceEventDate, /^\d{4}-\d{2}-\d{2}$/);
  }
  const mercuryLate = events.find(event => event.id === "imd-mercury-rises-west-2026-09-14");
  assert.equal(mercuryLate.sourceEventDate, "2026-09-13");
  assert.equal(mercuryLate.rawSourceTime, "26:54");
  assert.equal(mercuryLate.instant, "2026-09-14T02:54:00+05:30");
  const venusLate = events.find(event => event.id === "imd-venus-sets-west-2026-10-14");
  assert.equal(venusLate.sourceEventDate, "2026-10-13");
  assert.equal(venusLate.rawSourceTime, "24:18");
  assert.equal(venusLate.instant, "2026-10-14T00:18:00+05:30");
  assert.ok(events.every(event => event.notes.includes("not Drik Tara Asta start/end")));
});


test("city coverage tracker distinguishes captured, inaccessible, and not-started sources", () => {
  const coverage = dataset.cityCoverage;
  assert.ok(coverage);
  assert.deepEqual(coverage.targetYears, [2026, 2027, 2028]);
  assert.equal(coverage.priorityCities.length, 15);
  const newDelhiMercury = coverage.capturedPages.filter(row =>
    row.city === "New Delhi, NCT, India" && row.planet === "Mercury");
  assert.deepEqual(newDelhiMercury.map(row => row.pageYear).sort(), [2026, 2027]);
  assert.deepEqual(newDelhiMercury.map(row => row.windowCount), [7, 7]);
  const missingMars = coverage.notCapturedPages.find(row =>
    row.city === "New Delhi, NCT, India" && row.planet === "Mars" && row.pageYear === 2027);
  assert.equal(missingMars.status, "not-captured");
  const inaccessiblePith = coverage.notCapturedPages.filter(row =>
    row.city === "Pithoragarh, Uttarakhand, India");
  assert.equal(inaccessiblePith.length, 3);
  assert.ok(inaccessiblePith.every(row => row.status === "inaccessible"));
  assert.ok(coverage.notCapturedPages.every(row => row.reason));
  assert.match(coverage.policy, /not zero-event years/);
});


test("Ujjain 2027 longitude-combustion comparator remains separate from Drik and IMD heliacal events", () => {
  const source = dataset.sources["divinenakshatra-ujjain-longitude-asta-2027"];
  const events = dataset.eventWindows["divinenakshatra-ujjain-longitude-combustion-2027"];
  const metadata = dataset.eventWindowsMetadata["divinenakshatra-ujjain-longitude-combustion-2027"];
  assert.ok(source);
  assert.equal(source.location, "Ujjain, Madhya Pradesh, India");
  assert.equal(source.eventDefinition, "Asta by sidereal longitude threshold; distinct from the same page's Surya Siddhanta Ujjain heliacal twilight events and distinct from Drik Tara Asta.");
  assert.deepEqual(source.thresholdRules.Mercury, {directDegrees:14,retrogradeDegrees:12});
  assert.equal(events.length, 10);
  assert.equal(metadata.eventDefinition, "sidereal-longitude-combustion");
  for (const event of events) {
    assert.equal(event.sourceId, "divinenakshatra-ujjain-longitude-asta-2027");
    assert.equal(event.sourceLocation, "Ujjain, Madhya Pradesh, India");
    assert.ok(event.start === null || Date.parse(event.start) < Date.parse("2028-01-01T00:00:00+05:30"));
    assert.ok(event.end === null || Date.parse(event.end) < Date.parse("2028-01-01T00:00:00+05:30"));
    if (event.start && event.end) assert.ok(Date.parse(event.start) < Date.parse(event.end));
  }
  assert.equal(events.find(event => event.id === "dn-mercury-2027-window-1").start, null);
  assert.equal(events.find(event => event.id === "dn-mercury-2027-window-7").end, null);
  assert.ok(!events.some(event => event.planet === "Mars"), "no Mars window was published; do not infer one");
  assert.ok(!dataset.cases.some(entry => entry.sourceId === "divinenakshatra-ujjain-longitude-asta-2027"));
});
