# आधुनिक ग्रह उदय-अस्त — Drik-first कार्ययोजना

अंतिम अद्यतन: 2026-11-04

## एकमात्र उत्पादन लक्ष्य

OurHinduDharm में बुध, शुक्र, मंगल, गुरु और शनि के अस्त/उदय के ऐसे स्थानीय समय दिखाना जो उसी शहर के Drik Panchang और अन्य प्रतिष्ठित पंचांगों के प्रकाशित परिणामों से मेल खाते हों।

**सूर्यसिद्धान्त K/C इस उत्पादन गणना, acceptance tests और आगे के implementation का हिस्सा नहीं है।** पुराना शोध केवल ऐतिहासिक archive रहेगा। उसे आधुनिक गणना में मिलाया नहीं जाएगा।

## प्राथमिकता क्रम

1. Drik Panchang — मुख्य प्रकाशित benchmark।
2. Rashtriya Panchang / Positional Astronomy Centre और अन्य प्रतिष्ठित पंचांग — स्वतंत्र cross-check; इनके event definitions और date/time precision अलग दर्ज होंगे।
3. Swiss Ephemeris तथा Astronomy Engine — आधुनिक खगोलीय स्थिति की स्वतंत्र जाँच; ये अपने-आप Drik के प्रकाशित परिणामों का विकल्प नहीं हैं।

## पहले चरण में बंद किए गए रास्ते

- सूर्यसिद्धान्त अध्याय III/VII/IX आधारित K/C event calculation को production path न बनाएं।
- Fixed geocentric elongation threshold को location-specific Asta/Udaya न कहें।
- Swiss heliacal rising/setting को Drik का clone न मानें। पहले उपलब्ध Pithoragarh Venus 2025 diagnostic में event-boundary mismatch बहुत बड़ा था; event semantics का मिलान सिद्ध किए बिना इसे reject/limit करें।
- अलग-अलग शहरों के समयों को कभी न मिलाएँ।
- Thresholds को केवल reference से मिलाने के लिए मनमाने ढंग से न बदलें।

## वर्तमान स्थिति

- Main का `extra-panchang.js` अभी geocentric angular-separation threshold estimate देता है। यह selected location से स्वतंत्र है और `locationSpecific: false` के रूप में चिह्नित है।
- PR #263 बंद कर दिया गया है; वह Draft था, merge नहीं हुआ। उसमें मौजूद सूर्यसिद्धान्त लम्बान्तर शोध ऐतिहासिक शाखा में सुरक्षित है, production में नहीं गया।
- मौजूदा benchmark JSON में Drik Pithoragarh 2025 Venus, Drik New Delhi 2026/2027 Venus/Jupiter और Rashtriya Panchang Central Station date-only reference अलग-अलग provenance सहित सुरक्षित हैं।
- पुराने अप्रमाणित Pithoragarh 2026 Venus और 2027 Jupiter समय active acceptance targets नहीं हैं।
- छः-घंटे के geocentric vector chunks केवल खगोलीय आधार डेटा हैं; वे local visibility अथवा Drik equivalence प्रमाणित नहीं करते।

## वर्तमान candidate — मापा गया परिणाम\n\nSelected observer के apparent topocentric RA/Dec से 3-D angular separation निकालने वाला candidate लागू और test हुआ। Pithoragarh Venus 2025 के चार Drik boundaries पर इसके errors −1,043, +5,383, −21,061 और +20,781 मिनट आए। इसलिए यह Drik-सन्निकट परिणाम देने में असफल है और production के लिए reject है। एक fixed angular threshold से अलग-अलग published boundary angles (6.4097° से 9.4349°) को एक साथ नहीं पकड़ा जा सकता।\n\nअब Swiss Ephemeris heliacal visibility को उन्हीं चार boundaries पर जाँच रहे हैं—Evening Last को Asta-start और Morning First को Asta-end से तुलना करके। इसे भी error report के बिना सही नहीं मानेंगे।\n\n## कार्य के अनिवार्य चरण

### A. Reference ledger पूरा करना
- Drik के Pithoragarh city selector से प्रत्येक उपलब्ध ग्रह/वर्ष की exact event pages capture करें।
- हर capture में URL, selected city, year, retrieval date, local timezone, Asta-start और Asta-end/Udaya दोनों boundary times रखें।
- New Delhi, Pithoragarh, Varanasi आदि को अलग-अलग datasets रखें।
- अन्य पंचांगों के values केवल तभी जोड़ें जब उसी ग्रह, event, शहर और वर्ष का स्पष्ट स्रोत हो।
- Date-only references को minute-level reference में न बदलें।

### B. Event definition तय करना
- Drik के प्रकाशित Asta-start और Udaya/Asta-end labels का अर्थ/समय-संदर्भ जाँचें।
- आधुनिक apparent planetary positions, topocentric/geocentric frame, altitude/azimuth, twilight, atmospheric refraction, observer elevation और horizon assumptions के प्रभाव अलग-अलग मापें।
- किसी candidate model को तभी रखें जब उसका event definition प्रकाशित Panchang के boundary labels से मेल खाता हो।

### C. Candidate model validation
- Astronomy Engine और Swiss Ephemeris को समान UTC instants पर cross-check करें।
- Same-city references के दोनों boundaries पर signed time error निकालें।
- Pithoragarh के लिए project observer 29.5828° N, 80.2182° E, 1650 m रखें; Drik के provider coordinates अज्ञात हों तो city-label-only status लिखें।
- एक ही model को कम-से-कम अनेक ग्रहों, कई वर्षों और एक दूसरे शहर पर जाँचें।
- Model selection से पहले घोषित tolerance तय करें; केवल एक event पर fit न करें।

### D. Production integration
- पहले isolated modern engine module और test suite बनाएं।
- Main Panchang से अलग calculator / precomputation workflow रखें।
- सत्यापित events को versioned JSON में रखें; local display time/location metadata स्पष्ट हो।
- Main page में केवल verified records दिखाएँ; अनुपलब्ध/असत्यापित event के लिए fallback date न गढ़ें।
- Existing Panchang calculations, festival rules और page-load performance को न बदलें।

### E. Release gate
- सभी reference cases की provenance जाँची हुई हो।
- Date और time tolerances पूरी हों।
- Location sensitivity test पास हो।
- Regression, browser, integrity, CodeQL और performance checks पास हों।
- Main production में तभी बदलाव हो जब modern model benchmark gate पास करे।

## जल्द पूरा करने की रणनीति

पहले केवल Venus और Jupiter के उपलब्ध Drik reference periods पर एक compact event-model comparison पूरा करें। इससे event semantics और candidate selection जल्दी तय होंगे। इसके बाद Mercury, Mars और Saturn जोड़ें। Multi-year JSON generation सबसे अंत में करें—गलत model के लिए बड़े पैमाने पर data पहले से न बनाएं।


