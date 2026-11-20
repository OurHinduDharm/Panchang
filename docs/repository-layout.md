# गणना-संबंधी फ़ाइलें कहाँ रखें

यह सीमित निर्भरता-जाँच मुख्य संस्करण `ef7e470` पर आधारित है। नई फ़ाइल का स्थान उसके उपयोग से तय करें।

| स्थान | उद्देश्य | मौजूदा उदाहरण और निर्भरता |
|---|---|---|
| मूल निर्देशिका | वेबसाइट के प्रकाशित पेज और उनके प्रवेश-बिंदु | `planetary-asta-udaya.html` से `annual-tara-city-page.mjs` खुलता है। यह `annual-tara-city-worker.mjs` चलाता है। Blogger लेख इसी HTML को एम्बेड करता है। |
| `research/` | गणना-विधियाँ, प्रयोग और तुलनात्मक प्रमाण | शहरवार worker सीधे `annual-tara-runtime.mjs`, `annual-tara-profiles.mjs` और `drik-ganita-time-separation.mjs` आयात करता है। runtime के माध्यम से `tara-astronomy-context.mjs` और `tara-location-observer.mjs` भी वेबसाइट पर चलते हैं। |
| `scripts/` | चलाए जाने वाले गणना और डेटा उपकरण | Drik-Ganita workflow, `predict-annual-tara.mjs` से वार्षिक परिणाम और `backtest-drik-ganita-time-separation.mjs` से तुलना रिपोर्ट बनाता है। |
| `tests/` | regression, स्रोत-मिलान और ब्राउज़र जाँचें | इसी workflow में observer और astronomy-context परीक्षण, वार्षिक परीक्षण और `annual-tara-city-browser.mjs` चलते हैं। ग्रहण दृश्यता के लिए `eclipse-panchang-visibility.test.mjs` देखें। |
| `data/` | प्रकाशित डेटा और जाँच के संदर्भ | पिथौरागढ़ के अर्घ्य विवरण के लिए वार्षिक HTML सीधे `agastya-arghya-pithoragarh.json` पढ़ता है। |
| `docs/` | नियम, तकनीकी विवरण और कार्य-विवरण | पुराने `PR27-WORKLOG.md` में उस समय के गोधूलि और संध्या निर्णयों का विवरण है। उसे पढ़ते समय उसमें दर्ज commit और तत्कालीन स्थिति देखें। |
| `archive/` | उपयोग से बाहर सिद्ध हो चुके पुराने उपकरणों का भावी स्थान | इस जाँच में कोई उपकरण स्थानांतरण के लिए प्रमाणित नहीं हुआ। |

## किन रास्तों को सुरक्षित रखना है

महापात के शोध पर `.github/workflows/paatadhikar-mahapata-research.yml` की पथ-शर्तें लागू हैं। यह `research/paatadhikar/mahapata-math.mjs` और उसके ephemeris adapter की जाँच करता है। पुराने संदर्भ और परीक्षण अगले मॉडल से तुलना के लिए रखें।

किसी फ़ाइल का स्थान बदलते समय imports के साथ HTML में लिखे पते, worker URL, डेटा fetch, दस्तावेज़ों की कमांड, workflow की पथ-शर्तें और shell glob भी खोजें। पुराने और नए स्थान पर वही परीक्षण चलने की पुष्टि करें। प्रकाशित Blogger और CDN पते भी उपयोग में हो सकते हैं।

स्थायी विलोपन के लिए पाँचों प्रमाण साथ दर्ज करें: सक्रिय संदर्भ समाप्त, परीक्षण और workflow निर्भरता समाप्त, अद्वितीय शोध या इतिहास सुरक्षित, पूर्ण एवं बेहतर विकल्प सत्यापित, और मूल सामग्री का पुनर्प्राप्त करने योग्य Git commit ज्ञात।
