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

test("2028 independent same-date observances remain separate cards", () => {
  const required = [
    [1,"2028-01-30",/^गौरी गणेश चतुर्थी/],
    [1,"2028-01-30",/^माघ गुप्त नवरात्र चतुर्थ/],
    [3,"2028-03-27",/^चैत्र नवरात्र प्रारंभ/],
    [3,"2028-03-27",/^चन्द्र दर्शन$/],
    [3,"2028-03-27",/^उगादी$/],
    [3,"2028-03-27",/^गुड़ी पड़वा$/],
    [4,"2028-04-03",/^श्रीराम नवमी$/],
    [4,"2028-04-03",/^चैत्र नवरात्र नवमी/],
    [4,"2028-04-03",/^तारा महाविद्या जयंती$/],
    [5,"2028-05-24",/^वट सावित्री व्रत$/],
    [5,"2028-05-24",/^शनि जयंती$/],
    [6,"2028-06-03",/^निर्जला एकादशी$/],
    [6,"2028-06-03",/^गायत्री जयंती$/],
    [8,"2028-08-13",/^श्रीकृष्ण जन्माष्टमी/],
    [8,"2028-08-13",/^काली महाविद्या जयंती$/],
    [8,"2028-08-13",/^मासिक कालाष्टमी/],
    [9,"2028-09-15",/^द्वादशी श्राद्ध$/],
    [9,"2028-09-15",/^कृष्ण कल्कि द्वादशी$/],
    [10,"2028-10-15",/^धनतेरस$/],
    [10,"2028-10-15",/^धन्वन्तरि जयंती$/],
    [10,"2028-10-15",/^यम दीपदान$/],
    [10,"2028-10-15",/^रवि प्रदोष व्रत$/],
    [11,"2028-11-27",/^मोक्षदा एकादशी$/],
    [11,"2028-11-27",/^गीता जयंती$/],
    [12,"2028-12-01",/^दत्तात्रेय जयंती$/],
    [12,"2028-12-01",/^त्रिपुरभैरवी महाविद्या जयंती$/]
  ];
  for (const [monthNumber,date,title] of required) {
    assert.ok(months[monthNumber - 1].events.some(event => event.date === date && title.test(event.title || "")),
      date + " " + title);
  }
  const exact = new Set();
  for (const event of events) {
    const key = event.date + "|" + event.title;
    assert.ok(!exact.has(key), "Duplicate same-date card: " + key);
    exact.add(key);
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
  assert.equal(putrada.title, "पौष पुत्रदा एकादशी / तैलंग स्वामी जयंती");
  assert.ok(events.some(event => event.date === "2028-01-14" && /लोहड़ी/.test(event.title || "")));
  assert.equal(events.find(event => event.date === "2028-01-09" && /कूर्म द्वादशी/.test(event.title || "")).hinduTithi, "पौष शुक्ल द्वादशी");

  const ratha = events.find(event => event.date === "2028-02-03" && /रथ सप्तमी/.test(event.title || ""));
  assert.equal(ratha.hinduTithi, "माघ शुक्ल सप्तमी");
  const bhishma = events.find(event => event.date === "2028-02-03" && /भीष्माष्टमी/.test(event.title || ""));
  assert.equal(bhishma.hinduTithi, "माघ शुक्ल अष्टमी");
  assert.equal(events.find(event => event.date === "2028-02-07" && /भीष्म द्वादशी/.test(event.title || "")).hinduTithi, "माघ शुक्ल द्वादशी");
  assert.ok(events.some(event => event.date === "2028-02-15" && /यशोदा जयंती/.test(event.title || "")));
  assert.equal(events.some(event => event.date === "2028-02-16" && /शबरी जयंती/.test(event.title || "")), false);
  assert.ok(events.some(event => event.date === "2028-02-17" && /जानकी जयंती/.test(event.title || "")));
  assert.ok(events.some(event => event.date === "2028-02-27" && /^फुलेरा दूज$/.test(event.title || "")));
  assert.ok(events.some(event => event.date === "2028-02-03" && /माघ गुप्त नवरात्र अष्टमी — माँ महागौरी/.test(event.title || "")));

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
  assert.equal(has("2028-05-09", /नारद जयंती/), undefined);
  assert.ok(has("2028-05-24", /^वट सावित्री व्रत$/));
  assert.ok(has("2028-05-24", /^शनि जयंती$/));

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
  assert.ok(has("2028-10-15", /^धनतेरस$/));
  assert.ok(has("2028-10-15", /^धन्वन्तरि जयंती$/));
  assert.ok(has("2028-10-15", /^यम दीपदान$/));
  assert.ok(has("2028-10-15", /^रवि प्रदोष व्रत$/));
  assert.ok(has("2028-10-02", /कोजागरा पूजा/));
  assert.ok(has("2028-10-03", /वाल्मीकि जयंती एवं मीराबाई जयंती/));
  assert.ok(has("2028-10-16", /हनुमान पूजा/));
  assert.doesNotMatch(has("2028-10-17", /नरक चतुर्दशी/).description, /तमिल दीपावली/);
  assert.equal(has("2028-10-16", /^काली चौदस$/).articleUrl, "https://ourhindudharm.blogspot.com/2022/09/Kakaradi-Kali-sahasranam-stotra.html");
  assert.ok(has("2028-10-16", /^मासिक शिवरात्रि$/));
  assert.ok(has("2028-10-17", /^श्री कमला महाविद्या जयंती$/));
  assert.ok(has("2028-10-19", /^भाई दूज \/ यम द्वितीया$/));
  assert.ok(has("2028-10-19", /^चन्द्र दर्शन$/));
  assert.ok(has("2028-10-23", /^छठ पूजा$/));
  assert.ok(has("2028-10-23", /^मासिक स्कन्द षष्ठी$/));
  assert.ok(has("2028-10-22", /लाभ पंचमी/));
  assert.ok(has("2028-10-25", /गोपाष्टमी/));
  assert.ok(has("2028-10-26", /अक्षय नवमी/));
  assert.equal(has("2028-10-31", /वैकुण्ठ चतुर्दशी/).hinduTithi, "कार्तिक शुक्ल चतुर्दशी");

  assert.ok(has("2028-11-16", /वृश्चिक संक्रांति/));
  assert.equal(has("2028-11-21", /विवाह पंचमी/).hinduTithi, "मार्गशीर्ष शुक्ल पंचमी");
  assert.ok(has("2028-11-27", /^मोक्षदा एकादशी$/));
  assert.ok(has("2028-11-27", /^गीता जयंती$/));
  assert.equal(has("2028-11-13", /कृष्ण योगेश्वर द्वादशी/).hinduTithi, "मार्गशीर्ष कृष्ण द्वादशी");
  assert.equal(has("2028-11-28", /मत्स्य द्वादशी/).hinduTithi, "मार्गशीर्ष शुक्ल द्वादशी");
  assert.ok(has("2028-12-01", /दत्तात्रेय जयंती/));
  assert.ok(has("2028-12-01", /अन्नपूर्णा जयंती/));
  assert.equal(has("2028-12-23", /गुरु गोबिन्द सिंह जयंती/), undefined);
  assert.ok(has("2028-01-08", /तैलंग स्वामी जयंती/));
  assert.ok(has("2028-12-27", /तैलंग स्वामी जयंती/));
  assert.ok(has("2028-11-24", /बाबा नीब करौरी जयंती/));
  assert.ok(has("2028-04-29", /आदि शंकराचार्य जयंती एवं सूरदास जयंती/));
  assert.ok(has("2028-07-28", /गोस्वामी तुलसीदास जयंती/));
});


test("2026–2030 calendar excludes non-core Tamil observances and non-religious biographies", () => {
  const years = [2026, 2027, 2028, 2029, 2030];
  const excluded = /स्वामी विवेकानन्द|राष्ट्रीय युवा दिवस|पंगुनी|मासिक कार्तिगाई|कार्तिगाई दीपम|मासी मागम|थाई पूसम|करडैयान|आदि अमावासै|आदि पेरुक्कु|आण्डाल जयंती|वैकासी विसाकम|अष्टमी रोहिणी|तमिल हनुमान जयंती|तमिल दीपावली|भोगी पंडिगाई|भोगी पण्डिगै|मट्टू पोंगल|मट्टु पोंगल|कानुम पोंगल|आर्द्रा दर्शन|आरुद्र दर्शन|थाई अमावासै|मासी मघम|करडैयान नोम्बु|पंगुनी उत्तिरम्|चित्रा पूर्णिमा|वैकासी विशाकम्|आदि अमावस्या \(तमिल\)|सूरसंहारम्/;
  const allowed2029Tamil = new Set(["पोंगल","तमिल नववर्ष (पुथांडु)","कार्तिगै दीपम"]);
  const matches = [];
  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const file = join(folder, year + "-" + String(month).padStart(2, "0") + ".json");
      const data = JSON.parse(readFileSync(file, "utf8"));
      for (const event of data.events || []) {
        const text = [event.title, event.description].filter(Boolean).join(" ");
        if (excluded.test(text) && !(year === 2029 && allowed2029Tamil.has(event.title))) matches.push({ year, month, title: event.title });
      }
    }
  }
  assert.deepEqual(matches, []);

  const year2029 = Array.from({ length: 12 }, (_, month) =>
    JSON.parse(readFileSync(join(folder, "2029-" + String(month + 1).padStart(2, "0") + ".json"), "utf8")))
    .flatMap(data => data.events || []);
  for (const event of year2029) {
    if (/तमिल|पोंगल|कार्तिगै दीपम/.test([event.title, event.category].filter(Boolean).join(" "))) {
      assert.ok(allowed2029Tamil.has(event.title), "Non-top Tamil observance retained: " + event.title);
    }
  }
  const diwali = year2029.find(event => event.date === "2029-11-05" && /दीपावली/.test(event.title || ""));
  assert.match(diwali.title, /केदार गौरी व्रत/);
  assert.equal(year2029.filter(event => /केदार गौरी व्रत/.test(event.title || "")).length, 1);

  const april2027 = JSON.parse(readFileSync(join(folder, "2027-04.json"), "utf8"));
  assert.equal(april2027.events.find(event => event.date === "2027-04-20" && /चैत्र पूर्णिमा/.test(event.title || "")).title, "चैत्र पूर्णिमा");

  const october2027 = JSON.parse(readFileSync(join(folder, "2027-10.json"), "utf8"));
  const diwali2027 = october2027.events.find(event => event.date === "2027-10-29" && /दीपावली/.test(event.title || ""));
  assert.match(diwali2027.title, /केदार गौरी व्रत/);
  assert.equal(october2027.events.filter(event => event.date === "2027-10-29" && /केदार गौरी व्रत/.test(event.title || "")).length, 1);
});


