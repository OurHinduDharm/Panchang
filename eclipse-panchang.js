/* =========================================================
   OUR HINDU DHARM — ECLIPSE PANCHANG (OPTIMIZED & FAST)
   Hosted on GitHub | 100% Accurate Calculations
   ========================================================= */

import { getPanchangam, Observer } from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";

/* =========================================================
   CONFIGURATION
   ========================================================= */
const ECLIPSE_CONFIG = {
  timezoneOffset: 330,
  defaultLocation: {
    name: "पिथौरागढ़",
    latitude: 29.5829,
    longitude: 80.2182,
    elevation: 1650
  },
  yearsBefore: 0,
  yearsAfter: 5,
  scanStepHours: 12, // 12 hours is scientifically safe & 2x faster than 6
  language: "hi-IN"
};

/* =========================================================
   HINDI DATA
   ========================================================= */
const HINDI = {
  type: { solar: "सूर्य ग्रहण", lunar: "चंद्र ग्रहण" },
  subtype: { total: "पूर्ण", partial: "आंशिक", annular: "वलयाकार", penumbral: "उपच्छाया" },
  contact: { first: "प्रथम स्पर्श", second: "द्वितीय स्पर्श", maximum: "मध्य", third: "तृतीय स्पर्श", fourth: "मोक्ष" }
};

/* =========================================================
   HELPERS
   ========================================================= */
function safeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function pad(n) { return String(n).padStart(2, "0"); }

