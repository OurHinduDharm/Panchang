# Festival review queue

Updated: 2026-10-15  
Branch: `data/festival-json-foundation`  
Status: manual queue snapshot/specification only; no live dashboard or notifications yet.

## What must be reviewed?

Queue a festival if any condition applies:
1. `verificationStatus` is missing or is `needs-review` / provisional.
2. Its date is a legacy candidate and the recurring tithi/observance rule is not verified.
3. A ritual time (sunrise, aparahna, pradosh, nishita, moonrise, parana, tithi boundary) is not calculated and tested.
4. A source conflict or title/description/date mismatch is known.
5. It falls within the next 30 days and still has any unresolved flag.
6. Fresh calculation differs from the stored date, or a proposed override differs from the computed date.

A date difference is a review flag, not automatically an error. Keep computed date, display date, Ganesh Martand reference date, reason, source and decision separate.

## Status meanings

- `needs-review`: not verified; queue it.
- `source-conflict`: sources or record fields disagree; high priority.
- `owner-reference-checked`: owner compared against the printed Ganesh Martand Panchang for this year. This alone does not certify every tithi boundary or muhurta.
- `approved-for-application`: reviewed exception may be applied by the resolver.
- `rejected`: do not apply.
- `reference-recorded-pending-renderer` / `reference-recorded-pending-record-mapping`: not ready for automatic use.

Primary reference: the owner's printed Ganesh Martand Panchang. Drik Panchang is a secondary cross-check where it agrees. A conflicting Drik date must be reviewed, not accepted automatically.

## First manual review-soon list (15 Oct–14 Nov 2026)

This is a snapshot of the current draft data, not a claim that every date is wrong.

| Priority | ID | Festival | Draft date | Review reason |
|---|---|---|---|---|
| High | festival-007 | शारदीय नवरात्र पंचमी | 15 Oct | Date/rule not fully verified |
| High | festival-008 | शारदीय नवरात्र षष्ठी | 16 Oct | Date/rule not fully verified |
| High | festival-009 | शारदीय नवरात्र सप्तमी | 17 Oct (civil span through 18 Oct noted) | Tithi span vs observance date |
| High | festival-010 | महाष्टमी | 19 Oct | Compare against hard copy; ritual reconciliation remains |
| Checked | festival-011 | महानवमी / दुर्गा नवमी | 19 Oct | Owner reports Ganesh Martand confirms this date |
| High | festival-012 | विजयादशमी | 20 Oct | Hard-copy comparison and rule check |
| High | festival-013 | कोजागर/शरद पूर्णिमा | 25 Oct | Khीर/moonlight timing and 26 Oct Ashwini Purnima distinction |
| High | festival-014 | कार्तिक मास प्रारंभ | 26 Oct | Local tithi boundary and Purnimanta rule |
| High | festival-015 | करवाचौथ | 29 Oct | Moonrise observance rule |
| High | festival-016 | रमा एकादशी | 5 Nov | Dashami-vedha, Harivasara and sunrise rule |
| High | festival-017 | गोवत्स द्वादशी | 5 Nov | Tradition/observance rule |
| High | festival-018 | धनतेरस / धन्वन्तरि जयंती | 6 Nov | Pradosh rule and muhurta |
| High | festival-124 | काली चौदस | 7 Nov | Nishitha rule; keep separate from Narak Chaturdashi |
| High | festival-020 | नरक चतुर्दशी / अभ्यंग स्नान | 8 Nov | Pre-sunrise observance rule |
| High | festival-021 | दीपावली / महालक्ष्मी पूजन | 8 Nov | Amavasya/Pradosh/Nishitha timings |
| High | festival-022 | अन्नकूट / गोवर्धन पूजा | 10 Nov | Pratipada observance rule |
| High | festival-023 | भ्रातृ द्वितीया / यम द्वितीया | 11 Nov | Aparahna observance rule |

Owner-reported dates still to map to a catalog record: Papankusha Ekadashi — 22 Oct; Pradosha — 23 Oct; Ashwini Purnima — 26 Oct. Check for existing records before adding new cards.

## Draft review helper

A first draft-only form is available at `festival-review.html`. It loads the festival catalog and current overrides, then creates one JSON record; it does not write to GitHub or affect the live site.

Short workflow:
1. Open the page through a working preview/server.
2. Select festival, enter the Ganesh Martand date and brief reason; add the page number if known.
3. Copy the generated record.
4. In `data/festival-overrides.json`, replace the matching record or append it to `overrides`; commit the change.

Privacy note: `noindex` is not access control. The HTML and branch source may be visible because the repository is public. Never enter secrets or private personal details. Keep this page off the production Blogger page.

## Eventual automation

A queue generator should read the festival catalog, override records and calculated local Panchang. It should sort source conflicts first, then unverified festivals within 30 days, then later records. Each item should show festival, year/date, reason, source/status and GitHub record link. The owner checks flagged items against the hard copy; only explicitly approved exceptions are applied.

CI should test invalid dates, duplicate IDs, missing catalog mappings, stale past-year dates and unresolved high-priority conflicts.

## Current limitation

This file and `festival-overrides.json` are draft foundations only. They do not yet create a live review panel, send notifications, or change Blogger output. The next implementation is a tested queue generator, followed by a dashboard or notification mechanism.
