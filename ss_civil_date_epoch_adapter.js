/**
 * Research-only civil-instant / Lanka-mean-midnight adapter.
 *
 * This is a time-boundary adapter, NOT a Gregorian-to-traditional-calendar
 * converter and NOT a substitute for Sūrya-siddhānta I.45–51.
 *
 * Convention:
 * - Input instant must carry an explicit UTC marker or numeric offset.
 * - Longitude is explicit, east-positive degrees for the chosen meridian.
 * - Local mean solar time = UTC + longitude / 15 hours (no timezone/DST).
 * - The day label is the ISO date of that local-mean-solar clock.
 * - Fraction is elapsed seconds since that clock's midnight / 86400.
 * - The traditional ahargana is computed only when separately reconstructed
 *   traditional date fields are supplied. No Gregorian date is silently
 *   converted into tithi/month/year fields.
 *
 * Historical epoch, exact traditional Lanka meridian, inclusive/exclusive
 * day numbering, and source-specific calendar mapping remain caller decisions
 * and must be documented by the research fixture. No default meridian is used.
 */

import { chapter1AharganaFromTraditionalDate } from "./ss_chapter1_ahargana_calendar.js";

const DAY_SECONDS = 86400;
const EXPLICIT_ZONE = /(?:Z|[+-](?:0\d|1\d|2[0-3]):?[0-5]\d)$/i;

function parseExplicitInstant(instant) {
  if (typeof instant !== "string" || !EXPLICIT_ZONE.test(instant)) {
    throw new TypeError("instant must be an ISO date-time with explicit Z or numeric UTC offset.");
  }
  const milliseconds = Date.parse(instant);
  if (!Number.isFinite(milliseconds)) throw new TypeError("instant is not a valid date-time.");
  return milliseconds;
}

export function adaptCivilInstantToLankaMidnight({
  instant,
  meridianLongitudeEastDeg,
  traditionalDateFields = null
}) {
  const utcMilliseconds = parseExplicitInstant(instant);
  if (!Number.isFinite(meridianLongitudeEastDeg) ||
      meridianLongitudeEastDeg < -180 || meridianLongitudeEastDeg > 180) {
    throw new TypeError("meridianLongitudeEastDeg must be an explicit east-positive longitude in [-180, 180].");
  }

  const longitudeOffsetMs = meridianLongitudeEastDeg / 15 * 60 * 60 * 1000;
  const meanSolarMilliseconds = utcMilliseconds + longitudeOffsetMs;
  const shifted = new Date(meanSolarMilliseconds);
  const dayLabel = [
    shifted.getUTCFullYear().toString().padStart(4, "0"),
    (shifted.getUTCMonth() + 1).toString().padStart(2, "0"),
    shifted.getUTCDate().toString().padStart(2, "0")
  ].join("-");
  const secondsSinceMidnight =
    shifted.getUTCHours() * 3600 +
    shifted.getUTCMinutes() * 60 +
    shifted.getUTCSeconds() +
    shifted.getUTCMilliseconds() / 1000;
  const fractionalTimeSinceBoundary = secondsSinceMidnight / DAY_SECONDS;

  let traditionalAhargana = null;
  if (traditionalDateFields !== null) {
    if (!traditionalDateFields || typeof traditionalDateFields !== "object") {
      throw new TypeError("traditionalDateFields must be an object or null.");
    }
    traditionalAhargana = chapter1AharganaFromTraditionalDate(traditionalDateFields);
  }

  return Object.freeze({
    inputInstant: instant,
    convention: "UTC instant shifted by explicit east-positive meridian longitude / 15; local mean solar midnight; proleptic Gregorian ISO day label",
    meridianLongitudeEastDeg,
    lankaMidnightDayLabel: dayLabel,
    secondsSinceLankaMidnight: secondsSinceMidnight,
    fractionalTimeSinceLankaMidnight: fractionalTimeSinceBoundary,
    traditionalAhargana,
    status: traditionalAhargana
      ? "Boundary adapter plus Chapter I.45–51 arithmetic from separately supplied traditional fields; no civil-date-to-traditional-calendar conversion was performed."
      : "Boundary adapter only; traditional date fields and Chapter I.45–51 ahargana were not inferred."
  });
}

