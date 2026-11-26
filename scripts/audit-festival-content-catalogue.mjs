import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { extractFestivalCatalogue, restoreFestivalMonths } from "./festival-content-catalogue.mjs";

const months = [];
for (let year = 2026; year <= 2030; year++) {
  for (let month = 1; month <= 12; month++) {
    const filename = `../data/festivals/${year}-${String(month).padStart(2,"0")}.json`;
    const source = JSON.parse(await readFile(new URL(filename, import.meta.url), "utf8"));
    if (source.year !== year || source.month !== month)
      throw new Error("source month identity mismatch: " + filename);
    months.push(source);
  }
}
const catalogue = extractFestivalCatalogue(months);
if (!isDeepStrictEqual(restoreFestivalMonths(catalogue), months))
  throw new Error("lossless reconstruction failed");
const total = months.reduce((sum, month) => sum + month.events.length, 0);
const unique = Object.keys(catalogue.cards).length;
console.log(JSON.stringify({months:months.length, occurrences:total, uniqueDisplayPayloads:unique,
  exactDuplicates:total-unique, roundTrip:"pass", status:"review-only"}, null, 2));
if (process.argv.includes("--emit")) {
  // Explicit opt-in; stdout contains the report above, catalogue goes to stderr.
  // No repository data is overwritten.
  process.stderr.write(JSON.stringify(catalogue,null,2)+"\n");
}
