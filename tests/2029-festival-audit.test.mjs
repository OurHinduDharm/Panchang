import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) =>
  JSON.parse(readFileSync(join(folder, "2029-" + String(i + 1).padStart(2, "0") + ".json"), "utf8")));
const events = months.flatMap(data => data.events || []);
const has = (date, pattern) => events.find(event => event.date === date && pattern.test(event.title || ""));
const titles = date => events.filter(event => event.date === date).map(event => event.title);

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

test("2029 independent observances use separate cards without duplicate titles", () => {
  const seen = new Set();
  for (const event of events) {
    const key = event.date + "|" + event.title;
    assert.ok(!seen.has(key), "Duplicate card: " + key);
    seen.add(key);
  }
  assert.ok(titles("2029-01-22").some(x => /^रथ सप्तमी/.test(x)));
  assert.ok(titles("2029-01-22").some(x => /^नर्मदा जयंती$/.test(x)));
  assert.ok(titles("2029-01-22").some(x => /माघ गुप्त नवरात्र सप्तमी/.test(x)));
  assert.ok(titles("2029-02-28").some(x => /^होलिका दहन$/.test(x)));
  assert.ok(titles("2029-02-28").some(x => /^फाल्गुन पूर्णिमा$/.test(x)));
  assert.ok(titles("2029-02-28").some(x => /^श्री महालक्ष्मी जयंती$/.test(x)));
  assert.ok(titles("2029-04-14").some(x => /^चैत्र नवरात्र प्रारम्भ$/.test(x)));
  assert.ok(titles("2029-04-14").some(x => /^गुड़ी पड़वा$/.test(x)));
  assert.ok(titles("2029-04-14").some(x => /^उगादी$/.test(x)));
  assert.ok(titles("2029-04-14").some(x => /^मेष संक्रांति$/.test(x)));
  assert.ok(titles("2029-04-14").some(x => /^बैसाखी \/ वैशाखी$/.test(x)));
  assert.ok(titles("2029-04-14").some(x => /^विषु$/.test(x)));
  assert.ok(titles("2029-04-14").some(x => /^बोहाग बिहू$/.test(x)));
  assert.ok(titles("2029-05-16").some(x => /^अक्षय तृतीया$/.test(x)));
  assert.ok(titles("2029-05-16").some(x => /^मातंगी महाविद्या जयंती$/.test(x)));
  assert.ok(titles("2029-05-16").some(x => /^त्रेतायुगादि तिथि$/.test(x)));
  assert.ok(titles("2029-05-16").some(x => /^परशुराम जयंती$/.test(x)));
  assert.ok(titles("2029-06-25").some(x => /^वट पूर्णिमा व्रत$/.test(x)));
  assert.ok(titles("2029-06-25").some(x => /^ज्येष्ठ पूर्णिमा$/.test(x)));
  assert.ok(titles("2029-07-13").some(x => /^श्रीजगन्नाथ रथयात्रा$/.test(x)));
  assert.ok(titles("2029-07-13").some(x => /^चन्द्र दर्शन$/.test(x)));
  assert.ok(titles("2029-07-13").some(x => /आषाढ़ गुप्त नवरात्र द्वितीय/.test(x)));
  assert.ok(titles("2029-08-23").some(x => /^रक्षाबंधन$/.test(x)));
  assert.ok(titles("2029-08-23").some(x => /^श्रावण पूर्णिमा$/.test(x)));
  assert.ok(titles("2029-08-23").some(x => /^श्री हयग्रीव जयंती$/.test(x)));
  assert.ok(titles("2029-09-19").some(x => /^बुध प्रदोष व्रत$/.test(x)));
  assert.ok(titles("2029-09-19").some(x => /^भुवनेश्वरी महाविद्या जयंती$/.test(x)));
  assert.ok(titles("2029-09-19").some(x => /^वामन जयंती$/.test(x)));
  assert.ok(titles("2029-10-15").some(x => /^महानवमी/.test(x)));
  assert.ok(titles("2029-10-15").some(x => /^सरस्वती विसर्जन$/.test(x)));
  assert.ok(titles("2029-10-15").some(x => /^आयुध पूजा$/.test(x)));
  assert.ok(titles("2029-11-21").some(x => /^कार्तिक पूर्णिमा$/.test(x)));
  assert.ok(titles("2029-11-20").some(x => /^देव दीपावली$/.test(x)));
  assert.ok(titles("2029-11-20").some(x => /^कार्तिगै दीपम$/.test(x)));
  assert.ok(titles("2029-12-16").some(x => /^मोक्षदा एकादशी$/.test(x)));
  assert.ok(titles("2029-12-16").some(x => /^गीता जयंती$/.test(x)));
  assert.ok(titles("2029-12-16").some(x => /^धनु संक्रांति$/.test(x)));
});

