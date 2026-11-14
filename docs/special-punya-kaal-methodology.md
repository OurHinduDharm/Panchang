# विशेष पुण्यकाल एवं धार्मिक साधना — गणना शोध नोट

स्थिति: प्रारंभिक शोध; अभी कोई नया समय सार्वजनिक प्रकाशन के लिए स्वीकृत नहीं है।

## उत्पाद संरचना

अलग स्थायी पृष्ठ: **विशेष पुण्यकाल एवं धार्मिक साधना**

प्रकाशन अवधि: 2026–2030  
संदर्भ स्थान: पिथौरागढ़, 29.5828° N, 80.2182° E, ऊँचाई 1650 m  
समय क्षेत्र: Asia/Kolkata

### केवल वे विभाग जो अभी मौजूदा पंचांग में उपलब्ध नहीं हैं

1. **महापात (सूक्ष्म क्रान्तिसाम्य):** व्यतीपात महापात और वैधृति महापात; स्पर्श और मोक्ष समय।
2. **महोदय योग:** केवल मूल शास्त्रीय लक्षण और गणना-विधि प्रमाणित होने पर।
3. **वारुणी, महावारुणी और महामहावारुणी योग:** केवल सत्यापित तिथि/वार/नक्षत्र नियमों पर।

**संक्रांति इस नए पेज का अलग डेटा-सेक्शन नहीं होगी।** मौजूदा संक्रांति कार्ड और `sankranti-punya-kala` गणना वहीं बनी रहेगी। यदि उपयोगकर्ता को नए पेज से संदर्भ चाहिए तो केवल मौजूदा संक्रांति कार्ड/मुहूर्त का लिंक दिया जा सकता है; संक्रांति का पुण्यकाल दोबारा calculate या display नहीं करना है।

महापात के साथ ही मांगलिक कार्य-वर्जना की चेतावनी दिखाई जाएगी। यह चेतावनी संक्रांति या अन्य योगों पर नहीं लगेगी।

## महापात: गणना-पद्धति संबंधी महत्वपूर्ण भेद

- सामान्य पंचांग के 27 नित्य योगों में व्यतीपात/वैधृति और क्रान्तिसाम्य-आधारित महापात एक ही गणना नहीं हैं।
- महापात का मूल खगोलीय आधार सूर्य और चन्द्रमा की क्रान्ति (declination) का सूक्ष्म साम्य है। घटना के दोनों boundary/root instants खोजने होंगे; केवल दैनिक योग-नाम या राशि-स्थिति से समय निकालना स्वीकार्य नहीं।
- केवल सूर्य-चन्द्रमा के निरयण देशान्तरों का योग लेकर महापात का समय निकालना स्वीकार्य नहीं।
- अलग सिद्धान्त/करण-ग्रंथों में पात-निर्णय, अयन, ग्रहों की स्फुट स्थिति और स्पर्श-मोक्ष की प्रक्रिया का तुलनात्मक अध्ययन करना होगा। चुनी हुई परिभाषा को code और tests में स्पष्ट दर्ज करें।
- आधुनिक राष्ट्रीय पंचांग का सायन व्यतीपात/वैधृति डेटा अपने-आप पारंपरिक महापात का विकल्प नहीं है।

## महोदय योग: प्रारंभिक शोध, अभी implementation rule स्वीकृत नहीं

एक प्रचलित शास्त्रीय वर्णन में पौष/माघ अमावस्या, रविवार, श्रवण नक्षत्र और व्यतीपात योग के पूर्ण संयोग को अर्धोदय कहा गया है। कुछ व्याख्याओं में इन चार में से एक घटक के न्यून होने पर महोदय कहा गया है, लेकिन कौन-सा घटक अनुपस्थित हो और कौन-सी तिथि/मास-परंपरा लागू हो—इसमें मतभेद हैं।

इसलिए:
- अर्धोदय और महोदय को एक ही नाम से न दिखाएँ।
- चार घटकों के संयोग को स्वतः महोदय न कहें।
- धर्मशास्त्र/निबन्ध के मूल पाठ से नियम तय होने तक कोई महोदय तारीख़ सार्वजनिक न करें।
- यदि 2026–2030 में नियम प्रमाणित न हो तो महोदय सेक्शन छिपा रहेगा।

## वारुणी-परिवार: प्रारंभिक नियम और आवश्यक cross-check

### स्वीकृत प्राथमिक profile — स्मार्त निबन्ध परंपरा

काल-निर्णयसिन्धु में उद्धृत वारुणी-निर्णय के अनुसार इस परियोजना का प्राथमिक profile:
- **वारुणी:** चैत्र कृष्ण त्रयोदशी + शतभिषा नक्षत्र का संयोग।
- **महावारुणी:** उपर्युक्त संयोग + शनिवार।
- **महामहावारुणी:** उपर्युक्त संयोग + शनिवार + शुभ नामक नित्ययोग।

इस पाठ में महामहावारुणी के लिए शुभ योग को भी वास्तविक समय-अंतराल में संयोग के साथ उपस्थित होना चाहिए। केवल उसी दिन शुभ योग होना पर्याप्त नहीं।

### पाठ-भेद जिन्हें प्राथमिक गणना में नहीं मिलाना है

