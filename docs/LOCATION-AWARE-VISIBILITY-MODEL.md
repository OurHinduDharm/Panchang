# स्थान-आधारित ग्रह-तारा अस्त/उदय गणना: गणितीय मॉडल

स्थिति: गणना-विनिर्देश और benchmark तैयारी; इसे अभी validated visibility model न माना जाए।

## 1. शहरों के डेटा का सही उपयोग

`data/observer-location-profiles.json` में पिथौरागढ़ तथा प्रमुख महानगरों के representative observer points हैं। दिल्ली, मुंबई, कोलकाता, चेन्नई, बेंगलुरु, हैदराबाद, अहमदाबाद, पुणे और जयपुर के coordinates/elevation IMD 1991–2020 station table से लिए गए हैं। ये मौसम-स्टेशन के बिंदु हैं, पूरे शहर का औसत नहीं। Drik reference dataset में पहले से मौजूद उज्जैन और वाराणसी के लिए भी station benchmark जोड़े गए हैं। सूरत की ऊँचाई अभी प्रमाणित नहीं; इसलिए उसका profile calculationEligible=false है।

शहरों का डेटा किसी एक angular threshold को मनमाने ढंग से fit करने के लिए नहीं होगा। इसका उपयोग:
- longitude/time-zone conversion और local date boundary जाँचने;
- latitude/elevation से horizon geometry का प्रभाव मापने;
- अलग-अलग दिशाओं/ऊँचाइयों पर event prediction की cross-validation;
- Drik reference windows के विरुद्ध शहर-विशिष्ट residuals निकालने;
- एक शहर पर calibration और दूसरे शहरों पर blind validation करने के लिए होगा।

## 2. गणना की दो अलग परतें

### A. Geocentric / पंचांग-अस्त की सीमा

सूर्य और ग्रह के apparent geocentric vectors से angular separation:
`epsilon = atan2(|r_sun × r_planet|, r_sun · r_planet)`

यह साझा खगोलीय event geometry है। यदि चुनी हुई परंपरा direct/retrograde या ग्रह-विशिष्ट सीमा उपयोग करती है, तो threshold/model को स्पष्ट नाम और source के साथ अलग configuration में रखा जाएगा। इसे local horizon rise/set न कहा जाए।

### B. Topocentric / स्थानीय दृश्यता

पहले observer के लिए ग्रह का topocentric apparent direction निकालें; फिर स्थानीय hour angle H, declination δ और latitude φ से:
`sin(alt) = sin(φ) sin(δ) + cos(φ) cos(δ) cos(H)`

Azimuth convention उत्तर से पूर्व की ओर:
`az = atan2(-cos(δ) sin(H), sin(δ) cos(φ) - cos(δ) sin(φ) cos(H))`

सूर्य/ग्रह की apparent altitude में refraction, observer elevation से geometric horizon dip, और terrain obstruction को अलग terms में रखें। Elevation का प्रभाव केवल समय-क्षेत्र बदलकर नहीं निकलेगा।

## 3. Heliacal visibility (वास्तविक पहली/अंतिम दृश्यता)

केवल सूर्य-ग्रह angular separation या fixed altitude threshold पर्याप्त नहीं। दृश्यता मॉडल में कम-से-कम ये inputs चाहिए:
- ग्रह की apparent magnitude और phase/illumination;
- सूर्य की altitude/depression तथा ग्रह की altitude;
- angular separation और azimuth separation;
- atmospheric extinction (aerosol/visibility), pressure, temperature, humidity;
- sky brightness/twilight background;
- local horizon/terrain profile और observer height.

पहले literature-backed baseline model लागू होगा; फिर स्वतंत्र observed/reference dates के विरुद्ध calibration। मौसम-निर्भर visibility को स्थायी पंचांग event से अलग दिखाया जाएगा।

## 4. Calibration/validation नियम

1. Drik captured city-year windows को reference observations की तरह रखें, पर मौजूदा dataset का `comparisonLevel=city-label-only` है; इसे exact-coordinate ground truth न मानें।
2. किसी एक शहर/वर्ष पर model tune करें; अन्य शहरों और वर्षों को hold-out validation में रखें।
3. हर boundary के लिए signed time residual (minutes), absolute error, median, 95th percentile और missing-event count रिपोर्ट करें।
4. UTC instant की तुलना पहले करें; local date/time केवल timezone formatting के बाद।
5. Pithoragarh के लिए 29.5828, 80.2182, 1650 m ही project target profile है। किसी city station profile को Pithoragarh के स्थान पर न लगाएँ।
6. यदि reference source event definition/threshold स्पष्ट नहीं करता, residual report करें लेकिन coefficients को “सिद्ध” न कहें।
7. गुरु/शुक्र के पंचांग-अस्त, heliacal visibility, और अगस्त्य के पारंपरिक अर्घ्य तीन अलग event classes हैं।

## 5. अगला implementation क्रम

- सभी benchmark profiles पर एक ही pinned ephemeris version से hourly/dense candidate event series बनाना।
- candidate boundary के आसपास adaptive root-finding से exact UTC instant निकालना।
- topocentric altitude/azimuth, solar depression, elongation और model inputs को event record में सुरक्षित करना।
- Drik reference windows के साथ per-city/per-planet residual report।
- hold-out शहरों पर pass होने के बाद ही public city selector या annual output।
