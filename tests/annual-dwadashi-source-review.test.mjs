import test from "node:test";
import assert from "node:assert/strict";
import { normalizeEngineTithi, normalizeEnginePaksha, normalizeEngineMasa, extractDwadashiDay, buildSourceReviewMetadata } from "../scripts/generate-annual-dwadashi-review.mjs";

test("normalizes engine tithi indices to Hindi tithi names", () => {
  assert.equal(normalizeEngineTithi(11), "द्वादशी");
  assert.equal(normalizeEngineTithi(26), "द्वादशी");
  assert.equal(normalizeEngineTithi(10), "एकादशी");
  assert.equal(normalizeEngineTithi(15), "प्रतिपदा");
  assert.equal(normalizeEngineTithi("Dwadashi"), "द्वादशी");
});

test("normalizes paksha and adhika masa without dropping the month", () => {
  assert.equal(normalizeEnginePaksha("Krishna", 11), "कृष्ण पक्ष");
  assert.equal(normalizeEnginePaksha("", 26), "कृष्ण पक्ष");
  assert.equal(normalizeEngineMasa({name:"Jyeshtha",isAdhika:true}), "अधिक ज्येष्ठ");
});

test("extracts local-day tithi interval and sunrise as ISO timestamps", () => {
  const result = extractDwadashiDay({
    tithi:11, paksha:"Shukla", masa:{name:"Ashadha",isAdhika:false},
    sunrise:"2026-07-11T00:01:00.000Z",
    tithiStartTime:"2026-07-10T23:52:00.000Z",
    tithiEndTime:"2026-07-11T23:00:00.000Z"
  }, "2026-07-11");
  assert.equal(result.tithi, "द्वादशी");
  assert.equal(result.paksha, "शुक्ल पक्ष");
  assert.equal(result.masa, "आषाढ़");
  assert.equal(result.sunrise, "2026-07-11T00:01:00.000Z");
});

test("extracts the tithi actually prevailing at noon from the engine transition array", () => {
  const result = extractDwadashiDay({
    tithi:10, paksha:"Shukla", masa:{name:"Margashirsha"},
    sunrise:"2028-11-13T00:50:00.000Z",
    tithis:[{index:11,name:"Dwadashi",startTime:new Date("2028-11-13T01:11:00.000Z"),endTime:new Date("2028-11-13T22:10:00.000Z")}]
  }, "2028-11-13", new Date("2028-11-13T06:30:00.000Z"));
  assert.equal(result.tithi, "एकादशी");
  assert.equal(result.noonTithi, "द्वादशी");
  assert.equal(result.noonTithiStartTime, "2028-11-13T01:11:00.000Z");
});

test("the Padmanabha source traditions remain one tithi with unique internal observance IDs", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const rules = JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), "../data/dwadashi-vrata-rules.json"), "utf8"));
  const item = rules.unifiedTithiIndex.tithis.find(x => x.month === "आश्विन" && x.paksha === "शुक्ल");
  assert.equal(item.observances.length, 2);
  assert.deepEqual(item.observances.map(x => x.id), ["padmanabha-narada","padmanabha-varaha"]);
  assert.equal(item.displayNames.length, 2);
});

test("source metadata distinguishes Pithoragarh primary from New Delhi secondary checks", () => {
  const sources = buildSourceReviewMetadata(2028);
  assert.equal(sources.status, "pending-manual-cross-check");
  assert.match(sources.primary.url, /year=2028/);
  assert.equal(sources.primary.location, "Pithoragarh, Uttarakhand, India");
  assert.equal(sources.independent[0].location, "New Delhi, India");
});
