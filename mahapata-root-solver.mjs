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
