# 2028 Festival Source Cross-check — Initial Pass

Review date: 2026-11-02  
Scope: `data/festivals/2028-01.json` through `2028-12.json`  
Purpose: compare the existing annual catalog with published Panchang sources and isolate only genuine rule/date conflicts.

## Repository snapshot

- Twelve monthly files contain 126 event records.
- All 126 individual records currently have `reviewStatus: "approved"`.
- Eleven months have month-level `status: "needs-review"`; July alone is `approved`.
- The `locationScope` fields still describe the files as preliminary and requiring location-specific calculation/review.

This mismatch should be resolved after the source audit. It is not a reason to mark correct individual dates wrong.

## Main annual comparison

The main recurring dates in the OHD catalog align with the Drik Panchang 2028 annual calendar, including:

- January: Pausha Putrada Ekadashi, Makar Sankranti, Shattila Ekadashi, Mauni Amavasya, Vasant Panchami.
- February: Ratha Saptami, Jaya Ekadashi (Smarta/Gauna split), Magha Purnima, Kumbha Sankranti, Vijaya Ekadashi, Maha Shivaratri.
- March: Amalaki Ekadashi, Holika Dahan (10 March), Holi (11 March), Papamochani Ekadashi, Ugadi/Chaitra Navratri.
- April–June: Smarta Rama Navami (3 April), Hanuman Jayanti, Akshaya Tritiya (27 April), major Ekadashis, Ganga Dussehra, Nirjala Ekadashi and Jagannath Rathyatra.
- July–September: Devshayani Ekadashi (2 July), Guru Purnima, Kamika Ekadashi, Hariyali Teej, Nag Panchami, Janmashtami (13 August), Ganesh Chaturthi, Pitrupaksha and Navratri.
- October–December: Diwali (17 October), Devutthana Ekadashi (28 October), Kartika Purnima (2 November), Vivah Panchami, Gita Jayanti, Dattatreya Jayanti and Pausha Purnima.

Primary references:

- Drik Panchang 2028 Hindu calendar (New Delhi): https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=2028
- Global Panchang 2028 (Delhi): https://globalpanchang.com/panchang/delhi/2028

## Differences requiring observance-rule review

### Bhishma Ashtami — OHD 4 February; Drik annual listing 3 February

Drik's annual calendar lists Bhishma Ashtami on 3 February alongside Ratha Saptami. Its daily Panchang for 3 February shows Saptami until 12:21 PM, with Ashtami beginning afterward. Prokerala's multi-year list gives 4 February 2028, matching OHD.

Do not change this record solely to match the annual list. Check the Bhishma Ashtami tarpan decision time (including whether the applicable rule is Madhyahna or sunrise) against the local Pithoragarh tithi interval, then retain the date selected by that rule.

References:

- Drik Panchang 2028 annual calendar: https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=2028
- Drik Panchang daily Panchang, 3 February 2028: https://www.drikpanchang.com/tamil/tamil-day-panchangam.html?date=03%2F02%2F2028
- Prokerala Bhishma Ashtami dates: https://www.prokerala.com/festivals/bhishma-ashtami.html

### Utpanna Ekadashi — OHD 13 November; Drik annual listing 12 November

Drik's New Delhi annual calendar lists Utpanna Ekadashi on 12 November and Gauna Utpanna Ekadashi on 13 November. The tithi interval reported by another Panchang source begins at 09:30 on 12 November and ends at 06:41 on 13 November. That makes a sunrise-based local decision sensitive to the exact Pithoragarh sunrise and tithi end.

OHD's 13 November date should not be moved until the Pithoragarh sunrise/tithi overlap and Smarta rule are checked directly. Do not add a Vaishnava-only duplicate.

References:

- Drik Panchang 2028 Hindu calendar: https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=2028
- Jyotish Vidya 2028 Ekadashi intervals: https://www.jyotishvidya.co.in/transits/ekadashi-2028
- Drik Panchang Utpanna Ekadashi year list: https://www.drikpanchang.com/vrats/ekadashidates.html?year=2028

## Chaturmas date check

Drik's annual calendar lists Devshayani Ekadashi on 2 July and Devutthana Ekadashi on 28 October 2028. These match the OHD start/end dates. The OHD completion date under its existing two-day completion policy is a separate derived date and should not be confused with the Ekadashi end date.

## Next checks

1. Resolve Bhishma Ashtami with the actual local decision time and Pithoragarh tithi interval.
2. Resolve Utpanna Ekadashi against Pithoragarh sunrise and the Smarta fasting rule.
3. Verify Samaveda Upakarma and regional Durga Puja records with their own rules.
4. Check local eclipse visibility and whether the public catalog should include the event.
5. After the source review, align month-level status and `locationScope` with the verified result.

No public monthly JSON or Blogger rendering was changed in this initial pass.
