import { getPanchangam, Observer } from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";

/*
 * OurHinduDharm — Hindu festival card
 *
 * Intentionally conservative: the library's festival category metadata is
 * not assumed to prove that an event is Hindu. Events are displayed only
 * when their names match known Hindu vrata/parva terminology. This avoids
 * showing national days and festivals of other religions by default.
 *
 * Before broadening this catalogue, audit actual p.festivals output against
 * a trusted Hindu festival list and add regression tests.
 */

const DEFAULT_LOCATION = {
  latitude: 30.1265,
  longitude: 80.4817,
  elevation: 0
};


import { festivalName, isHinduFestival } from "./festival-filter.js";

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
    message.textContent = "लाइब्रेरी की सूची में इस तिथि से मेल खाता हिंदू व्रत-पर्व नहीं मिला।";
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
  note.textContent = "सूची लाइब्रेरी के पर्व-डेटा पर आधारित है। स्थानीय परंपरा, व्रत-निर्णय, पूजा-मुहूर्त और पारण का समय अलग से जाँचें।";
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
    const filtered = allFestivals.filter(isHinduFestival);
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

  // The main Panchang renderer can replace #result when date/location changes.
  // Restore the festival card after that render without observing our own card
  // insertion as a new render request.
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
