# TransLiteral vrata source audit (draft)

Checked: 2026-10-14
Branch: `data/festival-json-foundation`

## Source supplied by user
- Main index: https://www.transliteral.org/pages/i071211194552/view
- “व्रत परिचय तथा नियम”: https://www.transliteral.org/pages/z71212015438/view
- “मासिक व्रत परिचय”: https://www.transliteral.org/pages/i090114020125/view
- “धर्मशास्त्रानुसार विशेष बातें”: https://www.transliteral.org/pages/z71212124904/view
- Dharmasindhu — vrata-day determination (Smarta): https://www.transliteral.org/pages/z80421042257/view
- Dharmasindhu — vrata-day determination (Vaishnava): https://www.transliteral.org/pages/z80422042154/view
- Dharmasindhu — concise vrata-day determination: https://www.transliteral.org/pages/z80422042403/view
- Dharmasindhu — Ekadashi decision: https://www.transliteral.org/pages/z80422042052/view
- Dharmasindhu — Purnima/Amavasya decision: https://www.transliteral.org/pages/z80422043444/view

## What was verified
1. The supplied index is a topic index, not a single primary text. It links to several vrata categories, including Adhimas, monthly Ekadashi, Sankranti, weekday vows, monthly vrata overview, and general vrata rules.
2. The “व्रत परिचय तथा नियम” page contains general definitions/classifications of vrata, examples of tithi/weekday/nakshatra/yoga/karana-linked observances, general time-selection verses, and a general statement defining Pradosha as two ghatis after sunset. This is a useful lead, not a substitute for the specific vrata's own rule.
3. The site's Dharmasindhu section exposes separate Smarta and Vaishnava vrata-day determination pages. Keep these profiles separate in our research and do not silently equate Vaishnava with ISKCON/GCAL.
4. The Ekadashi and Purnima/Amavasya pages are separate, relevant decision topics. Each claim must be traced to the quoted Sanskrit, its cited authority, and context before being converted to code.
5. The site page states Dharmasindhu was composed by Pt. Kashinathashastri Upadhyay in 1790–91; this is website-provided bibliographic context and should not replace edition-level bibliographic verification.

## Suggested workflow for OurHinduDharm
- Use the index to discover missing vrata families and relevant topic pages.
- Save the exact page URL, heading, Sanskrit quotation, surrounding context, cited authority, and any translation/interpretation.
- Cross-check with Vrat-Parichay and, where possible, a scan of the cited primary edition.
- Keep general rules separate from observance-specific rules (e.g. Pradosha duration vs a particular Pradosha-vrata selection rule).
- For Ekadashi, maintain separate Smarta and Vaishnava decision profiles; document source, edition, predicate, worked local-time examples, and regression tests.
- Do not implement a date rule from an index snippet or unsourced summary alone.

## Limits
- TransLiteral pages are web transcriptions/translation pages; their presence does not prove a particular printed edition or page-image match.
- OCR/transcription can contain omissions or errors. Verify key Sanskrit and page/edition details independently before declaring a rule authoritative.
- This is research documentation only. No runtime code, `data/festivals.json`, legacy dates, or Blogger output changed.


## Monthly vrata index inspected (2026-10-14)

User highlighted the monthly index: https://www.transliteral.org/pages/i090114020125/view . It links all 12 lunar-month categories, each split into Krishna-paksha and Shukla-paksha sub-indexes:
- Chaitra: https://www.transliteral.org/pages/i090116003019/view
- Vaishakha: https://www.transliteral.org/pages/i090116222121/view
- Jyeshtha: https://www.transliteral.org/pages/i090117062330/view
- Ashadha, Shravan, Bhadrapada, Ashwin, Kartik, Margashirsha, Pausha, Magha, Phalguna are linked from the monthly index.

Important limitation: the month pages themselves mostly function as navigation indexes; the actual vrata names/rules are likely one level deeper under Krishna-paksha and Shukla-paksha. Therefore audit should continue by opening those two sub-indexes for every month, collecting individual observance pages, and matching them against `festivals.json` and Vrat-Parichay. Do not treat the index as a complete list until both paksha sub-indexes and relevant child pages have been checked. The index page shows last updated January 22, 2014, so it may be incomplete or dated.


## Complete monthly paksha index register (checked 2026-10-14)

The following are the 24 month/paksha index URLs. They are navigation/source-discovery pages; an entry in a list is not by itself proof of a festival's modern observance date or a usable date-selection rule.

