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


## First-pass comparison against the current 122 festival records (2026-10-14)

This is a research shortlist, not permission to add records or change runtime rules. The current file `data/festivals.json` has 122 records. Names were compared against its current titles. A recurring vrata mentioned in a monthly list is not necessarily a separate one-date festival; use a recurring-rule family where appropriate.

### High-priority rule families / potentially missing records

| Candidate | TransLiteral source and stated authority | Initial match against current 122 records | Recommended handling |
|---|---|---|---|
| Sankashti Chaturthi (monthly Krishna Chaturthi) | https://www.transliteral.org/pages/z90116003952/view — page labels the description “भविष्यपुराण”; states it is observed on Krishna Chaturthi in all months, uses Chandrodaya-vyapini Chaturthi, and if it is moonrise-vyapini on both days selects the first. It also quotes a verse attributed to Brihaspati for a separate tithi condition. | No explicit Sankashti Chaturthi record found. | High priority as a recurring rule-family, not 12 separate hardcoded dates. Verify the quoted authorities and reconcile apparently different tithi-selection statements before coding. |
| Masik Shivaratri | https://www.transliteral.org/pages/z20101052333/view — page labels the passage “मदनरत्न”; says Krishna Chaturdashi each month, a Chaturdashi qualified by Trayodashi and lasting late into night, with four-prahara worship/jagaran. | Only Mahashivaratri exists; it is not a substitute for Masik Shivaratri. | High priority recurring-rule candidate. Independently verify the precise vrata-day predicate in the cited source. |
| Vata Savitri / Vat Savitri | https://www.transliteral.org/pages/z90117062946/view — page distinguishes Skanda and Bhavishyottara for Jyeshtha Shukla Purnima versus Nirnayamrita and other sources for Amavasya, and notes regional variation. | No dedicated Vata Savitri record found. | High priority, but preserve Purnima and Amavasya as distinct tradition profiles; do not choose one universally. Compare with Vrat-Parichay and printed editions. |
| Sheetala Ashtami / Sheetala vrata | https://www.transliteral.org/pages/z90116004057/view — page labels the description “स्कन्दपुराण”; says the common observance is Chaitra Krishna Ashtami but mentions a four-month vrata (Chaitra through Ashadha) in Skanda Purana, with pūrvaviddhā Ashtami. It quotes a verse attributed to Madhava. | No dedicated Sheetala Ashtami record found. | Candidate for inclusion; first distinguish the common annual festival from the broader four-month vrata series. Verify the quoted text and regional practice. |
| Santan Ashtami | https://www.transliteral.org/pages/z90116004209/view — labels the passage “विष्णुधर्मोत्तर”; describes Chaitra Krishna Ashtami and worship of Krishna and Devaki. | No dedicated record found. | Candidate for source-backed inclusion after primary-source verification; don't conflate with unrelated Putra/Santan observances. |
| Varuni / Mahavaruni / Mahamahavaruni Yoga | https://www.transliteral.org/pages/z90116005013/view — labels the passage “वाचस्पति-निबन्ध” and quotes a verse attributed to Tristhalisetu; gives a combination of Chaitra Krishna Trayodashi, Shatabhisha, and Saturday for higher variants. | No dedicated Varuni Yoga record found. | Candidate for an astronomical yoga/event rule, not a fixed annual date. Need validate calendrical calculations and exact ghati interpretation before implementation. |
| Rukmini Ashtami | https://www.transliteral.org/pages/z20101012732/view — labels the passage “व्रतकौस्तुभ”; describes Pausha Krishna Ashtami worship of Krishna, Rukmini and Pradyumna. | No dedicated record found. | Candidate for a descriptive vrata record after checking the source edition and whether this is the intended tradition. |
| Skanda Shashthi vrata | https://www.transliteral.org/pages/z90120215423/view is linked from the Ashadha Shukla index. | Current record “शारदीय नवरात्र पंचमी - स्कन्दमाता” is not Skanda Shashthi and must not be treated as a match. No explicit Skanda Shashthi record found. | Keep separate; inspect the child text and source before deciding whether it belongs in the public calendar. |
| Pradosha vrata | Monthly indexes link it in Chaitra Shukla and Ashadha Shukla; general rules page separately says Pradosha is two ghatis after sunset. | No dedicated Pradosha record found. | Candidate recurring-rule family. Keep the general Pradosha window separate from the rule that selects which tithi/day is the vrata day. |
| Monthly Ekadashi | Multiple monthly lists use generic “कृष्णैकादशी/शुक्लैकादशी”; the TransLiteral Dharmasindhu area separately exposes Smarta and Vaishnava decision pages. | Existing named records include some Ekadashis, not a complete monthly set or decision profile. | Build a reusable monthly rule family with separate Smarta and Vaishnava profiles; do not infer that a named Ekadashi covers all months or that Vaishnava automatically means ISKCON/GCAL. |

### Existing-record matches / avoid duplicates

| TransLiteral candidate | Existing record(s) likely related | Caution |
|---|---|---|
| Navaratri, Rama Navami, Shukla Ekadashi | Chaitra Navaratri series and Rama Navami Smarta/Vaishnava (festival-059–071) | Chaitra Shukla list has many additional vrata titles; do not mark the whole paksha as covered just because Navaratri exists. |
| Akshaya Tritiya, Parashurama Jayanti, Janaki Navami, Narasimha Jayanti | festival-076, 075, 080, 081 | Normalize titles and verify rule/source rather than duplicate. |
| Ratha Yatra, Harishayani Ekadashi, Guru Purnima | festival-091, 101, 102 | Existing record match; the associated Ashadha list still contains other potential observances. |
| Nag Panchami, Rishi Panchami, Radhashtami | festival-105, 118, 119 | Existing record match; don't duplicate from index aliases. |
| Sharadiya Navaratri, Vijayadashami, Kojagari/Sharad Purnima | festival-003–013 (several separate day records) | Existing records cover some named observances; still audit any other listed Ashwin vrata separately. |
| Govardhan Puja/Annakut, Yamadvitiya, Prabodhini Ekadashi, Tulsi Vivah | festival-022–025 | Existing related entries; distinguish observance from its ritual procedure and avoid duplicate records. |
| Bhairava Jayanti | festival-027 “श्री महाकाल भैरव जयन्ती” | Likely name/observance overlap; verify tithi tradition and do not create duplicate before comparing existing sourceText. |
| Magha Shukla Vasant Panchami, Bhishma Ashtami, Maghi Purnima | festival-042, 044 and potentially month-start/related entries | Likely matches; verify each alias and avoid duplication. |
| Monthly Kalashtami | festival-049 and festival-074 already both titled “मासिक कालाष्टमी” | Existing duplicate-looking entries are a separate audit issue; don't add a third from the Margashirsha list. |

### Source-quality notes

- TransLiteral child pages often name an authority in the body (for example Bhavishya Purana, Skanda Purana, Vishnudharmottara, Vratakaustubha, Madanaratna, Vachaspati-nibandha, Tristhalisetu), but the page footer says “References: N/A”. Therefore these are useful textual leads, not independently verified quotations from a specific edition.
- Preserve the source wording and link; do not copy large passages into OurHinduDharm. The site states CC BY-NC-SA 4.0; any reuse of text requires attribution and compliance with the non-commercial/share-alike terms. Prefer concise paraphrase plus citation link.
- The monthly indexes include duplicate titles (for example Holamahotsava, Panchratra, Akshaya Tritiya, Nimb Saptami, Narasimha Jayanti, Shiva Chaturthi and Rishi Panchami). Keep duplicates in the source inventory but normalize them for the comparison.
- No new festival records, executable date predicates, legacy date changes, or live Blogger changes are authorized by this audit. `data/festivals.json` remains unchanged.