## 4 नवम्बर 2026 — नवीनतम benchmark निर्णय

CI browser diagnostics सफल रहे (8 scenarios × 10 boundaries), पर accuracy gate पास नहीं हुआ। Swiss heliacal के सबसे कम MAE वाले diagnostic scenarios (age 23, 300/500/1000 km range) पर चार indexed Pithoragarh Venus boundaries का MAE 2,160 मिनट है। 300 km को वास्तविक atmosphere या production parameter न मानें। बाकी scenario परिणाम और signed errors `ASTA-UDAYA-BENCHMARK-AUDIT.md` में दर्ज हैं।

**निर्णय:** fixed 10° topocentric threshold और Swiss heliacal दोनों अभी production के लिए reject हैं। PR #278 research-only draft रहेगा; Main/production में कोई बदलाव या merge नहीं। अगले चरण में Drik boundary semantics और अतिरिक्त independently captured same-city references की जाँच होगी—parameter tuning या provisional user rows पर fit नहीं।


## 5 नवम्बर 2026 — event topology के आधार पर कार्ययोजना संशोधन

आज के Drik named-city captures से पहले की “पहले Venus/Jupiter, फिर बाकी ग्रह” वाली संकरी योजना को संशोधित किया गया है। New Delhi 2026 में Mercury के सात अलग windows और Mars का एक लम्बा window है; 2027 में Mercury के सात windows फिर दिखते हैं। Jupiter, Saturn और Venus के 2026–2027 pairs भी capture हुए हैं। इसका अर्थ है कि event stream architecture और apparition pairing को सभी ग्रहों पर एक साथ validate करना होगा—केवल Venus/Jupiter के दो उदाहरणों पर model lock नहीं किया जा सकता।

### अब अगला क्रम

1. **Reference ledger:** New Delhi 2026–2027 के प्राप्त Drik windows को अलग city-label dataset में सुरक्षित करें। Mercury की 24+ hour notation को raw form में रखें; normalization rule और source-day interpretation को अलग test करें। Missing Mars 2027 को null रखें।
2. **Pithoragarh capture:** उसी ग्रह/वर्ष के named-city pages अलग से प्राप्त करें। New Delhi timestamps को Pithoragarh के project observer पर कभी calculate न करें।
3. **Event topology:** हर planet के multiple disjoint windows, year-boundary crossing, chronological ordering, non-overlap और start/end pairing के tests बनाएं।
4. **Geometry diagnostics:** प्रत्येक published boundary instant पर same pinned ephemeris से geocentric और topocentric apparent positions, angular separation, altitude/azimuth, solar elongation और direct/retrograde state record करें। Geometry report model proof नहीं होगी।
5. **Model selection:** किसी भी production algorithm से पहले event definition का evidence चाहिए। Schaefer/Swiss physical visibility, classical horizon-crossing/K/C और fixed angular threshold को अलग-अलग रखें; इन्हें combine या average न करें।
6. **Acceptance:** हर city के भीतर multi-year/multi-planet boundary errors और declared tolerance पास हों; provider coordinates अज्ञात हों तो city-label-only comparison के रूप में ही report करें।

**अभी भी कोई production formula स्वीकृत नहीं है।** PR #278 research-only रहेगा। पहले event-stream correctness और source ledger, फिर model validation; इसके बाद ही optimized precomputation/data pipeline।


### 5 नवम्बर — 24+ hour source data और regression gate

Drik New Delhi Mercury 2026/2027 के सात-सात published windows अब benchmark JSON में raw Panchang date/time तथा normalized civil local instant दोनों रूपों में दर्ज हैं। 24+ notation को source rule के अनुसार normalize किया गया है; annual pages के overlap को भी tests में identity-check किया गया है। यह source-ledger validation है, astronomical engine validation नहीं।

आगे के code changes में eventWindows को multi-window source stream के रूप में पढ़ें; annual page year को event year न मानें, क्योंकि कुछ intervals अगले/पिछले civil year में जाते हैं। Raw source values और provider location provenance हमेशा साथ रखें। New Delhi city-label-only records पर Pithoragarh coordinates लागू न करें।


### 5 नवम्बर — सभी ग्रहों के New Delhi source windows

Structured source ledger में Mercury के अतिरिक्त Venus, Jupiter, Saturn और उपलब्ध Mars 2026 intervals शामिल हैं। Mars 2027 को स्पष्ट रूप से not-captured रखा है। सभी rows New Delhi city-label-only हैं; project Pithoragarh coordinates का उपयोग इनमें नहीं किया जाएगा। Benchmark tests अब multi-planet stream counts, chronological ordering, timezone और missing-data policy जाँचते हैं। Browser diagnostics workflow भी benchmark data/test paths पर trigger होता है।



## 5 नवम्बर 2026 — बहु-शहर, बहु-वर्ष डेटा रणनीति और Gemini सुझावों का तकनीकी मूल्यांकन

### निर्णय: शहरों का डेटा बढ़ाएँ, पर शहरों के बीच समय-offset से गणना न करें

अब benchmark collection को केवल Pithoragarh तक सीमित नहीं रखना है। Drik के named-city pages से पहले बड़े/भौगोलिक रूप से अलग भारतीय शहरों के 2026–2028 (और जहाँ उपलब्ध हों वहाँ पिछले वर्षों) के सभी पाँच ग्रहों के पूरे Asta windows इकट्ठे किए जाएँ। प्राथमिक शहर-समूह:

- उत्तर/मध्य: New Delhi, Jaipur, Agra, Varanasi, Lucknow, Ujjain
- पश्चिम: Mumbai, Pune, Ahmedabad
- पूर्व: Kolkata, Patna
- दक्षिण: Bengaluru, Hyderabad, Chennai
- परियोजना का लक्ष्य-स्थान: Pithoragarh

यह सूची डेटा-संग्रह की प्राथमिकता है, यह दावा नहीं कि हर शहर का डेटा अभी उपलब्ध या सत्यापित है। प्रत्येक शहर/ग्रह/वर्ष को अलग key और अलग source URL मिलेगा। किसी शहर के समय को दूसरे शहर पर लागू, औसत या interpolate नहीं करना है। Latitude/longitude/elevation/timezone और horizon/atmosphere inputs उपलब्ध हों तभी location-exact label दिया जा सकता है; Drik के coordinates न मिलने पर source row city-label-only ही रहेगी।

### डेटा संग्रह का क्रम

