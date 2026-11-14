/**
 * OurHinduDharm — observance-specific date evidence profiles.
 *
 * These profiles reuse calculation windows already covered by project tests.
 * They are candidate evidence only: no profile certifies a shastriya rule,
 * chooses a final public date, or auto-approves a festival.
 */
const PROFILES = {
  "pradosh-trayodashi": {
    id: "pradosh-trayodashi", aliases: ["pradosh", "pradosh-evening"],
    label: "प्रदोष व्रत", tithiIndices: [12, 27], paksha: null,
    decisionMoment: "pradosh", windowLabel: "प्रदोष काल",
    calculationBasis: "three-night-muhurtas-after-local-sunset-night-divided-into-fifteen",
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "ekadashi-smarta-udaya": {
    id: "ekadashi-smarta-udaya", aliases: ["smarta-ekadashi", "ekadashi"],
    label: "स्मार्त एकादशी", tithiIndices: [10, 25], paksha: null,
    decisionMoment: "sunrise", windowLabel: "सूर्योदय",
    calculationBasis: "ekadashi-active-at-local-sunrise-first-sunrise-on-vriddhi",
    firstSunriseOnly: true,
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "janmashtami-smarta-nishita": {
    id: "janmashtami-smarta-nishita", aliases: ["smarta-janmashtami", "janmashtami"],
    label: "स्मार्त जन्माष्टमी", tithiIndices: [22], paksha: "कृष्ण पक्ष",
    decisionMoment: "nishita", windowLabel: "निशीथ काल",
    calculationBasis: "krishna-ashtami-at-nishita-rohini-as-supporting-evidence",
    nakshatraIndices: [3], nakshatraLabel: "रोहिणी", nakshatraWarning: "rohini-at-nishita-not-confirmed", allowedMonths: ["भाद्रपद"],
    sourceReview: "primary-text-consulted-two-night-tie-break-pending"
  },
  "navratri-udaya": {
    id: "navratri-udaya", aliases: ["navratri-day-count"],
    label: "नवरात्रि — उदयव्यापिनी तिथि", tithiIndices: [0,1,2,3,4,5,6], paksha: "शुक्ल पक्ष",
    decisionMoment: "sunrise", windowLabel: "सूर्योदय",
    calculationBasis: "shukla-pratipada-to-navami-at-sunrise-first-sunrise-on-vriddhi",
    firstSunriseOnly: true, allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "secondary-source-crosscheck-complete-primary-source-pending"
  },
  "navratri-maha-ashtami": {
    id: "navratri-maha-ashtami", aliases: ["maha-ashtami-navratri"],
    label: "नवरात्रि महाष्टमी", tithiIndices: [7], paksha: "शुक्ल पक्ष",
    decisionMoment: "sunrise", windowLabel: "सूर्योदय",
    calculationBasis: "ashwin-or-chaitra-shukla-ashtami-at-sunrise-saptami-vedha-review",
    allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "primary-text-consulted-translation-review-pending"
  },
  "navratri-navami-udaya": {
    id: "navratri-navami-udaya", aliases: ["maha-navami-udaya"],
    label: "नवरात्रि महानवमी — उदयव्यापिनी", tithiIndices: [8], paksha: "शुक्ल पक्ष",
    decisionMoment: "sunrise", windowLabel: "सूर्योदय",
    calculationBasis: "shukla-navami-at-local-sunrise-fallback-candidate",
    allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "primary-text-consulted-translation-review-pending"
  },
  "navratri-navami-ashtami-viddha": {
    id: "navratri-navami-ashtami-viddha", aliases: ["navratri-navami"],
    label: "नवरात्रि महानवमी — अष्टमी-विद्धा", tithiIndices: [7,8], paksha: "शुक्ल पक्ष",
    decisionMoment: "navami-ashtami-viddha", windowLabel: "सूर्यास्त के बाद छह घटिका",
    calculationBasis: "navami-covers-six-ghatis-after-sunset-on-ashtami-sunrise-day",
    requireAllTithis: true, requiredCoverageMs: 6 * 24 * 60000, allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "primary-text-consulted-translation-review-pending"
  },
  "navratri-sandhi-puja": {
    id: "navratri-sandhi-puja", aliases: ["sandhi-puja-navratri"],
    label: "नवरात्रि संधि पूजा", tithiIndices: [7,8], paksha: "शुक्ल पक्ष",
    decisionMoment: "sandhi", windowLabel: "अष्टमी–नवमी संधि",
    calculationBasis: "exact-ashtami-navami-tithi-junction",
    requireAllTithis: true, allowedMonths: ["चैत्र", "आश्विन"],
    sourceReview: "primary-text-consulted-translation-review-pending"
  },
  "sankashti-moonrise": {
    id: "sankashti-moonrise", aliases: ["sankashti", "sakat-moonrise"],
    label: "संकष्टी चतुर्थी", tithiIndices: [18], paksha: "कृष्ण पक्ष",
    decisionMoment: "moonrise", windowLabel: "चन्द्रोदय",
    calculationBasis: "krishna-chaturthi-active-at-local-moonrise",
    sourceReview: "pending-primary-source-review"
  },
  "masik-shivaratri-nishita": {
    id: "masik-shivaratri-nishita", aliases: [],
    label: "मासिक शिवरात्रि", tithiIndices: [28], paksha: "कृष्ण पक्ष",
    decisionMoment: "nishita", windowLabel: "निशीथ काल",
    calculationBasis: "sunset-to-next-sunrise-seven-fifteenths-to-eight-fifteenths",
    sourceReview: "pending-primary-source-review"
  },
  "mahashivaratri-nishita": {
    id: "mahashivaratri-nishita", aliases: [],
    label: "महाशिवरात्रि", tithiIndices: [28], paksha: "कृष्ण पक्ष",
    decisionMoment: "nishita", windowLabel: "निशीथ काल",
    calculationBasis: "sunset-to-next-sunrise-seven-fifteenths-to-eight-fifteenths",
    allowedMonths: ["फाल्गुन"],
    sourceReview: "primary-text-consulted-two-night-tie-break-pending"
  },
  "ram-navami-madhyahna": {
    id: "ram-navami-madhyahna", aliases: ["rama-navami"],
    label: "रामनवमी", tithiIndices: [8], paksha: "शुक्ल पक्ष",
    decisionMoment: "madhyahna", windowLabel: "मध्याह्न काल",
    calculationBasis: "chaitra-shukla-navami-at-madhyahna-ashtami-vedha-review",
    allowedMonths: ["चैत्र"],
    sourceReview: "primary-digest-consulted-ashtami-vedha-review-pending"
  },
  "vijayadashami-aparahna": {
    id: "vijayadashami-aparahna", aliases: ["vijayadashami", "dussehra"],
    label: "विजयादशमी", tithiIndices: [9], paksha: "शुक्ल पक्ष",
    decisionMoment: "aparahna", windowLabel: "दोपहर बाद का काल",
    calculationBasis: "ashwin-shukla-dashami-at-aparahna-shravana-as-supporting-evidence",
    allowedMonths: ["आश्विन"], nakshatraIndices: [21],
    nakshatraLabel: "श्रवण", nakshatraWarning: "shravana-at-aparahna-not-confirmed",
    sourceReview: "primary-text-consulted-two-day-shravana-tie-break-pending"
  },
  "nag-panchami-special-review": {
    id: "nag-panchami-special-review", aliases: ["nag-panchami", "nag-panchami-madhyahna"],
    label: "नाग पंचमी — धर्मसिंधु के तीन-मुहूर्त नियम से गणना", tithiIndices: [4], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "तीन मुहूर्त और तिथि-वेध",
    calculationBasis: "dharmasindhu-three-muhurta-para-viddha-and-short-tithi-exceptions",
    allowedMonths: ["श्रावण"], reviewOnly: true,
    reviewNote: "धर्मसिंधु (पृ. 44) के अनुसार बाद के दिन सूर्योदय पर पंचमी तीन मुहूर्त तक रहे तो वही दिन लें। यदि पंचमी दो से तीन मुहूर्त रहे तो पूर्वदिन की सूर्योदय-व्याप्त चतुर्थी तीन मुहूर्त से अधिक होने पर बाद का दिन; तीन से कम होने पर पूर्वदिन का पंचमी-स्पर्श जाँचें। एक मुहूर्त या अस्पष्ट सीमा पर अनुमान न लगाएँ। गणना-रिज़ॉल्वर केवल तारीख़ का candidate देता है; स्रोत-स्वीकृति अलग है।",
    sourceReview: "dharmasindhu-p44-and-nirnaya-sindhu-p164-rule-implemented-with-conservative-boundary-review"
  },
  "skanda-shashthi-kartika-review": {
    id: "skanda-shashthi-kartika-review", aliases: ["kanda-sashti", "soorasamharam"],
    label: "कार्तिक स्कन्द षष्ठी — परंपरा अनुसार जाँच", tithiIndices: [5], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "पञ्चमी-षष्ठी संयोग",
    calculationBasis: "panchami-shashthi-purva-viddha-with-regional-tradition-variation",
    allowedMonths: ["कार्तिक"], reviewOnly: true,
    reviewNote: "धर्मसिंधु में पञ्चमी से युक्त षष्ठी का विचार है, जबकि क्षेत्रीय मंदिर-परंपराओं में सूर्योदय और दिन के संयोग से निर्णय बदल सकता है। तमिल सूरसम्हारम् और सामान्य मासिक स्कन्द षष्ठी को एक नियम नहीं मानना चाहिए।",
    sourceReview: "dharmasindhu-and-regional-practice-crosscheck-manual-decision-required"
  },
  "ratha-saptami-review": {
    id: "ratha-saptami-review", aliases: ["ratha-saptami", "magha-saptami", "surya-jayanti"],
    label: "रथ सप्तमी — अरुणोदय और क्षय का निर्णय", tithiIndices: [6], paksha: "शुक्ल पक्ष",
    decisionMoment: "arunodaya-special", windowLabel: "सूर्योदय से 96 मिनट पूर्व अरुणोदय",
    calculationBasis: "magha-shukla-saptami-at-arunodaya-first-day-on-vriddhi-shashthi-yukta-kshaya-exception",
    allowedMonths: ["माघ"], reviewOnly: true,
    reviewNote: "धर्मसिंधु के अनुसार माघ शुक्ल सप्तमी अरुणोदयव्यापिनी होनी चाहिए; दो अरुणोदयों में हो तो पहला दिन। सप्तमी अगले अरुणोदय से पहले क्षीण हो तो षष्ठीयुक्त पूर्वदिन का विशेष अपवाद भी जाँचा जाता है।",
    sourceReview: "dharmasindhu-magha-ratha-saptami-primary-text-rule-implemented-source-approval-pending"
  },
  "chhath-kartika-review": {
    id: "chhath-kartika-review", aliases: ["chhath", "chhath-puja", "surya-shashthi-chhath"],
    label: "छठ पूजा — क्षेत्रीय परंपरा अनुसार जाँच", tithiIndices: [5], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "षष्ठी का सूर्यास्त और अगले दिन का सूर्योदय",
    calculationBasis: "kartika-shukla-shashthi-sunset-arghya-followed-by-saptami-sunrise-arghya",
    allowedMonths: ["कार्तिक"], reviewOnly: true,
    reviewNote: "छठ बिहार, मिथिला और पूर्वांचल की प्रमुख लोक-परंपरा है। संध्या अर्घ्य और अगले दिन उषा अर्घ्य इसके मुख्य अंग हैं। उपलब्ध धर्मसिंधु/निर्णयसिंधु संदर्भों में इसी नाम से एक सर्वमान्य तिथि-निर्णय नहीं मिला; इसलिए इसे केवल कार्तिक शुक्ल षष्ठी के सामान्य मिलान से स्वतः तय नहीं किया जाएगा।",
    sourceReview: "regional-folk-observance-source-crosscheck-primary-rule-not-established"
  },
  "hanuman-jayanti-chaitra-review": {
    id: "hanuman-jayanti-chaitra-review", aliases: ["hanuman-jayanti", "hanuman-janmotsav", "hanuman-jayanti-chaitra-purnima"],
    label: "हनुमान जन्मोत्सव — क्षेत्रीय परंपरा अनुसार जाँच", tithiIndices: [14], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "चैत्र पूर्णिमा",
    calculationBasis: "north-indian-chaitra-purnima-tradition-with-regional-date-variants",
    allowedMonths: ["चैत्र"], reviewOnly: true,
    reviewNote: "उत्तर भारत में चैत्र पूर्णिमा की परंपरा प्रचलित है, जबकि दक्षिण और कुछ अन्य क्षेत्रों में अलग तिथियाँ मानी जाती हैं। इसे एकमात्र सार्वभौमिक हनुमान-जयंती नियम न मानें; क्षेत्रीय परंपरा की पुष्टि के बाद ही तारीख़ तय करें।",
    sourceReview: "regional-traditions-crosschecked-classical-date-rule-not-established"
  },
  "narasimha-jayanti-smarta-review": {
    id: "narasimha-jayanti-smarta-review", aliases: ["narasimha-jayanti", "nrisimha-jayanti", "narasimha-chaturdashi"],
    label: "नृसिंह जयंती — संध्याकाल का नियम जाँचना बाकी", tithiIndices: [13], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "संध्याकाल में चतुर्दशी-व्याप्ति",
    calculationBasis: "vaishakha-shukla-chaturdashi-at-sayankala-smarta-observance",
    allowedMonths: ["वैशाख"], reviewOnly: true,
    reviewNote: "स्मार्त परंपरा में वैशाख शुक्ल चतुर्दशी का संध्याकाल में रहना निर्णायक है। कुछ वैष्णव पंचांग सूर्योदय-व्याप्ति से अलग दिन रखते हैं; यहाँ वैष्णव नियम नहीं मिलाया जाएगा। संध्याकाल की पूरी अवधि और व्रत-पारण के अपवाद लागू होने तक तारीख़ हाथ से जाँची जाएगी।",
    sourceReview: "drik-and-nirnaya-sindhu-rule-crosscheck-special-window-implementation-pending"
  },
  "parashurama-jayanti-pradosha-review": {
    id: "parashurama-jayanti-pradosha-review", aliases: ["parashurama-jayanti", "parashuram-jayanti", "parashurama-avatara-jayanti"],
    label: "परशुराम जयंती — प्रदोष-व्याप्ति की जाँच", tithiIndices: [2], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "प्रदोष काल में तृतीया-व्याप्ति",
    calculationBasis: "vaishakha-shukla-tritiya-at-pradosha-second-day-if-two-day-vyapti",
    allowedMonths: ["वैशाख"], reviewOnly: true,
    reviewNote: "परशुराम जयंती का निर्णय केवल अक्षय तृतीया के नाम या सूर्योदय की तिथि से नहीं होगा। वैशाख शुक्ल तृतीया का प्रदोष काल में होना देखा जाता है; दो दिन प्रदोष-व्याप्ति होने पर दूसरे दिन का नियम भी जाँचना होगा।",
    sourceReview: "drik-dedicated-parashurama-rule-crosschecked-primary-text-tie-break-pending"
  },
  "radha-ashtami-madhyahna-review": {
    id: "radha-ashtami-madhyahna-review", aliases: ["radha-ashtami", "radhashtami", "radha-jayanti"],
    label: "राधाष्टमी — मध्याह्न-व्याप्ति की जाँच", tithiIndices: [7], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "मध्याह्न काल में अष्टमी-व्याप्ति",
    calculationBasis: "bhadrapada-shukla-ashtami-at-madhyahna",
    allowedMonths: ["भाद्रपद"], reviewOnly: true,
    reviewNote: "राधाष्टमी पर भाद्रपद शुक्ल अष्टमी में मध्याह्न काल की पूजा-परंपरा है। सप्तमी-वेध और तिथि के विशेष संयोगों की पूरी जाँच के बाद ही अंतिम दिन तय होगा।",
    sourceReview: "drik-madhyahna-purana-crosscheck-exception-review-pending"
  },
  "shravana-yoga-dwadashi-review": {
    id: "shravana-yoga-dwadashi-review", aliases: ["shravana-yoga-dwadashi", "shravan-dwadashi-yoga"],
    label: "श्रवण योग द्वादशी — संयोग और व्रत-दिन का विशेष निर्णय",
    tithiIndices: [11, 26], paksha: null,
    decisionMoment: "manual-review", windowLabel: "द्वादशी तिथि और श्रवण नक्षत्र का वास्तविक संयोग",
    calculationBasis: "dharma-sindhu-shravana-dwadashi-tithi-nakshatra-yoga-with-separate-ekadashi-dwadashi-fast-decision",
    reviewOnly: true,
    reviewNote: "धर्मसिंधु के विष्णुशृंखला योग में, यदि पहले दिन सूर्योदय पर एकादशी हो, उसी दिन द्वादशी आरम्भ होकर अगले सूर्योदय तक चले, दोनों सूर्योदय-दिनों में द्वादशी-श्रवण संयोग हो और दूसरे दिन द्वादशी दो घटिका से अधिक न बचे, तो पहले दिन का व्रत-निर्णय किया जाता है। रात्रि के प्रथम प्रहर तक श्रवण-संयोग स्वीकार करने वाले मत को अलग से लागू किया गया है। यह चयन स्रोत/प्रकाशन अनुमोदन के अधीन है; अन्य द्वादशी-पूजन अलग रहेंगे।",
    sourceReview: "dharmasindhu-vishnushrinkhala-rule-implemented-real-2030-pithoragarh-candidate-source-approval-pending"
  },
  "vamana-jayanti-madhyahna-review": {
    id: "vamana-jayanti-madhyahna-review", aliases: ["vamana-jayanti", "vamana-dwadashi", "vamana-avatara-jayanti"],
    label: "वामन जयंती — श्रवण नक्षत्र सहित जाँच", tithiIndices: [11], paksha: "शुक्ल पक्ष",
    decisionMoment: "manual-review", windowLabel: "मध्याह्न में द्वादशी और श्रवण नक्षत्र",
    calculationBasis: "bhadrapada-shukla-dwadashi-madhyahna-shravana-yoga-ekadashi-tie-break",
    allowedMonths: ["भाद्रपद"], reviewOnly: true,
    reviewNote: "धर्मसिंधु के अनुसार भाद्रपद शुक्ल द्वादशी का मध्याह्न में श्रवण नक्षत्र से संयोग देखा जाता है। यदि श्रवण योग एकादशी और द्वादशी दोनों पर हो, तो एकादशी चुनने का नियम भी लागू होता है; इसलिए केवल द्वादशी-मिलान पर्याप्त नहीं।",
    sourceReview: "dharmasindhu-chapter-7-special-shravana-and-ekadashi-tie-break-manual-review"
  },
  "shani-jayanti-amavasya-review": {
    id: "shani-jayanti-amavasya-review", aliases: ["shani-jayanti", "shaneshchara-jayanti"],
    label: "शनि जयंती — ज्येष्ठ अमावस्या की जाँच", tithiIndices: [29], paksha: "कृष्ण पक्ष",
    decisionMoment: "manual-review", windowLabel: "ज्येष्ठ अमावस्या",
    calculationBasis: "jyeshtha-krishna-amavasya-regional-observance",
    allowedMonths: ["ज्येष्ठ"], reviewOnly: true,
    reviewNote: "शनि जयंती ज्येष्ठ कृष्ण अमावस्या पर मनाई जाती है। पूजा का कोई एक अनिवार्य मुहूर्त मानकर तारीख़ तय नहीं की जाएगी; अमावस्या और स्थानीय परंपरा का मिलान हाथ से होगा।",
    sourceReview: "common-calendar-convention-crosscheck-primary-rule-pending"
  },
  "vinayaka-chaturthi-madhyahna": {
    id: "vinayaka-chaturthi-madhyahna", aliases: ["vinayaka-chaturthi"],
    label: "विनायक चतुर्थी", tithiIndices: [3], paksha: "शुक्ल पक्ष",
    decisionMoment: "madhyahna", windowLabel: "मध्याह्न काल",
    calculationBasis: "sunrise-to-sunset-two-fifths-to-three-fifths",
    sourceReview: "pending-primary-source-review"
  }
};

const ALIAS_TO_ID = new Map();
for (const profile of Object.values(PROFILES)) {
  ALIAS_TO_ID.set(profile.id, profile.id);
  for (const alias of profile.aliases) ALIAS_TO_ID.set(alias, profile.id);
}

function asDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
function asInterval(row) {
  const start = asDate(row?.startTime ?? row?.start);
  const end = asDate(row?.endTime ?? row?.end);
  if (!start || !end || end <= start) return null;
  return { start, end, index: Number(row?.index ?? row?.number ?? row?.value) };
}
function overlap(a, b) {
  const start = new Date(Math.max(a.start.getTime(), b.start.getTime()));
  const end = new Date(Math.min(a.end.getTime(), b.end.getTime()));
  return end > start ? { start, end } : null;
}
function makeWindow(profile, context) {
  if (profile.decisionMoment === "sunrise") {
    const point = asDate(context.sunrise);
    return point ? { start: point, end: new Date(point.getTime() + 1), point } : null;
  }
  if (profile.decisionMoment === "navami-ashtami-viddha") {
    const sunset = asDate(context.sunset);
    return sunset ? { start: sunset, end: new Date(sunset.getTime() + 6 * 24 * 60000), point: sunset } : null;
  }
  if (profile.decisionMoment === "sandhi") {
    const rows = Array.isArray(context.tithis) ? context.tithis.map(asInterval).filter(Boolean) : [];
    const ashtami = rows.filter(row => row.index === 7);
    const navami = rows.filter(row => row.index === 8);
    for (const a of ashtami) for (const n of navami) {
      if (Math.abs(a.end.getTime() - n.start.getTime()) <= 90000) {
        const transition = new Date((a.end.getTime() + n.start.getTime()) / 2);
        return { start: transition, end: new Date(transition.getTime() + 1), transition };
      }
    }
    return null;
  }
  if (profile.decisionMoment === "moonrise") {
    const point = asDate(context.moonrise);
    return point ? { start: point, end: new Date(point.getTime() + 1), point } : null;
  }
  if (profile.decisionMoment === "aparahna") {
    const sunrise = asDate(context.sunrise), sunset = asDate(context.sunset);
    if (!sunrise || !sunset || sunset <= sunrise) return null;
    const span = sunset.getTime() - sunrise.getTime();
    return { start: new Date(sunrise.getTime() + span * 3 / 5), end: new Date(sunrise.getTime() + span * 4 / 5) };
  }
  if (profile.decisionMoment === "madhyahna") {
    const sunrise = asDate(context.sunrise), sunset = asDate(context.sunset);
    if (!sunrise || !sunset || sunset <= sunrise) return null;
    const span = sunset.getTime() - sunrise.getTime();
    return { start: new Date(sunrise.getTime() + span * 2 / 5), end: new Date(sunrise.getTime() + span * 3 / 5) };
  }
  const sunset = asDate(context.sunset), nextSunrise = asDate(context.nextSunrise);
  if (!sunset || !nextSunrise || nextSunrise <= sunset) return null;
  const night = nextSunrise.getTime() - sunset.getTime();
  if (profile.decisionMoment === "nishita") {
    return { start: new Date(sunset.getTime() + night * 7 / 15), end: new Date(sunset.getTime() + night * 8 / 15) };
  }
  if (profile.decisionMoment === "pradosh") {
    return { start: sunset, end: new Date(sunset.getTime() + night * 3 / 15) };
  }
  return null;
}

/** Resolve a reviewed profile ID without inferring rules from a festival title. */
export function getObservanceRuleProfile(ruleId) {
  const id = ALIAS_TO_ID.get(String(ruleId ?? "").trim().toLowerCase());
  if (!id) return null;
  const profile = PROFILES[id];
  return Object.freeze({
    id: profile.id, label: profile.label, tithiIndices: [...profile.tithiIndices],
    paksha: profile.paksha, allowedMonths: profile.allowedMonths ? [...profile.allowedMonths] : null, decisionMoment: profile.decisionMoment, nakshatraLabel: profile.nakshatraLabel ?? null, reviewOnly: Boolean(profile.reviewOnly), reviewNote: profile.reviewNote ?? null,
    windowLabel: profile.windowLabel, calculationBasis: profile.calculationBasis,
    sourceReview: profile.sourceReview, ruleVersion: "0.3.0",
    selectionPolicy: profile.reviewOnly ? "manual-review" : "unique-karmakala-match-only",
    tradition: "smarta-review-default"
  });
}

/**
 * Evaluate one day against an explicit profile. A match is only candidate
 * evidence; source review and festival-specific exceptions remain separate.
 */
export function evaluateObservanceRule(ruleId, context) {
  const profileId = ALIAS_TO_ID.get(String(ruleId ?? "").trim().toLowerCase());
  if (!profileId) return {
    status: "manual-review", ruleId: String(ruleId ?? ""),
    warnings: ["unknown-or-unassigned-observance-rule"],
    evidence: [], finalDate: null, autoApproved: false
  };
  const profile = PROFILES[profileId];
  const day = context?.date;
  if (profile.allowedMonths) {
    const month = String(context?.masa ?? "").replace(/^अधिक\s+/, "").trim();
    if (!month) return {
      status: "insufficient-data", ruleId: profile.id, date: day ?? null,
      decisionMoment: profile.decisionMoment, warnings: ["lunar-month-missing"],
      evidence: [], finalDate: null, autoApproved: false
    };
    if (!profile.allowedMonths.includes(month)) return {
      status: "candidate-not-supported", ruleId: profile.id, date: day ?? null,
      decisionMoment: profile.decisionMoment, warnings: ["lunar-month-outside-profile"],
      evidence: [], finalDate: null, autoApproved: false
    };
  }
  if (profile.reviewOnly) return {
    status: "manual-review", ruleId: profile.id, ruleVersion: "0.2.0",
    date: day ?? null, label: profile.label, decisionMoment: profile.decisionMoment,
    calculationBasis: profile.calculationBasis, sourceReview: profile.sourceReview,
    reviewNote: profile.reviewNote,
    warnings: ["special-rule-not-fully-implemented", "manual-source-and-tradition-review-required"],
    evidence: [], finalDate: null, autoApproved: false
  };
  const window = makeWindow(profile, context || {});
  if (!day || !window) return {
    status: "insufficient-data", ruleId: profile.id, date: day ?? null,
    decisionMoment: profile.decisionMoment,
    warnings: ["decision-window-or-date-missing"],
    evidence: [], finalDate: null, autoApproved: false
  };
  const rows = Array.isArray(context?.tithis) ? context.tithis : [];
  if (!rows.length) return {
    status: "insufficient-data", ruleId: profile.id, date: day,
    decisionMoment: profile.decisionMoment,
    warnings: ["tithi-intervals-missing"],
    evidence: [], finalDate: null, autoApproved: false
  };
  if (profile.firstSunriseOnly && context.previousSunrise && Array.isArray(context.previousTithis)) {
    const previousPoint = asDate(context.previousSunrise);
    const repeated = previousPoint && context.previousTithis.some(row => {
      const interval = asInterval(row);
      return interval && profile.tithiIndices.includes(interval.index) && interval.start <= previousPoint && interval.end > previousPoint;
    });
    if (repeated) return {
      status: "candidate-not-supported", ruleId: profile.id, date: day,
      decisionMoment: profile.decisionMoment,
      warnings: ["vriddhi-tithi-first-sunrise-only"],
      evidence: [], finalDate: null, autoApproved: false
    };
  }
  if (profile.decisionMoment === "navami-ashtami-viddha") {
    const sunrise = asDate(context.sunrise);
    const ashtamiAtSunrise = sunrise && rows.some(row => {
      const interval = asInterval(row);
      return interval && interval.index === 7 && interval.start <= sunrise && interval.end > sunrise;
    });
    if (!ashtamiAtSunrise) return {
      status: "candidate-not-supported", ruleId: profile.id, date: day,
      decisionMoment: profile.decisionMoment,
      warnings: ["ashtami-not-active-at-sunrise"],
      evidence: [], finalDate: null, autoApproved: false
    };
    const navamiCoversEvening = rows.some(row => {
      const interval = asInterval(row);
      return interval && interval.index === 8 && interval.start <= window.start &&
        interval.end.getTime() - window.start.getTime() >= profile.requiredCoverageMs;
    });
    if (!navamiCoversEvening) return {
      status: "candidate-not-supported", ruleId: profile.id, date: day,
      decisionMoment: profile.decisionMoment,
      warnings: ["navami-less-than-six-ghatis-after-sunset"],
      evidence: [], finalDate: null, autoApproved: false
    };
  }
  const evidence = [];
  if (profile.decisionMoment === "sandhi") {
    const ashtami = rows.map(asInterval).filter(interval => interval && interval.index === 7);
    const navami = rows.map(asInterval).filter(interval => interval && interval.index === 8);
    for (const a of ashtami) for (const n of navami) {
      if (Math.abs(a.end.getTime() - n.start.getTime()) <= 90000) {
        evidence.push({
          tithiIndex: 7, start: a.start.toISOString(), end: a.end.toISOString(),
          decisionMoment: "sandhi-junction", transitionTime: window.transition.toISOString()
        });
        evidence.push({
          tithiIndex: 8, start: n.start.toISOString(), end: n.end.toISOString(),
          decisionMoment: "sandhi-junction", transitionTime: window.transition.toISOString()
        });
      }
    }
  } else {
    for (const row of rows) {
      const interval = asInterval(row);
      if (!interval || !profile.tithiIndices.includes(interval.index)) continue;
      if (profile.paksha && row.paksha && row.paksha !== profile.paksha) continue;
      let matched = profile.decisionMoment === "moonrise"
        ? (interval.start <= window.point && interval.end > window.point
          ? { start: window.point, end: window.point } : null)
        : overlap(interval, window);
      if (profile.decisionMoment === "navami-ashtami-viddha") {
        if (interval.index === 7) {
          const sunrise = asDate(context.sunrise);
          matched = sunrise && interval.start <= sunrise && interval.end > sunrise
            ? { start: sunrise, end: new Date(sunrise.getTime() + 1) } : null;
        }
      }
      if (matched) evidence.push({
        tithiIndex: interval.index,
        tithiName: row.name ?? row.tithi ?? null,
        start: matched.start.toISOString(), end: matched.end.toISOString(),
        decisionMoment: profile.decisionMoment,
        windowStart: window.start.toISOString(), windowEnd: window.end.toISOString()
      });
    }
  }
  const matchedTithis = new Set(evidence.map(item => item.tithiIndex));
  const allRequired = !profile.requireAllTithis || profile.tithiIndices.every(index => matchedTithis.has(index));
  const nakshatraEvidence = profile.nakshatraIndices && Array.isArray(context.nakshatraIntervals)
    ? context.nakshatraIntervals.filter(item => profile.nakshatraIndices.includes(Number(item.index)) && (() => {
      const interval = asInterval(item);
      return interval && overlap(interval, window);
    })()).map(item => ({ index: Number(item.index), name: item.name ?? null }))
    : [];
  return {
    status: evidence.length && allRequired ? "candidate-supported" : "candidate-not-supported",
    ruleId: profile.id, ruleVersion: "0.2.0", date: day,
    label: profile.label, decisionMoment: profile.decisionMoment,
    calculationBasis: profile.calculationBasis,
    sourceReview: profile.sourceReview,
    evidence, nakshatraEvidence, nakshatraLabel: profile.nakshatraLabel ?? null,
    warnings: ["candidate-evidence-only", "primary-source-and-exception-review-required", ...(profile.nakshatraIndices && !nakshatraEvidence.length ? [profile.nakshatraWarning ?? "required-nakshatra-not-confirmed"] : []), ...(profile.requireAllTithis && !allRequired ? ["both-transition-tithis-not-confirmed"] : [])],
    finalDate: null, autoApproved: false
  };
}


/**
 * Resolve a set of consecutive local-day candidates for one explicit rule.
 * A unique karmakala match can select a date, but never certifies publication:
 * source approval and any observance-specific tie-break remain separate gates.
 */
export function resolveObservanceCandidates(ruleId, candidateContexts) {
  const profileId = ALIAS_TO_ID.get(String(ruleId ?? "").trim().toLowerCase());
  if (!profileId) return {
    status: "manual-review", ruleId: String(ruleId ?? ""),
    warnings: ["unknown-or-unassigned-observance-rule"],
    evaluations: [], finalDate: null, autoApproved: false
  };
  if (!Array.isArray(candidateContexts) || !candidateContexts.length) return {
    status: "insufficient-data", ruleId: profileId,
    warnings: ["candidate-contexts-missing"],
    evaluations: [], finalDate: null, autoApproved: false
  };
  if (profileId === "nag-panchami-special-review") return resolveNagPanchamiCandidates(candidateContexts);
  if (profileId === "ratha-saptami-review") return resolveRathaSaptamiCandidates(candidateContexts);
  if (profileId === "shravana-yoga-dwadashi-review") return resolveShravanaDwadashiCandidates(candidateContexts);
  const dates = candidateContexts.map(item => String(item?.date ?? ""));
  if (dates.some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date)) || new Set(dates).size !== dates.length) {
    return {
      status: "insufficient-data", ruleId: profileId,
      warnings: ["candidate-dates-missing-or-duplicated"],
      evaluations: [], finalDate: null, autoApproved: false
    };
  }
  const evaluations = candidateContexts
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map(context => evaluateObservanceRule(profileId, context));
  if (evaluations.some(item => item.status === "insufficient-data")) return {
    status: "insufficient-data", ruleId: profileId,
    warnings: ["at-least-one-candidate-day-has-incomplete-calculation-data"],
    evaluations, finalDate: null, autoApproved: false
  };
  if (evaluations.some(item => item.status === "manual-review")) return {
    status: "manual-review", ruleId: profileId,
    warnings: ["observance-has-unimplemented-or-source-dependent-special-rule"],
    evaluations, finalDate: null, autoApproved: false
  };
  const supported = evaluations.filter(item => item.status === "candidate-supported");
  if (!supported.length) return {
    status: "candidate-not-supported", ruleId: profileId,
    warnings: ["no-candidate-day-covers-the-required-karmakala"],
    evaluations, finalDate: null, autoApproved: false
  };
  if (supported.length > 1) return {
    status: "manual-review", ruleId: profileId,
    warnings: ["multiple-days-cover-karmakala-explicit-shastriya-tie-break-required"],
    evaluations, finalDate: null, autoApproved: false
  };
  return {
    status: "date-selected-needs-source-approval", ruleId: profileId,
    selectedDate: supported[0].date, finalDate: supported[0].date,
    warnings: ["unique-karmakala-match", "primary-source-and-publication-approval-still-required"],
    evaluations, autoApproved: false
  };
}


