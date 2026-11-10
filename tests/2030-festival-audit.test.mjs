import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) =>
  JSON.parse(readFileSync(join(folder, "2030-" + String(i + 1).padStart(2, "0") + ".json"), "utf8")));
const events = months.flatMap(data => data.events || []);
const has = (date, pattern) => events.find(event => event.date === date && pattern.test(event.title || ""));

test("2030 monthly festival files have approved records dated within their month", () => {
  for (const [index, data] of months.entries()) {
    assert.equal(data.year, 2030);
    assert.equal(data.month, index + 1);
    assert.equal(data.status, "approved");
    for (const event of data.events || []) {
      assert.equal(event.reviewStatus, "approved", event.date + ": " + event.title);
      assert.match(event.date, /^2030-\d{2}-\d{2}$/);
      assert.equal(Number(event.date.slice(5, 7)), index + 1,
        event.date + " is stored in the wrong monthly file");
    }
  }
});

test("2030 catalog has one card per same-date Hindu tithi", () => {
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    assert.ok(!seen.has(key),
      "Duplicate same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
    seen.set(key, event.title);
  }
});

test("2030 Ekadashi cards follow the Smarta-only policy", () => {
  assert.equal(events.filter(event => /(गौण|वैष्णव)/.test(event.title || "")).length, 0);
  assert.ok(has("2030-11-05", /देवउठनी एकादशी \\(स्मार्त\\)/));
  assert.ok(has("2030-11-21", /उत्पन्ना एकादशी \\(स्मार्त\\)/));
});

test("2030 important annual festivals and jayantis are represented", () => {
  assert.ok(has("2030-01-12", /स्वामी विवेकानंद जयंती/));
  assert.ok(has("2030-01-13", /लोहड़ी/));
  assert.ok(has("2030-01-15", /तैलंग स्वामी जयंती/));
  assert.ok(has("2030-02-18", /गुरु रविदास जयंती/));
  assert.ok(has("2030-02-27", /महर्षि दयानंद सरस्वती जयंती/));
  assert.ok(has("2030-03-06", /श्रीरामकृष्ण परमहंस जयंती/));
  assert.ok(has("2030-03-19", /चैतन्य महाप्रभु जयंती/));
  assert.ok(has("2030-04-04", /झूलेलाल जयंती/));
  assert.ok(has("2030-04-14", /बैसाखी/));
  assert.ok(has("2030-04-28", /वल्लभाचार्य जयंती/));
  assert.ok(has("2030-05-08", /आदि शंकराचार्य जयंती.*सूरदास जयंती/));
  assert.ok(has("2030-06-04", /महाराणा प्रताप जयंती/));
  assert.ok(has("2030-08-06", /गोस्वामी तुलसीदास जयंती/));
  assert.ok(has("2030-10-06", /मध्वाचार्य जयंती/));
  assert.ok(has("2030-10-11", /वाल्मीकि जयंती.*मीराबाई जयंती/));
  assert.ok(has("2030-12-30", /गुरु गोबिंद सिंह जयंती/));
});

test("2030 same-tithi Navratri and festival observances are combined", () => {
  assert.ok(has("2030-02-03", /चन्द्र दर्शन.*माघ गुप्त नवरात्र प्रारंभ/));
  assert.ok(has("2030-02-06", /गौरी गणेश.*कूष्माण्डा/));
  assert.ok(has("2030-02-07", /वसंत पंचमी.*स्कन्दमाता/));
  assert.ok(has("2030-02-08", /मासिक स्कन्द षष्ठी.*कात्यायनी/));
  assert.ok(has("2030-02-09", /रथ सप्तमी.*नर्मदा जयंती.*कालरात्रि/));
  assert.ok(has("2030-02-10", /भीष्म अष्टमी.*मासिक दुर्गाष्टमी.*महागौरी/));
  assert.ok(has("2030-04-04", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
  assert.ok(has("2030-04-06", /गणगौर.*मत्स्य-अवतार.*चन्द्रघंटा/));
  assert.ok(has("2030-04-09", /यमुना छठ.*कात्यायनी/));
  assert.ok(has("2030-05-05", /त्रेतायुगादि तिथि.*परशुराम जयंती.*अक्षय तृतीया.*मातंगी/));
  assert.ok(has("2030-09-29", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
  assert.ok(has("2030-10-02", /मासिक स्कन्द षष्ठी.*कात्यायनी/));
});

test("2030 only Pithoragarh-visible solar and partial lunar eclipses are listed", () => {
  const eclipses = events.filter(event => /ग्रहण/.test(event.title || ""));
  assert.equal(eclipses.filter(event => event.date === "2030-06-01").length, 1);
  assert.equal(eclipses.filter(event => event.date === "2030-06-15").length, 1);
  assert.equal(eclipses.some(event => event.date === "2030-11-25" || event.date === "2030-12-10"), false);
  const solar = has("2030-06-01", /आंशिक सूर्यग्रहण/);
  assert.match(solar.description, /3:57 बजे.*5:15:56 बजे.*6:38:21 बजे/);
  const lunar = has("2030-06-15", /आंशिक चंद्रग्रहण/);
  assert.match(lunar.description, /10:51 बजे.*1:15 बजे/);
});
