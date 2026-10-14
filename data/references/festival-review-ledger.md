# Festival Data Review Ledger (first-pass triage)

- Branch: `data/festival-json-foundation`
- Input: `data/festivals.json` and archived `data/festivalData-source.txt`
- Status: **triage only**. This file flags what needs checking; it does not certify dates, tithi rules, article accuracy, or Muhurat times.
- Safety: preserve legacy text and source links; do not connect this dataset to live Blogger until reviewed and approved.

## First-pass counts

| Check | Count | Meaning |
|---|---:|---|
| Legacy records | 122 | All migrated records retained |
| No detected article link | 32 | Search source archive/site before writing new descriptions |
| Empty description | 2 | Need source lookup and researched fallback text |
| Date in 2025 or placeholder 1970-01-01 | 18 | Investigate; do not automatically replace |
| Different start/end dates | 21 | Determine whether period, status window, or real multi-stage observance |
| Eclipse-related title | 2 | Use existing `eclipse-panchang.js`; separate event/visibility/ritual guidance |
| Ekadashi/Mahadvadashi title | 5 | Preserve legacy item but connect later to separate reviewed Ekadashi catalog |
| Missing one or more tithi/month/rule fields | 44 | Metadata gap, especially solar/astronomical/manual observances |

## Review order

1. **P0 — invalid/stale dates and eclipse placeholders:** verify 2025 dates against the intended year/recurrence; `1970-01-01` is a placeholder, not an event date.
2. **P1 — Ekadashi/Mahadvadashi:** don't infer rules from the current legacy date; use the separate Smarta/Vaishnava source-reviewed research and test cases.
3. **P1 — multi-stage groups:** Navratri, Pitru Paksha, Chaturmas, Tulsi Vivah, lunar months, etc. Keep start date distinct from display period and stage dates.
4. **P1 — eclipse records:** derive astronomical event from existing module, then independently decide local visibility and ritual/sutak wording.
5. **P2 — missing links/descriptions:** search the existing OurHinduDharm site and archived source first; add a link only when verified, otherwise researched short description with provenance.
6. **P2 — combined titles/duplicate observances:** split only when they are genuinely separate observances; preserve original title/text in `sourceText`.
7. **P3 — date-rule metadata:** verify lunar month naming (Amanta/Purnimanta), tithi, paksha, solar/astronomical triggers, location dependence, and tradition/region scope.

## Record-by-record triage

