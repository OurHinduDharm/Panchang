import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dataset = JSON.parse(readFileSync(
  new URL("../data/drik-pithoragarh-asta-udaya-2024-2027.json", import.meta.url),
  "utf8"
));

test("direct Drik Pithoragarh capture contains all 20 verified named-city pages", () => {
  assert.equal(dataset.attemptedPages, 20);
  assert.equal(dataset.verifiedPages, 20);
  assert.equal(dataset.sourcePages.length, 20);
  for (const page of dataset.sourcePages) {
    assert.equal(page.httpStatus, 200);
    assert.equal(page.cityConfirmed, true);
    assert.equal(page.planetConfirmed, true);
    assert.match(page.title, /Pithoragarh, Uttarakhand, India/);
    assert.match(page.url, /geoname-id=1259503/);
    assert.match(page.url, /time-format=24plushour/);
  }
});

test("direct Pithoragarh data has the expected 43 Asta windows and 86 minute boundaries", () => {
  assert.equal(dataset.windowsCount, 43);
  assert.equal(dataset.windows.length, 43);
  assert.equal(dataset.extractedBoundaryRows, 86);
  const counts = Object.fromEntries(["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]
    .map(planet => [planet, dataset.windows.filter(window => window.planet === planet).length]));
  assert.deepEqual(counts, {
    Mercury: 26,
    Venus: 6,
    Mars: 3,
    Jupiter: 4,
    Saturn: 4
  });
});

test("source annual-page coverage preserves multiple Mercury windows and all planet years", () => {
  const expected = {
    Mercury: [6, 6, 7, 7],
    Venus: [1, 2, 2, 1],
    Mars: [1, 1, 1, 0],
    Jupiter: [1, 1, 1, 1],
    Saturn: [1, 1, 1, 1]
  };
  for (const [planet, counts] of Object.entries(expected)) {
    for (let index = 0; index < 4; index++) {
      const year = 2024 + index;
      const actual = dataset.windows.filter(window =>
        window.planet === planet && window.sourcePageYear === year
      ).length;
      assert.equal(actual, counts[index], `${planet} ${year} page window count`);
    }
  }
});

test("all source rows remain city-label-only and never claim coordinate-exact equivalence", () => {
  for (const window of dataset.windows) {
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

test("24+ clock rollover preserves raw source and normalized next-day local instant", () => {
  const firstMercury = dataset.windows.find(window =>
    window.id === "drik-pithoragarh-mercury-2024-window-1"
  );
  assert.equal(firstMercury.boundaries.astaStart.sourcePrintedDate, "February 6, 2024");
  assert.equal(firstMercury.boundaries.astaStart.sourcePrintedClock, "30:12+");
  assert.equal(firstMercury.boundaries.astaStart.normalizedLocalDateTime, "2024-02-07T06:12:00+05:30");
  assert.equal(firstMercury.boundaries.astaStart.dayRollover, 1);

  const endRollover = dataset.windows.find(window =>
    window.id === "drik-pithoragarh-mercury-2024-window-2"
  ).boundaries.astaEnd;
  assert.equal(endRollover.sourcePrintedClock, "28:23+");
  assert.equal(endRollover.normalizedLocalDateTime, "2024-05-02T04:23:00+05:30");
  assert.equal(endRollover.dayRollover, 1);

  const rollovers = dataset.windows.flatMap(window =>
    [window.boundaries.astaStart, window.boundaries.astaEnd]
  ).filter(boundary => boundary.dayRollover > 0);
  assert.equal(rollovers.length, 43);
});

test("all paired Asta windows are chronologically ordered and source duration is retained", () => {
  for (const window of dataset.windows) {
    const start = Date.parse(window.boundaries.astaStart.normalizedUtcInstant);
    const end = Date.parse(window.boundaries.astaEnd.normalizedUtcInstant);
    assert.ok(start < end, window.id + " start must precede end");
    assert.ok(Number.isInteger(window.sourceDurationDays) && window.sourceDurationDays > 0);
    for (const boundary of [window.boundaries.astaStart, window.boundaries.astaEnd]) {
      assert.match(boundary.sourcePrintedClock, /^\d{1,2}:\d{2}\+?$/);
      assert.match(boundary.normalizedLocalDateTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:30$/);
      assert.ok(Number.isFinite(Date.parse(boundary.normalizedUtcInstant)));
    }
  }
});

test("Mars 2027 page is recorded as no extracted rows, not as a fabricated zero-event claim", () => {
  const page = dataset.sourcePages.find(item => item.planet === "Mars" && item.year === 2027);
  assert.ok(page);
  assert.equal(page.status, "no-asta-event-rows-extracted");
  assert.equal(page.extractedBoundaryRows, 0);
  assert.ok(!("noEventsConfirmed" in page));
});
