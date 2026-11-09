import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as astronomyEngine from "astronomy-engine";
const { Observer, SearchRiseSet } = astronomyEngine;

const here = dirname(fileURLToPath(import.meta.url));
const dataset = JSON.parse(readFileSync(resolve(here, "../data/asta-udaya-benchmark.json"), "utf8"));
const SOURCE_ID = "drik-pithoragarh-2025-venus";
const MAX_DELTA_MINUTES = 1;

// The expected direction is transcribed from the independently published
// event labels ("at setting" / "at rising") for these four boundary types.
// +1 = rise, -1 = set in Astronomy Engine SearchRiseSet.
const EXPECTED_DIRECTIONS = {
  "venus-pithoragarh-2025-march": { astaStart: -1, astaEnd: 1 },
  "venus-pithoragarh-2025-december-to-2026-february": { astaStart: 1, astaEnd: -1 }
};

function findDirectedHorizonCrossing(body, instant, observer, direction) {
  const start = new Date(instant.getTime() - 12 * 60 * 60 * 1000);
  const result = SearchRiseSet(body, observer, direction, start, 1, 0);
  if (!result) return null;
  return {
    direction: direction === 1 ? "rise" : "set",
    instant: result.date,
    deltaMinutes: (result.date.getTime() - instant.getTime()) / 60000
  };
}

test("indexed Pithoragarh Venus 2025 Drik boundaries match the correctly directed local planet horizon crossings", () => {
  const entries = dataset.cases.filter(entry =>
    entry.sourceId === SOURCE_ID &&
    entry.status === "published-reference" &&
    entry.precision === "minute"
  );

  assert.equal(entries.length, 2, "the independently indexed source contains two Venus apparitions");
  const checked = [];

  for (const entry of entries) {
    assert.equal(entry.comparisonLevel, "city-label-only");
    assert.equal(entry.sourceObserver.coordinates, null);
    assert.equal(entry.testObserver.latitude, 29.5828);
    assert.equal(entry.testObserver.longitude, 80.2182);
    assert.equal(entry.testObserver.elevationMeters, 1650);

    const expected = EXPECTED_DIRECTIONS[entry.id];
    assert.ok(expected, "explicit rise/set direction is required for " + entry.id);
    const observer = new Observer(
      entry.testObserver.latitude,
      entry.testObserver.longitude,
      entry.testObserver.elevationMeters
    );

    for (const boundaryName of ["astaStart", "astaEnd"]) {
      const direction = expected[boundaryName];
      assert.ok(direction === 1 || direction === -1, entry.id + " " + boundaryName + ": missing expected direction");
      const published = new Date(entry.boundaries[boundaryName]);
      const crossing = findDirectedHorizonCrossing(entry.planet, published, observer, direction);
      assert.ok(crossing, entry.id + " " + boundaryName + ": no directed local rise/set crossing found");
      assert.ok(
        Math.abs(crossing.deltaMinutes) <= MAX_DELTA_MINUTES,
        entry.id + " " + boundaryName + ": expected " + crossing.direction +
          " differs from published boundary by " + crossing.deltaMinutes.toFixed(3) + " minutes"
      );
      checked.push({
        entry: entry.id,
        boundary: boundaryName,
        expectedEvent: crossing.direction,
        published: entry.boundaries[boundaryName],
        localHorizonCrossing: crossing.instant.toISOString(),
        signedDifferenceMinutes: Number(crossing.deltaMinutes.toFixed(3))
      });
    }
  }

  assert.equal(checked.length, 4);
  console.log(JSON.stringify({
    title: "Indexed Pithoragarh Drik Venus 2025 directed horizon-crossing cross-check",
    sourceId: SOURCE_ID,
    checkedBoundaryCount: checked.length,
    toleranceMinutes: MAX_DELTA_MINUTES,
    interpretation: "A narrow same-city geometric cross-check only. Drik observer coordinates are undisclosed; this does not prove the full Asta/Udaya event-selection algorithm or coordinate-exact equivalence.",
    boundaries: checked
  }, null, 2));
});
