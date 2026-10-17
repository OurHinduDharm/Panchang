#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { classifyFestivalReview } from "./festival-auto-review.mjs";

const args = process.argv.slice(2);
const inputDir = resolve(args.find(arg => !arg.startsWith("--")) || "data/festivals");
const option = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const evidencePath = option("--evidence");
const outputPath = option("--out");
const evidenceMap = evidencePath ? JSON.parse(readFileSync(resolve(evidencePath), "utf8")) : {};
const files = readdirSync(inputDir).filter(name => /^\d{4}-\d{2}\.json$/.test(name)).sort();
const report = [];

for (const file of files) {
  const data = JSON.parse(readFileSync(join(inputDir, file), "utf8"));
  for (const event of data.events || []) {
    const key = `${event.date || ""}|${event.title || ""}`;
    const evidence = evidenceMap[key] || {};
    const result = classifyFestivalReview(event, evidence, evidence.ruleProfile || {});
    report.push({
      key, monthFile: basename(file), title: event.title || "", date: event.date || null,
      currentReviewStatus: event.reviewStatus || "unset",
      proposedStatus: result.status, reasons: result.reasons
    });
  }
}
const counts = report.reduce((acc, item) => {
  acc[item.proposedStatus] = (acc[item.proposedStatus] || 0) + 1;
  return acc;
}, {});
const output = JSON.stringify({
  generatedAt: new Date().toISOString(), mode: "read-only; source files unchanged",
  inputDirectory: inputDir, evidenceFile: evidencePath ? resolve(evidencePath) : null,
  totalEvents: report.length, counts, events: report
}, null, 2);
if (outputPath) writeFileSync(resolve(outputPath), output + "\n");
else process.stdout.write(output + "\n");
