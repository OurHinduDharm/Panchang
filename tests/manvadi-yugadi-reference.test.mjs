import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reference = JSON.parse(await readFile(
  new URL("../data/references/taraprasad-2084-manvadi-yugadi.json", import.meta.url),
  "utf8"
));

test("Taraprasad 2084 Manvadi/Yugadi list remains reference-only until convention and decision window are verified", () => {
  assert.match(reference.source, /पृष्ठ 15/);
  assert.equal(reference.status, "reference-only");
  assert.equal(reference.monthConvention, "unverified");
  assert.equal(reference.decisionWindow, "unverified");
  assert.ok(reference.significance.includes("श्राद्ध"));
  assert.equal(reference.records.length, 18);
  assert.ok(reference.records.every(row =>
    !Object.hasOwn(row, "date") &&
    !Object.hasOwn(row, "gregorianDate") &&
    !Object.hasOwn(row, "selectedDate")
  ));
});

test("all 14 Manvadi and 4 Yugadi entries preserve their printed tithi labels", () => {
  const counts = reference.records.reduce((acc, row) => {
    acc[row.kind] = (acc[row.kind] || 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(counts, { manvadi: 14, yugadi: 4 });

  const identities = new Set();
  for (const row of reference.records) {
    assert.ok(["manvadi", "yugadi"].includes(row.kind));
    assert.ok(typeof row.name === "string" && row.name.trim());
    assert.ok(typeof row.month === "string" && row.month.trim());
    assert.ok(["शुक्ल", "कृष्ण"].includes(row.paksha));
    assert.ok(Number.isInteger(row.tithi) && row.tithi >= 1 && row.tithi <= 15);

    const key = row.kind + "|" + row.name;
    assert.equal(identities.has(key), false, "duplicate identity: " + key);
    identities.add(key);

    const expectedPrinted = row.tithi === 15
      ? (row.paksha === "शुक्ल" ? "पूर्णिमा" : "अमावस्या")
      : String(row.tithi);
    assert.equal(row.printedTithi, expectedPrinted, row.name);
  }
});

test("the two Navami references remain independently represented", () => {
  const daksha = reference.records.find(row => row.kind === "manvadi" && row.name === "दक्षसावर्णि");
  const treta = reference.records.find(row => row.kind === "yugadi" && row.name === "त्रेतायुग");
  assert.deepEqual(
    { month: daksha?.month, paksha: daksha?.paksha, tithi: daksha?.tithi, printedTithi: daksha?.printedTithi },
    { month: "आश्विन", paksha: "शुक्ल", tithi: 9, printedTithi: "9" }
  );
  assert.deepEqual(
    { month: treta?.month, paksha: treta?.paksha, tithi: treta?.tithi, printedTithi: treta?.printedTithi },
    { month: "कार्तिक", paksha: "शुक्ल", tithi: 9, printedTithi: "9" }
  );
});
