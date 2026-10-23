/**
 * Research-only Chapter IX iterative time solver.
 *
 * The IX.10–11 estimate is local: after each short time update, the caller
 * must recompute corrected Sun/planet geometry, lagnāntara K, daily motions,
 * and sign-rising-asus in the same event branch. This helper deliberately
 * does not calculate those astronomical inputs and is not production logic.
 */
import { estimateChapter9TimeCorrectionFromArcMotions } from "./ss_chapter9_test.js";

function validateSample(sample) {
  const required = [
    "currentKalanshaDeg", "targetKalanshaDeg", "signedLagnantaraDeg",
    "sunDailyMotionArcminPerDay", "planetDailyMotionArcminPerDay",
    "sunSignRisingAsus", "planetSignRisingAsus"
  ];
  if (!sample || !required.every(key => Number.isFinite(sample[key]))) {
    throw new TypeError("Each time sample must provide finite K, target, lagnāntara, motions, and rising-asus.");
  }
  return sample;
}

/**
 * @param {object} options
 * @param {number} options.startDay Numeric day coordinate (e.g. JD; any consistent unit in days).
 * @param {(day:number)=>object} options.evaluateAt Recomputes all Chapter IX inputs at day.
 * @param {number} [options.maxStepDays=1] Cap each IX.10–11 correction to keep it local.
 * @param {number} [options.toleranceDeg=0.01] Stop when |K-C| is within this limit.
 * @param {number} [options.maxIterations=80]
 * @param {number} [options.maxTotalDays=20] Reject implausibly long total excursions.
 */
export function solveChapter9EventTime({
  startDay,
  evaluateAt,
  maxStepDays = 1,
  toleranceDeg = 0.01,
  maxIterations = 80,
  maxTotalDays = 20
}) {
  if (!Number.isFinite(startDay) || typeof evaluateAt !== "function" ||
      !Number.isFinite(maxStepDays) || maxStepDays <= 0 ||
      !Number.isFinite(toleranceDeg) || toleranceDeg <= 0 ||
      !Number.isInteger(maxIterations) || maxIterations < 1 ||
      !Number.isFinite(maxTotalDays) || maxTotalDays <= 0) {
    throw new TypeError("Invalid Chapter IX iteration settings.");
  }

  let day = startDay;
  let firstBranch;
  const trace = [];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const sample = validateSample(evaluateAt(day));
    const branch = sample.branchKey ?? "unspecified";
    if (iteration === 0) firstBranch = branch;
    if (branch !== firstBranch) {
      return { converged: false, reason: "event-branch-changed", day, trace };
    }

    const residualDeg = sample.currentKalanshaDeg - sample.targetKalanshaDeg;
    if (Math.abs(residualDeg) <= toleranceDeg) {
      trace.push({ iteration, day, K: sample.currentKalanshaDeg,
        C: sample.targetKalanshaDeg, residualDeg, stepDays: 0, branch });
      return { converged: true, reason: "tolerance-reached", day,
        residualDeg, iterations: iteration, trace };
    }

    const estimate = estimateChapter9TimeCorrectionFromArcMotions(sample);
    const rawStepDays = estimate.estimatedDays;
    if (!Number.isFinite(rawStepDays) || Math.abs(rawStepDays) < 1e-12) {
      return { converged: false, reason: "invalid-or-zero-time-correction", day, trace };
    }

    const stepDays = Math.sign(rawStepDays) * Math.min(Math.abs(rawStepDays), maxStepDays);
    const nextDay = day + stepDays;
    if (Math.abs(nextDay - startDay) > maxTotalDays) {
      return { converged: false, reason: "maximum-time-excursion-exceeded", day, trace };
    }

    trace.push({ iteration, day, K: sample.currentKalanshaDeg,
      C: sample.targetKalanshaDeg, residualDeg, estimatedDays: rawStepDays,
      stepDays, branch });
    day = nextDay;
  }

  return { converged: false, reason: "iteration-limit-reached", day, trace };
}

export function runChapter9IterationSolverTests() {
  const tests = [];
  const add = (name, fn) => {
    try { const result = fn(); tests.push({ name, passed: result === true }); }
    catch (error) { tests.push({ name, passed: false, error: String(error?.message || error) }); }
  };
  const sampleAt = day => ({
    currentKalanshaDeg: 10 - 0.1 * day,
    targetKalanshaDeg: 8,
    signedLagnantaraDeg: 1,
    sunDailyMotionArcminPerDay: 0,
    planetDailyMotionArcminPerDay: -6,
    sunSignRisingAsus: 1800,
    planetSignRisingAsus: 1800,
    branchKey: "venus-east-rising"
  });

  add("large initial estimate is split into short recomputed steps", () => {
    const result = solveChapter9EventTime({ startDay: 0, evaluateAt: sampleAt,
      maxStepDays: 1, toleranceDeg: 0.005, maxIterations: 30 });
    return result.converged && Math.abs(result.day - 20) < 0.051 &&
      result.trace.length >= 20 && result.trace.every(row => Math.abs(row.stepDays || 0) <= 1);
  });
  add("already converged input returns without moving time", () => {
    const result = solveChapter9EventTime({ startDay: 20, evaluateAt: sampleAt });
    return result.converged && result.iterations === 0 && result.day === 20;
  });
  add("event-branch change is rejected instead of silently continued", () => {
    const result = solveChapter9EventTime({ startDay: 0,
      evaluateAt: day => ({ ...sampleAt(day), branchKey: day > 0 ? "other-event" : "venus-east-rising" }) });
    return !result.converged && result.reason === "event-branch-changed";
  });
  add("iteration cap is reported explicitly", () => {
    const result = solveChapter9EventTime({ startDay: 0, evaluateAt: sampleAt,
      maxIterations: 2, maxStepDays: 1 });
    return !result.converged && result.reason === "iteration-limit-reached" && result.trace.length === 2;
  });
  add("invalid astronomy input is rejected", () => {
    try {
      solveChapter9EventTime({ startDay: 0, evaluateAt: () => ({ ...sampleAt(0), targetKalanshaDeg: NaN }) });
      return false;
    } catch { return true; }
  });

  return { tests, total: tests.length, passed: tests.filter(t => t.passed).length,
    allPassed: tests.every(t => t.passed),
    note: "Synthetic solver tests only; astronomical inputs and the complete Chapter IX source algorithm still require independent validation." };
}
