/*
 * Experimental local festival-date rule engine.
 *
 * This module deliberately does not call a Panchang library or move public dates.
 * The Panchang adapter must supply verified local tithi intervals and ritual anchors.
 * Ambiguous/no-match results are returned explicitly; callers must keep the static
 * JSON date as fallback until the result is reviewed.
 */

const RULES = Object.freeze({
  krishna_janmashtami: Object.freeze({ tithi: 23, anchor: "nishita", label: "कृष्ण जन्माष्टमी" }),
  rama_navami: Object.freeze({ tithi: 9, anchor: "madhyahna", label: "राम नवमी" }),
  maha_shivaratri: Object.freeze({ tithi: 29, anchor: "nishita", label: "महाशिवरात्रि" })
});

function parseTime(value) {
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

function overlaps(start, end, point) {
  return start !== null && end !== null && point !== null && start <= point && point < end;
}

function validateDay(day) {
  if (!day || typeof day.date !== "string" || !Array.isArray(day.tithiIntervals)) return false;
  return day.tithiIntervals.every(function (t) {
    return Number.isInteger(t.tithi) &&
      parseTime(t.start) !== null &&
      parseTime(t.end) !== null &&
      parseTime(t.end) > parseTime(t.start);
  });
}

function anchorMidpoint(day, anchorName) {
  const anchor = day && day.anchors && day.anchors[anchorName];
  if (!anchor) return null;
  const start = parseTime(anchor.start);
  const end = parseTime(anchor.end);
  if (start === null || end === null || end <= start) return null;
  return start + (end - start) / 2;
}

/**
 * day shape:
 * {
 *   date: "YYYY-MM-DD",
 *   tithiIntervals: [{ tithi: 1..30, start: ISO-with-offset, end: ISO-with-offset }],
 *   anchors: {
 *     nishita: { start: ISO-with-offset, end: ISO-with-offset },
 *     madhyahna: { start: ISO-with-offset, end: ISO-with-offset }
 *   }
 * }
 */
export function evaluateFestivalDateRule(ruleId, days, options = {}) {
  const rule = RULES[ruleId];
  const fallbackDate = options.fallbackDate || null;
  if (!rule) return { status: "rule-pending", ruleId, date: fallbackDate, candidates: [], reason: "unknown-rule" };
  if (!Array.isArray(days) || !days.length || !days.every(validateDay)) {
    return { status: "calculation-unavailable", ruleId, date: fallbackDate, candidates: [], reason: "invalid-panchang-input" };
  }

  const candidates = [];
  for (const day of days) {
    const anchor = anchorMidpoint(day, rule.anchor);
    if (anchor === null) continue;
    const matching = day.tithiIntervals.filter(function (t) {
      return t.tithi === rule.tithi && overlaps(parseTime(t.start), parseTime(t.end), anchor);
    });
    if (matching.length) {
      candidates.push({ date: day.date, anchor: rule.anchor, tithi: rule.tithi });
    }
  }

  if (candidates.length === 1) {
    return { status: "candidate", ruleId, date: candidates[0].date, candidates, reason: "unique-ritual-anchor-match" };
  }
  if (candidates.length > 1) {
    return { status: "ambiguous", ruleId, date: fallbackDate, candidates, reason: "multiple-ritual-anchor-matches" };
  }
  return { status: "no-match", ruleId, date: fallbackDate, candidates: [], reason: "target-tithi-not-present-at-anchor" };
}

export function getFestivalDateRule(ruleId) {
  return RULES[ruleId] || null;
}

export function getFestivalDateRuleIds() {
  return Object.keys(RULES);
}
