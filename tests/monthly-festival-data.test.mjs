import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import { spawnSync } from "node:child_process";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const monthNames = [
  "", "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
];

test("all 36 monthly festival JSON files exist and follow the expected structure", () => {
  let fileCount = 0;
  let eventCount = 0;

  for (let year = 2026; year <= 2028; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthText = String(month).padStart(2, "0");
      const relativePath = `data/festivals/${year}-${monthText}.json`;
      const fullPath = resolve(root, relativePath);
      assert.ok(existsSync(fullPath), `Missing monthly file: ${relativePath}`);

      let data;
      try {
        data = JSON.parse(readFileSync(fullPath, "utf8"));
      } catch (error) {
        assert.fail(`${relativePath} is not valid JSON: ${error.message}`);
      }

      assert.equal(data.schemaVersion, 1, `${relativePath}: schemaVersion`);
      assert.equal(data.year, year, `${relativePath}: year`);
      assert.equal(data.month, month, `${relativePath}: month`);
      assert.equal(data.monthName, monthNames[month], `${relativePath}: monthName`);
      assert.ok(Array.isArray(data.events), `${relativePath}: events must be an array`);
      assert.ok(data.events.length > 0, `${relativePath}: empty calendar month`);

      data.events.forEach((event, index) => {
        const where = `${relativePath} event #${index + 1}`;
        assert.match(String(event.date || ""), /^\d{4}-\d{2}-\d{2}$/, `${where}: date format`);
        assert.equal(event.date.slice(0, 7), `${year}-${monthText}`, `${where}: date must belong to its file month`);
        const parsed = new Date(event.date + "T00:00:00Z");
        assert.ok(!Number.isNaN(parsed.getTime()), `${where}: invalid date`);
        assert.equal(parsed.toISOString().slice(0, 10), event.date, `${where}: impossible calendar date`);
        assert.ok(String(event.title || "").trim(), `${where}: missing title`);
        assert.ok(String(event.description || "").trim(), `${where}: missing description`);
        assert.ok(String(event.category || "").trim(), `${where}: missing category`);

        for (const key of ["articleUrl", "secondaryArticleUrl", "imageUrl"]) {
          if (!event[key]) continue;
          let url;
          try { url = new URL(event[key], "https://ourhindudharm.blogspot.com"); } catch { assert.fail(`${where}: invalid ${key}`); }
          assert.ok(["http:", "https:"].includes(url.protocol), `${where}: unsafe ${key} protocol`);
        }
        eventCount++;
      });
      fileCount++;
    }
  }

  assert.equal(fileCount, 36);
  assert.ok(eventCount > 0);
});

function assertInlineScriptsParse(html, fileName) {
  const scripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi))
    .map(match => ({ attributes: match[1], source: match[2] }))
    .filter(item => item.source.trim());
  assert.ok(scripts.length > 0, fileName + ": expected inline JavaScript");
  scripts.forEach((item, index) => {
    const label = fileName + " inline script " + (index + 1);
    if (/\btype\s*=\s*["']module["']/i.test(item.attributes)) {
      const result = spawnSync(process.execPath, ["--input-type=module", "--check"], {
        input: item.source,
        encoding: "utf8"
      });
      assert.equal(result.status, 0, label + ": " + (result.stderr || "module syntax error"));
    } else {
      assert.doesNotThrow(() => new Script(item.source, { filename: label }));
    }
  });
}

