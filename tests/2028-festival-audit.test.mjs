import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) =>
  JSON.parse(readFileSync(join(folder, "2028-" + String(i + 1).padStart(2, "0") + ".json"), "utf8")));
const events = months.flatMap(data => data.events || []);

test("2028 festival catalog follows the Smarta-only Ekadashi policy", () => {
  const excluded = events.filter(event =>
    event.category === "एकादशी" && /(गौण|वैष्णव)/.test(event.title || ""));
  assert.deepEqual(excluded, []);
});

test("2028 monthly festival files have approved records dated within their month", () => {
  for (const [index, data] of months.entries()) {
    assert.equal(data.year, 2028);
    assert.equal(data.month, index + 1);
    assert.equal(data.status, "approved");
    for (const event of data.events || []) {
      assert.equal(event.reviewStatus, "approved", event.date + ": " + event.title);
      assert.match(event.date, /^2028-\d{2}-\d{2}$/);
      assert.equal(Number(event.date.slice(5, 7)), index + 1,
        event.date + " is stored in the wrong monthly file");
    }
  }
});

test("2028 has one card per same-date Hindu tithi", () => {
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    assert.ok(!seen.has(key),
      "Duplicate same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
    seen.set(key, event.title);
  }
});

test("2028 Pithoragarh-visible lunar eclipses retain local contact times", () => {
  const july = events.find(event => event.date === "2028-07-06" && /आंशिक चंद्रग्रहण/.test(event.title || ""));
  assert.ok(july);
  assert.equal(july.hinduTithi, "आषाढ़ शुक्ल पूर्णिमा");
  assert.match(july.description, /10:39 बजे से 7 जुलाई रात 1:00 बजे तक/);
  assert.match(july.sourceUrl, /timeanddate\.com\/eclipse\/in\/india\/pithoragarh/);

  const december = events.find(event => event.date === "2028-12-31" && /पूर्ण चंद्रग्रहण/.test(event.title || ""));
  assert.ok(december);
  assert.equal(december.hinduTithi, "पौष शुक्ल पूर्णिमा");
  assert.match(december.description, /9:46 से 10:57 बजे तक/);
  assert.match(december.description, /1:10 बजे समाप्त/);
});

