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

test("2027 independent same-date observances remain separate cards", () => {
  const allowed = new Map([
    ["2027-10-27|कार्तिक कृष्ण त्रयोदशी", new Set(["धनतेरस", "धन्वन्तरि जयंती", "बुध प्रदोष व्रत", "यम दीपदान", "यम पंचक प्रारम्भ"])],
    ["2027-10-27|कार्तिक कृष्ण चतुर्दशी", new Set(["काली चौदस", "मासिक शिवरात्रि", "हनुमान पूजा"])],
    ["2027-10-29|कार्तिक कृष्ण अमावस्या", new Set(["दीपावली / लक्ष्मी-गणेश पूजन", "श्री कमला महाविद्या जयंती", "केदार गौरी व्रत"])],
    ["2027-01-15|undefined", new Set(["मकर संक्रांति / उत्तरायण","पोंगल"])],
    ["2027-01-16|पौष शुक्ल अष्टमी", new Set(["मासिक दुर्गाष्टमी","बनाडा अष्टमी"])],
    ["2027-01-18|पौष शुक्ल एकादशी", new Set(["पौष पुत्रदा एकादशी","धर्म सावर्णि मन्वादि"])],
    ["2027-01-22|पौष शुक्ल पूर्णिमा", new Set(["पौष पूर्णिमा","शाकंभरी माता जयंती","श्रीरामलला प्राण-प्रतिष्ठा दिवस"])],
    ["2027-02-08|माघ शुक्ल द्वितीया", new Set(["चन्द्र दर्शन","माघ गुप्त नवरात्र द्वितीय — माँ ब्रह्मचारिणी"])],
    ["2027-02-10|माघ शुक्ल चतुर्थी", new Set(["गौरी गणेश चतुर्थी / गणेश जयंती","माघ गुप्त नवरात्र चतुर्थ — माँ कूष्माण्डा"])],
    ["2027-02-11|माघ शुक्ल पंचमी", new Set(["वसंत पंचमी / श्री पंचमी / सरस्वती सिद्धविद्या जयंती","माघ गुप्त नवरात्र पंचमी — माँ स्कन्दमाता"])],
    ["2027-02-12|माघ शुक्ल षष्ठी", new Set(["मासिक स्कन्द षष्ठी","माघ गुप्त नवरात्र षष्ठी — माँ कात्यायनी"])],
    ["2027-02-13|माघ शुक्ल सप्तमी", new Set(["रथ सप्तमी","नर्मदा जयंती","ब्रह्म सावर्णि मन्वादि","माघ गुप्त नवरात्र सप्तमी — माँ कालरात्रि"])],
    ["2027-02-14|माघ शुक्ल अष्टमी", new Set(["मासिक दुर्गाष्टमी","भीष्माष्टमी एवं भीष्म तर्पण","माघ गुप्त नवरात्र अष्टमी — माँ महागौरी"])],
    ["2027-02-20|माघ शुक्ल पूर्णिमा", new Set(["माघ पूर्णिमा","ललिता जयंती — षोडशी महाविद्या"])],
    ["2027-02-28|फाल्गुन कृष्ण अष्टमी", new Set(["मासिक कालाष्टमी","जानकी जयंती"])],
    ["2027-03-07|फाल्गुन कृष्ण अमावस्या", new Set(["द्वापरादि तिथि (द्वापरयुग का आरंभ)","दर्श अमावस्या"])],
    ["2027-03-22|फाल्गुन शुक्ल पूर्णिमा", new Set(["होली / फाल्गुन पूर्णिमा","दोल पूर्णिमा","सावर्णि मन्वादि","श्री महालक्ष्मी जयंती"])],
    ["2027-04-07|चैत्र शुक्ल प्रतिपदा", new Set(["हिंदू नवसंवत्सर २०८४","चैत्र नवरात्र प्रारंभ / घटस्थापना","उगादी","गुड़ी पड़वा"])],
    ["2027-04-08|चैत्र शुक्ल द्वितीया", new Set(["चन्द्र दर्शन","झूलेलाल जयंती","चैत्र नवरात्र द्वितीय — माँ ब्रह्मचारिणी"])],
    ["2027-04-09|चैत्र शुक्ल तृतीया", new Set(["गणगौर / गौरी पूजा","मत्स्य-अवतार जयंती","स्वायम्भुव मन्वादि","चैत्र नवरात्र तृतीय — माँ चन्द्रघंटा"])],
    ["2027-04-10|चैत्र शुक्ल चतुर्थी", new Set(["वासुदेव चतुर्थी","चैत्र नवरात्र चतुर्थ — माँ कूष्माण्डा"])],
    ["2027-04-11|चैत्र शुक्ल पंचमी", new Set(["चैत्र नवरात्र पंचमी — माँ स्कन्दमाता","लक्ष्मी पंचमी"])],
    ["2027-04-12|चैत्र शुक्ल षष्ठी", new Set(["यमुना छठ","मासिक स्कन्द षष्ठी","चैत्र नवरात्र षष्ठी — माँ कात्यायनी"])],
    ["2027-04-14|चैत्र शुक्ल अष्टमी / नवमी व्याप्ति", new Set(["मासिक दुर्गाष्टमी","चैत्र नवरात्र महाष्टमी — माँ महागौरी","अशोकाष्टमी व्रत","तारा महाविद्या जयंती"])],
    ["2027-04-15|चैत्र शुक्ल नवमी", new Set(["राम नवमी","चैत्र नवरात्र नवमी — माँ सिद्धिदात्री"])],
    ["2027-04-17|चैत्र शुक्ल द्वादशी", new Set(["वामन द्वादशी","त्रिशूर पूरम"])],
    ["2027-04-20|चैत्र शुक्ल पूर्णिमा", new Set(["श्री हनुमान जयंती","चैत्र पूर्णिमा / चित्रा पूर्णिमा","स्वरोचिष मन्वादि"]) ]
  ]);
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    if (seen.has(key)) {
      const group = allowed.get(key);
      assert.ok(group && group.has(seen.get(key)) && group.has(event.title),
        "Unexpected same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
    }
    seen.set(key, event.title);
  }
});