/**
 * Detect the actual overlap of Dwadashi and Shravana nakshatra within each
 * local sunrise-to-following-sunrise vrata-day. This is evidence only; it deliberately does not decide
 * which day to fast when the yoga spans or repeats across adjacent dates.
 */
export function evaluateShravanaDwadashiYoga(candidateDays, options = {}) {
  const minimumYogaMs = Number.isFinite(Number(options.minimumYogaMs))
    ? Math.max(0, Number(options.minimumYogaMs))
    : 48 * 60 * 1000;
  if (!Array.isArray(candidateDays) || !candidateDays.length) return {
    status: "insufficient-data", matches: [], finalDate: null, autoApproved: false,
    warnings: ["candidate-days-missing"]
  };
  const matches = [];
  const seenDates = new Set();
  for (const day of candidateDays) {
    const date = String(day?.date ?? "");
    const dayStart = asDate(day?.dayStart);
    const dayEnd = asDate(day?.dayEnd);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || seenDates.has(date) ||
        !dayStart || !dayEnd || dayEnd <= dayStart ||
        !Array.isArray(day?.tithis) || !Array.isArray(day?.nakshatraIntervals)) {
      return {
        status: "insufficient-data", matches: [], finalDate: null, autoApproved: false,
        warnings: ["invalid-or-incomplete-local-day-intervals"]
      };
    }
    seenDates.add(date);
    const dwadashis = day.tithis.map(asInterval).filter((item, index) =>
      item && [11, 26].includes(item.index) &&
      (!day.tithis[index]?.paksha || ["शुक्ल पक्ष", "कृष्ण पक्ष", "शुक्ल", "कृष्ण"].includes(day.tithis[index].paksha))
    );
    const shravanas = day.nakshatraIntervals.map(asInterval).filter(item => item && item.index === 21);
    for (const tithi of dwadashis) for (const nakshatra of shravanas) {
      const yoga = overlap(overlap(tithi, nakshatra) ?? { start: dayEnd, end: dayEnd }, { start: dayStart, end: dayEnd });
      if (!yoga) continue;
      const durationMs = yoga.end.getTime() - yoga.start.getTime();
      if (durationMs <= 0) continue;
      matches.push({
        date, start: yoga.start.toISOString(), end: yoga.end.toISOString(),
        durationMs, meetsOneMuhurta: durationMs >= minimumYogaMs
      });
    }
  }
  const qualifying = matches.filter(item => item.meetsOneMuhurta);
  return {
    status: qualifying.length > 1 ? "manual-review"
      : qualifying.length === 1 ? "candidate-evidence-only"
      : matches.length ? "brief-overlap-needs-review" : "candidate-not-supported",
    matches,
    qualifyingDates: [...new Set(qualifying.map(item => item.date))],
    finalDate: null, autoApproved: false,
    warnings: [
      "tithi-nakshatra-overlap-is-not-a-fast-date-decision",
      ...(qualifying.length > 1 ? ["yoga-overlaps-multiple-local-days-explicit-tie-break-required"] : []),
      ...(matches.length && !qualifying.length ? ["overlap-shorter-than-one-muhurta"] : []),
      "ekadashi-dwadashi-fast-and-parana-rule-must-be-evaluated-separately"
    ]
  };
}


