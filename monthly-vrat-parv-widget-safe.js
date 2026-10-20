(function () {
  "use strict";

  // Load the currently reviewed monthly widget, then add Blogger-safe layout
  // and print rules. Auto ads remain untouched on screen.
  var widgetUrl = "https://cdn.jsdelivr.net/gh/OurHinduDharm/Panchang@bb8ddc12a1219d1d9f9db8e1e932c2759583676b/monthly-vrat-parv-widget.js";
  var styleId = "ohd-monthly-widget-print-safety";

  function installSafetyStyles() {
    if (document.getElementById(styleId)) return;
    var style = document.createElement("style");
    style.id = styleId;
    style.textContent = [
      "#ohd-monthly-festivals, #ohd-monthly-festivals main, #ohd-monthly-festivals .events, #ohd-monthly-festivals .event, #ohd-monthly-festivals .content { box-sizing:border-box; min-width:0; max-width:100%; }",
      "#ohd-monthly-festivals .event { align-items:flex-start; }",
      "#ohd-monthly-festivals .content, #ohd-monthly-festivals .title, #ohd-monthly-festivals .desc, #ohd-monthly-festivals .hindu-tithi, #ohd-monthly-festivals .links { min-width:0; max-width:100%; overflow-wrap:anywhere; }",
      "#ohd-monthly-festivals img, #ohd-monthly-festivals iframe, #ohd-monthly-festivals video { max-width:100%; }",
      "@media(max-width:420px){#ohd-monthly-festivals main{padding:9px}#ohd-monthly-festivals .event{gap:8px;padding:9px}#ohd-monthly-festivals .date{flex:0 0 54px}}",
      "@media print {",
      "  #ohd-monthly-festivals .monthbar, #ohd-monthly-festivals .location-picker, #ohd-monthly-festivals .filters, #ohd-monthly-festivals .nav, #ohd-monthly-festivals .current-month-row, #ohd-monthly-festivals .draft { display:none !important; }",
      "  #ohd-monthly-festivals, #ohd-monthly-festivals main { height:auto !important; overflow:visible !important; background:#fff !important; }",
      "  #ohd-monthly-festivals .event { break-inside:avoid; page-break-inside:avoid; box-shadow:none !important; }",
      "  ins.adsbygoogle, .adsbygoogle, .google-auto-placed, iframe[id^='google_ads'], iframe[src*='doubleclick.net'], [aria-label='Advertisement'], [data-ad-client], .adsbygoogle-noablate { display:none !important; visibility:hidden !important; }",
      "  [style*='position: fixed'], [style*='position:fixed'], [style*='position: sticky'], [style*='position:sticky'] { position:static !important; transform:none !important; }",
      "}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(style);
  }

  import(widgetUrl).then(installSafetyStyles).catch(function (error) {
    console.error("OHD monthly widget failed to load:", error);
    installSafetyStyles();
  });
})();