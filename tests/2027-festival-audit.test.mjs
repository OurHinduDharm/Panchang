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
  const required = [
    [1,"2027-01-15",/^मकर संक्रांति \/ उत्तरायण$/],
    [1,"2027-01-15",/^पोंगल$/],
    [4,"2027-04-07",/^हिंदू नवसंवत्सर २०८४$/],
    [4,"2027-04-07",/^उगादी$/],
    [4,"2027-04-07",/^गुड़ी पड़वा$/],
    [4,"2027-04-07",/चैत्र नवरात्र प्रारंभ/],
    [4,"2027-04-09",/^गणगौर \/ गौरी पूजा$/],
    [4,"2027-04-09",/^मत्स्य-अवतार जयंती$/],
    [5,"2027-05-09",/^त्रेतायुगादि तिथि$/],
    [5,"2027-05-09",/^अक्षय तृतीया$/],
    [5,"2027-05-09",/^मातंगी महाविद्या जयंती$/],
    [6,"2027-06-04",/^वट सावित्री व्रत$/],
    [6,"2027-06-04",/^शनि जयंती$/],
    [7,"2027-07-18",/^गुरु पूर्णिमा \/ व्यास पूजा$/],
    [7,"2027-07-18",/^गौरी व्रत समाप्ति$/],
    [8,"2027-08-02",/^आंशिक सूर्यग्रहण$/],
    [8,"2027-08-02",/^तृतीय श्रावण सोमवार व्रत$/],
    [9,"2027-09-12",/^भुवनेश्वरी महाविद्या जयंती$/],
    [9,"2027-09-12",/^वामन जयंती$/],
    [9,"2027-09-12",/^कृष्ण कल्कि द्वादशी$/],
    [10,"2027-10-03",/^कपर्दीश चतुर्थी$/],
    [10,"2027-10-03",/^शारदीय नवरात्र चतुर्थी — माँ कूष्माण्डा$/],
    [10,"2027-10-05",/^मासिक स्कन्द षष्ठी$/],
    [10,"2027-10-05",/^दुर्गा पूजा — षष्ठी$/],
    [10,"2027-10-05",/^बिल्व निमन्त्रण$/],
    [10,"2027-10-05",/^कल्पारम्भ$/],
    [10,"2027-10-05",/^अकाल बोधन$/],
    [10,"2027-10-05",/^शारदीय नवरात्र षष्ठी — माँ कात्यायनी$/],
    [10,"2027-10-07",/^दुर्गाष्टमी \/ महाष्टमी \/ मासिक दुर्गाष्टमी — माँ महागौरी$/],
    [10,"2027-10-07",/^सरस्वती पूजा$/],
    [10,"2027-10-08",/^महानवमी \/ माँ सिद्धिदात्री पूजन$/],
    [10,"2027-10-08",/^संधि पूजा$/],
    [10,"2027-10-09",/^विजयादशमी \/ दशहरा$/],
    [10,"2027-10-09",/^आयुध पूजा$/],
    [10,"2027-10-10",/^दुर्गा विसर्जन$/],
    [10,"2027-10-10",/^मैसूर दशहरा$/],
    [10,"2027-10-22",/^अहोई अष्टमी$/],
    [10,"2027-10-22",/^मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी$/],
    [10,"2027-10-22",/^राधा कुण्ड स्नान$/],
    [10,"2027-10-30",/^गोवर्धन पूजा \/ अन्नकूट$/],
    [10,"2027-10-30",/^बलि प्रतिपदा$/],
    [10,"2027-10-31",/^भाई दूज \/ यम द्वितीया$/],
    [10,"2027-10-31",/^चित्रगुप्त पूजा$/],
    [12,"2027-12-09",/^मोक्षदा एकादशी$/],
    [12,"2027-12-09",/^गीता जयंती$/]
  ];
  for (const [monthNumber,date,title] of required) {
    assert.ok(find(monthNumber,date,title), date + " " + title);
  }
  const exact = new Set();
  for (const event of events) {
    const key = event.date + "|" + event.title;
    assert.ok(!exact.has(key), "Duplicate same-date card: " + key);
    exact.add(key);
  }
});
test("2027 same-tithi observances retain their reviewed coverage", () => {
  assert.equal(find(2,"2027-02-14",/भीष्माष्टमी/).title, "भीष्माष्टमी एवं भीष्म तर्पण");
  assert.equal(find(4,"2027-04-07",/नवसंवत्सर/).title, "हिंदू नवसंवत्सर २०८४");
  assert.ok(find(4,"2027-04-07",/^उगादी$/));
  assert.ok(find(4,"2027-04-07",/^गुड़ी पड़वा$/));
  assert.ok(find(4,"2027-04-07",/चैत्र नवरात्र प्रारंभ/));
  assert.ok(find(5,"2027-05-09",/^त्रेतायुगादि तिथि$/));
  assert.ok(find(6,"2027-06-04",/^शनि जयंती$/));
  assert.ok(find(8,"2027-08-17",/^गायत्री जयंती$/));
  assert.ok(find(10,"2027-10-18",/^वक्रतुण्ड संकष्टी चतुर्थी$/));
  assert.equal(find(9,"2027-09-08",/राधाष्टमी/).title, "राधाष्टमी");
  assert.ok(find(9,"2027-09-08",/^मासिक दुर्गाष्टमी$/));
  assert.ok(find(9,"2027-09-08",/^महालक्ष्मी व्रत आरम्भ$/));
  assert.ok(find(10,"2027-10-05",/^मासिक स्कन्द षष्ठी$/));
  assert.ok(find(10,"2027-10-05",/^दुर्गा पूजा — षष्ठी$/));
  assert.ok(find(10,"2027-10-05",/^बिल्व निमन्त्रण$/));
  assert.ok(find(10,"2027-10-05",/^कल्पारम्भ$/));
  assert.ok(find(10,"2027-10-05",/^अकाल बोधन$/));
  assert.ok(find(10,"2027-10-05",/माँ कात्यायनी/));
  assert.equal(find(10,"2027-10-27",/धनतेरस/).title, "धनतेरस");
  assert.ok(find(10,"2027-10-27",/बुध प्रदोष व्रत/));
  assert.ok(find(10,"2027-10-27",/यम दीपदान/));
  assert.ok(find(10,"2027-10-10",/^मैसूर दशहरा$/));
  assert.ok(!find(10,"2027-10-10",/माध्वाचार्य जयंती/));
  assert.ok(!find(10,"2027-10-18",/^अटला तद्दे$/));
  assert.equal(find(10,"2027-10-27",/काली चौदस/).title, "काली चौदस");
  assert.equal(find(10,"2027-10-27",/मासिक शिवरात्रि/).title, "मासिक शिवरात्रि");
  assert.equal(find(10,"2027-10-27",/धनतेरस/).title, "धनतेरस");
  assert.equal(find(10,"2027-10-27",/धन्वन्तरि जयंती/).title, "धन्वन्तरि जयंती");
  assert.equal(find(10,"2027-10-27",/बुध प्रदोष व्रत/).muhurtaRule, "pradosh-kala");
  assert.equal(find(10,"2027-10-27",/यम दीपदान/).muhurtaRule, "pradosh-kala");
  assert.ok(find(11,"2027-11-04",/^मासिक स्कन्द षष्ठी$/));
  assert.ok(find(12,"2027-12-13",/^त्रिपुरभैरवी महाविद्या जयंती$/));
});

