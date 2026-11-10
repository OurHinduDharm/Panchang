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


## 4 नवम्बर 2026 — Swiss heliacal का विस्तृत 10-boundary परिणाम

Latest CI run: `41849145392`, job `browser-diagnostics`, commit `e8620eae64d3bd429a6d47cac594704973d70162` — सफल। आठ scenarios × दस boundaries जाँची गईं। चार indexed published Pithoragarh Venus boundaries पर MAE:

| Swiss diagnostic scenario | Published 4-boundary MAE | Provisional 6-boundary MAE |
|---|---:|---:|
| age 36 / default range | 6,842 min | 9,360 min |
| age 23 / default range | 5,764 min | 8,640 min |
| age 23 / 80 km | 9,002 min | 10,322 min |
| age 23 / 120 km | 6,124 min | 6,481 min |
| age 23 / 200 km | 2,522 min | 3,123 min |
| age 23 / 300 km | 2,160 min | 2,161 min |
| age 23 / 500 km | 2,160 min | 2,161 min |
| age 23 / 1000 km | 2,160 min | 2,161 min |

यहाँ 300–1000 km plateau का अर्थ यह नहीं कि इतनी atmospheric range वास्तविक या स्वीकार्य है। यह केवल parameter sensitivity का diagnostic है; इसे production setting नहीं चुनना है। सर्वश्रेष्ठ sample MAE भी indexed references पर 2,160 मिनट (लगभग 1.5 दिन) है—हमारी अपेक्षित समय-सटीकता से बहुत दूर। अतः **Swiss heliacal candidate भी अभी Drik-सन्निकट production engine के रूप में असफल/अस्वीकृत है**। Beginning, optimum और end में से कोई भी slot इस निष्कर्ष को नहीं बदलता।

छह अतिरिक्त Pithoragarh 2026/2027 rows केवल user-reported-provisional हैं; वे independent Drik capture नहीं हैं। इन्हें acceptance gate या tuning target न बनाएं। खासकर 2027 Venus/Jupiter के कुछ provisional boundaries पर Swiss error कई दिनों का है।

### सत्यापित स्रोत और सीमा

- Drik Pithoragarh Venus 2025 page: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?time-format=12hour&year=2025 — March 20 18:42, March 23 05:40, Dec 11 06:25; page also reports Feb 2 2026 06:15 PM. Search capture: `turn823154search9`.
- इस page पर Drik कहता है कि वह location-based modern algorithm उपयोग करता है; Surya Siddhanta angular limits approximate हैं। Drik के hidden observer coordinates/atmospheric inputs प्रकाशित नहीं हैं, इसलिए comparison city-label-only है।
- 2026 October तथा 2027 Venus/Jupiter Pithoragarh rows को अब भी provisional मानें; exact named-city primary page capture उपलब्ध नहीं। New Delhi references से Pithoragarh की missing values कभी न भरें।

### अगला निर्णय

Swiss heliacal और fixed-angle candidates को production में promote नहीं करना है। अगला काम नए thresholds आज़माना नहीं, बल्कि Drik के प्रकाशित boundary labels की event-definition को स्वतंत्र रूप से समझना और उसी शहर के अतिरिक्त independently captured references जुटाना है। जब तक model दोनों boundary types और अनेक ग्रहों/वर्षों पर घोषित tolerance में नहीं आता, production output को बदलना नहीं है।


## 4 नवम्बर 2026 — Schaefer candidate की परिभाषा-जाँच (production से पहले अनिवार्य रोक)

प्राथमिक स्रोतों की जाँच के बाद Schaefer photometric visibility को सीधे Drik-जैसी Pañcāṅga Tara Asta/Udaya गणना मानना उचित नहीं है:

1. TKS की Udaya-Asta documentation स्वयं तीन परिणाम अलग रखती है: शास्त्रीय Pañcāṅga/combustion result, Ptolemaic arcus visionis, और Schaefer photometric naked-eye visibility। उसके अनुसार इनकी dates अलग हो सकती हैं क्योंकि event definitions अलग हैं।
2. Schaefer criterion वास्तविक आँख से दृश्यता का मॉडल है: extincted planetary magnitude बनाम twilight sky की limiting magnitude। इसमें observer, atmosphere, optics और sky contrast आते हैं। यह केवल ग्रह-सूर्य कोण की दूसरी गणना नहीं है।
3. MontuPython की heliacal-rise documentation भी स्पष्ट करती है कि heliacal event model, atmosphere, horizon, acuity और chosen time step पर निर्भर visibility prediction है; इसे geometric instant नहीं कहा जा सकता।
4. Swiss Ephemeris heliacal documentation visibility में position/magnitude, observer/optics, meteorology और sky-background contrast की dependencies बताती है।

**निर्णय:** Schaefer को Drik matching का अगला production candidate घोषित नहीं किया जाएगा। पहले Drik के Tara Asta/Udaya event labels का अर्थ और उसकी गणना की परिभाषा स्वतंत्र रूप से स्थापित करनी होगी। यदि Drik का प्रकाशित event वास्तव में naked-eye heliacal visibility निकले, तभी Schaefer को अलग diagnostic branch में जाँचें। यदि वह पंचांग-परंपरा का combustion/asta interval है, तो physical heliacal model को उस परिणाम से force-fit न करें।

### उपयोगी प्राथमिक/तकनीकी स्रोत

- TKS Udaya-Asta model definitions: https://tksephemeris.com/tks-udaya-asta
- Swiss Ephemeris, chapter 5.1 (heliacal visibility factors and functions): https://www.astro.com/swisseph/swisseph.htm
- Bradley E. Schaefer, “Astronomy and the limits of vision” (1993): https://doi.org/10.1016/0083-6656(93)90113-X
- MontuPython, “The Heliacal Rise of Sirius, Step by Step” (model definitions and worked methodology): https://montupythob.readthedocs.io/en/latest/examples/MontuPython-HeliacalRises.html

### Revised immediate next step

Do not write another candidate engine yet. First capture Drik's own explanation/FAQ and a controlled set of same-city event pairs for Venus, Mercury, Mars, Jupiter and Saturn, including the event labels (morning/evening, first/last) and retrograde state. Compare those labels with the ephemeris geometry at the published boundary. This distinguishes a Panchanga Asta rule from a naked-eye heliacal visibility event. Only then select the correct mathematical model and implement it. This prevents another round of parameter tuning against the wrong physical quantity.


## 5 नवम्बर 2026 — Drik event-pairing evidence और horizon-method की सीमा

आज की source capture से model selection के लिए दो उपयोगी तथ्य मिले हैं:

### Drik के प्रकाशित event windows: पाँच ग्रहों के अलग व्यवहार

एक ही published city label (New Delhi) के 2026 pages पर Drik निम्न उदाहरण देता है:

- **Budha/Mercury:** सात अलग Asta windows; उपलब्ध page पर 2 Jan–5 Feb, 1–18 Mar, 27 Apr–23 May, 30 Jun–25 Jul, 18 Aug–18 Sep, 25 Oct–11 Nov और 14 Dec–19 Jan 2027 के pairs हैं।
- **Mangal/Mars:** 1 Nov 2025–2 May 2026 का एक लम्बा interval।
- **Guru/Jupiter:** 15 Jul–12 Aug 2026।
- **Shani/Saturn:** 13 Mar–22 Apr 2026।
- **Shukra/Venus:** 11 Dec 2025–1 Feb 2026 और 12–29 Oct 2026।

स्रोत पृष्ठ:
- Mercury: https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?lang=en
- Mars: https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html
- Jupiter: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?lang=en
- Saturn: https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html?year=2026
- Venus: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?time-format=24hour

**गणना पर असर:** engine को किसी ग्रह के लिए प्रति वर्ष एक ही Asta pair मानकर नहीं चलना चाहिए। Mercury जैसे ग्रहों के कई disjoint intervals, year-boundary crossing और adjacent apparition pairing सम्भालनी होगी। Event stream को chronological और non-overlapping validate करें; किसी retrograde station पर अपने-आप नया interval शुरू न करें, जब तक source/model event definition ऐसा न कहे। ये published examples event topology बताते हैं, Drik का hidden mathematical algorithm नहीं।

### Horizon-crossing / kālāṃśa research: स्पष्ट रूप से अलग रखें

TathaAstu API की documentation एक अलग, स्पष्टतः **Sūrya Siddhānta IX.2–IX.9** आधारित पद्धति बताती है: सूर्य और ग्रह के horizon crossings के बीच समय-अंतर (kālāṃśa) को शास्त्रीय सीमा से तुलना करना। वह स्वयं कहती है कि यह ecliptic longitude separation या chart-combustion orb नहीं है और स्थान बदलने पर परिणाम बदलता है।

यह एक उपयोगी conceptual distinction है—पर **यह Drik के modern algorithm का प्रमाण नहीं** है। चूँकि परियोजना का निर्णय है कि Sūrya Siddhānta K/C production scope से बाहर रहेगा, TathaAstu implementation को production candidate या acceptance oracle नहीं बनाया जाएगा। इसे केवल historical-method reference के रूप में cite करें।

स्रोत: https://docs.tathaastuapi.com/

एक अलग third-party methodology page (AstroLogics) अपने New Delhi Drik comparisons में कुछ ग्रह/अवधियों के लिए 1–13 दिन तक boundary differences बताती है और स्पष्ट कहती है कि उसकी fixed-orb periods Drik से लम्बी हो सकती हैं। यह independent primary evidence नहीं है, लेकिन एक उपयोगी warning है: approximate angular limits को Drik-equivalent मान लेना सुरक्षित नहीं। इसे acceptance dataset में न जोड़ें।
स्रोत: https://developers.astrologics.in/docs/vedic-additions

### निर्णय और अगला तकनीकी कदम

1. Drik के प्रत्येक ग्रह के लिए कम-से-कम दो वर्षों के complete event windows capture करें—केवल एक start/end pair नहीं।
2. हर window को apparition sequence, morning/evening geometry, direct/retrograde motion, superior/inferior conjunction और source city के साथ tag करें।
3. Published boundary instants पर pinned ephemeris से geocentric और topocentric geometry अलग-अलग निकालें; यह diagnostic है, model proof नहीं।
4. एक ही event-pairing rule सभी captured cases पर लागू करके देखें। यदि event topology ही reproduce नहीं होती, threshold optimization शुरू न करें।
5. New Delhi और Pithoragarh को अलग benchmark groups रखें। New Delhi के source times को Pithoragarh observer पर कभी न चलाएँ।

**स्थिति:** कोई नया production formula स्वीकृत नहीं। Fixed-angle और Swiss heliacal candidates पहले ही accuracy gate में असफल हैं; Schaefer physical-visibility model Drik event definition के प्रमाण के बिना अगला candidate नहीं है। Production output provisional ही रहेगा।


### 2027 New Delhi capture — multi-window pattern की पुष्टि

5 नवम्बर की अतिरिक्त primary-page capture से:

- **Budha/Mercury:** सात windows; इनमें 13 Dec 2026 30:20+ से 19 Jan 2027 18:39 वाला year-crossing pair, फिर 12–26 Feb, 8 Apr–8 May, 12 Jun–7 Jul, 2–29 Aug, 6–26 Oct और 24 Nov 2027–2 Jan 2028 शामिल हैं। स्रोत 24+ hour notation में है; raw notation को सुरक्षित रखा गया है, normalization अलग स्पष्ट रूप से करना होगा।
- **Guru/Jupiter:** 17 Aug 2027 19:32 से 13 Sep 2027 05:22।
- **Shani/Saturn:** 26 Mar 2027 19:21 से 5 May 2027 04:36।
- **Shukra/Venus:** 21 Jul 2027 05:08 से 9 Sep 2027 19:00।
- **Mangal/Mars:** 2027 का named-city capture अभी इस pass में प्राप्त नहीं हुआ; इसे missing ही रखें।

स्रोत:
- Mercury: https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?time-format=24plushour&year=2027
- Jupiter: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2027
- Saturn: https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html?year=2027
- Venus: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?geoname-id=1261481&year=2027

ये सभी New Delhi city-label references हैं; इन्हें Pithoragarh observer या Pithoragarh acceptance group में न डालें। Provider की exact coordinates/elevation अब भी disclosed नहीं हैं। 24+ hour times को बिना source-day convention समझे UTC/IST instant में convert न करें; source raw string और normalized instant दोनों साथ रखें और conversion rule audit करें।

**Research consequence:** multi-window support अब केवल edge case नहीं, Drik के Mercury data में recurring structure है। Event pairing को apparent solar conjunction / apparition sequence के आसपास independently investigate करना होगा; retrograde status अकेले pair boundary का पर्याप्त selector सिद्ध नहीं हुआ है।


## 5 नवम्बर 2026 — Mercury 24+ source-time normalization और structured ledger

Drik के New Delhi Mercury pages के 24+ hour notation को अब केवल prose में नहीं, benchmark JSON में raw तथा normalized दोनों रूपों में सुरक्षित किया गया है:

- 2026 page: सात windows; उदाहरण 2026-01-01 30:29+ → civil local instant 2026-01-02 06:29 IST।
- 2027 page: सात windows; इसमें Dec 2026–Jan 2027 और Nov 2027–Jan 2028 year-crossing intervals शामिल हैं।
- दोनों annual pages पर Dec 2026–Jan 2027 का साझा interval एक ही normalized start/end पर आता है; dataset इसे duplicate event के रूप में पहचानने योग्य रखता है, लेकिन दोनों source-page provenance सुरक्षित हैं।
- Source page स्वयं कहता है कि 24:00 से आगे के घंटे अगले civil दिन पर आते हैं और Panchang day sunrise से sunrise तक है।

