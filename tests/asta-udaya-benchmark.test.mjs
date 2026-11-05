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


test("Drik Chennai Jupiter 2027 is preserved as a city-label cross-check with source URL year anomaly", () => {
  const source = dataset.sources["drik-chennai-2027-jupiter"];
  const windows = dataset.eventWindows["drik-chennai-jupiter-2027"];
  const entry = dataset.cases.find(item => item.id === "jupiter-chennai-2027");
  assert.ok(source);
  assert.equal(source.location, "Chennai, Tamil Nadu, India");
  assert.equal(source.pageYear, 2027);
  assert.equal(source.queryParameterYear, 2028);
  assert.match(source.captureWarning, /do not silently rewrite/);
  assert.equal(windows.length, 1);
  assert.equal(windows[0].start.normalizedLocal, "2027-08-19T19:00:00+05:30");
  assert.equal(windows[0].end.normalizedLocal, "2027-09-13T05:21:00+05:30");
  assert.ok(entry);
  assert.equal(entry.acceptanceEligible, false);
  assert.equal(entry.comparisonLevel, "city-label-only");
  assert.equal(entry.sourceLocation, "Chennai, Tamil Nadu, India");
});


test("Drik-only city coverage excludes other source families and query-year anomalies", () => {
  const coverage = dataset.drikOnlyCoverage;
  assert.ok(coverage);
  assert.equal(coverage.captured.length, 6);
  assert.equal(coverage.provisional.length, 1);
  assert.equal(coverage.inaccessible.length, 2);
  assert.ok(coverage.captured.every(row => row.sourceId.startsWith("drik-")));
  assert.ok(coverage.provisional.every(row => row.status === "search-result-only-query-year-conflict"));
  assert.ok(coverage.inaccessible.every(row => row.status.includes("inaccessible")));
  assert.ok(!coverage.captured.some(row => row.sourceId.includes("divinenakshatra")));
  assert.ok(!coverage.captured.some(row => row.sourceId.includes("rashtriya")));
  const chennai = coverage.provisional[0];
  assert.equal(chennai.city, "Chennai, Tamil Nadu, India");
  assert.match(chennai.reason, /year=2028/);
  const ujjain = coverage.inaccessible.find(row => row.city.startsWith("Ujjain"));
  assert.equal(ujjain.attemptedGeonameId, "1253914");
  assert.match(coverage.nextPriority, /Mumbai and Varanasi/);
});


test("TRAC New Delhi 2027 comparator retains signed Drik boundary deltas without treating either source as ground truth", () => {
  const source = dataset.sources["trac-new-delhi-combustion-2027"];
  const events = dataset.eventWindows["trac-new-delhi-combustion-2027"];
  const comparisons = dataset.comparisons["trac-vs-drik-new-delhi-2027"];
  assert.equal(source.location, "New Delhi, Delhi, India");
  assert.equal(source.timezone, "Asia/Kolkata");
  assert.deepEqual(source.thresholdRules.Mercury, {directDegrees:14,retrogradeDegrees:12});
  assert.equal(events.length, 10);
  assert.equal(comparisons.length, 10);
  assert.ok(comparisons.every(row => row.comparisonStatus === "same-city-label-different-published-output"));
  for (const row of comparisons) {
    assert.equal(row.drikMinusTracStartMinutes,
      Math.round((Date.parse(row.drikStart) - Date.parse(row.tracStart)) / 60000));
    assert.equal(row.drikMinusTracEndMinutes,
      Math.round((Date.parse(row.drikEnd) - Date.parse(row.tracEnd)) / 60000));
  }
  const venus = comparisons.find(row => row.planet === "Venus");
  assert.equal(venus.drikMinusTracStartMinutes, 20666);
  assert.equal(venus.drikMinusTracEndMinutes, -11748);
  const jupiter = comparisons.find(row => row.planet === "Jupiter");
  assert.equal(jupiter.drikMinusTracStartMinutes, 1430);
  assert.equal(jupiter.drikMinusTracEndMinutes, -2750);
  assert.ok(source.notes.includes("independence"));
});


test("VedicTithi Ujjain Tara Asta windows remain a third-party comparator with unknown method", () => {
  const source = dataset.sources["vedictithi-ujjain-guru-shukra-2027"];
  const events = dataset.eventWindows["vedictithi-ujjain-tara-asta-2027"];
  const metadata = dataset.eventWindowsMetadata["vedictithi-ujjain-tara-asta-2027"];
  assert.ok(source);
  assert.equal(source.location, "Ujjain, Madhya Pradesh, India");
  assert.equal(source.zodiac, "Vedic sidereal (Lahiri)");
  assert.match(source.eventDefinition, /not disclosed/);
  assert.equal(events.length, 2);
  assert.equal(metadata.eventDefinition, "third-party-tara-asta-method-undisclosed");
  for (const event of events) {
    assert.equal(event.sourceId, "vedictithi-ujjain-guru-shukra-2027");
    assert.equal(event.comparisonLevel, "city-label-only");
    assert.equal(event.status, "published-city-label-comparator");
    assert.ok(Date.parse(event.start) < Date.parse(event.end));
  }
  assert.equal(events.find(event => event.planet === "Venus").start, "2027-07-22T05:26:00+05:30");
  assert.equal(events.find(event => event.planet === "Jupiter").end, "2027-09-13T05:31:00+05:30");
  assert.ok(!dataset.drikOnlyCoverage.captured.some(row => row.sourceId === "vedictithi-ujjain-guru-shukra-2027"));
});


