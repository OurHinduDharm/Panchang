"use strict";

/*
 * Draft-only adapter from @ishubhamx/panchangam-js to festival resolver day records.
 * Monthly Kalashtami candidates use tithi at local sunrise.
 * Annual Bhairava Jayanti uses a night-midpoint diagnostic proxy, NOT a certified
 * Nishita-muhurta/vrata decision. Keep this adapter out of live rendering until
 * the proxy is replaced/approved and end-to-end dates are checked against the
 * Ganesh Martand Panchang.
 */
(function (root) {
  const TITHI_HINDI = [
    "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
    "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा","प्रतिपदा","द्वितीया","तृतीया","चतुर्थी",
    "पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या"
  ];
  const MONTH_HINDI = {
    Chaitra:"चैत्र", Vaishakha:"वैशाख", Jyeshtha:"ज्येष्ठ", Ashadha:"आषाढ़",
    Shravana:"श्रावण", Bhadrapada:"भाद्रपद", Bhadra:"भाद्रपद",
    Ashwin:"आश्विन", Ashwina:"आश्विन", Ashwayuja:"आश्विन",
    Kartika:"कार्तिक", Kartik:"कार्तिक", Margashirsha:"मार्गशीर्ष",
    Margashir:"मार्गशीर्ष", Agrahayana:"मार्गशीर्ष", Aghrayana:"मार्गशीर्ष",
    Pausha:"पौष", Paush:"पौष", Magha:"माघ", Phalguna:"फाल्गुन", Phalgun:"फाल्गुन"
  };
  const ENGLISH_TITHI = {
    pratipada:"प्रतिपदा",pratipat:"प्रतिपदा",dwitiya:"द्वितीया",tritiya:"तृतीया",chaturthi:"चतुर्थी",
    panchami:"पंचमी",shashthi:"षष्ठी",shashthi2:"षष्ठी",saptami:"सप्तमी",ashtami:"अष्टमी",
    navami:"नवमी",dashami:"दशमी",ekadashi:"एकादशी",dwadashi:"द्वादशी",trayodashi:"त्रयोदशी",
    chaturdashi:"चतुर्दशी",purnima:"पूर्णिमा",purnima2:"पूर्णिमा",amavasya:"अमावस्या"
  };
  function fieldValue(value) {
    if (value && typeof value === "object") return value.name ?? value.value ?? value.index ?? value.number ?? "";
    return value;
  }
  function tithiIndex(value) {
    if (value && typeof value === "object") value = value.index ?? value.number ?? value.value ?? value.name;
    if (typeof value === "number" && Number.isInteger(value)) return value;
    if (typeof value === "string" && /^\\d+$/.test(value.trim())) return Number(value);
    return -1;
  }
  function tithiHindi(value) {
    const index = tithiIndex(value);
    if (index >= 0 && index < TITHI_HINDI.length) return TITHI_HINDI[index];
    const raw = String(fieldValue(value) || "").toLowerCase().replace(/[\\s_-]+/g, "");
    return ENGLISH_TITHI[raw] || String(fieldValue(value) || "");
  }
  function pakshaHindi(value, index) {
    const raw = String(fieldValue(value) || "").toLowerCase();
    if (raw.includes("krishna") || raw.includes("kṛṣṇa") || raw.includes("कृष्ण")) return "कृष्ण";
    if (raw.includes("shukla") || raw.includes("śukla") || raw.includes("शुक्ल")) return "शुक्ल";
    if (typeof index === "number" && index >= 15) return "कृष्ण";
    if (typeof index === "number" && index >= 0) return "शुक्ल";
    return "";
  }
  function monthHindi(value) {
    const raw = String(fieldValue(value) || "");
    const key = raw.trim();
    return MONTH_HINDI[key] || MONTH_HINDI[key[0] ? key[0].toUpperCase() + key.slice(1).toLowerCase() : key] || key;
  }
  function isoLocal(date) {
    return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
  }
  function dateAtIst(dateString, time) {
    return new Date(dateString + "T" + time + "+05:30");
  }
  function asDate(value) {
    if (value instanceof Date) return value;
    if (typeof value === "number" || typeof value === "string") {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }
  function record(dateString, p, method) {
    const index = tithiIndex(p && p.tithi);
    return {
      date: dateString,
      month: monthHindi(p && p.masa),
      paksha: pakshaHindi(p && p.paksha, index),
      tithi: tithiHindi(p && p.tithi),
      sourceMethod: method
    };
  }
  function isNearAshtami(p) {
    const index = tithiIndex(p && p.tithi);
    if (index >= 0) {
      const n = index % 15;
      return n === 6 || n === 7 || n === 8;
    }
    return ["सप्तमी","अष्टमी","नवमी"].includes(tithiHindi(p && p.tithi));
  }
  async function buildKalashtamiDays(options) {
    options = options || {};
    if (typeof options.getPanchangam !== "function" || typeof options.Observer !== "function") {
      throw new TypeError("getPanchangam and Observer are required");
    }
    const year = Number(options.year);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) throw new RangeError("year must be between 1900 and 2200");
    const latitude = Number.isFinite(options.latitude) ? options.latitude : 30.1265;
    const longitude = Number.isFinite(options.longitude) ? options.longitude : 80.4817;
    const elevation = Number.isFinite(options.elevation) ? options.elevation : 0;
    const timezoneOffset = Number.isFinite(options.timezoneOffset) ? options.timezoneOffset : 330;
    const observer = new options.Observer(latitude, longitude, elevation);
    const base = new Map();
    const start = new Date(Date.UTC(year,0,1));
    const end = new Date(Date.UTC(year+1,0,1));
    for (let cursor = new Date(start); cursor < end; cursor.setUTCDate(cursor.getUTCDate()+1)) {
      const dateString = cursor.toISOString().slice(0,10);
      const p = options.getPanchangam(dateAtIst(dateString,"12:00:00"), observer, { timezoneOffset });
      if (!p || !p.sunrise || !p.sunset) continue;
      base.set(dateString, { noon:p, sunrise:asDate(p.sunrise), sunset:asDate(p.sunset) });
    }
    const candidateDates = new Set();
    for (const [dateString, entry] of base.entries()) {
      if (!isNearAshtami(entry.noon)) continue;
      const d = new Date(dateString + "T00:00:00Z");
      [-1,0,1].forEach((offset) => {
        const candidate = new Date(d);
        candidate.setUTCDate(candidate.getUTCDate()+offset);
        const key = candidate.toISOString().slice(0,10);
        if (key.slice(0,4) === String(year) && base.has(key)) candidateDates.add(key);
      });
    }
    const sunriseDays = [];
    const nightMidpointDays = [];
    for (const dateString of Array.from(candidateDates).sort()) {
      const entry = base.get(dateString);
      if (entry.sunrise) {
        const sunriseP = options.getPanchangam(entry.sunrise, observer, { timezoneOffset });
        if (sunriseP) sunriseDays.push(record(dateString, sunriseP, "local-sunrise-tithi"));
      }
      const next = new Date(dateString + "T00:00:00Z");
      next.setUTCDate(next.getUTCDate()+1);
      const nextString = next.toISOString().slice(0,10);
      const nextEntry = base.get(nextString);
      if (entry.sunset && nextEntry && nextEntry.sunrise) {
        const midpoint = new Date((entry.sunset.getTime()+nextEntry.sunrise.getTime())/2);
        const nightP = options.getPanchangam(midpoint, observer, { timezoneOffset });
        if (nightP) nightMidpointDays.push(record(dateString, nightP, "night-midpoint-diagnostic"));
      }
    }
    return {
      year, latitude, longitude, elevation,
      sunriseDays, nightMidpointDays,
      candidateDates: Array.from(candidateDates).sort(),
      note: "Monthly dates use tithi at local sunrise. Annual Bhairava dates use a night-midpoint diagnostic proxy only; this is not a certified Nishita-muhurta or vrata decision."
    };
  }
  const api = { buildKalashtamiDays, tithiHindi, pakshaHindi, monthHindi, tithiIndex };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.OHDFestivalPanchangAdapter = api;
})(typeof window !== "undefined" ? window : globalThis);
