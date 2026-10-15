# Ekadashi Catalog Audit — Draft Only

Updated: 2026-10-15  
Branch: `data/festival-json-foundation`  
Purpose: checklist for completing Ekadashi coverage; **not connected to the visitor-facing widget**.

## Decision policy

- Use the user's printed Ganesh Martand Panchang as the primary date reference for the current year.
- Drik Panchang is a secondary cross-check only where it agrees with the primary reference.
- Never choose a vrata day by matching the tithi name alone. The decision may depend on local sunrise, Dashami-vedha, tithi presence/absence, Harivasara/parana, Mahadvadashi, and Smarta/Vaishnava tradition.
- Record source text, edition/page/verse where available, rule interpretation, test case and review status before claiming a rule is verified.
- Keep 2026 owner-confirmed dates distinct from recurring annual calculation rules.

## Known Ekadashi-related catalog records

| Record | Current entry | Status / next action |
|---|---|---|
| `festival-016` | Rama Ekadashi — 5 Nov 2026 | Needs review; test tithi and vrat decision, parana window |
| `festival-024` | Devutthana/Prabodhini Ekadashi | Legacy date is 2025; calculate/review for 2026 and recurring rule |
| `festival-029` | Mokshada Ekadashi / Gita Jayanti | Legacy date is 2025; calculate/review for 2026 |
| `festival-051` | Amalaki Ekadashi | Existing record; recurring rule and date need review |
| `festival-101` | Harishayani Ekadashi / Chaturmas begins | Existing record; recurring rule and date need review |
| `festival-087` | Gayatri Jayanti also listed on Jyeshtha Shukla Ekadashi | Preserve this observance; it is not a replacement for the Ekadashi catalog |
| `festival-110` | Old duplicate Gayatri Jayanti source record | Superseded; do not display separately |
| `festival-125` | Bhadrakali Jayanti on Jyeshtha Krishna Ekadashi | Secondary-source lead only; not a universally verified rule |
| `festival-128` | Papankusha Ekadashi — 22 Oct 2026 | Owner-reported Ganesh Martand date; recurring vrat decision not yet implemented |

The catalog currently does **not** contain a complete, validated 24-Ekadashi-per-normal-year calendar or a reviewed Adhika-Masa pair. This must be treated as unfinished, not silently assumed complete.

## Coverage checklist to research

The following is a **provisional research checklist**, not a certified rule table. Names/variants and month assignments must be checked against the chosen editions of Dharmasindhu, Nirnayasindhu and other relevant sources before use.

| Lunar month | Krishna paksha candidate | Shukla paksha candidate |
|---|---|---|
| Chaitra | Papamochani | Kamada |
| Vaishakha | Varuthini | Mohini |
| Jyeshtha | Apara | Nirjala |
| Ashadha | Yogini | Devshayani / Harishayani |
| Shravana | Kamika | Putrada / Pavitra |
| Bhadrapada | Aja | Parivartini / Parsva |
| Ashwin | Indira | Papankusha |
| Kartik | Rama | Prabodhini / Devutthana |
| Margashirsha | Utpanna | Mokshada |
| Pausha | Saphala | Putrada |
| Magha | Shattila | Jaya / Bhaimi |
| Phalguna | Vijaya | Amalaki |

Adhika-Masa candidates to verify separately: **Padmini Ekadashi** and **Parama Ekadashi**. Their paksha naming, order and vrata rules must be verified from the selected primary editions.

## Required implementation scope

1. Create a canonical Ekadashi observance catalog with month, paksha, canonical name, accepted variants, article URL if available, source citations and review status.
2. Keep the tithi/astronomy calculation separate from the observance-day decision.
3. Implement the decision layer for local sunrise, Dashami-vedha, Harivasara, Dvadashi parana, Mahadvadashi and Smarta/Vaishnava cases only after the relevant rules are documented.
4. If Smarta and Vaishnava observance falls on the same date, show one entry; if dates differ, show both clearly with labels.
5. Add regression tests for tithi spanning civil dates, skipped/repeated tithi, sunrise boundary, Dvadashi/Harivasara and location/timezone differences.
6. Compare 2026 output with the printed Ganesh Martand reference before connecting it to Blogger.

## Release gate

Do not mark Ekadashi coverage complete and do not connect this draft to the live Blogger widget until the recurring catalog, rule sources, 2026 comparison and automated tests have been reviewed.
