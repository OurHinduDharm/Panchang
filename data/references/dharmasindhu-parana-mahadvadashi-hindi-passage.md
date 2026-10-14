# Dharma Sindhu: Parana and eight Mahadvadashi rules — owner-supplied Hindi passage

Status: source-aligned research note; not runtime authority by itself. Added from the project owner's supplied Hindi translation excerpt. No production rules or dates changed.

## Passage anchors

Parana section:
“कलामात्राया अपि द्वादश्या अभावे त्रयोदश्यां पारणम्”
“द्वादश्या मध्याह्नोर्ध्वे सत्त्वे प्रातर्मुहूर्तत्रयमध्य एव पारणं न मध्यादूर्ध्वम् इति बहवः । बहूनां कर्मकालानां बाधापत्तेरपराह्ण एव इति केचित्”

Eight Mahadvadashis section:
“अथाष्टौ महाद्वादश्यः”
“शुद्धाधिकैकादशी-युक्ता द्वादशी उन्मीलनीसंज्ञा”
“द्वादश्येव शुद्धाधिका वर्धते सा वञ्जुली”
“सूर्योदये एकादशी ततः क्षयगामिनी द्वादशी द्वितीयसूर्योदये त्रयोदशी … तिथित्रयस्पर्श…”
“दर्शस्य पौर्णमास्या वा यदा दिनवृद्धिस्तदा पक्षवर्धिनी”
“पुष्यर्क्षयुता जया; श्रवणयुता विजया; पुनर्वसुयुता जयन्ती; रोहिणीयुता पापनाशिनी”

## Parana: rules and unresolved conditions

1. If even a kalā of Dvādaśī is absent, the passage says pāraṇa on Trayodaśī. The surrounding context must determine which configuration this applies to; do not make it a universal fallback for every Ekadashi.
2. If Dvādaśī is present after madhyāhna, the passage records two distinct views:
   - “बहवः”: pāraṇa within the first three muhūrtas of the morning, not after madhyāhna.
   - “केचित्”: because this would obstruct the timing of many other rites, pāraṇa in aparāhna.
3. Keep these views separate in the research model. Do not silently choose one as a universal rule. Before calculating, verify the intended reference point and the relevant vrata/tithi configuration in the printed edition.
4. The supplied Hindi commentary glosses the phrase as “द्वादशी मध्याह के अनंतर हो”. This should be checked against the Sanskrit print and its surrounding context before translating into a machine predicate; the OCR may have lost or confused a word.

## Eight Mahadvadashi forms in the supplied passage

1. Unmīlanī: Dvādaśī joined with a “śuddha adhika Ekadashi” — the exact compound and the meaning of “adhika” must be interpreted with the prior Ekadashi classification, not by a guessed standalone condition.
2. Vañjulī: Dvādaśī itself is pure/clean, more extensive, and increases — exact sunrise/tithi predicate still needs formalization from the full context.
3. Trispr̥śā: Ekadashi is present at one sunrise, then a kṣaya-going Dvādaśī, and Trayodaśī at the next sunrise; three tithis touch one ahorātra. The exact phrase around “स्पर्श/अविस्पर्श” should be verified from the scan before coding.
4. Pakṣavardhinī: on Amāvāsyā or Pūrṇimā, when there is “दिनवृद्धि”. This phrase needs a precise contextual definition; do not equate it to an arbitrary longer tithi without checking the source’s rule.
5. Jayā: Dvādaśī conjoined with Puṣya.
6. Vijayā: Dvādaśī conjoined with Śravaṇa.
7. Jayantī: Dvādaśī conjoined with Punarvasu.
8. Pāpanāśinī: Dvādaśī conjoined with Rohiṇī.

The passage says these are observed by those seeking sin-removal and merit/auspicious fruit. It adds that Śravaṇa-conjoined Dvādaśī is treated as nitya like Ekadashi.

## Further rules in the owner's Hindi rendering

- If two Ekadashi fasts fall on the same day, observe by tantra (the text uses “तंत्रसे उपवास करे”); if separate, a capable person observes two fasts.
- For someone unable to perform both fasts after beginning both vows, the passage says a Dvādaśī fast yields the merit of two. Preserve this as a textual accommodation, not as an astronomical decision.
- Even a muhūrta of Śravaṇa-nakshatra conjunction is said to be acceptable/valuable (“मुहूर्तमात्र भी श्रवण नक्षत्रका योग”).
- For Puṣya and the other named nakshatras, the Hindi commentary says the conjunction should extend from sunrise until sunset. This differs in wording from the short Śravaṇa rule and must remain a separate predicate unless the Sanskrit context establishes otherwise.
- Pāraṇa is described as being after the end of the tithi-nakshatra conjunction, or after the end of one of the two. Exact scope and eligible end-point need source-context review; do not automatically encode a generic “whichever ends first” rule without confirming the Sanskrit syntax.

## Implementation requirements

- Represent Dvādaśī and nakshatra intervals as continuous intervals with explicit local sunrise/sunset and timezone.
- Keep the following separate: Mahadvadashi classification, vrata-day selection, fasting-capacity/observance choice, and pāraṇa window.
- For nakshatra forms, conjunction overlap is only one input; duration requirements differ by the supplied passage (Śravaṇa muhūrta-level statement versus Puṣya etc. sunrise-to-sunset wording).
- Preserve the recorded pāraṇa alternatives (“बहवः” vs “केचित्”) as distinct textual views.
- Missing, malformed, or uncertain intervals or source predicates must return unresolved rather than a guessed observance date.
- Keep this note separate from runtime JS, `data/festivals.json`, legacy festival dates, and Blogger output until the project owner explicitly approves implementation.

## Next verification gate

Use the matching printed Sanskrit page in either Hindi edition to verify: the phrase around Dvādaśī occurring after madhyāhna; “दिनवृद्धि”; the exact Trispr̥śā compound; and the syntax of pāraṇa after the tithi/nakshatra conjunction. Page numbers can differ between editions; align by section heading and Sanskrit incipit.
