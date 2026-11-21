# दृक्-आधारित पाताधिकार गणना

स्थिति: 2026–2030 के लिए शोध-उम्मीदवार; अभी सार्वजनिक पंचांग में नहीं।

## मुख्य निर्णय

पाताधिकार की मुख्य गणना दृक्-गणित से होगी। सूर्यसिद्धान्त XI.14–15 का स्थित्यर्ध सूत्र प्राथमिक समय या वर्ष तय नहीं करेगा; वह वैकल्पिक शास्त्रीय तुलना के रूप में ही रहेगा। `scripts/compare-mahapat-ephemeris.mjs` में primary `startTimeIST`/`endTimeIST` दृक्-शैली के apparent declination-band contacts हैं।

यह आधुनिक geocentric apparent ephemeris पर आधारित **Drik-style** विधि है; इसे किसी एक प्रकाशित पंचांग के आंतरिक कोड का हूबहू पुनरुत्पादन न कहें। ताराप्रसाद का दृक्-आधारित डेटा और Drik Panchang windows स्वतंत्र cross-check हैं। पंचांगों में प्रयुक्त ग्रह-स्थिति/स्पर्श-मोक्ष नियम अलग हों तो उनका अंतर स्पष्ट दर्ज होगा, उन्हें fit करके नहीं मिटाया जाएगा।

## गणना क्रम

1. एक ही UTC क्षण पर सूर्य और चन्द्र के apparent geocentric tropical ecliptic longitude/latitude और true obliquity लें। चन्द्र की ecliptic latitude शामिल हो; उससे apparent equatorial declinations निकालें।
2. सूर्य-चन्द्र tropical longitude sum का 180° (व्यतीपात) या 360° (वैधृति) crossing केवल खोज का seed है। इसे स्वयं पात का मध्य न मानें।
3. seed के ±3 दिन में सभी true declination-equality roots खोजें। फिर हर root को अयन और क्रान्ति-गोल से वर्गीकृत करें: व्यतीपात में विपरीत अयन और समान-चिह्न क्रान्तियाँ, इसलिए `δMoon − δSun = 0`; वैधृति में समान अयन और विपरीत-चिह्न क्रान्तियाँ, इसलिए `δMoon + δSun = 0`। केवल अपेक्षित वर्ग का निकटतम root मध्य-पात बनेगा। समान क्रान्ति लेकिन गलत अयन वाला root अलग पात नहीं है; उसे rejected diagnostic में रखें। एक से अधिक class-correct roots हों तो सभी review में रखें।
4. स्पर्श-मोक्ष की primary boundaries apparent declination-band contact से निकालें। व्यतीपात के लिए `|δMoon − δSun| − (rSun + rMoon) = 0`; वैधृति के लिए `|δMoon + δSun| − (rSun + rMoon) = 0`, जहाँ `rSun` और `rMoon` apparent semidiameters हैं। मध्य के पहले/बाद के समीपस्थ roots स्पर्श और मोक्ष हैं।
5. सभी roots को UTC में solve करें; प्रकाशित समय को Asia/Kolkata में बदलें। भौगोलिक स्थान इन geocentric instants को नहीं बदलता, केवल timezone-प्रस्तुति बदलती है।

`research/paatadhikar/mahapata-math.mjs` event class और क्रान्ति-साम्य के independent unit checks रखता है। `research/paatadhikar/surya-siddhanta-xi.mjs` श्लोक 14–15 के वैकल्पिक duration comparator की गणना करता है; मुख्य candidate interval इससे नहीं बनता।

## मौजूदा cross-check स्थिति

- जनवरी 2026 के नमूने में apparent-band candidate 13 जनवरी 00:16–06:30 IST है; समान मध्य के आसपास सूर्यसिद्धान्त XI.14–15 comparator 02:12–04:29 IST देता है। दोनों अलग fields में हैं।
- 2026 के साझा Drik windows नमूनों में कुछ मिनट तक मिलते हैं; 2027–2028 के स्वतंत्र full-year संदर्भों से भी जांच हुई है।
- 2026 में दो अतिरिक्त apparent-band windows (19 मार्च और 25 दिसम्बर) की source reconciliation बाकी है।
- 2029 में एक Vaidhriti interval लगभग 19 दिसम्बर 02:40 से 21 दिसम्बर 07:46 IST तक फैलता है और इसमें दो true-declination crossings हैं; स्वतंत्र पुष्टि जरूरी है।
- 2026–2030 में कुल 8 review items हैं: 4 में ±3 दिन के भीतर कोई equal-declination root नहीं मिला; 4 में roots थे पर सभी गलत ayana/gola वर्ग के थे। 2030 के पाँच review items में एक wrong-class roots वाला और चार no-root seeds हैं।
- उपयोगकर्ता द्वारा दिए ताराप्रसाद रामनगर 2023–24 के 30 पूरे touch/release intervals के backtest में 30/30 का उसी event-class का candidate 24 घंटे के भीतर मिला। Median absolute आरम्भ-अंतर 6.8 मिनट और अन्त-अंतर 8.2 मिनट है।
- 21 जून 2023 उदाहरण में निकटतम समान-क्रान्ति root 16 जून था, पर उसका eventClass `null` (अयन-शर्त असफल) है। Class filter के बाद 21 जून 13:25 IST candidate चुना गया; Tara Prasad आरम्भ 13:29 IST देता है। यही संदर्भ बताता है कि केवल nearest declination root चुनना गलत था।
- यह मजबूत backtest है, सर्वव्यापी प्रमाण नहीं। 2026 के अतिरिक्त windows, 2029 का लम्बा interval और 2030 review items अभी जाँचने हैं।

इसलिए सभी परिणाम `research-only` हैं। Public UI से जोड़ने से पहले अतिरिक्त वर्षों, अतिरिक्त Drik/Tara Prasad नमूनों और 2029/2030 edge cases की जांच चाहिए। कोई missing root अनुमान से नहीं बनाया जाएगा।

## चलाना

```sh
npm install --no-save astronomy-engine@2.1.19
node --test tests/paatadhikar-mahapata-math.test.mjs tests/paatadhikar-astronomy-engine.integration.mjs tests/mahapata-reference-check.test.mjs tests/mahapat-taraprasad-backtest.test.mjs
node scripts/compare-mahapat-ephemeris.mjs
node scripts/compare-mahapat-ephemeris.mjs --years=2023,2024
```
