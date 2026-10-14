# Vrat-Parichay edition comparison — access/status note (draft)

Date checked: 2026-10-14  
Branch: `data/festival-json-foundation`

## Candidate edition located

CiNii Research has a bibliographic record for *व्रत-परिचय / लेखक, हनुमान शर्मा* (also indexed as *Vrata-paricaya / lekhaka, Hanumāna Śarmā*). The record lists:

- Publication year: 1969
- Publisher: Gita Press
- Edition: 4th edition (`4. saṃskaraṇa`)
- Language: Hindi, with Sanskrit quotations
- PDF format listed
- DOI: https://doi.org/10.15026/8617
- CiNii record: https://cir.nii.ac.jp/crid/2120307889746109824
- Handle: http://hdl.handle.net/10108/8617
- Repository record: https://tufs.repo.nii.ac.jp/records/10059

This is a useful candidate for textual comparison, **not an identified match** for the user's OCR edition. The user's edition/imprint/page count is still unknown.

## Access test performed

On 2026-10-14, the CiNii record was readable in search metadata, but opening the full record returned a JavaScript/anti-bot verification page. The TUFS repository record returned HTTP 429 (rate limit) through the available web reader. Direct attempts to open likely PDF/Handle URLs were not accessible through the reader. The exact PDF file URL therefore has **not** been verified, and no page images were obtained in this pass.

Do not treat this as proof that the PDF is unavailable publicly; only the current retrieval route failed. No guessed download URL should be cited as a verified file.

## Safe next route

1. Open the repository record in a normal browser: https://tufs.repo.nii.ac.jp/records/10059
2. Look for the item's file/download section and copy the actual PDF link, if exposed.
3. If the PDF opens, compare its title/imprint and contents first. Only then compare the printed sections corresponding to the OCR's visible page labels: Sankashti (OCR p. 44), Pradosh (p. 54), Vata Savitri (pp. 92–93), Nirjala (p. 97), Ashunya Shayan (pp. 106–107), Mangala Gauri (pp. 115–116), Vaikuntha Chaturdashi (p. 174), Shivachaturdashi (pp. 189–190), Adhimas (pp. 230–234).
4. Record printed-page/image evidence separately from OCR line evidence. A same-title/edition is not enough; check the actual text and page numbering.
5. If the 1969 fourth edition is not the user's edition, use it only as a comparative witness. Do not silently transfer its variants or pagination to the user's source.

## Current decision

- Keep the existing OCR-based audit and confidence caveats.
- Do not resolve the Sankashti two-day tie-break from the secondary source alone.
- Keep the *Vrat-Parichay* multi-month Ashunya Shayan profile distinct from the one-day Purana forms until text is matched.
- No executable date rules or runtime changes are justified by this access attempt.


## Additional public search leads (2026-10-14)

A broader search found two secondary hosting pages that claim to present *Vrat Parichay*:
- Scribd result titled “Vrat Parichay”, described as a 203-page document: https://www.scribd.com/document/245445531/Vrat-Parichay
- Dokumen.pub search result lists a “Vrata Parichaya Gita Press” item among hosted documents: https://dokumen.pub/

These are **discovery leads only**. Search snippets do not establish publication year, edition, completeness, provenance, or whether their page images are lawful/accessible for this comparison. I have not treated either as the 1969 fourth edition, extracted text from them, or used them to settle any ritual rule. The 203-page Scribd viewer count may be viewer pages rather than the printed book's pagination.

The official TUFS repository remains the strongest bibliographic lead because the CiNii record explicitly associates it with the 1969 fourth edition and lists PDF format. Its record and Handle could not be opened by the current retrieval route (rate-limit/access error), and no exact downloadable PDF URL has been verified.

## Comparison gate (unchanged)

Before declaring OCR page-image verified, obtain a readable copy and record:
1. Cover/title page and imprint/edition statement.
2. Printed page number versus PDF/image index mapping.
3. At least one distinctive passage in the contents and body to establish text identity.
4. For each sampled rule, a page image plus a literal transcription of the relevant line(s), with uncertain OCR characters flagged.

