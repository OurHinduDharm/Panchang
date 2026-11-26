import test from "node:test";
import assert from "node:assert/strict";
import {
  isApprovedSpecialPunyaKaalCandidate,
  SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL, publicSpecialPunyaKaalMonth, nextApprovedMahapata
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

test("both calendars receive only individually approved Mahapata intervals, including IST year rollover", () => {
  const record = { status: "approved", type: "vaidhriti-mahapat",
    ruleProfile: "drik-geocentric-apparent-disks", start: "2026-12-31T17:00:00.000Z",
    end: "2026-12-31T20:00:00.000Z" };
  const dormant = { calculationStatus: "not-applicable", candidates: [] };
  for (const [year, month] of [[2026, 12], [2027, 1]]) {
    const approved = publicSpecialPunyaKaalMonth(dormant, year, month, [record]);
    assert.equal(approved.length, 1);
    assert.equal(approved[0].labels[0], "वैधृति महापात");
    assert.equal(approved[0].date, "2026-12-31");
    assert.equal(approved[0].endTime, record.end);
  }
  assert.deepEqual(publicSpecialPunyaKaalMonth(dormant, 2027, 1), []);
  assert.deepEqual(publicSpecialPunyaKaalMonth(dormant, 2027, 1, [
    { ...record, status: "research-only-not-approved" }, { ...record, type: "varuni" },
    { ...record, ruleProfile: "taraprasad-30-arcmin" }, { ...record, start: record.end },
    { ...record, start: "2026-12-31T17:00:00" }, { ...record, end: "2026-12-31T18:30:00.000Z" }
  ]), []);
  assert.deepEqual(publicSpecialPunyaKaalMonth({ calculationStatus: "incomplete",
    candidates: [candidate()] }, 2027, 4), []);
});


test("upcoming Mahapata changes from upcoming to today to active to next across IST year boundary", () => {
  const first = {status:"approved",type:"vaidhriti-mahapat",ruleProfile:"drik-geocentric-apparent-disks",
    start:"2026-12-31T17:00:00.000Z",middle:"2026-12-31T18:30:00.000Z",end:"2026-12-31T20:00:00.000Z"};
  const next = {...first,type:"vyatipata-mahapat",start:"2027-01-12T18:00:00.000Z",end:"2027-01-13T01:00:00.000Z"};
  const rows = [next, first, first, {...first,status:"research-only-not-approved"}, {...first,ruleProfile:"drik-31-arcmin"}];
  const at = t=>nextApprovedMahapata(Date.parse(t),rows);
  assert.equal(at("2026-12-30T18:29:59Z").phase,"upcoming");
  assert.equal(at("2026-12-30T18:30:00Z").phase,"today");
  assert.equal(at("2026-12-31T16:59:59Z").nextTransition,Date.parse(first.start));
  assert.equal(at(first.start).phase,"active");
  assert.equal(at("2026-12-31T18:30:00Z").phase,"active");
  assert.equal(at("2026-12-31T19:59:59Z").nextTransition,Date.parse(first.end));
  assert.equal(at(first.end).startTime,next.start);
  assert.equal(at(first.end).phase,"upcoming");
  assert.equal(at(next.end),null);
  assert.equal(nextApprovedMahapata(NaN,rows),null);
  assert.equal(nextApprovedMahapata(Date.parse(first.start)),null);
  assert.equal(publicSpecialPunyaKaalMonth(null,2026,12,rows).length,1);
  assert.equal(publicSpecialPunyaKaalMonth(null,2027,1,rows).length,2);
});
