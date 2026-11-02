import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = async (year, month) => JSON.parse(await readFile(
  new URL(`../data/festivals/${year}-${String(month).padStart(2, "0")}.json`, import.meta.url),
  "utf8"
));

test("Ganesh Chaturthi exposes the Madhyahna muhurta in every catalog year", async () => {
  const cases = [
    [2026, 9, "2026-09-14"],
    [2027, 9, "2027-09-04"],
    [2028, 8, "2028-08-23"],
    [2029, 9, "2029-09-11"],
    [2030, 9, "2030-09-01"]
  ];
  for (const [year, month, date] of cases) {
    const data = await read(year, month);
    const event = data.events.find(item => item.date === date && /गणेश चतुर्थी/.test(item.title || ""));
    assert.ok(event, `Ganesh Chaturthi record exists for ${year}`);
    assert.equal(event.muhurtaRule, "vinayaka-chaturthi-madhyahna", String(year));
  }
});
