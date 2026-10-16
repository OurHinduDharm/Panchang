# Reviewed festival data

This directory is the home for **human-reviewed festival decisions** checked against the project's chosen hard-copy reference, currently Ganesh Martand Panchang.

## Workflow

1. Generate candidate dates with the research-only review page.
2. Compare every applicable date and rule with the hard-copy Panchang.
3. In the review page, mark each result `approved` (सही), `fix` (सुधार चाहिए), or leave it `pending` (जाँच बाकी). Write the expected date/rule in the note for every fix.
4. Download the JSON with review notes and upload it here.
5. Before site integration, validate the JSON schema, ensure no unresolved duplicates remain, inspect every `fix`, and record the reference edition/page or other evidence when available.
6. Only entries with a completed review and an explicit accepted decision may be promoted into runtime data. Do not make the entire file production-ready just because it is in this folder.

## Rules

- Keep the exported review file intact as an audit record; do not silently rewrite the user's notes.
- Do not treat a browser dropdown as a code change. Review decisions must be inspected and then applied to the rule engine or a separate curated runtime file.
- Keep location-specific outputs distinct from shared astronomical intervals. A Pithoragarh decision must not automatically be used for every city if sunrise or ritual windows change the result.
- Preserve the original generated result and the reviewer decision, including corrected date and rationale.
- Mark unresolved or conflicting decisions as pending; do not guess.
- This folder is part of a public repository. Do not place personal or confidential information here.

## Initial pilot

The first intended review file is a Kalashtami annual export. Its calculations remain research-only until duplicates and boundary-time issues are resolved and the dates are checked against the hard-copy reference.
