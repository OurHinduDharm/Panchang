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

function getLocation() {
  try {
    const saved =
      localStorage.getItem("ohdPanchangLocation");

    if (!saved) return null;

    const location = JSON.parse(saved);

    const lat = Number(location.lat);
    const lon = Number(location.lon);
    const elevation =
      Number(location.elevation) || 0;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lon,
      elevation
    };
  } catch (error) {
    console.error(
      "Extra Panchang location error:",
      error
    );

    return null;
  }
}

function getSelectedDate() {
  return (
    document.getElementById("dateInput")?.value ||
    null
  );
}

/*
 * अभी केवल UI/module verification के लिए
 * शुक्र का verified reference रखा गया है।
 *
 * यह permanent calculation नहीं है।
 */
const VENUS_REFERENCE = {
  asta: {
    date: "2026-10-19",
    degree: "7.76°"
  },

  udaya: {
    date: "2026-10-30",
    degree: "9.70°"
  }
};

function formatEventDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(
    `${dateString}T12:00:00+05:30`
  );

  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getPlanetEvent(planet) {

  /*
   * अभी केवल शुक्र का reference दिखाएँ।
   */
  if (planet.key === "venus") {
    return {
      name: planet.name,

      asta:
        formatEventDate(
          VENUS_REFERENCE.asta.date
        ),

      astaDegree:
        VENUS_REFERENCE.asta.degree,

      udaya:
        formatEventDate(
          VENUS_REFERENCE.udaya.date
        ),

      udayaDegree:
        VENUS_REFERENCE.udaya.degree
    };
  }

  /*
   * बाकी ग्रहों की calculation
   * अगले चरण में आएगी।
   */
  return {
    name: planet.name,
    asta: null,
    astaDegree: null,
    udaya: null,
    udayaDegree: null
  };
}

function createPlanetCard(data) {

  const card =
    document.createElement("div");

  card.className = "card full";
  card.id = "planetRiseSetCard";

  card.innerHTML = `
    <h3>🌌 ग्रह उदय-अस्त</h3>

    <div class="planet-rise-set-grid">

      ${data.map(planet => `

        <div class="planet-rise-set-row">

          <strong>
            ${planet.name}
          </strong>

          ${
            planet.asta
              ? `
                <span>
                  अस्त — ${planet.asta}
                  ${
                    planet.astaDegree
                      ? ` (${planet.astaDegree})`
                      : ""
                  }
                </span>
              `
              : ""
          }

          ${
            planet.udaya
              ? `
                <span>
                  उदय — ${planet.udaya}
                  ${
                    planet.udayaDegree
                      ? ` (${planet.udayaDegree})`
                      : ""
                  }
                </span>
              `
              : ""
          }

          ${
            !planet.asta &&
            !planet.udaya
              ? `
                <span>
                  गणना उपलब्ध नहीं
                </span>
              `
              : ""
          }

        </div>

      `).join("")}

    </div>
  `;

  return card;
}

function placePlanetCard(newCard) {

  const result =
    document.getElementById("result");

  if (!result) {
    console.warn(
      "Extra Panchang: #result not found."
    );

    return;
  }

  /*
   * चंद्रास्त वाले section के तुरंत बाद
   * ग्रह उदय-अस्त card रखें।
   */
  const cards =
    [...result.children];

  const moonsetCard =
    cards.find(card =>
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
     * यदि उस समय चंद्रास्त card
     * उपलब्ध नहीं है तो अंत में रखें।
     */
    result.appendChild(newCard);
  }
}

function updatePlanetRiseSet() {

  const location =
    getLocation();

  const selectedDate =
    getSelectedDate();

  if (!location || !selectedDate) {

    console.warn(
      "Extra Panchang: location/date unavailable."
    );

    return;
  }

  /*
   * Observer अभी केवल future
   * location-based calculation के लिए तैयार है।
   */
  const observer =
    new Observer(
      location.latitude,
      location.longitude,
      location.elevation
    );

  /*
   * Astronomy Engine connection test.
   */
  const testDate =
    new Date(
      `${selectedDate}T12:00:00+05:30`
    );

  try {

    const venus =
      Elongation(
        "Venus",
        testDate
      );

    console.log(
      "Extra Panchang Venus:",
      venus.ecliptic_separation
    );

  } catch (error) {

    console.error(
      "Extra Panchang Venus calculation error:",
      error
    );
  }

  /*
   * फिलहाल verified reference data।
   */
  const data =
    PLANETS.map(getPlanetEvent);

  const newCard =
    createPlanetCard(data);

  const oldCard =
    document.getElementById(
      "planetRiseSetCard"
    );

  if (oldCard) {
    oldCard.replaceWith(newCard);
    return;
  }

  placePlanetCard(newCard);
}

function initExtraPanchang() {

  updatePlanetRiseSet();

  const dateInput =
    document.getElementById(
      "dateInput"
    );

  if (dateInput) {

    dateInput.addEventListener(
      "change",
      () => {

        /*
         * app.js पहले #result को
         * दोबारा render कर सकता है।
         *
         * इसलिए थोड़ा बाद में card लगाएँ।
         */
        setTimeout(
          updatePlanetRiseSet,
          100
        );

      }
    );
  }

  window.addEventListener(
    "ohd:locationChanged",
    () => {

      setTimeout(
        updatePlanetRiseSet,
        100
      );

    }
  );
}

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initExtraPanchang
  );

} else {

  initExtraPanchang();

}
