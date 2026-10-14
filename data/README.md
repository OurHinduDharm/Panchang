# Festival data migration

This folder is the isolated starting point for moving the existing OurHinduDharm Blogger `festivalData` into structured JSON.

## Files

- `festivals.json` — data destination; currently an explicitly marked empty scaffold.
- `festival-schema.json` — draft shape for the migrated records.

## Migration rules

1. Copy every existing festival entry from Blogger before adding calculation logic.
2. Preserve the original Hindi names, descriptions, article URLs, duration text, status text, special muhurat details, and existing dates.
3. Do not silently correct, remove, or merge entries during migration. Record possible duplicates or date conflicts for review.
4. Keep the original date as legacy data until its date rule is independently checked.
5. Later, classify date logic as tithi-based, solar, astronomical, event/duration-based, or fixed/manual. Add tradition-specific rules where needed.
6. Do not connect this draft JSON to the live Panchang UI until the migrated data and date rules have been reviewed and tested.

## Current status

**Template only.** The original Blogger festival dataset has not yet been migrated because its complete source code is needed to preserve all content exactly. No production Panchang files are changed by this scaffold.
