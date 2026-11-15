import { readFileSync } from "node:fs";
import { createSs9ApparentSampleAt } from "../research/astronomy-engine-ss9-provider.mjs";
import { scanSs9Transitions } from "../research/ss9-location-model.mjs";

const source = JSON.parse(readFileSync(
  new URL("../research/ss-ch9-classical-visibility-almora-ramnagar-2018-2027.json", import.meta.url),
  "utf8"
));

const BODY_LIMIT = Object.freeze({ Venus: 10, Jupiter: 11, Agastya: 13 });
const IST_OFFSET = "+05:30";
const YEAR_START = Date.UTC(2018, 0, 1);
const YEAR_END = Date.UTC(2028, 0, 1);

function localIso(utcMilliseconds, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(utcMilliseconds));
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

function compareOne(sourceEvent, modelEvents, timeZone) {
  const sourceDateTime = sourceEvent.dateTime;
  const dateOnly = !sourceDateTime.includes("T");
  const sourceInstant = Date.parse(dateOnly
    ? `${sourceDateTime}T00:00:00${IST_OFFSET}`
    : `${sourceDateTime}${IST_OFFSET}`);

  let best = null;
  for (const event of modelEvents) {
    const modelLocal = localIso(event.utcMilliseconds, timeZone);
    const modelDate = modelLocal.slice(0, 10);
    const delta = dateOnly
      ? Math.abs(Date.parse(`${modelDate}T00:00:00Z`) - Date.parse(`${sourceDateTime}T00:00:00Z`)) / 86_400_000
      : Math.abs(event.utcMilliseconds - sourceInstant) / 60_000;
    if (!best || delta < best.delta) best = { event, modelLocal, delta };
  }

  return {
    source: sourceDateTime,
    sourceMethod: sourceEvent.method,
    matchedModel: best ? best.modelLocal : null,
    modelDirection: best?.event.direction ?? null,
    difference: best ? Number(best.delta.toFixed(2)) : null,
    differenceUnit: dateOnly ? "days" : "minutes",
    note: best && best.delta > (dateOnly ? 15 : 60 * 24 * 30)
      ? "nearest match is outside the broad review window"
      : null
  };
}

function runLocation(location, sourceEvents, startUtcMs, endUtcMs) {
  const bodyResults = {};
  for (const body of Object.keys(BODY_LIMIT)) {
    const sampleAt = createSs9ApparentSampleAt(body);
    const modelEvents = scanSs9Transitions({
      body,
      latitudeDeg: location.latitudeDecimal,
      limitDeg: BODY_LIMIT[body],
      startUtcMs,
      endUtcMs,
      sampleAt,
      stepHours: 6,
      toleranceMs: 30_000
    });
    const matchingSources = sourceEvents.filter(x => x.body === body);
    bodyResults[body] = {
      limitDeg: BODY_LIMIT[body],
      modelEvents: modelEvents.map(event => ({
        event: event.event,
        direction: event.direction,
        utc: new Date(event.utcMilliseconds).toISOString(),
        local: localIso(event.utcMilliseconds, location.timezone),
        K: Number(event.K.toFixed(4))
      })),
      sourceComparisons: matchingSources.map(x => ({
        event: x.event,
        ...compareOne(x, modelEvents.filter(m => m.event === x.event), location.timezone)
      }))
    };
  }
  return {
    location: {
      name: location.name,
      latitude: location.latitudeDecimal,
      longitude: location.longitudeDecimal,
      elevationMeters: location.elevationMeters,
      timezone: location.timezone
    },
    bodies: bodyResults
  };
}

const almora = runLocation(
  source.location,
  source.events,
  YEAR_START,
  YEAR_END
);
const ramnagar = runLocation(
  source.ramnagar2023Sample.location,
  source.ramnagar2023Sample.events,
  Date.UTC(2023, 0, 1),
  Date.UTC(2024, 0, 1)
);

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: "research-backtest-not-production",
  engine: "Astronomy Engine 2.1.19",
  method: "SS Ch.9 K/C from apparent geocentric equatorial-of-date positions and observer-latitude oblique ascension",
  limits: BODY_LIMIT,
  caveats: [
    "Venus uses C=10° to match the supplied TKS Almora state snapshots; the 8° branch is not yet back-tested.",
    "TKS dates/times are reference observations, not truth labels; model/source differences must be reviewed, not silently tuned away.",
    "Longitude and elevation do not enter the classical K/C value in this kernel; elevation is reserved for physical horizon visibility.",
    "Agastya's source observations are date-only; comparisons are therefore by local calendar date only."
  ],
  almora,
  ramnagar2023: ramnagar
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
