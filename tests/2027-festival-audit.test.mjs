import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const month = number => JSON.parse(readFileSync(join(folder, "2027-" + String(number).padStart(2,"0") + ".json"), "utf8"));
const year = Array.from({length:12}, (_,i) => month(i+1));
const events = year.flatMap(data => data.events);
const find = (m, date, pattern) => month(m).events.find(event => event.date === date && pattern.test(event.title || ""));

test("2027 festival catalog excludes Vaishnava/Gauna Ekadashi cards", () => {
  const excluded = events.filter(event =>
    event.category === "एकादशी" && /(गौण|वैष्णव)/.test(event.title || ""));
  assert.deepEqual(excluded, []);
});

test("2027 has one card per same-date Hindu tithi", () => {
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    assert.ok(!seen.has(key),
      "Duplicate same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
    seen.set(key, event.title);
  }
});

test("2027 same-tithi festival cards retain their combined observances", () => {
  assert.match(find(2,"2027-02-14",/भीष्माष्टमी/).title, /मासिक दुर्गाष्टमी/);
  assert.match(find(4,"2027-04-07",/नवसंवत्सर/).title, /गुड़ी पड़वा/);
  assert.match(find(5,"2027-05-09",/अक्षय तृतीया/).title, /त्रेतायुगादि/);
  assert.match(find(6,"2027-06-04",/वट सावित्री/).title, /शनि जयंती/);
  assert.match(find(8,"2027-08-17",/रक्षाबंधन/).title, /गायत्री जयंती/);
  assert.match(find(9,"2027-09-08",/राधाष्टमी/).title, /मासिक दुर्गाष्टमी/);
  assert.match(find(10,"2027-10-05",/दुर्गा पूजा/).title, /मासिक स्कन्द षष्ठी/);
  assert.match(find(10,"2027-10-27",/धनतेरस/).title, /प्रदोष व्रत/);
  assert.match(find(10,"2027-10-27",/काली चौदस/).title, /मासिक शिवरात्रि/);
  assert.match(find(11,"2027-11-04",/छठ पूजा/).title, /मासिक स्कन्द षष्ठी/);
  assert.match(find(12,"2027-12-13",/दत्तात्रेय जयंती/).title, /त्रिपुरभैरवी/);
});

test("Pithoragarh-visible 2027 eclipses have local contact timings", () => {
  const lunar = find(2,"2027-02-21",/उपच्छाया चंद्रग्रहण/);
  assert.ok(lunar);
  assert.equal(lunar.hinduTithi,"माघ शुक्ल पूर्णिमा");
  assert.match(lunar.description,/02:42 से 06:43/);
  assert.match(lunar.sourceUrl,/timeanddate\.com\/eclipse\/in\/india\/pithoragarh/);

  const solar = find(8,"2027-08-02",/आंशिक सूर्यग्रहण/);
  assert.ok(solar);
  assert.match(solar.title,/सोमवती अमावस्या/);
  assert.equal(solar.hinduTithi,"श्रावण कृष्ण अमावस्या");
  assert.match(solar.description,/16:01 से 16:56/);
  assert.match(solar.description,/16:29/);
});

test("2027 combined cards retain their special muhurta rules", () => {
  assert.equal(find(10,"2027-10-27",/धनतेरस/).muhurtaRule,"dhanteras-muhurta");
  assert.equal(find(10,"2027-10-27",/काली चौदस/).muhurtaRule,"masik-shivaratri-nishita");
  assert.equal(find(11,"2027-11-04",/छठ पूजा/).muhurtaRule,"chhath-arghya");
});

test("2027 regional and Kartik observances use their correct tithi dates", () => {
  const devDiwali = find(11,"2027-11-13",/देव दीपावली/);
  const kartikPurnima = find(11,"2027-11-14",/कार्तिक पूर्णिमा/);
  assert.ok(devDiwali);
  assert.equal(devDiwali.muhurtaRule,"dev-deepawali-pradosh");
  assert.equal(devDiwali.hinduTithi,"कार्तिक शुक्ल पूर्णिमा");
  assert.ok(kartikPurnima);
  assert.equal(kartikPurnima.muhurtaRule,undefined);
  assert.match(find(11,"2027-11-06",/गोपाष्टमी/).title,/मासिक दुर्गाष्टमी/);
  assert.ok(find(11,"2027-11-12",/वैकुण्ठ चतुर्दशी/));
  assert.ok(find(11,"2027-11-28",/मार्गशीर्ष अमावस्या/));
  assert.match(find(12,"2027-12-13",/अन्नपूर्णा सिद्धविद्या/).title,/दत्तात्रेय जयंती/);
  assert.match(find(5,"2027-05-20",/बुद्ध पूर्णिमा/).title,/वैशाख पूर्णिमा/);
});

test("2027 Gayatri Jayanti card has only relevant article links", () => {
  const event = find(8,"2027-08-17",/गायत्री जयंती/);
  assert.ok(event);
  assert.match(event.description,/About-Goddess-Gayatri-On-Gayatri-Jayanti/);
  assert.doesNotMatch(event.description,/About-Ekadashi-Vrat/);
});

test("2027 festival descriptions do not repeat the same article URL", () => {
  for (const event of events) {
    const urls = [...String(event.description || "").matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)]
      .map(match => match[1].replace(/^http:/i,"https:").replace(/\?m=1$/i,"").toLowerCase());
    assert.equal(urls.length,new Set(urls).size,
      String(event.date) + ": duplicate article link in " + event.title);
  }
});

