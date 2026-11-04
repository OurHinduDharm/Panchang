# ग्रह उदय-अस्त: स्रोत और स्वीकृति ऑडिट

अंतिम अद्यतन: 2026-11-04

## उद्देश्य

यह फ़ाइल केवल benchmark references और उनकी provenance को नियंत्रित करती है। यह स्वयं ग्रहों के उदय-अस्त की गणना नहीं करती और किसी candidate astronomy engine को Drik-संगत प्रमाणित नहीं करती।

## स्रोत और तुलना-स्तर

`data/asta-udaya-benchmark.json` में active cases के लिए:
- स्रोत स्थान (`sourceLocation`) और स्रोत पर्यवेक्षक (`sourceObserver`) अलग दर्ज हैं।
- OurHinduDharm का test observer (`testObserver`) अलग दर्ज है।
- `city-label-only` का अर्थ है कि स्रोत ने शहर बताया है, पर अपने आंतरिक निर्देशांक/ऊँचाई नहीं दिए। ऐसे case को coordinate-exact या minute-level physical equivalence नहीं कहा जा सकता।
- `coordinate-exact` केवल तब स्वीकार्य है जब स्रोत और test observer के प्रकाशित अक्षांश/देशांतर समान हों।
- date-only स्रोतों को date-only ही रखा जाता है; उनसे घड़ी का समय नहीं निकाला जाता।

## Active benchmark cases

1. Drik Pithoragarh Venus 2025: मार्च तथा दिसंबर 2025–फरवरी 2026 के प्रकाशित समय। तुलना city-label-only है; project observer 29.5828° N, 80.2182° E, 1650 m है, लेकिन इसे Drik के छिपे हुए observer coordinates न मानें।
2. Drik New Delhi Jupiter 2027: पृथक New Delhi city-label-only reference; Pithoragarh coordinates लागू करना निषिद्ध है।
3. Drik New Delhi Venus 2026 और 2027: named New Delhi pages से स्वतंत्र रूप से पुनः जाँचे गए exact local times। Provider observer coordinates फिर भी प्रकाशित नहीं हैं; इसलिए city-label-only ही रहेगा।
4. Rashtriya Panchang 2026–27 Venus visibility: Central Station of India का अलग official date-only cross-check; यह Drik exact-time event नहीं है।

## Quarantined / provisional references

- Pithoragarh Venus 2026 के पुराने समय और Jupiter 2027 के पुराने समय को `excludedUnverifiedData` में रखा गया है; इन्हें active acceptance target नहीं बनाना है।
- Pithoragarh Venus 2027 तथा Varanasi Venus 2026/2027 की ऐतिहासिक transcriptions `provisionalTranscriptions` में हैं। मूल named-city Drik page को फिर से खोलकर शहर/वर्ष चुनना, capture time और दोनों boundaries दर्ज करना आवश्यक है।
- Varanasi के coordinates/elevation अनुमान से न भरें।
- किसी दूसरे शहर के coordinates या event time से missing values न भरें।

## Candidate event models

### Swiss Ephemeris heliacal visibility

Swiss heliacal rising/setting एक भौतिक visibility candidate है, Drik algorithm का प्रमाणित clone नहीं। Pithoragarh Venus March 2025 diagnostic run में:
- Swiss Evening Last, प्रकाशित Asta-start से लगभग 2,893.9 मिनट पहले आया।
- Swiss Morning First, प्रकाशित Asta-end से लगभग 1,439.1 मिनट बाद आया।

यह बड़ा अंतर event-definition mismatch दिखाता है; इसे threshold tuning या “match” कहने का आधार नहीं बनाना है। Swiss visibility window के beginning/optimum/end को अलग Asta/Udaya boundaries की तरह न समझें। Atmospheric inputs और observer assumptions हर run में दर्ज होने चाहिए।

### सूर्यसिद्धान्त शोध — उत्पादन दायरे से बाहर

