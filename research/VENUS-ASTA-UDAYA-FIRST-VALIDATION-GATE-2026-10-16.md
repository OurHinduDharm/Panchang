# Venus Asta/Udaya — First-Planet Validation Gate (2026-10-16)

**Status:** Research checkpoint; not a production approval.
**Branch:** `research/ss-ch9-diagnostic`
**Scope:** Validate Venus first, then permit a narrowly scoped site display change.
**Production guard:** Do not edit `app.js` or `extra-panchang.js` in this gate.

## What the current production helper actually does

The current `extra-panchang.js` helper is a preliminary, day-level angular-boundary search:
- samples ecliptic longitude separation at local noon;
- uses a fixed Venus threshold of 10° for both directions;
- searches dates in whole-day steps, not the actual sunrise/sunset event instant;
- marks every result `verificationPending: true`, so the card intentionally hides dates.

This is not yet equivalent to Sūrya-siddhānta Chapter IX. The chapter's Venus rule is event-specific: 8° for west-setting/east-rising and 10° for east-setting/west-rising (IX.7). The event branch must first be classified under IX.2–3. A single fixed 10° threshold cannot represent all four cases. A noon sample and date-only crossing also cannot justify a displayed local event time.

## Minimum acceptance gate for Venus

1. **Classify the event** from the chapter's longitude ordering and motion rule (IX.2–3); reject ambiguous/stationary cases instead of guessing.
2. **Choose the event instant**: sunset-side positions for western events, sunrise-side positions for eastern events (IX.4). Use the user's selected location and its actual date-specific sunrise/sunset.
3. **Keep models separate**:
   - classical lagnāntara (K) from IX.4–5 and threshold (C) from IX.7;
   - modern ecliptic longitude separation;
   - 3-D elongation;
   - Swiss heliacal visibility.
   These are different observables and must not be blended into one “correct” answer.
4. **Bracket and solve the boundary** at sub-day resolution, recording the actual time, timezone, location/elevation, ephemeris/frame, and threshold branch. Do not label a date-only daily sample as an exact time.
5. **Reproduce an external reference only when its provenance is known**: same location, time convention, coordinate frame, and event definition. TKS and Drik values remain comparisons, not automatic gold standards.
6. **Run regression checks** for Venus Asta and Udaya, both sides of 0° Aries, selected-location changes, and missing/ambiguous inputs. Confirm `app.js` and `extra-panchang.js` remain unchanged in the research PR.

## Display decision

A site display may be enabled only for fields that pass the gate. Until then, show a concise “शास्त्रीय गणना सत्यापनाधीन” state rather than publishing the preliminary noon/10° dates as final. Once validated, show the event label, local date and time, observer location, and a short method note; do not call the classical threshold date a guarantee of physical naked-eye visibility.

## Immediate next action

Use the existing research-only `test-astronomy.html` panels for the exact-time boundary audit and Sūrya-siddhānta lagnāntara. Resolve the event classification and frame/dṛkkarma inputs first, then record one complete Venus event calculation from raw input through (K-C) and the time boundary. Only after that single event passes should the second Venus event and other planets be cleared.