export function runCivilDateEpochAdapterTests() {
  const tests = [];
  const check = (name, fn) => {
    try {
      tests.push({ name, passed: Boolean(fn()) });
    } catch (error) {
      tests.push({ name, passed: false, error: error.message });
    }
  };

  check("Explicit meridian longitude maps UTC instant to local-mean-solar date label", () => {
    const out = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T20:00:00Z",
      meridianLongitudeEastDeg: 75
    });
    return out.lankaMidnightDayLabel === "2026-10-14";
  });

  check("Fractional time is measured from the computed midnight boundary", () => {
    const out = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T20:00:00Z",
      meridianLongitudeEastDeg: 75
    });
    return Math.abs(out.fractionalTimeSinceLankaMidnight - (1 / 24)) < 1e-12;
  });

  check("Zero longitude preserves UTC day label and clock fraction", () => {
    const out = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T06:00:00Z",
      meridianLongitudeEastDeg: 0
    });
    return out.lankaMidnightDayLabel === "2026-10-13" &&
      Math.abs(out.fractionalTimeSinceLankaMidnight - 0.25) < 1e-12;
  });

  check("Traditional ahargana remains null when traditional fields are absent", () => {
    const out = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T06:00:00Z",
      meridianLongitudeEastDeg: 0
    });
    return out.traditionalAhargana === null;
  });

  check("Separately supplied traditional fields invoke Chapter I.45–51 helper", () => {
    const out = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T06:00:00Z",
      meridianLongitudeEastDeg: 0,
      traditionalDateFields: {
        elapsedSolarYearsSinceKritaEnd: 2164928,
        elapsedMonthsFromCaitraShukla: 1,
        elapsedTithisInCurrentMonth: 6,
        intercalaryMonthAdjustment: 0
      }
    });
    return out.traditionalAhargana?.ahargana === 714404096641;
  });

  check("Missing explicit time zone is rejected", () => {
    try {
      adaptCivilInstantToLankaMidnight({
        instant: "2026-10-13T06:00:00",
        meridianLongitudeEastDeg: 0
      });
      return false;
    } catch (error) {
      return error instanceof TypeError;
    }
  });

  check("Missing meridian is rejected rather than silently defaulted", () => {
    try {
      adaptCivilInstantToLankaMidnight({ instant: "2026-10-13T06:00:00Z" });
      return false;
    } catch (error) {
      return error instanceof TypeError;
    }
  });

  check("Same UTC instant is expressed consistently at east, zero, and west meridians", () => {
    const east = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T20:00:00Z", meridianLongitudeEastDeg: 75
    });
    const zero = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T20:00:00Z", meridianLongitudeEastDeg: 0
    });
    const west = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T20:00:00Z", meridianLongitudeEastDeg: -75
    });
    return east.lankaMidnightDayLabel === "2026-10-14" &&
      Math.abs(east.fractionalTimeSinceLankaMidnight - 1 / 24) < 1e-12 &&
      zero.lankaMidnightDayLabel === "2026-10-13" &&
      Math.abs(zero.fractionalTimeSinceLankaMidnight - 20 / 24) < 1e-12 &&
      west.lankaMidnightDayLabel === "2026-10-13" &&
      Math.abs(west.fractionalTimeSinceLankaMidnight - 15 / 24) < 1e-12;
  });

  check("Day boundary is continuous at one second before, exactly at, and one second after local-mean midnight", () => {
    const before = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T18:59:59Z", meridianLongitudeEastDeg: 75
    });
    const at = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T19:00:00Z", meridianLongitudeEastDeg: 75
    });
    const after = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T19:00:01Z", meridianLongitudeEastDeg: 75
    });
    return before.lankaMidnightDayLabel === "2026-10-13" &&
      before.secondsSinceLankaMidnight === 86399 &&
      at.lankaMidnightDayLabel === "2026-10-14" &&
      at.secondsSinceLankaMidnight === 0 &&
      after.lankaMidnightDayLabel === "2026-10-14" &&
      after.secondsSinceLankaMidnight === 1;
  });

  check("Leap-day and year-independent calendar rollover follows the local-mean boundary", () => {
    const before = adaptCivilInstantToLankaMidnight({
      instant: "2024-02-29T18:59:59Z", meridianLongitudeEastDeg: 75
    });
    const at = adaptCivilInstantToLankaMidnight({
      instant: "2024-02-29T19:00:00Z", meridianLongitudeEastDeg: 75
    });
    return before.lankaMidnightDayLabel === "2024-02-29" &&
      before.secondsSinceLankaMidnight === 86399 &&
      at.lankaMidnightDayLabel === "2024-03-01" &&
      at.secondsSinceLankaMidnight === 0;
  });

  check("Equivalent UTC and explicit-offset timestamps map to the same boundary coordinates", () => {
    const utc = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-13T20:00:00Z", meridianLongitudeEastDeg: 75
    });
    const offset = adaptCivilInstantToLankaMidnight({
      instant: "2026-10-14T01:30:00+05:30", meridianLongitudeEastDeg: 75
    });
    return utc.lankaMidnightDayLabel === offset.lankaMidnightDayLabel &&
      utc.secondsSinceLankaMidnight === offset.secondsSinceLankaMidnight &&
      utc.fractionalTimeSinceLankaMidnight === offset.fractionalTimeSinceLankaMidnight;
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Synthetic adapter tests validate time-zone/meridian arithmetic only. They do not establish the historical Lanka meridian, epoch, day-number convention, or a Gregorian-to-traditional-calendar mapping."
  };
}
