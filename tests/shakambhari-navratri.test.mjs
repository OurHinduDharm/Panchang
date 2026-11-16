import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function month(yearMonth) {
  return JSON.parse(readFileSync(new URL("../data/festivals/" + yearMonth + ".json", import.meta.url), "utf8"));
}

const article = "http://ourhindudharm.blogspot.com/2014/01/About-Goddess-Shatakshi-On-Shaakambhari-Jayanti.html";
const linkLabel = "स्तोत्रात्मक उपासना करें।";

test("Shakambhari Navratri starts are represented on Pausha Shukla Ashtami in the supported calendar years", () => {
  const starts = [
    ["2027-01", "2027-01-16"],
    ["2028-01", "2028-01-05"],
    ["2028-12", "2028-12-24"],
    ["2030-01", "2030-01-11"],
    ["2030-12", "2030-12-31"]
  ];
  for (const [file, date] of starts) {
    const event = month(file).events.find(item => item.date === date && /शाकंभरी नवरात्रि प्रारंभ/.test(item.title || ""));
    assert.ok(event, date + " Shakambhari Navratri start");
    assert.equal(event.hinduTithi, "पौष शुक्ल अष्टमी");
    assert.equal(event.articleUrl, article);
    assert.equal(event.articleLabel, linkLabel);
    assert.match(event.description || "", /स्तोत्रात्मक उपासना करें।/);
    assert.ok(event.sourceUrl);
  }
});

test("Shakambhari Navratri end and Jayanti remain one existing Purnima card with the requested article link", () => {
  const ends = [
    ["2026-01", "2026-01-03"],
    ["2027-01", "2027-01-22"],
    ["2028-01", "2028-01-12"],
    ["2028-12", "2028-12-31"],
    ["2030-01", "2030-01-19"]
  ];
  for (const [file, date] of ends) {
    const events = month(file).events.filter(item => item.date === date && /शाकंभरी/.test(item.title || ""));
    assert.equal(events.length, 1, date + " should retain one Shakambhari Purnima/Jayanti card");
    assert.equal(events[0].articleUrl, article);
    assert.equal(events[0].articleLabel, linkLabel);
    assert.match(events[0].description || "", /शाकंभरी नवरात्रि का समापन/);
  }
});

test("2026 end card discloses the 27 December 2025 start hidden by the year selector", () => {
  const event = month("2026-01").events.find(item => item.date === "2026-01-03" && /शाकंभरी माता जयंती/.test(item.title || ""));
  assert.match(event.description, /27 दिसंबर 2025/);
});

test("2030 December start discloses that its Purnima end falls on 8 January 2031", () => {
  const event = month("2030-12").events.find(item => item.date === "2030-12-31" && /शाकंभरी नवरात्रि प्रारंभ/.test(item.title || ""));
  assert.match(event.description, /8 जनवरी 2031/);
});