सूर्यसिद्धान्त अध्याय 9 की लम्बान्तर-आसु (K/C) पद्धति को आधुनिक ग्रह-अस्त/उदय के production engine, acceptance gate या Drik matching में उपयोग नहीं किया जाएगा। पुराना शोध केवल ऐतिहासिक/शास्त्रीय संदर्भ के रूप में अलग archive में रहेगा। इस परियोजना के अगले implementation और validation चरणों में इस पद्धति पर समय नहीं लगाया जाएगा।

## वर्तमान production स्थिति

- वर्तमान production planetary card fixed angular thresholds और geocentric Sun–planet separation से provisional estimates देता है।
- यह selected city के latitude/longitude/elevation के अनुसार नहीं बदलता; PR #253 ने UI/result metadata में यह सीमा स्पष्ट की।
- इसे local naked-eye visibility, classical K/C result या verified Drik-equivalent output न कहें।
- Performance diagnostics अब `?perf=1` पर opt-in हैं; PR #257 ने visible output fingerprint बदले बिना counters जोड़े।

## Numerical data quality

2026–2027 six-hour geocentric vector dataset:
- 105 chunks, 2,920 samples और checksum validation सफल।
- 238 timestamps / 1,428 vectors pinned `astronomy-engine@2.1.19` से पुनर्गणित हुए।
- हर छह-घंटे interval के midpoint पर linear interpolation measurement: 2,815 intervals, 16,890 vector comparisons।
- अधिकतम Sun–planet angular-separation interpolation difference: 0.0015251709781125555° (लगभग 5.49 arcseconds)।

यह same-engine midpoint interpolation error है। इससे independent ephemeris accuracy, actual event-time error, Drik matching, या local visibility प्रमाणित नहीं होती। Dataset manifest का status `generated-unvalidated` बना रहना चाहिए जब तक स्वतंत्र स्रोत-स्तरीय validation पूरी न हो।

## Production acceptance gate

1. प्रत्येक event के लिए event semantics स्पष्ट हों: Asta-start और Asta-end / Udaya का भौतिक या परंपरागत अर्थ।
2. Sun और planet positions एक ही ephemeris तथा compatible coordinate frame से हों।
3. चुने हुए observer की latitude, longitude, elevation और timezone स्पष्ट रूप से लागू हों; atmosphere/refraction/horizon assumptions दर्ज हों।
4. कम-से-कम दो same-city source boundaries के दोनों ends जाँचे जाएँ; date-only references पर date precision से अधिक दावा न हो।
5. एक अलग location test यह दिखाए कि स्थान बदलने पर local geometry और परिणाम सही ढंग से बदलते हैं।
6. Classical K/C, Drik-style modern model और Swiss visibility को कभी average या blend न करें।
7. Signed time differences और पहले से घोषित tolerance प्रकाशित हों; arbitrary threshold fitting निषिद्ध है।
8. जहाँ source या model प्रमाणित न हो, result unavailable/provisional रहे—fallback timestamp न गढ़ें।
9. Regression, browser, dataset integrity, CodeQL और performance checks सफल हों।
10. Production integration में मुख्य Panchang के अन्य परिणामों का output fingerprint अपरिवर्तित रहे।

## अगला क्रम

1. Provisional city transcriptions को primary pages से फिर capture करें और source metadata भरें।
2. Exact Drik boundary instants पर same-engine geometry report बनाएं; इसे Drik algorithm का प्रमाण न मानें।
3. Swiss और classical K/C diagnostics को अलग-अलग benchmark करें; event definition match न हो तो model reject/limit करें।
4. Independent ephemeris cross-check और location sensitivity के बाद ही modern production engine चुनें।
5. Accuracy gate पास होने के बाद measured performance bottleneck optimize करें।


## 4 नवम्बर 2026 — तेज़ व्यावहारिक candidate

एक isolated candidate implementation अब `extra-panchang.js` की research branch में जोड़ा गया है:

- चुने हुए स्थान के लिए `Observer(latitude, longitude, elevation)` उसी Panchang refresh से लिया जाता है।
- Sun और planet के true-equator-of-date apparent topocentric coordinates `Equator(..., observer, true, true)` से लिए जाते हैं।
- दोनों के RA/Dec unit vectors का 3-D angular separation निकाला जाता है।
- Asta/Udaya crossing उसी selected observer के साथ daily bracketing और minute-level bisection से खोजी जाती है।
- Daily cache तथा paired-boundary cache में latitude, longitude और elevation key का हिस्सा हैं; एक शहर का परिणाम दूसरे शहर पर reuse नहीं होगा।
- मौजूदा published approximate angular limits अभी provisional हैं: Mercury 14°, Venus 10°, Mars 17°, Jupiter 11°, Saturn 15°। Venus retrograde और Mercury retrograde के लिए Drik के approximate notes में अलग limits का उल्लेख है; direction-aware logic अभी इस candidate में लागू नहीं है।
- User-facing note अब इसे selected-place angular estimate कहती है; verified Drik-equivalent result का दावा नहीं करती।

यह geocentric longitude-only estimate से एक ठोस सुधार है, लेकिन **Drik का algorithm clone नहीं** है। Topocentric parallax outer planets पर बहुत छोटा होगा; event time में बड़ा अंतर मुख्यतः visibility/event definition और threshold model से आ सकता है। इसलिए अगले चरण में published Drik boundaries पर signed error report और threshold sensitivity आवश्यक है। किसी एक benchmark पर fit करके सभी ग्रहों/वर्षों के लिए सही होने का दावा नहीं किया जाएगा।

Regression tests में observer geometry, location-specific cache, search direction और benchmark provenance शामिल किए गए हैं। Browser workflow को इन्हें चलाने के लिए विस्तारित किया गया है।


## 4 नवम्बर 2026 — published Pithoragarh Venus benchmark का वास्तविक error report

Pinned `astronomy-engine@2.1.19` और project observer (29.5828° N, 80.2182° E, 1650 m) से topocentric 3-D angular-threshold candidate चलाया गया। तुलना केवल Drik Pithoragarh Venus 2025 published reference windows से है; Drik के आंतरिक coordinates उपलब्ध न होने से यह city-label comparison है।

| Drik boundary | Published IST | 10° candidate IST | Signed error |
|---|---|---|---:|
| 20 Mar 2025 Asta start | 20 Mar 18:42 | 20 Mar 01:18 | −1,043 min |
| 23 Mar 2025 Asta end | 23 Mar 05:40 | 26 Mar 23:22 | +5,383 min |
| 11 Dec 2025 Asta start | 11 Dec 06:25 | 26 Nov 15:23 | −21,061 min |
| 2 Feb 2026 Asta end | 2 Feb 18:15 | 17 Feb 04:35 | +20,781 min |

Published boundary instants पर measured apparent topocentric separation क्रमशः 9.4349°, 8.4096°, 6.4097°, 6.5683° थी। एक ही 10° threshold चारों boundaries से मेल नहीं खाता। इसलिए यह candidate location-aware तो है, पर **Drik-सन्निकट स्वीकृति के लिए असफल** है; इसे production में promote नहीं करना है। इन observed angles को universal thresholds में hard-code करना भी उचित नहीं—यह केवल चार event-specific samples हैं।

### अगला candidate: Swiss heliacal visibility

अगली तुलना उसी चार published boundaries पर Swiss Ephemeris `heliacal_ut` चलाती है:
- Asta-start के लिए planet Sun के पूर्व/पश्चिम होने के अनुसार Evening Last (event type 2) या Morning Last (event type 4)।
- Asta-end/Udaya के लिए उसी geometry के अनुसार Morning First (event type 1) या Evening First (event type 3)।
- Venus December 2025–February 2026 के sample में Asta-start Morning Last (4) और Asta-end Evening First (3) हैं; इन्हें March 2025 के Evening Last (2) / Morning First (1) से अलग रखा गया है।
- वही Pithoragarh project observer और explicit atmosphere/observer parameters।
- Swiss output का beginning/optimum/end visibility window अलग-अलग दर्ज होगा; किसी एक slot को Drik boundary तभी मानेंगे जब चारों cases में उसका अर्थ और signed error स्थिर रूप से बेहतर हो।

Swiss heliacal भी स्वतः Drik clone नहीं है। इसे केवल error report से बेहतर candidate सिद्ध होने पर आगे बढ़ाएँ।
