import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isNavratriMahashtamiEvent } from "../festival-muhurta.js";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");


test("Sandhi Puja is enabled for Mahashtami of all four Navratris only", () => {
  for (const family of ["sharad", "vasanta", "magha-gupta", "ashadha-gupta"]) {
    assert.equal(isNavratriMahashtamiEvent({
      title: "नवरात्र महाष्टमी — माँ महागौरी",
      navratriFamily: family
    }), true, family + " Mahashtami qualifies");
  }
  assert.equal(isNavratriMahashtamiEvent({
    title: "मासिक दुर्गाष्टमी",
    hinduTithi: "कार्तिक शुक्ल अष्टमी"
  }), false, "monthly Durga Ashtami does not qualify");
  assert.equal(isNavratriMahashtamiEvent({
    title: "मासिक दुर्गाष्टमी — माँ दुर्गा",
    navratriFamily: "unrelated"
  }), false, "an unrelated family does not qualify");
  assert.equal(isNavratriMahashtamiEvent({
    title: "शारदीय नवरात्र सप्तमी",
    navratriFamily: "sharad"
  }), false, "Navratri days other than Mahashtami do not qualify");
});

test("Sandhi Puja scope is consistent across every catalog year (2026–2030)", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  const muhurta = await read("festival-muhurta.js");
  const expectedSharadiya = {
    2026: { month: "10", date: "2026-10-19" },
    2027: { month: "10", date: "2027-10-07" },
    2028: { month: "09", date: "2028-09-26" },
    2029: { month: "10", date: "2029-10-14" },
    2030: { month: "10", date: "2030-10-04" }
  };

  assert.match(muhurta, /export function isNavratriMahashtamiEvent/);
  assert.ok(muhurta.includes('"sharad", "vasanta", "magha-gupta", "ashadha-gupta"'));
  assert.ok(muhurta.includes("आश्विन") && muhurta.includes("शुक्ल") && muhurta.includes("अष्टमी"));
  assert.match(widget, /isNavratriMahashtamiEvent\(item\)/);
  assert.match(widget, /ruleIds=ruleIds\.filter/);
  assert.match(muhurta, /tithiIndex === 7 \|\| tithiIndex === 8/);
  assert.doesNotMatch(muhurta, /tithiIndex === 7 \|\| tithiIndex === 22/);

  for (const [yearText, expected] of Object.entries(expectedSharadiya)) {
    const year = Number(yearText);
    const data = JSON.parse(await read(`data/festivals/${year}-${expected.month}.json`));
    const event = data.events.find(item => item.date === expected.date &&
      /महाष्टमी|महाअष्टमी|दुर्गाष्टमी|दुर्गा अष्टमी/.test(item.title || ""));
    assert.ok(event, `Sharadiya Mahashtami event exists for ${year}`);
    const identity = (event.title || "") + " " + (event.description || "") + " " + (event.hinduTithi || "");
    assert.match(identity, /शारदीय\s*नवरात्र|आश्विन\s*शुक्ल\s*अष्टमी/,
      `Sharadiya identity is explicit for ${year}`);
  }

  const monthlyDurga = JSON.parse(await read("data/festivals/2026-09.json"));
  const monthlyEvent = monthlyDurga.events.find(item => item.date === "2026-09-19" && /मासिक दुर्गाष्टमी/.test(item.title || ""));
  assert.ok(monthlyEvent, "2026 monthly Durga Ashtami fixture exists");
  assert.doesNotMatch(
    (monthlyEvent.title || "") + " " + (monthlyEvent.description || "") + " " + (monthlyEvent.hinduTithi || ""),
    /शारदीय\s*नवरात्र|आश्विन\s*शुक्ल\s*अष्टमी/,
    "Monthly Durga Ashtami must not qualify for Sandhi Puja"
  );
});

test("annual Dwadashi date rows accept standard ISO dates", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  assert.match(widget, /!\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/);
  assert.doesNotMatch(widget, /!\/\^\\\\d\{4\}/);
});
