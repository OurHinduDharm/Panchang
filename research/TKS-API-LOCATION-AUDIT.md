# TKS API और SS Ch.9 मॉडल की सीमा

जाँच दिनांक: 2026-11-16

आधिकारिक TKS स्रोत:
- https://tksephemeris.com/tks-api
- https://panchang.tksephemeris.com/tks-udaya-asta
- https://panchang.tksephemeris.com/tks-ephemeris

## क्या अलग-अलग रखना है

1. TKS Udaya-Asta method page शास्त्रीय SS Ch.9 K/C को primary Shastriya पद्धति बताता है। उसमें K स्थान के rising-time/lagna और ग्रह की ecliptic latitude पर निर्भर है। उसी पृष्ठ पर Ptolemaic arcus visionis और Schaefer photometric visibility को अलग physical models बताया गया है।
2. अलग प्रकाशित GET /v1/tks/heliacal endpoint के documented parameters body, year, month, day और days हैं; उसमें lat/lon/elevation नहीं हैं और उसका विवरण apparent ecliptic-longitude elongation-orb transitions बताता है। इसलिए इस endpoint को location-based SS Ch.9 panel का equivalent नहीं मानना है।
3. GET /v1/tks/ephemeris स्थान के lat/lon स्वीकार करता है और apparent RA/Dec तथा ecliptic longitude/latitude देता है। यह independent position cross-check के लिए उपयोगी हो सकता है। इसे OurHinduDharm की स्थायी production dependency नहीं बनाना है; licence/usage terms अलग से जाँचने होंगे।
4. Exact TKS UI panel engine/version और उसका endpoint path अभी pin नहीं हुआ है। इसलिए user-provided TKS panel data को reference benchmark माना जाएगा, definitive truth नहीं।

## OurHinduDharm गणना के लिए महत्वपूर्ण शास्त्रीय सुधार

सूर्यसिद्धान्त अध्याय 9 के श्लोक 1–9 में dṛkkarma अनिवार्य है:
- āyana dṛkkarma
- akṣaja dṛkkarma
- बड़ी ecliptic latitude वाले स्थिर तारों के लिए अलग श्लोक 8–9 प्रक्रिया

श्लोक 10–11 में kalāṃśa-अंतर और ग्रहों की दैनिक गति से घटना का समय निकाला जाता है। वर्तमान SS9 kernel में ये पूर्ण corrections अभी लागू नहीं हैं; इसलिए वर्तमान back-test केवल baseline geometry diagnosis है, final SS9 result नहीं।

## निर्णय

- TKS panel के K/C और photometric results अलग-अलग benchmark tracks में रखें।
- Local open-source ephemeris provider से apparent positions लें; TKS data/API को live production dependency न बनाएं।
- Planetary dṛkkarma और high-latitude fixed-star correction अलग-अलग implement करें।
- पहले Almora/Ramnagar और printed Panchang benchmarks पर event-by-event back-test करें; mismatch को threshold बदलकर छिपाएं नहीं।
- Elevation physical horizon/photometric branch में रहेगी; classical K/C में मनमाने ढंग से न जोड़ें।

## References

- TKS API: https://tksephemeris.com/tks-api
- TKS Udaya-Asta method: https://panchang.tksephemeris.com/tks-udaya-asta
- TKS Ephemeris: https://panchang.tksephemeris.com/tks-ephemeris
- Surya Siddhanta, Chapter IX, verses 1–11: https://upload.wikimedia.org/wikipedia/commons/7/7d/Translation_of_the_Surya_Siddhanta_%28IA_pli.kerala.rare.11437%29.pdf
- Astronomy Engine coordinate frames: https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md
