# Vrata rules — implementation readiness and website presentation

**Date:** 2026-10-14
**Purpose:** Decide which Dharmasindhu-based rules can be implemented safely, which need a named authority profile, and which should remain informational until the evidence is sufficient.

## Principle

Implement what can be supported by a clear source reading, complete astronomical inputs, and repeatable tests. Do not force unresolved shastric interpretations into code. A rule that is not implemented is not a project failure; accurately communicating the evidence and its limits is part of a trustworthy Panchang.

## Readiness classes

- **A — Ready for test implementation:** the source meaning and required inputs are sufficiently clear. Still requires synthetic tests and independent date comparison before release.
- **B — Implement only as an explicit source/profile option:** the text records competing views; never merge them into one universal rule.
- **C — Informational only for now:** present the source explanation, but do not calculate a definitive result.
- **D — Hold:** text, context, or required astronomical input remains too uncertain.

## Current preliminary classification

| Topic | Class | Why / next action |
|---|---|---|
| Ekadashi's four clean tithi-duration classes | B | Preserve the source profile and the named Madhava/Hemadri difference; build boundary fixtures before date selection code. |
| Dashami-vedha clauses | B | Keep sunrise-vedha and Arunoday-vedha distinct; apply each only to the observance tradition/source that states it. |
| Mahādvādaśī names and source pairings | C → B | Can be shown as a sourced educational explanation now. Classification requires complete local sunrise/tithi/nakṣatra intervals and tests. |
| Trispr̥śā: three tithis touching one ahorātra | B | Sanskrit phrase “तिथित्रयस्पर्शात्” is visible; formalize interval boundaries and test synthetic timelines before release. |
| Pakṣavardhinī / “दिनवृद्धि” | D | Phrase is visible but the operational predicate is not established from this line alone. Research cross-references before calculation. |
| Śravaṇa-yukta Dvādaśī | B | The source says even a muhūrta of Śravaṇa conjunction can count, but exact scope and the Viṣṇu-śṛṅkhala cross-reference must be profiled. |
| Puṣya, Punarvasu, Rohiṇī-based Mahādvādaśīs | B | The Hindi commentary describes sunrise-to-sunset conjunction; confirm exact scope and define local-day interval consistently before coding. |
| Viṣṇu-śṛṅkhala | B / D | Competing definitions and night-time rules exist. Only implement after the selected source/profile is explicitly named. |
| Parana after Hari-vāsara | B | Keep the relevant tithi/portion and observance context explicit; do not treat it as one universal fixed clock time. |
| “बहवः” versus “केचित्” parana opinions | B | Preserve as separate source-attributed opinions; do not silently choose one or average them. |
| Trayodaśī parana when no Dvādaśī kalā exists | D | The sentence is visible, but antecedent and exact context must be settled before algorithmic fallback. |
| Tithi–nakṣatra conjunction-end parana | D | The phrase “उभयान्तेऽन्यतरान्ते च” needs a defensible grammatical and contextual interpretation; never infer “whichever ends first” without evidence. |
| Bhādrapada middle-20-ghaṭikā Śravaṇa restriction | B | Treat as a Bhādrapada-specific profile with its stated exceptions and authority dispute; never generalize to all months. |
| Ritual capacity/accommodation for undertaking two fasts | C | Present as a source-specific explanatory note, not an astronomical date-selection predicate. |

## Minimal architecture for safe implementation

Keep four concerns separate:

1. **Astronomical intervals:** tithi, nakṣatra, local sunrise/sunset, timezone, and their exact start/end times.
2. **Vrata classification:** clean Ekadashi class or Mahādvādaśī candidate, with named source/profile and rule IDs.
3. **Observance choice:** Smārta/Vaiṣṇava or another named tradition, capacity/ritual accommodations, and any source-specific choice.
4. **Pāraṇa window:** computed only after the observance/profile is chosen and all required endpoints are known.

Every evaluation should return a result (qualified, not-qualified, or unresolved), a rule/profile ID, source reference, short human-readable explanation, and unresolved inputs/reasons if any. Missing or malformed intervals must return unresolved, never a guessed date or time.

## Website presentation

For a user-facing vrata/festival detail page, use a consistent layout:

1. **निर्णय:** the date/result and the selected tradition/profile, only when calculation is supported.
2. **निर्णय का आधार:** concise plain-Hindi explanation of the relevant tithi/nakṣatra/sunrise condition.
3. **शास्त्रीय संदर्भ:** book/section and the Sanskrit incipit or short verified excerpt; link to the research/source page.
4. **मतभेद:** if relevant, identify the alternative view and its source without claiming that all traditions agree.
5. **सीमा/सावधानी:** if the rule is not calculable with confidence, say so plainly and show the sourced explanation rather than an invented muhurta.

Do not claim “most accurate” or imply that a source-specific rule is universal. Never display a definitive pāraṇa time when the relevant endpoints or chosen authority are unknown.

## Release gates

- [ ] Source incipit and context are recorded.
- [ ] Authority/profile and scope are explicit.
- [ ] Inputs and timezone/local-day semantics are specified.
- [ ] Positive, negative, boundary, missing-input, and malformed-input tests pass.
- [ ] At least a small set of real dates is compared with a named independent Panchang/source, with disagreements documented.
- [ ] User-facing explanation is ready in Hindi.
- [ ] Owner approves production changes.

## Safety boundary

This is a planning document only. It does not change data/festivals.json, runtime JavaScript, legacy festival dates, Blogger output, or PR #33 merge state.