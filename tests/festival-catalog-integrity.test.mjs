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
test("flags a hard-coded clock time without a rule", () => {
 const data=base(); data.events[0].description="पूजा का शुभ समय 05:57 ए एम से 09:48 ए एम है।";
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="TIME_PROMISE_WITHOUT_RULE"));
});
test("does not flag general ritual-rule explanations as false time promises", () => {
 const data=base(); data.events[0].description="पारण का समय द्वादशी-व्याप्ति और हरिवासर के नियमों से निर्धारित होता है।";
 assert.ok(!auditMonth(data,2026,6).some(x=>x.code==="TIME_PROMISE_WITHOUT_RULE"));
});
test("catches duplicate date and normalized title", () => {
 const data=base(); data.events.push({...data.events[0],title:"एकादशी।"});
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="DUPLICATE_DATE_AND_TITLE"));
});
test("does not fail a consistently under-review month", () => {
 const data=base(); data.status="needs-review"; data.events[0].reviewStatus="needs-review";
 assert.deepEqual(auditMonth(data,2026,6),[]);
});


test("does not require tithi metadata for solar Sankranti observances", () => {
  const data = base();
  data.events[0].title = "मकर संक्रांति";
  data.events[0].category = "संक्रांति";
  delete data.events[0].hinduTithi;
  assert.deepEqual(auditMonth(data, 2026, 6), []);
});

test("flags unknown muhurta rule IDs", () => {
  const data = base();
  data.events[0].muhurtaRule = "unknown-rule-id";
  assert.ok(auditMonth(data, 2026, 6).some(x => x.code === "UNKNOWN_MUHURTA_RULE" && x.severity === "error"));
});

test("recognizes the implemented Shivaratri and Vinayaka muhurta rules", () => {
  for (const rule of ["masik-shivaratri-nishita", "vinayaka-chaturthi-madhyahna"]) {
    const data = base();
    data.events[0].muhurtaRule = rule;
    assert.ok(!auditMonth(data, 2026, 6).some(x => x.code === "UNKNOWN_MUHURTA_RULE"));
  }
});

test("warns when events are not in chronological order", () => {
 const data=base();
 data.events.push({date:"2026-05-31",title:"पहले की तिथि",reviewStatus:"approved"});
 assert.ok(auditMonth(data,2026,6).some(x=>x.code==="EVENTS_NOT_CHRONOLOGICAL"));
});

test("accepts complete astronomical eclipse visibility timings without treating them as a puja muhurta", () => {
  const data = base();
  data.events[0].title = "चंद्रग्रहण";
  data.events[0].description = "पिथौरागढ़ में चंद्रोदय 06:08 PM; आंशिक ग्रहण 06:11 PM से 06:47 PM तक दिखाई देगा।";
  data.events[0].timingType = "eclipse-visibility";
  assert.ok(!auditMonth(data, 2026, 6).some(x => x.code === "TIME_PROMISE_WITHOUT_RULE"));
});


test("accepts tithi-transition timings without requiring a muhurta rule", () => {
  const data = base();
  data.events[0].title = "श्री वराह अवतार जयंती";
  data.events[0].description = "सूर्योदय 05:53 पर द्वितीया थी और तृतीया 07:08 AM पर आरम्भ हुई।";
  data.events[0].timingType = "tithi-transition";
  assert.ok(!auditMonth(data, 2026, 6).some(x => x.code === "TIME_PROMISE_WITHOUT_RULE"));
});