**डेटा नीति:** panchangDate, rawLocalTime, normalizedLocal, annual page year और sequence अलग fields हैं। Normalization में hour ≥24 होने पर 24 घटाकर civil date में एक दिन जोड़ा जाता है। Raw source string कभी overwrite नहीं होती। सभी records New Delhi city-label-only हैं; provider coordinates/elevation उपलब्ध नहीं।

फ़ाइलें:
- data/asta-udaya-benchmark.json — 14 annual-page entries, 7 + 7 windows, explicit normalized local instants।
- tests/asta-udaya-benchmark.test.mjs — नए tests: दोनों वर्षों में सात-सात windows, chronological order, non-overlap, timezone, 24+ conversion और annual-page shared-boundary identity।

**सावधानी:** ये timestamps Drik की published events का normalized source ledger हैं; ये हमारे ephemeris model की गणना या Drik formula की खोज नहीं हैं। किसी candidate model का accuracy result इससे सिद्ध नहीं होता।


## 5 नवम्बर 2026 — New Delhi multi-planet source ledger का विस्तार

Mercury के 2026–2027 multi-window records के अतिरिक्त Drik के New Delhi pages से Venus, Jupiter, Saturn और Mars के उपलब्ध 2026–2027 event windows भी structured JSON में जोड़े गए:

- Venus: 2026 में दो windows (एक 2025–26 year-crossing), 2027 में एक window।
- Jupiter: 2026 और 2027 में एक-एक window; 24+ hour end times को अगले civil दिन में normalize किया गया।
- Saturn: 2026 और 2027 में एक-एक window; 2027 का 28:36+ end अगले civil दिन 04:36 IST है।
- Mars: 2026 page पर 1 Nov 2025–2 May 2026 का interval। 2027 Mars page इस capture pass में सत्यापित नहीं हुआ; JSON में empty stream और not-captured metadata है—कोई अनुमान नहीं।

सभी New Delhi entries city-label-only हैं। Drik provider coordinates/elevation अज्ञात हैं। ये windows source ledger और event-stream architecture के लिए हैं, ephemeris accuracy acceptance नहीं।

Regression coverage `tests/asta-udaya-benchmark.test.mjs` में बढ़ाई गई। Browser diagnostics workflow के path filters में benchmark JSON और test file जोड़े गए ताकि केवल data/test बदलाव होने पर भी validation workflow चल सके।


## 5 नवम्बर 2026 — IMD Heliacal Rising/Setting का अलग reference ledger

Rashtriya Panchang / Positional Astronomy Centre की 2026–27 Heliacal Rising and Setting table से Central Station of India के लिए 20 event timestamps अलग event-family में benchmark JSON में दर्ज किए गए हैं:
- बुध: 13 eastern/western set/rise events
- शुक्र: 2 events
- मंगल: 1 event
- गुरु: 2 events
- शनि: 2 events

मूल प्रकाशित event date और raw IST time दोनों सुरक्षित हैं। 24:18, 25:49, 26:54 और 24:38 जैसी values को अगले civil date में normalize किया गया है; raw source notation नष्ट नहीं की गई। उदाहरण: 13 Sep 2026 26:54 → 14 Sep 2026 02:54 IST।

**महत्वपूर्ण सीमा:** ये IMD के heliacal rising/setting events हैं—Drik Tara Asta/combustion की start/end boundaries नहीं। इसलिए इन्हें Drik exact-time MAE, threshold fitting या city-level Drik acceptance में शामिल करना निषिद्ध है। इनका उपयोग event topology, morning/evening/east/west sequence और broad independent astronomical cross-check के लिए होगा। स्रोत Central Station है; New Delhi, Pithoragarh या किसी अन्य शहर के समय के रूप में न दिखाएँ।

स्रोत: https://packolkata.imd.gov.in/panchang/en/helical

## 5 नवम्बर 2026 — Pithoragarh Drik capture blocker

Pithoragarh का Drik city geoname id `1259503` अन्य Drik pages में पुष्ट है और Venus 2025 Asta page खोज परिणाम में दोनों boundaries सहित उपलब्ध है। लेकिन इस capture pass में Pithoragarh के Mercury 2026, Venus 2026 और Jupiter 2027 named-city planetary Asta URLs सीधे retrieve नहीं हुए (page access internal error)। इन्हें `not-captured/inaccessible` माना जाएगा; New Delhi data से भरना या अनुमान लगाना मना है। अगले capture प्रयास में Drik city selector/browser route या indexed search snippets से पुनः जाँच करें।

सहायक city evidence:
- Pithoragarh 2025 Venus Asta: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?time-format=12hour&year=2025
- Pithoragarh geoname ID evidence: https://www.drikpanchang.com/vrats/pradoshdates.html?geoname-id=1259503
- Pithoragarh sidereal planetary positions page: https://www.drikpanchang.com/planet/position/planetary-positions-sidereal.html?lang=hi&time=01%3A18%3A57

इनमें से planetary positions page location context देता है, Asta boundary data या Drik's internal observer coordinates नहीं। इसे अलग evidence समझें।


## 5 नवम्बर 2026 — शहरवार स्रोत-कवरेज tracker

`data/asta-udaya-benchmark.json` में `cityCoverage` जोड़ा गया है। इसमें 15 प्राथमिक शहर, लक्ष्य वर्ष 2026–2028, captured page/window counts, inaccessible URLs और not-captured pages अलग दर्ज हैं। New Delhi के उपलब्ध 2026–2027 streams तथा Pithoragarh Venus 2025 capture दर्ज हैं। New Delhi Mars 2027 को missing रखा है; Pithoragarh Mercury/Venus 2026 और Jupiter 2027 के direct-page access blockers स्पष्ट हैं। शेष शहरों के लिए status अभी not-started है—इसे शून्य घटनाएँ न समझें। Coverage tracker केवल source collection progress है, algorithm accuracy का प्रमाण नहीं।


## 5 नवम्बर 2026 — Ujjain का स्वतंत्र longitude-combustion comparator

Divine Nakshatra के 2027 Ujjain पृष्ठ से longitude-based Asta windows का अलग ledger जोड़ा गया है: बुध के 7 windows (पहला और अंतिम partial), शुक्र 1, गुरु 1, शनि 1। मंगल के लिए इस page पर longitude-Asta window सूचीबद्ध नहीं है; इसे universal no-Asta निष्कर्ष नहीं माना जाएगा। स्रोत अपने fixed sidereal longitude thresholds (बुध 14°/12°, शुक्र 10°/8°, मंगल 17°/8°—मंगल का retrograde 8° source के अनुसार अभी unchecked, गुरु 11°, शनि 16°) और Surya Siddhanta Ujjain twilight events को अलग बताता है।

यह dataset **Ujjain city-label-only, longitude-combustion comparator** है। इसे Drik Tara Asta या IMD heliacal rising/setting के साथ एक ही error metric में न मिलाएँ। Partial windows में अनुपलब्ध boundary null है। यह Gemini के fixed-angle विचार को अलग source पर परखने के लिए उपयोगी है, पर इससे Drik algorithm सिद्ध नहीं होता।

स्रोत: https://divinenakshatra.com/graha/2027/


## 5 नवम्बर 2026 — Chennai Drik Jupiter 2027 cross-city capture

Drik search-indexed page पर Chennai के लिए Guru Tara Asta 19 Aug 2027 19:00 IST से 13 Sep 2027 05:21 IST तक दिखता है। यह New Delhi Jupiter 2027 के 17 Aug 2027 19:32 से 13 Sep 2027 05:22 से अलग city-label observation है। इसे अभी strict acceptance में शामिल नहीं किया गया, क्योंकि indexed result की heading 2027 कहती है लेकिन URL query में `year=2028` है और direct page open इस capture में inaccessible रहा। मूल URL/query anomaly जस की तस सुरक्षित है; page को पुनः खोलकर पुष्टि के बाद ही acceptanceEligible किया जा सकता है।

स्रोत: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2028


## 5 नवम्बर 2026 — Drik-only शहर-कवरेज को अलग किया

पिछले `cityCoverage` में अन्य source families की coverage भी साथ दिखाई दे रही थी। इससे Ujjain के Divine Nakshatra longitude data को गलती से Drik city coverage समझे जाने का जोखिम था। इसे रोकने के लिए `drikOnlyCoverage` अलग जोड़ा है:
- New Delhi: Mercury 2026/27, Venus 2026/27, Jupiter 2026/27, Saturn 2026/27, Mars 2026 — captured, city-label-only.
- Pithoragarh: Venus 2025 — historical city-label-only; target-year 2026/27 coverage नहीं।
- Chennai: Jupiter 2027 — केवल search-index result; heading 2027 और URL query `year=2028` में विरोध, इसलिए provisional.
- Ujjain: Drik के पाँच ग्रहों के 2027 direct URLs (`geoname-id=1253914`) इस capture में inaccessible; इसे Divine Nakshatra के अलग Ujjain data से नहीं भरेंगे।
- Pithoragarh target-year planetary pages: अभी verified नहीं।

नई regression test सुनिश्चित करती है कि Drik-only सूची में IMD/Divine Nakshatra source IDs न आएँ और Chennai query-year anomaly strict capture न बने। यह छोटा लेकिन महत्वपूर्ण data-governance सुधार है: आगे की तुलना केवल समान source family और स्पष्ट city/year provenance के साथ होगी।


## 5 नवम्बर 2026 — TRAC New Delhi 2027 बनाम Drik New Delhi: signed boundary audit

TRAC Astrology के 2027 combustion page से बुध के 7, शुक्र/गुरु/शनि के 1-1 windows लेकर उसी New Delhi city-label वाले Drik 2027 windows से start/end signed deltas निकाले गए। तुलना `data/asta-udaya-benchmark.json` के `comparisons.trac-vs-drik-new-delhi-2027` में सुरक्षित है। Delta = Drik normalized local instant − TRAC published instant; positive का अर्थ Drik बाद में, negative का अर्थ पहले।

कुछ मुख्य अंतर:

| ग्रह / window | आरम्भ Δ | अन्त Δ |
|---|---:|---:|
| बुध 1 | +10,406 min | −5,772 min |
| बुध 2 | +328 min | +3,507 min |
| बुध 3 | −9,058 min | −3,888 min |
| बुध 4 | −3,431 min | +8,754 min |
| बुध 5 | +6,602 min | +4,308 min |
| बुध 6 | −10,595 min | +1,811 min |
| बुध 7 | +11,600 min | −3,876 min |
| शुक्र 1 | +20,666 min | −11,748 min |
| गुरु 1 | +1,430 min | −2,750 min |
| शनि 1 | +7,535 min | +13,917 min |

**निष्कर्ष:** एक ही शहर-लेबल और समान Lahiri/longitude-combustion भाषा होने पर भी सभी ग्रहों/विंडो में अंतर एक जैसा नहीं है। अतः Gemini के fixed angles को Drik पर fit करके सीधे अपनाना उचित नहीं। पहले event semantics, exact observer coordinates/elevation, ephemeris, retrograde rule, angular metric (longitude बनाम 3D separation), तथा source day/time convention की पुष्टि चाहिए। TRAC और Ujjain comparator के कुछ values अत्यधिक समान हैं; इनके upstream engine की स्वतंत्रता सिद्ध नहीं, इसलिए इन्हें दो independent votes नहीं गिनेंगे।

TRAC स्रोत: https://www.tracastrology.com/Panchang/combustion?year=2027
Drik Mercury 2027 स्रोत: https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?time-format=24plushour&year=2027

यह comparison मात्र प्रकाशित timestamps का descriptive audit है। Drik coordinates अघोषित हैं, इसलिए अभी इसे exact same-observer scientific error score नहीं कहेंगे।


## 5 नवम्बर 2026 — Ujjain का दूसरा स्वतंत्र Tara Asta स्रोत

VedicTithi के 2027 Ujjain पृष्ठ से दो city-labelled windows दर्ज किए:
- शुक्र: 22 जुलाई 2027 05:26 IST → 6 सितम्बर 2027 19:04 IST
- गुरु: 18 अगस्त 2027 19:29 IST → 13 सितम्बर 2027 05:31 IST

पृष्ठ Vedic sidereal (Lahiri) और Ujjain का उल्लेख करता है, पर सटीक ephemeris, event threshold, computational method, source lineage और observer coordinates प्रकाशित नहीं करता। इसलिए इसे `third-party-tara-asta-method-undisclosed` comparator के रूप में रखा है—न Drik, न Divine Nakshatra longitude threshold, न IMD heliacal data। इसे strict accuracy/threshold fitting में नहीं मिलाएँ।

यह Ujjain में independent source disagreement देखने में मदद करता है: VedicTithi के शुक्र/गुरु windows को Ujjain के longitude-based output और New Delhi Drik city-label values के साथ केवल contextually compare किया जा सकता है; exact same-city Drik Ujjain data अभी उपलब्ध नहीं। Regression test source/method separation और timestamps जाँचता है।

स्रोत: https://vedictithi.com/astrology-events/combustion/2027


### Ujjain के दो third-party outputs में अंतर — method-mixing से बचने का उदाहरण