/**
 * Resolve the special Bhadrapada Shukla Shravana-Dwadashi two-day case.
 * Candidate day boundaries must be local sunrise-to-following-sunrise.
 * The Dharmasindhu Vishnushrinkhala exception selects the earlier day when
 * Ekadashi is active at its sunrise, Dwadashi begins later and continues
 * through the following sunrise, and both vrata-days contain Dwadashi-
 * Shravana yoga. The source's accepted first-night-prahara branch is checked
 * explicitly; the short remaining Dwadashi on day two must be <= two ghatis.
 */
export function resolveShravanaDwadashiCandidates(candidateDays, options = {}) {
  const twoGhatisMs = Number.isFinite(Number(options.twoGhatisMs))
    ? Math.max(0, Number(options.twoGhatisMs))
    : 48 * 60 * 1000;
  const fail = (status, warnings, evaluations = []) => ({
    status, ruleId: "shravana-yoga-dwadashi-review", evaluations,
    selectedDate: null, finalDate: null, autoApproved: false, warnings
  });
  if (!Array.isArray(candidateDays) || candidateDays.length !== 2) {
    return fail("insufficient-data", ["exactly-two-consecutive-vrata-days-required"]);
  }
  const days = candidateDays.slice().sort((a, b) => String(a?.date ?? "").localeCompare(String(b?.date ?? "")));
  const info = days.map(day => {
    const dayStart = asDate(day?.dayStart ?? day?.sunrise);
    const dayEnd = asDate(day?.dayEnd ?? day?.nextSunrise);
    const sunset = asDate(day?.sunset);
    const masa = String(day?.masa ?? "").replace(/^अधिक\s+/, "").trim();
    const paksha = String(day?.paksha ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day?.date ?? "")) ||
        !dayStart || !dayEnd || !sunset || dayEnd <= dayStart ||
        sunset <= dayStart || sunset >= dayEnd ||
        masa !== "भाद्रपद" || !["शुक्ल", "शुक्ल पक्ष"].includes(paksha) ||
        !Array.isArray(day?.tithis) || !Array.isArray(day?.nakshatraIntervals)) return null;
    const collect = (rows, index) => rows.map(asInterval).filter(x => x && x.index === index)
      .sort((a, b) => a.start - b.start)
      .reduce((merged, item) => {
        const last = merged[merged.length - 1];
        if (last && item.start.getTime() <= last.end.getTime() + 1000) {
          if (item.end > last.end) last.end = item.end;
        } else merged.push({ start: new Date(item.start), end: new Date(item.end), index });
        return merged;
      }, []);
    const ekadashi = collect(day.tithis, 10);
    const dwadashi = collect(day.tithis, 11);
    const shravana = collect(day.nakshatraIntervals, 21);
    const activeAt = (rows, point) => rows.find(x => x.start <= point && x.end > point) ?? null;
    const overlaps = (left, right, window) => {
      const segments = [];
      for (const a of left) for (const b of right) {
        const both = overlap(a, b);
        const clipped = both && overlap(both, window);
        if (clipped) segments.push(clipped);
      }
      segments.sort((a, b) => a.start - b.start);
      const union = [];
      for (const item of segments) {
        const last = union[union.length - 1];
        if (last && item.start.getTime() <= last.end.getTime() + 1000) {
          if (item.end > last.end) last.end = item.end;
        } else union.push({ start: new Date(item.start), end: new Date(item.end) });
      }
      return union;
    };
    const fullDay = { start: dayStart, end: dayEnd };
    const yoga = overlaps(dwadashi, shravana, fullDay);
    const yogaMs = yoga.reduce((sum, x) => sum + x.end.getTime() - x.start.getTime(), 0);
    const praharaEnd = new Date(sunset.getTime() + (dayEnd.getTime() - sunset.getTime()) / 4);
    const acceptedNightWindow = { start: dayStart, end: praharaEnd };
    const acceptedYoga = overlaps(dwadashi, shravana, acceptedNightWindow);
    const acceptedYogaMs = acceptedYoga.reduce((sum, x) => sum + x.end.getTime() - x.start.getTime(), 0);
    const atSunrise = activeAt(dwadashi, dayStart);
    return {
      date: day.date, dayStart, dayEnd, sunset,
      ekadashiAtSunrise: Boolean(activeAt(ekadashi, dayStart)),
      dwadashiStartsAfterSunrise: dwadashi.some(x => x.start > dayStart && x.start < dayEnd),
      dwadashiAtSunrise: Boolean(atSunrise),
      dwadashiRemainingAfterSunriseMs: atSunrise ? atSunrise.end.getTime() - dayStart.getTime() : 0,
      shravanaDwadashiOverlapMs: yogaMs,
      acceptedDayOrFirstPraharaOverlapMs: acceptedYogaMs,
      overlaps: yoga.map(x => ({ start: x.start.toISOString(), end: x.end.toISOString() })),
      firstPraharaEnd: praharaEnd.toISOString()
    };
  });
  if (info.some(x => !x)) return fail("insufficient-data", [
    "local-sunrise-sunset-bhadrapada-shukla-or-real-tithi-nakshatra-interval-missing"
  ]);
  const [earlier, later] = info;
  if (Math.abs(earlier.dayEnd.getTime() - later.dayStart.getTime()) > 1000) {
    return fail("insufficient-data", ["candidate-vrata-days-are-not-contiguous-sunrise-to-sunrise"]);
  }
  const previousDayVishnushrinkhala =
    earlier.ekadashiAtSunrise &&
    earlier.dwadashiStartsAfterSunrise &&
    later.dwadashiAtSunrise &&
    earlier.shravanaDwadashiOverlapMs > 0 &&
    later.shravanaDwadashiOverlapMs > 0 &&
    earlier.acceptedDayOrFirstPraharaOverlapMs >= 48 * 60 * 1000 &&
    later.dwadashiRemainingAfterSunriseMs > 0 &&
    later.dwadashiRemainingAfterSunriseMs <= twoGhatisMs;
  if (previousDayVishnushrinkhala) return {
    status: "date-selected-needs-source-approval",
    ruleId: "shravana-yoga-dwadashi-review",
    selectedDate: earlier.date, finalDate: earlier.date,
    selectionBasis: "dharmasindhu-vishnushrinkhala-ekadashi-viddha-dwadashi-shravana-both-vrata-days-previous-day-only",
    evaluations: info.map((x, i) => ({
      date: x.date, ekadashiAtSunrise: x.ekadashiAtSunrise,
      dwadashiStartsAfterSunrise: x.dwadashiStartsAfterSunrise,
      dwadashiAtSunrise: x.dwadashiAtSunrise,
      dwadashiRemainingAfterSunriseMs: x.dwadashiRemainingAfterSunriseMs,
      shravanaDwadashiOverlapMs: x.shravanaDwadashiOverlapMs,
      acceptedDayOrFirstPraharaOverlapMs: x.acceptedDayOrFirstPraharaOverlapMs,
      overlaps: x.overlaps, firstPraharaEnd: x.firstPraharaEnd
    })),
    warnings: [
      "dharmasindhu-vishnushrinkhala-selects-earlier-vrata-day-only",
      "two-ghati-dwadashi-with-shravana-is-present-on-second-day",
      "primary-source-and-publication-approval-still-required"
    ],
    autoApproved: false
  };
  return fail("manual-review", [
    "shravana-dwadashi-special-two-day-rule-not-fully-matched",
    "no-date-selected-without-the-dharmasindhu-vishnushrinkhala-conditions"
  ], info.map(x => ({
    date: x.date, ekadashiAtSunrise: x.ekadashiAtSunrise,
    dwadashiStartsAfterSunrise: x.dwadashiStartsAfterSunrise,
    dwadashiAtSunrise: x.dwadashiAtSunrise,
    dwadashiRemainingAfterSunriseMs: x.dwadashiRemainingAfterSunriseMs,
    shravanaDwadashiOverlapMs: x.shravanaDwadashiOverlapMs,
    acceptedDayOrFirstPraharaOverlapMs: x.acceptedDayOrFirstPraharaOverlapMs,
    overlaps: x.overlaps, firstPraharaEnd: x.firstPraharaEnd
  })));
}


