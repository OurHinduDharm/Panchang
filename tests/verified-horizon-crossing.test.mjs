import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Observer, SearchRiseSet } from "astronomy-engine";

const here = dirname(fileURLToPath(import.meta.url));
const dataset = JSON.parse(readFileSync(resolve(here, "../data/asta-udaya-benchmark.json"), "utf8"));
const SOURCE_ID = "drik-pithoragarh-2025-venus";
const MAX_DELTA_MINUTES = 1;

function nearestLocalHorizonCrossing(body, instant, observer) {
  const start = new Date(instant.getTime() - 12 * 60 * 60 * 1000);
  const candidates = [1, -1]
    .map(direction => SearchRiseSet(body, observer, direction, start, 1, 0))
    .filter(Boolean)
    .map(result => ({
      direction: result.date.getTime() < instant.getTime() ? "before-or-near" : "after",
      instant: result.date,
      deltaMinutes: (result.date.getTime() - instant.getTime()) / 60000
    }));
  candidates.sort((a, b) => Math.abs(a.deltaMinutes) - Math.abs(b.deltaMinutes));
  return candidates[0] ?? null;
}

test("independently indexed Pithoragarh Venus 2025 Drik boundaries coincide with a local planet horizon crossing", () => {
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

    const observer = new Observer(
      entry.testObserver.latitude,
      entry.testObserver.longitude,
      entry.testObserver.elevationMeters
    );

    for (const boundaryName of ["astaStart", "astaEnd"]) {
      const published = new Date(entry.boundaries[boundaryName]);
      const crossing = nearestLocalHorizonCrossing(entry.planet, published, observer);
      assert.ok(crossing, entry.id + " " + boundaryName + ": no local rise/set crossing found");
      assert.ok(
        Math.abs(crossing.deltaMinutes) <= MAX_DELTA_MINUTES,
        entry.id + " " + boundaryName + ": published boundary differs from nearest local horizon crossing by " +
          crossing.deltaMinutes.toFixed(3) + " minutes"
      );
      checked.push({
        entry: entry.id,
        boundary: boundaryName,
        published: entry.boundaries[boundaryName],
        localHorizonCrossing: crossing.instant.toISOString(),
        signedDifferenceMinutes: Number(crossing.deltaMinutes.toFixed(3))
      });
    }
  }

  assert.equal(checked.length, 4);
  console.log(JSON.stringify({
    title: "Indexed Pithoragarh Drik Venus 2025 horizon-crossing cross-check",
    sourceId: SOURCE_ID,
    checkedBoundaryCount: checked.length,
    toleranceMinutes: MAX_DELTA_MINUTES,
    interpretation: "A narrow same-city geometric cross-check only. Drik observer coordinates are undisclosed; this does not prove the full Asta/Udaya event-selection algorithm or coordinate-exact equivalence.",
    boundaries: checked
  }, null, 2));
});
