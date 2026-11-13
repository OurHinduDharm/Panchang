# स्वतंत्र पंचांग-स्रोत तुलना: गुरु, शुक्र और अगस्त्य

स्थिति: शोध/benchmark specification. इस फाइल के समय Drik Panchang मुख्य reference है; अन्य स्रोत स्वतंत्र तुलना और event-definition पहचानने के लिए हैं। अलग परिभाषाओं वाले परिणामों को एक ही coefficient fit में नहीं मिलाना है।

## 1. चुने गए स्रोत और उनका उपयोग

| स्रोत | सार्वजनिक रूप से बताई गई विधि | इस परियोजना में उपयोग |
|---|---|---|
| Drik Panchang | ग्रह-अस्त पृष्ठ पर स्थान/समय के अनुसार प्रकाशित event timings; ग्रह-स्थिति/retrograde के अलग पृष्ठ | प्राथमिक तुलना-स्रोत; समान शहर और समान event type पर तुलना |
| Panchang Guru | Guru/Shukra Asta पृष्ठ पर स्थानीय ग्रहास्त/उदय के समय; पृष्ठ New Delhi के लिए computed बताता है | heliacal/local set-rise शैली के दूसरे स्वतंत्र benchmark के रूप में |
| School of Vedic Sciences (FSVS) | सूर्य से कोणीय दूरी; शुक्र 10°, वक्री में 8°; गुरु 11°; पृष्ठ पर समय और retrograde स्थिति | fixed-angular combustion model का स्पष्ट comparator, visibility benchmark नहीं |
| Nitya Panchangam | Swiss Ephemeris, Lahiri ayanamsha, Drik Ganita; 40+ शहरों के लिए स्थान-आधारित गणना | ephemeris/Drik-Ganita implementation का स्वतंत्र cross-check; Asta event तभी compare करें जब उसका event rule प्रकाशित हो |
| KaalPanchang | Drik method, Lahiri, स्थान-आधारित सूर्योदय और पंचांग convention | पंचांग convention / local-time validation; Asta-specific rule स्पष्ट होने तक Asta ground truth नहीं |
| IJHS: On the Visibility of Agastya (Canopus) in India (2016) | अलग-अलग भारतीय अक्षांशों पर Canopus की heliacal visibility का ऐतिहासिक/गणनात्मक अध्ययन | अगस्त्य के लिए स्वतंत्र अकादमिक latitude-based sanity check; आधुनिक मौसम/स्थानीय terrain का प्रत्यक्ष observation नहीं |

## 2. पकड़े गए तुलना-बिंदु

### शुक्र — 2026

**Panchang Guru, New Delhi**
- Asta: 12 Oct 2026, 18:19, setting
- Udaya: 29 Oct 2026, 06:00, rising
- स्रोत पृष्ठ इसे स्थान-निर्भर ग्रह के setting/rising moments बताता है।

**FSVS, 2026**
- Asta/combustion: 19 Oct 2026, 08:15 IST
- Udaya/end: 29 Oct 2026, 09:39 IST
- उसी पृष्ठ पर स्पष्ट है कि यह सूर्य से 10° की दूरी (वक्री में 8°) वाली सीमा है; अन्य पंचांग अलग सीमा या visibility rule अपना सकते हैं।

**Drik Panchang**
- ग्रह-अस्त की सूची प्राथमिक reference बनी रहेगी। Drik की city selector से चुने गए शहर का नाम, coordinates उपलब्ध हों तो वे, timezone, event date/time और page capture date प्रत्येक record में दर्ज करें।
- परियोजना में पहले से उपलब्ध Pithoragarh reference: 2026-10-12 18:05 से 2026-10-29 05:49 (user-supplied Drik reference; city-specific record को अन्य शहर के नाम से नहीं जोड़ना)।

**निष्कर्ष:** Panchang Guru का New Delhi window user-supplied Pithoragarh Drik window के निकट है, लेकिन FSVS का 19 Oct start angular combustion की अलग परिभाषा दिखाता है। इन दोनों को एक ही target event मानना गलत होगा। 2026-10-12 और 2026-10-19 का अंतर कोई मामूली rounding error नहीं; यह event-definition का अंतर है।

### गुरु — 2027

