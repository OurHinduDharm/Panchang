# विशेष साधना काल एवं पुण्यकाल — गणना शोध नोट

स्थिति: स्मार्त नियम के अनुसार 2026–2030 के चार वारुणी संयोग सार्वजनिक प्रदर्शन हेतु स्वीकृत हैं; महापात और महोदय अभी शोध/सत्यापनाधीन हैं।

## उत्पाद संरचना

मौजूदा **मासिक व्रत-पर्व** पृष्ठ के भीतर collapsible सेक्शन: **विशेष साधना काल एवं पुण्यकाल**

प्रकाशन अवधि: 2026–2030  
संदर्भ स्थान: पिथौरागढ़, 29.5828° N, 80.2182° E, ऊँचाई 1650 m  
समय क्षेत्र: Asia/Kolkata

### केवल वे विभाग जो अभी मौजूदा पंचांग में उपलब्ध नहीं हैं

1. **महापात (सूक्ष्म क्रान्तिसाम्य):** व्यतीपात महापात और वैधृति महापात; स्पर्श और मोक्ष समय।
2. **महोदय योग:** केवल मूल शास्त्रीय लक्षण और गणना-विधि प्रमाणित होने पर।
3. **वारुणी, महावारुणी और महामहावारुणी योग:** केवल सत्यापित तिथि/वार/नक्षत्र नियमों पर।

**संक्रांति इस सेक्शन का अलग डेटा-सेक्शन नहीं होगी।** मौजूदा संक्रांति कार्ड और `sankranti-punya-kala` गणना वहीं बनी रहेगी; संक्रांति का पुण्यकाल दोबारा calculate या display नहीं करना है।

महापात के साथ ही मांगलिक कार्य-वर्जना की चेतावनी दिखाई जाएगी। यह चेतावनी संक्रांति या अन्य योगों पर नहीं लगेगी।

## महापात: गणना-पद्धति संबंधी महत्वपूर्ण भेद

- सामान्य पंचांग के 27 नित्य योगों में व्यतीपात/वैधृति और क्रान्तिसाम्य-आधारित महापात एक ही गणना नहीं हैं।
- महापात का मूल खगोलीय आधार सूर्य और चन्द्रमा की क्रान्ति (declination) का सूक्ष्म साम्य है। घटना के दोनों boundary/root instants खोजने होंगे; केवल दैनिक योग-नाम या राशि-स्थिति से समय निकालना स्वीकार्य नहीं।
- केवल सूर्य-चन्द्रमा के निरयण देशान्तरों का योग लेकर महापात का समय निकालना स्वीकार्य नहीं।
- अलग सिद्धान्त/करण-ग्रंथों में पात-निर्णय, अयन, ग्रहों की स्फुट स्थिति और स्पर्श-मोक्ष की प्रक्रिया का तुलनात्मक अध्ययन करना होगा। चुनी हुई परिभाषा को code और tests में स्पष्ट दर्ज करें।
- आधुनिक राष्ट्रीय पंचांग का सायन व्यतीपात/वैधृति डेटा अपने-आप पारंपरिक महापात का विकल्प नहीं है।

## महोदय योग: प्रारंभिक शोध, अभी implementation rule स्वीकृत नहीं

एक प्रचलित शास्त्रीय वर्णन में पौष/माघ अमावस्या, रविवार, श्रवण नक्षत्र और व्यतीपात योग के पूर्ण संयोग को अर्धोदय कहा गया है। कुछ व्याख्याओं में इन चार में से एक घटक के न्यून होने पर महोदय कहा गया है, लेकिन कौन-सा घटक अनुपस्थित हो और कौन-सी तिथि/मास-परंपरा लागू हो—इसमें मतभेद हैं।

इसलिए:
- अर्धोदय और महोदय को एक ही नाम से न दिखाएँ।
- चार घटकों के संयोग को स्वतः महोदय न कहें।
- धर्मशास्त्र/निबन्ध के मूल पाठ से नियम तय होने तक कोई महोदय तारीख़ सार्वजनिक न करें।
- यदि 2026–2030 में नियम प्रमाणित न हो तो महोदय सेक्शन छिपा रहेगा।

## वारुणी-परिवार: प्रारंभिक नियम और आवश्यक cross-check

### स्वीकृत प्राथमिक profile — स्मार्त निबन्ध परंपरा

काल-निर्णयसिन्धु में उद्धृत वारुणी-निर्णय के अनुसार इस परियोजना का प्राथमिक profile:
- **वारुणी:** चैत्र कृष्ण त्रयोदशी + शतभिषा नक्षत्र का संयोग।
- **महावारुणी:** उपर्युक्त संयोग + शनिवार।
- **महामहावारुणी:** उपर्युक्त संयोग + शनिवार + शुभ नामक नित्ययोग।

इस पाठ में महामहावारुणी के लिए शुभ योग को भी वास्तविक समय-अंतराल में संयोग के साथ उपस्थित होना चाहिए। केवल उसी दिन शुभ योग होना पर्याप्त नहीं।

### पाठ-भेद जिन्हें प्राथमिक गणना में नहीं मिलाना है

