import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const genericLabels = new Set([
  "लेख पढ़ें", "पढ़ें", "यहाँ क्लिक करें", "यहां क्लिक करें",
  "अधिक जानकारी", "और पढ़ें", "विस्तार से पढ़ें", "जानें", "क्लिक करें"
]);

test("2026–2030 festival article links use descriptive visible text", async () => {
  for (let year = 2026; year <= 2030; year++) {
    for (let month = 1; month <= 12; month++) {
      const key = String(year) + "-" + String(month).padStart(2, "0");
      const data = JSON.parse(await readFile(
        new URL("../data/festivals/" + key + ".json", import.meta.url),
        "utf8"
      ));
      for (const event of data.events || []) {
        for (const [urlField, labelField] of [
          ["articleUrl", "articleLabel"],
          ["secondaryArticleUrl", "secondaryArticleLabel"]
        ]) {
          if (event[urlField]) {
            assert.ok(String(event[labelField] || "").trim(),
              key + " " + event.title + " has an article URL without a label");
            assert.ok(!genericLabels.has(String(event[labelField]).trim()),
              key + " " + event.title + " has a generic metadata label");
          }
        }
        for (const match of String(event.description || "").matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
          const label = match[1].replace(/<[^>]+>/g, "").trim();
          assert.ok(label, key + " " + event.title + " has an empty inline article link");
          assert.ok(!genericLabels.has(label),
            key + " " + event.title + " has a generic inline link label: " + label);
        }
      }
    }
  }
});
