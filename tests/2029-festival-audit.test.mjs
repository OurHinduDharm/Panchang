import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) =>
  JSON.parse(readFileSync(join(folder, "2029-" + String(i + 1).padStart(2, "0") + ".json"), "utf8")));
const events = months.flatMap(data => data.events || []);
const has = (date, pattern) => events.find(event => event.date === date && pattern.test(event.title || ""));

test("2029 monthly festival files have approved records dated within their month", () => {
  for (const [index, data] of months.entries()) {
    assert.equal(data.year, 2029);
    assert.equal(data.month, index + 1);
    assert.equal(data.status, "approved");
    for (const event of data.events || []) {
      assert.equal(event.reviewStatus, "approved", event.date + ": " + event.title);
      assert.match(event.date, /^2029-\d{2}-\d{2}$/);
      assert.equal(Number(event.date.slice(5, 7)), index + 1,
        event.date + " is stored in the wrong monthly file");
    }
  }
});

test("2029 catalog has one card per same-date Hindu tithi", () => {
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    assert.ok(!seen.has(key),
      "Duplicate same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
    seen.set(key, event.title);
  }
});

test("2029 Ekadashi cards follow the Smarta-only policy", () => {
  assert.equal(events.filter(event => /(गौण|वैष्णव)/.test(event.title || "")).length, 0);
  const utpanna = has("2029-12-01", /उत्पन्ना एकादशी \(स्मार्त\)/);
  assert.equal(utpanna.hinduTithi, "मार्गशीर्ष कृष्ण एकादशी");
  assert.equal(events.filter(event => /उत्पन्ना एकादशी/.test(event.title || "")).length, 1);
});

test("2029 Navratri and same-tithi observances are combined", () => {
  assert.ok(has("2029-01-16", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
  assert.ok(has("2029-01-18", /गौरी गणेश.*कूष्माण्डा/));
  assert.ok(has("2029-01-19", /वसंत पंचमी.*स्कन्दमाता/));
  assert.ok(has("2029-01-20", /मासिक स्कन्द षष्ठी.*कात्यायनी/));
  assert.ok(has("2029-01-22", /रथ सप्तमी.*कालरात्रि/));
  assert.ok(has("2029-01-23", /मासिक दुर्गाष्टमी.*भीष्माष्टमी.*महागौरी/));
  assert.ok(has("2029-04-15", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
  assert.ok(has("2029-04-17", /गणगौर.*चन्द्रघंटा/));
  assert.ok(has("2029-04-20", /यमुना छठ.*कात्यायनी/));
  assert.ok(has("2029-10-09", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
});

test("2029 major festivals and saint jayantis are represented", () => {
  assert.ok(has("2029-01-13", /लोहड़ी/));
  assert.ok(has("2029-01-14", /पोंगल/));
  assert.ok(has("2029-01-30", /गुरु रविदास जयंती/));
  assert.ok(has("2029-02-08", /महर्षि दयानंद सरस्वती जयंती/));
  assert.ok(has("2029-02-15", /रामकृष्ण परमहंस जयंती/));
  assert.ok(has("2029-02-28", /चैतन्य महाप्रभु जयंती/));
  assert.ok(has("2029-04-14", /उगादी/));
  assert.ok(has("2029-04-14", /मेष संक्रांति/));
  assert.ok(has("2029-04-14", /बैसाखी/));
  assert.ok(has("2029-04-14", /विषु/));
  assert.ok(has("2029-04-14", /बोहाग बिहू/));
  assert.ok(has("2029-09-01", /अगस्त्य अर्घ्य/));
  assert.ok(has("2029-09-17", /विश्वकर्मा पूजा/));
  assert.ok(has("2029-10-01", /जीवित्पुत्रिका व्रत/));
  assert.ok(has("2029-10-13", /सरस्वती आवाहन/));
  assert.ok(has("2029-10-14", /सरस्वती पूजा/));
  assert.ok(has("2029-10-16", /मध्वाचार्य जयंती/));
  assert.ok(has("2029-10-18", /पद्मनाभ द्वादशी/));
  assert.ok(has("2029-10-22", /वाल्मीकि जयंती.*मीराबाई जयंती/));
  assert.ok(has("2029-10-30", /राधाकुण्ड स्नान/));
  assert.ok(has("2029-11-16", /देवउठनी एकादशी \(स्मार्त\)/));
  assert.ok(has("2029-11-21", /कार्तिक पूर्णिमा.*देव दीपावली/));
  assert.ok(has("2029-12-02", /कृष्ण योगेश्वर द्वादशी/));
});

test("2029 Pithoragarh total lunar eclipse has local contact timings", () => {
  const eclipse = has("2029-12-21", /पूर्ण चंद्रग्रहण/);
  assert.ok(eclipse);
  assert.equal(eclipse.hinduTithi, "मार्गशीर्ष शुक्ल पूर्णिमा");
  assert.match(eclipse.description, /2:25 से सुबह 5:58 बजे तक/);
  assert.match(eclipse.description, /3:45 से 4:38 बजे तक/);
  assert.match(eclipse.sourceUrl, /timeanddate\.com\/eclipse\/in\/india\/pithoragarh/);
});
