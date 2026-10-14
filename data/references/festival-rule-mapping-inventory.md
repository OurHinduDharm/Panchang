# Festival Rule-Mapping Inventory (First Pass)

Status: candidate inventory generated from all 122 records in `data/festivals.json` on 2026-10-14. The classifications below are triage hints only, not approved rules or date corrections.

## Rules for using this inventory

- Preserve each legacy ID and original `sourceText`.
- Current legacy Gregorian dates are archive/display provenance, not recurring rules.
- Do not implement a candidate until its tithi/month/paksha or event predicate, ritual time window, tradition scope, source, and test cases are documented.
- A row with combined observances may need a group plus multiple observance IDs; do not split by punctuation alone.
- For eclipse records, reuse `eclipse-panchang.js`; never create static recurring dates.

| Legacy ID | Existing name | Current date (legacy) | First-pass rule family |
|---|---|---|---|
| festival-001 | आश्विन कृष्ण प्रतिपदा (पितृपक्ष प्रारंभ) | 2026-09-27 → 2026-10-10 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-002 | पितृ विसर्जन अमावास्या | 2026-10-10 | manual/other — inspect original description and sources |
| festival-003 | शारदीय नवरात्र प्रारम्भ | 2026-10-11 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-004 | शारदीय नवरात्र द्वितीया - ब्रह्मचारिणी | 2026-10-12 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-005 | शारदीय नवरात्र तृतीया - चन्द्रघंटा | 2026-10-13 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-006 | शारदीय नवरात्र चतुर्थी - कूष्माण्डा | 2026-10-14 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-007 | शारदीय नवरात्र पंचमी - स्कन्दमाता | 2026-10-15 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-008 | शारदीय नवरात्र षष्ठी - कात्यायनी | 2026-10-16 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-009 | एवं १८ अक्टूबर को = शारदीय नवरात्र सप्तमी - कालरात्रि | 2026-10-17 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-010 | शारदीय नवरात्र महाष्टमी - महागौरी | 2026-10-19 → 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-011 | शारदीय नवरात्र महानवमी - सिद्धिदात्री | 2026-10-19 → 2026-10-20 | astronomical — reuse eclipse-panchang.js; verify event/visibility |
| festival-012 | दशहरा / विजयादशमी | 2026-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-013 | कोजागरी पूर्णिमा / शरद पूर्णिमा | 2026-10-26 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-014 | कार्तिक मास प्रारंभ | 2026-10-27 | tithi — Ekadashi profile/rule review required |
| festival-015 | करवाचौथ | 2026-10-29 | manual/other — inspect original description and sources |
| festival-016 | रमा (रम्भा) एकादशी व्रत | 2026-11-05 | tithi — Ekadashi profile/rule review required |
| festival-017 | गोवत्स द्वादशी व्रत | 2026-11-05 | tithi — Ekadashi profile/rule review required |
| festival-018 | धनतेरस / धन्वन्तरि जयंती | 2026-11-06 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-019 | श्री हनुमान जयन्ती (2025) | 2025-10-19 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-020 | नरक चतुर्दशी / काली चौदस | 2025-10-19 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-021 | दीपावली / महालक्ष्मी पूजन | 2025-10-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-022 | अन्नकूट / गोवर्धन पूजा | 2025-10-22 | manual/other — inspect original description and sources |
| festival-023 | भ्रातृ द्वितीया / यम द्वितीया | 2025-10-23 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-024 | देवोत्थापनी एकादशी एवं चातुर्मास समाप्त | 2025-11-01 | tithi — Ekadashi profile/rule review required |
| festival-025 | तुलसी विवाह विधान प्रारंभ | 2025-11-02 → 2025-11-05 | tithi — Ekadashi profile/rule review required |
| festival-026 | देव दीपावली एवं आकाशदीप दान | 2025-11-05 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-027 | श्री महाकाल भैरव जयन्ती | 2025-11-12 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-028 | हेमन्त ऋतु प्रारंभ | 2025-11-21 | manual/other — inspect original description and sources |
| festival-029 | श्रीमद्भगवद्गीता जयंती / मोक्षदा एकादशी | 2025-12-01 | tithi — Ekadashi profile/rule review required |
| festival-030 | श्री दत्तात्रेय जयंती | 2025-12-04 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-031 | श्री त्रिपुरभैरवी महाविद्या जयंती, श्रीविद्या जयंती, अन्नपूर्णा जयन्ती | 2025-12-04 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-032 | पौष मास प्रारम्भ | 2025-12-05 → 2026-01-03 | manual/other — inspect original description and sources |
| festival-033 | धनु संक्रांति | 2025-12-16 | solar — solar ingress/season rule; verify |
| festival-034 | श्री शाकंभरी नवरात्र प्रारम्भ | 2025-12-28 → 2026-01-03 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-035 | श्री तैलंग स्वामी जयंती | 2025-12-30 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-036 | श्री शाकंभरी माता जयंती | 2026-01-03 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-037 | माघ मास प्रारम्भ | 2026-01-04 → 2026-02-01 | manual/other — inspect original description and sources |
| festival-038 | मकर संक्रान्ति / सूर्य उत्तरायण प्रारम्भ | 2026-01-14 | solar — solar ingress/season rule; verify |
| festival-039 | शिशिर ऋतु प्रारंभ | 2026-01-19 | manual/other — inspect original description and sources |
| festival-040 | माघ गुप्त नवरात्र प्रारम्भ | 2026-01-19 → 2026-01-27 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-041 | तिल कुंड चतुर्थी / वरद चतुर्थी | 2026-01-22 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-042 | वसन्त पंचमी / सरस्वती पूजन | 2026-01-23 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-043 | नर्मदा जयंती | 2026-01-25 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-044 | भीष्माष्टमी एवं भीष्म तर्पण | 2026-01-26 | manual/other — inspect original description and sources |
| festival-045 | श्री ललिता त्रिपुरसुंदरी जी जयंती | 2026-02-01 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-046 | रथ सप्तमी | 2026-02-04 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-047 | यशोदा जयन्ती | 2026-02-07 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-048 | शबरी जयंती | 2026-02-08 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-049 | मासिक कालाष्टमी | 2026-02-09 | manual/other — inspect original description and sources |
| festival-050 | श्री महाशिवरात्रि व्रत | 2026-02-15 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-051 | आमलकी एकादशी | 2026-02-27 | tithi — Ekadashi profile/rule review required |
| festival-052 | होलिका-दहन | 2026-03-02 | astronomical — reuse eclipse-panchang.js; verify event/visibility |
| festival-053 | चंद्रग्रहण | 2026-03-03 | astronomical — reuse eclipse-panchang.js; verify event/visibility |
| festival-054 | सूर्य ग्रहण (तिथि परिवर्तनशील / प्लेसहोल्डर) | 1970-01-01 | astronomical — reuse eclipse-panchang.js; verify event/visibility |
| festival-055 | धुलण्डी (रंगवाली होली) | 2026-03-03 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-056 | श्री महालक्ष्मी जयंती | 2026-03-03 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-057 | वसन्त ऋतु प्रारंभ | 2026-03-19 | manual/other — inspect original description and sources |
| festival-058 | हिंदू नवसंवत्सर २०८३ (रौद्र) | 2026-03-19 | manual/other — inspect original description and sources |
| festival-059 | चैत्र (वासन्तीय) नवरात्र प्रारम्भ | 2026-03-19 → 2026-03-27 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-060 | नवरात्रि द्वितीय - ब्रह्मचारिणी | 2026-03-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-061 | श्री मत्स्य-अवतार जयन्ती | 2026-03-21 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-062 | नवरात्रि तृतीय - चन्द्रघंटा | 2026-03-21 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-063 | नवरात्रि चतुर्थ - कूष्माण्डा | 2026-03-22 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-064 | नवरात्रि पंचम - स्कन्दमाता | 2026-03-23 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-065 | नवरात्रि षष्ठ - कात्यायनी | 2026-03-24 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-066 | नवरात्रि सप्तम - कालरात्रि (महासप्तमी) | 2026-03-25 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-067 | नवरात्रि अष्टमी - महागौरी एवं अन्नपूर्णा | 2026-03-26 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-068 | श्रीरामनवमी (स्मार्त) | 2026-03-26 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-069 | श्रीरामनवमी (वैष्णव सम्प्रदाय) | 2026-03-27 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-070 | नवरात्रि नवमी - सिद्धिदात्री एवं तारा महाविद्या जयंती | 2026-03-27 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-071 | चैत्र नवरात्र पारण | 2026-03-27 | tithi — Ekadashi profile/rule review required |
| festival-072 | कलश विसर्जन | 2026-03-28 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-073 | श्री हनुमान जयन्ती | 2026-04-02 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-074 | मासिक कालाष्टमी | 2026-04-10 | manual/other — inspect original description and sources |
| festival-075 | श्री परशुराम अवतार जयन्ती | 2026-04-19 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-076 | अक्षय तृतीया | 2026-04-19 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-077 | श्री मातंगी महाविद्या जयन्ती | 2026-04-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-078 | श्री रामानुज, सूरदास, आदि शंकराचार्य जयन्ती | 2026-04-21 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-079 | श्री बगलामुखी महाविद्या जयन्ती | 2026-04-24 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-080 | भगवती सीता जी जयन्ती (जानकी नवमी) | 2026-04-25 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-081 | श्री नृसिंह अवतार जयन्ती, श्री छिन्नमस्ता महाविद्या जयन्ती, श्री शरभ अवतार जयंती | 2026-04-30 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-082 | श्री कूर्म अवतार जयन्ती | 2026-05-01 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-083 | देवर्षि नारद जी की जयन्ती | 2026-05-02 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-084 | श्री शनि जयन्ती | 2026-05-16 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-085 | गंगा दशहरा | 2026-05-25 → 2026-05-25 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-086 | श्री धूमावती महाविद्या जयन्ती | 2026-06-22 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-087 | वेदमाता गायत्री जयन्ती | 2026-06-25 → 2026-06-26 | tithi — Ekadashi profile/rule review required |
| festival-088 | आषाढ़ गुप्त नवरात्र प्रारम्भ | 2026-07-15 → 2026-07-23 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-089 | कर्क संक्रान्ति | 2026-07-16 | solar — solar ingress/season rule; verify |
| festival-090 | गुप्त नवरात्र द्वितीया - ब्रह्मचारिणी | 2026-07-16 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-091 | श्रीजगन्नाथ रथ यात्रा | 2026-07-16 | manual/other — inspect original description and sources |
| festival-092 | सूर्य दक्षिणायन आरंभ | 2026-07-17 | solar — solar ingress/season rule; verify |
| festival-093 | गुप्त नवरात्र तृतीया - चन्द्रघंटा | 2026-07-17 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-094 | गुप्त नवरात्र चतुर्थी - कूष्माण्डा | 2026-07-17 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-095 | गुप्त नवरात्र पंचमी - स्कन्दमाता | 2026-07-18 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-096 | गुप्त नवरात्र षष्ठी - कात्यायनी | 2026-07-19 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-097 | गुप्त नवरात्र सप्तमी - कालरात्रि | 2026-07-20 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-098 | गुप्त नवरात्र अष्टमी - महागौरी | 2026-07-21 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-099 | गुप्त नवरात्र नवमी - सिद्धिदात्री | 2026-07-22 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-100 | गुप्त नवरात्र पारण एवं कलश विसर्जन | 2026-07-23 | tithi — Ekadashi profile/rule review required |
| festival-101 | हरिशयनी एकादशी एवं चातुर्मास प्रारंभ | 2026-07-25 → 2026-07-30 | tithi — Ekadashi profile/rule review required |
| festival-102 | गुरु पूर्णिमा | 2026-07-29 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-103 | श्रावण मास प्रारम्भ | 2026-07-30 → 2026-08-28 | manual/other — inspect original description and sources |
| festival-104 | श्रावण सोमवार (प्रथम) | 2026-08-03 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-105 | नाग पंचमी व्रत | 2026-08-17 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-106 | श्री कल्कि अवतार जयंती | 2026-08-18 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-107 | श्री हयग्रीव भगवान जयन्ती | 2026-08-27 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-108 | रक्षा बंधन, संस्कृत दिवस, लव कुश जयंती | 2026-08-28 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-109 | श्रावणी उपाकर्म (ऋग्वेदी एवं यजुर्वेदी) | 2026-08-28 | manual/other — inspect original description and sources |
| festival-110 | श्री गायत्री जयन्ती | 2026-08-28 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-111 | विन्ध्यवासिनी देवी जयन्ती | 2026-08-30 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-112 | हलषष्ठी, श्री बलराम जयंती | 2026-09-02 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-113 | श्रीकृष्ण जयंती / श्री कृष्ण जन्माष्टमी, श्री आद्याकाली जयन्ती | 2026-09-04 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-114 | कुशोत्पाटनी अमावास्या | 2026-09-10 | manual/other — inspect original description and sources |
| festival-115 | सामवेदियों का उपाकर्म | 2026-09-13 | manual/other — inspect original description and sources |
| festival-116 |  श्री वाराहावतार प्राकट्य  | 2026-09-14 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-117 | श्री गणेश जी की जयंती  | 2026-09-14 → 2026-09-25 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-118 | ऋषि पंचमी | 2026-09-16 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-119 | श्री राधाष्टमी | 2026-09-19 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-120 | श्री वामनावतार एवं श्री भुवनेश्वरी महाविद्या का प्राकट्य | 2026-09-23 | tithi — Ekadashi profile/rule review required |
| festival-121 | श्रीगणेश विसर्जन | 2026-09-25 | tithi — candidate rule, verify paksha/month and ritual time |
| festival-122 | भाद्रपद शुक्ल पूर्णिमा | 2026-09-26 | tithi — candidate rule, verify paksha/month and ritual time |

## Work order

1. Correctly identify observance identity and preserve all embedded source links.
2. For simple tithi festivals, add explicit `masa`, `paksha`, `tithi`, and any ritual-time rule only after source review.
3. For solar/astronomical events, use the existing calculation module and distinguish event existence from local visibility.
4. For Ekadashi, use the separate Smarta and Vaishnava research track; do not apply a generic tithi-only rule.
5. For multi-stage groups (Navratri, Chaturmas, Tulsi Vivah), represent stages independently; don't reinterpret legacy `endDate` as a puja time.
6. Add historical and future reference tests that are independent of the engine output, then keep the whole integration gated behind preview and explicit approval.
