/**
 * eclipse-panchang.js — Grahana-based eclipse discovery for OurHinduDharm
 *
 * Public entry point: window.initEclipsePanchang(year?)
 * Debug flag:         window.__OHDEclipseDebug = true
 *
 * Design invariants:
 *   - getPanchangam() ............ 0 calls
 *   - getSunrise() ............... 0 calls
 *   - custom 6h/12h tithi scan ... none
 *   - custom binary search ....... none
 *   - static eclipse tables ...... none
 *   - hard-coded cities/dates .... none
 *
 * Pipeline:
 *   localStorage["ohdPanchangLocation"]
 *     → module.findTithiTransitions(istYearStart, istYearEnd)
 *       → filter index === 14 (Purnima) / 29 (Amavasya)
 *         → candidate = local-noon IST of transition.endTime's civil date
 *           → getGrahana(tithiIndex, candidate, observer, 330)
 *             → dedupe by (type + peak) → render
 *
 * timezoneOffset is fixed to 330 (existing project convention).
 * No browser-TZ fallback is applied anywhere.
 */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- constants */
  var CONTAINER_ID = 'ohd-eclipse-panchang';
  var STORAGE_KEY  = 'ohdPanchangLocation';
  var TZ_OFFSET    = 330;         // IST minutes east of UTC — project convention
  var YEAR_MIN     = 2026;
  var YEAR_MAX     = 2031;
  var LOCATION_HINT = 'स्थान बदलने के लिए मुख्य पंचांग में स्थान चुनें।';

  /* ---------------------------------------------------------------- state */
  var state = {
    initialized: false,
    controller: null
  };

  /* ---------------------------------------------------------------- debug */
  function isDebug() { return window.__OHDEclipseDebug === true; }
  function log() {
    if (!isDebug()) return;
    console.log.apply(console, ['[EclipsePanchang]'].concat([].slice.call(arguments)));
  }
  function logErr() {
    if (!isDebug()) return;
    console.error.apply(console, ['[EclipsePanchang]'].concat([].slice.call(arguments)));
  }

  /* ---------------------------------------------------------------- helpers */
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function yieldToMain() {
    return new Promise(function (resolve) {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(function () { resolve(); }, { timeout: 50 });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  function toDate(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    var d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  /* ---------------------------------------------------------------- location */
  function readLocation() {
    var raw;
    try { raw = localStorage.getItem(STORAGE_KEY); }
    catch (e) { logErr('localStorage read failed:', e); return null; }
    if (!raw) return null;

    var o;
    try { o = JSON.parse(raw); }
    catch (e) { logErr('ohdPanchangLocation is not valid JSON:', e); return null; }

    if (!o || typeof o !== 'object') return null;
    if (typeof o.lat !== 'number' || typeof o.lon !== 'number') return null;
    if (!isFinite(o.lat) || !isFinite(o.lon)) return null;
    if (Math.abs(o.lat) > 90 || Math.abs(o.lon) > 180) return null;

    var elev = (typeof o.elevation === 'number' && isFinite(o.elevation)) ? o.elevation : 0;

    return {
      name: o.name || o.city || o.state || 'चयनित स्थान',
      lat: o.lat,
      lon: o.lon,
      elevation: elev,
      state: o.state || '',
      city: o.city || ''
    };
  }

  /* ---------------------------------------------------------------- shared API */
  function getSharedApi() { return window.__ohdPanchangam || null; }

  function waitForSharedApi() {
    return new Promise(function (resolve, reject) {
      var api = getSharedApi();
      if (api) return resolve(api);

      var timer = setTimeout(function () {
        window.removeEventListener('ohd:panchangam-ready', onReady);
        reject(new Error('पंचांग लाइब्रेरी लोड नहीं हो सकी।'));
      }, 30000);

      function onReady() {
        window.removeEventListener('ohd:panchangam-ready', onReady);
        clearTimeout(timer);
        var a = getSharedApi();
        if (a) resolve(a);
        else reject(new Error('पंचांग लाइब्रेरी तैयार नहीं हुई।'));
      }

      window.addEventListener('ohd:panchangam-ready', onReady, { once: true });
    });
  }

  /* ---------------------------------------------------------------- shell */
  function buildYearOptions(selected) {
    var out = '';
    for (var y = YEAR_MIN; y <= YEAR_MAX; y++) {
      out += '<option value="' + y + '"' + (y === selected ? ' selected' : '') + '>' + y + '</option>';
    }
    return out;
  }

  function renderShell(container, year, location) {
    var locName = location ? (location.name || 'चयनित स्थान') : '—';
    container.innerHTML = [
      '<div class="ohd-eclipse-wrap">',
      '  <div class="ohd-eclipse-controls">',
      '    <label class="ohd-eclipse-field">',
      '      <span>वर्ष:</span>',
      '      <select id="ohd-eclipse-year">', buildYearOptions(year), '</select>',
      '    </label>',
      '    <div class="ohd-eclipse-loc">',
      '      <span class="ohd-eclipse-loc-name" id="ohd-eclipse-loc-name">', esc(locName), '</span>',
      '    </div>',
      '  </div>',
      '  <div class="ohd-eclipse-hint">', esc(LOCATION_HINT), '</div>',
      '  <div class="ohd-eclipse-results" id="ohd-eclipse-results"></div>',
      '</div>'
    ].join('');
  }

  function setLocationLabel(container, location) {
    var el = container.querySelector('#ohd-eclipse-loc-name');
    if (!el) return;
    el.textContent = location ? (location.name || 'चयनित स्थान') : '—';
  }

  function setResults(container, html) {
    var box = container.querySelector('#ohd-eclipse-results');
    if (box) box.innerHTML = html;
  }

  function renderLoading(container, msg) {
    setResults(container, '<p class="ohd-eclipse-loading">' + esc(msg) + '</p>');
  }

  function renderError(container, msg) {
    setResults(container, '<p class="ohd-eclipse-error">' + esc(msg) + '</p>');
  }

  function fmtTime(date, tzOffsetMin) {
    var d = toDate(date);
    if (!d) return '—';
    var wall = new Date(d.getTime() + tzOffsetMin * 60000);
    var h = wall.getUTCHours();
    var m = wall.getUTCMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return pad2(h12) + ':' + pad2(m) + ' ' + ampm;
  }

  function fmtDate(date, tzOffsetMin) {
    var d = toDate(date);
    if (!d) return '—';
    var wall = new Date(d.getTime() + tzOffsetMin * 60000);
    return pad2(wall.getUTCDate()) + '/' +
           pad2(wall.getUTCMonth() + 1) + '/' +
           wall.getUTCFullYear();
  }

  function renderEclipses(container, eclipses, tzOffsetMin) {
    if (!eclipses || eclipses.length === 0) {
      setResults(container,
        '<p class="ohd-eclipse-none">इस वर्ष चयनित स्थान पर कोई ग्रहण नहीं है।</p>');
      return;
    }

    var html = '';
    eclipses.forEach(function (item) {
      var g = item.grahan;
      if (!g) return;

      var peak = g.contact && g.contact.peak;
      var dateStr = fmtDate(peak || item.date, tzOffsetMin);

      html += '<div class="ohd-eclipse-card">';
      html += '<h3>' + esc(dateStr) + ' — ' + esc(g.type || 'ग्रहण') +
              (g.subtype ? ' (' + esc(g.subtype) + ')' : '') + '</h3>';

      html += '<p><strong>दृश्यता:</strong> ' + (g.isVisible ? 'दृश्य' : 'अदृश्य') + '</p>';

      if (typeof g.obscuration === 'number' && isFinite(g.obscuration)) {
        html += '<p><strong>आच्छादन:</strong> ' + (g.obscuration * 100).toFixed(1) + '%</p>';
      }

      if (g.contact) {
        html += '<p><strong>प्रथम स्पर्श:</strong> ' +
                esc(fmtTime(g.contact.firstContact, tzOffsetMin)) + '</p>';
        if (g.contact.totalityBegin && g.contact.totalityEnd) {
          html += '<p><strong>पूर्णता:</strong> ' +
                  esc(fmtTime(g.contact.totalityBegin, tzOffsetMin)) + ' — ' +
                  esc(fmtTime(g.contact.totalityEnd, tzOffsetMin)) + '</p>';
        }
        html += '<p><strong>मध्य:</strong> ' +
                esc(fmtTime(g.contact.peak, tzOffsetMin)) + '</p>';
        html += '<p><strong>अंतिम स्पर्श:</strong> ' +
                esc(fmtTime(g.contact.lastContact, tzOffsetMin)) + '</p>';
      }

      if (g.sutakKaal && g.sutakKaal.start && g.sutakKaal.end) {
        html += '<p><strong>सूतक काल:</strong> ' +
                esc(fmtTime(g.sutakKaal.start, tzOffsetMin)) + ' — ' +
                esc(fmtTime(g.sutakKaal.end, tzOffsetMin)) + '</p>';
      }

      if (g.punyaKala && g.punyaKala.start && g.punyaKala.end) {
        html += '<p><strong>पुण्य काल:</strong> ' +
                esc(fmtTime(g.punyaKala.start, tzOffsetMin)) + ' — ' +
                esc(fmtTime(g.punyaKala.end, tzOffsetMin)) + '</p>';
      }

      if (g.description) {
        html += '<p class="ohd-eclipse-desc">' + esc(g.description) + '</p>';
      }

      html += '</div>';
    });

    setResults(container, html);
  }

  /* ---------------------------------------------------------------- discovery */
  function transitionToCandidate(endTime, tithiIndex) {
    var end = toDate(endTime);
    if (!end) return null;

    // Move to IST wall-clock and read the civil date.
    var istMs = end.getTime() + TZ_OFFSET * 60000;
    var ist = new Date(istMs);
    var y = ist.getUTCFullYear();
    var m = ist.getUTCMonth();
    var d = ist.getUTCDate();

    // Local noon IST of that civil date, expressed as a UTC instant.
    var noonUtc = new Date(Date.UTC(y, m, d, 12, 0, 0) - TZ_OFFSET * 60000);

    return {
      date: noonUtc,
      tithiIndex: tithiIndex,
      yearIst: y
    };
  }

  async function discoverEclipses(year, location, api) {
    var module = api && api.module;
    if (!module) throw new Error('Panchangam module उपलब्ध नहीं है।');

    var findTithiTransitions = module.findTithiTransitions;
    var getGrahana = module.getGrahana || api.getGrahana;
    var Observer = api.Observer || module.Observer;

    if (typeof findTithiTransitions !== 'function')
      throw new Error('findTithiTransitions उपलब्ध नहीं है।');
    if (typeof getGrahana !== 'function')
      throw new Error('getGrahana उपलब्ध नहीं है।');
    if (typeof Observer !== 'function')
      throw new Error('Observer उपलब्ध नहीं है।');

    // IST year boundaries with a 1-day safety margin so that transitions
    // whose civil date falls on Jan 1 / Dec 31 are not lost at the edges.
    // Candidates are later filtered to the exact requested IST year.
    var start = new Date(Date.UTC(year, 0, 1) - TZ_OFFSET * 60000 - 86400000);
    var end   = new Date(Date.UTC(year + 1, 0, 1) - TZ_OFFSET * 60000 + 86400000);

    log('findTithiTransitions window:',
        start.toISOString(), '→', end.toISOString());

    var raw = findTithiTransitions(start, end);
    var list = Array.isArray(raw) ? raw : [];
    log('Transitions returned:', list.length);

    var purnimaList = [];
    var amavasyaList = [];
    list.forEach(function (t) {
      if (!t) return;
      if (t.index === 14) purnimaList.push(t);
      else if (t.index === 29) amavasyaList.push(t);
    });
    log('Purnima (index 14):', purnimaList.length);
    log('Amavasya (index 29):', amavasyaList.length);

    // Build candidate dates using the transition's endTime.
    var candidates = [];
    function pushCandidates(arr, tithiIndex) {
      arr.forEach(function (t) {
        var c = transitionToCandidate(t.endTime, tithiIndex);
        if (!c) return;
        if (c.yearIst !== year) return;
        candidates.push(c);
      });
    }
    pushCandidates(purnimaList, 14);
    pushCandidates(amavasyaList, 29);
    log('Candidate dates:', candidates.length);

    // getGrahana — the only source of eclipse truth.
    var observer = new Observer(location.lat, location.lon, location.elevation || 0);
    var results = [];
    var calls = 0;

    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var grahana = null;
      try {
        grahana = getGrahana(c.tithiIndex, c.date, observer, TZ_OFFSET);
      } catch (e) {
        logErr('getGrahana threw:', e);
        grahana = null;
      }
      calls++;
      if (grahana) results.push({ date: c.date, grahan: grahana });
      if (i % 5 === 0) await yieldToMain();
    }
    log('getGrahana calls:', calls);
    log('Raw eclipse results:', results.length);

    // Deduplicate by (type + peak timestamp).
    var seen = Object.create(null);
    var unique = [];
    results.forEach(function (r) {
      var g = r.grahan;
      var peak = g && g.contact && g.contact.peak;
      var pd = toDate(peak);
      var peakMs = pd ? pd.getTime() : r.date.getTime();
      var key = String(g.type || '') + '|' + peakMs;
      if (seen[key]) return;
      seen[key] = true;
      unique.push(r);
    });
    log('Unique eclipses:', unique.length);

    // Sort chronologically by peak.
    unique.sort(function (a, b) {
      var pa = a.grahan.contact && toDate(a.grahan.contact.peak);
      var pb = b.grahan.contact && toDate(b.grahan.contact.peak);
      var ta = pa ? pa.getTime() : a.date.getTime();
      var tb = pb ? pb.getTime() : b.date.getTime();
      return ta - tb;
    });

    return unique;
  }

  /* ---------------------------------------------------------------- controller */
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
      if (!ctl.container || !ctl.location || !ctl.api) return;
      var myId = ++ctl.runId;

      renderLoading(ctl.container, 'ग्रहण की गणना जारी है...');
      var t0 = (typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now();

      try {
        var eclipses = await discoverEclipses(ctl.year, ctl.location, ctl.api);
        if (myId !== ctl.runId) return;   // superseded
        var t1 = (typeof performance !== 'undefined' && performance.now)
          ? performance.now() : Date.now();
        log('Total discovery time (ms):', Math.round(t1 - t0));
        renderEclipses(ctl.container, eclipses, TZ_OFFSET);
      } catch (e) {
        if (myId !== ctl.runId) return;
        logErr('Discovery failed:', e);
        renderError(ctl.container,
          'ग्रहण जानकारी लोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
      }
    }

    function wireControls() {
      if (ctl.wired) return;
      var sel = ctl.container.querySelector('#ohd-eclipse-year');
      if (sel) {
        sel.addEventListener('change', function (e) {
          var y = parseInt(e.target.value, 10);
          if (!isFinite(y) || y < YEAR_MIN || y > YEAR_MAX) return;
          ctl.year = y;
          log('Year changed:', y);
          run();
        });
      }
      ctl.wired = true;
    }

    function attach(container) {
      ctl.container = container;
      renderShell(container, ctl.year, ctl.location);
      ctl.wired = false;    // new DOM → re-wire
      wireControls();
    }

    function setYear(y) { ctl.year = y; }
    function setLocation(loc) {
      ctl.location = loc;
      if (ctl.container) setLocationLabel(ctl.container, loc);
    }
    function setApi(a) { ctl.api = a; }

    return {
      attach: attach,
      setYear: setYear,
      setLocation: setLocation,
      setApi: setApi,
      run: run,
      get year() { return ctl.year; }
    };
  }

  /* ---------------------------------------------------------------- public entry */
  async function initEclipsePanchang(requestedYear) {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) {
      log('Container #' + CONTAINER_ID + ' not found; aborting.');
      return null;
    }

    // Duplicate-init guard: reuse the controller, refresh location, re-render, re-run.
    if (state.initialized && state.controller) {
      var ctl0 = state.controller;
      var y0 = (typeof requestedYear === 'number') ? requestedYear : ctl0.year;
      if (y0 >= YEAR_MIN && y0 <= YEAR_MAX) ctl0.setYear(y0);

      var locNow = readLocation();
      ctl0.attach(container);          // re-renders shell + rewires dropdown
      if (!locNow) {
        ctl0.setLocation(null);
        renderError(container,
          'स्थान उपलब्ध नहीं है। कृपया मुख्य पंचांग में स्थान चुनें, फिर यहाँ वर्ष चुनें।');
        return ctl0;
      }
      ctl0.setLocation(locNow);

      if (!ctl0.api) {
        try { ctl0.setApi(await waitForSharedApi()); }
        catch (e) { logErr(e); renderError(container, 'पंचांग लाइब्रेरी लोड नहीं हो सकी।'); return ctl0; }
      }
      ctl0.run();
      return ctl0;
    }

    /* ---- first-time init ---- */
    var ctl = createController();
    state.controller = ctl;
    state.initialized = true;

    var year = (typeof requestedYear === 'number') ? requestedYear : new Date().getFullYear();
    if (year < YEAR_MIN || year > YEAR_MAX) year = YEAR_MIN;
    ctl.setYear(year);

    // Render shell immediately with placeholder state.
    ctl.attach(container);
    renderLoading(container, 'स्थान लोड हो रहा है...');

    // 1. Location from localStorage only.
    var location = readLocation();
    if (!location) {
      renderError(container,
        'स्थान उपलब्ध नहीं है। कृपया मुख्य पंचांग में स्थान चुनें, फिर यहाँ वर्ष चुनें।');
      return ctl;
    }
    ctl.setLocation(location);

    // 2. Shared API.
    var api;
    try { api = await waitForSharedApi(); }
    catch (e) {
      logErr(e);
      renderError(container, 'पंचांग लाइब्रेरी लोड नहीं हो सकी।');
      return ctl;
    }
    ctl.setApi(api);

    // 3. Run discovery.
    await ctl.run();
    return ctl;
  }

  // No auto-init — Blogger explicitly calls window.initEclipsePanchang().
  window.initEclipsePanchang = initEclipsePanchang;
})();
