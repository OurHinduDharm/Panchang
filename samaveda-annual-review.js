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
    calculationStatus: decision.status === "selected" || decision.status === "selected-with-shanti"
      ? "calculated-needs-review"
      : "unavailable",
    status: decision.status,
    date: decision.date || null,
    label: decision.label || null,
    note: decision.note || decision.message || null,
    requiresShanti: Boolean(decision.requiresShanti),
    reviewStatus: "needs-review",
    sampradaya: options.sampradaya === "tamil" ? "tamil" : "general",
    coverage: {
      daysScanned: source.length,
      daysWithSunriseAndSunset: exactSunTimes,
      daysWithExactHastaIntervals: exactHastaDays,
      daysWithSankrantiTimes: sankrantiDays,
      daysWithEclipseData: eclipseDays,
      eclipseDataProvided: eclipseDays > 0
    }
  };
}

export { HASTA_INDEX };
