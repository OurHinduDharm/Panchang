# एकादशी शोध — निर्णय पंजिका (Decision Log)

स्थिति: सक्रिय शोध-दस्तावेज़; यह अपने-आप किसी शास्त्रीय नियम को प्रमाणित नहीं करता।  
शाखा: `data/festival-json-foundation`  
संबंधित दस्तावेज़:
- [स्रोत-तुलना](./ekadashi-source-comparison.md)
- [नियम-मैट्रिक्स ड्राफ्ट](./ekadashi-rule-matrix-draft.md)
- [एकादशी समीक्षा-लेजर](./ekadashi-review-ledger.md)

## स्थिति के अर्थ

- **ACCEPTED — PRODUCT:** उपयोगकर्ता द्वारा तय UI/सॉफ्टवेयर व्यवहार; धार्मिक नियम की स्वीकृति नहीं।
- **RESEARCH:** स्रोत या व्याख्या की जाँच जारी है।
- **UNVERIFIED / TRANSLATION CONFLICT:** मूल पाठ, अनुवाद या संदर्भ में स्पष्ट समस्या है।
- **DEFERRED:** अभी कोड/प्रकाशन में लागू नहीं करना।
- **VERIFIED RULE:** केवल तब, जब विश्वसनीय संस्करण का मूल अंश, सटीक संदर्भ, परंपरा-दायरा और कम-से-कम एक worked example की समीक्षा हो चुकी हो।

## निर्णय प्रविष्टियाँ

