import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const multi = JSON.parse(await readFile(
  new URL("../data/drik-multicity-asta-udaya-2021-2027.json", import.meta.url), "utf8"
));
const pithoragarh = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2021-2027.json", import.meta.url), "utf8"
));

function uniqueKey(window) {
  return [
    window.sourceCityId, window.planet,
    window.boundaries.astaStart.normalizedUtcInstant,
    window.boundaries.astaEnd.normalizedUtcInstant
  ].join("|");
}

test("all five cities, five planets and seven requested years have direct verified pages", () => {
  assert.equal(multi.attemptedPages, 175);
  assert.equal(multi.cityPlanetVerifiedPages, 175);
  assert.equal(multi.verifiedPages, 175);
  assert.equal(multi.yearMismatchPages, 0);
  assert.equal(multi.sourcePages.length, 175);
  assert.deepEqual(multi.years, [2021, 2022, 2023, 2024, 2025, 2026, 2027]);
  assert.equal(multi.cities.length, 5);
  assert.equal(multi.planets.length, 5);
  for (const page of multi.sourcePages) {
    assert.equal(page.httpStatus, 200, page.url);
    assert.equal(page.cityConfirmed, true, page.url);
    assert.equal(page.planetConfirmed, true, page.url);
    assert.equal(page.requestedYearConfirmed, true, page.url);
    assert.equal(page.renderedYear, page.year, page.url);
    assert.equal(page.status, "page-loaded-city-planet-and-year-confirmed", page.url);
  }
});

test("the seven-year source ledger contains 375 windows and 750 exact minute boundaries", () => {
  assert.equal(multi.rawEventRows, 750);
  assert.equal(multi.verifiedEventRows, 750);
  assert.equal(multi.extractedBoundaryRows, 750);
  assert.equal(multi.acceptanceEligibleBoundaryRows, 750);
  assert.equal(multi.provisionalBoundaryRows, 0);
  assert.equal(multi.provisionalWindowsCount, 0);
  assert.deepEqual(multi.provisionalWindows, []);
  assert.equal(multi.windowsCount, 375);
  assert.equal(multi.windows.length, 375);
  assert.equal(multi.uniqueEventsCount, 355);
  assert.equal(multi.duplicateAnnualPageReferences, 20);
  assert.equal(new Set(multi.windows.map(uniqueKey)).size, 355);
});

test("every city contributes 75 annual-page windows and 71 unique windows", () => {
  for (const city of multi.cities) {
    const pages = multi.sourcePages.filter(page => page.sourceCityId === city.geonameId);
    const rows = multi.windows.filter(window => window.sourceCityId === city.geonameId);
    assert.equal(pages.length, 35, city.name);
    assert.equal(rows.length, 75, city.name);
    assert.equal(new Set(rows.map(uniqueKey)).size, 71, city.name);
    assert.equal(multi.coverageByCity.find(x => x.city === city.name).acceptedWindows, 75);
  }
});

test("planet coverage includes Mercury, Venus, Mars, Jupiter and Saturn without inventing missing Mars events", () => {
  const expected = { Mercury: 230, Venus: 50, Mars: 25, Jupiter: 35, Saturn: 35 };
  for (const [planet, windows] of Object.entries(expected)) {
    const rows = multi.windows.filter(x => x.planet === planet);
    const pages = multi.sourcePages.filter(x => x.planet === planet);
    assert.equal(pages.length, 35, planet);
    assert.equal(rows.length, windows, planet);
    assert.equal(multi.coverageByPlanet.find(x => x.planet === planet).acceptedWindows, windows);
  }
  const noRows = multi.sourcePages.filter(x => x.extractedWindows === 0);
  assert.equal(noRows.length, 10);
  for (const page of noRows) {
    assert.equal(page.planet, "Mars");
    assert.ok([2022, 2027].includes(page.year));
    assert.deepEqual(page.explicitZeroEventText, []);
    assert.equal(page.eventResultStatus, "no-window-listed-not-zero-proof");
  }
});

test("every accepted window links to a year-confirmed page and preserves city-label-only provenance", () => {
  const pages = new Map(multi.sourcePages.map(page =>
    [`${page.sourceCityId}|${page.planet}|${page.year}`, page]
  ));
  for (const window of multi.windows) {
    const page = pages.get(`${window.sourceCityId}|${window.planet}|${window.sourcePageYear}`);
    assert.ok(page, window.id);
    assert.equal(page.requestedYearConfirmed, true, window.id);
    assert.equal(window.sourceStatus, "direct-page-captured-browser-verified");
    assert.equal(window.acceptanceEligible, true);
    assert.equal(window.strictCoordinateAcceptanceEligible, false);
    assert.equal(window.comparisonLevel, "city-label-only");
    assert.equal(window.sourcePageUrl, page.url);
    assert.equal(window.sourceLocation, page.sourceLocation);
    assert.equal(window.sourceObserver.coordinates, null);
  }
});

test("24+ clock rollover is preserved and local IST/UTC instants are equivalent", () => {
  const boundaries = multi.windows.flatMap(window => Object.values(window.boundaries));
  assert.equal(boundaries.length, 750);
  assert.equal(boundaries.filter(x => x.dayRollover > 0).length, 375);
  for (const boundary of boundaries) {
    const hour = Number(boundary.sourcePrintedClock.split(":")[0]);
    assert.equal(boundary.dayRollover, Math.floor(hour / 24));
    assert.match(boundary.normalizedLocalDateTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:30$/);
    assert.equal(Date.parse(boundary.normalizedLocalDateTime), Date.parse(boundary.normalizedUtcInstant));
  }
});

test("Pithoragarh multi-city windows reconcile exactly with the dedicated seven-year direct capture", () => {
  const multiKeys = new Set(multi.windows
    .filter(x => x.sourceCityId === "1259503")
    .map(uniqueKey));
  const directKeys = new Set(pithoragarh.windows.map(window => [
    "1259503", window.planet,
    window.boundaries.astaStart.normalizedUtcInstant,
    window.boundaries.astaEnd.normalizedUtcInstant
  ].join("|")));
  assert.equal(multiKeys.size, 71);
  assert.equal(directKeys.size, 71);
  assert.deepEqual([...multiKeys].sort(), [...directKeys].sort());
});

test("supplemental Google AI text is never accepted as a Drik event row", () => {
  const pages = multi.sourcePages.filter(page =>
    page.relevantLines.some(line => /Google AI/i.test(line))
  );
  assert.ok(pages.length > 0);
  assert.ok(pages.every(page => page.requestedYearConfirmed));
  assert.ok(!multi.windows.some(window =>
    window.boundaries.astaStart.normalizedLocalDateTime === "2028-04-05T17:30:00+05:30" ||
    window.boundaries.astaEnd.normalizedLocalDateTime === "2028-05-05T12:45:00+05:30"
  ));
  assert.ok(!multi.windows.some(window => window.sourcePageYear > 2027));
});
