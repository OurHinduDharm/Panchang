import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";

const dataPath = new URL("../data/asta-udaya-all-chunks.json", import.meta.url);
const manifestPath = new URL("../data/asta-udaya-manifest.json", import.meta.url);
const data = JSON.parse(await readFile(dataPath, "utf8"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const expectedBodies = manifest.generator?.bodies;
const cadenceMs = manifest.generator?.cadenceHours * 3600_000;
assert.equal(manifest.datasetType, "geocentric-apparent-vectors");
assert.equal(manifest.generator?.engine, "astronomy-engine@2.1.19");
assert.equal(manifest.generator?.vectorMethod, "GeoVector(body,date,true)");
assert.equal(manifest.generator?.coordinateFrame, "EQJ");
assert.ok(Array.isArray(expectedBodies) && expectedBodies.length === 6, "expected six bodies");
assert.ok(Number.isFinite(cadenceMs) && cadenceMs > 0, "invalid cadence");
assert.ok(Array.isArray(data.chunks) && data.chunks.length > 0, "no chunks in all-chunks file");
assert.equal(data.manifest?.generator?.engine, manifest.generator.engine);
assert.equal(data.manifest?.generator?.cadenceHours, manifest.generator.cadenceHours);

const manifestChunks = new Map(manifest.chunks.map(c => [c.key, c]));
assert.equal(manifestChunks.size, manifest.chunks.length, "duplicate keys in manifest");
assert.equal(data.chunks.length, manifest.chunks.length, "chunk count differs from manifest");

let totalSamples = 0;
let verifiedChecksums = 0;
let independentVectors = 0;
let previousEnd = null;
const selectedChecks = new Set();

for (const chunk of data.chunks) {
  const meta = manifestChunks.get(chunk.key);
  assert.ok(meta, `chunk missing from manifest: ${chunk.key}`);
  for (const field of ["fromUtc", "toUtcExclusive", "sampleCount", "checksum"]) {
    assert.equal(chunk[field], meta[field], `${chunk.key}: metadata mismatch for ${field}`);
  }
  assert.ok(Array.isArray(chunk.samples) && chunk.samples.length === chunk.sampleCount,
    `${chunk.key}: sample count mismatch`);
  assert.equal(chunk.checksum, "sha256:" + createHash("sha256")
    .update(JSON.stringify(chunk.samples), "utf8").digest("hex"),
    `${chunk.key}: SHA-256 mismatch`);
  verifiedChecksums++;

  const start = Date.parse(chunk.fromUtc);
  const end = Date.parse(chunk.toUtcExclusive);
  assert.ok(Number.isFinite(start) && Number.isFinite(end) && end > start, `${chunk.key}: invalid interval`);
  if (previousEnd !== null) assert.equal(start, previousEnd, `gap/overlap before ${chunk.key}`);
  previousEnd = end;

  assert.equal(chunk.samples[0]?.[0], chunk.fromUtc, `${chunk.key}: first sample not at interval start`);
  for (let i = 0; i < chunk.samples.length; i++) {
    const [timestamp, vectors] = chunk.samples[i];
    const ms = Date.parse(timestamp);
    assert.ok(Number.isFinite(ms), `${chunk.key}: invalid timestamp`);
    assert.equal(ms, start + i * cadenceMs, `${chunk.key}: cadence/order mismatch at sample ${i}`);
    assert.ok(Array.isArray(vectors) && vectors.length === expectedBodies.length,
      `${timestamp}: wrong vector count`);
    for (let b = 0; b < expectedBodies.length; b++) {
      const row = vectors[b];
      assert.equal(row?.[0], expectedBodies[b], `${timestamp}: body order/name mismatch`);
      assert.ok(row.slice(1).length === 3 && row.slice(1).every(Number.isFinite),
        `${timestamp}: non-finite or malformed vector for ${row?.[0]}`);
    }

    // Independently recompute chunk endpoints and a regular subset against the pinned engine.
    if (i === 0 || i === chunk.samples.length - 1 || totalSamples % 97 === 0) {
      selectedChecks.add(timestamp);
      for (const row of vectors) {
        const body = Astronomy.Body[row[0]];
        assert.ok(body !== undefined, `Astronomy Engine has no body enum for ${row[0]}`);
        const actual = Astronomy.GeoVector(body, new Date(timestamp), true);
        const expected = row.slice(1);
        for (const [axis, value] of [["x", actual.x], ["y", actual.y], ["z", actual.z]]) {
          assert.ok(Number.isFinite(value), `non-finite recomputed ${axis} at ${timestamp}`);
          assert.ok(Math.abs(value - expected[["x","y","z"].indexOf(axis)]) <= 2e-12,
            `independent vector mismatch ${row[0]} ${axis} at ${timestamp}: stored=${expected[["x","y","z"].indexOf(axis)]}, recomputed=${value}`);
        }
        independentVectors++;
      }
    }
    totalSamples++;
  }
  assert.ok(end - start === chunk.samples.length * cadenceMs,
    `${chunk.key}: interval duration does not match sample count/cadence`);
}
assert.equal(totalSamples, manifest.chunks.reduce((sum, c) => sum + c.sampleCount, 0),
  "manifest total sample count mismatch");
assert.equal(verifiedChecksums, manifest.chunks.length);
console.log(JSON.stringify({
  result: "PASS",
  chunks: data.chunks.length,
  samples: totalSamples,
  checksumsVerified: verifiedChecksums,
  independentlyRecomputedTimestamps: selectedChecks.size,
  independentlyRecomputedVectors: independentVectors,
  engine: manifest.generator.engine,
  cadenceHours: manifest.generator.cadenceHours,
  note: "Validates data integrity and reproduces selected vectors with the same pinned engine; this is not an independent ephemeris-source or classical Asta/Udaya validation."
}, null, 2));
