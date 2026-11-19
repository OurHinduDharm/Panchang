import test from "node:test";
import assert from "node:assert/strict";
import {
  KRANTI_KHANDA_BASE,
  SHARA_KHANDA_BASE,
  KRANTI_KHANDA_24,
  SHARA_KHANDA_24,
  MAHAPATA_SOURCE_CONSTANTS,
  expandSignedKhandas,
  extractMahapataLongitudeKhandas,
  getSignedMahapataKhanda,
  selectMahapataBhogyaKhandas
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

test("second 1902 worked example locks 16th kranti and 24th shara table positions", () => {
  // Printed pp.141-142: quotient 15 -> 16th kranti position (+236);
  // quotient 23 -> 24th shara position (-70).
  assert.deepEqual(getSignedMahapataKhanda({
    table: KRANTI_KHANDA_24, khandaNumber: 16
  }), { khandaNumber: 16, signedValue: 236 });
  assert.deepEqual(getSignedMahapataKhanda({
    table: SHARA_KHANDA_24, khandaNumber: 24
  }), { khandaNumber: 24, signedValue: -70 });
  const selection = selectMahapataBhogyaKhandas({
    kranti: {
      khandaIndex: 15,
      remainder: { degree: 10, minute: 21, second: 51 }
    },
    shara: {
      khandaIndex: 23,
      remainder: { degree: 5, minute: 58, second: 29 }
    }
  });
  assert.equal(selection.bhogyaSide, "shara");
  assert.equal(selection.kranti.bhogyaKhandaNumber, 16);
  assert.equal(selection.shara.bhogyaKhandaNumber, 24);
  assert.deepEqual(selection.middleKhandaCounts, { kranti: 3, shara: 2 });
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

test("verse 4 extracts both longitude khanda quotients without treating remainders as time", () => {
  const result = extractMahapataLongitudeKhandas({
    sayanaMoon: { sign: 4, degree: 29, minute: 5, second: 21 },
    sapataMoon: { sign: 6, degree: 11, minute: 53, second: 30 }
  });
  assert.equal(result.sayanaMoon.khandaIndex, 9);
  assert.deepEqual(result.sayanaMoon.remainder, {
    degree: 14, minute: 5, second: 21
  });
  assert.equal(result.sapataMoon.khandaIndex, 12);
  assert.deepEqual(result.sapataMoon.remainder, {
    degree: 11, minute: 53, second: 30
  });
  assert.equal(result.unit, "15-degree-khanda-with-angular-remainder");
  assert.equal(result.status, "research-only");
});

test("verse 5 signed khanda lookup preserves 1-based source numbering", () => {
  assert.deepEqual(getSignedMahapataKhanda({
    table: KRANTI_KHANDA_24, khandaNumber: 10
  }), { khandaNumber: 10, signedValue: -299 });
  assert.deepEqual(getSignedMahapataKhanda({
    table: SHARA_KHANDA_24, khandaNumber: 13
  }), { khandaNumber: 13, signedValue: 70 });
});

test("verses 5-6 select the smaller angular remainder as the single bhogya khanda", () => {
  // Printed p.132-135 example: kranti remainder 14;05;21,
  // shara remainder 11;53;30; therefore 10th kranti and 13th
  // shara khanda are identified, with shara as the single bhogya.
  const selection = selectMahapataBhogyaKhandas({
    kranti: {
      khandaIndex: 9,
      remainder: { degree: 14, minute: 5, second: 21 }
    },
    shara: {
      khandaIndex: 12,
      remainder: { degree: 11, minute: 53, second: 30 }
    }
  });
  assert.equal(selection.bhogyaSide, "shara");
  assert.equal(selection.kranti.bhogyaKhandaNumber, 10);
  assert.equal(selection.kranti.placement, "two-position");
  assert.equal(selection.shara.bhogyaKhandaNumber, 13);
  assert.equal(selection.shara.placement, "single-bhogya");
  assert.deepEqual(selection.middleKhandaCounts, { kranti: 3, shara: 2 });
  assert.equal(selection.status, "research-only");
});

test("verses 5-6 use two middle khandas on the smaller-arc side and three on the larger", async () => {
  const { selectMahapataBhogyaKhandas } = await import("../karana-kutuhula-khanda-tables.mjs");
  const selection = selectMahapataBhogyaKhandas({
    kranti: {
      khandaIndex: 4,
      remainder: { degree: 2, minute: 0, second: 0 }
    },
    shara: {
      khandaIndex: 8,
      remainder: { degree: 8, minute: 0, second: 0 }
    }
  });
  assert.equal(selection.bhogyaSide, "kranti");
  assert.deepEqual(selection.middleKhandaCounts, { kranti: 2, shara: 3 });
});