नारदपुराण के एक अन्य वर्णन में चैत्र शुक्ल त्रयोदशी, शनिवार और शतभिषा के संयोग को महामहा नाम से कहा गया है। कुछ अन्य संकलनों में महावारुणी/महामहावारुणी की शर्तें अलग तरह से संक्षेपित हैं। ये अलग पाठ-परंपराएँ हैं; इन्हें एक ही rule में जोड़ने से गलत अतिरिक्त तिथियाँ निकलेंगी। इस पंचांग में उपयोगकर्ता की स्मार्त-प्राथमिकता के अनुसार ऊपर दिया गया काल-निर्णयसिन्धु profile मुख्य रहेगा। वैकल्पिक पाठ को केवल आंतरिक शोध में रखा जाएगा, सार्वजनिक गणना में नहीं।

परियोजना का calendarType `purnimanta` है; उसी पंचांग मास-नाम को लिया जाएगा। चैत्र कृष्ण पक्ष को किसी अन्य मास में स्वतः remap नहीं करना है। तिथि, नक्षत्र और शुभ योग के वास्तविक intervals लिए जाएँगे; केवल noon snapshot पर्याप्त नहीं। वार का निर्धारण पिथौरागढ़ के स्थानीय civil date से होगा।

## संक्रांति — मौजूदा सुविधा यथावत

मौजूदा `festival-muhurta.js` में `sankranti-punya-kala` नियम मौजूद है। यह नया फीचर उस सुविधा को duplicate नहीं करेगा। संक्रांति पुण्यकाल का एकमात्र सार्वजनिक display मौजूदा संक्रांति कार्ड/मुहूर्त रहेगा। इस PR में संक्रांति के लिए नया annual data set या दूसरा UI section नहीं बनाया जाएगा।

## UI placement

- मासिक व्रत-पर्व पृष्ठ के भीतर compact/collapsible सेक्शन; mobile-first और हल्का।
- दैनिक पंचांग से केवल approved monthly data होने पर conditional लिंक।
- दैनिक पंचांग पर केवल छोटा लिंक।
- केवल सत्यापित events वाले विभाग दिखें; खाली/अप्रमाणित विभाग छिपे रहें।
- सार्वजनिक पृष्ठ पर किसी बाहरी स्रोत का नाम, URL, citation link या provider branding नहीं।
- स्रोत, तुलना और गणना-पद्धति के विवरण केवल repository के आंतरिक research notes/tests में।

## Acceptance tests

- 2026–2030 data coverage और chronological ordering।
- महापात: चुनी हुई शास्त्रीय परिभाषा के अनुसार सही event class, स्पर्श < मोक्ष, declination/root residual tolerance, timezone और year-boundary cases।
- वारुणी आदि: तिथि/वार/नक्षत्र/नित्य योग boundary, मास-निर्णय तथा leap-year tests।
- महोदय: केवल source-approved rule के लिए tests; अन्यथा section/data absent।
- संक्रांति: existing implementation unchanged; कोई duplicate event/UI/data नहीं।
- अनुपलब्ध/अप्रमाणित data को blank/hidden रखें; कभी अनुमानित समय न दिखाएँ।
- मौजूदा दैनिक पंचांग, मासिक फेस्टिवल, ग्रहण और मुहूर्त tests में regression न हो।

## प्रारंभिक शोध संदर्भ (केवल आंतरिक)

- भास्कराचार्य, *करणकुतूहलम्*, कृष्णदास संस्कृत सीरीज 129 (1991), डॉ. सत्येन्द्र मिश्र सम्पादित, पाताधिकार 9 एवं हिन्दी भावानुवाद: https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf
- Drik Panchang, क्रान्तिसाम्य दोष / महापात: https://www.drikpanchang.com/astrology/mahapata/kranti-samya-dosha.html
- उत्तराखण्ड मुक्त विश्वविद्यालय, MAJY-504, भास्कराचार्य का क्रान्ति-साम्य पात वर्णन: https://uou.ac.in/sites/default/files/slm/MAJY-504.pdf
- वारुणी/महावारुणी/महामहावारुणी के स्कन्दपुराण-आधारित पाठ का शब्दकोशीय उद्धरण: https://upasanayoga.org/VacD-Pages/VacD-354_v%C4%81t-v%C4%81r.htm
- महावारुणी और महामहावारुणी पर निबन्ध-पाठ/परंपरा-भेद: https://www.transliteral.org/pages/z130524061827/view
- महोदय/अर्धोदय का प्रारंभिक वर्णन: https://karmkandvidhi.in/ardhoday-yog/
- निर्णयसिन्धु, अर्धोदय/महोदय पाठ एवं “किञ्चिदून महोदय” खण्डन: https://www.transliteral.org/pages/z130621064615/view

इन संदर्भों को सार्वजनिक पेज पर लिंक या स्रोत-बैज के रूप में नहीं दिखाना है।


## Implementation checkpoint

