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

## कार्य के अनिवार्य चरण

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
