# पाताधिकार: गणना-परिभाषा और स्वतंत्र सत्यापन

स्थिति: **research-only** — यह फ़ाइल किसी महापात का समय प्रकाशित नहीं करती।

## आवश्यक भेद

1. **नित्य योग**: निरयण सूर्य-चन्द्र दीर्घांश का योग, 27 बराबर खण्डों (प्रत्येक 13°20′) में। 17वाँ व्यतीपात और 27वाँ वैधृति नामित नित्य योग हैं।
2. **महापात / पाताधिकार**: केवल नित्य योग का नाम मिल जाने से महापात सिद्ध नहीं होता। पारंपरिक पाताधिकार में सूर्य-चन्द्र क्रान्ति, उनकी दिशाएँ और ग्रन्थ-विशिष्ट पात-शर्तें अलग जाँची जाती हैं।
3. **दृक् गणित**: आधुनिक apparent geocentric सूर्य-चन्द्र निर्देशांकों से क्रान्ति निकालने का मार्ग; केवल दीर्घांश-योग या 180°/360° crossing को महापात बताना निषिद्ध है।

## स्वतंत्र मॉड्यूल का प्रस्तावित अनुबंध

Input: UTC instant; ephemeris provider returning apparent geocentric tropical ecliptic longitude and latitude for Sun/Moon; obliquity of date; optional ayanamsha **केवल नित्य-योग के लिए**।

Output (internal): सूर्य और चन्द्र की apparent equatorial declination; क्रान्ति-दिशा; event function का मान; numerical bracket; refined UTC instant; ग्रन्थीय rule ID; uncertainty and validation status।

Ecliptic-to-equatorial conversion (same epoch/frame for all angles):

```text
sin(delta) = sin(beta) cos(epsilon)
           + cos(beta) sin(epsilon) sin(lambda)
delta = asin(clamp(sin(delta), -1, 1))
```

इसमें चन्द्र की ecliptic latitude `beta` को शून्य मानना उचित नहीं है। सूर्य/चन्द्र के apparent positions, obliquity और timescale एक ही परिभाषा में हों। Topocentric और geocentric क्रान्ति का मिश्रण न करें।

## अभी अनिर्णीत: महापात की घटना-शर्त

किसी भी `delta_sun ± delta_moon = 0` समीकरण को **शास्त्रीय महापात** के रूप में चुनने से पहले पाताधिकार के मूल श्लोक/टीका से व्यतीपात तथा वैधृति के लिए अलग दिशा, sign और interval नियम की पुष्टि चाहिए। इस चरण में दोनों संभावित residuals केवल diagnostic हैं, final event definitions नहीं।

## परीक्षण-क्रम

- UTC/IST रूपान्तरण और वर्ष-सीमा (31 दिसम्बर/1 जनवरी)।
- एक ही ephemeris frame, obliquity और timescale; apparent/geometric भेद।
- Root solver में sign-changing bracket, tangent root और multiple roots अलग संभालना।
- Declination के sign और सूर्य-चन्द्र की दिशा के साथ event-class validation।
- स्वतंत्र पंचांग/प्रकाशित शास्त्रीय उदाहरणों से तिथि और समय का अलग मिलान।
- कोई validated event नहीं तो सार्वजनिक UI में अनुमानित समय न दें।

## कार्य-सीमा

यह शोध मुख्य पंचांग, वार्षिक गुरु-शुक्र-अगस्त्य डेटा या production UI को नहीं बदलता। शास्त्रीय event definition की पुष्टि के बाद ही अलग JS module, unit tests और accepted benchmark fixtures जोड़ें।
