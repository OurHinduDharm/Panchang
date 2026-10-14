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
