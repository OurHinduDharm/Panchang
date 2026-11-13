import { HELIACAL_EVENT } from "./swiss-ephemeris-heliacal-adapter.mjs";

/**
 * Swiss Ephemeris' fixed-star catalogue identifies Agastya as the same
 * physical star as Canopus, Bayer designation alCar. This module keeps the
 * Indian traditional name as the calculation key.
 */
export const AGASTYA_FIXED_STAR = Object.freeze({
  objectName: "Agastya",
  traditionalName: "अगस्त्य",
  commonAstronomicalName: "Canopus",
  bayerDesignation: "alCar",
  catalogueIdentity: "Agastya,alCar"
});

/**
 * Calculates the next local heliacal morning-first and evening-last events
 * for Canopus/Agastya. The traditional Arghya observance is deliberately
 * returned as a separate, uncomputed rule layer.
 */
export function calculateAgastyaHeliacalEvents({
  adapter,
  startDate,
  location,
  atmosphere = null,
  observerVision = null
}) {
  if (!adapter || typeof adapter.calculate !== "function") {
    throw new TypeError("A Swiss heliacal adapter is required");
  }

  const common = {
    startDate,
    location,
    atmosphere,
    observerVision,
    objectName: AGASTYA_FIXED_STAR.objectName
  };

  const morningFirst = adapter.calculate({
    ...common,
    eventType: HELIACAL_EVENT.MORNING_FIRST
  });
  const eveningLast = adapter.calculate({
    ...common,
    eventType: HELIACAL_EVENT.EVENING_LAST
  });

  return Object.freeze({
    star: AGASTYA_FIXED_STAR,
    eventClass: "fixed-star-heliacal-visibility",
    morningFirst,
    eveningLast,
    traditionalArghya: Object.freeze({
      status: "separate-rule-not-calculated",
      sourceDataPath: "data/agastya-arghya-pithoragarh.json"
    }),
    method: "swiss-ephemeris-fixed-star-heliacal-visibility",
    terrainHorizon: "not-included"
  });
}
