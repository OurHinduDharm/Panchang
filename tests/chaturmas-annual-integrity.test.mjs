import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const dataDir = new URL("../data/chaturmas/", import.meta.url);
const widget = await readFile(new URL("../festival-widget.js", import.meta.url), "utf8");

function validDate(value) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(value || ""))) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function compare(a, b) {
  return a.localeCompare(b);
}

const files = (await readdir(dataDir))
  .filter(name => /^[0-9]{4}[.]json$/.test(name))
  .sort();

test("annual Chaturmas configs exist and every file is named for its year", () => {
  assert.ok(files.length > 0, "at least one annual Chaturmas config must exist");
});

for (const file of files) {
  test(`Chaturmas ${file.slice(0, 4)} follows the Smarta annual date contract`, async () => {
    const config = JSON.parse(await readFile(new URL(file, dataDir), "utf8"));
    const year = Number(file.slice(0, 4));

    assert.equal(config.year, year, "config year must match filename");
    assert.equal(config.status, "approved");
    assert.ok(config.schemaVersion >= 2, "new annual configs must use schemaVersion 2 or later");
    assert.equal(config.endObservance, "smarta-ekadashi", "Smarta Ekadashi is the sole primary end observance");
    assert.match(config.completionTithi || "", /द्वादशी/, "completion must explicitly identify Dwadashi");
    assert.ok(validDate(config.startDate), "startDate must be a real ISO calendar date");
    assert.ok(validDate(config.endDate), "endDate must be a real ISO calendar date");
    assert.ok(validDate(config.completionDate), "completionDate must be a real ISO calendar date");
    assert.ok(validDate(config.cardVisibleThroughDate), "cardVisibleThroughDate must be a real ISO calendar date");
    assert.ok(compare(config.startDate, config.endDate) <= 0);
    assert.ok(compare(config.endDate, config.completionDate) < 0, "Dwadashi completion must follow Smarta Ekadashi");
    assert.ok(compare(config.completionDate, config.cardVisibleThroughDate) <= 0,
      "card must remain visible through at least the completion date");

    assert.ok(Array.isArray(config.phases) && config.phases.length === 4,
      "all four dietary phases must be present");
    assert.equal(config.phases[0].startDate, config.startDate,
      "first phase must begin on Chaturmas start date");
    assert.equal(config.phases[3].endDate, config.endDate,
      "last phase must end on Smarta Ekadashi date");
    assert.match(config.phases[3].endTithi || "", /एकादशी/,
      "last dietary phase must end on Ekadashi");

    for (let index = 0; index < config.phases.length; index++) {
      const phase = config.phases[index];
      assert.ok(phase.id && phase.title, `phase ${index + 1} needs an id and title`);
      assert.ok(validDate(phase.startDate) && validDate(phase.endDate),
        `phase ${index + 1} dates must be real ISO calendar dates`);
      assert.ok(compare(phase.startDate, phase.endDate) <= 0,
        `phase ${index + 1} must not end before it starts`);
      if (index > 0) {
        assert.equal(phase.startDate, config.phases[index - 1].endDate,
          `phase ${index + 1} must begin on the previous phase transition date`);
      }
    }

    const phaseDetails = config.phases.map(phase => String(phase.detail || "").trim());
    assert.ok(phaseDetails.every(Boolean), "every phase must have a concise instruction");
    assert.equal(new Set(phaseDetails).size, phaseDetails.length,
      "phase descriptions must not be duplicated");
    assert.ok(String(config.completionDetail || "").trim(),
      "completion detail must be present for the Dwadashi observance");
    assert.ok(!/कार्तिक शुक्ल द्वादशी|नवंबर|दिसंबर/.test(config.completionDetail),
      "completion date and tithi belong in their own structured fields, not repeated in the instruction");
  });
}

test("10-day widget gives precedence to Smarta Devutthana Ekadashi over Gauna/Vaishnava entries", () => {
  assert.ok(widget.includes('!/वैष्णव|गौण/i.test(item.title || "")'));
  assert.ok(widget.includes("देवोत्थानी एकादशी (स्मार्त)"));
  assert.ok(widget.includes("/देवोत्थानी|देवउठनी|देवप्रबोधिनी|प्रबोधिनी/i"),
    "the actual approved Smarta title must be recognized when locating the Chaturmas end date");
  assert.ok(widget.includes("cardVisibleThroughDate"));
  assert.ok(widget.includes("chaturmasConfig.completionTithi"));
  assert.ok(widget.includes("व्रत-समापन · "));
});


test("2029 and 2030 Chaturmas boundaries use local sunrise Dwadashi and next-day completion", async () => {
  const expected = {
    2029: { start: "2029-07-21", phases: ["2029-08-21", "2029-09-19", "2029-10-19"], end: "2029-11-16", completion: "2029-11-17", visible: "2029-11-18" },
    2030: { start: "2030-07-11", phases: ["2030-08-10", "2030-09-09", "2030-10-08"], end: "2030-11-05", completion: "2030-11-06", visible: "2030-11-07" }
  };
  for (const [year, dates] of Object.entries(expected)) {
    const config = JSON.parse(await readFile(new URL(`../data/chaturmas/${year}.json`, import.meta.url), "utf8"));
    assert.equal(config.startDate, dates.start);
    assert.deepEqual(config.phases.map(phase => phase.endDate).slice(0, 3), dates.phases);
    assert.equal(config.endDate, dates.end);
    assert.equal(config.completionDate, dates.completion);
    assert.equal(config.cardVisibleThroughDate, dates.visible);
    assert.equal(config.completionTithi, "कार्तिक शुक्ल द्वादशी");
    assert.ok(config.completionDetail.includes("दालों"));
  }
});
