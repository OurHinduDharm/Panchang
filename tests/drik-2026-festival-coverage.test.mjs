import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const month = async (name) => JSON.parse(await readFile(new URL("../data/festivals/2026-" + name + ".json", import.meta.url), "utf8"));
const find = (data, date, pattern) => data.events.find(event => event.date === date && pattern.test(event.title || ""));

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

test("2026 September includes Agastya Arghya", async () => {
  const data = await month("09");
  assert.ok(find(data, "2026-09-07", /अगस्त्य अर्घ्य/));
});