2027 Ujjain के उपलब्ध outputs को केवल descriptive रूप से साथ रखने पर:
- शुक्र: Divine Nakshatra का longitude-window 6 जुलाई 20:39 → 17 सितम्बर 22:48; VedicTithi का प्रकाशित Tara-Asta 22 जुलाई 05:26 → 6 सितम्बर 19:04। आरम्भ में लगभग 15 दिन 8 घण्टे 47 मिनट और अंत में लगभग 11 दिन 3 घण्टे 44 मिनट का अंतर।
- गुरु: Divine Nakshatra longitude-window 16 अगस्त 19:43 → 15 सितम्बर 03:13; VedicTithi का Tara-Asta 18 अगस्त 19:29 → 13 सितम्बर 05:31। आरम्भ/अंत में लगभग 1 दिन 23 घण्टे 46 मिनट और 1 दिन 21 घण्टे 42 मिनट का अंतर।

ये अंतर **किसी एक स्रोत की त्रुटि सिद्ध नहीं करते**—दोनों के event definitions/algorithms समान प्रमाणित नहीं हैं। यही कारण है कि हम अलग source families को average नहीं करेंगे और एक के timestamps से दूसरे का threshold fit नहीं करेंगे। पहले semantics और गणना-पद्धति की पुष्टि, फिर same-city/same-event boundary comparison।


## 5 नवम्बर 2026 — Drik Jupiter 2027 का New Delhi बनाम Chennai स्थान-अंतर

Drik के search-indexed 2027 Guru Tara Asta परिणाम में Chennai के लिए 19 Aug 2027 19:00 से 13 Sep 2027 05:21 IST मिला। New Delhi के पहले से captured Drik window में 17 Aug 2027 19:32 से 13 Sep 2027 05:22 IST है। Chennai − New Delhi signed अंतर:
- आरम्भ: +2,848 मिनट (+1 दिन 23 घंटे 28 मिनट)
- अन्त: −1 मिनट

यह उपयोगी संकेत है कि Drik का Guru Asta start city label के अनुसार बदलता है, जबकि इस उदाहरण में end लगभग समान है। इससे किसी एक शहर का timestamp लेकर केवल sunrise offset जोड़ने वाला मॉडल अस्वीकार्य दिखता है। हालांकि दोनों पृष्ठों के exact observer coordinates/elevation अघोषित हैं और Chennai परिणाम search-indexed है; observed URL में `year=2028` जबकि page title/body 2027 कहता है। इसलिए इसे provisional named-city cross-check मानें, final coordinate-level proof नहीं।

स्रोत: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2028


### Drik Guru 2027 — पाँच अतिरिक्त शहरों का नमूना

New Delhi को reference रखकर अन्य Drik city-labelled results के अंतर भी जोड़े गए हैं (`comparisons.drik-jupiter-2027-multi-city-vs-new-delhi`):

| शहर | आरम्भ Δ | अन्त Δ |
|---|---:|---:|
| Chennai | +2,848 min | −1 min |
| Naksalbari | −46 min | −42 min |
| Rajgarh | +1 min | +3 min |
| Athagarh | +1,396 min | −28 min |
| Taleigao | +2,875 min | +23 min |

यह spread दिखाता है कि सभी शहरों में एक जैसा civil-time offset लगाना पर्याप्त नहीं। फिर भी provider observer coordinates उपलब्ध न होने और कुछ search-indexed URLs में page-year/query-year mismatch होने के कारण इन शहरों को coordinate-grade calibration set नहीं मानेंगे। हर शहर का source page और raw local time अलग संरक्षित है।

**CI correction note:** पहले cross-city regression में Chennai start delta को गलती से 4,308 मिनट लिखा गया था; सही timestamp subtraction +2,848 मिनट है। Failure logs से arithmetic mismatch पहचाना, expected value ठीक की, और नए multi-city regression assertions जोड़े। नया CI run ही corrected state का pass/fail निर्णायक होगा।


### Drik Venus/Mars 2027 अतिरिक्त city pages और explicit zero-event cases

- Khilchipur (Madhya Pradesh): Venus Asta 22 Jul 2027 05:22 → 6 Sep 19:02 IST.
- Alleppey (Kerala): Venus Asta का raw start `21 Jul 29:49+` है; normalize करके 22 Jul 2027 05:49 → 2 Sep 18:56 IST।
- Rahuri (Maharashtra) और Visakhapatnam (Andhra Pradesh): Mars 2027 pages स्पष्ट रूप से `Total Asta Days In Year = 0 Days` बताते हैं। इन्हें `captured-no-events` के रूप में दर्ज किया है—यह inaccessible या uncaptured page से अलग है।

यहाँ भी source URLs में कुछ `year` query values page title 2027 से अलग हैं; exact observed URL सुरक्षित है और direct canonical URL verification बाकी है। Zero-event result उसी शहर/ग्रह/वर्ष के लिए source का दावा है; इसे अन्य शहरों या अन्य गणना-पद्धति पर लागू न करें।


### Drik Venus 2027 — New Delhi बनाम Khilchipur/Alleppey

| शहर | आरम्भ Δ | अन्त Δ |
|---|---:|---:|
| Khilchipur | +1,454 min | −4,318 min |
| Alleppey | +1,481 min | −10,084 min |

यह भी दिखाता है कि केवल आरम्भ समय पर कोई एक offset लागू कर देने से अवधि/अन्त सही नहीं होंगे। अलग-अलग boundaries का स्थानानुसार बदलाव अलग है। इसे location-aware event engine की आवश्यकता का संकेत मानें; exact coordinates/elevation के अभाव में इसे भौतिक model का calibration नहीं मानेंगे। तुलना `comparisons.drik-venus-2027-multi-city-vs-new-delhi` में सुरक्षित है।


### Priority-city coverage accounting corrected

15 priority cities में से अभी 4 के लिए कम-से-कम एक named-city/source-family capture है: New Delhi, Chennai, Ujjain और Pithoragarh। शेष 11 शहरों का कोई capture अभी नहीं है। यह केवल city-level first-capture count है; चारों captured शहर भी 5 ग्रह × 3 वर्ष की पूरी matrix में covered नहीं हैं। Naksalbari, Rajgarh, Athagarh, Taleigao, Khilchipur, Alleppey, Rahuri और Visakhapatnam जैसे अतिरिक्त source cities को अलग sample के रूप में रखा गया है; वे priority-city count घटाते नहीं।


## 5 नवम्बर 2026 — TRAC fixed-angle boundary diagnostic का पहला परिणाम

CI run #98 में `tests/report-longitude-threshold-boundaries.mjs` ने TRAC के 2027 के 20 प्रकाशित boundaries पर apparent geocentric true ecliptic-of-date longitude gap जाँचा। Planet retrograde/direct स्थिति centered 12-hour geocentric longitude derivative से ली गई। प्रकाशित threshold rules (Mercury 14° direct/12° retrograde, Venus 10° direct/8° retrograde, Jupiter 11°, Saturn 15°) के विरुद्ध परिणाम:

| ग्रह | सीमाएँ | औसत absolute angle residual | अधिकतम absolute residual |
|---|---:|---:|---:|
| बुध | 14 | 0.001068° | 0.002735° |
| शुक्र | 2 | 0.000238° | 0.000465° |
| गुरु | 2 | 0.000528° | 0.000662° |
| शनि | 2 | 0.002089° | 0.002143° |

यह बहुत मजबूत संकेत है कि TRAC के प्रकाशित समय उसके बताए गए longitude-threshold rules से संगत हैं। पर यह केवल TRAC source की internal consistency है; Drik algorithm की पुष्टि नहीं। TRAC और Divine Nakshatra के कुछ परिणाम पहले से लगभग समान हैं, इसलिए upstream independence अज्ञात है। अगला चरण उसी threshold model से boundary roots निकालकर TRAC के minute timestamps से time residual मापना है; फिर अलग Drik data पर बिना threshold refit किए holdout comparison करना होगा।


## 5 नवम्बर 2026 — Mumbai Vivaha downstream state cross-check

Drik Panchang के Mumbai 2027 Vivaha calendar से चार day-level states अलग ledger में सुरक्षित किए गए:

| ग्रह | स्थिति | आरम्भ | अन्त |
|---|---|---|---|
| शुक्र | Tara Asta | 21 Jul 2027 | 5 Sep 2027 |
| शुक्र | Shishutva | 6 Sep 2027 | 8 Sep 2027 |
| गुरु | Tara Asta | 9 Sep 2027 | 12 Sep 2027 |
| गुरु | Shishutva | 13 Sep 2027 | 15 Sep 2027 |

स्रोत: https://www.drikpanchang.com/shubh-dates/shubh-marriage-dates-with-muhurat.html?geoname-id=1275339&year=2027

यह downstream Vivaha-calendar classification है, minute-level Asta/Udaya timestamp नहीं। इसलिए इसे `downstreamCalendarCrossChecks` में रखा है; `eventWindows`, exact-time benchmark cases, MAE या model fitting में शामिल नहीं किया। Asta और Shishutva अलग states हैं—इन्हें एक boolean में collapse नहीं करना है। यह source transition/order की जाँच में उपयोगी है, लेकिन exact astronomical boundary का प्रमाण नहीं।


## 5 नवम्बर 2026 — Pithoragarh place-reference coordinate cross-check

SunsetToday का Pithoragarh पृष्ठ GeoNames ID `1259503` के साथ अपना calculation point `29.5835° N, 80.2095° E` बताता है। यह OurHinduDharm के project-selected observer `29.5828° N, 80.2182° E, 1650 m` से लगभग 0.84 km क्षैतिज दूरी पर है।

यह केवल locality/point-identity cross-check है:
- SunsetToday का point Drik के internal observer coordinates नहीं है।
- वहाँ elevation नहीं दिया गया है।
- इसे project observer के स्थान पर स्वतः लागू नहीं करना है।
- इससे किसी ग्रह के अस्त/उदय समय की पुष्टि नहीं होती।

इसलिए इसे `locationReferenceChecks` में रखा है और `acceptanceEligible:false` है। इससे एक उपयोगी बात स्पष्ट होती है: Pithoragarh नाम/GeoNames ID एक हो सकता है, पर अलग सेवाओं के चुने हुए calculation points समान होना आवश्यक नहीं। स्रोत: https://sunsettoday.in/uttarakhand/pithoragarh

## 5 नवम्बर 2026 — Pithoragarh 2025 Drik source URL reproducibility caveat

Pithoragarh Venus 2025 के indexed search result में शीर्षक और local timestamps Pithoragarh के नाम से स्पष्ट हैं। लेकिन उसी result URL को सीधे खोलने पर page ने New Delhi का data render किया; event URL में `geoname-id` मौजूद नहीं है। इसलिए:

- 20 Mar 2025 18:42 → 23 Mar 2025 05:40 और 11 Dec 2025 06:25 → 2 Feb 2026 18:15 को केवल **indexed city-label references** माना जाएगा।
- ये चार boundaries city-label comparison के लिए उपयोगी हैं, पर reproducible canonical-page capture या coordinate-grade validation नहीं हैं।
- इन्हें अभी हटाया नहीं गया है, क्योंकि provider search result स्वयं Pithoragarh नाम और timestamps देता है; लेकिन confidence/acceptance level को इससे ऊपर नहीं बढ़ाया जाएगा।
- अगला सही कदम Drik UI में Pithoragarh चुनकर event page का ऐसा URL/session capture करना है जिसमें city selector स्थिर रहे। केवल `geoname-id=1259503` monthly Panchang selector को planet event page पर मान लेना पर्याप्त नहीं।

## 5 नवम्बर 2026 — Pithoragarh Drik city selector की पहचान

Drik के indexed monthly Panchang से Pithoragarh का provider city ID `geoname-id=1259503` सत्यापित हुआ:

https://www.drikpanchang.com/panchang/month-panchang.html?geoname-id=1259503

यह पहले की तुलना में उपयोगी सुधार है: अब ग्रह-अस्त पृष्ठों को सही Drik city selector ID के साथ पुनः खोलने का स्पष्ट आधार है। लेकिन इस retrieval में उसी ID के साथ Guru/Shukra planet-Asta URLs ने access error दिया। इसलिए अभी Pithoragarh 2026/2027 के exact Asta windows को उपलब्ध नहीं मानेंगे; coverage status `inaccessible` ही रहेगा, `captured-no-events` नहीं। City ID से Drik के अंदरूनी observer coordinates/elevation भी सिद्ध नहीं होते।

अगला retrieval प्रयास इसी ID को Drik के city selector में चुनकर canonical planet pages से raw local timestamps सुरक्षित करना है। किसी दूसरे शहर के समय को Pithoragarh पर लागू नहीं करेंगे।


## 5 नवम्बर 2026 — उपयोगकर्ता द्वारा उपलब्ध कराया गया Pithoragarh Drik Asta ledger (2024–2027)

उपयोगकर्ता ने Pithoragarh के Drik Panchang Tara Asta पृष्ठों से शुक्र, मंगल, बुध, गुरु और शनि के 2024–2027 के उपलब्ध start/end timestamps साझा किए। सभी 35 supplied interval occurrences को `data/asta-udaya-benchmark.json` में `drik-pithoragarh-user-transcribed-asta-2024-2027` source के अंतर्गत दर्ज किया गया है। प्रत्येक record में source page-year, raw local date/time, normalized IST instant, user-reported whole-day duration और endpoint से स्वतंत्र रूप से निकले exact elapsed minutes/days अलग रखे हैं।

