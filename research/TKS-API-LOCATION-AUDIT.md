# TKS API को स्थान-आधारित मॉडल में उपयोग करने की सीमा

जाँच दिनांक: 2026-11-16

आधिकारिक TKS API दस्तावेज़:
- https://tksephemeris.com/tks-api
- https://panchang.tksephemeris.com/tks-udaya-asta

## महत्वपूर्ण निष्कर्ष

1. GET /v1/tks/heliacal के प्रकाशित पैरामीटर body, year, month, day और days हैं। इसमें lat, lon या elevation नहीं हैं। दस्तावेज़ इसे apparent ecliptic longitudes पर traditional elongation orb आधारित transition बताता है। इसलिए इस endpoint के परिणाम को मनमाने स्थान के लिए location-based गणना नहीं कहा जा सकता।
2. GET /v1/tks/ephemeris स्थान के lat/lon स्वीकार करता है और apparent RA/Dec, ecliptic longitude/latitude आदि देता है। यह स्वतंत्र position cross-check के लिए उपयोगी है। API docs में 1950–2050 free window का उल्लेख है, पर TKS engine/data licence शर्तें अलग से जाँचनी होंगी; इसे OurHinduDharm की स्थायी production dependency न मानें।
3. TKS Udaya-Asta पृष्ठ शास्त्रीय K/C मॉडल और Ptolemaic/Schaefer physical visibility को अलग बताता है। API endpoint का प्रकाशित विवरण elongation orb कहता है। जब तक panel की exact implementation/version pin न हो, panel के K/C benchmark को API heliacal output के साथ समान नहीं मानना है।

## OurHinduDharm निर्णय

- TKS output को independent benchmark/reference रखें, production calculation dependency नहीं।
- Local open-source ephemeris provider से apparent geocentric positions लें और OurHinduDharm के अपने SS9 location kernel में latitude-dependent oblique ascension लागू करें।
- TKS ephemeris endpoint से चुनिंदा dates पर positions cross-check कर सकते हैं, लेकिन user-visible calculation endpoint से live fetch पर निर्भर नहीं होगी।
- Elevation physical visibility/horizon branch में अलग रहेगी; classical K/C में नहीं जोड़ी जाएगी।

## References
- TKS API: https://tksephemeris.com/tks-api
- TKS Udaya-Asta method: https://panchang.tksephemeris.com/tks-udaya-asta
- Astronomy Engine coordinate frames: https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md