1. Drik के city selector से शहर चुनकर Mercury, Venus, Mars, Jupiter और Saturn के वार्षिक Asta pages खोलें।
2. हर page के सभी event windows दर्ज करें—केवल पहले/मुख्य window को नहीं। Start और end दोनों, raw displayed text, normalized local ISO timestamp, timezone, city label, year selector, retrieval date और exact URL रखें।
3. कम-से-कम दो वर्षों का overlap capture करें ताकि annual-page boundary और multi-window continuity जाँची जा सके। 24+ hour notation को raw रूप में सुरक्षित रखें; normalized civil date अलग field हो।
4. हर ग्रह के लिए source coverage matrix रखें: captured / not-captured / inaccessible / provisional. खाली डेटा को अनुमान से न भरें।
5. Drik के अलावा Rashtriya Panchang/IMD, अन्य प्रतिष्ठित पंचांग और स्वतंत्र ephemeris को अलग source-family में रखें। उनकी event definition और precision समान सिद्ध हुए बिना उन्हें Drik values के साथ एक ही error metric में न मिलाएँ।

### Gemini प्रस्ताव: क्या अपनाना है, क्या बदलना है

**अपनाएँ:** बहु-शहर reference ledger, पृथक JavaScript engine, versioned JSON, pinned ephemeris, event-time bracketing/interpolation, regression tests और production से पहले offline precomputation।

**ज्यों का त्यों न अपनाएँ:**

- 8°/10°/11°/12°/14°/15°/17° को सार्वभौमिक modern visibility limits मानकर सीधे production में न लगाएँ। ये परंपरागत/अनुमानित angular criteria हो सकते हैं; Drik स्वयं modern geolocation-based algorithm बताता है। हर ग्रह की retrograde अवस्था और apparition के अनुसार अलग व्यवहार हो सकता है।
- केवल निरयण longitude difference से वास्तविक दृश्यता नहीं निकलती। समान epoch पर compatible apparent coordinates चाहिए; topocentric RA/Dec, angular separation, altitude/azimuth, सूर्य की ऊँचाई, twilight, refraction, observer elevation और स्थानीय horizon को candidate diagnostics में अलग-अलग जाँचें।
- Latitude/longitude का प्रभाव केवल sunrise offset या एक सरल “Lagna correction” नहीं है। स्थानीय क्षितिज पर ग्रह-सूर्य की स्थिति बदलती है; इसे वास्तविक observer geometry से निकालना होगा।
- एक मिनट के step scan को अंतिम समाधान न मानें। पहले event interval bracket करें, फिर robust root-finding/refinement करें; ग्रहों के अनेक disjoint windows और year-crossing को संभालें।
- 2–5 मिनट का target पहले से मानकर threshold tune न करें। पहले स्रोत की minute rounding, coordinate uncertainty और event-definition uncertainty लिखें; फिर holdout cities/years पर signed error और MAE/P95 प्रकाशित करें।

### गणना और सत्यापन की प्रस्तावित संरचना

- `tools/asta-udaya-data-collector/`: source capture/normalization, manual review manifest और provenance validation।
- `tools/asta-udaya-calculator/`: pinned ephemeris से offline multi-city/multi-year event calculations; browser production bundle से अलग।
- `src/asta-udaya/` (या repo के मौजूदा module conventions के अनुसार): isolated calculation interfaces और deterministic tests; acceptance से पहले production import नहीं।
- `data/asta-udaya-benchmark.json`: प्रकाशित references; `data/asta-udaya-generated/`: model output, engine/version/config/checksum सहित। Reference और generated output कभी एक ही field में न रखें।
- `reports/`: प्रति ग्रह/शहर/वर्ष boundary-wise signed error, missing events, event pairing, uncertainty और performance।

### Validation design

- Training/reference cities और holdout cities अलग रखें। उदाहरणतः New Delhi और Mumbai पर model चुनकर Varanasi, Chennai और Pithoragarh को holdout रखें; बाद में roles rotate करें।
- हर शहर में पाँचों ग्रहों के कई वर्षों के start/end boundaries जाँचें। एक ही apparition के start/end दोनों सही होने चाहिए; केवल window midpoint या एक boundary पास होना पर्याप्त नहीं।
- अलग-अलग event classes (morning/evening, eastern/western, direct/retrograde, inferior/superior conjunction के आसपास) की coverage अनिवार्य हो।
- कम-से-कम एक independent source family से event topology/date cross-check करें; exact-time comparison तभी जब event semantics और observer location तुलनीय हों।
- Acceptance tolerance model selection से पहले तय हो। शहर/वर्ष/ग्रह के हिसाब से errors प्रकाशित हों; aggregate score अकेले असफल cases नहीं छिपाए।
- Performance test offline calculator और browser runtime दोनों के लिए हो। Precomputed JSON तभी बने जब calculation model acceptance gate पार करे।

### उपलब्ध आधिकारिक cross-check का उपयोग

IMD Positional Astronomy Centre के Rashtriya Panchang में 2026–27 के लिए ग्रहों की visibility periods तथा अलग Heliacal Rising/Setting तालिका उपलब्ध है। Heliacal table Central Station of India के लिए है; इसे Drik New Delhi या Pithoragarh exact-time benchmark न मानें। यह event sequence/topology और broad date cross-check के लिए उपयोगी स्वतंत्र dataset है। स्रोत:
- https://packolkata.imd.gov.in/panchang/en/visibility
- https://packolkata.imd.gov.in/panchang/en/helical
- https://internal.imd.gov.in/press_release/20250322_pr_3824.pdf

Drik के New Delhi pages अपने notes में local observer geolocation पर modern algorithm का उल्लेख करते हैं और Surya Siddhanta angles को approximate बताते हैं। इसलिए fixed-angle formula को Drik का algorithm मानना उचित नहीं। उदाहरण:
- https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?lang=en
- https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?geoname-id=1261481&year=2027

**अगला ठोस काम:** पहले New Delhi के मौजूदा 2026–2027 ledger को baseline बनाकर बाकी प्राथमिक शहरों के Drik city/year/planet pages capture करना; फिर same-city source coverage और event topology पूरी करना। इसके बाद ही किसी नए physical/geometry model की parameter study और holdout validation होगी। PR #278 research-only draft रहेगा; Main पर अभी कोई formula या UI बदलाव नहीं।


### 5 नवम्बर 2026 — fixed-angle प्रस्ताव का गणितीय diagnostic

`tests/report-longitude-threshold-boundaries.mjs` में TRAC 2027 के 20 start/end boundaries पर Gemini के प्रकाशित threshold rules का एक अलग diagnostic जोड़ा गया है। यह `astronomy-engine@2.1.19` के `GeoVector + Ecliptic` से ग्रह का geocentric apparent ecliptic-of-date longitude और `SunPosition` से सूर्य का उसी frame का longitude लेता है; दोनों का shortest angular difference निकालता है। Direct/retrograde स्थिति ग्रह के geocentric longitude के centered 12-hour derivative से तय होती है। यह केवल threshold-boundary residual diagnostic है; यह अभी event-root calculation या production formula नहीं है।

