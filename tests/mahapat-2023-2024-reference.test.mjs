import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reference = JSON.parse(await readFile(
  new URL("../data/reviews/mahapat-2023-2024-reference.json", import.meta.url),
  "utf8"
));

test("Tara Prasad Divya Panchang 2023-24 reference is preserved as raw printed data", () => {
  assert.equal(reference.status, "reference-only-not-yet-normalized");
  assert.equal(reference.observer.latitude, 29.5);
  assert.equal(reference.observer.longitude, 79.1333333333);
  assert.equal(reference.timezoneOffsetMinutes, 330);
  assert.equal(reference.events.length, 31);
  assert.equal(reference.events[0].touchDate, null);
  assert.equal(reference.events[0].touchTimePrinted, null);
  assert.equal(reference.events[0].releaseDate, "2023-03-22");
  assert.equal(reference.events[0].releaseTimePrinted, "10:41");
  assert.equal(reference.events.at(-1).releaseTimePrinted, "24:01");
  assert.ok(reference.events.every(event =>
    ["vaidhrti", "vyatipata"].includes(event.type) &&
    typeof event.releaseTimePrinted === "string"
  ));
});

test("printed time strings above 24 hours remain unparsed pending notation confirmation", () => {
  const extended = reference.events.filter(event =>
    Number(event.touchTimePrinted?.slice(0, 2)) >= 24 ||
    Number(event.releaseTimePrinted?.slice(0, 2)) >= 24
  );
  assert.ok(extended.length > 0);
  assert.ok(extended.every(event =>
    event.touchTimePrinted === null || /^\d{2}:\d{2}$/.test(event.touchTimePrinted)
  ));
});
