# Vrat Parichay — Missing-Observance Audit (Draft)

Date: 2026-10-14  
Branch: `data/festival-json-foundation`  
Status: **First-pass candidate list; not approved for runtime use**

## Purpose

Use the contents pages of Gita Press's *Vrat-Parichay* (Pandit Hanuman Sharma; OCR text stored in `data/vrat-parichay.txt`, readable copy in `data/vrat-parichay-chunks/`) to find observances that may be missing from the 122 legacy records in `data/festivals.json`.

This is a **gap-audit queue**, not a claim that every listed item should become a separate public festival. Names and page references below are transcribed from the OCR contents pages and may contain OCR errors. Verify the relevant body text and tradition-specific decision before creating an executable rule. Page numbers refer to the printed page numbers shown in the book's contents, not the chunk number.

## Important guardrails

- Do not change or bulk-shift the copied legacy dates as part of this audit.
- “Possible gap” means no clear standalone match was identified in the current 122 titles; inspect aliases and combined entries before adding.
- Monthly observances such as Ekadashi, Pradosh, Sankashti Chaturthi, Amavasya and Purnima may be recurring instances of a rule family, not 12 or 24 unrelated hard-coded events.
- Distinguish the **tithi interval**, **observance-date decision**, and **puja/parana time**. A tithi may span civil dates.
- The book contains many specialised, wish-specific, health-related and long-duration vows. This first pass prioritises calendar observances and does not imply that every specialised vrat belongs in the main festival widget.
- Do not treat a book's mention as proof of a universal practice. Keep source, tradition/scope, and confidence fields.

## First-pass candidates from the contents pages

| Book section / printed page | Observance named in OCR contents | Initial comparison with current 122 records | Next action |
|---|---|---|---|
| Chaitra Krishna, p. 43 | Sankashti Chaturthi Vrat | Candidate for recurring-rule catalog; current records do not clearly model the monthly observance family | Check if a monthly Sankashti rule should be shown as a recurring observance |
| Chaitra Krishna, p. 48 | Krishna Ekadashi | Covered only in part by named Ekadashi records; no full month/paksha catalog yet | Add to Ekadashi catalog work, not as a duplicate fixed-date record |
| Chaitra Krishna, p. 52 | Varuni Yoga | Possible gap | Verify whether the book defines a specific yoga/date condition and whether it is suitable for the main widget |
| Chaitra Krishna, p. 53 | Pradosh Vrat | Candidate for recurring-rule catalog; no complete two-paksha monthly rule catalog yet | Document Pradosh-vyapini decision and regional edge cases |
| Chaitra Krishna, p. 55 | Kedara Darshan; Chaitri Amavasya; Pitri Vrat | Possible gaps / alias checks | Read body text; decide whether these are separate observances or supporting labels |
| Chaitra Shukla, p. 65 | Panchratra | Possible gap | Inspect duration and start/end rules before deciding on public display |
| Chaitra Shukla, p. 68 | Ashok-kalika-prashan Vrat; Nam Saptami; Surya Vrat | Possible gaps | Review relevance and source rule; avoid adding a title without a date predicate |
| Chaitra Shukla, p. 72–73 | Chaitri Purnima; Tithish Pujan; Hanumat Vrat | Purnima may be covered only as a date/season entry; Hanuman Jayanti exists but this specific vrat may differ | Verify identity and scope; do not merge merely because names overlap |
| Vaishakh Krishna, p. 78 | Vaishakh Snan; Chandika Navami | Possible gaps | Check whether Vaishakh Snan is a month-long observance with start/end dates |
| Vaishakh Shukla, p. 82–83 | Nimb Saptami; Kamal Saptami; Sharkara Saptami; Vaishakhi Ashtami | Possible gaps | Verify text and recurrence conditions |
| Vaishakh Shukla, p. 84–89 | Madhusudan Puja; Kamdev Vrat; Putrada Pradosh; Kadali Vrat; Vaishakhi Vrat | Possible gaps / possible relation to existing Pradosh | Review each separately; avoid merging wish-specific vrats into generic Pradosh |
| Jyeshtha Shukla, p. 91–98 | Vat Savitri Vrat; Karveer Vrat; Ganga Pujan; Nirjala Ekadashi; Panchapatra Vrat; Bilva-triratri Vrat | Vat Savitri and Ganga observances need alias check; Nirjala Ekadashi belongs in Ekadashi catalog; others possible gaps | Map aliases, then verify source and tithi rules |
| Ashadha Shukla, p. 100–105 | Skanda Shashthi; Vivasvan Vrat; Swapan Mahotsav; Kokila Vrat; Ambika Vrat; Shivashayan Vrat; Vyas Puja/Purnima | Rath Yatra and Vyas Puja/Purnima already have likely matches; other names need checking | Preserve existing matches; queue only unmatched items |
| Shravan Krishna, p. 106–115 | Ashunya Shayan Vrat; Kajjali Teej; Swarna Gauri Vrat; Sheetala Saptami; Kumari Puja; Mangala Gauri Vrat | Possible gaps / alias checks | Determine which are annual, weekday-based, or region-specific |
| Shravan Shukla, p. 110–114 | Durva Ganapati; Papanashini Saptami; Durga Vrat; Pavitrarpan Vidhi; Dadhivrat; Shravan Pujan; Rishi Tarpan | Nag Panchami and Raksha Bandhan are present; others possible gaps | Inspect whether each is a public observance, ritual component, or a regional practice |
| Bhadrapada Krishna, p. 117–121 | Bahula Vrat; Chandra Shashthi; Putra Vrat; Uma-Maheshwar Vrat; Goga Navami; Vats Dwadashi; Kushagrahani | Janmashtami and Kalashtami have matches; several possible gaps | Check local/region scope and aliases before adding |
| Bhadrapada Shukla, p. 122–131 | Maun Vrat; Shiva Chaturthi; Surya Shashthi; Champa Shashthi; Phal Saptami; Muktabharan; Durvashtami; Mahalaxmi Vrat; Nanda Navami; Dashavatar Vrat; Anant Vrat; Pali Vrat; Kadali Vrat | Rishi Panchami and Ganesh-related entries exist; remaining names need individual matching | Preserve Ganesh Chaturthi identity; do not split or reject a combined title solely due to alias wording |
| Ashwin Shukla, p. 134–150 | Navratri Vrat; Upang Lalita; Bilva Nimantran; Bilva Saptami; Saraswati Shayan Saptami; Mahashtami; Mahanavami; Bhadrakali Vrat; Aparajita Puja; Kojagar Vrat; Sharad Purnima | Navratri, Vijayadashami, Kojagari/Sharad Purnima already have matches; some stage-specific pujas may be missing | Model stages independently only when source/rule justifies them; keep the user's 17/18 Oct Saptami note intact |
| Kartik Krishna, p. 152–160 | Karak Chaturthi; Dasharath Puja; Dampatya Ashtami; Govats Dwadashi; Neerajan Dwadashi; Yama Deepdan; Rup Chaturdashi; Yama Tarpan; Deepdan; Kaumudi Mahotsav; Lakshmi Pujan | Karwa Chauth, Govats Dwadashi, Dhanteras, Narak Chaturdashi, Diwali/Lakshmi Puja already have related matches | Alias-check and retain multiple rituals/labels where meaning differs; do not duplicate automatically |
| Kartik Shukla, p. 161–176 | Govardhan Puja; Annakut; Yama Dwitiya; Jaya Panchami; Gopashtami; Prabodhini Ekadashi; Bhishma Panchak; Tulsi Vivah; Vaikuntha Chaturdashi | Several are already present; Jaya Panchami, Gopashtami, Bhishma Panchak and Vaikuntha Chaturdashi need checking | Mark present items as matched; add only confirmed gaps |