- `special-punya-kaal.mjs` now joins same-index tithi/nakshatra/yoga fragments split at successive sunrises, then calculates the full exact Trayodashi–Shatabhisha overlap. It no longer labels a pre-sunrise fragment with the previous day's weekday.
- Mahavaruni is assigned only when the true conjunction overlaps local Saturday; its date is that Saturday. Mahamahavaruni is the exact intersection of the conjunction, Shubha nitya-yoga, and the Saturday civil-day interval.
- These records are `research-candidate` only. The primitive is not yet an approved annual calendar generator.
- Automated unit tests cover exact overlap, Saturday condition, Shubha overlap, wrong tithi/nakshatra/month, one-minute scanner gaps, cross-sunrise joining, and weekday assignment.
- The primary source profile is explicitly Chaitra Krishna Trayodashi in the project's Purnimanta calendar; no automatic Amanta/Purnimanta month remapping is permitted.
- Mahapata and Mahodaya remain unimplemented. Public UI now calculates and displays only the four explicitly approved Varuni-family dates through the lazy runtime integration.
- `scripts/generate-special-punya-kaal-review.mjs` now scans every local day from 2026–2030 using the pinned Panchangam engine and writes a research-only JSON candidate file. The existing PR validation workflow runs this generator and uploads its output as an artifact for manual review.


## Source decision update — Varuni family

The primary implementation profile is the Smarta nibandha formulation quoted in Kālanirṇaya-sindhu: Chaitra Krishna Trayodashi + Shatabhisha; Saturday upgrades it to Mahavaruni; an actually overlapping Shubha nitya-yoga upgrades it to Mahamahavaruni. The Nārada Purāṇa passage describing Chaitra Shukla Trayodashi + Saturday + Shatabhisha as Mahamaha is retained as a distinct textual variant and is not merged into this profile.

The Panchangam engine uses zero-based indices: Shatabhisha = 23 and Shubha nitya-yoga = 22. Unit tests now assert those exact indices even when the engine does not supply localized names.


## महापात — स्रोत-आधारित अगला चरण

भास्कराचार्य के *करणकुतूहल*, पाताधिकार (अध्याय 9, विशेषतः श्लोक 5–15; उपलब्ध हिन्दी टीका के पृ. 184–185) में:
- पातयुक्त चन्द्र के शर की गणना,
- सूर्य/चन्द्र बिम्बमान,
- पात-मध्यकाल,
- शरखण्ड से पात की स्थिति,
- स्पर्श और मोक्ष के लिए अलग समय-संशोधन

दिए गए हैं। इस पद्धति को केवल `|सूर्य-चन्द्र क्रान्ति-अंतर| < दोनों बिम्ब-अर्धव्यासों का योग` जैसे अनुमानित नियम में नहीं घटाना है। पहले शरखण्ड-सारणी, अयन/पद-निर्णय और स्थिति-संशोधन को मूल पाठ से पुनः जाँचना होगा।

*सूर्यसिद्धान्त*, पाताधिकार में वैधृति और व्यतीपात की पहचान के लिए क्रान्ति-साम्य के साथ सूर्य-चन्द्र की अयन/राशि-संबंधी शर्तें भी दी गई हैं। अतः दोनों प्रकारों का वर्गीकरण केवल एक root के sign से नहीं होगा।

इस PR में `mahapata-root-solver.mjs` केवल सामान्य bracketed numerical root utility है। यह अभी महापात की खगोलीय परिभाषा नहीं लगाता और कोई तारीख/समय नहीं बनाता। Source-approved signed boundary function तैयार होने के बाद ही इसका उपयोग होगा।


## Cross-sunrise candidate audit

The first full-year run revealed that the Panchang engine splits intervals at sunrise. Treating each split as a separate event incorrectly assigned a pre-dawn Sunday fragment to the preceding Saturday. The candidate builder now joins adjacent same-index intervals across sunrise boundaries before intersecting tithi and nakshatra. It derives the Varuni civil date from the actual local overlap start and applies Saturday upgrades only to the actual Saturday portion. This correction is covered by a 2027-04-04 fixture matching the independently published 04:27–16:32 IST conjunction window.


## 2026–2030 first candidate scan — internal only

Pithoragarh / Asia-Kolkata, Purnimanta, pinned Panchangam engine; all intervals below remain `research-candidate`, not public-approved:

| Gregorian date (local start) | Exact overlap (IST) | Current classification |
|---|---|---|
| 17 Mar 2026 | 06:22:08–09:23:26 | वारुणी candidate |
| 04 Apr 2027 | 04:26:57–16:32:55 | वारुणी candidate |
| 23–24 Mar 2028 | 11:22:19–05:33:52 (next day) | वारुणी candidate |
| 31 Mar 2030 | 00:42:52–19:49:26 | वारुणी candidate |
| 2029 | no conjunction found | no candidate |

The 2027 overlap agrees to the minute with an independent published computation (04:27–16:32 IST). The 2028 overlap also agrees to the minute (23 March 11:22 to 24 March 05:33 IST), but that source explicitly leaves the sunrise-based observance date unsettled because the tithi ends only minutes before the next sunrise. The 2030 overlap agrees with independent tithi/nakshatra timings (31 March 00:42–19:49 IST). For 2029, independent tithi/nakshatra timings show Krishna Trayodashi begins after Shatabhisha ends, supporting the no-candidate result. These matches validate the interval intersection, not the complete source tradition or public observance date.

