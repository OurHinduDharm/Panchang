# Vrat-Parichay source-evidence ledger (draft)

Date: 2026-10-14  
Branch: `data/festival-json-foundation`  
Status: **Evidence extraction and cross-check only — not approved for runtime rules**

## Scope and source limits

This ledger records what can be read in the repository's OCR chunks, distinguishes the book's own statements from secondary online cross-checks, and flags conflicts rather than silently choosing a rule. The accessible OCR was generated from `data/vrat-parichay.txt` and split into `data/vrat-parichay-chunks/part-001.txt` … `part-050.txt`. Chunk offsets are not printed page numbers. The printed page labels below are the page labels visible in the OCR itself.

**Still missing:** a verified title/copyright/edition page and visual inspection of the corresponding printed page images. Thus page numbers below are transcribed OCR page labels, not independently image-verified pagination. OCR spelling is not treated as a diplomatic transcription.

## Evidence ledger

### VR-01 — Sankashti / Sankatahara Chaturthi

**Primary working source:** *Vrat-Parichay* OCR, cited authorities vary by passage: Bhavishya Purana / Bhavishyottara; a verse is attributed to Brihaspati in one passage.

- `part-006.txt`, printed p. 44: says Sankashti is observed on Krishna Chaturthi in every month and takes the Chaturthi that prevails at moonrise. If moonrise-vyapini Chaturthi occurs on both days, this passage says to observe the first day.
- Same passage quotes: “चतुर्थी गणनाथस्य मातृविद्धा प्रशस्यते। मध्याहनव्यापिनी चेत् स्यात् परतश्चेत् परेऽहनि॥” and attributes it to Brihaspati. This is not the same explicit tie-break sentence as the prose immediately before it; its context and interpretation require source-page verification.
- `part-010.txt`, printed p. 79: again says monthly Krishna Chaturthi, Chaturthi prevailing until moonrise; if it does so on both days, says to follow “मातृविद्धा प्रशस्यते” and observe the tithi joined with Tritiya.
- `part-012.txt`, printed p. 108: the Shravan section says if moonrise-vyapini Chaturthi occurs on both days or on neither, take the **पूर्वविद्धा** tithi.
- `part-015.txt`, printed p. 118: a monthly repetition says Krishna Chaturthi with moonrise-vyapini tithi, but refers back to the earlier detailed rule.

**Decision:** the recurring family and the moonrise predicate are strongly supported by the book. The double-day/no-day tie-break is internally inconsistent across passages and must remain a named source/profile variant pending page-image review and comparison with the cited authority. Do not implement one universal tie-break from these OCR snippets.

**External cross-check:** a page quoting Mudgala Purana, Khaṇḍa 4, Adhyāya 4, verses 10 and 13 gives moonrise as the primary predicate and Pradosha-vyapini Caturthi as a fallback when moonrise Caturthi is unavailable: https://drikganita.com/festivals/sankashti-dwijapriya/2026 . This is useful as a lead to the quoted primary text, not proof that every tradition follows that fallback or that it resolves the *Vrat-Parichay* disagreement.

### VR-02 — Pradosha Vrat

**Primary working source:** *Vrat-Parichay* OCR.

- `part-007.txt`, printed p. 54, “प्रदोषव्रत (स्कन्दपुराण)”: says each month's Krishna and Shukla Trayodashi is observed; gives the time as sunset through two ghatis of night, quoting “प्रदोषोऽस्तमयादूर्ध्वं घटिकाद्वयमिष्यते” attributed to Madhava, and immediately also gives a three-ghati reading attributed to a Gauḍa text.
- `part-010.txt`, printed p. 73: repeats that the vrata occurs on Shukla and Krishna Trayodashi each month and says to worship Shiva at sunset.
- `part-011.txt`, printed p. 80: repeats both pakshas' Trayodashi and says to complete the meal before two or three ghatis of night have elapsed.
- `part-012.txt`, printed p. 110: again says it occurs on every Trayodashi; gives a Shravan-specific note that Soma-Pradosha is particularly fruitful.
- `part-010.txt`, printed p. 86, contains a separate desire-specific vrata starting on a weekday-qualified Shukla Trayodashi (e.g. Saturday for a son, Tuesday for debt relief, Friday for marital prosperity, Sunday for longevity/health). This is a distinct *kāmya* practice and should not be collapsed into the generic twice-monthly Pradosha rule.

