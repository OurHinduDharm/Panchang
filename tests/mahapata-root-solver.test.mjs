import test from "node:test";
import assert from "node:assert/strict";
import { bisectRoot, scanBracketedRoots } from "../mahapata-root-solver.mjs";

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