| Lunar month | Krishna paksha index | Shukla paksha index |
|---|---|---|
| Chaitra | https://www.transliteral.org/pages/i090116003426/view | https://www.transliteral.org/pages/i090116010103/view |
| Vaishakha | https://www.transliteral.org/pages/i090116222356/view | https://www.transliteral.org/pages/i090116224059/view |
| Jyeshtha | https://www.transliteral.org/pages/i090117062605/view | https://www.transliteral.org/pages/i090118033705/view |
| Ashadha | https://www.transliteral.org/pages/i090120214632/view | https://www.transliteral.org/pages/i090120215259/view |
| Shravan | https://www.transliteral.org/pages/i090120221224/view | https://www.transliteral.org/pages/i090121013810/view |
| Bhadrapada | https://www.transliteral.org/pages/i090121033801/view | https://www.transliteral.org/pages/i090121040257/view |
| Ashwin | https://www.transliteral.org/pages/i090121222201/view | https://www.transliteral.org/pages/i090121222905/view |
| Kartik | https://www.transliteral.org/pages/i090121234712/view | https://www.transliteral.org/pages/i090122002342/view |
| Margashirsha | https://www.transliteral.org/pages/i090122034921/view | https://www.transliteral.org/pages/i090122040402/view |
| Pausha | https://www.transliteral.org/pages/i020101012608/view | https://www.transliteral.org/pages/i020101013209/view |
| Magha | https://www.transliteral.org/pages/i020101014607/view | https://www.transliteral.org/pages/i020101015847/view |
| Phalguna | https://www.transliteral.org/pages/i020101051909/view | https://www.transliteral.org/pages/i020101054305/view |

Parent monthly index: https://www.transliteral.org/pages/i090114020125/view

### First-pass observations from paksha indexes

These are names surfaced in index headings, not yet a final list of missing festivals. Normalize spelling/aliases and compare against the 122 existing data/festivals.json records before proposing additions.

- **Chaitra Krishna:** Gauri-vrata, Holamahotsava (listed twice), Sankashti Chaturthi, Sheetala Ashtami, Santan Ashtami, Krishna Ekadashi, Varuni Yoga, Kedar Darshan, Chaitri Amavasya, Vahli-vrata, Pitri-vrata.
- **Chaitra Shukla:** Samvatsara, Samvatsara-pujan, Tilaka-vrata, Arogya-vrata, Vidya-vrata, Navaratri, Panchratra (listed twice), Balendu-vrata, Netra-vrata, Dolanotsava, Gauri Tritiya, Ishvara-Gauri, Gauri-visarjan, Shri-vrata, Lakshmi-vrata, Kumara-vrata, Modana-vrata, Nama Saptami, Surya-vrata, Ashoka-kalika-prashana, Rama Navami, Shukla Ekadashi, Madana Dvadashi, Madana Puja, Pradosha-vrata, Chaitri Purnima, Tithisha-pujan, Hanumat-vrata.
- **Margashirsha Krishna:** Dhanya-vrata, Anagha-vrata, Bhairava Jayanti, Kalashtami, Krishna Ekadashi-vrata, Gauri-tapa-vrata.
- **Margashirsha Shukla:** Shukla Ekadashi, Vyanjana Dvadashi, Dvadashaditya-vrata, Janardana Puja, Ananga Trayodashi, Yama-darshana, Pishachamochana Yatra, Shiva Chaturdashi-vrata, Krichchhra Chaturthi, Vara Chaturthi, Nag Panchami, Shri Panchami, Tritaya Saptami, Mitra Saptami, Bhadra Saptami, Nikshubhar-ka-chatushtya, Nandini, Padartha Dashami, Dharma-traya-vrata, Dasha-aditya-vrata. Note: the rendered child list includes some entries labelled as Magha under the Margashirsha heading; treat this as a site/index anomaly to investigate, not a reliable month assignment.
- **Pausha Krishna:** Sankashti Chaturthi, Rukmini Ashtami, Krishna Ekadashi, Surupa Dvadashi.
- **Pausha Shukla:** Arogya-vrata, Ubhaya Saptami, Shukla Ekadashi, Sujanma Dvadashi, Ghrita-dana, Virupaksha-pujan, Ishana-vrata.
- **Magha Krishna:** Magha-snan, Vakratunda Chaturthi, Krishna Ekadashi, Maghi Amavasya, Vidhi-puja, Ardhodaya, Patra-dana.
- **Magha Shukla:** Kunda Chaturthi, Dhundhi-puja, Shanti Chaturthi, Angaraka Chaturthi, Ganesha-vrata, Sukha Chaturthi, Shri Panchami/Vasant Panchami, Mandara Shashthi, Daridryahara Shashthi, Bhanu Saptami, Putra Saptami, Sapta Saptami, Bhishma Ashtami, Tila Dvadashi, Dinatraya-vrata, Maghi Purnima, Mahamaghi.

### Audit cautions and next pass

- Paksha lists can contain repeated names, cross-linked entries, old/rare observances, and possible month-label inconsistencies. Preserve the original title and URL while recording a normalized candidate name.
- The site gives many child pages a generic description in the index; open the individual child page before extracting a tithi, procedure, or timing rule.
- Continue extracting the remaining 16 paksha indexes' headings, then compare the complete name inventory to data/festivals.json and the Vrat-Parichay source audit. Classify each as existing/alias, potentially missing, recurring rule-family, duplicate/index anomaly, or needs primary-source verification.
- No runtime code, data/festivals.json, legacy dates, or Blogger output changed.
