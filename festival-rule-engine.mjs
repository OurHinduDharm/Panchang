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

const DATE_RE = /^\\d{4}-\\d{2}-\\d{2}$/;

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
  const resolved = resolveObservanceCandidates(profile.id, candidateContexts);
  return {
    engineVersion: FESTIVAL_RULE_ENGINE_VERSION,
    observanceId: observance.id,
    ruleId: profile.id,
    ruleType: "tithi",
    ruleVersion: profile.ruleVersion,
    tradition: profile.tradition,
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
