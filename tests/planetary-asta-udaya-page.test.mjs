import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PLANET_ORDER,
  getPithoragarhAnnualWindows,
  formatPithoragarhBoundary
} from "../planetary-asta-udaya-page.mjs";

const dataset = JSON.parse(readFileSync(
  new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url),
  "utf8"
));

test("annual page selector includes only verified Pithoragarh city-reference windows", () => {
  const all = [2021, 2022, 2023, 2024, 2025, 2026, 2027]
    .flatMap(year => getPithoragarhAnnualWindows(dataset, year));
  assert.equal(all.length, 71);
  assert.ok(all.every(item => item.id && item.astaStart && item.udaya));
  assert.ok(all.every(item => Date.parse(item.astaStart) < Date.parse(item.udaya)));
});

test("all seven captured years are selectable and preserve chronological order", () => {
  for (const year of [2021, 2022, 2023, 2024, 2025, 2026, 2027]) {
    const windows = getPithoragarhAnnualWindows(dataset, year);
    assert.ok(windows.length > 0, String(year));
    for (const item of windows) {
      assert.equal(item.sourceYear, year);
      assert.ok(PLANET_ORDER.some(planet => planet.key === item.planet));
    }
    for (let index = 1; index < windows.length; index++) {
      assert.ok(Date.parse(windows[index - 1].astaStart) <= Date.parse(windows[index].astaStart));
    }
  }
});

test("missing Mars 2027 rows remain unavailable rather than being inferred as zero events", () => {
  const mars = getPithoragarhAnnualWindows(dataset, 2027)
    .filter(item => item.planet === "Mars");
  assert.deepEqual(mars, []);
});

test("does not include other cities or records that claim coordinate-exact acceptance", () => {
  const polluted = {
    windows: [
      ...dataset.windows,
      {
        ...dataset.windows[0],
        id: "other-city",
        sourceLocation: "New Delhi, NCT, India"
      },
      {
        ...dataset.windows[0],
        id: "coordinate-exact",
        strictCoordinateAcceptanceEligible: true
      }
    ]
  };
  const ids = getPithoragarhAnnualWindows(polluted, 2024).map(item => item.id);
  assert.ok(!ids.includes("other-city"));
  assert.ok(!ids.includes("coordinate-exact"));
});

test("formats boundaries in India Standard Time with Hindi date and clock", () => {
  const formatted = formatPithoragarhBoundary("2024-02-07T06:12:00+05:30");
  assert.match(formatted, /2024|२०२४/);
  assert.match(formatted, /06:12|०६:१२/);
  assert.equal(formatPithoragarhBoundary("not-a-date"), "—");
});

test("main Panchang planetary card links to the annual reference page", () => {
  const source = readFileSync(
    new URL("../extra-panchang.js", import.meta.url),
    "utf8"
  );
  assert.match(source, /https:\/\/ourhindudharm\.github\.io\/Panchang\/planetary-asta-udaya\.html/);
  assert.match(source, /वर्षवार ग्रह तारा-अस्त एवं पुनः उदय सूची/);
});
