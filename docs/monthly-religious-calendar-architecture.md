# मासिक धार्मिक कैलेंडर — विस्तार योग्य संरचना

## निर्णय
अलग-अलग नए स्थायी पृष्ठ बनाने के बजाय मौजूदा **मासिक व्रत-पर्व** पृष्ठ को क्रमशः मासिक धार्मिक कैलेंडर बनाया जाएगा। दैनिक पंचांग दिन-आधारित रहेगा; मासिक पृष्ठ चुने हुए महीने की सभी स्वीकृत प्रविष्टियों का केंद्र होगा।

## सार्वजनिक UI क्रम
1. **मासिक व्रत-पर्व** — मौजूदा पर्व/व्रत सूची और कार्ड यथावत।
2. **विशेष साधना काल एवं पुण्यकाल** — केवल चुने हुए महीने में कम-से-कम एक स्वीकृत घटना होने पर सेक्शन दिखे।
3. **संस्कार एवं धार्मिक कार्यों के मुहूर्त** — भविष्य का अलग सेक्शन; प्रमाणित कार्य-विशेष मुहूर्त उपलब्ध होने पर ही दिखे।
4. **विशेष शुभ दिवस** — भविष्य का अलग सेक्शन; केवल स्पष्ट शास्त्रीय आधार और उपयोग-सीमा सहित स्वीकृत दिवस दिखें।

हर सेक्शन स्वतंत्र data provider और renderer से चलेगा। एक सेक्शन की अनुपलब्धता दूसरे सेक्शन या मौजूदा पर्व-सूची को प्रभावित नहीं करेगी। मोबाइल पर सेक्शन compact/collapsible रहेंगे।

## दैनिक पंचांग ↔ मासिक पृष्ठ
- दैनिक पंचांग में वास्तविक विशेष पुण्यकाल का कार्ड/समय केवल उसी दिन दिखे जिस दिन वह घटित हो।
- “विशेष पुण्यकाल देखें →” लिंक महीने की approved-event availability देखकर दिखेगा; किसी ऐसे दिन भी दिख सकता है जिस दिन स्वयं घटना नहीं है, क्योंकि वह पूरे महीने की सूची तक ले जाता है।
- चुने हुए महीने में कोई approved special punya-kaal event न हो तो लिंक नहीं दिखेगा।
- लिंक मौजूदा मासिक व्रत-पर्व पृष्ठ के #special-punya-kaal anchor पर जाएगा और year/month query parameters से सही महीना चुनेगा।
- शोधाधीन, candidate, rejected या missing data से लिंक/कार्ड कभी नहीं बनेंगे।
- संक्रांति का पुण्यकाल मौजूदा संक्रांति कार्ड/sankranti-punya-kala में ही रहेगा; इस नए सेक्शन में संक्रांति की duplicate entry नहीं बनेगी।

## विशेष पुण्यकाल की runtime गणना

- वार्षिक तारीख़ों की JSON सूची calculation source नहीं होगी। वारुणी का नियम चैत्र-कृष्ण त्रयोदशी + शतभिषा से जुड़ा है, इसलिए Gregorian मार्च–अप्रैल के बाहर scanner पहले ही रुक जाता है: उन 10 महीनों में Panchang engine/ephemeris की एक भी call नहीं होती। मार्च–अप्रैल में ही उसी observer, IST (UTC+05:30) और Purnimanta profile पर वास्तविक तिथि, नक्षत्र, योग, सूर्योदय और सूर्यास्त intervals जाँचे जाते हैं। महोदय की source profile स्वीकृत न होने से उसका मासिक scan फिलहाल नहीं चलता।
- महीने की सीमा पर शुरू/समाप्त होने वाले conjunction छूटें नहीं, इसलिए scanner महीने के पहले दिन से एक दिन पहले और महीने के अंतिम दिन के अगले दिन तक interval inputs लेगा।
- `special-punya-kaal-runtime.mjs` on-demand month scanner है। यह मौजूदा Panchang library को dependency injection से लेता है; अलग ephemeris या duplicate Panchang implementation नहीं जोड़ता।
- scanner का output `research-only-not-approved` रहता है। किसी गणितीय candidate को केवल गणना के आधार पर public नहीं किया जाएगा। अलग source review, calculation verification और explicit rule-profile approval आवश्यक हैं।
- मासिक JSON (यदि रखा जाए) केवल approved परिणामों का वैकल्पिक cache/override होगा; उसे हर वर्ष हाथ से बनाना या उसे calculation का आधार मानना आवश्यक नहीं।
- वर्तमान UI migration चरणबद्ध होगा: जब तक किसी rule profile को सार्वजनिक स्वीकृति नहीं मिलती, मौजूदा approved-only fail-closed व्यवहार बना रहेगा।

