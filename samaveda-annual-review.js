import { getSamavedaUpakarmaDateDecision } from "./festival-muhurta.js";

const HASTA_INDEX = 12;

function hasExactHastaInterval(day) {
  return Array.isArray(day?.nakshatraIntervals) && day.nakshatraIntervals.some(item =>
    Number(item?.index) === HASTA_INDEX &&
    item?.startTime && item?.endTime &&
    Number.isFinite(new Date(item.startTime).getTime()) &&
    Number.isFinite(new Date(item.endTime).getTime()) &&
    new Date(item.endTime) > new Date(item.startTime)
  );
}

/**
 * Resolve the Samaveda Upakarma date from a full annual Panchanga scan.
 * Only exact astronomical nakshatra intervals are passed to the decision
 * engine; scalar sunrise-nakshatra labels are deliberately not used as a
 * substitute for missing transition timestamps.
 */
export function resolveSamavedaAnnualDecision(dailyPanchang, options = {}) {
  const source = Array.isArray(dailyPanchang) ? dailyPanchang : [];
  const records = source.map(day => ({
    date: day?.date,
    sunrise: day?.sunrise,
    sunset: day?.sunset,
    month: day?.masa,
    paksha: day?.paksha,
    tithi: day?.tithi,
    nakshatras: Array.isArray(day?.nakshatraIntervals) ? day.nakshatraIntervals : [],
    // The decision engine must not infer a whole-day Hasta from the
    // sunrise label. Exact intervals above are the sole nakshatra evidence.
    nakshatra: null,
    sunRashi: day?.sunRashi,
    sankrantiTimes: Array.isArray(day?.sankrantiTimes) ? day.sankrantiTimes : [],
    grahanaTimes: Array.isArray(day?.grahanaTimes) ? day.grahanaTimes : [],
    eclipseTimes: Array.isArray(day?.eclipseTimes) ? day.eclipseTimes : [],
    dosha: day?.dosha || {}
  }));

  const decision = getSamavedaUpakarmaDateDecision(records, options);
  const exactSunTimes = source.filter(day =>
    day?.sunrise && day?.sunset &&
    Number.isFinite(new Date(day.sunrise).getTime()) &&
    Number.isFinite(new Date(day.sunset).getTime())
  ).length;
  const exactIntervalDays = source.filter(day => Array.isArray(day?.nakshatraIntervals) && day.nakshatraIntervals.length > 0).length;
  const incompleteAstronomy = source.length > 0 && (exactSunTimes < source.length || exactIntervalDays < source.length);
  const safeDecision = incompleteAstronomy ? {
    status: "unavailable",
    message: "वार्षिक पंचांग स्कैन में कुछ दिनों के सूर्योदय-सूर्यास्त या वास्तविक नक्षत्र-अंतराल अनुपलब्ध हैं; अधूरे डेटा से सामवेद उपाकर्म की तारीख़ तय नहीं की गई।"
  } : decision;
  const exactHastaDays = source.filter(hasExactHastaInterval).length;
  const sankrantiDays = source.filter(day =>
    Array.isArray(day?.sankrantiTimes) && day.sankrantiTimes.length
  ).length;
  const eclipseDays = source.filter(day =>
    (Array.isArray(day?.grahanaTimes) && day.grahanaTimes.length) ||
    (Array.isArray(day?.eclipseTimes) && day.eclipseTimes.length) ||
    day?.grahana || day?.eclipse
  ).length;

  return {
    schemaVersion: 1,
    rule: "samaveda-upakarma-aparahna",
    calculationStatus: safeDecision.status === "selected" || safeDecision.status === "selected-with-shanti"
      ? "calculated-approved"
      : "unavailable",
    status: safeDecision.status,
    date: safeDecision.date || null,
    label: safeDecision.label || null,
    note: safeDecision.note || safeDecision.message || null,
    requiresShanti: Boolean(safeDecision.requiresShanti),
    reviewStatus: safeDecision.status === "selected" || safeDecision.status === "selected-with-shanti" ? "approved" : "unavailable",
    sampradaya: options.sampradaya === "tamil" ? "tamil" : "general",
    coverage: {
      daysScanned: source.length,
      daysWithSunriseAndSunset: exactSunTimes,
      daysWithExactNakshatraIntervals: exactIntervalDays,
      daysWithExactHastaIntervals: exactHastaDays,
      daysWithSankrantiTimes: sankrantiDays,
      daysWithEclipseData: eclipseDays,
      eclipseDataProvided: eclipseDays > 0
    }
  };
}

export { HASTA_INDEX };
