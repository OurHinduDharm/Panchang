# Festival discrepancy audit — first pass

Updated: 2026-10-15  
Branch: `data/festival-json-foundation`  
Scope: first-pass scan of 123 structured records plus cross-checks of high-impact 2026 entries. This is an issue list, not a claim that every listed difference is an error. Same-date observances can be legitimate; regional and ritual rules must be separated from raw dates.

## High priority — likely data/rule conflict

### 1. Dhulandi / Rangwali Holi — festival-055
- Draft date: 3 March 2026.
- The preserved description explicitly says the colour festival is 4 March.
- Government of India holiday calendar lists Holika Dahan on 3 March and Holi on 4 March; Drik Panchang also lists Rangwali Holi/Dhulandi on 4 March.
- Action: correct the active date/rule to 4 March 2026 in the 2026 historical example, but recurring output should be calculated from the Holika Dahan/Purnima observance rules rather than hard-coded annually.
- References: https://www.india.gov.in/calendar?date=2026-03-02 ; https://www.drikpanchang.com/festivals/holi/festivals-holi-rangwali.html?year=2026

### 2. Gayatri Jayanti — festival-087 and festival-110
- festival-087 is the consolidated record and correctly carries both user-approved observances: Jyeshtha Shukla Ekadashi and Shravan Shukla Purnima.
- festival-110 is a second legacy Gayatri Jayanti record whose active date is 28 August 2026 (Shravan Purnima), but its metadata says Jyeshtha Shukla Ekadashi. In 2026, Jyeshtha Shukla Ekadashi is reported on 25 June; 28 August is Shravan Purnima.
- Action: preserve the source record for provenance but prevent duplicate rendering; route both traditions through festival-087, unless a later renderer explicitly de-duplicates the two records.
- References: https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1269446 ; https://www.vedkosh.com/festivals/gayatri-jayanti

### 3. Sharadiya Navratri Ashtami/Navami — festival-009 to festival-012
- festival-010 says Mahashtami on 19 October; festival-011 says Mahanavami on 20 October, but its preserved source date is 19 October. These records disagree internally and also conflict with North-Indian calendars listing Ashtami on 18 October, Navami on 19 October, and Vijayadashami on 20 October.
- Bengali Durga Puja schedules can assign the principal Ashtami/Navami rituals to different civil dates; the legacy descriptions explicitly mention Bengal-specific multi-day observances.
- Action: do not globally change the dates until the site’s intended regional rule is stated. For the default Pithoragarh/local-Panchang display, calculate tithi transitions and sunrise observance locally; keep Bengal-specific ritual days separately labeled. This is urgent because the festival is in progress on 15 October 2026.
- References: https://timesofindia.indiatimes.com/religion/festivals/navratri-2026-start-end-date-is-ghatasthapana-on-october-10-or-11-check-the-full-tithi-schedule/articleshow/134767429.cms ; https://bengali.indianexpress.com/lifestyle/durga-puja-2026-durga-puja-calendar-saptami-ashtami-navami-12677025

### 4. Sharad Purnima / Kojagari — festival-013
- Active candidate date is 25 October 2026; preserved source date is 26 October.
- Current reports describe the full-moon tithi spanning 25–26 October, so the difference may be a genuine observance-rule issue rather than a simple typo.
- Action: calculate local Purnima start/end and moonrise; specify whether the record means the tithi, Kojagari-night observance, or a regional puja day before selecting one display date.
- Reference: https://navbharattimes.indiatimes.com/astro/religion-rituals/festivals-and-fasts/sharad-purnima-vrat-2026-date-and-puja-vidhi-sharad-purnima-nishita-kaal-and-moonrise-time/articleshow/134907850.cms

### 5. Narak Chaturdashi / Kali Chaudas — festival-020
- Both names are combined in one record, but 2026 calendars may list Kali Chaudas on 7 November and Narak Chaturdashi on 8 November, depending on the ritual definition and regional tradition. Diwali/Lakshmi Puja is 8 November in the local calendar references checked.
- Action: separate the observances or explicitly store their distinct rules; do not force Kali Chaudas and Narak Chaturdashi to share one date merely because the legacy title combines them.
- References: https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1256569 ; https://www.drikpanchang.com/diwali/diwali-puja-calendar.html?geoname-id=1258044

## High priority — placeholder / stale legacy dates

### 6. Solar eclipse placeholder — festival-054
- Active date is `1970-01-01`, explicitly marked as a placeholder.
- Action: never display this as a real event date. Generate eclipse events from `eclipse-panchang.js`; separate astronomical occurrence, local visibility, and ritual/sutak guidance.

### 7. Hanuman Jayanti — festival-019
- Title and active date still say 2025; description also appends “कामेश्वरी जयन्ती” to Hanuman puja content.
- The rule describes the site's second observance as Kartik Krishna Chaturdashi, while the common Chaitra Purnima Hanuman Jayanti tradition is not represented by this record.
- Action: audit both accepted observance traditions, split unrelated Kamakshi/Kameshwari content if it is not intentionally associated, and remove the stale year from the recurring title.

### 8. Tulsi Vivah — festival-025
- Active date range is 2–5 November 2025 and the rule text says Kartik Shukla Dwadashi through Purnima.
- Action: determine whether this is a multi-day ritual window or a single Vivah observance; compute the 2026 local tithi and keep the old range only as source provenance.

## Medium priority — possible conceptual conflations

### 9. Ganesh Chaturthi / Ganesh Jayanti — festival-117
- One record combines Bhadrapada Shukla Chaturthi, Ganesh Chaturthi, Ganesh Jayanti, and Ganeshotsav commencement. “Ganesh Jayanti” is also used for Magha Shukla Chaturthi in another tradition, so the names may be conflating two distinct observances.
- Action: verify the source article and tradition; if intended, keep Bhadrapada Ganesh Chaturthi separate from Magha Shukla Chaturthi / Til-Kund / Varad Chaturthi records.

### 10. Same-date entries and combined titles
- Duplicate civil dates are common and are **not automatically errors**: examples include Navami/Dashami transitions, Ekadashi plus a Dwadashi-based observance, eclipse plus Holi-related records, and Raksha Bandhan with Shravan Upakarma/Gayatri Jayanti.
- Combined legacy titles such as “Tripurabhairavi, Sri Vidya, Annapurna Jayanti” or “Ramanuja, Surdas, Adi Shankaracharya Jayanti” need a source check to ensure every included observance truly belongs on that same calculated date.

## Mechanical scan results (not final verdicts)
- 123 records total; all are still marked `needs-review`.
- 2 descriptions are empty; 32 records have no extracted article URL. These need content/link review, but a missing link is not a date error.
- One explicit placeholder date (`1970-01-01`) was found.
- The scan found repeated names and many same-date clusters; these are candidates for review, not automatic deduplication. Same-day festivals and tradition-specific overlaps must be preserved when legitimate.

## Next review order
1. Finish the live 2026 Navratri / Vijayadashami / Sharad Purnima tithi audit for the site's chosen default location and separate regional Bengal observances.
2. Correct the confirmed Dhulandi date mismatch and mark the eclipse placeholder as non-renderable.
3. Consolidate Gayatri Jayanti rendering around festival-087 and prevent festival-110 from duplicating it.
4. Review Diwali/Kali Chaudas/Narak Chaturdashi and Tulsi Vivah as multi-stage/region-sensitive observances.
5. Continue the remaining 123-record audit, keeping sourceText unchanged and logging every correction with evidence.
