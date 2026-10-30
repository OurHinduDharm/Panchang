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

test("2026 March includes Gauri Puja and Yamuna Chhath", async () => {
  const data = await month("03");
  assert.ok(find(data, "2026-03-21", /गौरी पूजा/));
  assert.ok(find(data, "2026-03-24", /यमुना छठ/));
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
  assert.ok(find(data, "2026-08-27", /हयग्रीव/).articleUrl);
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

test("2026 April confirms Hanuman and Bagalamukhi dates and separates Chaturdashi observances", async () => {
  const data = await month("04");
  const hanuman = find(data, "2026-04-02", /हनुमान जयंती/);
  assert.equal(hanuman.hinduTithi, "चैत्र शुक्ल पूर्णिमा");
  const bagalamukhi = find(data, "2026-04-24", /बगलामुखी/);
  assert.equal(bagalamukhi.hinduTithi, "वैशाख शुक्ल अष्टमी");
  assert.equal(bagalamukhi.reviewStatus, "approved");
  const narasimha = find(data, "2026-04-30", /नृसिंह जयंती \/ नृसिंह चतुर्दशी व्रत/);
  assert.match(narasimha.articleUrl, /About-lord-Nrisimha/);
  assert.ok(find(data, "2026-04-30", /छिन्नमस्ता/).articleUrl);
  assert.ok(find(data, "2026-04-30", /शरभ अवतार/));
  assert.ok(find(data, "2026-04-30", /ब्लॉग स्थापना दिवस/));
  assert.equal(data.events.filter(e => e.date === "2026-04-30" && /नृसिंह/.test(e.title)).length, 1);
});
test("2026 May separates Vat Savitri and Shani Jayanti cards", async () => {
  const data = await month("05");
  const vat = find(data, "2026-05-16", /वट सावित्री व्रत$/);
  const shani = find(data, "2026-05-16", /शनि जयन्ती/);
  assert.ok(vat && /सावित्री-सत्यवान/.test(vat.description));
  assert.match(shani.articleUrl || "", /About-Shanidev-On-ShanidevJayanti/);
  assert.match(shani.secondaryArticleUrl || "", /About-Shani-dev-shatarchan/);
  assert.equal(data.events.filter(e => e.date === "2026-05-16" && e.title.includes("वट सावित्री व्रत / शनि जयंती")).length, 0);
});
test("2026 Gayatri Jayanti preserves the listed traditional observances", async () => {
  const june = find(await month("06"), "2026-06-25", /वेदमाता गायत्री/);
  const august = find(await month("08"), "2026-08-28", /गायत्री जयन्ती/);
  const bhadrapada = find(await month("09"), "2026-09-22", /गायत्री जयंती/);
  assert.equal(june.hinduTithi, "ज्येष्ठ शुक्ल एकादशी");
  assert.equal(august.hinduTithi, "श्रावण शुक्ल पूर्णिमा");
  assert.equal(bhadrapada.hinduTithi, "भाद्रपद शुक्ल एकादशी");
  assert.ok(june.articleUrl && august.articleUrl && bhadrapada.articleUrl);
});
test("2026 Vindhyavasini Jayanti is retained on Bhadrapada Krishna Ashtami", async () => {
  const august = await month("08");
  const september = await month("09");
  assert.equal(find(september, "2026-09-04", /विन्ध्यवासिनी/).hinduTithi, "भाद्रपद कृष्ण अष्टमी");
  assert.equal(august.events.filter(e => /विन्ध्यवासिनी/.test(e.title)).length, 0);
});

test("2026 March Drik Pithoragarh calendar anchors retain exact date and tithi", async () => {
  const data = await month("03");
  const lakshmi = find(data, "2026-03-03", /श्री महालक्ष्मी जयंती/);
  assert.equal(lakshmi.hinduTithi, "फाल्गुन शुक्ल पूर्णिमा");
  assert.equal(lakshmi.reviewStatus, "approved");
  const sankranti = find(data, "2026-03-15", /मीन संक्रांति/);
  assert.equal(sankranti.reviewStatus, "approved");
  const ugadi = find(data, "2026-03-19", /उगादी \/ गुड़ी पड़वा/);
  assert.equal(ugadi.hinduTithi, "चैत्र शुक्ल प्रतिपदा");
  assert.equal(ugadi.reviewStatus, "approved");
  const samvatsara = find(data, "2026-03-19", /हिंदू नवसंवत्सर/);
  assert.equal(samvatsara.hinduTithi, "चैत्र शुक्ल प्रतिपदा");
  assert.equal(samvatsara.reviewStatus, "approved");
});


test("Jayanti and Vrat-Parv index article links are attached to their 2026 cards", async () => {
  const march = await month("03");
  assert.match(find(march, "2026-03-26", /श्रीरामनवमी/).description, /About-Birthday-Of-Lord-Ram-on-Shree-RamNavami/);
  const august = await month("08");
  assert.match(find(august, "2026-08-28", /लव-कुश जयंती/).description, /About-RakshaBandhan-SanskritDiwas-LavKushJayanti/);
  const july = await month("07");
  assert.match(find(july, "2026-07-25", /देवशयनी/).description, /About-Chaaturmaas/);
  const november = await month("11");
  assert.match(find(november, "2026-11-21", /तुलसी विवाह/).description, /About-Tulsi-vivah-On-Prabodhini-Ekaadashi/);
  const december = await month("12");
  assert.match(find(december, "2026-12-20", /गीता जयंती/).description, /About-ShimadbhagvatGita/);
  assert.match(find(december, "2026-12-23", /दत्तात्रेय जयंती/).description, /About-Lord-Dattatreya/);
  assert.match(find(december, "2026-12-23", /त्रिपुरभैरवी/).description, /About-Goddess-TripurBhairavi/);
});
test("2026 Ekadashi cards expose the general vrat and udyapan guides", async () => {
  const url1 = "About-Ekadashi-Vrat-Vidhan";
  const url2 = "About-Ekadashi-Vrat-Udyapan-vidhi";
  for (const m of ["01","02","03","04","05","06","07","08","09","10","11","12"]) {
    const data = await month(m);
    for (const event of data.events.filter(item => /एकादशी/.test(item.title || "") && !/गायत्री/.test(item.title || ""))) {
      assert.match(event.description || "", new RegExp(url1));
      assert.match(event.description || "", new RegExp(url2));
    }
  }
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

test("Monthly footer navigation creates its next-month button before appending it", async () => {
  const widget = await readFile(new URL("../monthly-vrat-parv-widget.js", import.meta.url), "utf8");
  assert.match(widget, /var nextButton\s*=\s*document\.createElement\("button"\)/);
  assert.match(widget, /nav\.appendChild\(prev\);\s*nav\.appendChild\(nextButton\)/);
  assert.doesNotMatch(widget, /nav\.appendChild\(prev\);\s*nav\.appendChild\(next\)/);
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
    ["03-27", /श्रीरामनवमी \(वैष्णव/], ["03-29", /कामदा एकादशी/],
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
  const missing = [];
  const unapproved = [];
  for (const [md, pattern] of checks) {
    const date = "2026-" + md;
    const event = months[Number(md.slice(0, 2)) - 1].events.find(item => item.date === date && pattern.test(item.title || ""));
    if (!event) missing.push({ date, pattern: String(pattern) });
    else if (event.reviewStatus !== "approved") unapproved.push({ date, title: event.title, reviewStatus: event.reviewStatus });
  }
  assert.deepEqual(missing, []);
  assert.deepEqual(unapproved, []);
});


test("Jyeshtha observances distinguish Batuka Bhairava Dashami from Batuka Bhairavi Siddhividya Purnima", async () => {
  const june = await month("06");
  const batuka = find(june, "2026-06-24", /बटुक भैरव जयंती/);
  assert.equal(batuka.reviewStatus, "approved");
  assert.match(batuka.hinduTithi || "", /ज्येष्ठ शुक्ल दशमी/);
  const bhairavi = find(june, "2026-06-29", /बटुक भैरवी सिद्धविद्या जयंती/);
  assert.equal(bhairavi.reviewStatus, "approved");
  assert.match(bhairavi.hinduTithi || "", /ज्येष्ठ शुक्ल पूर्णिमा/);
});


test("Gupta Navratri has all nine Navadurga cards and the corresponding article links", async () => {
  const data = await month("07");
  const checks = [
    ["2026-07-15", /गुप्त नवरात्र प्रारम्भ.*शैलपुत्री/, "About-Gupt-Navratris.html"],
    ["2026-07-16", /गुप्त नवरात्र द्वितीया.*ब्रह्मचारिणी/, "About-Brahmacharini-Ma-On-Navaratri.html"],
    ["2026-07-17", /गुप्त नवरात्र तृतीया.*चन्द्रघंटा/, "About-ChadraghantaMaa-On-Navaratri.html"],
    ["2026-07-17", /गुप्त नवरात्र चतुर्थी.*कूष्माण्डा/, "About-KooshmandaMata-On-Navaratri.html"],
    ["2026-07-18", /गुप्त नवरात्र पंचमी.*स्कन्दमाता/, "About-BhagwatiSkandaMata-On-Navratri.html"],
    ["2026-07-19", /गुप्त नवरात्र षष्ठी.*कात्यायनी/, "About-GodessKaatyaayani-On-Navratri.html"],
    ["2026-07-20", /गुप्त नवरात्र सप्तमी.*कालरात्रि/, "About-KalratriMaa-On-Navratri.html"],
    ["2026-07-21", /गुप्त नवरात्र अष्टमी.*महागौरी/, "About-GoddessMahagauri-On-Mahaashtami-Of-Navratri.html"],
    ["2026-07-22", /गुप्त नवरात्र नवमी.*सिद्धिदात्री/, "About-Goddess-Siddhidaatri-On-MahaNavami-Of-Navratri.html"]
  ];
  for (const [date, pattern, article] of checks) {
    const event = find(data, date, pattern);
    assert.ok(event, date + " " + pattern);
    assert.ok(String(event.description || "").includes(article), article);
    assert.equal(event.reviewStatus, "approved");
  }
  const start = find(data, "2026-07-15", /गुप्त नवरात्र प्रारम्भ.*शैलपुत्री/);
  assert.match(start.description, /kalash-sthapan\.html/);
  const navami = find(data, "2026-07-22", /गुप्त नवरात्र नवमी.*सिद्धिदात्री/);
  assert.match(navami.description, /navratrihavanvidhi\.html/);
  const kushmanda = find(data, "2026-07-17", /गुप्त नवरात्र चतुर्थी.*कूष्माण्डा/);
  assert.match(kushmanda.hinduTithi || "", /आषाढ़ शुक्ल चतुर्थी/);
});


test("All ten Mahavidya Jayanti observances are represented with their legacy article links", async () => {
  const checks = [
    ["02", "2026-02-01", /ललिता त्रिपुरसुंदरी/, "About-Goddess-Lalita-Or-Shodashi-Mahavidya"],
    ["03", "2026-03-27", /तारा महाविद्या/, "About-Godess-Tara-On-Tara-Mahavidya-Jayanti"],
    ["04", "2026-04-20", /मातंगी महाविद्या/, "About-Godess-Matangi"],
    ["04", "2026-04-24", /बगलामुखी महाविद्या/, "About-Goddess-Bagalamukhi"],
    ["04", "2026-04-30", /छिन्नमस्ता महाविद्या/, "About-Goddess-Chhinnamastika"],
    ["06", "2026-06-22", /धूमावती महाविद्या/, "about-godess-dhoomawati"],
    ["09", "2026-09-04", /आद्याकाली.*महाकाली महाविद्या/, "About-Mahavidya-MahaKali"],
    ["09", "2026-09-23", /भुवनेश्वरी महाविद्या/, "About-Goddess-Bhuvaneshvari"],
    ["11", "2026-11-08", /कमला महाविद्या जयंती/, "About-Kamla-Mahavidya"],
    ["12", "2026-12-23", /त्रिपुरभैरवी.*महाविद्या जयंती/, "About-Goddess-TripurBhairavi"]
  ];
  for (const [monthNo, date, title, article] of checks) {
    const data = await month(monthNo);
    const event = find(data, date, title);
    assert.ok(event, date + " " + title);
    assert.equal(event.reviewStatus, "approved");
    assert.ok(urls(event).some(url => url.includes(article)), article);
  }
});
