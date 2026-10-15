# Festival Vrat & Muhurat Display Plan

Status: draft design and rule metadata only — **not production-ready**.

## What users should see

- **पूर्णिमा व्रत:** a recurring entry for each local Shukla Purnima, calculated from Panchang tithi data. No fixed Gregorian dates. Edge cases (tithi spanning/skipping sunrise and regional vrat rules) must be validated.
- **धनतेरस:** local date plus the verified Dhanteras/Dhanvantari puja interval, normally assessed with Trayodashi and local Pradosh conditions. Show the exact start/end only after the rule is sourced and checked.
- **दीपावली / महालक्ष्मी पूजन:** date decision and puja interval(s) separately. Where the selected tradition uses them, show Pradosh and/or Nishita slots independently; do not collapse them into a single unsourced time.
- **होलाष्टक:** show a continuous period from Falgun Shukla Ashtami through Purnima in the local Panchang. The draft resolver requires both boundaries; it must not guess if one is missing.
- **होलिका-दहन:** show a local, Bhadra-aware interval, not just a date. Purnima, Pradosh, Bhadra start/end and any applicable mukha/puccha rule must be evaluated according to a documented source.
- **सभी 12 संक्रान्तियाँ:** calculate each exact sidereal solar ingress. Show the ingress instant separately from its Punyakaal start/end. Punyakaal must come from the verified shastric rule for that Sankranti and the local sunrise/sunset conditions; do not apply a guessed universal offset.

## Display contract

Each timed result should show:
1. Local city/location and timezone.
2. Selected observance date.
3. Muhurat/period label and local start–end time (including next-day rollover when applicable).
4. A short “निर्णय का आधार” note explaining which tithi, sunrise/sunset, Bhadra or ingress condition selected the interval.
5. Source and review state.

When rule/input is missing or sources conflict, say **“गणना/सत्यापन शेष”** and show no invented time. Keep astronomical calculation, ritual date selection, and user-facing text as separate layers.

## Source and verification workflow

1. Use the user's **Ganesh Martand Panchang** as the practical primary comparison for OurHinduDharm.
2. Record edition/year, page or printed entry, exact time, and the decision rule that the entry illustrates.
3. Research the relevant primary grantha/nibandha/paddhati and record the edition/verse/page when available.
4. Use Drik and other public calendars as cross-checks, not as an automatic replacement for the chosen reference.
5. Test Pithoragarh first; later test another location, tithi boundaries, Bhadra spanning sunset, ingress near sunrise/sunset, and midnight rollover.
6. Do not publish any muhurat until source policy, code, tests, and Ganesh Martand comparison agree or a documented exception is approved.

The structured draft metadata is in `data/muhurta-rules.json`. It documents the intended inputs and output but does not itself calculate or certify times.
