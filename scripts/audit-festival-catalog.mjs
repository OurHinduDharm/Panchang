#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const DATA_DIR = path.join(process.cwd(), "data", "festivals");
const YEAR = Number(process.argv[2] || 2026);
const TITHI_CATEGORIES = /एकादशी|पूर्णिमा|अमावस्या|चतुर्थी|प्रदोष|शिवरात्रि|अष्टमी|षष्ठी|नवरात्रि/i;
const MUHURTA_SOURCE = fs.readFileSync(path.join(process.cwd(), "festival-muhurta.js"), "utf8");
const SUPPORTED_MUHURTA_RULES = new Set(
  [...MUHURTA_SOURCE.matchAll(/^\s{2,8}(?:["\x27]([^"\x27]+)["\x27]|([A-Za-z_$][\w$]*))\s*\(context\)/gm)]
    .map(match => match[1] || match[2])
);
function normalizeTitle(value) {
  return String(value || "").normalize("NFKC").replace(/[।॥.,\/()–—-]/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("hi");
}
export function auditMonth(data, expectedYear, expectedMonth) {
  const issues = [], events = Array.isArray(data?.events) ? data.events : [];
  const add = (severity, code, detail) => issues.push({ severity, code, detail });
  if (data?.year !== expectedYear || data?.month !== expectedMonth) add("error", "MONTH_ID_MISMATCH", "Expected " + expectedYear + "-" + expectedMonth + "; found " + data?.year + "-" + data?.month);
  if (!["approved", "needs-review", "source-conflict", "draft"].includes(data?.status)) add("error", "UNKNOWN_MONTH_STATUS", "Unexpected month status: " + data?.status);
  if (!Array.isArray(data?.events)) { add("error", "EVENTS_NOT_ARRAY", "events is missing or not an array"); return issues; }
  const exactKeys = new Map();
  let previousDate = "";
  for (let i = 0; i < events.length; i++) {
    const event = events[i] || {}, label = "events[" + i + "] " + (event.title || "(untitled)");
    const status = event.reviewStatus || "missing";
    if (!event.title || !String(event.title).trim()) add("error", "TITLE_MISSING", label);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date || "")) add("error", "DATE_INVALID_FORMAT", label + ": " + event.date);
    else {
      const parsed = new Date(event.date + "T00:00:00Z");
      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== event.date) add("error", "DATE_INVALID_CALENDAR", label + ": " + event.date);
      else {
        const parts = event.date.split("-").map(Number);
        if (parts[0] !== expectedYear || parts[1] !== expectedMonth) add("warning", "DATE_OUTSIDE_FILE_MONTH", label + ": " + event.date);
        if (previousDate && event.date < previousDate) add("warning", "EVENTS_NOT_CHRONOLOGICAL", label + ": " + event.date + " follows " + previousDate);
        previousDate = event.date;
      }
    }
    if (event.endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(event.endDate) || event.endDate < event.date)) add("error", "END_DATE_INVALID", label + ": " + event.date + " -> " + event.endDate);
    if (!["approved", "needs-review", "source-conflict", "draft", "rejected"].includes(status)) add("error", "UNKNOWN_EVENT_STATUS", label + ": " + status);
    if (TITHI_CATEGORIES.test((event.title || "") + " " + (event.category || "")) && !event.hinduTithi) add("warning", "TITHI_METADATA_MISSING", label);
    if (event.muhurtaRule && !SUPPORTED_MUHURTA_RULES.has(event.muhurtaRule)) add("error", "UNKNOWN_MUHURTA_RULE", label + ": " + event.muhurtaRule);
    const description = String(event.description || "");
    const explicitClockTime = /(?:\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s*(?:ए\s*एम|पी\s*एम|AM|PM)\b|\d{1,2}\s*से\s*\d{1,2})/i.test(description);
    const explicitTimeClaim = /(?:मुहूर्त|शुभ समय|पारण का समय|पूजा का समय|पुण्यकाल).{0,45}(?:नीचे दिया|दिया गया|उपलब्ध है|देखें|यहाँ)/i.test(description);
    const nonMuhurtaTiming = event.timingType === "eclipse-visibility";
    if ((explicitClockTime || explicitTimeClaim) && !event.muhurtaRule && !nonMuhurtaTiming) add("warning", "TIME_PROMISE_WITHOUT_RULE", label);
    const key = (event.date || "") + "|" + normalizeTitle(event.title);
    if (key !== "|" && exactKeys.has(key)) add("error", "DUPLICATE_DATE_AND_TITLE", label + "; duplicates events[" + exactKeys.get(key) + "]");
    else if (key !== "|") exactKeys.set(key, i);
  }
  const nonApproved = events.filter(e => (e?.reviewStatus || "missing") !== "approved").length;
  if (data.status === "approved" && nonApproved) add("error", "MONTH_APPROVED_WITH_UNREVIEWED_EVENTS", nonApproved + " of " + events.length + " events are not approved");
  if (data.status !== "approved" && events.length && nonApproved === 0) add("warning", "MONTH_STATUS_MORE_RESTRICTIVE", "Month is " + data.status + ", but every event is marked approved");
  return issues;
}
function main() {
  let errors = 0, warnings = 0, totalEvents = 0;
  for (let month = 1; month <= 12; month++) {
    const file = path.join(DATA_DIR, YEAR + "-" + String(month).padStart(2,"0") + ".json");
    if (!fs.existsSync(file)) { console.log("ERROR " + YEAR + "-" + month + " FILE_MISSING"); errors++; continue; }
    let data;
    try { data = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (error) { console.log("ERROR " + path.basename(file) + " JSON_PARSE_ERROR " + error.message); errors++; continue; }
    totalEvents += Array.isArray(data.events) ? data.events.length : 0;
    const issues = auditMonth(data, YEAR, month), e = issues.filter(x => x.severity === "error").length, w = issues.filter(x => x.severity === "warning").length;
    errors += e; warnings += w;
    console.log(YEAR + "-" + String(month).padStart(2,"0") + " events=" + (data.events?.length ?? 0) + " monthStatus=" + data.status + " errors=" + e + " warnings=" + w);
    for (const issue of issues) console.log("  " + issue.severity.toUpperCase() + " " + issue.code + ": " + issue.detail);
  }
  console.log("SUMMARY year=" + YEAR + " events=" + totalEvents + " errors=" + errors + " warnings=" + warnings);
  if (errors) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
