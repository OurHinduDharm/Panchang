/**
 * eclipse-panchang.js
 * OurHinduDharm — Grahan Panchang
 *
 * Public:
 *   window.initEclipsePanchang(year?)
 *
 * Data source:
 *   window.__ohdPanchangam
 *
 * Design:
 *   Eclipse discovery:
 *     findTithiTransitions()
 *       → Purnima / Amavasya
 *       → getGrahana()
 *
 *   Day Panchang:
 *     getPanchangam()
 *       → same date + same location + IST
 *
 * No static eclipse dates.
 * No static Panchang values.
 * No hard-coded city.
 */

(function () {
  "use strict";

  /* =========================================================
     CONSTANTS
     ========================================================= */

  var CONTAINER_ID = "ohd-eclipse-panchang";
  var STORAGE_KEY = "ohdPanchangLocation";
  var TZ_OFFSET = 330;

  var YEAR_MIN = 2026;
  var YEAR_MAX = 2031;

  var MAIN_PANCHANG_URL =
    "https://ourhindudharm.blogspot.com/p/panchang-today.html?m=1";

  var PURASHCHARAN_URL =
    "https://ourhindudharm.blogspot.com/2022/10/About-Grahan-mantra-purashcharan.html";

  var state = {
    initialized: false,
    controller: null
  };

  /* =========================================================
     DEBUG
     ========================================================= */

  function isDebug() {
    return window.__OHDEclipseDebug === true;
  }

  function log() {
    if (!isDebug()) return;

    console.log.apply(
      console,
      ["[EclipsePanchang]"].concat(
        Array.prototype.slice.call(arguments)
      )
    );
  }

  function logErr() {
    if (!isDebug()) return;

    console.error.apply(
      console,
      ["[EclipsePanchang]"].concat(
        Array.prototype.slice.call(arguments)
      )
    );
  }

  /* =========================================================
     BASIC HELPERS
     ========================================================= */

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    var d = new Date(value);

    return isNaN(d.getTime()) ? null : d;
  }

  function yieldToMain() {
    return new Promise(function (resolve) {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(
          function () {
            resolve();
          },
          { timeout: 50 }
        );
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  /* =========================================================
     LOCATION
     ========================================================= */

  function readLocation() {
    var raw;

    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      logErr("localStorage read failed:", e);
      return null;
    }

    if (!raw) return null;

    var o;

    try {
      o = JSON.parse(raw);
    } catch (e) {
      logErr("Invalid location JSON:", e);
      return null;
    }

    if (!o || typeof o !== "object") {
      return null;
    }

    if (
      typeof o.lat !== "number" ||
      typeof o.lon !== "number"
    ) {
      return null;
    }

    if (
      !isFinite(o.lat) ||
      !isFinite(o.lon)
    ) {
      return null;
    }

    if (
      Math.abs(o.lat) > 90 ||
      Math.abs(o.lon) > 180
    ) {
      return null;
    }

    var elevation =
      typeof o.elevation === "number" &&
      isFinite(o.elevation)
        ? o.elevation
        : 0;

    return {
      name:
        o.name ||
        o.city ||
        o.state ||
        "चयनित स्थान",

      city: o.city || "",
      state: o.state || "",

      lat: o.lat,
      lon: o.lon,
      elevation: elevation
    };
  }

  /* =========================================================
     SHARED API
     ========================================================= */

  function getSharedApi() {
    return window.__ohdPanchangam || null;
  }

  function waitForSharedApi() {
    return new Promise(function (resolve, reject) {
      var api = getSharedApi();

      if (api) {
        resolve(api);
        return;
      }

      var timer = setTimeout(function () {
        window.removeEventListener(
          "ohd:panchangam-ready",
          onReady
        );

        reject(
          new Error(
            "पंचांग लाइब्रेरी उपलब्ध नहीं हुई।"
          )
        );
      }, 30000);

      function onReady() {
        window.removeEventListener(
          "ohd:panchangam-ready",
          onReady
        );

        clearTimeout(timer);

        var readyApi = getSharedApi();

        if (readyApi) {
          resolve(readyApi);
        } else {
          reject(
            new Error(
              "पंचांग API उपलब्ध नहीं हुई।"
            )
          );
        }
      }

      window.addEventListener(
        "ohd:panchangam-ready",
        onReady,
        { once: true }
      );
    });
  }

  function resolveFunction(api, name) {
    if (!api) return null;

    if (typeof api[name] === "function") {
      return api[name];
    }

    if (
      api.module &&
      typeof api.module[name] === "function"
    ) {
      return api.module[name];
    }

    return null;
  }

  /* =========================================================
     HINDI DATA
     ========================================================= */

  var TITHI = [
    "प्रतिपदा",
    "द्वितीया",
    "तृतीया",
    "चतुर्थी",
    "पंचमी",
    "षष्ठी",
    "सप्तमी",
    "अष्टमी",
    "नवमी",
    "दशमी",
    "एकादशी",
    "द्वादशी",
    "त्रयोदशी",
    "चतुर्दशी",
    "पूर्णिमा",

    "प्रतिपदा",
    "द्वितीया",
    "तृतीया",
    "चतुर्थी",
    "पंचमी",
    "षष्ठी",
    "सप्तमी",
    "अष्टमी",
    "नवमी",
    "दशमी",
    "एकादशी",
    "द्वादशी",
    "त्रयोदशी",
    "चतुर्दशी",
    "अमावस्या"
  ];

  var NAKSHATRA = [
    "अश्विनी",
    "भरणी",
    "कृत्तिका",
    "रोहिणी",
    "मृगशीर्ष",
    "आर्द्रा",
    "पुनर्वसु",
    "पुष्य",
    "आश्लेषा",
    "मघा",
    "पूर्वाफाल्गुनी",
    "उत्तराफाल्गुनी",
    "हस्त",
    "चित्रा",
    "स्वाती",
    "विशाखा",
    "अनुराधा",
    "ज्येष्ठा",
    "मूल",
    "पूर्वाषाढ़ा",
    "उत्तराषाढ़ा",
    "श्रवण",
    "धनिष्ठा",
    "शतभिषा",
    "पूर्वाभाद्रपद",
    "उत्तराभाद्रपद",
    "रेवती"
  ];

  var YOGA = [
    "विष्कम्भ",
    "प्रीति",
    "आयुष्मान",
    "सौभाग्य",
    "शोभन",
    "अतिगण्ड",
    "सुकर्मा",
    "धृति",
    "शूल",
    "गण्ड",
    "वृद्धि",
    "ध्रुव",
    "व्याघात",
    "हर्षण",
    "वज्र",
    "सिद्धि",
    "व्यतीपात",
    "वरीयान",
    "परिघ",
    "शिव",
    "सिद्ध",
    "साध्य",
    "शुभ",
    "शुक्ल",
    "ब्रह्म",
    "इन्द्र",
    "वैधृति"
  ];

  var KARANA = {
    Bava: "बव",
    Balava: "बालव",
    Kaulava: "कौलव",
    Taitila: "तैतिल",
    Gara: "गर",
    Vanija: "वणिज",
    Vishti: "विष्टि",
    Shakuni: "शकुनि",
    Chatushpada: "चतुष्पद",
    Naga: "नाग",
    Kimstughna: "किंस्तुघ्न"
  };

  var MASA = {
    Chaitra: "चैत्र",
    Vaishakha: "वैशाख",
    Jyeshtha: "ज्येष्ठ",
    Ashadha: "आषाढ़",
    Shravana: "श्रावण",
    Bhadrapada: "भाद्रपद",
    Bhadra: "भाद्रपद",
    Ashwin: "आश्विन",
    Ashwina: "आश्विन",
    Kartika: "कार्तिक",
    Kartik: "कार्तिक",
    Margashirsha: "मार्गशीर्ष",
    Margashir: "मार्गशीर्ष",
    Margashirsha: "मार्गशीर्ष",
    Pausha: "पौष",
    Paush: "पौष",
    Magha: "माघ",
    Phalguna: "फाल्गुन",
    Phalgun: "फाल्गुन",
    Ashwayuja: "आश्विन",
    Agrahayana: "मार्गशीर्ष",
    Aghrayana: "मार्गशीर्ष"
  };

  var VARA = [
    "रविवार",
    "सोमवार",
    "मंगलवार",
    "बुधवार",
    "गुरुवार",
    "शुक्रवार",
    "शनिवार"
  ];

  var PAKSHA = {
    Shukla: "शुक्ल पक्ष",
    shukla: "शुक्ल पक्ष",
    Krishna: "कृष्ण पक्ष",
    krishna: "कृष्ण पक्ष"
  };

  /* =========================================================
     NAME HELPERS
     ========================================================= */

  function extractValue(value) {
    if (
      value &&
      typeof value === "object"
    ) {
      return (
        value.index ??
        value.number ??
        value.value ??
        value.name
      );
    }

    return value;
  }

  function indexedName(value, array) {
    value = extractValue(value);

    if (typeof value === "number") {
      return (
        array[value] ||
        array[value - 1] ||
        "—"
      );
    }

    return value || "—";
  }

  function getTithiName(value) {
    return indexedName(value, TITHI);
  }

  function getNakshatraName(value) {
    return indexedName(value, NAKSHATRA);
  }

  function getYogaName(value) {
    return indexedName(value, YOGA);
  }

  function getKaranaName(value) {
    value = extractValue(value);

    if (typeof value === "number") {
      return "—";
    }

    return (
      KARANA[value] ||
      value ||
      "—"
    );
  }

  function getMasaName(value) {
    if (!value) return "—";

    var name = "";
    var adhika = false;

    if (typeof value === "object") {
      name =
        value.name ||
        value.value ||
        "";

      adhika =
        value.isAdhika === true;
    } else {
      name = String(value);
    }

    var hindi = MASA[name];

    if (!hindi) {
      var lower = name.toLowerCase();

      Object.keys(MASA).some(
        function (key) {
          if (
            key.toLowerCase() === lower
          ) {
            hindi = MASA[key];
            return true;
          }

          return false;
        }
      );
    }

    hindi = hindi || name || "—";

    return adhika
      ? "अधिक " + hindi
      : hindi;
  }

  function getPakshaName(value) {
    value = extractValue(value);

    return (
      PAKSHA[value] ||
      PAKSHA[String(value)] ||
      value ||
      "—"
    );
  }

  function getVaraName(value, p) {
    value = extractValue(value);

    if (typeof value === "number") {
      return VARA[value] || "—";
    }

    return (
      (p && p.varaName) ||
      value ||
      "—"
    );
  }

  /* =========================================================
     TIME FORMATTING
     ========================================================= */

  function fmtTime(value) {
    var d = toDate(value);

    if (!d) return "—";

    var wall = new Date(
      d.getTime() +
      TZ_OFFSET * 60000
    );

    var h = wall.getUTCHours();
    var m = wall.getUTCMinutes();

    return (
      pad2(h) +
      ":" +
      pad2(m)
    );
  }

  function fmtDate(value) {
    var d = toDate(value);

    if (!d) return "—";

    var wall = new Date(
      d.getTime() +
      TZ_OFFSET * 60000
    );

    return (
      pad2(wall.getUTCDate()) +
      "/" +
      pad2(wall.getUTCMonth() + 1) +
      "/" +
      wall.getUTCFullYear()
    );
  }

  function fmtRange(a, b) {
    var start = fmtTime(a);
    var end = fmtTime(b);

    if (start === "—" && end === "—") {
      return "—";
    }

    return start + " — " + end;
  }

  /* =========================================================
     PANCHANG FOR ECLIPSE DATE
     ========================================================= */

  function calculateDayPanchang(
    eclipseDate,
    location,
    api
  ) {
    var getPanchangam =
      resolveFunction(
        api,
        "getPanchangam"
      );

    var Observer =
      api.Observer ||
      (
        api.module &&
        api.module.Observer
      );

    if (
      typeof getPanchangam !==
      "function"
    ) {
      throw new Error(
        "getPanchangam उपलब्ध नहीं है।"
      );
    }

    if (
      typeof Observer !==
      "function"
    ) {
      throw new Error(
        "Observer उपलब्ध नहीं है।"
      );
    }

    var observer =
      new Observer(
        location.lat,
        location.lon,
        location.elevation || 0
      );

    return getPanchangam(
      eclipseDate,
      observer,
      {
        timezoneOffset: TZ_OFFSET,
        calendarType: "purnimanta"
      }
    );
  }

  /* =========================================================
     LOCATION + PANCHANG DATA
     ========================================================= */

  function renderLocationCard(
    location
  ) {
    if (!location) {
      return (
        '<div class="ohd-ep-location">' +
        "<strong>📍 स्थान उपलब्ध नहीं है</strong>" +
        "<p>मुख्य पंचांग में स्थान चुनने के बाद " +
        "ग्रहण पंचांग पुनः खोलें।</p>" +
        "</div>"
      );
    }

    return [
      '<div class="ohd-ep-location">',
      '  <div class="ohd-ep-location-icon">📍</div>',
      '  <div class="ohd-ep-location-main">',
      "    <strong>चयनित स्थान</strong>",
      '    <div class="ohd-ep-location-name">',
      esc(location.name),
      "</div>",
      '    <div class="ohd-ep-location-note">',
      "ग्रहण की दृश्यता और समय इसी स्थान के अनुसार हैं।",
      "</div>",
      "  </div>",
      '  <a class="ohd-ep-location-btn" href="' +
        MAIN_PANCHANG_URL +
        '">',
      "स्थान बदलें",
      "</a>",
      "</div>"
    ].join("");
  }

  function renderDayPanchang(
    p
  ) {
    if (!p) return "";

    var tithi =
      getTithiName(p.tithi);

    var paksha =
      getPakshaName(p.paksha);

    var masa =
      getMasaName(p.masa);

    var vara =
      getVaraName(
        p.vara,
        p
      );

    var nakshatra =
      getNakshatraName(
        p.nakshatra
      );

    var yoga =
      getYogaName(
        p.yoga
      );

    var karana =
      getKaranaName(
        p.karana
      );

    return [
      '<div class="ohd-ep-day-panchang">',
      '  <div class="ohd-ep-subtitle">',
      "इस दिन का पंचांग",
      "  </div>",

      '  <div class="ohd-ep-panchang-grid">',

      row("वार", vara),
      row("तिथि", tithi),
      row("पक्ष", paksha),
      row("मास", masa),
      row("नक्षत्र", nakshatra),
      row("योग", yoga),
      row("करण", karana),

      row(
        "सूर्योदय",
        fmtTime(p.sunrise)
      ),

      row(
        "सूर्यास्त",
        fmtTime(p.sunset)
      ),

      row(
        "चन्द्रोदय",
        fmtTime(p.moonrise)
      ),

      row(
        "चन्द्रास्त",
        fmtTime(p.moonset)
      ),

      "  </div>",
      "</div>"
    ].join("");
  }

  function row(
    label,
    value
  ) {
    return [
      '<div class="ohd-ep-panchang-row">',
      "  <span>",
      esc(label),
      "</span>",
      "  <strong>",
      esc(value),
      "</strong>",
      "</div>"
    ].join("");
  }

  /* =========================================================
     ECLIPSE RENDERING
     ========================================================= */

  function renderEclipseCard(
    item,
    location,
    api
  ) {
    var g = item.grahan;

    if (!g) return "";

    var peak =
      g.contact &&
      g.contact.peak;

    var eclipseDate =
      item.date;

    var dateStr =
      fmtDate(
        peak || eclipseDate
      );

    var panchang;

    try {
      panchang =
        calculateDayPanchang(
          eclipseDate,
          location,
          api
        );
    } catch (e) {
      logErr(
        "Day Panchang failed:",
        e
      );

      panchang = null;
    }

    var subtype =
      g.subtype || "";

    var visibility =
      g.isVisible
        ? "दृश्य"
        : "अदृश्य";

    var html = [];

    html.push(
      '<article class="ohd-ep-eclipse-card">'
    );

    html.push(
      '<div class="ohd-ep-eclipse-heading">'
    );

    html.push(
      '<div class="ohd-ep-eclipse-date">'
    );

    html.push(
      esc(dateStr)
    );

    html.push(
      "</div>"
    );

    html.push(
      '<h3>'
    );

    html.push(
      esc(
        g.type ||
        "ग्रहण"
      )
    );

    if (subtype) {
      html.push(
        ' <span class="ohd-ep-subtype">'
      );

      html.push(
        esc(subtype)
      );

      html.push(
        "</span>"
      );
    }

    html.push(
      "</h3>"
    );

    html.push(
      "</div>"
    );

    html.push(
      renderDayPanchang(
        panchang
      )
    );

    html.push(
      '<div class="ohd-ep-grahan-details">'
    );

    html.push(
      '<div class="ohd-ep-subtitle">',
      "ग्रहण का विवरण",
      "</div>"
    );

    html.push(
      row(
        "दृश्यता",
        visibility
      )
    );

    if (
      typeof g.obscuration ===
      "number"
    ) {
      html.push(
        row(
          "आच्छादन",
          (
            g.obscuration *
            100
          ).toFixed(1) +
            "%"
        )
      );
    }

    if (g.contact) {
      html.push(
        row(
          "प्रथम स्पर्श",
          fmtTime(
            g.contact.firstContact
          )
        )
      );

      if (
        g.contact.totalityBegin &&
        g.contact.totalityEnd
      ) {
        html.push(
          row(
            "पूर्णता",
            fmtRange(
              g.contact.totalityBegin,
              g.contact.totalityEnd
            )
          )
        );
      }

      html.push(
        row(
          "मध्य",
          fmtTime(
            g.contact.peak
          )
        )
      );

      html.push(
        row(
          "मोक्ष / अंतिम स्पर्श",
          fmtTime(
            g.contact.lastContact
          )
        )
      );
    }

    if (
      g.sutakKaal &&
      g.sutakKaal.start &&
      g.sutakKaal.end
    ) {
      html.push(
        row(
          "सूतक काल",
          fmtRange(
            g.sutakKaal.start,
            g.sutakKaal.end
          )
        )
      );
    }

    if (
      g.punyaKala &&
      g.punyaKala.start &&
      g.punyaKala.end
    ) {
      html.push(
        row(
          "पुण्य काल",
          fmtRange(
            g.punyaKala.start,
            g.punyaKala.end
          )
        )
      );
    }

    html.push(
      "</div>"
    );

    if (!g.isVisible) {
      html.push(
        '<div class="ohd-ep-visibility-note">',
        "इस चयनित स्थान पर यह ग्रहण खगोलीय रूप से स्थानीय रूप से दृश्य नहीं है; ",
        "इसलिए स्थानीय दृश्यता के आधार पर इसे देखने का अवसर नहीं होगा।",
        "</div>"
      );
    }

    html.push(
      "</article>"
    );

    return html.join("");
  }

  /* =========================================================
     YEAR DISCOVERY
     ========================================================= */

  function transitionToCandidate(
    endTime,
    tithiIndex
  ) {
    var end =
      toDate(endTime);

    if (!end) return null;

    var istMs =
      end.getTime() +
      TZ_OFFSET * 60000;

    var ist =
      new Date(istMs);

    var y =
      ist.getUTCFullYear();

    var m =
      ist.getUTCMonth();

    var d =
      ist.getUTCDate();

    var noonUtc =
      new Date(
        Date.UTC(
          y,
          m,
          d,
          12,
          0,
          0
        ) -
          TZ_OFFSET *
          60000
      );

    return {
      date: noonUtc,
      tithiIndex: tithiIndex,
      yearIst: y
    };
  }

  async function discoverEclipses(
    year,
    location,
    api
  ) {
    var module =
      api && api.module;

    var findTithiTransitions =
      resolveFunction(
        api,
        "findTithiTransitions"
      );

    var getGrahana =
      resolveFunction(
        api,
        "getGrahana"
      );

    var Observer =
      api.Observer ||
      (
        module &&
        module.Observer
      );

    if (
      typeof findTithiTransitions !==
      "function"
    ) {
      throw new Error(
        "findTithiTransitions उपलब्ध नहीं है।"
      );
    }

    if (
      typeof getGrahana !==
      "function"
    ) {
      throw new Error(
        "getGrahana उपलब्ध नहीं है।"
      );
    }

    if (
      typeof Observer !==
      "function"
    ) {
      throw new Error(
        "Observer उपलब्ध नहीं है।"
      );
    }

    var start =
      new Date(
        Date.UTC(
          year,
          0,
          1
        ) -
          TZ_OFFSET *
          60000 -
          86400000
      );

    var end =
      new Date(
        Date.UTC(
          year + 1,
          0,
          1
        ) -
          TZ_OFFSET *
          60000 +
          86400000
      );

    var raw =
      findTithiTransitions(
        start,
        end
      );

    var list =
      Array.isArray(raw)
        ? raw
        : [];

    var purnima = [];
    var amavasya = [];

    list.forEach(
      function (t) {
        if (!t) return;

        if (t.index === 14) {
          purnima.push(t);
        } else if (
          t.index === 29
        ) {
          amavasya.push(t);
        }
      }
    );

    var candidates = [];

    function pushCandidates(
      arr,
      tithiIndex
    ) {
      arr.forEach(
        function (t) {
          var c =
            transitionToCandidate(
              t.endTime,
              tithiIndex
            );

          if (!c) return;

          if (
            c.yearIst !== year
          ) {
            return;
          }

          candidates.push(c);
        }
      );
    }

    pushCandidates(
      purnima,
      14
    );

    pushCandidates(
      amavasya,
      29
    );

    var observer =
      new Observer(
        location.lat,
        location.lon,
        location.elevation || 0
      );

    var results = [];

    for (
      var i = 0;
      i < candidates.length;
      i++
    ) {
      var c =
        candidates[i];

      var grahana = null;

      try {
        grahana =
          getGrahana(
            c.tithiIndex,
            c.date,
            observer,
            TZ_OFFSET
          );
      } catch (e) {
        logErr(
          "getGrahana failed:",
          e
        );
      }

      if (grahana) {
        results.push({
          date: c.date,
          grahan: grahana
        });
      }

      if (
        i % 5 === 0
      ) {
        await yieldToMain();
      }
    }

    /* DEDUPE */

    var seen =
      Object.create(null);

    var unique = [];

    results.forEach(
      function (item) {
        var g =
          item.grahan;

        var peak =
          g.contact &&
          toDate(
            g.contact.peak
          );

        var key =
          String(
            g.type || ""
          ) +
          "|" +
          (
            peak
              ? peak.getTime()
              : item.date.getTime()
          );

        if (seen[key]) {
          return;
        }

        seen[key] = true;

        unique.push(item);
      }
    );

    /* SORT */

    unique.sort(
      function (a, b) {
        var pa =
          a.grahan.contact &&
          toDate(
            a.grahan.contact.peak
          );

        var pb =
          b.grahan.contact &&
          toDate(
            b.grahan.contact.peak
          );

        var ta =
          pa
            ? pa.getTime()
            : a.date.getTime();

        var tb =
          pb
            ? pb.getTime()
            : b.date.getTime();

        return ta - tb;
      }
    );

    return unique;
  }

  /* =========================================================
     SHELL
     ========================================================= */

  function buildYearOptions(
    selected
  ) {
    var html = "";

    for (
      var y = YEAR_MIN;
      y <= YEAR_MAX;
      y++
    ) {
      html +=
        '<option value="' +
        y +
        '"' +
        (
          y === selected
            ? " selected"
            : ""
        ) +
        ">" +
        y +
        "</option>";
    }

    return html;
  }

  function renderShell(
    container,
    year,
    location
  ) {
    container.innerHTML = [
      '<div class="ohd-ep-wrap">',

      '<div class="ohd-ep-control-box">',

      '<div class="ohd-ep-year-control">',
      "<label>",
      "<span>वर्ष</span>",
      '<select id="ohd-eclipse-year">',
      buildYearOptions(year),
      "</select>",
      "</label>",
      "</div>",

      renderLocationCard(
        location
      ),

      "</div>",

      '<div id="ohd-eclipse-results" class="ohd-ep-results"></div>',

      "</div>"
    ].join("");
  }

 function renderLoading(container) {
  var box = container.querySelector("#ohd-eclipse-results");
  if (!box) return;

  box.innerHTML =
    '<div class="ohd-ep-loading">ग्रहण की गणना जारी है…</div>';
}

  function renderError(
    container,
    message
  ) {
    var box =
      container.querySelector(
        "#ohd-eclipse-results"
      );

    if (!box) return;

    box.innerHTML =
      '<div class="ohd-ep-error">' +
      esc(message) +
      "</div>";
  }

  function renderResults(
    container,
    eclipses,
    location,
    api
  ) {
    var box =
      container.querySelector(
        "#ohd-eclipse-results"
      );

    if (!box) return;

    if (
      !eclipses ||
      !eclipses.length
    ) {
      box.innerHTML =
        '<div class="ohd-ep-none">' +
        "इस वर्ष चयनित स्थान के लिए इस गणना में कोई स्थानीय ग्रहण परिणाम नहीं मिला।" +
        "</div>";

      return;
    }

    var html = "";

    eclipses.forEach(
      function (item) {
        html +=
          renderEclipseCard(
            item,
            location,
            api
          );
      }
    );

    box.innerHTML = html;
  }

  /* =========================================================
     CONTROLLER
     ========================================================= */

  function createController() {
    var ctl = {
      container: null,
      year: new Date().getFullYear(),
      location: null,
      api: null,
      runId: 0,
      wired: false
    };

    async function run() {
      if (
        !ctl.container ||
        !ctl.location ||
        !ctl.api
      ) {
        return;
      }

      var currentRun =
        ++ctl.runId;

      renderLoading(
        ctl.container
      );

      var started =
        performance &&
        performance.now
          ? performance.now()
          : Date.now();

      try {
        var eclipses =
          await discoverEclipses(
            ctl.year,
            ctl.location,
            ctl.api
          );

        if (
          currentRun !==
          ctl.runId
        ) {
          return;
        }

        var elapsed =
          (
            performance &&
            performance.now
          )
            ? performance.now() -
              started
            : Date.now() -
              started;

        log(
          "Eclipse discovery:",
          Math.round(
            elapsed
          ) + " ms"
        );

        renderResults(
          ctl.container,
          eclipses,
          ctl.location,
          ctl.api
        );
      } catch (e) {
        if (
          currentRun !==
          ctl.runId
        ) {
          return;
        }

        logErr(e);

        renderError(
          ctl.container,
          "ग्रहण जानकारी लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
        );
      }
    }

    function wireControls() {
      if (ctl.wired) return;

      var select =
        ctl.container.querySelector(
          "#ohd-eclipse-year"
        );

      if (select) {
        select.addEventListener(
          "change",
          function (event) {
            var year =
              parseInt(
                event.target.value,
                10
              );

            if (
              !isFinite(year) ||
              year < YEAR_MIN ||
              year > YEAR_MAX
            ) {
              return;
            }

            ctl.year = year;

            run();
          }
        );
      }

      ctl.wired = true;
    }

    function attach(
      container
    ) {
      ctl.container =
        container;

      renderShell(
        container,
        ctl.year,
        ctl.location
      );

      ctl.wired = false;

      wireControls();
    }

    function setLocation(
      location
    ) {
      ctl.location =
        location;

      if (ctl.container) {
        renderShell(
          ctl.container,
          ctl.year,
          ctl.location
        );

        ctl.wired = false;

        wireControls();
      }
    }

    function setApi(api) {
      ctl.api = api;
    }

    return {
      attach: attach,
      setLocation: setLocation,
      setApi: setApi,
      run: run,

      get year() {
        return ctl.year;
      },

      setYear: function (y) {
        ctl.year = y;
      }
    };
  }

  /* =========================================================
     PUBLIC INIT
     ========================================================= */

  async function initEclipsePanchang(
    requestedYear
  ) {
    var container =
      document.getElementById(
        CONTAINER_ID
      );

    if (!container) {
      log(
        "Container not found."
      );

      return null;
    }

    var ctl;

    if (
      state.initialized &&
      state.controller
    ) {
      ctl =
        state.controller;
    } else {
      ctl =
        createController();

      state.controller =
        ctl;

      state.initialized =
        true;
    }

    var year =
      typeof requestedYear ===
      "number"
        ? requestedYear
        : ctl.year;

    if (
      year < YEAR_MIN ||
      year > YEAR_MAX
    ) {
      year =
        new Date().getFullYear();

      if (
        year < YEAR_MIN ||
        year > YEAR_MAX
      ) {
        year = YEAR_MIN;
      }
    }

    ctl.setYear(year);

    var location =
      readLocation();

    ctl.location =
      location;

    ctl.attach(
      container
    );

    if (!location) {
      renderError(
        container,
        "स्थान उपलब्ध नहीं है। कृपया मुख्य पंचांग में स्थान चुनें।"
      );

      return ctl;
    }

    try {
      var api =
        ctl.api ||
        await waitForSharedApi();

      ctl.setApi(api);
    } catch (e) {
      logErr(e);

      renderError(
        container,
        "पंचांग लाइब्रेरी लोड नहीं हो सकी।"
      );

      return ctl;
    }

    await ctl.run();

    return ctl;
  }

  /* =========================================================
     GLOBAL SYNC
     ========================================================= */

  window.addEventListener(
    "storage",
    function (event) {
      if (
        event.key !==
        STORAGE_KEY
      ) {
        return;
      }

      if (
        !state.controller
      ) {
        return;
      }

      initEclipsePanchang(
        state.controller.year
      );
    }
  );

  document.addEventListener(
    "visibilitychange",
    function () {
      if (
        document.visibilityState !==
        "visible"
      ) {
        return;
      }

      if (
        !state.controller
      ) {
        return;
      }

      var latest =
        readLocation();

      if (!latest) return;

      var old =
        state.controller.location;

      if (
        !old ||
        old.lat !== latest.lat ||
        old.lon !== latest.lon ||
        old.elevation !==
          latest.elevation
      ) {
        initEclipsePanchang(
          state.controller.year
        );
      }
    }
  );

  /*
   * IMPORTANT:
   * No auto-init.
   * Blogger explicitly calls this.
   */

  window.initEclipsePanchang =
    initEclipsePanchang;
})();
