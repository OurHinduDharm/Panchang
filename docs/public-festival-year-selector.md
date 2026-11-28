# Public festival year selector
Both public month readers import one lightweight generated index. Static HTML is a 2026–2030 fallback before scripts run; the shared module replaces every option, including stale Blogger options. Navigation and direct year/month requests are restricted to the index. No extra annual catalog download or API probing.

For legacy monthly catalogs run `node scripts/update-published-festival-years.mjs --write` after the fully reviewed monthly data is ready. The integrity CI checks exact index parity: every discovered year must have all twelve valid nonempty approved months and approved event records. The index is metadata, not a ritual approval or a replacement for the existing review process.

2031 onward remains under the single annual exceptions-file policy: do not create twelve committed monthly files to add a year. The current reader only supports monthly catalogs; once the approved hybrid runtime and publication gate are implemented, extend the index generator to accept that approved reader's released year coverage. Then no Blogger HTML edit is needed. No research, exception-only, or partial year is currently exposed. Do not claim hybrid publication is complete.

After merge verify the Blogger script version/cache, standalone page, invalid future URL, December 2030 boundary, current-month button and mobile rendering. The repository snippet continues to use the same script URL.
