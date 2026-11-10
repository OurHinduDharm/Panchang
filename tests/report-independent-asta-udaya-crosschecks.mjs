import { readFile } from "node:fs/promises";

const [drik, independent] = await Promise.all([
  readFile(new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/independent-asta-udaya-crosschecks-2026-2027.json", import.meta.url), "utf8").then(JSON.parse)
]);

const targetCity = "New Delhi, NCT, India";
const drikRows = drik.windows.filter(row =>
  row.sourceLocation === targetCity &&
  row.acceptanceEligible &&
  row.sourceStatus === "direct-page-captured-browser-verified"
);
const toMillis = value => Date.parse(value);
const signedMinutes = (predicted, reference) =>
  Math.round((toMillis(predicted) - toMillis(reference)) / 60000);
const datePart = value => value.slice(0, 10);
const clockPart = value => value.slice(11, 16);

const panchangGuru = independent.sources.find(source => source.id === "panchang-guru-trikala");
const used = new Set();
const comparisons = panchangGuru.windows.map(reference => {
  const candidates = drikRows.filter(row => row.planet === reference.planet);
  const match = candidates.map(row => ({
    row,
    score:
      Math.abs(signedMinutes(row.boundaries.astaStart.normalizedLocalDateTime, reference.astaStart)) +
      Math.abs(signedMinutes(row.boundaries.astaEnd.normalizedLocalDateTime, reference.astaEnd))
  })).filter(item => !used.has(item.row.id))
    .sort((a, b) => a.score - b.score);
  const best = candidates.length ? match[0] : null;
  if (!best) return { source: panchangGuru.id, planet: reference.planet, labelYear: reference.labelYear, matched: false };
  used.add(best.row.id);
  const start = best.row.boundaries.astaStart.normalizedLocalDateTime;
  const end = best.row.boundaries.astaEnd.normalizedLocalDateTime;
  return {
    source: panchangGuru.id,
    planet: reference.planet,
    labelYear: reference.labelYear,
    drikWindowId: best.row.id,
    matched: true,
    asta: {
      sourceLocal: reference.astaStart,
      drikLocal: start,
      signedDifferenceMinutes: signedMinutes(reference.astaStart, start),
      sameCivilDate: datePart(reference.astaStart) === datePart(start),
      sameClockMinute: clockPart(reference.astaStart) === clockPart(start)
    },
    udaya: {
      sourceLocal: reference.astaEnd,
      drikLocal: end,
      signedDifferenceMinutes: signedMinutes(reference.astaEnd, end),
      sameCivilDate: datePart(reference.astaEnd) === datePart(end),
      sameClockMinute: clockPart(reference.astaEnd) === clockPart(end)
    }
  };
});

const matched = comparisons.filter(row => row.matched);
const errors = matched.flatMap(row => [
  row.asta.signedDifferenceMinutes,
  row.udaya.signedDifferenceMinutes
]);
const abs = errors.map(Math.abs);
const summary = {
  source: panchangGuru.name,
  comparisonCity: targetCity,
  matchedWindows: matched.length,
  comparedBoundaries: errors.length,
  exactInstantBoundaries: errors.filter(value => value === 0).length,
  withinFiveMinutes: errors.filter(value => Math.abs(value) <= 5).length,
  dateMismatches: matched.reduce((sum, row) =>
    sum + Number(!row.asta.sameCivilDate) + Number(!row.udaya.sameCivilDate), 0),
  meanAbsoluteDifferenceMinutes: abs.length
    ? Number((abs.reduce((sum, value) => sum + value, 0) / abs.length).toFixed(2))
    : null,
  maximumAbsoluteDifferenceMinutes: abs.length ? Math.max(...abs) : null
};

const imd = independent.sources.find(source => source.id === "rashtriya-panchang-imd-heliacal");
console.log(JSON.stringify({
  title: "Independent source cross-check report",
  generatedAt: new Date().toISOString(),
  panchangGuruVsDrik: { summary, comparisons },
  imdHeliacal: {
    source: imd.name,
    eventCount: imd.events.length,
    eventModel: imd.method.eventMeaning,
    comparisonPolicy: "Do not force-match these heliacal labels to Drik Asta/Udaya windows. First compare them against an independent topocentric ephemeris and retain the Central Station location caveat.",
    events: imd.events
  },
  classicalAlternative: {
    source: "TathaAstu API",
    status: "method documented; no authenticated endpoint response captured",
    use: "Separate Sūrya Siddhānta implementation cross-check only, not a Drik-style visibility substitute."
  },
  releaseDecision: "Research-only. These independent references are not production data and must not be used to fit the model."
}, null, 2));