A 2026 public article calls the event “Maha Varuni” and gives a sunrise-to-07:51 window, even though 17 March 2026 is Tuesday; the chosen Smarta profile reserves Mahavaruni for the Saturday conjunction. This is a nomenclature/rule-profile conflict; do not silently upgrade the 2026 candidate. A fresh cross-check of Drik's 17 March 2026 daily Panchang for New Delhi gives Trayodashi end 09:23, matching the project engine's 09:23:26 to the displayed minute; an independent Ujjain Drik Panchanga copy also gives 09:23:12. Therefore the previously recorded 08:04 discrepancy is not reproduced and should be treated as a stale/misread note, not as current evidence. The exact Pithoragarh page still needs a direct archive capture, and the observance label/window conflict remains unresolved. Keep the candidate research-only until source-profile and local page review are complete.


## Mahapata rule interpretation and modern comparison

The Mahapata section must show only the computed beginning and ending of the subtle Kranti-Samya interval. It must not mark the whole tithi, nakshatra, or civil day as prohibited. During this interval, mantra-japa, tantra-sadhana, snana, dana, shraddha, vrata, worship and homa are described as meritorious; the restriction on marriage and other auspicious samskaras applies only to this Mahapata interval. Do not copy severe or fatalistic source language into the public UI.

The Drik Kranti-Samya page independently confirms that:
- the exact start/end interval is the relevant interval, not the entire day;
- Mahapata Vyatipata and Mahapata Vaidhriti are distinct from the ordinary 27 nitya-yogas;
- mantra and tantra practice are permitted during the interval;
- its published windows are local-time display values.

`scripts/compare-mahapat-ephemeris.mjs` is the primary Drik-style candidate calculator: modern geocentric apparent positions identify equal-declination midpoints and apparent solar/lunar declination-band contacts define sparsha/moksha. The Surya Siddhanta XI.14–15 interval is an optional classical comparison only. Keep all candidates research-only until the listed Drik-style reference checks and edge cases are resolved.


### Numerical comparison: separate the two ayana relations

The research comparison now keeps the two contact functions separate rather than classifying every disk-band overlap by longitude sum:
- **वैधृति relation (same ayana, opposite gola):** `|चन्द्र-क्रान्ति + सूर्य-क्रान्ति|` compared with the sum of apparent semidiameters.
- **व्यतीपात relation (opposite ayana, same gola):** `|चन्द्र-क्रान्ति − सूर्य-क्रान्ति|` compared with the sum of apparent semidiameters.

The numerical workflow now follows the two-stage distinction described in the source research: first find the **mean pāta** when tropical Sun–Moon longitude sum reaches 180° (Vyatipata) or 360° (Vaidhriti); then search three days either side for all **true pāta** roots where the appropriate declinations agree, and retain only roots with the required ayana/gola class. Vyatipata uses opposite ayanas and same-side declinations; Vaidhriti uses the same ayana and opposite-side declinations. For the primary Drik-style interval, solve the apparent declination-band contact roots around the true middle: same-sign declinations use `δMoon − δSun`, opposite-sign declinations use `δMoon + δSun`, and contact occurs when the absolute relation equals the sum of apparent semidiameters. Surya Siddhanta XI.14–15 remains a separately labelled classical comparison only.


## Mean pāta vs true pāta — calculation boundary

Do not calculate Mahapata by scanning every apparent declination-band overlap in isolation. That creates unrelated near-overlap intervals. The classical definition first identifies a mean pāta from the tropical longitude sum, then finds the nearby true equal-declination instant:
- tropical sum 180° → Vyatipata mean pāta; true declinations equal on the same side of the equator;
- tropical sum 360°/0° → Vaidhriti mean pāta; true declinations equal on opposite sides of the equator.

The research script uses the mean-pāta longitude sum only as a search seed, searches ±3 days for true declination equalities, filters every root by the required ayana/gola class, then solves the primary Drik-style apparent band-contact boundaries around the nearest valid root. The optional Surya Siddhanta XI.14–15 interval is stored separately and never overrides those boundaries.


## Mahapata 2026–2030 comparison-model scan — internal only

The class-validated mean-pāta → true-pāta → apparent disk-contact model generated the following research-only windows by local contact-start year:

| Year | Windows found | Review items |
|---|---:|---:|
| 2026 | 27 | 1 |
| 2027 | 29 | 0 |
| 2028 | 28 | 1 |
| 2029 | 27 | 1 |
| 2030 | 24 | 5 |

Cross-check status:
- 2026: the model matches the Drik windows within a few minutes for the shared dates. The 19 March release agrees with the Rajasthan Patrika bulletin to its printed minute. The Drik annual list omits that event. See [the independent audit](../research/paatadhikar/independent-contact-audit.md). The former 25 December window was removed by class filtering.
- 2027 and 2028: the computed mean pātā, true pātā and overlap windows match the independent 2026–2028 table to the minute on sampled dates and throughout the table review.
- The previously reported 19–21 December 2029 extended overlap belonged to the unfiltered model and is absent after ayana/gola classification. The current 2026–2030 output has no interval exceeding 24 hours.
- Class validation rejects equal-declination roots that have the wrong ayana/gola relation. Across 2026–2030 there are 8 review items: 4 seeds have no equal-declination root within ±3 days, while 4 have roots but none has the required Vyatipata/Vaidhriti geometry. The 2030 review set has 5 items; only four of those have no root at all.

