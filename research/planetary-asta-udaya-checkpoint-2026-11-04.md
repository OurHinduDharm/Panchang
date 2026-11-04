# ग्रह उदय-अस्त शोध अभिलेख — तकनीकी परिशिष्ट
तिथि: 4 नवम्बर 2026  
शाखा: `test/lagnantara-venus-jupiter-location-swiss-crosscheck-20261103`  
आधार शोध commit: `b9ba0016ed32f5b6ef15b15d13019540a3c4ff54`  
उद्देश्य: 4 नवम्बर के शोध checkpoint में स्रोत-समीक्षा से निकले स्पष्ट निष्कर्ष और शेष सत्यापन सुरक्षित रखना।

## 1. इस जाँच में देखे गए GitHub तथ्य

- Main का ज्ञात HEAD: `5c45e3ddb386e38c3063cce8a2ec90fb52f6f5b5`
- शोध HEAD: `b9ba0016ed32f5b6ef15b15d13019540a3c4ff54`
- GitHub compare: शोध शाखा main से 82 commits आगे और 17 पीछे; स्थिति `diverged`।
- PR #263 Draft है। अभी merge, rebase, force-push या branch synchronization न करें।
- PR-linked workflow run `41842404100` (Lagnantara Venus/Jupiter observer + Swiss cross-check): success।
- PR-linked workflow run `41842404053` (Validate Panchang feature): success।
- ये सफलताएँ code-path/regression checks हैं; अंतिम खगोलीय शुद्धता या Drik equivalence का प्रमाण नहीं।
- Main commit `5c45e3d` के लिए commit-status endpoint ने अलग statuses नहीं लौटाए; इसे सफल workflow का विकल्प न मानें।

## 2. महत्त्वपूर्ण शब्द-सुधार: 24° और 24.217° एक ही प्रकार की राशि नहीं

शोध मॉड्यूल `ss_chapter3_lagnantara.js` और `ss_chapter7_drikkarma.js` में defaults अलग-अलग नामित हैं:

- `obliquityDeg = 24`
- `ayanamshaDeg = 24.217`

अतः मौजूदा कोड में 24.217° को **अयनांश (ayanāṃśa)** के रूप में इस्तेमाल किया गया है, obliquity के विकल्प के रूप में नहीं। आगे के अभिलेखों और UI में इन दोनों को “24° बनाम 24.217° obliquity” कहकर एक-दूसरे के विकल्प की तरह न लिखें।

स्रोत से पुष्ट:
- Sūrya-Siddhānta II.28 / Burgess commentary greatest declination (ecliptic obliquity) को 24° बताती है; sine 1397 और radius 3438 की परंपरागत मान-सरणी है। Burgess इसे ऐतिहासिक मान बताकर अपने समय के वास्तविक obliquity से अंतर भी बताता है।
- आधुनिक sidereal/tropical अंतर को ayanamsha कहा जाता है; Swiss Ephemeris documentation इसे tropical और sidereal longitude के बीच epoch-dependent अंतर बताता है। यह obliquity नहीं है।

स्रोत:
- Burgess, Sūrya-Siddhānta II.28 commentary, pp. 65–66 (PDF): https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf
- Swiss Ephemeris, §2.8.12: https://www.astro.com/swisseph/swephinfo_e.htm (वैकल्पिक उपलब्ध mirror: https://ephe.scryr.io/swisseph/doc/swisseph.htm)
- II.28 Sanskrit/translation display: https://www.siva.sh/surya-siddhanta/2/28

**अभी अनसुलझा:** कोड में प्रयुक्त स्थिर `24.217°` किस विशिष्ट अयनांश-परंपरा, epoch और coordinate frame से लिया गया है, इसकी पुष्टि नहीं हुई। इसे स्वतः Lahiri या किसी अन्य नामित अयनांश का सत्यापित 4 Nov 2026 मान न घोषित करें। सही समाधान में date-dependent value और source/frame स्पष्ट होना चाहिए।

## 3. Chapter III rising-asus पर स्रोत-पुष्टि

