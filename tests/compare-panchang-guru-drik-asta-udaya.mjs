import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../data/", import.meta.url);
const pg = JSON.parse(await readFile(new URL("asta-udaya-panchang-guru-crosscheck.json", root), "utf8"));
const drik = JSON.parse(await readFile(new URL("asta-udaya-benchmark.json", root), "utf8"));
const drikById = new Map(drik.cases.map(item => [item.id, item]));

function minutesBetween(a, b) {
  return Math.round((Date.parse(a) - Date.parse(b)) / 60000);
}

const comparisons = pg.windows.map(window => {
  const reference = drikById.get(window.benchmarkCaseId);
  assert.ok(reference, "Missing Drik benchmark case: " + window.benchmarkCaseId);
  assert.equal(reference.planet, window.planet);
  return {
    id: window.id,
    planet: window.planet,
    astaStartDifferenceMinutes: minutesBetween(window.astaStart, reference.boundaries.astaStart),
    astaEndDifferenceMinutes: minutesBetween(window.astaEnd, reference.boundaries.astaEnd)
  };
});

test("Panchang Guru cross-provider snapshot has unique, parseable event windows", () => {
  assert.equal(new Set(pg.windows.map(x => x.id)).size, pg.windows.length);
  for (const item of pg.windows) {
    assert.ok(Date.parse(item.astaStart) < Date.parse(item.astaEnd), item.id);
    assert.ok(item.benchmarkCaseId);
  }
});

test("cross-provider report preserves all signed timestamp differences", () => {
  assert.equal(comparisons.length, 10);
  const totals = {};
  for (const planet of ["Venus", "Jupiter", "Saturn"]) {
    const rows = comparisons.filter(x => x.planet === planet);
    const values = rows.flatMap(x => [x.astaStartDifferenceMinutes, x.astaEndDifferenceMinutes]);
    totals[planet] = {
      boundaries: values.length,
      exact: values.filter(x => x === 0).length,
      withinOneHour: values.filter(x => Math.abs(x) <= 60).length,
      withinOneDay: values.filter(x => Math.abs(x) <= 1440).length,
      meanAbsoluteDifferenceMinutes: Number((values.reduce((s, x) => s + Math.abs(x), 0) / values.length).toFixed(2)),
      maxAbsoluteDifferenceMinutes: Math.max(...values.map(Math.abs))
    };
  }
  console.log(JSON.stringify({
    title: "Panchang Guru vs Drik New Delhi published-boundary comparison",
    warning: pg.provider.comparisonPolicy,
    totals,
    comparisons
  }, null, 2));
});
