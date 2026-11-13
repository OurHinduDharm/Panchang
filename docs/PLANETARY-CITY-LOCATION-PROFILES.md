# शहर-आधारित तारा उदय-अस्त स्थान-प्रोफ़ाइल

यह शोध-आधार गुरु, शुक्र और अगस्त्य के लिए अलग-अलग शहरों के observer profiles और topocentric visibility गणना उपलब्ध कराता है।

## प्रवाह
1. उपयोगकर्ता स्पष्ट रूप से शहर खोजता है।
2. OpenStreetMap Nominatim से शहर, राज्य और अक्षांश-देशांतर मिलते हैं।
3. Open-Meteo Elevation API से Copernicus DEM का लगभग 90 m grid elevation sample मिलता है।
4. `createCityObserverProfile()` versioned observer profile लौटाता है।
5. Astronomy Engine उसी profile के latitude, longitude और elevationMeters से स्थानीय आकाशीय निर्देशांक निकालता है।

## मॉड्यूल

- `planetary-city-location.mjs`: शहर खोज, DEM elevation और observer profile।
- `planetary-heliacal-visibility.mjs`: Schaefer (1985) twilight visibility criterion का pure-JavaScript evaluator।
- `planetary-city-heliacal-engine.mjs`: Astronomy Engine से प्रत्येक observer के लिए -18° astronomical dawn/dusk और स्थानीय sunrise/sunset windows बनाकर morning/evening scans चलाता है; last-visible को Asta candidate और first-visible को Udaya candidate मानता है, चाहे घटना सुबह हो या शाम। यह अभी भी research-only है।
- `planetary-city-horizon-threshold.mjs`: वास्तविक स्थानीय ग्रह-rise/set घटनाएँ निकालता है और उसी समय सूर्य के depression पर प्रशिक्षित सीमा के crossing से तारीख का candidate बनाता है; प्रदर्शित clock को वास्तविक rise/set event पर ही रखता है। `calculateCityAstaUdayaCandidates()` इसी calibrated profile से शोध-समय निकालता है।
- `research/pithoragarh-horizon-thresholds-2021-2025.json`: पिथौरागढ़ के लिए अलग-अलग गुरु/शुक्र, AstaStart/AstaEnd और rise/set शाखाओं के training medians; केवल शोध के लिए।
- `planetary-heliacal-ephemeris.mjs`: Astronomy Engine से गुरु/शुक्र के topocentric altitude/azimuth और `Illumination().mag` लेकर सुबह/शाम की दी हुई UTC window scan करता है; crossing को 30-second default tolerance तक refine करता है।
- `agastya-canopus-position.mjs`: SIMBAD/HIP 30438 catalogue coordinates और proper motion को J2000 tangent plane में propagate करके Astronomy Engine के EQJ-to-HOR transform से Canopus का स्थानीय altitude/azimuth निकालता है; वही twilight visibility evaluator भी लागू करता है।

## पिथौरागढ़ का पहला वास्तविक बैकटेस्ट (2021–2027)

- 16 उपलब्ध Guru/Shukra windows के 32 start/end boundaries पर Astronomy Engine के निकटतम वास्तविक planet rise/set event का समय स्रोत के समय से 1 मिनट के भीतर मिला: 32/32।
- स्रोत boundary के समय ग्रह की altitude लगभग 0° थी। इससे संकेत मिलता है कि प्रकाशित clock-time को स्थानीय ग्रह horizon crossing से निकालना चाहिए।
- Sun-depression thresholds को 2021–2025 के records से अलग-अलग planet, boundary और rise/set direction के अनुसार median से fit किया गया।
- 2026–2027 के 8 holdout boundaries में 8/8 threshold brackets मिले; 7/8 का चुना हुआ horizon clock स्रोत समय से 15 मिनट के भीतर रहा और 7/8 तारीखें 1 दिन के भीतर रहीं।
- एक Venus 2027 AstaEnd boundary लगभग 2 दिन अलग रहा। इसे अभी सफल prediction नहीं माना गया है।
- Schaefer visibility evaluator को उसी 32-boundary परीक्षण में केवल 4 candidate matches मिले; इसलिए इसे अभी इस तारीख-निर्धारण के लिए स्वीकार नहीं किया गया।
- यह पिथौरागढ़-विशिष्ट exploratory validation है। इसे दूसरे शहरों पर लागू मानना या सार्वजनिक तारीखें प्रकाशित करना उचित नहीं। अगला चरण दूसरे शहरों पर स्वतंत्र same-city validation और Venus 2027 mismatch का कारण जाँचना है।

