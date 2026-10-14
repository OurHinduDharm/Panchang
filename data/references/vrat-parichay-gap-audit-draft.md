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

## Immediate high-priority work

1. Build an alias-aware comparison against all 122 `name` and `sourceText.title` fields, including combined titles and linked article text.
2. Expand the audit beyond the first contents pages to later lunar months and the book's specialised-vrat appendices. The book OCR has 50 chunks; this table is deliberately **not exhaustive**.
3. For every confirmed candidate, record: canonical name, aliases, lunar month/paksha/tithi or other trigger, required kala (sunrise, moonrise, madhyahna, pradosh, nishita, etc.), tradition/region scope, printed page, OCR chunk, confidence, and verification status.
4. Add candidates to a review queue first. Only move to `festivals.json` after the rule is understood and tested.

## Source and OCR note

- Reader guide: `data/VRAT-PARICHAY-READER.md`
- OCR source: `data/vrat-parichay.txt`
- Readable chunks index: `data/vrat-parichay-chunks/README.md`
- Contents entries reviewed in this first pass: `data/vrat-parichay-chunks/part-001.txt` and `part-002.txt`
- Source is OCR text. Check the relevant page image/book scan for ambiguous names, Sanskrit quotations, and numerical references before relying on them.