Automated tests pin representative 2026–2028 windows, preserve all 8 review items, and run the complete 2023–24 Tara Prasad backtest. The corrected class filter now matches all 30 Tara Prasad rows with both touch and release times; median absolute start/end differences are about 6.77/7.66 minutes (even-sized median averages the two middle values). On 21 June 2023 it rejects an earlier equal-declination root with the wrong ayana relation and selects the later class-correct event. This is evidence for the Drik-style candidate model, not proof that every Panchang uses identical conventions. All events remain research-only. Only 21/30 complete rows have both endpoints within 10 minutes; 27/30 within 30 minutes. The partial 22 March 2023 record has a release delta of −203.88 minutes and requires reconciliation, as do three complete rows with >30-minute differences. See `research/paatadhikar/taraprasad-reference-audit.md`.

An independent full-range equality scan (`--audit`) at 60- and 30-minute sampling finds the same 135 class-compatible roots in 2026–2030, with no unrepresented roots or duplicate intervals. The eight unresolved longitude seeds do not imply eight missing events. This is an internal numerical completeness check, not independent physical validation; unsampled tangencies are not guaranteed.


## महोदय — प्राथमिक शोध-प्रोफाइल

महोदय को “अर्धोदय के चार अंगों में से कोई एक कम हो तो महोदय” मानकर auto-calculate नहीं करना है। निर्णयसिन्धु के उपलब्ध पाठ में यह सामान्य “किञ्चिदून महोदय” व्याख्या निर्मूल बताई गई है।

अलग, स्पष्ट रूप से गणना योग्य प्रोफाइल मराठी विश्वकोश के पर्व-निर्णय में दिया है:
- पौष या माघ अमावस्या,
- सोमवार (सोमवती अमावस्या),
- श्रवण नक्षत्र,
- व्यतीपात नित्ययोग,
- संयोग दिन में होना चाहिए।

इसे **महोदय योग** का research profile माना जाएगा। अमावस्या, श्रवण और व्यतीपात के वास्तविक intervals का intersection निकालकर उसे सोमवार के स्थानीय सूर्योदय–सूर्यास्त के भीतर सीमित करना होगा। पिथौरागढ़ के Purnimanta मास-नाम का ही उपयोग होगा।

**अर्धोदय** अलग संयोग है: पौष/माघ अमावस्या + रविवार + श्रवण + व्यतीपात; स्कन्दपुराण के सेतुखण्ड में मकरस्थ सूर्य और दिन के उदय से संबंधित शर्तें भी आती हैं। इसे महोदय में merge नहीं करना। अभी इस PR में अर्धोदय का annual calculation scope में नहीं है।

निर्णयसिन्धु के पौष-माघ निर्णय में स्पष्ट कहा गया है कि “किञ्चिदून महोदय” वाली व्याख्या निर्मूल है; अर्धोदय के अंगों में से कोई एक घटने पर महोदय घोषित नहीं करना है। उसी पाठ में स्कन्द/हेमाद्रि/मदनरत्न के आधार पर अर्धोदय का मूल संयोग रविवार + अमावस्या + श्रवण + व्यतीपात बताया गया है।

कोड में रखा सोमवार + अमावस्या + श्रवण + व्यतीपात वाला Somavati profile एक अलग द्वितीयक विश्वकोशीय उल्लेख से लिया गया research-only परीक्षण है; अभी इसे निर्णयसिन्धु या किसी अन्य प्राथमिक ग्रन्थ से प्रमाणित नहीं किया गया है। इसे सार्वजनिक Mahodaya नियम नहीं माना जाएगा। 2026–2030 में इस profile के शून्य candidates मिलना केवल scan result है, शास्त्रीय स्वीकृति नहीं।

महोदय के किसी भी public approval से पहले इस अलग Somavati profile के लिए स्वतंत्र प्राथमिक ग्रन्थ-साक्ष्य आवश्यक है। जब तक वह नहीं मिलता, Mahodaya section/data पूरी तरह hidden रहेगा।


## Mahodaya first annual scan

The Pithoragarh/Purnimanta scan covered all 1,826 days in 2026–2030 with no missing sunrise, sunset, tithi, nakshatra or yoga intervals. Under the specific Somavati profile (Pausha/Magha Amavasya + Monday + Shravana + Vyatipata, all overlapping in daylight), it found **zero** candidates in these five years. Therefore the Mahodaya section must remain hidden for this range; do not manufacture an entry from the rejected “one factor missing” interpretation. The rule engine and synthetic boundary tests are present so future years can be scanned consistently.


## करणकुतूहल पाताधिकार — पुराना शोध-निर्णय (अब लागू नहीं)

यह नीचे दिया गया खण्ड पहले *करणकुतूहलम्* की सारणी-विधि को अनिवार्य implementation gate मानता था। उपयोगकर्ता के निर्देश के बाद यह निर्णय हटाया गया है। वर्तमान गणितीय आधार सूर्यसिद्धान्त अध्याय 11 है; नवीन विधि और सीमाएँ [`research/paatadhikar/surya-siddhanta-xi-implementation.md`](../research/paatadhikar/surya-siddhanta-xi-implementation.md) में हैं। नीचे का पाठ केवल पुराने शोध-इतिहास के लिए सुरक्षित है। पूर्व प्राथमिक गणना-स्रोत का नाम *करणकुतूहलम्*, पाताधिकार (अध्याय 9) था:

1. **Mean pāta and type:** tropical Sun–Moon longitude sum of 6 rāśis (180°) → Vyatipata; 12 rāśis (360°) → Vaidhriti. A true pāta is possible only when the corrected declinations reach equality.
2. **True pāta correction:** use the 24-position signed kranti-khanda and shara-khanda sequences. The six base kranti values are 362, 349, 299, 236, 150, 52; the six base shara values are 70, 65, 54, 43, 29, 19. Expand each forward/reverse with the prescribed dhan/ṛṇa signs; do not use a plain longitude-sum timestamp as the true midpoint.
3. **Pāta midpoint:** calculate the remaining shara/kranti segments and interpolate the true equal-declination midpoint. Retain multiple crossings near solstice and select the crossing according to the mean-pāta relation, preserving the others for review.
4. **Sparsha–moksha sthiti:** derive the duration from the अशुद्ध शरखण्ड using the exact coefficient/unit established from the printed shloka 11 and worked example; the 1991 Sudhakara commentary derives an approximate 2203 numerator; preserve the printed sexagesimal units and do not use a decimal shortcut until the denominator transcription is resolved. Apply the result symmetrically before and after the true midpoint. The shloka 12–14 shuddha-khanda tests must be applied; if the shara threshold is exceeded, mark no pāta rather than forcing a time.
5. **Modern comparison only:** the current Astronomy Engine model independently finds the apparent disk-overlap interval and is useful for regression checks, but it must not replace the above table-based method in the final public calculator.

यह पुराना acceptance target निरस्त है। अब पाताधिकार का कार्यशील आधार और संख्यात्मक अनुकूलन सूर्यसिद्धान्त XI.1–15 है; पुराने 2026–2030 परिणाम सार्वजनिक स्वीकृत समय नहीं हैं।

## प्राथमिक ग्रन्थ का प्रत्यक्ष पाठ-परीक्षण — 15 नवम्बर 2026

अब *करणकुतूहलम्* का पूरा उपलब्ध संस्करण (कृष्णदास संस्कृत सीरीज 129, 1991; डॉ. सत्येन्द्र मिश्र सम्पादित, सुमतिहर्ष और सुधाकर द्विवेदी की टीकाओं सहित) पाताधिकार 9 के मूल पाठ, संस्कृत टीका और हिन्दी भावानुवाद से मिलाया गया है। PDF में मुद्रित पृष्ठ 103–109 मूल गणना और पृष्ठ 184–185 हिन्दी भावानुवाद हैं।

पाठ से ये बातें स्पष्ट हुईं:

1. **पात-प्रकार और सम्भवता:** सायन सूर्य + सायन चन्द्र के योग में 6 राशि पर व्यतीपात और 12 राशि पर वैधृति; साथ में समक्रान्ति की वास्तविक शर्त। केवल longitude-sum को घटना का मध्यकाल मानना गलत है।
2. **24 क्रान्ति-खण्ड:** मूल छह मान 362, 349, 299, 236, 150, 52। क्रम/उत्क्रम और धन/ऋण संकेत से चार छह-खण्डीय पद बनते हैं।
3. **24 शर-खण्ड:** मूल छह मान 70, 65, 54, 43, 29, 19। इनका भी वही क्रम/उत्क्रम तथा धन/ऋण विस्तार है। हिन्दी भावानुवाद में ये मान चन्द्रग्रहणाधिकार के श्लोक 6 के अंतर्गत स्पष्ट हैं; पाताधिकार में इन्हीं शर-खण्डों का उपयोग है।
4. **पात-मध्य:** सपात चन्द्र और सायन चन्द्र के 15-अंश खण्डों से गत/भोग्य खण्ड निकालकर, क्रान्ति-खण्ड और शर-खण्ड का धन-ऋण सहित संस्कार किया जाता है। भोग्य खण्ड के तेरहवें भाग का संशोधन भी आवश्यक है। श्लोक 8–9 में शुद्ध शर-खण्डों की संख्या और अशुद्ध शेष से पात-मध्य तक का समय निकाला जाता है; उसके बाद तत्कालिक सूर्य-चन्द्र की क्रान्ति-साम्य जाँच अनिवार्य है।
5. **स्पर्श-मोक्ष स्थिति:** हिन्दी भावानुवाद (पृ. 185, श्लोक 11) अशुद्ध शर-खण्ड के आधार पर स्थिति निकालने का संक्षिप्त नियम देता है। संस्कृत टीका (पृ. 108) में अंक-पाठ OCR से अस्पष्ट है; पृ. 114 पर सुधाकर की व्याख्या स्थित्यर्ध के लिए 2203/(अशुद्धखण्ड) का व्युत्पन्न अनुपात स्पष्ट करती है: चन्द्रगति के 720 और 780 मानों से 2187 तथा 2215 के अनुपात निकलते हैं और आचार्य 2203 का मध्यवर्ती मान लेते हैं। अतः इसे 220 का divisor न समझें। 1902 स्कैन के दोनों उदाहरणों में 5:37 और 11:57 स्थित्यर्ध के पाठ मिलते हैं, लेकिन denominator के OCR अंक और sexagesimal separators अभी image-level verification माँगते हैं।
6. **शुद्ध-खण्ड निषेध:** श्लोक 12–13 में 15 गुणित शर की 480 से तुलना है; 480 से अधिक होने पर पात असम्भव माना गया है। यह test interval calculation से पहले लागू होना चाहिए। श्लोक 14 की वैकल्पिक स्थिति-विधि में भी संस्कृत टीका 480 का उपयोग करती है।
7. **वैकल्पिक स्थिति सूत्र:** श्लोक 14 की संस्कृत टीका (मुद्रित पृ. 109) स्पष्टतः 480 में से शर-शेष घटाकर 9 से गुणा और अन्तिम खण्ड से भाग देने की वैकल्पिक स्थिति-विधि बताती है। हिन्दी भावानुवाद में 48 छपा है, जो सम्भवतः शून्य-लोप/मुद्रण/OCR-पाठभेद है। अतः 48 को code में नहीं लेना है; 480 को भी worked example और पृ. 114 की सुधाकर-व्याख्या से reconcile करने के बाद ही लागू करना है।
8. **महत्वपूर्ण परिणाम:** आधुनिक apparent solar/lunar disk semidiameter-overlap को शास्त्रीय स्पर्श-मोक्ष का पर्याय नहीं माना जा सकता। वह केवल स्वतंत्र comparison है। Public event boundaries शास्त्रीय खण्ड-विधि से ही निकलेंगी।