**Ayanamsa पर सुधार:** सूर्य और ग्रह दोनों के longitude पर एक ही समय का समान ayanamsa घटाने से उनका angular difference नहीं बदलता—सामान्य common ayanamsa offset अंतर में cancel हो जाता है। इसलिए relative longitude-gap threshold के लिए Lahiri चुनना अपने-आप accuracy नहीं बढ़ाता। जरूरी है कि दोनों positions एक ही apparent/geocentric/topocentric convention, epoch और ecliptic frame में हों। Absolute sidereal rashi/longitude दिखाने में ayanamsa फिर भी महत्वपूर्ण है।

### 5 नवम्बर 2026 — Mumbai 2027 downstream Panchang cross-check (date-only)

Drik Panchang का Mumbai 2027 Vivaha calendar एक उपयोगी, लेकिन सीमित, स्वतंत्र cross-check देता है:
- 21 जुलाई से 5 सितम्बर 2027 तक calendar में **Shukra Tara Asta** कारण दिखता है।
- 6–8 सितम्बर को **Shishutva Shukra** दिखता है।
- 9–12 सितम्बर को **Guru Tara Asta** दिखता है।
- 13–15 सितम्बर को **Shishutva Brihaspati** दिखता है।

स्रोत: https://www.drikpanchang.com/shubh-dates/shubh-marriage-dates-with-muhurat.html?geoname-id=1275339&year=2027 (Mumbai, Maharashtra; 2027).

**इस डेटा का सही उपयोग:** यह उसी शहर के Drik downstream Vivaha/Panchang logic में Tara Asta और बाल्य/वृद्धत्व अवस्थाओं के दिन-स्तरीय प्रभाव की पुष्टि करता है। यह Asta-start/Asta-end का exact timestamp नहीं देता; इसलिए इसे minute-level event benchmark, स्वतंत्र खगोलीय ephemeris या Pithoragarh reference न मानें। इसका उपयोग केवल calendar-state regression fixture के लिए किया जा सकता है, यदि बाद में उस fixture का source capture और day-boundary interpretation अलग से सत्यापित हो।

यह capture एक और उपयोगी नियम स्पष्ट करता है: event के बाद का Shishutva काल Asta interval से अलग state है। भविष्य के Panchang consumer tests में Asta और Shishutva/Vriddhatva को एक ही boolean में collapse नहीं करना चाहिए। अभी इस खोज के आधार पर कोई नया event time या production formula नहीं जोड़ा गया है।


### 6 नवम्बर 2026 — Drik Panchang को प्राथमिक benchmark मानक की पुष्टि

परियोजना का स्रोत-क्रम स्पष्ट और बाध्यकारी है:

1. **Drik Panchang:** आधुनिक Tara Asta/Udaya के location-specific प्रकाशित समयों का मुख्य acceptance benchmark।
2. Panchang Guru तथा अन्य प्रतिष्ठित पंचांग: सहायक cross-check; Drik से असहमति होने पर इनके समयों का औसत या प्रतिस्थापन नहीं।
3. Rashtriya Panchang / Positional Astronomy Centre: heliacal event family और date-level independent context; Drik के minute-level Tara Asta timestamps का सीधा विकल्प नहीं।
4. Astronomy Engine / Swiss Ephemeris: ग्रह-सूर्य geometry और ephemeris cross-check; स्वयं published Panchang acceptance source नहीं।

6 नवम्बर को Drik के Pithoragarh Venus 2025 indexed event page ने फिर Pithoragarh शहर और दोनों Asta windows की पहचान की। उसी पृष्ठ पर Drik स्पष्ट करता है कि उसके modern algorithms observer geolocation के आधार पर combustion timings निकालते हैं; Surya Siddhanta angular limits को वह approximate timings के संदर्भ में अलग बताता है। Drik का Pithoragarh monthly Panchang geoname-id=1259503 की पुष्टि करता है।

**सीमाएँ:** Drik का exact modern algorithm, visibility threshold, observer coordinates/elevation सार्वजनिक रूप से स्पष्ट नहीं हैं। पहले direct reopen में event URL ने New Delhi दिखाया था; इसलिए नए indexed capture के बावजूद event-page selector की reproducibility अभी unresolved है। इस reference को city-label-only ही रखें—coordinate-exact न कहें।

इससे अगला तकनीकी कदम स्पष्ट है: Drik के अपने location selector / geoname identity को event pages पर स्थिर रूप से capture करना, और उसी शहर/ग्रह/वर्ष के दोनों boundaries पर candidate models के signed time errors मापना। Panchang Guru Dehradun rows केवल secondary comparison stream रहेंगी। कोई fixed threshold या Swiss heliacal model अभी स्वीकृत नहीं है; production files अपरिवर्तित रहेंगी।

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

## 7 नवम्बर 2026 — शोध-चक्र समाप्त, सीमित उत्पाद-डिलीवरी चरण

परियोजना अब अनिश्चितकालीन मॉडल-शोध में नहीं रहेगी। लक्ष्य स्पष्ट और छोटा है: चुने हुए स्थान पर बुध, शुक्र, मंगल, गुरु और शनि के अगले/वर्तमान अस्त तथा उदय की तारीख-समय और अवधि दिखाना। पहले Pithoragarh को पूर्ण कार्यशील लक्ष्य बनाया जाएगा; उसके बाद अलग शहरों को उसी गणना में observer coordinates/elevation/timezone देकर जोड़ा जाएगा।

### डिलीवरी का क्रम
1. **कार्यशील गणना मॉड्यूल:** fixed angular-threshold candidate को production-ready न मानते हुए local rise/set + heliacal visibility candidate को एक पृथक module में लागू करना। हर ग्रह के लिए event semantics स्पष्ट: बाह्य ग्रहों के लिए evening-last / morning-first; बुध-शुक्र के लिए conjunction के अनुसार morning-last / evening-first भी। Missing event पर null; fallback नहीं।
2. **उपयोगकर्ता को दिखने वाला पहला परिणाम:** Pithoragarh पर पाँच ग्रहों की अस्त-आरम्भ, उदय/दृश्यता-वापसी, और कुल अवधि का सीधा card/table। केवल source-backed/accepted values को verified कहा जाए; बाकी स्पष्ट provisional label के साथ अलग रहें या छिपें—चुपचाप verified न बनें।
3. **सीमित acceptance:** Pithoragarh के उपलब्ध Drik records और कम-से-कम दो अलग longitude वाले शहरों के published records पर per-boundary error report। मुख्य Panchang में integration तभी जब event family सही हो और source-backed sample पर error gate पूरा हो।
4. **बहुवर्षीय JSON:** Pithoragarh first release के बाद calculator से 2024–2035 precompute; फिर अन्य city profiles। Main Panchang में केवल छोटा versioned JSON lookup, भारी गणना नहीं।