**स्रोत-स्तर स्पष्ट रखा गया है:**
- शुक्र 2025 के दोनों intervals Drik के indexed Pithoragarh page से स्वतंत्र रूप से मेल खाते हैं: 20 Mar 2025 18:42 → 23 Mar 2025 05:40 और 11 Dec 2025 06:25 → 2 Feb 2026 18:15। Direct URL reproducibility की पुरानी समस्या अभी भी बनी है।
- बाकी 2024–2027 ग्रह/वर्ष entries उपयोगकर्ता द्वारा transcribed हैं; संबंधित named-city Drik page का स्वतंत्र पुनः-capture अभी नहीं हुआ। इन्हें `user-provided-transcription` और `acceptanceEligible:false` रखा है।
- Drik के observer coordinates/elevation अज्ञात हैं। Project observer coordinates को Drik के coordinates नहीं माना गया।

**Duration audit:** दिए गए हर interval का elapsed duration endpoints से मिनटों में निकाला गया। इस sample में Drik का reported whole-day duration हर interval के लिए `ceil(elapsed minutes / 1440)` से मेल खाता है। उदाहरण: शुक्र 2024 = 66.608 दिन → 67; शुक्र मार्च 2025 = 2.457 → 3; मंगल 2025–26 = 184.410 → 185। इसलिए reported duration को exact elapsed days न मानें; दोनों values अलग सुरक्षित हैं।

**Annual totals:** उपयोगकर्ता द्वारा दिए गए “साल में कुल अस्त के दिन” को page-reported summary के रूप में अलग रखा है, full-window durations के योग के रूप में नहीं। Cross-year interval दोनों annual pages पर दोहराया गया है तो वही astronomical interval है, दो अलग घटनाएँ नहीं। उदाहरण: शुक्र Dec 2025–Feb 2026, मंगल Oct 2025–May 2026 और बुध Dec 2026–Jan 2027।

**अभी अनुपलब्ध (शून्य अस्त नहीं):** मंगल 2027, बुध 2025, गुरु 2027 और शनि 2027 के लिए कोई data उपलब्ध नहीं कराया गया। इनकी metadata स्थिति `not-provided-by-user; not-zero-event` है और इनके लिए कोई empty event array बनाकर zero-event निष्कर्ष नहीं निकाला गया।

यह ledger अब Pithoragarh के लिए उपयोगी multi-planet holdout/reference set है। यह अपने-आप किसी formula को प्रमाणित नहीं करता; exact Drik page capture और स्वतंत्र astronomical model के विरुद्ध validation अभी बाकी है।


### Pithoragarh annual-total reconciliation warning

उपयोगकर्ता द्वारा दिए गए annual “कुल अस्त के दिन” को प्रत्येक event window के exact IST endpoints से Gregorian calendar year में overlap करके अलग से जाँचा। कुछ totals endpoint-overlap से मेल खाते हैं, लेकिन कुछ में स्पष्ट अंतर है:

| ग्रह-वर्ष | स्रोत annual total | दिए गए endpoints का वर्ष-अंदर exact overlap |
|---|---:|---:|
| शुक्र 2026 | 51 दिन | 49.249 दिन |
| बुध 2024 | 165 दिन | 159.972 दिन |
| बुध 2026 | 179 दिन | 173.703 दिन |
| बुध 2027 | 181 दिन | 175.963 दिन |

अन्य दर्ज annual totals भी ledger में गणना सहित सुरक्षित हैं। यह अभी स्रोत की गलती सिद्ध नहीं करता—Drik का annual day-count convention, day-boundary या transcription में कोई अतिरिक्त/छूटी अवधि हो सकती है। इसलिए reported annual total को overwrite नहीं किया गया और किसी inclusive/exclusive formula को मनमाने ढंग से लागू नहीं किया गया। इन mismatches को संबंधित Pithoragarh Drik annual pages के direct recapture में प्राथमिकता से सुलझाना है।


## 6 नवम्बर 2026 — Panchang Guru New Delhi Guru Asta, 2022–2030

Panchang Guru के live Guru Asta पृष्ठ से New Delhi के 2022–2030 तक नौ वार्षिक Guru Asta/Udaya intervals दर्ज किए गए हैं। 2027 का pair Drik New Delhi 2027 Guru pair से मिनट तक बिल्कुल समान है। इसे **published-output corroboration** मानें; दोनों providers के algorithm स्वतंत्र हैं, इसका प्रमाण उपलब्ध नहीं है।

Panchang Guru event semantics बताता है: Asta ग्रह के अस्त होने पर और Udaya ग्रह के पुनः उदय होने पर; गुरु को शुक्र की तुलना में अधिक अंधकार चाहिए, इसलिए अवधि केवल bare Sun–planet angular distance से अधिक हो सकती है और latitude/twilight से बदलती है। उसकी methodology page VSOP87 Sun, Meeus Moon और planetary orbital elements बताती है, लेकिन Guru Asta का सटीक twilight/visibility criterion या boundary-solving formula प्रकाशित नहीं करती।

इसलिए इन नौ intervals को अलग `panchang-guru-visibility-boundary` source family में रखा गया है:
- New Delhi city-label-only; provider coordinates/elevation अज्ञात।
- 2022–2030 के नौ intervals क्रमबद्ध और timezone-aware।
- 2027 Drik pair से exact output agreement दर्ज।
- Algorithm independence अज्ञात; इन्हें independent validation count या production acceptance gate में अभी शामिल न करें।

यह डेटा Guru visibility model के लिए held-out year comparisons और event-duration trend की जाँच में उपयोगी है; formula स्वयं इससे सिद्ध नहीं होता।

Sources:
- https://www.panchangguru.com/guru-asta
- https://www.panchangguru.com/how-we-calculate

## 6 नवम्बर 2026 — Panchang Guru Dehradun Guru Asta, 2022–2030

उपयोगकर्ता द्वारा Dehradun स्थान चुनकर साझा किए गए 2022–2030 के नौ Guru Asta/Udaya intervals को `data/asta-udaya-benchmark.json` में अलग `panchang-guru-dehradun-guru-asta-2022-2030` stream के रूप में दर्ज किया गया। Raw IST timestamps, स्रोत के duration labels और endpoints से निकले elapsed minutes अलग-अलग सुरक्षित हैं।

Dehradun और New Delhi के outputs को मिलाया नहीं गया है। उदाहरण: 2022 में Dehradun Udaya 28 मार्च 05:31, New Delhi 27 मार्च 05:37; 2027 में Dehradun Asta 16 अगस्त 19:34, New Delhi 17 अगस्त 19:32। 2027 Udaya क्रमशः 13 सितंबर 05:17 और 05:22 है। अतः स्थान-विशिष्ट परिणामों का अलग परीक्षण आवश्यक है।

Dehradun timestamps उपयोगकर्ता द्वारा दिए गए पृष्ठ से transcribed हैं; direct independent recapture अभी नहीं हुआ। Provider के exact observer coordinates/elevation और Guru Asta visibility threshold प्रकाशित नहीं हैं। इस कारण source `city-label-only`, `acceptanceEligible:false` है। इसे Pithoragarh का proxy या formula validation नहीं मानना है।

स्रोत: https://www.panchangguru.com/guru-asta ; https://www.panchangguru.com/how-we-calculate


## 6 नवम्बर 2026 — Drik प्राथमिक स्रोत की अतिरिक्त provenance

Drik Pithoragarh Venus 2025 indexed result (पृष्ठ शीर्षक में Pithoragarh, दोनों 2025 windows सहित) ने 6 नवम्बर को फिर पुष्टि की कि Drik आधुनिक combustion समय observer geolocation के आधार पर निकालता है। उसी पृष्ठ में Surya Siddhanta angular separation को approximate timing के रूप में अलग बताया गया है। Pithoragarh monthly Panchang URL में geoname-id=1259503 भी मिला।

- Event page: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?time-format=12hour&year=2025
- City identity: https://www.drikpanchang.com/panchang/month-panchang.html?geoname-id=1259503

इससे Drik की प्राथमिकता और geolocation-आधारित आधुनिक गणना का दावा मजबूत होता है; पर exact algorithm, threshold और provider observer coordinates/elevation अभी अज्ञात हैं। Event URL को direct reopen करने पर पहले New Delhi render हुआ था, इसलिए page-selector persistence अभी अप्रमाणित है। Dataset में इसे city-label-only रखा गया है; coordinate-exact acceptance का दावा नहीं है।

Panchang Guru Dehradun 2022–2030 rows secondary cross-check हैं और acceptanceEligible=false ही रहेंगी। किसी भी model को Drik के same-city published boundaries पर अलग-अलग signed errors, multiple planets/years और held-out cases के साथ जाँचना होगा। अलग event definitions या शहरों के समयों का averaging निषिद्ध है।

### 7 नवम्बर 2026 — Drik elevation setting: अतिरिक्त अनिश्चितता

Drik की सामान्य Settings page कहती है कि geographic elevation का उपयोग default रूप से Disabled है; इसे Enable करने पर elevation गणनाओं में शामिल होता है। Drik यह भी कहता है कि इस setting से Panchang/Muhurat timings, sunrise/sunset सहित, कुछ मिनट बदल सकते हैं।

स्रोत: https://www.drikpanchang.com/settings/drikpanchang-settings.html?lang=en

**सीमा:** यह सामान्य product-setting disclosure है; इससे यह सिद्ध नहीं होता कि Tara Asta/Udaya event pages इसी elevation toggle को किस प्रकार लागू करते हैं। इसलिए Drik के internal observer coordinates/elevation अभी भी अज्ञात हैं। Project Pithoragarh elevation 1650 m को Drik का elevation न मानें और model को elevation के आधार पर Drik से मिलाने के लिए मनमाने ढंग से न बदलें। इस evidence को केवल uncertainty/provenance note के रूप में रखा गया है, acceptance data या formula के रूप में नहीं।

### 7 नवम्बर 2026 — UI disclosure tightened

Draft branch के Planetary Asta/Udaya card में “दृश्य कोणीय सीमा” को “आभासी कोणीय सीमा” किया गया है। अंतिम disclosure अब स्पष्ट कहता है कि ये चयनित स्थान पर सूर्य–ग्रह की आभासी कोणीय दूरी से निकले अस्थायी गणितीय अनुमान हैं; वास्तविक दृश्यता और Drik के प्रकाशित समयों से मेल अभी प्रमाणित नहीं है। यह केवल भाषा/दावे की शुद्धता है—कोई threshold, ephemeris, event time, cache या production calculation rule नहीं बदला। extra-panchang.js का परिवर्तन अभी Draft PR में ही है; main पर लागू नहीं है।

### 7 नवम्बर 2026 — प्रकाशित सीमांत समयों पर स्थानीय क्षितिज-ज्यामिति

Draft diagnostic में प्रत्येक उपलब्ध Pithoragarh सीमा-समय पर project observer (29.5828° N, 80.2182° E, 1650 m) के लिए Astronomy Engine से topocentric apparent equatorial coordinates लेकर local horizontal coordinates निकाले गए। Horizon altitude में सामान्य atmospheric refraction लागू है; geometric altitude अलग दर्ज है। Drik के वास्तविक observer coordinates/elevation अज्ञात हैं, इसलिए ये Drik के internal coordinates पर गणना नहीं हैं।

64 deduplicated planet-boundary samples (पाँचों ग्रह; indexed 2025 Venus source + user-transcribed Pithoragarh rows) का सार:

| ग्रह | सीमाएँ | ग्रह की apparent altitude min / median / max | सूर्य की altitude min / median / max | सूर्य–ग्रह angular separation min / max |
|---|---:|---:|---:|---:|
| बुध | 38 | −0.0839° / +0.0066° / +0.0851° | −13.8218° / −10.8278° / −9.2166° | 9.447° / 24.5373° |
| शुक्र | 10 | −0.0524° / +0.0135° / +0.0593° | −6.7900° / −5.7407° / −4.9018° | 6.1107° / 19.1159° |
| मंगल | 4 | −0.0585° / +0.0667° / +0.0898° | −14.3663° / −12.9359° / −12.9089° | 18.7853° / 24.8891° |
| गुरु | 6 | −0.0845° / +0.0175° / +0.0296° | −9.6348° / −7.5519° / −7.2743° | 8.2073° / 13.1976° |
| शनि | 6 | −0.0396° / +0.0700° / +0.0834° | −13.0431° / −10.6171° / −10.0297° | 10.4895° / 24.8725° |

**प्रारम्भिक निष्कर्ष:** project observer पर सभी ग्रहों की published boundary instants पर apparent altitude लगभग 0° के आसपास है, जबकि angular separation ग्रह और event के अनुसार काफी बदलती है। यह fixed elongation threshold के बजाय local horizon / heliacal-visibility event family की ओर मजबूत संकेत है। ग्रह-विशिष्ट सूर्य depression भी बदलता है; इसलिए एक universal solar-altitude threshold या मनमाना per-planet constant अभी स्वीकार नहीं किया गया।

