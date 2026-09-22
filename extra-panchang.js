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
const VENUS_EVENT_RULE = {
  // शुक्र के Asta/Udaya के लिए प्रारंभिक independent calculation rule
  astaDegree: 8,
  udayaDegree: 10
};

function getVenusEvent(dateString, direction) {
  const location = getLocation();

  if (!location) return null;

  const baseDate = new Date(
    `${dateString}T12:00:00+05:30`
  );

  const observer = new Observer(
    location.latitude,
    location.longitude,
    location.elevation
  );

  /*
   * अगले/पिछले event की खोज।
   *
   * हर दिन 12:00 IST पर Venus की
   * सूर्य से ecliptic separation देखते हैं।
   */
  const target =
    direction === "asta"
      ? VENUS_EVENT_RULE.astaDegree
      : VENUS_EVENT_RULE.udayaDegree;

  const step = direction === "asta" ? -1 : 1;

  let previousDate = new Date(baseDate);
  let previousValue =
    Elongation("Venus", previousDate).ecliptic_separation;

  for (let i = 1; i <= 370; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(
      currentDate.getDate() + step * i
    );

    const currentValue =
      Elongation(
        "Venus",
        currentDate
      ).ecliptic_separation;

    const crossed =
      direction === "asta"
        ? previousValue >= target &&
          currentValue < target
        : previousValue <= target &&
          currentValue > target;

    if (crossed) {
      return {
        date: currentDate,
        degree: currentValue
      };
    }

    previousDate = currentDate;
    previousValue = currentValue;
  }

  return null;
}

function formatEventDateTime(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getPlanetEvent(planet) {
  if (planet.key !== "venus") {
    return {
      name: planet.name,
      asta: null,
      astaDegree: null,
      udaya: null,
      udayaDegree: null
    };
  }

  const selectedDate = getSelectedDate();

  const asta = getVenusEvent(
    selectedDate,
    "asta"
  );

  const udaya = getVenusEvent(
    selectedDate,
    "udaya"
  );

  return {
    name: planet.name,

    asta: asta
      ? formatEventDateTime(asta.date)
      : null,

    astaDegree: asta
      ? `${asta.degree.toFixed(2)}°`
      : null,

    udaya: udaya
      ? formatEventDateTime(udaya.date)
      : null,

    udayaDegree: udaya
      ? `${udaya.degree.toFixed(2)}°`
      : null
  };
}

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
 * चंद्रास्त वाले timing card को खोजकर
 * उसके तुरंत बाद ग्रह उदय-अस्त card रखें।
 */
const cards = [...result.children];

const moonsetCard = cards.find(card =>
  /चंद्रास्त|चन्द्रास्त|moonset/i.test(
    card.textContent || ""
  )
);

if (moonsetCard) {
  moonsetCard.insertAdjacentElement(
    "afterend",
    newCard
  );
} else {
  /*
   * अगर चंद्रास्त card अभी render नहीं हुआ,
   * तो फिलहाल अंत में रखें।
   */
  result.appendChild(newCard);
}
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