/**
 * Calculate the Smarta Ekadashi parana window from the local Dwadashi interval.
 * Hari Vasara is the first quarter of Dwadashi. Prefer the first fifth of the
 * local day (Pratahkal); if Hari Vasara runs beyond it, avoid Madhyahna and
 * use the post-Madhyahna window. This function never changes the fast date.
 */
export function calculateEkadashiParanaWindow(context = {}) {
  const sunrise = asDate(context.sunrise);
  const sunset = asDate(context.sunset);
  const dwadashiStart = asDate(context.dwadashiStart);
  const dwadashiEnd = asDate(context.dwadashiEnd);
  if (!sunrise || !sunset || sunset <= sunrise || !dwadashiStart || !dwadashiEnd || dwadashiEnd <= dwadashiStart) {
    return {
      status: "insufficient-data", windowStart: null, windowEnd: null,
      hariVasaraEnd: null, finalDate: null, autoApproved: false,
      warnings: ["sunrise-sunset-or-valid-dwadashi-interval-missing"]
    };
  }
  const daylightMs = sunset.getTime() - sunrise.getTime();
  const pratahEnd = new Date(sunrise.getTime() + daylightMs / 5);
  const madhyahnaEnd = new Date(sunrise.getTime() + daylightMs * 3 / 5);
  const hariVasaraEnd = new Date(
    dwadashiStart.getTime() + (dwadashiEnd.getTime() - dwadashiStart.getTime()) / 4
  );
  if (dwadashiEnd <= sunrise) {
    return {
      status: "parana-after-dwadashi-ended-before-sunrise",
      windowStart: sunrise.toISOString(), windowEnd: pratahEnd.toISOString(),
      hariVasaraEnd: hariVasaraEnd.toISOString(),
      pratahEnd: pratahEnd.toISOString(), madhyahnaEnd: madhyahnaEnd.toISOString(),
      finalDate: null, autoApproved: false,
      warnings: ["dwadashi-ended-before-sunrise-exception", "parana-date-still-requires-smarta-fast-day-validation"]
    };
  }
  const morningStart = new Date(Math.max(sunrise.getTime(), hariVasaraEnd.getTime()));
  const morningEnd = new Date(Math.min(pratahEnd.getTime(), dwadashiEnd.getTime()));
  if (morningEnd > morningStart) return {
    status: "morning-window",
    windowStart: morningStart.toISOString(), windowEnd: morningEnd.toISOString(),
    hariVasaraEnd: hariVasaraEnd.toISOString(),
    pratahEnd: pratahEnd.toISOString(), madhyahnaEnd: madhyahnaEnd.toISOString(),
    finalDate: null, autoApproved: false,
    warnings: ["after-sunrise", "after-hari-vasara", "within-dwadashi", "pratahkal-preferred"]
  };
  if (hariVasaraEnd >= pratahEnd) {
    const afternoonStart = new Date(Math.max(madhyahnaEnd.getTime(), hariVasaraEnd.getTime()));
    if (dwadashiEnd > afternoonStart) return {
      status: "afternoon-window",
      windowStart: afternoonStart.toISOString(), windowEnd: dwadashiEnd.toISOString(),
      hariVasaraEnd: hariVasaraEnd.toISOString(),
      pratahEnd: pratahEnd.toISOString(), madhyahnaEnd: madhyahnaEnd.toISOString(),
      finalDate: null, autoApproved: false,
      warnings: ["hari-vasara-exceeds-pratahkal", "madhyahna-avoided", "parana-after-madhyahna", "within-dwadashi"]
    };
  }
  return {
    status: "manual-review", windowStart: null, windowEnd: null,
    hariVasaraEnd: hariVasaraEnd.toISOString(),
    pratahEnd: pratahEnd.toISOString(), madhyahnaEnd: madhyahnaEnd.toISOString(),
    finalDate: null, autoApproved: false,
    warnings: ["no-valid-parana-window-under-standard-smarta-rules", "special-exception-or-source-review-required"]
  };
}


