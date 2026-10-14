# Dharma Sindhu: Hindi-edition cross-check for Ekadashi decision

Status: research note only; not runtime authority by itself.

## Sources supplied by the project owner

1. Rajvaidya Ravidutta Shastry Hindi translation, Internet Archive viewer:
   https://archive.org/details/DharmaSindhuRajvaidyaRaviduttaShastry/page/%E0%A5%A8%E0%A5%A9/mode/1up
2. Khemraj Hindi translation with Sanskrit text, excerpt supplied directly by the project owner. In the supplied excerpt, the relevant material is marked परिच्छेद १, “अथ व्रतादिके निर्णयः / अथ स्मार्तनिर्णयः”; the visible printed page labels are around 25–28, but pagination must not be used as the cross-edition identifier.

Use Sanskrit incipits, section headings, and the rule context to align passages. Do not assume pagination matches between editions.

## Aligned subject and Sanskrit anchors

### A. Who observes which rule; types of Dashami-vedha

Anchor:
“तत्र व्रताधिकारिणो द्विविधा वैष्णवाः स्मार्ताश्च”
and
“वेधोऽपि द्विविधः । अरुणोदये दशमीवेधः सूर्योदये तद्द्वेधश्च”

The supplied Khemraj text describes two separate reference points:
- Aruṇodaya-vedha: Dashami present at the pre-sunrise arunodaya interval; described as four ghaṭīs before sunrise.
- Sūryodaya-vedha: Dashami present at sunrise.
- The text distinguishes their application to Vaishnava and Smarta decisions. Preserve this distinction rather than collapsing both into a single “Dashami present” boolean.

**Numerical caution:** The OCR/transcription differs in places over whether the threshold is expressed as 55/56 ghaṭīs elapsed from the prior sunrise and has garbled numerals elsewhere. The Khemraj Sanskrit passage states “षष्टिघटिकात्मकसूर्योदयोत्तर…” and “पटपञ्चाशद्धाटिकानन्तर…” as rendered in the supplied copy; the Hindi explanation says 56 ghaṭīs. Do not turn the OCR digits into code constants until the edition scan and the unit convention are verified.

### B. Four clean Ekadashi classes in the Vaishnava summary

Anchor:
“अरुणोदयवेधरहिता शुद्धा । सा चतुर्विधा । एकादशीमात्राधिक्यवती द्वादशीमात्राधिक्यवती उभयाधिक्यवती अनुभयाधिक्यवती”

The excerpt gives four named cases:
1. Ekadashi-mātrādhikyavatī
2. Dvādaśī-mātrādhikyavatī
3. Ubhayādhikyavatī
4. Anubhayādhikyavatī

Here “आधिक्य” is explained as presence beyond sunrise. The worked examples are expressed as tithi durations in ghaṭī/pala and must be interpreted on a continuous tithi timeline relative to local sunrise—not as ordinary clock hours or as isolated integer labels.

The Vaishnava summary says, in brief:
- If Ekadashi alone has the stated post-sunrise excess: Vaishnava observes the later day; Smarta householder the earlier day.
- If Dvadashi alone has the stated excess: Vaishnava observes on Dvadashi; Smarta householder observes on Ekadashi in this summary.
- If both have excess: both groups observe on the later day.
- If neither has excess: both groups observe on the earlier day.
These are summaries of the supplied passage, not a replacement for the full rule matrix or its special cases.

### C. Smarta decision and explicit difference of opinions

Anchor:
“अथ स्मार्तनिर्णयः”
and
“अत्र शुद्धत्वात्स्मार्तानामेकादश्यामेवोपवासो न द्वादश्यामिति माधवमतम् । हेमाद्रिमते तु सर्वैः परा द्वादश्येवोपोष्या”

The supplied passage explicitly preserves different views for the Dvadashi-mātrādhikyavatī clean case:
- Mādhava view: Smarta fast on Ekadashi because it is clean.
- Hemādri view: all observe the later Dvadashi.
- It mentions another opinion for some Mumukshu Smartas and says the commonly followed Smarta practice described by the text generally follows Mādhava.

Do not silently erase the source’s named disagreement. If the product later supports selectable textual profiles, keep the view/profile explicit; otherwise document which view the project has chosen and why before implementation.

### D. Dashami-vedha list and scope limitation

Anchor:
“वेधभेदा नारदेनोक्ता”
and
“माधवाचार्यादिसर्वसंमतस्तु … वेध एव”
The supplied text lists named vedha categories associated with Dashami durations after midnight, then states a Madhava-aligned 56-ghaṭī vedha view. It also says the 15-ghaṭī Dashami contamination rule applies to vows other than the fast itself (“उपवासातिरिक्तव्रते”).

This is an important scope restriction: do not reuse a rule stated for non-fasting vrata observances as the Ekadashi fast-day selector without separate textual support.

## What the two Hindi editions contribute

The owner-supplied Khemraj excerpt includes Sanskrit and Hindi commentary and is especially useful for aligning Sanskrit incipits and identifying named मतभेद. The owner-supplied Rajvaidya Ravidutta Shastry excerpt is a parallel Hindi witness for the same introductory Ekadashi-decision material.

At the broad rule level, they appear to track the same Dharma Sindhu passage. However, the pasted OCR has numerous digit and character corruptions, so this is a **provisional alignment**, not a diplomatic transcription or a claim that every numeral matches across editions. Where numerical examples matter, inspect the scan and transcribe the printed Sanskrit first, then check the Hindi explanation.

## Implementation gate

Before adding these rules to runtime:
1. Verify the printed Sanskrit numerals in the relevant scan(s), especially 55/56 ghaṭī, tithi duration examples, and the vedha list.
2. Define a consistent elapsed-time convention for ghaṭī/pala and local sunrise.
3. Build separate decision tables for Vaishnava and Smarta observance, with named Mādhava/Hemādri alternatives where the text records them.
4. Test edge cases on synthetic continuous timelines first; missing, malformed, or ambiguous tithi intervals must return unresolved, not a guessed date.
5. Keep this research isolated from data/festivals.json, runtime JS, legacy dates, Blogger output, and the live Panchang until the owner explicitly approves implementation.

## Next topic after Ekadashi

Continue with the owner-identified “अथाष्टौ महाद्वादश्यः” passage (Unmīlanī, Vañjulī, Trispr̥śā, Pakṣavardhinī and the four nakshatra-linked forms), keeping the same Sanskrit-anchor-first cross-edition method.
