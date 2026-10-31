import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";

const data = JSON.parse(await readFile(new URL("../data/asta-udaya-all-chunks.json", import.meta.url), "utf8"));
const bodies = data.manifest.generator.bodies;
const bodyIndex = new Map(bodies.map((name, i) => [name, i]));
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const norm = a => Math.hypot(a[0], a[1], a[2]);
const angleDeg = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a,b)/(norm(a)*norm(b))))) * 180 / Math.PI;
const vec = row => row.slice(1);
const lerp = (a,b,t) => a.map((v,i) => v + (b[i]-v)*t);
const getVec = (sample, name) => vec(sample[1][bodyIndex.get(name)]);

let intervalCount = 0;
let vectorComparisons = 0;
let maxVectorErrorAu = 0;
let maxSeparationErrorDeg = 0;
let maxSeparationCase = null;
const sumIndex = bodyIndex.get("Sun");
assert.notEqual(sumIndex, undefined, "Sun missing from dataset");

for (const chunk of data.chunks) {
  for (let i = 0; i < chunk.samples.length - 1; i++) {
    const a = chunk.samples[i], b = chunk.samples[i+1];
    const ta = Date.parse(a[0]), tb = Date.parse(b[0]);
    assert.equal(tb-ta, data.manifest.generator.cadenceHours * 3600000, "unexpected sample cadence");
    const tm = (ta+tb)/2, date = new Date(tm), timestamp = date.toISOString();
    const mid = [];
    for (const name of bodies) {
      const storedA = getVec(a,name), storedB = getVec(b,name);
      const interpolated = lerp(storedA, storedB, 0.5);
      const actualV = Astronomy.GeoVector(Astronomy.Body[name], date, true);
      const actual = [actualV.x, actualV.y, actualV.z];
      const err = norm(interpolated.map((v,k)=>v-actual[k]));
      maxVectorErrorAu = Math.max(maxVectorErrorAu, err);
      mid.push(interpolated);
      vectorComparisons++;
    }
    const direct = bodies.map(name => {
      const v = Astronomy.GeoVector(Astronomy.Body[name], date, true);
      return [v.x,v.y,v.z];
    });
    for (const name of bodies) {
      if (name === "Sun") continue;
      const idx = bodyIndex.get(name);
      const interpSep = angleDeg(mid[sumIndex], mid[idx]);
      const directSep = angleDeg(direct[sumIndex], direct[idx]);
      const error = Math.abs(interpSep-directSep);
      if (error > maxSeparationErrorDeg) {
        maxSeparationErrorDeg = error;
        maxSeparationCase = { body:name, timestamp, interpolatedDeg:interpSep, directDeg:directSep };
      }
    }
    intervalCount++;
  }
}
assert.ok(intervalCount > 1000, "not enough intervals tested");
assert.ok(Number.isFinite(maxVectorErrorAu) && Number.isFinite(maxSeparationErrorDeg), "non-finite interpolation error");
console.log(JSON.stringify({
  result: "PASS",
  method: "Linear interpolation at each 6-hour interval midpoint compared with direct pinned-engine GeoVector recalculation",
  intervalsTested: intervalCount,
  bodyVectorComparisons: vectorComparisons,
  maxVectorErrorAu,
  maxAngularSeparationErrorDeg: maxSeparationErrorDeg,
  maxAngularSeparationCase: maxSeparationCase,
  engine: data.manifest.generator.engine,
  note: "This quantifies interpolation error for this same engine and dataset only. It does not independently validate ephemeris accuracy, classical Asta/Udaya rules, or local visibility."
}, null, 2));
