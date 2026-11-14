/**
 * Source transcription for Bhaskaracharya's Karaṇa-kutūhala, Pātādhikāra 9.
 *
 * Primary edition: Krishnadas Sanskrit Series 129 (1991), edited by
 * Dr. Satyendra Mishra; Hindi rendering, Pātādhikāra, pp. 184–185.
 *
 * These are calculation tables only. They are NOT yet connected to a public
 * Mahapata event calculator. The order/sign expansion follows the Hindi
 * rendering's "krama/utkrama" instruction and remains gated by reproduction
 * of the worked examples on printed pp. 106–109.
 */

export const KRANTI_KHANDA_BASE = Object.freeze([362, 349, 299, 236, 150, 52]);
export const SHARA_KHANDA_BASE = Object.freeze([70, 65, 54, 43, 29, 19]);

/**
 * Expand six base khanda into the 24-position table:
 * forward +, reverse -, forward +, reverse -.
 *
 * The source's Hindi rendering specifies four alternating krama/utkrama
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

export const KRANTI_KHANDA_24 = expandSignedKhandas(KRANTI_KHANDA_BASE);
export const SHARA_KHANDA_24 = expandSignedKhandas(SHARA_KHANDA_BASE);

export const MAHAPATA_SOURCE_CONSTANTS = Object.freeze({
  divisionsPerKhanda: 15,
  bhogyaCorrectionDivisor: 13,
  shuddhaKhandaLimit: 480,
  sthitiDivisorHindiTranslation: 220,
  alternativeSthitiSubtrahend: 48,
  alternativeSthitiMultiplier: 9
});