test("monthly preview stays clearly marked as a non-production draft with working filters", () => {
  const page = readFileSync(resolve(root, "monthly-vrat-parv.html"), "utf8");
  assert.match(page, /name="robots" content="noindex,nofollow"/);
  assert.match(page, /ड्राफ्ट प्रीव्यू/);
  assert.match(page, /id="searchInput"/);
  assert.match(page, /id="categoryFilter"/);
  assert.match(page, /id="locationInput"/);
  assert.match(page, /id="locationSearchBtn"/);
  assert.match(page, /nominatim\.openstreetmap\.org\/search/);
  assert.match(page, /selectedLocationInSession=selected/);
  assert.doesNotMatch(page, /localStorage\.(?:setItem|getItem)\(["']ohdPanchangLocation/);
  assert.match(page, /panchangCache\.clear\(\)/);
  assert.match(page, /function applyFilters\(\)/);
  assert.match(page, /item\.hinduTithi/);
  assert.match(page, /item\.muhurtaDate\|\|item\.date/);
  assert.match(page, /parsed\.hostname==="ourhindudharm\.blogspot\.com"/);
  assert.match(page, /parsed\.pathname==="\/p\/grahan-panchang\.html"/);

  assertInlineScriptsParse(page, "monthly-vrat-parv.html");

  const review = readFileSync(resolve(root, "monthly-festival-review.html"), "utf8");
  assert.match(review, /event-description/);
  assert.match(review, /इस तारीख़ पर/);
  assert.match(review, /मेरे निर्देश \/ यहाँ क्या लिखना है/);
  assert.match(review, /instruction:r\.instruction/);
  assertInlineScriptsParse(review, "monthly-festival-review.html");
});

test("monthly festival preview renders text and links without festival images", () => {
  const page = readFileSync(resolve(root, "monthly-vrat-parv.html"), "utf8");
  assert.doesNotMatch(page, /festivalImageModulePromise|appendFestivalImage|image-credit|className="thumb"/);
  assert.doesNotMatch(page, /import\(["']\.\/festival-images\.js["']\)/);
  assert.match(page, /makeLink\(item\.articleUrl,item\.articleLabel\)/);
  assert.match(page, /makeLink\(item\.secondaryArticleUrl,item\.secondaryArticleLabel\)/);
  assert.match(page, /renderDescription\(desc,item\.description\)/);
  assert.match(page, /item\.showReviewStatus!==false/);
});

test("October 2026 reviewed events preserve article links and private review notes stay out of public data", () => {
  const data = JSON.parse(readFileSync(resolve(root, "data/festivals/2026-10.json"), "utf8"));
  const kalashtami = data.events.find(event => event.title === "मासिक कालाष्टमी");
  assert.ok(kalashtami);
  assert.equal(kalashtami.showReviewStatus, false);
  assert.match(kalashtami.description, /रात्रिव्यापिनी अष्टमी/);
  assert.ok(kalashtami.articleUrl);
  assert.ok(data.events.some(event => event.title === "शारदीय नवरात्र महाष्टमी — माँ महागौरी"));
  assert.ok(data.events.some(event => event.title === "शारदीय नवरात्र महानवमी — माँ सिद्धिदात्री"));
  assert.ok(data.events.some(event => event.title === "कार्तिक कृष्ण चतुर्थी — करकचतुर्थी" && event.articleUrl));
  const ghata = data.events.find(event => event.title === "शारदीय नवरात्र प्रारम्भ");
  const kojagari = data.events.find(event => event.title === "कोजागरी पूर्णिमा / शरद पूर्णिमा");
  const karwa = data.events.find(event => event.title === "कार्तिक कृष्ण चतुर्थी — करकचतुर्थी");
  assert.equal(ghata.muhurtaRule, "ghata-sthapana");
  assert.deepEqual(kojagari.muhurtaRules, ["nishita", "moonlight-until-midnight"]);
  assert.equal(karwa.muhurtaRule, "moonrise");
  assert.equal(ghata.hinduTithi, "आश्विन शुक्ल प्रतिपदा");
  assert.equal(kojagari.hinduTithi, "आश्विन शुक्ल पूर्णिमा");
  assert.equal(kojagari.muhurtaDate, "2026-10-25");
  assert.equal(karwa.hinduTithi, "कार्तिक कृष्ण चतुर्थी");
  const september = JSON.parse(readFileSync(resolve(root, "data/festivals/2026-09.json"), "utf8"));
  assert.ok(september.events.some(event => event.date === "2026-09-02" && event.title === "हलषष्ठी (हरछठ)" && event.hinduTithi === "भाद्रपद कृष्ण षष्ठी"));
  assert.ok(september.events.some(event => event.date === "2026-09-17" && event.title === "श्री बलराम जयंती" && event.hinduTithi === "भाद्रपद शुक्ल षष्ठी"));
  const february = JSON.parse(readFileSync(resolve(root, "data/festivals/2026-02.json"), "utf8"));
  assert.equal(february.events.some(event => event.title === "रथ सप्तमी"), false, "duplicate February Ratha Saptami must not remain");
  const march = JSON.parse(readFileSync(resolve(root, "data/festivals/2026-03.json"), "utf8"));
  assert.equal(march.events.some(event => event.date === "2026-03-03" && event.title === "होलिका दहन"), false, "unreviewed duplicate Holika Dahan must not remain");
  const november = JSON.parse(readFileSync(resolve(root, "data/festivals/2026-11.json"), "utf8"));
  assert.ok(november.events.some(event => event.date === "2026-11-07" && event.title === "काली चौदस"));
  assert.equal(november.events.some(event => event.date === "2026-11-10" && /भैया दूज/.test(event.title)), false);
  const december = JSON.parse(readFileSync(resolve(root, "data/festivals/2026-12.json"), "utf8"));
  assert.ok(december.events.some(event => event.date === "2026-12-01" && /कालभैरव जयंती/.test(event.title) && event.hinduTithi === "मार्गशीर्ष कृष्ण अष्टमी"));
  for (const event of data.events) {
    assert.equal(Object.hasOwn(event, "instruction"), false, "private review instruction must not be public");
  }
});


test("2026 lunar tithi labels and all monthly Kalashtami dates are present", () => {
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const events = months.flatMap(month => {
    const file = resolve(root, "data", "festivals", `2026-${String(month).padStart(2, "0")}.json`);
    return JSON.parse(readFileSync(file, "utf8")).events;
  });
  const expectedKalashtami = [
    "2026-01-10", "2026-02-09", "2026-03-11", "2026-04-10",
    "2026-05-09", "2026-06-08", "2026-07-07", "2026-08-05",
    "2026-09-04", "2026-10-03", "2026-11-01", "2026-12-01",
    "2026-12-30"
  ];
  for (const date of expectedKalashtami) {
    const event = events.find(item => item.date === date && /कालाष्टमी/.test(item.title || ""));
    assert.ok(event, `missing Kalashtami entry for ${date}`);
    assert.ok(event.hinduTithi, `missing Hindu tithi for Kalashtami on ${date}`);
    assert.match(event.description || "", /रात्रिव्यापिनी अष्टमी/);
    assert.ok(event.articleUrl);
    assert.equal(event.showReviewStatus, false);
  }
  const lunarTithiInTitle = /(एकादशी|पूर्णिमा|अमावस्या|अमावास्या|अष्टमी|नवमी|चतुर्थी|पंचमी|षष्ठी|सप्तमी|द्वादशी|त्रयोदशी|चतुर्दशी|प्रतिपदा|तृतीया|द्वितीया)/;
  for (const event of events) {
    if (lunarTithiInTitle.test(event.title || "")) {
      assert.ok(event.hinduTithi, `missing Hindu tithi: ${event.date} ${event.title}`);
    }
  }
  const exactKeys = events.map(event => `${event.date}|${event.title}`);
  assert.equal(new Set(exactKeys).size, exactKeys.length, "exact date/title duplicates should be consolidated");
  assert.ok(events.some(event => event.date === "2026-01-14" && event.title === "षट्तिला एकादशी" && event.hinduTithi === "माघ कृष्ण एकादशी"));
  assert.ok(events.some(event => event.date === "2026-06-24" && event.title === "बटुक भैरव जयंती" && event.hinduTithi === "ज्येष्ठ शुक्ल दशमी"));
  assert.ok(events.some(event => event.date === "2026-09-17" && event.title === "श्री बलराम जयंती" && event.hinduTithi === "भाद्रपद शुक्ल षष्ठी"));
  assert.ok(events.some(event => event.date === "2026-10-06" && event.title === "इंदिरा एकादशी"));
  assert.ok(events.some(event => event.date === "2026-10-22" && event.title === "पापांकुशा एकादशी"));
  assert.ok(events.some(event => event.date === "2026-11-20" && event.title === "कंस वध"));
  const page = readFileSync(resolve(root, "monthly-vrat-parv.html"), "utf8");
  assert.match(page, /dateObj\.getDay\(\)/, "weekday should be derived from the actual date");
});