**सीमाएँ:** इस 64-sample set का बड़ा भाग user-transcribed है और independently page-verified नहीं; 2025 Venus के चार boundaries ही indexed Pithoragarh Drik page से corroborated हैं। Coordinates project proxy हैं, Drik observer नहीं। इस pattern को model proof, Drik algorithm disclosure या acceptance result न मानें। अगला वैज्ञानिक परीक्षण: source-verified multi-planet/multi-year boundaries, actual observer coordinate uncertainty, horizon-crossing instants plus twilight/planet-brightness criterion, और अलग years/cities पर held-out validation। कोई production threshold या output नहीं बदला।

### 7 नवम्बर 2026 — निर्णायक ज्यामितीय संकेत: सीमांत समय = स्थानीय ग्रह-उदय/अस्त

उसी 64 deduplicated Pithoragarh boundary sample पर अगला diagnostic किया गया। प्रत्येक प्रकाशित समय के आसपास सूर्य के azimuth से दिशा पहचानी गई (पूर्वी अर्धाकाश: ग्रह-rise; पश्चिमी अर्धाकाश: ग्रह-set), फिर Astronomy Engine 2.1.19 के SearchRiseSet से उसी observer पर अगला संबंधित ग्रह-क्षितिज crossing निकाला गया। SearchRiseSet सामान्य atmospheric refraction लागू करता है।

**परिणाम:** पाँचों ग्रहों के सभी 64 unique boundaries में प्रकाशित समय और स्थानीय planet rise/set instant का अंतर −1 से +1 मिनट के भीतर है; हर ग्रह का median अंतर 0 मिनट है। अलग-अलग ग्रहों का सार:

| ग्रह | सीमाएँ | rise/set अंतर min / median / max |
|---|---:|---:|
| बुध | 38 | −1 / 0 / +1 मिनट |
| शुक्र | 10 | −1 / 0 / +1 मिनट |
| मंगल | 4 | 0 / 0 / +1 मिनट |
| गुरु | 6 | −1 / 0 / +1 मिनट |
| शनि | 6 | −1 / 0 / +1 मिनट |

2025 के Pithoragarh Venus के चार indexed Drik boundaries भी इसी ±1 मिनट pattern में हैं। शेष 60 boundaries user-transcribed source rows हैं; वे independently page-verified नहीं हैं। सभी calculations project observer proxy (29.5828° N, 80.2182° E, 1650 m) पर हैं, Drik के undisclosed observer coordinates पर नहीं।

**कार्यकारी निष्कर्ष:** प्रकाशित boundary timestamp के लिए सबसे मजबूत candidate local planet rise/set instant है—न कि fixed Sun–planet angular-separation crossing। लेकिन इससे अभी Drik का internal algorithm सिद्ध नहीं होता। Asta/Udaya की शुरुआत/समाप्ति किस दैनिक rise/set को चुने, यह twilight visibility criterion तय करता हुआ प्रतीत होता है। Planet-specific Sun-altitude medians इस sample में लगभग बुध −10.83°, शुक्र −5.74°, मंगल −12.94°, गुरु −7.55°, शनि −10.62° हैं; इनके फैलाव के कारण इन्हें अभी fixed visibility thresholds नहीं बनाया गया है।

**अगला candidate model:** (1) पूरे apparition में local planet rise/set events की sequence निकालना; (2) हर crossing पर Sun altitude, planet apparent magnitude/brightness, azimuth separation और atmospheric visibility context निकालना; (3) अंतिम/प्रथम दृश्य crossing चुनना; (4) source-verified years/cities पर train और held-out validation करना। Arbitrary per-planet thresholds fit नहीं करने हैं। Existing fixed-angle और Swiss heliacal candidates diagnostic-only रहेंगे; production output/thresholds अभी अपरिवर्तित हैं।

### 7 नवम्बर 2026 — fixed twilight-threshold selector असफल

अगला exploratory test: हर boundary के लिए उसी ग्रह और उसी rise/set दिशा के अन्य apparitions से Sun apparent-altitude का median निकाला (leave-one-apparition-out), फिर target boundary के ±30 दिनों में daily local planet rise/set crossings में उस median के सबसे निकट crossing को चुना। यह threshold target apparition से train नहीं किया गया।

**नतीजा:** एक स्थिर planet+direction twilight threshold पर्याप्त नहीं है। Median absolute date/time error:

| ग्रह | Rise MAE median | Set MAE median | नमूना |
|---|---:|---:|---:|
| बुध | 2,884 मिनट | 1,443 मिनट | 19 + 19 |
| शुक्र | 1,434 मिनट | 4,319 मिनट | 5 + 5 |
| मंगल | उपलब्ध नहीं | उपलब्ध नहीं | दिशा-विशिष्ट independent training अपर्याप्त |
| गुरु | 1,437 मिनट | 1 मिनट | 3 + 3; set में max error 1,438 मिनट |
| शनि | 0 मिनट | 1 मिनट | 3 + 3; set में max error 1,436 मिनट |

कुछ छोटे sample medians भ्रामक हैं क्योंकि एक-दो outliers बहुत बड़े हैं; इसे सफल model न मानें। सभी thresholds उसी provisional city-label dataset से निकले हैं, इसलिए यह Drik validation नहीं है।

**निर्णय:** fixed planet-specific twilight-altitude constants भी अभी reject। Local planet rise/set timestamp component मजबूत है; अंतिम/प्रथम दृश्य crossing चुनने के लिए apparent magnitude/phase, Sun altitude, azimuthal separation, atmospheric extinction और observer conditions का संयुक्त visibility criterion जाँचना होगा। Swiss heliacal candidate भी पहले के परीक्षण में पर्याप्त सटीक नहीं था; अगली बार उसकी event-type/observer assumptions की audit करें, मनमाने parameter sweep से MAE कम करने की कोशिश न करें।

### 7 नवम्बर 2026 — Swiss heliacal model documentation audit

Official Swiss Ephemeris documentation confirms that its heliacal event engine is a separate physical-visibility model based on Schaefer (1993/2000), Reijs (2003), and Koch (2009). It accounts for apparent magnitude and celestial positions (Sun/Moon/object), topocentric observer location and height, observer acuity/optics, atmospheric extinction from pressure/temperature/humidity/visibility, and object-to-sky contrast. Its event search works near Sun rise/set and determines whether the object is visible there. It also documents limitations, including incomplete handling of Venus daytime visibility and unusual multi-visibility sequences at higher latitudes.

Source: https://ephe.scryr.io/swisseph/doc/swisseph.htm (sections 5.1.1–5.1.3; event types and limitations).

The current browser runner passes Swiss event types 1=Morning First, 2=Evening Last, 3=Evening First, 4=Morning Last; it records the returned beginning/optimum/end times separately. The high Drik mismatch therefore cannot be “fixed” by casually changing which output slot is read. Before another Swiss run, audit the pinned WASM wrapper's exported low-level visibility-limit API and compare the visibility threshold at the exact local planet rise/set instant. Do not change atmosphere/observer parameters solely to minimize the small current benchmark.

Swiss heliacal output remains a useful independent physical-visibility comparator, not the Drik acceptance model. Drik's local planet rise/set timestamp match and Swiss's visibility-start timestamp are distinct observables; the remaining selector must be identified with held-out, source-verified data.


## 8 नवम्बर 2026 — Swiss visibility-limit API audit और उत्पादन-लाइसेंस रोक

आज Swiss WASM wrapper के vis_limit_mag() API को source-level पर जाँचा गया। यह केवल heliacal event-date function नहीं है; किसी दिए हुए UTC instant पर local observer के लिए visibility threshold निकालता है। Wrapper से प्राप्त 10-element result में:

- [0]: limiting visual magnitude;
- [1], [2]: ग्रह की apparent altitude और azimuth;
- [3], [4]: सूर्य की altitude और azimuth;
- [5], [6]: चन्द्रमा की altitude और azimuth;
- [7]: ग्रह का computed apparent magnitude.

Object स्थानीय क्षितिज से नीचे होने पर C implementation status -2 लौटाती है; JS wrapper इसे null बनाता है। इस कारण केवल event date नहीं, बल्कि प्रकाशित सीमा से पहले/बाद के कई मिनटों पर limiting magnitude, ग्रह की ऊँचाई और visibility margin की profile बनाना सम्भव है। PR के browser diagnostic में दस मौजूदा Pithoragarh Venus/Jupiter boundaries के लिए −20, −10, −5, 0, +5, +10 और +20 मिनट के samples जोड़े गए हैं। यह अभी diagnostic है—Swiss का visibility model Drik की परिभाषा है, ऐसा कोई दावा नहीं।

### Source-level सावधानियाँ

1. Swiss C implementation के अनुसार heliacal search dret[0] में event beginning, dret[1] में optimum और dret[2] में visibility end देता है; इन slots को आपस में बदलकर benchmark fit नहीं करना है।
2. Swiss swe_heliacal_ut() सामान्यतः outer planets (Mars और आगे) के लिए Morning Last / Evening First (event type 3/4) को reject करता है, जब तक arcus-visionis mode न हो। Venus/Mercury और outer planets के event-type support को एक जैसा न मानें।
3. Pinned WASM wrapper की JS constants में AV-kind flag values, उसी source tree के C header के values से एक position shift दिखाती हैं। AV-kind flags उपयोग करने से पहले wrapper/header parity test आवश्यक है; अभी ऐसे flags का उपयोग न करें। मौजूदा runner का 2 | 256 flag combination AV-kind flags नहीं चुनता।
4. Visibility-limit profile में age/optics/atmosphere assumptions स्पष्ट दर्ज रहें। किसी एक छोटे sample का MAE घटाने के लिए इन्हें tune न करें।

### उत्पादन में Swiss Ephemeris उपयोग करने से पहले लाइसेंस निर्णय अनिवार्य

Pinned swisseph-wasm repository README wrapper को GPL-3.0-or-later बताता है और Swiss Ephemeris के लिए AGPL या Astrodienst Professional License का dual-licensing model बताता है; commercial use के लिए Astrodienst license आवश्यक बताया गया है। OurHinduDharm की monetized/public service में इसे production bundle या browser runtime में शामिल करने से पहले उपयुक्त license की लिखित पुष्टि/खरीद आवश्यक है। केवल research diagnostic होना production deployment की अनुमति नहीं देता। जब तक यह स्पष्ट न हो, Swiss को production engine dependency न बनाएं; research results को independent astronomical engine/Drik comparison के साथ अलग रखें।

स्रोत कोड: https://github.com/prolaxu/swisseph-wasm/blob/fe9065942986dd7a0cc3dada7d5396c87331198c/src/swisseph.js ; https://github.com/prolaxu/swisseph-wasm/blob/fe9065942986dd7a0cc3dada7d5396c87331198c/deps/swisseph/swehel.c ; https://github.com/prolaxu/swisseph-wasm/blob/fe9065942986dd7a0cc3dada7d5396c87331198c/deps/swisseph/swephexp.h ; https://github.com/prolaxu/swisseph-wasm/blob/fe9065942986dd7a0cc3dada7d5396c87331198c/README.md


## 8 नवम्बर 2026 — ग्रह-चमक और visibility-limit boundary profile के परिणाम

Astronomy Engine 2.1.19 के Illumination() से 64 deduplicated Pithoragarh boundary instants पर apparent visual magnitude, phase angle/fraction और heliocentric/geocentric distance जोड़े गए। परिणाम (ये 64 rows मुख्यतः user-transcribed हैं; केवल Venus 2025 की चार boundaries indexed Drik page से corroborated हैं):

| ग्रह | नमूने | apparent magnitude min–max | phase fraction min–max | boundary पर सूर्य altitude min–max |
|---|---:|---:|---:|---:|
| बुध | 38 | −1.3712 से +2.8530 | 0.0811–0.9631 | −13.8218° से −9.2166° |
| शुक्र | 10 | −4.4319 से −3.8563 | 0.0104–0.9943 | −6.7900° से −4.9018° |
| मंगल | 4 | +1.2334 से +1.7287 | 0.9762–0.9886 | −14.3663° से −12.9089° |
| गुरु | 6 | −1.9970 से −1.7812 | 0.9995–0.9998 | −9.6348° से −7.2743° |
| शनि | 6 | +0.7967 से +1.0854 | 0.9995–0.9999 | −13.0431° से −10.0297° |

यह पुष्टि करता है कि खासकर बुध और शुक्र के लिए apparent brightness/phase को स्थिर ग्रह-विशिष्ट constant से बदलना उचित नहीं। यह table event-selection formula नहीं है; ये प्रकाशित boundary instants पर calculated physical inputs हैं।

### Swiss vis_limit_mag() baseline profile

Swiss browser test ने दस Venus/Jupiter boundary rows पर प्रकाशित instant के −20, −10, −5, 0, +5, +10 और +20 मिनट के samples लिए। Baseline assumptions: pressure 1013.25 mbar, temperature 15°C, relative humidity 40%, meteorological range default, observer age 36, naked-eye optics, Moon/Sun effects enabled; कोई parameter fitting नहीं।

- प्रकाशित instant पर ग्रह local horizon के नीचे होने के कारण API ने null दिया।
- क्षितिज के ऊपर उपलब्ध samples में सभी visibility margins negative थे—अर्थात इस baseline model के अनुसार ग्रह की apparent magnitude उस समय की limiting magnitude से कमजोर थी।
- यह बात चार indexed Venus 2025 Drik boundaries पर भी दिखी; बाकी छह rows user-reported provisional हैं।
- उदाहरण: 2025 Venus March Asta-start पर −5 मिनट में margin −3.3370 mag; March Udaya boundary पर +10 मिनट में −1.0755 mag; December Asta-start पर +10 मिनट में −1.8244 mag; February Udaya boundary पर −10 मिनट में −1.8952 mag।

