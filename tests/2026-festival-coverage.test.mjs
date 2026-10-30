import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const month = async (name) => JSON.parse(await readFile(new URL("../data/festivals/2026-" + name + ".json", import.meta.url), "utf8"));
const find = (data, date, pattern) => data.events.find(event => event.date === date && pattern.test(event.title || ""));
const urls = (event) => [
  event.articleUrl,
  event.secondaryArticleUrl,
  ...[...String(event.description || "").matchAll(/href=["']([^"']+)["']/g)].map(match => match[1])
].filter(Boolean);

test("2026 February includes Kumbha Sankranti", async () => {
  const data = await month("02");
  assert.ok(find(data, "2026-02-13", /कुम्भ संक्रांति/));
});

test("2026 March includes Gauri Puja, Yamuna Chhath and Swaminarayan Jayanti", async () => {
  const data = await month("03");
  assert.ok(find(data, "2026-03-21", /गौरी पूजा/));
  assert.ok(find(data, "2026-03-24", /यमुना छठ/));
  assert.ok(find(data, "2026-03-27", /स्वामिनारायण जयंती/));
});

test("2026 April restores Akshaya Tritiya and both original article links", async () => {
  const data = await month("04");
  const event = find(data, "2026-04-19", /अक्षय तृतीया.*परशुराम जयंती/);
  assert.ok(event);
  assert.match(event.articleUrl || "", /About-Akshaya-Triteeya/);
  assert.match(event.secondaryArticleUrl || "", /About-Lord-Parshuram/);
});

test("2026 April separates Shankaracharya-Surdas and Ramanuja Jayantis", async () => {
  const data = await month("04");
  assert.ok(find(data, "2026-04-21", /शंकराचार्य.*सूरदास/));
  assert.ok(find(data, "2026-04-22", /रामानुजाचार्य/));
});

test("2026 August includes Raksha Bandhan and the Hayagriva article", async () => {
  const data = await month("08");
  const rakhi = find(data, "2026-08-28", /रक्षाबंधन/);
  assert.ok(rakhi);
  assert.ok(find(data, "2026-08-28", /हयग्रीव/).articleUrl);
});

test("2026 October includes Saraswati Avahan and Saraswati Puja", async () => {
  const data = await month("10");
  assert.ok(find(data, "2026-10-16", /सरस्वती.*आवाहन/));
  assert.ok(find(data, "2026-10-17", /सरस्वती पूजा/));
  assert.ok(find(data, "2026-10-19", /सरस्वती विसर्जन/));
});

test("2026 September includes Agastya Arghya and preserves Varaha article", async () => {
  const data = await month("09");
  assert.ok(find(data, "2026-09-07", /अगस्त्य अर्घ्य/));
  assert.match(find(data, "2026-09-13", /वाराहावतार/).articleUrl || "", /About-Lord-Varah/);
});

test("2026 November preserves the Rama Ekadashi article", async () => {
  const data = await month("11");
  assert.match(find(data, "2026-11-05", /रमा एकादशी/).articleUrl || "", /About-Rama-Ekadashi/);
});

test("Every legacy OurHinduDharm article link remains attached to the 2026 catalog", async () => {
  const legacy = JSON.parse(await readFile(new URL("../data/festivals/legacy-source-preserved.json", import.meta.url), "utf8"));
  const names = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const current = await Promise.all(names.map(month));
  const present = new Set(current.flatMap(data => data.events.flatMap(urls)));
  const legacyLinks = new Set((legacy.events || []).filter(event => /^2026-/.test(event.date || "")).flatMap(urls).filter(url => /ourhindudharm\.blogspot\.com/.test(url)));
  const missing = [...legacyLinks].filter(url => !present.has(url));
  assert.deepEqual(missing, []);
});

test("Festival year selector exposes only years with catalog data", async () => {
  const html = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
  assert.match(html, /option value="2026"/);
  assert.match(html, /option value="2029"/);
  assert.doesNotMatch(html, /option value="2025"|option value="2030"/);
});

test("2026 Purnima titles include the corresponding lunar month names", async () => {
  assert.ok(find(await month("03"), "2026-03-03", /फाल्गुन पूर्णिमा/));
  assert.ok(find(await month("05"), "2026-05-01", /वैशाख पूर्णिमा/));
  assert.ok(find(await month("07"), "2026-07-29", /आषाढ़ पूर्णिमा/));
});

test("2026 non-visible eclipses are classified as visibility events, not puja muhurta", async () => {
  const feb = await month("02");
  const aug = await month("08");
  const cases = [
    [find(feb, "2026-02-17", /वलयाकार सूर्यग्रहण/), "फाल्गुन कृष्ण अमावस्या"],
    [find(aug, "2026-08-12", /पूर्ण सूर्यग्रहण/), "श्रावण कृष्ण अमावस्या"],
    [find(aug, "2026-08-28", /आंशिक चंद्रग्रहण/), "श्रावण शुक्ल पूर्णिमा"]
  ];
  for (const [event, tithi] of cases) {
    assert.ok(event);
    assert.equal(event.timingType, "eclipse-visibility");
    assert.equal(event.hinduTithi, tithi);
    assert.equal(event.reviewStatus, "approved");
    assert.match(event.description, /भारत में.*दिखाई नहीं देता/);
  }
});