/**
 * Resolve the two-day Shravana Shukla Nag Panchami rule described in
 * Dharmasindhu (p.44) and Nirnaya Sindhu (p.164). Muhurtas are 1/15 of
 * each local day's daylight. Ambiguous or incomplete cases stay in review.
 */
/**
 * Resolve Magha Shukla Ratha Saptami from local Arunodaya (96 minutes
 * before sunrise). Dharmasindhu: if Saptami covers Arunodaya on both days,
 * take the first; if it has kshaya and ends before the following Arunodaya,
 * the preceding Shashthi-yukta day is a separate source-backed exception.
 * Results remain candidates and are never auto-approved.
 */
export function resolveRathaSaptamiCandidates(candidateDays) {
  const fail = (status, warnings, evaluations = []) => ({
    status, ruleId: "ratha-saptami-review", evaluations,
    selectedDate: null, finalDate: null, autoApproved: false, warnings
  });
  if (!Array.isArray(candidateDays) || candidateDays.length !== 2) {
    return fail("insufficient-data", ["exactly-two-consecutive-local-days-required"]);
  }
  const days = candidateDays.slice().sort((a, b) => String(a?.date ?? "").localeCompare(String(b?.date ?? "")));
  const info = days.map(day => {
    const date = String(day?.date ?? "");
    const sunrise = asDate(day?.sunrise);
    const masa = String(day?.masa ?? "").replace(/^अधिक\\s+/, "").trim();
    const paksha = String(day?.paksha ?? "").trim();
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || !sunrise ||
        masa !== "माघ" || !["शुक्ल", "शुक्ल पक्ष"].includes(paksha) ||
        !Array.isArray(day?.tithis) || !day.tithis.length) return null;
    const arunodaya = new Date(sunrise.getTime() - 96 * 60000);
    const intervals = day.tithis.map(asInterval).filter(Boolean);
    const saptami = intervals.filter(item => item.index === 6);
    const shashthi = intervals.filter(item => item.index === 5);
    const activeAt = (items, point) => items.find(item => item.start <= point && item.end > point) ?? null;
    return {
      date, sunrise, arunodaya,
      saptamiAtArunodaya: activeAt(saptami, arunodaya),
      shashthiAtSunrise: activeAt(shashthi, sunrise),
      shashthiRemainingAtSunriseMs: activeAt(shashthi, sunrise)
        ? activeAt(shashthi, sunrise).end.getTime() - sunrise.getTime() : 0,
      saptami,
      saptamiIntervals: saptami.map(item => ({ start: item.start.toISOString(), end: item.end.toISOString() }))
    };
  });
  if (info.some(item => !item)) return fail("insufficient-data", [
    "local-sunrise-magha-shukla-paksha-or-tithi-interval-missing"
  ]);
  const nextExpected = new Date(info[0].sunrise.getTime());
  nextExpected.setUTCDate(nextExpected.getUTCDate() + 1);
  if (nextExpected.toISOString().slice(0, 10) !== info[1].sunrise.toISOString().slice(0, 10)) {
    return fail("insufficient-data", ["candidate-days-are-not-consecutive"]);
  }
  const evaluations = info.map(day => ({
    date: day.date,
    arunodaya: day.arunodaya.toISOString(),
    sunrise: day.sunrise.toISOString(),
    saptamiAtArunodaya: Boolean(day.saptamiAtArunodaya),
    shashthiAtSunrise: Boolean(day.shashthiAtSunrise),
    shashthiRemainingAtSunriseMs: day.shashthiRemainingAtSunriseMs,
    saptamiIntervals: day.saptamiIntervals
  }));
  const arunodayaDays = info.filter(day => day.saptamiAtArunodaya);
  if (arunodayaDays.length) {
    const selected = arunodayaDays[0];
    return {
      status: "date-selected-needs-source-approval",
      ruleId: "ratha-saptami-review",
      selectedDate: selected.date, finalDate: selected.date,
      selectionBasis: arunodayaDays.length > 1
        ? "dharmasindhu-arunodaya-vyapti-on-two-days-first-day"
        : "magha-shukla-saptami-at-local-arunodaya",
      evaluations,
      warnings: [
        "arunodaya-is-four-ghatis-96-minutes-before-local-sunrise",
        ...(arunodayaDays.length > 1 ? ["both-arunodaya-days-covered-first-day-selected"] : []),
        "dharmasindhu-primary-text-rule-applied-source-and-publication-approval-required"
      ],
      autoApproved: false
    };
  }
  const earlier = info[0], later = info[1];
  const earlyEndingSaptami = earlier.saptami.filter(item =>
    item.start > earlier.sunrise && item.end <= later.arunodaya
  );
  if (earlier.shashthiAtSunrise &&
      earlier.shashthiRemainingAtSunriseMs > 0 &&
      earlier.shashthiRemainingAtSunriseMs <= 24 * 60000 &&
      earlyEndingSaptami.length === 1) {
    return {
      status: "date-selected-needs-source-approval",
      ruleId: "ratha-saptami-review",
      selectedDate: earlier.date, finalDate: earlier.date,
      selectionBasis: "dharmasindhu-shashthi-yukta-saptami-kshaya-before-next-arunodaya",
      evaluations,
      warnings: [
        "special-shashthi-yukta-saptami-kshaya-exception-applied",
        "one-ghati-or-so-shashthi-at-sunrise-and-saptami-kshaya-before-next-arunodaya-confirmed",
        "primary-source-and-publication-approval-still-required"
      ],
      autoApproved: false
    };
  }
  return fail("manual-review", [
    "saptami-does-not-cover-either-local-arunodaya",
    "dharmasindhu-one-ghati-shashthi-yukta-kshaya-exception-not-unambiguously-satisfied"
  ], evaluations);
}

