import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dataset = JSON.parse(readFileSync(
  new URL("../data/drik-pithoragarh-asta-udaya-2021-2027.json", import.meta.url),
  "utf8"
));

test("extended direct Pithoragarh capture keeps every attempted page and verifies its year", () => {
  assert.equal(dataset.attemptedPages, 55);
  assert.equal(dataset.sourcePages.length, 55);
  assert.equal(dataset.verifiedPages, 35);
  assert.equal(dataset.sourcePages.filter(x => x.status === "requested-year-mismatch-quarantined").length, 15);
  assert.equal(dataset.sourcePages.filter(x => x.status === "page-not-verified").length, 5);
  for (const page of dataset.sourcePages.filter(x => x.requestedYearConfirmed)) {
    assert.equal(page.httpStatus, 200);
    assert.equal(page.cityConfirmed, true);
    assert.equal(page.planetConfirmed, true);
    assert.equal(page.renderedYear, page.year);
    assert.match(page.title, /Pithoragarh, Uttarakhand, India/);
    assert.match(page.url, /geoname-id=1259503/);
  }
});

test("only seven exact requested years enter the accepted event ledger", () => {
  assert.deepEqual([...new Set(dataset.windows.map(x => x.sourcePageYear))], [2021, 2022, 2023, 2024, 2025, 2026, 2027]);
  assert.equal(dataset.extractedBoundaryRows, 150);
  assert.equal(dataset.quarantinedBoundaryRows, 60);
  assert.equal(dataset.windowsCount, 75);
  assert.equal(dataset.windows.length, 75);
  assert.equal(dataset.uniqueEventsCount, 71);
  assert.equal(dataset.duplicateAnnualPageReferences, 4);
  assert.ok(dataset.windows.every(window =>
    dataset.sourcePages.some(page =>
      page.planet === window.planet &&
      page.year === window.sourcePageYear &&
      page.requestedYearConfirmed === true &&
      page.url === window.sourcePageUrl
    )
  ));
  assert.ok(!dataset.windows.some(window => window.sourcePageYear < 2021 || window.sourcePageYear > 2027));
});

test("planet/year window counts preserve missing rows without inventing zero-event claims", () => {
  const expected = {
    Mercury: [7, 6, 7, 6, 6, 7, 7],
    Venus: [1, 2, 1, 1, 2, 2, 1],
    Mars: [1, 0, 1, 1, 1, 1, 0],
    Jupiter: [1, 1, 1, 1, 1, 1, 1],
    Saturn: [1, 1, 1, 1, 1, 1, 1]
  };
  for (const [planet, counts] of Object.entries(expected)) {
    for (let index = 0; index < 7; index++) {
      const year = 2021 + index;
      const actual = dataset.windows.filter(window =>
        window.planet === planet && window.sourcePageYear === year
      ).length;
      assert.equal(actual, counts[index], `${planet} ${year}`);
    }
  }
  for (const [planet, year] of [["Mars", 2022], ["Mars", 2027]]) {
    const page = dataset.sourcePages.find(x => x.planet === planet && x.year === year);
    assert.equal(page.status, "no-asta-event-rows-extracted");
    assert.equal(page.extractedBoundaryRows, 0);
    assert.ok(!("noEventsConfirmed" in page));
  }
});

test("future pages that silently render 2027 are quarantined, never reused as 2028–2030 data", () => {
  for (const year of [2028, 2029, 2030]) {
    const pages = dataset.sourcePages.filter(x => x.year === year);
    assert.equal(pages.length, 5);
    for (const page of pages) {
      assert.equal(page.renderedYear, 2027);
      assert.equal(page.requestedYearConfirmed, false);
      assert.equal(page.status, "requested-year-mismatch-quarantined");
      assert.equal(page.extractedBoundaryRows, 0);
      assert.ok(page.quarantinedBoundaryRows >= 0);
    }
  }
});

test("all 75 accepted boundaries preserve 24+ clocks and normalize IST to UTC correctly", () => {
  const boundaries = dataset.windows.flatMap(window => [
    window.boundaries.astaStart,
    window.boundaries.astaEnd
  ]);
  assert.equal(boundaries.length, 150);
  assert.equal(boundaries.filter(x => x.dayRollover > 0).length, 75);
  for (const boundary of boundaries) {
    assert.match(boundary.sourcePrintedClock, /^\d{1,2}:\d{2}\+?$/);
    assert.match(boundary.normalizedLocalDateTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:30$/);
    assert.ok(Number.isFinite(Date.parse(boundary.normalizedUtcInstant)));
    assert.equal(
      Date.parse(boundary.normalizedLocalDateTime),
      Date.parse(boundary.normalizedUtcInstant)
    );
  }
});

test("all accepted windows are chronological, source-linked and city-label-only", () => {
  for (const window of dataset.windows) {
    const start = Date.parse(window.boundaries.astaStart.normalizedUtcInstant);
    const end = Date.parse(window.boundaries.astaEnd.normalizedUtcInstant);
    assert.ok(start < end, window.id);
    assert.ok(Number.isInteger(window.sourceDurationDays) && window.sourceDurationDays > 0);
    assert.equal(window.sourceStatus, "direct-page-captured-browser-verified");
    assert.equal(window.acceptanceEligible, true);
    assert.equal(window.strictCoordinateAcceptanceEligible, false);
    assert.equal(window.comparisonLevel, "city-label-only");
    assert.equal(window.sourceLocation, "Pithoragarh, Uttarakhand, India");
    assert.equal(window.sourceCityId, "1259503");
    assert.equal(window.sourceObserver.coordinates, null);
    assert.equal(window.testObserver.latitude, 29.5828);
    assert.equal(window.testObserver.longitude, 80.2182);
    assert.equal(window.testObserver.elevationMeters, 1650);
  }
});
