/*
 * OurHinduDharm — print safety for Blogger pages using Auto ads.
 * All styling is scoped to print; normal screen layout and ad rendering are untouched.
 */
(function () {
  "use strict";
  if (window.__ohdPrintSafetyInstalled) return;
  window.__ohdPrintSafetyInstalled = true;

  var style = document.createElement("style");
  style.id = "ohd-print-safety-styles";
  style.textContent = [
    "@media print {",
    "  ins.adsbygoogle, .adsbygoogle, .google-auto-placed,",
    "  iframe[id^='google_ads'], iframe[src*='doubleclick.net'],",
    "  [aria-label='Advertisement'], [data-ad-client],",
    "  .google-auto-placed, .adsbygoogle-noablate {",
    "    display: none !important; visibility: hidden !important;",
    "  }",
    "  html, body { height: auto !important; overflow: visible !important; }",
    "  [style*='position: fixed'], [style*='position:fixed'],",
    "  [style*='position: sticky'], [style*='position:sticky'] {",
    "    position: static !important; transform: none !important;",
    "  }",
    "  button, .no-print, [data-no-print='true'] { display: none !important; }",
    "}"
  ].join("\n");
  (document.head || document.documentElement).appendChild(style);
})();
