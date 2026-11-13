import * as Astronomy from "astronomy-engine";
import { calculatePlanetObserverSnapshot } from "../research/planetary-observer-snapshot.mjs";

const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const date = new Date("2026-10-19T00:00:00.000Z");
for (const body of ["Venus", "Jupiter", "Saturn", "Mars", "Mercury"]) {
  const result = calculatePlanetObserverSnapshot({
    astronomy: Astronomy, body, date, observer, refraction: "normal"
  });
  if (!Number.isFinite(result.geocentricElongationDeg) ||
      !Number.isFinite(result.topocentric.altitudeDeg) ||
      !Number.isFinite(result.topocentric.azimuthDeg)) {
    throw new Error("Invalid observer snapshot: " + JSON.stringify(result));
  }
}
const pithoragarh = calculatePlanetObserverSnapshot({
  astronomy: Astronomy, body: "Venus", date, observer
});
const mumbai = calculatePlanetObserverSnapshot({
  astronomy: Astronomy, body: "Venus", date,
  observer: new Astronomy.Observer(19.116667, 72.85, 14.2)
});
if (Math.abs(pithoragarh.topocentric.altitudeDeg - mumbai.topocentric.altitudeDeg) < 1e-6) {
  throw new Error("Observer-specific altitude did not change between Pithoragarh and Mumbai");
}
console.log(JSON.stringify({
  date: date.toISOString(),
  pithoragarh: pithoragarh.topocentric,
  mumbai: mumbai.topocentric,
  sharedGeocentricElongationDeg: pithoragarh.geocentricElongationDeg
}, null, 2));
