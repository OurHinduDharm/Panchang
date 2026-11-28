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

import {normalizeAnnualTrisprishaPartitions,reviewTrisprishaSunriseCycle,resolveTrisprishaSourcePrecedence} from "./ekadashi-trisprisha.mjs";

import {completeDay} from "./festival-tithi-partitions.mjs";
import {selectYamaDvitiyaDay} from "./yama-dvitiya.mjs";
import {resolveShuklaManvadiCycles} from "./manvadi-observances.mjs";

export function resolveAnnualShuklaManvadi(dailyPanchang) {
  const contexts = normalizeAnnualTrisprishaPartitions(buildFestivalRuleContexts(dailyPanchang));
  return resolveShuklaManvadiCycles(contexts);
}

// Only regular Kartika Shukla Dvitiya supplies this occurrence.
export function resolveAnnualYamaDvitiya(dailyPanchang) {
  const ruleId = "dharmasindhu-yama-dvitiya";
  const pending = {ruleId, contentKey:"भाई दूज", selectedDate:null, status:"manual-review", publishable:false};
  const days = normalizeAnnualTrisprishaPartitions(buildFestivalRuleContexts(dailyPanchang));
  const target = day => day.masa === "कार्तिक" && day.tithis.some(t => t.index === 1);
  const indices = days.flatMap((day,i) => target(day) ? [i] : []);
  if (!indices.length || indices.at(-1)-indices[0]+1 !== indices.length) return pending;
  const first = indices[0], last = indices.at(-1);
  if (first === 0 || last+1 >= days.length) return pending;
  const around = days.slice(first-1,last+2);
  if (!around.slice(0,-1).every((day,i) => completeDay(day,around[i+1]))) return pending;
  const parts = around.flatMap(day => day.tithis).filter(t => t.index === 1);
  if (parts.length !== indices.length || !parts.every((p,i) => i === 0 || p.startTime === parts[i-1].endTime)) return pending;
  const all = around.flatMap(day => day.tithis);
  if (all[all.indexOf(parts[0])-1]?.index !== 0 || all[all.indexOf(parts.at(-1))+1]?.index !== 2) return pending;
  const decision = selectYamaDvitiyaDay(around,Date.parse(parts[0].startTime),Date.parse(parts.at(-1).endTime));
  return decision ? {...pending,selectedDate:decision.date,status:"date-selected-needs-source-approval"} : pending;
}

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
      sunriseMasa: day?.sunriseTithi?.masa ?? null,
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
  if (observance.monthKind != null && !["regular", "adhika", "any"].includes(observance.monthKind)) {
    return fail("manual-review", observance, ["invalid-month-kind-selector"]);
  }
  const requestsAdhika = /^अधिक\s+/.test(requestedMonth);
  if (observance.monthKind != null && observance.monthKind !== "any" && !requestedMonth) {
    return fail("manual-review", observance, ["lunar-month-required-for-month-kind-selector"]);
  }
  if (observance.monthKind != null && observance.monthKind !== "adhika" && requestsAdhika) {
    return fail("manual-review", observance, ["conflicting-month-kind-and-prefixed-lunar-month"]);
  }
  const monthKind = observance.monthKind ?? (requestsAdhika ? "adhika" : requestedMonth ? "regular" : "any");
  if (requestedPaksha && !["शुक्ल पक्ष", "कृष्ण पक्ष"].includes(requestedPaksha)) {
    return fail("manual-review", observance, ["invalid-paksha-selector"]);
  }
  if (requestedPaksha && profile.paksha && requestedPaksha !== profile.paksha) {
    return fail("manual-review", observance, ["paksha-selector-outside-rule-profile"]);
  }
  // The annual export partitions tithi intervals at sunrise. The Arunodaya
  // rule also needs the previous day's partition, which covers the time
  // immediately before today's sunrise.
  const ruleContexts = profile.id === "ratha-saptami-review"
    ? contexts.map(context => {
      const sunrise = Date.parse(context.sunrise);
      const arunodaya = sunrise - 96 * 60_000;
      const beforeSunrise = context.previousTithis.filter(row =>
        Date.parse(row.startTime) <= arunodaya && arunodaya < Date.parse(row.endTime)
      );
      return { ...context, tithis: [...beforeSunrise, ...context.tithis] };
    })
    : contexts;
  const candidateContexts = ruleContexts.filter(context => {
    const rawMonth = String(context.masa ?? "").trim();
    const normalizedMonth = rawMonth.replace(/^अधिक\s+/, "").trim();
    // Ordinary named festivals must not silently match an intercalary month.
    // Explicit adhika observances retain their exact month selector.
    const isAdhika = /^अधिक\s+/.test(rawMonth);
    if (monthKind === "regular" && isAdhika) return false;
    if (monthKind === "adhika" && !isAdhika) return false;
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
  // A sunrise-only rule must not silently approve a Dvadashi-ksaya exception.
  // Only an explicitly scoped, single-cycle Smarta householder policy can
  // select the earlier candidate; other traditions remain separate evidence.
  if(profile.id==="ekadashi-smarta-udaya"&&targetIndices.length===1){
    const index=targetIndices[0];
    const normalized=normalizeAnnualTrisprishaPartitions(contexts);
    const candidateDates=new Set(candidateContexts.map(d=>d.date));
    const special=[];
    for(let i=1;i<normalized.length-1;i++){
      const day=normalized[i];
      if(!candidateDates.has(day.date))continue;
      const result=reviewTrisprishaSunriseCycle(normalized.slice(i-1,i+2),index);
      if(result.status==="source-review-required"||
         result.status==="manual-review"&&result.sunriseSequence?.join(",")===[index-1,index,index+2].join(","))special.push(result);
    }
    if(special.length){
      const evidence=special[0];
      const cycleOnly=special.length===1&&evidence.sunriseDates&&candidateContexts.every(d=>evidence.sunriseDates.slice(0,2).includes(d.date));
      const decision=resolveTrisprishaSourcePrecedence(evidence,observance.ekadashiTradition);
      if(cycleOnly&&decision.status==="date-selected-needs-source-approval"&&candidateDates.has(decision.selectedDate)){
        const selectedDate=decision.selectedDate;
        return {...fail("date-selected-needs-source-approval",observance,[observance.ekadashiTradition==="smarta-householder"?"trisprisha-householder-date-only-special-parana-review-required":"trisprisha-special-parana-review-required","source-and-publication-approval-required"]),
          selectedDate,finalDate:selectedDate,selectionBasis:decision.selectionBasis,precedence:decision.precedence,
          evaluations:special,ruleType:"tithi",ruleVersion:profile.ruleVersion};
      }
      return fail("manual-review",observance,["trisprisha-dwadashi-ksaya-explicit-tradition-and-complete-cycle-required"],{evaluations:special,ruleType:"tithi",ruleVersion:profile.ruleVersion});
    }
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
