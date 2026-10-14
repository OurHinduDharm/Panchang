# Vrata interval-engine contract — pre-implementation specification

**Date:** 2026-10-14  
**Branch:** data/festival-json-foundation  
**Status:** Documentation/test specification only. No runtime implementation authorized.

## Purpose

Define the smallest safe calculation layer that can be tested before any disputed vrata-selection or pāraṇa rule is encoded. This layer does **not** decide which day a vrata belongs to. It only validates astronomical intervals and reports interval relations without silently choosing a shastric authority.

## 1. Input contract

Each interval is a half-open interval [start, end) with absolute timestamps (for example, Unix milliseconds or ISO timestamps normalized to UTC by the caller):

- start: required, finite/valid timestamp
- end: required, finite/valid timestamp
- must satisfy start < end

The caller must separately retain the local timezone and the source of each astronomical event. Never infer timezone, sunrise, month, pakṣa, or a missing endpoint from another field.

Invalid, absent, non-finite, unparsable, or reversed/equal endpoints must produce **unresolved**, not **false**.

## 2. Interval relation

For valid intervals A and B:

- overlapStart = max(A.start, B.start)
- overlapEnd = min(A.end, B.end)

There is a positive overlap exactly when overlapStart < overlapEnd. Equality means the intervals merely touch and their positive-duration overlap is zero.

This is a mathematical helper only. A positive overlap does **not** by itself qualify a vrata, establish a minimum muhūrta, select a day, or authorize pāraṇa.

## 3. Required unit tests

| Test ID | A | B | Expected helper result | Reason |
|---|---|---|---|---|
| INT-01 | [100, 200) | [150, 250) | overlap [150, 200) | Partial overlap |
| INT-02 | [100, 200) | [120, 180) | overlap [120, 180) | B contained in A |
| INT-03 | [100, 200) | [200, 250) | no positive overlap | End equals next start |
| INT-04 | [100, 150) | [160, 200) | no positive overlap | Gap between intervals |
| INT-05 | [100, 200) | [100, 200) | overlap [100, 200) | Identical intervals |
| INT-06 | missing A.start | [100, 200) | unresolved | Required input missing |
| INT-07 | [200, 100) | [100, 250) | unresolved | Reversed interval |
| INT-08 | [100, 100) | [100, 250) | unresolved | Zero-duration input is invalid |
| INT-09 | invalid timestamp | [100, 200) | unresolved | Malformed input |
| INT-10 | valid A | missing B.end | unresolved | Do not invent a conjunction end |

Implementation should return a structured result with a status (overlap, no-overlap, or unresolved), overlap endpoints where applicable, and a reason for unresolved cases.

## 4. Keep the decision layers separate

1. **Astronomical interval helper:** validate intervals and calculate overlap.
2. **Source-profile predicate:** apply only an explicitly named rule, e.g. strict or alternate Viṣṇu-śṛṅkhala interpretation.
3. **Vrata-day selection:** requires the profile's sunrise/day-boundary and month/pakṣa rules.
4. **Pāraṇa:** requires the chosen observance profile and all relevant endpoints; never derive a clock time from overlap alone.
5. **Website explanation:** report the selected profile, source incipit/reference, result, and any unresolved condition in plain Hindi.

A missing profile or an unresolved prerequisite must propagate as **unresolved**; it must not fall through to a default rule.

## 5. Source-derived Śravaṇa-Dvādaśī examples to preserve

The Dharmasindhu pāraṇa translation on TransLiteral gives this illustrative duration example (in ghaṭikās): Ekādaśī 30, Uttarāṣāḍhā 29, Dvādaśī 25, and Śravaṇa 29. It discusses avoiding Śravaṇa's middle 20 ghaṭikās and taking pāraṇa in the final 20 ghaṭikās of Śravaṇa while Dvādaśī remains. The same passage gives short-Dvādaśī variants where avoiding the middle segment would cause Dvādaśī to be crossed, and then describes fallback timing.

Source: [Dharmasindhu — pāraṇa decision (TransLiteral)](https://www.transliteral.org/pages/z80503221630/view)

These are **source fixtures, not universal expected outputs**. Before converting them into executable tests, record the original interval convention, the meaning of the listed ghaṭikā durations, which candidate day each duration belongs to, and the selected authority profile. Do not translate the example's numbers directly into UTC timestamps or apply the Bhādrapada middle-segment restriction to other months.

## 6. Exit criteria before runtime implementation

- [ ] Unit tests INT-01 through INT-10 pass in a standalone test harness.
- [ ] The helper has no dependency on festival names or a chosen tradition.
- [ ] Every invalid/missing input returns unresolved with a reason.
- [ ] Rule-profile tests separately cover strict/alternate Viṣṇu-śṛṅkhala and night-time variants.
- [ ] Pāraṇa tests preserve the both-endpoints principal view and disputed alternatives as separate profiles.
- [ ] The Bhādrapada middle-20-ghaṭikā rule is scoped to its cited observance and its fallback is separately tested.
- [ ] At least two real dates are checked against a named independent Panchang, with discrepancies recorded.
- [ ] Project owner approves the runtime change.

## Safety boundary

This document adds no production code and changes no festival dates. Do not edit app.js, data/festivals.json, legacy festival dates, Blogger output, or merge PR #33 on the basis of this contract alone.
