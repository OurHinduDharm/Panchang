import test from "node:test";
import assert from "node:assert/strict";
import {
  isApprovedSpecialPunyaKaalCandidate,
  SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL
} from "../special-punya-kaal-public-approval.mjs";

const candidate = (overrides = {}) => ({
  date: "2027-04-04",
  labels: ["वारुणी योग"],
  startTime: "2027-04-03T22:56:57.290Z",
  endTime: "2027-04-04T11:02:55.133Z",
  ruleProfile: "chaitra-krishna-trayodashi-shatabhisha",
  ...overrides
});

test("only the four individually reviewed Smarta Varuni dates are publicly approved", () => {
  assert.deepEqual(SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL.dates, [
    "2026-03-17", "2027-04-04", "2028-03-23", "2030-03-31"
  ]);
  assert.equal(isApprovedSpecialPunyaKaalCandidate(candidate()), true);
  assert.equal(isApprovedSpecialPunyaKaalCandidate(candidate({ date: "2029-03-20" })), false);
});

test("unapproved rule profiles, labels and invalid intervals fail closed", () => {
  assert.equal(isApprovedSpecialPunyaKaalCandidate(candidate({ ruleProfile: "unreviewed" })), false);
  assert.equal(isApprovedSpecialPunyaKaalCandidate(candidate({ labels: ["महोदय योग"] })), false);
  assert.equal(isApprovedSpecialPunyaKaalCandidate(candidate({ endTime: "2027-04-03T22:00:00Z" })), false);
});