Burgess के Chapter III.43–45 में:
- लंका/समवृत्त के लिए राशि-उदयासु के आधार मान दिए गए हैं।
- अगले चरण में observer-place के चरखण्ड/ascensional-difference से स्थानीय rising-asus निकाले जाते हैं।
- III.46 में राशि के भीतर बीते/शेष अंशों को उस राशि के rising-asus से अनुपात में बदलने की प्रक्रिया है।

Swaveda पर Burgess पाठ की पंक्तियाँ 304–325 में III.43–45 और 329–342 में interpolation का विवरण उपलब्ध है:
https://www.swaveda.com/texts/surya-siddhanta/3/

यह मौजूदा Chapter III helper के sign-wise rising-asus तथा within-sign interpolation approach का स्रोत-संगत आधार देता है। फिर भी helper का पूर्ण frame mapping, ayanamsha application, और Chapter VII के साथ coupling स्वतंत्र रूप से प्रमाणित नहीं हुए हैं।

## 4. Chapter IX K/C की इकाई — स्रोत से पुनः पुष्टि

Burgess Chapter IX.6–11 में kālāṃśa को समय-डिग्री/कालांश के रूप में समझाता है। IX.11 में दैनिक ecliptic motion को संबंधित राशि के ascensional equivalent से गुणा करके 1800 से भाग देने की प्रक्रिया है; इससे longitude motion को time-motion में बदला जाता है। Burgess स्पष्ट करता है कि divisor raw longitude rate नहीं, oblique-ascension/time-motion rate होना चाहिए।

स्रोत:
- Burgess Chapter IX.10–11 commentary, PDF pp. 258–259: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf
- Chapter IX Sanskrit and computed section overview: https://vidhyamitra.com/surya-siddhanta/9

इसलिए Drik का प्रकाशित ecliptic angular separation सीधे K/C के कालांश से तुलनीय नहीं है। इस नियम को न बदलें।

## 5. Coordinate-frame conversion: अभी प्रमाणित नहीं

`ss_chapter7_drikkarma.js` में `convertLocalSiderealAngleObliquityFrame()` नाम का परिवर्तन है। यह source obliquity और target obliquity के बीच local sidereal angle बदलने का candidate formula लागू करता है:

`atan2(sin(theta), cos(theta) * cos(deltaEpsilon))`

यह कोड में एक ज्यामितीय व्युत्पत्ति के रूप में टिप्पणीबद्ध है, लेकिन इस शोध में किसी प्राथमिक खगोलीय/शास्त्रीय स्रोत या independently worked numerical example से इसकी पुष्टि नहीं हुई।

अगली जाँच:
1. स्पष्ट करें कि source और target frames में ecliptic/equinox axes, celestial pole और local meridian में से कौन-सी भौतिक/गणितीय वस्तुएँ स्थिर रखी जा रही हैं।
2. transformation को vector/rotation-matrix से स्वतंत्र रूप से निकालें।
3. कम-से-कम 0°, 90°, 180°, 270° और सामान्य स्थानीय sidereal angles पर numerical comparison करें।
4. आधुनिक apparent sidereal time, mean/apparent equinox, nutation और classical fixed-obliquity frame के भेद स्पष्ट करें।
5. तभी helper को production या final event-time path में उपयोग करें।

## 6. अभी तक के event diagnostics — final times नहीं

PR #263 की वर्तमान टिप्पणी/तालिका के अनुसार source-sequence daily brackets:
- Venus Asta: 11→12 Oct 2026
- Venus Udaya: 28→29 Oct 2026
- Jupiter Asta: 12→13 Aug 2027
- Jupiter Udaya: 12→13 Sep 2027

इन्हें केवल daily K=C brackets मानें। मिनट/सेकंड घटना-समय नहीं। Jupiter Asta का उपयोगकर्ता द्वारा दिए गए 16 Aug 2027 संदर्भ से लगभग तीन दिन का अंतर अभी unresolved है। Threshold fitting न करें।

## 7. परीक्षणों की सीमा

वर्तमान tests:
- Chapter III helper regression tests
- Chapter VII sequential dṛkkarma helper tests
- Chapter IX arithmetic, event classification और threshold-selection tests
- दो Pithoragarh observer inputs पर 4 event cases × 2 observers × 2 bracket samples = 16 browser rows
- Swiss और Astronomy Engine state comparison

