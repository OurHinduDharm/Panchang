/**
 * OurHinduDharm — observance-specific date evidence profiles.
 *
 * These profiles reuse calculation windows already covered by project tests.
 * They are candidate evidence only: no profile certifies a shastriya rule,
 * chooses a final public date, or auto-approves a festival.
 */
const PROFILES = {
  "pradosh-trayodashi": {
    id: "pradosh-trayodashi", aliases: ["pradosh", "pradosh-evening"],
    label: "प्रदोष व्रत", tithiIndices: [12, 27], paksha: null,
    decisionMoment: "pradosh", windowLabel: "प्रदोष काल",
    calculationBasis: "sunset-to-one-fifth-of-night",
    sourceReview: "pending-primary-source-review"
  },
  "sankashti-moonrise": {
    id: "sankashti-moonrise", aliases: ["sankashti", "sakat-moonrise"],
    label: "संकष्टी चतुर्थी", tithiIndices: [18], paksha: "कृष्ण पक्ष",
    decisionMoment: "moonrise", windowLabel: "चन्द्रोदय",
    calculationBasis: "krishna-chaturthi-active-at-local-moonrise",
    sourceReview: "pending-primary-source-review"
  },
  "masik-shivaratri-nishita": {
    id: "masik-shivaratri-nishita", aliases: ["mahashivaratri-nishita"],
    label: "मासिक शिवरात्रि", tithiIndices: [28], paksha: "कृष्ण पक्ष",
    decisionMoment: "nishita", windowLabel: "निशीथ काल",
    calculationBasis: "sunset-to-next-sunrise-seven-fifteenths-to-eight-fifteenths",
    sourceReview: "pending-primary-source-review"
  },
  "vinayaka-chaturthi-madhyahna": {
    id: "vinayaka-chaturthi-madhyahna", aliases: ["vinayaka-chaturthi"],
    label: "विनायक चतुर्थी", tithiIndices: [3], paksha: "शुक्ल पक्ष",
    decisionMoment: "madhyahna", windowLabel: "मध्याह्न काल",
    calculationBasis: "sunrise-to-sunset-two-fifths-to-three-fifths",
    sourceReview: "pending-primary-source-review"
  }
};

const ALIAS_TO_ID = new Map();
for (const profile of Object.values(PROFILES)) {
  ALIAS_TO_ID.set(profile.id, profile.id);
  for (const alias of profile.aliases) ALIAS_TO_ID.set(alias, profile.id);
}

function asDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
function asInterval(row) {
  const start = asDate(row?.startTime ?? row?.start);
  const end = asDate(row?.endTime ?? row?.end);
  if (!start || !end || end <= start) return null;
  return { start, end, index: Number(row?.index ?? row?.number ?? row?.value) };
}
function overlap(a, b) {
  const start = new Date(Math.max(a.start.getTime(), b.start.getTime()));
  const end = new Date(Math.min(a.end.getTime(), b.end.getTime()));
  return end > start ? { start, end } : null;
}
function makeWindow(profile, context) {
  if (profile.decisionMoment === "moonrise") {
    const point = asDate(context.moonrise);
    return point ? { start: point, end: new Date(point.getTime() + 1), point } : null;
  }
  if (profile.decisionMoment === "madhyahna") {
    const sunrise = asDate(context.sunrise), sunset = asDate(context.sunset);
    if (!sunrise || !sunset || sunset <= sunrise) return null;
    const span = sunset.getTime() - sunrise.getTime();
    return { start: new Date(sunrise.getTime() + span * 2 / 5), end: new Date(sunrise.getTime() + span * 3 / 5) };
  }
  const sunset = asDate(context.sunset), nextSunrise = asDate(context.nextSunrise);
  if (!sunset || !nextSunrise || nextSunrise <= sunset) return null;
  const night = nextSunrise.getTime() - sunset.getTime();
  if (profile.decisionMoment === "nishita") {
    return { start: new Date(sunset.getTime() + night * 7 / 15), end: new Date(sunset.getTime() + night * 8 / 15) };
  }
  if (profile.decisionMoment === "pradosh") {
    return { start: sunset, end: new Date(sunset.getTime() + night / 5) };
  }
  return null;
}

/** Resolve a reviewed profile ID without inferring rules from a festival title. */
export function getObservanceRuleProfile(ruleId) {
  const id = ALIAS_TO_ID.get(String(ruleId ?? "").trim().toLowerCase());
  if (!id) return null;
  const profile = PROFILES[id];
  return Object.freeze({
    id: profile.id, label: profile.label, tithiIndices: [...profile.tithiIndices],
    paksha: profile.paksha, decisionMoment: profile.decisionMoment,
    windowLabel: profile.windowLabel, calculationBasis: profile.calculationBasis,
    sourceReview: profile.sourceReview, ruleVersion: "0.1.0",
    tradition: "smarta-review-default"
  });
}

/**
 * Evaluate one day against an explicit profile. A match is only candidate
 * evidence; source review and festival-specific exceptions remain separate.
 */
export function evaluateObservanceRule(ruleId, context) {
  const profileId = ALIAS_TO_ID.get(String(ruleId ?? "").trim().toLowerCase());
  if (!profileId) return {
    status: "manual-review", ruleId: String(ruleId ?? ""),
    warnings: ["unknown-or-unassigned-observance-rule"],
    evidence: [], finalDate: null, autoApproved: false
  };
  const profile = PROFILES[profileId];
  const day = context?.date;
  const window = makeWindow(profile, context || {});
  if (!day || !window) return {
    status: "insufficient-data", ruleId: profile.id, date: day ?? null,
    decisionMoment: profile.decisionMoment,
    warnings: ["decision-window-or-date-missing"],
    evidence: [], finalDate: null, autoApproved: false
  };
  const rows = Array.isArray(context?.tithis) ? context.tithis : [];
  const evidence = [];
  for (const row of rows) {
    const interval = asInterval(row);
    if (!interval || !profile.tithiIndices.includes(interval.index)) continue;
    if (profile.paksha && row.paksha && row.paksha !== profile.paksha) continue;
    const matched = profile.decisionMoment === "moonrise"
      ? (interval.start <= window.point && interval.end > window.point
        ? { start: window.point, end: window.point } : null)
      : overlap(interval, window);
    if (matched) evidence.push({
      tithiIndex: interval.index,
      tithiName: row.name ?? row.tithi ?? null,
      start: matched.start.toISOString(), end: matched.end.toISOString(),
      decisionMoment: profile.decisionMoment,
      windowStart: window.start.toISOString(), windowEnd: window.end.toISOString()
    });
  }
  return {
    status: evidence.length ? "candidate-supported" : "candidate-not-supported",
    ruleId: profile.id, ruleVersion: "0.1.0", date: day,
    label: profile.label, decisionMoment: profile.decisionMoment,
    calculationBasis: profile.calculationBasis,
    sourceReview: profile.sourceReview,
    evidence,
    warnings: ["candidate-evidence-only", "primary-source-and-exception-review-required"],
    finalDate: null, autoApproved: false
  };
}
