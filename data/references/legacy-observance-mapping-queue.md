# Legacy-to-Observance Mapping Queue

Status: first-pass candidate list generated from `data/festivals.json` on 2026-10-14. **This is not an approved split or date correction.** Titles are hints only; descriptions/articles and source conventions must be reviewed before mapping.

## Rules for this queue

- Preserve each original `festival-NNN` ID and the full `sourceText`.
- Do not split a record solely because its title contains a slash, comma, or conjunction; some are alternate names for one observance.
- Do consider multiple linked observances where the source describes distinct rites or dates.
- A group relationship does not mean the group start/end dates are the date rules for every member.
- Mark unresolved cases `needs-review`; do not guess.

## Priority A — likely distinct observances or decisions

| Legacy ID | Original title | Candidate interpretation | What to verify |
|---|---|---|---|
| festival-021 | दीपावली / महालक्ष्मी पूजन | Diwali observance + Lakshmi Puja stage or linked observance | Whether one date/card with a puja stage is sufficient; source article's exact scope and muhurat |
| festival-024 | देवोत्थापनी एकादशी एवं चातुर्मास समाप्त | Ekadashi observance + Chaturmas conclusion | Whether the Chaturmas end is linked to this date in the user's tradition; Ekadashi profile/date decision |
| festival-026 | देव दीपावली एवं आकाशदीप दान | Dev Deepawali + Akashdeep Daan | Whether same date, multi-day practice, or separate article-backed observance |
| festival-029 | श्रीमद्भगवद्गीता जयंती / मोक्षदा एकादशी | Gita Jayanti + Mokshada Ekadashi | Shared date relationship and separate descriptions/links; Ekadashi decision profile |
| festival-031 | श्री त्रिपुरभैरवी महाविद्या जयंती, श्रीविद्या जयंती, अन्नपूर्णा जयन्ती | Potentially multiple observances | Verify source tradition, actual number of observances, and all embedded article links |
| festival-038 | मकर संक्रान्ति / सूर्य उत्तरायण प्रारम्भ | Solar ingress + seasonal/ayana label | Whether these should be one solar event with multiple display labels or separate calculated concepts |
| festival-067 | नवरात्रि अष्टमी - महागौरी एवं अन्नपूर्णा | Navratri Ashtami + possibly Annapurna Jayanti | Verify if Annapurna is a separate observance in this context or part of the title's tradition |
| festival-070 | नवरात्रि नवमी - सिद्धिदात्री एवं तारा महाविद्या जयंती | Navami stage + Tara Mahavidya Jayanti | Verify source and whether these are separate linked observances |
| festival-078 | श्री रामानुज, सूरदास, आदि शंकराचार्य जयन्ती | Multiple Jayanti records sharing one legacy date | Independently verify each calendar rule and article; likely separate observances, not one shared rule |
| festival-081 | श्री नृसिंह अवतार जयन्ती, श्री छिन्नमस्ता महाविद्या जयन्ती, श्री शरभ अवतार जयंती | Multiple observances | Verify each source/date and whether any are tradition-specific |
| festival-108 | रक्षा बंधन, संस्कृत दिवस, लव कुश जयंती | Multiple observances on a shared legacy date | Verify independent date rules and all sources; current single URL must not be treated as the source for every item |
| festival-112 | हलषष्ठी, श्री बलराम जयंती | Possibly one observance under alternate names or linked observances | Check user's article and regional naming before splitting |
| festival-113 | श्रीकृष्ण जयंती / श्री कृष्ण जन्माष्टमी, श्री आद्याकाली जयन्ती | Smarta/Vaishnava Janmashtami plus Adya Kali Jayanti | Description already distinguishes tradition-related observances; model separate date decisions and links without flattening |
| festival-120 | श्री वामनावतार एवं श्री भुवनेश्वरी महाविद्या का प्राकट्य | Vamana Jayanti + Bhuvaneshwari Jayanti | Description contains separate article links; retain both and independently validate date rules |

## Priority B — stages / duration must be interpreted, not copied

