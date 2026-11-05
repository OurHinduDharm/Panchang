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
