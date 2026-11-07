import test from "node:test";
import assert from "node:assert/strict";
import { detectFestivalCandidates } from "../festival-detector.mjs";

const day = (date, sunrise, noon = sunrise) => ({
  date, masa: "कार्तिक", paksha: "कृष्ण पक्ष", tithi: noon, noonTithi: noon,
  sunriseTithi: { tithi: sunrise, paksha: "कृष्ण पक्ष", masa: "कार्तिक" }
});

test("matches Hindi and English tithi aliases without loose substring guessing", () => {
  const result = detectFestivalCandidates({
    name: "मासिक कालाष्टमी",
    date: { start: "2026-10-03", tithi: "कृष्ण अष्टमी", month: "आश्विन" },
    sourceRecord: { hinduTithi: "आश्विन कृष्ण अष्टमी" }
  }, [
    { ...day("2026-10-03", "अष्टमी"), masa: "आश्विन", sunriseTithi: { tithi: "अष्टमी", paksha: "कृष्ण पक्ष", masa: "आश्विन" } },
    day("2026-10-04", "नवमी")
  ]);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].date, "2026-10-03");
  assert.equal(result.candidates[0].matchStrength, "sunrise-supported");
  assert.equal(result.recordedDateCheck.tithiMatched, true);
  assert.equal(result.autoApproved, false);
});

test("finds both sunrise days when a tithi spans two sunrises and refuses to choose one", () => {
  const result = detectFestivalCandidates({
    date: { start: "2026-08-01", tithi: "द्वादशी", month: "श्रावण" },
    sourceRecord: { hinduTithi: "शुक्ल द्वादशी" }
  }, [
    { ...day("2026-08-01", "द्वादशी"), paksha: "शुक्ल पक्ष", sunriseTithi: { tithi: "द्वादशी", paksha: "शुक्ल पक्ष", masa: "श्रावण" } },
    { ...day("2026-08-02", "द्वादशी"), paksha: "शुक्ल पक्ष", sunriseTithi: { tithi: "द्वादशी", paksha: "शुक्ल पक्ष", masa: "श्रावण" } }
  ]);
  assert.equal(result.candidates.length, 2);
  assert.ok(result.warnings.includes("multiple-observance-days-require-festival-specific-rule"));
  assert.equal(result.finalDate, null);
});

test("filters wrong paksha and wrong lunar month", () => {
  const result = detectFestivalCandidates({
    date: { tithi: "कृष्ण अष्टमी", month: "भाद्रपद" },
    sourceRecord: { hinduTithi: "भाद्रपद कृष्ण अष्टमी" }
  }, [
    { ...day("2026-08-01", "अष्टमी"), masa: "श्रावण", sunriseTithi: { tithi: "अष्टमी", paksha: "कृष्ण पक्ष", masa: "श्रावण" } },
    { ...day("2026-08-02", "अष्टमी"), masa: "भाद्रपद", paksha: "शुक्ल पक्ष", sunriseTithi: { tithi: "अष्टमी", paksha: "शुक्ल पक्ष", masa: "भाद्रपद" } },
    { ...day("2026-08-03", "अष्टमी"), masa: "भाद्रपद", paksha: "कृष्ण पक्ष", sunriseTithi: { tithi: "अष्टमी", paksha: "कृष्ण पक्ष", masa: "भाद्रपद" } }
  ]);
  assert.deepEqual(result.candidates.map(item => item.date), ["2026-08-03"]);
});

test("does not silently use the recorded date when tithi evidence does not match", () => {
  const result = detectFestivalCandidates({
    date: { start: "2026-08-01", tithi: "एकादशी", month: "श्रावण" },
    sourceRecord: { hinduTithi: "श्रावण शुक्ल एकादशी" }
  }, [day("2026-08-01", "द्वादशी")]);
  assert.equal(result.candidates.length, 0);
  assert.equal(result.recordedDateCheck.scanned, true);
  assert.equal(result.recordedDateCheck.tithiMatched, false);
  assert.ok(result.warnings.includes("recorded-date-not-confirmed-by-tithi-scan"));
});

test("missing paksha or month creates warnings and never auto-approves", () => {
  const result = detectFestivalCandidates({ date: { tithi: "Ekadashi" } }, [
    { date: "2026-01-01", tithi: "एकादशी", masa: "माघ", paksha: "शुक्ल पक्ष" }
  ]);
  assert.ok(result.warnings.includes("paksha-metadata-missing"));
  assert.ok(result.warnings.includes("month-metadata-missing-or-unknown"));
  assert.equal(result.autoApproved, false);
});

test("ambiguous generic tithi label is rejected instead of guessed", () => {
  const result = detectFestivalCandidates({
    date: { tithi: "पूर्णिमा/अमावस्या", month: "कार्तिक" }
  }, [day("2026-11-01", "पूर्णिमा"), day("2026-11-15", "अमावस्या")]);
  assert.equal(result.candidates.length, 0);
  assert.ok(result.warnings.includes("tithi-metadata-missing-or-ambiguous"));
});

test("Adhika month is not confused with the regular month", () => {
  const result = detectFestivalCandidates({
    date: { tithi: "अमावस्या", month: "अधिक ज्येष्ठ" },
    sourceRecord: { hinduTithi: "अधिक ज्येष्ठ कृष्ण अमावस्या" }
  }, [
    { date: "2026-06-01", masa: "ज्येष्ठ", sunriseTithi: { tithi: "अमावस्या", paksha: "कृष्ण पक्ष", masa: "ज्येष्ठ" } },
    { date: "2026-06-02", masa: "अधिक ज्येष्ठ", sunriseTithi: { tithi: "अमावस्या", paksha: "कृष्ण पक्ष", masa: "अधिक ज्येष्ठ" } }
  ]);
  assert.deepEqual(result.candidates.map(item => item.date), ["2026-06-02"]);
});

test("candidate detector does not mutate events or daily Panchang records", () => {
  const event = { date: { tithi: "कृष्ण अष्टमी", month: "आश्विन" }, sourceRecord: { hinduTithi: "आश्विन कृष्ण अष्टमी" } };
  const days = [day("2026-10-03", "अष्टमी")];
  const before = JSON.stringify({ event, days });
  detectFestivalCandidates(event, days);
  assert.equal(JSON.stringify({ event, days }), before);
});
