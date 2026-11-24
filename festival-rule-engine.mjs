/**
 * OurHinduDharm — year-independent festival observance resolver.
 *
 * This is the publication-facing adapter over the existing Panchanga evidence
 * profiles. It never infers a rule from an event title and never auto-approves
 * a date. Callers must provide the explicit ruleId and calculated local-day
 * contexts. Fixed Gregorian dates are accepted only when explicitly declared
 * by the observance catalogue with a source reference.
 */
import {
  getObservanceRuleProfile,
  resolveObservanceCandidates
} from "./festival-observance-rules.mjs";

export const FESTIVAL_RULE_ENGINE_VERSION = "1.0.0";

const TITHI_ORDINAL = new Map([
  ["प्रतिपदा", 0], ["द्वितीया", 1], ["द्वितिया", 1], ["तृतीया", 2],
  ["चतुर्थी", 3], ["पञ्चमी", 4], ["पंचमी", 4], ["षष्ठी", 5], ["सप्तमी", 6],
  ["अष्टमी", 7], ["नवमी", 8], ["दशमी", 9], ["एकादशी", 10],
  ["द्वादशी", 11], ["त्रयोदशी", 12], ["चतुर्दशी", 13], ["पूर्णिमा", 14], ["अमावस्या", 14]
]);

function normalizePaksha(value) {
  const text = String(value ?? "");
  if (/कृष्ण|krishna/i.test(text)) return "कृष्ण पक्ष";
  if (/शुक्ल|shukla/i.test(text)) return "शुक्ल पक्ष";
  return null;
}

