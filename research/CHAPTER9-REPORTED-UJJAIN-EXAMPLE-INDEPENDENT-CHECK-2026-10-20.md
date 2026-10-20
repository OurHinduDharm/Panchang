# Independent check of the reported Chapter IX Ujjain example — 20 October 2026

**Status:** research-only arithmetic audit. This note does not certify a heliacal event or change production code.

## Finding: the reported 5.98-day result uses a different sign's rising-time value

The submitted example applies the Chapter IX.5 western-event rule by adding six signs to both positions:

- Sun: 40°00′ → 220°00′
- Jupiter: 53°45′18″ → 233°45′18″
- Both shifted positions are in Scorpio.

It then uses the Taurus rising-asus value, (U=1554), for the IX.11 daily-motion conversion. That conflicts with the example's own six-sign shift: if IX.11 is being applied to the shifted rising-lagna construction, the corresponding sign input is Scorpio, for which the submitted table gives (U=2036), not Taurus 1554.

This is an internal consistency problem in the worked example. The primary-text wording of IX.5 explicitly says that, for the west, six signs are added to both lagnas; IX.11 converts the daily motions using the asus of that lagna construction. See:
- https://karmasakha.com/texts/surya-siddhanta (IX.5, IX.10–11)
- https://www.vedaseek.com/books/suryasiddhanta/9 (IX.4–11)

## Reproducible arithmetic using the example's own inputs

Keeping the example's provisional values unchanged:

- (K=15.558^circ)
- Jupiter limit (=11^circ)
- (Delta K=(15.558-11)	imes60=273.48) time-prāṇas
- Solar arc motion (=58′/	ext{day})
- Jupiter arc motion (=5′/	ext{day})

Using the submitted Scorpio rising-asus (U=2036):

[
v'_odot=rac{58	imes2036}{1800}=65.604444	ext{ prāṇas/day}
]

[
v'_J=rac{5	imes2036}{1800}=5.655556	ext{ prāṇas/day}
]

[
T=rac{273.48}{65.604444-5.655556}
 =4.561886	ext{ days}
]

Using Taurus (U=1554) instead gives approximately 5.98 days, which reproduces the submitted arithmetic but not its stated western shifted-sign setup.

## What this does and does not establish

1. **Established:** the reported 5.98-day calculation uses (U=1554), while its own western six-sign shift places both positions in Scorpio and its own table assigns Scorpio (U=2036).
2. **Provisional correction:** consistent use of the submitted Scorpio value changes the arithmetic estimate to about **4.56 days**.
3. **Not established:** 4.56 days is not yet a certified classical event date. The dṛkkarma inputs, exact meaning of the IX.11 rising-asus in the chosen commentary, source-derived *bhukti*, epoch/frame bridge, and changing positions over the interval remain open.
4. The sample's (58′/	ext{day}) and (5′/	ext{day}) are illustrative inputs, not date-specific source-derived daily motions.

## Next gate

Before using this example as a validation fixture, adjudicate from the chosen Sanskrit edition/commentary whether IX.11 uses each body's original sign rising-asus or the six-sign-shifted lagna's rising-asus for a western event. If the commentary says to use the original signs, document that explicit rule and test it; do not silently mix the two constructions. Then rerun the example with fully consistent sign inputs and a source-derived daily-motion candidate.

**Production guard:** no edits to `app.js` or `extra-panchang.js`; PR #22 remains research-only and Draft.
