import test from "node:test";
import assert from "node:assert/strict";
import { auditMonth } from "../scripts/audit-festival-catalog.mjs";
const base = () => ({ year: 2026, month: 6, status: "approved", events: [{ date: "2026-06-01", title: "एकादशी", category: "एकादशी", hinduTithi: "ज्येष्ठ शुक्ल एकादशी", reviewStatus: "approved" }] });
test("accepts a consistent approved month", () => assert.deepEqual(auditMonth(base(), 2026, 6), []));
test("catches approved month containing needs-review events", () => {
 const data=base(); data.events[0].reviewStatus="needs-review";
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="MONTH_APPROVED_WITH_UNREVIEWED_EVENTS"&&x.severity==="error"));
});
test("catches invalid calendar dates", () => {
 const data=base(); data.events[0].date="2026-02-30";
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="DATE_INVALID_CALENDAR"));
});
test("flags missing tithi metadata for tithi-based observances", () => {
 const data=base(); delete data.events[0].hinduTithi;
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="TITHI_METADATA_MISSING"));
});
test("flags a time promise without a rule", () => {
 const data=base(); data.events[0].description="पूजा का मुहूर्त निर्धारित किया जाता है।";
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="TIME_PROMISE_WITHOUT_RULE"));
});
test("catches duplicate date and normalized title", () => {
 const data=base(); data.events.push({...data.events[0],title:"एकादशी।"});
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="DUPLICATE_DATE_AND_TITLE"));
});
test("does not fail a consistently under-review month", () => {
 const data=base(); data.status="needs-review"; data.events[0].reviewStatus="needs-review";
 assert.deepEqual(auditMonth(data,2026,6),[]);
});
