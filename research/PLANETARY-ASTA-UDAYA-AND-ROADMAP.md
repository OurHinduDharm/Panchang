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
- **Asta/Udaya CI refresh:** after the latest research-branch documentation commit, workflow [38361536925](https://github.com/OurHinduDharm/Panchang/actions/runs/38361536925) completed successfully for **SS Chapter 9 Diagnostic Tests**. This confirms the current research diagnostic test job passed; it still does not certify the reference event dates or approve production integration.


### Review checkpoint — PR #27 diff and CI audit — 13 October 2026

- Re-read PR #27's current diff. It adds a top-level import of `astronomy-engine@2.1.19` (`Body`, `Observer`, `SearchAltitude`) to `app.js`; this is a cross-site production dependency/load-path change, not merely a local Godhuli calculation. Before merge, check real mobile/network performance and whether the dependency should be loaded only where needed.
- Seasonal target mapping in the patch matches the project's current Sun-rashi season mapping: Vasanta/Grishma/Sharad at 0°, Hemanta/Shishira at +16′, Varsha at −16′. The code explicitly documents that the 48-minute duration is a chosen convention, not a duration stated by Muhurta Chintamani 6.101 itself.
- Fallback remains the existing sunset ±12-minute interval if location/event calculation fails or the event is outside the guard. Existing Sandhya calculations are retained by the patch; the test suite includes assertions for their day/night-relative boundaries.
- **Correction after inspecting the workflow definition and job steps:** the successful workflow named **Classical yoga interval tests** on PR #27 head `d0e124019fec00da0d2d569023387a83df613d89` did run all steps configured in `.github/workflows/classical-yogas-tests.yml`: JavaScript syntax checks, Panchang card-order tests, compact UI/night Prahar tests (including the new Godhuli tests), and the classical interval/reference tests. Every listed step completed successfully. This is a meaningful green regression run, though it is not a separate end-to-end Blogger/mobile performance test.
- PR #27 stays **Draft / unmerged** pending a focused review of the top-level Astronomy Engine dependency and real mobile loading impact. **Next action:** measure/assess that dependency's effect on the shared `app.js` load path and verify the seasonal crossing behavior on the live preview; do not merge until that review is complete.

### PR #22 continuation checkpoint — 13 October 2026

- Live GitHub state checked: PR [#22](https://github.com/OurHinduDharm/Panchang/pull/22) is **open, Draft, not merged**; head branch `research/ss-ch9-diagnostic`, head commit `b444dad9c90218a4f8aa846dccc9befbfecd091d`. The PR contains research/diagnostic files only; production `app.js` and `extra-panchang.js` remain out of scope.
- Current-head workflow [38362313120](https://github.com/OurHinduDharm/Panchang/actions/runs/38362313120) completed successfully. The job passed helper syntax, Chapter IX arithmetic/threshold tests, Chapter VII formula and source-derived sign tests, Chapter III rising-asus and geometry tests, Chapter I source-anchored tests, HTML/wiring checks, classical-frame tests, headless Chromium, and the production-isolation check.
- Reviewed the newly recorded 900-day TKS Udaya-Asta capture and the TKS Panchanga/Planets cross-check. They add useful multi-planet K/C and modern visibility outputs, but they do **not** expose the missing same-instant Sun/Venus raw ephemeris inputs or the Chapter VII intermediate lagnāntara values. TKS's page also distinguishes the shāstrīya K/C verdict from Arcus visionis, Schaefer photometric, and heliacal elongation criteria; those event dates must not be merged.
- The principal scientific blockers remain: (1) Venus same-instant K is ~12.001454° in the current sign-table candidate / ~12.015292° in the analytical oblique-ascension candidate versus the user-supplied TKS K=7.698°; (2) the current modern-coordinate bridge is not a proven historical Sūrya-siddhānta frame; (3) Chapter VII latitude, local sidereal angle, obliquity/sine-table, and intermediate construction assumptions are not fully adjudicated. Passing tests show implementation consistency for the fixtures, not that the absolute event dates are correct.
- **Decision remains no merge and no production patch.** Do not tune thresholds or dṛkkarma to match TKS. Next action: review the complete Chapter VII/III source-to-code chain and decide whether the diagnostic can make a defensible, explicitly scoped classical-frame claim. If the required frame cannot be justified from the chosen textual lineage, close PR #22 as a research diagnostic with the unresolved limitation documented, rather than presenting an uncertified engine as Panchang v1.0.

### PR #22 next-step checkpoint — direct Chapter VII commentary audit — 13 October 2026

- Re-checked PR #22 live: it remains **open, Draft, unmerged**. Current research branch is still `research/ss-ch9-diagnostic`; production `app.js` and `extra-panchang.js` remain outside the changes.
- Read Raṅganātha's direct Gūḍhārtha-prakāśaka commentary for Sūrya-siddhānta VII.10 in the 1859 Hall/Bāpū Deva Śāstrī edition (printed p. 215; online transcription lines 2315–2321). It explicitly says to multiply the previously calculated planetary-latitude minutes by the declination arising from the planet with three signs added, giving arcseconds. This confirms the +90° shifted-place step in the current candidate.
- One narrower ambiguity remains: the commentary does not unambiguously spell out in modern ecliptic-coordinate terms whether signed planetary latitude is retained when computing declination at the shifted +90° place. Current `ss_chapter7_drikkarma.js` assumes zero latitude for that shifted point. A synthetic 1.2°-latitude fixture shows the two interpretations differ in declination by about 1.12645° and in the resulting VII.10 correction by about 0.02253°. This is a sensitivity test, not a verdict for either interpretation.
- Added the source reading, numerical sensitivity, and next gate to `research/SS-CHAPTER-7-FORMULA-AUDIT.md` (commit [2dfef970](https://github.com/OurHinduDharm/Panchang/commit/2dfef970774224100cfc37e70ac109008f3c64dd)).
- Next: cross-check VII.10 against Sudhākara Dvivedī's separate commentary/edition and the stated geometry; if still unresolved, expose both variants as research-only diagnostics instead of changing the production formula. In parallel, keep the Chapter III epoch/frame blocker and same-instant TKS raw-input gap distinct.
- Do not merge PR #22, do not tune to TKS, and do not change production Panchang files on the basis of this finding. Wait for the workflow on the new research head, then inspect the result before the next code change.
