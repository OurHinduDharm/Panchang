# Festival Record Triage — 2026-10-15

Repository: `OurHinduDharm/Panchang`  
Branch: `data/festival-json-foundation`  
Status: preliminary inventory only; **no dates or ritual rules certified by this scan**.

## Snapshot

- Records inspected: **122**
- No usable HTTP(S) article URL found in description or `relatedArticles`: **32**
- Empty description: **2**
- Stale 2025 date or placeholder `1970-01-01`: **14**
- Multi-day records / spans needing deliberate interpretation: **14**

This is a triage report, not permission to bulk-correct. Legacy content is evidence and should remain preserved under `sourceText`. Missing URLs mean display a plain-text topic/description until an actual article is written or verified; do not invent links.

## Immediate review priorities

1. **`festival-054` solar-eclipse placeholder** — `1970-01-01` is not an event date. Reuse `eclipse-panchang.js` for astronomical events; keep local visibility and ritual/sutak advice separate.
2. **`festival-117` Ganesh record** — title says “गणेश जी की जयंती”, description links to Ganesh Chaturthi / Bhadrapada Shukla Chaturthi, and stored span is 14–25 September. Inspect legacy intent before changing title or dates.
3. **`festival-087` Gayatri Jayanti** — legacy description combines a Jayanti date with an Ambubachi Yoga interval; model as distinct observances if both are meant to appear.
4. **`festival-101` Chaturmas sankalpa** — preserve the owner-confirmed 25–30 July 2026 *display window*. The legacy text says 29 July; check public copy separately and never overwrite archived `sourceText`.
5. **Stale 2025 spans** — recalculate by the intended lunar-month/observance convention; do not shift dates by a fixed year offset.
6. **Empty descriptions** — `festival-112` and `festival-118`: research/confirm the appropriate description before writing public-facing ritual claims.
7. **Missing links** — do not fabricate URLs. Use plain text until the related article exists or the actual URL is verified.

## Full record inventory

