#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
export function compareReferences(reference, calculated) {
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
    return { ...base, status: startDeltaMinutes === null || endDeltaMinutes === null ? "partial" : "paired",
      computedStartIST: event.startTimeIST, computedEndIST: event.endTimeIST,
      truePataIST: event.truePataIST, startDeltaMinutes, endDeltaMinutes,
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
    associationToleranceHours: 24,
    accuracyNote: "Association is not exact agreement. Signed differences are calculated minus printed times. Partial rows have only their known endpoint compared.",
    summary: {
      sourceRows: rows.length, completePairs: complete.length,
      partialPairs: rows.filter(row => row.status === "partial").length,
      unresolvedRows: rows.filter(row => !["paired", "partial"].includes(row.status)).length,
      medianAbsoluteStartMinutes: median(starts), medianAbsoluteEndMinutes: median(ends),
      maxAbsoluteStartMinutes: starts.length ? Math.max(...starts) : null,
      maxAbsoluteEndMinutes: ends.length ? Math.max(...ends) : null,
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
  const calculated = JSON.parse(execFileSync(process.execPath,
    [path.join(root, "scripts/compare-mahapat-ephemeris.mjs"), "--years=2023,2024", "--audit"],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));
  console.log(JSON.stringify(compareReferences(reference, calculated), null, 2));
}
