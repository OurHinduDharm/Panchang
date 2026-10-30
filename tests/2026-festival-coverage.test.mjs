import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const month = async (name) => JSON.parse(await readFile(new URL("../data/festivals/2026-" + name + ".json", import.meta.url), "utf8"));
const find = (data, date, pattern) => data.events.find(event => event.date === date && pattern.test(event.title || ""));
const urls = (event) => [
  event.articleUrl,
  event.secondaryArticleUrl,
  ...[...String(event.description || "").matchAll(/href=["']([^"']+)["']/g)].map(match => match[1])
].filter(Boolean);

test("2026 February includes Kumbha Sankranti", async () => {
  const data = await month("02");
  assert.ok(find(data, "2026-02-13", /कुम्भ संक्रांति/));
});

test("2026 March includes Gauri Puja, Yamuna Chhath and Swaminarayan Jayanti", async () => {
  const data = await month("03");
  assert.ok(find(data, "2026-03-21", /गौरी पूजा/));
  assert.ok(find(data, "2026-03-24", /यमुना छठ/));
  assert.ok(find(data, "2026-03-27", /स्वामिनारायण जयंती/));
});

test("2026 April restores Akshaya Tritiya and both original article links", async () => {
  const data = await month("04");
  const event = find(data, "2026-04-19", /अक्षय तृतीया.*परशुराम जयंती/);
  assert.ok(event);
  assert.match(event.articleUrl || "", /About-Akshaya-Triteeya/);
  assert.match(event.secondaryArticleUrl || "", /About-Lord-Parshuram/);
});

test("2026 April separates Shankaracharya-Surdas and Ramanuja Jayantis", async () => {
  const data = await month("04");
  assert.ok(find(data, "2026-04-21", /शंकराचार्य.*सूरदास/));
  assert.ok(find(data, "2026-04-22", /रामानुजाचार्य/));
});

test("2026 August includes Raksha Bandhan and the Hayagriva article", async () => {
  const data = await month("08");
  const rakhi = find(data, "2026-08-28", /रक्षाबंधन/);
  assert.ok(rakhi);
  assert.ok(find(data, "2026-08-28", /हयग्रीव/).articleUrl);
});

test("2026 October includes Saraswati Avahan and Saraswati Puja", async () => {
  const data = await month("10");
  assert.ok(find(data, "2026-10-16", /सरस्वती.*आवाहन/));
  assert.ok(find(data, "2026-10-17", /सरस्वती पूजा/));
  assert.ok(find(data, "2026-10-19", /सरस्वती विसर्जन/));
});

test("2026 September includes Agastya Arghya and preserves Varaha article", async () => {
  const data = await month("09");
  assert.ok(find(data, "2026-09-07", /अगस्त्य अर्घ्य/));
  assert.match(find(data, "2026-09-13", /वाराहावतार/).articleUrl || "", /About-Lord-Varah/);
});

test("2026 November preserves the Rama Ekadashi article", async () => {
  const data = await month("11");
  assert.match(find(data, "2026-11-05", /रमा एकादशी/).articleUrl || "", /About-Rama-Ekadashi/);
});

test("Every legacy OurHinduDharm article link remains attached to the 2026 catalog", async () => {
  const legacy = JSON.parse(await readFile(new URL("../data/festivals/legacy-source-preserved.json", import.meta.url), "utf8"));
  const names = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const current = await Promise.all(names.map(month));
  const present = new Set(current.flatMap(data => data.events.flatMap(urls)));
  const legacyLinks = new Set((legacy.events || []).filter(event => /^2026-/.test(event.date || "")).flatMap(urls).filter(url => /ourhindudharm\.blogspot\.com/.test(url)));
  const missing = [...legacyLinks].filter(url => !present.has(url));
  assert.deepEqual(missing, []);
});

test("Festival year selector exposes only years with catalog data", async () => {
  const html = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
  assert.match(html, /option value="2026"/);
  assert.match(html, /option value="2029"/);
  assert.doesNotMatch(html, /option value="2025"|option value="2030"/);
});

test("2026 Purnima titles include the corresponding lunar month names", async () => {
  assert.ok(find(await month("03"), "2026-03-03", /फाल्गुन पूर्णिमा/));
  assert.ok(find(await month("05"), "2026-05-01", /वैशाख पूर्णिमा/));
  assert.ok(find(await month("07"), "2026-07-29", /आषाढ़ पूर्णिमा/));
});
