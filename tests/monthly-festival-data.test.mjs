import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

test("monthly preview stays clearly marked as a non-production draft with working filters", () => {
  const page = readFileSync(resolve(root, "monthly-vrat-parv.html"), "utf8");
  assert.match(page, /name="robots" content="noindex,nofollow"/);
  assert.match(page, /ड्राफ्ट प्रीव्यू/);
  assert.match(page, /id="searchInput"/);
  assert.match(page, /id="categoryFilter"/);
  assert.match(page, /function applyFilters\(\)/);

  const review = readFileSync(resolve(root, "monthly-festival-review.html"), "utf8");
  assert.match(review, /event-description/);
  assert.match(review, /इस तारीख़ पर/);
});
