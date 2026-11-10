# ग्रह उदय-अस्त: स्रोत और स्वीकृति ऑडिट

अंतिम अद्यतन: 2026-11-10

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
5. Rashtriya Panchang की अलग `Heliacal Rising and setting of planets` तालिका में Venus तथा Jupiter के लिए Central Station के exact IST setting/rising times भी प्रकाशित हैं। इन्हें `rashtriya-panchang-heliacal-setting-rising` event model के रूप में अलग रखा गया है; ये Drik Tara Asta boundaries नहीं हैं। Venus का source-printed 13 Oct 2026 24:18 अगले civil date 14 Oct 00:18 IST में normalize किया गया है, और मूल printed date/clock भी सुरक्षित हैं।

## Quarantined / provisional references

- Pithoragarh Venus 2026 के पुराने समय और Jupiter 2027 के पुराने समय को `excludedUnverifiedData` में रखा गया है; इन्हें active acceptance target नहीं बनाना है।
- Pithoragarh Venus 2027 तथा Varanasi Venus 2026/2027 की ऐतिहासिक transcriptions `provisionalTranscriptions` में हैं। मूल named-city Drik page को फिर से खोलकर शहर/वर्ष चुनना, capture time और दोनों boundaries दर्ज करना आवश्यक है।
- Varanasi के coordinates/elevation अनुमान से न भरें।
- किसी दूसरे शहर के coordinates या event time से missing values न भरें।

## नया स्वतंत्र सरकारी समय-संदर्भ (2026-11-10)

Positional Astronomy Centre, IMD की Rashtriya Panchang `Heliacal Rising and setting of planets` तालिका (`https://packolkata.imd.gov.in/panchang/en/helical`) में Central Station of India के लिए Mercury के 13, Venus के 2, Mars के 1, Jupiter के 2 और Saturn के 2 — कुल 20 अलग-अलग heliacal events दिए हैं। ये annual event entries हैं; हर event को स्वतः paired Tara Asta interval न समझें। इस तालिका में Central Station के नाम के अलावा coordinates/elevation प्रकाशित नहीं हैं।

- Venus: पश्चिम में अस्त — 13 Oct 2026, 24:18 IST (अर्थात 14 Oct 2026, 00:18 IST); पूर्व में उदय — 28 Oct 2026, 07:36 IST।
- Jupiter: पश्चिम में अस्त — 15 Jul 2026, 11:10 IST; पूर्व में उदय — 10 Aug 2026, 07:53 IST।

ये exact-time सरकारी heliacal events हैं। पूरी 20-entry सूची benchmark JSON में source-printed date/clock और normalized IST timestamp सहित सुरक्षित है। `Sets in east/west` तथा `Rises in east/west` को ज्यों का त्यों रखा है; इन्हें स्वतः एकल 'तारा अस्त/उदय अवधि' में pair नहीं किया है। IMD पृष्ठ Central Station का नाम देता है, पर इस event table में latitude/longitude/elevation नहीं देता; इसलिए पुराने benchmark में लिखे 23°11′ N, 82°30′ E को इस तालिका से independently confirmed coordinate न मानें। Venus 24:18, Mercury 26:54, Mercury 24:38 और Mars 25:49 जैसे 24h-पार clock values को मूल रूप में तथा अगले civil date के normalized timestamp में रखें। इन्हें Drik Tara Asta/Udaya windows, date-only visibility table, Swiss heliacal diagnostics या Surya Siddhanta K/C परिणामों के साथ interchangeable न मानें।

## Candidate event models

### Swiss Ephemeris heliacal visibility

Swiss heliacal rising/setting एक भौतिक visibility candidate है, Drik algorithm का प्रमाणित clone नहीं। Pithoragarh Venus March 2025 diagnostic run में:
- Swiss Evening Last, प्रकाशित Asta-start से लगभग 2,893.9 मिनट पहले आया।
- Swiss Morning First, प्रकाशित Asta-end से लगभग 1,439.1 मिनट बाद आया।

यह बड़ा अंतर event-definition mismatch दिखाता है; इसे threshold tuning या “match” कहने का आधार नहीं बनाना है। Swiss visibility window के beginning/optimum/end को अलग Asta/Udaya boundaries की तरह न समझें। Atmospheric inputs और observer assumptions हर run में दर्ज होने चाहिए।

### शास्त्रीय सूर्यसिद्धांत

सूर्यसिद्धांत अध्याय 9 की लम्बान्तर-आसु (K/C) पद्धति अलग गणना-परिवार है। इसे आधुनिक Drik-style apparent positions, Swiss heliacal visibility या स्थानीय sunrise से मिलाकर एक hybrid result न बनाएँ। प्रत्येक method का result, inputs और uncertainty अलग रहे।

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
2. नए IMD heliacal exact-time cases को अलग event-model benchmark में रखें; पहले same-coordinate astronomy output से इनका स्वतंत्र परीक्षण करें, Drik acceptance में न मिलाएँ।
3. Exact Drik boundary instants पर same-engine geometry report बनाएं; इसे Drik algorithm का प्रमाण न मानें।
4. Swiss और classical K/C diagnostics को अलग-अलग benchmark करें; event definition match न हो तो model reject/limit करें।
5. Independent ephemeris cross-check और location sensitivity के बाद ही modern production engine चुनें।
6. Accuracy gate पास होने के बाद measured performance bottleneck optimize करें।


## स्रोत-स्थान निर्देशांक सीमा (2026-11-10 सुधार)

`Heliacal Rising and setting of planets` तथा `Visibility of Planets` के उद्धृत IMD पृष्ठ Central Station of India का नाम देते हैं, लेकिन उन पृष्ठों पर उसके latitude/longitude/elevation नहीं देते। इसलिए इन entries को `city-label-only` रखा गया है। पहले benchmark में Central Station के लिए 23°11′ N, 82°30′ E को source-published coordinates कहना अधिक मजबूत दावा था; इसे हटाया गया है। जब तक अलग प्राथमिक स्रोत से स्टेशन निर्देशांक न मिलें, इन cases पर coordinate-exact validation नहीं लिखना है।
