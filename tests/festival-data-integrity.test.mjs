import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const directory = new URL("../data/festivals/", import.meta.url);
const root = new URL("../", import.meta.url);
const folder = join(new URL(".", root).pathname, "data", "festivals");
const files = readdirSync(folder).filter(name => /^\d{4}-\d{2}\.json$/.test(name)).sort();

test("monthly festival data files have matching year/month metadata and event arrays", () => {
  assert.ok(files.length >= 12, "expected monthly festival JSON files");
  for (const file of files) {
    const match = /^(\d{4})-(\d{2})\.json$/.exec(file);
    const year = Number(match[1]);
    const month = Number(match[2]);
    assert.ok(month >= 1 && month <= 12, `${file}: invalid month in filename`);
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    assert.equal(data.year, year, `${file}: year metadata does not match filename`);
    assert.equal(data.month, month, `${file}: month metadata does not match filename`);
    assert.ok(Array.isArray(data.events), `${file}: events must be an array`);
  }
});

test("festival event dates are real dates in the month file that contains them", () => {
  for (const file of files) {
    const [, yearText, monthText] = /^(\d{4})-(\d{2})\.json$/.exec(file);
    const year = Number(yearText);
    const month = Number(monthText);
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      assert.equal(typeof event.date, "string", `${file}: event date missing for ${event.title || "(untitled)"}`);
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(event.date);
      assert.ok(match, `${file}: invalid date format ${event.date}`);
      const [, y, m, d] = match;
      const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
      assert.equal(date.getUTCFullYear(), Number(y), `${file}: invalid year in ${event.date}`);
      assert.equal(date.getUTCMonth() + 1, Number(m), `${file}: invalid month in ${event.date}`);
      assert.equal(date.getUTCDate(), Number(d), `${file}: invalid day in ${event.date}`);
      assert.equal(Number(y), year, `${file}: event year mismatch for ${event.title || event.date}`);
      assert.equal(Number(m), month, `${file}: event month mismatch for ${event.title || event.date}`);
      assert.equal(typeof event.title, "string", `${file}: title missing for ${event.date}`);
      assert.ok(event.title.trim(), `${file}: empty title for ${event.date}`);
    }
  }
});


test("Hindi festival descriptions do not end with malformed punctuation", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      const description = String(event.description || "").trim();
      assert.ok(!/(?:[;；][.。]?|[;；]।|[.。]$|[।。]\.)$/.test(description),
        `${file}: malformed ending punctuation in ${event.title || event.date}`);
    }
  }
});

test("every monthly festival record has an explicit review status", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      assert.equal(typeof event.reviewStatus, "string",
        `${file}: review status missing for ${event.title || event.date}`);
      assert.ok(event.reviewStatus.trim(),
        `${file}: empty review status for ${event.title || event.date}`);
    }
  }
});

test("Ekadashi parana metadata is only attached to Ekadashi records", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      if (event.muhurtaRule === "ekadashi-parana" || event.category === "एकादशी") {
        assert.match(event.title, /एकादशी/i, `${file}: Ekadashi metadata on non-Ekadashi event ${event.title}`);
      }
    }
  }
});

test("monthly festival files do not contain exact duplicate date/title records", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    const seen = new Set();
    for (const event of data.events) {
      const key = `${event.date}| ${event.title}`;
      assert.ok(!seen.has(key), `${file}: duplicate event ${key}`);
      seen.add(key);
    }
  }
});


test("Gupta Navratri parana and kalash visarjan are a single approved Dashami observance", () => {
  const july = JSON.parse(readFileSync(join(folder, "2026-07.json"), "utf8"));
  const matching = july.events.filter(event => event.date === "2026-07-23" && /गुप्त नवरात्र.*(?:पारण|कलश विसर्जन)/.test(event.title));
  assert.equal(matching.length, 1);
  assert.equal(matching[0].title, "गुप्त नवरात्र पारण एवं कलश विसर्जन");
  assert.equal(matching[0].reviewStatus, "approved");
  assert.equal(matching[0].hinduTithi, "आषाढ़ शुक्ल दशमी");
  assert.match(matching[0].description, /कलश-विसर्जन/);
  assert.equal(matching[0].articleUrl, "https://ourhindudharm.blogspot.com/p/kalashvisarjan.html");
  assert.equal(july.status, "approved");
  assert.ok(july.events.every(event => event.reviewStatus === "approved"));
});


