import {
  Elongation,
  Observer
} from "https://esm.sh/astronomy-engine@2.1.19";

const PLANETS = [
  { key: "mercury", name: "बुध", body: "Mercury" },
  { key: "venus", name: "शुक्र", body: "Venus" },
  { key: "mars", name: "मंगल", body: "Mars" },
  { key: "jupiter", name: "गुरु", body: "Jupiter" },
  { key: "saturn", name: "शनि", body: "Saturn" }
];

/*
 * अभी verified reference rules अलग रखे जा रहे हैं।
 *
 * Venus:
 *   Asta  = 19 Oct 2026
 *   Udaya = 30 Oct 2026
 *
 * इन dates को calculation engine में बाद में
 * dynamically derive किया जाएगा।
 */

function getLocation() {
  try {
    const saved = localStorage.getItem("ohdPanchangLocation");

    if (!saved) return null;

    const location = JSON.parse(saved);

    const lat = Number(location.lat);
    const lon = Number(location.lon);
    const elevation = Number(location.elevation) || 0;

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lon,
      elevation
    };
  } catch (error) {
    console.error("Extra Panchang location error:", error);
    return null;
  }
}

function getSelectedDate() {
  return document.getElementById("dateInput")?.value || null;
}

function formatEventDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T12:00:00+05:30`);

  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

/*
 * Temporary verified Venus reference.
 *
 * IMPORTANT:
 * यह permanent hard-coded Panchang calculation नहीं है।
 * यह केवल UI और module architecture verify करने के लिए है।
 */
const VERIFIED_EVENTS = {
  venus: {
    asta: "2026-10-19",
    astaDegree: "7.76°",

    udaya: "2026-10-30",
    udayaDegree: "9.70°"
  }
};

function getPlanetEvent(planet) {
  const event = VERIFIED_EVENTS[planet.key];

  if (!event) {
    return {
      name: planet.name,
      asta: null,
      astaDegree: null,
      udaya: null,
      udayaDegree: null
    };
  }

  return {
    name: planet.name,

    asta: formatEventDate(event.asta),
    astaDegree: event.astaDegree,

    udaya: formatEventDate(event.udaya),
    udayaDegree: event.udayaDegree
  };
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

          ${
            planet.asta
              ? `
                <span>
                  अस्त — ${planet.asta}
                  ${planet.astaDegree
                    ? ` (${planet.astaDegree})`
                    : ""}
                </span>
              `
              : ""
          }

          ${
            planet.udaya
              ? `
                <span>
                  उदय — ${planet.udaya}
                  ${planet.udayaDegree
                    ? ` (${planet.udayaDegree})`
                    : ""}
                </span>
              `
              : ""
          }

          ${
            !planet.asta && !planet.udaya
              ? `<span>गणना उपलब्ध नहीं</span>`
              : ""
          }

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
    console.warn(
      "Extra Panchang: location/date unavailable."
    );
    return;
  }

  /*
   * Observer अभी module में रखा गया है ताकि आगे
   * location-based Asta/Udaya calculation यहीं हो सके।
   */
  new Observer(
    location.latitude,
    location.longitude,
    location.elevation
  );

  /*
   * Astronomy Engine import भी अभी verify कर रहे हैं।
   * Actual event search अगले चरण में आएगा।
   */
  const testDate = new Date(
    `${selectedDate}T12:00:00+05:30`
  );

  const venus = Elongation(
    "Venus",
    testDate
  );

  console.log(
    "Extra Panchang Venus:",
    venus.ecliptic_separation
  );

  const data = PLANETS.map(getPlanetEvent);

  const newCard = createPlanetCard(data);

  const oldCard =
    document.getElementById("planetRiseSetCard");

  if (oldCard) {
    oldCard.replaceWith(newCard);
    return;
  }

  const result =
    document.getElementById("result");

  if (!result) {
    console.warn(
      "Extra Panchang: #result not found."
    );
    return;
  }

  /*
   * अभी card को result में डाल रहे हैं।
   * अगला छोटा step इसे moonset के तुरंत बाद
   * सही timing-card position में insert करेगा।
   */
  result.appendChild(newCard);
}

function initExtraPanchang() {
  updatePlanetRiseSet();

  const dateInput =
    document.getElementById("dateInput");

  if (dateInput) {
    dateInput.addEventListener(
      "change",
      updatePlanetRiseSet
    );
  }

  window.addEventListener(
    "ohd:locationChanged",
    updatePlanetRiseSet
  );
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initExtraPanchang
  );
} else {
  initExtraPanchang();
}
