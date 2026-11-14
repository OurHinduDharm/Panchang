import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const reference = JSON.parse(fs.readFileSync(
  new URL("../data/pac-heliacal-reference-central-station-2026-2027.json", import.meta.url),
  "utf8"
));

test("PAC benchmark retains central-station scope and source provenance", () => {
  assert.equal(reference.publisher, "Positional Astronomy Centre, India Meteorological Department, Ministry of Earth Sciences, Government of India");
  assert.equal(reference.observer.label, "Central Station of India");
  assert.equal(reference.observer.latitudeDeg, 23.1833333333);
  assert.equal(reference.observer.longitudeDeg, 82.5);
  assert.equal(reference.observer.elevationMeters, null);
  assert.equal(reference.comparisonPolicy.canValidateExactCitySpecificClockTime, false);
  assert.equal(reference.publicationEligible, false);
});

test("PAC benchmark preserves all four official Guru/Shukra event rows verbatim", () => {
  const events = reference.heliacalEvents;
  assert.equal(events.length, 4);
  const find = (planet, event) => events.find(row => row.planet === planet && row.event === event);

  assert.deepEqual(
    [find("Jupiter", "heliacal-setting").sourcePrintedGregorianDate,
      find("Jupiter", "heliacal-setting").sourcePrintedClock],
    ["2026-07-15", "11:10"]
  );
  assert.deepEqual(
    [find("Jupiter", "heliacal-rising").sourcePrintedGregorianDate,
      find("Jupiter", "heliacal-rising").sourcePrintedClock],
    ["2026-08-10", "07:53"]
  );
  assert.deepEqual(
    [find("Venus", "heliacal-setting").sourcePrintedGregorianDate,
      find("Venus", "heliacal-setting").sourcePrintedClock],
    ["2026-10-13", "24:18"]
  );
  assert.equal(find("Venus", "heliacal-setting").extendedHourNotation, true);
  assert.deepEqual(
    [find("Venus", "heliacal-rising").sourcePrintedGregorianDate,
      find("Venus", "heliacal-rising").sourcePrintedClock],
    ["2026-10-28", "07:36"]
  );
  assert.ok(events.every(row => !("normalizedUtcInstant" in row)));
});

test("PAC visibility intervals remain distinct from exact event instants", () => {
  const jupiter = reference.publishedVisibilityIntervals.filter(row => row.planet === "Jupiter");
  const venus = reference.publishedVisibilityIntervals.filter(row => row.planet === "Venus");
  assert.deepEqual(jupiter.map(row => [row.from, row.to, row.sky]), [
    [null, "2026-07-15", "western-evening"],
    ["2026-07-16", "2026-08-09", "not-visible"],
    ["2026-08-10", "2026-11-12", "eastern-morning"]
  ]);
  assert.deepEqual(venus.map(row => [row.from, row.to, row.sky]), [
    [null, "2026-10-12", "western-evening"],
    ["2026-10-29", null, "eastern-morning"]
  ]);
});
