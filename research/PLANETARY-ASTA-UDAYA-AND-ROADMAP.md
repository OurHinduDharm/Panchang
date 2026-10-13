# OurHinduDharm — ग्रह उदय-अस्त प्रदर्शन एवं आगे की योजना

स्थिति: योजना/डिज़ाइन नोट; उत्पादन कोड में कोई बदलाव नहीं।

## प्राथमिक लक्ष्य

पहले मौजूदा दैनिक पंचांग को उपयोगी, स्पष्ट और भरोसेमंद बनाना है। ग्रहों के उदय-अस्त का सुंदर प्रदर्शन इसका हिस्सा है; TKS के आँकड़े संदर्भ-जाँच हैं, परियोजना का मुख्य लक्ष्य नहीं।

## वर्तमान स्थिति

`extra-panchang.js` में ग्रह उदय-अस्त कार्ड पहले से है। यह पाँच ग्रहों के लिए `getPlanetEvent()` चलाता है, लेकिन हर परिणाम `verificationPending: true` रखता है। इसलिए UI तारीखें छिपाकर “शास्त्रीय गणना सत्यापनाधीन” दिखाता है। इसके पीछे मौजूदा गणना सूर्य से कोणीय दूरी पर आधारित दिन-स्तरीय सीमा खोजती है; इसे अभी प्रमाणित शास्त्रीय लagnāntara-asu घटना-गणना नहीं माना जा सकता।

उत्पादन फ़ाइलें `app.js` और `extra-panchang.js` इस नोट के साथ नहीं बदली गई हैं।

## प्रस्तावित UI

अंतिम शास्त्रीय गणना प्रमाणित होने पर कार्ड में:

1. शीर्षक: **ग्रहों का शास्त्रीय उदय-अस्त**
2. चयनित तारीख और स्थान के अनुसार वर्तमान स्थिति: अस्त / उदित — केवल तब जब परिभाषित नियम से वास्तव में निकाली गई हो।
3. प्रत्येक ग्रह की अलग पंक्ति: ग्रह का नाम, स्थिति, अगला अस्त, अगला उदय; तारीख और समय उपलब्ध हो तो स्थानीय IST में।
4. घटना के समय का स्रोत/गणना-पद्धति और छोटा “कैसे गणना होती है?” लिंक।
5. यदि कोई घटना सत्यापित/उपलब्ध न हो तो अनुमानित तारीख गढ़ने के बजाय “गणना उपलब्ध नहीं” या “सत्यापनाधीन”।
6. आधुनिक दृश्यता (heliacal visibility), सामान्य apparent rise/set, और शास्त्रीय उदय-अस्त अलग अवधारणाएँ हैं; इन्हें एक ही लेबल में न मिलाएँ।

डिज़ाइन सिद्धांत: मोबाइल पर साफ़, छोटा, हिन्दी-प्रधान, तारीखें आसानी से पढ़ने योग्य; रंग केवल स्थिति बताने के लिए, सजावट के लिए नहीं।

## गणना और परीक्षण के प्रवेश-द्वार

- शास्त्रीय घटना का नियम और ग्रह-विशिष्ट C सीमा स्पष्ट रूप से स्रोत-सहित दर्ज हो।
- लग्नान्तर-प्राण, दृक्कर्म, सूर्योदय/सूर्यास्त वाली शाखा और समय-अनुमान के मध्यवर्ती मान लॉग/डायग्नोस्टिक में उपलब्ध हों।
- एक ही समय, स्थान, निर्देशांक और कोण-परिभाषा पर संदर्भ तुलना हो।
- कम-से-कम शुक्र, बुध, मंगल, गुरु और शनि के अस्त तथा उदय के कई स्वतंत्र संदर्भ तिथियों पर परीक्षण हों।
- पुराने/चयनित दिन और आज की तारीख दोनों सही ढंग से काम करें।
- उत्पादन में कोई स्थिर तिथि-सूची, नकली fallback या अप्रमाणित सीमा न जाए।

## काम का क्रम

### चरण A — दैनिक पंचांग v1.0
पहले से बने Panchang को स्थिर करना: चयनित तारीख/स्थान का सही असर, तिथि-समय और दिन/रात सीमाएँ, मुहूर्त/चौघड़िया/होरा, संकल्प और मोबाइल प्रदर्शन। ज्ञात समस्याओं को परीक्षणों से बंद करना; अनंत perfection loop से बचना।

