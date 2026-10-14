# Vrat-Parichay ↔ legacy festival records: alias-match draft

Date: 2026-10-14  
Branch: `data/festival-json-foundation`  
Status: **Manual first-pass mapping; no runtime changes**

## Why this file exists

The contents of *Vrat-Parichay* cannot be compared with the 122 legacy records by exact title alone. Some records combine several observances, use alternate names, or point to an article whose linked text differs from the card title. Conversely, similar words do not prove two observances are identical.

This draft maps obvious/likely relationships to the current `data/festivals.json` records. It does not claim that all source article content has been semantically reviewed. IDs refer to the current draft branch's legacy data.

## A. Clear or strong name-level matches

| Vrat-Parichay contents name | Legacy record | Match status | Notes |
|---|---|---|---|
| नवरात्रव्रत / महाष्टमी / महानवमी / विजयादशमी | festival-003–012; festival-059–072; festival-088–100 | **Covered as stages / related** | Monthly/seasonal Navratri series exists, but verify each observance-date decision separately. Do not use the book's table of contents to override the user's existing 17/18 Oct 2026 Saptami note. |
| कोजागरव्रत / शरत्पूर्णिमा | festival-013 | **Strong alias/combined record** | Existing title explicitly combines Kojagari and Sharad Purnima. |
| करकचतुर्थी | festival-015 | **Strong likely alias** | Karak Chaturthi is commonly associated with Karwa Chauth; verify the book's exact observance context before treating every ritual as identical. |
| गोवत्सद्वादशी | festival-017 | **Name match** | Existing record. Preserve other Kartik Krishna observances separately where meanings differ. |
| यम-दीपदान | festival-018 and/or festival-020 | **Related; not yet exact** | Existing Dhanteras/Narak Chaturdashi records may carry related practices, but the exact ritual-day assignment needs body-text/source verification. Do not merge solely by proximity. |
| धनत्रयोदशी | festival-018 | **Name/observance match** | Dhanteras/Dhanvantari record exists. |
| रूपचतुर्दशी / नरकचतुर्दशी | festival-020 | **Strong alias/combined record** | Existing record combines Narak Chaturdashi and Kali Chaudas; check source description for Rup Chaturdashi coverage. |
| दीपावली / लक्ष्मीपूजन | festival-021 | **Strong alias/combined record** | Existing record combines Diwali and Mahalakshmi Puja. |
| गोवर्धनपूजा / अन्नकूट | festival-022 | **Strong alias/combined record** | Existing record combines both names. |
| यमद्वितीया | festival-023 | **Strong alias** | Existing title includes Yam Dwitiya. |
| प्रबोधिनी/शुक्लैकादशी (Kartik) | festival-024 | **Related to named record** | Devotthani Ekadashi exists; still needs recurring Ekadashi decision logic rather than a generic one-off title. |
| तुलसीविवाह | festival-025 | **Name match** | Existing record is a “vidhan start” title; check its range and whether the display means start of a multi-day practice. |
| वैकुण्ठचतुर्दशी | no obvious standalone ID | **Possible gap** | Do not assume Dev Deepawali (festival-026) is equivalent; inspect source rule and the legacy article links. |
| भैरवजयन्ती | festival-027 | **Strong likely alias** | Existing title says Mahakal Bhairav Jayanti; verify the date-rule/observance scope. |
| धनुसंक्रान्ति | festival-033 | **Name match** | Existing solar-ingress event; any vrat-specific rule should be separate from the ingress event. |
| मकरसंक्रान्ति / उत्तरायण | festival-038 | **Name match** | Existing record. |
| वक्रतुण्डचतुर्थी / वरदचतुर्थी / गणेशव्रत | festival-041 and possibly festival-117 | **Related, not equivalent by default** | Festival-041 is Til Kund/Varad Chaturthi; festival-117 is Ganesh Jayanti per user clarification. Verify month/tithi before linking; do not collapse distinct Chaturthi observances. |
| श्रीपंचमी / वसन्तपंचमी | festival-042 | **Name match** | Existing Vasant Panchami/Saraswati Puja. |
| भीष्माष्टमी / भीष्मतर्पण | festival-044 | **Name match** | Existing Bhishmashtami and Tarpan. |
| रथांकसप्तमी / मार्तण्डसप्तमी / भानुसप्तमी | festival-046 | **Likely related aliases; verify source** | Ratha Saptami exists. Confirm whether each label in this edition is used for the same observance/rule. |
| मासशिवरात्रि | festival-050 | **Related but not equivalent** | Maha Shivaratri exists, but monthly Masik Shivaratri is a distinct recurring rule family and should not be marked fully covered by festival-050. |
| कृष्णैकादशी / शुक्लैकादशी (generic monthly contents headings) | festival-016, 024, 029, 051 and other named Ekadashi entries | **Rule-family coverage incomplete** | Named Ekadashis exist, but generic monthly Ekadashi occurrences and Smarta/Vaishnava decisions are not represented by these few annual records. Continue the separate Ekadashi research track. |
| संकष्टचतुर्थी | no clear monthly series record | **Recurring-rule gap** | A specific Varad/Til Kund Chaturthi record does not establish that monthly Sankashti Chaturthi is implemented. |
| कालाष्टमी | festival-049 and festival-074 | **Related recurring records** | Two records are titled Masik Kalashtami. Check their dates/rule fields and avoid adding another duplicate solely from the contents listing. |
| ऋषि पंचमी | festival-118 | **Name match** | Existing record. |
| गंगा दशहरा / गंगा पूजन | festival-085 | **Related, not necessarily equivalent** | Ganga Dussehra exists; the separate Ganga Pujan entry needs body-text context before deciding whether it is an alias or a distinct rite. |
| गुरु पूर्णिमा / व्यास पूजा | festival-102 | **Strong likely match** | Existing Guru Purnima; verify that the linked description covers the book's specific Vyasa Puja observance. |
| श्रीजगन्नाथ रथयात्रा | festival-091 | **Name match** | Existing record. |
| श्री हनुमान जयन्ती vs हनुमज्जन्म-महोत्सव | festival-019 and festival-073 | **Related duplicate family; inspect before consolidation** | One legacy title includes 2025 and another is general. Do not alter dates or consolidate records as part of this audit. Book label alone does not prove the exact observance date tradition. |
| जानकीव्रत / लक्ष्मी-सीताष्टमी | festival-080 may be related | **Uncertain** | Janaki Navami is Sita Jayanti; a separate Janaki Vrat/Lakshmi-Sita Ashtami may not be the same. Check printed body pages. |
| होलिकादहन | festival-052 | **Name match** | Existing record. |

