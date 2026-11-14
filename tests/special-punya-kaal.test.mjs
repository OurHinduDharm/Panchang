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
  const results = buildVaruniCandidates([day()]);
  assert.equal(results.length, 1);
  assert.equal(results[0].date, "2028-03-17");
  assert.equal(results[0].startTime, "2028-03-17T04:00:00.000Z");
  assert.equal(results[0].endTime, "2028-03-17T10:00:00.000Z");
  assert.deepEqual(results[0].labels, ["वारुणी योग"]);
  assert.equal(results[0].status, "research-candidate");
});

test("Saturday adds Mahavaruni; Mahamahavaruni is limited to the exact Shubha overlap", () => {
  const saturday = day({
    date: "2028-03-18",
    sunrise: "2028-03-18T00:30:00.000Z",
    nextSunrise: "2028-03-19T00:30:00.000Z",
    tithis: [{ index: 27, name: "Trayodashi", paksha: "Krishna", startTime: "2028-03-18T02:00:00.000Z", endTime: "2028-03-18T10:00:00.000Z" }],
    nakshatras: [{ index: 24, name: "Shatabhisha", startTime: "2028-03-18T04:00:00.000Z", endTime: "2028-03-18T12:00:00.000Z" }],
    yogas: [{ index: 23, name: "Shubha", startTime: "2028-03-18T05:00:00.000Z", endTime: "2028-03-18T06:00:00.000Z" }]
  });
  const results = buildVaruniCandidates([saturday]);
  const mahavaruni = results.find(item => item.labels[0] === "महावारुणी योग");
  const mahama = results.find(item => item.labels[0] === "महामहावारुणी योग");
  assert.ok(mahavaruni);
  assert.ok(mahama);
  assert.equal(mahavaruni.startTime, "2028-03-18T04:00:00.000Z");
  assert.equal(mahavaruni.endTime, "2028-03-18T10:00:00.000Z");
  assert.equal(mahama.startTime, "2028-03-18T05:00:00.000Z");
  assert.equal(mahama.endTime, "2028-03-18T06:00:00.000Z");
});

test("a Shubha yoga outside the conjunction does not create Mahamahavaruni", () => {
  const saturday = day({
    date: "2028-03-18",
    sunrise: "2028-03-18T00:30:00.000Z",
    nextSunrise: "2028-03-19T00:30:00.000Z",
    tithis: [{ index: 27, name: "Trayodashi", paksha: "Krishna", startTime: "2028-03-18T02:00:00.000Z", endTime: "2028-03-18T10:00:00.000Z" }],
    nakshatras: [{ index: 24, name: "Shatabhisha", startTime: "2028-03-18T04:00:00.000Z", endTime: "2028-03-18T12:00:00.000Z" }],
    yogas: [{ index: 23, name: "Shubha", startTime: "2028-03-18T11:00:00.000Z", endTime: "2028-03-18T12:00:00.000Z" }]
  });
  const results = buildVaruniCandidates([saturday]);
  assert.ok(results.some(item => item.labels[0] === "महावारुणी योग"));
  assert.ok(!results.some(item => item.labels[0] === "महामहावारुणी योग"));
});

test("wrong paksha, month, tithi or nakshatra does not create a candidate", () => {
  assert.deepEqual(buildVaruniCandidates([day({ masa: "Vaishakha" })]), []);
  assert.deepEqual(buildVaruniCandidates([day({ tithis: [{ index: 12, name: "Trayodashi", paksha: "Shukla", startTime: "2028-03-17T02:00:00Z", endTime: "2028-03-17T10:00:00Z" }] })]), []);
  assert.deepEqual(buildVaruniCandidates([day({ tithis: [{ index: 26, name: "Dwadashi", startTime: "2028-03-17T02:00:00Z", endTime: "2028-03-17T10:00:00Z" }] })]), []);
  assert.deepEqual(buildVaruniCandidates([day({ nakshatras: [{ index: 23, name: "Dhanishtha", startTime: "2028-03-17T04:00:00Z", endTime: "2028-03-17T12:00:00Z" }] })]), []);
});

test("invalid or absent intervals are safely omitted", () => {
  assert.deepEqual(buildVaruniCandidates([day({ sunrise: null })]), []);
  assert.equal(SPECIAL_PUNYA_KAAL_POLICY.sankranti, "reuse-existing-display-and-calculation; never-duplicate");
  assert.equal(SPECIAL_PUNYA_KAAL_POLICY.mahapata, "blocked-pending-reviewed-contact-definition");
});
