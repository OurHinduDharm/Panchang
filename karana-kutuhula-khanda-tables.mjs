/**
 * Source transcription for Bhaskaracharya's Karaṇa-kutūhala, Pātādhikāra 9.
 *
 * Primary edition: Krishnadas Sanskrit Series 129 (1991), edited by
 * Dr. Satyendra Mishra; Sumatiharsa Sanskrit commentary and 1902 independent edition.
 *
 * These are calculation tables only. They are NOT yet connected to a public
 * Mahapata event calculator. The order/sign expansion follows the Hindi
 * rendering's "krama/utkrama" instruction and remains gated by reproduction
 * of the worked examples on printed pp. 106–109.
 */

export const KRANTI_KHANDA_BASE = Object.freeze([362, 341, 299, 236, 150, 52]);
export const SHARA_KHANDA_BASE = Object.freeze([70, 65, 56, 43, 27, 9]);

/**
 * Expand six base khanda into the 24-position table:
 * forward +, reverse -, forward +, reverse -.
 *
 * The source commentary specifies four alternating krama/utkrama
 * blocks and the + / - pattern. Keep this transcription isolated until the
 * original worked examples confirm the orientation and indexing convention.
 */
export function expandSignedKhandas(base) {
  if (!Array.isArray(base) || base.length !== 6) {
    throw new TypeError("base must contain exactly six khanda values");
  }
  const values = base.map((value, index) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
      throw new RangeError(`base[${index}] must be a positive finite number`);
    }
    return number;
  });

  const forward = values;
  const reverse = values.slice().reverse();
  return Object.freeze([
    ...forward,
    ...reverse.map(value => -value),
    ...forward,
    ...reverse.map(value => -value)
  ]);
}

/**
 * Divide a zodiac longitude into 15-degree khanda.
 *
 * Karaṇa-kutūhala verse 5 commentary examples:
 *   191°53′30″ -> khanda index 12, remainder 11°53′30″
 *   149°05′21″ -> khanda index 9, remainder 14°05′21″
 *
 * This is a quotient + angular remainder, NOT a time duration.
 */
export function divideLongitudeIntoKhandas({ sign, degree, minute = 0, second = 0 }) {
  const parts = [sign, degree, minute, second].map(Number);
  if (parts.some(value => !Number.isInteger(value))) {
    throw new TypeError("longitude parts must be integers");
  }
  const [s, d, m, sec] = parts;
  if (s < 0 || s > 11 || d < 0 || d > 29 || m < 0 || m > 59 || sec < 0 || sec > 59) {
    throw new RangeError("longitude must be within 0..11 signs, 0..29 degrees, 0..59 minutes and seconds");
  }
  const totalArcSeconds = (((s * 30 + d) * 60 + m) * 60) + sec;
  const khandaArcSeconds = 15 * 60 * 60;
  const khandaIndex = Math.floor(totalArcSeconds / khandaArcSeconds);
  let remainderArcSeconds = totalArcSeconds - khandaIndex * khandaArcSeconds;
  const remainderDegree = Math.floor(remainderArcSeconds / 3600);
  remainderArcSeconds -= remainderDegree * 3600;
  const remainderMinute = Math.floor(remainderArcSeconds / 60);
  const remainderSecond = remainderArcSeconds - remainderMinute * 60;
  return Object.freeze({
    khandaIndex,
    remainder: Object.freeze({
      degree: remainderDegree,
      minute: remainderMinute,
      second: remainderSecond
    })
  });
}

export const KRANTI_KHANDA_24 = expandSignedKhandas(KRANTI_KHANDA_BASE);
export const SHARA_KHANDA_24 = expandSignedKhandas(SHARA_KHANDA_BASE);

export const MAHAPATA_SOURCE_CONSTANTS = Object.freeze({
  divisionsPerKhanda: 15,
  bhogyaCorrectionDivisor: 13,
  shuddhaKhandaLimit: 480,
  sthitiCoefficientVerse11: 2203,
  alternativeSthitiSubtrahend: 480,
  alternativeSthitiMultiplier: 9
});

