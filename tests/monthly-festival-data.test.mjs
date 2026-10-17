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
  const scripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
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
  assert.match(page, /function applyFilters\(\)/);

  assertInlineScriptsParse(page, "monthly-vrat-parv.html");

  const review = readFileSync(resolve(root, "monthly-festival-review.html"), "utf8");
  assert.match(review, /event-description/);
  assert.match(review, /इस तारीख़ पर/);
  assert.match(review, /मेरे निर्देश \/ यहाँ क्या लिखना है/);
  assert.match(review, /instruction:r\.instruction/);
  assertInlineScriptsParse(review, "monthly-festival-review.html");
});

test("festival images are selected by event type with visible licensing credits", () => {
  const images = readFileSync(resolve(root, "festival-images.js"), "utf8");
  const page = readFileSync(resolve(root, "monthly-vrat-parv.html"), "utf8");
  assert.match(images, /export function getFestivalImage/);
  assert.match(images, /CC BY-SA 4\.0/);
  assert.ok(images.includes("https://thumb.wikimedia.org/wikipedia/commons/thumb/"));
  assert.match(images, /commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(page, /festivalImageModulePromise/);
  assert.match(page, /image-credit/);
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
  for (const event of data.events) {
    assert.equal(Object.hasOwn(event, "instruction"), false, "private review instruction must not be public");
  }
});