### अगला implementation gate

- पहले 24 क्रान्ति/शर खण्डों की signed table को independently transcribe करके tests में pin करना।
- एक-एक उदाहरण में मूल ग्रन्थ की पूरी गणना हाथ से दोहराना; मूल पृष्ठ 106–109 के worked examples को golden fixtures बनाना।
- श्लोक 11 के गुणांक/इकाई तथा 480/9 वाली श्लोक 14 वैकल्पिक विधि का मूल मुद्रित पृष्ठ और उदाहरण से निर्णय करना।
- फिर classical midpoint और duration solver को अलग module में implement करना; modern model से तुलना करना, उससे classical output को force-fit नहीं करना।
- कम-से-कम एक व्यतीपात और एक वैधृति उदाहरण में मूल ग्रन्थ के स्पर्श/मध्य/मोक्ष परिणाम reproduce होने तक कोई 2026–2030 public approval नहीं।



## महापात का धार्मिक उपयोग — जप का प्राथमिक शास्त्रीय आधार

*करणकुतूहलम्* (भास्कराचार्य), पाताधिकार 9, श्लोक 15 की सुमतिहर्ष टीका में पात की स्थिति के फल के रूप में यह सिद्धान्त-वचन उद्धृत है:

> पातस्थितिकालान्तरमण्डलैक्यं न शक्यते तज्ज्ञैः ॥  
> स्नानजपहोमदानादिकमाचरेदिति खलु बुद्धिम् ॥

अर्थ: पात-स्थिति के काल में स्नान, जप, होम और दान आदि करने चाहिए — ऐसा निर्देश समझना चाहिए। उपलब्ध 1991 कृष्णदास संस्कृत सीरीज 129 संस्करण में यह उद्धरण मुद्रित पृष्ठ 108–109 के आसपास है (PDF पाठ में पृष्ठ 108)।

**प्रकाशन-सीमा:** यह प्राथमिक उद्धरण महापात के समय *जप* सहित धार्मिक कर्मों का आधार देता है। यह अपने-आप में प्रत्येक महाविद्या की तांत्रिक दीक्षा-साधना, स्तोत्र-पाठ के किसी विशिष्ट विधान, ध्यान की अनिवार्यता, मंत्र-सिद्धि की गारंटी या जप-संख्या के गुणक को प्रमाणित नहीं करता। इसलिए सार्वजनिक कार्ड में केवल इतना कहा जाएगा कि इस पातकाल में स्नान, जप, होम एवं दान का शास्त्रीय निर्देश मिलता है। विशेष तांत्रिक साधना के गुरु-प्रदत्त नियम अलग रहेंगे।

स्रोत: https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf


## मूल उदाहरण से महापात गणना की नई पुष्टि — अभी transcription gate शेष

1991 कृष्णदास संस्कृत सीरीज 129 के उपलब्ध PDF में पाताधिकार के श्लोक 8–15 और सुमतिहर्ष टीका का क्रम अब सीधे पढ़ा गया (PDF पाठ-रेखाएँ लगभग 2716–2798; मुद्रित पृष्ठ 105–109)। इससे निम्न बातें पुष्ट होती हैं:

