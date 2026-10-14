# एकादशी मूल-स्रोत समीक्षा: निर्णयसिन्धु और धर्मसिन्धु

तारीख: 2026-10-14  
शाखा: `data/festival-json-foundation`  
स्थिति: **SOURCE AUDIT — अभी कोई नियम VERIFIED नहीं**

## 1. जाँचे गए ऑनलाइन स्रोत

1. **निर्णयसिन्धु, प्रथम परिच्छेद — वेधाचा निर्णय (मराठी अनुवाद/टीका सहित):**  
   https://www.transliteral.org/pages/z130515050414/view
2. **निर्णयसिन्धु, प्रथम परिच्छेद — एकादशीव्रत (मराठी अनुवाद/टीका सहित):**  
   https://www.transliteral.org/pages/z130515050924/view
3. **निर्णयसिन्धु, प्रथम परिच्छेद — आठ महाद्वादशी (मराठी अनुवाद/टीका सहित):**  
   https://www.transliteral.org/pages/z130515051434/view
4. **निर्णयसिन्धु, Chapter 1, VedicPupil transcription:**  
   https://vedicpupil.in/library/books/nirnayasindhu/chapter-1
5. **धर्मसिन्धु, Chapter 5, condensed English translation:**  
   https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=5

**Edition caveat:** TransLiteral pages give Sanskrit in joined/compact form and Marathi commentary; the web page does not fully establish the printed edition/variant lineage. VedicPupil itself notes that some page text is omitted when its reading is unsettled. The Dharma Sindhu page is a condensed English translation. These are valuable research locators, but not yet a critical-edition verification.

## 2. Arunodaya — what the consulted Nirnayasindhu passage actually says

TransLiteral's “Vedhacha Nirnaya” displays this Sanskrit passage (spacing normalised for readability; punctuation supplied):

> तत्र दशमीवेधो द्वेधा अरुणोदयवेधः सूर्योदयवेधश्चेति ।
> आद्यौ गारुडे — दशमीशेषसंयुक्तो यदि स्यादरुणोदयः नैवोपोष्यं वैष्णवेन तद्धि नैकादशीव्रतमिति ।
> ... उदयात् प्राक् चतस्रस्तु घटिका अरुणोदयः ...

Its Marathi explanation says:
- Dashami-vedha is discussed in two categories: Arunodaya-vedha and Suryodaya-vedha.
- The cited Garuda-Purana statement says that if Dashami remains at Arunodaya, a Vaishnava should not fast on that Ekadashi in the described rule.
- It cites the Madhaviya/Skanda definition of Arunodaya as four ghatis before sunrise.
- It discusses other statements about Ekadashi spanning two muhurtas before sunrise, and interprets them through a harmonisation method (उपसंहारन्याय).

### What may be concluded
- This passage supports treating Arunodaya-vedha and Suryodaya-vedha as **different conditions**, not one generic “Dashami-vedha” boolean.
- A four-ghati Arunodaya definition is explicitly cited here, but the passage also discusses other wording and harmonisation. The implementation should therefore retain a source/policy identifier for the definition rather than silently treating all traditions as identical.
- The specific Vaishnava outcome belongs to the cited source's context. It must not automatically be copied into every Vaishnava lineage or the Smarta profile.

### What may NOT yet be concluded
- It does not by itself establish a complete Smarta-vs-Vaishnava date-selection algorithm.
- It does not validate the Dharma Sindhu English summary's 57/60-ghati figures as universal thresholds. Their counting reference and textual context still need a reliable edition-level comparison.
- It does not settle cases where Ekadashi spans two sunrises, is absent at sunrise, or Dvadashi is short/extended.

## 3. Parana and Mahadvadashi — source nuance found

TransLiteral's “Aath Mahadvadashi” page attributes the eight Mahadvadashi definitions to Nirnayasindhu and gives these names/conditions in its Sanskrit/Marathi rendering:
- उन्मीलिनी — शुद्धाधिक एकादशी से जुड़ी द्वादशी
- वंजुली — शुद्धाधिक/वृद्धि वाली द्वादशी का विशेष मामला
- त्रिस्पृशा — तीन तिथियों के स्पर्श वाला विशेष क्रम
- पक्षवर्धिनी — पक्ष के अंत तक आगे की तिथियों की वृद्धि से जुड़ी स्थिति
- जया — पुष्य नक्षत्र
- विजया — श्रवण नक्षत्र
- जयन्ती — पुनर्वसु नक्षत्र
- पापनाशिनी — रोहिणी नक्षत्र

**Important:** These short descriptions are not yet formal machine conditions. Exact tithi boundaries, sunrise relationships and textual scope need to be converted into explicit predicates only after comparison with the source passages.

The same page also preserves a real Parana discussion:
- One cited view says to pass the first quarter of Dvadashi, called Hari-vasara, before Parana.
- Another view says that if Dvadashi is long, Parana should still be in the morning's first six ghatis.
- The commentary attributed to the author's teachers argues for Parana in Aparahna when Dvadashi is long, to avoid displacing many other prescribed activities; it interprets “morning” in the cited statement as capable of meaning Aparahna in context.
- For a very short Dvadashi or a conflict (e.g. Trayodashi shraddha/Pradosha), the text gives separate discussion and cites a water-Parana provision in the crisis case.

### Decision
These are **recorded competing views and scoped exceptions**, not permission to pick one automatically. Do not hard-code “always wait until Hari-vasara ends”, “always finish before Dvadashi ends”, “always morning”, or a water/Tulasi fallback as a single universal rule until the passage, authority, and tradition scope are resolved.

## 4. Normal case: still not verified

