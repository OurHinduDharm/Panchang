import {
  SearchRiseSet,
  Observer
} from "https://esm.sh/astronomy-engine@2.1.19";

const PLANETS = [
  { key: "mercury", name: "बुध", body: "Mercury" },
  { key: "venus",   name: "शुक्र", body: "Venus" },
  { key: "mars",    name: "मंगल", body: "Mars" },
  { key: "jupiter", name: "गुरु", body: "Jupiter" },
  { key: "saturn",  name: "शनि", body: "Saturn" }
];

function localDateTime(date, timeZone = "Asia/Kolkata") {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function getPlanetEvent(body, observer, startDate, direction) {
  try {
    const result = SearchRiseSet(
      body,
      observer,
      direction,
      startDate,
      2
    );

    return result?.date || null;
  } catch (error) {
    console.error(`Rise/Set error: ${body}`, error);
    return null;
  }
}

export function getPlanetRiseSet({
  latitude,
  longitude,
  elevation = 0,
  date,
  timeZone = "Asia/Kolkata"
}) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !date
  ) {
    return [];
  }

  const observer = new Observer(
    latitude,
    longitude,
    elevation
  );

  const startDate = new Date(date);

  return PLANETS.map(planet => {
    const rise = getPlanetEvent(
      planet.body,
      observer,
      startDate,
      +1
    );

    const set = getPlanetEvent(
      planet.body,
      observer,
      startDate,
      -1
    );

    return {
      key: planet.key,
      name: planet.name,
      rise: rise
        ? localDateTime(rise, timeZone)
        : null,
      set: set
        ? localDateTime(set, timeZone)
        : null
    };
  });
}
