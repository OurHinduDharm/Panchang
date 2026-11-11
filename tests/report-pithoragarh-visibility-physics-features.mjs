import { readFile, writeFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { sampleAstronomyVisibilityPhysics } from "../research/planetary-visibility-physics.mjs";

const source = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2021-2027.json", import.meta.url), "utf8"
));
const rows = source.windows.filter(row =>
  row.acceptanceEligible === true &&
  row.sourceStatus === "direct-page-captured-browser-verified" &&
  row.precision === "minute" &&
  row.boundaries?.astaStart?.normalizedUtcInstant &&
  row.boundaries?.astaEnd?.normalizedUtcInstant
);
const extinctionScenarios = [0.10, 0.20, 0.30];
const samples = [];
const failures = [];

for (const row of rows) {
  const observerData = row.testObserver;
  if (!observerData || !Number.isFinite(observerData.latitude) ||
      !Number.isFinite(observerData.longitude) ||
      !Number.isFinite(observerData.elevationMeters)) {
    failures.push({ id: row.id, reason: "missing-explicit-test-observer" });
    continue;
  }
  const observer = new Astronomy.Observer(
    observerData.latitude, observerData.longitude, observerData.elevationMeters
  );
  for (const boundaryName of ["astaStart", "astaEnd"]) {
    const boundary = row.boundaries[boundaryName];
    const date = new Date(boundary.normalizedUtcInstant);
    try {
      const base = sampleAstronomyVisibilityPhysics({
        astronomy: Astronomy,
        body: row.planet,
        observer,
        date,
        atmosphere: { extinctionCoefficientMagPerAirmass: 0.20 }
      });
      const scenarioMagnitudes = Object.fromEntries(extinctionScenarios.map(k => [
        k.toFixed(2),
        base.apparentMagnitude + (base.airmass === null ? 0 : k * base.airmass)
      ]));
      samples.push({
        sourceWindowId: row.id,
        planet: row.planet,
        sourceYear: row.sourcePageYear,
        boundary: boundaryName,
        publishedLocalDateTime: boundary.normalizedLocalDateTime,
        observer: {
          latitude: observerData.latitude,
          longitude: observerData.longitude,
          elevationMeters: observerData.elevationMeters,
          coordinateStatus: observerData.coordinateStatus
        },
        ...base,
        extinctionCorrectedMagnitudeScenarios: scenarioMagnitudes
      });
    } catch (error) {
      failures.push({ id: row.id, boundary: boundaryName, reason: error.message });
    }
  }
}

const groups = new Map();
for (const sample of samples) {
  const key = sample.planet + "|" + sample.boundary;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(sample);
}
const summary = [...groups.entries()].map(([key, values]) => {
  const [planet, boundary] = key.split("|");
  const mean = field => values.reduce((sum, row) => sum + row[field], 0) / values.length;
  return {
    planet,
    boundary,
    count: values.length,
    twilightClasses: Object.fromEntries(
      [...new Set(values.map(row => row.twilightClass))].sort().map(name => [
        name, values.filter(row => row.twilightClass === name).length
      ])
    ),
    meanSolarAltitudeDegrees: Number(mean("sunAltitudeDegrees").toFixed(4)),
    minSolarAltitudeDegrees: Number(Math.min(...values.map(row => row.sunAltitudeDegrees)).toFixed(4)),
    maxSolarAltitudeDegrees: Number(Math.max(...values.map(row => row.sunAltitudeDegrees)).toFixed(4)),
    meanSunPlanetSeparationDegrees: Number(mean("sunPlanetSeparationDegrees").toFixed(4)),
    meanApparentMagnitude: Number(mean("apparentMagnitude").toFixed(4)),
    meanAirmass: Number(mean("airmass").toFixed(4))
  };
});

const report = {
  schemaVersion: 1,
  status: "research-only-physics-feature-audit",
  generatedAt: new Date().toISOString(),
  source: "Direct browser-verified Pithoragarh named-city ledger; source provider coordinates are not published",
  observerPolicy: "Use each row's explicit project test observer; never substitute another city",
  atmospherePolicy: "0.10, 0.20 and 0.30 mag/airmass are sensitivity scenarios, not measured Pithoragarh atmosphere",
  sourceWindowCount: rows.length,
  boundaryCount: samples.length,
  failureCount: failures.length,
  extinctionScenariosMagPerAirmass: extinctionScenarios,
  summary,
  samples,
  failures
};
await writeFile(new URL("../research/reports/pithoragarh-visibility-physics-features-2021-2027.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({
  status: report.status,
  sourceWindowCount: report.sourceWindowCount,
  boundaryCount: report.boundaryCount,
  failureCount: report.failureCount,
  summary: report.summary,
  reportPath: "research/reports/pithoragarh-visibility-physics-features-2021-2027.json"
}, null, 2));
if (failures.length) process.exitCode = 1;
