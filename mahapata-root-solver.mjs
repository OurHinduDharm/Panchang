/**
 * Deterministic numerical root helpers for astronomical event boundaries.
 * This module is intentionally physics-agnostic: the caller must supply a
 * source-approved signed boundary function. It does not define Mahapata.
 */

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(label + " must be finite");
  return number;
}

export function bisectRoot(fn, leftValue, rightValue, options = {}) {
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  let left = finiteNumber(leftValue, "left");
  let right = finiteNumber(rightValue, "right");
  if (!(right > left)) throw new RangeError("right must be greater than left");

  const timeTolerance = Math.max(1e-6, finiteNumber(options.timeTolerance ?? 0.25, "timeTolerance"));
  const valueTolerance = Math.max(0, finiteNumber(options.valueTolerance ?? 1e-12, "valueTolerance"));
  const maxIterations = Math.max(1, Math.floor(finiteNumber(options.maxIterations ?? 100, "maxIterations")));

  let fLeft = finiteNumber(fn(left), "fn(left)");
  let fRight = finiteNumber(fn(right), "fn(right)");
  if (Math.abs(fLeft) <= valueTolerance) return left;
  if (Math.abs(fRight) <= valueTolerance) return right;
  if (Math.sign(fLeft) === Math.sign(fRight)) {
    throw new RangeError("root is not bracketed by opposite signs");
  }

  for (let i = 0; i < maxIterations && right - left > timeTolerance; i++) {
    const middle = (left + right) / 2;
    const fMiddle = finiteNumber(fn(middle), "fn(midpoint)");
    if (Math.abs(fMiddle) <= valueTolerance) return middle;
    if (Math.sign(fMiddle) === Math.sign(fLeft)) {
      left = middle;
      fLeft = fMiddle;
    } else {
      right = middle;
      fRight = fMiddle;
    }
  }
  return (left + right) / 2;
}

export function scanBracketedRoots(fn, startValue, endValue, stepValue, options = {}) {
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  const start = finiteNumber(startValue, "start");
  const end = finiteNumber(endValue, "end");
  const step = finiteNumber(stepValue, "step");
  if (!(end > start) || !(step > 0)) throw new RangeError("invalid scan range or step");

  const roots = [];
  let left = start;
  let fLeft = finiteNumber(fn(left), "fn(start)");
  if (Math.abs(fLeft) <= (options.valueTolerance ?? 1e-12)) roots.push(left);

  while (left < end) {
    const right = Math.min(end, left + step);
    const fRight = finiteNumber(fn(right), "fn(scan point)");
    if (Math.abs(fRight) <= (options.valueTolerance ?? 1e-12)) {
      roots.push(right);
    } else if (Math.sign(fLeft) !== Math.sign(fRight)) {
      roots.push(bisectRoot(fn, left, right, options));
    }
    left = right;
    fLeft = fRight;
  }

  const tolerance = options.dedupTolerance ?? (options.timeTolerance ?? 0.25) * 2;
  return roots.filter((root, index) => index === 0 || root - roots[index - 1] > tolerance);
}

// A smooth declination relation can turn between two like-signed samples.
// Split at resolved extrema before bisection. Near-zero extrema without a
// transverse crossing are diagnostics, not established contact intervals.
export function scanSmoothRoots(fn, start, end, step, options = {}) {
  const timeTolerance = options.timeTolerance ?? 0.25;
  const valueTolerance = options.valueTolerance ?? 1e-12;
  if (![start, end, step, timeTolerance, valueTolerance].every(Number.isFinite) ||
      !(end > start && step > 0 && timeTolerance > 0 && valueTolerance >= 0) ||
      start + step === start) throw new RangeError("invalid smooth scan range or tolerance");
  const samples = [];
  const sample = t => ({ t, y: finiteNumber(fn(t), "smooth function value") });
  for (let t = start; t < end; t += step) samples.push(sample(t));
  samples.push(sample(end));
  const points = [...samples];

  function addExtremum(left, right, direction) {
    let lo = left.t, hi = right.t;
    for (let n = 0; n < 100 && hi - lo > timeTolerance / 4; n++) {
      const third = (hi - lo) / 3;
      const a = sample(lo + third), b = sample(hi - third);
      if (direction * a.y < direction * b.y) hi = b.t;
      else lo = a.t;
    }
    const extremum = sample((lo + hi) / 2);
    if (direction * extremum.y < Math.min(direction * left.y, direction * right.y)) {
      points.push(extremum);
    }
  }
  for (let i = 1; i + 1 < samples.length; i++) {
    const [a, b, d] = [samples[i - 1], samples[i], samples[i + 1]];
    const incoming = b.y - a.y, outgoing = d.y - b.y;
    if (incoming < 0 && outgoing >= 0) addExtremum(a, d, 1);
    if (incoming > 0 && outgoing <= 0) addExtremum(a, d, -1);
  }
  // A turning point next to the beginning/end can lack a bounding triple.
  const edgeIndices = new Set([0, samples.length - 2]);
  for (const i of edgeIndices) {
    addExtremum(samples[i], samples[i + 1], 1);
    addExtremum(samples[i], samples[i + 1], -1);
  }
  points.sort((a, b) => a.t - b.t);
  const crossings = [], grazing = [], boundaryZeros = [];
  let previous = null, closestZero = null;
  for (const p of points) {
    if (Math.abs(p.y) <= valueTolerance) {
      if (!closestZero || Math.abs(p.y) < Math.abs(closestZero.y)) closestZero = p;
      continue;
    }
    if (previous && Math.sign(previous.y) !== Math.sign(p.y)) {
      crossings.push(closestZero?.t ?? bisectRoot(fn, previous.t, p.t, options));
    } else if (closestZero) {
      (previous ? grazing : boundaryZeros).push(closestZero.t);
    }
    closestZero = null;
    previous = p;
  }
  if (closestZero) boundaryZeros.push(closestZero.t);
  return { crossings, grazing, boundaryZeros };
}