## महत्वपूर्ण सीमाएँ

- Nominatim को हर keypress पर न बुलाएँ। खोज debounce करें और केवल उपयोगकर्ता के स्पष्ट search action पर अनुरोध भेजें; सार्वजनिक सेवा की usage policy का पालन करें।
- DEM elevation लगभग 90 m grid का नमूना है; यह भवन/छत/स्थानीय पहाड़ी का सर्वेक्षण नहीं है।
- असफल elevation lookup पर शून्य या किसी दूसरे शहर की ऊँचाई न लगाएँ।
- पिथौरागढ़ का परियोजना-संदर्भ 29.5828°N, 80.2182°E, 1650 m स्पष्ट reference profile में सुरक्षित है; DEM इसे चुपचाप overwrite नहीं करता।
- Canopus का J2000 declination लगभग -52.696° है। पिथौरागढ़ अक्षांश 29.583°N पर इसका सैद्धांतिक अधिकतम geometric altitude केवल लगभग 7.72° है। इसलिए वास्तविक पहाड़ी skyline, पेड़/इमारत और azimuth के अनुसार स्थानीय क्षितिज इसे रोक सकता है। केवल ऊँचाई/शहर-निर्देशांक से दर्शन की पुष्टि नहीं होती।
- Canopus के लिए SIMBAD proper motion को tangent-plane approximation से propagate किया गया है। यह Gaia/Hipparcos का पूर्ण six-dimensional astrometric solution नहीं है; parallax और radial-velocity perspective effects इस adapter में लागू नहीं हैं।
- भारतीय शहरों के लिए अभी `Asia/Kolkata` है। अन्य देशों को सपोर्ट करने से पहले timezone resolver आवश्यक है।
- Astronomy Engine का topocentric planetary position तथा magnitude model cloud, वास्तविक मौसम, स्थानीय प्रकाश-प्रदूषण या terrain skyline नहीं मापता।
- 0.25 extinction और zenith limiting magnitude 6.0 शोध के शुरुआती मान हैं, किसी शहर की वास्तविक वायुमंडलीय स्थिति नहीं।
- Planet scan को caller द्वारा दी गई UTC window में चलना है। Caller को Astronomy Engine से उसी स्थान के astronomical twilight और sunrise/sunset की सीमा देनी होगी।
- इन modules को अभी annual public page या मुख्य Panchang runtime में wire नहीं किया गया है। इससे मौजूदा Panchang calculation/performance नहीं बदलती।
- किसी model candidate को public timestamp मानने से पहले उसी स्थान के source observations से back-test, independent cross-check और review आवश्यक है।
- कोई user location localStorage/cookie में नहीं लिखी जाती; caller इसे session memory में रखे।

## लाइसेंस और स्रोत

- Astronomy Engine 2.1.19: MIT; CI में version pin किया गया है।
- OpenStreetMap Nominatim: geocoding; usage policy का पालन अनिवार्य।
- Open-Meteo Elevation / Copernicus DEM: elevation sample।
- Canopus catalogue: CDS SIMBAD, alpha Carinae / HIP 30438; ICRS J2000 coordinates, proper motion और V-band magnitude।

## आगे का वैज्ञानिक सत्यापन

1. पिथौरागढ़ के 2028–2030 शोध-candidates को source validation के बिना सार्वजनिक न करना।
2. Venus 2027 AstaEnd के लगभग 2-दिन mismatch का कारण जाँचना।
3. अन्य शहरों के लिए अलग observer profile और same-city training/holdout बनाना; training और holdout years अलग रखना।
3. Canopus की 2028–2030 पारंपरिक Arghya dates को physical heliacal visibility से अलग रखकर तुलना करना।
4. स्थानीय skyline/horizon profile जोड़ने से पहले स्वतंत्र horizon survey या स्पष्टly documented DEM/terrain source लेना।
5. जब तक error distribution और source acceptance criteria पूरे न हों, public annual list में नए model-generated times न डालना।