test("Drik Chennai Guru 2027 city-labelled result is retained with URL-year caveat", () => {
  const source = dataset.sources["drik-chennai-guru-2027"];
  const event = dataset.eventWindows["drik-chennai-guru-2027"][0];
  assert.equal(source.location, "Chennai, Tamil Nadu, India");
  assert.equal(event.pageYear, 2027);
  assert.equal(event.start.normalizedLocal, "2027-08-19T19:00:00+05:30");
  assert.equal(event.end.normalizedLocal, "2027-09-13T05:21:00+05:30");
  assert.ok(source.notes.includes("year=2028"));
  assert.equal(event.status, "source-captured; search-indexed; city-label-only");
});

test("Drik Jupiter 2027 city comparison preserves local event-time differences", () => {
  const row = dataset.comparisons["drik-jupiter-2027-new-delhi-vs-chennai"][0];
  assert.equal(row.status, "same-provider-city-label-comparison");
  assert.equal(row.chennaiMinusDelhiStartMinutes,
    Math.round((Date.parse(row.chennaiStart) - Date.parse(row.delhiStart)) / 60000));
  assert.equal(row.chennaiMinusDelhiEndMinutes,
    Math.round((Date.parse(row.chennaiEnd) - Date.parse(row.delhiEnd)) / 60000));
  assert.equal(row.chennaiMinusDelhiStartMinutes, 2848);
  assert.equal(row.chennaiMinusDelhiEndMinutes, -1);
  assert.ok(row.note.includes("coordinates/elevations undisclosed"));
});


test("Drik Jupiter 2027 five-city sample has ordered local windows and signed deltas", () => {
  const rows = dataset.comparisons["drik-jupiter-2027-multi-city-vs-new-delhi"];
  assert.equal(rows.length, 5);
  const expected = {
    "Chennai, Tamil Nadu, India":[2848,-1],
    "Naksalbari, West Bengal, India":[-46,-42],
    "Rajgarh, Rajasthan, India":[1,3],
    "Athagarh, Odisha, India":[1396,-28],
    "Taleigao, Goa, India":[2875,23]
  };
  for (const row of rows) {
    assert.deepEqual(
      [row.cityMinusNewDelhiStartMinutes,row.cityMinusNewDelhiEndMinutes],
      expected[row.city]
    );
    assert.ok(Date.parse(row.cityStart) < Date.parse(row.cityEnd));
    assert.equal(row.status, "same-provider-city-label-comparison");
  }
});


test("Drik city pages distinguish explicit zero-event Mars results from uncaptured data", () => {
  for (const id of ["drik-rahuri-mars-2027","drik-visakhapatnam-mars-2027"]) {
    assert.ok(dataset.sources[id]);
    assert.deepEqual(dataset.eventWindows[id], []);
    assert.equal(dataset.eventWindowsMetadata[id].status, "captured-no-events");
    assert.equal(dataset.eventWindowsMetadata[id].rowCount, 0);
  }
  assert.ok(dataset.cityCoverage.capturedPages.some(row =>
    row.sourceId === "drik-rahuri-mars-2027" && row.status === "captured-no-events"));
  assert.ok(dataset.cityCoverage.capturedPages.some(row =>
    row.sourceId === "drik-visakhapatnam-mars-2027" && row.status === "captured-no-events"));
});

test("Drik Venus 2027 city pages preserve 24+ notation and normalized local instants", () => {
  const khilchipur = dataset.eventWindows["drik-khilchipur-venus-2027"][0];
  const alleppey = dataset.eventWindows["drik-alleppey-venus-2027"][0];
  assert.equal(khilchipur.start.normalizedLocal, "2027-07-22T05:22:00+05:30");
  assert.equal(khilchipur.end.normalizedLocal, "2027-09-06T19:02:00+05:30");
  assert.equal(alleppey.start.rawLocalTime, "21 Jul 2027 29:49+");
  assert.equal(alleppey.start.normalizedLocal, "2027-07-22T05:49:00+05:30");
  assert.equal(alleppey.end.normalizedLocal, "2027-09-02T18:56:00+05:30");
});