**इसका अर्थ:** Swiss/Schaefer naked-eye visibility event और Drik द्वारा प्रकाशित local planet rise/set timestamp एक ही observable नहीं हैं। ये परिणाम Swiss को Drik के विकल्प के रूप में अस्वीकार करने के पिछले निर्णय को और मजबूत करते हैं; लेकिन baseline atmosphere/observer assumptions को वास्तविक Pithoragarh conditions का प्रमाण न मानें।

### अगला गणना-चरण

अब selector को केवल fixed twilight altitude पर आधारित नहीं करना है। Candidate event stream में हर दिन के स्थानीय planet rise/set के साथ apparent magnitude, phase, Sun altitude, azimuth separation और Moon/atmospheric context को record करके event-day selection की जाँच करनी होगी। Source-verified same-city holdout cases के बिना इसे Drik-compatible या production-ready नहीं कहा जाएगा।

Browser diagnostic run: https://github.com/OurHinduDharm/Panchang/actions/runs/42462626495 (success; report and visibility-limit assertions passed). Main branch और production output अपरिवर्तित हैं।


## 9 नवम्बर 2026 — independently indexed Drik boundary बनाम local planet horizon: अलग acceptance test

आज 2025 Pithoragarh Venus के केवल चार independently indexed Drik boundary instants को बाकी user-transcribed references से अलग करके एक focused Node regression test बनाया गया: `tests/verified-horizon-crossing-check.mjs`.

### परीक्षण का दायरा
- Source: `drik-pithoragarh-2025-venus`; दो apparitions, कुल चार boundaries (20 Mar 2025 Asta-start, 23 Mar 2025 Asta-end, 11 Dec 2025 Asta-start, 2 Feb 2026 Asta-end)।
- Observer proxy: 29.5828° N, 80.2182° E, 1650 m — यह OurHinduDharm का selected Pithoragarh validation point है, Drik के undisclosed internal coordinates नहीं।
- Pinned engine: Astronomy Engine 2.1.19; दोनों दिशाओं के अगले स्थानीय planet rise/set events खोजकर प्रकाशित instant के सबसे निकट crossing चुनी जाती है।
- Tolerance: ±1 minute.
- अन्य 60 user-transcribed boundaries इस focused acceptance test में शामिल नहीं हैं। वे diagnostic-only रहेंगे।

### परिणाम का अर्थ
पिछले successful browser run में सभी 64 mixed-provenance rows का nearest local horizon crossing −1 से +1 minute के भीतर था। उस mixed total को independent validation बताना उचित नहीं था। अब test केवल चार indexed Drik boundaries को अलग gate करता है। यदि यह test pass होता है, तो इससे केवल इतना समर्थन मिलेगा कि इन चार Pithoragarh city-label reference times का event instant local planet rise/set crossing के बहुत निकट है। यह पूर्ण Drik algorithm, provider coordinate equality, सभी ग्रहों, या सभी वर्षों की पुष्टि नहीं है।

### IMD source-family safeguard
IMD Rashtriya Panchang 2026–27 के heliacal east/west rise/set records को benchmark में अलग event family में रखा गया है। उन्हें Drik Tara Asta-start/end के minute-level acceptance target में नहीं मिलाना है। IMD rows apparition direction/topology और independent heliacal context के लिए हैं।

### CI
नया focused test `.github/workflows/asta-udaya-phase-diagnostics.yml` में जोड़ा गया है। यह PR branch पर स्वतः चलना चाहिए। परिणाम आने तक कोई production promotion नहीं।


## 9 नवम्बर 2026 — horizon-crossing hypothesis को दिशा सहित जाँचना

पहले focused test में प्रकाशित boundary के निकटतम rise **या** set को स्वीकार किया जा सकता था। वह event-direction की पुष्टि नहीं करता था। अब test को मजबूत किया गया है: हर boundary के लिए अपेक्षित स्थानीय घटना अलग से तय है और उसी दिशा का crossing खोजा जाता है।

| Apparition | Asta-start | Asta-end |
|---|---|---|
| Venus, March 2025 (inferior-conjunction side) | स्थानीय अस्त / setting | स्थानीय उदय / rising |
| Venus, Dec 2025–Feb 2026 (superior-conjunction side) | स्थानीय उदय / rising | स्थानीय अस्त / setting |

दिशा-क्रम independent published Panchang Guru event labels (“at its setting” / “at its rising”) और Venus की morning/evening-star topology से लिया गया है; यह Drik की proprietary implementation का खुलासा नहीं है। Panchang Guru के प्रकाशित समय Drik से कुछ मिनट अलग हैं, इसलिए उन्हें Drik benchmark में मिलाया नहीं गया। संदर्भ: https://www.panchangguru.com/shukra-asta

नया regression अब केवल सही दिशा के local horizon crossing को ±1 मिनट के भीतर स्वीकार करेगा। यह पहले वाले nearest-either-direction test से अधिक कठोर है। फिर भी चार city-label-only samples से केवल Venus के दो apparitions पर geometric event correspondence का समर्थन मिलता है; पाँचों ग्रहों, हर apparition, या Drik के आंतरिक coordinates/algorithm की पुष्टि नहीं होती।

### अगला engineering निर्णय

यदि directed test सफल रहता है, तो अगला candidate fixed angular threshold या photometric visibility नहीं होगा। एक अलग, isolated event-selector बनाया जाएगा जो:
1. हर selected observer पर Mercury–Saturn के local rise/set events की समय-श्रृंखला निकाले;
2. Sun के local rise/set तथा planet–Sun conjunction/opposition topology से संबंधित Asta-start/Udaya boundary pair चुने;
3. morning/evening star phase और retrograde/direct motion को अलग रखे;
4. प्रत्येक candidate event पर source direction, signed timing error और event-pair duration दर्ज करे;
5. एक से अधिक ग्रहों और कम-से-कम दो वर्षों के independent same-city references पर holdout validation के बिना production output न बदले।

यह केवल event-selection hypothesis है, अभी approved production formula नहीं। Main Panchang, current published output और performance path अपरिवर्तित रहेंगे।


### महत्वपूर्ण परिशुद्धता: horizon event बनाम visibility-selection

Panchang Guru का अपना Shukra Asta पृष्ठ साफ़ कहता है कि प्रकाशित Asta/Udaya का clock-time शुक्र के **अपने rising या setting** का समय है; स्थान बदलने से समय बदलता है। उसी पृष्ठ पर New Delhi के 2025 March और Dec–Feb event labels भी दिए हैं। यह source Drik का प्रमाण नहीं है और इसके New Delhi clock-times को Pithoragarh benchmark में नहीं मिलाना है; इसका उपयोग केवल event semantics समझने के लिए है: https://www.panchangguru.com/shukra-asta

इससे एक जरूरी भेद निकलता है:
- **Boundary timestamp:** ग्रह का स्थानीय horizon rise/set instant.
- **कौन-सा दिन और कौन-सा rise/set चुना जाए:** ग्रह की सूर्य के पास स्थिति और twilight/visibility phase से तय होने वाला event-selection प्रश्न.

अतः अगले selector को conjunction के ठीक पहले/बाद का निकटतम rise/set नहीं चुनना चाहिए—Venus के 2025 Dec–2026 Feb उदाहरण में conjunction और प्रकाशित boundaries के बीच कई सप्ताह हैं। सही अगला diagnostic है कि apparition के दौरान हर स्थानीय ग्रह rise/set event की सूची बनाई जाए और उसी instant पर सूर्य की स्थानीय altitude, ग्रह की apparent magnitude/phase तथा Sun–planet separation दर्ज हों। फिर बिना arbitrary fitting के जाँचा जाए कि Asta-start और Udaya के प्रकाशित दिनों पर कौन-सा observable transition स्थिर रहता है।

पहले से दर्ज चार indexed Venus boundaries पर calculated solar altitude लगभग −6.79° से −4.90° के बीच थी। यह twilight-based selector की जाँच करने योग्य दिशा है, लेकिन चार samples से कोई universal −6° cutoff तय नहीं किया जा सकता। Mercury, Mars, Jupiter और Saturn के लिए अलग independent same-city references जरूरी हैं। Swiss/Schaefer photometric visibility को Drik का पर्याय मानना अभी भी गलत होगा।


### Directed crossing test result — 9 नवम्बर 2026

Pinned Astronomy Engine 2.1.19, Pithoragarh project observer proxy (29.5828° N, 80.2182° E, 1650 m), सही rise/set direction और ±1 minute tolerance के साथ सभी चार independently indexed Drik Venus 2025 boundaries सफल रहीं:

| Boundary | अपेक्षित घटना | स्थानीय crossing से signed अंतर |
|---|---|---:|
| 20 Mar 2025 Asta-start | setting | −0.351 min |
| 23 Mar 2025 Asta-end | rising | +0.148 min |
| 11 Dec 2025 Asta-start | rising | +0.459 min |
| 2 Feb 2026 Asta-end | setting | −0.318 min |

यह nearest-either-direction संयोग नहीं है: चारों बार event की सही दिशा भी मेल खाती है। फिर भी provider coordinates अज्ञात हैं और नमूना केवल शुक्र के दो Pithoragarh apparitions का है। इस परिणाम से अन्य ग्रहों के लिए threshold या event-selection rule extrapolate नहीं किया जाएगा।

अगला CI diagnostic अब उन्हीं चार instants पर local Sun altitude, planet altitude, apparent elongation, apparent magnitude और illuminated fraction अलग से record करता है। उद्देश्य visibility-phase selector के लिए observables की जाँच है—किसी एक solar-altitude cutoff को fit करना नहीं।


### Twilight profile — independently indexed Pithoragarh Venus 2025

नए diagnostic run में चारों boundary instants पर selected observer के अनुसार:

| Boundary | सूर्य altitude | शुक्र altitude | Sun–Venus elongation | apparent magnitude | illuminated fraction |
|---|---:|---:|---:|---:|---:|
| 20 Mar 2025 Asta-start | −4.90176° | +0.01352° | 9.43818° | −4.1902 | 0.013026 |
| 23 Mar 2025 Asta-end | −6.64495° | +0.05010° | 8.41461° | −4.2089 | 0.010359 |
| 11 Dec 2025 Asta-start | −5.91688° | +0.00129° | 6.40875° | −3.9273 | 0.994235 |
| 2 Feb 2026 Asta-end | −5.92394° | +0.02178° | 6.56739° | −3.9128 | 0.993959 |

यहाँ ग्रह की altitude लगभग शून्य है—स्थानीय horizon event की पुष्टि। सूर्य की altitude लगभग −4.9° से −6.65° है; चारों samples पर एक समान −6° hard cutoff सिद्ध नहीं होता। Venus की phase March apparition में लगभग 1% और December–February apparition में लगभग 99% है, जबकि apparent magnitude लगभग −4 के आसपास है। इसलिए सिर्फ elongation या सिर्फ magnitude भी पर्याप्त selector नहीं दिखता।

अब उसी expected rise/set direction में boundary से पाँच दिन पहले और पाँच दिन बाद के local events की twilight-series भी CI में record होती है। इसका उद्देश्य transition pattern देखना है; threshold fit करना नहीं।

Panchang Guru के स्वतंत्र source documentation में 550 planetary Asta events, चार शहरों के published-date comparison का उल्लेख है: 76.9% same-day और 93.5% within one day। वह यह भी कहता है कि ग्रह के visible होने का क्षण sky और observer पर निर्भर है। यह Drik का source नहीं है, लेकिन location/twilight sensitivity की स्वतंत्र पुष्टि और आगे के multi-city holdout dataset का उपयोगी स्रोत है। स्रोत: https://www.panchangguru.com/accuracy (Asta comparison), https://www.panchangguru.com/how-we-calculate (engine and observer methodology), https://www.panchangguru.com/guru-asta, https://www.panchangguru.com/shani-asta (event labels and twilight notes).

**निर्णय:** कोई −6° production threshold अभी स्वीकार नहीं। अगला चरण daily rise/set series के साथ source-verified Venus, Jupiter और Saturn multi-city events का holdout comparison है; Mercury और Mars के लिए भी primary source capture आवश्यक है।


### Twilight-threshold holdout — New Delhi (9 नवम्बर 2026)

Pithoragarh Venus के चार boundary transitions से निकला common interval (एक ही दिशा के पिछले और boundary-day local planet event के बीच सूर्य-altitude transition):

- Astronomy Engine refracted altitude: **(−5.85697°, −5.82432°]**
- geometric altitude: **(−6.46385°, −6.43144°]**

यह केवल चार Pithoragarh Venus samples का calibration interval है; −6° को exact universal threshold नहीं माना गया।

New Delhi city-centre proxy (28.6139° N, 77.2090° E, 216 m; provider coordinates नहीं) पर:
- Venus 2026 के दोनों boundaries और Venus 2027 Asta-start पर Pithoragarh Venus interval overlap हुआ।
- Venus 2027 Udaya-end पर overlap नहीं हुआ।
- Proxy local rise/set timestamps चारों New Delhi Venus boundaries पर published Drik time से −0.43 से −0.05 मिनट के भीतर थे; यह city-label-only comparison है, exact observer validation नहीं।
- Jupiter 2027 के दोनों boundaries पर proxy event times −0.03 और +0.04 मिनट के भीतर थे, लेकिन solar-altitude transition intervals शुक्र के interval से बहुत अधिक नीचे थे (refracted लगभग −7.12° से −9.57°)। इसलिए Venus threshold Jupiter पर लागू नहीं होता।

