import test from "node:test";
import assert from "node:assert/strict";
import {
  MAHAPATA_RESEARCH_ONLY, normalizeDegrees, angularDistanceDegrees,
  declinationFromEcliptic, diagnoseMahapata, classifyMahapataGeometry, bisectSignChange,
  scanMahapataCandidates
} from "../research/paatadhikar/mahapata-math.mjs";

const EPS = 1e-9;
const frame = 23.44;
const coord = (longitudeDeg, latitudeDeg = 0) => ({longitudeDeg, latitudeDeg});
const input = (sun, moon) => ({sun, moon, obliquityDeg: frame});

test("research module cannot be mistaken for production event generator", () => {
  assert.equal(MAHAPATA_RESEARCH_ONLY, true);
});

test("angle wrap and angular distance work across 0/360", () => {
  assert.equal(normalizeDegrees(-30), 330);
  assert.equal(normalizeDegrees(720), 0);
  assert.equal(angularDistanceDegrees(355, 5), 10);
  assert.throws(() => normalizeDegrees(NaN), RangeError);
});

test("ecliptic latitude is included in declination conversion", () => {
  assert.ok(Math.abs(declinationFromEcliptic({
    longitudeDeg: 90, latitudeDeg: 0, obliquityDeg: frame
  }) - frame) < EPS);
  const latitudeEffect = declinationFromEcliptic({
    longitudeDeg: 0, latitudeDeg: 5, obliquityDeg: frame
  });
  assert.ok(latitudeEffect > 4 && latitudeEffect < 5);
  assert.throws(() => declinationFromEcliptic({
    longitudeDeg: 0, latitudeDeg: 92, obliquityDeg: frame
  }), RangeError);
});

test("Vyatipata: opposite ayanas, same northern declination hemisphere", () => {
  const d = diagnoseMahapata(input(coord(30), coord(150)));
  assert.equal(d.eventClass, "Vyatipata");
  assert.ok(Math.abs(d.declinationDifferenceDeg) < EPS);
  assert.equal(d.longitudeSumDeg, 180);
  assert.equal(d.sumResidualDeg, 0);
  assert.equal(d.sunGola, d.moonGola);
  assert.notEqual(d.sunAyana, d.moonAyana);
});

test("Vaidhriti: same ayana, opposite declination hemispheres", () => {
  const d = diagnoseMahapata(input(coord(30), coord(330)));
  assert.equal(d.eventClass, "Vaidhriti");
  assert.ok(Math.abs(d.declinationDifferenceDeg) < EPS);
  assert.equal(d.longitudeSumDeg, 0);
  assert.equal(d.sumResidualDeg, 0);
  assert.notEqual(d.sunGola, d.moonGola);
  assert.equal(d.sunAyana, d.moonAyana);
});

test("equal declination without traditional geometry is not a Mahapata", () => {
  const d = diagnoseMahapata(input(coord(30), coord(30)));
  assert.equal(d.eventClass, null);
  assert.equal(d.sumResidualDeg, null);
});

test("unresolvable solstitial ayana boundary is rejected", () => {
  assert.equal(diagnoseMahapata(input(coord(90), coord(90))).eventClass, null);
});

test("bisection rejects unbracketed roots and resolves proper bracket", () => {
  assert.ok(Math.abs(bisectSignChange(x => x - 2000, 0, 4000, 0.1) - 2000) < 0.1);
  assert.throws(() => bisectSignChange(x => x * x + 1, 0, 4000), RangeError);
  assert.throws(() => bisectSignChange(x => x, 20, 10), RangeError);
});

test("scan classifies and timestamps a synthetic Vyatipata root", () => {
  const start = Date.UTC(2027, 0, 1);
  const result = scanMahapataCandidates({
    startUtcMs: start, endUtcMs: start + 2 * 3600000,
    stepMs: 30 * 60000, ephemeris: date => {
      const elapsedHours = (date.getTime() - start) / 3600000;
      return input(coord(30), coord(140 + elapsedHours * 10));
    }
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].eventClass, "Vyatipata");
  assert.ok(Math.abs(result[0].utcMilliseconds - (start + 3600000)) < 1000);
  assert.equal(result[0].status, "research-candidate-unverified");
});

test("scan handles a synthetic Vaidhriti crossing, without altering the date", () => {
  const start = Date.UTC(2027, 6, 31, 23, 0);
  const result = scanMahapataCandidates({
    startUtcMs: start, endUtcMs: start + 2 * 3600000,
    stepMs: 25 * 60000, ephemeris: date => {
      const elapsedHours = (date.getTime() - start) / 3600000;
      return input(coord(30), coord(320 + elapsedHours * 10));
    }
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].eventClass, "Vaidhriti");
  assert.ok(Math.abs(result[0].utcMilliseconds - Date.UTC(2027, 7, 1)) < 1000);
  assert.equal(new Date(result[0].utcMilliseconds).getUTCDate(), 1);
});

test("scan never emits ordinary equal-hemisphere same-ayana equality", () => {
  const start = Date.UTC(2027, 1, 1);
  const result = scanMahapataCandidates({
    startUtcMs: start, endUtcMs: start + 2 * 3600000,
    stepMs: 30 * 60000, ephemeris: date =>
      input(coord(30), coord(20 + (date.getTime() - start) / 3600000 * 10))
  });
  assert.deepEqual(result, []);
});


test("VS 2084 two same-ayana same-gola reference exceptions are not classified as Mahapata", () => {
  // Independent Swiss/Moshier equal-declination roots, rounded for classification only.
  for (const [sunLongitudeDeg, moonLongitudeDeg, declination] of [
    [186.097, 177.431, -2.421], // 2027-09-29 16:47 IST
    [5.186, 355.586, 2.060]    // 2028-03-25 13:11 IST
  ]) {
    const geometry = classifyMahapataGeometry({
      sunLongitudeDeg, moonLongitudeDeg,
      sunDeclinationDeg: declination, moonDeclinationDeg: declination
    });
    assert.equal(geometry.sunAyana, geometry.moonAyana);
    assert.equal(geometry.sunGola, geometry.moonGola);
    assert.equal(geometry.eventClass, null);
  }
});