A normal case for this engine must be defined precisely, for example:
- Ekadashi tithi is present at the selected local sunrise;
- Dashami is not present at the relevant Arunodaya under the selected definition;
- no relevant tithi is skipped/duplicated across local sunrises;
- no Mahadvadashi trigger applies;
- no lineage-specific exception is active.

This is a **test input definition**, not yet the verified religious rule that chooses the observance date. The final selection must still be tied to a complete Nirnayasindhu/Dharmasindhu passage and its tradition scope.

## 5. Decision log updates proposed by this audit

- **SOURCE-02:** Keep Arunodaya-vedha and Suryodaya-vedha as separate predicates.
- **SOURCE-03:** Store Arunodaya definition as an explicit source/policy field; do not silently globalise it.
- **PARANA-01:** Preserve the source's competing Parana views and exception cases; no universal fallback.
- **MAHA-01:** Keep all eight Mahadvadashi types as separate candidate rule IDs; do not derive one trigger from the name alone.
- **NORMAL-01:** Do not mark the normal date-selection rule verified until the full selection passage is reviewed.

## 6. Next research step

1. Obtain/compare a reliable printed Sanskrit edition or scan for Nirnayasindhu Pariccheda 1, Ekadashi Nirnaya (contents indicate around p. 25) and the Arunodaya-vedha section (around p. 27).
2. Compare the exact clauses with Dharma Sindhu Chapter 5 and note edition/page/variant.
3. Build a worked local-time timeline for one candidate historical date; do not assign expected result until the chosen profile's source rule is settled.
4. Only then convert each reviewed condition to a regression test and executable rule.


## 7. Further source check: printed Sanskrit scans for a specific growth case

A separate source registry gives a more precise printed-edition locator for the special case where **both Ekadashi and Dvadashi increase**:

> एकादशी द्वादशी चेत्युभयं वर्धते यदा ।
> तदा पूर्वदिनं त्याज्यं स्मार्तैर्ग्राह्यं परं दिनम् ॥

- Dharmasindhu, Kāśīnātha Upādhyāya, Nirṇaya Sāgara Press, Bombay, 1888, p. 17, leaf n39, band 6.
- Nirnayasindhu, Kamalākara Bhaṭṭa, Nirṇaya Sāgara Press, Bombay, 1901, p. 30, leaf n57, bands 2–4.
- Registry record: https://acharane.com/sources/ (entry `ds-p17-ekadashi-vriddhi` and `ns-p30-ekadashi-vriddhi`).

This is stronger than a modern calendar summary: both entries report direct reading from printed scans and give the same Sanskrit verse. The verse's scope is explicit: **Smārtas**; when both Ekadashi and Dvadashi increase, the earlier day is to be rejected and the later day accepted.

### Provisional rule record

- **Rule ID:** `SM-ED-VRIDDHI-BOTH-01`
- **Trigger:** Ekadashi and Dvadashi both increase in the exact sense used by the cited passage.
- **Outcome in source:** Smarta profile selects the later day, not the earlier day.
- **Status:** `SOURCE-SUPPORTED / IMPLEMENTATION-PENDING`.
- **Still required:** Confirm the operational meaning of “both increase” against the surrounding paragraphs and source definitions; create a local-time worked example with the two relevant sunrises; compare the Vaishnava passage independently. Do not infer that Vaishnava must choose the opposite date, nor generalise this verse to other growth cases.

This one narrow case can be elevated for a test after its astronomical timeline and precise trigger are reviewed; it does **not** verify the general Ekadashi algorithm.


## 8. Follow-up: what “both increase” means in the scan registry

The Acharane Classical Sources Registry entry is more specific than the earlier generic wording: it classifies this as a **two-sunrise Ekadashi** case and glosses “both increase” as both Ekadashi and Dvadashi being current after sunrise. It reports direct reading from these two scans:

- Dharmasindhu, Kāśīnātha Upādhyāya, Nirṇaya Sāgara Press, Bombay (1888), p. 17, leaf n39, band 6.
- Nirṇayasindhu, Kamalākara Bhaṭṭa, Nirṇaya Sāgara Press, Bombay (1901), p. 30, leaf n57, bands 2–4; the entry says it cites Mādhava.
- Public registry: https://acharane.com/sources/ (records `ds-p17-ekadashi-vriddhi` and `ns-p30-ekadashi-vriddhi`).

The verse says:

> एकादशीद्वादशी चेत्युभयं वर्धते यदा ।
> तदा पूर्वदिनं त्याज्यं स्मार्तैर्ग्राह्यं परं दिनम् ॥

A cautious operational reading to test is: over the two relevant consecutive local sunrises, Ekadashi is present at the earlier sunrise and Dvadashi is present at the later sunrise, so the tithis span two sunrise observations; for this named Smarta case, select the later day. However, the exact formal meaning of “वर्धते” must still be checked against the surrounding printed paragraph before turning this into a code predicate. Do not use this as a generic rule for every tithi present at two sunrises, and do not infer a Vaishnava outcome.

### Current evidence classification

- The Sanskrit verse and printed edition locators are scan-backed as reported by the registry.
- The tradition scope (“स्मार्तैः”) is explicit in the verse.
- The registry's two-sunrise explanation is a useful operational gloss, not a substitute for reviewing the surrounding page.
- No real historical date is promoted to a passing regression test yet; a worked timeline needs independently checked tithi transitions and local sunrise times.

Next: obtain/inspect the surrounding page context for both editions; then choose a real two-sunrise example, reconstruct local sunrise/tithi state from the project astronomy library, and compare only the Smarta outcome for this narrow rule.
