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

test("Karaṇa-kutūhala base kranti and shara tables match the Hindi rendering", () => {
  assert.deepEqual(KRANTI_KHANDA_BASE, [362, 341, 299, 236, 150, 52]);
  assert.deepEqual(SHARA_KHANDA_BASE, [70, 65, 54, 43, 29, 19]);
});

test("six-value tables expand to 24 signed krama/utkrama positions", () => {
  assert.equal(KRANTI_KHANDA_24.length, 24);
  assert.equal(SHARA_KHANDA_24.length, 24);
  assert.deepEqual(KRANTI_KHANDA_24.slice(0, 6), [362, 341, 299, 236, 150, 52]);
  assert.deepEqual(KRANTI_KHANDA_24.slice(6, 12), [-52, -150, -236, -299, -349, -362]);
  assert.deepEqual(KRANTI_KHANDA_24.slice(12, 18), [362, 341, 299, 236, 150, 52]);
  assert.deepEqual(KRANTI_KHANDA_24.slice(18, 24), [-52, -150, -236, -299, -349, -362]);
  assert.deepEqual(SHARA_KHANDA_24.slice(6, 12), [-19, -29, -43, -54, -65, -70]);
  // Independent 1902 worked example: 10th kranti khanda = -299;
  // 13th shara khanda = +70.
  assert.equal(KRANTI_KHANDA_24[9], -299);
  assert.equal(SHARA_KHANDA_24[12], 70);
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
