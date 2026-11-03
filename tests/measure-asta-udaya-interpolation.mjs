import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";

const data = JSON.parse(await readFile(new URL("../data/asta-udaya-all-chunks.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("../data/asta-udaya-manifest.json", import.meta.url), "utf8"));
const bodies = manifest.generator.bodies;
const bodyIndex = new Map(bodies.map((name, i) => [name, i]));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = a => Math.hypot(a[0], a[1], a[2]);
const angleDeg = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (norm(a) * norm(b))))) * 180 / Math.PI;
const vec = row => row.slice(1);
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const getVec = (sample, name) => vec(sample[1][bodyIndex.get(name)]);

assert.equal(manifest.generator.engine, "astronomy-engine@2.1.19");
assert.equal(manifest.generator.cadenceHours, 6);
assert.equal(manifest.coordinateFrame, "EQJ");
assert.equal(manifest.datasetType, "geocentric-apparent-vectors");
assert.ok(Array.isArray(data.chunks) && data.chunks.length > 0, "no vector chunks found");
assert.ok(Array.isArray(bodies) && bodies.includes("Sun"), "Sun missing from manifest");

let intervalCount = 0;
let vectorComparisons = 0;
let maxVectorErrorAu = 0;
let maxSeparationErrorDeg = 0;
let maxSeparationCase = null;
const sunIndex = bodyIndex.get("Sun");

for (const chunk of data.chunks) {
  assert.ok(Array.isArray(chunk.samples) && chunk.samples.length > 1, `${chunk.key}: insufficient samples`);
  for (let i = 0; i < chunk.samples.length - 1; i++) {
    const a = chunk.samples[i], b = chunk.samples[i + 1];
    const ta = Date.parse(a[0]), tb = Date.parse(b[0]);
    assert.equal(tb - ta, manifest.generator.cadenceHours * 3600000, "unexpected sample cadence");
    const timestamp = new Date((ta + tb) / 2).toISOString();
    const date = new Date(timestamp);
    const interpolatedVectors = [];

    for (const name of bodies) {
      const storedA = getVec(a, name), storedB = getVec(b, name);
      const interpolated = lerp(storedA, storedB, 0.5);
      const actualV = Astronomy.GeoVector(Astronomy.Body[name], date, true);
      const actual = [actualV.x, actualV.y, actualV.z];
      const error = norm(interpolated.map((value, axis) => value - actual[axis]));
      maxVectorErrorAu = Math.max(maxVectorErrorAu, error);
      interpolatedVectors.push(interpolated);
      vectorComparisons++;
    }

    const directVectors = bodies.map(name => {
      const v = Astronomy.GeoVector(Astronomy.Body[name], date, true);
      return [v.x, v.y, v.z];
    });

    for (const name of bodies) {
      if (name === "Sun") continue;
      const index = bodyIndex.get(name);
      const interpolatedSeparation = angleDeg(interpolatedVectors[sunIndex], interpolatedVectors[index]);
      const directSeparation = angleDeg(directVectors[sunIndex], directVectors[index]);
      const error = Math.abs(interpolatedSeparation - directSeparation);
      if (error > maxSeparationErrorDeg) {
        maxSeparationErrorDeg = error;
        maxSeparationCase = {
          body: name,
          timestamp,
          interpolatedDegrees: interpolatedSeparation,
          directDegrees: directSeparation
        };
      }
    }
    intervalCount++;
  }
}

assert.ok(intervalCount > 1000, "not enough six-hour intervals tested");
assert.ok(Number.isFinite(maxVectorErrorAu) && Number.isFinite(maxSeparationErrorDeg), "non-finite interpolation error");

console.log(JSON.stringify({
  result: "MEASURED",
  method: "Linear interpolation at every six-hour interval midpoint compared with direct pinned-engine GeoVector recalculation",
  intervalsTested: intervalCount,
  bodyVectorComparisons: vectorComparisons,
  maxVectorErrorAu,
  maxSunPlanetAngularSeparationErrorDegrees: maxSeparationErrorDeg,
  maxAngularSeparationCase: maxSeparationCase,
  engine: manifest.generator.engine,
  datasetStatus: manifest.status,
  cadenceHours: manifest.generator.cadenceHours,
  coordinateFrame: manifest.coordinateFrame,
  note: "This measures interpolation error against the same pinned engine only. It does not independently validate ephemeris accuracy, Drik matching, classical Asta/Udaya rules, or local visibility. No pass/fail accuracy tolerance is asserted until a justified tolerance is defined."
}, null, 2));
