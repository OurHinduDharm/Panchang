# अगस्त्य पारंपरिक अर्घ्य: स्रोत-प्रमाण ऑडिट (14 नवम्बर 2026)

## निर्णय

मुख्य सार्वजनिक सुविधा का event definition **traditional Agastya Arghya** ही रहेगा। इसे आधुनिक Canopus naked-eye heliacal first visibility, geometric horizon rise या Guru/Shukra planetary Asta-Udaya model के साथ नहीं मिलाया जाएगा।

इस audit में कोई सार्वजनिक तारीख/समय बदला नहीं गया है।

## मौजूदा पिथौरागढ़ annual series

| वर्ष | सार्वजनिक तारीख | तारा उदय | स्रोत-स्थिति | Consensus पात्र |
|---|---|---|---|---|
| 2024 | 7 सितम्बर | 04:41 | Legacy; raw source capture अनुपस्थित | नहीं |
| 2025 | 7 सितम्बर | 04:43 | Legacy; raw source capture अनुपस्थित | नहीं |
| 2026 | 7 सितम्बर | 04:44 | Legacy; raw source capture अनुपस्थित | नहीं |
| 2027 | 7 सितम्बर | 04:45 | Legacy; raw source capture अनुपस्थित | नहीं |
| 2028 | 7 सितम्बर | 04:41 | Drik raw capture; single source; city-label-only | नहीं |
| 2029 | 7 सितम्बर | 04:43 | Drik raw capture; single source; city-label-only | नहीं |
| 2030 | 7 सितम्बर | 04:44 | Drik raw capture; single source; city-label-only | नहीं |

2028–2030 के captured raw rise clocks 28:41+, 28:43+, 28:44+ को अगले Gregorian दिन के 04:41, 04:43, 04:44 में normalize किया गया है। मूल notation audit data में सुरक्षित है।

2024–2027 की मौजूदा तारीखों को केवल automated tests में स्थिर कर देने से उनका source provenance सिद्ध नहीं होता। उन्हें legacy/unverified माना गया है; पुराने raw source pages या captures अभी नहीं मिले।

## अलग शहरों के स्रोत क्यों नहीं मिलाए

Drik के अन्य शहरों के प्रकाशित records context के लिए उपयोगी हैं, पर पिथौरागढ़ का विकल्प नहीं:
- New Delhi 2024: 4 सितम्बर।
- Moradabad 2026: 5 सितम्बर; raw Tara rise 28:50+ on 4 September.
- New Delhi 2027: 4 सितम्बर, Tara rise 04:59.
- Pathankot 2027: 17 सितम्बर.
- Perundurai 2027: 29 जुलाई.

ये अलग-अलग latitude/longitude और कभी-कभी अलग स्थानीय परंपरा वाले शहर हैं। इन्हें औसत या consensus में डालना गलत होगा।

## स्वतंत्र साहित्य

2016 का *Indian Journal of History of Science* लेख “On the Visibility of Agastya (Canopus) in India” पारंपरिक अगस्त्य उदय/अस्त, स्थान-निर्भरता और सुबह के प्रथम दर्शन बनाम शाम के अंतिम दर्शन के भेद पर उपयोगी संदर्भ देता है। यह किसी खास वर्ष के पिथौरागढ़ अर्घ्य का दूसरा calendar source नहीं है।

## अगला काम

1. 2024–2027 के उसी पिथौरागढ़/निकटवर्ती उत्तराखंड event के मूल source captures पुनः प्राप्त करना।
2. 2028–2030 के लिए दूसरा स्वतंत्र calendar source ढूँढना, जो उसी traditional Arghya event और तुलनीय क्षेत्र का हो।
3. जहाँ exact coordinates न मिलें, वहाँ city-label-only सीमा बनाए रखना।
4. source agreement मिलने तक नया model-generated time सार्वजनिक dataset में न जोड़ना।

## CI

tests/agastya-traditional-source-provenance.test.mjs यह सुनिश्चित करता है कि:
- audit में वही सात वर्ष हों जो public data में हैं;
- 2024–2027 legacy rows source-verified न गिनी जाएँ;
- 2028–2030 के raw 24+ hour clocks संरक्षित रहें;
- अलग शहर के references Pithoragarh consensus में न घुसें;
- traditional Arghya और modern heliacal visibility अलग रहें;
- audit से public dataset अनजाने में न बदले।

यह report research-only है.

## अतिरिक्त स्थान-तुलना — New Delhi 2028–2030 (14 नवम्बर 2026)

Drik Panchang के New Delhi Hindu calendar में Agastya Arghya तीनों वर्षों में 4 सितम्बर दिया गया है:

- 2028: 4 सितम्बर — https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1261481&year=2028
- 2029: 4 सितम्बर — https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1261481&year=2029
- 2030: 4 सितम्बर — https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1261481&year=2030

हमारे Pithoragarh Drik named-city captures में इन्हीं वर्षों की अर्घ्य तिथि 7 सितम्बर है। यह तीन दिन का same-provider/different-city अंतर है। इसे स्थान-निर्भरता के context evidence के रूप में सुरक्षित किया गया है, स्वतंत्र पुष्टि या Pithoragarh correction के रूप में नहीं। कोई सार्वजनिक तारीख नहीं बदली गई।