संदर्भ: Schaefer, B. E. (1985), “Predicting Heliacal Risings and Settings”, Sky & Telescope 70, 261–263; equations reconstruction हेतु MontuPython की प्रकाशित step-by-step technical documentation; Canopus astrometry हेतु CDS SIMBAD (HIP 30438).


## Conjunction association for Guru/Shukra candidates

`research/planetary-conjunction-association.mjs` adds an independent context layer to raw horizon-threshold candidates:

- Jupiter uses relative longitude 180° for its solar conjunction; 0° would be opposition.
- Venus records both 0° inferior conjunction and 180° superior conjunction.
- Each raw candidate is annotated with the nearest conjunction, its kind, and signed day-distance (before/after).
- This is a branch-review aid only. It does not automatically pair AstaStart/AstaEnd, discard candidates, or set `publicationEligible` to true.
- The Astronomy Engine relative-longitude convention is documented in its JavaScript reference. See https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md

The Venus 2027 AstaEnd holdout remains unresolved. At the captured source boundary (2027-09-09 18:48 IST), the local horizon event itself agrees within about 0.5 minute, while the source Sun depression is about 5.741°. The training median for the Venus AstaEnd/set branch is about 5.889°, and the resulting threshold candidate is roughly two days late. This points to a limitation in the fixed empirical threshold/date rule, not an error in the local planet horizon event. Do not tune the threshold on this holdout record; retain it as an explicit failure until an independent rule/source resolves it.


## Strict conjunction-side pairing (research only)

The raw candidate generator can emit two labels for the same physical rise/set event because it evaluates separate boundary thresholds. These are not four independent astronomical transitions. The new `pairCandidatesAroundConjunctions` diagnostic therefore requires both the correct side of conjunction and the expected local horizon direction:

| Planet/event | AstaStart (before conjunction) | Udaya (after conjunction) |
|---|---|---|
| Jupiter superior conjunction | set | rise |
| Venus inferior conjunction | set | rise |
| Venus superior conjunction | rise | set |

Wrong-side and wrong-direction candidates are not used in a paired window. The routine reports missing branches instead of guessing. A paired window remains `publicationEligible: false`.

Initial Pithoragarh 2028–2030 research pairing from the current threshold calibration:
- Jupiter: three conjunction-centred pairs (2028, 2029, 2030); the March/April candidate branches are excluded because they are not near the relevant solar conjunction.
- Venus: four conjunction-centred pairs (2028 inferior, 2029 superior, 2030 inferior, 2030 superior).
- These are model outputs, not Drik-verified dates. The 2029 Venus superior-conjunction window is notably longer than the 2027 source example and needs independent checking before the model can be accepted.


### 2028–2030 paired candidate output (Pithoragarh observer)

Latest successful CI artifact (workflow run 43419649580; pairing code from the tested branch) contains:
- Jupiter: 3 paired windows — 15 Sep–12 Oct 2028 (27.443 d), 17 Oct–12 Nov 2029 (25.484 d), 18 Nov–13 Dec 2030 (24.516 d).
- Venus: 4 paired windows — 29 May–7 Jun 2028 (9.380 d), 12 Feb–17 Apr 2029 (64.527 d), 4–9 Jan 2030 (4.535 d), 28 Sep–21 Nov 2030 (54.503 d).
- The 2027 conjunctions at the beginning of the scan have no complete paired candidate inside the requested future range; they are explicitly reported as rejected/missing, not silently filled.
- The 2029 Venus 64.5-day window is an outlier against the 2027 Pithoragarh source interval (~51 days). It remains research-only and needs independent source confirmation. The very short Venus inferior-conjunction windows in 2028/2030 also need independent validation.

The strict pairing tests, all existing visibility/city/Agastya tests, full Pithoragarh back-test, artifact upload and real Astronomy Engine smoke test passed in CI. CI success validates code execution and regression tests, not the astronomical correctness of the future dates.