test("Drik Venus 2027 city comparisons retain signed start and end differences", () => {
  const rows = dataset.comparisons["drik-venus-2027-multi-city-vs-new-delhi"];
  assert.equal(rows.length, 2);
  const expected = {
    "Khilchipur, Madhya Pradesh, India":[1454,-4318],
    "Alleppey, Kerala, India":[1481,-10084]
  };
  for (const row of rows) {
    assert.deepEqual([row.cityMinusNewDelhiStartMinutes,row.cityMinusNewDelhiEndMinutes],expected[row.city]);
    assert.equal(row.status,"same-provider-city-label-comparison");
  }
});


test("priority-city progress count excludes non-priority captures and does not imply full coverage", () => {
  const coverage = dataset.cityCoverage;
  assert.equal(coverage.priorityCitiesWithAnyCapture.length, 4);
  assert.equal(coverage.pendingCityCount, 11);
  assert.ok(coverage.priorityCitiesWithAnyCapture.every(city => coverage.priorityCities.includes(city)));
  assert.match(coverage.pendingNote, /full 5-planet × 3-year source matrix remains incomplete/);
});


test("Mumbai 2027 Vivaha calendar keeps Asta and Shishutva as separate day-level downstream states", () => {
  const source = dataset.sources["drik-mumbai-vivaha-2027-asta-states"];
  const rows = dataset.downstreamCalendarCrossChecks["mumbai-vivaha-2027"];
  assert.ok(source);
  assert.equal(source.location, "Mumbai, Maharashtra, India");
  assert.equal(source.sourceType, "downstream-vivaha-calendar-state-cross-check");
  assert.match(source.eventDefinition, /not astronomical Asta\/Udaya event timestamps/);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map(row => [row.planet,row.state,row.startDate,row.endDate]), [
    ["Venus","tara-asta","2027-07-21","2027-09-05"],
    ["Venus","shishutva","2027-09-06","2027-09-08"],
    ["Jupiter","tara-asta","2027-09-09","2027-09-12"],
    ["Jupiter","shishutva","2027-09-13","2027-09-15"]
  ]);
  assert.ok(rows.every(row => row.precision === "day-level" && row.timestampAvailable === false && row.acceptanceEligible === false));
  assert.ok(!dataset.eventWindows["mumbai-vivaha-2027"]);
  assert.ok(!dataset.cases.some(row => row.sourceId === "drik-mumbai-vivaha-2027-asta-states"));
});


test("Pithoragarh third-party place coordinates are not promoted to Drik observer or acceptance data", () => {
  const source = dataset.sources["pithoragarh-geonames-place-reference"];
  const check = dataset.locationReferenceChecks.pithoragarh;
  assert.ok(source);
  assert.equal(source.geonamesId, "1259503");
  assert.equal(source.latitude, 29.5835);
  assert.equal(source.longitude, 80.2095);
  assert.equal(source.elevationMeters, null);
  assert.equal(check.projectObserver.latitude, 29.5828);
  assert.equal(check.projectObserver.longitude, 80.2182);
  assert.equal(check.referenceSourceId, "pithoragarh-geonames-place-reference");
  assert.equal(check.acceptanceEligible, false);
  assert.ok(check.approximateHorizontalSeparationMeters > 700 && check.approximateHorizontalSeparationMeters < 1000);
});

test("Pithoragarh 2025 Drik indexed event references retain direct-URL reproducibility caveat", () => {
  const source = dataset.sources["drik-pithoragarh-2025-venus"];
  assert.ok(source);
  assert.equal(source.reproducibilityStatus, "search-index-city-label-only-direct-url-resolves-new-delhi");
  assert.equal(source.directReopenObservation.sameUrlRenderedCity, "New Delhi, NCT, India");
  assert.equal(source.directReopenObservation.requestedSearchResultCity, "Pithoragarh, Uttarakhand, India");
  assert.equal(source.directReopenObservation.geonameIdInEventUrl, false);
  assert.match(source.notes, /indexed city-label references only/);
  for (const row of dataset.cases.filter(row => row.sourceId === "drik-pithoragarh-2025-venus")) {
    assert.equal(row.comparisonLevel, "city-label-only");
    assert.equal(row.sourceObserver.coordinates, null);
  }
});

test("Pithoragarh Drik city identity is recorded without treating it as an Asta event reference", () => {
  const source = dataset.sources["drik-pithoragarh-location-identity"];
  assert.ok(source);
  assert.equal(source.geonameId, "1259503");
  assert.equal(source.location, "Pithoragarh, Uttarakhand, India");
  assert.equal(source.sourceType, "provider-city-selector-identity-not-asta-event");
  assert.match(source.notes, /does not reveal.*Asta event timestamp/);
  const pending = dataset.cityCoverage.notCapturedPages.filter(row =>
    row.city === "Pithoragarh, Uttarakhand, India");
  assert.equal(pending.length, 3);
  assert.ok(pending.every(row => row.status === "inaccessible"));
  assert.ok(pending.every(row => /1259503/.test(row.reason)));
});


