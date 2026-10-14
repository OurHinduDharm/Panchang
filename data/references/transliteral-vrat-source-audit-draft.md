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
