# OurHinduDharm — Festival Decision Methodology

Status: governing project policy for research, rule design, annual calculation and review.

## 1. Authority and decision priority

Festival and vrata dates must be decided from the relevant Hindu shastric evidence, not by copying another Panchang's date.

Use this research order, adapting it to the specific observance:

1. Relevant primary scripture or ritual passage that establishes the observance, tithi, time-window, vrata or worship procedure.
2. Dharma-nibandha and nirnaya texts (for example, Dharmasindhu, Nirnayasindhu and other relevant works) that explain and reconcile the rule.
3. Purana, kalpa, smriti, regional and established Smarta tradition where relevant to that festival.
4. A documented Smarta decision as the project's default when traditions conflict, unless the user explicitly approves a different tradition for a particular observance.

This is a research hierarchy, not a claim that every named text governs every festival. Cite the text that actually supports each rule. Do not attach a source merely because it is commonly associated with the topic.

## 2. Handling disagreement and Drik Panchang comparison

When shastric opinions or published Panchang decisions differ:

1. Identify the exact point of disagreement: tithi identity, tithi-at-sunrise, vedha, kshaya/vriddhi, a special kala (pradosha, nishita, madhyahna, arunodaya, moonrise), month, regional tradition or tie-break.
2. Collect the relevant shastric passages and explain what each view requires.
3. Independently calculate the astronomical inputs for the target location and date.
4. Check how Drik Panchang publicly displays the observance and its date/time decision. Treat this as a comparative reference, not as the authority or as proof of a shastric rule.
5. If Drik's visible decision is supported by the shastric evidence and independent calculation, our rule may reach the same result. If not, retain the independently supported decision and document the reason.
6. Record the comparison outcome and discrepancy category. Do not copy Drik's code, private or unpublished formulas, prose, page structure, URLs, or other protected expression. Publicly observable dates/times may be compared; our formulas and implementation must be independently derived from public astronomical methods and shastric sources.

Never change a rule merely to force a match with Drik. A match is a useful test result, not the decision criterion.

## 3. Reusable rules and yearly data

- Every observance gets its own rule ID and decision logic. Do not apply one festival's rule to another merely because the tithi is the same.
- Rules are reusable across years; dates are not. Recalculate the tithi intervals, local sunrise/sunset, moonrise and relevant kala independently for each year and location.
- Decide by tithi and the prescribed observance window wherever shastra defines the observance that way.
- Use a fixed Gregorian date only where the historical/person-specific observance genuinely requires it (for example, a documented birth or death anniversary tradition), and record why.
- JSON/year files store computed annual results, tithi context, review state and approved decision—not duplicated rule logic.
- Public pages consume precomputed data. Do not move the full astronomy or festival decision engine into the visitor's browser.

## 4. Evidence record required for each rule

Each rule must document:

- Stable rule ID and the observance(s) to which it applies.
- Shastric source: text name, chapter/section/verse or edition/page where available; distinguish exact quotation, paraphrase and secondary citation.
- Sanskrit/Hindi passage or a faithful working translation, with uncertainty noted.
- Decision conditions: tithi, paksha, lunar month, sunrise/other kala, vedha, kshaya/vriddhi, tie-break and exceptions.
- Independent calculation inputs and the algorithm used to test those conditions.
- Drik comparison outcome, if checked, without retaining Drik URLs or copying its wording.
- Review status: verified, provisional, disputed or research-only; unresolved evidence must never be silently auto-approved.
- Regression cases covering ordinary, boundary, kshaya/vriddhi and multi-day cases as applicable.

Do not invent a page number, verse, quotation or source attribution. If the exact primary passage has not been verified, mark it pending.

## 5. Calculation and validation

- Keep astronomy, observance-rule evaluation, final approval and public presentation as separate layers.
- Classify discrepancies as astronomy/ephemeris, ayanamsha, timezone/location/elevation, tithi boundary or precision, observance-window calculation, shastric interpretation, regional tradition, or source/data error.
- Fix the underlying cause and add a regression test; do not patch a single year's date without correcting the reusable rule or calculation.
- Test Pithoragarh as the default reference location and include other locations where the observance is location-sensitive.
- Validate across historical and future years, especially 2026–2030, and ensure every generated year remains review-gated.
- Keep research notes and source-review detail out of public visitor payloads. Load only the required year/month/date data and preserve mobile performance.

## 6. Originality and source integrity

OurHinduDharm must have independently written code, independently reasoned rules, original explanations and its own presentation. Common astronomical facts and independently calculated dates may coincide with other Panchangs. Do not copy another site's protected wording, code, page structure or link collection. External comparison is for verification only; do not store Drik URLs in festival JSON or public cards.

## 7. Default policy

Use Smarta decision rules as the default when a genuine tradition conflict remains, subject to the evidence review above. If the evidence is insufficient, mark the observance for manual review instead of guessing.
