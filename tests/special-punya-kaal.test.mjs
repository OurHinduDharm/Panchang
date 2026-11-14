import test from "node:test";
import assert from "node:assert/strict";
import { buildVaruniCandidates, SPECIAL_PUNYA_KAAL_POLICY } from "../special-punya-kaal.mjs";

const day = (overrides = {}) => ({
  date: "2028-03-17",
  masa: "Chaitra",
  paksha: "कृष्ण पक्ष",
  sunrise: "2028-03-17T00:30:00.000Z",
  nextSunrise: "2028-03-18T00:30:00.000Z",
  tithis: [{ index: 27, name: "Trayodashi", paksha: "Krishna", startTime: "2028-03-17T02:00:00.000Z", endTime: "2028-03-17T10:00:00.000Z" }],
  nakshatras: [{ index: 24, name: "Shatabhisha", startTime: "2028-03-17T04:00:00.000Z", endTime: "2028-03-17T12:00:00.000Z" }],
  yogas: [],
  ...overrides
});

test("Varuni candidate is the exact overlap of Trayodashi, Shatabhisha and the Hindu day", () => {
  const [result] = buildVaruniCandidates([day()]);
  assert.equal(result.date, "2028-03-17");
  assert.equal(result.startTime, "2028-03-17T04:00:00.000Z");
  assert.equal(result.endTime, "2028-03-17T10:00:00.000Z");
  assert.deepEqual(result.labels, ["वारुणी योग"]);
  assert.equal(result.status, "research-candidate");
});

test("Saturday adds Mahavaruni; Shubha yoga must overlap the exact conjunction for Mahamahavaruni", () => {
  const saturday = day({
    date: "2028-03-18",
    sunrise: "2028-03-18T00:30:00.000Z",
    nextSunrise: "2028-03-20T00:30:00.000Z",
    tithis: [{ index: 27, name: "Trayodashi", paksha: "Krishna", startTime: "2028-03-18T02:00:00.000Z", endTime: "2028-03-18T10:00:00.000Z" }],
    nakshatras: [{ index: 24, name: "Shatabhisha", startTime: "2028-03-18T04:00:00.000Z", endTime: "2028-03-18T12:00:00.000Z" }],
    yogas: [{ index: 23, name: "Shubha", startTime: "2028-03-18T05:00:00.000Z", endTime: "2028-03-18T06:00:00.000Z" }]
  });
  const [result] = buildVaruniCandidates([saturday]);
  assert.deepEqual(result.labels, ["वारुणी योग", "महावारुणी योग", "महामहावारुणी योग"]);
});

test("a Shubha yoga outside the conjunction does not create Mahamahavaruni", () => {
  const saturday = day({
    date: "2028-03-18",
    sunrise: "2028-03-18T00:30:00.000Z",
    nextSunrise: "2028-03-20T00:30:00.000Z",
    tithis: [{ index: 27, name: "Trayodashi", paksha: "Krishna", startTime: "2028-03-18T02:00:00.000Z", endTime: "2028-03-18T10:00:00.000Z" }],
    nakshatras: [{ index: 24, name: "Shatabhisha", startTime: "2028-03-18T04:00:00.000Z", endTime: "2028-03-18T12:00:00.000Z" }],
    yogas: [{ index: 23, name: "Shubha", startTime: "2028-03-18T11:00:00.000Z", endTime: "2028-03-18T12:00:00.000Z" }]
  });
  const [result] = buildVaruniCandidates([saturday]);
  assert.deepEqual(result.labels, ["वारुणी योग", "महावारुणी योग"]);
});

test("wrong paksha, month, tithi or nakshatra does not create a candidate", () => {
  assert.deepEqual(buildVaruniCandidates([day({ masa: "Vaishakha" })]), []);
  assert.deepEqual(buildVaruniCandidates([day({ paksha: "शुक्ल पक्ष" })]), []);
  assert.deepEqual(buildVaruniCandidates([day({ tithis: [{ index: 26, name: "Dwadashi", startTime: "2028-03-17T02:00:00Z", endTime: "2028-03-17T10:00:00Z" }] })]), []);
  assert.deepEqual(buildVaruniCandidates([day({ nakshatras: [{ index: 23, name: "Dhanishtha", startTime: "2028-03-17T04:00:00Z", endTime: "2028-03-17T12:00:00Z" }] })]), []);
});

test("invalid or absent intervals are safely omitted", () => {
  assert.deepEqual(buildVaruniCandidates([day({ sunrise: null })]), []);
  assert.equal(SPECIAL_PUNYA_KAAL_POLICY.sankranti, "reuse-existing-display-and-calculation; never-duplicate");
  assert.equal(SPECIAL_PUNYA_KAAL_POLICY.mahapata, "blocked-pending-reviewed-contact-definition");
});