ये tests implementation consistency और दो ephemeris-state sources के बीच sensitivity दिखाते हैं। ये:
- पुस्तक की अज्ञात तालिका का स्थान/समय-इकाई प्रमाणित नहीं करते;
- Drik के अघोषित internal coordinates/definitions से exact equivalence नहीं दिखाते;
- शास्त्रीय event-time equation को independently validate नहीं करते;
- वास्तविक optical visibility (extinction, altitude, elongation, sky brightness आदि) का मॉडल नहीं हैं।

## 8. पुस्तक-चित्रों की स्थिति

4 नवम्बर checkpoint में दर्ज चित्र IDs:
- `1000091056.jpg`
- `1000091045.jpg`
- `1000091009.jpg`
- `1000091048.jpg`

इस GitHub research session के runtime में ये image files उपलब्ध नहीं थीं; इसलिए कोई नया OCR/rotation/crop निष्कर्ष नहीं जोड़ा गया। उपयोगकर्ता से मूल चित्र पुनः उपलब्ध होने पर प्रत्येक panel को अलग source ID दें। विशेषकर 24 से बड़े printed time values को time-unit प्रमाणित होने तक clock time में convert न करें।

## 9. आगे की कार्य-सूची

1. पुस्तक के चारों मूल चित्र पुनः प्राप्त कर rotate/crop/OCR करें; panel/source boundaries सुरक्षित रखें।
2. पुस्तक का शीर्षक, प्रकाशक, संस्करण, पृष्ठ, गणना-स्थान, timezone और समय-इकाई प्रमाणित करें।
3. 1000091048 coordinate table से Pithoragarh और संभावित reference city की प्रविष्टि पढ़ें।
4. 24.217° ayanamsha का नाम, epoch, date dependence और frame निर्धारित करें।
5. Chapter VII local sidereal angle conversion की स्वतंत्र vector derivation करें।
6. Chapter IX.10–11 time-motion equation को source-faithful worked examples से जाँचें।
7. Jupiter 2027 तीन-दिवसीय अंतर को location, event branch, ephemeris, daily horizon sample और source equation के स्तर पर अलग-अलग जाँचें।
8. संयुक्त checks और independent review से पहले PR #263 merge न करें; production calculation untouched रहे।

---
यह परिशिष्ट शोध-नोट है, प्रमाणित production specification नहीं। जहाँ “अनसुलझा”, “candidate”, “diagnostic” या “अज्ञात” लिखा है, वहाँ वही स्थिति बनाए रखें।


## 10. 4 नवम्बर 2026 के बाद उपयोगकर्ता का स्पष्ट निर्णय: Drik Panchang benchmark

उपयोगकर्ता ने स्पष्ट निर्देश दिया है कि आधुनिक ग्रह उदय-अस्त परिणाम Drik Panchang से मिलाए जाएँ। इसलिए आधुनिक production engine के लिए Drik Panchang के प्रकाशित स्थान-विशिष्ट Asta/Udaya परिणाम प्राथमिक acceptance benchmark होंगे।

इसका अर्थ:
- लक्ष्य स्थान Pithoragarh, Uttarakhand; Drik city identity `geoname-id=1259503`। स्थानीय timezone IST।
- Drik के planet Asta pages स्वयं कहते हैं कि उनके प्रकाशित combustion timings observer geolocation पर आधारित modern algorithms से निकाले जाते हैं; वे Surya Siddhanta angular thresholds को approximate बताते हैं। उदाहरण: Venus 2026 New Delhi page और Jupiter 2026 New Delhi page।
- Drik Pithoragarh Panchang page 4 Nov 2026 को location identity और local sunrise/sunset सहित देता है।
- Drik Pithoragarh Venus 2025 page 11 Dec 2025 06:25 AM से 2 Feb 2026 06:15 PM का प्रकाशित समय देता है। यह पुराने checkpoint के user-supplied संदर्भ से मेल खाता है और location-specific reference के रूप में उपयोगी है।
- पहले से दर्ज Pithoragarh references (Venus 2026 Oct 12 18:05 → Oct 29 05:49; Jupiter 2027 Aug 16 19:24 → Sep 13 05:09) को तब तक provisional रखें जब तक उसी Drik city selection, year, time format और page output को पुनः capture न कर लें।
- New Delhi के परिणामों को Pithoragarh reference न बनाएँ। Search results में New Delhi Venus 2026 Oct 12 18:19 → Oct 29 06:00 और Jupiter 2026 Jul 15 19:59 → Aug 12 05:03 हैं; ये केवल location-sensitivity का उदाहरण हैं।