### चरण B — ग्रह उदय-अस्त
1. गणना विधि का न्यूनतम आवश्यक ऑडिट।
2. पृथक research diagnostics और reference fixtures।
3. पाँच ग्रहों की तारीखों/समय की regression जाँच।
4. फिर ही `extra-panchang.js` में छोटा, अलग-थलग patch।
5. Blogger/GitHub Pages पर मोबाइल, तारीख बदलने और स्थान बदलने की जाँच।

### चरण C — Kundli के लिए साझा आधार
Kundli शुरू करने से पहले Panchang astronomy/data layer के स्पष्ट contracts बनें: जन्म-क्षण (तिथि, समय, timezone), स्थान/अक्षांश/देशांतर, ग्रहों के सायन/निरयन निर्देशांक व अयनांश, लग्न/भाव की पद्धति, राहु-केतु का विकल्प, तथा परीक्षण-संदर्भ। Kundli को अभी शुरू नहीं करना; पहले Panchang v1.0 की विश्वसनीयता और साझा गणना-आधार मजबूत करना है।

### चरण D — आगे का प्लेटफ़ॉर्म
Panchang → Kundli → Kundli Matching → शास्त्रीय ज्ञान सामग्री → Android app। सभी मॉड्यूल साझा गणना-इंजन इस्तेमाल करें; Blogger UI को भारी गणना/डुप्लिकेट कोड से न भरें।

## अभी का निर्णय

पहले ग्रह उदय-अस्त के लिए गणना-स्रोत और UI का अनुबंध तय करें, फिर परीक्षण पास होने पर उत्पादन में सीमित patch करें। इस चरण में केवल संदर्भ डेटा के कारण किसी परिणाम को शास्त्रीय प्रमाणित घोषित नहीं करना है।

## Continuity checkpoint — 13 October 2026

This section records the active state for the next chat/session. Keep this file updated when a meaningful decision, test result, or next action changes.

### Current repository work

- **Asta/Udaya research:** PR [#22](https://github.com/OurHinduDharm/Panchang/pull/22) remains research-only and unmerged. Its latest recorded Chapter IX diagnostic workflow passed, but the calculated event dates are not yet certified as classical ground truth. The ~4.3° same-instant Venus K difference against the user-provided TKS output remains unresolved; do not tune formulas to match it.
- **Panchang improvement in parallel:** PR [#27](https://github.com/OurHinduDharm/Panchang/pull/27) proposes seasonal Godhuli calculation while preserving existing Sandhya windows. It is a separate review item, not part of the Asta/Udaya patch. Review its latest CI and diff before any merge; do not infer that the PR is merged.
- **Production safety:** `app.js` and `extra-panchang.js` must remain unchanged until their respective work is validated and intentionally integrated.

### Immediate next actions

1. Review the current PR #27 diff and latest CI state; verify seasonal Godhuli thresholds, the 48-minute interval, fallback behavior, and that Sandhya timings remain unchanged. Keep it separate from planetary work.
2. For Asta/Udaya, capture the actual TKS Sun and Venus ephemeris JSON at **2026-10-12 12:00 IST (06:30 UTC)**, observer **29.5830° N, 80.2090° E**, timezone **UTC+05:30**. Preserve the unedited responses and request parameters. If the live endpoint does not expose them, document that limitation rather than inventing data.
3. Replay the local K from saved intermediates, then compare one input convention at a time. If the TKS payload is unavailable, keep the K discrepancy unresolved and move forward with independently testable Chapter IX fixtures; do not let this one comparison block all Panchang progress.
4. Once the method and regression tests are defensible, design and test the compact Hindi planet card on the research branch. Keep Shāstrīya Asta/Udaya, apparent rise/set, and heliacal visibility clearly separate. Only then prepare a minimal production patch.
5. Continue closing high-impact Panchang reliability issues before beginning Kundli.

### Working rule

The Markdown notes are the continuity record, but they are not a substitute for checking the live branch, PR state, and latest CI on each new session. At each meaningful checkpoint, record: date, changed files/branch, commit or workflow link, test outcome, unresolved risks, and the single next action.

### Repository check after this checkpoint — 13 October 2026

- PR #27 is confirmed **open + draft**, based on `main`, with 2 files changed (`app.js`, `tests/compact-ui-night-prahar.test.js`); it is not merged.
- The latest workflow query for its head commit `d0e124019fec00da0d2d569023387a83df613d89` returned a successful **Classical yoga interval tests** run ([38345884987](https://github.com/OurHinduDharm/Panchang/actions/runs/38345884987)). The combined commit status had no status entries, so this alone does **not** establish that the full expected test suite passed on the current head. Keep PR #27 draft until the full relevant CI is confirmed.
- PR #22 is also open + draft. Its latest recorded diagnostic run is a research validation, not a production sign-off.
