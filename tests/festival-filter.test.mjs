import test from "node:test";
import assert from "node:assert/strict";
import { isHinduFestival } from "../festival-filter.js";

test("allows common Hindu vrata and parva names", () => {
  assert.equal(isHinduFestival({ name: "Diwali" }), true);
  assert.equal(isHinduFestival({ name: "Chaitra Navratri" }), true);
  assert.equal(isHinduFestival({ name: "Navaratri Chaturthi" }), true);
  assert.equal(isHinduFestival({ name: "Vinayaka Chaturthi" }), true);
  assert.equal(isHinduFestival({ name: "Nirjala Ekadashi" }), true);
  assert.equal(isHinduFestival({ name: "Makar Sankranti" }), true);
});

test("rejects non-Hindu and civic events", () => {
  assert.equal(isHinduFestival({ name: "Eid al-Fitr" }), false);
  assert.equal(isHinduFestival({ name: "Christmas" }), false);
  assert.equal(isHinduFestival({ name: "Gandhi Jayanti" }), false);
  assert.equal(isHinduFestival({ name: "Independence Day" }), false);
  assert.equal(isHinduFestival({ name: "Unknown Community Day" }), false);
});

test("rejects non-Hindu categories even when name resembles an allowed term", () => {
  assert.equal(isHinduFestival({ name: "Diwali", category: "national holiday" }), false);
  assert.equal(isHinduFestival({ name: "Purnima", category: "Buddhist" }), false);
});
