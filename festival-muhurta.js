/*
 * OurHinduDharm festival muhurta engine.
 * Event dates stay in monthly JSON; local times are calculated at runtime.
 * Keep rule decisions isolated here so each festival can receive a reviewed rule.
 */

function validDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function interval(startValue, endValue, label, note) {
  const start = validDate(startValue);
  const end = validDate(endValue);
  if (!start || !end || end <= start) return null;
  return { label, start, end, note: note || "" };
}

function fractionInterval(startValue, endValue, from, to, label) {
  const start = validDate(startValue);
  const end = validDate(endValue);
  if (!start || !end || end <= start || from < 0 || to > 1 || to <= from) return null;
  const duration = end.getTime() - start.getTime();
  return interval(
    start.getTime() + duration * from,
    start.getTime() + duration * to,
    label
  );
}

function localWeekday(dateValue) {
  const date = validDate(dateValue);
  return date ? date.getDay() : null;
}

/*
 * Rule IDs are attached to event records as muhurtaRule.
 * Add a new reviewed rule here; do not store location-specific clock times in JSON.
 */
const rules = {
  abhijit(context) {
    if (localWeekday(context.date) === 3) {
      return {
        label: "अभिजित मुहूर्त",
        status: "not-applicable",
        message: "बुधवार के लिए इस परियोजना के नियम के अनुसार अभिजित मुहूर्त नहीं दिखाया जाता।"
      };
    }
    const result = fractionInterval(context.sunrise, context.sunset, 7 / 15, 8 / 15, "अभिजित मुहूर्त");
    return result ? { ...result, status: "calculated" } : null;
  },

  nishita(context) {
    const result = fractionInterval(context.sunset, context.nextSunrise, 7 / 15, 8 / 15, "निशीथ काल");
    return result ? { ...result, status: "calculated" } : null;
  },

  "moonlight-until-midnight"(context) {
    const moonrise = validDate(context.moonrise);
    const date = validDate(context.date);
    if (!moonrise || !date) return null;
    const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
    const result = interval(moonrise, midnight, "चंद्रमा के उदय से मध्यरात्रि तक");
    return result ? {
      ...result,
      status: "calculated",
      note: "यह चांदनी में रखने की गणना-सीमा है; पूजा का शास्त्रीय निर्णय अलग नियम से जोड़ा जाएगा।"
    } : null;
  }
};

export function registerFestivalMuhurtaRule(ruleId, calculate) {
  if (typeof ruleId !== "string" || !/^[a-z0-9-]+$/.test(ruleId)) {
    throw new TypeError("Rule ID must use lowercase letters, digits, or hyphens.");
  }
  if (typeof calculate !== "function") throw new TypeError("Rule calculator must be a function.");
  rules[ruleId] = calculate;
}

export function getFestivalMuhurta(event, context) {
  if (!event || !event.muhurtaRule) return null;
  const calculate = rules[event.muhurtaRule];
  if (!calculate) {
    return {
      label: "मुहूर्त",
      status: "rule-pending",
      message: "इस पर्व का मुहूर्त-नियम अभी निर्धारित नहीं किया गया है।"
    };
  }
  try {
    return calculate(context || {});
  } catch (error) {
    console.warn("Festival muhurta calculation failed:", event.muhurtaRule, error);
    return {
      label: "मुहूर्त",
      status: "unavailable",
      message: "आवश्यक स्थानीय पंचांग-मान उपलब्ध नहीं हैं।"
    };
  }
}

export function formatFestivalMuhurtaTime(value, timeZone = "Asia/Kolkata") {
  const date = validDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export function getFestivalMuhurtaContext(panchang, nextPanchang, date, location) {
  return {
    date: validDate(date),
    sunrise: panchang && panchang.sunrise,
    sunset: panchang && panchang.sunset,
    moonrise: panchang && panchang.moonrise,
    moonset: panchang && panchang.moonset,
    nextSunrise: nextPanchang && nextPanchang.sunrise,
    nextSunset: nextPanchang && nextPanchang.sunset,
    tithi: panchang && panchang.tithi,
    tithiEndTime: panchang && panchang.tithiEndTime,
    nakshatra: panchang && panchang.nakshatra,
    nakshatraEndTime: panchang && panchang.nakshatraEndTime,
    karanas: panchang && panchang.karanas,
    location: location || null
  };
}

export const FESTIVAL_MUHURTA_RULE_IDS = Object.freeze(Object.keys(rules));
