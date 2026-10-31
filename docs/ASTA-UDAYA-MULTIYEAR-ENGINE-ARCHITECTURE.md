# बहुवर्षीय उदय-अस्त गणना और साझा JSON — तकनीकी रूपरेखा

स्थिति: प्रस्तावित वास्तुकला; अभी production गणना या शास्त्रीय सत्यापन का दावा नहीं।

## उद्देश्य

एक अलग GitHub Pages calculator में चुनी हुई अवधि की गणना करना, परिणाम को versioned JSON में निर्यात करना, और मुख्य Panchang/Vrat-Parv pages पर हल्की lookup व्यवस्था देना। गणना लंबे समय तक चल सकती है; प्रगति, रोकने/फिर जारी करने और त्रुटि-सूचना का समर्थन आवश्यक है।

## सबसे जरूरी भेद: कौन-सा डेटा शहरों में साझा होगा?

एक शहर के स्थानीय समयों को दूसरे शहर पर कॉपी नहीं किया जा सकता। इसके बजाय डेटा को दो परतों में बाँटना होगा:

1. **साझा खगोलीय आधार (location-independent):** ग्रहों की geocentric apparent positions/vectors, सूर्य-चन्द्र और ग्रहों की आवश्यक खगोलीय अवस्थाएँ, सटीक UTC timestamps, time scale/ephemeris metadata। इससे geocentric angular separation और उससे परिभाषित event boundaries शहर बदलने पर फिर से शून्य से नहीं निकालनी पड़तीं।
2. **स्थानीय परिणाम (location-dependent):** topocentric parallax, observer horizon, ऊँचाई, refraction/visibility model, स्थानीय तारीख और timezone formatting। इन्हें प्रत्येक शहर के coordinates/elevation/timezone के साथ निकालना/रूपांतरित करना होगा।

महत्वपूर्ण: मौजूदा `extra-panchang.js` का planetary Asta/Udaya भाग `Elongation()` से geocentric ecliptic separation पर provisional angular thresholds लगाता है (Mercury 14°, Venus 10°, Mars 17°, Jupiter 11°, Saturn 15°)। यह स्थानीय horizon visibility नहीं है और अभी शास्त्रीय Chapter IX या Drik Panchang equivalence प्रमाणित नहीं है। इसे चुपचाप “शास्त्रीय” नाम नहीं देना है।

## डेटा मॉडल (प्रारंभिक)

### साझा ephemeris JSON
- schemaVersion
- generatedAtUtc
- generatorVersion / source library + exact version
- timeScale and coordinate frame
- coverageStartUtc / coverageEndUtc
- sampling cadence and interpolation method/error bound
- body identifiers
- timestamped geocentric vectors/positions
- integrity/checksum and validation status

### event JSON (केवल परिभाषा/सत्यापन स्पष्ट होने पर)
- body, eventType, exact UTC instant
- threshold/model identifier and parameters
- algorithmVersion, source/provenance
- uncertainty/precision
- verificationStatus: provisional | cross-checked | verified
- local display date/time अलग से; किसी एक शहर को सार्वभौमिक event location न मानें।

### स्थानीय city profile
- stable location id/name
- latitude, longitude, elevation
- IANA timezone
- horizon/refraction model and version
- local results cache key में location profile + algorithm version अनिवार्य

## Calculator page के व्यवहार

- आरंभ/अंत वर्ष और डेटा प्रकार चुनना।
- लंबे काम के लिए chunked batches; UI responsive रहे।
- progress: पूर्ण दिन/कुल दिन, वर्तमान ग्रह/खंड, elapsed time, अनुमानित शेष समय (केवल जब पर्याप्त माप उपलब्ध हो)।
- pause/resume: IndexedDB में checkpoint; browser बंद होने पर भी पुनः शुरू करने की क्षमता।
- duplicate run रोकना; cancellation और साफ error report।
- JSON export/import, schema validation, checksum, coverage gaps रिपोर्ट।
- बड़े परिणामों को एक विशाल in-memory array में न रखें; chunk files/NDJSON या compressed shards बनाएँ, फिर manifest/index तैयार करें।
- export तभी “complete” जब हर अपेक्षित chunk मौजूद हो और integrity checks पास हों।

## दूसरे शहरों के लिए गति

- geocentric ephemeris data साझा रखें।
- शहर-विशिष्ट गणना केवल observer-dependent चरण पर करें।
- स्थानीय परिणामों को coordinates/elevation/timezone + model/version के आधार पर cache करें।
- यदि उपयोगकर्ता का शहर उपलब्ध local cache में नहीं है, तो केवल आवश्यक तारीख/ग्रह के लिए calculation करें; एक शहर का local event time दूसरे पर लागू न करें।

## गणना और सत्यापन के चरण

1. मौजूदा production function और astronomy-engine API की exact semantics को source/tests से pin करें।
2. पहले छोटा prototype: 2026 का सीमित interval, Pithoragarh तथा कम-से-कम दो अलग longitude/latitude वाले शहर।
3. समान UTC geocentric positions से दो शहरों में साझा angular event का UTC instant समान होना चाहिए; स्थानीय display time/date timezone से सही बदलना चाहिए।
4. observer-dependent rise/set/visibility के लिए दोनों शहरों के परिणाम अलग होने चाहिए और independent reference से जाँचे जाएँ।
5. interpolation को exact direct ephemeris calls के विरुद्ध नमूना-बिंदुओं पर जाँचें; error bound पूरा न हो तो sampling density बढ़ाएँ या direct calculation करें।
6. केवल regression + independent astronomical reference checks के बाद production integration।
7. फिर multi-year batch generation; JSON को versioned release artifact की तरह प्रकाशित करें।

## सुरक्षा सीमाएँ

- मौजूदा Panchang calculations को इस प्रयोग से न बदलें।
- provisional thresholds से निकले outputs को verified न कहें।
- किसी city profile के बिना local visibility का दावा न करें।
- कोई missing/gapped data nearest value से चुपचाप भरना नहीं।
- पुराने JSON और algorithm version को traceable रखें ताकि reproducibility बनी रहे।

## वर्तमान स्थिति

यह commit केवल architecture/specification जोड़ता है। Calculator UI, ephemeris generator, JSON export, local-city engine और production integration अभी लागू नहीं हैं।
