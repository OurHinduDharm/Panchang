# स्थान-आधारित SS Ch.9 उदय-अस्त मॉडल

यह पहला अलग शोध-गणना मॉड्यूल है। इसे अभी extra-panchang.js या सार्वजनिक पंचांग में नहीं जोड़ा गया है।

## गणना क्रम

1. एक ही UTC क्षण पर सूर्य और लक्ष्य पिंड के apparent geocentric ecliptic-of-date longitude तथा latitude दें।
2. उसी तारीख की true obliquity से दोनों को apparent RA/Dec में बदलें।
3. पर्यवेक्षक के भौगोलिक अक्षांश पर oblique ascension निकालें:
   OA = RA − asin(tan(latitude) × tan(declination)).
4. lagnāntara-prāṇa = |OA_body − OA_sun| × 60; K = lagnāntara-prāṇa / 60.
5. SS Ch.9 की शर्त K > C लागू करें और पहले से bracket किए गए transition को इच्छित समय-सटीकता तक refine करें।

## स्थान का प्रभाव

- अक्षांश: OA और K को सीधे बदलता है। अल्मोड़ा 29°37′ N और रामनगर 29°30′ N अलग observer हैं।
- देशांतर: एक निश्चित geocentric UTC क्षण पर oblique-ascension K को नहीं बदलता। यह स्थान की स्थानीय क्षितिज/सूर्य-समय ज्यामिति के लिए रखा जाएगा; UTC घटना को घड़ी के स्थानीय समय में बदलने का काम IANA time-zone (जैसे Asia/Kolkata) करता है। इसलिए समान अक्षांश पर केवल देशांतर बदलने से इस शास्त्रीय K/C transition instant में बदलाव अपेक्षित नहीं है।
- ऊँचाई: शास्त्रीय K/C में नहीं जोड़ी गई है। यह geometric horizon dip और अलग भौतिक-दृश्यता मॉडल में काम आएगी।

## सीमाएँ और सीमाएँ C

- गुरु: 11°; अगस्त्य: 13°।
- शुक्र के लिए SS Ch.9 में 8°/10° की दो शाखाएँ हैं। कॉलर को limitDeg स्पष्ट देना होगा; कोड चुपचाप हर जगह 10° नहीं मानेगा।
- MIT लाइसेंस वाले Astronomy Engine 2.1.19 के लिए apparent-place adapter भी जोड़ा गया है। यह geocentric apparent vector को J2000 equator से true equator of date में बदलता है। शुक्र/गुरु के लिए यही adapter नमूने देता है। अगस्त्य के लिए Canopus (HIP 30438) के SIMBAD J2000 coordinates, proper motion और parallax का आधार लिया गया है; Astronomy Engine का DefineStar proper motion सीधे नहीं लेता, इसलिए adapter उसे रैखिक रूप से समायोजित करता है। यह अभी cross-validation योग्य अनुमान है, अंतिम star ephemeris नहीं।
- शास्त्रीय K/C संक्रमण को naked-eye photometric visibility न कहें।
- अगस्त्य के date-only स्रोत को exact time में न बदलें।

## परीक्षण

node --test tests/ss9-location-model.test.mjs
\n\n## दिशा\n\nTransition refinement event को Asta/Udaya और पूर्व/पश्चिम दिशा में वर्गीकृत करता है। दिशा signed apparent ecliptic elongation और morning/evening अवस्था से आती है; इसे horizon altitude crossing के साथ बाद में स्वतंत्र रूप से cross-check करना होगा।\n