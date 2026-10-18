/*
 * Pure Agnivasa / Shivavasa calculation.
 * tithiIndex is the library's zero-based tithi index (0–29).
 * weekdayIndex is the selected Panchang calendar date's weekday:
 * Sunday=0 ... Saturday=6. The caller derives this from the date label,
 * not from the device's current timezone.
 *
 * Conventional formulas:
 * Agnivasa: (tithi number + weekday number + 1) mod 4,
 * where weekday number is Sunday=1 ... Saturday=7.
 * Shivavasa: (tithi number * 2 + 5) mod 7.
 *
 * Scope: these formulas calculate the traditional residence only.
 * They do not decide whether a particular ritual is exempt from considering
 * the residence. In particular, do not treat a non-Earth Agnivasa as a
 * universal prohibition for routine or samskara rites.
 */
const AGNI_BY_REMAINDER = [
  { name: "पृथ्वी", note: "काम्य हवन के लिए अनुकूल मानी जाती है", good: true },
  { name: "आकाश", note: "काम्य हवन के लिए प्रतिकूल मानी जाती है", good: false },
  { name: "पाताल", note: "काम्य हवन के लिए प्रतिकूल मानी जाती है", good: false },
  { name: "पृथ्वी", note: "काम्य हवन के लिए अनुकूल मानी जाती है", good: true }
];

const SHIVA_BY_REMAINDER = [
  { name: "श्मशान", note: "काम्य रुद्राभिषेक में सामान्यतः वर्जित", good: false },
  { name: "कैलाश", note: "रुद्राभिषेक के लिए अनुकूल", good: true },
  { name: "गौरी-सन्निधि", note: "रुद्राभिषेक के लिए अनुकूल", good: true },
  { name: "नन्दी पर", note: "रुद्राभिषेक के लिए अनुकूल", good: true },
  { name: "सभा", note: "काम्य रुद्राभिषेक में सामान्यतः वर्जित", good: false },
  { name: "भोजन", note: "काम्य रुद्राभिषेक में सामान्यतः वर्जित", good: false },
  { name: "क्रीड़ा", note: "काम्य रुद्राभिषेक में सामान्यतः वर्जित", good: false }
];

export function normalizeTithiIndex(value) {
  let candidate = value;
  if (candidate && typeof candidate === "object") {
    candidate = candidate.index ?? candidate.number ?? candidate.value;
  }

  if (candidate === null || candidate === undefined ||
      (typeof candidate === "string" && candidate.trim() === "")) {
    return null;
  }

  const index = Number(candidate);
  return Number.isInteger(index) && index >= 0 && index <= 29 ? index : null;
}

export function calculateNivasa(tithiIndex, weekdayIndex) {
  if (!Number.isInteger(tithiIndex) || tithiIndex < 0 || tithiIndex > 29 ||
      !Number.isInteger(weekdayIndex) || weekdayIndex < 0 || weekdayIndex > 6) {
    return null;
  }

  const tithi = tithiIndex + 1;
  const weekday = weekdayIndex + 1;
  const agniRemainder = (tithi + weekday + 1) % 4;
  const shivaRemainder = (tithi * 2 + 5) % 7;

  return {
    tithi,
    agniRemainder,
    shivaRemainder,
    agni: AGNI_BY_REMAINDER[agniRemainder],
    shiva: SHIVA_BY_REMAINDER[shivaRemainder]
  };
}
