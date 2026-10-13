/*
 * Pure Agnivasa / Shivavasa calculation.
 * tithiIndex is the library's zero-based tithi index (0–29).
 * weekdayIndex follows JavaScript Date#getUTCDay(): Sunday=0 ... Saturday=6.
 *
 * Conventional formulas:
 * Agnivasa: (tithi number + weekday number + 1) mod 4,
 * where weekday number is Sunday=1 ... Saturday=7.
 * Shivavasa: (tithi number * 2 + 5) mod 7.
 */
const AGNI_BY_REMAINDER = [
  { name: "पृथ्वी", note: "हवन के लिए अनुकूल मानी जाती है", good: true },
  { name: "आकाश", note: "हवन के लिए प्रतिकूल मानी जाती है", good: false },
  { name: "पाताल", note: "हवन के लिए प्रतिकूल मानी जाती है", good: false },
  { name: "पृथ्वी", note: "हवन के लिए अनुकूल मानी जाती है", good: true }
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