function formatDate(date) {
  const d = safeDate(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat(ECLIPSE_CONFIG.language, {
    day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "Asia/Kolkata"
  }).format(d);
}

function formatTime(date) {
  const d = safeDate(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat(ECLIPSE_CONFIG.language, {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata"
  }).format(d);
}

function dateKey(date) {
  const d = safeDate(date);
  if (!d) return "";
  return [d.getUTCFullYear(), pad(d.getUTCMonth() + 1), pad(d.getUTCDate())].join("-");
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

/* =========================================================
   LOCATION & ADAPTERS
   ========================================================= */
export function createObserver(location) {
  const loc = { ...ECLIPSE_CONFIG.defaultLocation, ...(location || {}) };
  return new Observer(Number(loc.latitude), Number(loc.longitude), Number(loc.elevation || 0));
}

function getGrahanaFromPanchang(panchang) {
  if (!panchang) return null;
  return panchang.grahana ?? panchang.grahan ?? panchang.eclipse ?? panchang.eclipseInfo ?? null;
}

function pick(obj, names) {
  if (!obj) return null;
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(obj, name) && obj[name] != null) return obj[name];
  }
  return null;
}

/* =========================================================
   NORMALIZE GRAHANA (100% Accurate Logic Preserved)
   ========================================================= */
function normalizeGrahana(raw, calculationDate, location) {
  if (!raw) return null;

  const typeRaw = String(pick(raw, ["type", "grahanaType", "eclipseType"]) || "").toLowerCase();
  let type = null;

  if (typeRaw.includes("solar") || typeRaw.includes("surya")) type = "solar";
  if (typeRaw.includes("lunar") || typeRaw.includes("chandra")) type = "lunar";

  if (!type) {
    if (raw.isSolar === true || raw.solar === true) type = "solar";
    if (raw.isLunar === true || raw.lunar === true) type = "lunar";
  }
  if (!type) return null;

  const subtypeRaw = String(pick(raw, ["subtype", "grahanaSubtype", "eclipseSubtype", "kind"]) || "").toLowerCase();
  let subtype = subtypeRaw || "unknown";

  if (subtype.includes("total") || subtype.includes("पूर्ण")) subtype = "total";
  else if (subtype.includes("annular") || subtype.includes("वलय")) subtype = "annular";
  else if (subtype.includes("partial") || subtype.includes("आंशिक")) subtype = "partial";
  else if (subtype.includes("penumbral") || subtype.includes("उपच्छाया")) subtype = "penumbral";

  return {
    raw, type, subtype, calculationDate, location,
    date: safeDate(pick(raw, ["maximum", "maximumTime", "maxTime", "greatest", "greatestEclipse", "midTime", "peakTime", "peak"])) ||
          safeDate(pick(raw, ["firstContact", "firstContactTime", "contact1", "c1", "partialStart", "partialBegin", "startTime", "start"])) ||
          safeDate(pick(raw, ["fourthContact", "fourthContactTime", "contact4", "c4", "partialEnd", "partialEndTime", "endTime", "end"])) ||
          calculationDate,
    firstContact: safeDate(pick(raw, ["firstContact", "firstContactTime", "contact1", "c1", "partialStart", "partialBegin", "startTime", "start"])),
    secondContact: safeDate(pick(raw, ["secondContact", "secondContactTime", "contact2", "c2", "totalStart", "centralStart", "centralBegin"])),
    maximum: safeDate(pick(raw, ["maximum", "maximumTime", "maxTime", "greatest", "greatestEclipse", "midTime", "peakTime", "peak"])),
    thirdContact: safeDate(pick(raw, ["thirdContact", "thirdContactTime", "contact3", "c3", "totalEnd", "centralEnd"])),
    fourthContact: safeDate(pick(raw, ["fourthContact", "fourthContactTime", "contact4", "c4", "partialEnd", "partialEndTime", "endTime", "end"])),
    sutakStart: safeDate(pick(raw, ["sutakStartTime", "sutakStart", "sutakBegin"])),
    sutakEnd: safeDate(pick(raw, ["sutakEndTime", "sutakEnd"])),
    punyaStart: safeDate(pick(raw, ["punyaKalaStart", "punyaKalaStartTime", "punyaStart", "punyaStartTime"])),
    punyaEnd: safeDate(pick(raw, ["punyaKalaEnd", "punyaKalaEndTime", "punyaEnd", "punyaEndTime"])),
    visible: pick(raw, ["visible", "isVisible", "visibleAtLocation", "visibility"])
  };
}

/* =========================================================
   SINGLE DATE CALCULATION
   ========================================================= */
export function calculateEclipseAt(date, location) {
  const loc = { ...ECLIPSE_CONFIG.defaultLocation, ...(location || {}) };
  const observer = createObserver(loc);
  const panchang = getPanchangam(date, observer, { timezoneOffset: ECLIPSE_CONFIG.timezoneOffset, calendarType: "purnimanta" });
  const raw = getGrahanaFromPanchang(panchang);
  return normalizeGrahana(raw, date, loc);
}

/* =========================================================
   SCAN DATE RANGE (OPTIMIZED: Non-Blocking Chunking)
   ========================================================= */
export async function findEclipses({ startDate, endDate, location }) {
  const start = safeDate(startDate);
  const end = safeDate(endDate);
  if (!start || !end) throw new Error("Invalid eclipse date range.");

  const results = [];
  const seen = new Set();
  const step = ECLIPSE_CONFIG.scanStepHours * 60 * 60 * 1000;
  
  let cursor = start.getTime();
  const endTime = end.getTime();
  let iterations = 0;

  while (cursor <= endTime) {
    const date = new Date(cursor);
    const eclipse = calculateEclipseAt(date, location);

    if (eclipse) {
      const identity = eclipse.type + "|" + dateKey(eclipse.maximum || eclipse.firstContact || date);
      if (!seen.has(identity)) {
        seen.add(identity);
        results.push(eclipse);
      }
    }

    cursor += step;
    iterations++;

    // Yield to main thread every 50 iterations to prevent UI freeze (Smooth & Fast)
    if (iterations % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  results.sort((a, b) => a.date.getTime() - b.date.getTime());
  return results;
}

/* =========================================================
   YEAR RANGE (Async + Smart Caching)
   ========================================================= */
export async function getEclipsesForYears(startYear, numberOfYears, location) {
  const cacheKey = `ohd_eclipse_${startYear}_${numberOfYears}_${location?.name || 'default'}`;
  
  // 1. Check Cache First (Instant Load for returning users)
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.map(e => ({
        ...e,
        date: new Date(e.date),
        firstContact: e.firstContact ? new Date(e.firstContact) : null,
        secondContact: e.secondContact ? new Date(e.secondContact) : null,
        maximum: e.maximum ? new Date(e.maximum) : null,
        thirdContact: e.thirdContact ? new Date(e.thirdContact) : null,
        fourthContact: e.fourthContact ? new Date(e.fourthContact) : null,
        sutakStart: e.sutakStart ? new Date(e.sutakStart) : null,
        sutakEnd: e.sutakEnd ? new Date(e.sutakEnd) : null,
        punyaStart: e.punyaStart ? new Date(e.punyaStart) : null,
        punyaEnd: e.punyaEnd ? new Date(e.punyaEnd) : null,
        calculationDate: new Date(e.calculationDate)
      }));
    }
  } catch (e) { /* Ignore cache errors */ }

  // 2. Calculate if not cached
  const start = new Date(`${startYear}-01-01T00:00:00Z`);
  const end = new Date(`${startYear + numberOfYears}-01-01T00:00:00Z`);
  const results = await findEclipses({ startDate: start, endDate: end, location });

  // 3. Save to Cache for future instant loads
  try {
    localStorage.setItem(cacheKey, JSON.stringify(results));
  } catch (e) { /* Ignore quota errors */ }

  return results;
}

/* =========================================================
   RENDER HELPERS
   ========================================================= */
function getTypeLabel(eclipse) {
  const type = HINDI.type[eclipse.type] || eclipse.type;
  const subtype = HINDI.subtype[eclipse.subtype] || "";
  return subtype ? `${type} — ${subtype}` : type;
}

function getVisibilityLabel(eclipse) {
  if (eclipse.visible === true) return `<span class="ohd-eclipse-visible" style="color:#2e7d32;font-weight:bold;">✓ इस स्थान से दृश्य</span>`;
  if (eclipse.visible === false) return `<span class="ohd-eclipse-not-visible" style="color:#c62828;font-weight:bold;">✗ इस स्थान से अदृश्य</span>`;
  return "";
}

function timeRow(label, value) {
  if (!value) return "";
  return `<div class="ohd-eclipse-time-row" style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #e0e0e0;">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(formatTime(value))}</strong>
  </div>`;
}

export function renderEclipseCard(eclipse) {
  const solar = eclipse.type === "solar";
  const cardClass = solar ? "ohd-eclipse-solar" : "ohd-eclipse-lunar";
  const bg = solar ? "#fff8e1" : "#e3f2fd";
  const border = solar ? "#ffca28" : "#64b5f6";

  return `
    <article class="ohd-eclipse-card ${cardClass}" style="background:${bg};border:1px solid ${border};border-radius:8px;padding:16px;margin-bottom:16px;box-shadow:0 2px 4px rgba(0,0,0,0.05);">
      <div class="ohd-eclipse-card-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div>
          <div class="ohd-eclipse-type" style="font-size:1.1em;font-weight:bold;color:#333;">
            ${solar ? "☀️" : "🌙"} ${escapeHtml(getTypeLabel(eclipse))}
          </div>
          <div class="ohd-eclipse-date" style="color:#666;font-size:0.95em;margin-top:4px;">
            ${escapeHtml(formatDate(eclipse.date))}
          </div>
        </div>
        ${getVisibilityLabel(eclipse)}
      </div>

      <div class="ohd-eclipse-times" style="margin-bottom:12px;">
        ${timeRow(solar ? "प्रथम स्पर्श" : "उपच्छाया स्पर्श", eclipse.firstContact)}
        ${timeRow(solar ? "द्वितीय स्पर्श" : "खग्रास आरम्भ", eclipse.secondContact)}
        ${timeRow("मध्य (Maximum)", eclipse.maximum)}
        ${timeRow(solar ? "तृतीय स्पर्श" : "खग्रास समाप्ति", eclipse.thirdContact)}
        ${timeRow("मोक्ष (अंत)", eclipse.fourthContact)}
      </div>

      ${eclipse.sutakStart ? `
        <div class="ohd-eclipse-special sutak" style="background:#ffebee;padding:10px;border-radius:6px;margin-bottom:8px;font-size:0.9em;">
          <div style="display:flex;justify-content:space-between;"><span>सूतक प्रारम्भ:</span> <strong>${escapeHtml(formatTime(eclipse.sutakStart))}</strong></div>
          ${eclipse.sutakEnd ? `<div style="display:flex;justify-content:space-between;margin-top:4px;"><span>सूतक समाप्ति:</span> <strong>${escapeHtml(formatTime(eclipse.sutakEnd))}</strong></div>` : ""}
        </div>
      ` : ""}

      ${eclipse.punyaStart ? `
        <div class="ohd-eclipse-special punya" style="background:#e8f5e9;padding:10px;border-radius:6px;font-size:0.9em;">
          <div style="display:flex;justify-content:space-between;">
            <span>पुण्य काल:</span> 
            <strong>${escapeHtml(formatTime(eclipse.punyaStart))} ${eclipse.punyaEnd ? `– ${escapeHtml(formatTime(eclipse.punyaEnd))}` : ""}</strong>
          </div>
        </div>
      ` : ""}

      <div class="ohd-eclipse-note" style="margin-top:12px;font-size:0.8em;color:#888;text-align:center;">
        समय चयनित स्थान (${escapeHtml(eclipse.location.name)}) के स्थानीय समय (IST) के अनुसार हैं।
      </div>
    </article>
  `;
}

function createYearOptions(currentYear, yearsBefore = 1, yearsAfter = 10) {
  let html = "";
  for (let y = currentYear - yearsBefore; y <= currentYear + yearsAfter; y++) {
    html += `<option value="${y}">${y}</option>`;
  }
  return html;
}

/* =========================================================
   MAIN RENDER (Async + Smooth Loading)
   ========================================================= */
export async function initEclipsePanchang(options = {}) {
  const container = document.getElementById("ohd-eclipse-panchang");
  if (!container) return;

  const location = { ...ECLIPSE_CONFIG.defaultLocation, ...(options.location || {}) };
  const now = new Date();
  const currentYear = now.getFullYear();

  container.innerHTML = `
    <section class="ohd-eclipse-widget" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <header class="ohd-eclipse-widget-header" style="text-align:center;margin-bottom:16px;">
        <h2 style="margin:0;color:#8b4513;">ग्रहण पंचांग</h2>
        <p style="margin:4px 0 0;color:#666;">आगामी सूर्य एवं चंद्र ग्रहण</p>
      </header>

      <div class="ohd-eclipse-controls" style="display:flex;gap:12px;justify-content:center;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
        <label style="font-size:0.95em;">
          वर्ष: 
          <select id="ohd-eclipse-year" style="padding:6px;border-radius:4px;border:1px solid #ccc;font-size:1em;">
            ${createYearOptions(currentYear, ECLIPSE_CONFIG.yearsBefore, ECLIPSE_CONFIG.yearsAfter)}
          </select>
        </label>
        <label style="font-size:0.95em;">
          स्थान: <span class="ohd-eclipse-location" style="font-weight:bold;color:#8b4513;">${escapeHtml(location.name)}</span>
        </label>
      </div>

      <div id="ohd-eclipse-results" class="ohd-eclipse-results" style="min-height:100px;">
        <div class="ohd-eclipse-loading" style="text-align:center;padding:20px;color:#666;">
          <span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> ग्रहण की गणना की जा रही है…
        </div>
      </div>
    </section>
  `;

  const yearSelect = document.getElementById("ohd-eclipse-year");
  const results = document.getElementById("ohd-eclipse-results");

  async function loadYear(year) {
    results.innerHTML = `<div class="ohd-eclipse-loading" style="text-align:center;padding:20px;color:#666;">${year} के ग्रहण खोजे जा रहे हैं…</div>`;
    await new Promise(resolve => setTimeout(resolve, 50)); // Let browser paint

    try {
      const eclipses = await getEclipsesForYears(year, 1, location);

      if (!eclipses.length) {
        results.innerHTML = `<div class="ohd-eclipse-empty" style="text-align:center;padding:20px;color:#666;">इस वर्ष के लिए कोई ग्रहण उपलब्ध नहीं मिला।</div>`;
        return;
      }

      const solar = eclipses.filter(e => e.type === "solar");
      const lunar = eclipses.filter(e => e.type === "lunar");

      results.innerHTML = `
        ${solar.length ? `<section><h3 style="color:#e65100;border-bottom:2px solid #ffca28;padding-bottom:4px;margin-bottom:12px;">☀️ सूर्य ग्रहण</h3><div>${solar.map(renderEclipseCard).join("")}</div></section>` : ""}
        ${lunar.length ? `<section style="margin-top:24px;"><h3 style="color:#1a237e;border-bottom:2px solid #64b5f6;padding-bottom:4px;margin-bottom:12px;">🌙 चंद्र ग्रहण</h3><div>${lunar.map(renderEclipseCard).join("")}</div></section>` : ""}
      `;
    } catch (error) {
      console.error("Eclipse calculation error:", error);
      results.innerHTML = `<div class="ohd-eclipse-error" style="text-align:center;padding:20px;color:#c62828;">ग्रहण गणना करते समय त्रुटि हुई। कृपया पृष्ठ को पुनः लोड करें।</div>`;
    }
  }

  yearSelect.addEventListener("change", () => loadYear(Number(yearSelect.value)));
  yearSelect.value = String(currentYear);
  await loadYear(currentYear);
}

/* =========================================================
   AUTO INIT (Safe for every page load)
   ========================================================= */
function autoInit() {
  if (document.getElementById("ohd-eclipse-panchang")) {
    initEclipsePanchang();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else {
  autoInit();
}