| ID | निर्णय / दावा | स्थिति | आधार / कारण | आगे की कार्रवाई |
|---|---|---|---|---|
| UI-01 | स्मार्त और वैष्णव के लिए अलग निर्णय-प्रोफ़ाइलें रखी जाएँ | ACCEPTED — PRODUCT | उपयोगकर्ता की स्पष्ट आवश्यकता | दोनों प्रोफ़ाइलों के धार्मिक नियम अलग स्रोत-समीक्षा से तय हों |
| UI-02 | दोनों प्रोफ़ाइल एक ही स्थानीय तारीख चुनें तो एक कार्ड पर दोनों लेबल; तारीखें अलग हों तो अलग कार्ड | ACCEPTED — PRODUCT | उपयोगकर्ता की स्पष्ट आवश्यकता | UI implementation से पहले date-selection output schema तय करें |
| ASTRO-01 | दोनों प्रोफ़ाइलों को समान स्थानीय तिथि-सीमाएँ, सूर्योदय और स्थान/समय-क्षेत्र इनपुट मिलें | ACCEPTED — ARCHITECTURE | खगोलीय इनपुट और धार्मिक निर्णय अलग रखने की आवश्यकता | मौजूदा Panchang API से interface जाँचें |
| RULE-01 | 45/55/57/60 घड़ी को एक सामान्य threshold में बदलना | DEFERRED | स्रोतों/अनुवादों में संदर्भ और गणना-बिंदु अस्पष्ट हैं | मूल संस्कृत, संस्करण, व्याकरण और परंपरा-दायरा सत्यापित करें |
| RULE-02 | “स्मार्त हमेशा सूर्योदय वाली तारीख, वैष्णव हमेशा अगली तारीख” | REJECTED — OVER-SIMPLIFICATION | स्रोतों में वेध, वृद्धि/क्षय और विशेष द्वादशी के अलग मामले हैं | विस्तृत matrix से case-by-case निर्णय |
| RULE-03 | सभी वैष्णव नियमों को ISKCON/GCAL नियम मानना | DEFERRED | “वैष्णव” एक व्यापक श्रेणी है; विशिष्ट कैलेंडर-पद्धतियाँ अलग हो सकती हैं | भविष्य में ज़रूरत/स्रोत मिलने पर अलग profile पर विचार |
| RULE-04 | हरिवासर का पहला चौथाई, द्वादशी-अंत और सूर्योदय-पश्चात पारण को बिना अपवाद सार्वभौमिक hard constraints मानना | DEFERRED | इन सीमाओं और टकराव वाले मामलों का परंपरा-विशिष्ट स्रोत-सत्यापन बाकी है | अलग Parana matrix और प्रमाणित exception cases बनाएँ |
| RULE-05 | स्रोत-समर्थन के बिना जल/तुलसी से स्वतः fallback पारण देना | DEFERRED | सुझाया गया fallback अभी किसी विशिष्ट स्थिति के लिए सत्यापित नहीं | संबंधित मूल नियम और प्रयोज्यता खोजें |
| SOURCE-01 | Dharma Sindhu के condensed English translation से 57/60 घटी threshold और Parana fallback सीधे लागू करना | DEFERRED / UNVERIFIED | ऑनलाइन अध्याय उपयोगी locator है, पर मूल संस्कृत syntax, counting reference point और edition नहीं देता; Mahadvadashi नामों का rendering भी दूसरे स्रोतों से भिन्न है | मूल संस्कृत/विश्वसनीय संस्करण खोजें; पदच्छेद-अन्वय व exact context दर्ज करें |
| SOURCE-02 | Arunodaya-vedha और Suryodaya-vedha को एक ही condition मानना | REJECTED — COLLAPSES DISTINCT CASES | Nirnayasindhu, TransLiteral “Vedhacha Nirnaya” explicitly names both separately | अलग predicates और अलग source-backed decisions रखें |
| SOURCE-03 | चार घटी अरुणोदय को बिना source-policy के हर tradition पर लागू करना | DEFERRED | Nirnayasindhu passage cites four ghatis before sunrise but also discusses other wording and harmonisation; scope must be documented | selected definition, source and tradition scope store करें |
| PARANA-01 | हरिवासर, morning Parana और long-Dvadashi/Aparahna मतभेद को एक universal formula में collapse करना | DEFERRED | Nirnayasindhu Mahadvadashi commentary records competing views and short-Dvadashi/crisis exceptions | source lineage, context and tradition-specific precedence review करें |
| MAHA-01 | आठ महाद्वादशियों के नाम से सीधे एक common trigger बनाना | REJECTED — DISTINCT TRIGGERS | Nirnayasindhu gives different tithi-growth and nakshatra-based definitions | आठ अलग candidate rule IDs, each with explicit predicates |
| NORMAL-01 | “सामान्य एकादशी” की तारीख-चयन नीति को अभी verified मानना | DEFERRED | A precise normal-case input can be defined, but full primary-source selection clause and profile scope remain incomplete | full passage + worked timeline + source-reviewed expected result |
| AI-01 | AI से पदच्छेद, अन्वय, वैकल्पिक अर्थ और test-case ideas लेना | ACCEPTED — WORKFLOW | शोध में सहायक, पर स्वयं प्रमाण नहीं | प्रत्येक output को मूल पाठ/विश्वसनीय संस्करण से जाँचें |
| TEST-01 | ऐतिहासिक उदाहरणों से regression tests बनाना | ACCEPTED — WORKFLOW | नियमों के प्रभाव को जाँचने का तरीका | हर case में स्थान, परंपरा, स्रोत/कैलेंडर और अपेक्षित परिणाम दर्ज करें |

## आगे के निर्णयों के लिए टेम्पलेट

हर नया निर्णय इस रूप में दर्ज करें:

- **ID:**
- **प्रश्न / दावा:**
- **स्थिति:** RESEARCH / UNVERIFIED / DEFERRED / ACCEPTED / VERIFIED RULE
- **मूल ग्रंथ और सटीक संदर्भ:**
- **संस्करण / संपादक / पृष्ठ या डिजिटल locator:**
- **मूल संस्कृत पाठ:**
- **पदच्छेद और अन्वय:**
- **अनुवाद / व्याख्या:**
- **परंपरा और प्रयोज्यता की सीमा:**
- **विरोधी स्रोत / पाठांतर:**
- **Worked example (स्थान और तिथि सहित):**
- **समीक्षक / समीक्षा तिथि:**
- **कोड/डेटा पर प्रभाव:**

## अभी का निष्कर्ष

इस समय कोई भी एकादशी-दिन-निर्णय या पारण नियम इस पंजिका के कारण `VERIFIED RULE` नहीं माना गया है। पहले प्रमाण और प्रयोज्यता तय होगी; उसके बाद ही नियम-मैट्रिक्स, टेस्ट और कोड में बढ़ेंगे। लाइव Blogger में कोई बदलाव नहीं।