## विशेष पुण्यकाल data contract
हर record में स्थिर unique id, local civil date (YYYY-MM-DD), type, सार्वजनिक हिन्दी label, start/end ISO timestamps with explicit timezone/offset, observer, calendarType (purnimanta), exact ruleProfile, status और internal review metadata हों।
केवल approved records सार्वजनिक rendering के योग्य हैं। महापात में स्पर्श-मोक्ष की गणना तथा उसकी शास्त्रीय परिभाषा अलग-अलग सत्यापित हों। केवल खगोलीय candidate interval public approval नहीं है।
महापात कार्ड पर ही यह सावधानी रहे कि इसे विवाह, गृहप्रवेश, गृहआरंभ, उपनयन आदि मांगलिक संस्कारों का मुहूर्त न समझें। यह चेतावनी अन्य पुण्यकाल श्रेणियों पर स्वतः लागू नहीं होगी।

## भविष्य का संस्कार-मुहूर्त data contract
मुहूर्त generic शुभ समय नहीं होगा। हर record कार्य-विशेष हो: प्राण-प्रतिष्ठा, गृह प्रवेश, भूमि पूजन, गृह आरंभ, उपनयन आदि। इसमें date, activity, label, start/end, observer, timezone, तिथि/नक्षत्र/वार/योग/करण के वास्तविक intervals और decision evidence, आवश्यक होने पर लग्न windows, exclusions/dosha checks, ruleProfile, sourceReview और status शामिल हों।
प्राण-प्रतिष्ठा, गृह प्रवेश और विवाह आदि के नियम एक-दूसरे से कॉपी नहीं होंगे। केवल तिथि-नक्षत्र देखकर मुहूर्त घोषित नहीं होगा। स्थान, स्थानीय सूर्योदय, लग्न और कर्म-विशेष शास्त्रीय निषेध/अनुमति लागू होंगे। जिस कर्म का विश्वसनीय नियम-समुच्चय तैयार न हो, उसका सेक्शन/record छिपा रहेगा।

## विशेष शुभ दिवस
ये exact time-window वाले मुहूर्त से अलग category होगी। किसी तिथि/पर्व को किसी खास धार्मिक कार्य के लिए उपयुक्त बताने पर उसका शास्त्रीय आधार, परंपरा और प्रयोजन स्पष्ट होना चाहिए। बिना स्पष्ट प्रमाण “सभी शुभ कार्यों के लिए शुभ” जैसे व्यापक दावे न हों।

## Approval lifecycle
research-candidate → source-reviewed → calculation-verified → approved
केवल approved records सार्वजनिक हैं। संशोधित नियम या गणना के बाद पुराने approvals स्वतः मान्य न रहें; उन्हें पुनः जाँचना होगा। Public UI में स्रोत-प्रोवाइडर branding/links नहीं होंगे; आंतरिक provenance और review artifacts repository में रहेंगे।

## Performance / resilience
- मौजूदा monthly festival loading/rendering को न रोकें।
- प्रत्येक सेक्शन का data load isolated और fail-soft हो।
- Empty या unapproved dataset पर section और उसका daily link दोनों hidden रहें।
- वर्ष/महीना बदलने पर सभी sections उसी चयनित year/month के अनुसार refresh हों।
- Observer बदलने पर स्थान-आधारित मुहूर्त पुनर्गणित हों; user coordinates browser storage में persist न हों।
- संक्रांति और मौजूदा festival muhurta को दोबारा calculate या duplicate न करें।

## Implementation phases
1. मौजूदा special punya-kaal research engine को शास्त्रीय रूप से पूरा और 2026–2030 data approve करना।
2. Monthly widget में approved-only special punya-kaal section और anchor जोड़ना।
3. Daily Panchang में month-availability आधारित conditional link तथा same-day event rendering जोड़ना।
4. अलग संस्कार-मुहूर्त module: पहले rule profiles, फिर source review, test fixtures, annual generation; उसके बाद ही UI।
5. विशेष शुभ दिवसों का curated, rule-backed catalog और स्वतंत्र section।

इस चरण में कोई अप्रमाणित पुण्यकाल/मुहूर्त सार्वजनिक नहीं किया जाएगा।


## Special sadhana punya-kaal runtime and loading

- The selected month is calculated on demand from the pinned `@ishubhamx/panchangam-js@3.0.0` engine; pre-generated monthly JSON is not the calculation source. The rare Chaitra Varuni rule is prefiltered to March–April, so the other ten Gregorian months return immediately with zero ephemeris calls. Mahodaya scanning is paused until its primary-source profile is approved.
- Both the daily Panchang link check and monthly calendar scanner wait until their small sentinel approaches the viewport (IntersectionObserver root margin). The runtime module is imported only then.
- Monthly results are cached in page memory by year, month, latitude, longitude and elevation. The cache is bounded; changing the observer cannot reuse another location's times.
- The scanner checks the previous civil day and the first day of the next month so conjunctions crossing month boundaries are not truncated.
- Any missing sunrise/sunset/tithi/nakshatra/yoga interval in the scan marks the month incomplete and returns no public candidates. The UI remains hidden.
- Public output is separately gated by an explicit Smarta rule-profile allowlist and explicit reviewed dates: 17 March 2026, 4 April 2027, 23 March 2028 and 31 March 2030. No date is approved merely because the engine generated a candidate.
- At this checkpoint, only the Varuni family is enabled for public display. Mahapata remains hidden pending the classical Karaṇa-kutūhala implementation and verified worked examples; Mahodaya remains hidden pending primary-source approval.
