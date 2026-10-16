/**
 * Festival muhurta rule helpers.
 *
 * These functions do not calculate astronomy. They combine already-calculated,
 * timezone-aware local intervals from the Panchang engine. Callers must never
 * pass a copied time from another city or an unverified interval.
 */
"use strict";

function validDate(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function interval(start, end) {
  const s = validDate(start);
  const e = validDate(end);
  if (!s || !e || e <= s) return null;
  return { start: s, end: e };
}

function intersectIntervals(...values) {
  const parts = values.map((v) => interval(v?.start, v?.end));
  if (parts.some((v) => !v)) return null;
  const start = new Date(Math.max(...parts.map((v) => v.start.getTime())));
  const end = new Date(Math.min(...parts.map((v) => v.end.getTime())));
  return end > start ? { start, end } : null;
}

function daytimeWindow(sunrise, sunset) {
  return interval(sunrise, sunset);
}

function ghatasthapanaCandidates({
  sunrise, sunset, pratipada, abhijit, chitra, vaidhriti
}) {
  const day = daytimeWindow(sunrise, sunset);
  const tithi = interval(pratipada?.start, pratipada?.end);
  if (!day || !tithi) {
    return { status: "calculation-unavailable", primary: null, fallback: null, warnings: ["स्थानीय सूर्योदय/सूर्यास्त या प्रतिपदा तिथि-सीमा उपलब्ध नहीं"] };
  }

  const sunriseDate = day.start;
  const firstThirdEnd = new Date(
    sunriseDate.getTime() + (day.end.getTime() - day.start.getTime()) / 3
  );
  const firstThird = { start: sunriseDate, end: firstThirdEnd };
  const primary = intersectIntervals(day, tithi, firstThird);
  const fallback = abhijit
    ? intersectIntervals(day, tithi, interval(abhijit.start, abhijit.end))
    : null;
  const warnings = [];
  if (chitra && intersectIntervals(primary || fallback || day, interval(chitra.start, chitra.end))) {
    warnings.push("चन्द्र नक्षत्र चित्रा का संयोग है; चयनित परंपरा के नियम के अनुसार समीक्षा करें");
  }
  if (vaidhriti && intersectIntervals(primary || fallback || day, interval(vaidhriti.start, vaidhriti.end))) {
    warnings.push("वैधृति योग का संयोग है; चयनित परंपरा के नियम के अनुसार समीक्षा करें");
  }
  if (!primary && !fallback) warnings.push("दिए गए नियमों में उपयुक्त समय नहीं मिला; मुहूर्त स्वयं न गढ़ें");
  return {
    status: primary ? "candidate" : fallback ? "fallback-candidate" : "no-candidate",
    primary,
    fallback,
    firstThird,
    warnings
  };
}

function moonlightKheerWindow({ moonrise, moonset, purnima, nightEnd }) {
  const lunarNight = interval(moonrise, moonset || nightEnd);
  const fullMoon = interval(purnima?.start, purnima?.end);
  const window = lunarNight && fullMoon ? intersectIntervals(lunarNight, fullMoon) : null;
  return {
    status: window ? "candidate" : "calculation-unavailable",
    window,
    label: "चाँदनी में खीर रखने का समय",
    note: "स्थानीय चंद्रोदय और पूर्णिमा-व्याप्ति के आधार पर; यह अलग सार्वभौमिक मुहूर्त नहीं है।"
  };
}

function paranaWindow({ dvadashi, sunrise, paranaRule }) {
  const tithi = interval(dvadashi?.start, dvadashi?.end);
  const dayStart = validDate(sunrise);
  if (!tithi || !dayStart) {
    return { status: "calculation-unavailable", window: null, note: "द्वादशी-अंतराल या सूर्योदय उपलब्ध नहीं" };
  }

  // Common baseline: avoid Hari-vasara, defined here as the first quarter
  // of Dvadashi, then begin parana after both that cutoff and local sunrise.
  // A verified tradition-specific rule may narrow this baseline further.
  const hariVasaraEnd = new Date(tithi.start.getTime() + (tithi.end.getTime() - tithi.start.getTime()) / 4);
  const baseline = {
    start: new Date(Math.max(dayStart.getTime(), hariVasaraEnd.getTime())),
    end: tithi.end
  };
  const rule = paranaRule ? interval(paranaRule.start, paranaRule.end) : null;
  const window = rule
    ? intersectIntervals(tithi, baseline, rule)
    : interval(baseline.start, baseline.end);
  return {
    status: window ? "candidate" : "no-candidate",
    window,
    hariVasaraEnd,
    note: rule
      ? "सूर्योदय, द्वादशी और दिए गए परंपरा-विशिष्ट पारण नियम का साझा अंतराल"
      : "सामान्य नियम: स्थानीय सूर्योदय और द्वादशी के साथ हरिवासर (द्वादशी का प्रथम चतुर्थांश) बीतने के बाद"
  };
}

function selectPujaWindows({ tithi, pradosh, vrishabha, nishita, tradition }) {
  const result = {
    pradosh: tithi && pradosh ? intersectIntervals(tithi, pradosh) : null,
    vrishabha: tithi && vrishabha ? intersectIntervals(tithi, vrishabha) : null,
    nishita: tithi && nishita ? intersectIntervals(tithi, nishita) : null,
    tradition: tradition || "unspecified"
  };
  const any = result.pradosh || result.vrishabha || result.nishita;
  return { status: any ? "candidate" : "calculation-unavailable", ...result };
}

const OHDFestivalMuhurtaRules = {
  interval,
  intersectIntervals,
  ghatasthapanaCandidates,
  moonlightKheerWindow,
  paranaWindow,
  selectPujaWindows
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = OHDFestivalMuhurtaRules;
}
if (typeof globalThis !== "undefined") {
  globalThis.OHDFestivalMuhurtaRules = OHDFestivalMuhurtaRules;
}
