import test from "node:test";
import assert from "node:assert/strict";
import {approvedCalendarEvents,buildFestivalIcs,isMajorFestival} from "../festival-calendar-export.mjs";
const event = (title,category="प्रमुख पर्व",date="2027-12-31",reviewStatus="approved") => ({title,category,date,reviewStatus});
const catalogue = events => ({year:2027,month:12,status:"approved",events});
test("exports only unique approved major public observances in the requested month",()=>{
 const data=catalogue([event("एकादशी","एकादशी"),event("एकादशी","एकादशी"),event("अमावस्या","अमावस्या","2027-12-30"),event("ग्रहण"),event("ISKCON एकादशी"),event("candidate","प्रमुख पर्व","2027-12-31","needs-review"),event("bad date","प्रमुख पर्व","2027-12-32"),event("other month","प्रमुख पर्व","2027-11-30"),event("मासिक कालाष्टमी / मासिक कृष्ण जन्माष्टमी","व्रत"),event("चन्द्र दर्शन","पर्व")]);
 assert.deepEqual(approvedCalendarEvents(data,2027,12).map(e=>e.title),["एकादशी","अमावस्या"]);
 assert.deepEqual(approvedCalendarEvents({...data,status:"draft"},2027,12),[]);
 assert.deepEqual(approvedCalendarEvents(data,2027,11),[]);
 assert.deepEqual(approvedCalendarEvents(null,2027,12),[]);
 assert.equal(isMajorFestival(event("करवा चौथ","व्रत")),true);
 assert.equal(isMajorFestival(event("गुरु प्रदोष व्रत","व्रत")),true);
});
test("ICS all-day dates, year rollover, UTF-8 folding, text escaping and stable UIDs",()=>{
 const title="पूजा, व्रत; "+ "धर्म".repeat(30)+"\nBEGIN:VEVENT";
 const events=[event(title)];
 const output=buildFestivalIcs(events,new Date("2026-11-28T12:00:00Z"));
 assert.ok(output.endsWith("END:VCALENDAR\r\n"));
 assert.ok(output.includes("DTSTART;VALUE=DATE:20271231\r\nDTEND;VALUE=DATE:20280101"));
 assert.ok(output.split("\r\n").every(line=>new TextEncoder().encode(line).length<=75));
 const unfolded=output.replace(/\r\n /g,"");
 assert.ok(unfolded.includes("SUMMARY:पूजा\\, व्रत\\; "));
 assert.ok(unfolded.includes("\\nBEGIN:VEVENT"));
 assert.equal(unfolded.split("\r\nBEGIN:VEVENT\r\n").length,2);
 assert.ok(unfolded.includes("DTSTAMP:20261128T120000Z"));
 assert.equal(unfolded.match(/^UID:.*$/m)[0],buildFestivalIcs(events,new Date("2026-11-29T12:00:00Z")).replace(/\r\n /g,"").match(/^UID:.*$/m)[0]);
});