test("Pithoragarh-visible 2027 eclipses have local contact timings", () => {
  const lunar = find(2,"2027-02-21",/उपच्छाया चंद्रग्रहण/);
  assert.ok(lunar);
  assert.equal(lunar.hinduTithi,"माघ शुक्ल पूर्णिमा");
  assert.match(lunar.description,/02:42 से 06:43/);
  assert.match(lunar.sourceUrl,/timeanddate\.com\/eclipse\/in\/india\/pithoragarh/);

  const solar = find(8,"2027-08-02",/आंशिक सूर्यग्रहण/);
  assert.ok(solar);
  assert.equal(solar.title,"आंशिक सूर्यग्रहण");
  assert.ok(find(8,"2027-08-02",/^सोमवती अमावस्या/));
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
  assert.ok(find(11,"2027-11-06",/^मासिक दुर्गाष्टमी$/));
  assert.ok(find(11,"2027-11-12",/वैकुण्ठ चतुर्दशी/));
  assert.ok(find(11,"2027-11-28",/मार्गशीर्ष अमावस्या/));
  assert.ok(find(12,"2027-12-13",/^दत्तात्रेय जयंती$/));
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
    ["2027-01-15", /^मकर संक्रांति \/ उत्तरायण$/, "पौष शुक्ल सप्तमी"],
    ["2027-01-15", /^पोंगल$/, "पौष शुक्ल सप्तमी"],
    ["2027-01-16", /^मासिक दुर्गाष्टमी$/, "पौष शुक्ल अष्टमी"],
    ["2027-01-18", /^पौष पुत्रदा एकादशी$/, "पौष शुक्ल एकादशी"],
    ["2027-01-18", /^धर्म सावर्णि मन्वादि$/, "पौष शुक्ल एकादशी"],
    ["2027-01-19", /कूर्म द्वादशी/, "पौष शुक्ल द्वादशी"],
    ["2027-01-22", /^पौष पूर्णिमा$/, "पौष शुक्ल पूर्णिमा"],
    ["2027-01-22", /^शाकंभरी माता जयंती$/, "पौष शुक्ल पूर्णिमा"],
    ["2027-01-22", /^श्रीरामलला प्राण-प्रतिष्ठा दिवस$/, "पौष शुक्ल पूर्णिमा"],
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
  assert.equal(jan.events.some(item => /गौण|वैष्णव/.test(item.title || "")), false);
  assert.equal(jan.events.some(item => /मकरविलक्कु|माघ बिहू/.test(item.title || "")), false);
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
});

