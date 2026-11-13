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
- `planetary-city-heliacal-engine.mjs`: Astronomy Engine से प्रत्येक observer के लिए -18° astronomical dawn/dusk और स्थानीय sunrise/sunset windows बनाकर morning/evening scans चलाता है; evening last-visible transition को Asta candidate और morning first-visible transition को Udaya candidate कहता है। यह अभी भी research-only है।\n- `planetary-heliacal-ephemeris.mjs`: Astronomy Engine से गुरु/शुक्र के topocentric altitude/azimuth और `Illumination().mag` लेकर सुबह/शाम की दी हुई UTC window scan करता है; crossing को 30-second default tolerance तक refine करता है।
- `agastya-canopus-position.mjs`: SIMBAD/HIP 30438 catalogue coordinates और proper motion को J2000 tangent plane में propagate करके Astronomy Engine के EQJ-to-HOR transform से Canopus का स्थानीय altitude/azimuth निकालता है; वही twilight visibility evaluator भी लागू करता है।

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

1. Astronomy Engine adapter को वास्तविक Pithoragarh observer पर run करके planetary morning/evening windows बनाना।
2. गुरु/शुक्र के लिए 2021–2027 के उपलब्ध Drik Pithoragarh direct-source windows के साथ blind back-test करना; training और holdout years अलग रखना।
3. Canopus की 2028–2030 पारंपरिक Arghya dates को physical heliacal visibility से अलग रखकर तुलना करना।
4. स्थानीय skyline/horizon profile जोड़ने से पहले स्वतंत्र horizon survey या स्पष्टly documented DEM/terrain source लेना।
5. जब तक error distribution और source acceptance criteria पूरे न हों, public annual list में नए model-generated times न डालना।

संदर्भ: Schaefer, B. E. (1985), “Predicting Heliacal Risings and Settings”, Sky & Telescope 70, 261–263; equations reconstruction हेतु MontuPython की प्रकाशित step-by-step technical documentation; Canopus astrometry हेतु CDS SIMBAD (HIP 30438).
