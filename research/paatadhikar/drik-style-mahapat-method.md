# दृक्-आधारित पाताधिकार गणना

स्थिति: 2026–2030 के लिए शोध-उम्मीदवार; अभी सार्वजनिक पंचांग में नहीं। सक्रिय कार्य: https://github.com/OurHinduDharm/Panchang/issues/482 ; implementation PR #478।

24 नवम्बर की [स्वतंत्र गणना, पाँच अपवाद और शास्त्रीय स्रोत](./independent-contact-audit.md) में दोनों ephemeris, 19 मार्च और 2025 का पूरा मिलान है।

## मुख्य निर्णय

पाताधिकार की मुख्य गणना दृक्-गणित से होगी। सूर्यसिद्धान्त XI.14–15 का स्थित्यर्ध सूत्र प्राथमिक समय या वर्ष तय नहीं करेगा; वह वैकल्पिक शास्त्रीय तुलना के रूप में ही रहेगा। `scripts/compare-mahapat-ephemeris.mjs` में primary `startTimeIST`/`endTimeIST` दृक्-शैली के apparent declination-band contacts हैं।

यह आधुनिक geocentric apparent ephemeris पर आधारित **Drik-style** विधि है; इसे किसी एक प्रकाशित पंचांग के आंतरिक कोड का हूबहू पुनरुत्पादन न कहें। ताराप्रसाद का दृक्-आधारित डेटा और Drik Panchang windows स्वतंत्र cross-check हैं। पंचांगों में प्रयुक्त ग्रह-स्थिति/स्पर्श-मोक्ष नियम अलग हों तो उनका अंतर स्पष्ट दर्ज होगा, उन्हें fit करके नहीं मिटाया जाएगा।

## ताराप्रसाद की contact-definition का सुधार

`--contact-model=taraprasad-30-arcmin` अब 30 कला = 0.5° की स्पष्ट सीमा पर स्पर्श-मोक्ष निकालता है। 61 उपलब्ध मुद्रित endpoints में 55 का implied क्रान्ति-अन्तर 30 कला से 0.5 कला के भीतर है। यह source-data से निकला convention inference है; ताराप्रसाद के मूल सूत्र की स्वतंत्र पुष्टि अभी बाकी है। कोई प्रति-तिथि offset या coefficient optimization नहीं।

`node scripts/audit-mahapat-references.mjs` इस profile को चुनकर apparent-disks baseline से तुलना करता है। 30 पूरे records में 24 के दोनों समय 1 मिनट और 26 के 3 मिनट के भीतर हैं; median absolute अन्तर 0.374/0.281 मिनट। पंक्तियाँ 1 (अधूरी), 3, 9, 25, 26 review में हैं। जनवरी 2024 का लगभग 20 मिनट का एकतरफा अन्तर भी अब स्पष्ट दर्ज है। नीचे पुराना 6.77/7.66 मिनट वाला आँकड़ा apparent-disks baseline का है। पूरी नई सारणी `taraprasad-reference-audit.md` में है।

Default `apparent-disks` का boundary definition और पुराने Drik fixtures अपरिवर्तित हैं। नया profile अलग स्रोत के 30-कला नियम को स्पष्ट करता है; यह दो सार्वजनिक विधियों का UI नहीं है।

## गणना क्रम

1. एक ही UTC क्षण पर सूर्य और चन्द्र के apparent geocentric tropical ecliptic longitude/latitude और true obliquity लें। चन्द्र की ecliptic latitude शामिल हो; उससे apparent equatorial declinations निकालें।
2. सूर्य-चन्द्र tropical longitude sum का 180° (व्यतीपात) या 360° (वैधृति) crossing केवल खोज का seed है। इसे स्वयं पात का मध्य न मानें।
3. seed के ±3 दिन में सभी true declination-equality roots खोजें। फिर हर root को अयन और क्रान्ति-गोल से वर्गीकृत करें: व्यतीपात में विपरीत अयन और समान-चिह्न क्रान्तियाँ, इसलिए `δMoon − δSun = 0`; वैधृति में समान अयन और विपरीत-चिह्न क्रान्तियाँ, इसलिए `δMoon + δSun = 0`। अपेक्षित वर्ग के प्रत्येक मूल पर दोनों सिरे हल होंगे। समान क्रान्ति लेकिन गलत अयन वाला root अलग पात नहीं है; उसे rejected diagnostic में रखें। दो मध्य एक ही सतत अन्तराल में हों तो दोनों सिरे स्वतंत्र रूप से मिलाने के बाद उन्हें साथ दर्ज करें।
4. स्पर्श-मोक्ष की primary boundaries apparent declination-band contact से निकालें। व्यतीपात के लिए `|δMoon − δSun| − (rSun + rMoon) = 0`; वैधृति के लिए `|δMoon + δSun| − (rSun + rMoon) = 0`, जहाँ `rSun` और `rMoon` apparent semidiameters हैं। मध्य के पहले/बाद के समीपस्थ roots स्पर्श और मोक्ष हैं।
5. सभी roots को UTC में solve करें; प्रकाशित समय को Asia/Kolkata में बदलें। भौगोलिक स्थान इन geocentric instants को नहीं बदलता, केवल timezone-प्रस्तुति बदलती है।