**Panchang Guru, New Delhi**
- Asta: 17 Aug 2027, 19:32, setting
- Udaya: 13 Sep 2027, 05:22, rising
- प्रकाशित अवधि: 27 दिन।

इसे 2027 के Guru local set/rise event के लिए दूसरा comparator रखें। इसे Pithoragarh result न कहें; New Delhi observer का result है।

### अगस्त्य / Canopus

2016 के *Indian Journal of History of Science* लेख में 2013 के लिए:
- Varanasi (25°19′): heliacal setting 30 Apr; heliacal rising 20 Aug
- Jaipur (26°55′): heliacal setting 25 Apr; heliacal rising 24 Aug
- Cape Comorin (8°04′): heliacal setting 2 Jun; heliacal rising 18 Jul

यह तालिका स्पष्ट करती है कि Canopus की heliacal visibility अक्षांश के साथ बदलती है। Pithoragarh (29.5828°N) के लिए Jaipur/Varanasi dates को सीधा copy या linear interpolate नहीं करना है। इसे model sanity check और event-definition research के लिए उपयोग करें।

## 3. गणना इंजन के लिए निर्णय

एक ही planetary ephemeris से कम-से-कम दो अलग परिणाम निकालें:

1. **Angular combustion (geocentric):** ग्रह-सूर्य apparent geocentric separation; ग्रह की direct/retrograde state के अनुसार source-defined threshold. उदाहरण: Venus 10° direct / 8° retrograde, Jupiter 11° — FSVS द्वारा प्रकाशित convention. इसे Panchang combustion result नाम दें।
2. **Local heliacal set/rise (topocentric):** observer-specific apparent altitude/azimuth, solar depression, planet magnitude/phase, extinction/sky brightness और horizon profile पर आधारित। इसके boundaries local evening setting / morning rising के रूप में निकालें। इसे actual visibility/local tara set-rise नाम दें।

अगस्त्य के लिए Canopus का star catalogue position, proper motion, precession/nutation, topocentric altitude/azimuth, twilight brightness और local horizon इस्तेमाल करें। अगस्त्य के पारंपरिक अर्घ्य window को heliacal rising से अलग cultural rule layer में रखें।

## 4. Benchmark अनुशासन

हर record में:
- source name + exact source URL;
- observer city, latitude, longitude, elevation (unknown हो तो null, अनुमान नहीं);
- timezone और local timestamp + UTC timestamp;
- event class: angular-combustion / local-heliacal / traditional-arghya;
- source-declared rule, ephemeris/ayanamsa if disclosed;
- capture date, source precision, confidence class.

तुलना क्रम:
1. पहले समान शहर + समान event class + समान timezone।
2. फिर same ephemeris से geocentric angular crossing निकालकर angular model जाँचें।
3. local event के लिए topocentric model और observer elevation/horizon inputs अलग जाँचें।
4. एक शहर/वर्ष पर calibration और दूसरे शहर/वर्ष पर blind validation।
5. median, p95 और signed residual minutes प्रकाशित करें; event definitions अलग हों तो residual table में अलग रखें, fit में न मिलाएँ।

## 5. स्रोत

- Drik Panchang planets combustion: https://www.drikpanchang.com/planet/asta/planets-combustion.html
- Panchang Guru Shukra Asta (New Delhi): https://www.panchangguru.com/shukra-asta
- Panchang Guru Guru Asta (New Delhi): https://www.panchangguru.com/guru-asta
- Panchang Guru calculation method: https://www.panchangguru.com/how-we-calculate
- School of Vedic Sciences Shukra gochar 2026: https://fsvs.co.in/panchang/gochar/shukra
- Nitya Panchangam methodology: https://nityapanchangam.com/methodology/
- KaalPanchang calculation method: https://kaalpanchang.com/panchang-concepts/how-panchang-is-calculated
- Chandra Hari, “On the Visibility of Agastya (Canopus) in India”, Indian Journal of History of Science 51.3 (2016), DOI: 10.16943/ijhs/2016/v51i3/48851 — https://cahc.jainuniversity.ac.in/assets/ijhs/Vol51_2016_3_Art06.pdf

स्रोतों के प्रकाशित परिणामों को केवल गणना-सत्य का प्रमाण न मानें। जहां source engine या event rule पूर्ण रूप से सार्वजनिक नहीं है, उसे independent published reference कहें, ground truth नहीं।
