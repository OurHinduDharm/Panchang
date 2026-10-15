/**
 * OurHinduDharm festival-card muhurta enhancement.
 *
 * Loads after the existing #dynamicFestivalList renderer. Reads the same
 * ohdPanchangLocation preference as app.js. Until a city/date profile is
 * independently verified, it shows a clear calculation-status message rather
 * than presenting a candidate interval as an approved religious muhurta.
 */
"use strict";

(async function () {
  const list = document.getElementById("dynamicFestivalList");
  if (!list) return;

  const GHAT_DATE = "2026-10-11";
  const GHAT_TITLE = "शारदीय नवरात्र प्रारम्भ";
  const SCRIPT_VERSION = "1.0.0";

  function getLocation() {
    try {
      const raw = localStorage.getItem("ohdPanchangLocation");
      if (!raw) return null;
      const value = JSON.parse(raw);
      const lat = Number(value.lat ?? value.latitude);
      const lon = Number(value.lon ?? value.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      return {
        name: String(value.city || value.name || "चुना गया स्थान"),
        lat,
        lon,
        elevation: Number(value.elevation) || 0
      };
    } catch (_) {
      return null;
    }
  }

  function makeNotice(card, message, kind) {
    const description = card.querySelector(".festival-description") || card.querySelector(".festival-content");
    if (!description || description.querySelector(".ohd-festival-muhurta")) return;
    const panel = document.createElement("div");
    panel.className = "ohd-festival-muhurta";
    panel.setAttribute("role", "note");
    panel.style.cssText = "margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid #d7d7d7;font-size:.92em;line-height:1.55;";
    if (kind === "warning") panel.style.borderColor = "#c28b2c";
    panel.textContent = message;
    description.appendChild(panel);
  }

  function findCard(title) {
    return Array.from(list.querySelectorAll(".festival-card")).find((card) => {
      const node = card.querySelector(".festival-title");
      return node && node.textContent.trim().includes(title);
    });
  }

  function loadLocationMessage(card) {
    const location = getLocation();
    if (!location) {
      makeNotice(card, "घटस्थापना मुहूर्त शहर के अनुसार बदलता है। पहले पंचांग पृष्ठ पर अपना शहर चुनें; स्थानीय स्थान उपलब्ध होने तक यहाँ समय नहीं दिखाया जाएगा।", "warning");
      return;
    }
    makeNotice(card, "मुहूर्त की स्थानीय गणना के लिए चुना गया स्थान: " + location.name + "। गणना-इंजन उपलब्ध है, लेकिन इस तिथि के परिणाम का स्वतंत्र सत्यापन पूरा होने तक समय को अंतिम शुभ मुहूर्त के रूप में प्रकाशित नहीं किया जा रहा है।", "warning");
  }

  const card = findCard(GHAT_TITLE);
  if (!card) return;

  loadLocationMessage(card);
  // The calculation adapter is available for diagnostic/testing use. Do not
  // expose its candidate time to visitors until the city/date is independently
  // validated and the project explicitly changes this display policy.
  card.dataset.ohdMuhurtaEngineVersion = SCRIPT_VERSION;
})();
