/**
 * OurHinduDharm — conservative festival date candidate detector.
 *
 * This module discovers matching Panchang days. It does NOT decide a vrata
 * date, certify a shastriya rule, or auto-approve a festival. The final date
 * still requires an explicit observance rule and source review.
 */
const TITHIS = [
  { index: 1, name: "प्रतिपदा", aliases: ["प्रतिपदा", "pratipada", "prathama"] },
  { index: 2, name: "द्वितीया", aliases: ["द्वितीया", "द्वितिया", "dvitiya", "dvitīyā"] },
  { index: 3, name: "तृतीया", aliases: ["तृतीया", "tritiya", "tṛtīyā"] },
  { index: 4, name: "चतुर्थी", aliases: ["चतुर्थी", "chaturthi", "caturthī"] },
  { index: 5, name: "पञ्चमी", aliases: ["पञ्चमी", "पंचमी", "panchami", "pañcamī"] },
  { index: 6, name: "षष्ठी", aliases: ["षष्ठी", "षष्ठि", "shashthi", "sashti", "ṣaṣṭhī"] },
  { index: 7, name: "सप्तमी", aliases: ["सप्तमी", "saptami", "saptamī"] },
  { index: 8, name: "अष्टमी", aliases: ["अष्टमी", "ashtami", "aṣṭamī"] },
  { index: 9, name: "नवमी", aliases: ["नवमी", "navami", "navamī"] },
  { index: 10, name: "दशमी", aliases: ["दशमी", "dashami", "daśamī"] },
  { index: 11, name: "एकादशी", aliases: ["एकादशी", "ekadashi", "ekādaśī"] },
  { index: 12, name: "द्वादशी", aliases: ["द्वादशी", "dwadashi", "dvādaśī"] },
  { index: 13, name: "त्रयोदशी", aliases: ["त्रयोदशी", "trayodashi", "trayodaśī"] },
  { index: 14, name: "चतुर्दशी", aliases: ["चतुर्दशी", "chaturdashi", "caturdaśī"] },
  { index: 15, name: "पूर्णिमा", aliases: ["पूर्णिमा", "पूर्णमासी", "purnima", "pūrṇimā", "poornima"] },
  { index: 30, name: "अमावस्या", aliases: ["अमावस्या", "अमावस", "amavasya", "amāvasyā"] }
].flatMap(item => item.aliases.map(alias => ({ ...item, alias })))
  .sort((a, b) => b.alias.length - a.alias.length);

const MONTHS = [
  ["चैत्र", ["चैत्र", "chaitra"]],
  ["वैशाख", ["वैशाख", "vaishakha", "vaisakha"]],
  ["ज्येष्ठ", ["ज्येष्ठ", "ज्येष्ठा", "jyeshtha", "jyestha"]],
  ["आषाढ़", ["आषाढ़", "आषाढ", "ashadha", "aṣāḍha"]],
  ["श्रावण", ["श्रावण", "सावन", "shravana", "shravan", "sawan"]],
  ["भाद्रपद", ["भाद्रपद", "भादों", "भाद्र", "bhadrapada", "bhadrapad"]],
  ["आश्विन", ["आश्विन", "क्वार", "ashwin", "ashwina", "asvina"]],
  ["कार्तिक", ["कार्तिक", "कातिक", "kartika", "kartik"]],
  ["मार्गशीर्ष", ["मार्गशीर्ष", "अगहन", "मार्गशिर", "margashirsha", "margasira"]],
  ["पौष", ["पौष", "पूस", "pausha", "paush"]],
  ["माघ", ["माघ", "magha"]],
  ["फाल्गुन", ["फाल्गुन", "फागुन", "phalguna", "phalgun"]]
].map(([name, aliases]) => ({ name, aliases: aliases.map(x => x.toLocaleLowerCase("hi")) }));

