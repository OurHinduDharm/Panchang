# एकादशी स्रोत से परीक्षण तक — अगला कार्य-चरण

**तारीख:** 2026-10-15  
**शाखा:** `data/festival-json-foundation`  
**स्थिति:** स्रोत-आधारित test plan; production नियम/कोड नहीं।

## स्रोत-कार्य के बारे में मालिक का निर्देश

इस परियोजना में मालिक द्वारा दिए गए धर्मसिन्धु और निर्णयसिन्धु के पुस्तक-पाठ/पृष्ठ ही मुख्य आधार हैं। प्रकाशन-वर्षों की तुलना करना लक्ष्य नहीं है। यदि किसी खास अक्षर, पदच्छेद या संदर्भ का अर्थ स्पष्ट न हो, तभी उसी पृष्ठ का स्कैन/फोटो माँगा जाए। धर्मसिन्धु के लिए पहले से दिए गए पाठ और `data/references/` में मौजूद पृष्ठ-चित्रों का उपयोग करना है; मालिक से वही सामग्री दोबारा माँगनी नहीं है।

मुख्य उपलब्ध स्रोत-नोट:
- [धर्मसिन्धु पृ. 17 — मालिक द्वारा दिया गया मूल पाठ](dharmasindhu-p17-owner-transcription.md)
- [धर्मसिन्धु पारण और महाद्वादशी शोध](dharmasindhu-p17-parana-research.md)
- [धर्मसिन्धु स्कैन-पाठ मिलान](dharmasindhu-image-collation-2026-10-14.md)
- [निर्णयसिन्धु/धर्मसिन्धु मूल-स्रोत ऑडिट](ekadashi-primary-source-audit-2026-10-14.md)
- [एकादशी rule matrix](ekadashi-rule-matrix-draft.md)
- [Vrata decision test matrix](vrata-decision-test-matrix.md)

## A. स्रोत में स्पष्ट दिखने वाले कथन और उनका सुरक्षित परीक्षण

| Test ID | स्रोत-कथन / शर्त | सुरक्षित परीक्षण-व्यवहार | अभी क्या तय नहीं है |
|---|---|---|---|
| PAR-HV-01 | धर्मसिन्धु पृ. 17: द्वादशी-वृद्धि पर द्वादशी का प्रथम पाद हरिवासर कहा गया है; उसे लाँघकर पारण | हरिवासर interval और पारण window अलग output हों; हरिवासर के भीतर पारण न सुझाएँ | द्वादशी की वृद्धि के सभी cases में यह वाक्य कैसे लागू है, यह आसपास के संदर्भ से जोड़ा जाए |
| PAR-TR-01 | “कलामात्राया अपि द्वादश्याः अभावे त्रयोदश्यां पारणम्” | यदि relevant द्वादशी की उपलब्धता शून्य हो तो test परिणाम सीधे universal न बने; source clause का antecedent/context साथ होना चाहिए | “द्वादशी का अभाव” किस निर्णय-स्थिति में लागू है; इसे हर सामान्य द्वादशी-क्षय का fallback न मानें |
| PAR-MID-BAHU-01 | “द्वादश्या मध्याह्नोर्ध्वं सत्त्वे प्रातर्मुहूर्तत्रयमध्य एव पारणं न मध्यादूर्ध्वम् इति बहवः” | `बहवः` view को अलग profile में रखें; test fixture में स्रोत का stated morning window ही हो | “प्रातर्मुहूर्तत्रय” का exact anchor/condition contextually formalize करना बाकी |
| PAR-MID-KECHIT-01 | “बहूनां कर्मकालानां बाधापत्तेरपराह्ण एव इति केचित्” | `केचित्` view को अलग profile में रखें; इसे `बहवः` view से merge न करें | यह alternative किन exact परिस्थियों में चुना जाए, user-facing default अभी तय नहीं |
| SHR-01 | श्रवण-युक्त द्वादशी; समर्थ व्यक्ति दोनों उपवास कर सकता है, असमर्थ व्यक्ति के लिए फलाहार-अनुकल्प और श्रवण-द्वादशी उपवास वर्णित है | व्रत-दिन चयन और साधक की क्षमता/विकल्प अलग रखें; क्षमता को astronomical inference न बनाएँ | सार्वजनिक UI में यह विकल्प कैसे दिखे, बाद का product decision |
| VSHR-01 | विष्णुशृंखला होने पर एकादशी को उपवास और श्रवण-रहित द्वादशी में पारण का कथन | केवल dedicated Vishnu-shr̥ṅkhala profile में evaluate करें | योग की पूर्ण परिभाषा का स्रोत में निर्दिष्ट भाद्रपद-श्रवण-द्वादशी संदर्भ अभी जोड़ना है |
| VSHR-02 | “द्वादश्याः श्रवणतो न्यूनत्वे श्रवणयुक्तायामपि द्वादश्यामेव पारणम्” | द्वादशी-श्रवण अवधि के तुलनात्मक case के लिए अलग fixture रखें | exact interval semantics और override priority को संदर्भ से confirm करना है |
| MDV-01 | अष्ट महाद्वादशी: उन्मीलनी, वञ्जुली, त्रिस्पृशा, पक्षवर्धिनी, जया, विजया, जयन्ती, पापनाशिनी | आठ अलग identifiers/fixtures; चार नक्षत्र-सम्बन्धों को अलग overlap predicates के रूप में परखें | पहले चार तिथि-रूपों में उन्मीलनी/वञ्जुली की अवधि, त्रिस्पृशा boundary और “दिनवृद्धि” का operational अर्थ बाकी |
| MDV-NAK-01 | जया–पुष्य, विजया–श्रवण, जयन्ती–पुनर्वसु, पापनाशिनी–रोहिणी | प्रत्येक नक्षत्र की स्थानीय start/end interval से conjunction fixture; exact sunrise-to-sunset requirement source profile से लागू हो | हिन्दी टीका में वर्णित अवधि-शर्तों का Sanskrit scope और सभी profiles में applicability |
| PAR-CONJ-01 | “पारणं तु तिथिनक्षत्रसंयोगोपरमेणोभयान्तेऽन्यतरान्ते च” | केवल disputed-syntax fixture; कोई time चुनकर pass न करें | “उभयान्ते/अन्यतरान्ते” का सटीक अन्वय; “जो पहले समाप्त हो” जैसी व्याख्या अनुमान से नहीं लगानी |