Benchmark प्रक्रिया:
1. प्रत्येक planet/year के लिए Drik page का exact city, page URL, retrieval date, 24-hour/24+ format और raw event rows archive करें।
2. घटना start=Asta तथा end=Udaya की exact event-definition verify करें; event dates को local IST में absolute timestamps में normalize करें।
3. OurHinduDharm output को उसी स्थान और समान timestamps/definitions पर compare करें।
4. अंतर को event-wise seconds/minutes में report करें; date boundary, sunrise-relative notation और 24+ hour notation को सही normalize करें।
5. Thresholds को केवल match कराने के लिए न बदलें। Ephemeris, observer coordinates/elevation, topocentric/geocentric frame, apparent/true coordinates, refraction/visibility criterion, planet-specific rule और event root-finding को जाँचें।
6. आधुनिक production acceptance के लिए Drik benchmark पर agreed tolerance तय करें और multiple years + other locations पर regression चलाएँ।
7. Surya Siddhanta Chapter III/VII/IX engine और उसके K/C kālāṃśa परिणाम अलग classical output के रूप में रहें; Drik matching से classical method को overwrite या relabel न करें।

स्रोत:
- Drik Pithoragarh Panchang 4 Nov 2026: https://www.drikpanchang.com/panchang/month-panchang.html?geoname-id=1259503
- Drik Pithoragarh Venus Asta 2025: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?time-format=12hour&year=2025
- Drik Venus Asta 2026 New Delhi (method note + location-specific output): https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?time-format=24hour
- Drik Jupiter Asta 2026 New Delhi (method note + location-specific output): https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?time-format=24plushour&year=2026

यह निर्णय आधुनिक engine के लिए benchmark प्राथमिकता स्पष्ट करता है; इससे अभी तक कोई नई गणना या production result प्रमाणित नहीं होता।


## 11. 4 नवम्बर 2026 के बाद की प्रत्यक्ष Drik और production-code जाँच

### Drik से प्रत्यक्ष रूप में क्या सत्यापित हुआ

- Drik Day Panchang URL `day-panchang.html?geoname-id=1259503` स्पष्ट रूप से Pithoragarh, India दिखाता है। 4 Nov 2026 के लिए sunrise 06:24 AM और sunset 05:21 PM IST देता है। यह city ID की पुष्टि करता है, ग्रह-अस्त तालिका की नहीं।
- Drik 2027 Jupiter Asta page जो सार्वजनिक search/open result में मिला, **New Delhi** का है, Pithoragarh का नहीं: Asta starts 17 Aug 2027 19:32, ends 13 Sep 2027 05:22 IST. इसे Pithoragarh benchmark न बनाएँ।
- उसी Drik page का method note कहता है कि site modern algorithms से observer geolocation के आधार पर combustion timings निकालती है; Surya Siddhanta 11° को approximate बताती है।
- Planet Asta page पर `geoname-id=1259503` जोड़कर खोलने के प्रयास web retrieval में सफल नहीं हुए; returned indexed page default New Delhi ही रहा। इसलिए Pithoragarh-specific event page values अभी independently recaptured नहीं हुए।
- पहले user-supplied Pithoragarh values को अभी provisional transcription रखें; उन्हें web-verified Drik result न लिखें।

स्रोत:
- Drik Pithoragarh day Panchang: https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=1259503
- Drik Jupiter Asta 2027 (New Delhi only): https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?time-format=24hour&year=2027

### Drik location benchmark का वर्तमान blocking point

