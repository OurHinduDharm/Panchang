import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const years = [2026, 2027, 2028, 2029, 2030];
const events = years.flatMap(year =>
  Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const data = JSON.parse(readFileSync(join(folder, year + "-" + month + ".json"), "utf8"));
    return data.events || [];
  }).flat()
);
const rulesOf = event => [
  ...(Array.isArray(event.muhurtaRules) ? event.muhurtaRules : []),
  ...(event.muhurtaRule ? [event.muhurtaRule] : [])
];

test("every 2026–2030 Pradosh card carries the supported Pradosh-kala rule", () => {
  const records = events.filter(event => /प्रदोष/.test(event.title || ""));
  assert.ok(records.length >= 100, "Expected a complete five-year Pradosh catalog");
  const missing = records.filter(event => !rulesOf(event).includes("pradosh-kala"));
  assert.deepEqual(missing.map(event => [event.date, event.title]), []);
});

test("every 2026–2030 Masik Shivaratri card carries a Nishita rule", () => {
  const records = events.filter(event => /मासिक शिवरात्रि/.test(event.title || ""));
  assert.ok(records.length >= 50, "Expected a complete five-year Masik Shivaratri catalog");
  const missing = records.filter(event =>
    !rulesOf(event).some(rule =>
      ["masik-shivaratri-nishita", "mahashivaratri-nishita"].includes(rule)
    )
  );
  assert.deepEqual(missing.map(event => [event.date, event.title]), []);
});

test("Mahashivaratri cards retain both Nishita and four-prahar rules", () => {
  const records = events.filter(event => /महाशिवरात्रि/.test(event.title || ""));
  for (const event of records) {
    const rules = rulesOf(event);
    assert.ok(rules.includes("mahashivaratri-nishita"), event.date + " Nishita rule");
    assert.ok(rules.includes("mahashivaratri-four-prahar"), event.date + " four-prahar rule");
  }
});


test("Dhanteras and Chhath muhurta rules never leak onto unrelated cards", () => {
  const misplaced = events.flatMap(event => {
    const rules = rulesOf(event);
    const title = String(event.title || "");
    const failures = [];
    if (rules.includes("dhanteras-muhurta") && !/धनतेरस|धन्वन्तरि/.test(title)) {
      failures.push([event.date, title, "dhanteras-muhurta"]);
    }
    if (rules.includes("chhath-arghya") && !/छठ/.test(title)) {
      failures.push([event.date, title, "chhath-arghya"]);
    }
    return failures;
  });
  assert.deepEqual(misplaced, []);
});