## B. High-priority likely gaps or under-modelled rule families

| Book contents candidate | Why it is not marked covered | Suggested next action |
|---|---|---|
| वरुणी योग | No obvious standalone record; this may be a condition/yoga rather than an annual named festival | Inspect printed page and define the exact yoga predicate before calendar inclusion |
| केदार दर्शन; चैत्री अमावस्या; पितृ व्रत | No exact standalone title found in the 122 names | Read source passages and determine whether separate public observances or descriptions of a general rite |
| पंचरात्र | Duration-based vow, not necessarily a single-day event | Establish start/end rule and relevance before display |
| वैशाख स्नान; माघ स्नान | Seasonal/month-long practices are not represented by one-day records | Model date range and regional convention if needed |
| चण्डिका नवमी; निंब/कमल/शर्करा सप्तमी; वैशाखी अष्टमी | No clear exact matches found | Verify source passage and whether these are distinct calendar rules |
| वट सावित्री व्रत | No obvious standalone title among the 122 names | High-priority alias/source review; establish regional tithi/date convention |
| निरजला एकादशी | No obvious named record in current 122 titles | Add to Ekadashi source/rule queue, not as a stale fixed date |
| स्कन्द षष्ठी | festival-007 is Navratri Panchami/Skandamata, not Skanda Shashthi | Do not treat the shared “Skanda” word as a match; inspect month-specific Skanda Shashthi rule |
| अशून्य शयन व्रत; कजली तीज; स्वर्ण गौरी; मंगला गौरी | No clear exact standalone record | Verify source and region; Mangala Gauri may be weekday/month series |
| बहुला व्रत; चन्द्र षष्ठी; उमा-महेश्वर व्रत; गोगा नवमी; वत्स द्वादशी; कुशाग्रहणी | No exact or certain title-level match; Janmashtami/other Bhadrapada entries are not enough | Compare body text and aliases; retain region-specific scope |
| मौन व्रत; अनन्त व्रत; दुर्वाष्टमी; महालक्ष्मी व्रत; नन्दा नवमी | No clear exact standalone match | Inspect source; distinguish annual observance from general vrata practice |
| बिल्व निमन्त्रण; बिल्व सप्तमी; सरस्वती शयन सप्तमी; अपराजिता पूजा | Navratri stages exist, but these ritual observances may not be explicitly represented | Inspect the stage text and current descriptions before adding a separate item |
| जय पंचमी; गोपाष्टमी; शाक सप्तमी; आशा दशमी; आरोग्य व्रत | No clear standalone match | Classify as main-calendar candidate vs specialised vrata after body-text review |
| पिशाचमोचन यात्रा; अनंग त्रयोदशी; रुक्मिणी अष्टमी; सुरूप द्वादशी | No clear exact standalone match | Verify source and regional calendar relevance |
| अधिमास/पुरुषोत्तम मास व्रत | No explicit intercalary-month observance family in the 122 title list | Design a separate Adhika-Masa rule; don't assume every year has it |
| Sankranti-specific vows, Ayana/Paksha vows | Existing Sankranti/Ayana events do not automatically cover each vrata rule | Keep event marker separate from vrata-specific observance predicate |
| Weekday vows; Nakshatra/Yoga/Karana/Bhadra/Vishti vows | Panchanga factors and vrata practice are broader than festival cards | Place in a reference/rule catalog if needed, not the main festival feed by default |
| Eclipse-related vows | Existing eclipse records exist, but they are event markers, not proof that the related ritual rule is implemented | Reuse `eclipse-panchang.js`; separate global event, India visibility, location visibility and ritual guidance |
| Prayashchitta, health/affliction-specific vows | Not normal festival-feed candidates | Keep out of public festival list unless a separate vrata-reference feature is explicitly planned |

