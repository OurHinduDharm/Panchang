# एकादशी ऐतिहासिक टेस्ट-केस कतार (Research Only)

स्थिति: प्रारम्भिक उम्मीदवार; यह अभी प्रमाणित अपेक्षित-परिणाम वाला unit-test dataset नहीं है।  
शाखा: `data/festival-json-foundation`

## उद्देश्य

नियमों को कोड करने से पहले वास्तविक तिथि-सीमाओं, स्थान और अलग-अलग परंपरा-कैलेंडरों के उदाहरण इकट्ठा करना। ऑनलाइन कैलेंडर **observed-output cross-check** हैं, शास्त्रीय प्रमाण नहीं। कोई उदाहरण तभी automated regression test बनेगा जब:
1. स्थान और timezone निश्चित हों;
2. दशमी/एकादशी/द्वादशी/त्रयोदशी के स्थानीय समय-सीमाएँ astronomy engine से निकाली और जाँची गई हों;
3. Smarta/Vaishnava profile का स्रोत-समर्थित rule ID तय हो;
4. expected date/parana window के साथ स्रोत और edition दर्ज हों।

## Candidate cases

| ID | उम्मीदवार | क्या जाँचना है | स्रोत / दर्ज परिणाम | स्थिति |
|---|---|---|---|---|
| HIST-2022-09-KOL | Kolkata, September 2022 — Parivartini Ekadashi | Smarta और Vaishnava observance dates अलग हो सकती हैं; parana अगले दिन अलग समय पर हो सकता है | Online Jyotish पृष्ठ पर Smarta 6 Sep 2022 और Vaishnava 7 Sep 2022 दिखते हैं; Parana भी अलग है: https://www.onlinejyotish.com/ekadashi-days.php?loc=kolkata&m=9&y=2022 | Candidate only; modern calendar output, primary proof नहीं |
| HIST-2023-04-01-02 | Gaudiya calendar, 1–2 April 2023 | Vyanjuli Mahadvadashi trigger और अगले दिन parana | Gaudiya Vaishnava calendar 1 Apr को Gaura Ekadashi / Vyanjuli Mahadvadashi fast और 2 Apr को parana दिखाता है: https://vaishnavacalendar.org/delhi/538/en/ | Candidate only; Gaudiya-specific calendar; astronomical/source rules independently verify करना है |
| HIST-2023-03-18-19 | Gaudiya calendar, 18–19 March 2023 | Trisprisha Mahadvadashi का trigger और parana | Gaudiya Vaishnava calendar 18 Mar को Krishna Ekadashi / Trisprisha Mahadvadashi fast और 19 Mar को parana दिखाता है: https://vaishnavacalendar.org/delhi/538/en/ | Candidate only; Gaudiya-specific calendar; primary-source validation बाकी |
| HIST-2023-09-11-12 | Gaudiya calendar, 11–12 September 2023 | Paksha-varddhini Mahadvadashi और parana | Gaudiya Vaishnava calendar 11 Sep को Krishna Dvadashi / Paksha Varddhini Mahadvadashi fast और 12 Sep को parana दिखाता है: https://vaishnavacalendar.org/delhi/538/en/ | Candidate only; trigger and source text must be checked |

## Test record template

हर finalized case के लिए ये fields भरें:

- `caseId`:
- `location` / latitude / longitude / elevation:
- `timezone`:
- `tithiTransitionsLocal`: दशमी, एकादशी, द्वादशी, त्रयोदशी के start/end instants
- `sunriseByDate`:
- `arunodayaDefinition` और source:
- `traditionProfile`: smarta / vaishnava (और जरूरत पर स्पष्ट lineage-specific profile)
- `ruleIds`:
- `expectedObservanceDate`:
- `expectedParanaWindow`:
- `calendarCrossCheck`:
- `primarySourceCitation`: ग्रंथ, संस्करण, अध्याय/श्लोक/पृष्ठ
- `reviewStatus`: candidate / source-reviewed / verified
- `notes`:

## सावधानियाँ

- एक आधुनिक कैलेंडर के परिणाम को शास्त्रीय नियम का प्रमाण न मानें।
- एक शहर का तारीख/समय दूसरे शहर पर सीधे लागू न करें।
- ISKCON/GCAL या Gaudiya calendar को समस्त Vaishnava परंपराओं का प्रतिनिधि न मानें।
- बिना सत्यापित expected outcome के case को passing test न लिखें।
- Parana को अलग-अलग case में उसी observance date की अगली द्वादशी और वास्तविक tithi boundaries से जोड़कर जाँचें; अनुमानित समय न डालें।