test("2028 January to April retain source-checked regional and same-tithi observances", () => {
  const putrada = events.find(event => event.date === "2028-01-08" && /पुत्रदा एकादशी/.test(event.title || ""));
  assert.match(putrada.title, /तैलंग स्वामी जयंती/);
  assert.ok(events.some(event => event.date === "2028-01-14" && /लोहड़ी/.test(event.title || "")));
  assert.equal(events.find(event => event.date === "2028-01-09" && /कूर्म द्वादशी/.test(event.title || "")).hinduTithi, "पौष शुक्ल द्वादशी");

  const ratha = events.find(event => event.date === "2028-02-03" && /रथ सप्तमी/.test(event.title || ""));
  assert.equal(ratha.hinduTithi, "माघ शुक्ल सप्तमी");
  const bhishma = events.find(event => event.date === "2028-02-03" && /भीष्माष्टमी/.test(event.title || ""));
  assert.equal(bhishma.hinduTithi, "माघ शुक्ल अष्टमी");
  assert.equal(events.find(event => event.date === "2028-02-07" && /भीष्म द्वादशी/.test(event.title || "")).hinduTithi, "माघ शुक्ल द्वादशी");
  assert.ok(events.some(event => event.date === "2028-02-15" && /यशोदा जयंती/.test(event.title || "")));
  assert.ok(events.some(event => event.date === "2028-02-16" && /शबरी जयंती/.test(event.title || "")));
  assert.ok(events.some(event => event.date === "2028-02-17" && /जानकी जयंती/.test(event.title || "")));
  assert.ok(events.some(event => event.date === "2028-02-27" && /फुलेरा दूज.*रामकृष्ण जयंती|रामकृष्ण जयंती.*फुलेरा दूज/.test(event.title || "")));
  assert.match(bhishma.title, /माँ महागौरी/);

  assert.ok(events.some(event => event.date === "2028-03-08" && /नृसिंह द्वादशी/.test(event.title || "")));
  assert.equal(events.find(event => event.date === "2028-03-21" && /कृष्ण नृसिंह द्वादशी/.test(event.title || "")).hinduTithi, "चैत्र कृष्ण द्वादशी");
  assert.equal(events.filter(event => event.date === "2028-03-11" && /होली/.test(event.title || "")).length, 1);
  const holi = events.find(event => event.date === "2028-03-11" && /होली/.test(event.title || ""));
  assert.equal(holi.hinduTithi, "चैत्र कृष्ण प्रतिपदा");
  assert.equal(events.find(event => event.date === "2028-03-12" && /भ्रातृ द्वितीया/.test(event.title || "")).hinduTithi, "चैत्र कृष्ण द्वितीया");
  assert.ok(events.some(event => event.date === "2028-03-10" && /श्री महालक्ष्मी जयंती/.test(event.title || "")));
  assert.equal(events.filter(event => /श्री महालक्ष्मी जयंती/.test(event.title || "")).length, 1);

  const yamuna = events.find(event => event.date === "2028-04-01" && /यमुना छठ/.test(event.title || ""));
  assert.ok(yamuna);
  const hanuman = events.find(event => event.date === "2028-04-09" && /हनुमान जयंती/.test(event.title || ""));
  assert.equal(hanuman.hinduTithi, "चैत्र शुक्ल पूर्णिमा");
  const parashurama = events.find(event => event.date === "2028-04-27" && /परशुराम जयंती/.test(event.title || ""));
  assert.equal(parashurama.hinduTithi, "वैशाख शुक्ल तृतीया");
});

