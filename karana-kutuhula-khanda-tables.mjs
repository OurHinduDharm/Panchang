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
