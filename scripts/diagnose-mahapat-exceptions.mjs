#!/usr/bin/env node
/**
 * Read-only Mahapata exception diagnostics. Runs the existing reference audit;
 * never changes the ephemeris, contact rule or reference records.
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
const audit = fileURLToPath(new URL("./audit-mahapat-references.mjs", import.meta.url));
const minute = 60_000;
export function diagnoseException(row, tolerance = 3) {
  const { startDeltaMinutes: s, endDeltaMinutes: e } = row;
  const hasStart = Number.isFinite(s), hasEnd = Number.isFinite(e);
  const midpointDeltaMinutes = hasStart && hasEnd ? (s + e) / 2 : null;
  const durationDeltaMinutes = hasStart && hasEnd ? e - s : null;
  let category;
  if (row.status !== "paired" && row.status !== "partial") category = "unresolved-association";
  else if (!hasStart || !hasEnd) category = "missing-endpoint";
  else if (Math.abs(s) <= tolerance && Math.abs(e) <= tolerance) category = "within-tolerance";
  else if (Math.abs(durationDeltaMinutes) <= tolerance && Math.abs(midpointDeltaMinutes) > tolerance) category = "common-time-shift";
  else if (Math.abs(s) <= tolerance) category = "end-only-discrepancy";
  else if (Math.abs(e) <= tolerance) category = "start-only-discrepancy";
  else category = "mixed-discrepancy";
  return {
    sourceRow: row.sourceRow, type: row.source.type, category,
    sourceStartIST: row.source.touchTimeIST ?? null,
    sourceEndIST: row.source.releaseTimeIST ?? null,
    calculatedStartIST: row.computedStartIST ?? null,
    calculatedEndIST: row.computedEndIST ?? null,
    truePataIST: row.truePataIST ?? null,
    startDeltaMinutes: s ?? null, endDeltaMinutes: e ?? null,
    midpointDeltaMinutes, durationDeltaMinutes,
    sourceBoundaryArcminutes: row.sourceBoundaryArcminutes ?? null,
    checks: {
      sourceChronological: row.source.touchTimeIST && row.source.releaseTimeIST
        ? Date.parse(row.source.touchTimeIST) < Date.parse(row.source.releaseTimeIST) : null,
      computedChronological: row.computedStartIST && row.computedEndIST
        ? Date.parse(row.computedStartIST) < Date.parse(row.computedEndIST) : null,
      truePataInsideCalculated: row.truePataIST && row.computedStartIST && row.computedEndIST
        ? Date.parse(row.computedStartIST) <= Date.parse(row.truePataIST) &&
          Date.parse(row.truePataIST) <= Date.parse(row.computedEndIST) : null
    }
  };
}
export function exceptionReport(auditReport, tolerance = 3) {
  if (!Number.isFinite(tolerance) || tolerance <= 0) throw new RangeError("positive tolerance required");
  const rows = auditReport.rows.map(row => diagnoseException(row, tolerance));
  return {
    status: "research-only-not-approved",
    contactModel: auditReport.contactModel?.id ?? null,
    toleranceMinutes: tolerance,
    summary: { sourceRows: rows.length, exceptions: rows.filter(r => r.category !== "within-tolerance").length },
    exceptions: rows.filter(r => r.category !== "within-tolerance"),
    caveat: "Classification describes observed residuals; it does not establish the source's formula or justify per-date offsets."
  };
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const output = execFileSync(process.execPath, [audit], {
    encoding: "utf8", maxBuffer: 8 * 1024 * 1024
  });
  console.log(JSON.stringify(exceptionReport(JSON.parse(output)), null, 2));
}