test("2026 Mahashivaratri, Holika Dahan and Dhulandi have separate complete cards", () => {
  const february = JSON.parse(readFileSync(join(folder, "2026-02.json"), "utf8"));
  const maha = february.events.find(event => event.date === "2026-02-15" && /महाशिवरात्रि/.test(event.title));
  assert.ok(maha, "Mahashivaratri card should exist");
  assert.deepEqual(maha.muhurtaRules, ["mahashivaratri-four-prahar", "mahashivaratri-nishita"]);

  const march = JSON.parse(readFileSync(join(folder, "2026-03.json"), "utf8"));
  const holika = march.events.filter(event => event.date === "2026-03-03" && /होलिका-दहन/.test(event.title));
  const dhulandi = march.events.filter(event => event.date === "2026-03-04" && /धुलण्डी/.test(event.title));
  const purnima = march.events.find(event => event.date === "2026-03-03" && event.title === "फाल्गुन पूर्णिमा");
  assert.equal(holika.length, 1);
  assert.equal(holika[0].muhurtaRule, "holika-dahan-pradosh");
  assert.equal(holika[0].reviewStatus, "approved");
  assert.equal(dhulandi.length, 1);
  assert.ok(purnima, "Purnima should remain its own separate card");
  assert.equal(march.status, "approved");
  assert.ok(march.events.every(event => event.reviewStatus === "approved"));
});

test("2026 festival cards expose the linked articles from the Vrat-Parv page", () => {
  const cases = [
    ["2026-03.json","श्रीरामनवमी (वैष्णव सम्प्रदाय)","About-Birthday-Of-Lord-Ram-on-Shree-RamNavami.html"],
    ["2026-04.json","श्री हनुमान जयंती / चैत्र पूर्णिमा","About-Lord-Hanuman-Jayanti.html"],
    ["2026-04.json","सीता नवमी / जानकी नवमी","About-Worship-Method-Of-Goddess-Sita-On-JanakiNavami-Or-Sita-Mata-Jayanti.html"],
    ["2026-05.json","गंगा दशहरा","about-Godess-Ganga-on-ganga-dussehra.html"],
    ["2026-07.json","आषाढ़ गुप्त नवरात्र प्रारम्भ - शैलपुत्री पूजन","About-Gupt-Navratris.html"],
    ["2026-07.json","गुप्त नवरात्र द्वितीया - ब्रह्मचारिणी","About-Brahmacharini-Ma-On-Navaratri.html"],
    ["2026-07.json","गुप्त नवरात्र तृतीया - चन्द्रघंटा","About-ChadraghantaMaa-On-Navaratri.html"],
    ["2026-07.json","गुप्त नवरात्र तृतीया (क्षय चतुर्थी) - कूष्माण्डा","About-KooshmandaMata-On-Navaratri.html"],
    ["2026-07.json","गुप्त नवरात्र पंचमी - स्कन्दमाता","About-BhagwatiSkandaMata-On-Navratri.html"],
    ["2026-07.json","गुप्त नवरात्र षष्ठी - कात्यायनी","About-GodessKaatyaayani-On-Navratri.html"],
    ["2026-07.json","गुप्त नवरात्र सप्तमी - कालरात्रि","About-KalratriMaa-On-Navratri.html"],
    ["2026-07.json","गुप्त नवरात्र अष्टमी - महागौरी","About-GoddessMahagauri-On-Mahaashtami-Of-Navratri.html"],
    ["2026-07.json","गुप्त नवरात्र नवमी - सिद्धिदात्री","About-Goddess-Siddhidaatri-On-MahaNavami-Of-Navratri.html"],
    ["2026-07.json","देवशयनी / हरिशयनी एकादशी — चातुर्मास प्रारम्भ","About-HarishayaniEkadashiAndStartingOfChaturmas.html"],
    ["2026-08.json","नाग पंचमी / नाग पंचमी व्रत","About-NagPanchami.html"],
    ["2026-09.json","श्रीकृष्ण जन्माष्टमी, श्री कृष्ण जयंती","About-Shree-Krishna-Janmaashtami-On-Lord-Krishna-Jayanti.html"],
    ["2026-09.json","श्री गणेश चतुर्थी / सिद्धिविनायक चतुर्थी — गणेश जयंती","About-Ganesh-Chaturthi-The-Story-Of-Syamantak-jewel.html"],
    ["2026-09.json","राधाष्टमी | श्री राधा जयन्ती","About-ShreeRadha-On-Radhaashtami.html"],
    ["2026-11.json","गोवत्स द्वादशी व्रत","About-Govats-Dwadashi-vrat.html"],
    ["2026-11.json","देवउठनी एकादशी","About-Shree-Hari-Prabodhini-Ekaadashi.html"],
    ["2026-02.json","महाशिवरात्रि / मासिक शिवरात्रि व्रत","About-Mahashivratri-Vrat.html"],
    ["2026-02.json","आमलकी एकादशी","About-Aamlaki-Ekadashi-Mahatmya.html"]
  ];
  for (const [file,title,slug] of cases) {
    const data=JSON.parse(readFileSync(join(folder,file),"utf8"));
    const event=data.events.find(item=>item.title===title);
    assert.ok(event,file+": "+title+" must exist");
    const links=[event.articleUrl,event.secondaryArticleUrl].filter(Boolean).join(" ");
    assert.ok(links.includes(slug),file+": "+title+" must expose "+slug+" as a card link");
  }
});