| ID | Legacy title | Original start | Original end | Type hint | First-pass flags |
|---|---|---|---|---|---|
| festival-001 | आश्विन कृष्ण प्रतिपदा (पितृपक्ष प्रारंभ) | 2026-09-27 | 2026-10-10 | tithi | endDate/अवधि जाँच |
| festival-002 | पितृ विसर्जन अमावास्या | 2026-10-10 | — | tithi | सामान्य समीक्षा |
| festival-003 | शारदीय नवरात्र प्रारम्भ | 2026-10-11 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त |
| festival-004 | शारदीय नवरात्र द्वितीया - ब्रह्मचारिणी | 2026-10-12 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-005 | शारदीय नवरात्र तृतीया - चन्द्रघंटा | 2026-10-13 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-006 | शारदीय नवरात्र चतुर्थी - कूष्माण्डा | 2026-10-14 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-007 | शारदीय नवरात्र पंचमी - स्कन्दमाता | 2026-10-15 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-008 | शारदीय नवरात्र षष्ठी - कात्यायनी | 2026-10-16 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-009 | एवं १८ अक्टूबर को = शारदीय नवरात्र सप्तमी - कालरात्रि | 2026-10-17 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-010 | शारदीय नवरात्र महाष्टमी - महागौरी | 2026-10-19 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त |
| festival-011 | शारदीय नवरात्र महानवमी - सिद्धिदात्री | 2026-10-19 | 2026-10-20 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-012 | दशहरा / विजयादशमी | 2026-10-20 | — | tithi | सामान्य समीक्षा |
| festival-013 | कोजागरी पूर्णिमा / शरद पूर्णिमा | 2026-10-26 | — | tithi | सामान्य समीक्षा |
| festival-014 | कार्तिक मास प्रारंभ | 2026-10-27 | — | tithi | लिंक नहीं |
| festival-015 | करवाचौथ | 2026-10-29 | — | tithi | सामान्य समीक्षा |
| festival-016 | रमा (रम्भा) एकादशी व्रत | 2026-11-05 | — | tithi | एकादशी निर्णय/कैटलॉग |
| festival-017 | गोवत्स द्वादशी व्रत | 2026-11-05 | — | tithi | सामान्य समीक्षा |
| festival-018 | धनतेरस / धन्वन्तरि जयंती | 2026-11-06 | — | tithi | सामान्य समीक्षा |
| festival-019 | श्री हनुमान जयन्ती (2025) | 2025-10-19 | — | tithi | पुरानी/placeholder तारीख; date-rule metadata अधूरा |
| festival-020 | नरक चतुर्दशी / काली चौदस | 2025-10-19 | — | tithi | पुरानी/placeholder तारीख |
| festival-021 | दीपावली / महालक्ष्मी पूजन | 2025-10-20 | — | tithi | पुरानी/placeholder तारीख; दीपावली समूह/अलग चरण |
| festival-022 | अन्नकूट / गोवर्धन पूजा | 2025-10-22 | — | tithi | लिंक नहीं; पुरानी/placeholder तारीख; दीपावली समूह/अलग चरण |
| festival-023 | भ्रातृ द्वितीया / यम द्वितीया | 2025-10-23 | — | tithi | लिंक नहीं; पुरानी/placeholder तारीख; दीपावली समूह/अलग चरण |
| festival-024 | देवोत्थापनी एकादशी एवं चातुर्मास समाप्त | 2025-11-01 | — | tithi | पुरानी/placeholder तारीख; एकादशी निर्णय/कैटलॉग |
| festival-025 | तुलसी विवाह विधान प्रारंभ | 2025-11-02 | 2025-11-05 | tithi | पुरानी/placeholder तारीख; endDate/अवधि जाँच |
| festival-026 | देव दीपावली एवं आकाशदीप दान | 2025-11-05 | — | tithi | पुरानी/placeholder तारीख; दीपावली समूह/अलग चरण |
| festival-027 | श्री महाकाल भैरव जयन्ती | 2025-11-12 | — | tithi | पुरानी/placeholder तारीख |
| festival-028 | हेमन्त ऋतु प्रारंभ | 2025-11-21 | — | astronomical | लिंक नहीं; पुरानी/placeholder तारीख; date-rule metadata अधूरा |
| festival-029 | श्रीमद्भगवद्गीता जयंती / मोक्षदा एकादशी | 2025-12-01 | — | tithi | पुरानी/placeholder तारीख; एकादशी निर्णय/कैटलॉग; संयुक्त शीर्षक समीक्षा |
| festival-030 | श्री दत्तात्रेय जयंती | 2025-12-04 | — | tithi | पुरानी/placeholder तारीख |
| festival-031 | श्री त्रिपुरभैरवी महाविद्या जयंती, श्रीविद्या जयंती, अन्नपूर्णा जयन्ती | 2025-12-04 | — | tithi | पुरानी/placeholder तारीख; संयुक्त शीर्षक समीक्षा |
| festival-032 | पौष मास प्रारम्भ | 2025-12-05 | 2026-01-03 | tithi | पुरानी/placeholder तारीख; endDate/अवधि जाँच; date-rule metadata अधूरा |
| festival-033 | धनु संक्रांति | 2025-12-16 | — | solar | लिंक नहीं; पुरानी/placeholder तारीख; date-rule metadata अधूरा |
| festival-034 | श्री शाकंभरी नवरात्र प्रारम्भ | 2025-12-28 | 2026-01-03 | tithi | पुरानी/placeholder तारीख; endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त |
| festival-035 | श्री तैलंग स्वामी जयंती | 2025-12-30 | — | tithi | पुरानी/placeholder तारीख; date-rule metadata अधूरा |
| festival-036 | श्री शाकंभरी माता जयंती | 2026-01-03 | — | tithi | सामान्य समीक्षा |
| festival-037 | माघ मास प्रारम्भ | 2026-01-04 | 2026-02-01 | tithi | endDate/अवधि जाँच; date-rule metadata अधूरा |
| festival-038 | मकर संक्रान्ति / सूर्य उत्तरायण प्रारम्भ | 2026-01-14 | — | solar | सामान्य समीक्षा |
| festival-039 | शिशिर ऋतु प्रारंभ | 2026-01-19 | — | astronomical | लिंक नहीं; date-rule metadata अधूरा |
| festival-040 | माघ गुप्त नवरात्र प्रारम्भ | 2026-01-19 | 2026-01-27 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त |
| festival-041 | तिल कुंड चतुर्थी / वरद चतुर्थी | 2026-01-22 | — | tithi | लिंक नहीं; date-rule metadata अधूरा |
| festival-042 | वसन्त पंचमी / सरस्वती पूजन | 2026-01-23 | — | tithi | सामान्य समीक्षा |
| festival-043 | नर्मदा जयंती | 2026-01-25 | — | tithi | लिंक नहीं |
| festival-044 | भीष्माष्टमी एवं भीष्म तर्पण | 2026-01-26 | — | tithi | सामान्य समीक्षा |
| festival-045 | श्री ललिता त्रिपुरसुंदरी जी जयंती | 2026-02-01 | — | tithi | सामान्य समीक्षा |
| festival-046 | रथ सप्तमी | 2026-02-04 | — | tithi | लिंक नहीं |
| festival-047 | यशोदा जयन्ती | 2026-02-07 | — | tithi | लिंक नहीं |
| festival-048 | शबरी जयंती | 2026-02-08 | — | tithi | लिंक नहीं; date-rule metadata अधूरा |
| festival-049 | मासिक कालाष्टमी | 2026-02-09 | — | tithi | लिंक नहीं |
| festival-050 | श्री महाशिवरात्रि व्रत | 2026-02-15 | — | tithi | सामान्य समीक्षा |
| festival-051 | आमलकी एकादशी | 2026-02-27 | — | tithi | एकादशी निर्णय/कैटलॉग |
| festival-052 | होलिका-दहन | 2026-03-02 | — | tithi | सामान्य समीक्षा |
| festival-053 | चंद्रग्रहण | 2026-03-03 | — | astronomical | eclipse module से मिलान; date-rule metadata अधूरा |
| festival-054 | सूर्य ग्रहण (तिथि परिवर्तनशील / प्लेसहोल्डर) | 1970-01-01 | — | astronomical | पुरानी/placeholder तारीख; eclipse module से मिलान; date-rule metadata अधूरा |
| festival-055 | धुलण्डी (रंगवाली होली) | 2026-03-03 | — | tithi | सामान्य समीक्षा |
| festival-056 | श्री महालक्ष्मी जयंती | 2026-03-03 | — | tithi | सामान्य समीक्षा |
| festival-057 | वसन्त ऋतु प्रारंभ | 2026-03-19 | — | astronomical | लिंक नहीं; date-rule metadata अधूरा |
| festival-058 | हिंदू नवसंवत्सर २०८३ (रौद्र) | 2026-03-19 | — | tithi | सामान्य समीक्षा |
| festival-059 | चैत्र (वासन्तीय) नवरात्र प्रारम्भ | 2026-03-19 | 2026-03-27 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त |
| festival-060 | नवरात्रि द्वितीय - ब्रह्मचारिणी | 2026-03-20 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-061 | श्री मत्स्य-अवतार जयन्ती | 2026-03-21 | — | tithi | सामान्य समीक्षा |
| festival-062 | नवरात्रि तृतीय - चन्द्रघंटा | 2026-03-21 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-063 | नवरात्रि चतुर्थ - कूष्माण्डा | 2026-03-22 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-064 | नवरात्रि पंचम - स्कन्दमाता | 2026-03-23 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-065 | नवरात्रि षष्ठ - कात्यायनी | 2026-03-24 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-066 | नवरात्रि सप्तम - कालरात्रि (महासप्तमी) | 2026-03-25 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-067 | नवरात्रि अष्टमी - महागौरी एवं अन्नपूर्णा | 2026-03-26 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-068 | श्रीरामनवमी (स्मार्त) | 2026-03-26 | — | tithi | लिंक नहीं |
| festival-069 | श्रीरामनवमी (वैष्णव सम्प्रदाय) | 2026-03-27 | — | tithi | सामान्य समीक्षा |
| festival-070 | नवरात्रि नवमी - सिद्धिदात्री एवं तारा महाविद्या जयंती | 2026-03-27 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-071 | चैत्र नवरात्र पारण | 2026-03-27 | — | tithi | लिंक नहीं; नवरात्रि चरण/मुहूर्त |
| festival-072 | कलश विसर्जन | 2026-03-28 | — | tithi | लिंक नहीं |
| festival-073 | श्री हनुमान जयन्ती | 2026-04-02 | — | tithi | date-rule metadata अधूरा |
| festival-074 | मासिक कालाष्टमी | 2026-04-10 | — | tithi | सामान्य समीक्षा |
| festival-075 | श्री परशुराम अवतार जयन्ती | 2026-04-19 | — | tithi | सामान्य समीक्षा |
| festival-076 | अक्षय तृतीया | 2026-04-19 | — | tithi | सामान्य समीक्षा |
| festival-077 | श्री मातंगी महाविद्या जयन्ती | 2026-04-20 | — | tithi | date-rule metadata अधूरा |
| festival-078 | श्री रामानुज, सूरदास, आदि शंकराचार्य जयन्ती | 2026-04-21 | — | manual | लिंक नहीं; संयुक्त शीर्षक समीक्षा; date-rule metadata अधूरा |
| festival-079 | श्री बगलामुखी महाविद्या जयन्ती | 2026-04-24 | — | tithi | सामान्य समीक्षा |
| festival-080 | भगवती सीता जी जयन्ती (जानकी नवमी) | 2026-04-25 | — | tithi | सामान्य समीक्षा |
| festival-081 | श्री नृसिंह अवतार जयन्ती, श्री छिन्नमस्ता महाविद्या जयन्ती, श्री शरभ अवतार जयंती | 2026-04-30 | — | tithi | संयुक्त शीर्षक समीक्षा |
| festival-082 | श्री कूर्म अवतार जयन्ती | 2026-05-01 | — | tithi | सामान्य समीक्षा |
| festival-083 | देवर्षि नारद जी की जयन्ती | 2026-05-02 | — | tithi | सामान्य समीक्षा |
| festival-084 | श्री शनि जयन्ती | 2026-05-16 | — | tithi | सामान्य समीक्षा |
| festival-085 | गंगा दशहरा | 2026-05-25 | 2026-05-25 | tithi | सामान्य समीक्षा |
| festival-086 | श्री धूमावती महाविद्या जयन्ती | 2026-06-22 | — | tithi | सामान्य समीक्षा |
| festival-087 | वेदमाता गायत्री जयन्ती | 2026-06-25 | 2026-06-26 | tithi | endDate/अवधि जाँच |
| festival-088 | आषाढ़ गुप्त नवरात्र प्रारम्भ | 2026-07-15 | 2026-07-23 | tithi | endDate/अवधि जाँच; नवरात्रि चरण/मुहूर्त |
| festival-089 | कर्क संक्रान्ति | 2026-07-16 | — | solar | लिंक नहीं |
| festival-090 | गुप्त नवरात्र द्वितीया - ब्रह्मचारिणी | 2026-07-16 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-091 | श्रीजगन्नाथ रथ यात्रा | 2026-07-16 | — | tithi | लिंक नहीं |
| festival-092 | सूर्य दक्षिणायन आरंभ | 2026-07-17 | — | solar | लिंक नहीं; date-rule metadata अधूरा |
| festival-093 | गुप्त नवरात्र तृतीया - चन्द्रघंटा | 2026-07-17 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-094 | गुप्त नवरात्र चतुर्थी - कूष्माण्डा | 2026-07-17 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-095 | गुप्त नवरात्र पंचमी - स्कन्दमाता | 2026-07-18 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-096 | गुप्त नवरात्र षष्ठी - कात्यायनी | 2026-07-19 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-097 | गुप्त नवरात्र सप्तमी - कालरात्रि | 2026-07-20 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-098 | गुप्त नवरात्र अष्टमी - महागौरी | 2026-07-21 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-099 | गुप्त नवरात्र नवमी - सिद्धिदात्री | 2026-07-22 | — | tithi | नवरात्रि चरण/मुहूर्त; date-rule metadata अधूरा |
| festival-100 | गुप्त नवरात्र पारण एवं कलश विसर्जन | 2026-07-23 | — | tithi | लिंक नहीं; नवरात्रि चरण/मुहूर्त |
| festival-101 | हरिशयनी एकादशी एवं चातुर्मास प्रारंभ | 2026-07-25 | 2026-07-30 | tithi | endDate/अवधि जाँच; एकादशी निर्णय/कैटलॉग |
| festival-102 | गुरु पूर्णिमा | 2026-07-29 | — | tithi | लिंक नहीं |
| festival-103 | श्रावण मास प्रारम्भ | 2026-07-30 | 2026-08-28 | tithi | लिंक नहीं; endDate/अवधि जाँच; date-rule metadata अधूरा |
| festival-104 | श्रावण सोमवार (प्रथम) | 2026-08-03 | — | manual | लिंक नहीं |
| festival-105 | नाग पंचमी व्रत | 2026-08-17 | — | tithi | सामान्य समीक्षा |
| festival-106 | श्री कल्कि अवतार जयंती | 2026-08-18 | — | tithi | date-rule metadata अधूरा |
| festival-107 | श्री हयग्रीव भगवान जयन्ती | 2026-08-27 | — | tithi | सामान्य समीक्षा |
| festival-108 | रक्षा बंधन, संस्कृत दिवस, लव कुश जयंती | 2026-08-28 | — | tithi | सामान्य समीक्षा |
| festival-109 | श्रावणी उपाकर्म (ऋग्वेदी एवं यजुर्वेदी) | 2026-08-28 | — | tithi | लिंक नहीं |
| festival-110 | श्री गायत्री जयन्ती | 2026-08-28 | — | tithi | सामान्य समीक्षा |
| festival-111 | विन्ध्यवासिनी देवी जयन्ती | 2026-08-30 | — | tithi | लिंक नहीं; date-rule metadata अधूरा |
| festival-112 | हलषष्ठी, श्री बलराम जयंती | 2026-09-02 | — | tithi | लिंक नहीं; विवरण खाली |
| festival-113 | श्रीकृष्ण जयंती / श्री कृष्ण जन्माष्टमी, श्री आद्याकाली जयन्ती | 2026-09-04 | — | tithi | सामान्य समीक्षा |
| festival-114 | कुशोत्पाटनी अमावास्या | 2026-09-10 | — | tithi | लिंक नहीं; date-rule metadata अधूरा |
| festival-115 | सामवेदियों का उपाकर्म | 2026-09-13 | — | tithi | लिंक नहीं |
| festival-116 |  श्री वाराहावतार प्राकट्य  | 2026-09-14 | — | tithi | सामान्य समीक्षा |
| festival-117 | श्री गणेश जी की जयंती  | 2026-09-14 | 2026-09-25 | tithi | endDate/अवधि जाँच |
| festival-118 | ऋषि पंचमी | 2026-09-16 | — | tithi | लिंक नहीं; विवरण खाली |
| festival-119 | श्री राधाष्टमी | 2026-09-19 | — | tithi | सामान्य समीक्षा |
| festival-120 | श्री वामनावतार एवं श्री भुवनेश्वरी महाविद्या का प्राकट्य | 2026-09-23 | — | tithi | सामान्य समीक्षा |
| festival-121 | श्रीगणेश विसर्जन | 2026-09-25 | — | tithi | लिंक नहीं |
| festival-122 | भाद्रपद शुक्ल पूर्णिमा | 2026-09-26 | — | tithi | लिंक नहीं; date-rule metadata अधूरा |

## Rules for completing this ledger

- Record evidence URL/edition/page/verse and review status per change.
- A date matching an online calendar is only a cross-check, not shastric proof.
- Don't overwrite `sourceText`; corrections belong in the normalized rule fields with explanation and provenance.
- A missing article link does not mean the festival is missing; it means the link needs research.
- No code or live Blogger changes are authorized by this audit.
