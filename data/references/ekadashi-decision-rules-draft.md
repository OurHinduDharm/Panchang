# एकादशी तिथि-निर्णय — प्रारम्भिक नियम-विश्लेषण

स्थिति: शोध-नोट; **कोडिंग के लिए स्वीकृत नियम नहीं**।  
समीक्षा तिथि: 2026-10-14  
कार्य-शाखा: `data/festival-json-foundation`

## 1. पुस्तक में प्रत्यक्ष रूप से क्या मिला

मुख्य स्रोत: [व्रत-परिचय OCR, भाग 007](../vrat-parichay-chunks/part-007.txt), मुद्रित पृष्ठ-संकेत लगभग 48–52।

OCR में पुस्तक कहती है कि:
- दोनों पक्षों की एकादशी व्रत के रूप में मानी जाती है; गृहस्थ/वानप्रस्थ/संन्यासी/विधवा के विषय में अलग उद्धरण भी दिए हैं।
- एकादशी को शुद्धा और विद्धा के रूप में बताया गया है।
- वेध के विषय में शैव, वैष्णव और सौर परंपराओं में अलग मत होने की बात स्पष्ट है।
- सूची में उदयव्यापिनी, पहले दिन दशमी की 45 घड़ी, 55 घड़ी का वेध, दशमी-द्वादशी-संबंध वाली एकादशी, क्षय एकादशी और वैष्णव वेध जैसे भिन्न विचार दर्ज हैं।
- पुस्तक उन्मीलिनी, वंजुली, त्रिस्पृशा, पक्षवर्धिनी, जया, विजया, जयन्ती और पापनाशिनी नामक आठ विशेष महाद्वादशी/एकादशी-सम्बद्ध भेद भी गिनाती है।
- त्रिस्पृशा का एक उदाहरण दिया गया है: एक सूर्योदय में एकादशी, उसके बाद द्वादशी, और अगले सूर्योदय में त्रयोदशी।
- उसी अंश में द्वादशी कम रहने पर पारण और कुछ परिस्थितियों में जल से पारण का उल्लेख है; इन निर्देशों का विशिष्ट प्रसंग और उद्धृत मूल स्रोत फिर से पढ़ना होगा।

यह स्रोत **एक ही सार्वभौमिक वेध-सीमा तय नहीं करता**; बल्कि मतभेदों का विवरण देता है। इसलिए OCR में मिली 45/55 घड़ी आदि को बिना स्रोत-विश्लेषण के मिनटों में बदलकर इंजन में डालना गलत होगा।

## 2. प्रस्तावित निर्णय-इंजन की परतें

| परत | प्रश्न | आवश्यक इनपुट | स्थिति |
|---|---|---|---|
| A. खगोलीय पंचांग | दशमी, एकादशी, द्वादशी और त्रयोदशी स्थानीय समय में कब शुरू/समाप्त होती हैं? | तिथि संक्रमण, स्थानीय सूर्योदय/समय-क्षेत्र | अलग से गणना/परीक्षण |
| B. दिन-निर्धारण | किस स्थानीय सूर्योदय पर कौन-सी तिथि चल रही है? | तिथि संक्रमण + सूर्योदय | स्पष्ट गणितीय परीक्षण |
| C. परंपरा नीति | Smarta, Vaishnava या चयनित परंपरा किस दिन उपवास रखती है? | परंपरा प्रोफ़ाइल + B के परिणाम | शोध जारी |
| D. विशेष स्थिति | क्षय, वृद्धि, दशमी-वेध, द्वादशी-वेध, महाद्वादशी/त्रिस्पृशा है? | लगातार तिथि-सीमाएँ और सूर्योदय | नियम तालिका चाहिए |
| E. पारण | स्थानीय अगले दिन पारण की अनुमत अवधि क्या है? | द्वादशी/त्रयोदशी सीमाएँ, सूर्योदय, चुनी परंपरा | अलग शोध चाहिए |
| F. प्रस्तुति | वेबसाइट पर एक तारीख दिखानी है या Smarta/Vaishnava दोनों? | यूज़र/साइट की चुनी नीति | UX निर्णय बाकी |

## 3. प्राथमिक स्रोत और तुलनात्मक संदर्भ