`research/paatadhikar/mahapata-math.mjs` event class और क्रान्ति-साम्य के independent unit checks रखता है। `research/paatadhikar/surya-siddhanta-xi.mjs` श्लोक 14–15 के वैकल्पिक duration comparator की गणना करता है; मुख्य candidate interval इससे नहीं बनता।

## मौजूदा cross-check स्थिति

- जनवरी 2026 के नमूने में apparent-band candidate 13 जनवरी 00:16–06:30 IST है; समान मध्य के आसपास सूर्यसिद्धान्त XI.14–15 comparator 02:12–04:29 IST देता है। दोनों अलग fields में हैं।
- 2026 के साझा Drik windows नमूनों में कुछ मिनट तक मिलते हैं; 2027–2028 के स्वतंत्र full-year संदर्भों से भी जांच हुई है।
- 19 मार्च 2026 का मोक्ष राजस्थान पत्रिका से उसी मिनट में मिलता है। Drik की वार्षिक सूची में यह प्रविष्टि अनुपस्थित है। पुराने मॉडल का 25 दिसम्बर वाला window class-filter के बाद हट चुका है।
- पुराने बिना class-filter वाले मॉडल का 19–21 दिसम्बर 2029 का लम्बा interval वर्तमान मॉडल में नहीं है। पुराने दस्तावेज़ का यह दावा हटाया गया है।
- 2026–2030 में कुल 8 review items हैं: 4 में ±3 दिन के भीतर कोई equal-declination root नहीं मिला; 4 में roots थे पर सभी गलत ayana/gola वर्ग के थे। 2030 के पाँच review items में एक wrong-class roots वाला और चार no-root seeds हैं।
- उपयोगकर्ता द्वारा दिए ताराप्रसाद रामनगर 2023–24 के 30 पूरे touch/release intervals के backtest में 30/30 का उसी event-class का candidate 24 घंटे के भीतर मिला। Median absolute आरम्भ-अंतर 6.77 मिनट और अन्त-अंतर 7.66 मिनट (सम संख्या में बीच के दोनों मानों का औसत) है।
- 21 जून 2023 उदाहरण में निकटतम समान-क्रान्ति root 16 जून था, पर उसका eventClass `null` (अयन-शर्त असफल) है। Class filter के बाद 21 जून 13:25 IST candidate चुना गया; Tara Prasad आरम्भ 13:29 IST देता है। यही संदर्भ बताता है कि केवल nearest declination root चुनना गलत था।
- 30 पूरे records में केवल 21 के दोनों endpoints 10 मिनट के भीतर और 27 के 30 मिनट के भीतर हैं। सबसे बड़ा पूरा-record अन्तर 61.65 मिनट है। एक अधूरे record (22 मार्च 2023, केवल मोक्ष उपलब्ध) का मोक्ष-अन्तर −203.88 मिनट है; इसे पहले backtest में छोड़ दिया गया था। यह reference/model discrepancy है, किसी स्रोत की गलती सिद्ध नहीं।
- `--audit` पूरे वर्ष में longitude seeds से स्वतंत्र equality-root search करता है। 2026–2030 में 60 और 30 मिनट sampling दोनों पर 135 class-correct roots मिले; सभी primary output में हैं, कोई duplicate या 24 घंटे से बड़ा interval नहीं। यह sampled numerical completeness है, बाहरी पंचांग का प्रमाण या unsampled tangency की गारंटी नहीं।
- प्रत्येक source row का signed delta, partial/missing/ambiguous status और बड़े अन्तर `research/paatadhikar/taraprasad-reference-audit.md` में हैं। गणना: `node scripts/audit-mahapat-references.mjs`।

इसलिए सभी परिणाम `research-only` हैं। Public UI से जोड़ने से पहले अतिरिक्त वर्षों, अतिरिक्त Drik/Tara Prasad नमूनों और 2029/2030 edge cases की जांच चाहिए। कोई missing root अनुमान से नहीं बनाया जाएगा।

## चलाना

```sh
npm install --no-save astronomy-engine@2.1.19
node --test tests/paatadhikar-mahapata-math.test.mjs tests/paatadhikar-astronomy-engine.integration.mjs tests/mahapata-reference-check.test.mjs tests/mahapat-taraprasad-backtest.test.mjs
node scripts/compare-mahapat-ephemeris.mjs
node scripts/compare-mahapat-ephemeris.mjs --years=2023,2024
node scripts/compare-mahapat-ephemeris.mjs --audit --audit-step-minutes=30
node scripts/audit-mahapat-references.mjs
node scripts/compare-mahapat-ephemeris.mjs --years=2023,2024 --contact-model=taraprasad-30-arcmin
```
