# युगादि एवं महारात्रि — स्रोत और Drik Panchang मिलान

**समीक्षा तिथि:** 2026-11-01  
**स्थिति:** केवल शोध-दस्तावेज़; live festival JSON, runtime और Blogger payload में कोई परिवर्तन नहीं।

## 1. चार युगादि तिथियाँ — Drik Panchang से 2026 मिलान उपलब्ध

*General Rules for Religious Festivals*, पृ. 107 में प्रमुख सूची यह है:

| युग | तिथि |
|---|---|
| सत्य/कृत | कार्तिक शुक्ल नवमी |
| त्रेता | वैशाख शुक्ल तृतीया |
| द्वापर | माघ कृष्ण अमावस्या |
| कलि | भाद्रपद कृष्ण त्रयोदशी |

उसी पृष्ठ पर बंगाल में प्रचलित अलग सूची भी दी गई है:

| युग | बंगाल में दी गई तिथि |
|---|---|
| सत्य/कृत | वैशाख शुक्ल तृतीया |
| त्रेता | कार्तिक शुक्ल नवमी |
| द्वापर | श्रावण कृष्ण त्रयोदशी |
| कलि | माघ पूर्णिमा |

स्रोत: https://dspace.gipe.ac.in/xmlui/bitstream/handle/10973/39692/GIPE-043972.pdf?isAllowed=y&sequence=3

MyPanchang की 2026 सूची चारों नाम-तिथियों को इसी प्रमुख क्रम में दिखाती है: Dwapara — Magha Amavasya; Treta — Vaishakha Shukla Tritiya; Kali — Bhadrapada Krishna Trayodashi; Krita — Kartika Shukla Navami। साइट इसे Vishnu Purana के वचन के रूप में Smriti Muktaphala (Kala Kanda) के माध्यम से उद्धृत करती है और Bangalore के sunrise-to-sunrise दिन देती है।

स्रोत: https://www.mypanchang.com/newsite/yugaditithi.php

**महत्त्वपूर्ण सुधार:** पहले के शोध नोट में लिखा गया था कि Drik Panchang पर चारों युगादि दिनों की सूची नहीं मिली। यह कथन अब गलत/पुराना है और नीचे दिए गए प्रत्यक्ष Drik स्रोत के आधार पर संशोधित किया गया है।

Drik Panchang का 2026 “Yugadi Days” पृष्ठ चारों cosmic Yugadi observances स्पष्ट रूप से सूचीबद्ध करता है:
- Dwapara Yuga Diwas — Magha Krishna Amavasya
- Treta Yuga Diwas — Vaishakha Shukla Tritiya
- Kali Yuga Diwas — Ashwina/Bhadrapada Krishna Trayodashi
- Sata/Krita Yuga Diwas — Kartika Shukla Navami

2026 Tiruvallur (India) पृष्ठ पर तिथियाँ क्रमशः 17 February, 19 April, 8 October और 18 November दी गई हैं। एक अलग Washington, D.C. पृष्ठ पर Dwapara Yuga Diwas 16 February दिखता है; इससे स्पष्ट है कि sunrise-based Hindu date assignment स्थान/समय-क्षेत्र के अनुसार बदल सकता है। अतः Pithoragarh के लिए स्थानीय Drik चयन से अलग पुष्टि किए बिना Tiruvallur की तारीखें सीधे production में कॉपी न करें।

स्रोत:
- https://www.drikpanchang.com/panchang/tithi/yugadi/yugadi-days.html
- 2026 Tiruvallur result: https://www.drikpanchang.com/panchang/tithi/yugadi/yugadi-days.html
- MyPanchang 2026: https://www.mypanchang.com/newsite/yugaditithi.php

Drik का सामान्य Ugadi (Chaitra Shukla Pratipada) और चार cosmic Yugadi Days अलग observances हैं। इन्हें एक न समझें।

### ग्रंथीय पाठ-निर्णय और सावधानी

*General Rules for Religious Festivals* में ऊपर दी प्रमुख सूची और बंगाल की वैकल्पिक सूची दोनों दर्ज हैं। अतः वैकल्पिक परंपरा का अस्तित्व वास्तविक है, लेकिन किसी एक सूची को सभी क्षेत्रों पर लागू करने से पहले परंपरा स्पष्ट करनी होगी।

नारदपुराण अध्याय 112 के उपलब्ध अनुवाद/टीका में भी प्रमुख सूची का उल्लेख मिलता है; फिर भी उत्पादन में श्लोक उद्धृत करने से पहले संस्कृत मूल संस्करण/पृष्ठ का प्रत्यक्ष मिलान करना शेष है।

स्रोत: https://www.wisdomlib.org/hinduism/book/narada-purana-english/d/doc1857977.html

**कार्रवाई:** चार युगादि दिनों को OurHinduDharm में जोड़ना उपयोगी है और 2026–2030 के लिए Drik के वार्षिक संदर्भ उपलब्ध हैं। लेकिन पिथौरागढ़ की स्थानीय तिथियाँ और तिथि-व्याप्ति अलग से सत्यापित करने के बाद ही production JSON में जोड़ें। यदि जोड़ा जाए तो इन्हें “चार युगादि / युग-स्मृति दिवस” के रूप में अलग पहचान दें और बंगाल की वैकल्पिक परंपरा को शोध-नोट में रखें; उसे default date set में न मिलाएँ।

### 2027–2030 Drik वार्षिक मिलान