1. क्रान्ति-खण्डों की 24 पदों में धन/ऋण स्थापना का क्रम टीका में स्पष्ट है: छह क्रम, छह ऋण, छह उत्क्रम, छह क्रम। शर-खण्डों के लिए भी 24 पदों में स्थापना कही गई है।
2. श्लोक 4–7 में गत/भोग्य खण्ड, चापांश और 13वें भाग से क्रान्ति-शर संस्कार की प्रक्रिया है। इसलिए केवल linear declination-root को classical Mahapata solver कहना पर्याप्त नहीं होगा।
3. श्लोक 8–9 तथा टीका में पातमध्य निकालने की प्रक्रिया दी गई है; टीका अंत में सूर्य और चन्द्र की तत्कालीन क्रान्ति समानता से मध्य की शुद्धता जाँचने को कहती है।
4. श्लोक 11 की टीका मध्यकाल से पहले और बाद की समान स्थिति बताती है तथा एक worked example में 5 घटी 37 पल की स्थिति का पाठ मिलता है। 1902 के स्वतंत्र स्कैन में भी 329 अशुद्धखण्ड के साथ यही स्थिति दी गई है; इससे duration example का आंशिक cross-check होता है, लेकिन numerator/गुणांक अभी अस्पष्ट है। उसी उदाहरण के स्पर्श, मध्य और मोक्ष के सूर्योदय-सापेक्ष समय OCR में क्रम-विरोधी हैं; इसलिए इन समयों को अभी golden fixture नहीं बनाया जाएगा।
5. श्लोक 12–13 में 480 की सीमा से पात-सम्भव/असम्भव की जाँच है। श्लोक 14 की टीका भी 480 से शर-शेष घटाकर, 9 से गुणा और अन्तिम खण्ड से भाग देने की अलग स्थिति-प्रक्रिया बताती है। इसे श्लोक 11 की विधि में मिलाकर एक formula नहीं बनाना है।
6. श्लोक 15 के बाद सुमतिहर्ष ने सिद्धान्त का वचन उद्धृत किया है: “स्नानजपहोमदानादिकमाचरेदिति खलु बुद्धिम्।” इसे भास्कराचार्य का स्वतंत्र फलादेश-श्लोक न बताकर टीका में उद्धृत सिद्धान्त-वचन ही कहना चाहिए।

**अगला गणितीय gate:** 1991 संस्करण के पृष्ठ 108–109 और 1902 स्कैन के पृष्ठ 141–143 में श्लोक 11 के गुणांक/इकाई तथा 5:37 उदाहरण का पूर्ण मिलान करना; फिर उसी उदाहरण के स्पर्श/मध्य/मोक्ष को scan से पढ़कर हाथ से reproduce करना। जब तक यह न हो, 24-खण्ड विस्तार, अवधि-गुणक या कोई सार्वजनिक महापात समय calculator से नहीं निकलेगा।

स्रोत: https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf (पाताधिकार 9, विशेषतः PDF text lines 2716–2798; मुद्रित पृष्ठ 105–109)।


## सार्वजनिक Varuni approval checkpoint — 2026–2030

The Smarta Kālanirṇaya-sindhu profile is the public rule profile for the Varuni family. The engine's exact tithi–nakshatra interval intersections have been cross-checked and explicitly date-approved for this release:

| Local conjunction start date | Pithoragarh interval (IST) | Public label |
|---|---|---|
| 17 March 2026 | 06:22–09:23 | वारुणी योग |
| 4 April 2027 | 04:26–16:32 | वारुणी योग |
| 23 March 2028 | 11:22 (23 Mar) – 05:33 (24 Mar) | वारुणी योग |
| 31 March 2030 | 00:42–19:49 | वारुणी योग |

The 2026 Tuesday conjunction is deliberately **not** upgraded to Mahavaruni; that upgrade requires Saturday under the chosen Smarta profile. The 2028 interval is displayed as a continuous conjunction beginning on 23 March and ending on 24 March; no separate sunrise-observance date is asserted. The 2029 scan has no conjunction under this profile.

The public code requires both the approved Smarta rule profile and one of the four explicit dates above. It does not expose future research candidates automatically. Mahavaruni/Mahamahavaruni remain available in the rule engine but no qualifying approved dates occur in this 2026–2030 release. Mahapata and Mahodaya remain hidden and are not implied to be approved by the Varuni release.


## Tara Prasad 30-arcminute contact convention (22 November 2026)

The source endpoints expose a contact-definition mismatch: 55 of 61 printed endpoints imply a declination relation within 0.5 arcminute of 30 arcminutes. Actual apparent disk radii sum to a variable value (roughly 30.5–32.7 arcminutes in this sample), widening most intervals. The explicit `taraprasad-30-arcmin` profile solves `|δMoon − δSun| = 0.5°` for Vyatipata and `|δMoon + δSun| = 0.5°` for Vaidhriti around the same class-correct middle. This is an inferred source convention, not a publisher-confirmed formula or a universal definition of Drik Mahapata.

The fixed 30-arcminute profile improves the 30 complete reference pairs to 24 with both endpoints within one minute and 26 within three minutes; median absolute start/end deltas are 0.374/0.281 minutes. All 31 rows remain accounted for. Source rows 1, 3, 9, 25 and 26 require reconciliation, including the partial release-only row. The residual pattern is not a common timezone offset: April has a whole-window shift, while June/January/February have one-sided discrepancies.

Use `node scripts/audit-mahapat-references.mjs` for the dual-definition report, with source-implied angular boundaries, midpoint/duration deltas and raw records. Primary general scanner default remains `apparent-disks`; request `--contact-model=taraprasad-30-arcmin` explicitly for the inferred Tara Prasad convention. No date-specific corrections or numerical coefficient fitting are used. Details: `research/paatadhikar/taraprasad-reference-audit.md`; unresolved work: #482.