test("Pithoragarh user-supplied Drik 2024-2027 ledger preserves all supplied intervals, exact elapsed durations, and provenance", () => {
  const sourceId = "drik-pithoragarh-user-transcribed-asta-2024-2027";
  const source = dataset.sources[sourceId];
  assert.ok(source);
  assert.equal(source.location, "Pithoragarh, Uttarakhand, India");
  assert.equal(source.geonameId, "1259503");
  assert.equal(source.sourceObserver.coordinates, null);
  assert.equal(source.provenance.suppliedBy, "user");
  assert.equal(source.provenance.independentlyCrossChecked[0].planet, "Venus");
  assert.equal(source.provenance.independentlyCrossChecked[0].pageYear, 2025);
  const expectedCounts = {
    "venus-2024":1,"venus-2025":2,"venus-2026":2,"venus-2027":1,
    "mars-2024":1,"mars-2025":1,"mars-2026":1,
    "mercury-2024":6,"mercury-2026":7,"mercury-2027":7,
    "jupiter-2024":1,"jupiter-2025":1,"jupiter-2026":1,
    "saturn-2024":1,"saturn-2025":1,"saturn-2026":1
  };
  let total = 0;
  for (const [suffix, count] of Object.entries(expectedCounts)) {
    const key = "drik-pithoragarh-" + suffix;
    const rows = dataset.eventWindows[key];
    assert.ok(Array.isArray(rows), "missing supplied event stream " + key);
    assert.equal(rows.length, count);
    assert.equal(dataset.eventWindowsMetadata[key].status, "user-transcribed-not-independently-page-verified");
    for (const row of rows) {
      assert.equal(row.sourceId, sourceId);
      assert.equal(row.sourceLocation, "Pithoragarh, Uttarakhand, India");
      assert.equal(row.status, "user-provided-transcription; city-label-only; not-independently-page-verified");
      assert.equal(row.computedElapsedMinutes,
        (Date.parse(row.end.normalizedLocal) - Date.parse(row.start.normalizedLocal)) / 60000);
      assert.equal(row.reportedDurationDays, Math.ceil(row.computedElapsedMinutes / 1440));
      assert.ok(Date.parse(row.start.normalizedLocal) < Date.parse(row.end.normalizedLocal));
      assert.match(row.start.normalizedLocal, /\+05:30$/);
      assert.match(row.end.normalizedLocal, /\+05:30$/);
      total++;
    }
  }
  assert.equal(total, 35);
  const missing = [
    "drik-pithoragarh-mars-2027","drik-pithoragarh-mercury-2025",
    "drik-pithoragarh-jupiter-2027","drik-pithoragarh-saturn-2027"
  ];
  for (const key of missing) {
    assert.equal(dataset.eventWindowsMetadata[key].status, "not-provided-by-user; not-zero-event");
    assert.equal(Object.hasOwn(dataset.eventWindows, key), false);
  }
  const venus2025 = dataset.eventWindows["drik-pithoragarh-venus-2025"];
  const venus2026 = dataset.eventWindows["drik-pithoragarh-venus-2026"];
  assert.equal(venus2025[1].start.normalizedLocal, "2025-12-11T06:25:00+05:30");
  assert.equal(venus2025[1].end.normalizedLocal, "2026-02-02T18:15:00+05:30");
  assert.equal(venus2026[0].start.normalizedLocal, venus2025[1].start.normalizedLocal);
  assert.equal(venus2026[0].end.normalizedLocal, venus2025[1].end.normalizedLocal);
  const mars2025 = dataset.eventWindows["drik-pithoragarh-mars-2025"][0];
  const mars2026 = dataset.eventWindows["drik-pithoragarh-mars-2026"][0];
  assert.equal(mars2026.start.normalizedLocal, mars2025.start.normalizedLocal);
  assert.equal(mars2026.end.normalizedLocal, mars2025.end.normalizedLocal);
  const mercury2026 = dataset.eventWindows["drik-pithoragarh-mercury-2026"][6];
  const mercury2027 = dataset.eventWindows["drik-pithoragarh-mercury-2027"][0];
  assert.equal(mercury2026.start.normalizedLocal, mercury2027.start.normalizedLocal);
  assert.equal(mercury2026.end.normalizedLocal, mercury2027.end.normalizedLocal);
  assert.equal(dataset.userSuppliedDataNotes.pithoragarhDrik2024to2027.acceptanceEligible, false);
  assert.equal(dataset.cases.filter(row => row.sourceId === sourceId).length, 35);
  assert.ok(dataset.cases.filter(row => row.sourceId === sourceId).every(row => row.acceptanceEligible === false));
});
