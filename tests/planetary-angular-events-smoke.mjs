import * as Astronomy from "astronomy-engine";
import { calculatePlanetaryAngularCombustion } from "../research/planetary-angular-events.mjs";

const start = new Date("2026-01-01T00:00:00.000Z");
const end = new Date("2028-01-01T00:00:00.000Z");
const cases = [
  { body: "Venus", thresholdByMotion: { direct: 10, retrograde: 8 } },
  { body: "Jupiter", thresholdByMotion: { direct: 11, retrograde: 11 } }
];

const results = cases.map(item => calculatePlanetaryAngularCombustion({
  astronomy: Astronomy,
  body: item.body,
  start,
  end,
  thresholdByMotion: item.thresholdByMotion,
  stationStepHours: 12,
  elongationStepMinutes: 180,
  stationToleranceSeconds: 30,
  boundaryToleranceSeconds: 1
}));

for (const result of results) {
  if (result.events.length < 2) {
    throw new Error("Expected multiple angular combustion boundaries for " + result.body);
  }
  for (const event of result.events) {
    if (!Number.isFinite(Date.parse(event.instant))) {
      throw new Error("Invalid event time for " + result.body);
    }
  }
}

console.log(JSON.stringify(results.map(result => ({
  body: result.body,
  thresholdByMotion: result.thresholdByMotion,
  stations: result.stations,
  segments: result.segments.map(segment => ({
    start: segment.start.toISOString(),
    end: segment.end.toISOString(),
    motion: segment.motion,
    thresholdDeg: segment.thresholdDeg
  })),
  events: result.events
})), null, 2));