| Legacy IDs | Group candidate | Important distinction |
|---|---|---|
| festival-001 to festival-012 | Pitru Paksha and Sharadiya Navratri / Vijayadashami | The archive contains period rows and day-specific rows; Navratri 2026 includes a user-clarified Saptami tithi spanning 17–18 October; retain both civil-date coverage and model the observance decision separately. Also review the shared Ashtami/Navami date. |
| festival-025 | Tulsi Vivah period | Legacy start/end range may represent a date window, not an exact wedding muhurat. |
| festival-034, festival-036 | Shakambhari Navratri / Shakambhari Jayanti | Determine which stages are actually represented; don't infer all daily stages from a duration alone. |
| festival-040 and relevant festival-060 to festival-072 | Magha Gupt Navratri / Chaitra Navratri | Keep start, daily tithi/deity, Ashtami, Navami, Parana, and Kalash immersion distinct. Some stages may coincide; calculate rather than assume. |
| festival-059 to festival-072 | Chaitra Navratri, Ram Navami and immersion | Smarta and Vaishnava Ram Navami rows already have different legacy dates; preserve separate tradition scope until independently validated. |
| festival-088 and festival-090 to festival-100 | Ashadha Gupt Navratri | Day labels can repeat on the same civil date when tithis overlap; don't force one stage per day. |
| festival-101 | Harishayani Ekadashi / Chaturmas start | A multi-day endDate should not be used as Chaturmas duration or Ekadashi stage without evidence. |
| festival-003 to festival-011 | Sharadiya Navratri stages | Many rows carry the same endDate; likely legacy display-period metadata, not a stage end time. Per user clarification, “एवं १८ अक्टूबर को” is intentional because Ashwin Shukla Saptami spans 17 and 18 October in the paper Panchang/reference. Do not treat it as a typo; model tithi interval separately from the chosen observance date. |

## Priority C — placeholders / suspicious dates before any recurrence logic

- `festival-054`: `1970-01-01` is a legacy manual-update placeholder, not an event date. User wants this display connected to existing `eclipse-panchang.js` India public-eclipse results so it appears when the module reports an applicable event. Inspect the module API before integration; do not duplicate eclipse calculations.
- `festival-019` through `festival-035`: several dates remain in 2025, although adjacent records use 2026. Verify intended target year and rule; do not bulk-shift dates.
- `festival-117`: User clarified that Bhadrapada Shukla Chaturthi is referred to here as Ganesh Chaturthi and Ganesh Jayanti; do not split or flag this naming as an error. Map to the recurring tithi rule and preserve the original article. Independently verify the appropriate Madhyahna-vyapini rule and review the legacy endDate.
- `festival-009`: title embeds “18 October” while normalized start is 2026-10-17. Per user clarification, Saptami spans 17–18 October; retain this fact and model tithi interval separately from observance-date selection.

## Link preservation audit

A normalized `sourceUrl` field currently stores one extracted URL, while some legacy descriptions contain multiple HTML links. Before splitting records:
1. Extract every URL from the original description into a candidate `sources[]` list.
2. Keep original HTML unchanged in `sourceText.description`.
3. Associate a link with an individual observance only after opening/verifying that article's scope.
4. Never copy the first URL onto all split observances automatically.

## Next review order

1. Treat festival-009, festival-054, and festival-117 per the user's clarifications; focus remaining review on source-dependent exceptions and the stale legacy date block.
2. Inspect source articles for the candidate combined records above and mark each as `same-observance-alias`, `linked-observances`, or `unresolved`.
3. Create mapping records with `legacyId`, `candidateObservanceIds`, `decisionStatus`, and `evidence`; only then design the actual data migration.
4. Validate that all 122 legacy IDs and source text remain recoverable after any future migration.


## User clarifications (2026-10-14)

See [`festival-user-clarifications-2026-10-14.md`](festival-user-clarifications-2026-10-14.md). Legacy 2025 dates are stale manual display values and should eventually be replaced by recurring rule-based calculation, not bulk-shifted. Eclipse placeholder should be replaced by a connection to the existing eclipse module's India event results. These are implementation requirements; no runtime changes have yet been made.
