# Traditional Agastya decision — 28 November 2026

## Source and decision

Nirnayasindhu II, Agastyarghya: https://www.transliteral.org/pages/z130530210948/view (Sanskrit and Marathi, lines 122–127); alternate transcription https://vishvasa.github.io/kalpAntaram/dharmaH/nibandhaH/kamalAkarabhaTTaH/nirNayasindhuH/ (अथागस्त्यार्घ्यं). The cited Padma allows an offering up to seven nights after rise; Bhavishya via Hemadri describes the seven days preceding Kanya ingress and cessation at ingress; Vishnurahasya locates the offering at night-end/dawn. Neither passage mandates seven consecutive daily offerings. The Divodasiya/Garga general Simha+21 rule is not an exact local astronomical timestamp. Preserve the two timing traditions separately.

Grahalaghava Asta-Udaya chapter 21, https://www.transliteral.org/pages/z101024130029/view lines 323–326: rise longitude 98 + 8 palabhā, set 78 - 8 palabhā, palabhā = 12 tan(latitude) for a twelve-angula gnomon. The printed Kashi worked example gives 144°/32°. No fitting. This is a classical comparator only.

Actual offline Swiss Ephemeris (Moshier, Lahiri) run: solve the exact sidereal solar longitude crossings in 2027. IST rounded to minutes:

| Place | Latitude | Rise longitude | Computed rise | Computed set | Existing rise comparator |
|---|---:|---:|---|---|---|
| Pithoragarh | 29.5828 | 152.49748 | Sep 20 03:36 | May 8 18:55 | Sep 7 |
| Ramnagar | 29.5 | 152.31419 | Sep 19 23:06 | May 8 23:28 | Sep 1 12:35 |
| Delhi | 28.6139 | 150.37112 | Sep 17 23:18 | May 10 23:40 | Sep 4 |
| Varanasi | 25.3176 | 143.41508 | Sep 10 19:47 | May 18 04:41 | Aug 27 |

Modern solar position alone does not make this historical approximation a validated Drik visibility model. Several rises even occur after Kanya ingress, when the ritual window is closed under Nirnayasindhu. Reject as production replacement. No changes to current visibility model or public data.

## Reproduce solar longitude comparison

Python with pyswisseph:
```python
import math, swisseph as swe
swe.set_sid_mode(swe.SIDM_LAHIRI)
for latitude in [29.5828,29.5,28.6139,25.3176]:
    correction=96*math.tan(math.radians(latitude))
    for target in [98+correction,78-correction]:
        jd=swe.solcross_ut(target,swe.julday(2027,1,1,0),swe.FLG_MOSEPH|swe.FLG_SIDEREAL)
        print(latitude,target,swe.revjul(jd)) # UTC
```

## Ramnagar 2027 conditional ritual decision

Owner's printed Tara Prasad VS2084 reference: traditional rise 1 Sep 12:35 IST, first offering 2 Sep before sunrise. This is an input, not an independently calculated rise. Swiss solar ingress Simha 17 Aug 14:13:45.854 IST, Kanya 17 Sep 14:10:34.250 IST. At latitude 29.5, longitude 79.133333, elevation 442m (user reference location profile), Swiss/Moshier apparent standard sunrise, auto pressure, 15°C. Candidate broad pre-sunrise period = last two fifteenths of previous sunset-to-sunrise night (Brahma-muhurta onset through sunrise, NOT an exact textual definition of Arghya muhurta). This gives:

| Date 2027 | Candidate dawn start | Sunrise IST |
|---|---|---|
| Sep 2 | 04:21:15 | 05:51:18 |
| Sep 3 | 04:21:33 | 05:51:49 |
| Sep 4 | 04:21:51 | 05:52:21 |
| Sep 5 | 04:22:09 | 05:52:52 |
| Sep 6 | 04:22:27 | 05:53:24 |
| Sep 7 | 04:22:45 | 05:53:55 |
| Sep 8 | 04:23:02 | 05:54:26 |

First dawn agrees with the printed day. This is a conditional review schedule; do not claim the times are published Tara Prasad Arghya timings. The seven-morning operational counting interpretation and exact dawn boundary remain review choices. Bhavishya's seven preceding mornings in this example are Sep 11–17 and do not overlap the first seven after rise. No forced reconciliation.

Module accepts explicit traditional rise, Simha/Kanya ingresses, complete consecutive local dawn windows and returns separately scoped candidates. It refuses geometric-rise inputs or missing data. The traditional Udaya root for the printed 12:35 is not established. Do not substitute geometric/heliacal rise, copy other cities, or extrapolate publisher times. No new public feature until independent local date/time method is established; current public system remains intact.

## Public dawn-display clarification

The Sanskrit text of Nirnayasindhu II, Agastyarghya (TransLiteral lines 122–125), confirms dawn/night-end as the ritual period in the Vishnurahasya quotation. Its Padma and Bhavishya/Hemadri passages support an allowance after traditional rise and a Kanya-ingress limit respectively; they do not determine the exact modern visibility threshold. The public renderer may describe a calculated same-local-date morning rise-to-sunrise interval as “अगस्त्यार्घ्य हेतु दृश्यता-आधारित दर्शनकाल”, not a verified traditional Arghya muhurta. A positive duration of at most three hours and sunrise before local noon are defensive presentation checks, not scriptural numerical limits. Other intervals retain the astronomical label only. No reference dates copied; the independent traditional rise remains unresolved.