test("2027 same-tithi observances retain their reviewed coverage", () => {
  assert.equal(find(2,"2027-02-14",/भीष्माष्टमी/).title, "भीष्माष्टमी एवं भीष्म तर्पण");
  assert.equal(find(4,"2027-04-07",/नवसंवत्सर/).title, "हिंदू नवसंवत्सर २०८४");
  assert.ok(find(4,"2027-04-07",/^उगादी$/));
  assert.ok(find(4,"2027-04-07",/^गुड़ी पड़वा$/));
  assert.ok(find(4,"2027-04-07",/चैत्र नवरात्र प्रारंभ/));
  assert.match(find(5,"2027-05-09",/अक्षय तृतीया/).title, /त्रेतायुगादि/);
  assert.match(find(6,"2027-06-04",/वट सावित्री/).title, /शनि जयंती/);
  assert.match(find(8,"2027-08-17",/रक्षाबंधन/).title, /गायत्री जयंती/);
  assert.match(find(9,"2027-09-08",/राधाष्टमी/).title, /मासिक दुर्गाष्टमी/);
  assert.match(find(10,"2027-10-05",/दुर्गा पूजा/).title, /मासिक स्कन्द षष्ठी/);
  assert.equal(find(10,"2027-10-27",/धनतेरस/).title, "धनतेरस");
  assert.ok(find(10,"2027-10-27",/बुध प्रदोष व्रत/));
  assert.ok(find(10,"2027-10-27",/यम दीपदान/));
  assert.equal(find(10,"2027-10-27",/काली चौदस/).title, "काली चौदस");
  assert.equal(find(10,"2027-10-27",/मासिक शिवरात्रि/).title, "मासिक शिवरात्रि");
  assert.equal(find(10,"2027-10-27",/धनतेरस/).title, "धनतेरस");
  assert.equal(find(10,"2027-10-27",/धन्वन्तरि जयंती/).title, "धन्वन्तरि जयंती");
  assert.equal(find(10,"2027-10-27",/बुध प्रदोष व्रत/).muhurtaRule, "pradosh-kala");
  assert.equal(find(10,"2027-10-27",/यम दीपदान/).muhurtaRule, "pradosh-kala");
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
  assert.equal(find(10,"2027-10-27",/मासिक शिवरात्रि/).muhurtaRule,"masik-shivaratri-nishita");
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
  const masikJanmashtami = find(2,"2027-02-27",/मासिक कृष्ण जन्माष्टमी/);
  assert.ok(masikJanmashtami);
  assert.equal(masikJanmashtami.hinduTithi,"फाल्गुन कृष्ण अष्टमी");
  const janaki = find(2,"2027-02-28",/^जानकी जयंती$/);
  assert.ok(janaki);
  assert.equal(janaki.hinduTithi,"फाल्गुन कृष्ण अष्टमी");
});