test("2026–2030 approved saint jayantis are retained and excluded public figures stay omitted", () => {
  const expected = [
    [2026,4,"2026-04-21",/आदि शंकराचार्य जयंती एवं सूरदास जयंती/],
    [2026,8,"2026-08-19",/गोस्वामी तुलसीदास जयंती/],
    [2026,10,"2026-10-26",/वाल्मीकि जयंती एवं मीराबाई जयंती/],
    [2026,12,"2026-12-17",/बाबा नीब करौरी जयंती/],
    [2027,1,"2027-01-19",/तैलंग स्वामी जयंती/],
    [2027,5,"2027-05-10",/आदि शंकराचार्य जयंती एवं सूरदास जयंती/],
    [2027,8,"2027-08-08",/गोस्वामी तुलसीदास जयंती/],
    [2027,10,"2027-10-15",/वाल्मीकि जयंती एवं मीराबाई जयंती/],
    [2027,12,"2027-12-06",/बाबा नीब करौरी जयंती/],
    [2028,1,"2028-01-08",/तैलंग स्वामी जयंती/],
    [2028,4,"2028-04-29",/आदि शंकराचार्य जयंती एवं सूरदास जयंती/],
    [2028,7,"2028-07-28",/गोस्वामी तुलसीदास जयंती/],
    [2028,10,"2028-10-03",/वाल्मीकि जयंती एवं मीराबाई जयंती/],
    [2028,11,"2028-11-24",/बाबा नीब करौरी जयंती/],
    [2028,12,"2028-12-27",/तैलंग स्वामी जयंती/],
    [2029,5,"2029-05-18",/आदि शंकराचार्य जयंती एवं सूरदास जयंती/],
    [2029,8,"2029-08-16",/गोस्वामी तुलसीदास जयंती/],
    [2029,10,"2029-10-22",/वाल्मीकि जयंती एवं मीराबाई जयंती/],
    [2029,12,"2029-12-13",/बाबा नीब करौरी जयंती/],
    [2030,1,"2030-01-15",/तैलंग स्वामी जयंती/],
    [2030,5,"2030-05-08",/आदि शंकराचार्य जयंती एवं सूरदास जयंती/],
    [2030,8,"2030-08-06",/गोस्वामी तुलसीदास जयंती/],
    [2030,10,"2030-10-11",/वाल्मीकि जयंती एवं मीराबाई जयंती/],
    [2030,12,"2030-12-02",/बाबा नीब करौरी जयंती/]
  ];
  for (const [year, monthNumber, date, pattern] of expected) {
    const file = join(folder, year + "-" + String(monthNumber).padStart(2, "0") + ".json");
    const data = JSON.parse(readFileSync(file, "utf8"));
    assert.ok(data.events.some(event => event.date === date && pattern.test(event.title || "")), year + " " + date + " " + pattern);
  }
  const excluded = /कबीर जयंती|कबीरदास जयंती|विवेकानंद जयंती|स्वामी विवेकानंद|दयानंद सरस्वती जयंती|गांधी जयंती|प्रभुपाद जयंती/;
  for (let year = 2026; year <= 2030; year++) {
    for (let monthNumber = 1; monthNumber <= 12; monthNumber++) {
      const file = join(folder, year + "-" + String(monthNumber).padStart(2, "0") + ".json");
      const data = JSON.parse(readFileSync(file, "utf8"));
      assert.equal((data.events || []).some(event => excluded.test(event.title || "")), false, year + "-" + monthNumber);
    }
  }
});