नारदपुराण के एक अन्य वर्णन में चैत्र शुक्ल त्रयोदशी, शनिवार और शतभिषा के संयोग को महामहा नाम से कहा गया है। कुछ अन्य संकलनों में महावारुणी/महामहावारुणी की शर्तें अलग तरह से संक्षेपित हैं। ये अलग पाठ-परंपराएँ हैं; इन्हें एक ही rule में जोड़ने से गलत अतिरिक्त तिथियाँ निकलेंगी। इस पंचांग में उपयोगकर्ता की स्मार्त-प्राथमिकता के अनुसार ऊपर दिया गया काल-निर्णयसिन्धु profile मुख्य रहेगा। वैकल्पिक पाठ को केवल आंतरिक शोध में रखा जाएगा, सार्वजनिक गणना में नहीं।

परियोजना का calendarType `purnimanta` है; उसी पंचांग मास-नाम को लिया जाएगा। चैत्र कृष्ण पक्ष को किसी अन्य मास में स्वतः remap नहीं करना है। तिथि, नक्षत्र और शुभ योग के वास्तविक intervals लिए जाएँगे; केवल noon snapshot पर्याप्त नहीं। वार का निर्धारण पिथौरागढ़ के स्थानीय civil date से होगा।

## संक्रांति — मौजूदा सुविधा यथावत

मौजूदा `festival-muhurta.js` में `sankranti-punya-kala` नियम मौजूद है। यह नया फीचर उस सुविधा को duplicate नहीं करेगा। संक्रांति पुण्यकाल का एकमात्र सार्वजनिक display मौजूदा संक्रांति कार्ड/मुहूर्त रहेगा। इस PR में संक्रांति के लिए नया annual data set या दूसरा UI section नहीं बनाया जाएगा।

## UI placement

- अलग स्थायी पृष्ठ; mobile-first, हल्का।
- मासिक व्रत-पर्व पृष्ठ पर स्पष्ट लिंक।
- दैनिक पंचांग पर केवल छोटा लिंक।
- केवल सत्यापित events वाले विभाग दिखें; खाली/अप्रमाणित विभाग छिपे रहें।
- सार्वजनिक पृष्ठ पर किसी बाहरी स्रोत का नाम, URL, citation link या provider branding नहीं।
- स्रोत, तुलना और गणना-पद्धति के विवरण केवल repository के आंतरिक research notes/tests में।

## Acceptance tests

- 2026–2030 data coverage और chronological ordering।
- महापात: चुनी हुई शास्त्रीय परिभाषा के अनुसार सही event class, स्पर्श < मोक्ष, declination/root residual tolerance, timezone और year-boundary cases।
- वारुणी आदि: तिथि/वार/नक्षत्र/नित्य योग boundary, मास-निर्णय तथा leap-year tests।
- महोदय: केवल source-approved rule के लिए tests; अन्यथा section/data absent।
- संक्रांति: existing implementation unchanged; कोई duplicate event/UI/data नहीं।
- अनुपलब्ध/अप्रमाणित data को blank/hidden रखें; कभी अनुमानित समय न दिखाएँ।
- मौजूदा दैनिक पंचांग, मासिक फेस्टिवल, ग्रहण और मुहूर्त tests में regression न हो।

## प्रारंभिक शोध संदर्भ (केवल आंतरिक)

- Drik Panchang, क्रान्तिसाम्य दोष / महापात: https://www.drikpanchang.com/astrology/mahapata/kranti-samya-dosha.html
- उत्तराखण्ड मुक्त विश्वविद्यालय, MAJY-504, भास्कराचार्य का क्रान्ति-साम्य पात वर्णन: https://uou.ac.in/sites/default/files/slm/MAJY-504.pdf
- वारुणी/महावारुणी/महामहावारुणी के स्कन्दपुराण-आधारित पाठ का शब्दकोशीय उद्धरण: https://upasanayoga.org/VacD-Pages/VacD-354_v%C4%81t-v%C4%81r.htm
- महावारुणी और महामहावारुणी पर निबन्ध-पाठ/परंपरा-भेद: https://www.transliteral.org/pages/z130524061827/view
- महोदय/अर्धोदय का प्रारंभिक वर्णन: https://karmkandvidhi.in/ardhoday-yog/

इन संदर्भों को सार्वजनिक पेज पर लिंक या स्रोत-बैज के रूप में नहीं दिखाना है।


## Implementation checkpoint

- `special-punya-kaal.mjs` now contains an interval-based Varuni-family candidate primitive. It intersects Trayodashi, Shatabhisha and the local sunrise-to-next-sunrise Hindu day.
- Mahavaruni and Mahamahavaruni are emitted as separate time intervals. Mahamahavaruni is restricted to the exact overlap with Shubha nitya-yoga; it must not inherit the full Varuni interval.
- These records are `research-candidate` only. The primitive is not yet an approved annual calendar generator.
- Automated unit tests cover exact overlap, Saturday condition, Shubha overlap, wrong tithi/nakshatra/month, and missing sunrise. Latest dedicated GitHub Actions run passed.
- Important unresolved check before annual generation: confirm the textual tradition's Chaitra-Krishna month label against the project's Purnimanta calculation convention. Do not silently remap the month or publish candidates until this is settled.
- Mahapata and Mahodaya remain unimplemented. No public page or public event dataset has been added.


## Source decision update — Varuni family

The primary implementation profile is the Smarta nibandha formulation quoted in Kālanirṇaya-sindhu: Chaitra Krishna Trayodashi + Shatabhisha; Saturday upgrades it to Mahavaruni; an actually overlapping Shubha nitya-yoga upgrades it to Mahamahavaruni. The Nārada Purāṇa passage describing Chaitra Shukla Trayodashi + Saturday + Shatabhisha as Mahamaha is retained as a distinct textual variant and is not merged into this profile.

The Panchangam engine uses zero-based indices: Shatabhisha = 23 and Shubha nitya-yoga = 22. Unit tests now assert those exact indices even when the engine does not supply localized names.
