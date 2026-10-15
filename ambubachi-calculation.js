"use strict";

/**
 * Ambubachi astronomical and ritual-window helpers.
 *
 * The caller must supply a reliable sidereal solar-longitude function (for
 * example, Swiss Ephemeris configured with the chosen ayanamsha). This module
 * does not pretend to calculate ephemerides by itself.
 *
 * Pravritti trigger used here: Sun crosses 66°40′ sidereal longitude,
 * the start of Ardra nakshatra's first pada in Mithuna.
 */
const AMBUBACHI_TARGET_LONGITUDE_DEGREES = 66 + 40 / 60;
const AMBUBACHI_NIVRITTI_LONGITUDE_DEGREES = 70;
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeLongitude(value) {
  if (!Number.isFinite(value)) throw new TypeError("longitudeAt(date) must return a finite number");
  return ((value % 360) + 360) % 360;
}

function unwrapNear(normalized, reference) {
  return normalized + 360 * Math.round((reference - normalized) / 360);
}

/**
 * Find the first increasing sidereal-longitude crossing in [start, end].
 * start/end are Date objects or epoch milliseconds. longitudeAt accepts a
 * Date and returns sidereal solar longitude in degrees [0, 360).
 *
 * Returns the crossing instant as a Date, or null if the target is not crossed
 * within the supplied interval. The search assumes solar longitude is
 * increasing through the interval and uses bisection to toleranceMs.
 */
function findSiderealSolarIngress(options) {
  if (!options || typeof options.longitudeAt !== "function") {
    throw new TypeError("longitudeAt(date) callback is required");
  }
  const startMs = options.start instanceof Date ? options.start.getTime() : Number(options.start);
  const endMs = options.end instanceof Date ? options.end.getTime() : Number(options.end);
  const target = normalizeLongitude(
    options.targetLongitudeDegrees == null
      ? AMBUBACHI_TARGET_LONGITUDE_DEGREES
      : options.targetLongitudeDegrees
  );
  const stepMs = (options.stepHours == null ? 6 : options.stepHours) * 60 * 60 * 1000;
  const toleranceMs = options.toleranceMs == null ? 1000 : options.toleranceMs;
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    throw new RangeError("start and end must define a valid increasing time interval");
  }
  if (!(stepMs > 0) || !(toleranceMs > 0)) {
    throw new RangeError("stepHours and toleranceMs must be positive");
  }

  let loMs = startMs;
  let loUnwrapped = normalizeLongitude(options.longitudeAt(new Date(loMs)));
  let targetUnwrapped = target + 360 * Math.ceil((loUnwrapped - target) / 360);
  if (targetUnwrapped <= loUnwrapped + 1e-10) targetUnwrapped += 360;

  while (loMs < endMs) {
    const hiMs = Math.min(endMs, loMs + stepMs);
    const hiNormalized = normalizeLongitude(options.longitudeAt(new Date(hiMs)));
    const hiUnwrapped = unwrapNear(hiNormalized, loUnwrapped + 1);
    if (hiUnwrapped >= targetUnwrapped) {
      let left = loMs;
      let right = hiMs;
      while (right - left > toleranceMs) {
        const mid = Math.floor((left + right) / 2);
        const midNormalized = normalizeLongitude(options.longitudeAt(new Date(mid)));
        const midUnwrapped = unwrapNear(midNormalized, (loUnwrapped + hiUnwrapped) / 2);
        if (midUnwrapped >= targetUnwrapped) right = mid;
        else left = mid;
      }
      return new Date(right);
    }
    loMs = hiMs;
    loUnwrapped = hiUnwrapped;
    targetUnwrapped = target + 360 * Math.ceil((loUnwrapped - target) / 360);
    if (targetUnwrapped <= loUnwrapped + 1e-10) targetUnwrapped += 360;
  }
  return null;
}

/**
 * Calculate the astronomical Ambubachi interval from the Sun's sidereal
 * longitude: Pravritti at 66°40′ (start of Ardra pada 1), Nivritti at
 * 70°00′ (end of Ardra pada 1). The same caller-supplied ephemeris and
 * ayanamsha must be used for both boundaries.
 *
 * This is a Drik-style longitude-boundary calculation, not a temple schedule.
 * It does not claim to reproduce traditional mean-motion Siddhanta panjikas.
 */
function findAmbubachiSolarWindow(options) {
  if (!options || typeof options.longitudeAt !== "function") {
    throw new TypeError("longitudeAt(date) callback is required");
  }
  const common = {
    start: options.start,
    end: options.end,
    longitudeAt: options.longitudeAt,
    stepHours: options.stepHours,
    toleranceMs: options.toleranceMs
  };
  const pravritti = findSiderealSolarIngress({
    ...common,
    targetLongitudeDegrees: AMBUBACHI_TARGET_LONGITUDE_DEGREES
  });
  const nivritti = findSiderealSolarIngress({
    ...common,
    targetLongitudeDegrees: AMBUBACHI_NIVRITTI_LONGITUDE_DEGREES
  });
  if (!pravritti || !nivritti || nivritti <= pravritti) return null;
  return { pravritti, nivritti, method: "sidereal-solar-longitude-ardra-pada-1" };
}