### Stop rule
- अब fixed-angle, fixed-twilight और parameter-sweep शोध को दोहराना नहीं। पहले से reject किए गए candidates फिर से नहीं चलाने हैं, जब तक नया independent evidence न हो।
- हर अगला कार्य-चक्र code या user-visible output देगा; केवल नई शोध-रिपोर्ट को progress नहीं माना जाएगा।
- 64 local-horizon boundary matches को event-selection proof नहीं कहना है। वे केवल boundary instant पर planet horizon crossing का संकेत हैं; visibility selection अभी अलग से implement होना है।
- Drik observer coordinates अज्ञात होने पर location label को city-level ही रखना है; project coordinates को provider coordinates बताना मना है।

**पहला release scope:** Pithoragarh, पाँच ग्रह, अगले/वर्तमान event dates and times, duration, clear source/status. No main Panchang integration and no PR merge until the release candidate passes the stated acceptance gate.

## Display sequence confirmed by project owner — 7 Nov 2026

The owner confirmed this product sequence:

### First: minimum display on the main Panchang page
As soon as the event-calculation module has passed its initial acceptance gate, show a compact **ग्रह अस्त–उदय** card on the main Panchang page. For each of Mercury, Venus, Mars, Jupiter and Saturn, show:
- अस्त आरम्भ: local date and time;
- उदय / दृश्यता-वापसी: local date and time;
- अस्त अवधि: elapsed duration in days (and hours where useful);
- selected observer/location label and calculation/source status.

The card is driven by the selected Panchang location and date. It must not use hard-coded Pithoragarh times for other locations. If a boundary is unavailable or not accepted, show an explicit unavailable/provisional state; never invent or silently substitute a time. The main Panchang must remain lightweight: load only the relevant compact event data or calculate only the needed event, not the full multi-year dataset.

### Second: separate annual Asta/Udaya page
After the calculation code and compact Panchang display are working, build a separate page where visitors can select a year and location and see the full annual Asta/Udaya schedule for all five planets. The annual page may load versioned precomputed JSON by year/location. It should include start/end date-time, total duration, source/status and year navigation.

### Delivery order (replaces any ambiguity in the earlier scope)
1. Complete and validate the event calculation module.
2. Integrate the compact, location-aware card into the main Panchang page.
3. Verify the Panchang card does not regress calculation speed or existing Panchang results.
4. Build the separate year-wise schedule page using the same calculation engine and precomputed JSON.
5. Only then expand city/year coverage.

Do not wait for the annual page before showing the compact Panchang information. Conversely, do not put unvalidated candidate times on the main page merely to make the card appear sooner.


## 8 नवम्बर 2026 — Swiss visibility-limit diagnostics और licensing gate

PR के Swiss browser diagnostic में vis_limit_mag() से प्रत्येक Pithoragarh reference boundary के −20 से +20 मिनट के आसपास limiting magnitude, ग्रह की apparent altitude, सूर्य/चन्द्रमा की altitude और ग्रह का apparent magnitude दर्ज किया जाता है। इसका उपयोग केवल यह जाँचने के लिए है कि local rise/set crossing के आसपास physical-visibility margin कैसे बदलता है; इसे Drik का algorithm या production result नहीं माना जाएगा।

Swiss source audit में तीन implementation constraints मिले: (1) dret[0..2] क्रमशः visibility beginning/optimum/end हैं; (2) outer planets के लिए event types 3/4 सामान्य heliacal mode में उपलब्ध नहीं; (3) WASM JS wrapper के AV-kind constants C header से मेल नहीं खाते, अतः AV-kind mode को parity test के बिना उपयोग न करें।

Licensing gate: wrapper GPL-3.0-or-later है और Swiss Ephemeris dual-license (AGPL या Astrodienst Professional) बताता है। Commercial/monetized OurHinduDharm production में Swiss को dependency बनाने से पहले licensing clearance अनिवार्य है। तब तक यह research-only comparator रहेगा; production calculation engine के रूप में import नहीं होगा।


## 8 नवम्बर 2026 — boundary पर apparent brightness और Swiss visibility profile

Boundary report अब Astronomy Engine Illumination() से apparent magnitude/phase inputs भी निकालती है। Swiss test दस Pithoragarh Venus/Jupiter boundaries के आसपास vis_limit_mag() की seven-point time profile बनाता है। Browser workflow में ये assertions सफल हुए। Baseline Swiss model में boundary instant पर planet below horizon है और ऊपर-क्षितिज samples के visibility margins negative हैं; इसलिए यह physical naked-eye visibility model Drik के local rise/set timestamps के समान event definition नहीं है। इसे production में substitute नहीं करना है।

अगला selector research candidate local daily planet rise/set sequence पर brightness/phase, Sun altitude, azimuth separation और Moon/atmospheric context साथ में रखेगा। कोई fixed twilight threshold या Swiss parameter tuning स्वीकार नहीं होगी। 64 boundary geometry/magnitude rows में source provenance की सीमा बनी रहेगी: केवल चार Venus 2025 boundaries indexed Drik evidence हैं; अन्य rows user-transcribed हैं। Main/production output अभी नहीं बदला।


## 10 नवम्बर 2026 — multi-year horizon-clock और visibility-selector validation

### जो अब प्रमाणित हुआ

- Drik New Delhi 2022–2027 के 58 windows / 116 boundaries पर Astronomy Engine के सही local rise/set event का clock time: mean absolute difference **0.2528 मिनट**, maximum **0.66 मिनट**। यह city-label proxy comparison है; Drik के provider coordinates/elevation अज्ञात हैं।
- Pithoragarh के independently indexed Venus 2025 के चार boundaries पर local horizon crossing का clock-time अंतर −0.351, +0.148, +0.459 और −0.318 मिनट है। इससे clock-event selection मजबूत हुआ; visibility boundary date selection अलग समस्या है।
- Research-only planetary-visibility-selector module अब एक local planet horizon event के आसपास twilight residual crossing ढूँढता है। शून्य crossing पर no-crossing, एक पर candidate, एक से अधिक पर ambiguous देता है; ambiguous/no-crossing में कोई तारीख नहीं गढ़ता।
- इसके पाँच unit tests पास हुए: unique Asta-start, unique Asta-end, no-crossing, ambiguous crossing और invalid input।
- New Delhi के 2022–27 holdout से Mercury-specific magnitude model दोनों दिशाओं में 30/30 year-pair fits में constant baseline से बेहतर रहा। Asta-start MAE 0.513° बनाम 0.988°; Asta-end 0.478° बनाम 1.197°. 375 repeated date predictions में 184 exact, 153 ±1 दिन, 24 ±2 दिन, 14 ±3 दिन (ये repeated model predictions हैं, independent dates नहीं)।
- अन्य ग्रहों पर cross-planet magnitude model का blind date holdout: Saturn 10/12 ±1 दिन और 12/12 ±2 दिन; Jupiter 5/8 ±1 दिन और 7/8 ±2 दिन। यह promising है, exact-date production gate अभी पूरा नहीं।
- Venus पर वही cross-planet model असफल: 16 boundaries में MAE 4.125 दिन, अधिकतम 12 दिन। Venus को अलग model/अतिरिक्त predictors चाहिए। Mars में केवल दो windows हैं और चार boundaries पर MAE 10 दिन; अभी पर्याप्त reference नहीं।
- Venus के लिए dedicated New Delhi-trained, same-apparition-excluded Pithoragarh holdout 4 में 3 exact और 4/4 ±1 दिन रहा; पर New Delhi leave-one-apparition-out में Asta-start पर −3/+1/0/−4/−1 दिन के errors भी मिले। इसलिए Venus model भी अभी production-ready नहीं।

