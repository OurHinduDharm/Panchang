#!/usr/bin/env node
/**
 * Synchronize stable festival copy and article links from the approved 2026
 * master into matching 2027–2030 cards.
 *
 * Dates, endDate, tithi, review/calculation status, muhurta output and all
 * year-specific fields are deliberately left untouched.
 *
 * Dry run: node scripts/sync-festival-content-from-master.mjs
 * Write:   node scripts/sync-festival-content-from-master.mjs --write
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MASTER_FILE = path.join(ROOT, "data", "festival-content-master.json");
const FESTIVAL_DIR = path.join(ROOT, "data", "festivals");
const YEARS = [2027, 2028, 2029, 2030];

export function normalizeFestivalTitle(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[।॥.,/()–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("hi");
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    url.hash = "";
    url.protocol = "https:";
    url.searchParams.delete("m");
    return url.href;
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function makeSafeAnchor(href, label) {
  let url;
  try { url = new URL(String(href || "")); } catch { return null; }
  if (!["http:", "https:"].includes(url.protocol) || !String(label || "").trim()) return null;
  return {
    href: url.href,
    label: String(label).trim(),
    html: '<a href="' + escapeHtml(url.href) +
      '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(String(label).trim()) + "</a>"
  };
}

function extractAnchors(html) {
  const anchors = [];
  for (const match of String(html || "").matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    // Escape leftover angle brackets too, including malformed "<script" fragments.
    const label = match[2].replace(/<[^>]*>/g, "").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").trim();
    const safe = makeSafeAnchor(href, label);
    if (safe) anchors.push(safe);
  }
  return anchors;
}

function appendMissingAnchors(description, anchors) {
  let result = String(description || "").trim();
  const present = new Set(extractAnchors(result).map(item => normalizeUrl(item.href)));
  for (const anchor of anchors) {
    const key = normalizeUrl(anchor.href);
    if (!key || present.has(key)) continue;
    result = [result, anchor.html].filter(Boolean).join(" ");
    present.add(key);
  }
  return result;
}

function hasYearSpecificCopy(value) {
  const text = String(value || "")
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<[^>]*>/g, " ");
  return /(?:\d{1,2}[:.]\d{2}|\d{4}|[०-९]{1,4}|(?:जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)\s+[०-९\d]{1,2})/i.test(text);
}

const ALIASES = new Map([
  ["षटतिला एकादशी", "षट्तिला एकादशी"],
  ["संकष्टी चतुर्थी", "सकट चौथ"],
  ["माघ शुक्ल पंचमी", "वसंत पंचमी"]
]);

function makeTemplateIndex(templates) {
  const index = new Map();
  for (const template of templates || []) {
    const key = normalizeFestivalTitle(template.key || template.title);
    if (!key) continue;
    const current = index.get(key);
    const score = item =>
      (item.description || "").length +
      (item.articleUrl ? 300 : 0) +
      (item.secondaryArticleUrl ? 300 : 0);
    if (!current || score(template) > score(current)) index.set(key, template);
  }
  return index;
}

function findTemplate(event, index) {
  const key = normalizeFestivalTitle(event?.title);
  if (!key) return null;
  if (index.has(key)) return index.get(key);

  const alias = ALIASES.get(key);
  if (alias && index.has(normalizeFestivalTitle(alias))) return index.get(normalizeFestivalTitle(alias));

  const candidates = [...index.entries()]
    .filter(([candidate]) =>
      Math.min(candidate.length, key.length) >= 9 &&
      (key.includes(candidate) || candidate.includes(key))
    )
    .sort((a, b) => Math.min(b[0].length, key.length) - Math.min(a[0].length, key.length));
  if (!candidates.length) return null;
  if (candidates.length > 1 &&
      Math.min(candidates[0][0].length, key.length) === Math.min(candidates[1][0].length, key.length)) {
    return null;
  }
  return candidates[0][1];
}

function addArticle(target, url, label) {
  if (!url || !label) return false;
  const wanted = normalizeUrl(url);
  const existing = [target.articleUrl, target.secondaryArticleUrl].map(normalizeUrl);
  if (existing.includes(wanted)) return false;

  if (!target.articleUrl) {
    target.articleUrl = url;
    target.articleLabel = label;
    return true;
  }
  if (!target.secondaryArticleUrl) {
    target.secondaryArticleUrl = url;
    target.secondaryArticleLabel = label;
    return true;
  }
  const safeAnchor = makeSafeAnchor(url, label);
  if (!safeAnchor) return false;
  target.description = appendMissingAnchors(target.description, [safeAnchor]);
  return true;
}

export function synchronizeEventContent(event, template) {
  const before = JSON.stringify(event);
  const oldDescription = String(event.description || "");
  const masterAnchors = extractAnchors(template.description || "");

  // Existing year-specific copy can contain reviewed observance details.
  // Never replace it with a generic master paragraph. Use the master text
  // only when a matching card has no description; otherwise merge article links.
  if (!oldDescription && template.description) {
    event.description = template.description;
  } else if (masterAnchors.length) {
    event.description = appendMissingAnchors(oldDescription, masterAnchors);
  }

  addArticle(event, template.articleUrl, template.articleLabel);
  addArticle(event, template.secondaryArticleUrl, template.secondaryArticleLabel);

  // Dates, tithis, review/calculation states and muhurta rules remain untouched.
  return before !== JSON.stringify(event);
}

export function syncYearFiles(root, master, years = YEARS) {
  const index = makeTemplateIndex(master.templates);
  const report = { years: [], matched: 0, updated: 0, unmatched: [] };

  for (const year of years) {
    let yearMatched = 0, yearUpdated = 0;
    for (let month = 1; month <= 12; month += 1) {
      const file = path.join(root, "data", "festivals",
        year + "-" + String(month).padStart(2, "0") + ".json");
      if (!fs.existsSync(file)) continue;
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      let changed = false;
      for (const event of data.events || []) {
        const template = findTemplate(event, index);
        if (!template) {
          report.unmatched.push({ year, month, title: event.title || "" });
          continue;
        }
        yearMatched += 1;
        if (synchronizeEventContent(event, template)) {
          yearUpdated += 1;
          changed = true;
        }
      }
      if (changed && process.argv.includes("--write")) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
      }
    }
    report.years.push({ year, matched: yearMatched, updated: yearUpdated });
    report.matched += yearMatched;
    report.updated += yearUpdated;
  }
  return report;
}

function main() {
  const master = JSON.parse(fs.readFileSync(MASTER_FILE, "utf8"));
  if (master.schemaVersion !== 1 || master.sourceYear !== 2026 || !Array.isArray(master.templates)) {
    throw new Error("The 2026 festival content master has an unsupported schema.");
  }
  const report = syncYearFiles(ROOT, master);
  process.stdout.write(JSON.stringify({
    mode: process.argv.includes("--write") ? "write" : "dry-run",
    ...report
  }, null, 2) + "\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
