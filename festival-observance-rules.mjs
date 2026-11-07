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
    calculationBasis: "three-muhurtas-after-local-sunset-3x48-minutes",
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "ekadashi-smarta-udaya": {
    id: "ekadashi-smarta-udaya", aliases: ["smarta-ekadashi", "ekadashi"],
    label: "स्मार्त एकादशी", tithiIndices: [10, 25], paksha: null,
    decisionMoment: "sunrise", windowLabel: "सूर्योदय",
    calculationBasis: "ekadashi-active-at-local-sunrise-first-sunrise-on-vriddhi",
    firstSunriseOnly: true,
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "janmashtami-smarta-nishita": {
    id: "janmashtami-smarta-nishita", aliases: ["smarta-janmashtami", "janmashtami"],
    label: "स्मार्त जन्माष्टमी", tithiIndices: [22], paksha: "कृष्ण पक्ष",
    decisionMoment: "nishita", windowLabel: "निशीथ काल",
    calculationBasis: "krishna-ashtami-at-nishita-rohini-as-supporting-evidence",
    nakshatraIndices: [3], allowedMonths: ["भाद्रपद"],
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "navratri-udaya": {
    id: "navratri-udaya", aliases: ["navratri-day-count"],
    label: "नवरात्रि — उदयव्यापिनी तिथि", tithiIndices: [0,1,2,3,4,5,6,7], paksha: "शुक्ल पक्ष",
    decisionMoment: "sunrise", windowLabel: "सूर्योदय",
    calculationBasis: "shukla-pratipada-to-navami-at-sunrise-first-sunrise-on-vriddhi",
    firstSunriseOnly: true, allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "navratri-navami-ashtami-viddha": {
    id: "navratri-navami-ashtami-viddha", aliases: ["navratri-navami"],
    label: "नवरात्रि महानवमी — अष्टमी-विद्धा", tithiIndices: [7,8], paksha: "शुक्ल पक्ष",
    decisionMoment: "navami-ashtami-viddha", windowLabel: "सूर्योदय से सूर्यास्त",
    calculationBasis: "navami-overlaps-day-after-ashtami-at-sunrise",
    requireAllTithis: true, allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "navratri-sandhi-puja": {
    id: "navratri-sandhi-puja", aliases: ["sandhi-puja-navratri"],
    label: "नवरात्रि संधि पूजा", tithiIndices: [7,8], paksha: "शुक्ल पक्ष",
    decisionMoment: "sandhi", windowLabel: "अष्टमी–नवमी संधि",
    calculationBasis: "last-24-minutes-ashtami-plus-first-24-minutes-navami",
    requireAllTithis: true, allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "sankashti-moonrise": {
    id: "sankashti-moonrise", aliases: ["sankashti", "sakat-moonrise"],
    label: "संकष्टी चतुर्थी", tithiIndices: [18], paksha: "कृष्ण पक्ष",
    decisionMoment: "moonrise", windowLabel: "चन्द्रोदय",
    calculationBasis: "krishna-chaturthi-active-at-local-moonrise",
    sourceReview: "pending-primary-source-review"
  },
  "masik-shivaratri-nishita": {
    id: "masik-shivaratri-nishita", aliases: [],
    label: "मासिक शिवरात्रि", tithiIndices: [28], paksha: "कृष्ण पक्ष",
    decisionMoment: "nishita", windowLabel: "निशीथ काल",
    calculationBasis: "sunset-to-next-sunrise-seven-fifteenths-to-eight-fifteenths",
    sourceReview: "pending-primary-source-review"
  },
  "mahashivaratri-nishita": {
    id: "mahashivaratri-nishita", aliases: [],
    label: "महाशिवरात्रि", tithiIndices: [28], paksha: "कृष्ण पक्ष",
    decisionMoment: "nishita", windowLabel: "निशीथ काल",
    calculationBasis: "sunset-to-next-sunrise-seven-fifteenths-to-eight-fifteenths",
    allowedMonths: ["फाल्गुन"],
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
  if (profile.decisionMoment === "sunrise") {
    const point = asDate(context.sunrise);
    return point ? { start: point, end: new Date(point.getTime() + 1), point } : null;
  }
  if (profile.decisionMoment === "navami-ashtami-viddha") {
    const sunrise = asDate(context.sunrise), sunset = asDate(context.sunset);
    return sunrise && sunset && sunset > sunrise ? { start: sunrise, end: sunset, point: sunrise } : null;
  }
  if (profile.decisionMoment === "sandhi") {
    const rows = Array.isArray(context.tithis) ? context.tithis.map(asInterval).filter(Boolean) : [];
    const ashtami = rows.filter(row => row.index === 7);
    const navami = rows.filter(row => row.index === 8);
    for (const a of ashtami) for (const n of navami) {
      if (Math.abs(a.end.getTime() - n.start.getTime()) <= 1000) {
        const transition = new Date((a.end.getTime() + n.start.getTime()) / 2);
        return { start: new Date(transition.getTime() - 24 * 60000), end: new Date(transition.getTime() + 24 * 60000), transition };
      }
    }
    return null;
  }
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
    return { start: sunset, end: new Date(sunset.getTime() + 3 * 48 * 60000) };
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
    paksha: profile.paksha, allowedMonths: profile.allowedMonths ? [...profile.allowedMonths] : null, decisionMoment: profile.decisionMoment,
    windowLabel: profile.windowLabel, calculationBasis: profile.calculationBasis,
    sourceReview: profile.sourceReview, ruleVersion: "0.2.0",
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
  if (profile.allowedMonths) {
    const month = String(context?.masa ?? "").replace(/^अधिक\s+/, "").trim();
    if (!month) return { status: "insufficient-data", ruleId: profile.id, date: day, decisionMoment: profile.decisionMoment, warnings: ["lunar-month-missing"], evidence: [], finalDate: null, autoApproved: false };
    if (!profile.allowedMonths.includes(month)) return { status: "candidate-not-supported", ruleId: profile.id, date: day, decisionMoment: profile.decisionMoment, warnings: ["lunar-month-outside-profile"], evidence: [], finalDate: null, autoApproved: false };
  }
  const rows = Array.isArray(context?.tithis) ? context.tithis : [];
  if (!rows.length) return {
    status: "insufficient-data", ruleId: profile.id, date: day,
    decisionMoment: profile.decisionMoment,
    warnings: ["tithi-intervals-missing"],
    evidence: [], finalDate: null, autoApproved: false
  };
  if (profile.firstSunriseOnly && context.previousSunrise && Array.isArray(context.previousTithis)) {
    const previousPoint = asDate(context.previousSunrise);
    const repeated = previousPoint && context.previousTithis.some(row => {
      const interval = asInterval(row);
      return interval && profile.tithiIndices.includes(interval.index) && interval.start <= previousPoint && interval.end > previousPoint;
    });
    if (repeated) return {
      status: "candidate-not-supported", ruleId: profile.id, date: day,
      decisionMoment: profile.decisionMoment,
      warnings: ["vriddhi-tithi-first-sunrise-only"],
      evidence: [], finalDate: null, autoApproved: false
    };
  }
  if (profile.decisionMoment === "navami-ashtami-viddha") {
    const sunrise = asDate(context.sunrise);
    const ashtamiAtSunrise = sunrise && rows.some(row => {
      const interval = asInterval(row);
      return interval && interval.index === 7 && interval.start <= sunrise && interval.end > sunrise;
    });
    if (!ashtamiAtSunrise) return {
      status: "candidate-not-supported", ruleId: profile.id, date: day,
      decisionMoment: profile.decisionMoment,
      warnings: ["ashtami-not-active-at-sunrise"],
      evidence: [], finalDate: null, autoApproved: false
    };
  }
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
  const matchedTithis = new Set(evidence.map(item => item.tithiIndex));
  const allRequired = !profile.requireAllTithis || profile.tithiIndices.every(index => matchedTithis.has(index));
  const nakshatraEvidence = profile.nakshatraIndices && Array.isArray(context.nakshatraIntervals)
    ? context.nakshatraIntervals.filter(item => profile.nakshatraIndices.includes(Number(item.index)) && (() => {
      const interval = asInterval(item);
      return interval && overlap(interval, window);
    })()).map(item => ({ index: Number(item.index), name: item.name ?? null }))
    : [];
  return {
    status: evidence.length && allRequired ? "candidate-supported" : "candidate-not-supported",
    ruleId: profile.id, ruleVersion: "0.2.0", date: day,
    label: profile.label, decisionMoment: profile.decisionMoment,
    calculationBasis: profile.calculationBasis,
    sourceReview: profile.sourceReview,
    evidence, nakshatraEvidence,
    warnings: ["candidate-evidence-only", "primary-source-and-exception-review-required", ...(profile.nakshatraIndices && !nakshatraEvidence.length ? ["rohin-at-nishita-not-confirmed"] : []), ...(profile.requireAllTithis && !allRequired ? ["both-transition-tithis-not-confirmed"] : [])],
    finalDate: null, autoApproved: false
  };
}
