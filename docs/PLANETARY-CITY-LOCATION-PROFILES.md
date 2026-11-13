# शहर-आधारित तारा उदय-अस्त स्थान-प्रोफ़ाइल

`planetary-city-location.mjs` शहर खोजने और स्थानीय पर्यवेक्षक-प्रोफ़ाइल बनाने का साझा आधार है।

## प्रवाह
1. उपयोगकर्ता स्पष्ट रूप से भारतीय शहर खोजता है।
2. OpenStreetMap Nominatim से शहर का नाम, राज्य और अक्षांश-देशांतर मिलते हैं।
3. Open-Meteo Elevation API से Copernicus DEM का ऊँचाई नमूना मिलता है।
4. `createCityObserverProfile()` एक versioned observer profile लौटाता है।
5. खगोलीय इंजन उसी profile के latitude, longitude और elevationMeters से गणना करता है।

## महत्वपूर्ण सीमाएँ
- Nominatim को हर keypress पर न बुलाएँ। खोज को debounce करें और केवल उपयोगकर्ता के स्पष्ट खोज-कार्य पर अनुरोध भेजें; सार्वजनिक सेवा की usage policy का पालन करें।
- ऊँचाई लगभग 90 m DEM grid का नमूना है; यह भवन/छत/स्थानीय पहाड़ी का सर्वेक्षण नहीं है।
- असफल elevation lookup पर शून्य या किसी दूसरे शहर की ऊँचाई न लगाएँ।
- पिथौरागढ़ के लिए मौजूदा परियोजना-संदर्भ 29.5828°N, 80.2182°E, 1650 m को स्पष्ट reference profile में सुरक्षित रखा गया है; DEM परिणाम इसे चुपचाप overwrite नहीं करता।
- भारतीय शहरों के लिए `Asia/Kolkata` है। अन्य देशों को सपोर्ट करने से पहले timezone resolver जोड़ना आवश्यक है।
- यह मॉड्यूल अभी annual page में wired नहीं है; पहले isolated tests और code review के लिए जोड़ा गया है। इससे मुख्य पंचांग/runtime पर कोई प्रभाव नहीं पड़ता।
- कोई user location localStorage/cookie में नहीं लिखी जाती; caller इसे केवल session memory में रखे।


## दृश्यता-निर्णय का अगला गणितीय स्तर

`planetary-heliacal-visibility.mjs` Schaefer (1985) twilight visibility criterion का स्वतंत्र, pure-JavaScript evaluator देता है। यह एक क्षण के लिए object/Sun altitude, azimuth और apparent V magnitude लेकर limiting magnitude तथा visibility margin निकालता है।

मूल समीकरणों में Rozenberg air-mass, सूर्य-तारा azimuth separation, twilight sky brightness, physiological contrast threshold और extinction शामिल हैं। यह fixed Sun-planet angular threshold से अधिक भौतिक मॉडल है।

### अभी क्या नहीं करता
- Ephemeris positions या date/time search नहीं करता।
- बादल, स्थानीय प्रदूषण, वास्तविक मौसम, पहाड़ी skyline या मानव पर्यवेक्षक की व्यक्तिगत दृष्टि नहीं मापता।
- 0.25 extinction और zenith limiting magnitude 6.0 केवल परीक्षण/शोध के शुरुआती मान हैं; इन्हें शहर-विशिष्ट सत्य नहीं माना गया है।
- इसे अभी public Asta/Udaya timestamps बनाने के लिए स्वीकृत नहीं किया गया है।

अगला चरण Astronomy Engine के topocentric horizontal coordinates और `Illumination()` से ग्रह का apparent magnitude लेकर हर सुबह/शाम twilight window में scan करना, फिर threshold crossing को refine करना है। अगस्त्य के लिए J2000 star coordinates, proper motion/precession और catalogue magnitude अलग star-position adapter से आएँगे।

संदर्भ: Schaefer, B. E. (1985), “Predicting Heliacal Risings and Settings”, Sky & Telescope 70, 261–263; समीकरणों का पुनर्निर्माण MontuPython की प्रकाशित step-by-step technical documentation में दिया गया है।