| वर्ष | द्वापर युगादि — अमावस्या | त्रेता — वैशाख शुक्ल तृतीया | कलि — कृष्ण त्रयोदशी | सत्य/कृत — कार्तिक शुक्ल नवमी | Drik पृष्ठ का स्थान |
|---|---|---|---|---|---|
| 2027 | 7 मार्च | 9 मई | 28 सितंबर | 7 नवंबर | Pokhara, Nepal |
| 2028 | 24 फ़रवरी | 27 अप्रैल | 17 सितंबर | 26 अक्टूबर | Jevargi, Karnataka |
| 2029 | 13 फ़रवरी | 16 मई | 6 अक्टूबर | 14 नवंबर | New Delhi |
| 2030 | 3 मार्च | 5 मई | 25 सितंबर | 3 नवंबर | Jharsugra, Odisha |

स्रोत: [Drik 2027](https://www.drikpanchang.com/panchang/tithi/yugadi/yugadi-days.html?year=2027), [Drik 2028](https://www.drikpanchang.com/panchang/tithi/yugadi/yugadi-days.html?year=2028), [Drik 2029](https://www.drikpanchang.com/panchang/tithi/yugadi/yugadi-days.html?year=2029), [Drik 2030](https://www.drikpanchang.com/panchang/tithi/yugadi/yugadi-days.html?year=2030)।

**स्थान-संबंधी सीमा:** ये तारीखें अलग-अलग Drik शहर-चयन से ली गई हैं; 2027 का उपलब्ध परिणाम Pokhara (नेपाल) का है। इन्हें पिथौरागढ़ की अंतिम तारीखें नहीं माना जा सकता। Drik के अनुसार पंचांग-दिवस सूर्योदय से शुरू और समाप्त होता है। 2026 में Tiruvallur पर द्वापर युगादि 17 फ़रवरी और Washington D.C. पर 16 फ़रवरी दिखना स्थान/समय-क्षेत्र के प्रभाव का प्रत्यक्ष उदाहरण है। इसलिए पिथौरागढ़ की स्थानीय तिथि और तिथि-व्याप्ति जाँचकर ही production JSON में जोड़ें।

अमान्त/पूर्णिमान्त मास-नाम का अंतर भी ध्यान रखें: द्वापर युगादि अमावस्या MyPanchang में माघ कृष्ण अमावस्या और Drik के पूर्णिमान्त पृष्ठ पर फाल्गुन कृष्ण अमावस्या कही जा सकती है; यह एक ही अमावस्या है, दो अलग events नहीं।

## 2. चार महारात्रियाँ

देवीमाहात्म्य 1.79 का पाठ:

> कालरात्रिर्महारात्रिर्मोहरात्रिश्च दारुणा।

यह देवी के स्वरूप की स्तुति है। उपलब्ध संदर्भ से यह सिद्ध नहीं होता कि जन्माष्टमी, दीपावली/नरक चतुर्दशी, होलिका दहन और महाशिवरात्रि को क्रमशः इन चार नामों से जोड़ने वाला एक सार्वभौम मूल विधान मौजूद है।

Drik Panchang की पर्व-तिथि गणना अपने-आप इस तांत्रिक नाम-समीकरण का प्रमाण नहीं बनती। इस समीक्षा में इन चार पर्वों के साथ उक्त चार नामों का स्पष्ट मूल-ग्रंथ-आधारित Drik प्रमाण नहीं मिला।

**कार्रवाई:** चारों पर्व पहले से मौजूद हैं। कोई नया कार्ड, स्वचालित नियम या अप्रमाणित तांत्रिक समीकरण न जोड़ें। देवीमाहात्म्य 1.79 को उसके वास्तविक स्तुति-संदर्भ में ही उद्धृत किया जा सकता है।

## 3. सिद्ध रात्रियाँ और महाविद्या जयन्तियाँ

वीररात्रि, मृतसंजीवनी, अचलरात्रि आदि के लिए प्राप्त नियमों में मूल ग्रंथ का सटीक पाठ, अध्याय/श्लोक और पूर्ण गणना-शर्तें उपलब्ध नहीं हैं। Drik Panchang से भी इन नामों के लिए कोई प्रमाणित वार्षिक योग-सूची स्थापित नहीं हुई।

महाविद्या/सिद्धविद्या जयन्तियों की वर्तमान project entries को इस सामान्य श्लोक के आधार पर पुनः प्रमाणित नहीं माना जा सकता। प्रत्येक देवी की तिथि का अलग स्रोत आवश्यक है। इस समीक्षा से कोई नई जयन्ती या तांत्रिक रात्रि स्वीकार नहीं की जाती।

## 4. कार्यान्वयन निर्णय

- यह दस्तावेज़ research-only है।
- कोई live festival JSON, runtime, test fixture या Blogger widget नहीं बदला गया।
- चार युगादि दिनों का 2026 Drik cross-check उपलब्ध है; Pithoragarh और 2027–2030 की local date verification शेष है।
- सामान्य Ugadi/चैत्र शुक्ल प्रतिपदा को चार cosmic Yugadi observances से अलग रखें।
- चार महारात्रियों के पर्व-समीकरण, सिद्ध रात्रियों और अप्रमाणित जयन्ती-दावों को skip करें।
- उत्पादन में वही तिथि डालें जिसकी स्थानीय sunrise-based assignment और source tradition दोनों जाँचे जा चुके हों।
