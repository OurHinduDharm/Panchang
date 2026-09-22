import {
  SearchRiseSet,
  Observer
} from "https://esm.sh/astronomy-engine@2.1.19";

const PLANETS = [
  { key: "mercury", name: "बुध", body: "Mercury" },
  { key: "venus", name: "शुक्र", body: "Venus" },
  { key: "mars", name: "मंगल", body: "Mars" },
  { key: "jupiter", name: "गुरु", body: "Jupiter" },
  { key: "saturn", name: "शनि", body: "Saturn" }
];

function formatTime(date, timeZone = "Asia/Kolkata") {
  if (!date) return "—";

  return new Intl.DateTimeFormat("hi-IN", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function getRiseSet(body, observer, startDate) {
  let rise = null;
  let set = null;

  try {
    const r = SearchRiseSet(body, observer, +1, startDate, 1);
    rise = r?.date || null;
  } catch (e) {
    console.error(`Rise error: ${body}`, e);
  }

  try {
    const s = SearchRiseSet(body, observer, -1, startDate, 1);
    set = s?.date || null;
  } catch (e) {
    console.error(`Set error: ${body}`, e);
  }

  return { rise, set };
}

function getLocation() {
  try {
    const saved = localStorage.getItem("ohdPanchangLocation");

    if (!saved) return null;

    const location = JSON.parse(saved);

    if (
      !Number.isFinite(Number(location.lat)) ||
      !Number.isFinite(Number(location.lon))
    ) {
      return null;
    }

    return {
      latitude: Number(location.lat),
      longitude: Number(location.lon),
      elevation: Number(location.elevation) || 0
    };
  } catch (error) {
    console.error("Extra Panchang location error:", error);
    return null;
  }
}

function getSelectedDate() {
  return document.getElementById("dateInput")?.value || null;
}

function localDateToUTC(dateString) {
  return new Date(`${dateString}T00:00:00+05:30`);
}

function createPlanetCard(data) {
  const card = document.createElement("div");

  card.className = "card full";
  card.id = "planetRiseSetCard";

  card.innerHTML = `
    <h3>🌌 ग्रह उदय-अस्त</h3>

    <div class="planet-rise-set-grid">
      ${data.map(planet => `
        <div class="planet-rise-set-row">
          <strong>${planet.name}</strong>
          <span>उदय — ${planet.rise}</span>
          <span>अस्त — ${planet.set}</span>
        </div>
      `).join("")}
    </div>
  `;

  return card;
}

function updatePlanetRiseSet() {
  const location = getLocation();
  const selectedDate = getSelectedDate();

  if (!location || !selectedDate) {
    console.warn("Extra Panchang: location/date unavailable.");
    return;
  }

  const observer = new Observer(
    location.latitude,
    location.longitude,
    location.elevation
  );

  const startDate = localDateToUTC(selectedDate);

  const data = PLANETS.map(planet => {
    const events = getRiseSet(
      planet.body,
      observer,
      startDate
    );

    return {
      key: planet.key,
      name: planet.name,
      rise: formatTime(events.rise),
      set: formatTime(events.set)
    };
  });

  const newCard = createPlanetCard(data);

  const oldCard = document.getElementById("planetRiseSetCard");

  if (oldCard) {
    oldCard.replaceWith(newCard);
    return;
  }

  const result = document.getElementById("result");

  if (!result) {
    console.warn("Extra Panchang: #result not found.");
    return;
  }

  result.appendChild(newCard);
}

function initExtraPanchang() {
  updatePlanetRiseSet();

  const dateInput = document.getElementById("dateInput");

  if (dateInput) {
    dateInput.addEventListener("change", updatePlanetRiseSet);
  }

  window.addEventListener("ohd:locationChanged", updatePlanetRiseSet);
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initExtraPanchang
  );
} else {
  initExtraPanchang();
}