test("2029 Ekadashi cards follow the Smarta sunrise rule and omit Vaishnava duplicates", () => {
  assert.equal(events.filter(event => /(गौण|वैष्णव)/.test(event.title || "")).length, 0);
  const papankusha = has("2029-10-17", /पापांकुशा एकादशी/);
  assert.ok(papankusha);
  assert.equal(papankusha.hinduTithi, "आश्विन शुक्ल एकादशी");
  assert.equal(has("2029-10-18", /पापांकुशा एकादशी/), undefined);
  const utpanna = has("2029-12-02", /उत्पन्ना एकादशी \(स्मार्त\)/);
  assert.ok(utpanna);
  assert.equal(utpanna.hinduTithi, "मार्गशीर्ष कृष्ण एकादशी");
  assert.equal(has("2029-12-01", /उत्पन्ना एकादशी/), undefined);
  assert.equal(events.filter(event => /उत्पन्ना एकादशी/.test(event.title || "")).length, 1);
});

test("2029 Krishna Janmashtami follows the Smarta Nishita date", () => {
  const janmashtami = events.find(event => event.date === "2029-08-31" && event.title === "श्रीकृष्ण जन्माष्टमी (स्मार्त)");
  assert.ok(janmashtami);
  assert.equal(janmashtami.hinduTithi, "भाद्रपद कृष्ण अष्टमी");
  assert.equal(janmashtami.sourceName, "MyPanchang — Janmashtami (Smarta) 2029");
  assert.equal(janmashtami.secondarySourceName, "Drik Panchang — 2029 tithi and Rohini timings (New Delhi)");
  assert.equal(has("2029-09-01", /^श्रीकृष्ण जन्माष्टमी$/), undefined);
});

test("2029 Navratri days are independent from other same-tithi observances", () => {
  assert.ok(has("2029-01-16", /चन्द्र दर्शन/));
  assert.ok(has("2029-01-16", /माघ गुप्त नवरात्र द्वितीय — माँ ब्रह्मचारिणी/));
  assert.ok(has("2029-01-18", /गौरी गणेश चतुर्थी/));
  assert.ok(has("2029-01-18", /माघ गुप्त नवरात्र चतुर्थ — माँ कूष्माण्डा/));
  assert.ok(has("2029-01-19", /वसंत पंचमी/));
  assert.ok(has("2029-01-19", /माघ गुप्त नवरात्र पंचमी — माँ स्कन्दमाता/));
  assert.ok(has("2029-01-23", /भीष्माष्टमी/));
  assert.ok(has("2029-01-23", /माघ गुप्त नवरात्र अष्टमी — माँ महागौरी/));
  assert.ok(has("2029-04-15", /चन्द्र दर्शन/));
  assert.ok(has("2029-04-15", /चैत्र नवरात्र द्वितीय — माँ ब्रह्मचारिणी/));
  assert.ok(has("2029-04-17", /गणगौर/));
  assert.ok(has("2029-04-17", /चैत्र नवरात्र तृतीय — माँ चन्द्रघंटा/));
  assert.ok(has("2029-04-20", /यमुना छठ/));
  assert.ok(has("2029-04-20", /चैत्र नवरात्र षष्ठी — माँ कात्यायनी/));
  assert.ok(has("2029-07-18", /आषाढ़ गुप्त नवरात्र सप्तमी — माँ कालरात्रि/));
  assert.ok(has("2029-07-19", /आषाढ़ गुप्त नवरात्र अष्टमी — माँ महागौरी/));
  assert.equal(has("2029-07-18", /आषाढ़ गुप्त नवरात्र अष्टमी — माँ महागौरी/), undefined);
  assert.ok(has("2029-07-19", /आषाढ़ गुप्त नवरात्र नवमी — माँ सिद्धिदात्री/));
  assert.ok(has("2029-10-09", /चन्द्र दर्शन/));
  assert.ok(has("2029-10-09", /शारदीय नवरात्र द्वितीय — माँ ब्रह्मचारिणी/));
});