export function resolveNagPanchamiCandidates(candidateDays) {
  const fail = (status, warnings, evidence = []) => ({
    status, ruleId: "nag-panchami-special-review", evaluations: evidence,
    selectedDate: null, finalDate: null, autoApproved: false, warnings
  });
  if (!Array.isArray(candidateDays) || !candidateDays.length || candidateDays.length > 2) {
    return fail("insufficient-data", ["one-or-two-consecutive-local-days-required"]);
  }
  const days = candidateDays.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const dateValid = date => /^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ""));
  const dayInfo = days.map(day => {
    const sunrise = asDate(day?.sunrise);
    const sunset = asDate(day?.sunset);
    const tithis = Array.isArray(day?.tithis) ? day.tithis : [];
    const masa = String(day?.masa ?? "").replace(/^अधिक\s+/, "").trim();
    const paksha = String(day?.paksha ?? "").trim();
    if (!dateValid(day?.date) || !sunrise || !sunset || sunset <= sunrise ||
        masa !== "श्रावण" || !["शुक्ल", "शुक्ल पक्ष"].includes(paksha) || !tithis.length) return null;
    const daylightMs = sunset.getTime() - sunrise.getTime();
    const muhurtaMs = daylightMs / 15;
    const intervals = tithis.map((row, index) => ({ row, interval: asInterval(row), index })).filter(x => x.interval);
    const active = index => intervals.find(x => x.interval.index === index && x.interval.start <= sunrise && x.interval.end > sunrise);
    const afterSunrise = index => {
      const item = active(index);
      return item ? item.interval.end.getTime() - sunrise.getTime() : 0;
    };
    const panchamiDuringDay = intervals.some(x => x.interval.index === 4 &&
      overlap(x.interval, { start: sunrise, end: sunset }));
    return {
      date: day.date, sunrise, sunset, muhurtaMs,
      chaturthiAfterSunriseMs: afterSunrise(3),
      panchamiAfterSunriseMs: afterSunrise(4),
      panchamiDuringDay
    };
  });
  if (dayInfo.some(item => !item)) return fail("insufficient-data", [
    "local-sunrise-sunset-shravana-masa-shukla-paksha-or-tithi-interval-missing"
  ]);
  if (dayInfo.length === 1) {
    const day = dayInfo[0];
    if (day.panchamiAfterSunriseMs >= 3 * day.muhurtaMs) return {
      status: "date-selected-needs-source-approval",
      ruleId: "nag-panchami-special-review", selectedDate: day.date, finalDate: day.date,
      selectionBasis: "panchami-prevails-three-muhurtas-after-local-sunrise",
      evaluations: dayInfo.map(x => ({
        date: x.date, panchamiAfterSunriseMs: x.panchamiAfterSunriseMs,
        threeMuhurtaMs: 3 * x.muhurtaMs, chaturthiAfterSunriseMs: x.chaturthiAfterSunriseMs
      })),
      warnings: ["unique-three-muhurta-candidate", "primary-source-and-publication-approval-still-required"],
      autoApproved: false
    };
    return fail("manual-review", ["single-day-candidate-does-not-meet-three-muhurta-rule"], dayInfo);
  }
  const earlier = dayInfo[0], later = dayInfo[1];
  const expectedNext = new Date(earlier.sunrise.getTime());
  expectedNext.setUTCDate(expectedNext.getUTCDate() + 1);
  const actualNext = new Date(later.sunrise.getTime());
  if (expectedNext.toISOString().slice(0, 10) !== actualNext.toISOString().slice(0, 10)) {
    return fail("insufficient-data", ["candidate-days-are-not-consecutive"]);
  }
  const laterPanchami = later.panchamiAfterSunriseMs;
  const laterThree = 3 * later.muhurtaMs;
  const laterTwo = 2 * later.muhurtaMs;
  let selectedDate = null, selectionBasis = null;
  if (laterPanchami >= laterThree) {
    selectedDate = later.date;
    selectionBasis = "later-day-panchami-prevails-three-muhurtas-after-sunrise";
  } else if (laterPanchami >= laterTwo && earlier.chaturthiAfterSunriseMs > 3 * earlier.muhurtaMs) {
    selectedDate = later.date;
    selectionBasis = "later-day-two-muhurta-panchami-with-earlier-chaturthi-over-three-muhurtas";
  } else if (laterPanchami >= laterTwo &&
      earlier.chaturthiAfterSunriseMs > 0 &&
      earlier.chaturthiAfterSunriseMs < 3 * earlier.muhurtaMs &&
      earlier.panchamiDuringDay) {
    selectedDate = earlier.date;
    selectionBasis = "earlier-day-panchami-when-earlier-chaturthi-is-under-three-muhurtas";
  }
  const evaluations = dayInfo.map(x => ({
    date: x.date, panchamiAfterSunriseMs: x.panchamiAfterSunriseMs,
    twoMuhurtaMs: 2 * x.muhurtaMs, threeMuhurtaMs: 3 * x.muhurtaMs,
    chaturthiAfterSunriseMs: x.chaturthiAfterSunriseMs,
    earlierDayPanchamiPresent: x.panchamiDuringDay
  }));
  if (!selectedDate) return fail("manual-review", [
    laterPanchami < laterTwo
      ? "later-day-panchami-shorter-than-two-muhurtas"
      : "source-tie-break-not-satisfied-or-exact-three-muhurta-boundary",
    "no-date-selected-without-explicit-dharmasindhu-exception"
  ], evaluations);
  return {
    status: "date-selected-needs-source-approval",
    ruleId: "nag-panchami-special-review", selectedDate, finalDate: selectedDate,
    selectionBasis, evaluations,
    warnings: ["dharmasindhu-three-muhurta-rule-applied", "primary-source-and-publication-approval-still-required"],
    autoApproved: false
  };
}