## Expanded contents review: Margashirsha through Phalguna

The remaining monthly contents in OCR chunk `part-002.txt` include the following. This is a triage list, not a recommendation to create one calendar card per title.

| Book section / printed page | OCR contents candidates | Initial disposition |
|---|---|---|
| Margashirsha Krishna, pp. 177–179 | Sankashti Chaturthi; Anagha Vrat; Bhairava Jayanti; Kalashtami; Krishna Ekadashi; Pradosh; Gauri Tap Vrat | Sankashti, Ekadashi and Pradosh belong to recurring-rule families; Kalashtami and Bhairava Jayanti have a likely related record (festival-027/049); Anagha and Gauri Tap need review |
| Margashirsha Shukla, pp. 180–189 | Pitri Pujan; Var Chaturthi; Nag Panchami; Shri Panchami; Skanda Shashthi; multiple Saptami vows; Shukla Ekadashi; Ananga Trayodashi; Pishach Mochan Yatra; Shiva Chaturdashi | Separate calendar observances from specialised vows; check the existing Vasant Panchami, Ekadashi and monthly observance model before adding |
| Pausha Krishna, pp. 191–192 | Sankashti Chaturthi; Ashtaka Shraddha; Rukmini Ashtami; Krishna Ekadashi; Surupa Dwadashi | Recurring families plus possible Rukmini Ashtami / Ashtaka Shraddha gaps; verify source body and regional usage |
| Pausha Shukla, pp. 192–195 | Arogya Vrat; Vidhi Puja; Ubhaya Saptami; Martanda Saptami; Mahabhadra; Jayanti Ashtami; Shukla Ekadashi; Sujanma Dwadashi; Ghr̥ta Daan; Virupaksha Pujan; Ishanaka Vrat | Mostly specialised or ambiguously OCR-transcribed entries; hold for body-text verification |
| Magha Krishna, pp. 196–201 | Magha Snan; Vakratunda Chaturthi; Sankashti Chaturthi; Sarvaptisaptami; Krishna Ekadashi; Maghi Amavasya; Ardhodaya; Patra Daan | Magha Snan is a seasonal/month-long observance; Sankashti/Ekadashi recurring families; verify Ardhodaya condition and Amavasya alias |
| Magha Shukla, pp. 202–209 | Varada Chaturthi; Gauri Vrat; Dhundhi Puja; Angaraka Chaturthi; Ganesh Vrat; Shri/Vasant Panchami; Mandar Shashthi; Daridryahar Shashthi; Bhanu/Ratha/Putra/Saptasaptami; Bhishma Ashtami; Til Dwadashi; Bhima Dwadashi; Magha Purnima | Vasant Panchami, Ratha Saptami and Bhishma Ashtami have related records (festival-042/046/044); other Ganesh/Saptami observances need identity checks rather than automatic merges |
| Phalguna Krishna, pp. 210–216 | Sankashti Chaturthi; Janaki Vrat; Krishna Ekadashi; Pradosh; Shivaratri; Masik Shivaratri; Phalguni Amavasya | Maha Shivaratri exists (festival-050); Masik Shivaratri is a separate recurring family; other items need recurrence/alias decisions |
| Phalguna Shukla, pp. 216–225 | Payo Vrat; Madhuka Tritiya; Avighnakara Vrat; Manoratha Chaturthi; multiple Saptami vows; Lakshmi-Sita Ashtami; Budhashtami; Anand Navami; Shukla Ekadashi; Papnashini/Sugati/Sukriti Dwadashi; Nanda Trayodashi; Maheshwar Vrat; Phalguni Purnima; Holika Dahan | Holika Dahan exists (festival-052); Ekadashi is a recurring family; the other named vows require scope and body-text checks |
| Appendix: Adhimas, pp. 230–233 | Adhimas; Adhimas Vrat; Purushottam Maas Vrat; Malmas Vrat; Adhimas Archana | A distinct intercalary-month rule family; do not hard-code a date until the month definition and observance range are specified |
| Appendix: Sankranti, pp. 234–241 | Sankranti; Sankranti Vrat; Sankraman; Mahajaya, Dhan, Dhanya, Bhoga, Rupa, Tejah, Ayuh Sankranti; Mesha-Surya Vrat | Rule-family candidates. Solar ingress timing and observance-day choice need their own rule specification |
| Appendix: Ayana and Paksha, pp. 241–242 | Ayana Vrat; Paksha Vrat | General periodic observances; inspect body text before public display |
| Appendix: weekday, tithi and Panchanga vows, pp. 242–260 | Sunday, Monday (including Shravan Monday), Tuesday, Wednesday, Thursday, Friday and Saturday vows; Tithi-vara-nakshatra Vrat; Nakshatra, Yoga, Karana, Bhadra and Vishti Vrat | Strongly related to a future rule/reference catalog, but not all are festival-card candidates. Do not confuse a vrata described in the book with an instruction to expose every Panchanga factor as a festival |
| Appendix: miscellaneous vows, pp. 261–276 | Mauna Vrat; Laksha Puja/Tulasi/Pranama/Pradakshina/Varti vows; Ashvattha Upanayana/Pradakshina; Dwadasha-Masa Vrat; eclipse-related vows; Savitri and Ashvattha vows | Mostly vow-practice catalog, not date-list additions; eclipse-related observances must reuse the existing eclipse event source and separate visibility from ritual guidance |
| Appendix: expiatory vows, pp. 279–290 | Prajapatya, Krichchhra, Santapana, Chandrayana and related prayashchitta vows | Exclude from the public festival widget by default; document separately only if a future vrata reference section is explicitly planned |
| Separate disease/affliction-vow section, OCR chunk `part-003.txt`, printed pages about 298 onward | Contents list many disease-specific vows, e.g. fever, digestion, skin, eye, ear and other conditions | Not a medical advice feature and not a festival-calendar gap list. Keep out of the Panchang festival feed; OCR and source interpretation require careful review |