### Engineering निर्णय

1. Clock-time engine का आधार अब local topocentric rise/set event रखा जा सकता है; इसे fixed geocentric angular threshold से न बदलें।
2. Visibility date selector अभी research-only रहेगा। Mercury के लिए dedicated model, Saturn/Jupiter के लिए cross-planet model candidate हैं; Venus और Mars के लिए अतिरिक्त शोध आवश्यक है।
3. Selector को extra-panchang.js या main Panchang UI में अभी integrate नहीं किया जाएगा। पहले exact-date acceptance cases, independent location references और model uncertainty handling पूरे हों।
4. PR #278 Draft रहेगा; merge/release नहीं। Main Panchang performance और existing calculations untouched हैं।

Latest validation run 42750287551 में Panchang feature tests सफल रहे; browser diagnostics और classical interval regression अलग workflows में भी सफल रहे।


### Conjunction-derived annual generator — नया परिणाम

Research module में अब:
- findNearestConjunctionAnchor() — Mercury/Venus के inferior और superior conjunction; Mars/Jupiter/Saturn के superior conjunction खोजता है।
- generateVisibilityWindows() — चुने हुए year-range में conjunctions स्वयं enumerate करके local planetary rise/set और twilight residual से Asta/Udaya candidates बनाता है। यह published event dates को search centre नहीं बनाता।
- Candidate status केवल एक crossing पर मिलता है; no-crossing और multiple-crossing अलग status रहते हैं। Mercury के दोनों conjunction families और outer-planet direction mapping के unit tests सफल हुए। Mars के लिए 150-day search window की अनुमति भी है।

2022–27 annual blind holdout में 56 New Delhi windows / 112 boundaries:
- Asta MAE 0.589 दिन; 54/56 ±1 दिन और 56/56 ±2 दिन।
- Udaya MAE 0.607 दिन; 49/56 ±1 दिन और 54/56 ±2 दिन।
- Saturn और Venus के लिए अधिकांश dates ±1 दिन; Jupiter भी लगभग ±1–2 दिन। Mercury Udaya में अधिक त्रुटि (एक अधिकतम 3 दिन)।
- 68 candidates में 12 unmatched अतिरिक्त windows हैं। Reference ledger completeness और false candidates का पृथक विश्लेषण बाकी है।
- Mars के लिए training samples अपर्याप्त हैं।

**निर्णय:** यह अब वास्तविक annual event-generation pipeline का प्रमाण है, केवल boundary-centered diagnostic नहीं। फिर भी exact date की अपेक्षा के लिए 1–3 दिन की त्रुटि और 12 unmatched candidates स्वीकार्य नहीं। इसलिए अभी भी main Panchang display/production में integrate न करें। अगला चरण: unmatched windows audit, फिर magnitude के साथ phase angle, elongation और Sun–planet azimuth separation की feature validation। उसके बाद Pithoragarh के स्वतंत्र multi-planet references पर blind test।


### Adjacent-year accounting fix

पहले 68 generated candidates दिखे थे। जाँच में 10 candidates neighboring calendar-year padding के कारण दोबारा गिने गए और 2 evaluation range के बाहर (2021/2028) थे। अब annual holdout हर window को Asta-start के वर्ष में ही assign करता है। Re-run में **56/56 published windows matched, 0 extra candidates, 0 missing cases**। Date-error metrics वही रहे। इस accounting correction के बाद annual generator का benchmark one-to-one है।


### Elongation predictor experiment

Research selector अब optional multifeature model (magnitude + elongation + phase fraction) स्वीकार सकता है। Magnitude+elongation annual holdout का नतीजा:
- Venus Asta 8/8 ±1 दिन (magnitude-only 7/8); Udaya 8/8 ±1 दिन।
- Mercury में लाभ नहीं; Udaya थोड़ा खराब।
- Saturn Asta अस्थिर (4/6 matched, एक 10-day error); Jupiter कोई complete window नहीं निकाल पाया।

इसलिए multi-feature model को universal selector नहीं बनाया। Magnitude-only baseline अभी बेहतर overall choice है; Venus-specific elongation refinement को अलग शोध में रखा जाएगा। Unit test और सभी Panchang feature regressions बाद के commit में सफल हुए।


### Pithoragarh cross-location annual holdout

New Delhi के 8 Venus apparitions में से प्रत्येक Pithoragarh 2025 test apparition के समान New Delhi apparition को हटाकर 7 अलग apparitions से model train किया। फिर project Pithoragarh observer proxy (29.5828° N, 80.2182° E, 1650 m) पर conjunction-driven annual generator चलाया:
- March 2025: Asta exact (20 Mar); Udaya 1 दिन पहले (22 बनाम 23 Mar)।
- Dec 2025–Feb 2026: Asta और Udaya दोनों exact (11 Dec, 2 Feb)।
- 2/2 windows matched, 3/4 boundaries exact, 4/4 ±1 दिन।

यह New Delhi→Pithoragarh का उपयोगी transfer evidence है, लेकिन source provider coordinates अज्ञात और Pithoragarh references केवल दो apparitions हैं। इसलिए इसे अभी Venus-only research evidence मानें, production acceptance नहीं।


### Local azimuth feature holdout

Local Sun–planet azimuth separation को magnitude के साथ test किया:
- Saturn Udaya 6/6 exact; Asta 6/6 ±1 दिन।
- Mercury में छोटा लाभ; Venus Udaya में 8/8 ±1 दिन, लेकिन Venus Asta बिगड़ा।
- Jupiter में complete candidate windows नहीं निकले।

इसलिए azimuth model universal नहीं। Saturn Udaya और Venus Udaya के लिए candidate है; Pithoragarh cross-location test के बिना अपनाना नहीं है।


## 10 नवम्बर 2026 — सभी ग्रहों का Pithoragarh cross-location diagnostic (user-transcribed holdout)

Pinned Astronomy Engine 2.1.19 के साथ New Delhi के independent published-reference samples से प्रत्येक ग्रह के Asta-start/Asta-end solar-altitude-at-local-horizon magnitude models fit किए। फिर Pithoragarh project observer (29.5828° N, 80.2182° E, 1650 m) पर conjunction-derived annual windows बिना Pithoragarh values से training किए निकाले। Evaluation references Pithoragarh के user-transcribed records हैं; वे primary Drik pages से independently re-captured नहीं हैं और acceptance-eligible नहीं हैं।

