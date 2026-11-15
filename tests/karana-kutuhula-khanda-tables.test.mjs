import test from "node:test";
import assert from "node:assert/strict";
import {
  KRANTI_KHANDA_BASE,
  SHARA_KHANDA_BASE,
  KRANTI_KHANDA_24,
  SHARA_KHANDA_24,
  MAHAPATA_SOURCE_CONSTANTS,
  expandSignedKhandas
} from "../karana-kutuhula-khanda-tables.mjs";

test("Karaṇa-kutūhala base kranti and shara tables match the source Sanskrit commentaries", () => {
  assert.deepEqual(KRANTI_KHANDA_BASE, [362, 341, 299, 236, 150, 52]);
  assert.deepEqual(SHARA_KHANDA_BASE, [70, 65, 56, 43, 27, 9]);
});

test("six-value tables expand to 24 signed krama/utkrama positions", () => {
  assert.equal(KRANTI_KHANDA_24.length, 24);
  assert.equal(SHARA_KHANDA_24.length, 24);
  assert.deepEqual(KRANTI_KHANDA_24.slice(0, 6), [362, 341, 299, 236, 150, 52]);
  assert.deepEqual(KRANTI_KHANDA_24.slice(6, 12), [-52, -150, -236, -299, -341, -362]);
  assert.deepEqual(KRANTI_KHANDA_24.slice(12, 18), [362, 341, 299, 236, 150, 52]);
  assert.deepEqual(KRANTI_KHANDA_24.slice(18, 24), [-52, -150, -236, -299, -341, -362]);
  assert.deepEqual(SHARA_KHANDA_24.slice(6, 12), [-9, -27, -43, -56, -65, -70]);
  // Independent 1902 worked example: 10th kranti khanda = -299;
  // 13th shara khanda = +70.
  assert.equal(KRANTI_KHANDA_24[9], -299);
  assert.equal(SHARA_KHANDA_24[12], 70);
});

test("verse 5 division by 15 returns khanda quotient and angular remainder", async () => {
  const { divideLongitudeIntoKhandas } = await import("../karana-kutuhula-khanda-tables.mjs");
  assert.deepEqual(divideLongitudeIntoKhandas({
    sign: 6, degree: 11, minute: 53, second: 30
  }), {
    khandaIndex: 12,
    remainder: { degree: 11, minute: 53, second: 30 }
  });
  assert.deepEqual(divideLongitudeIntoKhandas({
    sign: 4, degree: 29, minute: 5, second: 21
  }), {
    khandaIndex: 9,
    remainder: { degree: 14, minute: 5, second: 21 }
  });
  assert.throws(() => divideLongitudeIntoKhandas({
    sign: 12, degree: 0, minute: 0, second: 0
  }), /within 0\.\.11/);
});

test("source constants are kept explicit and separate from modern disk-contact model", () => {
  assert.deepEqual(MAHAPATA_SOURCE_CONSTANTS, {
    divisionsPerKhanda: 15,
    bhogyaCorrectionDivisor: 13,
    shuddhaKhandaLimit: 480,
    sthitiCoefficientVerse11: 2203,
    alternativeSthitiSubtrahend: 480,
    alternativeSthitiMultiplier: 9
  });
});

test("khanda expansion rejects malformed source tables", () => {
  assert.throws(() => expandSignedKhandas([1, 2]), /six khanda/);
  assert.throws(() => expandSignedKhandas([1, 2, 3, 4, 5, 0]), /positive finite/);
});
