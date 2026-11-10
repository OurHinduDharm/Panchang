import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const multi = JSON.parse(await readFile(
  new URL("../data/drik-multicity-asta-udaya-2024-2028.json", import.meta.url), "utf8"
));
const pithoragarh = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2024-2027.json", import.meta.url), "utf8"
));

function uniqueKey(window) {
  return [
    window.sourceCityId, window.planet,
    window.boundaries.astaStart.normalizedUtcInstant,
    window.boundaries.astaEnd.normalizedUtcInstant
  ].join("|");
}

test("five-city capture verifies rendered city, planet and requested year separately", () => {
  assert.equal(multi.attemptedPages, 125);
  assert.equal(multi.cityPlanetVerifiedPages, 125);
  assert.equal(multi.verifiedPages, 100);
  assert.equal(multi.yearMismatchPages, 25);
  assert.equal(multi.sourcePages.length, 125);
  assert.equal(multi.sourcePages.filter(x => x.requestedYearConfirmed).length, 100);
  assert.equal(multi.sourcePages.filter(x => !x.requestedYearConfirmed).length, 25);
  for (const page of multi.sourcePages) {
    assert.equal(page.cityConfirmed, true, page.url);
    assert.equal(page.planetConfirmed, true, page.url);
    assert.equal(page.renderedYear === page.year, page.requestedYearConfirmed, page.url);
  }
});

test("year-mismatched 2028 pages are retained but never acceptance-eligible", () => {
  assert.equal(multi.provisionalWindowsCount, 50);
  assert.equal(multi.provisionalWindows.length, 50);
  for (const window of multi.provisionalWindows) {
    assert.equal(window.requestedPageYear, 2028);
    assert.equal(window.sourcePageYear, 2027);
    assert.equal(window.acceptanceEligible, false);
    assert.match(window.provisionalReason, /rendered a 2027/);
  }
  assert.equal(multi.windows.every(x => x.sourcePageYear >= 2024 && x.sourcePageYear <= 2027), true);
});

test("all accepted pages have source provenance and ordered local/UTC boundaries", () => {
  assert.equal(multi.windowsCount, 215);
  assert.equal(multi.acceptanceEligibleBoundaryRows, 430);
  const pages = new Map(multi.sourcePages.map(page =>
    [`${page.sourceCityId}|${page.planet}|${page.year}`, page]
  ));
  for (const window of multi.windows) {
    const page = pages.get(`${window.sourceCityId}|${window.planet}|${window.sourcePageYear}`);
    assert.ok(page, window.id);
    assert.equal(page.requestedYearConfirmed, true, window.id);
    assert.equal(window.acceptanceEligible, true, window.id);
    const start = Date.parse(window.boundaries.astaStart.normalizedUtcInstant);
    const end = Date.parse(window.boundaries.astaEnd.normalizedUtcInstant);
    assert.ok(Number.isFinite(start) && Number.isFinite(end) && end > start, window.id);
    for (const boundary of Object.values(window.boundaries)) {
      assert.match(boundary.normalizedLocalDateTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:30$/);
      assert.equal(Date.parse(boundary.normalizedLocalDateTime), Date.parse(boundary.normalizedUtcInstant));
      const hour = Number(boundary.sourcePrintedClock.split(":")[0]);
      assert.equal(boundary.dayRollover, Math.floor(hour / 24));
    }
  }
});

test("overlapping annual pages deduplicate to 40 distinct windows per city", () => {
  const unique = new Map(multi.windows.map(window => [uniqueKey(window), window]));
  assert.equal(unique.size, 200);
  for (const city of multi.cities) {
    const cityRows = multi.windows.filter(x => x.sourceCityId === city.geonameId);
    assert.equal(cityRows.length, 43);
    assert.equal(new Set(cityRows.map(uniqueKey)).size, 40);
  }
});

test("multi-city Pithoragarh windows exactly reconcile with the dedicated direct capture", () => {
  const multiKeys = new Set(multi.windows
    .filter(x => x.sourceCityId === "1259503")
    .map(uniqueKey));
  const directKeys = new Set(pithoragarh.windows.map(window => [
    "1259503", window.planet,
    window.boundaries.astaStart.normalizedUtcInstant,
    window.boundaries.astaEnd.normalizedUtcInstant
  ].join("|")));
  assert.equal(multiKeys.size, 40);
  assert.equal(pithoragarh.uniqueEventsCount, 40);
  assert.deepEqual([...multiKeys].sort(), [...directKeys].sort());
});

test("a page with no listed windows is not silently treated as a zero-event year", () => {
  const noRows = multi.sourcePages.filter(x => x.requestedYearConfirmed && x.extractedWindows === 0);
  assert.ok(noRows.length > 0);
  for (const page of noRows) {
    if (page.explicitZeroEventText.length) {
      assert.equal(page.eventResultStatus, "explicit-zero-events");
    } else {
      assert.equal(page.eventResultStatus, "no-window-listed-not-zero-proof");
    }
  }
});
