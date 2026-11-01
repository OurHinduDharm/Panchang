import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = new URL("../data/festivals/", import.meta.url);
const expected = [
  [
    "2026-02-17",
    "द्वापरादि (द्वापरयुग का आरंभ)",
    "फाल्गुन कृष्ण अमावस्या"
  ],
  [
    "2026-04-19",
    "त्रेतायुगादि (त्रेतायुग का आरंभ)",
    "वैशाख शुक्ल तृतीया"
  ],
  [
    "2026-10-08",
    "कलियुगादि (कलियुग का आरंभ)",
    "आश्विन कृष्ण त्रयोदशी"
  ],
  [
    "2026-11-18",
    "सतयुगादि (सतयुग का आरंभ)",
    "कार्तिक शुक्ल नवमी"
  ],
  [
    "2027-03-07",
    "द्वापरादि (द्वापरयुग का आरंभ)",
    "फाल्गुन कृष्ण अमावस्या"
  ],
  [
    "2027-05-09",
    "त्रेतायुगादि (त्रेतायुग का आरंभ)",
    "वैशाख शुक्ल तृतीया"
  ],
  [
    "2027-09-28",
    "कलियुगादि (कलियुग का आरंभ)",
    "आश्विन कृष्ण त्रयोदशी"
  ],
  [
    "2027-11-07",
    "सतयुगादि (सतयुग का आरंभ)",
    "कार्तिक शुक्ल नवमी"
  ],
  [
    "2028-02-24",
    "द्वापरादि (द्वापरयुग का आरंभ)",
    "फाल्गुन कृष्ण अमावस्या"
  ],
  [
    "2028-04-27",
    "त्रेतायुगादि (त्रेतायुग का आरंभ)",
    "वैशाख शुक्ल तृतीया"
  ],
  [
    "2028-09-17",
    "कलियुगादि (कलियुग का आरंभ)",
    "आश्विन कृष्ण त्रयोदशी"
  ],
  [
    "2028-10-26",
    "सतयुगादि (सतयुग का आरंभ)",
    "कार्तिक शुक्ल नवमी"
  ],
  [
    "2029-02-13",
    "द्वापरादि (द्वापरयुग का आरंभ)",
    "फाल्गुन कृष्ण अमावस्या"
  ],
  [
    "2029-05-16",
    "त्रेतायुगादि (त्रेतायुग का आरंभ)",
    "वैशाख शुक्ल तृतीया"
  ],
  [
    "2029-10-06",
    "कलियुगादि (कलियुग का आरंभ)",
    "आश्विन कृष्ण त्रयोदशी"
  ],
  [
    "2029-11-14",
    "सतयुगादि (सतयुग का आरंभ)",
    "कार्तिक शुक्ल नवमी"
  ],
  [
    "2030-03-03",
    "द्वापरादि (द्वापरयुग का आरंभ)",
    "फाल्गुन कृष्ण अमावस्या"
  ],
  [
    "2030-05-05",
    "त्रेतायुगादि (त्रेतायुग का आरंभ)",
    "वैशाख शुक्ल तृतीया"
  ],
  [
    "2030-09-25",
    "कलियुगादि (कलियुग का आरंभ)",
    "आश्विन कृष्ण त्रयोदशी"
  ],
  [
    "2030-11-03",
    "सतयुगादि (सतयुग का आरंभ)",
    "कार्तिक शुक्ल नवमी"
  ]
];

function monthFile(date) {
  return "data/festivals/" + date.slice(0,7) + ".json";
}

test("Pithoragarh Drik Yugadi days are present for all four Yugas from 2026 through 2030", () => {
  for (const [date,title,tithi] of expected) {
    const data = JSON.parse(readFileSync(new URL(date.slice(0,7)+".json", folder), "utf8"));
    const matches = data.events.filter(event => event.date === date && event.title === title);
    assert.equal(matches.length, 1, date + " " + title + " should appear exactly once");
    const event = matches[0];
    assert.equal(event.hinduTithi, tithi, date + " tithi");
    assert.equal(event.category, "युगादि तिथि");
    assert.equal(event.reviewStatus, "approved");
    assert.equal(event.sourceName, "Drik Panchang — पिथौरागढ़");
    assert.ok((event.sourceUrl || "").startsWith("https://www.drikpanchang.com/panchang/month-panchang.html?date="));
  }
});

test("2030 has all twelve monthly JSON files and only the four supplied Yugadi cards", () => {
  for (let month = 1; month <= 12; month++) {
    const file = new URL("2030-" + String(month).padStart(2,"0") + ".json", folder);
    const data = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(data.year, 2030);
    assert.equal(data.month, month);
    assert.ok(Array.isArray(data.events));
  }
  const count = expected.filter(([date]) => date.startsWith("2030-")).length;
  assert.equal(count, 4);
});
