# Festival Muhurta and Moonlight Observance Requirements — 2026

**Branch:** `data/festival-json-foundation`  
**Status:** implementation requirements and comparison values only; no displayed time is certified yet.

## User-requested additions

### 1. Sharad Purnima / Kojagari — festival-013
Display a dedicated **“चाँदनी में खीर रखने का समय”** (also searchable as *खीर चन्द्रप्रकाश में रखने का समय*). It is not a separate classical muhurta with one universal clock time. The useful local guidance is:
- show local moonrise (चन्द्रोदय) for the selected city/date;
- say to place the prepared kheer where moonlight reaches it after moonrise, and keep it covered safely from insects/dust while allowing the customary exposure;
- show Kojagara/Lakshmi puja Nishita window separately when the chosen tradition observes it;
- clearly show the local Purnima tithi end and whether it spans the observance night.
Do not label the moonrise time as a universal “kheer muhurta”, and do not tell users to leave dairy food unrefrigerated all night as a food-safety recommendation. The religious custom can be described without guaranteeing medicinal effects.

### 2. Rama Ekadashi — recurring vrata entry
Add a distinct Rama Ekadashi observance record if the legacy source inventory does not already contain one. The record must expose **पारण मुहूर्त** as a calculated local interval, not a static copied string. The rule needs the local Dvadashi/parana window and sunrise, with Smarta/Vaishnava profile clearly identified when relevant. Do not silently use an ISKCON/Vaishnava parana for every tradition.

### 3. Dhanteras — festival-018
Add a local **धनतेरस पूजा मुहूर्त** section, with:
- Trayodashi start/end;
- Pradosh Kaal;
- Vrishabha Kaal where applicable;
- selected puja window;
- Yama Deepam only as a separately labelled observance, not merged with Lakshmi-Kuber puja.
Any purchase windows should be a separate optional subsection and must not be confused with the puja muhurta.

### 4. Diwali / Mahalakshmi Puja — festival-021
Add a local **लक्ष्मी पूजा मुहूर्त** section:
- Amavasya start/end;
- Pradosh window;
- selected Lakshmi Puja interval;
- Vrishabha Lagna window when applicable;
- Nishita/Kali Puja interval only where relevant to the selected tradition.
Keep all old 2025 times in source provenance only; never display them as 2026 values.

## Calculation and UI contract

- All clock times are local to the selected city and date, with timezone stated.
- Calculate using the project's pinned `@ishubhamx/panchangam-js@3.0.0` and astronomy routines where supported; verify the library's return shape before relying on it.
- Compare with a reputable city-specific Panchang (Drik Panchang) and a second source where available.
- Record the chosen rule, source URL, calculation inputs, and unresolved regional differences.
- A time remains provisional until both the calculation and the rule have been reviewed.
- Missing calculations must display a clear “स्थानीय गणना उपलब्ध नहीं” state, never a stale time or a guessed time.
- Do not set `verificationStatus: "verified"` merely because a test checks that a field exists.

## Public comparison values reviewed (not final project outputs)

- Sharad Purnima: public sources generally place the Kojagara night on 25 October 2026; Delhi references give Purnima tithi roughly 25 Oct 11:55–11:56 AM to 26 Oct 9:41 AM and moonrise about 5:00 PM. These are **Delhi values**, not Pithoragarh output.
- Rama Ekadashi: Drik Panchang's Pithoragarh ISKCON calendar lists 5 November 2026 and parana 6 November 06:26–10:04. This is explicitly a **Vaishnava/ISKCON profile**, not automatically a universal Smarta rule.
- Dhanteras: Drik Panchang's Dehradun page lists 6 November 2026, puja 17:56–19:50, Trayodashi 10:30 on 6 Nov to 10:47 on 7 Nov. These are **Dehradun values**, not Pithoragarh output.
- Diwali: Drik Panchang's Pithoragarh page lists 8 November 2026, Lakshmi Puja 17:40–19:35, Pradosh 17:18–19:56, Amavasya 11:27 on 8 Nov to 12:31 on 9 Nov. This is a useful independent comparison, but project calculation/rule validation is still required.

## Sources

- Drik Panchang, Pithoragarh monthly Panchang: https://www.drikpanchang.com/panchang/month-panchang.html?geoname-id=1259503
- Drik Panchang, Pithoragarh ISKCON Ekadashi list: https://www.drikpanchang.com/iskcon/iskcon-ekadashi-list.html?geoname-id=1259503
- Drik Panchang, Dehradun Dhanteras timings: https://www.drikpanchang.com/festivals/dhanteras/festivals-dhanteras-puja-timings.html?geoname-id=1273313
- Drik Panchang, Pithoragarh Lakshmi Puja timings: https://www.drikpanchang.com/festivals/lakshmipuja/festivals-lakshmipuja-timings.html?geoname-id=1259503
- Sharad Purnima city comparison: https://myarchana.in/festival/sharad-purnima-2026

## Next implementation sequence

1. Extend the diagnostic output to include moonrise and the library's raw tithi object fields.
2. Inspect the generated artifact and validate the library's interval representation.
3. Compute and compare the four requested observance outputs for Pithoragarh.
4. Add structured, per-festival muhurta fields only after field semantics are confirmed.
5. Add tests for time-zone, date-boundary, missing-time, and stale-legacy-time cases.
6. Wire the verified output into the festival renderer only after the draft data and CI are reviewed.