| ID | Festival / legacy title | Stored date(s) | Rule type | First-pass finding |
|---|---|---|---|---|
| `festival-001` | आश्विन कृष्ण प्रतिपदा (पितृपक्ष प्रारंभ) | 2026-09-27–2026-10-10 | tithi | अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-002` | पितृ विसर्जन अमावास्या | 2026-10-10 | tithi | URL present; date/rule still needs review |
| `festival-003` | शारदीय नवरात्र प्रारम्भ | 2026-10-11–2026-10-20 | tithi | अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-004` | शारदीय नवरात्र द्वितीया - ब्रह्मचारिणी | 2026-10-12 | tithi | URL present; date/rule still needs review |
| `festival-005` | शारदीय नवरात्र तृतीया - चन्द्रघंटा | 2026-10-13 | tithi | URL present; date/rule still needs review |
| `festival-006` | शारदीय नवरात्र चतुर्थी - कूष्माण्डा | 2026-10-14 | tithi | URL present; date/rule still needs review |
| `festival-007` | शारदीय नवरात्र पंचमी - स्कन्दमाता | 2026-10-15 | tithi | URL present; date/rule still needs review |
| `festival-008` | शारदीय नवरात्र षष्ठी - कात्यायनी | 2026-10-16 | tithi | URL present; date/rule still needs review |
| `festival-009` | एवं १८ अक्टूबर को = शारदीय नवरात्र सप्तमी - कालरात्रि | 2026-10-17–2026-10-18 | tithi | अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-010` | शारदीय नवरात्र महाष्टमी - महागौरी | 2026-10-19 | tithi | URL present; date/rule still needs review |
| `festival-011` | शारदीय नवरात्र महानवमी - सिद्धिदात्री | 2026-10-20 | tithi | URL present; date/rule still needs review |
| `festival-012` | दशहरा / विजयादशमी | 2026-10-20 | tithi | URL present; date/rule still needs review |
| `festival-013` | कोजागरी पूर्णिमा / शरद पूर्णिमा | 2026-10-25 | tithi | URL present; date/rule still needs review |
| `festival-014` | कार्तिक मास प्रारंभ | 2026-10-26 | tithi | लेख URL अनुपलब्ध |
| `festival-015` | करवाचौथ | 2026-10-29 | tithi | URL present; date/rule still needs review |
| `festival-016` | रमा (रम्भा) एकादशी व्रत | 2026-11-05 | tithi | URL present; date/rule still needs review |
| `festival-017` | गोवत्स द्वादशी व्रत | 2026-11-05 | tithi | URL present; date/rule still needs review |
| `festival-018` | धनतेरस / धन्वन्तरि जयंती | 2026-11-06 | tithi | URL present; date/rule still needs review |
| `festival-019` | श्री हनुमान जयन्ती (2025) | 2025-10-19 | tithi | पुरानी/placeholder तारीख |
| `festival-020` | नरक चतुर्दशी / काली चौदस | 2026-11-08 | tithi | URL present; date/rule still needs review |
| `festival-021` | दीपावली / महालक्ष्मी पूजन | 2026-11-08 | tithi | URL present; date/rule still needs review |
| `festival-022` | अन्नकूट / गोवर्धन पूजा | 2026-11-10 | tithi | लेख URL अनुपलब्ध |
| `festival-023` | भ्रातृ द्वितीया / यम द्वितीया | 2026-11-11 | tithi | लेख URL अनुपलब्ध |
| `festival-024` | देवोत्थापनी एकादशी एवं चातुर्मास समाप्त | 2025-11-01 | tithi | पुरानी/placeholder तारीख |
| `festival-025` | तुलसी विवाह विधान प्रारंभ | 2025-11-02–2025-11-05 | tithi | पुरानी/placeholder तारीख; अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-026` | देव दीपावली एवं आकाशदीप दान | 2025-11-05 | tithi | पुरानी/placeholder तारीख |
| `festival-027` | श्री महाकाल भैरव जयन्ती | 2025-11-12 | tithi | पुरानी/placeholder तारीख |
| `festival-028` | हेमन्त ऋतु प्रारंभ | 2025-11-21 | astronomical | लेख URL अनुपलब्ध; पुरानी/placeholder तारीख |
| `festival-029` | श्रीमद्भगवद्गीता जयंती / मोक्षदा एकादशी | 2025-12-01 | tithi | पुरानी/placeholder तारीख |
| `festival-030` | श्री दत्तात्रेय जयंती | 2025-12-04 | tithi | पुरानी/placeholder तारीख |
| `festival-031` | श्री त्रिपुरभैरवी महाविद्या जयंती, श्रीविद्या जयंती, अन्नपूर्णा जयन्ती | 2025-12-04 | tithi | पुरानी/placeholder तारीख |
| `festival-032` | पौष मास प्रारम्भ | 2025-12-05–2026-01-03 | tithi | पुरानी/placeholder तारीख; अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-033` | धनु संक्रांति | 2025-12-16 | solar | लेख URL अनुपलब्ध; पुरानी/placeholder तारीख |
| `festival-034` | श्री शाकंभरी नवरात्र प्रारम्भ | 2025-12-28–2026-01-03 | tithi | पुरानी/placeholder तारीख; अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-035` | श्री तैलंग स्वामी जयंती | 2025-12-30 | tithi | पुरानी/placeholder तारीख |
| `festival-036` | श्री शाकंभरी माता जयंती | 2026-01-03 | tithi | URL present; date/rule still needs review |
| `festival-037` | माघ मास प्रारम्भ | 2026-01-04–2026-02-01 | tithi | अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-038` | मकर संक्रान्ति / सूर्य उत्तरायण प्रारम्भ | 2026-01-14 | solar | URL present; date/rule still needs review |
| `festival-039` | शिशिर ऋतु प्रारंभ | 2026-01-19 | astronomical | लेख URL अनुपलब्ध |
| `festival-040` | माघ गुप्त नवरात्र प्रारम्भ | 2026-01-19–2026-01-27 | tithi | अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-041` | तिल कुंड चतुर्थी / वरद चतुर्थी | 2026-01-22 | tithi | लेख URL अनुपलब्ध |
| `festival-042` | वसन्त पंचमी / सरस्वती पूजन | 2026-01-23 | tithi | URL present; date/rule still needs review |
| `festival-043` | नर्मदा जयंती | 2026-01-25 | tithi | लेख URL अनुपलब्ध |
| `festival-044` | भीष्माष्टमी एवं भीष्म तर्पण | 2026-01-26 | tithi | URL present; date/rule still needs review |
| `festival-045` | श्री ललिता त्रिपुरसुंदरी जी जयंती | 2026-02-01 | tithi | URL present; date/rule still needs review |
| `festival-046` | रथ सप्तमी | 2026-02-04 | tithi | लेख URL अनुपलब्ध |
| `festival-047` | यशोदा जयन्ती | 2026-02-07 | tithi | लेख URL अनुपलब्ध |
| `festival-048` | शबरी जयंती | 2026-02-08 | tithi | लेख URL अनुपलब्ध |
| `festival-049` | मासिक कालाष्टमी | 2026-02-09 | tithi | लेख URL अनुपलब्ध |
| `festival-050` | श्री महाशिवरात्रि व्रत | 2026-02-15 | tithi | URL present; date/rule still needs review |
| `festival-051` | आमलकी एकादशी | 2026-02-27 | tithi | URL present; date/rule still needs review |
| `festival-052` | होलिका-दहन | 2026-03-02 | tithi | URL present; date/rule still needs review |
| `festival-053` | चंद्रग्रहण | 2026-03-03 | astronomical | URL present; date/rule still needs review |
| `festival-054` | सूर्य ग्रहण (तिथि परिवर्तनशील / प्लेसहोल्डर) | 1970-01-01 | astronomical | पुरानी/placeholder तारीख; eclipse-panchang.js से जोड़ना |
| `festival-055` | धुलण्डी (रंगवाली होली) | 2026-03-03 | tithi | URL present; date/rule still needs review |
| `festival-056` | श्री महालक्ष्मी जयंती | 2026-03-03 | tithi | URL present; date/rule still needs review |
| `festival-057` | वसन्त ऋतु प्रारंभ | 2026-03-19 | astronomical | लेख URL अनुपलब्ध |
| `festival-058` | हिंदू नवसंवत्सर २०८३ (रौद्र) | 2026-03-19 | tithi | URL present; date/rule still needs review |
| `festival-059` | चैत्र (वासन्तीय) नवरात्र प्रारम्भ | 2026-03-19–2026-03-27 | tithi | अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-060` | नवरात्रि द्वितीय - ब्रह्मचारिणी | 2026-03-20 | tithi | URL present; date/rule still needs review |
| `festival-061` | श्री मत्स्य-अवतार जयन्ती | 2026-03-21 | tithi | URL present; date/rule still needs review |
| `festival-062` | नवरात्रि तृतीय - चन्द्रघंटा | 2026-03-21 | tithi | URL present; date/rule still needs review |
| `festival-063` | नवरात्रि चतुर्थ - कूष्माण्डा | 2026-03-22 | tithi | URL present; date/rule still needs review |
| `festival-064` | नवरात्रि पंचम - स्कन्दमाता | 2026-03-23 | tithi | URL present; date/rule still needs review |
| `festival-065` | नवरात्रि षष्ठ - कात्यायनी | 2026-03-24 | tithi | URL present; date/rule still needs review |
| `festival-066` | नवरात्रि सप्तम - कालरात्रि (महासप्तमी) | 2026-03-25 | tithi | URL present; date/rule still needs review |
| `festival-067` | नवरात्रि अष्टमी - महागौरी एवं अन्नपूर्णा | 2026-03-26 | tithi | URL present; date/rule still needs review |
| `festival-068` | श्रीरामनवमी (स्मार्त) | 2026-03-26 | tithi | लेख URL अनुपलब्ध |
| `festival-069` | श्रीरामनवमी (वैष्णव सम्प्रदाय) | 2026-03-27 | tithi | URL present; date/rule still needs review |
| `festival-070` | नवरात्रि नवमी - सिद्धिदात्री एवं तारा महाविद्या जयंती | 2026-03-27 | tithi | URL present; date/rule still needs review |
| `festival-071` | चैत्र नवरात्र पारण | 2026-03-27 | tithi | लेख URL अनुपलब्ध |
| `festival-072` | कलश विसर्जन | 2026-03-28 | tithi | लेख URL अनुपलब्ध |
| `festival-073` | श्री हनुमान जयन्ती | 2026-04-02 | tithi | URL present; date/rule still needs review |
| `festival-074` | मासिक कालाष्टमी | 2026-04-10 | tithi | URL present; date/rule still needs review |
| `festival-075` | श्री परशुराम अवतार जयन्ती | 2026-04-19 | tithi | URL present; date/rule still needs review |
| `festival-076` | अक्षय तृतीया | 2026-04-19 | tithi | URL present; date/rule still needs review |
| `festival-077` | श्री मातंगी महाविद्या जयन्ती | 2026-04-20 | tithi | URL present; date/rule still needs review |
| `festival-078` | श्री रामानुज, सूरदास, आदि शंकराचार्य जयन्ती | 2026-04-21 | manual | लेख URL अनुपलब्ध |
| `festival-079` | श्री बगलामुखी महाविद्या जयन्ती | 2026-04-24 | tithi | URL present; date/rule still needs review |
| `festival-080` | भगवती सीता जी जयन्ती (जानकी नवमी) | 2026-04-25 | tithi | URL present; date/rule still needs review |
| `festival-081` | श्री नृसिंह अवतार जयन्ती, श्री छिन्नमस्ता महाविद्या जयन्ती, श्री शरभ अवतार जयंती | 2026-04-30 | tithi | URL present; date/rule still needs review |
| `festival-082` | श्री कूर्म अवतार जयन्ती | 2026-05-01 | tithi | URL present; date/rule still needs review |
| `festival-083` | देवर्षि नारद जी की जयन्ती | 2026-05-02 | tithi | URL present; date/rule still needs review |
| `festival-084` | श्री शनि जयन्ती | 2026-05-16 | tithi | URL present; date/rule still needs review |
| `festival-085` | गंगा दशहरा | 2026-05-25 | tithi | URL present; date/rule still needs review |
| `festival-086` | श्री धूमावती महाविद्या जयन्ती | 2026-06-22 | tithi | URL present; date/rule still needs review |
| `festival-087` | वेदमाता गायत्री जयन्ती | 2026-06-25–2026-06-26 | tithi | अवधि-जाँच; जयन्ती बनाम अम्बुबाची अवधि अलग करें |
| `festival-088` | आषाढ़ गुप्त नवरात्र प्रारम्भ | 2026-07-15–2026-07-23 | tithi | अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-089` | कर्क संक्रान्ति | 2026-07-16 | solar | लेख URL अनुपलब्ध |
| `festival-090` | गुप्त नवरात्र द्वितीया - ब्रह्मचारिणी | 2026-07-16 | tithi | URL present; date/rule still needs review |
| `festival-091` | श्रीजगन्नाथ रथ यात्रा | 2026-07-16 | tithi | लेख URL अनुपलब्ध |
| `festival-092` | सूर्य दक्षिणायन आरंभ | 2026-07-17 | solar | लेख URL अनुपलब्ध |
| `festival-093` | गुप्त नवरात्र तृतीया - चन्द्रघंटा | 2026-07-17 | tithi | URL present; date/rule still needs review |
| `festival-094` | गुप्त नवरात्र चतुर्थी - कूष्माण्डा | 2026-07-17 | tithi | URL present; date/rule still needs review |
| `festival-095` | गुप्त नवरात्र पंचमी - स्कन्दमाता | 2026-07-18 | tithi | URL present; date/rule still needs review |
| `festival-096` | गुप्त नवरात्र षष्ठी - कात्यायनी | 2026-07-19 | tithi | URL present; date/rule still needs review |
| `festival-097` | गुप्त नवरात्र सप्तमी - कालरात्रि | 2026-07-20 | tithi | URL present; date/rule still needs review |
| `festival-098` | गुप्त नवरात्र अष्टमी - महागौरी | 2026-07-21 | tithi | URL present; date/rule still needs review |
| `festival-099` | गुप्त नवरात्र नवमी - सिद्धिदात्री | 2026-07-22 | tithi | URL present; date/rule still needs review |
| `festival-100` | गुप्त नवरात्र पारण एवं कलश विसर्जन | 2026-07-23 | tithi | लेख URL अनुपलब्ध |
| `festival-101` | हरिशयनी एकादशी एवं चातुर्मास प्रारंभ | 2026-07-25–2026-07-30 | tithi | अवधि-जाँच; जानबूझकर 25–30 जुलाई; public copy में 29 जुलाई जाँचें |
| `festival-102` | गुरु पूर्णिमा | 2026-07-29 | tithi | लेख URL अनुपलब्ध |
| `festival-103` | श्रावण मास प्रारम्भ | 2026-07-30–2026-08-28 | tithi | लेख URL अनुपलब्ध; अवधि-जाँच; अवधि/स्थानीय तिथि सत्यापन |
| `festival-104` | श्रावण सोमवार (प्रथम) | 2026-08-03 | manual | लेख URL अनुपलब्ध |
| `festival-105` | नाग पंचमी व्रत | 2026-08-17 | tithi | URL present; date/rule still needs review |
| `festival-106` | श्री कल्कि अवतार जयंती | 2026-08-18 | tithi | URL present; date/rule still needs review |
| `festival-107` | श्री हयग्रीव भगवान जयन्ती | 2026-08-27 | tithi | URL present; date/rule still needs review |
| `festival-108` | रक्षा बंधन, संस्कृत दिवस, लव कुश जयंती | 2026-08-28 | tithi | URL present; date/rule still needs review |
| `festival-109` | श्रावणी उपाकर्म (ऋग्वेदी एवं यजुर्वेदी) | 2026-08-28 | tithi | लेख URL अनुपलब्ध |
| `festival-110` | श्री गायत्री जयन्ती | 2026-08-28 | tithi | URL present; date/rule still needs review |
| `festival-111` | विन्ध्यवासिनी देवी जयन्ती | 2026-08-30 | tithi | लेख URL अनुपलब्ध |
| `festival-112` | हलषष्ठी, श्री बलराम जयंती | 2026-09-02 | tithi | विवरण खाली; लेख URL अनुपलब्ध |
| `festival-113` | श्रीकृष्ण जयंती / श्री कृष्ण जन्माष्टमी, श्री आद्याकाली जयन्ती | 2026-09-04 | tithi | URL present; date/rule still needs review |
| `festival-114` | कुशोत्पाटनी अमावास्या | 2026-09-10 | tithi | लेख URL अनुपलब्ध |
| `festival-115` | सामवेदियों का उपाकर्म | 2026-09-13 | tithi | लेख URL अनुपलब्ध |
| `festival-116` | श्री वाराहावतार प्राकट्य | 2026-09-14 | tithi | URL present; date/rule still needs review |
| `festival-117` | श्री गणेश जी की जयंती | 2026-09-14–2026-09-25 | tithi | अवधि-जाँच; शीर्षक/विवरण/अवधि में संभावित असंगति |
| `festival-118` | ऋषि पंचमी | 2026-09-16 | tithi | विवरण खाली; लेख URL अनुपलब्ध |
| `festival-119` | श्री राधाष्टमी | 2026-09-19 | tithi | URL present; date/rule still needs review |
| `festival-120` | श्री वामनावतार एवं श्री भुवनेश्वरी महाविद्या का प्राकट्य | 2026-09-23 | tithi | URL present; date/rule still needs review |
| `festival-121` | श्रीगणेश विसर्जन | 2026-09-25 | tithi | लेख URL अनुपलब्ध |
| `festival-122` | भाद्रपद शुक्ल पूर्णिमा | 2026-09-26 | tithi | लेख URL अनुपलब्ध |

## Review policy

- `needs-review` is not a claim that a date is wrong; it means no independent rule/source certification has been recorded.
- A multi-day range may mean a display window, ritual period, tithi interval, lunar month, or legacy editorial choice. Determine which one before editing.
- Keep article visibility, observance date, tithi interval, muhurta, and astronomical event as separate concepts.
- Preserve tradition/region differences and record the source and interpretation for every proposed correction.
- After each small batch, run the affected tests and check the latest GitHub Actions status. A diagnostic output is not a shastric certification.
