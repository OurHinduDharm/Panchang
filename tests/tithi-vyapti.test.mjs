import assert from "node:assert/strict";
import test from "node:test";
import { parseTithiVyapti, findTithiInterval, formatTithiPoint } from "../tithi-vyapti.js";

test("parses Krishna Paksha tithi and the parenthesized vyapti tithi", () => {
  const result = parseTithiVyapti({ hinduTithi: "कार्तिक कृष्ण सप्तमी (अष्टमी व्याप्ति)" });
  assert.deepEqual(result, {
    base: { name: "सप्तमी", index: 21 },
    vyapti: { name: "अष्टमी", index: 22 }
  });
});

test("parses Shukla Paksha tithi vyapti", () => {
  const result = parseTithiVyapti({ hinduTithi: "कार्तिक शुक्ल दशमी (एकादशी व्याप्ति)" });
  assert.deepEqual(result, {
    base: { name: "दशमी", index: 9 },
    vyapti: { name: "एकादशी", index: 10 }
  });
});

test("does not create a vyapti descriptor for ordinary tithi labels", () => {
  assert.equal(parseTithiVyapti({ hinduTithi: "कार्तिक कृष्ण सप्तमी" }), null);
});

test("selects the exact tithi interval overlapping the festival's local date", () => {
  const result = findTithiInterval([
    { tithis: [
      { index: 22, startTime: "2026-10-31T18:30:00+05:30", endTime: "2026-11-01T23:10:00+05:30" },
      { index: 23, startTime: "2026-11-01T23:10:00+05:30", endTime: "2026-11-03T01:00:00+05:30" }
    ] }
  ], { name: "अष्टमी", index: 22 }, "2026-11-01");
  assert.equal(result.name, "अष्टमी");
  assert.equal(result.start.toISOString(), "2026-10-31T13:00:00.000Z");
  assert.equal(result.end.toISOString(), "2026-11-01T17:40:00.000Z");
});

test("formats a cross-date interval endpoint with its date", () => {
  assert.match(formatTithiPoint("2026-11-02T03:30:00+05:30", "2026-11-01"), /2 नव॰/);
});


test("merges sunrise-clipped pieces so the true tithi transition has no false gap", () => {
  const days = [
    { tithis: [
      { index: 21, startTime: "2030-12-16T16:58:00+05:30", endTime: "2030-12-17T06:57:00+05:30" },
      { index: 22, startTime: "2030-12-17T17:31:00+05:30", endTime: "2030-12-18T06:58:00+05:30" }
    ] },
    { tithis: [
      { index: 21, startTime: "2030-12-17T06:57:00+05:30", endTime: "2030-12-17T17:31:00+05:30" },
      { index: 22, startTime: "2030-12-18T06:58:00+05:30", endTime: "2030-12-18T17:21:00+05:30" }
    ] }
  ];
  const saptami = findTithiInterval(days, { name: "सप्तमी", index: 21 }, "2030-12-17");
  const ashtami = findTithiInterval(days, { name: "अष्टमी", index: 22 }, "2030-12-17");
  assert.equal(saptami.start.toISOString(), "2030-12-16T11:28:00.000Z");
  assert.equal(saptami.end.toISOString(), "2030-12-17T12:01:00.000Z");
  assert.equal(ashtami.start.toISOString(), "2030-12-17T12:01:00.000Z");
  assert.equal(ashtami.end.toISOString(), "2030-12-18T11:51:00.000Z");
});


test("every tithi-name vyapti label in the 2026–2030 calendar can be parsed", async () => {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const folder = join(process.cwd(), "data", "festivals");
  const years = [2026, 2027, 2028, 2029, 2030];
  const tithiNames = [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी",
    "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी",
    "पूर्णिमा", "अमावस्या"
  ];
  const failures = [];
  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const file = join(folder, year + "-" + String(month).padStart(2, "0") + ".json");
      const data = JSON.parse(readFileSync(file, "utf8"));
      for (const event of data.events || []) {
        const text = String(event.hinduTithi || "");
        const match = text.match(/\(([^()]*)\)/);
        if (!match || !/व्याप्ति/.test(match[1])) continue;
        if (!tithiNames.some(name => match[1].includes(name))) continue;
        if (!parseTithiVyapti(event)) failures.push([event.date, event.title, text]);
      }
    }
  }
  assert.deepEqual(failures, []);
});
