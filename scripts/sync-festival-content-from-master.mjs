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
    // Keep the source label as text; makeSafeAnchor always HTML-escapes it before output.
    const label = String(match[2] || "").trim();
    const safe = makeSafeAnchor(href, label);
    if (safe) anchors.push(safe);
  }
  return anchors;
}

function sanitizeDescriptionAnchors(html) {
  return String(html || "").replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_whole, attrs, inner) => {
    const href = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    // Never interpret nested or malformed markup in the label as HTML.
    const label = String(inner || "").trim();
    const safe = makeSafeAnchor(href, label);
    return safe ? safe.html : escapeHtml(label);
  });
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

const ALIASES = new Map([
  ["षटतिला एकादशी", "षट्तिला एकादशी"],
  ["संकष्टी चतुर्थी", "सकट चौथ"],
  ["माघ शुक्ल पंचमी", "वसंत पंचमी"],
  ["रमा एकादशी", "रमा एकादशी व्रत"],
  ["मकर संक्रांति उत्तरायण पोंगल", "मकर संक्रांति सूर्य उत्तरायण प्रारम्भ"],
  ["गोवत्स द्वादशी कृष्ण पद्मनाभ द्वादशी", "गोवत्स द्वादशी व्रत"],
  ["पौष पुत्रदा एकादशी टेलंग स्वामी जयंती", "तैलंग स्वामी जयंती"],
  ["दीपावली लक्ष्मी गणेश पूजन कमला महाविद्या जयंती", "दीपावली लक्ष्मी पूजन"]
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

function findTemplates(event, index) {
  const key = normalizeFestivalTitle(event?.title);
  if (!key) return [];

  // A combined festival card can represent several master observances.
  // Apply every master key that is explicitly present in the card title;
  // do not guess from a longer, only partially matching master title.
  const matches = [...index.entries()]
    .filter(([candidate]) => candidate.length >= 9 && key.includes(candidate))
    .sort((a, b) => b[0].length - a[0].length)
    .map(([, template]) => template);

  const alias = ALIASES.get(key);
  if (alias && index.has(normalizeFestivalTitle(alias))) {
    const template = index.get(normalizeFestivalTitle(alias));
    if (!matches.includes(template)) matches.push(template);
  }
  return matches;
}

export function findMatchingFestivalTemplates(event, templates) {
  return findTemplates(event, makeTemplateIndex(templates));
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
    event.description = sanitizeDescriptionAnchors(template.description);
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
        const templates = findTemplates(event, index);
        if (!templates.length) {
          report.unmatched.push({ year, month, title: event.title || "" });
          continue;
        }
        yearMatched += 1;
        for (const template of templates) {
          if (synchronizeEventContent(event, template)) {
            yearUpdated += 1;
            changed = true;
          }
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
