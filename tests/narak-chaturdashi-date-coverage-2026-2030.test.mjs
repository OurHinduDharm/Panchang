import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cases = [
  { month: "2026-11", narak: "2026-11-08", kali: "2026-11-07", combined: false },
  { month: "2027-10", narak: "2027-10-28", kali: "2027-10-27", combined: false },
  { month: "2028-10", narak: "2028-10-17", kali: "2028-10-16", combined: false },
  { month: "2029-11", narak: "2029-11-05", kali: "2029-11-04", combined: false },
  { month: "2030-10", narak: "2030-10-25", kali: "2030-10-25", combined: true }
];

async function readMonth(name) {
  return JSON.parse(await readFile(new URL("../data/festivals/" + name + ".json", import.meta.url), "utf8"));
}

test("Kali Chaudas and Narak Chaturdashi dates are reviewed consistently for 2026–2030", async () => {
  for (const item of cases) {
    const data = await readMonth(item.month);
    const kali = data.events.find(event => /काली चौदस/.test(event.title || ""));
    const narak = data.events.find(event => /नरक चतुर्दशी/.test(event.title || ""));
    assert.ok(kali, "Kali Chaudas card missing in " + item.month);
    assert.ok(narak, "Narak Chaturdashi card missing in " + item.month);
    assert.equal(kali.date, item.kali, "Kali Chaudas date in " + item.month);
    assert.equal(narak.date, item.narak, "Narak Chaturdashi date in " + item.month);
    assert.equal(kali === narak, item.combined, "Same-day observances should share one card only in 2030");
    assert.equal(narak.hinduTithi, "कार्तिक कृष्ण चतुर्दशी");
  }
});

test("2030 kshaya Chaturdashi does not attach the Narak bath rule to Diwali", async () => {
  const data = await readMonth("2030-10");
  const diwali = data.events.find(event => /दीपावली/.test(event.title || ""));
  const chaturdashi = data.events.find(event => /काली चौदस/.test(event.title || ""));
  assert.equal(chaturdashi.date, "2030-10-25");
  assert.match(chaturdashi.description, /दोनों दिनों के अरुणोदय में इसकी व्याप्ति नहीं है/);
  assert.match(chaturdashi.description, /क्षय-तिथि के विशेष निर्णय/);
  assert.equal(chaturdashi.muhurtaRule, undefined);
  assert.equal(chaturdashi.muhurtaRules, undefined);
  assert.equal(diwali.date, "2030-10-26");
  assert.deepEqual(diwali.muhurtaRules, ["diwali-lakshmi-puja"]);
  assert.doesNotMatch(diwali.title, /नरक चतुर्दशी/);
});
