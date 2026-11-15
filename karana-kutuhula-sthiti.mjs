/**
 * Research-only Karaṇa-kutūhala Mahāpāta sthiti calculations.
 *
 * Two source methods are deliberately kept separate:
 * - Verse 11 / Sumatiharsa: 2203 / aśuddha-khaṇḍa.
 * - Verse 14 / Sumatiharsa: half of ((480 - residual śara) * 9 / terminal khaṇḍa).
 *
 * Inputs are sexagesimal values expressed explicitly as { whole, part }.
 * One ghati contains 60 pala. No public event times are produced here.
 */

function sexagesimal(value, label) {
  if (!value || typeof value !== "object") {
    throw new TypeError(label + " must be { whole, part }");
  }
  const whole = Number(value.whole);
  const part = Number(value.part ?? 0);
  if (!Number.isFinite(whole) || !Number.isFinite(part) ||
      whole < 0 || part < 0 || part >= 60) {
    throw new RangeError(label + " must be a non-negative base-60 value");
  }
  return whole + part / 60;
}

function toGhatiPala(decimalGhati) {
  if (!Number.isFinite(decimalGhati) || decimalGhati < 0) {
    throw new RangeError("duration must be a non-negative finite value");
  }
  const totalPala = Math.round(decimalGhati * 60 * 1e6) / 1e6;
  const ghati = Math.floor(totalPala / 60);
  const pala = totalPala - ghati * 60;
  return Object.freeze({
    decimalGhati: decimalGhati,
    ghati,
    pala,
    totalPala
  });
}

/**
 * Verse 11: sthiti on either side of true pata midpoint.
 * Source example 2: aśuddha-khaṇḍa 184;19 gives approximately 11;57.
 */
export function calculateSthitiVerse11({ ashuddhaKhanda, coefficient = 2203 }) {
  const denominator = sexagesimal(ashuddhaKhanda, "ashuddhaKhanda");
  const numerator = Number(coefficient);
  if (!(denominator > 0) || !Number.isFinite(numerator) || numerator <= 0) {
    throw new RangeError("coefficient and ashuddhaKhanda must be positive");
  }
  const duration = toGhatiPala(numerator / denominator);
  return Object.freeze({
    method: "karana-kutuhula-verse-11-sumatiharsa",
    ...duration,
    symmetric: true,
    status: "research-only"
  });
}

/**
 * Verse 14, Sumatiharsa commentary: subtract residual śara from 480,
 * multiply by 9, divide by the terminal khaṇḍa; half the quotient is
 * the sthiti on either side of the midpoint.
 *
 * This is not interchangeable with Verse 11. It remains research-only.
 */
export function calculateSthitiVerse14Sumatiharsa({ residualShara, terminalKhanda }) {
  const remainder = Number(residualShara);
  const terminal = sexagesimal(terminalKhanda, "terminalKhanda");
  if (!Number.isFinite(remainder) || remainder < 0 || remainder > 480 || !(terminal > 0)) {
    throw new RangeError("residualShara must be 0..480 and terminalKhanda must be positive");
  }
  const fullSpan = ((480 - remainder) * 9) / terminal;
  const duration = toGhatiPala(fullSpan / 2);
  return Object.freeze({
    method: "karana-kutuhula-verse-14-sumatiharsa",
    ...duration,
    fullSpanGhati: fullSpan,
    symmetric: true,
    status: "research-only"
  });
}

/**
 * Convert a sunrise-relative ghati/pala instant to seconds after sunrise.
 * One ghati = 24 minutes; one pala = 24 seconds.
 */
export function ghatiPalaToSeconds({ ghati, pala = 0 }) {
  const g = Number(ghati);
  const p = Number(pala);
  if (!Number.isFinite(g) || !Number.isFinite(p) || g < 0 || p < 0 || p >= 60) {
    throw new RangeError("invalid ghati/pala value");
  }
  return g * 1440 + p * 24;
}

export function intervalAroundMidpoint(midpointSecondsAfterSunrise, sthiti) {
  const midpoint = Number(midpointSecondsAfterSunrise);
  const halfDuration = ghatiPalaToSeconds(sthiti);
  if (!Number.isFinite(midpoint) || midpoint < 0) {
    throw new RangeError("midpoint must be non-negative seconds after sunrise");
  }
  return Object.freeze({
    startSecondsAfterSunrise: midpoint - halfDuration,
    midpointSecondsAfterSunrise: midpoint,
    endSecondsAfterSunrise: midpoint + halfDuration
  });
}