/**
 * Verse 4: extract the 15-degree khanda quotient and angular remainder
 * for both the sāyana Moon and sapāta Moon. This deliberately does not
 * assign past/future direction or apply the signed 24-position tables;
 * those decisions belong to the subsequent verses and remain separate.
 */
export function extractMahapataLongitudeKhandas({ sayanaMoon, sapataMoon }) {
  if (!sayanaMoon || !sapataMoon) {
    throw new TypeError("Both sayanaMoon and sapataMoon longitudes are required");
  }
  return Object.freeze({
    sayanaMoon: divideLongitudeIntoKhandas(sayanaMoon),
    sapataMoon: divideLongitudeIntoKhandas(sapataMoon),
    unit: "15-degree-khanda-with-angular-remainder",
    status: "research-only"
  });
}

function remainderArcSeconds(remainder) {
  if (!remainder || typeof remainder !== "object") {
    throw new TypeError("angular remainder is required");
  }
  const degree = Number(remainder.degree);
  const minute = Number(remainder.minute ?? 0);
  const second = Number(remainder.second ?? 0);
  if (![degree, minute, second].every(Number.isInteger) ||
      degree < 0 || degree >= 15 || minute < 0 || minute >= 60 ||
      second < 0 || second >= 60) {
    throw new RangeError("remainder must be within one 15-degree khanda");
  }
  return degree * 3600 + minute * 60 + second;
}

/**
 * Read one source-table entry using the text's 1-based khanda numbering.
 * No direction inference is made here: the caller must supply the actual
 * khanda number derived from the longitude quotient.
 */
export function getSignedMahapataKhanda({ table, khandaNumber }) {
  if (!Array.isArray(table) || table.length !== 24) {
    throw new TypeError("a 24-position signed khanda table is required");
  }
  const index = Number(khandaNumber);
  if (!Number.isInteger(index) || index < 1 || index > 24) {
    throw new RangeError("khandaNumber must be an integer from 1 to 24");
  }
  const value = Number(table[index - 1]);
  if (!Number.isFinite(value) || value === 0) {
    throw new RangeError("selected khanda table entry must be non-zero");
  }
  return Object.freeze({ khandaNumber: index, signedValue: value });
}

/**
 * Verses 5–6: the next khanda (quotient + 1, 1-based) is the bhogya
 * khanda. The commentary places the bhogya khanda singly on whichever
 * side (kranti or shara) has the smaller angular remainder; the other
 * side's khanda is placed in two positions. This helper records only
 * that source-explicit choice; it does not yet construct the past/future
 * two/three-position layout or apply corrections.
 */
export function selectMahapataBhogyaKhandas({ kranti, shara }) {
  if (!kranti || !shara ||
      !Number.isInteger(Number(kranti.khandaIndex)) ||
      !Number.isInteger(Number(shara.khandaIndex)) ||
      Number(kranti.khandaIndex) < 0 || Number(kranti.khandaIndex) > 23 ||
      Number(shara.khandaIndex) < 0 || Number(shara.khandaIndex) > 23) {
    throw new RangeError("kranti and shara must contain valid khanda divisions");
  }
  const krantiRemainder = remainderArcSeconds(kranti.remainder);
  const sharaRemainder = remainderArcSeconds(shara.remainder);
  if (krantiRemainder === sharaRemainder) {
    throw new RangeError("equal remainders do not determine a unique bhogya side");
  }
  const bhogyaSide = krantiRemainder < sharaRemainder ? "kranti" : "shara";
  return Object.freeze({
    kranti: Object.freeze({
      bhogyaKhandaNumber: Number(kranti.khandaIndex) + 1,
      remainderArcSeconds: krantiRemainder,
      placement: bhogyaSide === "kranti" ? "single-bhogya" : "two-position"
    }),
    shara: Object.freeze({
      bhogyaKhandaNumber: Number(shara.khandaIndex) + 1,
      remainderArcSeconds: sharaRemainder,
      placement: bhogyaSide === "shara" ? "single-bhogya" : "two-position"
    }),
    bhogyaSide,
    status: "research-only"
  });
}
