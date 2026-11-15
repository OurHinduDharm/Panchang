import test from "node:test";
import assert from "node:assert/strict";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";
import { calculateSpecialPunyaKaalMonth } from "../special-punya-kaal-runtime.mjs";

test("pinned Panchang engine reproduces the 17 March 2026 Pithoragarh Varuni overlap", async () => {
  const observer = new Observer(29.5828, 80.2182, 1650);
  const result = await calculateSpecialPunyaKaalMonth({
    year: 2026,
    month: 3,
    observer,
    getPanchangam,
    timezoneOffsetMinutes: 330,
    calendarType: "purnimanta"
  });

  assert.equal(result.status, "research-only-not-approved");
  assert.equal(result.scannedDays, 33);
  assert.equal(result.panchangCalls, 33);
  assert.deepEqual(result.diagnostics, []);

  const varuni = result.candidates.find(item =>
    item.date === "2026-03-17" && item.labels?.[0] === "वारुणी योग"
  );
  assert.ok(varuni, "expected the known Varuni conjunction");
  assert.equal(varuni.ruleProfile, "chaitra-krishna-trayodashi-shatabhisha");
  assert.ok(Math.abs(Date.parse(varuni.startTime) - Date.parse("2026-03-17T00:52:08.083Z")) < 60000);
  assert.ok(Math.abs(Date.parse(varuni.endTime) - Date.parse("2026-03-17T03:53:26.360Z")) < 60000);
});