यह परिणाम **planet-specific twilight threshold** की दिशा को समर्थन देता है। Panchang Guru का Jupiter पृष्ठ स्पष्ट करता है कि Guru को Shukra से अधिक अँधेरा आकाश चाहिए; Shani पृष्ठ कहता है कि Shani, Guru से भी मंद है और उसे पुनः दिखने के लिए और गहरा आकाश चाहिए। ये provider descriptions हैं, Drik algorithm disclosure नहीं। स्रोत:
- Drik Venus 2026–27: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html
- Drik Jupiter 2027: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2027
- Panchang Guru Jupiter: https://www.panchangguru.com/guru-asta
- Panchang Guru Saturn: https://www.panchangguru.com/shani-asta

### नई multi-planet holdout सामग्री

- Saturn 2027 New Delhi: Drik और Panchang Guru दोनों में 26 Mar 2027 19:21 (setting) से 5 May 2027 04:36 (rising) समान। इसे city-label-only holdout बनाया।
- Mercury 2027 New Delhi: Drik की सात अलग-अलग Tara Asta windows जोड़ीं। 24+ hour notation (जैसे 29:52+) को अगले civil date पर 05:52 में बदला; raw-source provenance और timezone सुरक्षित रखे।
- इन नए records का source-catalog validation एक बार fail हुआ था क्योंकि Saturn के source catalog entry और Mercury के sourceId link छूट गए थे। दोनों ठीक कर दिए गए; current CI rerun में benchmark provenance/data validation success है।

अगला निष्कर्ष केवल तभी निकलेगा जब Mercury और Saturn holdout series भी pass हों। Main Panchang का visible output, production event code और performance path अभी अपरिवर्तित हैं।


### 10 नवम्बर 2026 — Mercury और Mars holdout विस्तार

New Delhi के लिए Drik के 2026 पृष्ठों से छह अतिरिक्त Mercury Asta windows और एक Mars Asta window जोड़ी गईं:

- **Mercury:** 2 Jan–5 Feb, 1–18 Mar, 27 Apr–23 May, 30 Jun–25 Jul, 18 Aug–18 Sep, 25 Oct–11 Nov 2026.
- **Mars:** 1 Nov 2025–2 May 2026; Drik के 2027 पृष्ठ पर Mars Asta अवधि शून्य है।

ये सभी city-label-only holdouts हैं; provider के internal coordinates उपलब्ध नहीं हैं। इन्हें Pithoragarh की गणना या exact-coordinate सत्यापन नहीं माना जाएगा। Source pages:
- https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html
- https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html
- https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html?year=2027

अब New Delhi holdout set में 2026–27 Mercury की 13 अलग-अलग windows, Jupiter 2027 की एक, Saturn 2027 की एक, Venus 2026/27 की दो और Mars 2026 की एक window शामिल हैं। हर event पर सही local rise/set direction अलग से दर्ज है।

पिछले 2027-only Mercury sample में apparent magnitude और twilight transition midpoint का Pearson correlation:
- Asta-start: r = −0.912 (n=7)
- Asta-end: r = −0.901 (n=7)

यह मजबूत exploratory association है, पर एक शहर/एक वर्ष के सीमित नमूने पर आधारित है। इसे fitted production formula नहीं मानना है। 2026 Mercury और Mars जोड़ने के बाद पुनः गणना और validation आवश्यक है।


### Event-family correction: Swiss heliacal moment बनाम Asta/Udaya clock time

10 नवम्बर की स्रोत-जाँच से एक महत्वपूर्ण methodological correction:

- Panchang Guru स्पष्ट करता है कि Asta/Udaya में प्रकाशित clock-time ग्रह का अपना स्थानीय rising या setting है; visibility window की शुरुआत/समाप्ति उस दिन के ग्रह-उदय/अस्त के साथ जोड़ी जाती है। स्रोत: https://www.panchangguru.com/shukra-asta (विशेषतः “moment given … own rising or setting”).
- Swiss Ephemeris का `swe_heliacal_ut()` first/last visibility का heliacal moment निकालता है; `swe_vis_limit_mag()` अलग से उस समय visibility के लिए limiting magnitude देता है। ये local horizon rise/set clock-time नहीं हैं। स्रोत: https://www.astro.com/ftp/swisseph/doc/swephprg.2.10.htm (sections 7.17–7.18).

इसलिए पहले Swiss output का Drik Asta/Udaya timestamp से minute-level MAE निकालना apples-to-oranges था। इसे अब ठीक किया गया:
- Swiss heliacal event और published boundary का **स्थानीय civil-date offset (days)** primary metric होगा।
- Swiss heliacal clock-time और planet rise/set clock-time का minute difference केवल diagnostic field है; इसे accuracy metric नहीं माना जाएगा।
- Swiss visibility model की date-level तुलना भी Drik algorithm की पुष्टि नहीं है; वह केवल स्वतंत्र candidate model का holdout test है।

चार independently indexed Pithoragarh Venus 2025 boundaries पर baseline Swiss scenario के date offsets क्रमशः −2, +2, −7 और +8 दिन थे (published sample का MAE 4.75 दिन)। इससे baseline Schaefer/Swiss visibility setup अभी published Asta/Udaya dates को पर्याप्त सटीकता से नहीं पकड़ता। Observer/atmosphere parameters को सिर्फ चार samples पर tune नहीं किया जाएगा।


### Mercury magnitude–twilight relationship: expanded holdout (2026–27)

Expanded New Delhi dataset में Mercury की 13 Asta-start और 13 Asta-end boundaries (2026 तथा 2027) पर:
- Asta-start apparent magnitude बनाम twilight-transition midpoint: **r = −0.875**.
- Asta-end: **r = −0.930**.

सिर्फ correlation पर निर्भर न रहकर year-wise holdout linear fit भी जाँचा:
- Asta-start: 2026 पर fit, 2027 पर test MAE **0.474°**, जबकि constant-threshold baseline **1.184°**; उलटी दिशा में MAE **0.498°** बनाम baseline **0.867°**.
- Asta-end: 2026→2027 MAE **0.500°** बनाम baseline **1.175°**; 2027→2026 MAE **0.335°** बनाम baseline **1.163°**.
- अधिकतम individual error **1.26°** तक रहा।

इससे Mercury के लिए apparent magnitude आधारित planet-specific twilight threshold एक उपयोगी candidate बनता है; पर यह अभी New Delhi city-centre proxy पर एक वर्ष से दूसरे वर्ष का fit है। Provider coordinates अज्ञात हैं, atmospheric assumptions सरल हैं, और date-level event prediction अभी अलग से validate होना बाकी है। इसे Pithoragarh या production में सीधे लागू नहीं किया जाएगा।


### Mercury date-level holdout prediction — 10 नवम्बर 2026

अगला चरण केवल threshold midpoint की regression नहीं रहा। 2026 और 2027 को अलग-अलग train/test रखकर magnitude model से स्थानीय ग्रह-उदय/अस्त event series में threshold residual crossing खोजी गई। हर held-out window में search केवल reference date के ±20 दिनों के diagnostic window में की गई; इसलिए इसे पूर्ण blind forecast नहीं, बल्कि **cross-year local-window holdout** कहा जाएगा।

परिणाम:
- **Asta-start:** 13 held-out boundaries में 5 exact-date, 7 एक दिन के भीतर, 1 दो दिन के भीतर। MAE लगभग **0.69 दिन**.
- **Asta-end:** 12 held-out boundaries में 8 exact-date, 3 एक दिन के भीतर, 1 तीन दिन के भीतर। MAE **0.50 दिन**.
- कुल 25 date predictions में 13 exact, 10 ±1 दिन, 1 ±2 दिन और 1 ±3 दिन; कुल MAE **0.60 दिन**.
- हर tested boundary के ±20 दिन में residual का एक ही crossing मिला; ambiguous multiple crossings नहीं आए।

यह पहली बार है जब fixed-angle rule के बजाय apparent-magnitude-dependent threshold ने दूसरे वर्ष के Mercury Asta/Udaya boundary dates को लगभग एक दिन की औसत त्रुटि में पुनः प्राप्त किया। फिर भी:
1. सभी references New Delhi city-label-only हैं; exact provider coordinates अज्ञात हैं।
2. search window reference date के आसपास रखी गई थी; यह पूर्ण स्वतंत्र future forecast नहीं है।
3. model अभी Mercury-only है; इसे Venus/Jupiter/Saturn/Mars पर लागू नहीं किया जाएगा।
4. Pithoragarh same-city Mercury holdout और अलग वर्ष/स्थान validation के बिना production में नहीं जाएगा।

**Engineering decision:** Mercury के लिए यह अब सबसे मजबूत candidate event-selector hypothesis है। अगला काम इसे Pithoragarh observer पर चलाना और उपलब्ध same-city references जुटाना है; बाकी ग्रहों के लिए अलग calibration जारी रहेगी।


### Global magnitude rule का leave-one-planet-out परीक्षण

सभी 18 New Delhi windows को मिलाकर एक common magnitude→twilight linear model बनाया और हर ग्रह को बारी-बारी से पूरा holdout रखा। परिणाम ने एक महत्वपूर्ण सीमा दिखाई:

- Mercury holdout: MAE 0.68° (Asta-start), 1.17° (Asta-end).
- Venus holdout: 1.08° / 1.28°.
- Jupiter: 1.44° / 0.07° (केवल एक boundary प्रति दिशा).
- Saturn: 0.28° / 0.81° (केवल एक boundary प्रति दिशा).
- Mars: 1.59° / 1.91° (केवल एक boundary प्रति दिशा).

Common magnitude curve हर ग्रह में constant-threshold baseline से बेहतर थी, पर ग्रहों के बीच error अभी बहुत अलग है; Venus और Mars में 1° से अधिक औसत error आया। एक ग्रह के coefficients दूसरे ग्रह पर सीधे लागू करना सुरक्षित नहीं।

**अगला निर्णय:** Mercury के लिए अलग calibrated candidate जारी रहेगा। Venus, Jupiter, Saturn और Mars के लिए अतिरिक्त multi-year published windows और same-city/location holdouts जुटाए बिना coefficients तय नहीं होंगे। एक global brightness formula production में नहीं जाएगा।


### 2026 New Delhi holdout विस्तार — Venus, Jupiter और Saturn

Drik के 2026 New Delhi pages से अतिरिक्त windows benchmark में जोड़ी गईं:
- Venus: 11 Dec 2025 06:35 (rise) → 1 Feb 2026 18:27 (set), साथ में पहले से मौजूद Oct 2026 window.
- Jupiter: 15 Jul 2026 19:59 (set) → 12 Aug 2026 05:03 (rise).
- Saturn: 13 Mar 2026 19:13 (set) → 22 Apr 2026 04:49 (rise).

ये New Delhi city-label-only references हैं; Pithoragarh के स्थानापन्न नहीं। Source pages:
- https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2026
- https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2026
- https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html?year=2026

अब New Delhi dataset में 21 Asta windows और 42 boundary events होंगे। इससे Venus, Jupiter और Saturn के लिए एक अतिरिक्त year-specific window जुड़ती है; फिर भी किसी ग्रह के लिए multi-year independent validation का विकल्प नहीं।


### 2025 multi-planet reference expansion

Drik के 2025 New Delhi pages से Mercury की छह windows के अतिरिक्त Venus, Jupiter और Saturn की एक-एक window भी benchmark में जोड़ी गई:
- Venus: 19 Mar 2025 19:00 (setting) → 23 Mar 2025 05:52 (rising).
- Jupiter: 12 Jun 2025 19:56 (setting) → 9 Jul 2025 04:44 (rising).
- Saturn: 28 Feb 2025 19:06 (setting) → 9 Apr 2025 05:03 (rising).
- Mercury: 20 Jan–22 Feb, 18 Mar–8 Apr, 15 May–8 Jun, 18 Jul–11 Aug, 3 Sep–8 Oct, 11–27 Nov 2025.

स्रोत:
- https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2025
- https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2025
- https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html?year=2025
- https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?year=2025

इन additions के बाद dataset में **30 New Delhi windows** (60 boundary events) हैं: Mercury 19 windows; Venus 4; Jupiter 3; Saturn 3; Mars 1. Provider coordinates सभी मामलों में undisclosed हैं; इन्हें city-label-only comparison माना जाएगा। 2025–27 multi-year holdout पुनः चल रहा है; परिणाम आने तक कोई नया coefficient स्वीकार नहीं होगा।


### Mercury 2025–27 three-year cross-validation — 10 नवम्बर 2026

अब 2025, 2026 और 2027 के Drik New Delhi Mercury pages के **19 Asta windows** (38 boundary events) पर हर वर्ष को अलग रखकर बाकी एक वर्ष से model fit किया गया। 2028 में समाप्त होने वाली एक boundary को year-split fit से बाहर रखा गया।

