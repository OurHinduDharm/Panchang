# Special Punya-Kaal monthly data

This directory is the public data source for the optional monthly **विशेष साधना काल एवं पुण्यकाल** section and its conditional daily-Panchang navigation link.

## Publication gate

- A month file is named `YYYY-MM.json`, for example `2027-04.json`.
- Until a month contains at least one fully verified event, do not create a public month file. A missing file means no public link and no monthly section.
- The top-level `status` must be exactly `approved`.
- Every event must independently have `status: "approved"`.
- Research candidates, source-unreviewed events, incomplete time windows, malformed timestamps, and unsupported event types are never public.
- The daily Panchang and monthly page both enforce these gates independently (fail closed).

## Required month object

- `schemaVersion`: integer, currently `1`
- `status`: `approved`
- `year`, `month`: match the filename
- `observer`: `{ "lat": number, "lon": number, "elevation": number, "timezoneOffset": 330 }`
- `events`: array of approved event records
- `generatedAt`: ISO timestamp
- `ruleProfile`: exact reviewed rule profile identifier

## Required event fields

- `id`: stable unique string
- `type`: one of `vyatipata-mahapat`, `vaidhriti-mahapat`, `varuni`, `mahavaruni`, `mahamahavaruni`, `mahodaya`
- `label`: public Hindi title
- `date`: local civil observance date, `YYYY-MM-DD`
- `start`, `end`: ISO timestamps with explicit timezone offset or `Z`; seconds required
- `status`: exactly `approved`
- `startLabel`, `endLabel`: optional display labels; defaults are स्पर्श and मोक्ष
- `ruleProfile`: reviewed rule profile identifier

Sankranti is deliberately not an allowed event type here. Its existing Sankranti card remains the only public display.

## Observer behavior

The current approved-data path is observer-specific. The page renders a month file only when the selected location's latitude/longitude matches the file observer. Current research work is centered on Pithoragarh (29.5828, 80.2182; configured elevation 1650 m; IST +330). Other locations remain hidden until their own approved data/calculation path exists.

## Mahapat caution

Only the two Mahapat types receive the warning about not treating Mahapat as a muhurta for auspicious samskaras. This warning must not be copied to Varuni, Mahavaruni, Mahamahavaruni, or Mahodaya.

## No approved records yet

The 2026–2030 files in `data/reviews/` are research-only and must never be copied here without source review, calculation verification, and explicit approval.
