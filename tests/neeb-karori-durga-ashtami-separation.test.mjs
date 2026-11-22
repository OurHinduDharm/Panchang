import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const cases = [
  ["2026-12.json", "2026-12-17", "17 दिसंबर"],
  ["2027-12.json", "2027-12-06", "6 दिसंबर"],
  ["2028-11.json", "2028-11-24", "24 नवंबर"],
  ["2029-12.json", "2029-12-13", "13 दिसंबर"]
];

test("Neem Karoli Jayanti and monthly Durga Ashtami remain separate cards on shared dates", () => {
  for (const [file, date, dateLabel] of cases) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    const sameDate = data.events.filter(event => event.date === date);
    const durga = sameDate.filter(event => event.title === "मासिक दुर्गाष्टमी");
    const baba = sameDate.filter(event => event.title === "बाबा नीब करौरी जयंती");
    assert.equal(durga.length, 1, file + " must have one independent Durga Ashtami card");
    assert.equal(baba.length, 1, file + " must have one independent Neem Karoli Jayanti card");
    assert.equal(durga[0].dateLabel, dateLabel);
    assert.equal(baba[0].dateLabel, dateLabel);
    assert.equal(durga[0].category, "व्रत");
    assert.equal(baba[0].category, "जयंती");
    assert.equal(durga[0].hinduTithi, "मार्गशीर्ष शुक्ल अष्टमी");
    assert.equal(baba[0].hinduTithi, "मार्गशीर्ष शुक्ल अष्टमी");
    assert.equal(sameDate.some(event => event.title === "मासिक दुर्गाष्टमी / बाबा नीब करौरी जयंती"), false);
  }
});
