import test from "node:test";
import assert from "node:assert/strict";
import { bisectRoot, scanBracketedRoots, scanSmoothRoots } from "../mahapata-root-solver.mjs";

test("bisection resolves a bracketed linear root to sub-second tolerance", () => {
  const root = bisectRoot(x => x - 1234.5, 0, 2000, { timeTolerance: 0.01 });
  assert.ok(Math.abs(root - 1234.5) <= 0.01);
});

test("scan finds both entry and exit boundaries for a bounded interval", () => {
  const roots = scanBracketedRoots(x => (x - 20) * (x - 80), 0, 100, 5, { timeTolerance: 0.001 });
  assert.equal(roots.length, 2);
  assert.ok(Math.abs(roots[0] - 20) <= 0.001);
  assert.ok(Math.abs(roots[1] - 80) <= 0.001);
});

test("bisection rejects an unbracketed interval and non-finite calculations", () => {
  assert.throws(() => bisectRoot(x => x * x + 1, -1, 1), /not bracketed/);
  assert.throws(() => bisectRoot(() => NaN, -1, 1), /finite/);
});

test("scan rejects invalid steps and does not invent roots", () => {
  assert.deepEqual(scanBracketedRoots(() => 1, 0, 10, 1), []);
  assert.throws(() => scanBracketedRoots(x => x, 0, 10, 0), /invalid scan/);
});

test("smooth scan separates an off-grid tangent, a close pair, and a near miss", () => {
  const options = { timeTolerance: 1e-7, valueTolerance: 1e-10 };
  for (const center of [0.17, 1.44, 2, 2.5, 3.91]) {
    const parabola = x => (x - center) ** 2;
    for (const sign of [-1, 1]) {
      const tangent = scanSmoothRoots(x => sign * parabola(x), 0, 4, 1, options);
      assert.deepEqual(tangent.crossings, []);
      assert.equal(tangent.grazing.length, 1);
      assert.ok(Math.abs(tangent.grazing[0] - center) < 1e-6);
      const pair = scanSmoothRoots(x => sign * (parabola(x) - 0.0025), 0, 4, 1, options);
      assert.deepEqual(pair.grazing, []);
      assert.equal(pair.crossings.length, 2);
      assert.ok(Math.abs(pair.crossings[0] - (center - 0.05)) < 1e-6);
      assert.ok(Math.abs(pair.crossings[1] - (center + 0.05)) < 1e-6);
      const miss = scanSmoothRoots(x => sign * (parabola(x) + 1e-6), 0, 4, 1, options);
      assert.deepEqual(miss, { crossings: [], grazing: [], boundaryZeros: [] });
    }
  }
});

test("exact grid zeros, truncated last cell and scan endpoints are distinguished", () => {
  const options = { timeTolerance: 1e-7, valueTolerance: 1e-10 };
  assert.deepEqual(scanSmoothRoots(x => x * (x - 2) * (x - 3.25), 0, 3.25, 1, options),
    { crossings: [2], grazing: [], boundaryZeros: [0, 3.25] });
  assert.throws(() => scanSmoothRoots(() => NaN, 0, 3, 1), /finite/);
});