test("2029 approved saint jayantis are retained and explicitly excluded modern public figures stay omitted", () => {
  assert.ok(has("2029-01-13", /लोहड़ी/));
  assert.ok(has("2029-04-14", /^तमिल नववर्ष \(पुथांडु\)$/));
  assert.ok(has("2029-01-14", /^पोंगल$/));
  assert.ok(has("2029-11-20", /^कार्तिगै दीपम$/));
  const diwali = has("2029-11-05", /^दीपावली/);
  assert.ok(diwali);
  assert.match(diwali.title, /केदार गौरी व्रत/);
  assert.match(diwali.secondarySourceUrl, /kedar-gauri-vrat-date-time\.html\?year=2029/);
  assert.ok(has("2029-04-14", /^उगादी$/));
  assert.ok(has("2029-04-14", /^विषु$/));
  assert.ok(has("2029-04-14", /^बोहाग बिहू$/));
  assert.ok(has("2029-05-26", /^नृसिंह जयंती$/));
  assert.ok(has("2029-05-26", /^छिन्नमस्ता महाविद्या जयंती$/));
  assert.ok(has("2029-08-22", /ओणम/));
  assert.ok(has("2029-08-14", /^नाग पंचमी$/));
  assert.ok(has("2029-08-10", /^श्रावण अमावस्या \/ हरियाली अमावस्या$/));
  assert.ok(has("2029-08-22", /^ऋग्वेदीय उपाकर्म$/));
  assert.ok(has("2029-08-23", /^यजुर्वेदीय उपाकर्म$/));
  assert.ok(has("2029-08-24", /^नारळी पूर्णिमा$/));
  assert.ok(has("2029-08-27", /^कजरी तीज$/));
  assert.ok(has("2029-08-23", /^रक्षाबंधन$/));
  assert.ok(has("2029-09-01", /^अगस्त्य अर्घ्य$/));
  assert.ok(has("2029-09-13", /^ज्येष्ठा गौरी आवाहन$/));
  assert.ok(has("2029-09-14", /^ज्येष्ठा गौरी पूजन$/));
  assert.ok(has("2029-09-15", /^ज्येष्ठा गौरी विसर्जन$/));
  assert.ok(has("2029-09-15", /^महालक्ष्मी व्रत प्रारम्भ$/));
  assert.ok(has("2029-09-17", /^विश्वकर्मा पूजा$/));
  assert.ok(has("2029-10-01", /जीवित्पुत्रिका व्रत/));
  assert.ok(has("2029-10-13", /^सरस्वती आवाहन$/));
  assert.ok(has("2029-10-14", /^सरस्वती पूजा$/));
  assert.ok(has("2029-10-18", /पद्मनाभ द्वादशी/));
  assert.ok(has("2029-10-30", /^राधाकुण्ड स्नान$/));
  assert.ok(has("2029-11-16", /देवोत्थानी एकादशी \(स्मार्त\)/));
  assert.ok(has("2029-12-02", /कृष्ण योगेश्वर द्वादशी/));
  assert.ok(has("2029-05-18", /आदि शंकराचार्य जयंती एवं सूरदास जयंती/));
  assert.ok(has("2029-08-16", /गोस्वामी तुलसीदास जयंती/));
  assert.ok(has("2029-10-22", /वाल्मीकि जयंती एवं मीराबाई जयंती/));
  assert.ok(has("2029-12-13", /बाबा नीब करौरी जयंती/));
  assert.equal(events.some(event => /कबीर जयंती|कबीरदास जयंती|विवेकानंद जयंती|स्वामी विवेकानंद|दयानंद सरस्वती जयंती|गांधी जयंती|प्रभुपाद जयंती/.test(event.title || "")), false);
});

test("2029 solar and June lunar eclipses are excluded because they are not visible in Pithoragarh", () => {
  assert.equal(events.filter(event => /ग्रहण/.test(event.title || "")).filter(event => event.date !== "2029-12-21").length, 0);
});

test("2029 Pithoragarh total lunar eclipse has local contact timings", () => {
  const eclipse = has("2029-12-21", /पूर्ण चंद्रग्रहण/);
  assert.ok(eclipse);
  assert.equal(eclipse.hinduTithi, "मार्गशीर्ष शुक्ल पूर्णिमा");
  assert.match(eclipse.description, /2:25 से सुबह 5:58 बजे तक/);
  assert.match(eclipse.description, /3:45 से 4:38 बजे तक/);
  assert.match(eclipse.description, /अधिकतम ग्रहण सुबह 4:12 बजे/);
  assert.match(eclipse.description, /चंद्रास्त सुबह 7:08 बजे/);
  assert.ok(eclipse.sourceUrl.includes("timeanddate.com/eclipse/in/india/pithoragarh"));
});


test("2029 Champa Shashthi follows local Shashthi sunrise and stays distinct from monthly Skanda Shashthi", () => {
  const champa = has("2029-12-11", /^चम्पा षष्ठी$/);
  assert.ok(champa);
  assert.equal(champa.hinduTithi, "मार्गशीर्ष शुक्ल षष्ठी");
  assert.equal(champa.sourceName, "Drik Panchang — 2029 Hindu Calendar");
  assert.equal(has("2029-12-10", /^चम्पा षष्ठी$/), undefined);
  assert.ok(has("2029-12-10", /^मासिक स्कन्द षष्ठी$/));
});