Drik ग्रह-अस्त page पर city selector है, लेकिन crawler/indexed result ने Pithoragarh query parameter का परिणाम नहीं दिया। अगला सही कदम browser UI में city selector से Pithoragarh चुनकर exact generated URL/visible rows capture करना है। जब तक ऐसा capture न हो, New Delhi के result को Pithoragarh पर लागू न करें। Search result में दिखी New Delhi values का उपयोग केवल New Delhi validation case के रूप में किया जा सकता है।

### Repository code review से एक ठोस architectural finding

Main `extra-panchang.js` के current production implementation में:
- `PLANET_ASTA_THRESHOLDS` = Mercury 14°, Venus 10°, Mars 17°, Jupiter 11°, Saturn 15°।
- `getPlanetDailyData()` `Elongation(body, getLocalNoon(dateString))` से daily geocentric ecliptic separation लेता है।
- `findNearestAngularBoundary()` local observer latitude/longitude/elevation का उपयोग नहीं करता।
- `findThresholdCrossingInstant()` उसी geocentric ecliptic separation को threshold के विरुद्ध bisect करता है।
- परिणाम में `calculationScope: "geocentric-angular-threshold"`, `locationSpecific: false`, `verificationPending: true` रखा गया है।

इसलिए मौजूदा production Asta/Udaya value केवल geocentric longitude-separation threshold crossing है; यह Drik-जैसा observer-geolocation event engine नहीं है। इसे local event time कहने या Pithoragarh-specific घोषित करने का आधार नहीं है।

### Research page के existing fixtures का महत्वपूर्ण भेद

शोध `test-astronomy.html` में:
- `REFERENCES` की चार angular samples (Venus 2026 7.76°/9.70°, Jupiter 2027 10.49°/11.28°) का `referenceLocation` स्पष्ट रूप से **Dehradun, Uttarakhand, India** है; source Tantrakulam, engine label Drik है।
- अलग `UNVERIFIED_PITHORAGARH_BOUNDARY_TRANSCRIPTIONS` में user-supplied Pithoragarh times हैं: Venus 12 Oct 2026 18:05 / 29 Oct 2026 05:49; Jupiter 16 Aug 2027 19:24 / 13 Sep 2027 05:09। Comment इन्हें unverified कहता है।
- अतः Dehradun angular samples को Pithoragarh event boundaries से न मिलाएँ। पहले की कुछ बातचीत में इन sets का स्थान-फ्रेम गड्डमड्ड होने का जोखिम था; यह स्पष्ट रूप से सुधारा जाए।

### अगला implementation plan — production code अभी न बदलें

1. Drik city selector से Pithoragarh की exact Guru/Shukra year pages और raw event times capture करें; URL + screenshot/HTML + retrieval timestamp archive करें।
2. अलग control dataset: New Delhi 2027 Guru Asta = 17 Aug 19:32 → 13 Sep 05:22, क्योंकि यही currently directly retrievable Drik result है।
3. Drik benchmark को event start/end, event type (evening setting / morning rising), exact observer city, timezone और date convention सहित schema में रखें।
4. Modern engine के लिए observer-geolocation event model बनाएं; geocentric elongation-only current function को classical Chapter IX helper से न मिलाएँ।
5. Ephemeris state (apparent/topocentric RA/Dec or altitude/azimuth), observer lat/lon/elevation, atmospheric/refraction assumptions और visibility criterion का स्रोत/परिभाषा स्पष्ट करें। Drik का algorithm proprietary/अपूर्ण रूप से वर्णित हो सकता है; अतः exact internal reproduction का दावा न करें—published output benchmark पर empirical validation करें।
6. Threshold values 8/10/11/12/14/15/17 को event-specific visibility criteria समझकर बिना स्रोत न बदलें; modern Drik matching के लिए मनमाने threshold fitting निषिद्ध।
7. Drik event rows के साथ same location पर multiple years और दूसरी cities की regression suite बनाएं।
8. Main page पर तब तक मौजूदा transparent geocentric label और verification-pending स्थिति बनाए रखें।

यह समीक्षा production files में कोई बदलाव नहीं करती।
