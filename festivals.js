import { getPanchangam, Observer } from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";
import { festivalName, isHinduFestival } from "./festival-filter.js";

/*
 * OurHinduDharm — Hindu festival card.
 * Only reviewed Hindu vrata/parva terminology is shown; the list is kept
 * concise and duplicate aliases for the same named festival are collapsed.
 */

// Keep this fallback identical to app.js's default Pithoragarh location.
const DEFAULT_LOCATION = {
  latitude: 29.5828,
  longitude: 80.2182,
  elevation: 1650
};

function getSelectedDate() {
  return document.getElementById("dateInput")?.value || null;
}

function getObserver() {
  try {
    const saved = JSON.parse(localStorage.getItem("ohdPanchangLocation") || "null");
    const latitude = Number(saved?.lat);
    const longitude = Number(saved?.lon);
    const elevation = Number(saved?.elevation) || 0;

    if (Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
        Number.isFinite(longitude) && longitude >= -180 && longitude <= 180) {
      return new Observer(latitude, longitude, elevation);
    }
  } catch (error) {
    console.warn("Festival card: saved location could not be read.", error);
  }

  return new Observer(
    DEFAULT_LOCATION.latitude,
    DEFAULT_LOCATION.longitude,
    DEFAULT_LOCATION.elevation
  );
}

function formatHindiDate(dateString) {
  const date = new Date(dateString + "T12:00:00+05:30");
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getResultsGrid() {
  return document.querySelector("#result > .grid, #result .grid");
}

function deduplicateFestivals(festivals) {
  const seen = new Set();
  return festivals.filter(item => {
    const name = festivalName(item);
    const normalized = name.toLocaleLowerCase().replace(/[()]/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

    // Different library labels can refer to the same Maha Ashtami observance.
    const key = /durga ashtami|दुर्गाष्टमी/i.test(name) ? "durga-ashtami" : normalized;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderFestivalCard(dateString, festivals, errorMessage = "") {
  const grid = getResultsGrid();
  if (!grid) return;

  grid.querySelector("#ohdHinduFestivalsCard")?.remove();

  const card = document.createElement("section");
  card.className = "card full";
  card.id = "ohdHinduFestivalsCard";
  card.style.borderLeftColor = "#b45309";

  const heading = document.createElement("div");
  heading.className = "label";
  heading.textContent = "🪔 इस तिथि के हिंदू व्रत-पर्व";
  card.appendChild(heading);

  const dateLine = document.createElement("div");
  dateLine.style.cssText = "font-size:12px;color:#777;margin-bottom:8px;";
  dateLine.textContent = formatHindiDate(dateString);
  card.appendChild(dateLine);

  if (errorMessage) {
    const message = document.createElement("div");
    message.className = "value";
    message.style.fontSize = "13px";
    message.textContent = "पर्वों की जानकारी अभी उपलब्ध नहीं है।";
    card.appendChild(message);
    console.warn("Festival card:", errorMessage);
  } else if (!festivals.length) {
    const message = document.createElement("div");
    message.style.cssText = "font-size:13px;color:#666;";
    message.textContent = "इस तिथि के लिए कोई व्रत-पर्व सूचीबद्ध नहीं है।";
    card.appendChild(message);
  } else {
    const list = document.createElement("ul");
    list.style.cssText = "margin:0;padding-left:20px;line-height:1.7;";
    festivals.forEach(item => {
      const row = document.createElement("li");
      row.textContent = festivalName(item);
      list.appendChild(row);
    });
    card.appendChild(list);
  }

  const note = document.createElement("div");
  note.style.cssText = "margin-top:8px;font-size:11px;color:#777;line-height:1.5;";
  note.textContent = "व्रत-निर्णय, पूजा-मुहूर्त और पारण का समय स्थानीय परंपरा के अनुसार अलग हो सकता है।";
  card.appendChild(note);

  grid.appendChild(card);
}

let lastRenderKey = "";

function updateHinduFestivals() {
  const dateString = getSelectedDate();
  if (!dateString) return;

  const location = getObserver();
  const renderKey = dateString + "|" + location.latitude + "|" + location.longitude;
  if (renderKey === lastRenderKey && document.getElementById("ohdHinduFestivalsCard")) return;

  try {
    // Use noon in IST to avoid UTC date rollover from YYYY-MM-DD parsing.
    const date = new Date(dateString + "T12:00:00+05:30");
    const panchang = getPanchangam(date, location, { timezoneOffset: 330 });
    const allFestivals = Array.isArray(panchang?.festivals) ? panchang.festivals : [];
    const filtered = deduplicateFestivals(allFestivals.filter(isHinduFestival));
    renderFestivalCard(dateString, filtered);
    lastRenderKey = renderKey;

    // Diagnostic counts help audit the conservative allowlist during preview.
    console.info("OHD festivals audit", {
      date: dateString,
      totalFromLibrary: allFestivals.length,
      displayedHinduCandidates: filtered.map(festivalName),
      filteredOut: allFestivals.filter(item => !isHinduFestival(item)).map(festivalName)
    });
  } catch (error) {
    lastRenderKey = "";
    renderFestivalCard(dateString, [], error?.message || String(error));
  }
}

function initHinduFestivals() {
  const dateInput = document.getElementById("dateInput");
  dateInput?.addEventListener("change", () => {
    lastRenderKey = "";
    updateHinduFestivals();
  });

  window.addEventListener("ohd:panchangUpdated", () => {
    lastRenderKey = "";
    updateHinduFestivals();
  });

  window.addEventListener("ohd:locationChanged", () => {
    lastRenderKey = "";
    updateHinduFestivals();
  });

  // Restore the festival card if the main Panchang renderer replaces #result.
  const resultRoot = document.getElementById("result");
  if (resultRoot && typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => {
      if (!document.getElementById("ohdHinduFestivalsCard")) {
        lastRenderKey = "";
        updateHinduFestivals();
      }
    });
    observer.observe(resultRoot, { childList: true, subtree: true });
  }

  updateHinduFestivals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHinduFestivals, { once: true });
} else {
  initHinduFestivals();
}
