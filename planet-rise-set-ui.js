
import { getPlanetRiseSet } from "./planet-rise-set.js";

function getLocation() {
  try {
    const saved = localStorage.getItem("ohdPanchangLocation");
    if (!saved) return null;

    const location = JSON.parse(saved);

    return {
      latitude: Number(location.lat),
      longitude: Number(location.lon),
      elevation: Number(location.elevation || 0)
    };
  } catch (error) {
    console.error("Planet location error:", error);
    return null;
  }
}

function getSelectedDate() {
  const input = document.getElementById("dateInput");
  return input?.value || null;
}

function createPlanetRiseSetCard(data) {
  const card = document.createElement("div");
  card.className = "card full";
  card.id = "planetRiseSetCard";

  card.innerHTML = `
    <h3>🌌 ग्रह उदय-अस्त</h3>

    <div class="planet-rise-set-grid">
      ${data.map(planet => `
        <div class="planet-rise-set-row">
          <strong>${planet.name}</strong>
          <span>उदय — ${planet.rise || "—"}</span>
          <span>अस्त — ${planet.set || "—"}</span>
        </div>
      `).join("")}
    </div>
  `;

  return card;
}

export function updatePlanetRiseSet() {
  const location = getLocation();
  const date = getSelectedDate();

  if (!location || !date) {
    console.warn("Planet rise/set: location or date unavailable.");
    return;
  }

  const data = getPlanetRiseSet({
    latitude: location.latitude,
    longitude: location.longitude,
    elevation: location.elevation,
    date: `${date}T00:00:00Z`,
    timeZone: "Asia/Kolkata"
  });

  let card = document.getElementById("planetRiseSetCard");

  if (card) {
    card.replaceWith(createPlanetRiseSetCard(data));
  } else {
    const container =
      document.querySelector(".grid") ||
      document.querySelector("main");

    if (!container) {
      console.warn("Planet rise/set: display container not found.");
      return;
    }

    container.appendChild(createPlanetRiseSetCard(data));
  }
}
window.updatePlanetRiseSet = updatePlanetRiseSet;