test("2027 April includes verified regional new years and major observances", () => {
  const april = month(4);
  const checks = [
    ["2027-04-02", /कृष्ण नृसिंह द्वादशी/, "चैत्र कृष्ण द्वादशी"],
    ["2027-04-06", /चैत्र अमावस्या \/ दर्श अमावस्या/, "चैत्र कृष्ण अमावस्या"],
    ["2027-04-08", /झूलेलाल जयंती/, "चैत्र शुक्ल द्वितीया"],
    ["2027-04-09", /^गणगौर \/ गौरी पूजा$/, "चैत्र शुक्ल तृतीया"],
    ["2027-04-09", /^मत्स्य-अवतार जयंती$/, "चैत्र शुक्ल तृतीया"],
    ["2027-04-14", /^मेष संक्रांति$/, undefined],
    ["2027-04-14", /^बैसाखी$/, undefined],
    ["2027-04-14", /^बोहाग बिहू \/ रोंगाली बिहू$/, undefined],
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
  assert.equal(april.events.some(event => /स्वामीनारायण/.test(event.title || "")), false);
});

test("2027 May includes verified acharya, Mahavidya and regional observances", () => {
  const may = month(5);
  const checks = [
    ["2027-05-02", /^वरुथिनी एकादशी$/, "वैशाख कृष्ण एकादशी"],
    ["2027-05-03", /कृष्ण वामन द्वादशी/, "वैशाख कृष्ण द्वादशी"],
    ["2027-05-04", /कुब्जिका जयंती/, "वैशाख कृष्ण त्रयोदशी"],
    ["2027-05-06", /वैशाख अमावस्या \/ दर्श अमावस्या/, "वैशाख कृष्ण अमावस्या"],
    ["2027-05-07", /^चन्द्र दर्शन$/, "वैशाख शुक्ल प्रतिपदा"],
    ["2027-05-16", /परशुराम द्वादशी/, "वैशाख शुक्ल द्वादशी"],
    ["2027-05-20", /^बुद्ध पूर्णिमा \/ वैशाख पूर्णिमा$/, "वैशाख शुक्ल पूर्णिमा"],
    ["2027-05-20", /^चण्डिका जयंती$/, "वैशाख शुक्ल पूर्णिमा"],
    ["2027-05-21", /^नारद जयंती$/, "ज्येष्ठ कृष्ण प्रतिपदा"],
    ["2027-05-21", /^ज्येष्ठ मासारंभ \(उत्तर भारत\)$/, "ज्येष्ठ कृष्ण प्रतिपदा"],
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
  assert.equal(siddhilakshmi.title, "मोहिनी एकादशी");
  assert.ok(may.events.find(item => item.date === "2027-05-16" && item.title === "सिद्धिलक्ष्मी जयंती"));
});

test("2027 June includes verified regional and monthly observances", () => {
  const june = month(6);
  const checks = [
    ["2027-06-01", /कृष्ण परशुराम द्वादशी/, "ज्येष्ठ कृष्ण द्वादशी"],
    ["2027-06-03", /मासिक शिवरात्रि/, "ज्येष्ठ कृष्ण चतुर्दशी"],
    ["2027-06-04", /^वट सावित्री व्रत$/, "ज्येष्ठ कृष्ण अमावस्या"],
    ["2027-06-04", /^शनि जयंती$/, "ज्येष्ठ कृष्ण अमावस्या"],
    ["2027-06-10", /जामाई षष्ठी/, "ज्येष्ठ शुक्ल षष्ठी"],
    ["2027-06-12", /महेश नवमी/, "ज्येष्ठ शुक्ल नवमी"],
    ["2027-06-14", /^निर्जला एकादशी$/, "ज्येष्ठ शुक्ल एकादशी"],
    ["2027-06-14", /^गायत्री जयंती$/, "ज्येष्ठ शुक्ल एकादशी"],
    ["2027-06-15", /रामलक्ष्मण द्वादशी/, "ज्येष्ठ शुक्ल द्वादशी"],
    ["2027-06-18", /^ज्येष्ठ पूर्णिमा$/, "ज्येष्ठ शुक्ल पूर्णिमा"],
    ["2027-06-18", /^वट पूर्णिमा व्रत$/, "ज्येष्ठ शुक्ल पूर्णिमा"],
    ["2027-06-18", /^बटुक भैरवी जयंती$/, "ज्येष्ठ शुक्ल पूर्णिमा"],
    ["2027-06-18", /^वैवस्वत मन्वादि$/, "ज्येष्ठ शुक्ल पूर्णिमा"],
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
});

test("2027 July includes verified Gupta Navratri, Shravan and regional observances", () => {
  const july = month(7);
  const checks = [
    ["2027-07-04", /^आषाढ़ अमावस्या$/, "आषाढ़ कृष्ण अमावस्या"],
    ["2027-07-04", /^आषाढ़ गुप्त नवरात्र प्रारंभ — माँ शैलपुत्री$/, "आषाढ़ शुक्ल प्रतिपदा"],
    ["2027-07-05", /^श्रीजगन्नाथ रथयात्रा$/, "आषाढ़ शुक्ल द्वितीया"],
    ["2027-07-05", /^चन्द्र दर्शन$/, "आषाढ़ शुक्ल द्वितीया"],
    ["2027-07-05", /माँ ब्रह्मचारिणी/, "आषाढ़ शुक्ल द्वितीया"],
    ["2027-07-07", /^अनिरुद्ध चतुर्थी$/, "आषाढ़ शुक्ल चतुर्थी"],
    ["2027-07-07", /माँ कूष्माण्डा/, "आषाढ़ शुक्ल चतुर्थी"],
    ["2027-07-08", /^मासिक स्कन्द षष्ठी$/, "आषाढ़ शुक्ल पंचमी / षष्ठी"],
    ["2027-07-08", /माँ स्कन्दमाता/, "आषाढ़ शुक्ल पंचमी / षष्ठी"],
    ["2027-07-11", /^मासिक दुर्गाष्टमी$/, "आषाढ़ शुक्ल अष्टमी"],
    ["2027-07-11", /^पार्वती जयंती$/, "आषाढ़ शुक्ल अष्टमी"],
    ["2027-07-11", /माँ महागौरी/, "आषाढ़ शुक्ल अष्टमी"],
    ["2027-07-12", /^भड़ली नवमी$/, "आषाढ़ शुक्ल नवमी"],
    ["2027-07-12", /माँ सिद्धिदात्री/, "आषाढ़ शुक्ल नवमी"],
    ["2027-07-13", /^आषाढ़ दशमी व्रत$/, "आषाढ़ शुक्ल दशमी"],
    ["2027-07-13", /^रैवत मन्वादि$/, "आषाढ़ शुक्ल दशमी"],
    ["2027-07-14", /^वासुदेव द्वादशी$/, "आषाढ़ शुक्ल द्वादशी"],
    ["2027-07-14", /^गौरी व्रत प्रारंभ$/, "आषाढ़ शुक्ल द्वादशी"],
    ["2027-07-17", /^कोकिला व्रत$/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-17", /^नासिक सिंहस्थ कुंभ$/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-18", /^गुरु पूर्णिमा \/ व्यास पूजा$/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-18", /^गौरी व्रत समाप्ति$/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-18", /^दक्षिणामूर्ति जयंती$/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-18", /^चाक्षुष मन्वादि$/, "आषाढ़ शुक्ल पूर्णिमा"],
    ["2027-07-26", /^मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी$/, "श्रावण कृष्ण सप्तमी (अष्टमी व्याप्ति)"],
    ["2027-07-26", /^द्वितीय श्रावण सोमवार व्रत$/, "श्रावण कृष्ण सप्तमी (अष्टमी व्याप्ति)"],
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
});

test("2027 August includes Vedic, regional, Smarta and seasonal observances", () => {
  const august = month(8);
  const checks = [
    ["2027-08-02", /^सोमवती अमावस्या/, "श्रावण कृष्ण अमावस्या"],
    ["2027-08-02", /^आंशिक सूर्यग्रहण$/, "श्रावण कृष्ण अमावस्या"],
    ["2027-08-02", /^तृतीय श्रावण सोमवार व्रत$/, "श्रावण कृष्ण अमावस्या"],
    ["2027-08-03", /^चन्द्र दर्शन$/, "श्रावण शुक्ल प्रतिपदा"],
    ["2027-08-03", /^तृतीय मंगला गौरी व्रत$/, "श्रावण शुक्ल प्रतिपदा"],
    ["2027-08-06", /^नाग पंचमी$/, "श्रावण शुक्ल पंचमी"],
    ["2027-08-06", /^यजुर्वेद उपाकर्म$/, "श्रावण शुक्ल पंचमी"],
    ["2027-08-07", /^मासिक स्कन्द षष्ठी$/, "श्रावण शुक्ल षष्ठी"],
    ["2027-08-07", /^कल्कि अवतार जयंती$/, "श्रावण शुक्ल षष्ठी"],
    ["2027-08-07", /^गायत्री जपम्$/, "श्रावण शुक्ल षष्ठी"],
    ["2027-08-08", /^भानु सप्तमी$/, "श्रावण शुक्ल सप्तमी"],
    ["2027-08-09", /^मासिक दुर्गाष्टमी$/, "श्रावण शुक्ल अष्टमी"],
    ["2027-08-09", /^चतुर्थ श्रावण सोमवार व्रत$/, "श्रावण शुक्ल अष्टमी"],
    ["2027-08-10", /चतुर्थ मंगला गौरी व्रत/, "श्रावण शुक्ल दशमी"],
    ["2027-08-13", /^वरलक्ष्मी व्रत$/, "श्रावण शुक्ल द्वादशी"],
    ["2027-08-13", /^दामोदर द्वादशी$/, "श्रावण शुक्ल द्वादशी"],
    ["2027-08-16", /^श्री हयग्रीव जयंती$/, "श्रावण शुक्ल पूर्णिमा (अपराह्न व्याप्ति)"],
    ["2027-08-16", /^ऋग्वेद उपाकर्म$/, "श्रावण शुक्ल पूर्णिमा (अपराह्न व्याप्ति)"],
    ["2027-08-16", /^पंचम श्रावण सोमवार व्रत$/, "श्रावण शुक्ल पूर्णिमा (अपराह्न व्याप्ति)"],
    ["2027-08-17", /^रक्षाबंधन \/ श्रावण पूर्णिमा$/, "श्रावण शुक्ल पूर्णिमा"],
    ["2027-08-17", /^गायत्री जयंती$/, "श्रावण शुक्ल पूर्णिमा"],
    ["2027-08-17", /^नारळी पूर्णिमा$/, "श्रावण शुक्ल पूर्णिमा"],
    ["2027-08-17", /^पंचम मंगला गौरी व्रत$/, "श्रावण शुक्ल पूर्णिमा"],
    ["2027-08-17", /^सिंह संक्रांति$/, undefined],
    ["2027-08-17", /^नासिक सिंहस्थ कुंभ समापन$/, undefined],
    ["2027-08-18", /^भाद्रपद मासारंभ \(उत्तर\)$/, "भाद्रपद कृष्ण प्रतिपदा"],
    ["2027-08-18", /^मलयालम नववर्ष \/ चिंगम १$/, "भाद्रपद कृष्ण प्रतिपदा"],
    ["2027-08-21", /बहुला चतुर्थी/, "भाद्रपद कृष्ण चतुर्थी"],
    ["2027-08-22", /नाग पंचम/, "भाद्रपद कृष्ण पंचमी"],
    ["2027-08-23", /^हल षष्ठी \/ बलराम षष्ठी$/, "भाद्रपद कृष्ण षष्ठी"],
    ["2027-08-23", /^रंधन छठ$/, "भाद्रपद कृष्ण षष्ठी"],
    ["2027-08-24", /^श्रीकृष्ण जन्माष्टमी \(स्मार्त\)$/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-24", /^काली महाविद्या जयंती$/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-24", /^शीतला सतम$/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-24", /^विन्ध्यवासिनी जयंती$/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-24", /^इन्द्र सावर्णि मन्वादि$/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-25", /मासिक कालाष्टमी \/ मासिक कृष्ण जन्माष्टमी/, "भाद्रपद कृष्ण अष्टमी"],
    ["2027-08-26", /^दही हांडी$/, "भाद्रपद कृष्ण नवमी"],
    ["2027-08-26", /^श्री गोगा नवमी$/, "भाद्रपद कृष्ण नवमी"],
    ["2027-08-28", /^कृष्ण दामोदर द्वादशी$/, "भाद्रपद कृष्ण द्वादशी"],
    ["2027-08-28", /^बछ बारस द्वादशी$/, "भाद्रपद कृष्ण द्वादशी"],
    ["2027-08-31", /^पिठोरी अमावस्या \/ दर्श अमावस्या$/, "भाद्रपद कृष्ण अमावस्या"],
    ["2027-08-31", /^पोला \/ वृषभोत्सव$/, "भाद्रपद कृष्ण अमावस्या"],
    ["2027-08-31", /^दैव सावर्णि मन्वादि$/, "भाद्रपद कृष्ण अमावस्या"]
  ];
  for (const [date, title, tithi] of checks) {
    const event = august.events.find(item => item.date === date && title.test(item.title || ""));
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    if (tithi) assert.equal(event.hinduTithi, tithi);
    assert.ok(event.sourceUrl, date + " source URL");
  }
  assert.equal(august.events.some(item => /गौण|वैष्णव/.test(item.title || "")), false);
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
    [10, "2027-10-15", /वाल्मीकि जयंती एवं मीराबाई जयंती/],
    [10, "2027-10-27", /यम दीपदान/],
    [10, "2027-10-30", /अन्नकूट/],
    [11, "2027-11-10", /देवोत्थानी एकादशी \(स्मार्त\)/],
    [11, "2027-11-17", /मंडल पूजा प्रारंभ/],
    [11, "2027-11-20", /मासिक कृष्ण जन्माष्टमी/],
    [11, "2027-11-24", /कृष्ण योगेश्वर द्वादशी/],
    [12, "2027-12-03", /विवाह पंचमी/],
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
    assert.ok(data.events.length > 0);
  }
});


test("2027 descriptions contain no generic placeholder copy", () => {
  for (let monthNumber = 1; monthNumber <= 12; monthNumber++) {
    const data = month(monthNumber);
    for (const event of data.events) {
      assert.doesNotMatch(event.description || "", /परंपरानुसार पूजा, व्रत और दान किया जाता है/,
        data.year + "-" + String(monthNumber).padStart(2, "0") + " " + event.title);
    }
  }
});