- सभी 6 directed year-pair fits में magnitude model का twilight-angle MAE **0.24°–0.72°** रहा; constant-threshold baseline लगभग **0.82°–1.26°** रहा।
- Asta-start और Asta-end दोनों में हर train-year → test-year split पर magnitude model constant baseline से बेहतर रहा।
- Date selector के ±20-day local event search में 74 pairwise predictions बने: **38 exact date, 28 एक दिन, 6 दो दिन और 2 तीन दिन** का अंतर। औसत absolute date error लगभग **0.62 दिन**; 97% से अधिक predictions दो दिनों के भीतर।
- हर held-out boundary के local search window में एक ही residual crossing मिला; multiple crossing ambiguity नहीं मिली।

यह अब तीन वर्षों का cross-year result है, लेकिन 74 predictions में वही 37 unique boundary events अलग-अलग train-year fits के अंतर्गत दोहराए गए हैं—इन्हें 74 स्वतंत्र observations न समझें। Search window published date के ±20 दिन पर anchored था; इसलिए यह पूर्ण blind forecast नहीं है। सभी references New Delhi city-label-only हैं और provider coordinates अज्ञात हैं।

**निष्कर्ष:** Mercury का apparent-magnitude + local solar-altitude selector अब मजबूत candidate है, पर Pithoragarh same-city Mercury holdout के बिना इसे वहाँ प्रमाणित नहीं कहा जा सकता। अन्य ग्रहों के लिए अलग calibration और multi-year samples आवश्यक हैं।


### Updated leave-one-planet-out results on 30-window dataset

2025 New Delhi Venus/Jupiter/Saturn windows जोड़ने के बाद global magnitude curve को फिर से जाँचा। नवीन परिणाम (MAE degrees; Asta-start / Asta-end):
- Mercury: **0.71° / 0.85°** (test n=19 each)
- Venus: **0.82° / 1.11°** (n=4 each)
- Jupiter: **1.16° / 0.21°** (n=3 each)
- Saturn: **0.43° / 0.62°** (n=3 each)
- Mars: **1.72° / 1.82°** (n=1 each)

हर ग्रह में global magnitude curve constant baseline से बेहतर रही, लेकिन Mars और कुछ Venus/Jupiter दिशाओं में error अभी 1° से ऊपर है। Jupiter/Saturn/Mars sample counts अभी भी छोटे हैं। इसलिए एक global coefficient set को production में इस्तेमाल नहीं किया जाएगा; Mercury के लिए अलग candidate और बाकी ग्रहों के लिए अलग पर्याप्त reference data चाहिए।


### 2024 historical reference expansion

New Delhi के Drik 2024 pages से Mercury की छह windows, Venus की एक और Saturn की एक window जोड़ी:
- Mercury: 7 Feb–11 Mar, 4 Apr–1 May, 2–25 Jun, 4–28 Aug, 20 Sep–27 Oct, 29 Nov–12 Dec 2024.
- Venus: 25 Apr 2024 05:19 (rising) → 29 Jun 2024 19:52 (setting).
- Saturn: 17 Feb 2024 18:56 (setting) → 26 Mar 2024 05:20 (rising).

स्रोत:
- https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?year=2024
- https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2024
- https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html?year=2024

अब benchmark में **38 New Delhi windows / 76 boundary events** हैं: Mercury 25, Venus 5, Jupiter 3, Saturn 4, Mars 1. 2024–27 Mercury year-pair cross-validation चल रही है; पुराने 2025–27 coefficients को final नहीं माना जाएगा।


### 2024–27 Mercury four-year holdout — updated result

2024–27 के 25 Mercury windows (49 unique boundary dates; 2028 में समाप्त होने वाला एक end event year-split training से बाहर) पर अब चारों years के बीच सभी 12 directed train-year→test-year pairs चलाए गए:

- Asta-start: average twilight-angle MAE **0.470°**, constant-threshold baseline **0.950°**; सभी 12 year-pair fits baseline से बेहतर।
- Asta-end: average MAE **0.455°**, baseline **1.145°**; सभी 12 year-pair fits baseline से बेहतर।
- Date-level holdout: 147 pairwise predictions (49 unique boundary dates × तीन अन्य training years) में **78 exact, 53 ±1 दिन, 9 ±2 दिन, 7 ±3 दिन**; MAE **0.626 दिन**.
- 89% predictions ±1 दिन और 95% ±2 दिन के भीतर रहीं। ये repeated year-pair predictions हैं, 147 अलग-अलग reference dates नहीं।

इससे Mercury magnitude-based candidate की cross-year stability और मजबूत हुई। लेकिन अभी भी New Delhi city-centre proxy और reference-date के ±20 दिन के local search window पर निर्भर है। Pithoragarh में location transfer, observer elevation/atmosphere और independent same-city Mercury references अभी बाकी हैं।


### 38-window local horizon clock verification — CI success

Latest browser diagnostics में 2024–27 के **38 New Delhi Asta windows / 76 boundaries** पर सही direction वाले Astronomy Engine local rise/set event और Drik published clock-time की तुलना:

- Mean absolute clock difference: **0.2347 minute** (लगभग 14 सेकंड).
- Maximum absolute difference: **0.61 minute** (लगभग 37 सेकंड).
- Signed difference range: **−0.49 to +0.61 minute**.
- Planet-wise maximum: Venus 0.61, Jupiter 0.57, Saturn 0.59, Mercury 0.56, Mars 0.57 minute.

यह 76 city-label-only New Delhi comparisons हैं; provider coordinates undisclosed हैं, इसलिए यह exact-coordinate validation नहीं। फिर भी clock-time semantics के लिए मजबूत evidence है: प्रकाशित Asta/Udaya timestamp स्थानीय ग्रह के सही rise/set event के अनुरूप है। अब engineering problem दो अलग हिस्सों में स्पष्ट है:
1. **Clock time:** observer के topocentric horizon rise/set से निकालना—यह हिस्सा अत्यंत अच्छी तरह match कर रहा है।
2. **Boundary date:** planet brightness और local twilight के आधार पर visibility transition चुनना—Mercury के लिए cross-year model candidate सफल है; अन्य ग्रहों का calibration बाकी है।

CI browser diagnostics, Panchang feature validation और classical interval tests सफल रहे। Production Panchang display/code path अभी नहीं बदला।


### Venus New Delhi→Pithoragarh cross-location holdout — CI success

नया cross-location test New Delhi के Venus data से calibration करता है और Pithoragarh की दोनों 2025 apparitions को holdout रखता है। Leakage रोकने के लिए हर Pithoragarh test apparition के समान New Delhi apparition को training से हटाया गया। Training में हर boundary direction के लिए चार अलग New Delhi apparitions बचे।

| Pithoragarh boundary | Published date | Predicted date | अंतर |
|---|---|---|---:|
| Mar 2025 Asta-start | 20 Mar 2025 | 20 Mar 2025 | 0 दिन |
| Mar 2025 Asta-end | 23 Mar 2025 | 23 Mar 2025 | 0 दिन |
| Dec 2025 Asta-start | 11 Dec 2025 | 10 Dec 2025 | −1 दिन |
| Feb 2026 Asta-end | 2 Feb 2026 | 2 Feb 2026 | 0 दिन |

**4 में से 3 exact, सभी 4 एक दिन के भीतर।** यह New Delhi से Pithoragarh पर Venus के लिए promising location-transfer evidence है। Pithoragarh test observer project coordinates 29.5828° N, 80.2182° E, 1650 m हैं; Drik के internal coordinates प्रकाशित नहीं, इसलिए इसे exact observer equivalence न मानें। केवल दो Pithoragarh apparitions और छोटे training samples हैं; इससे अन्य ग्रहों के coefficients सिद्ध नहीं होते।

**अगला कदम:** Venus के लिए इस candidate को अलग research module में स्थिर करना, फिर 2026/27 Pithoragarh user-provided windows और उपलब्ध अतिरिक्त independent same-city references पर blind/forward validation। Main Panchang में अभी कोई display या calculation नहीं जोड़ी गई।


### Venus model caution — New Delhi leave-one-apparition-out

Pithoragarh cross-location holdout का 3/4 exact परिणाम अकेले पर्याप्त नहीं। उसी candidate को New Delhi के पाँच Venus apparitions पर leave-one-apparition-out जाँचा:
- Asta-start prediction errors: −3, +1, 0, −4, −1 दिन.
- Asta-end: 0, 0, +1, 0, 0 दिन.

अर्थात Asta-end पक्ष अभी मजबूत दिखता है, पर Asta-start में दो apparitions 3–4 दिन पहले predict हुए। इसलिए Venus का पूरा दो-सीमा selector अभी production-ready नहीं। Pithoragarh cross-location result promising है, लेकिन Asta-start की same-city generalization में कमजोरी बनी हुई है। अधिक historical windows और बेहतर brightness/phase model चाहिए।


### 2023 New Delhi reference expansion

2023 Drik New Delhi pages से Mercury की सात, Venus की एक, Saturn की एक और Jupiter की एक Asta window जोड़ी:
- Mercury: 1–14 Jan, 24 Feb–28 Mar, 24 Apr–23 May, 21 Jun–12 Jul, 22 Aug–15 Sep, 8 Oct–16 Nov, 16–29 Dec 2023.
- Venus: 3–19 Aug 2023.
- Saturn: 4 Feb–14 Mar 2023.
- Jupiter: 1 Apr–4 May 2023.

स्रोत:
- https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?year=2023
- https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2023
- https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html?year=2023
- https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2023

Dataset अब **48 New Delhi windows / 96 boundary events** पर है: Mercury 32, Venus 6, Jupiter 4, Saturn 5, Mars 1. Mercury year-split अब 2023–27 तक और Venus/Saturn holdouts भी 2023–27 तक चलेंगे। यह New Delhi city-label dataset है; Pithoragarh का स्थानापन्न नहीं।


### Updated 2023–27 results on 48-window dataset

Latest successful numerical validation (48 New Delhi windows / 96 boundary events):

**Clock-time event**
- Mean absolute local rise/set clock difference: **0.254 minute** (about 15 seconds).
- Maximum absolute difference: **0.66 minute** (about 40 seconds).
- Signed range: −0.52 to +0.66 minute.
- यह city-centre proxy comparison है; source providers के exact coordinates उपलब्ध नहीं।

**Mercury event-date model**
- 2023–27 में 32 Mercury windows; 63 unique boundary dates (एक end event 2028 में है और year split से बाहर)।
- 20 directed year-pair fits प्रति boundary direction: Asta-start angle MAE **0.486°** बनाम constant baseline **0.995°**; Asta-end **0.465°** बनाम baseline **1.161°**. दोनों दिशाओं के सभी 20 year-pair fits baseline से बेहतर।
- Date-level 252 repeated pairwise predictions: **131 exact, 95 एक दिन, 14 दो दिन और 12 तीन दिन**; MAE **0.631 दिन**. ये 252 स्वतंत्र dates नहीं—63 unique boundaries को चार अलग training-year models से जाँचा गया।

**Venus location transfer**
- 2023 New Delhi Venus window जोड़ने के बाद, same-apparition New Delhi training data हटाकर Pithoragarh की चारों 2025 boundaries अब **4/4 exact date** predict हुईं।
- New Delhi leave-one-apparition-out में Venus Asta-start का एक 3-day miss अभी भी है; Asta-end 6/6 within one day है। इसलिए Venus start-boundary model अभी सीमित confidence वाला है।

**Saturn year holdout**
- 2023–27 के पाँच windows पर leave-one-year-out: Asta-start 4/5 exact और 5/5 within one day; Asta-end 3/5 exact और 5/5 within one day। यह promising है, पर पाँच samples ही हैं।

Jupiter के लिए इसी प्रकार का year-holdout diagnostic जोड़ा गया है; उसका परिणाम अगली CI run के बाद दर्ज होगा। अभी कोई planetary selector production Panchang में नहीं जोड़ा गया।


### 2023–27 Venus, Saturn और Jupiter LOYO परिणाम

अब leave-one-year-out (बाकी सभी उपलब्ध वर्षों पर fit, एक वर्ष holdout) का परिणाम:

- **Venus:** Asta-start 6 holdouts में 5 एक दिन के भीतर, 1 तीन दिन पहले; Asta-end 6/6 एक दिन के भीतर (5 exact). Start-boundary outlier के कारण Venus पूरा selector अभी production-ready नहीं।
- **Saturn:** पाँच वर्षों के holdout में Asta-start 4/5 exact, 5/5 एक दिन के भीतर; Asta-end 3/5 exact, 5/5 एक दिन के भीतर। यह promising candidate है, लेकिन sample छोटा है।
- **Jupiter:** चार windows पर Asta-start 2 exact + 2 एक दिन; Asta-end 2 exact, 1 एक दिन, 1 दो दिन। Date result promising है, पर threshold-angle regression हर split में constant baseline से बेहतर नहीं रही; और data बढ़ाना होगा।

New Delhi से Pithoragarh Venus cross-location test में 2023 New Delhi apparition जोड़ने के बाद चारों Pithoragarh boundaries (दो 2025 apparitions) **4/4 exact dates** पर आईं; same-apparition New Delhi training record हर बार हटाया गया। यह उपयोगी transfer evidence है, लेकिन अभी केवल शुक्र और दो Pithoragarh apparitions तक सीमित है।

**स्थिति:** Mercury मजबूत; Venus end मजबूत पर start में outlier; Saturn promising; Jupiter preliminary; Mars के लिए अभी पर्याप्त New Delhi/Pithoragarh multi-year windows नहीं। सभी ग्रहों के लिए एक ही coefficient set नहीं अपनाया जाएगा।