Until then, use the user's existing OCR chunks as **text-only evidence** and keep all executable date rules blocked. No live code or festivals.json records changed in this update.


## Major source breakthrough: Internet Archive item identified (2026-10-14)

User supplied two Internet Archive records. The item `https://archive.org/details/vrata-parichaya` is accessible and exposes both a PDF download entry and a full-text OCR transcript:
- Item page: https://archive.org/details/vrata-parichaya
- Full-text OCR: https://archive.org/stream/vrata-parichaya/Vrata%20Parichaya_djvu.txt
- PDF link surfaced by the item page: https://archive.org/download/vrata-parichaya/Vrata%20Parichaya.pdf
- OCR item metadata: 300 PPI, Hindi Tesseract OCR, item size 169.9M.

The accessible OCR front matter identifies the printed book as **संवत् २०७०, चौबीसवाँ पुनर्मुद्रण**, by पं० हनूमान शर्मा, published/printed by गीताप्रेस, गोरखपुर. Therefore this is a concrete, inspectable edition candidate and a much stronger match for comparing text than the inaccessible TUFS lead. It is not the 1969 fourth edition; do not conflate these editions. The user's OCR edition still needs identity comparison, but the public transcript makes targeted textual comparison possible immediately.

First direct textual confirmations from the Internet Archive transcript:
- Contents places Sankashti and Pradosh repeatedly under monthly Krishna/Shukla sections; visible OCR TOC page labels include Sankashti at printed p. 43 for Chaitra, Pradosh p. 53, Vata Savitri p. 91, Nirjala Ekadashi p. 96, Ashunya Shayana p. 106, Mangala Gauri p. 115. OCR digits in the contents can be corrupted; check body context and page images before treating all page numbers as exact.
- Vata Savitri body text explicitly distinguishes Jyeshtha Shukla Purnima (Skanda/Bhavishyottara) from Amavasya (Nirnayamrita etc.) and says Amavasya is commonly followed in the author's region.
- Ashunya Shayana body text explicitly describes Shravan Krishna Dwitiya through Margashirsha Krishna Dwitiya, selects pūrvaviddhā tithi, and gives a tie-break: if both days are pūrvaviddhā or neither is, choose paraviddhā. This is stronger text evidence than before, though page image should still be checked for OCR accuracy.

The second user-provided item `https://archive.org/details/610-vrat-parichay` could not be retrieved by the web reader in this pass (DisabledError). It should be checked separately for edition/imprint differences. The Archive.org OCR is useful for text-level cross-checks now; for image verification use the item's Bookreader/PDF/page-image links and record printed page versus scan index.

No runtime code or festivals.json changed. Keep PR #33 Draft/unmerged. Continue by checking the Archive transcript's priority passages and, where possible, page images; retain edition-specific attribution and do not yet implement date rules.


## User supplied a clearer 1956 Archive.org copy (2026-10-14)

User identified this additional, potentially cleaner scan:
- https://archive.org/details/fkvt_vrat-parichay-by-pandit-hanuman-sharma-hindi-hindu-rituals-1956-gorakhpur-gita-press

The item title identifies it as *Vrat-Parichay*, by Pandit Hanuman Sharma, Hindi, Hindu rituals, 1956, Gorakhpur, Gita Press. The web reader returned `DisabledError` when opening this item, so the metadata, PDF file identifier, OCR transcript, and page images have **not yet been independently inspected** in this pass. Treat 1956 as the title/metadata claim from the user-provided item URL, pending reading the item page/imprint. Do not assume it is the same edition as the संवत् २०७०, चौबीसवाँ पुनर्मुद्रण item at `https://archive.org/details/vrata-parichaya`.

This is now the priority candidate for page-image verification because the user describes it as a clean, clear copy. Next inspect its item metadata and files (PDF, DjVu/XML OCR, page images), confirm the title/imprint page, then map printed page numbers to scan indices and compare priority passages. No executable rule should be finalized from a title alone.