**Decision:** model the ordinary vrata as two pakshas per lunar month with local sunset/Pradosha overlap, but preserve the source's competing two-ghati and three-ghati definitions as authority/profile metadata. A general festival display may state the observance day; a puja time should only be calculated once the chosen Pradosha window is explicit. The weekday-specific kāmya vrata is a separate rule family.

**External cross-check:** Drik Panchang describes the date decision as Trayodashi overlapping local Pradosha after sunset and notes location-specific differences: https://www.drikpanchang.com/vrats/pradoshdates.html . PanchangTime discusses a Pradosha-vyapini rule and attributes it to Dharma/Nirnaya Sindhu, but is a secondary methodology page, not the edition-level primary evidence needed here: https://panchangtime.com/methodology/pradosh-vrat .

### VR-03 — Vata Savitri / Vat Savitri

**Primary working source:** `part-012.txt`, printed p. 92–93.

The book explicitly distinguishes two traditions: Jyeshtha Shukla Purnima according to Skanda and Bhavishyottara; Amavasya according to Nirnayamrita and related authorities. It says Amavasya is the common practice “in this country” as described by the author. The procedure starts on Jyeshtha Krishna Trayodashi in the three-day form; where unable, the text describes a shorter alternative, with completion tied to the Amavasya/Purnima tradition. The following page describes worship of Savitri/Satyavan and the banyan tree.

**Decision:** do not resolve this to one universal date. Preserve at least two explicit profiles (Purnima and Amavasya), with regional/sampradaya selection or a carefully labelled tradition note. Do not treat the fortnight difference as an amanta/purnimanta naming artifact.

**External cross-check:** the secondary page at https://sanatana.ekatantra.com/rituals/vat-savitri-vrata also notes the Purnima/Amavasya split and cites the Mahabharata, Skanda Purana, Bhavishya Purana, Hemadri and Nirnaya Sindhu. It is corroborative context only; exact editions and regional scope remain to be verified.

### VR-04 — Nirjala Ekadashi

**Primary working source:** `part-013.txt`, printed p. 97.

- Heading identifies “निर्जलैकादशीव्रत (महाभारत)” and places it on Jyeshtha Shukla Ekadashi.
- The passage gives the strict no-water observance, with a stated exception for ritual ācamana in the OCR prose; it describes bathing and giving a water-filled pot/gifts on Dvadashi.
- A Sanskrit verse is cited as “हेमाद्रौ-महाभारते व्यासवचनम्”: “वृषस्थे मिथुनस्थेऽर्के शुक्ला ह्येकादशी भवेत्। ज्येष्ठे मासि प्रयत्नेन सोपोष्या जलवर्जिता॥ … संवत्सरस्य या मध्ये एकादश्यो भवन्त्युत् तासां फलमवाप्नोति …” (OCR punctuation/reading needs image check).

**Decision:** the name-to-month/paksha mapping is clear. The **date decision and parana must be delegated to the separate Ekadashi engine**, including its independently verified Smarta/Vaishnava profiles, Dashami-vedha/Arunodaya logic and local sunrise. Do not let the “one Nirjala equals the year's Ekadashis” devotional claim become a date algorithm. Do not display strict fasting instructions as medical advice or imply every user must follow the most austere form.

### VR-05 — Ashunya Shayana Vrat

**Primary working source:** `part-014.txt`, printed p. 106–107.

The passage labels it “अशून्यशयनव्रत (भविष्यपुराण)” and states it runs from Shravan Krishna Dwitiya through Margashirsha Krishna Dwitiya. It says to take Purvaviddha tithi; if both days are Purvaviddha or neither is, take Paraviddha. It describes Vishnu/Narayana reclining with Lakshmi on Shesha, evening worship and moonrise arghya; the text then says to repeat it on each Krishna Dwitiya and gives a concluding gift/closure on Margashirsha Krishna Tritiya.