function normalizeTithiInterval(row) {
  if (!row || typeof row !== "object") return null;
  if (row.index !== undefined && row.index !== null && row.index !== "" &&
      Number.isInteger(Number(row.index))) {
    const index = Number(row.index);
    if (index < 0 || index > 29) return null;
    const suppliedPaksha = normalizePaksha(row.paksha);
    const expectedPaksha = index >= 15 ? "कृष्ण पक्ष" : "शुक्ल पक्ष";
    if (suppliedPaksha && suppliedPaksha !== expectedPaksha) return null;
    return { ...row, index, paksha: suppliedPaksha ?? expectedPaksha };
  }
  const name = String(row.tithi ?? row.name ?? "").trim();
  const ordinal = TITHI_ORDINAL.get(name);
  if (ordinal === undefined) return null;
  const paksha = normalizePaksha(row.paksha);
  const index = name === "अमावस्या" ? 29 :
    name === "पूर्णिमा" ? 14 : ordinal + (paksha === "कृष्ण पक्ष" ? 15 : 0);
  return { ...row, index, paksha };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validIsoDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const date = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function fail(status, observance, warnings, extra = {}) {
  return {
    engineVersion: FESTIVAL_RULE_ENGINE_VERSION,
    observanceId: observance?.id ?? null,
    ruleId: observance?.ruleId ?? null,
    status,
    selectedDate: null,
    finalDate: null,
    autoApproved: false,
    publishable: false,
    warnings,
    ...extra
  };
}

/**
 * Adapt the annual Panchanga generator's daily records to rule-engine
 * contexts. The source records carry Hindi tithi names; this adapter maps
 * them to the zero-based tithi indices used by the existing rule profiles.
 */
export function buildFestivalRuleContexts(dailyPanchang) {
  if (!Array.isArray(dailyPanchang)) return [];
  const days = dailyPanchang.slice().sort((a, b) => String(a?.date ?? "").localeCompare(String(b?.date ?? "")));
  return days.map((day, index) => {
    const previous = days[index - 1];
    const next = days[index + 1];
    return {
      date: day?.date ?? null,
      masa: day?.masa ?? null,
      paksha: day?.paksha ?? null,
      sunrise: day?.sunrise ?? undefined,
      sunset: day?.sunset ?? undefined,
      moonrise: day?.moonrise ?? undefined,
      nextSunrise: next?.sunrise ?? undefined,
      previousSunrise: previous?.sunrise ?? undefined,
      tithis: (Array.isArray(day?.tithiIntervals) ? day.tithiIntervals : [])
        .map(normalizeTithiInterval).filter(Boolean),
      previousTithis: (Array.isArray(previous?.tithiIntervals) ? previous.tithiIntervals : [])
        .map(normalizeTithiInterval).filter(Boolean),
      nakshatraIntervals: Array.isArray(day?.nakshatraIntervals) ? day.nakshatraIntervals : []
    };
  });
}

/**
 * Resolve directly from the annual generator output. Candidate days are
 * selected only by the explicit profile's tithi/month constraints; the
 * observance rule still makes the actual date decision.
 */
export function resolveFestivalObservanceFromAnnualPanchang(observance, year, dailyPanchang) {
  if (observance?.dateType === "fixed-gregorian") {
    return resolveFestivalObservance(observance, year, []);
  }
  if (!observance?.ruleId) {
    return fail("manual-review", observance, ["explicit-observance-rule-id-required"]);
  }
  const profile = getObservanceRuleProfile(observance.ruleId);
  if (!profile) {
    return fail("manual-review", observance, ["unknown-or-unregistered-rule-id"]);
  }
  const contexts = buildFestivalRuleContexts(dailyPanchang);
  if (!contexts.length) {
    return fail("insufficient-data", observance, ["annual-daily-panchang-data-required"]);
  }
  const targetIndices = observance.targetTithiIndices ??
    (Number.isInteger(observance.targetTithiIndex) ? [observance.targetTithiIndex] : profile.tithiIndices);
  if (!Array.isArray(targetIndices) || !targetIndices.length ||
      targetIndices.some(index => !Number.isInteger(index) || !profile.tithiIndices.includes(index))) {
    return fail("manual-review", observance, ["target-tithi-selector-outside-rule-profile"]);
  }
  const requestedMonth = String(observance.lunarMonth ?? "").trim();
  const requestedPaksha = String(observance.paksha ?? "").trim();
  if (requestedPaksha && !["शुक्ल पक्ष", "कृष्ण पक्ष"].includes(requestedPaksha)) {
    return fail("manual-review", observance, ["invalid-paksha-selector"]);
  }
  if (requestedPaksha && profile.paksha && requestedPaksha !== profile.paksha) {
    return fail("manual-review", observance, ["paksha-selector-outside-rule-profile"]);
  }
  const candidateContexts = contexts.filter(context => {
    const rawMonth = String(context.masa ?? "").trim();
    const normalizedMonth = rawMonth.replace(/^अधिक\s+/, "").trim();
    if (requestedMonth && requestedMonth !== rawMonth && requestedMonth !== normalizedMonth) return false;
    if (profile.allowedMonths?.length && !profile.allowedMonths.includes(normalizedMonth)) return false;
    return targetIndices.every(index => context.tithis.some(row =>
      row.index === index &&
      (!profile.paksha || !row.paksha || row.paksha === profile.paksha) &&
      (!requestedPaksha || row.paksha === requestedPaksha)
    ));
  });
  if (!candidateContexts.length) {
    return fail("candidate-not-supported", observance, ["no-annual-day-contains-the-profile-tithi"]);
  }
  return resolveFestivalObservance(observance, year, candidateContexts);
}

/**
 * Resolve one catalogue observance for a requested year.
 *
 * Supported descriptors:
 * - { id, dateType:"tithi", ruleId } + calculated candidateContexts
 * - { id, dateType:"fixed-gregorian", fixedDate:{month,day,source} }
 *
 * The resolver intentionally does not accept a title as a substitute for a
 * rule ID. A selected candidate remains unpublished until external review.
 */
export function resolveFestivalObservance(observance, year, candidateContexts = []) {
  if (!observance || typeof observance !== "object" || !observance.id) {
    return fail("manual-review", observance, ["observance-id-required"]);
  }
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    return fail("insufficient-data", observance, ["valid-target-year-required"]);
  }

  if (observance.dateType === "fixed-gregorian") {
    const month = Number(observance.fixedDate?.month);
    const day = Number(observance.fixedDate?.day);
    const source = String(observance.fixedDate?.source ?? "").trim();
    if (!Number.isInteger(month) || month < 1 || month > 12 ||
        !Number.isInteger(day) || day < 1 || day > 31 || !source) {
      return fail("manual-review", observance, [
        "fixed-gregorian-rule-requires-valid-month-day-and-source"
      ]);
    }
    const date = String(year).padStart(4, "0") + "-" +
      String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    if (!validIsoDate(date)) {
      return fail("manual-review", observance, [
        "fixed-gregorian-date-does-not-exist-in-target-year"
      ], { ruleType: "fixed-gregorian", source });
    }
    return {
      engineVersion: FESTIVAL_RULE_ENGINE_VERSION,
      observanceId: observance.id,
      ruleId: observance.ruleId ?? "fixed-gregorian",
      ruleType: "fixed-gregorian",
      ruleVersion: observance.ruleVersion ?? "1.0.0",
      status: "date-selected-needs-source-approval",
      selectedDate: date,
      finalDate: date,
      selectionBasis: "explicit-fixed-gregorian-month-day",
      source,
      autoApproved: false,
      publishable: false,
      warnings: ["fixed-date-exception-explicitly-declared", "source-and-publication-approval-required"]
    };
  }

  if (observance.dateType !== "tithi") {
    return fail("manual-review", observance, [
      "date-type-must-be-explicitly-tithi-or-fixed-gregorian"
    ]);
  }
  if (!observance.ruleId) {
    return fail("manual-review", observance, ["explicit-observance-rule-id-required"]);
  }
  const profile = getObservanceRuleProfile(observance.ruleId);
  if (!profile) {
    return fail("manual-review", observance, ["unknown-or-unregistered-rule-id"]);
  }
  if (!Array.isArray(candidateContexts) || candidateContexts.length === 0) {
    return fail("insufficient-data", observance, ["calculated-local-day-contexts-required"], {
      ruleType: "tithi",
      ruleVersion: profile.ruleVersion
    });
  }
  const resolved = resolveObservanceCandidates(profile.id, candidateContexts, {
    targetTithiIndex: observance.targetTithiIndex,
    targetTithiIndices: observance.targetTithiIndices
  });
  return {
    engineVersion: FESTIVAL_RULE_ENGINE_VERSION,
    observanceId: observance.id,
    ruleId: profile.id,
    ruleType: "tithi",
    ruleVersion: profile.ruleVersion,
    tradition: profile.tradition,
    sourceReview: profile.sourceReview,
    reviewOnly: profile.reviewOnly,
    selectionPolicy: profile.selectionPolicy,
    status: resolved.status,
    selectedDate: resolved.selectedDate ?? null,
    finalDate: resolved.finalDate ?? null,
    selectionBasis: resolved.selectionBasis ?? null,
    evaluations: resolved.evaluations ?? [],
    warnings: resolved.warnings ?? [],
    autoApproved: false,
    publishable: false
  };
}
