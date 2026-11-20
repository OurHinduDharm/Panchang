import { getTimeZoneOffsetForLocalDay, zonedDateTimeToUtc } from "./location-timezone.mjs";
import { getPanchangam, Observer } from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";

/*
 * OurHinduDharm — Panchang library festival card.
 * Display every festival returned by the library without name filtering or deduplication.
 */

function getSelectedDate() {
  return document.getElementById("dateInput")?.value || null;
}

function getObserver() {
  return window.__ohdPanchangLocation ?? null;
}

function formatHindiDate(dateString) {
  const timeZone = getObserver()?.timeZone || "Asia/Kolkata";
  const date = zonedDateTimeToUtc(dateString, 12, 0, timeZone);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone,
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
    message.textContent = "इस तिथि के लिए कोई व्रत-पर्व सूचीबद्ध नहीं है।";
    card.appendChild(message);
  } else {
    const list = document.createElement("ul");
    list.style.cssText = "margin:0;padding-left:20px;line-height:1.7;";
    festivals.forEach(item => {
      const row = document.createElement("li");
      row.textContent = String(item?.name || item?.title || item?.festival || item?.label || item || "").trim();
      list.appendChild(row);
    });
    card.appendChild(list);
  }

  grid.appendChild(card);
}

let lastRenderKey = "";

function updateHinduFestivals() {
  const dateString = getSelectedDate();
  if (!dateString) return;

  const location = getObserver();
  if (!location) return;
  const renderKey = [dateString, location.lat, location.lon, location.elevation, location.timeZone].join("|");
  if (renderKey === lastRenderKey && document.getElementById("ohdHinduFestivalsCard")) return;

  try {
    const date = zonedDateTimeToUtc(dateString, 12, 0, location.timeZone);
    const observer = new Observer(location.lat, location.lon, location.elevation);
    const panchang = getPanchangam(date, observer, {
      timezoneOffset: getTimeZoneOffsetForLocalDay(date, location.timeZone)
    });
    const allFestivals = Array.isArray(panchang?.festivals) ? panchang.festivals : [];
    // Display every festival returned by the Panchang library without name/category filtering or deduplication.
    renderFestivalCard(dateString, allFestivals);
    lastRenderKey = renderKey;


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
