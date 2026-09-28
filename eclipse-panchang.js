/**
 * eclipse-panchang.js
 * OurHinduDharm — Grahan Panchang
 *
 * Public API:
 *   window.initEclipsePanchang(year?)
 *
 * Architecture:
 *   Blogger / GitHub HTML
 *        ↓
 *   Mini Panchang creates window.__ohdPanchangam
 *        ↓
 *   This module consumes the same shared API
 *
 * Important:
 * - No static eclipse dates
 * - No hard-coded city results
 * - No 6/12-hour astronomical scanning
 * - No custom binary-search eclipse calculation
 * - No external astronomy API
 * - Eclipse truth comes from getGrahana()
 * - Discovery uses findTithiTransitions()
 * - getPanchangam() only runs for actual eclipse dates
 * - No auto-init
 */
(function () {
  'use strict';

  /* ============================================================
     CONSTANTS
     ============================================================ */

  var CONTAINER_ID = 'ohd-eclipse-panchang';
  var APP_CONTAINER_ID = 'ohd-eclipse-app';

  /*
   * IMPORTANT:
   * This is the same location key used by OurHinduDharm.
   */
  var STORAGE_KEY = 'ohdPanchangLocation';

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
      ['[EclipsePanchang]'].concat(
        Array.prototype.slice.call(arguments)
      )
    );
  }

  function logErr() {
    if (!isDebug()) return;
    console.error.apply(
      console,
      ['[EclipsePanchang]'].concat(
        Array.prototype.slice.call(arguments)
      )
    );
  }

  /* ============================================================
     BASIC HELPERS
     ============================================================ */

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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

  function normalizeLocation(location) {
    if (!location || typeof location !== 'object') {
      return null;
    }

    var lat = Number(location.lat);
    var lon = Number(location.lon);

    if (
      !isFinite(lat) ||
      !isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    ) {
      return null;
    }

    var elevation = Number(location.elevation);
    if (!isFinite(elevation)) {
      elevation = 0;
    }

    return {
      name: String(
        location.name ||
        location.city ||
        location.state ||
        'चयनित स्थान'
      ),
      lat: lat,
      lon: lon,
      elevation: elevation,
      state: String(location.state || ''),
      city: String(location.city || '')
    };
  }

  function readLocation() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      var parsed = JSON.parse(raw);
      return normalizeLocation(parsed);
    } catch (e) {
      logErr('Location read failed:', e);
      return null;
    }
  }

  function saveLocation(location) {
    var normalized = normalizeLocation(location);
    if (!normalized) {
      logErr('Invalid location; not saved:', location);
      return false;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalized)
      );
      return true;
    } catch (e) {
      logErr('Location save failed:', e);
      return false;
    }
  }

  function locationDisplayName(location) {
    if (!location) {
      return 'अपने शहर का नाम डालें';
    }

    var city = String(location.city || '').trim();
    var stateName = String(location.state || '').trim();
    var name = String(location.name || '').trim();

    /*
     * शहर उपलब्ध है तो हमेशा शहर को प्राथमिकता दें।
     * ग्रहण गणना city/state representative point पर नहीं,
     * बल्कि saved lat/lon/elevation पर होती है।
     */
    if (city && stateName) {
      return city + ', ' + stateName + ', भारत';
    }

    if (city) {
      return city +
        (name.indexOf('भारत') >= 0 ? '' : ', भारत');
    }

    /*
     * GPS location में city उपलब्ध न हो तो
     * "वर्तमान स्थान" जैसे नाम को रहने दें।
     *
     * लेकिन state-only search result को सामान्य
     * selected city के रूप में प्रस्तुत नहीं करना है।
     */
    if (stateName && name && name !== stateName) {
      return name;
    }

    if (name) {
      return name;
    }

    return 'कृपया शहर का नाम डालें';
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
        var shared = getSharedApi();
        if (shared) {
          resolve(shared);
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
     TIME / DATE
     ============================================================ */

  function fmtTime(date, tzOffsetMin) {
    var d = toDate(date);
    if (!d) return '—';
    var wall = new Date(
      d.getTime() + tzOffsetMin * 60000
    );
    var h = wall.getUTCHours();
    var m = wall.getUTCMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12;
    if (h12 === 0) {
      h12 = 12;
    }
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
     Verified against live @ishubhamx/panchangam-js runtime.
     ============================================================ */

  function extractPanchangFields(p) {
    if (!p) {
      return {};
    }

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
          TITHI_MAP[tObj.name] || tObj.name;
      }
    } else if (typeof p.tithi === 'string') {
      tithiHindi =
        TITHI_MAP[p.tithi] || p.tithi;
    }

    var pakshaHindi = '—';
    if (typeof p.paksha === 'string') {
      pakshaHindi =
        PAKSHA_MAP[p.paksha] || p.paksha;
    }

    var masaHindi = '—';
    if (
      p.masa &&
      typeof p.masa.name === 'string'
    ) {
      masaHindi =
        MASA_MAP[p.masa.name] || p.masa.name;
      if (p.masa.isAdhika) {
        masaHindi = 'अधिक ' + masaHindi;
      }
    } else if (typeof p.masa === 'string') {
      masaHindi = MASA_MAP[p.masa] || p.masa;
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
          NAKSHATRA_MAP[nObj.name] || nObj.name;
      }
    } else if (typeof p.nakshatra === 'string') {
      nakshatraHindi =
        NAKSHATRA_MAP[p.nakshatra] || p.nakshatra;
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
     DAY PANCHANG
     Only actual eclipse dates.
     ============================================================ */

  function getDayPanchang(
    eclipseDate,
    observer,
    api
  ) {
    var getPanchangam = resolveFunction(
      api,
      'getPanchangam'
    );

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
      sunrise:
        p && p.sunrise
          ? toDate(p.sunrise)
          : null,
      sunset:
        p && p.sunset
          ? toDate(p.sunset)
          : null
    };
  }

  /* ============================================================
     UI STYLES
     ============================================================ */

  function renderStyles() {
    if (
      document.getElementById(
        'ohd-eclipse-panchang-styles'
      )
    ) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'ohd-eclipse-panchang-styles';
    style.textContent = `
      .ohd-eclipse-wrap { width: 100%; }

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
      .ohd-eclipse-loc-name { font-weight: 700; }

      .ohd-eclipse-location-heading {
        font-size: .88em;
        opacity: .75;
        margin-bottom: 3px;
      }
      .ohd-eclipse-location-title {
        margin: 0;
        font-size: 1.15em;
      }
      .ohd-eclipse-location-subtitle {
        margin-top: 3px;
        font-size: .82em;
        opacity: .68;
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
      .ohd-eclipse-location-search button,
      .ohd-eclipse-gps button {
        padding: 9px 12px;
        border-radius: 7px;
        cursor: pointer;
      }
      .ohd-eclipse-gps { margin-top: 8px; }
      .ohd-eclipse-location-results { margin-top: 8px; }
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
      .ohd-eclipse-card h3 { margin-top: 0; }
      .ohd-eclipse-card p { margin: 7px 0; }

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
      .ohd-panchang-row span { opacity: .78; }
      .ohd-panchang-row strong { text-align: right; }

      .ohd-purashcharan-card {
        margin-top: 24px;
        padding: 18px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,.13);
      }
      .ohd-purashcharan-card h2 { margin-top: 0; }
      .ohd-purashcharan-card p { line-height: 1.7; }

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

  /* ============================================================
     UI SHELL
     ============================================================ */

  function buildYearOptions(selected) {
    var html = '';
    for (
      var y = YEAR_MIN;
      y <= YEAR_MAX;
      y++
    ) {
      html +=
        '<option value="' +
        y +
        '"' +
        (y === selected ? ' selected' : '') +
        '>' +
        y +
        '</option>';
    }
    return html;
  }

  function renderShell(
    container,
    year,
    location
  ) {
    var app = container.querySelector(
      '#' + APP_CONTAINER_ID
    );

    if (!app) {
      app = document.createElement('div');
      app.id = APP_CONTAINER_ID;
      app.className = 'ohd-eclipse-app';

      /*
       * Never replace the outer static HTML.
       */
      container.appendChild(app);
    }

    app.innerHTML = [
      '<div class="ohd-eclipse-wrap">',

      '<div class="ohd-eclipse-controls">',

      '<label class="ohd-eclipse-field">',
      '<span>वर्ष:</span>',
      '<select id="ohd-eclipse-year">',
      buildYearOptions(year),
      '</select>',
      '</label>',

      '<div class="ohd-eclipse-loc">',

      '<div class="ohd-eclipse-location-heading">',
      '📍 चयनित शहर / स्थान',
      '</div>',

      '<h2 class="ohd-eclipse-location-title" id="ohd-eclipse-loc-name">',
      esc(
        locationDisplayName(location)
      ),
      '</h2>',

      '<div class="ohd-eclipse-location-subtitle">',
      'इसी स्थान के अक्षांश-देशांतर के आधार पर ग्रहण की गणना',
      '</div>',

      '</div>',

      '</div>',

      '<div class="ohd-eclipse-location-tools">',

      '<div class="ohd-eclipse-location-search">',
      '<input',
      ' id="ohd-eclipse-location-input"',
      ' type="search"',
      ' placeholder="शहर / स्थान खोजें..."',
      ' autocomplete="off">',
      '<button',
      ' type="button"',
      ' id="ohd-eclipse-location-search-btn">',
      'स्थान खोजें',
      '</button>',
      '</div>',

      '<div class="ohd-eclipse-gps">',
      '<button',
      ' type="button"',
      ' id="ohd-eclipse-gps-btn">',
      '📍 वर्तमान स्थान का उपयोग करें',
      '</button>',
      '</div>',

      '<div',
      ' id="ohd-eclipse-location-results"',
      ' class="ohd-eclipse-location-results">',
      '</div>',

      '</div>',

      '<div class="ohd-eclipse-hint">',
      esc(LOCATION_HINT),
      '</div>',

      '<div',
      ' class="ohd-eclipse-results"',
      ' id="ohd-eclipse-results">',
      '</div>',

      '</div>'
    ].join('');
  }

  function getApp(container) {
    if (!container) {
      return null;
    }
    return container.querySelector(
      '#' + APP_CONTAINER_ID
    );
  }

  function setResults(container, html) {
    var app = getApp(container);
    if (!app) return;
    var box = app.querySelector(
      '#ohd-eclipse-results'
    );
    if (box) {
      box.innerHTML = html;
    }
  }

  function renderLoading(container, message) {
    setResults(
      container,
      '<p class="ohd-eclipse-loading">' +
        esc(message) +
        '</p>'
    );
  }

  function renderError(container, message) {
    setResults(
      container,
      '<p class="ohd-eclipse-error">' +
        esc(message) +
        '</p>'
    );
  }

  function setLocationLabel(container, location) {
    var app = getApp(container);
    if (!app) return;
    var el = app.querySelector(
      '#ohd-eclipse-loc-name'
    );
    if (!el) return;
    el.textContent = locationDisplayName(
      location
    );
  }

  /* ============================================================
     LOCATION SEARCH
     ============================================================ */

  async function searchLocation(query) {
    var url =
      'https://nominatim.openstreetmap.org/search' +
      '?format=json' +
      '&addressdetails=1' +
      '&q=' +
      encodeURIComponent(query) +
      '&limit=10' +
      '&countrycodes=in';

    var response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(
        'स्थान खोजने में समस्या हुई।'
      );
    }

    var results = await response.json();

    if (!Array.isArray(results)) {
      return [];
    }

    /*
     * City / town / village / municipality को
     * state / county से स्पष्ट रूप से ऊपर रखें।
     *
     * इससे "Uttarakhand, India" जैसे state-level
     * परिणाम किसी शहर के ऊपर नहीं आएंगे।
     */
    results.sort(function (a, b) {
      return (
        locationSearchScore(b) -
        locationSearchScore(a)
      );
    });

    return results;
  }

  function locationSearchScore(item) {
    var address =
      item && item.address
        ? item.address
        : {};

    var score = 0;

    /*
     * वास्तविक शहर/कस्बा/गाँव
     */
    if (address.city) score += 100;
    else if (address.town) score += 95;
    else if (address.village) score += 90;
    else if (address.municipality) score += 85;

    /*
     * छोटे स्थानीय क्षेत्र — उपयोगी हैं,
     * लेकिन शहर से नीचे।
     */
    else if (address.city_district) score += 60;
    else if (address.suburb) score += 55;

    /*
     * county/district को city नहीं मानना है।
     */
    else if (address.county) score += 20;

    /*
     * केवल state/region वाले परिणाम सबसे नीचे।
     */
    else if (address.state) score += 0;
    else score -= 10;

    /*
     * Search result के type से अतिरिक्त संकेत।
     */
    var type = String(
      item && item.type
        ? item.type
        : ''
    ).toLowerCase();

    if (
      type === 'city' ||
      type === 'town' ||
      type === 'village' ||
      type === 'municipality'
    ) {
      score += 20;
    }

    if (
      type === 'state' ||
      type === 'region'
    ) {
      score -= 50;
    }

    return score;
  }

  function resultToLocation(item) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    var address = item.address || {};

    /*
     * केवल वास्तविक city/town/village/
     * municipality को city मानें।
     *
     * county को city नहीं बनाएँगे।
     */
    var city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      '';

    var stateName = address.state || '';

    var lat = parseFloat(item.lat);
    var lon = parseFloat(item.lon);

    if (
      !isFinite(lat) ||
      !isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    ) {
      return null;
    }

    /*
     * State-only result को reject करें।
     *
     * उदाहरण:
     * "Uttarakhand, India"
     *
     * इसे Panchang calculation location नहीं बनाएँगे।
     */
    if (!city) {
      return null;
    }

    var name = [
      city,
      stateName,
      'भारत'
    ]
      .filter(Boolean)
      .join(', ');

    return normalizeLocation({
      name:
        name ||
        item.display_name ||
        'चयनित स्थान',

      lat: lat,
      lon: lon,

      /*
       * Nominatim सामान्यतः elevation नहीं देता।
       * इसलिए 0 केवल default है; location के
       * lat/lon को किसी state representative
       * coordinate से replace नहीं किया जा रहा।
       */
      elevation: 0,

      state: stateName,
      city: city
    });
  }

  /* ============================================================
     ECLIPSE DISCOVERY
     ============================================================ */

  function transitionToCandidate(
    endTime,
    tithiIndex
  ) {
    var end = toDate(endTime);
    if (!end) {
      return null;
    }

    /*
     * Convert transition instant to
     * IST civil date.
     */
    var ist = new Date(
      end.getTime() + TZ_OFFSET * 60000
    );
    var year = ist.getUTCFullYear();
    var month = ist.getUTCMonth();
    var day = ist.getUTCDate();

    /*
     * Local noon IST represented as UTC.
     */
    var noonUtc = new Date(
      Date.UTC(
        year,
        month,
        day,
        12,
        0,
        0
      ) -
        TZ_OFFSET * 60000
    );

    return {
      date: noonUtc,
      tithiIndex: tithiIndex,
      yearIst: year
    };
  }

  async function discoverEclipses(
    year,
    location,
    api
  ) {
    var module = api && api.module;
    if (!module) {
      throw new Error(
        'Panchangam module उपलब्ध नहीं है।'
      );
    }

    var findTithiTransitions =
      module.findTithiTransitions;
    var getGrahana =
      module.getGrahana || api.getGrahana;
    var Observer =
      api.Observer || module.Observer;

    if (
      typeof findTithiTransitions !==
      'function'
    ) {
      throw new Error(
        'findTithiTransitions उपलब्ध नहीं है।'
      );
    }
    if (typeof getGrahana !== 'function') {
      throw new Error(
        'getGrahana उपलब्ध नहीं है।'
      );
    }
    if (typeof Observer !== 'function') {
      throw new Error(
        'Observer उपलब्ध नहीं है।'
      );
    }

    /*
     * Safe IST year window.
     */
    var start = new Date(
      Date.UTC(year, 0, 1) -
        TZ_OFFSET * 60000 -
        86400000
    );
    var end = new Date(
      Date.UTC(year + 1, 0, 1) -
        TZ_OFFSET * 60000 +
        86400000
    );

    log(
      'Discovery:',
      year,
      locationDisplayName(location)
    );

    /*
     * Important:
     * This is the validated candidate discovery.
     */
    var raw = findTithiTransitions(start, end);
    var transitions = Array.isArray(raw)
      ? raw
      : [];

    var candidates = [];
    transitions.forEach(function (transition) {
      if (!transition) {
        return;
      }

      /*
       * 14 = Purnima
       * 29 = Amavasya
       */
      if (
        transition.index !== 14 &&
        transition.index !== 29
      ) {
        return;
      }

      var candidate = transitionToCandidate(
        transition.endTime,
        transition.index
      );

      if (!candidate) {
        return;
      }

      if (candidate.yearIst !== year) {
        return;
      }

      candidates.push(candidate);
    });

    /*
     * Observer is location-specific.
     */
    var observer = new Observer(
      location.lat,
      location.lon,
      location.elevation || 0
    );

    var results = [];

    /*
     * Only candidates are sent to
     * getGrahana().
     */
    for (var i = 0; i < candidates.length; i++) {
      var candidate = candidates[i];
      var grahana = null;

      try {
        grahana = getGrahana(
          candidate.tithiIndex,
          candidate.date,
          observer,
          TZ_OFFSET
        );
      } catch (e) {
        logErr('getGrahana failed:', e);
      }

      if (grahana) {
        results.push({
          date: candidate.date,
          grahan: grahana
        });
      }

      /*
       * Keep browser responsive.
       */
      if (i % 5 === 0) {
        await yieldToMain();
      }
    }

    /*
     * Remove duplicate type + peak.
     */
    var seen = Object.create(null);
    var unique = [];
    results.forEach(function (item) {
      var g = item.grahan;
      var peak =
        g &&
        g.contact &&
        toDate(g.contact.peak);
      var peakMs = peak
        ? peak.getTime()
        : item.date.getTime();
      var key =
        String(g.type || '') + '|' + peakMs;
      if (seen[key]) {
        return;
      }
      seen[key] = true;
      unique.push(item);
    });

    unique.sort(function (a, b) {
      var peakA =
        a.grahan &&
        a.grahan.contact &&
        toDate(a.grahan.contact.peak);
      var peakB =
        b.grahan &&
        b.grahan.contact &&
        toDate(b.grahan.contact.peak);
      var timeA = peakA
        ? peakA.getTime()
        : a.date.getTime();
      var timeB = peakB
        ? peakB.getTime()
        : b.date.getTime();
      return timeA - timeB;
    });

    return unique;
  }

  /* ============================================================
     PANCHANG HTML
     ============================================================ */

  function renderPanchangDetails(
    dayPanchang,
    eclipseDate
  ) {
    var fields = dayPanchang.fields || {};
    var sunrise = dayPanchang.sunrise
      ? fmtTime(dayPanchang.sunrise, TZ_OFFSET)
      : '—';
    var sunset = dayPanchang.sunset
      ? fmtTime(dayPanchang.sunset, TZ_OFFSET)
      : '—';

    var rows = [
      [
        'विक्रम संवत्',
        fields.vikramSamvat
          ? String(fields.vikramSamvat)
          : '—'
      ],
      [
        'मास',
        fields.masa || '—'
      ],
      [
        'पक्ष',
        fields.paksha || '—'
      ],
      [
        'तिथि',
        fields.tithi || '—'
      ],
      [
        'नक्षत्र',
        fields.nakshatra || '—'
      ],
      [
        'वार',
        fmtWeekday(
          eclipseDate,
          TZ_OFFSET
        )
      ],
      [
        'सूर्योदय',
        sunrise
      ],
      [
        'सूर्यास्त',
        sunset
      ]
    ];

    return [
      '<details class="ohd-eclipse-panchang-details">',
      '<summary>',
      '📅 इस ग्रहण-दिन का पंचांग देखें',
      '</summary>',
      '<div class="ohd-eclipse-panchang-inner">',
      rows
        .map(function (row) {
          return [
            '<div class="ohd-panchang-row">',
            '<span>',
            esc(row[0]),
            '</span>',
            '<strong>',
            esc(row[1]),
            '</strong>',
            '</div>'
          ].join('');
        })
        .join(''),
      '</div>',
      '</details>'
    ].join('');
  }

  /* ============================================================
     VISIBILITY
     ============================================================ */
function renderVisibility(g, location) {
  var placeName = 'चयनित स्थान';

  if (location) {
    var fullName = locationDisplayName(location);

    if (fullName && fullName !== 'अपने शहर का नाम डालें') {
      placeName = String(fullName)
        .split(',')
        .map(function (part) {
          return part.trim();
        })
        .filter(function (part) {
          return part;
        })[0] || placeName;
    }
  }

  if (g.isVisible === true) {
    return [
      '<p><strong>दृश्यता:</strong> ',
      '<span style="color:green;font-weight:700;">✓</span> ',
      esc(placeName),
      ' में दृश्य</p>'
    ].join('');
  }

  if (g.isVisible === false) {
    return [
      '<p><strong>दृश्यता:</strong> ',
      esc(placeName),
      ' में अदृश्य</p>',
      '<div class="ohd-eclipse-visibility-note">',
      'इस चयनित स्थान पर यह ग्रहण ',
      'खगोलीय रूप से स्थानीय रूप से दृश्य नहीं है। ',
      'अतः इस स्थान से ग्रहण का दर्शन संभव नहीं होगा।',
      '</div>'
    ].join('');
  }

  return [
    '<p><strong>दृश्यता:</strong> ',
    esc(placeName),
    ' में दृश्यता निर्धारित नहीं</p>'
  ].join('');
}


  /* ============================================================
     ECLIPSE CARD
     ============================================================ */

  function renderEclipseCard(
    item,
    observer,
    api,
  location
  ) {
    var g = item.grahan;
    if (!g) {
      return '';
    }

    var peak = g.contact && g.contact.peak;
    var dateStr = fmtDate(
      peak || item.date,
      TZ_OFFSET
    );

    var html = '';

    html += '<div class="ohd-eclipse-card">';

    html +=
      '<h3>' +
      esc(dateStr) +
      ' — ' +
      esc(g.type || 'ग्रहण') +
      (g.subtype
        ? ' (' + esc(g.subtype) + ')'
        : '') +
      '</h3>';

  html += renderVisibility(g, location);

    if (
      typeof g.obscuration === 'number' &&
      isFinite(g.obscuration)
    ) {
      html +=
        '<p><strong>आच्छादन:</strong> ' +
        (g.obscuration * 100).toFixed(1) +
        '%</p>';
    }

    if (g.contact) {
      if (g.contact.firstContact) {
        html +=
          '<p><strong>प्रथम स्पर्श:</strong> ' +
          esc(
            fmtTime(
              g.contact.firstContact,
              TZ_OFFSET
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
              TZ_OFFSET
            )
          ) +
          ' — ' +
          esc(
            fmtTime(
              g.contact.totalityEnd,
              TZ_OFFSET
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
              TZ_OFFSET
            )
          ) +
          '</p>';
      }
      if (g.contact.lastContact) {
        html +=
          '<p><strong>अंतिम स्पर्श:</strong> ' +
          esc(
            fmtTime(
              g.contact.lastContact,
              TZ_OFFSET
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
            TZ_OFFSET
          )
        ) +
        ' — ' +
        esc(
          fmtTime(
            g.sutakKaal.end,
            TZ_OFFSET
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
            TZ_OFFSET
          )
        ) +
        ' — ' +
        esc(
          fmtTime(
            g.punyaKala.end,
            TZ_OFFSET
          )
        ) +
        '</p>';
    }

    /*
     * Panchang is calculated ONLY here,
     * after a real eclipse is confirmed.
     */
    try {
      var dayPanchang = getDayPanchang(
        item.date,
        observer,
        api
      );
      html += renderPanchangDetails(
        dayPanchang,
        item.date
      );
    } catch (e) {
      logErr('Day Panchang failed:', e);
      html += [
        '<details class="ohd-eclipse-panchang-details">',
        '<summary>',
        '📅 इस ग्रहण-दिन का पंचांग देखें',
        '</summary>',
        '<div class="ohd-eclipse-panchang-inner">',
        '<p>',
        'इस दिन का पंचांग उपलब्ध नहीं हो सका।',
        '</p>',
        '</div>',
        '</details>'
      ].join('');
    }

    html += '</div>';

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
      '<a',
      ' class="ohd-purashcharan-link"',
      ' href="',
      PURASHCHARANA_URL,
      '" target="_blank"',
      ' rel="noopener">',
      '📖 ग्रहण में मन्त्र-पुरश्चरण की सम्पूर्ण विधि पढ़ें →',
      '</a>',
      '</section>'
    ].join('');
  }

  /* ============================================================
     RENDER RESULTS
     ============================================================ */

  function renderEclipses(
    container,
    eclipses,
    location,
    api
  ) {
    if (!eclipses || eclipses.length === 0) {
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
          esc(locationDisplayName(location)),
          ' के लिए कोई खगोलीय ग्रहण ',
          'इस गणना से प्राप्त नहीं हुआ।',
          '</p>'
        ].join('')
      );
      return;
    }

    var Observer =
      api.Observer ||
      (api.module && api.module.Observer);

    if (typeof Observer !== 'function') {
      throw new Error(
        'Observer उपलब्ध नहीं है।'
      );
    }

    var observer = new Observer(
      location.lat,
      location.lon,
      location.elevation || 0
    );

    var html = '';

    eclipses.forEach(function (item) {
      html += renderEclipseCard(
        item,
        observer,
        api,
  location
      );
    });

    html += renderPurashcharanaCard();

    setResults(container, html);
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

      /*
       * Every calculation gets a unique ID.
       * This prevents stale results from replacing
       * newer location/year results.
       */
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

      var myRunId = ++ctl.runId;

      renderLoading(
        ctl.container,
        'ग्रहण की गणना जारी है...'
      );

      try {
        var eclipses = await discoverEclipses(
          ctl.year,
          ctl.location,
          ctl.api
        );

        /*
         * A newer run started.
         * Ignore this old result.
         */
        if (myRunId !== ctl.runId) {
          return;
        }

        renderEclipses(
          ctl.container,
          eclipses,
          ctl.location,
          ctl.api
        );
      } catch (e) {
        if (myRunId !== ctl.runId) {
          return;
        }
        logErr('Discovery failed:', e);
        renderError(
          ctl.container,
          'ग्रहण जानकारी लोड करने में त्रुटि। कृपया पुनः प्रयास करें।'
        );
      }
    }

    function attach(container) {
      ctl.container = container;
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

      var yearSelect = ctl.container.querySelector(
        '#ohd-eclipse-year'
      );
      if (yearSelect) {
        yearSelect.addEventListener(
          'change',
          function (event) {
            var year = parseInt(
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

      var input = ctl.container.querySelector(
        '#ohd-eclipse-location-input'
      );
      var button = ctl.container.querySelector(
        '#ohd-eclipse-location-search-btn'
      );

      if (input && button) {
        button.addEventListener(
          'click',
          function () {
            performLocationSearch(input.value);
          }
        );
        input.addEventListener(
          'keydown',
          function (event) {
            if (event.key === 'Enter') {
              event.preventDefault();
              performLocationSearch(
                input.value
              );
            }
          }
        );
      }

      var gpsButton = ctl.container.querySelector(
        '#ohd-eclipse-gps-btn'
      );
      if (gpsButton) {
        gpsButton.addEventListener(
          'click',
          useCurrentLocation
        );
      }

      ctl.wired = true;
    }

    async function performLocationSearch(query) {
      query = String(query || '').trim();
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
        var results = await searchLocation(query);

        if (
          !Array.isArray(results) ||
          results.length === 0
        ) {
          resultsBox.innerHTML =
            '<p>कोई स्थान नहीं मिला।</p>';
          return;
        }

        resultsBox.innerHTML = results
          .map(function (item, index) {
            var address = item.address || {};

            var city =
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              '';

            var stateName = address.state || '';

            /*
             * State-only result को UI में selectable
             * city result की तरह नहीं दिखाएँ।
             */
            if (!city) {
              return '';
            }

            var displayName = [
              city,
              stateName,
              'भारत'
            ]
              .filter(Boolean)
              .join(', ');

            return [
              '<button',
              ' type="button"',
              ' class="ohd-eclipse-location-result"',
              ' data-location-index="',
              index,
              '">',

              '<strong>',
              esc(displayName),
              '</strong>',

              '<br>',

              '<small>',
              esc(item.type || 'स्थान'),
              '</small>',

              '</button>'
            ].join('');
          })
          .join('');

        if (!resultsBox.innerHTML.trim()) {
          resultsBox.innerHTML =
            '<p>शहर / कस्बा / गाँव का स्थान नहीं मिला। कृपया शहर का नाम अधिक स्पष्ट रूप से लिखें।</p>';

          return;
        }

        Array.prototype.forEach.call(
          resultsBox.querySelectorAll(
            '[data-location-index]'
          ),
          function (button) {
            button.addEventListener(
              'click',
              function () {
                var index = parseInt(
                  button.getAttribute(
                    'data-location-index'
                  ),
                  10
                );
                var selected = results[index];
                if (!selected) {
                  return;
                }

                var location =
                  resultToLocation(selected);

                if (!location) {
                  resultsBox.innerHTML =
                    '<p>यह परिणाम शहर / कस्बा स्तर का स्थान नहीं है। कृपया किसी शहर या कस्बे का परिणाम चुनें।</p>';

                  return;
                }

                /*
                 * THIS is the important path:
                 *
                 * search result
                 *    ↓
                 * resultToLocation
                 *    ↓
                 * saveLocation
                 *    ↓
                 * ctl.location
                 *    ↓
                 * new calculation
                 */
                saveAndRunLocation(location);
              }
            );
          }
        );
      } catch (e) {
        logErr('Location search failed:', e);
        resultsBox.innerHTML =
          '<p>स्थान खोजने में समस्या हुई।</p>';
      }
    }

    function useCurrentLocation() {
      if (!navigator.geolocation) {
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
          var coords = position.coords;

          var location = normalizeLocation({
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
          });

          if (!location) {
            renderError(
              ctl.container,
              'वर्तमान स्थान के coordinates मान्य नहीं हैं।'
            );
            return;
          }

          saveAndRunLocation(location);
        },
        function (error) {
          logErr('Geolocation failed:', error);
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

    function saveAndRunLocation(location) {
      var normalized =
        normalizeLocation(location);

      if (!normalized) {
        return;
      }

      /*
       * Save first.
       */
      saveLocation(normalized);

      /*
       * Update active controller immediately.
       */
      ctl.location = normalized;

      /*
       * Invalidate every previous calculation.
       */
      ++ctl.runId;

      /*
       * Update UI immediately.
       */
      setLocationLabel(
        ctl.container,
        normalized
      );

      var resultsBox = ctl.container.querySelector(
        '#ohd-eclipse-location-results'
      );
      if (resultsBox) {
        resultsBox.innerHTML = '';
      }

      /*
       * Start fresh calculation.
       */
      run();
    }

    function setYear(year) {
      ctl.year = year;
    }

    function setLocation(location) {
      ctl.location = normalizeLocation(location);
    }

    function setApi(api) {
      ctl.api = api;
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
    var container = document.getElementById(
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
     * Reuse controller if already initialized.
     */
    if (state.initialized && state.controller) {
      var existing = state.controller;

      var year =
        typeof requestedYear === 'number'
          ? requestedYear
          : existing.year;

      if (
        year >= YEAR_MIN &&
        year <= YEAR_MAX
      ) {
        existing.setYear(year);
      }

      /*
       * IMPORTANT:
       * Read location again.
       * This lets a previous Mini Panchang/location
       * selection be picked up.
       */
      var savedLocation = readLocation();

      existing.attach(container);

      if (!savedLocation) {
        existing.setLocation(null);
        renderError(
          container,
          'स्थान उपलब्ध नहीं है। कृपया ऊपर स्थान खोजें या वर्तमान स्थान का उपयोग करें।'
        );
        return existing;
      }

      existing.setLocation(savedLocation);

      if (!existing.api) {
        try {
          existing.setApi(
            await waitForSharedApi()
          );
        } catch (e) {
          logErr(e);
          renderError(
            container,
            'पंचांग लाइब्रेरी लोड नहीं हो सकी।'
          );
          return existing;
        }
      }

      existing.run();
      return existing;
    }

    /* ==========================================================
       FIRST INITIALIZATION
       ========================================================== */

    var controller = createController();
    state.controller = controller;
    state.initialized = true;

    var year =
      typeof requestedYear === 'number'
        ? requestedYear
        : new Date().getFullYear();

    if (year < YEAR_MIN || year > YEAR_MAX) {
      year = YEAR_MIN;
    }

    controller.setYear(year);

    /*
     * Attach first so the location search UI
     * is available immediately.
     */
    controller.attach(container);
    renderLoading(
      container,
      'स्थान लोड हो रहा है...'
    );

    /*
     * Read shared saved location.
     */
    var location = readLocation();

    if (!location) {
      renderError(
        container,
        'स्थान उपलब्ध नहीं है। कृपया ऊपर स्थान खोजें या वर्तमान स्थान का उपयोग करें।'
      );
      return controller;
    }

    controller.setLocation(location);

    /*
     * Wait for Mini Panchang shared API.
     */
    try {
      var api = await waitForSharedApi();
      controller.setApi(api);
    } catch (e) {
      logErr(e);
      renderError(
        container,
        'पंचांग लाइब्रेरी लोड नहीं हो सकी।'
      );
      return controller;
    }

    /*
     * First calculation.
     */
    await controller.run();

    return controller;
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.initEclipsePanchang = initEclipsePanchang;
})();