- [Dharma Sindhu — Tithi Vrata Nirnayas, अध्याय 5 (संक्षिप्त अंग्रेज़ी प्रस्तुति)](https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=5)
- [Dharma Sindhu — Tithi Nirnaya, अध्याय 3 (संक्षिप्त अंग्रेज़ी प्रस्तुति)](https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=3)
- [Narada Purana — Ekadashi nirnaya पर टीका/अनुवाद](https://www.wisdomlib.org/hinduism/book/narada-purana-english/d/doc1858028.html)
- [TKS Lab](https://tksephemeris.com/tks-lab) — चुनी तारीख, नीति/profile और उम्मीदवारों की तुलना के लिए।
- [PanchangTime methodology](https://panchangtime.com/methodology/ekadashi) — आधुनिक इंजन के निर्णय-क्रम को समझने का तुलनात्मक स्रोत, प्राथमिक शास्त्रीय प्रमाण नहीं।

ऑनलाइन अंग्रेज़ी सारांशों में भी नियमों की शब्दावली/सीमा अलग हो सकती है। किसी नियम को स्वीकार करने से पहले मूल ग्रंथ का अध्याय/श्लोक, संस्करण और परंपरा-संदर्भ पहचानना है।

## 4. अभी तय नहीं किए जाने वाले बिंदु

1. **अरुणोदय की अवधि:** कुछ आधुनिक स्रोत 4 घटी/96 मिनट बताते हैं; पुस्तक के अंश में कई अलग घड़ी-आधारित मत हैं। इसे एक universal rule न मानें।
2. **Smarta/Vaishnava:** किस परंपरा में कौन-सी दशमी-वेध स्थिति त्याज्य है, इसे उद्धृत मूल नियम और परंपरा-संदर्भ से तय करना होगा।
3. **क्षय/वृद्धि:** केवल सामान्य तिथि-सूर्योदय जाँच से निर्णय पूरा नहीं होगा; संबंधित नियमों का पूरा निर्णय-क्रम चाहिए।
4. **महाद्वादशी:** आठ नामों की सूची मिली है, लेकिन प्रत्येक के सटीक trigger conditions और उपवास/पारण नियम अलग से खोजने होंगे।
5. **पारण:** सामान्यतः “द्वादशी को पारण” कहना पर्याप्त नहीं। हरिवासर, द्वादशी-समाप्ति, सूर्योदय और असामान्य स्थितियों के क्रम का स्रोत-सम्मत निर्णय चाहिए।
6. **अधिकमास:** पद्मिनी/परमा के स्रोत और उनके नाम/विधि की अलग पुष्टि बाकी है।
7. **क्षेत्र/सम्प्रदाय:** वेबसाइट को पहले एक घोषित default चाहिए; विकल्प उपलब्ध कराने हों तो label स्पष्ट हों, ताकि दो तारीखें त्रुटि न लगें।

## 5. अगले काम का सटीक क्रम

1. भाग 007 के मुद्रित पृष्ठ 49–52 को मूल PDF/पुस्तक से OCR-पंक्ति-दर-पंक्ति मिलाना।
2. उसमें सूचीबद्ध प्रत्येक नियम के सामने उद्धृत ग्रंथ/श्लोक पहचानना।
3. Dharma Sindhu और Nirnaya Sindhu के संबंधित मूल अंश/विश्वसनीय संस्करण से तुलना करना।
4. Smarta, Vaishnava, Kshaya/Vriddhi, Mahadwadashi और Parana के अलग decision tables बनाना।
5. TKS Lab में चुनी policy और 2–3 कठिन तिथियों के परिणाम रिकॉर्ड करना।
6. तभी automated test cases और code design बनाना।

**सावधानी:** इस दस्तावेज़ में कोई तिथि-निर्धारण नियम production में लागू नहीं किया गया है।


## 6. उपयोगकर्ता द्वारा पुष्ट प्रस्तुति-आवश्यकता — स्मार्त और वैष्णव

दिनांक 2026-10-14 को परियोजना की आवश्यकता स्पष्ट की गई:

- एकादशी निर्णय को कम-से-कम दो अलग परंपरा-प्रोफ़ाइलों में रखना है: **स्मार्त** और **वैष्णव**।
- दोनों प्रोफ़ाइलों के नियम अलग-अलग लागू होंगे; एक प्रोफ़ाइल के परिणाम से दूसरी तारीख का अनुमान नहीं लगाया जाएगा।
- हर पक्ष/मास की एकादशी के लिए दोनों परिणाम निकाले जाएँगे:
  1. यदि दोनों परंपराओं का निर्णय एक ही स्थानीय तारीख है, तो UI में **एक ही तारीख/एक ही एकादशी कार्ड** दिखेगा और उसमें स्पष्ट होगा कि स्मार्त तथा वैष्णव दोनों उसी दिन हैं।
  2. यदि निर्णय अलग है, तो संबंधित तारीखों पर **स्मार्त एकादशी** और **वैष्णव एकादशी** अलग लेबल के साथ दिखाई जाएँगी।
- किसी तारीख को केवल इसलिए दो बार नहीं दिखाना कि दो प्रोफ़ाइल मौजूद हैं; तारीखें समान होने पर परिणाम deduplicate होगा।
- विशेष स्थितियों (दशमी-वेध/अरुणोदय, क्षय-वृद्धि, महाद्वादशी/त्रिस्पृशा और पारण) में दोनों प्रोफ़ाइलों के लिए पूरा स्रोत-सम्मत नियम-क्रम चाहिए। ऊपर का UI व्यवहार स्वीकृत आवश्यकता है, लेकिन किसी विशेष धार्मिक नियम का विवरण अभी स्वतः स्वीकृत नहीं माना जाएगा।
- स्थान-विशिष्ट सूर्योदय, तिथि-संक्रमण और पारण समय दोनों प्रोफ़ाइलों के लिए समान खगोलीय आधार से निकलेंगे; अलग केवल परंपरा के निर्णय-नियम होंगे।

### अपेक्षित डेटा/गणना संरचना (प्रारूप)

- एक मूल observance identity: मास, पक्ष, एकादशी का नाम/प्रकार।
- अलग decision result: `smarta` और `vaishnava`, प्रत्येक के लिए चुनी तारीख, निर्णय-कारण, लागू rule IDs, संबंधित पारण-नियम/समय और review status।
- प्रस्तुति-स्तर पर तारीख के अनुसार समूह बनाकर समान तारीख को एक कार्ड में दोनों labels दिखाना; अलग तारीखों को अलग कार्ड।
- `verified-rule` के बिना निर्णय-कारण को “शास्त्र-सम्मत अंतिम निर्णय” न कहें; शोधाधीन/असहमति वाले मामलों में status और स्रोत-संदर्भ रखें।

यह सेक्शन UI/product requirement को दर्ज करता है, न कि अभी अप्रमाणित धार्मिक नियमों को प्रमाणित करता है।


## Source comparison update — 2026-10-15

### Dharma Sindhu online condensed English translation: useful lead, not a final rule

The online condensed translation's Ekadashi section explicitly distinguishes Vaishnava and Smarta methods and discusses Arunodaya/Dashami-vedha. It states a 57-ghati and 60-ghati distinction before Arunodaya (see the Ekadashi discussion around lines 24–26): https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=5 . The same page says Parana should be completed before Dvadashi ends and lists eight Mahadvadashi types, with Jaya–Pushya, Vijaya–Shravana, Jayanti–Punarvasu and Papanaashani–Rohini (around lines 34–38).

However, the *Vrat-Parichay* OCR part 007 describes several competing community-specific views, including 45/55-ghati categories. These cannot be treated as a direct one-to-one match for the condensed English translation's 57/60 statements. The English page is a condensed translation, not a critical edition, and ghati reference points/terminology need verification against the selected printed Dharmasindhu edition and Nirnayasindhu before coding. In particular, do not infer a modern-minute threshold from these statements without confirming exactly what interval the ghatis measure.

### Safe design conclusion

The engine should store a named, source-cited decision profile rather than a single global vedha constant. The profile must specify the original wording, source edition/page, the reference point (sunrise vs arunodaya), the tradition scope, and how the rule interacts with actual tithi intervals. Until that review is complete, `45`, `55`, `57` and `60` ghati values remain research evidence only and must not drive public dates.


### General tithi-vedha passage is not the Ekadashi-specific decision by itself

The online condensed Dharma Sindhu chapter 3 says that the general Dashami-vedha for Ekadashi is fifteen ghatis (see https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=3, around lines 44–47). Chapter 5 separately discusses Ekadashi-specific Smarta/Vaishnava methods and mentions 57/60 ghatis before Arunodaya. These statements use different contexts and reference points in the translation; they must not be combined as if they were one arithmetic threshold. The source edition, exact Sanskrit wording and intended reference interval must be reconciled first.

Research table update: record chapter 3's general fifteen-ghati vedha and chapter 5's Ekadashi-specific statements as separate claims. Neither is yet an approved executable rule.