test("2026 Pithoragarh Drik annual-calendar anchor observances are present on their published dates", async () => {
  const checks = [
    ["01-03", /पौष पूर्णिमा/], ["01-06", /सकट चौथ/], ["01-14", /मकर संक्रांति/],
    ["01-14", /पोंगल/], ["01-14", /षट्तिला एकादशी/], ["01-18", /मौनी अमावस्या/],
    ["01-23", /वसंत पंचमी/], ["01-25", /रथ सप्तमी/], ["01-26", /भीष्माष्टमी/], ["01-29", /जया एकादशी/],
    ["02-01", /माघ पूर्णिमा/], ["02-13", /कुम्भ संक्रांति/], ["02-13", /विजया एकादशी/],
    ["02-15", /महाशिवरात्रि/], ["02-17", /वलयाकार सूर्यग्रहण/], ["02-27", /आमलकी एकादशी/],
    ["03-03", /होलिका-दहन/], ["03-03", /चंद्रग्रहण/], ["03-04", /होली/], ["03-11", /शीतला अष्टमी/],
    ["03-15", /पापमोचनी एकादशी/], ["03-19", /चैत्र नवरात्रि प्रारंभ/], ["03-21", /गौरी पूजा/],
    ["03-24", /यमुना छठ/], ["03-26", /श्रीरामनवमी \(स्मार्त\)/],
    ["03-27", /श्रीरामनवमी \(वैष्णव/], ["03-27", /स्वामिनारायण जयंती/], ["03-29", /कामदा एकादशी/],
    ["04-02", /हनुमान जयंती/], ["04-13", /वरुथिनी एकादशी/], ["04-14", /मेष संक्रांति/],
    ["04-19", /अक्षय तृतीया/], ["04-19", /परशुराम जयंती/], ["04-23", /गंगा सप्तमी/],
    ["04-25", /सीता नवमी/], ["04-27", /मोहिनी एकादशी/], ["04-30", /नृसिंह जयंती/],
    ["05-01", /बुद्ध पूर्णिमा/], ["05-02", /नारद/], ["05-13", /अपरा एकादशी/],
    ["05-15", /वृषभ संक्रांति/], ["05-16", /वट सावित्री/], ["05-16", /शनि जयन्ती/],
    ["05-25", /गंगा दशहरा/], ["05-27", /पद्मिनी एकादशी/], ["05-31", /ज्येष्ठ अधिक पूर्णिमा/],
    ["06-11", /परमा एकादशी/], ["06-15", /मिथुन संक्रांति/], ["06-25", /निर्जला एकादशी/],
    ["06-29", /वट पूर्णिमा/], ["07-10", /योगिनी एकादशी/], ["07-11", /गौण योगिनी एकादशी/],
    ["07-16", /जगन्नाथ रथयात्रा/], ["07-16", /कर्क संक्रान्ति/], ["07-25", /देवशयनी/],
    ["07-29", /गुरु पूर्णिमा/], ["08-09", /कामिका एकादशी/], ["08-12", /पूर्ण सूर्यग्रहण/],
    ["08-15", /हरियाली तीज/], ["08-17", /नाग पंचमी/], ["08-17", /सिंह संक्रांति/],
    ["08-23", /श्रावण पुत्रदा/], ["08-26", /ओणम/], ["08-28", /वरलक्ष्मी व्रत/],
    ["08-28", /रक्षाबंधन/], ["08-28", /गायत्री जयन्ती/], ["08-28", /आंशिक चंद्रग्रहण/],
    ["08-31", /कजरी तीज/], ["09-04", /जन्माष्टमी/], ["09-07", /अगस्त्य अर्घ्य/],
    ["09-07", /अजा एकादशी/], ["09-14", /हरतालिका तीज/], ["09-14", /गणेश चतुर्थी/],
    ["09-15", /ऋषि पंचमी/], ["09-16", /बलराम जयंती/], ["09-17", /कन्या संक्रांति/],
    ["09-17", /विश्वकर्मा पूजा/], ["09-19", /राधाष्टमी/], ["09-22", /पार्श्व.*एकादशी/],
    ["09-25", /अनंत चतुर्दशी/], ["09-26", /भाद्रपद पूर्णिमा/], ["09-27", /पितृपक्ष प्रारंभ/],
    ["10-06", /इंदिरा एकादशी/], ["10-10", /पितृ विसर्जन अमावास्या/],
    ["10-11", /नवरात्र प्रारम्भ/], ["10-16", /सरस्वती का आवाहन/], ["10-17", /सरस्वती पूजा/],
    ["10-19", /महानवमी/], ["10-19", /महाष्टमी/], ["10-20", /विजयादशमी/],
    ["10-22", /पापांकुशा एकादशी/], ["10-25", /शरद पूर्णिमा/], ["10-29", /करकचतुर्थी/],
    ["11-01", /अहोई अष्टमी/], ["11-05", /रमा एकादशी/], ["11-06", /धनतेरस/],
    ["11-08", /दीपावली/], ["11-08", /नरक चतुर्दशी/], ["11-10", /गोवर्धन पूजा/],
    ["11-11", /भाई दूज/], ["11-15", /छठ पूजा/], ["11-20", /देवउठनी एकादशी/],
    ["11-21", /गौण देवउठनी/], ["11-21", /तुलसी विवाह/], ["11-24", /कार्तिक पूर्णिमा/],
    ["12-01", /कालभैरव जयंती/], ["12-04", /उत्पन्ना एकादशी/], ["12-14", /विवाह पंचमी/],
    ["12-16", /धनु संक्रांति/], ["12-20", /गीता जयंती/], ["12-20", /मोक्षदा एकादशी/],
    ["12-23", /दत्तात्रेय जयंती/]
  ];
  const months = await Promise.all(Array.from({ length: 12 }, (_, i) => month(String(i + 1).padStart(2, "0"))));
  const missing = checks.filter(([md, pattern]) => {
    const date = "2026-" + md;
    return !months[Number(md.slice(0, 2)) - 1].events.some(event => event.date === date && pattern.test(event.title || ""));
  });
  assert.deepEqual(missing, []);
});