### Next-stage review queue: source claims versus implementation readiness (2026-10-14)

This section prioritizes work after the 24 monthly indexes were inventoried. “Candidate” means investigate, not approved for publication or automatic date calculation.

| Priority | Candidate / family | Source lead | What must be checked before implementation |
|---|---|---|---|
| P0 | Monthly Ekadashi profiles | [Dharmasindhu Ekadashi decision](https://www.transliteral.org/pages/z80422042052/view), [Smarta decision](https://www.transliteral.org/pages/z80421042257/view), [Vaishnava decision](https://www.transliteral.org/pages/z80422042154/view) | Separate Smarta and Vaishnava profiles; establish tithi-at-sunrise/parana rules and exception handling from a specific edition; test location-local examples. |
| P0 | Pradosha | [General vrata rules](https://www.transliteral.org/pages/z71212015438/view) and month/paksha lists | Keep the sunset-relative puja window separate from the rule choosing the vrata date when Trayodashi spans two days; verify weekday-specific names/observances separately. |
| P0 | Monthly Sankashti Chaturthi | Chaitra Krishna index and child page; source lead labels account Bhavishya Purana | Verify Chandrodaya-vyapini rule, local moonrise, and any exceptional cases; do not derive dates from a static Gregorian date. |
| P0 | Monthly Masik Shivaratri vs Maha Shivaratri | [Nirnayasindhu Shivaratri decision chapter](https://www.transliteral.org/pages/z130621065953/view); monthly lists | Distinguish the monthly Krishna Chaturdashi observance from the annual Maha Shivaratri decision; compare the authority-specific night/pradosha/nishitha rules rather than assuming one generic predicate. |
| P1 | Vata Savitri | Vrat-Parichay edition notes and TransLiteral source page | Keep Purnima and Amavasya traditions separate; establish regional/lineage applicability and date rule before adding either profile. |
| P1 | Sheetala Ashtami / Sheetala Saptami | Chaitra Krishna and Shravan Krishna indexes; source pages label different traditions | Do not collapse Ashtami and Saptami traditions. Verify region, month, paksha, and authority before matching an existing record. |
| P1 | Santan Ashtami | Chaitra Krishna index; source page labels Vishnudharmottara | Check exact tithi/month and whether a current record is an alias or genuinely different vrata. |
| P1 | Varuni Yoga | Chaitra Krishna index; source lead names Vachaspati-nibandha / Tristhalisetu | Treat as a rare calendar conjunction (tithi + nakshatra + weekday variants), not a fixed-date annual festival; verify definitions and year/location test cases. |
| P1 | Rukmini Ashtami | [Pausha keyword index](https://www.transliteral.org/keywords/pausha/word) and monthly child pages | Confirm the source's month/paksha and whether it is the same observance as any existing Krishna/Rukmini-related entry. |
| P1 | Skanda Shashthi | Monthly indexes and dedicated child pages | Never equate with Skandamata; determine which regional observance and tithi rule the source describes. |
| P2 | Ashunya Shayana | Vrat-Parichay source notes and Shravan Krishna index | Verify full start/end interval and pūrvaviddhā/paraviddhā tie-break from page images/edition; likely a multi-month observance, not a one-day event. |
| P2 | Mangala Gauri, Nirjala Ekadashi, Adhimas/Purushottama Maas | Vrat-Parichay and general TransLiteral indexes | Verify edition and full procedural/date-selection details; separate a vrata rule, a month-long observance, and a named festival record. |

#### Additional evidence / caution discovered in targeted search

- The TransLiteral keyword indexes surface **Pausha Krishna Rukmini Ashtami** and a **Magha Krishna bath observance**; the latter's page gives multiple possible spans for Magha-snana (Pausha Shukla Ekadashi to Magha Shukla Ekadashi, Purnima-to-Purnima, or the Sun's transit through Capricorn). This is a multi-day practice, not a single date. Source lead: [Magha-snana](https://www.transliteral.org/pages/z20101014608/view).
- The TransLiteral **Nirnayasindhu Shivaratri decision chapter** itself preserves disagreement between authorities over Pradosha-vyapini and Nishitha-vyapini selection, and discusses how to decide when the tithi spans more than one night. This is strong evidence against implementing “Masik Shivaratri = any Krishna Chaturdashi” as a complete date-selection algorithm. Source lead: [Shivaratri decision](https://www.transliteral.org/pages/z130621065953/view).
- Monthly index pages are discovery aids. Their child pages may cite a Purana or nibandha in the text while the footer still says “References: N/A”. Record the cited authority as a *claim made by the page*, not as an independently verified primary-text citation.
- Some monthly lists contain ritual subsections (e.g. विधिपूजा, पात्रदान, आरंभ) alongside observances. Do not automatically turn every heading into a standalone festival card; first determine whether it is a separate vrata, a procedure, a daana item, or an introductory heading.
- The TransLiteral site is a secondary discovery/reference layer for this project. Keep source URLs and concise paraphrases; do not copy long passages into the repository. Verify licensing before reuse of text.

#### Safe implementation gate

A candidate may move from research to executable data only after all applicable items are satisfied:
1. The exact source passage and edition/page (or a clear note that only a secondary web transcription is available) are recorded.
2. The observance is normalized against all 122 legacy records and the Vrat-Parichay alias audit.
3. The tithi/nakshatra/weekday/sunset/moonrise predicate is explicit, including precedence and tie-break cases.
4. At least one worked date/location example and regression test are recorded.
5. Existing source text/article links are preserved; no legacy date is silently shifted.
6. A separate explicit approval is obtained before changing runtime behavior or live Blogger output.

No candidate in this queue is approved for automatic scheduling by this note.


### Machine-assisted title/description cross-check against the 122-record JSON (2026-10-14)

I parsed the current `data/festivals.json` on this branch and checked candidate strings against both record names and legacy descriptions. This is a *triage check only*: a substring hit can be incidental, and a no-hit can still be an alias.

| Candidate string | Result in current 122 records | Triage conclusion |
|---|---|---|
| Sankashti Chaturthi / संकष्ट | No direct string hit | Strong candidate for a recurring rule/record; inspect any generic Chaturthi aliases manually. |
| Masik Shivaratri / मासिक शिवरात्रि | Only `festival-050 श्री महाशिवरात्रि व्रत` hits “शिवरात्रि” | Annual Mahashivaratri is not evidence that monthly Shivaratri is covered. |
| Sheetala / शीतला | No direct string hit | Candidate; check whether any generic Ashtami entry is actually the same observance. |
| Santan Ashtami / संतानाष्टमी | No direct string hit | Candidate. |
| Varuni Yoga / वारुणी | No direct string hit | Candidate for conjunction rule, not fixed-date record. |
| Rukmini Ashtami / रुक्मिणी | No direct string hit | Candidate; source index shows Pausha Krishna Rukmini Ashtami. |
| Skanda Shashthi / स्कन्द षष्ठी | No direct string hit | Candidate; do not equate with Skandamata. |
| Ashunya Shayana / अशून्यशयन | No direct string hit | Candidate for a multi-month observance/rule. |
| Mangala Gauri / मंगला गौरी | No direct string hit | Candidate; verify month/weekday and regional tradition. |
| Nirjala Ekadashi / निर्जला | No direct string hit | Candidate; verify whether any broad Ekadashi entry is merely informational. |
| Adhimas/Purushottama Maas | No direct string hit | Month-level observance; likely requires a distinct month-state rule rather than one fixed festival date. |
| Magha-snana / माघस्नान | No direct string hit | Candidate for a date-range/seasonal practice; do not model as a single day without source support. |
| Vata Savitri / वट सावित्री | One incidental hit in `festival-084 श्री शनि जयन्ती` description | Not covered based on the title match; inspect source text and regional tradition separately. |
| Monthly Pradosha / प्रदोष | Substring hits in `festival-017` and `festival-021` descriptions, not standalone Pradosha record titles | No evidence of a complete recurring Pradosha rule. |
| Monthly Ekadashi | Named entries include `festival-016`, `festival-024`, `festival-029`, `festival-051`, `festival-101`; other hits are incidental mentions | Some named dates exist, but no complete reusable monthly decision profile. |
| Monthly Kalashtami | `festival-049` and `festival-074` both titled `मासिक कालाष्टमी` | Existing duplicate-looking records should be reviewed separately before adding more entries. |

This pass intentionally does not create or delete records. Before adding candidates, compare the exact source page, month/paksha index, aliases, sourceText and any regional distinction manually.


### Wikisource Sanskrit-text research layer (2026-10-14)

Wikisource is added as a parallel primary-text discovery layer. Its pages can expose Sanskrit passages, chapter headings and quoted authorities that help us trace a vrata rule beyond a modern index. A Wikisource transcription is still not automatically a critically verified edition: inspect its edition metadata, scan/page image where available, OCR/transcription status, and cited chapter/verse before treating a reading as settled.

| Topic | Wikisource text lead | What it may support | Caution / next action |
|---|---|---|---|
| Sankashti Chaturthi | [आङ्गिरसस्मृतिः](https://sa.wikisource.org/wiki/आङ्गिरसस्मृतिः) | Search result includes a section titled चतुर्थीनिर्णय and the statement that Sankashti Chaturthi is taken as Chandrodaya-vyapini, with a Skanda Purana citation following. | Open the whole section, verify context and edition/scan; compare with the TransLiteral explanation and calendar calculation. |
| Ekadashi rules | [वीरमित्रोदयः—समयप्रकाशः](https://sa.wikisource.org/wiki/वीरमित्रोदयः_-_समयप्रकाशः) | Contains a passage on Ekadashi kshaya, Dashami association, Dvadashi fast/parana and cited Padma Purana verses. | This is a dharma-nibandha compilation, not a universal single rule; compare Smarta/Vaishnava context and surrounding passages. |
| Ekadashi / Vaishnava vrata | [परमपुरुषसंहिता, अध्याय 10](https://sa.wikisource.org/wiki/परमपुरुषसंहिता/अध्यायः_१०) | Chapter heading explicitly describes Ekadashi-vrata glory and decision; visible passage discusses Dashami/Ekadashi/Dvadashi. | Check the full chapter and text quality; do not apply one sampradaya's procedure to all users without labeling. |
| Ekadashi tithi conjunctions | [श्रीवैखानसगृह्यसूत्रम्, भाग 1, scan page 471](https://sa.wikisource.org/wiki/पृष्ठम्:श्रीवैखानसगृह्यसूत्रम्-भागः_१.pdf/४७१) and [scan page 483](https://sa.wikisource.org/wiki/पृष्ठम्:श्रीवैखानसगृह्यसूत्रम्-भागः_१.pdf/४८३) | Page transcription quotes rules involving Ekadashi/Dvadashi/Trayodashi and Purvaviddha tithis, including cited Skanda/Vayu material. | Page is marked unproofread; use the PDF scan to check OCR, and preserve source-specific context. |
| Monthly Chaturdashi / Ashtami observances | [स्कन्दपुराणम्, अम्बिकाखण्ड 8.12](https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_८_(अम्बिकाखण्डः)/१२) and [chapter 8.3](https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_८_(अम्बिकाखण्डः)/०३) | Passages discuss observance/fasting on Chaturdashi and Ashtami in both pakshas. | Broad vrata-mahatmya does not by itself define modern festival date-selection; locate exact vrata context and edition. |
| Kartika vrata families | [Skanda Purana, Kartika-mahatmya chapter 33](https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_३३) | Page's note lists cross-references about Prabodhini Ekadashi, Bhishma Panchaka, Panchratra and Ashunya Shayana in multiple texts. | Treat the note as a bibliographic lead; verify each cited original passage, not just the note. |
| Narada Samhita | [नारदसंहिता](https://sa.wikisource.org/wiki/नारदसंहिता) | Contains tithi/weekday combinations and other calendrical rules. | Do not assume every yoga/inauspicious combination is a vrata date rule; classify its purpose first. |

#### Source hierarchy to apply in this project

1. **Rule-selection / vrata-day decision:** Dharma-nibandha chapters such as Dharmasindhu, Nirnayasindhu, Viramitrodaya and other decision texts, with the specific community/profile identified.
2. **Observance narrative / named vrata / ritual:** Relevant Purana, Smriti, Grihya or Agama passage where a traceable chapter/verse exists.
3. **Secondary discovery layer:** TransLiteral, modern vrata books and indexes. Use these to find names and citations, then trace the source when possible.
4. **Calendar computation:** Independently validate tithi/nakshatra/weekday and local sunrise, sunset or moonrise using the project's astronomy engine and known examples. A shloka about the vrata's merit does not alone establish the date algorithm.

#### Working protocol for every new claim

- Save the direct source URL, work name, section/chapter/verse or scan page, edition details, and whether the text is proofread.
- Quote only the minimum needed for comparison; write our own concise paraphrase and attribution.
- Record conflicting authorities side by side; do not silently merge them into one “universal” rule.
- Separate (a) observance exists, (b) which tithi it belongs to, (c) how the date is selected, and (d) local puja/parana timing.
- If Wikisource is unproofread or the scan is unavailable, label the claim provisional and do not use it as the sole basis for automatic date generation.


## Primary-text verification log — 2026-10-14 (pass 1)

This pass records what the currently accessible page text actually supports. It deliberately distinguishes a useful lead from a source that is safe to use as an implementation authority.

| Topic / candidate | Source actually inspected | What the visible text supports | Quality / conflict note | Project decision |
|---|---|---|---|---|
| Sankashti Chaturthi | [Wikisource page labelled आङ्गिरसस्मृतिः](https://sa.wikisource.org/wiki/आङ्गिरसस्मृतिः), especially page text around lines 875–876 | The visible passage says “सङ्कष्टचतुर्थी तु चन्द्रोदयव्यापिनी ग्राह्या” and explains the Chandrodaya basis. | **Critical metadata mismatch:** the same page begins its body with “अथ वीरमित्रोदयस्य समयप्रकाशः”, and its opening verses are clearly Viramitrodaya-Samayaprakasha material. Therefore the page title alone does not establish this as an Angirasa Smriti quotation. Treat the passage as a Viramitrodaya/Samayaprakasha lead until the edition and underlying citation are checked. | Candidate rule only: Sankashti needs local moonrise/tithi intersection logic; do not implement from this page alone. |
| Ekadashi — Vaishnava decision | [Viramitrodaya, Samayaprakasha](https://sa.wikisource.org/wiki/वीरमित्रोदयः_-_समयप्रकाशः), lines around 1972 onward and 2371 onward | The text explicitly transitions from a Vaishnava Ekadashi decision section to “अथ स्मार्तान् प्रति”; it discusses Dashami association, the following Dvadashi, tithi loss/growth, and cases where householders and ascetics may differ. | This is not a single simple “Ekadashi always on X day” rule. The text itself preserves distinctions among Vaishnava/Smarta and other cases. Page text may contain typographical/OCR issues; verify a printed edition before encoding edge cases. | Keep separate profiles (at minimum Smarta and Vaishnava) and a reviewed decision table. No generic automatic rule approved yet. |
| Ekadashi — Pancharatra/Agama source | [Paramapurusha Samhita, chapter 10](https://sa.wikisource.org/wiki/परमपुरुषसंहिता/अध्यायः_१०), verses marked 46–58 in page text | Chapter labels itself as Ekadashi vrata glory/decision and includes its own conditions involving Dashami, Ekadashi, Dvadashi and Trayodashi; it also contains ritual instructions and exceptions for people unable to fast. | The visible text is OCR-like and has spelling/spacing corruption. Its prescriptions are an additional tradition-specific witness, not automatically interchangeable with Dharma-nibandha Smarta or Vaishnava rules. The chapter's internal decision should be checked against a page scan/edition. | Add as a comparative source only; do not let it silently override the project's chosen profile. |
| Ashunya Shayana Dvitiya | Same Wikisource page labelled आङ्गिरसस्मृतिः, lines around 748–754 | Visible passage links the vrata to the four dark fortnights beginning with Shravan and says Chandrodaya-vyapini is relevant because of the Chandra arghya; it quotes a vrata passage. | Same page-title/body mismatch noted above, so source attribution is uncertain even though the visible rule is clear. | Retain as a lead; require a clean source attribution and cross-check against TransLiteral before considering a record. |
| General tithi-decision methodology | Viramitrodaya-Samayaprakasha, the sequence of named sections and the Smarta/Vaishnava split | The text is organized by tithi-specific decisions and then applies detailed conditions, not one uniform tithi rule to every observance. | A general methodological observation, not a standalone date predicate. | Every candidate needs an observance-specific decision source and a separately tested calendar calculation. |

### Source integrity issue to resolve before citation

The Wikisource URL/title आङ्गिरसस्मृतिः currently serves body text that opens with the title “अथ वीरमित्रोदयस्य समयप्रकाशः”. Its Chaturthi passage is useful for discovering the Chandrodaya-vyapini rule, but it must **not** be cited as a verified Angirasa Smriti passage until the page's provenance and edition are resolved. Prefer the explicitly titled Viramitrodaya-Samayaprakasha page for provisional attribution, and record any underlying Purana/Smriti citation only after checking the referenced source.

### Next verification steps
1. Resolve the Angirasa-labelled page/body mismatch against the Wikisource page history and an edition scan.
2. Inspect the relevant Dharmasindhu Smarta and Vaishnava decision texts side by side, then create a case matrix for Ekadashi: ordinary, Dashami-viddha, tithi-kshaya, Dvadashi-vriddhi, and tradition/profile.
3. For Sankashti, cross-check the moonrise rule in an independently attributed Dharma-nibandha or vrata source and test local moonrise boundaries.
4. Keep all findings in this research layer; do not edit data/festivals.json, executable rules, or Blogger output during source audit.


## Ekadashi cross-check — Dharmasindhu tradition profiles (2026-10-14)

### Directly inspected secondary transcription / translation

- [Dharmasindhu — व्रतदिननिर्णय (वैष्णवांचा), TransLiteral](https://www.transliteral.org/pages/z80422042154/view), visible text around lines 86–90.
- [Dharmasindhu — संक्षेपाने व्रतदिननिर्णय, TransLiteral](https://www.transliteral.org/pages/z80422042403/view), contents confirms separate Smarta, Vaishnava, Ekadashi and Dvadashi decision sections.
- [Viramitrodaya — Samayaprakasha, Wikisource](https://sa.wikisource.org/wiki/वीरमित्रोदयः_-_समयप्रकाशः), visible Ekadashi decision around lines 1972 onward and detailed cases around 2391 onward.
- [Paramapurusha Samhita, chapter 10, Wikisource](https://sa.wikisource.org/wiki/परमपुरुषसंहिता/अध्यायः_१०), chapter's own Ekadashi decision around verses labelled 46–58.

### What the comparison establishes (not yet an implementation specification)

1. **Tradition/profile is a required input.** Dharmasindhu explicitly distinguishes Vaishnava and Smarta vrata observers and discusses family tradition as relevant to classification. Therefore the project must not silently assume one profile for every visitor.
2. **Arunodaya and sunrise are distinct tests.** The TransLiteral Dharmasindhu Vaishnava text defines arunodaya as four ghatikas before sunrise and says even a brief Dashami presence in that interval matters for the Vaishnava vedha test. Its description separately identifies sunrise vedha for Smarta reckoning.
3. **Tithi length across multiple days changes the decision.** The same passage describes cases involving Ekadashi continuing after the next sunrise, Dvadashi ending before sunrise, both tithis extended, or neither extended. It assigns different outcomes by profile in some cases; this cannot be reduced to “if Dashami touches sunrise, always shift” or a single sunrise-only test.
4. **The primary-text witnesses are not identical rulebooks.** Viramitrodaya has its own long-form discussion and debate, including differences for householders/ascetics in some configurations. Paramapurusha Samhita gives another tradition-specific prescription and should be compared rather than merged silently.
5. **Parana needs its own rule pass.** A decision about which civil date to fast on does not by itself determine the parana window. Dvadashi tithi end, sunrise and Hari-vasara rules need separately sourced and tested handling.

### Provisional decision table for research, not executable logic

| Calendar situation | Research status |
|---|---|
| Ordinary Ekadashi with no relevant Dashami vedha and unambiguous tithi duration | Likely straightforward, but define exact profile and event-window semantics before coding. |
| Dashami present during arunodaya | Dharmasindhu's Vaishnava section treats this as vedha; do not generalize this test to Smarta profile. |
| Ekadashi spans a second sunrise / Dvadashi has unusual duration | Source describes profile-specific outcomes; must model tithi start/end plus each local sunrise, not only the tithi name at one sunrise. |
| Ekadashi kshaya or no clean candidate day | Needs explicit exceptional-case logic and cross-check with a selected edition; no fallback guessed. |
| Parana | Separate specification required: relevant Dvadashi span, local sunrise, Hari-vasara and the tradition's prescribed window. |

### Data and implementation decision

This research supports the existing plan to store named Ekadashi observances separately from the **date-decision profile**. It does not yet justify choosing a single default for the whole site, generating new dates, or changing any legacy record. Before implementation, build a compact decision matrix from a checked edition of Dharmasindhu and Viramitrodaya, test it against trusted almanac examples, and document any remaining lineage-specific disagreements. TransLiteral is a valuable discovery and comparison layer, but its translated/transcribed text should not be treated as a critical edition.


## Shivaratri decision cross-check — 2026-10-14

### Source inspected
- [Nirnayasindhu — शिवरात्रिनिर्णय, TransLiteral](https://www.transliteral.org/pages/z130621065953/view), especially the visible Sanskrit passage and its Marathi translation around lines 122–126.
- [Nirnayasindhu 1.22, VedicPupil transcription](https://vedicpupil.in/library/books/nirnayasindhu/chapter-1/verse-22), used only as an accessible cross-check for the broader point that observance and parana can interact with tithi timing.

### What the Nirnayasindhu transcription actually says
The displayed Shivaratri decision passage explicitly records **more than one cited opinion**: some authorities use Pradosha-vyapini Chaturdashi, while others use Nishitha-vyapini (midnight) Chaturdashi. It then discusses additional conditions around the night, including the Chaturdashi's relation to the preceding Trayodashi and the Nishitha interval. The translation also identifies the month naming distinction between Phalguna Krishna Chaturdashi in a Purnimanta reckoning and Magha Krishna Chaturdashi in an Amanta reckoning.

### Project implications
- Do not reduce this source to “always use Pradosha” or “always use Nishitha” without choosing and documenting the adopted authority/profile.
- Monthly Shivaratri and Maha Shivaratri must remain separate observance profiles until their respective date-selection rules are independently established. A common Chaturdashi label does not prove identical tie-break rules.
- The source is a transcription/translation on TransLiteral; before coding a tie-break rule, verify the exact Sanskrit against a checked print edition or scan and preserve the cited authorities separately.
- The existing legacy record for Maha Shivaratri is not evidence that a complete monthly Shivaratri recurrence already exists. Keep the candidate for Masik Shivaratri open; do not duplicate or rename a legacy entry without reviewing its intended scope.

### Evidence status
The conflict between Pradosha and Nishitha is explicitly visible in the source transcription, so the existence of differing cited positions is supported. The preferred project rule is **not decided**. No date predicate, festival record or live output changed.


## Independent review of Gemini's proposed rules — 2026-10-14

This section records source-checkable corrections to the external Gemini summary. It is an audit note, not an approval to change runtime data or date rules.

### 1. Ekadashi: reject the one-rule summary

The TransLiteral Dharmasindhu page titled **व्रतदिननिर्णय (वैष्णवांचा)** explicitly distinguishes Vaishnava and Smarta observers, says family tradition is relevant to classification, and distinguishes Arunodaya-vedha from sunrise-vedha. It defines Arunodaya as four ghatikas before sunrise and gives different case outcomes when Ekadashi/Dvadashi tithis have different durations. The short claim “Dashami-viddha Ekadashi is rejected for both in the same way” is therefore too broad as an implementation rule.

Sources:
- [Dharmasindhu — Vaishnava vrata-day decision, TransLiteral](https://www.transliteral.org/pages/z80422042154/view)
- [Dharmasindhu — concise vrata-day decision, TransLiteral](https://www.transliteral.org/pages/z80422042403/view)
- [Viramitrodaya — Samayaprakasha, Wikisource](https://sa.wikisource.org/wiki/वीरमित्रोदयः_-_समयप्रकाशः)

**Status:** profile-specific rule matrix required; no automatic exclusion rule approved.

### 2. Sankashti Chaturthi: Chandrodaya rule confirmed, tie-break is not universal

The Wikisource page currently titled [आङ्गिरसस्मृतिः](https://sa.wikisource.org/wiki/आङ्गिरसस्मृतिः) opens at lines 85–86 with “अथ वीरमित्रोदयस्य समयप्रकाशः”; its body is plainly Viramitrodaya-Samayaprakasha text, not an independently verified Angirasa Smriti witness. At lines 875–876 it states “सङ्कष्टचतुर्थी तु चन्द्रोदयव्यापिनी ग्राह्या” and closes the Chaturthi decision section. The same passage discusses observance-specific differences for Vinayaka, Gauri, and other Chaturthi observances, so rules must not be transferred indiscriminately between them.

An independently accessible Sanskrit lexicon entry, [Vाचस्पत्यम्/तान on Wikisource](https://sa.wikisource.org/wiki/वाचस्पत्यम्/तान), reproduces a decision passage at lines 2282–2287: Sankashti should be Chandrodaya-vyapini, but where it is so on both days one opinion chooses the earlier day due to Matri-yoga, while another gives reasons for the later day; if the relevant overlap is absent on both days, it reports a later-day position. This is evidence of a tie-break disagreement, not a single universal predicate.

**Status:** Chandrodaya-vyapini is a strong rule lead; two-day and no-day cases need a selected authority/profile and tests. Do not implement Gemini's categorical “if Moonrise is Tritiya, never observe that day” shortcut.

### 3. Shivaratri: source explicitly preserves competing opinions and exceptional cases

The [Nirnayasindhu Shivaratri decision on TransLiteral](https://www.transliteral.org/pages/z130621065953/view) names both Pradosha-vyapini and Nishitha-vyapini positions, then discusses cases where the relevant overlap occurs on one or both adjacent days. Its own synthesis differentiates cases such as both days having Nishitha overlap, both days having Pradosha overlap, and each day having only one of the overlaps. Therefore “Nishitha is always the sole overriding rule” is not a safe summary of the complete passage.

**Status:** keep the existing decision unresolved until a checked edition and chosen authority/profile are recorded. Keep Masik Shivaratri separate from Maha Shivaratri.

### 4. Units: Pradosha duration claims need precise wording

One ghati is conventionally 24 minutes and one muhurta 48 minutes. Therefore three ghatis are 72 minutes, while three muhurtas are 144 minutes. Gemini's table says “three ghatis / 1 hour 12 minutes”, but the later analysis says “three muhurtas”; those are not equivalent. Do not encode either duration until the adopted source's exact term and the project's intended definition of Pradosha are established.

### 5. Regional observance and broad claims

- Vata Savitri Amavasya and Vata Purnima should be represented as tradition-specific variants only after their sources and intended regions are documented; do not force a single date rule.
- The blanket statement that all Kamya vratas, festivals and consecrations are prohibited in Adhika Masa is too broad to encode without a specific source, scope and exception review.
- Varuni Yoga's exact combination of tithi, nakshatra and weekday must be sourced from a named edition before generating dates.
- A quoted Sanskrit verse without edition/page/chapter and a verifiable passage must remain an unverified quotation, not a source citation.

### Decision

No changes to `data/festivals.json`, executable date rules, legacy festival dates, or Blogger output are authorized by this audit. The next safe step is to build case matrices for Ekadashi, Sankashti and Shivaratri from a chosen edition, then test date-boundary cases separately from textual interpretation.


## Decision matrices — first source-backed pass (2026-10-14)

These matrices separate the **textual rule** from the **calendar input**. They are research aids, not executable specifications. They intentionally preserve unresolved differences rather than choosing an undocumented default.

### A. Ekadashi — profile and tithi-duration matrix

**Sources inspected**
- [Dharmasindhu, Vaishnava vrata-day decision, TransLiteral](https://www.transliteral.org/pages/z80422042154/view), especially the translation around lines 86–90.
- [Viramitrodaya-Samayaprakasha, Wikisource](https://sa.wikisource.org/wiki/वीरमित्रोदयः_-_समयप्रकाशः), visible decision around the Wikisource lines 2286–2390 and exceptional cases around 2462–2536.

| Situation to model | What the consulted text supports | What remains unresolved / required inputs |
|---|---|---|
| Observer/profile | Dharmasindhu distinguishes Vaishnava and Smarta observers and notes family tradition as a relevant classification criterion. | Do not infer the user's sampradaya from geography or one generic site setting. If the site has no profile, display the source's profile and disclose the chosen default rather than hiding it. |
| Dashami touches Arunodaya | Viramitrodaya's Vaishnava section treats Arunodaya-veddha as a Vaishnava-specific test in its stated interpretation; Dharmasindhu says Arunodaya is four ghatikas before sunrise. | Edition/interpretive differences exist: Viramitrodaya also records another view that the vedha tests may apply more broadly. Do not flatten this debate into a universal rule. |
| Dashami touches sunrise | Viramitrodaya discusses sunrise-vedha for Smarta observers and contrasts it with the Vaishnava Arunodaya test. | Need exact tithi start/end, local sunrise and the selected authority/profile. |
| Ekadashi extends past the following sunrise / Dvadashi has unusual duration | Dharmasindhu's examples distinguish cases where Ekadashi or Dvadashi extends beyond sunrise, and outcomes can differ for Smarta and Vaishnava observers. Viramitrodaya enumerates multiple combinations of Ekadashi and Dvadashi being short/equal/long. | A simple “tithi at sunrise” boolean is insufficient. Build a case matrix with precise interval arithmetic, including tithi-kshaya and Dvadashi-vriddhi. |
| Ekadashi disappears and Dvadashi is the observance day | Viramitrodaya cites a Dvadashi fast for the case where Ekadashi is lapsed, while other exceptional cases distinguish householders with children, ascetics and other groups. | Must not generalize one exceptional passage without recording its named authority and target group. |
| Parana / Hari-vasara | The texts treat parana as a separate question; the Vaishnava source lists Dvadashi and Hari-vasara-related constraints. | Separate specification needed for Dvadashi end, local sunrise, Hari-vasara and the adopted profile. A fasting-date decision alone cannot compute parana. |

**Candidate test fixtures (synthetic boundary cases, not real festival dates):**
1. Dashami ends before the profile's relevant vedha window; Ekadashi spans local sunrise; Dvadashi begins later — ordinary candidate.
2. Dashami remains for a small interval at Arunodaya but ends before sunrise — compare Vaishnava and Smarta profiles separately.
3. Dashami ends before Arunodaya, but Ekadashi ends before the next sunrise — test the relevant duration classification.
4. Ekadashi remains after the second sunrise / Dvadashi begins late — exercise “Ekadashi-adhika” style case.
5. Ekadashi is not present on a sunrise candidate day and Dvadashi is present instead — explicit kshaya/fallback case, with householder/ascetic assumptions stated.
6. Dvadashi is shortened or ends before the expected parana interval — parana must be tested independently of the fast-date decision.

No fixture should be converted to production dates until the selected printed edition's rule matrix is transcribed and checked by at least one independent calendar example.

### B. Sankashti Chaturthi — moonrise matrix

**Sources inspected**
- [Viramitrodaya-Samayaprakasha, Wikisource](https://sa.wikisource.org/wiki/वीरमित्रोदयः_-_समयप्रकाशः), Chaturthi decision ending with “सङ्कष्टचतुर्थी तु चन्द्रोदयव्यापिनी ग्राह्या”.
- [Vachaspatiyam, Wikisource](https://sa.wikisource.org/wiki/वाचस्पत्यम्/तान), page text around lines 2281–2287, which quotes differing opinions for the two-day overlap case.

| Local moonrise situation | Source-backed observation | Research disposition |
|---|---|---|
| One civil day has Chaturthi at local moonrise; the adjacent day does not | Chandrodaya-vyapini is the stated core rule in the consulted Viramitrodaya passage. | Strong candidate rule, but verify the exact source edition and event interval semantics before coding. |
| Both adjacent days have Chaturthi at moonrise | Vachaspatiyam's quoted decision records one opinion preferring the earlier day (Matri-yoga rationale) and another preferring the later day based on the other cited timing conditions. | Genuine tie-break disagreement. Require an explicit chosen authority/profile; do not silently choose. |
| Neither day has the simple Chandrodaya overlap | The same passage gives a later-day position in its summarized case. | Needs exact interpretation and independent source check before fallback implementation. |
| Moonrise is close to tithi start/end | The rule depends on the local moonrise instant and tithi interval, not merely the tithi name at midnight or sunrise. | Test interval boundaries, timezone, moonrise calculation and missing/polar moonrise conditions. |
| Other Chaturthi observances (e.g. Vinayaka, Gauri) | The same discussion explicitly warns that rules stated for one special Ganesh observance do not automatically govern Sankashti; the text distinguishes Chaturthi observance types. | Separate observance IDs and predicates. Never reuse the Sankashti rule as a universal “Chaturthi rule”. |

**Candidate test fixtures (synthetic):**
- Chaturthi interval contains moonrise on day 1 only.
- Chaturthi interval contains moonrise on day 2 only.
- Chaturthi interval contains both moonrises.
- Chaturthi interval contains neither moonrise.
- Moonrise occurs within a small configurable tolerance of tithi start/end.
- Moonrise event unavailable or invalid: return “needs manual review”, not a guessed date.

### C. Shivaratri — Maha vs monthly decision matrix

**Source inspected**
- [Nirnayasindhu, Shivaratri decision, TransLiteral](https://www.transliteral.org/pages/z130621065953/view), visible Sanskrit and translation around lines 122–130; monthly observance discussion around lines 150–152.

| Situation | What the consulted Nirnayasindhu transcription says | Research disposition |
|---|---|---|
| Maha Shivaratri, one date has both Pradosha and Nishitha overlap | The passage presents both Pradosha-vyapini and Nishitha-vyapini opinions, and cites several authorities. | Cannot label one criterion universally supreme from the summary alone; record the adopted authority and edition. |
| Nishitha overlap on both adjacent dates | The passage discusses this case and cites a view preferring the earlier date in the stated configuration. | Keep as a separate branch in the decision matrix, not a blanket rule for all cases. |
| Pradosha overlap on both adjacent dates | The source discusses the role of Nishitha overlap in resolving the case. | Needs transcription of the exact Sanskrit conditions and independent edition check. |
| One date has only Nishitha overlap, the other only Pradosha overlap | The source describes this one-each case and its tie-break discussion. | Do not reduce it to “always Nishitha” without documenting which cited authority is being followed. |
| Monthly Krishna Chaturdashi outside the Maha observance | The source has a separate discussion of “प्रतिमासशिवरात्रिव्रत” and says the decision for non-Magha monthly Shivaratri differs from the special Maha-Shivaratri decision; it discusses the four night watches and combined Pradosha/Nishitha overlap. | Monthly Shivaratri needs its own profile and rule. A Maha-Shivaratri predicate must not be copied automatically. |
| Purnimanta vs Amanta month label | The same passage names Phalguna Krishna Chaturdashi under Purnimanta and Magha Krishna Chaturdashi under Amanta reckoning. | Keep observance date and month-label convention as separate data fields. |

**Candidate test fixtures (synthetic):**
1. Pradosha and Nishitha both overlap on the first date only.
2. Both overlap on the second date only.
3. Nishitha overlaps on both dates.
4. Pradosha overlaps on both dates.
5. First date has Nishitha only; second has Pradosha only.
6. Neither date has the required overlap.
7. Run each fixture separately under Maha and monthly profiles; don't reuse a tie-break without source support.

### Evidence and implementation gate

Before executable rules are proposed, each matrix must have:
1. A named printed edition or scan with page/section identifiers.
2. A normalized Sanskrit transcription checked against the page image where OCR is involved.
3. The authority being followed for each disputed case.
4. Unit tests using synthetic tithi/sunrise/moonrise intervals.
5. At least one independent almanac comparison for each profile.
6. A user-facing fallback for unresolved/contradictory cases.

This pass is based on accessible TransLiteral/Wikisource transcriptions. It improves the question set and makes the disagreements explicit, but is not yet a critical-edition-based implementation specification.


## Independent transcription / edition leads — follow-up (2026-10-14)

A further search found an additional Sanskrit transcription of Viramitrodaya-Samayaprakasha maintained at Vishvasa:
- [Vishvasa — Viramitrodaya, Samayaprakasha](https://vishvasa.github.io/kalpAntaram/dharmaH/nibandhaH/vIra-mitrodayaH/samaya-prakAshaH/)

This is useful as a **second digital transcription** for line-by-line comparison with Wikisource, especially the Ekadashi discussion around the printed folio markers {म्व्-स्_६७} and {म्व्-स्_६८}. It is not by itself proof of a different manuscript or edition; the edition/source metadata must be established before calling it an independent textual witness.

Bibliographic leads for print editions:
- [Dharmasindhu, Google Books/Play listing](https://play.google.com/store/books/details/Kasinatha_Up%C4%81dhy%C4%81ya_son_of_Ananta_Upadhyaya_Dharma?id=5aPdZ3OSRpQC) identifies a January 1888 Nirnaya-Sagara Press edition (374 pages). This is a bibliographic lead; its specific Ekadashi pages have not yet been visually checked.
- [Nirnayasindhu, Deccan College catalogue record](https://virasat.dcpune.ac.in/jspui/handle/123456789/35643?etal=0&frontend=frontend&order=desc&query=%5Bquery%3D&rpp=20&searchWord=&sort_by=dc.date.accessioned_dt&start=3480%5D) identifies a 1930 Chowkhamba Sanskrit Series Office edition with commentary, but access is marked subscription-based.
- [Nirnayasindhu, Sanskrit Books listing](https://www.sanskritbooks.com/blog/nirnaya-sindhu-of-jwala-prasad-mishra/) lists a multi-volume Jwala Prasad Mishra edition; use as a scan-finding lead, not a verified text citation.
- [IGNCA Vedanga-Kalpa catalogue PDF](https://ignca.gov.in/PDF_data/Vedanga-Kalpa%28Dharma-Shastra%29-Vol-II-Part-XII.pdf) catalogs several Nirnayasindhu manuscript holdings. This is catalogue evidence, not the text itself.

### Source-quality rule

A digital transcription can corroborate the reading of another transcription, but it does not establish edition independence unless the underlying edition/manuscript is identified. Until then, mark it as “parallel transcription” rather than “independent witness”. The case matrices above remain provisional; no runtime changes follow from these bibliographic leads.


## Second-pass source comparison and next implementation gate — 2026-10-14

### Ekadashi: better edition metadata found, but rule scope still matters

A recent independent explainer, [Shastra Panchangam — Why Ekadashi Falls on Two Different Days](https://shastrapanchangam.com/en/ekadashi/), identifies its source as Dharmasindhu, Kāśīnātha Upādhyāya, pariccheda 1, “athaikādaśīvratadinanirṇayaḥ” and “atha smārtanirṇayaḥ”, pp. 13–14 / leaves 33–34, read from page images, with Swamikannu Pillai's *Indian Chronology* also named. This is a better traceable bibliographic lead than an unattributed quotation, and it independently explains why the Smarta sunrise test and Vaishnava Arunodaya test can select different dates.

The TransLiteral concise Dharmasindhu page also explicitly states that Arunodaya-vedha and sunrise-vedha are two distinct tests and that they correspond respectively to Vaishnava and Smarta decisions; it gives duration-based exceptions, including cases where Ekadashi/Dvadashi have adhika duration. See [Dharmasindhu — concise vrata-day decision](https://www.transliteral.org/pages/z80422042403/view) and [Smarta decision](https://www.transliteral.org/pages/z80422042257/view).

**Revised evidence status:** the profile distinction is strongly corroborated by two accessible presentations and named page/leaf metadata. The exact production algorithm remains unapproved until the cited page images are visually checked and the exceptional-case table is transcribed faithfully. “Independent explainer” is not automatically an independent primary witness.

### Shivaratri: external date-rule summaries do not erase the source's debate

- The [Nirnayasindhu Shivaratri decision, TransLiteral](https://www.transliteral.org/pages/z130621065953/view) explicitly records both Pradosha-vyapini and Nishitha-vyapini opinions, and discusses multi-day overlap cases.
- [SanskritDocuments — festival rules](https://sanskritdocuments.org/incoming/ajit/panchanga/festival_rules.html) summarizes several Maha-Shivaratri tie-break cases and explicitly notes disagreement between Hemadri and Madhava's Nirnayasindhu in a two-night Nishitha-overlap case.
- [Shastra Panchangam — monthly Shivaratri](https://shastrapanchangam.com/en/masik-shivaratri/) describes a Dharmasindhu page-image-based Nishitha rule for monthly Shivaratri, while the Nirnayasindhu text preserves a broader discussion of authorities and special cases.

These summaries are useful for test-case discovery, not a substitute for choosing which authority OurHinduDharm will follow. Maha and monthly Shivaratri should remain distinct profiles, with the chosen authority recorded per rule.

### Rules for the next implementation proposal

1. Do not introduce a universal rule when the selected source names multiple authorities or exceptions.
2. Store the **observance profile**, **source authority**, and **decision rationale** separately from computed tithi intervals.
3. Build tests using exact event instants: tithi start/end, local sunrise, Arunodaya, sunset/Pradosha, Nishitha and local moonrise as applicable.
4. Include expected “manual review / unresolved by selected profile” outcomes for cases not covered by the source matrix; do not silently guess a date.
5. Keep calendar calculations (astronomy) and dharma-nibandha decision logic as separate test layers.
6. Only after page-image verification and independent almanac comparison should the team propose a runtime rule or new festival record.

No production date, JSON record, or live Panchang behavior is changed by this source-comparison pass.


## Interval-based synthetic regression fixtures — research specification (2026-10-14)

Purpose: make the source disagreements testable before any production date rule is proposed. These fixtures are **synthetic**, use abstract local-time intervals, and are not real festival dates. All intervals are half-open `[start, end)`; times are in the observance location's local civil time. A fixture's expected result may intentionally be “unresolved until authority/profile is selected.” The test harness must not silently choose a preferred authority.

### Common fixture fields

Each future test case should record:

- `case_id`, observance family, named observance, and explicit decision profile/authority (e.g. Dharmasindhu-Smartā, Dharmasindhu-Vaiṣṇava, Nirṇayasindhu opinion A/B).
- Local date, timezone identifier/offset, latitude/longitude, sunrise, sunset, and only the relevant event times (Arunodaya, moonrise, Nishitha/Ardharatri, Pradosha interval).
- Start/end instant for each relevant tithi, with an explicit statement whether a boundary is inclusive; normalize astronomical instants before evaluating intervals.
- Expected selected civil date/night, expected rejection/deferral, expected parana window if specified, and a short reason citing the exact source section/page/verse and edition status.
- A test must fail if required event data are missing; do not substitute a fixed clock time, a different city's moonrise, or a generic sunrise rule.

### Ekadashi: profile-separated fixtures

| ID | Synthetic condition | Expected test assertion | Status |
|---|---|---|---|
| EKA-S-01 | Dashami ends before sunrise; Ekadashi spans sunrise | Evaluate the Smarta profile from the selected edition; retain the sunrise predicate in the trace. | Needs print-text confirmation |
| EKA-V-01 | Dashami is still present at Arunodaya but ends before sunrise; Ekadashi spans sunrise | Evaluate the Vaishnava Arunodaya-vedha profile separately from Smarta; do not collapse the two results. | Core distinction supported by consulted transcriptions; exception matrix still needs confirmation |
| EKA-02 | Ekadashi ends before the following sunrise and Dvadashi is short | Do not infer parana solely from the selected Ekadashi date; run the separate profile-specific parana decision. | Needs source/edition rule |
| EKA-03 | Dvadashi spans sunrise and the first quarter/Hari-vasara boundary is within Dvadashi | Parana result must identify sunrise, Dvadashi end, and Hari-vasara boundary; no hardcoded generic window. | Needs primary-text confirmation |
| EKA-04 | Tithi duration falls exactly on a source-defined boundary | Assert the edition's exact boundary convention; if not established, return unresolved rather than guess. | Open |
| EKA-05 | Ekadashi tithi is lost/short or duration configuration matches a special Dharmasindhu case | Dispatch to the documented exception branch; a single boolean “Dashami-veddha” rule must fail this test. | Open; transcribed cases require page verification |

### Sankashti Chaturthi: local moonrise fixtures

| ID | Synthetic condition | Expected test assertion | Status |
|---|---|---|---|
| SAN-01 | Krishna Chaturthi overlaps local moonrise on exactly one candidate day | Select the qualifying day under the explicitly chosen authority/profile. | Core Chandrodaya-vyāpinī lead; source attribution verification pending |
| SAN-02 | Chaturthi overlaps moonrise on both adjacent days | Do not use an undocumented universal tie-break; return separate authority-specific outcomes or unresolved. | Required because consulted transcriptions report differing opinions |
| SAN-03 | Chaturthi overlaps neither candidate moonrise | Enter the source-defined exceptional branch only if verified; otherwise unresolved. | Open |
| SAN-04 | Tithi begins or ends exactly at moonrise | Exercise exact-boundary convention and timestamp precision; no epsilon-based silent shift. | Open |
| SAN-05 | Local moonrise unavailable or astronomical calculation fails | Mark calculation unavailable; never substitute another city or a fixed time. | Engineering invariant |

### Shivaratri: do not conflate monthly and annual profiles

| ID | Synthetic condition | Expected test assertion | Status |
|---|---|---|---|
| SHI-M-01 | Krishna Chaturdashi overlaps Nishitha on only one night | Evaluate the selected monthly-Shivaratri authority's rule; preserve the full Nishitha interval and overlap duration in the trace. | Rule profile needs primary-page confirmation |
| SHI-M-02 | Chaturdashi overlaps Nishitha on both consecutive nights | Compare authority-specific tie-breaks; never assume “later night” or “greater overlap” is universal. | Open; secondary summaries disagree/oversimplify |
| SHI-M-03 | Chaturdashi overlaps Pradosha but not Nishitha | Do not automatically accept/reject without recording which Nirṇayasindhu/Dharmasindhu opinion the profile follows. | Competing opinions explicitly noted in consulted Nirṇayasindhu transcription |
| SHI-M-04 | Chaturdashi overlaps neither candidate Nishitha interval | Apply only a verified source-defined fallback; otherwise unresolved. | Open |
| SHI-M-05 | Purnimanta and Amanta naming labels refer to the same lunation | Preserve naming convention metadata; do not create duplicate astronomical events just because month labels differ. | Naming distinction supported by consulted source |
| SHI-A-01 | Annual Maha Shivaratri case has two Nishitha overlaps | Must run the annual Maha-Shivaratri profile, not reuse the monthly profile by default. | Profile separation required; exact tie-break needs source/page verification |

### Pradosha: window and date-selection are separate outputs

| ID | Synthetic condition | Expected test assertion | Status |
|---|---|---|---|
| PRA-01 | Trayodashi overlaps the configured Pradosha interval on one evening | Report the source-defined evening selection and that evening's weekday. | Needs primary-edition confirmation |
| PRA-02 | Trayodashi overlaps both evenings | Use only a documented source-specific tie-break; do not derive it from the general puja-window definition. | Open |
| PRA-03 | The source says “two ghatis” versus “three muhurtas” | Preserve the literal source unit and its cited definition; never normalize them as equivalent. Two ghatis = 48 minutes; three muhurtas = 144 minutes under the standard 1 ghati = 24 minutes, 1 muhurta = 48 minutes conversion. | Unit mismatch is a blocking issue until source passage is fixed |
| PRA-04 | Sunset-relative interval crosses a civil-date boundary in an unusual location/date | Keep astronomical/local-date calculations explicit; do not let a generic date-only comparison truncate the interval. | Engineering invariant |

### Validation gate before any executable change

1. Replace every “needs verification/open” label only after recording the actual edition, scan/page/leaf, exact passage and context; do not treat a modern explainer's rule summary as a primary witness.
2. Independently check the interval calculations and at least one real worked case per selected profile against a named almanac for the same location and tradition. Record disagreements instead of tuning code to force a match.
3. Make test output explain *why* a date was selected, which profile was used, which event interval qualified, and which exception branch applied.
4. Test boundaries immediately before, exactly at, and immediately after every relevant tithi/event endpoint; include missing-event and invalid-timezone cases.
5. Keep candidate discovery, rule evidence, profile selection, and public display policy separate. No festival JSON or runtime rule should be inferred directly from this synthetic matrix.

Sources consulted for this pass:
- [Dharmasindhu Ekadashi explainer with page/leaf metadata](https://shastrapanchangam.com/en/ekadashi/) — secondary explanation citing pp. 13–14 / leaves 33–34 as page-image checked; verify independently before treating as final.
- [Dharmasindhu Vaishnava decision transcription](https://www.transliteral.org/pages/z80422042154/view) and [Smarta decision transcription](https://www.transliteral.org/pages/z80422042257/view).
- [Nirṇayasindhu Shivaratri decision transcription](https://www.transliteral.org/pages/z130621065953/view).
- [SanskritDocuments festival-rule summary](https://sanskritdocuments.org/incoming/ajit/panchanga/festival_rules.html) — useful comparison only; its own summary records disagreement over annual Maha Shivaratri double-Nishitha cases.
- [Masik Shivaratri secondary rule page](https://shastrapanchangam.com/en/masik-shivaratri/) and [another secondary methodology summary](https://panchangtime.com/methodology/shivaratri) — compare only; not independent primary witnesses.

**Safety boundary:** this is a non-executable test specification. No changes to `data/festivals.json`, runtime JavaScript, legacy dates, Blogger output, or PR merge state are made by this section.
