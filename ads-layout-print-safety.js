/*
 * OurHinduDharm — print/layout safety for Blogger pages using Auto ads.
 * Deliberately does not remove, block, or reposition ads on screen.
 * Print-only rules prevent ad containers and floating overlays from entering print output.
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
    "  * { position: static !important; transform: none !important;",
    "      animation: none !important; transition: none !important; }",
    "  button, .no-print, [data-no-print='true'] { display: none !important; }",
    "}",
    "@media screen {",
    "  #ohd-monthly-festivals, #ohd-monthly-festivals * { box-sizing: border-box; }",
    "  #ohd-monthly-festivals .event, #ohd-monthly-festivals .content { min-width: 0; }",
    "  #ohd-monthly-festivals .content { overflow-wrap: anywhere; }",
    "}"
  ].join("\n");
  (document.head || document.documentElement).appendChild(style);
})();