| ग्रह | Holdout windows | Asta MAE / max | Udaya MAE / max | स्थिति |
|---|---:|---:|---:|---|
| बुध | 19 | 0.737 / 2 दिन | 0.579 / 3 दिन | promising, exact-date gate fail |
| शुक्र | 5 | 0.800 / 2 दिन | 0.600 / 2 दिन | promising, exact-date gate fail |
| मंगल | — | — | — | केवल 2 training samples; model unavailable |
| गुरु | 3 | 0 / 0 दिन | 0.333 / 1 दिन | promising, sample छोटा और references user-transcribed |
| शनि | 3 | 0 / 0 दिन | 0 / 0 दिन | promising, sample छोटा और references user-transcribed |

सभी उपलब्ध holdout windows one-to-one match हुए; पर यह model-validation का केवल transfer diagnostic है। New Delhi provider coordinates undisclosed हैं और Pithoragarh target dates user-transcribed हैं। इस कारण इन results को independent Drik validation, universal accuracy या production acceptance नहीं कहना है। विशेषतः बुध में 3-दिन का अधिकतम Udaya error और शुक्र में 2-दिन की त्रुटि मौजूद है।

### अगला निर्णायक कार्य
1. Pithoragarh Mercury, Venus, Jupiter, Saturn के source pages को city selector + year selector सहित independently capture करें; user transcriptions को acceptance ledger में promote न करें।
2. Mercury के superior/inferior conjunction और retrograde/direct subsets पर अलग signed error निकालें।
3. Jupiter/Saturn के वर्तमान 3-window holdouts को कम-से-कम 3 अतिरिक्त वर्षों/अन्य city holdouts से बढ़ाएँ।
4. Mars के लिए New Delhi तथा Pithoragarh दोनों में पर्याप्त independently captured windows के बिना fitted model publish न करें।
5. जब तक exact-date tolerance पूरी न हो, candidate JSON में uncertainty/status रहे और main Panchang में verified Tara Asta time न दिखे।


## 10 नवम्बर 2026 — प्रत्यक्ष Pithoragarh Drik data और स्वतंत्र holdout

### Direct source ledger
Playwright Chromium से पाँचों ग्रहों के 2024–2027 named-city Drik annual pages capture किए:
- 20/20 pages HTTP 200; page title और body दोनों में Pithoragarh तथा ग्रह की पुष्टि।
- 43 annual-page rows; overlap हटाकर 40 unique Tara Asta windows।
- 86 minute-precision start/end boundaries; raw source date/clock, normalized Asia/Kolkata local instant और UTC instant सुरक्षित।
- 24+ hour rollover के 43 boundary examples; raw notation को overwrite नहीं किया।
- 2027 Mars page पर कोई boundary row extract नहीं हुई; इसे no-event assertion नहीं माना।
- पुराने benchmark के 37 Pithoragarh records के start/end times 37/37 direct pages से exact match हुए।

Canonical dataset अब main में PR #298 से merge है:
`data/drik-pithoragarh-asta-udaya-2024-2027.json`
Source coordinates/elevation Drik publish नहीं करता; ये direct named-city references city-label-only हैं। Project observer 29.5828° N, 80.2182° E, 1650 m है, पर provider के internal observer के बराबर होने का दावा नहीं।

### New Delhi-trained blind transfer results
Independent New Delhi Drik samples से fit magnitude-only model को 40 unique direct Pithoragarh windows पर test किया:
- Mercury: 25/25 matched; Asta MAE 0.760 d (max 2 d), Udaya MAE 0.600 d (max 3 d)
- Venus: 5/5 matched; Asta MAE 0.800 d (max 2 d), Udaya MAE 0.600 d (max 2 d)
- Jupiter: 4/4 matched; Asta 4/4 exact, Udaya 3/4 exact (MAE 0.250 d; max 1 d)
- Saturn: 4/4 matched; Asta और Udaya दोनों 4/4 exact
- Mars: केवल 2 unique windows; independent New Delhi calibration samples अपर्याप्त, इसलिए model unavailable

### Pithoragarh local leave-one-year-out results
हर held-out year को छोड़कर बाकी direct Pithoragarh years पर magnitude-only model fit किया:
- Mercury: Asta MAE 0.333–1.000 d (max 2 d); Udaya MAE 0.429–1.167 d (max 3 d)
- Venus: Asta max 2 d; Udaya max 1 d
- Jupiter: एक 2024 fold में Asta/Udaya 1 d; 2025–2027 folds exact
- Saturn: 2024 Asta 1 d; अन्य folds exact
- Local horizon clock comparison में Mercury का अधिकतम clock-of-day error 8 min Asta / 7 min Udaya; Venus 2/3 min; Jupiter 4/3 min; Saturn 4/1 min।

**निर्णय:** actual local horizon event clock उपयोगी रूप से सटीक है; मुख्य शेष त्रुटि सही civil date चुनने में है। Mercury/Venus का magnitude-only date model अभी production tolerance पास नहीं करता। Jupiter/Saturn promising हैं, पर चार annual windows और undisclosed provider coordinates के कारण इसे सभी स्थानों/वर्षों के लिए final proof नहीं मानेंगे। किसी ग्रह का production card तभी बनेगा जब date model blind holdouts में exact-date gate पास करे।

### अगला model experiment
Mercury/Venus के लिए geocentric apparent ecliptic longitude rate और retrograde/direct state को optional model features बनाया गया है। Motion feature के बिना model baseline behavior unchanged रहेगा। नया LOYO report magnitude-only, magnitude+retrograde, magnitude+longitude-rate और combined model variants की तुलना करेगा। किसी एक अच्छे fold से model lock नहीं होगा।


### 10 नवम्बर 2026 — Mercury/Venus feature-model comparison

Direct Pithoragarh data पर 2024–2027 leave-one-year-out folds में 25 Mercury windows के लिए:
- Magnitude-only: Asta MAE 0.680 d / max 2 d; Udaya 0.680 d / max 3 d.
- Magnitude + retrograde flag: 0.720 / 2 d; Udaya 0.640 / 3 d — consistent improvement नहीं।
- Magnitude + geocentric longitude rate: Asta 0.520 / max 2 d; Udaya 0.680 / max 3 d — Asta में modest gain, Udaya में नहीं।
- Magnitude + illuminated fraction: Asta 0.560 / max 2 d; Udaya 0.320 / max 1 d.
- Magnitude + elongation + local azimuth separation + illuminated fraction: **Asta 0.480 / max 2 d; Udaya 0.240 / max 1 d**.
- Geometry + motion combined model: Asta 0.720 / max 3 d; Udaya 0.320 / max 1 d — overfit/unstable, reject.

