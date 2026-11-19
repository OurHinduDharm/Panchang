import test from "node:test";
import assert from "node:assert/strict";
import { buildMahodayaCandidates, SPECIAL_PUNYA_KAAL_POLICY } from "../special-punya-kaal.mjs";

const day = (overrides = {}) => ({
  date: "2028-01-03",
  masa: "Pausha",
  sunrise: "2028-01-03T00:30:00.000Z",
  sunset: "2028-01-03T12:30:00.000Z",
  tithis: [{ index: 29, name: "Amavasya", startTime: "2028-01-03T02:00:00Z", endTime: "2028-01-03T10:00:00Z" }],
  nakshatras: [{ index: 21, name: "Shravana", startTime: "2028-01-03T04:00:00Z", endTime: "2028-01-03T11:00:00Z" }],
  yogas: [{ index: 16, name: "Vyatipata", startTime: "2028-01-03T05:00:00Z", endTime: "2028-01-03T08:00:00Z" }],
  ...overrides
});

test("Somavati Amavasya + Shravana + Vyatipata overlapping in daylight creates a Mahodaya candidate", () => {
  const [result] = buildMahodayaCandidates([day()]);
  assert.equal(result.date, "2028-01-03");
  assert.deepEqual(result.labels, ["महोदय योग"]);
  assert.equal(result.startTime, "2028-01-03T05:00:00.000Z");
  assert.equal(result.endTime, "2028-01-03T08:00:00.000Z");
  assert.equal(result.status, "research-candidate");
});

test("Sunday does not become Mahodaya under the Somavati profile", () => {
  assert.deepEqual(buildMahodayaCandidates([day({ date: "2028-01-02" })]), []);
});

test("only Pausha or Magha Purnimanta month names are accepted", () => {
  assert.deepEqual(buildMahodayaCandidates([day({ masa: "Chaitra" })]), []);
});

test("the conjunction must overlap the local daytime interval", () => {
  const nightOnly = day({
    yogas: [{ index: 16, name: "Vyatipata", startTime: "2028-01-03T13:00:00Z", endTime: "2028-01-03T15:00:00Z" }]
  });
  assert.deepEqual(buildMahodayaCandidates([nightOnly]), []);
});

test("wrong tithi, nakshatra or nitya-yoga index is excluded", () => {
  assert.deepEqual(buildMahodayaCandidates([day({ tithis: [{ index: 28, startTime: "2028-01-03T02:00:00Z", endTime: "2028-01-03T10:00:00Z" }] })]), []);
  assert.deepEqual(buildMahodayaCandidates([day({ nakshatras: [{ index: 22, startTime: "2028-01-03T04:00:00Z", endTime: "2028-01-03T11:00:00Z" }] })]), []);
  assert.deepEqual(buildMahodayaCandidates([day({ yogas: [{ index: 15, startTime: "2028-01-03T05:00:00Z", endTime: "2028-01-03T08:00:00Z" }] })]), []);
});

test("missing sunrise or sunset never creates a daytime candidate", () => {
  assert.deepEqual(buildMahodayaCandidates([day({ sunrise: null })]), []);
  assert.deepEqual(buildMahodayaCandidates([day({ sunset: null })]), []);
  assert.match(SPECIAL_PUNYA_KAAL_POLICY.mahodaya, /research-only/);
});
