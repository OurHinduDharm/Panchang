# Eclipse Festival Display Integration — Design Note

Status: implementation plan only. Reviewed against `eclipse-panchang.js` on `data/festival-json-foundation` (blob `d0f058d7e7c5801b2023103a235d4f33144a5410`).

## Confirmed current module contract

- The module header documents one public API: `window.initEclipsePanchang(year?)`.
- It has no static eclipse date table and derives eclipse truth through the shared Panchangam module's `getGrahana()`; it also uses `findTithiTransitions()` to discover candidate dates.
- The current function initializes a UI controller and renders eclipse cards into the `ohd-eclipse-panchang` container. It is not currently a documented data-returning API for the festival widget.
- The controller has location/year state and calculates events for that selected location. The UI is location-dependent; a global eclipse date is not enough to assert that the event is visible in India.
- The current year selector is bounded to 2026–2050. A festival feed must not silently treat that range as timeless or assume older years are supported.

## Recommended integration (do not scrape rendered HTML)

1. Extract a pure/shared event-discovery function from the existing module, reusing its existing `discoverEclipses(year, location, api)` and event classification/visibility logic.
2. Expose a small documented read-only API such as `window.getOhdEclipsesForYear(year, location?)` only after the return shape and error behavior are tested. This is a proposal, not an existing API.
3. Return normalized event records with at least: event ID, type (solar/lunar), IST civil date, global event existence, location-specific visibility, location label, and source module. Only include fields the underlying result truly supports.
4. The festival display should call this shared function for the selected calendar year and show an India-facing solar-eclipse entry only when the chosen India-wide/public listing policy matches. If city-specific visibility is needed, use the selected Panchang location and label it explicitly.
5. Avoid a duplicate eclipse calculator, static 1970 placeholder, scraping the module's rendered cards, and duplicate rendering if the eclipse module already owns the display on that page.
6. Keep ritual details (sutak, food restrictions, mantras) separate from astronomical existence and visibility; do not infer these from a generic eclipse event.

## Required tests

- One or more solar eclipses in a year, lunar-only year, and no applicable event for selected location.
- A global eclipse that is not locally visible must not be labelled locally visible.
- Correct IST date when the astronomical contact instant is near UTC/IST midnight.
- Selected year changes recalculate the returned events; invalid years produce an explicit safe result/error.
- Festival display and the standalone eclipse page do not render duplicate cards.
- Existing eclipse module UI and location handling continue to work.

## Decision needed during implementation

The user said “भारत के सार्वजनिक ग्रहण तारीखों” (public India eclipse dates). Before wiring, decide whether this means (A) any solar eclipse whose astronomical date is listed for India regardless of local visibility, or (B) only solar eclipses visible from at least some part of India. Preferred initial interpretation: **B**, and clearly distinguish nationwide date from visibility at the selected city. This avoids implying an eclipse is visible everywhere in India.

No code or Blogger changes were made by this note.