Venus के केवल पाँच unique windows हैं; अतिरिक्त feature models के कई folds में training sample पर्याप्त नहीं या feature matrix singular है। Venus model अभी lock नहीं।

**अगला experiment:** actual local event direction (rise vs set) को model feature के रूप में जोड़कर Mercury LOYO में जाँचना। यह feature selector और tests में जोड़ा गया है; latest CI report अभी चल रहा है। किसी भी candidate का maximum 2-day Asta residual होने पर वह exact-date production gate पास नहीं करता।


### Motion-feature model comparison — 10 नवम्बर 2026 CI

Latest commit `e72c70eea7c0e2920478b508f72ba045f76f26bc`:
- Browser phase-diagnostics workflow: success; direct Drik capture, ledger validation, New Delhi blind holdout, Pithoragarh LOYO, selector unit tests, feature comparison और no-production-visible-change regression सभी सफल।
- PR #278 CodeQL JavaScript/TypeScript और Actions दोनों सफल।

Mercury 25/25 matched across four held-out years:
- Magnitude-only baseline aggregate date MAE: Asta 0.680 d; Udaya 0.680 d; maxima 2/3 d.
- Best balanced tested candidate, magnitude + event direction + magnitude×direction interaction: Asta MAE 0.320 d, Udaya MAE 0.360 d; both max error 1 day. Asta/Udaya local clock-of-day MAE 1.68/2.16 min; maxima 8/7 min.
- Magnitude + direction + longitude-rate: Asta MAE 0.440 d, Udaya 0.240 d; max 1 day for both.
- Adding retrograde state or combined multi-feature motion did not improve consistently; the most complex motion variant lost one matched event and had worse 2027 Asta error. Retrograde is therefore measured, but not selected as a production coefficient yet.

Venus: only five unique windows across 2024–2027 (one or two per year). Magnitude-only matched 5/5 with date MAE 0.600 d Asta / 0.400 d Udaya (max 2/1 d). Feature-rich models frequently lacked enough non-held-out training rows; no Venus motion model is justified from this sample.

**Production gate remains closed for both Mercury and Venus:** best Mercury model still has a one-day civil-date miss; Venus evidence is too sparse and includes a two-day Asta miss. Clock-of-day agreement is encouraging, but correct clock on the wrong civil date is not an acceptable published boundary. Keep current production behavior unchanged until more independent multi-city/multi-year direct reference windows establish an exact-date model.


### Five-city direct Drik page capture — 10 नवम्बर 2026

Playwright Chromium ने 5 cities × 5 planets × 5 requested years (2024–2028) के कुल 125 named-city pages खोले। हर page पर rendered city और planet सत्यापित हुए; 125/125 दोनों checks पास।

**Year selector की अलग जाँच जरूरी निकली:** 2028 माँगने पर सभी 25 pages ने 2027 का title/body render किया। इसलिए ये pages city+planet के लिए loaded हैं, लेकिन requested year के लिए valid नहीं। इनके 50 windows को `provisionalWindows` में रखा है; `acceptanceEligible=false`, model training/holdout से बाहर। कोई 2028 event दावा नहीं किया गया।

सही rendered year वाले 2024–2027 के 100 pages से:
- 430 acceptance-eligible boundary rows / 215 raw annual-page windows
- overlap हटाने पर 200 unique windows, प्रत्येक city में 40
- अतिरिक्त 100 boundary rows / 50 year-mismatched provisional windows अलग quarantine में
- प्रत्येक city: 20/20 requested-year-verified pages; 43 raw windows → 40 unique windows
- प्रत्येक planet: 20/20 requested-year-verified pages; Mercury 130, Venus 30, Mars 15, Jupiter 20, Saturn 20 raw windows

**Pithoragarh reconciliation:** five-city capture के 40 unique Pithoragarh windows dedicated direct Pithoragarh dataset के 40 unique windows से 40/40 exact boundary match करते हैं। यह independent recapture reconciliation है; दोनों captures उसी Drik provider के हैं, इसलिए independent provider evidence नहीं।

Mars 2027 pages में event rows नहीं थीं, लेकिन explicit “Total Asta Duration = 0 Days” नहीं था। उन्हें “no-window-listed-not-zero-proof” रखा है; zero-event conclusion नहीं निकाला।

Dataset:
`data/drik-multicity-asta-udaya-2024-2028.json`

Source observer coordinates/elevation Drik ने नहीं दिए; सभी accepted comparisons city-label-only हैं, coordinate-grade नहीं। Dataset tests अब requested year, 24+ normalization, duplicate annual overlap, exact Pithoragarh reconciliation और zero-event non-inference को enforce करते हैं।


### Five-city leave-one-city-out transfer — 10 नवम्बर 2026

200 unique, requested-year-verified Drik windows से city-wise blind transfer किया: हर बार एक पूरा शहर holdout रहा और model केवल बाकी चार शहरों के windows पर fit हुआ। प्रत्येक planet के लिए magnitude-only, magnitude+event-direction interaction और richer local-geometry variants तुलना किए।

Best simple model per planet:
| ग्रह | Holdout events | Asta date MAE / max | Udaya date MAE / max |
|---|---:|---:|---:|
| Mercury — magnitude + event direction | 125/125 | 0.192 / 1 दिन | 0.080 / 1 दिन |
| Venus — magnitude + event direction | 25/25 | 0.240 / 1 दिन | 0.360 / 1 दिन |
| Jupiter — magnitude-only | 20/20 | 0.200 / 1 दिन | 0.100 / 1 दिन |
| Saturn — magnitude-only | 20/20 | 0.050 / 1 दिन | 0.150 / 1 दिन |
| Mars | 0/10 matched | unavailable | unavailable |

Best simple model में Mercury के 125 में 101 Asta और 115 Udaya dates exact; Venus 19/25 और 16/25; Jupiter 16/20 और 18/20; Saturn 19/20 और 17/20 exact। सभी matched simple-model predictions अधिकतम एक civil day के भीतर हैं। Mars के 10 holdout windows में कोई candidate 30-day matching gate के भीतर नहीं मिला।

Richer geometry model ने कुछ folds में 20–35 दिन तक गलत Udaya boundaries चुनीं; इसे reject किया। Mercury/Venus में event-direction interaction उपयोगी है; Jupiter/Saturn के लिए extra geometry लाभ नहीं देती।

**महत्त्वपूर्ण सीमा:** ये city-centre proxy observers पर city-label holdouts हैं; Drik के exact internal coordinates/elevation उपलब्ध नहीं। 1-day maximum error अभी भी exact published-date acceptance gate fail करता है। इसलिए इसे मजबूत calibration evidence मानें, production proof नहीं। नए clock-of-day error metrics भी जोड़े गए हैं ताकि अगली CI run में तारीख और समय की त्रुटि अलग-अलग दिखाई दे।