## What the expanded review changes

- The book's contents extend well beyond annual festival names: it includes recurring lunar observances, month-long practices, solar-ingress vows, weekday vows, Panchanga-factor vows, prayashchitta and specialised vows.
- Therefore, a simple “book title absent from 122 titles = missing festival” comparison would produce false positives. The matching inventory separates **same/likely alias**, **related but not equivalent**, **recurring rule family**, and **not a main-widget candidate**.
- Chunk references are recorded as OCR locations, not page-image verification. For the ambiguous OCR spellings and any rule that would affect a date, verify the relevant body passage and source scan before implementation.

## Next validation steps

1. Complete alias-aware matching against `name`, `sourceText.title`, descriptions and linked article labels in all 122 records.
2. Read body text for the high-priority candidates; record exact printed page and OCR chunk.
3. Keep recurring observance rules separate from annual event records and separate tithi intervals from decision dates and puja/parana times.
4. Keep all findings as draft review material until source-based predicates and regression tests exist.

## Source and OCR note

- Reader guide: `data/VRAT-PARICHAY-READER.md`
- OCR source: `data/vrat-parichay.txt`
- Readable chunks index: `data/vrat-parichay-chunks/README.md`
- Monthly contents reviewed: `part-001.txt` and `part-002.txt`; specialised disease/affliction contents sampled in `part-003.txt`.
- This review is based on OCR text, not page-image verification. The contents may contain recognition errors; do not treat it as an exhaustive scholarly edition.