## C. Do not misclassify these as missing or covered yet

1. **Same word ≠ same vrata.** “Skanda” in Skandamata is not evidence of Skanda Shashthi coverage.
2. **Related ritual ≠ identical date rule.** Ganga Pujan and Ganga Dussehra, Vyasa Puja and Guru Purnima, or Yama Deepdan and Dhanteras/Narak Chaturdashi need source-context checks.
3. **One annual record ≠ recurring family.** One named Ekadashi does not implement all monthly Ekadashis; Maha Shivaratri does not implement Masik Shivaratri.
4. **Combined legacy titles must be preserved for now.** The user has explicitly identified the Bhadrapada Shukla Chaturthi record as Ganesh Chaturthi/Ganesh Jayanti. Do not split or flag it as wrong merely because the legacy title and linked article use different wording.
5. **Do not update old dates here.** This is only an alias/gap review. The legacy date values remain untouched.

## Sources and limits

- Book OCR contents: `data/vrat-parichay-chunks/part-001.txt`, `part-002.txt`; specialised disease/affliction section sampled in `part-003.txt`.
- Compared fields: `name` and `sourceText.title` from all 122 records in `data/festivals.json`; description/article semantics have not all been manually read.
- Printed-page references and OCR spellings are provisional until checked against the relevant body passage/page image.
- Public bibliographic listing identifies *Vrat-Parichay* by Hanuman Sharma as a Gita Press publication, but this file uses the repository's OCR as the working contents source: [bibliographic listing](https://www.pustak.org/index.php/books/bookdetails/1173).

## D. Body-text spot checks completed (OCR chunks)

These checks go beyond the contents list, but are still OCR-text checks rather than verified page-image transcription.

| Candidate | OCR evidence location | What the body text says at a glance | Implication for our model |
|---|---|---|---|
| Sankashti Chaturthi | `part-006.txt` and `part-010.txt` | The text describes it as a Krishna Chaturthi vrata observed each month and selects the Chaturthi that remains at moonrise; if the moonrise-tithi occurs on two days, it gives a decision note. | **Confirmed rule-family candidate**, not a one-off annual event. Preserve the moonrise predicate and test the two-day edge case against the full passage before coding. |
| Pradosh Vrat | `part-007.txt`, `part-010.txt`, and `part-011.txt` | The text describes observance on Trayodashi in both Krishna and Shukla paksha each month; the passage mentions evening/night worship context. | **Confirmed recurring-rule candidate**. Need exact Pradosh-kala and tithi overlap criteria from full source, not just “Trayodashi = Pradosh”. |
| Vata Savitri Vrat | `part-012.txt` | The passage explicitly notes differing authorities: Jyeshtha Shukla Purnima according to Skanda/Bhavishyottara and Amavasya according to Nirnayamrita and similar authorities; it says Amavasya is commonly followed in the country described by the book. | **Do not encode one universal date rule**. Store tradition/source-specific decision profiles if this is implemented; verify exact edition/page and current regional scope. |
| Nirjala Ekadashi | `part-013.txt` | The text identifies Jyeshtha Shukla Ekadashi as Nirjala and gives vrata/parana-related guidance. | **High-priority named Ekadashi candidate**. Add to the separate Ekadashi source/rule review, not as a fixed date. Keep Smarta/Vaishnava profiles distinct. |
| Ashunya Shayan Vrat | `part-014.txt` | The text describes a multi-month observance from Shravan Krishna Dwitiya through Margashirsha Krishna Dwitiya and gives a tithi-selection instruction (Purvaviddha, with a stated fallback). | **Duration-based observance**, not merely a single annual festival card. Model the range and annual start/end decisions separately if it is ever exposed. |
| Mangala Gauri Vrat | `part-015.txt` | The text includes a sankalpa for a five-year observance and ritual instructions; the contents place it in the Shravan observance section. | **Likely recurring weekday/month plus multi-year sankalpa**, not a generic one-day annual title. Verify the complete rule and regional practice before calendar display. |
| Ekadashi examples | `part-011.txt`, `part-012.txt`, `part-013.txt`, `part-016.txt`, `part-017.txt`, `part-019.txt`, `part-020.txt` | The text gives different named Ekadashis by month/paksha (e.g., Apara, Nirjala, Aja, Padma, Papankusha, Rama). | Confirms why one or two legacy named records cannot stand in for the entire recurring Ekadashi family. Full rule decisions remain in the separate Ekadashi track. |

### Implementation gate after these checks

No executable date rule should be added from these excerpts alone. For each rule, the next source note must capture the complete relevant passage, source authority/edition, printed page verified against the scan, calendar profile, time/kala predicate, conflict handling, and at least one worked local-time example plus regression test.