test("2028 additional major observances are present with their reviewed tithis", () => {
  const has = (date, pattern) => events.find(event => event.date === date && pattern.test(event.title || ""));
  assert.ok(has("2028-05-01", /गंगा सप्तमी/));
  assert.equal(has("2028-05-01", /गंगा सप्तमी/).hinduTithi, "वैशाख शुक्ल सप्तमी");
  assert.ok(has("2028-05-03", /सीता नवमी/));
  assert.equal(has("2028-05-03", /सीता नवमी/).hinduTithi, "वैशाख शुक्ल नवमी");
  assert.ok(has("2028-05-09", /नारद जयंती/));
  assert.ok(has("2028-05-24", /वट सावित्री व्रत.*शनि जयंती|शनि जयंती.*वट सावित्री व्रत/));

  assert.ok(has("2028-06-03", /गायत्री जयंती/));
  assert.equal(has("2028-06-04", /राम-लक्ष्मण द्वादशी/).hinduTithi, "ज्येष्ठ शुक्ल द्वादशी");
  assert.equal((has("2028-06-24", /जगन्नाथ रथयात्रा/).title.match(/जगन्नाथ रथयात्रा/g)||[]).length, 1);
  assert.ok(has("2028-06-06", /वट पूर्णिमा व्रत/));
  assert.ok(has("2028-06-07", /बटुक भैरव जयंती/));
  assert.equal(events.filter(event => event.date === "2028-06-10" && /संकष्टी/.test(event.title || "")).length, 1);
  assert.equal(events.filter(event => event.date === "2028-06-11" && /संकष्टी/.test(event.title || "")).length, 0);
  assert.ok(has("2028-06-24", /जगन्नाथ रथयात्रा/).hinduTithi.includes("द्वितीया"));

  assert.ok(has("2028-07-16", /कर्क संक्रांति/));
  assert.equal(has("2028-07-24", /हरियाली तीज/).hinduTithi, "श्रावण शुक्ल तृतीया");
  assert.equal(has("2028-07-26", /नाग पंचमी/).hinduTithi, "श्रावण शुक्ल पंचमी");

  assert.ok(has("2028-08-04", /वरलक्ष्मी व्रत/));
  assert.ok(has("2028-08-10", /नाग पंचमी/));
  assert.ok(has("2028-08-11", /हलषष्ठी/));
  assert.ok(has("2028-08-12", /शीतला सप्तमी/));
  assert.ok(has("2028-08-14", /दही हांडी/));
  assert.equal(has("2028-08-17", /कृष्ण दामोदर द्वादशी/).hinduTithi, "भाद्रपद कृष्ण द्वादशी");
  assert.ok(has("2028-08-26", /ललिता सप्तमी/));
  assert.ok(has("2028-08-05", /गायत्री जयंती/));
  assert.ok(has("2028-08-13", /मासिक कालाष्टमी/));
  assert.equal(has("2028-08-25", /बलराम जयंती/).hinduTithi, "भाद्रपद शुक्ल षष्ठी");
  assert.equal(has("2028-08-27", /राधाष्टमी/).hinduTithi, "भाद्रपद शुक्ल अष्टमी");

  assert.equal(has("2028-09-02", /अनंत चतुर्दशी/).hinduTithi, "भाद्रपद शुक्ल चतुर्दशी");
  assert.ok(has("2028-09-24", /दुर्गा पूजा/));
  assert.ok(has("2028-09-16", /शनि प्रदोष व्रत/));
  assert.equal(has("2028-09-17", /कलियुगादि/).hinduTithi, "आश्विन कृष्ण त्रयोदशी");
  assert.equal(events.filter(event => /कलियुगादि/.test(event.title || "")).length, 1);
  assert.equal(has("2028-09-12", /जीवित्पुत्रिका व्रत/).hinduTithi, "आश्विन कृष्ण अष्टमी");
  assert.ok(has("2028-09-25", /सरस्वती आवाहन/));
  assert.ok(has("2028-09-26", /सरस्वती पूजा/));

  assert.equal(has("2028-10-15", /गोवत्स द्वादशी/).hinduTithi, "कार्तिक कृष्ण द्वादशी");
  assert.ok(has("2028-10-15", /धनतेरस.*यम दीपदान.*प्रदोष|प्रदोष.*धनतेरस/));
  assert.ok(has("2028-10-02", /कोजागरा पूजा/));
  assert.ok(has("2028-10-03", /वाल्मीकि जयंती.*मीराबाई जयंती/));
  assert.ok(has("2028-10-16", /हनुमान पूजा/));
  assert.match(has("2028-10-17", /नरक चतुर्दशी/).description, /तमिल दीपावली/);
  assert.ok(has("2028-10-16", /काली चौदस.*शिवरात्रि|शिवरात्रि.*काली चौदस/));
  assert.ok(has("2028-10-19", /भैया दूज.*चन्द्र दर्शन|चन्द्र दर्शन.*भैया दूज/));
  assert.ok(has("2028-10-23", /छठ पूजा.*स्कन्द षष्ठी|स्कन्द षष्ठी.*छठ पूजा/));
  assert.equal(has("2028-10-31", /वैकुण्ठ चतुर्दशी/).hinduTithi, "कार्तिक शुक्ल चतुर्दशी");

  assert.ok(has("2028-11-16", /वृश्चिक संक्रांति/));
  assert.equal(has("2028-11-21", /विवाह पंचमी/).hinduTithi, "मार्गशीर्ष शुक्ल पंचमी");
  assert.ok(has("2028-11-27", /मोक्षदा एकादशी.*गीता जयंती|गीता जयंती.*मोक्षदा एकादशी/));
  assert.equal(has("2028-11-13", /कृष्ण योगेश्वर द्वादशी/).hinduTithi, "मार्गशीर्ष कृष्ण द्वादशी");
  assert.equal(has("2028-11-28", /मत्स्य द्वादशी/).hinduTithi, "मार्गशीर्ष शुक्ल द्वादशी");
  assert.ok(has("2028-12-01", /दत्तात्रेय जयंती/));
  assert.ok(has("2028-12-27", /टेलंग स्वामी जयंती/));
});
