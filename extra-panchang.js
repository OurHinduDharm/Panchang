import {
  Elongation,
  Observer
} from "https://esm.sh/astronomy-engine@2.1.19";


/* =========================================
   ग्रह सूची
   ========================================= */

const PLANETS = [
  {
    key: "mercury",
    name: "बुध",
    body: "Mercury"
  },

  {
    key: "venus",
    name: "शुक्र",
    body: "Venus"
  },

  {
    key: "mars",
    name: "मंगल",
    body: "Mars"
  },

  {
    key: "jupiter",
    name: "गुरु",
    body: "Jupiter"
  },

  {
    key: "saturn",
    name: "शनि",
    body: "Saturn"
  }
];


/* =========================================
   Location
   ========================================= */

function getLocation() {

  try {

    const saved =
      localStorage.getItem(
        "ohdPanchangLocation"
      );

    if (!saved) {
      return null;
    }

    const location =
      JSON.parse(saved);

    const lat =
      Number(location.lat);

    const lon =
      Number(location.lon);

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


/* =========================================
   Selected date
   ========================================= */

function getSelectedDate() {

  return (
    document.getElementById(
      "dateInput"
    )?.value || null
  );
}


/* =========================================
   Date formatting
   ========================================= */

function formatEventDate(
  dateString
) {

  if (!dateString) {
    return "—";
  }

  const date =
    new Date(
      `${dateString}T12:00:00+05:30`
    );

  return new Intl.DateTimeFormat(
    "hi-IN",
    {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}


/* =========================================
   Local noon

   Tantrakulam के displayed degree
   values से तुलना के लिए फिलहाल
   local noon पर ecliptic separation
   record किया जाता है।
   ========================================= */

function getLocalNoon(
  dateString
) {

  return new Date(
    `${dateString}T12:00:00+05:30`
  );
}


/* =========================================
   Date helper
   ========================================= */

function addDays(
  dateString,
  days
) {

  const date =
    new Date(
      `${dateString}T12:00:00+05:30`
    );

  date.setDate(
    date.getDate() + days
  );

  return (
    date
      .toLocaleDateString(
        "en-CA",
        {
          timeZone: "Asia/Kolkata"
        }
      )
  );
}


/* =========================================
   Venus daily calculation
   ========================================= */

function getVenusDailyData(
  dateString
) {

  const date =
    getLocalNoon(
      dateString
    );

  const result =
    Elongation(
      "Venus",
      date
    );

  return {

    date: dateString,

    visibility:
      result.visibility,

    elongation:
      Number(
        result.elongation.toFixed(6)
      ),

    eclipticSeparation:
      Number(
        result.ecliptic_separation.toFixed(6)
      )
  };
}


/* =========================================
   Venus motion

   पिछले और अगले दिन की
   ecliptic separation देखकर
   पता लगाएँ कि Venus direct है
   या retrograde.

   यह केवल threshold selection
   के लिए है।
   ========================================= */

function getVenusMotion(
  dateString
) {

  const previousDate =
    addDays(
      dateString,
      -1
    );

  const nextDate =
    addDays(
      dateString,
      1
    );

  const previous =
    getVenusDailyData(
      previousDate
    );

  const current =
    getVenusDailyData(
      dateString
    );

  const next =
    getVenusDailyData(
      nextDate
    );

  /*
   * ecliptic separation conjunction
   * के आसपास घटता-बढ़ता है।
   *
   * यहां actual Venus longitude की जगह
   * separation trend को अभी केवल
   * temporary threshold-selection
   * signal की तरह इस्तेमाल किया गया है।
   */

  if (
    next.eclipticSeparation >
    previous.eclipticSeparation
  ) {

    return "direct";

  }

  if (
    next.eclipticSeparation <
    previous.eclipticSeparation
  ) {

    return "retrograde";
  }

  return "unknown";
}


/* =========================================
   Venus threshold

   Surya-Siddhanta approximate rule:

   Direct Venus:
   10°

   Retrograde Venus:
   8°

   NOTE:
   यह अभी working approximation है।
   Tantrakulam matching के लिए बाद में
   अलग event rule test किया जाएगा।
   ========================================= */

function getVenusThreshold(
  motion
) {

  if (
    motion === "retrograde"
  ) {

    return 8;

  }

  if (
    motion === "direct"
  ) {

    return 10;

  }

  return 10;
}


/* =========================================
   Search Venus Asta

   selected date से लगभग
   180 दिन पीछे तक search.

   Asta:
   evening Venus
   + separation threshold के
   नीचे/बराबर जाना.
   ========================================= */

function findVenusAsta(
  selectedDate
) {

  for (
    let offset = -180;
    offset <= 30;
    offset++
  ) {

    const date =
      addDays(
        selectedDate,
        offset
      );

    const data =
      getVenusDailyData(
        date
      );

    if (
      data.visibility !== "evening"
    ) {
      continue;
    }

    const motion =
      getVenusMotion(
        date
      );

    const threshold =
      getVenusThreshold(
        motion
      );

    if (
      data.eclipticSeparation <=
      threshold
    ) {

      return {
        date: data.date,

        degree:
          data.eclipticSeparation,

        motion,

        threshold
      };
    }
  }

  return null;
}


/* =========================================
   Search Venus Udaya

   selected date से लगभग
   180 दिन पीछे तक search.

   Udaya:
   morning Venus
   + separation threshold के
   ऊपर/बराबर जाना.
   ========================================= */

function findVenusUdaya(
  selectedDate
) {

  for (
    let offset = -30;
    offset <= 180;
    offset++
  ) {

    const date =
      addDays(
        selectedDate,
        offset
      );

    const data =
      getVenusDailyData(
        date
      );

    if (
      data.visibility !== "morning"
    ) {
      continue;
    }

    const motion =
      getVenusMotion(
        date
      );

    const threshold =
      getVenusThreshold(
        motion
      );

    if (
      data.eclipticSeparation >=
      threshold
    ) {

      return {
        date: data.date,

        degree:
          data.eclipticSeparation,

        motion,

        threshold
      };
    }
  }

  return null;
}


/* =========================================
   Venus event

   ========================================= */

function getVenusEvent(
  selectedDate
) {

  const asta =
    findVenusAsta(
      selectedDate
    );

  const udaya =
    findVenusUdaya(
      selectedDate
    );

  return {

    name: "शुक्र",

    asta:
      asta
        ? formatEventDate(
            asta.date
          )
        : null,

    astaDegree:
      asta
        ? `${asta.degree.toFixed(2)}°`
        : null,

    udaya:
      udaya
        ? formatEventDate(
            udaya.date
          )
        : null,

    udayaDegree:
      udaya
        ? `${udaya.degree.toFixed(2)}°`
        : null
  };
}


/* =========================================
   बाकी ग्रह

   अभी dynamic calculation नहीं।
   अगले चरण में आएगा।
   ========================================= */

function getPlanetEvent(
  planet,
  selectedDate
) {

  if (
    planet.key === "venus"
  ) {

    return getVenusEvent(
      selectedDate
    );
  }

  return {

    name:
      planet.name,

    asta:
      null,

    astaDegree:
      null,

    udaya:
      null,

    udayaDegree:
      null
  };
}


/* =========================================
   Card creation
   ========================================= */

function createPlanetCard(
  data
) {

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "card full";

  card.id =
    "planetRiseSetCard";

  card.innerHTML = `
    <h3>🌌 ग्रह उदय-अस्त</h3>

    <div class="planet-rise-set-grid">

      ${data.map(
        planet => `

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

      `
      ).join("")}

    </div>
  `;

  return card;
}


/* =========================================
   Card placement
   ========================================= */

function placePlanetCard(
  newCard
) {

  const result =
    document.getElementById(
      "result"
    );

  if (!result) {

    console.warn(
      "Extra Panchang: #result not found."
    );

    return;
  }

  /*
   * चंद्रास्त वाले section के
   * तुरंत बाद card रखें।
   */

  const cards =
    [...result.children];

  const moonsetCard =
    cards.find(
      card =>
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

    result.appendChild(
      newCard
    );
  }
}


/* =========================================
   Main update
   ========================================= */

function updatePlanetRiseSet() {

  const location =
    getLocation();

  const selectedDate =
    getSelectedDate();

  if (
    !location ||
    !selectedDate
  ) {

    console.warn(
      "Extra Panchang: location/date unavailable."
    );

    return;
  }


  /*
   * Observer अभी future
   * location-dependent calculations
   * के लिए रखा गया है।
   */

  const observer =
    new Observer(
      location.latitude,
      location.longitude,
      location.elevation
    );


  /*
   * Observer currently does not
   * alter Elongation().
   *
   * Keep it here because future
   * rise/set calculations will use it.
   */

  void observer;


  /*
   * सभी ग्रहों का data
   */

  const data =
    PLANETS.map(
      planet =>
        getPlanetEvent(
          planet,
          selectedDate
        )
    );


  /*
   * नया card
   */

  const newCard =
    createPlanetCard(
      data
    );


  /*
   * पुराने card को replace करें।
   */

  const oldCard =
    document.getElementById(
      "planetRiseSetCard"
    );

  if (oldCard) {

    oldCard.replaceWith(
      newCard
    );

    return;
  }


  /*
   * पहली बार card लगाएँ।
   */

  placePlanetCard(
    newCard
  );
}


/* =========================================
   Initialization
   ========================================= */

function initExtraPanchang() {

  updatePlanetRiseSet();


  /*
   * Date change
   */

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
         */

        setTimeout(
          updatePlanetRiseSet,
          100
        );

      }
    );
  }


  /*
   * Location change
   */

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


/* =========================================
   Start
   ========================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initExtraPanchang
  );

} else {

  initExtraPanchang();

}
