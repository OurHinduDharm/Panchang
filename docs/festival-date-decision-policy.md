# Festival and Jayanti Date Decision Policy

This policy governs OurHinduDharm annual festival data. The calendar is tithi-first, but it does not force every observance into a lunar-tithi rule.

## 1. Classify each observance before calculating its date

Every observance must be assigned to one of these date-basis classes:

- `lunar-tithi`: the traditional observance is determined by a named Hindu tithi, paksha and (where applicable) lunar month. The civil date is derived from the locally calculated tithi interval and the observance-specific decision rule.
- `fixed-gregorian`: a historically or institutionally established civil anniversary is observed on a fixed Gregorian date. Do not convert it into a tithi merely because a nearby tithi exists.
- `tradition-specific`: more than one established sampradaya, region or lineage observes the event differently. Keep the traditions distinct; do not silently choose or merge them.
- `hybrid`: the tradition specifies a tithi but also requires a separate condition, such as a weekday, nakshatra, sunrise, moonrise, pradosha, madhyahna, arunodaya or nishita.

A saint's jayanti is not automatically fixed-date or tithi-based. Establish the documented observance tradition for that saint first. Use a fixed civil date only where the tradition/history supports it; otherwise use the traditional tithi.

## 2. Tithi-based dates require an observance-specific rule

A tithi match is candidate evidence, not a final date decision. For each vrata or festival, define and test its own rule, including as applicable:

- tithi, paksha and lunar month;
- local observer and timezone;
- decision moment (sunrise, arunodaya, moonrise, pradosha, madhyahna, aparahna, nishita, or an exact tithi junction);
- kshaya/vriddhi handling and first/second-day selection;
- vedha, supporting nakshatra/weekday conditions and tie-breaks;
- Smarta or other explicitly selected tradition.

Do not reuse another festival's rule merely because the tithi number is the same. When no sufficiently established rule is available, create a festival-specific provisional rule with its textual basis and unresolved questions recorded. Keep the result in review status until the rule and its implementation are independently checked.

## 3. Evidence and source handling

Use independent astronomical calculations and the project's selected shastric decision rules as the basis of OHD dates. Other panchangs, including Drik Panchang, may be used only as internal cross-checks to identify discrepancies. Do not store external website URLs in production festival records as a substitute for a rule, calculation, or evidence record. Do not copy another site's prose, descriptions, or presentation.

Record the rule's actual textual basis, edition/page or chapter/verse where available, interpretation, calculation method, test cases, and review status in project-owned documentation. Distinguish a verified rule from a proposed interpretation or an unresolved regional variation.

## 4. Publication gate

A date may be treated as approved only when:
1. its date-basis class is identified;
2. the local astronomical inputs and tithi interval are calculated;
3. the applicable observance-specific rule is implemented;
4. edge cases and adjacent-day alternatives are tested;
5. tradition-specific differences are represented honestly; and
6. the public record does not contain copied prose or unnecessary external source URLs.

A candidate detector must never approve a date by itself. Missing evidence must remain visible to maintainers as a review item, not be converted into a guessed date.

## 5. Default project conventions

- Use Pithoragarh and IST for the project's default local calculations unless a record explicitly requires another observer.
- Use the project's established Purnimanta month convention consistently.
- Apply the project's explicit Smarta policy where the user has selected it; do not introduce Vaishnava observances into Smarta-only groupings.
- Keep distinct observances as separate records unless they are genuine aliases or closely related aspects of one celebration.