test("2027 January includes verified regional and seasonal observances", () => {
  const jan = month(1);
  const checks = [
    ["2027-01-04", /कृष्ण मत्स्य द्वादशी/, "पौष कृष्ण द्वादशी"],
    ["2027-01-07", /पौष अमावस्या/, "पौष कृष्ण अमावस्या"],
    ["2027-01-14", /लोहड़ी/, "पौष शुक्ल षष्ठी"],
    ["2027-01-15", /मकर संक्रांति.*पोंगल.*उत्तरायण/, undefined],
    ["2027-01-16", /^मासिक दुर्गाष्टमी$/, "पौष शुक्ल अष्टमी"],
    ["2027-01-18", /पौष पुत्रदा एकादशी.*धर्म सावर्णि मन्वादि/, "पौष शुक्ल एकादशी"],
    ["2027-01-19", /कूर्म द्वादशी/, "पौष शुक्ल द्वादशी"],
    ["2027-01-22", /पौष पूर्णिमा.*रामलला प्रतिष्ठा दिवस/, "पौष शुक्ल पूर्णिमा"],
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

test("2027 February retains Narmada Jayanti, Brahma Savarni Manvadi and Lalita Jayanti", () => {
  const feb = month(2);
  const ratha = find(2, "2027-02-13", /रथ सप्तमी/);
  assert.ok(ratha);
  assert.equal(ratha.title, "रथ सप्तमी");
  assert.ok(find(2, "2027-02-13", /^नर्मदा जयंती$/));
  assert.ok(find(2, "2027-02-13", /^ब्रह्म सावर्णि मन्वादि$/));
  assert.equal(ratha.hinduTithi, "माघ शुक्ल सप्तमी");
  assert.equal(ratha.reviewStatus, "approved");
  assert.ok(ratha.sourceUrl);
  const purnima = find(2, "2027-02-20", /माघ पूर्णिमा/);
  assert.ok(purnima);
  assert.equal(purnima.title, "माघ पूर्णिमा");
  assert.ok(find(2, "2027-02-20", /^ललिता जयंती — षोडशी महाविद्या$/));
  assert.equal(purnima.hinduTithi, "माघ शुक्ल पूर्णिमा");
  assert.equal(purnima.reviewStatus, "approved");
  assert.ok(purnima.sourceUrl);
  assert.equal(feb.events.some(event => /गौण|वैष्णव/.test(event.title || "")), false);
});

test("2027 March retains key regional, tithi and seasonal observances", () => {
  const march = month(3);
  const checks = [
    ["2027-03-05", /कृष्ण भीष्म द्वादशी/, "फाल्गुन कृष्ण द्वादशी"],
    ["2027-03-07", /दर्श अमावस्या/, "फाल्गुन कृष्ण अमावस्या"],
    ["2027-03-10", /^फुलेरा दूज$/, "फाल्गुन शुक्ल द्वितीया"],
    ["2027-03-13", /मासिक स्कन्द षष्ठी/, "फाल्गुन शुक्ल षष्ठी"],
    ["2027-03-15", /मीन संक्रांति/, undefined],
    ["2027-03-19", /नृसिंह द्वादशी/, "फाल्गुन शुक्ल द्वादशी"],
    ["2027-03-20", /शनि त्रयोदशी \/ शनि प्रदोष व्रत/, "फाल्गुन शुक्ल पक्ष त्रयोदशी"],
    ["2027-03-21", /छोटी होली \/ होलिका दहन/, "फाल्गुन शुक्ल पूर्णिमा"],
    ["2027-03-22", /^होली \/ फाल्गुन पूर्णिमा$/, "फाल्गुन शुक्ल पूर्णिमा"],
    ["2027-03-23", /चैत्र मासारंभ/, "चैत्र कृष्ण प्रतिपदा"],
    ["2027-03-24", /भाई दूज \/ भ्रातृ द्वितीया/, "चैत्र कृष्ण द्वितीया"],
    ["2027-03-27", /रंग पंचमी/, "चैत्र कृष्ण पंचमी"],
    ["2027-03-28", /शीतला सप्तमी/, "चैत्र कृष्ण सप्तमी"],
    ["2027-03-29", /मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी/, "चैत्र कृष्ण सप्तमी (अष्टमी व्याप्ति)"],
    ["2027-03-30", /शीतला अष्टमी \/ बसोड़ा/, "चैत्र कृष्ण अष्टमी"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = march.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  const seen = new Set();
  for (const event of march.events) {
    if (!event.hinduTithi) continue;
    const key = event.date + "|" + event.hinduTithi;
    assert.ok(!seen.has(key), "Duplicate same-date/tithi card: " + key);
    seen.add(key);
  }
});

test("2027 April includes verified regional new years and major observances", () => {
  const april = month(4);
  const checks = [
    ["2027-04-02", /कृष्ण नृसिंह द्वादशी/, "चैत्र कृष्ण द्वादशी"],
    ["2027-04-06", /चैत्र अमावस्या \/ दर्श अमावस्या/, "चैत्र कृष्ण अमावस्या"],
    ["2027-04-08", /झूलेलाल जयंती/, "चैत्र शुक्ल द्वितीया"],
    ["2027-04-09", /^गणगौर \/ गौरी पूजा$/, "चैत्र शुक्ल तृतीया"],
    ["2027-04-09", /^मत्स्य-अवतार जयंती$/, "चैत्र शुक्ल तृतीया"],
    ["2027-04-14", /मेष संक्रांति.*बैसाखी.*बोहाग बिहू.*सौर नववर्ष/, undefined],
    ["2027-04-14", /अशोकाष्टमी व्रत/, "चैत्र शुक्ल अष्टमी / नवमी व्याप्ति"],
    ["2027-04-15", /^विषु कणि$/, undefined],
    ["2027-04-15", /^पोहेला बोइशाख$/, undefined],
    ["2027-04-17", /^वामन द्वादशी$/, "चैत्र शुक्ल द्वादशी"],
    ["2027-04-17", /^त्रिशूर पूरम$/, "चैत्र शुक्ल द्वादशी"],
    ["2027-04-18", /रवि प्रदोष व्रत/, "चैत्र शुक्ल पक्ष त्रयोदशी"],
    ["2027-04-20", /^श्री हनुमान जयंती$/, "चैत्र शुक्ल पूर्णिमा"],
    ["2027-04-21", /वैशाख मासारंभ/, "वैशाख कृष्ण प्रतिपदा"],
    ["2027-04-28", /मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी/, "वैशाख कृष्ण सप्तमी (अष्टमी व्याप्ति)"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = april.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  const seen = new Set();
  for (const event of april.events) {
    if (!event.hinduTithi) continue;
    const key = event.date + "|" + event.hinduTithi;
    assert.ok(!seen.has(key), "Duplicate same-date/tithi card: " + key);
    seen.add(key);
  }
  assert.equal(april.events.some(event => /स्वामीनारायण/.test(event.title || "")), false);
});

test("2027 May includes verified acharya, Mahavidya and regional observances", () => {
  const may = month(5);
  const checks = [
    ["2027-05-02", /वरुथिनी एकादशी \/ वल्लभाचार्य जयंती/, "वैशाख कृष्ण एकादशी"],
    ["2027-05-03", /कृष्ण वामन द्वादशी/, "वैशाख कृष्ण द्वादशी"],
    ["2027-05-04", /कुब्जिका जयंती/, "वैशाख कृष्ण त्रयोदशी"],
    ["2027-05-06", /वैशाख अमावस्या \/ दर्श अमावस्या/, "वैशाख कृष्ण अमावस्या"],
    ["2027-05-07", /पराशर ऋषि जयंती/, "वैशाख शुक्ल प्रतिपदा"],
    ["2027-05-10", /आदि शंकराचार्य जयंती.*सूरदास जयंती.*रामानुजाचार्य जयंती/, "वैशाख शुक्ल पंचमी"],
    ["2027-05-16", /परशुराम द्वादशी/, "वैशाख शुक्ल द्वादशी"],
    ["2027-05-20", /चण्डिका जयंती/, "वैशाख शुक्ल पूर्णिमा"],
    ["2027-05-21", /नारद जयंती \/ ज्येष्ठ मासारंभ/, "ज्येष्ठ कृष्ण प्रतिपदा"],
    ["2027-05-28", /मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी/, "ज्येष्ठ कृष्ण सप्तमी (अष्टमी व्याप्ति)"],
    ["2027-05-31", /हनुमान जयंती \(तेलुगु परंपरा\)/, "ज्येष्ठ कृष्ण दशमी"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = may.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  const siddhilakshmi = may.events.find(item => item.date === "2027-05-16" && /मोहिनी एकादशी/.test(item.title || ""));
  assert.ok(siddhilakshmi);
  assert.match(siddhilakshmi.title, /सिद्धिलक्ष्मी जयंती/);
  const seen = new Set();
  for (const event of may.events) {
    if (!event.hinduTithi) continue;
    const key = event.date + "|" + event.hinduTithi;
    assert.ok(!seen.has(key), "Duplicate same-date/tithi card: " + key);
    seen.add(key);
  }
});

test("2027 June includes verified regional and monthly observances", () => {
  const june = month(6);
  const checks = [
    ["2027-06-01", /कृष्ण परशुराम द्वादशी/, "ज्येष्ठ कृष्ण द्वादशी"],
    ["2027-06-03", /मासिक शिवरात्रि/, "ज्येष्ठ कृष्ण चतुर्दशी"],
    ["2027-06-04", /वट सावित्री व्रत.*शनि जयंती.*ज्येष्ठ अमावस्या.*दर्श अमावस्या/, "ज्येष्ठ कृष्ण अमावस्या"],
    ["2027-06-07", /महाराणा प्रताप जयंती/, "ज्येष्ठ शुक्ल तृतीया"],
    ["2027-06-10", /जामाई षष्ठी/, "ज्येष्ठ शुक्ल षष्ठी"],
    ["2027-06-12", /महेश नवमी/, "ज्येष्ठ शुक्ल नवमी"],
    ["2027-06-14", /निर्जला एकादशी \/ गायत्री जयंती/, "ज्येष्ठ शुक्ल एकादशी"],
    ["2027-06-15", /रामलक्ष्मण द्वादशी/, "ज्येष्ठ शुक्ल द्वादशी"],
    ["2027-06-18", /ज्येष्ठ पूर्णिमा.*बटुक भैरवी जयंती.*वैवस्वत मन्वादि/, "ज्येष्ठ शुक्ल पूर्णिमा"],
    ["2027-06-20", /आषाढ़ मासारंभ/, "आषाढ़ कृष्ण प्रतिपदा"],
    ["2027-06-26", /मासिक कृष्ण जन्माष्टमी/, "आषाढ़ कृष्ण अष्टमी"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = june.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  assert.equal(june.events.some(event => /कबीर/.test(event.title || "")), false);
  const seen = new Set();
  for (const event of june.events) {
    if (!event.hinduTithi) continue;
    const key = event.date + "|" + event.hinduTithi;
    assert.ok(!seen.has(key), "Duplicate same-date/tithi card: " + key);
    seen.add(key);
  }
});

test("2027 July includes verified Gupta Navratri, Shravan and regional observances", () => {
  const july = month(7);
  const checks = [
    ["2027-07-01", /कृष्ण रामलक्ष्मण द्वादशी/, "आषाढ़ कृष्ण द्वादशी"],
    ["2027-07-03", /दर्श अमावस्या/, "आषाढ़ कृष्ण अमावस्या"],
    ["2027-07-04", /आषाढ़ अमावस्या \/ आषाढ़ गुप्त नवरात्र प्रारंभ/, "आषाढ़ अमावस्या / शुक्ल प्रतिपदा"],
    ["2027-07-11", /पार्वती जयंती/, "आषाढ़ शुक्ल अष्टमी"],
    ["2027-07-12", /भड़ली नवमी/, "आषाढ़ शुक्ल नवमी"],
    ["2027-07-13", /आषाढ़ दशमी व्रत \/ रैवत मन्वादि/, "आषाढ़ शुक्ल दशमी"],
    ["2027-07-14", /वासुदेव द्वादशी \/ गौरी व्रत प्रारंभ/, "आषाढ़ शुक्ल द्वादशी"],
    ["2027-07-16", /जयापार्वती व्रत प्रारंभ/, "आषाढ़ शुक्ल त्रयोदशी"],
    ["2027-07-17", /कोकिला व्रत \/ नासिक सिंहस्थ कुंभ/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-18", /गुरु पूर्णिमा.*व्यास पूजा.*गौरी व्रत समाप्ति.*दक्षिणामूर्ति जयंती.*चाक्षुष मन्वादि/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-19", /श्रावण मासारंभ \/ प्रथम श्रावण सोमवार व्रत/, "श्रावण कृष्ण प्रतिपदा"],
    ["2027-07-20", /प्रथम मंगला गौरी व्रत/, "श्रावण कृष्ण द्वितीया"],
    ["2027-07-21", /जयापार्वती व्रत समाप्ति/, "श्रावण कृष्ण तृतीया"],
    ["2027-07-26", /मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी.*द्वितीय श्रावण सोमवार व्रत/, "श्रावण कृष्ण सप्तमी (अष्टमी व्याप्ति)"],
    ["2027-07-27", /द्वितीय मंगला गौरी व्रत/, "श्रावण कृष्ण नवमी"],
    ["2027-07-30", /कृष्ण वासुदेव द्वादशी/, "श्रावण कृष्ण द्वादशी"],
    ["2027-07-31", /शनि त्रयोदशी \/ शनि प्रदोष व्रत/, "श्रावण कृष्ण पक्ष त्रयोदशी"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = july.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  const shivaratri = july.events.find(item => item.date === "2027-07-31" && /सावन शिवरात्रि/.test(item.title || ""));
  assert.ok(shivaratri);
  assert.match(shivaratri.title, /मासिक शिवरात्रि/);
  assert.equal(july.events.some(item => /गौण|वैष्णव/.test(item.title || "")), false);
  const seen = new Set();
  for (const event of july.events) {
    if (!event.hinduTithi) continue;
    const key = event.date + "|" + event.hinduTithi;
    assert.ok(!seen.has(key), "Duplicate same-date/tithi card: " + key);
    seen.add(key);
  }
});

test("2027 August includes Vedic, regional, Smarta and seasonal observances", () => {
  const august = month(8);
  const checks = [
    ["2027-08-02", /सोमवती अमावस्या.*हरियाली अमावस्या.*दर्श अमावस्या.*तृतीय श्रावण सोमवार.*आंशिक सूर्यग्रहण/, "श्रावण कृष्ण अमावस्या"],
    ["2027-08-03", /चन्द्र दर्शन.*तृतीय मंगला गौरी व्रत/, "श्रावण शुक्ल प्रतिपदा"],
    ["2027-08-06", /नाग पंचमी \/ यजुर्वेद उपाकर्म/, "श्रावण शुक्ल पंचमी"],
    ["2027-08-07", /कल्कि अवतार जयंती.*गायत्री जपम्/, "श्रावण शुक्ल षष्ठी"],
    ["2027-08-08", /भानु सप्तमी \/ तुलसीदास जयंती/, "श्रावण शुक्ल सप्तमी"],
    ["2027-08-09", /मासिक दुर्गाष्टमी.*चतुर्थ श्रावण सोमवार/, "श्रावण शुक्ल अष्टमी"],
    ["2027-08-10", /चतुर्थ मंगला गौरी व्रत/, "श्रावण शुक्ल दशमी"],
    ["2027-08-13", /वरलक्ष्मी व्रत \/ दामोदर द्वादशी/, "श्रावण शुक्ल द्वादशी"],
    ["2027-08-16", /हयग्रीव जयंती.*ऋग्वेद उपाकर्म.*पंचम श्रावण सोमवार/, "श्रावण शुक्ल पूर्णिमा (अपराह्न व्याप्ति)"],
    ["2027-08-17", /रक्षाबंधन.*नारळी पूर्णिमा.*पंचम मंगला गौरी व्रत.*संस्कृत दिवस/, "श्रावण शुक्ल पूर्णिमा"],
    ["2027-08-17", /सिंह संक्रांति \/ नासिक सिंहस्थ कुंभ समापन/, undefined],
    ["2027-08-18", /भाद्रपद मासारंभ \/ मलयालम नववर्ष/, "भाद्रपद कृष्ण प्रतिपदा"],
    ["2027-08-21", /बहुला चतुर्थी/, "भाद्रपद कृष्ण चतुर्थी"],
    ["2027-08-22", /नाग पंचम/, "भाद्रपद कृष्ण पंचमी"],
    ["2027-08-23", /हल षष्ठी \/ रंधन छठ/, "भाद्रपद कृष्ण षष्ठी"],
    ["2027-08-24", /श्रीकृष्ण जन्माष्टमी \(स्मार्त\).*विन्ध्यवासिनी जयंती.*इन्द्र सावर्णि मन्वादि/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-25", /मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-26", /दही हांडी \/ श्री गोगा नवमी/, "भाद्रपद कृष्ण नवमी"],
    ["2027-08-28", /अजा एकादशी/, "भाद्रपद कृष्ण एकादशी"],
    ["2027-08-31", /पिठोरी अमावस्या.*पोला.*वृषभोत्सव.*दर्श अमावस्या.*दैव सावर्णि मन्वादि/, "भाद्रपद कृष्ण अमावस्या"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = august.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  assert.equal(august.events.some(item => /गौण|वैष्णव/.test(item.title || "")), false);
  const seen = new Set();
  for (const event of august.events) {
    if (!event.hinduTithi) continue;
    const key = event.date + "|" + event.hinduTithi;
    assert.ok(!seen.has(key), "Duplicate same-date/tithi card: " + key);
    seen.add(key);
  }
});


test("2027 September to December includes the verified Shraddha sequence and major regional observances", () => {
  const checks = [
    [9, "2027-09-07", /ललिता सप्तमी/],
    [9, "2027-09-16", /प्रतिपदा श्राद्ध/],
    [9, "2027-09-20", /पंचमी श्राद्ध/],
    [9, "2027-09-23", /जीवित्पुत्रिका व्रत/],
    [9, "2027-09-27", /द्वादशी श्राद्ध/],
    [9, "2027-09-29", /दर्श अमावस्या/],
    [9, "2027-09-30", /घटस्थापना/],
    [10, "2027-10-08", /संधि पूजा/],
    [10, "2027-10-10", /दुर्गा विसर्जन/],
    [10, "2027-10-14", /कोजागरा पूजा/],
    [10, "2027-10-15", /वाल्मीकि जयंती/],
    [10, "2027-10-27", /यम दीपदान/],
    [10, "2027-10-30", /अन्नकूट/],
    [11, "2027-11-10", /देवोत्थानी एकादशी \(स्मार्त\)/],
    [11, "2027-11-17", /मंडल पूजा प्रारंभ/],
    [11, "2027-11-20", /मासिक कृष्ण जन्माष्टमी/],
    [11, "2027-11-24", /कृष्ण योगेश्वर द्वादशी/],
    [12, "2027-12-03", /तेलुगु नाग पंचमी/],
    [12, "2027-12-04", /चम्पा षष्ठी/],
    [12, "2027-12-31", /विघ्नेश्वर चतुर्थी/]
  ];
  for (const [monthNumber, date, title] of checks) {
    const event = find(monthNumber, date, title);
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    assert.ok(event.sourceUrl, date + " source URL");
  }
  const pratipada = find(9, "2027-09-16", /प्रतिपदा श्राद्ध/);
  assert.ok(pratipada.articleUrl);
  assert.ok(pratipada.secondaryArticleUrl);
  for (const monthNumber of [9, 10, 11, 12]) {
    const data = month(monthNumber);
    assert.equal(data.status, "approved");
    const seen = new Map();
    const allowed = new Map([
      ["2027-10-27|कार्तिक कृष्ण त्रयोदशी", new Set(["धनतेरस", "धन्वन्तरि जयंती", "बुध प्रदोष व्रत", "यम दीपदान", "यम पंचक प्रारम्भ"])],
      ["2027-10-27|कार्तिक कृष्ण चतुर्दशी", new Set(["काली चौदस", "मासिक शिवरात्रि", "हनुमान पूजा"])],
      ["2027-10-29|कार्तिक कृष्ण अमावस्या", new Set(["दीपावली / लक्ष्मी-गणेश पूजन", "श्री कमला महाविद्या जयंती", "केदार गौरी व्रत"])]
    ]);
    for (const event of data.events) {
      if (!event.hinduTithi) continue;
      const key = event.date + "|" + event.hinduTithi;
      if (seen.has(key)) {
        const group = allowed.get(key);
        assert.ok(group && group.has(seen.get(key)) && group.has(event.title),
          "Unexpected same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
      }
      seen.set(key, event.title);
    }
  }
});
