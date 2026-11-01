# 2027 Festival Source Cross-check — Initial Pass

Review date: 2026-11-02  
Scope: `data/festivals/2027-01.json` through `2027-12.json`  
Purpose: record source comparisons and resolve obvious calendar differences without changing valid dates merely to force agreement.

## Repository snapshot

- The twelve 2027 monthly files contain 121 event records.
- All 121 individual records currently have `reviewStatus: "approved"`.
- Eleven month files (January–November) still have month-level `status: "needs-review"`; December is `approved`.
- All twelve files still say `locationScope: "प्रारंभिक डेटा; गणना-समीक्षा आवश्यक"`.

This is a metadata inconsistency, not evidence that the individual dates are wrong. Month-level status should be aligned only after the source review is completed. Do not bulk-promote the year based solely on individual event flags.

## Main calendar cross-check

The 2027 event dates were compared with the Drik Panchang annual calendar and the Dehradun annual Panchang published by Global Panchang. The broad recurring calendar dates align across most of the year: January–April, June–July, September–December. May and August contain the important distinctions below.

Primary references:

- Drik Panchang, 2027 Hindu calendar (New Delhi): https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=2027
- Global Panchang, Dehradun 2027: https://globalpanchang.com/panchang/dehradun/2027
- Drik Panchang, 2027 Ekadashi dates (New Delhi): https://www.drikpanchang.com/vrats/ekadashidates.html?year=2027

## Resolved calendar differences

### Krishna Janmashtami — 24 August (Smarta)

The OHD record on 24 August is explicitly titled `श्रीकृष्ण जन्माष्टमी (स्मार्त)`. Global Panchang's Dehradun calendar also lists 24 August. Drik's general Janmashtami page lists 25 August, but its own explanation says that when two consecutive dates occur, the earlier is Smarta and the later is Vaishnava. Therefore, do not move the OHD Smarta observance to 25 August and do not add an ISKCON/Vaishnava card.

References:

- Drik Panchang Janmashtami 2027: https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html?year=2027
- Global Panchang Dehradun 2027 (August section): https://globalpanchang.com/panchang/dehradun/2027

### Akshaya Tritiya — 9 May

OHD records Akshaya Tritiya on 9 May. Drik's 2027 Hindu calendar and its Uttarakhand city pages for Rishikesh and Haridwar also give 9 May. Global Panchang's Dehradun summary lists 8 May, so this is a genuine source/location discrepancy worth retaining in the audit trail; it is not a reason to change the OHD date to 8 May.

References:

- Drik Panchang, Akshaya Tritiya 2027 for Rishikesh: https://www.drikpanchang.com/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html?geoname-id=1258128
- Drik Panchang, Akshaya Tritiya 2027 for Haridwar: https://www.drikpanchang.com/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html?geoname-id=1270351
- Global Panchang Dehradun 2027: https://globalpanchang.com/panchang/dehradun/2027

## Pithoragarh-specific spot checks

- Makar Sankranti: 15 January 2027, confirmed by Drik Pithoragarh; the astronomical transition occurs on 14 January at 21:14, with the observance/punya-kala on 15 January.
- Maha Shivaratri: 6 March 2027, confirmed by Drik Pithoragarh; Nishita puja and all four prahar windows are listed for that date.
- Diwali / Lakshmi Puja: 29 October 2027, confirmed by Drik Pithoragarh's Lakshmi Puja year list.

References:

- https://www.drikpanchang.com/sankranti/makar-sankranti-date-time.html?geoname-id=1259503
- https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html?geoname-id=1259503
- https://www.drikpanchang.com/festivals/lakshmipuja/festivals-lakshmipuja-timings.html?geoname-id=1259503

## Ekadashi and Chaturmas spot checks

The main Smarta Ekadashi dates in the 2027 catalog align with Drik's 2027 Ekadashi calendar, including Devshayani Ekadashi on 14 July and Devutthana Ekadashi on 10 November. Drik also lists the corresponding Gauna/Vaishnava observance on the following day where applicable. OHD should keep the Smarta date as its primary record and must not add Vaishnava-only entries unless separately requested.

References:

- Drik Panchang, 2027 Ekadashi dates: https://www.drikpanchang.com/vrats/ekadashidates.html?year=2027
- Drik Panchang, November 2027 festival calendar: https://www.drikpanchang.com/festivals/month/festivals-november.html?year=2027

## Remaining checks before changing month-level status

1. Verify special/regional records not covered by the general annual calendar, especially Samaveda Upakarma, Yugadi observances, and regional Durga Puja entries.
2. Confirm the remaining city-sensitive observances against Pithoragarh tithi/decision times where a dedicated Drik page exists.
3. Check article links and duplicate aliases across the full 2027 catalog.
4. Once these checks are complete, align the month-level status and `locationScope` with the actual result. Do not alter public event dates unless a specific source/rule mismatch is found.

No public monthly JSON or Blogger rendering was changed in this initial source-review pass.
