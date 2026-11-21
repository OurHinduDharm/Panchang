import test from "node:test";
import assert from "node:assert/strict";
import {
  suryaSiddhantaHalfDuration,
  suryaSiddhantaWindow
} from "../research/paatadhikar/surya-siddhanta-xi.mjs";

test("XI.14 computes half-duration in nadis from disc radii and relative motion", () => {
  const result = suryaSiddhantaHalfDuration({
    sunSemidiameterDeg: 0.266,
    moonSemidiameterDeg: 0.272,
    sunMotionDegPerDay: 1,
    moonMotionDegPerDay: 13
  });
  assert.ok(Math.abs(result.halfDurationNadi - 2.69) < 1e-12);
  assert.ok(Math.abs(result.halfDurationMilliseconds - 3_873_600) < 1e-6);
  assert.equal(result.method, "surya-siddhanta-xi-14-15-numerical-adaptation");
});

test("XI.15 places beginning and ending symmetrically around the true middle", () => {
  const middleUtcMs = Date.UTC(2027, 0, 3, 0);
  const window = suryaSiddhantaWindow({
    middleUtcMs,
    sunSemidiameterDeg: 0.266,
    moonSemidiameterDeg: 0.272,
    sunMotionDegPerDay: 1,
    moonMotionDegPerDay: 13
  });
  assert.equal(window.startUtcMs + window.endUtcMs, middleUtcMs * 2);
  assert.equal(window.fullDurationNadi, window.halfDurationNadi * 2);
});

test("invalid radii, rates, and missing relative motion are rejected", () => {
  const valid = {
    sunSemidiameterDeg: 0.266,
    moonSemidiameterDeg: 0.272,
    sunMotionDegPerDay: 1,
    moonMotionDegPerDay: 13
  };
  assert.throws(() => suryaSiddhantaHalfDuration({ ...valid, sunSemidiameterDeg: 0 }), RangeError);
  assert.throws(() => suryaSiddhantaHalfDuration({ ...valid, moonMotionDegPerDay: NaN }), RangeError);
  assert.throws(() => suryaSiddhantaHalfDuration({ ...valid, moonMotionDegPerDay: 1 }), RangeError);
});