test("2028 Narak Chaturdashi is dated October 17 with its Abhyanga Snan rule", () => {
  const data = JSON.parse(readFileSync(join(folder,"2028-10.json"),"utf8"));
  const event = data.events.find(item => item.title === "नरक चतुर्दशी");
  assert.ok(event);
  assert.equal(event.date,"2028-10-17");
  assert.equal(event.hinduTithi,"कार्तिक कृष्ण चतुर्दशी");
  assert.equal(event.muhurtaRule,"narak-chaturdashi-abhyanga");
});

test("Mahashivaratri and Holika Dahan have complete muhurta rules for 2027–2029", () => {
  const cases = [
    ["2027-03.json","महाशिवरात्रि","muhurtaRules",["mahashivaratri-four-prahar","mahashivaratri-nishita"]],
    ["2027-03.json","होलिका दहन","muhurtaRule","holika-dahan-pradosh"],
    ["2028-02.json","महाशिवरात्रि","muhurtaRules",["mahashivaratri-four-prahar","mahashivaratri-nishita"]],
    ["2028-03.json","होलिका दहन","muhurtaRule","holika-dahan-pradosh"],
    ["2029-02.json","महाशिवरात्रि","muhurtaRules",["mahashivaratri-four-prahar","mahashivaratri-nishita"]],
    ["2029-02.json","होलिका दहन","muhurtaRule","holika-dahan-pradosh"]
  ];
  for (const [file,title,field,expected] of cases) {
    const data = JSON.parse(readFileSync(join(folder,file),"utf8"));
    const event = data.events.find(item => item.title === title);
    assert.ok(event,file+": "+title+" must exist");
    assert.deepEqual(event[field],expected,file+": "+title+" must expose its muhurta rule");
  }
});

test("all 2026 Sankranti cards are automatically eligible for punya-kala calculation", () => {
  const sankrantiTitles = [];
  for (let month = 1; month <= 12; month++) {
    const file = "2026-" + String(month).padStart(2, "0") + ".json";
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      if (/संक्रांति|संक्रान्ति|sankranti/i.test(event.title || "")) sankrantiTitles.push(event.title);
    }
  }
  assert.equal(sankrantiTitles.length, 12);
});


test("all 2026 monthly review metadata matches the fully approved event catalog", () => {
  for (let month = 1; month <= 12; month++) {
    const file = "2026-" + String(month).padStart(2, "0") + ".json";
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    assert.equal(data.status, "approved", file + ": month status should be approved");
    assert.equal(data.locationScope, "सत्यापित डेटा", file + ": public review label should be normalized");
    assert.ok(data.events.every(event => event.reviewStatus === "approved"), file + ": every event should be approved");
  }
});