## B. गणितीय helper tests — शास्त्रीय निर्णय नहीं

नीचे के परीक्षण केवल interval helper की शुद्धता जाँचते हैं; ये अपने आप व्रत-तिथि या पारण तय नहीं करते।

| ID | A interval | B interval | अपेक्षित helper परिणाम |
|---|---|---|---|
| INT-01 | [100, 200) | [150, 250) | overlap [150, 200) |
| INT-02 | [100, 200) | [200, 250) | कोई positive overlap नहीं |
| INT-03 | [100, 150) | [160, 200) | gap; overlap नहीं |
| INT-04 | missing endpoint | [100, 200) | unresolved |
| INT-05 | [200, 100) | [100, 250) | invalid interval → unresolved |

## C. अगले तकनीकी कदम

1. उपर्युक्त source rules को मौजूदा `vrata-decision-test-matrix.md` में stable IDs के साथ जोड़ना।
2. केवल interval helper के mathematical tests को automated tests में डालना; किसी विवादित शास्त्रीय निर्णय को अभी pass/fail production rule न बनाना।
3. धर्मसिन्धु के स्पष्ट पाठ-आधारित विकल्पों (`बहवः` / `केचित्`) को data model में named profiles की तरह दर्शाने का draft बनाना।
4. निर्णयसिन्धु के मालिक द्वारा पहले भेजे गए पाठ से Dashami-vedha, Arunodaya, Suryodaya और tithi-duration case table को अलग-अलग दर्ज करना।
5. सभी cases में local sunrise, tithi transitions, nakṣatra transitions, timezone, source rule ID और expected result अनिवार्य रखना।
6. केवल unresolved शब्दार्थ/संदर्भ पर ही स्कैन की आवश्यकता उठाना; सामान्य रूप से संस्करण-वर्ष की तुलना में समय न लगाना।

## Release boundary

यह test plan documentation-only है। अभी `data/festivals.json`, public runtime JS, Blogger output या PR merge नहीं बदले गए। एकादशी को live दिखाने से पहले source-supported rules, local astronomical intervals, regression tests और गणेश मार्तण्ड reference dates का comparison आवश्यक है।
