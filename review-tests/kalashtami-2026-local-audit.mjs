import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";
const require = createRequire(import.meta.url);
const adapter = require("../tests/fixtures/kalashtami-panchang-adapter.js");

const SEED_DATES = [
  "2026-01-10", "2026-02-09", "2026-03-11", "2026-04-10",
  "2026-05-09", "2026-06-08", "2026-07-07", "2026-08-05",
  "2026-09-04", "2026-10-03", "2026-11-01", "2026-12-01",
  "2026-12-30"
];

test("audit monthly Kalashtami dates at the site's actual default observer", async () => {
  const result = await adapter.buildKalashtamiDays({
    year: 2026,
    latitude: 29.5828,
    longitude: 80.2182,
    elevation: 1650,
    timezoneOffset: 330,
    seedDates: SEED_DATES,
    getPanchangam,
    Observer
  });
  const selected = (result.monthlyDecisionDays || []).map(item => item.date);
  const mismatches = SEED_DATES.filter(date => !selected.includes(date));
  console.log("Kalashtami static dates:", SEED_DATES.join(", "));
  console.log("Local rule-selected dates:", selected.join(", "));
  console.log("Dates not selected by local rule:", mismatches.join(", ") || "none");
  console.log("Unresolved candidates:", JSON.stringify(result.unresolvedCandidates || []));
  console.log("Annual Bhairava date:", JSON.stringify(result.annualDecisionDays || []));
  assert.equal(result.year, 2026);
  assert.ok(selected.length >= 10, "Expected the annual monthly event series to be substantially populated");
  assert.deepEqual(mismatches, ["2026-10-03"], "Only the October candidate remains unresolved in the local calculation");
  assert.ok((result.unresolvedCandidates || []).some(item => item.date === "2026-10-03"), "October 3 must remain visible as an unresolved candidate");
  assert.ok((result.annualDecisionDays || []).some(item => item.date === "2026-12-01"));
});
