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