function clean(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase("hi")
    .replace(/[\u200b-\u200d\ufeff]/g, " ")
    .replace(/[।॥,;:()[\]{}"'’‘“”–—-]/g, " ")
    .replace(/\s+/g, " ").trim();
}
function readValue(value) {
  if (value && typeof value === "object") {
    return value.name ?? value.label ?? value.hindi ?? value.value ?? value.index ?? value.number ?? "";
  }
  return value ?? "";
}
function parsePaksha(value) {
  const text = clean(readValue(value));
  if (/कृष्ण|krishna|krsna|dark|waning/.test(text)) return "कृष्ण पक्ष";
  if (/शुक्ल|shukla|sukla|bright|waxing/.test(text)) return "शुक्ल पक्ष";
  return null;
}
function parseTithi(value, fallbackPaksha = null) {
  const text = clean(readValue(value));
  if (!text || /पूर्णिमा\s*\/\s*अमावस्या|purnima\s*\/\s*amavasya/.test(text)) return null;
  const found = TITHIS.find(item => text.includes(clean(item.alias)));
  if (!found) return null;
  const impliedPaksha = found.index === 15 ? "शुक्ल पक्ष" : found.index === 30 ? "कृष्ण पक्ष" : null;
  return {
    index: found.index,
    name: found.name,
    paksha: parsePaksha(text) || parsePaksha(fallbackPaksha) || impliedPaksha
  };
}
function parseMonth(value) {
  const text = clean(readValue(value));
  if (!text || text === "—" || text === "-") return null;
  const found = MONTHS.find(month => month.aliases.some(alias => text.includes(clean(alias))));
  if (!found) return null;
  return { name: found.name, adhika: /अधिक|adhika|adhik/.test(text) };
}
function observation(day, kind) {
  if (kind === "sunrise") {
    const value = day?.sunriseTithi;
    if (!value) return null;
    return {
      tithi: parseTithi(value.tithi ?? value.name, value.paksha),
      month: parseMonth(value.masa ?? value.month)
    };
  }
  const value = day?.noonTithi || day?.tithi;
  if (!value) return null;
  return { tithi: parseTithi(value, day?.paksha), month: parseMonth(day?.masa) };
}
function sameMonth(expected, actual) {
  if (!expected) return true;
  if (!actual || expected.name !== actual.name) return false;
  return expected.adhika === actual.adhika;
}
function eventDescriptor(event) {
  const sourceTithi = event?.sourceRecord?.hinduTithi || event?.hinduTithi || "";
  const tithiText = sourceTithi || event?.date?.tithi || "";
  const parsed = parseTithi(tithiText, event?.date?.paksha);
  const paksha = parsed?.paksha || parsePaksha(event?.date?.paksha);
  const month = parseMonth(event?.date?.month || event?.hinduMonth) || parseMonth(sourceTithi);
  return {
    tithi: parsed ? { ...parsed, paksha } : null,
    month,
    recordedDate: event?.date?.start || event?.sourceRecord?.date || (typeof event?.date === "string" ? event.date : null)
  };
}

/** Return matching Panchang days as candidates; never select or approve a date. */
export function detectFestivalCandidates(event, days) {
  if (!Array.isArray(days)) throw new TypeError("days must be an array");
  const expected = eventDescriptor(event);
  const warnings = [];
  if (!expected.tithi) warnings.push("tithi-metadata-missing-or-ambiguous");
  if (expected.tithi && !expected.tithi.paksha) warnings.push("paksha-metadata-missing");
  if (!expected.month) warnings.push("month-metadata-missing-or-unknown");
  const byDate = new Map();
  if (expected.tithi) {
    for (const day of days) {
      if (!day || typeof day.date !== "string") continue;
      const matches = [];
      for (const kind of ["sunrise", "noon"]) {
        const observed = observation(day, kind);
        if (!observed?.tithi || observed.tithi.index !== expected.tithi.index) continue;
        if (expected.tithi.paksha && observed.tithi.paksha !== expected.tithi.paksha) continue;
        if (expected.month && !sameMonth(expected.month, observed.month)) continue;
        matches.push(kind);
      }
      if (!matches.length) continue;
      const prior = byDate.get(day.date);
      const combined = [...new Set([...(prior?.matchTypes || []), ...matches])];
      byDate.set(day.date, {
        day, date: day.date, matchTypes: combined,
        matchLabel: combined.includes("sunrise") && combined.includes("noon")
          ? "सूर्योदय और दोपहर — दोनों में तिथि मेल"
          : combined.includes("sunrise") ? "सूर्योदय की तिथि मेल" : "दोपहर की तिथि मेल",
        matchStrength: combined.includes("sunrise") ? "sunrise-supported" : "noon-only",
        decisionStatus: "candidate-only"
      });
    }
  }
  const candidates = [...byDate.values()].sort((a, b) =>
    (a.matchStrength === "sunrise-supported" ? 0 : 1) -
      (b.matchStrength === "sunrise-supported" ? 0 : 1) || a.date.localeCompare(b.date)
  );
  const recorded = expected.recordedDate
    ? days.find(day => day?.date === expected.recordedDate) || null : null;
  const recordedCandidate = candidates.find(item => item.date === expected.recordedDate) || null;
  if (expected.tithi && !candidates.length) warnings.push("no-panchang-day-matches-tithi-paksha-and-month");
  if (expected.recordedDate && !recordedCandidate) warnings.push("recorded-date-not-confirmed-by-tithi-scan");
  if (candidates.length > 1) warnings.push("multiple-observance-days-require-festival-specific-rule");
  return {
    status: candidates.length ? "candidates-found-needs-rule-review" : "needs-manual-review",
    candidates,
    expected: { tithi: expected.tithi, month: expected.month, recordedDate: expected.recordedDate },
    recordedDateCheck: expected.recordedDate ? {
      date: expected.recordedDate, scanned: Boolean(recorded), tithiMatched: Boolean(recordedCandidate)
    } : null,
    warnings, finalDate: null, autoApproved: false
  };
}