test("2027 January retains Amavasya, regional Lohri, Kurma Dwadashi and monthly Krishna Janmashtami", () => {
  const amavasya = find(1,"2027-01-07",/पौष अमावस्या/);
  assert.ok(amavasya);
  assert.equal(amavasya.hinduTithi,"पौष कृष्ण अमावस्या");
  const lohri = find(1,"2027-01-14",/लोहड़ी/);
  assert.ok(lohri);
  const kurma = find(1,"2027-01-19",/कूर्म द्वादशी/);
  assert.ok(kurma);
  assert.equal(kurma.hinduTithi,"पौष शुक्ल द्वादशी");
  const kalashtami = find(1,"2027-01-29",/मासिक कालाष्टमी/);
  assert.match(kalashtami.title,/मासिक कृष्ण जन्माष्टमी/);
});

test("2027 February preserves Shabari Jayanti, Nishita Masik Krishna Janmashtami and Janaki Jayanti", () => {
  const shabari = find(2,"2027-02-27",/शबरी जयंती/);
  assert.ok(shabari);
  assert.equal(shabari.hinduTithi,"फाल्गुन कृष्ण सप्तमी");
  const masikJanmashtami = find(2,"2027-02-27",/मासिक कृष्ण जन्माष्टमी/);
  assert.ok(masikJanmashtami);
  assert.equal(masikJanmashtami.hinduTithi,"फाल्गुन कृष्ण अष्टमी");
  const janaki = find(2,"2027-02-28",/जानकी जयंती/);
  assert.ok(janaki);
  assert.match(janaki.title,/मासिक कालाष्टमी/);
  assert.equal(janaki.hinduTithi,"फाल्गुन कृष्ण अष्टमी");
});

test("2027 January includes verified regional and seasonal observances", () => {
  const jan = month(1);
  const checks = [
    ["2027-01-04", /कृष्ण मत्स्य द्वादशी/, "पौष कृष्ण द्वादशी"],
    ["2027-01-07", /पौष अमावस्या \/ तमिल हनुमान जयंती/, "पौष कृष्ण अमावस्या"],
    ["2027-01-12", /स्वामी विवेकानन्द जयंती/, undefined],
    ["2027-01-14", /लोहड़ी \/ भोगी पंडिगाई/, "पौष शुक्ल षष्ठी"],
    ["2027-01-15", /मकर संक्रांति.*पोंगल.*उत्तरायण/, undefined],
    ["2027-01-16", /मासिक दुर्गाष्टमी.*बनाडा अष्टमी.*मट्टू पोंगल/, "पौष शुक्ल अष्टमी"],
    ["2027-01-17", /कानुम पोंगल \/ मुक्कनुमा/, "पौष शुक्ल नवमी"],
    ["2027-01-18", /पौष पुत्रदा एकादशी.*धर्म सावर्णि मन्वादि.*मासिक कार्तिगाई/, "पौष शुक्ल एकादशी"],
    ["2027-01-19", /कूर्म द्वादशी/, "पौष शुक्ल द्वादशी"],
    ["2027-01-22", /पौष पूर्णिमा.*थाई पूसम.*रामलला प्रतिष्ठा दिवस/, "पौष शुक्ल पूर्णिमा"],
    ["2027-01-23", /माघ मासारंभ/, "माघ कृष्ण प्रतिपदा"],
    ["2027-01-29", /मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी/, "माघ कृष्ण अष्टमी"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = jan.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  const seen = new Set();
  for (const event of jan.events) {
    if (!event.hinduTithi) continue;
    const key = event.date + "|" + event.hinduTithi;
    assert.ok(!seen.has(key), "Duplicate same-date/tithi card: " + key);
    seen.add(key);
  }
  assert.equal(jan.events.some(item => /गौण|वैष्णव/.test(item.title || "")), false);
});

test("2027 February retains Narmada Jayanti, Brahma Savarni Manvadi and Masi Magam", () => {
  const feb = month(2);
  const ratha = find(2, "2027-02-13", /रथ सप्तमी/);
  assert.ok(ratha);
  assert.match(ratha.title, /नर्मदा जयंती/);
  assert.match(ratha.title, /ब्रह्म सावर्णि मन्वादि/);
  assert.equal(ratha.hinduTithi, "माघ शुक्ल सप्तमी");
  assert.equal(ratha.reviewStatus, "approved");
  assert.ok(ratha.sourceUrl);
  const purnima = find(2, "2027-02-20", /माघ पूर्णिमा/);
  assert.ok(purnima);
  assert.match(purnima.title, /ललिता जयंती/);
  assert.match(purnima.title, /मासी मागम/);
  assert.equal(purnima.hinduTithi, "माघ शुक्ल पूर्णिमा");
  assert.equal(purnima.reviewStatus, "approved");
  assert.ok(purnima.sourceUrl);
  assert.equal(feb.events.some(event => /गौण|वैष्णव/.test(event.title || "")), false);
});

test("2027 February retains Narmada Jayanti, Brahma Savarni Manvadi and Masi Magam", () => {
  const feb = month(2);
  const ratha = find(2, "2027-02-13", /रथ सप्तमी/);
  assert.ok(ratha);
  assert.match(ratha.title, /नर्मदा जयंती/);
  assert.match(ratha.title, /ब्रह्म सावर्णि मन्वादि/);
  assert.equal(ratha.hinduTithi, "माघ शुक्ल सप्तमी");
  assert.equal(ratha.reviewStatus, "approved");
  assert.ok(ratha.sourceUrl);
  const purnima = find(2, "2027-02-20", /माघ पूर्णिमा/);
  assert.ok(purnima);
  assert.match(purnima.title, /ललिता जयंती/);
  assert.match(purnima.title, /मासी मागम/);
  assert.equal(purnima.hinduTithi, "माघ शुक्ल पूर्णिमा");
  assert.equal(purnima.reviewStatus, "approved");
  assert.ok(purnima.sourceUrl);
  assert.equal(feb.events.some(event => /गौण|वैष्णव/.test(event.title || "")), false);
});
