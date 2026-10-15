"use strict";

/**
 * Pure, draft-only resolver for festival date metadata.
 *
 * It consumes Panchang days and solar events calculated elsewhere. It does not
 * calculate ephemerides, choose Ekadashi/Pradosha ritual days, or certify any
 * observance rule. It is not wired to the live Blogger widget.
 */

function isIsoDate(value) {
  if (typeof value !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function normalizeMonth(value) {
  return String(value || "").replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

function normalizePaksha(value) {
  return String(value || "").replace(/\s*पक्ष\s*/g, "").replace(/\s+/g, " ").trim();
}

function normalizeTithi(value) {
  return String(value || "")
    .split("/")
    .map((part) => part.trim().replace(/^(शुक्ल|कृष्ण)\s+/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function matchesTithiSpec(day, spec) {
  if (!day || !spec) return false;
  const dayDate = day.date || day.localDate;
  if (!isIsoDate(dayDate)) return false;
  if (normalizeMonth(day.month) !== normalizeMonth(spec.month)) return false;
  if (normalizePaksha(day.paksha) !== normalizePaksha(spec.paksha)) return false;
  const wanted = normalizeTithi(spec.tithi);
  const actual = normalizeTithi(day.tithi);
  return wanted.some((value) => actual.includes(value));
}

function dateOfDay(day) {
  return day && (day.date || day.localDate);
}

function findTithiMatches(days, spec) {
  return days.filter((day) => matchesTithiSpec(day, spec)).map((day) => ({
    date: dateOfDay(day),
    method: "panchang-tithi-match",
    month: day.month,
    paksha: day.paksha,
    tithi: day.tithi,
    rule: spec.rule || null
  }));
}

function resolveTithiWindow(festival, panchangDays) {
  const window = festival.date && festival.date.tithiWindow;
  if (!window || !window.from || !window.through || window.inclusive !== true) {
    return { status: "unresolved", method: "panchang-tithi-window", dates: [], reason: "inclusive tithiWindow.from/through metadata is required" };
  }
  const days = panchangDays.filter((day) => isIsoDate(dateOfDay(day))).slice()
    .sort((a, b) => dateOfDay(a).localeCompare(dateOfDay(b)));
  const startIndex = days.findIndex((day) => matchesTithiSpec(day, window.from));
  if (startIndex < 0) {
    return { status: "unresolved", method: "panchang-tithi-window", dates: [], reason: "window start tithi was not found in supplied local Panchang days" };
  }
  const endIndex = days.findIndex((day, index) => index >= startIndex && matchesTithiSpec(day, window.through));
  if (endIndex < 0) {
    return { status: "unresolved", method: "panchang-tithi-window", dates: [], reason: "window end tithi was not found after the start in supplied local Panchang days" };
  }
  const dates = days.slice(startIndex, endIndex + 1).map((day) => ({
    date: dateOfDay(day),
    method: "panchang-tithi-window",
    month: day.month,
    paksha: day.paksha,
    tithi: day.tithi,
    rule: festival.date.rule || null
  }));
  return { status: "matched", method: "panchang-tithi-window", dates, inclusive: true };
}

function eventMatches(event, spec) {
  return !!event && !!spec &&
    event.body === spec.body &&
    event.longitudeSystem === spec.longitudeSystem &&
    event.event === spec.event &&
    Number.isFinite(event.targetLongitudeDegrees) &&
    Math.abs(event.targetLongitudeDegrees - spec.targetLongitudeDegrees) < 0.000001 &&
    typeof event.instant === "string" && !Number.isNaN(Date.parse(event.instant)) &&
    isIsoDate(event.localDate);
}

function resolveSolarEvent(festival, solarEvents) {
  const date = festival.date || {};
  const startSpec = date.solarEvent;
  if (!startSpec) {
    return { status: "unresolved", method: "solar-event", dates: [], reason: "solarEvent metadata is missing" };
  }
  const start = solarEvents.find((event) => eventMatches(event, startSpec));
  if (!start) {
    return { status: "unresolved", method: "solar-event", dates: [], reason: "matching ingress event was not supplied by the ephemeris provider" };
  }
  const endSpec = date.endRule;
  if (!endSpec || !Number.isFinite(endSpec.targetLongitudeDegrees) || !endSpec.event) {
    return {
      status: "matched-start-only",
      method: "solar-event",
      dates: [{ date: start.localDate, instant: start.instant, method: "solar-event-ingress" }],
      reason: "start ingress found; separate end rule is not sufficiently specified"
    };
  }
  const end = solarEvents.find((event) =>
    eventMatches(event, {
      body: endSpec.body,
      longitudeSystem: endSpec.longitudeSystem,
      targetLongitudeDegrees: endSpec.targetLongitudeDegrees,
      event: endSpec.event
    })
  );
  if (!end || Date.parse(end.instant) <= Date.parse(start.instant)) {
    return {
      status: "matched-start-only",
      method: "solar-event",
      dates: [{ date: start.localDate, instant: start.instant, method: "solar-event-ingress" }],
      reason: "matching end boundary was not supplied after the start; no duration is inferred"
    };
  }
  return {
    status: "matched",
    method: "solar-event",
    dates: [
      { date: start.localDate, instant: start.instant, method: "solar-event-ingress" },
      { date: end.localDate, instant: end.instant, method: "solar-event-egress" }
    ],
    start: start.localDate,
    end: end.localDate,
    note: "Astronomical end boundary is not a claim about a temple's public reopening time."
  };
}

function baseResolution(festival, panchangDays, solarEvents, year) {
  const date = festival.date || {};
  // Monthly recurrence ignores the month label because Amanta/Purnimanta
  // conventions can name the same lunar fortnight differently.
  if (typeof date.calendarRule === "string" && date.calendarRule.startsWith("monthly-")) {
    const expectedPaksha = date.paksha || (date.calendarRule === "monthly-krishna-ashtami" ? "कृष्ण" : "");
    const expectedTithi = date.tithi || (date.calendarRule === "monthly-krishna-ashtami" ? "अष्टमी" : "");
    if (!expectedPaksha || !expectedTithi) {
      return { status: "unresolved", method: "recurring-panchang-tithi", dates: [], reason: "monthly rule requires explicit paksha and tithi" };
    }
    const matches = panchangDays.filter((day) => {
      const dayDate = dateOfDay(day);
      if (!isIsoDate(dayDate)) return false;
      if (normalizePaksha(day.paksha) !== normalizePaksha(expectedPaksha)) return false;
      const wanted = normalizeTithi(expectedTithi);
      const actual = normalizeTithi(day.tithi);
      return wanted.some((value) => actual.includes(value));
    }).map((day) => ({
      date: dateOfDay(day),
      method: "recurring-panchang-tithi",
      month: day.month || null,
      paksha: day.paksha || null,
      tithi: day.tithi || null,
      rule: date.rule || date.calendarRule
    }));
    matches.sort((a, b) => a.date.localeCompare(b.date));
    return {
      status: matches.length ? "matched" : "unresolved",
      method: "recurring-panchang-tithi",
      dates: matches,
      reason: matches.length ? null : "no supplied local Panchang day matches the configured monthly paksha/tithi rule"
    };
  }
  if (date.renderMode === "source-only") {
    return { status: "suppressed", method: "source-only", dates: [], reason: "record is retained for provenance only" };
  }
  if (date.renderMode === "solar-event" || date.type === "solar") {
    return resolveSolarEvent(festival, solarEvents);
  }
  if (date.renderMode === "panchang-tithi-window" || date.renderMode === "panchang-tithi-range" || date.type === "tithi-window") {
    return resolveTithiWindow(festival, panchangDays);
  }
  if (date.renderMode === "panchang-tithi" || date.renderMode === "panchang-tithi-range") {
    const specs = [];
    if (date.month && date.paksha && date.tithi) {
      specs.push({ month: date.month, paksha: date.paksha, tithi: date.tithi, rule: date.rule || null });
      (Array.isArray(date.alternateMonths) ? date.alternateMonths : []).forEach((month) => {
        if (typeof month === "string" && month.trim()) specs.push({ month, paksha: date.paksha, tithi: date.tithi, rule: date.rule || null });
      });
    }
    (Array.isArray(date.alternateObservances) ? date.alternateObservances : []).forEach((spec) => {
      if (spec && spec.renderMode === "panchang-tithi" && spec.month && spec.paksha && spec.tithi) specs.push(spec);
    });
    const seen = new Set();
    const matches = [];
    specs.forEach((spec) => findTithiMatches(panchangDays, spec).forEach((match) => {
      const key = match.date + "|" + normalizeMonth(match.month) + "|" + normalizePaksha(match.paksha) + "|" + normalizeTithi(match.tithi).join("/");
      if (!seen.has(key)) { seen.add(key); matches.push(match); }
    }));
    matches.sort((a, b) => a.date.localeCompare(b.date));
    return { status: matches.length ? "matched" : "unresolved", method: "panchang-tithi", dates: matches, reason: matches.length ? null : "no supplied local Panchang day matches the configured tithi observance" };
  }
  if (isIsoDate(date.start)) {
    if (Number.isInteger(year) && String(date.start).slice(0, 4) !== String(year)) {
      return { status: "unresolved", method: "stored-date-candidate", dates: [], reason: "stored date belongs to a different year; recurring calculation is not implemented here" };
    }
    return {
      status: "candidate",
      method: date.renderMode === "manual" || date.type === "manual" ? "manual-reference-date" : "stored-date-candidate",
      dates: [{ date: date.start, method: date.renderMode === "manual" || date.type === "manual" ? "manual-reference-date" : "stored-date-candidate" }]
    };
  }
  return { status: "unresolved", method: "no-supported-rule", dates: [], reason: "no supported date metadata or calculated event was supplied" };
}

function approvedOverrideFor(festival, overrides, year, policy) {
  if (!policy || policy.autoApply !== true || !Array.isArray(overrides)) return null;
  return overrides.find((item) =>
    item && item.festivalId === festival.id &&
    item.year === year &&
    item.status === "approved-for-application" &&
    item.decision === "show-on-reference-date" &&
    isIsoDate(item.displayDate) &&
    item.source && typeof item.source.type === "string" && item.source.type.trim() &&
    typeof item.source.title === "string" && item.source.title.trim() &&
    typeof item.note === "string" && item.note.trim()
  ) || null;
}

function resolveFestivalDate(festival, options) {
  options = options || {};
  const panchangDays = Array.isArray(options.panchangDays) ? options.panchangDays : [];
  const solarEvents = Array.isArray(options.solarEvents) ? options.solarEvents : [];
  const year = Number(options.year);
  const yearDays = Number.isInteger(year) ? panchangDays.filter((day) => String(dateOfDay(day) || "").slice(0, 4) === String(year)) : panchangDays;
  const yearEvents = Number.isInteger(year) ? solarEvents.filter((event) => String(event.localDate || "").slice(0, 4) === String(year)) : solarEvents;
  const base = baseResolution(festival, yearDays, yearEvents, year);
  const overridesData = options.overridesData || {};
  const override = approvedOverrideFor(festival, overridesData.overrides, year, overridesData.policy);
  const computedDates = base.dates.map((item) => ({ ...item }));
  if (!override) {
    return {
      festivalId: festival.id,
      name: festival.name,
      status: base.status,
      method: base.method,
      computedDates,
      displayDates: computedDates,
      overrideApplied: false,
      reason: base.reason || null,
      note: base.note || null
    };
  }
  return {
    festivalId: festival.id,
    name: festival.name,
    status: "override-applied",
    method: base.method,
    computedDates,
    displayDates: [{ date: override.displayDate, method: "approved-reference-override", overrideId: override.id, source: override.source.title, note: override.note }],
    overrideApplied: true,
    overrideId: override.id,
    reason: base.reason || null,
    note: base.note || null
  };
}

function resolveFestivalCatalog(data, options) {
  if (!data || !Array.isArray(data.festivals)) throw new TypeError("data.festivals must be an array");
  return data.festivals.map((festival) => resolveFestivalDate(festival, options || {}));
}

const api = { isIsoDate, matchesTithiSpec, findTithiMatches, resolveTithiWindow, resolveSolarEvent, resolveFestivalDate, resolveFestivalCatalog };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") window.OHDFestivalDateResolver = api;