**Decision:** represent this as a duration/series rule with one observance instance per Krishna Dwitiya across the stated months, plus a separate closing action on the following Tritiya. The source's “पूर्वविद्धा” definition, endpoint inclusivity, and whether the named Purana attribution matches the printed edition need image/source verification before implementation. Do not reduce this to one annual festival card or a one-day event.

**External cross-check:** a modern page for Matsya Purana, chapter 71, identifies an Ashunya Shayana observance on Shravan Krishna Dwitiya: https://vedapath.app/hi/matsya-purana/the-asunyasayana-vrata-worship-of-visnu-for-marital-harmony . This is a useful parallel, but it does not by itself establish that the full multi-month procedure in *Vrat-Parichay* is identical to that chapter.

### VR-06 — Mangala Gauri Vrat

**Primary working source:** `part-015.txt`, printed p. 115–116.

The text attributes the vrata to Vratraja and Bhavishya Purana. It describes a married woman observing it on every Tuesday in Shravan for five years after marriage; the first Shravan is at her parental home and the following four at her marital home. It includes a five-year sankalpa and detailed puja procedure.

**Decision:** classify as a life-stage/household practice profile, not a universal public festival for every visitor. If later surfaced, make the multi-year context explicit and avoid assuming all Tuesday instances apply to all users. Regional scope and whether the full five-year prescription is consistent across editions require verification.

### VR-07 — Adhika Masa / Purushottama Masa

**Current evidence:** `part-002.txt`, contents pages only, lists “अधिमास” (printed p. 230), “अधिमासव्रत” (p. 232), “अधिमासव्रत २” (p. 232), “पुरुषोत्तममासव्रत” (p. 233), “मलमासव्रत” (p. 233), and “अधिमासीयार्चनव्रत” (p. 233).

**Decision:** contents prove these are distinct headings, not their detailed rules. Read body passages and define the astronomical/intercalary-month predicate from a verified calendar source before implementation. Never hard-code Gregorian spacing or assume every heading is a separate public festival card.

### VR-08 — Masik Shivaratri / Shivachaturdashi

**Current evidence:** `part-002.txt` contents include “शिवचतुर्दशीव्रत” at printed p. 189 and list monthly Krishna Chaturthi/Ekadashi/Pradosha patterns elsewhere. The current legacy record for Maha Shivaratri does not establish that the monthly vow is covered.

**Decision:** likely a distinct recurring family, but its full passage and tithi/time predicate have not yet been extracted in this evidence pass. Do not implement or alias it to Maha Shivaratri yet.

### VR-09 — Vaikuntha Chaturdashi

**Current evidence:** `part-002.txt` contents list “वैकुण्ठचतुर्दशी” at printed p. 174. Body passage not yet extracted in this evidence pass.

**Decision:** a possible distinct observance, not automatically Dev Deepawali or Mokshada Ekadashi. Extract the full passage and compare with the legacy linked article before making an alias or new record.

## Cross-cutting implementation requirements

1. Keep **tithi interval**, **chosen observance date**, **ritual time window**, and **parana/closure** as separate data.
2. Store source attribution at the rule/profile level; when the book itself cites different authorities, do not merge their rules into one unlabelled predicate.
3. For sunrise/sunset/moonrise-based rules, use the selected location and local timezone. Never infer a date from tithi name alone.
4. Before executable code: visually verify the printed page, record edition details, settle the intended tradition/profile, write worked examples, and add boundary regression tests.
5. No `festivals.json` records, legacy dates, article URLs, eclipse calculations, runtime code, or Blogger output were changed by this evidence pass.

## External research links consulted

- Sankashti quotation and fallback attributed to Mudgala Purana: https://drikganita.com/festivals/sankashti-dwijapriya/2026
- Pradosha location/time window cross-check: https://www.drikpanchang.com/vrats/pradoshdates.html
- Pradosha rule discussion (secondary): https://panchangtime.com/methodology/pradosh-vrat
- Vata Savitri regional forms (secondary): https://sanatana.ekatantra.com/rituals/vat-savitri-vrata
- Ashunya Shayana parallel (secondary transcription): https://vedapath.app/hi/matsya-purana/the-asunyasayana-vrata-worship-of-visnu-for-marital-harmony

