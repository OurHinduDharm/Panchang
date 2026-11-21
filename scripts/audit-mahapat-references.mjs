#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import { createAstronomyEngineMahapataEphemeris } from "../research/paatadhikar/astronomy-engine-adapter.mjs";
import { diagnoseMahapata } from "../research/paatadhikar/mahapata-math.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const minute = 60_000;
const typeNames = { vaidhrti: "वैधृति महापात", vyatipata: "व्यतीपात महापात" };
const instant = value => value ? Date.parse(value) : null;

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

// A 24-hour window associates records; it is NOT a timing accuracy criterion.
// Ambiguous associations remain unresolved instead of taking the nearest silently.
export function compareReferences(reference, calculated, boundaryAt = null) {
  const used = new Set();
  const rows = reference.events.map((source, index) => {
    const endpoint = source.touchTimeIST ? "startTimeIST" : "endTimeIST";
    const sourceTime = instant(source.touchTimeIST || source.releaseTimeIST);
    const candidates = calculated.events.filter(event =>
      event.type === typeNames[source.type] && sourceTime !== null &&
      Math.abs(instant(event[endpoint]) - sourceTime) < 24 * 60 * minute);
    const base = { sourceRow: index + 1, source, candidateCount: candidates.length };
    if (candidates.length !== 1) return { ...base, status: candidates.length ? "ambiguous" : "unmatched" };
    const event = candidates[0];
    if (used.has(event)) return { ...base, status: "duplicate-association" };
    used.add(event);
    const startDeltaMinutes = source.touchTimeIST
      ? (instant(event.startTimeIST) - instant(source.touchTimeIST)) / minute : null;
    const endDeltaMinutes = source.releaseTimeIST
      ? (instant(event.endTimeIST) - instant(source.releaseTimeIST)) / minute : null;
    const sourceBoundaryArcminutes = boundaryAt ? {
      start: source.touchTimeIST ? boundaryAt(source.touchTimeIST, source.type) : null,
      end: source.releaseTimeIST ? boundaryAt(source.releaseTimeIST, source.type) : null
    } : null;
    return { ...base, sourceBoundaryArcminutes, status: startDeltaMinutes === null || endDeltaMinutes === null ? "partial" : "paired",
      computedStartIST: event.startTimeIST, computedEndIST: event.endTimeIST,
      truePataIST: event.truePataIST, startDeltaMinutes, endDeltaMinutes,
      midpointDeltaMinutes: startDeltaMinutes !== null && endDeltaMinutes !== null
        ? (startDeltaMinutes + endDeltaMinutes) / 2 : null,
      durationDeltaMinutes: startDeltaMinutes !== null && endDeltaMinutes !== null
        ? endDeltaMinutes - startDeltaMinutes : null,
      maxAbsoluteDeltaMinutes: Math.max(...[startDeltaMinutes, endDeltaMinutes]
        .filter(value => value !== null).map(Math.abs)) };
  });
  const complete = rows.filter(row => row.status === "paired");
  const starts = complete.map(row => Math.abs(row.startDeltaMinutes));
  const ends = complete.map(row => Math.abs(row.endDeltaMinutes));
  const coverageTimes = reference.events.flatMap(row => [row.touchTimeIST, row.releaseTimeIST])
    .filter(Boolean).map(instant);
  const first = Math.min(...coverageTimes), last = Math.max(...coverageTimes);
  return {
    status: "research-only-not-approved", source: reference.source,
    contactModel: calculated.contactModel ?? null,
    associationToleranceHours: 24,
    accuracyNote: "Association is not exact agreement. Signed differences are calculated minus printed times. Partial rows have only their known endpoint compared.",
    summary: {
      sourceRows: rows.length, completePairs: complete.length,
      partialPairs: rows.filter(row => row.status === "partial").length,
      unresolvedRows: rows.filter(row => !["paired", "partial"].includes(row.status)).length,
      medianAbsoluteStartMinutes: median(starts), medianAbsoluteEndMinutes: median(ends),
      maxAbsoluteStartMinutes: starts.length ? Math.max(...starts) : null,
      maxAbsoluteEndMinutes: ends.length ? Math.max(...ends) : null,
      bothEndpointsWithin1Minute: complete.filter(row => row.maxAbsoluteDeltaMinutes <= 1).length,
      bothEndpointsWithin3Minutes: complete.filter(row => row.maxAbsoluteDeltaMinutes <= 3).length,
      over3MinuteRows: rows.filter(row => row.maxAbsoluteDeltaMinutes > 3).map(row => row.sourceRow),
      bothEndpointsWithin10Minutes: complete.filter(row => row.maxAbsoluteDeltaMinutes <= 10).length,
      bothEndpointsWithin30Minutes: complete.filter(row => row.maxAbsoluteDeltaMinutes <= 30).length,
      over30MinuteRows: rows.filter(row => row.maxAbsoluteDeltaMinutes > 30).map(row => row.sourceRow)
    },
    rows,
    unpairedCalculatedWithinSourceSpan: calculated.events.filter(event => !used.has(event) &&
      instant(event.startTimeIST) >= first && instant(event.startTimeIST) <= last)
      .map(event => ({ type: event.type, startTimeIST: event.startTimeIST, endTimeIST: event.endTimeIST })),
    discoveryAudit: calculated.discoveryAudit ?? null
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const reference = JSON.parse(readFileSync(path.join(root, "data/reviews/mahapat-2023-2024-reference.json"), "utf8"));
  const run = model => JSON.parse(execFileSync(process.execPath,
    [path.join(root, "scripts/compare-mahapat-ephemeris.mjs"), "--years=2023,2024", "--audit", `--contact-model=${model}`],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));
  const require = createRequire(import.meta.url);
  const entry = require.resolve("astronomy-engine");
  const ephemeris = createAstronomyEngineMahapataEphemeris(require(path.join(path.dirname(entry), "astronomy.min.js")));
  const boundaryAt = (timestamp, type) => {
    const p = diagnoseMahapata(ephemeris(new Date(timestamp)));
    return 60 * Math.abs(p.moonDeclinationDeg + (type === "vaidhrti" ? 1 : -1) * p.sunDeclinationDeg);
  };
  const inferred = compareReferences(reference, run("taraprasad-30-arcmin"), boundaryAt);
  const baseline = compareReferences(reference, run("apparent-disks"));
  console.log(JSON.stringify({ ...inferred, apparentDiskBaseline: baseline.summary }, null, 2));
}