/**
 * Async counterpart for ephemeris providers such as Panchangam-JS.
 * longitudeAt(date) may return either a number or a Promise<number>.
 */
async function findSiderealSolarIngressAsync(options) {
  if (!options || typeof options.longitudeAt !== "function") {
    throw new TypeError("longitudeAt(date) callback is required");
  }
  const startMs = options.start instanceof Date ? options.start.getTime() : Number(options.start);
  const endMs = options.end instanceof Date ? options.end.getTime() : Number(options.end);
  const target = normalizeLongitude(
    options.targetLongitudeDegrees == null
      ? AMBUBACHI_TARGET_LONGITUDE_DEGREES
      : options.targetLongitudeDegrees
  );
  const stepMs = (options.stepHours == null ? 6 : options.stepHours) * 60 * 60 * 1000;
  const toleranceMs = options.toleranceMs == null ? 1000 : options.toleranceMs;
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    throw new RangeError("start and end must define a valid increasing time interval");
  }
  if (!(stepMs > 0) || !(toleranceMs > 0)) {
    throw new RangeError("stepHours and toleranceMs must be positive");
  }

  let loMs = startMs;
  let loUnwrapped = normalizeLongitude(await options.longitudeAt(new Date(loMs)));
  let targetUnwrapped = target + 360 * Math.ceil((loUnwrapped - target) / 360);
  if (targetUnwrapped <= loUnwrapped + 1e-10) targetUnwrapped += 360;

  while (loMs < endMs) {
    const hiMs = Math.min(endMs, loMs + stepMs);
    const hiNormalized = normalizeLongitude(await options.longitudeAt(new Date(hiMs)));
    const hiUnwrapped = unwrapNear(hiNormalized, loUnwrapped + 1);
    if (hiUnwrapped >= targetUnwrapped) {
      let left = loMs;
      let right = hiMs;
      while (right - left > toleranceMs) {
        const mid = Math.floor((left + right) / 2);
        const midNormalized = normalizeLongitude(await options.longitudeAt(new Date(mid)));
        const midUnwrapped = unwrapNear(midNormalized, (loUnwrapped + hiUnwrapped) / 2);
        if (midUnwrapped >= targetUnwrapped) right = mid;
        else left = mid;
      }
      return new Date(right);
    }
    loMs = hiMs;
    loUnwrapped = hiUnwrapped;
    targetUnwrapped = target + 360 * Math.ceil((loUnwrapped - target) / 360);
    if (targetUnwrapped <= loUnwrapped + 1e-10) targetUnwrapped += 360;
  }
  return null;
}

async function findAmbubachiSolarWindowAsync(options) {
  if (!options || typeof options.longitudeAt !== "function") {
    throw new TypeError("longitudeAt(date) callback is required");
  }
  const common = {
    start: options.start,
    end: options.end,
    longitudeAt: options.longitudeAt,
    stepHours: options.stepHours,
    toleranceMs: options.toleranceMs
  };
  const pravritti = await findSiderealSolarIngressAsync({
    ...common,
    targetLongitudeDegrees: AMBUBACHI_TARGET_LONGITUDE_DEGREES
  });
  const nivritti = await findSiderealSolarIngressAsync({
    ...common,
    targetLongitudeDegrees: AMBUBACHI_NIVRITTI_LONGITUDE_DEGREES
  });
  if (!pravritti || !nivritti || nivritti <= pravritti) return null;
  return { pravritti, nivritti, method: "sidereal-solar-longitude-ardra-pada-1" };
}

/**
 * Return the provisional local-date calendar window after Pravritti.
 * This is not an astronomical Nivritti calculation and must not override
 * the official Kamakhya Devalaya reopening notice.
 */
function getAmbubachiRitualWindow(pravrittiLocalDate) {
  if (typeof pravrittiLocalDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(pravrittiLocalDate)) {
    throw new TypeError("pravrittiLocalDate must be YYYY-MM-DD");
  }
  const [year, month, day] = pravrittiLocalDate.split("-").map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day));
  if (
    anchor.getUTCFullYear() !== year ||
    anchor.getUTCMonth() !== month - 1 ||
    anchor.getUTCDate() !== day
  ) {
    throw new RangeError("pravrittiLocalDate is not a valid calendar date");
  }
  function dateAt(offset) {
    const d = new Date(anchor.getTime() + offset * DAY_MS);
    return d.toISOString().slice(0, 10);
  }
  return {
    pravrittiDate: dateAt(0),
    templeClosedDates: [dateAt(1), dateAt(2), dateAt(3)],
    provisionalReopeningDate: dateAt(4),
    reopeningTime: null,
    requiresOfficialConfirmation: true
  };
}

module.exports = {
  AMBUBACHI_TARGET_LONGITUDE_DEGREES,
  AMBUBACHI_NIVRITTI_LONGITUDE_DEGREES,
  findSiderealSolarIngress,
  findAmbubachiSolarWindow,
  findSiderealSolarIngressAsync,
  findAmbubachiSolarWindowAsync,
  getAmbubachiRitualWindow
};
