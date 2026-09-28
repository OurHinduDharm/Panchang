/**
 * eclipse-panchang.js — Grahana-based Eclipse Panchang
 * OurHinduDharm
 *
 * Public entry:
 *   window.initEclipsePanchang(year?)
 *
 * Design:
 *   - Eclipse discovery uses module.findTithiTransitions()
 *   - Eclipse truth comes only from getGrahana()
 *   - getPanchangam() is called only for actual eclipses
 *   - No static eclipse dates
 *   - No hard-coded city/date results
 *   - No custom 6h/12h astronomical scanning
 *   - No custom binary-search eclipse calculation
 *   - No external astronomy API
 *   - No auto-init
 */

(function () {
  'use strict';

  /* ============================================================
     CONSTANTS
     ============================================================ */

  var CONTAINER_ID = 'ohd-eclipse-panchang';
  var STORAGE_KEY = 'ohdPanchangLocation';

  // Existing OurHinduDharm convention.
  var TZ_OFFSET = 330;

  var YEAR_MIN = 2026;
  var YEAR_MAX = 2031;

  var PURASHCHARANA_URL =
    'https://ourhindudharm.blogspot.com/2022/10/About-Grahan-mantra-purashcharan.html';

  var LOCATION_HINT =
    'स्थान बदलने पर ग्रहण की दृश्यता, समय और दिन का पंचांग उसी स्थान के अनुसार पुनर्गणित होगा।';


  /* ============================================================
     STATE
     ============================================================ */

  var state = {
    initialized: false,
    controller: null
  };


  /* ============================================================
     DEBUG
     ============================================================ */

  function isDebug() {
    return window.__OHDEclipseDebug === true;
  }

  function log() {
    if (!isDebug()) return;

    console.log.apply(
      console,
      ['[EclipsePanchang]'].concat([].slice.call(arguments))
    );
  }

  function logErr() {
    if (!isDebug()) return;

    console.error.apply(
      console,
      ['[EclipsePanchang]'].concat([].slice.call(arguments))
    );
  }


  /* ============================================================
     BASIC HELPERS
     ============================================================ */

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toDate(v) {
    if (!v) return null;

    if (v instanceof Date) {
      return isNaN(v.getTime()) ? null : v;
    }

    var d = new Date(v);

    return isNaN(d.getTime()) ? null : d;
  }

  function yieldToMain() {
    return new Promise(function (resolve) {
      if (typeof requestIdleCallback === 'function') {
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


  /* ============================================================
     HINDI MAPS
     ============================================================ */

  var TITHI_MAP = {
    Prathama: 'प्रतिपदा',
    Dvitiya: 'द्वितीया',
    Tritiya: 'तृतीया',
    Chaturthi: 'चतुर्थी',
    Panchami: 'पंचमी',
    Shashthi: 'षष्ठी',
    Saptami: 'सप्तमी',
    Ashtami: 'अष्टमी',
    Navami: 'नवमी',
    Dashami: 'दशमी',
    Ekadashi: 'एकादशी',
    Dvadashi: 'द्वादशी',
    Trayodashi: 'त्रयोदशी',
    Chaturdashi: 'चतुर्दशी',
    Purnima: 'पूर्णिमा',
    Amavasya: 'अमावस्या'
  };

  var PAKSHA_MAP = {
    Shukla: 'शुक्ल पक्ष',
    Krishna: 'कृष्ण पक्ष'
  };

  var MASA_MAP = {
    Chaitra: 'चैत्र',
    Vaishakha: 'वैशाख',
    Jyeshtha: 'ज्येष्ठ',
    Ashadha: 'आषाढ़',
    Shravana: 'श्रावण',
    Bhadrapada: 'भाद्रपद',
    Ashwin: 'आश्विन',
    Kartika: 'कार्तिक',
    Margashirsha: 'मार्गशीर्ष',
    Pausha: 'पौष',
    Magha: 'माघ',
    Phalguna: 'फाल्गुन'
  };

var NAKSHATRA_MAP = {
  Ashwini: 'अश्विनी',
  Bharani: 'भरणी',
  Krittika: 'कृत्तिका',
  Rohini: 'रोहिणी',
  Mrigashira: 'मृगशीर्ष',
  Ardra: 'आर्द्रा',
  Punarvasu: 'पुनर्वसु',
  Pushya: 'पुष्य',
  Ashlesha: 'आश्लेषा',
  Magha: 'मघा',
  'Purva Phalguni': 'पूर्वाफाल्गुनी',
  'Uttara Phalguni': 'उत्तराफाल्गुनी',
  Hasta: 'हस्त',
  Chitra: 'चित्रा',
  Swati: 'स्वाती',
  Vishakha: 'विशाखा',
  Anuradha: 'अनुराधा',
  Jyeshtha: 'ज्येष्ठा',
  Mula: 'मूल',
  'Purva Ashadha': 'पूर्वाषाढ़ा',
  'Uttara Ashadha': 'उत्तराषाढ़ा',
  Shravana: 'श्रवण',
  Dhanishtha: 'धनिष्ठा',
  Shatabhisha: 'शतभिषा',
  'Purva Bhadrapada': 'पूर्वाभाद्रपदा',
  'Uttara Bhadrapada': 'उत्तराभाद्रपदा',
  Revati: 'रेवती'
};

  var WEEKDAY_MAP = [
    'रविवार',
    'सोमवार',
    'मंगलवार',
    'बुधवार',
    'गुरुवार',
    'शुक्रवार',
    'शनिवार'
  ];


  /* ============================================================
     LOCATION
     ============================================================ */

  function readLocation() {
    var raw;

    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      logErr('localStorage read failed:', e);
      return null;
    }

    if (!raw) return null;

    var o;

    try {
      o = JSON.parse(raw);
    } catch (e2) {
      logErr('Invalid location JSON:', e2);
      return null;
    }

    if (!o || typeof o !== 'object') return null;

    if (
      typeof o.lat !== 'number' ||
      typeof o.lon !== 'number' ||
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
      typeof o.elevation === 'number' && isFinite(o.elevation)
        ? o.elevation
        : 0;

    return {
      name: o.name || o.city || o.state || 'चयनित स्थान',
      lat: o.lat,
      lon: o.lon,
      elevation: elevation,
      state: o.state || '',
      city: o.city || ''
    };
  }

  function saveLocation(location) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(location)
      );
    } catch (e) {
      logErr('Could not save location:', e);
    }
  }

  function locationDisplayName(location) {
    if (!location) return 'स्थान उपलब्ध नहीं';

    return (
      location.name ||
      location.city ||
      location.state ||
      'चयनित स्थान'
    );
  }


  /* ============================================================
     SHARED PANCHANG API
     ============================================================ */

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
          'ohd:panchangam-ready',
          onReady
        );

        reject(
          new Error(
            'पंचांग लाइब्रेरी लोड नहीं हो सकी।'
          )
        );
      }, 30000);

      function onReady() {
        window.removeEventListener(
          'ohd:panchangam-ready',
          onReady
        );

        clearTimeout(timer);

        var a = getSharedApi();

        if (a) {
          resolve(a);
        } else {
          reject(
            new Error(
              'पंचांग लाइब्रेरी तैयार नहीं हुई।'
            )
          );
        }
      }

      window.addEventListener(
        'ohd:panchangam-ready',
        onReady,
        { once: true }
      );
    });
  }

  function resolveFunction(api, name) {
    if (!api) return null;

    if (typeof api[name] === 'function') {
      return api[name];
    }

    if (
      api.module &&
      typeof api.module[name] === 'function'
    ) {
      return api.module[name];
    }

    return null;
  }


  /* ============================================================
     TIME / DATE FORMATTING
     ============================================================ */

  function fmtTime(date, tzOffsetMin) {
    var d = toDate(date);

    if (!d) return '—';

    // Explicit timezone arithmetic.
    // Independent of browser timezone.
    var wall = new Date(
      d.getTime() + tzOffsetMin * 60000
    );

    var h = wall.getUTCHours();
    var m = wall.getUTCMinutes();

    var ampm = h >= 12 ? 'PM' : 'AM';

    var h12 = h % 12;

    if (h12 === 0) h12 = 12;

    return (
      pad2(h12) +
      ':' +
      pad2(m) +
      ' ' +
      ampm
    );
  }

  function fmtDate(date, tzOffsetMin) {
    var d = toDate(date);

    if (!d) return '—';

    var wall = new Date(
      d.getTime() + tzOffsetMin * 60000
    );

    return (
      pad2(wall.getUTCDate()) +
      '/' +
      pad2(wall.getUTCMonth() + 1) +
      '/' +
      wall.getUTCFullYear()
    );
  }

  function fmtWeekday(date, tzOffsetMin) {
    var d = toDate(date);

    if (!d) return '—';

    var wall = new Date(
      d.getTime() + tzOffsetMin * 60000
    );

    return WEEKDAY_MAP[wall.getUTCDay()] || '—';
  }


  /* ============================================================
     PANCHANG EXTRACTION
     Verified against current runtime:
     p.tithi       = number
     p.tithis[]    = objects with index/name
     p.paksha      = string
     p.masa        = object
     p.nakshatra   = number
     p.nakshatras[]= objects with index/name
     p.samvat.vikram= number
     ============================================================ */

  function extractPanchangFields(p) {
    if (!p) return {};

    var tithiHindi = '—';

    if (
      Array.isArray(p.tithis) &&
      typeof p.tithi === 'number'
    ) {
      var tObj = p.tithis.find(function (t) {
        return t && t.index === p.tithi;
      });

      if (
        tObj &&
        typeof tObj.name === 'string'
      ) {
        tithiHindi =
          TITHI_MAP[tObj.name] ||
          tObj.name;
      }
    } else if (
      typeof p.tithi === 'string'
    ) {
      tithiHindi =
        TITHI_MAP[p.tithi] ||
        p.tithi;
    }

    var pakshaHindi = '—';

    if (typeof p.paksha === 'string') {
      pakshaHindi =
        PAKSHA_MAP[p.paksha] ||
        p.paksha;
    }

    var masaHindi = '—';

    if (
      p.masa &&
      typeof p.masa.name === 'string'
    ) {
      masaHindi =
        MASA_MAP[p.masa.name] ||
        p.masa.name;

      if (p.masa.isAdhika) {
        masaHindi =
          'अधिक ' + masaHindi;
      }
    } else if (
      typeof p.masa === 'string'
    ) {
      masaHindi =
        MASA_MAP[p.masa] ||
        p.masa;
    }

    var nakshatraHindi = '—';

    if (
      Array.isArray(p.nakshatras) &&
      typeof p.nakshatra === 'number'
    ) {
      var nObj = p.nakshatras.find(function (n) {
        return n && n.index === p.nakshatra;
      });

      if (
        nObj &&
        typeof nObj.name === 'string'
      ) {
        nakshatraHindi =
          NAKSHATRA_MAP[nObj.name] ||
          nObj.name;
      }
    } else if (
      typeof p.nakshatra === 'string'
    ) {
      nakshatraHindi =
        NAKSHATRA_MAP[p.nakshatra] ||
        p.nakshatra;
    }

    var vikramSamvat = null;

    if (
      p.samvat &&
      typeof p.samvat.vikram === 'number' &&
      p.samvat.vikram > 2000
    ) {
      vikramSamvat = p.samvat.vikram;
    }

    return {
      tithi: tithiHindi,
      paksha: pakshaHindi,
      masa: masaHindi,
      nakshatra: nakshatraHindi,
      vikramSamvat: vikramSamvat
    };
  }


  /* ============================================================
     PANCHANG FOR ACTUAL ECLIPSE DATE
     ============================================================ */

  function getDayPanchang(
    eclipseDate,
    observer,
    api
  ) {
    var getPanchangam =
      resolveFunction(api, 'getPanchangam');

    if (typeof getPanchangam !== 'function') {
      throw new Error(
        'getPanchangam उपलब्ध नहीं है।'
      );
    }

    var p = getPanchangam(
      eclipseDate,
      observer,
      {
        timezoneOffset: TZ_OFFSET,
        calendarType: 'purnimanta'
      }
    );

    return {
      fields: extractPanchangFields(p),
      sunrise: p && p.sunrise
        ? toDate(p.sunrise)
        : null,
      sunset: p && p.sunset
        ? toDate(p.sunset)
        : null
    };
  }


  /* ============================================================
     UI SHELL
     ============================================================ */

  function buildYearOptions(selected) {
    var out = '';

    for (
      var y = YEAR_MIN;
      y <= YEAR_MAX;
      y++
    ) {
      out +=
        '<option value="' +
        y +
        '"' +
        (y === selected
          ? ' selected'
          : '') +
        '>' +
        y +
        '</option>';
    }

    return out;
  }

  function renderStyles() {
    if (
      document.getElementById(
        'ohd-eclipse-panchang-styles'
      )
    ) {
      return;
    }

    var style =
      document.createElement('style');

    style.id =
      'ohd-eclipse-panchang-styles';

    style.textContent = `
      .ohd-eclipse-wrap {
        width: 100%;
      }

      .ohd-eclipse-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        margin-bottom: 10px;
      }

      .ohd-eclipse-field {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
      }

      .ohd-eclipse-field select {
        min-width: 90px;
        padding: 7px 9px;
        border-radius: 7px;
      }

      .ohd-eclipse-loc {
        flex: 1 1 240px;
        min-width: 0;
      }

      .ohd-eclipse-loc-name {
        font-weight: 700;
      }

      .ohd-eclipse-hint {
        margin: 6px 0 18px;
        font-size: .9em;
        opacity: .78;
      }

      .ohd-eclipse-location-tools {
        margin: 12px 0 18px;
      }

      .ohd-eclipse-location-search {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
      }

      .ohd-eclipse-location-search input {
        flex: 1 1 220px;
        min-width: 0;
        padding: 9px 10px;
        border-radius: 7px;
        border: 1px solid rgba(0,0,0,.2);
      }

      .ohd-eclipse-location-search button {
        padding: 9px 12px;
        border-radius: 7px;
        cursor: pointer;
      }

      .ohd-eclipse-gps {
        margin-top: 8px;
      }

      .ohd-eclipse-gps button {
        padding: 8px 11px;
        border-radius: 7px;
        cursor: pointer;
      }

      .ohd-eclipse-location-results {
        margin-top: 8px;
      }

      .ohd-eclipse-location-result {
        display: block;
        width: 100%;
        text-align: left;
        margin: 5px 0;
        padding: 9px 10px;
        border-radius: 7px;
        border: 1px solid rgba(0,0,0,.12);
        background: transparent;
        cursor: pointer;
      }

      .ohd-eclipse-card {
        margin: 0 0 18px;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,.13);
      }

      .ohd-eclipse-card h3 {
        margin-top: 0;
      }

      .ohd-eclipse-card p {
        margin: 7px 0;
      }

      .ohd-eclipse-visibility-note {
        margin: 12px 0;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0,0,0,.10);
      }

      .ohd-eclipse-panchang-details {
        margin-top: 14px;
        border-top: 1px solid rgba(0,0,0,.12);
      }

      .ohd-eclipse-panchang-details summary {
        cursor: pointer;
        padding: 12px 4px;
        font-weight: 700;
        list-style: none;
        user-select: none;
      }

      .ohd-eclipse-panchang-details summary::-webkit-details-marker {
        display: none;
      }

      .ohd-eclipse-panchang-details summary::after {
        content: "＋";
        float: right;
        font-weight: 700;
      }

      .ohd-eclipse-panchang-details[open] summary::after {
        content: "−";
      }

      .ohd-eclipse-panchang-inner {
        padding: 4px 0 10px;
      }

      .ohd-panchang-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 7px 0;
        border-bottom: 1px solid rgba(0,0,0,.07);
      }

      .ohd-panchang-row:last-child {
        border-bottom: 0;
      }

      .ohd-panchang-row span {
        opacity: .78;
      }

      .ohd-panchang-row strong {
        text-align: right;
      }

      .ohd-purashcharan-card {
        margin-top: 24px;
        padding: 18px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,.13);
      }

      .ohd-purashcharan-card h2 {
        margin-top: 0;
      }

      .ohd-purashcharan-card p {
        line-height: 1.7;
      }

      .ohd-shloka {
        margin: 14px 0;
        padding: 12px 14px;
        text-align: center;
        font-weight: 600;
        line-height: 1.9;
      }

      .ohd-purashcharan-link {
        display: block;
        padding: 12px 14px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 700;
        border: 1px solid rgba(0,0,0,.13);
      }

      .ohd-eclipse-loading,
      .ohd-eclipse-error,
      .ohd-eclipse-none {
        padding: 12px;
      }
    `;

    document.head.appendChild(style);
  }

  function renderShell(
    container,
    year,
    location
  ) {
    var locName =
      locationDisplayName(location);

    container.innerHTML = [
      '<div class="ohd-eclipse-wrap">',

      '  <div class="ohd-eclipse-controls">',

      '    <label class="ohd-eclipse-field">',
      '      <span>वर्ष:</span>',
      '      <select id="ohd-eclipse-year">',
      buildYearOptions(year),
      '      </select>',
      '    </label>',

      '    <div class="ohd-eclipse-loc">',
      '      <span class="ohd-eclipse-loc-name" id="ohd-eclipse-loc-name">',
      esc(locName),
      '      </span>',
      '    </div>',

      '  </div>',

      '  <div class="ohd-eclipse-location-tools">',

      '    <div class="ohd-eclipse-location-search">',
      '      <input id="ohd-eclipse-location-input" type="search" placeholder="शहर / स्थान खोजें..." autocomplete="off">',
      '      <button type="button" id="ohd-eclipse-location-search-btn">स्थान खोजें</button>',
      '    </div>',

      '    <div class="ohd-eclipse-gps">',
      '      <button type="button" id="ohd-eclipse-gps-btn">📍 वर्तमान स्थान का उपयोग करें</button>',
      '    </div>',

      '    <div id="ohd-eclipse-location-results" class="ohd-eclipse-location-results"></div>',

      '  </div>',

      '  <div class="ohd-eclipse-hint">',
      esc(LOCATION_HINT),
      '  </div>',

      '  <div class="ohd-eclipse-results" id="ohd-eclipse-results"></div>',

      '</div>'
    ].join('');
  }

  function setResults(
    container,
    html
  ) {
    var box =
      container.querySelector(
        '#ohd-eclipse-results'
      );

    if (box) {
      box.innerHTML = html;
    }
  }

  function renderLoading(
    container,
    msg
  ) {
    setResults(
      container,
      '<p class="ohd-eclipse-loading">' +
        esc(msg) +
        '</p>'
    );
  }

  function renderError(
    container,
    msg
  ) {
    setResults(
      container,
      '<p class="ohd-eclipse-error">' +
        esc(msg) +
        '</p>'
    );
  }

  function setLocationLabel(
    container,
    location
  ) {
    var el =
      container.querySelector(
        '#ohd-eclipse-loc-name'
      );

    if (!el) return;

    el.textContent =
      locationDisplayName(location);
  }


  /* ============================================================
     LOCATION SEARCH
     ============================================================ */

  async function searchLocation(
    query
  ) {
    var url =
      'https://nominatim.openstreetmap.org/search' +
      '?format=json' +
      '&addressdetails=1' +
      '&q=' +
      encodeURIComponent(query) +
      '&limit=5' +
      '&countrycodes=in';

    var response =
      await fetch(url, {
        headers: {
          Accept: 'application/json'
        }
      });

    if (!response.ok) {
      throw new Error(
        'स्थान खोजने में समस्या हुई।'
      );
    }

    return response.json();
  }

  function resultToLocation(item) {
    var address =
      item.address || {};

    var city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      '';

    var stateName =
      address.state || '';

    var name =
      [
        city,
        stateName,
        'भारत'
      ]
        .filter(Boolean)
        .join(', ');

    if (!name) {
      name =
        item.display_name ||
        'चयनित स्थान';
    }

    return {
      name: name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      elevation: 0,
      state: stateName,
      city: city
    };
  }


  /* ============================================================
     DISCOVERY
     ============================================================ */

  function transitionToCandidate(
    endTime,
    tithiIndex
  ) {
    var end = toDate(endTime);

    if (!end) return null;

    // Convert transition instant to IST civil date.
    var istMs =
      end.getTime() +
      TZ_OFFSET * 60000;

    var ist = new Date(istMs);

    var y =
      ist.getUTCFullYear();

    var m =
      ist.getUTCMonth();

    var d =
      ist.getUTCDate();

    // Local noon IST expressed as UTC.
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
          TZ_OFFSET * 60000
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

    if (!module) {
      throw new Error(
        'Panchangam module उपलब्ध नहीं है।'
      );
    }

    var findTithiTransitions =
      module.findTithiTransitions;

    var getGrahana =
      module.getGrahana ||
      api.getGrahana;

    var Observer =
      api.Observer ||
      module.Observer;

    if (
      typeof findTithiTransitions !==
      'function'
    ) {
      throw new Error(
        'findTithiTransitions उपलब्ध नहीं है।'
      );
    }

    if (
      typeof getGrahana !==
      'function'
    ) {
      throw new Error(
        'getGrahana उपलब्ध नहीं है।'
      );
    }

    if (
      typeof Observer !==
      'function'
    ) {
      throw new Error(
        'Observer उपलब्ध नहीं है।'
      );
    }

    /*
     * IST year boundaries with one-day safety margin.
     */
    var start =
      new Date(
        Date.UTC(year, 0, 1) -
          TZ_OFFSET * 60000 -
          86400000
      );

    var end =
      new Date(
        Date.UTC(year + 1, 0, 1) -
          TZ_OFFSET * 60000 +
          86400000
      );

    log(
      'findTithiTransitions:',
      start.toISOString(),
      '→',
      end.toISOString()
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

    var purnimaList = [];
    var amavasyaList = [];

    list.forEach(function (t) {
      if (!t) return;

      if (t.index === 14) {
        purnimaList.push(t);
      } else if (
        t.index === 29
      ) {
        amavasyaList.push(t);
      }
    });

    var candidates = [];

    function pushCandidates(
      arr,
      tithiIndex
    ) {
      arr.forEach(function (t) {
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
      });
    }

    pushCandidates(
      purnimaList,
      14
    );

    pushCandidates(
      amavasyaList,
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
          'getGrahana failed:',
          e
        );
      }

      if (grahana) {
        results.push({
          date: c.date,
          grahan: grahana
        });
      }

      if (i % 5 === 0) {
        await yieldToMain();
      }
    }

    /*
     * Final dedupe by type + peak timestamp.
     */
    var seen =
      Object.create(null);

    var unique = [];

    results.forEach(function (r) {
      var g = r.grahan;

      var peak =
        g &&
        g.contact &&
        toDate(
          g.contact.peak
        );

      var peakMs =
        peak
          ? peak.getTime()
          : r.date.getTime();

      var key =
        String(g.type || '') +
        '|' +
        peakMs;

      if (seen[key]) return;

      seen[key] = true;

      unique.push(r);
    });

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


  /* ============================================================
     PANCHANG HTML
     ============================================================ */

  function renderPanchangDetails(
    dayPanchang,
    eclipseDate
  ) {
    var f =
      dayPanchang.fields || {};

    var sunrise =
      dayPanchang.sunrise
        ? fmtTime(
            dayPanchang.sunrise,
            TZ_OFFSET
          )
        : '—';

    var sunset =
      dayPanchang.sunset
        ? fmtTime(
            dayPanchang.sunset,
            TZ_OFFSET
          )
        : '—';

    var weekday =
      fmtWeekday(
        eclipseDate,
        TZ_OFFSET
      );

    var rows = [
      [
        'वार',
        weekday
      ],
      [
        'तिथि',
        f.tithi || '—'
      ],
      [
        'पक्ष',
        f.paksha || '—'
      ],
      [
        'मास',
        f.masa || '—'
      ],
      [
        'नक्षत्र',
        f.nakshatra || '—'
      ]
    ];

    if (f.vikramSamvat) {
      rows.push([
        'विक्रम संवत',
        String(
          f.vikramSamvat
        )
      ]);
    }

    rows.push(
      [
        'सूर्योदय',
        sunrise
      ],
      [
        'सूर्यास्त',
        sunset
      ]
    );

    return [
      '<details class="ohd-eclipse-panchang-details">',
      '  <summary>📅 इस ग्रहण-दिन का पंचांग देखें</summary>',
      '  <div class="ohd-eclipse-panchang-inner">',

      rows
        .map(function (row) {
          return (
            '<div class="ohd-panchang-row">' +
              '<span>' +
              esc(row[0]) +
              '</span>' +
              '<strong>' +
              esc(row[1]) +
              '</strong>' +
            '</div>'
          );
        })
        .join(''),

      '  </div>',
      '</details>'
    ].join('');
  }


  /* ============================================================
     VISIBILITY
     ============================================================ */

  function renderVisibility(
    g
  ) {
    /*
     * Strict rule:
     * true  = दृश्य
     * false = अदृश्य
     * undefined = visibility not determined
     */
    if (g.isVisible === true) {
      return (
        '<p><strong>दृश्यता:</strong> दृश्य</p>'
      );
    }

    if (g.isVisible === false) {
      return [
        '<p><strong>दृश्यता:</strong> अदृश्य</p>',
        '<div class="ohd-eclipse-visibility-note">',
        'इस चयनित स्थान पर यह ग्रहण खगोलीय रूप से स्थानीय रूप से दृश्य नहीं है। ',
        'अतः इस स्थान से ग्रहण का दर्शन संभव नहीं होगा।',
        '</div>'
      ].join('');
    }

    return (
      '<p><strong>दृश्यता:</strong> निर्धारित नहीं</p>'
    );
  }


  /* ============================================================
     ECLIPSE CARD
     ============================================================ */

  function renderEclipseCard(
    item,
    observer,
    api,
    tzOffsetMin
  ) {
    var g =
      item.grahan;

    if (!g) return '';

    var peak =
      g.contact &&
      g.contact.peak;

    var dateStr =
      fmtDate(
        peak || item.date,
        tzOffsetMin
      );

    var html = '';

    html +=
      '<div class="ohd-eclipse-card">';

    html +=
      '<h3>' +
      esc(dateStr) +
      ' — ' +
      esc(
        g.type || 'ग्रहण'
      ) +
      (
        g.subtype
          ? ' (' +
            esc(g.subtype) +
            ')'
          : ''
      ) +
      '</h3>';

    html +=
      renderVisibility(g);

    if (
      typeof g.obscuration ===
        'number' &&
      isFinite(
        g.obscuration
      )
    ) {
      html +=
        '<p><strong>आच्छादन:</strong> ' +
        (
          g.obscuration * 100
        ).toFixed(1) +
        '%</p>';
    }

    if (g.contact) {
      if (
        g.contact.firstContact
      ) {
        html +=
          '<p><strong>प्रथम स्पर्श:</strong> ' +
          esc(
            fmtTime(
              g.contact.firstContact,
              tzOffsetMin
            )
          ) +
          '</p>';
      }

      if (
        g.contact.totalityBegin &&
        g.contact.totalityEnd
      ) {
        html +=
          '<p><strong>पूर्णता:</strong> ' +
          esc(
            fmtTime(
              g.contact.totalityBegin,
              tzOffsetMin
            )
          ) +
          ' — ' +
          esc(
            fmtTime(
              g.contact.totalityEnd,
              tzOffsetMin
            )
          ) +
          '</p>';
      }

      if (g.contact.peak) {
        html +=
          '<p><strong>मध्य:</strong> ' +
          esc(
            fmtTime(
              g.contact.peak,
              tzOffsetMin
            )
          ) +
          '</p>';
      }

      if (
        g.contact.lastContact
      ) {
        html +=
          '<p><strong>अंतिम स्पर्श:</strong> ' +
          esc(
            fmtTime(
              g.contact.lastContact,
              tzOffsetMin
            )
          ) +
          '</p>';
      }
    }

    if (
      g.sutakKaal &&
      g.sutakKaal.start &&
      g.sutakKaal.end
    ) {
      html +=
        '<p><strong>सूतक काल:</strong> ' +
        esc(
          fmtTime(
            g.sutakKaal.start,
            tzOffsetMin
          )
        ) +
        ' — ' +
        esc(
          fmtTime(
            g.sutakKaal.end,
            tzOffsetMin
          )
        ) +
        '</p>';
    }

    if (
      g.punyaKala &&
      g.punyaKala.start &&
      g.punyaKala.end
    ) {
      html +=
        '<p><strong>पुण्य काल:</strong> ' +
        esc(
          fmtTime(
            g.punyaKala.start,
            tzOffsetMin
          )
        ) +
        ' — ' +
        esc(
          fmtTime(
            g.punyaKala.end,
            tzOffsetMin
          )
        ) +
        '</p>';
    }

    /*
     * IMPORTANT:
     * Day Panchang is calculated only for an actual
     * eclipse result. It is NOT calculated during discovery.
     */
    try {
      var dayPanchang =
        getDayPanchang(
          item.date,
          observer,
          api
        );

      html +=
        renderPanchangDetails(
          dayPanchang,
          item.date
        );
    } catch (e) {
      logErr(
        'Day Panchang failed:',
        e
      );

      /*
       * Do not fabricate Panchang values.
       * Eclipse card remains valid without them.
       */
      html +=
        '<details class="ohd-eclipse-panchang-details">' +
        '<summary>📅 इस ग्रहण-दिन का पंचांग देखें</summary>' +
        '<div class="ohd-eclipse-panchang-inner">' +
        '<p>इस दिन का पंचांग उपलब्ध नहीं हो सका।</p>' +
        '</div>' +
        '</details>';
    }

    html +=
      '</div>';

    return html;
  }


  /* ============================================================
     PURASHCHARANA CTA
     ============================================================ */

  function renderPurashcharanaCard() {
    return [
      '<section class="ohd-section ohd-purashcharan-card">',

      '<h2>📿 ग्रहण में मन्त्र-पुरश्चरण</h2>',

      '<p>',
      'ग्रहणकाल में मन्त्र-जप और पुरश्चरण के सम्बन्ध में ',
      'शास्त्रीय ग्रन्थों में विशेष विधि का वर्णन मिलता है। ',
      'स्पर्श से मोक्ष तक मन्त्र-जप तथा उसके पश्चात् ',
      'होम, तर्पण, अभिषेक और ब्राह्मण-भोजन आदि की विधि ',
      'विस्तार से जानने के लिए सम्पूर्ण आलेख देखें।',
      '</p>',

      '<div class="ohd-shloka">',
      'अथवान्य-प्रकारेण पौरश्चारणिको-विधिः।<br>',
      'चन्द्र-सूर्योपरागे च स्नात्वा प्रयत-मानसः।<br>',
      'स्पर्शनादि-विमोक्षान्तं जपेन्मन्त्रं समाहितः॥',
      '</div>',

      '<a class="ohd-purashcharan-link"',
      ' href="',
      PURASHCHARANA_URL,
      '" target="_blank" rel="noopener">',
      '📖 ग्रहण में मन्त्र-पुरश्चरण की सम्पूर्ण विधि पढ़ें →',
      '</a>',

      '</section>'
    ].join('');
  }


  /* ============================================================
     RENDER ALL ECLIPSES
     ============================================================ */

  function renderEclipses(
    container,
    eclipses,
    location,
    api,
    tzOffsetMin
  ) {
    if (
      !eclipses ||
      eclipses.length === 0
    ) {
      setResults(
        container,
        [
          '<p class="ohd-eclipse-none">',
          'वर्ष ',
          esc(
            String(
              state.controller
                ? state.controller.year
                : ''
            )
          ),
          ' में ',
          esc(
            locationDisplayName(
              location
            )
          ),
          ' के लिए कोई खगोलीय ग्रहण ',
          'इस गणना से प्राप्त नहीं हुआ।',
          '</p>'
        ].join('')
      );

      return;
    }

    var observer =
      new api.Observer(
        location.lat,
        location.lon,
        location.elevation || 0
      );

    var html = '';

    eclipses.forEach(
      function (item) {
        html +=
          renderEclipseCard(
            item,
            observer,
            api,
            tzOffsetMin
          );
      }
    );

    /*
     * Article CTA is deliberately after the results.
     * This keeps the primary eclipse information first.
     */
    html +=
      renderPurashcharanaCard();

    setResults(
      container,
      html
    );
  }


  /* ============================================================
     CONTROLLER
     ============================================================ */

  function createController() {
    var ctl = {
      container: null,
      year: YEAR_MIN,
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

      /*
       * Every new run invalidates the previous one.
       */
      var myId =
        ++ctl.runId;

      renderLoading(
        ctl.container,
        'ग्रहण की गणना जारी है...'
      );

      try {
        var eclipses =
          await discoverEclipses(
            ctl.year,
            ctl.location,
            ctl.api
          );

        if (
          myId !== ctl.runId
        ) {
          return;
        }

        renderEclipses(
          ctl.container,
          eclipses,
          ctl.location,
          ctl.api,
          TZ_OFFSET
        );
      } catch (e) {
        if (
          myId !== ctl.runId
        ) {
          return;
        }

        logErr(
          'Discovery failed:',
          e
        );

        renderError(
          ctl.container,
          'ग्रहण जानकारी लोड करने में त्रुटि। कृपया पुनः प्रयास करें।'
        );
      }
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

    function wireControls() {
      if (ctl.wired) {
        return;
      }

      var sel =
        ctl.container.querySelector(
          '#ohd-eclipse-year'
        );

      if (sel) {
        sel.addEventListener(
          'change',
          function (e) {
            var y =
              parseInt(
                e.target.value,
                10
              );

            if (
              !isFinite(y) ||
              y < YEAR_MIN ||
              y > YEAR_MAX
            ) {
              return;
            }

            ctl.year = y;

            run();
          }
        );
      }

      var searchInput =
        ctl.container.querySelector(
          '#ohd-eclipse-location-input'
        );

      var searchBtn =
        ctl.container.querySelector(
          '#ohd-eclipse-location-search-btn'
        );

      if (
        searchBtn &&
        searchInput
      ) {
        searchBtn.addEventListener(
          'click',
          function () {
            performLocationSearch(
              searchInput.value
            );
          }
        );

        searchInput.addEventListener(
          'keydown',
          function (e) {
            if (
              e.key === 'Enter'
            ) {
              e.preventDefault();

              performLocationSearch(
                searchInput.value
              );
            }
          }
        );
      }

      var gpsBtn =
        ctl.container.querySelector(
          '#ohd-eclipse-gps-btn'
        );

      if (gpsBtn) {
        gpsBtn.addEventListener(
          'click',
          useCurrentLocation
        );
      }

      ctl.wired = true;
    }

    async function performLocationSearch(
      query
    ) {
      query =
        String(
          query || ''
        ).trim();

      if (!query) {
        return;
      }

      var resultsBox =
        ctl.container.querySelector(
          '#ohd-eclipse-location-results'
        );

      if (!resultsBox) {
        return;
      }

      resultsBox.innerHTML =
        '<p>स्थान खोजा जा रहा है...</p>';

      try {
        var results =
          await searchLocation(
            query
          );

        if (
          !Array.isArray(
            results
          ) ||
          results.length === 0
        ) {
          resultsBox.innerHTML =
            '<p>कोई स्थान नहीं मिला।</p>';

          return;
        }

        resultsBox.innerHTML =
          results
            .map(
              function (item, index) {
                return (
                  '<button type="button" ' +
                  'class="ohd-eclipse-location-result" ' +
                  'data-location-index="' +
                  index +
                  '">' +
                  esc(
                    item.display_name ||
                    'स्थान'
                  ) +
                  '</button>'
                );
              }
            )
            .join('');

        Array.prototype.forEach.call(
          resultsBox.querySelectorAll(
            '[data-location-index]'
          ),
          function (btn) {
            btn.addEventListener(
              'click',
              function () {
                var index =
                  parseInt(
                    btn.getAttribute(
                      'data-location-index'
                    ),
                    10
                  );

                var selected =
                  results[index];

                if (!selected) {
                  return;
                }

                var location =
                  resultToLocation(
                    selected
                  );

                if (
                  !isFinite(
                    location.lat
                  ) ||
                  !isFinite(
                    location.lon
                  )
                ) {
                  return;
                }

                saveAndRunLocation(
                  location
                );
              }
            );
          }
        );
      } catch (e) {
        logErr(
          'Location search failed:',
          e
        );

        resultsBox.innerHTML =
          '<p>स्थान खोजने में समस्या हुई।</p>';
      }
    }

    function useCurrentLocation() {
      if (
        !navigator.geolocation
      ) {
        renderError(
          ctl.container,
          'इस ब्राउज़र में GPS उपलब्ध नहीं है।'
        );

        return;
      }

      renderLoading(
        ctl.container,
        'वर्तमान स्थान प्राप्त किया जा रहा है...'
      );

      navigator.geolocation.getCurrentPosition(
        function (position) {
          var coords =
            position.coords;

          var location = {
            name: 'वर्तमान स्थान',
            lat: coords.latitude,
            lon: coords.longitude,
            elevation:
              typeof coords.altitude ===
              'number'
                ? coords.altitude
                : 0,
            state: '',
            city: ''
          };

          saveAndRunLocation(
            location
          );
        },
        function (error) {
          logErr(
            'Geolocation failed:',
            error
          );

          renderError(
            ctl.container,
            'वर्तमान स्थान प्राप्त नहीं हो सका। कृपया स्थान खोज का उपयोग करें।'
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    }

    function saveAndRunLocation(
      location
    ) {
      saveLocation(
        location
      );

      ctl.location =
        location;

      ctl.runId++;

      setLocationLabel(
        ctl.container,
        location
      );

      var resultsBox =
        ctl.container.querySelector(
          '#ohd-eclipse-location-results'
        );

      if (resultsBox) {
        resultsBox.innerHTML =
          '';
      }

      run();
    }

    function setYear(y) {
      ctl.year = y;
    }

    function setLocation(loc) {
      ctl.location =
        loc;
    }

    function setApi(api) {
      ctl.api =
        api;
    }

    return {
      attach: attach,
      setYear: setYear,
      setLocation: setLocation,
      setApi: setApi,
      run: run,

      get year() {
        return ctl.year;
      }
    };
  }


  /* ============================================================
     PUBLIC INIT
     ============================================================ */

  async function initEclipsePanchang(
    requestedYear
  ) {
    var container =
      document.getElementById(
        CONTAINER_ID
      );

    if (!container) {
      log(
        'Container #' +
          CONTAINER_ID +
          ' not found.'
      );

      return null;
    }

    renderStyles();

    /*
     * Reuse existing controller.
     */
    if (
      state.initialized &&
      state.controller
    ) {
      var ctl =
        state.controller;

      var y =
        typeof requestedYear ===
        'number'
          ? requestedYear
          : ctl.year;

      if (
        y >= YEAR_MIN &&
        y <= YEAR_MAX
      ) {
        ctl.setYear(y);
      }

      var location =
        readLocation();

      ctl.attach(
        container
      );

      if (!location) {
        ctl.setLocation(
          null
        );

        renderError(
          container,
          'स्थान उपलब्ध नहीं है। कृपया ऊपर स्थान खोजें या वर्तमान स्थान का उपयोग करें।'
        );

        return ctl;
      }

      ctl.setLocation(
        location
      );

      if (!ctl.api) {
        try {
          ctl.setApi(
            await waitForSharedApi()
          );
        } catch (e) {
          logErr(e);

          renderError(
            container,
            'पंचांग लाइब्रेरी लोड नहीं हो सकी।'
          );

          return ctl;
        }
      }

      ctl.run();

      return ctl;
    }


    /* ==========================================================
       FIRST INIT
       ========================================================== */

    var controller =
      createController();

    state.controller =
      controller;

    state.initialized =
      true;

    var year =
      typeof requestedYear ===
      'number'
        ? requestedYear
        : new Date().getFullYear();

    if (
      year < YEAR_MIN ||
      year > YEAR_MAX
    ) {
      year = YEAR_MIN;
    }

    controller.setYear(
      year
    );

    controller.attach(
      container
    );

    renderLoading(
      container,
      'स्थान लोड हो रहा है...'
    );

    var location =
      readLocation();

    if (!location) {
      renderError(
        container,
        'स्थान उपलब्ध नहीं है। कृपया ऊपर स्थान खोजें या वर्तमान स्थान का उपयोग करें।'
      );

      return controller;
    }

    controller.setLocation(
      location
    );

    var api;

    try {
      api =
        await waitForSharedApi();
    } catch (e) {
      logErr(e);

      renderError(
        container,
        'पंचांग लाइब्रेरी लोड नहीं हो सकी।'
      );

      return controller;
    }

    controller.setApi(
      api
    );

    await controller.run();

    return controller;
  }


  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.initEclipsePanchang =
    initEclipsePanchang;

})();
