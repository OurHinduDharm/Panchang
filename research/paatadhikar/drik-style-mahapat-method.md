# दृक्-आधारित पाताधिकार गणना

स्थिति: 2026–2030 के लिए शोध-उम्मीदवार; अभी सार्वजनिक पंचांग में नहीं।

## मुख्य निर्णय

पाताधिकार की मुख्य गणना दृक्-गणित से होगी। सूर्यसिद्धान्त XI.14–15 का स्थित्यर्ध सूत्र प्राथमिक समय या वर्ष तय नहीं करेगा; वह वैकल्पिक शास्त्रीय तुलना के रूप में ही रहेगा। `scripts/compare-mahapat-ephemeris.mjs` में primary `startTimeIST`/`endTimeIST` दृक्-शैली के apparent declination-band contacts हैं।

यह आधुनिक geocentric apparent ephemeris पर आधारित **Drik-style** विधि है; इसे किसी एक प्रकाशित पंचांग के आंतरिक कोड का हूबहू पुनरुत्पादन न कहें। ताराप्रसाद का दृक्-आधारित डेटा और Drik Panchang windows स्वतंत्र cross-check हैं। पंचांगों में प्रयुक्त ग्रह-स्थिति/स्पर्श-मोक्ष नियम अलग हों तो उनका अंतर स्पष्ट दर्ज होगा, उन्हें fit करके नहीं मिटाया जाएगा।

## गणना क्रम

1. एक ही UTC क्षण पर सूर्य और चन्द्र के apparent geocentric tropical ecliptic longitude/latitude और true obliquity लें। चन्द्र की ecliptic latitude शामिल हो; उससे apparent equatorial declinations निकालें।
2. सूर्य-चन्द्र tropical longitude sum का 180° (व्यतीपात) या 360° (वैधृति) crossing केवल खोज का seed है। इसे स्वयं पात का मध्य न मानें।
3. seed के ±3 दिन में सही event class वाला निकटतम true root खोजें: व्यतीपात में विपरीत अयन और समान-चिह्न क्रान्तियाँ, इसलिए `δMoon − δSun = 0`; वैधृति में समान अयन और विपरीत-चिह्न क्रान्तियाँ, इसलिए `δMoon + δSun = 0`। यह true root मध्य-पात है। अतिरिक्त roots हों तो उन्हें review में रखें।
4. स्पर्श-मोक्ष की primary boundaries apparent declination-band contact से निकालें। व्यतीपात के लिए `|δMoon − δSun| − (rSun + rMoon) = 0`; वैधृति के लिए `|δMoon + δSun| − (rSun + rMoon) = 0`, जहाँ `rSun` और `rMoon` apparent semidiameters हैं। मध्य के पहले/बाद के समीपस्थ roots स्पर्श और मोक्ष हैं।
5. सभी roots को UTC में solve करें; प्रकाशित समय को Asia/Kolkata में बदलें। भौगोलिक स्थान इन geocentric instants को नहीं बदलता, केवल timezone-प्रस्तुति बदलती है।

`research/paatadhikar/mahapata-math.mjs` event class और क्रान्ति-साम्य के independent unit checks रखता है। `research/paatadhikar/surya-siddhanta-xi.mjs` श्लोक 14–15 के वैकल्पिक duration comparator की गणना करता है; मुख्य candidate interval इससे नहीं बनता।

## मौजूदा cross-check स्थिति

- जनवरी 2026 के नमूने में apparent-band candidate 13 जनवरी 00:16–06:30 IST है; समान मध्य के आसपास सूर्यसिद्धान्त XI.14–15 comparator 02:12–04:29 IST देता है। दोनों अलग fields में हैं।
- 2026 के साझा Drik windows नमूनों में कुछ मिनट तक मिलते हैं; 2027–2028 के स्वतंत्र full-year संदर्भों से भी जांच हुई है।
- 2026 में दो अतिरिक्त apparent-band windows (19 मार्च और 25 दिसम्बर) की source reconciliation बाकी है।
- 2029 में एक Vaidhriti interval लगभग 19 दिसम्बर 02:40 से 21 दिसम्बर 07:46 IST तक फैलता है और इसमें दो true-declination crossings हैं; स्वतंत्र पुष्टि जरूरी है।
- 2030 के चार mean-pāta seeds में ±3 दिन के भीतर सही true root नहीं मिला; इन्हें event न मानकर review items रखा गया है।
- ताराप्रसाद 2023–24 का cross-method comparison अलग से दर्ज है। वह Drik-style परिणामों की पड़ताल में सहायक है, पर सूर्यसिद्धान्त comparator से तुलना primary Drik formula को अस्वीकार नहीं करती।

इसलिए सभी परिणाम `research-only` हैं। Public UI से जोड़ने से पहले अतिरिक्त वर्षों, अतिरिक्त Drik/Tara Prasad नमूनों और 2029/2030 edge cases की जांच चाहिए। कोई missing root अनुमान से नहीं बनाया जाएगा।

## चलाना

```sh
npm install --no-save astronomy-engine@2.1.19
node --test tests/paatadhikar-mahapata-math.test.mjs tests/paatadhikar-astronomy-engine.integration.mjs tests/mahapata-reference-check.test.mjs
node scripts/compare-mahapat-ephemeris.mjs
```
