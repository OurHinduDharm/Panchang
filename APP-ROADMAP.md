# OurHinduDharm App Roadmap

> Planning document only. This does not create or publish an app, change the live Blogger site, or merge the festival draft branch.

## Goal

Build one Android app with three independent sections that share navigation and selected common services:

1. **Articles** — Blogger posts/pages, categories and related links; reading view; print/PDF export; user-selected offline saves.
2. **Panchang** — daily Panchang, location-aware sunrise and other calculations, festivals, vrat and muhurta.
3. **Kundli** — birth chart and matching, powered by the separate Kundli repository when its calculations are ready and verified.

## Design principles

- Keep calculation rules separate from UI rendering.
- Keep data and source notes separate from calculation code.
- Preserve Ganesh Martand as the project's primary Panchang reference where the owner has specified it; record unresolved disagreements instead of silently overriding them.
- Use free/open tools and static hosting where practical; avoid paid APIs and recurring services unless essential.
- Do not store secrets, access tokens, private birth details or credentials in public repositories.
- Build offline support deliberately: cache article text and selected assets on-device; do not promise that live calculations or fresh content work offline until tested.
- Add automated tests for date rules and calculation edge cases before connecting modules to the app.
- Keep this roadmap as guidance; do not reorganize or rename existing files until their imports, deployment paths and Blogger dependencies have been checked.

## Proposed app-level structure (future)

```text
OurHinduDharm-App/
  app/                    # Android app shell, navigation, permissions
  features/
    articles/              # Blogger content, reader, print/PDF, offline library
    panchang/              # Panchang screens and user location/settings
    festivals/             # Festival and vrat listings, related article links
    muhurta/               # Muhurta screens
    kundli/                # Integration adapter for the separate Kundli project
  core/
    data/                  # Shared data interfaces and repository contracts
    storage/               # Offline storage and cache policy
    export/                 # PDF and print support
    navigation/             # Shared navigation
    design/                 # Common UI components and theme
  tests/                   # Integration and end-to-end tests
  docs/                    # Architecture, release and privacy notes
```

## Repository boundaries

- **Blogger** remains the source of published articles unless a later migration is explicitly chosen.
- **Panchang repository** remains responsible for Panchang/festival rules, source documentation and regression tests. The app should consume stable interfaces rather than copy calculation logic into screens.
- **Kundli repository** remains independently maintainable. Integration should use a documented interface or versioned package/API; do not assume its calculations are ready until tested.
- **App repository** will own Android navigation, local storage, export/printing, permissions, release configuration and integration tests.

## Cost approach

Aim for zero recurring cost during development using GitHub, Blogger and free development tools. Google Play publishing currently requires a one-time US$25 developer registration fee. Hosting, APIs, backups or other services could introduce costs if later requirements exceed free tiers; review before adopting any paid service.

## Suggested delivery order

1. Finish and test current Panchang/festival changes.
2. Stabilize the Panchang data/calculation interface and document it.
3. Keep article data access independent from the Blogger presentation.
4. Develop the Kundli calculation project separately with tests and source notes.
5. Build the Android shell and integrate one section at a time.
6. Test offline article saves, PDF/print, location permissions, date boundaries and low-network behavior.
7. Complete Play Console verification/testing requirements and publish only after user approval.
