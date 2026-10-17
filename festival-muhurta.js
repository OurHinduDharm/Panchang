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

function rawValue(value) {
  if (value && typeof value === "object") {
    return value.name ?? value.label ?? value.value ?? value.index ?? value.number ?? "";
  }
  return value;
}

function normalizedName(value) {
  return String(rawValue(value) ?? "").normalize("NFC").toLocaleLowerCase("hi").trim();
}

function isChitra(value) {
  const name = normalizedName(value);
  const numeric = Number(rawValue(value));
  return /chitra|चित्रा/.test(name) || numeric === 13 || numeric === 14;
}

function isVaidhriti(value) {
  const name = normalizedName(value);
  const numeric = Number(rawValue(value));
  return /vaidhriti|वैधृति/.test(name) || numeric === 26 || numeric === 27;
}

function laterDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

function earlierDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() <= b.getTime() ? a : b;
}

/*
 * Rule IDs are attached to event records as muhurtaRule.
 * Add a new reviewed rule here; do not store location-specific clock times in JSON.
 */
const rules = {
  "ghata-sthapana"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const pratipadaEnd = validDate(context.tithiEndTime);
    if (!sunrise || !sunset || !pratipadaEnd || sunset <= sunrise) {
      return {
        label: "घटस्थापना मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्योदय और प्रतिपदा की समाप्ति का समय उपलब्ध नहीं है।"
      };
    }

    let avoidUntil = sunrise;
    let missingAvoidEnd = false;
    const avoidNotes = [];
    if (isChitra(context.nakshatra)) {
      const end = validDate(context.nakshatraEndTime);
      if (end) avoidUntil = laterDate(avoidUntil, end);
      else missingAvoidEnd = true;
      avoidNotes.push("चित्रा नक्षत्र से बचने का प्रयास");
    }
    if (isVaidhriti(context.yoga)) {
      const end = validDate(context.yogaEndTime);
      if (end) avoidUntil = laterDate(avoidUntil, end);
      else missingAvoidEnd = true;
      avoidNotes.push("वैधृति योग से बचने का प्रयास");
    }

    // The preferred window is the first third of daylight, while Pratipada
    // remains in force. If the avoided yoga/nakshatra consumes that window,
    // the traditional fallback is Abhijit rather than an afternoon time.
    const firstThirdEnd = new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 3);
    const preferredStart = laterDate(sunrise, avoidUntil);
    const preferredEnd = earlierDate(firstThirdEnd, earlierDate(sunset, pratipadaEnd));
    const preferred = missingAvoidEnd
      ? null
      : interval(preferredStart, preferredEnd, "घटस्थापना मुहूर्त");
    if (preferred) {
      return {
        ...preferred,
        status: "calculated",
        note: avoidNotes.length
          ? "प्रतिपदा-व्याप्ति में; " + avoidNotes.join(" तथा ") + " करते हुए।"
          : "प्रतिपदा-व्याप्ति में स्थानीय दिनमान के अनुसार।"
      };
    }

    // If the avoided period leaves no valid window, use Abhijit only when
    // the complete interval still falls within Pratipada and daylight.
    const fallback = fractionInterval(sunrise, sunset, 7 / 15, 8 / 15, "घटस्थापना — अभिजित मुहूर्त");
    if (fallback && fallback.start >= sunrise && fallback.end <= sunset && fallback.end <= pratipadaEnd) {
      return {
        ...fallback,
        status: "calculated",
        note: "चित्रा नक्षत्र/वैधृति योग से बचने का समय उपलब्ध न होने पर अभिजित मुहूर्त का विकल्प।"
      };
    }
    return {
      label: "घटस्थापना मुहूर्त",
      status: "unavailable",
      message: "प्रतिपदा-व्याप्ति में उपयुक्त स्थानीय समय नहीं मिला; तिथि और योग का निर्णय पंचांग से जाँचें।"
    };
  },

  moonrise(context) {
    const time = validDate(context.moonrise);
    if (!time) {
      return {
        label: "स्थानीय चंद्रोदय / अर्घ्य का समय",
        status: "unavailable",
        message: "इस स्थान का चंद्रोदय समय उपलब्ध नहीं है।"
      };
    }
    return {
      label: "स्थानीय चंद्रोदय / अर्घ्य का समय",
      status: "calculated",
      time,
      note: "चंद्रोदय के बाद अपनी परंपरा के अनुसार अर्घ्य दें।"
    };
  },

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
    yoga: panchang && panchang.yoga,
    yogaEndTime: panchang && panchang.yogaEndTime,
    karanas: panchang && panchang.karanas,
    location: location || null
  };
}

export function getFestivalMuhurtaRuleIds() {
  return Object.keys(rules);
}
