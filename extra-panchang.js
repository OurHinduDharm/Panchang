import {
  Elongation,
  Observer
} from "https://esm.sh/astronomy-engine@2.1.19";

import {
  getPanchangam
} from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";


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
/* =========================================================
   HORA
   वैदिक होरा — दिन 12 + रात्रि 12
   ========================================================= */

const HORA_PLANETS = [
  {
    key: "sun",
    name: "सूर्य",
    symbol: "☀️"
  },
  {
    key: "venus",
    name: "शुक्र",
    symbol: "♀️"
  },
  {
    key: "mercury",
    name: "बुध",
    symbol: "☿"
  },
  {
    key: "moon",
    name: "चन्द्र",
    symbol: "🌙"
  },
  {
    key: "saturn",
    name: "शनि",
    symbol: "♄"
  },
  {
    key: "jupiter",
    name: "गुरु",
    symbol: "♃"
  },
  {
    key: "mars",
    name: "मंगल",
    symbol: "♂️"
  }
];

/*
 * वारेश
 *
 * 0 = रविवार
 * 1 = सोमवार
 * ...
 * 6 = शनिवार
 */
const HORA_DAY_LORD = {
  0: 0, // सूर्य
  1: 3, // चन्द्र
  2: 6, // मंगल
  3: 2, // बुध
  4: 5, // गुरु
  5: 1, // शुक्र
  6: 4  // शनि
};
function formatHoraTime(date){
  if(!date) return "—";

  return new Intl.DateTimeFormat(
    "hi-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }
  ).format(date);
}

function calculateHoraDetails(
  sunrise,
  sunset,
  nextSunrise,
  selectedDate,
  referenceNow = null
){
  const sunriseTime =
    new Date(sunrise);

  const sunsetTime =
    new Date(sunset);

  const nextSunriseTime =
    new Date(nextSunrise);

  if(
    isNaN(sunriseTime.getTime()) ||
    isNaN(sunsetTime.getTime()) ||
    isNaN(nextSunriseTime.getTime())
  ){
    return {
      available: false,
      horas: [],
      current: null
    };
  }

  const weekday =
    new Date(
      `${selectedDate}T00:00:00`
    ).getDay();

  const firstPlanetIndex =
    HORA_DAY_LORD[weekday];

  const dayHoraMs =
    (
      sunsetTime.getTime() -
      sunriseTime.getTime()
    ) / 12;

  const nightHoraMs =
    (
      nextSunriseTime.getTime() -
      sunsetTime.getTime()
    ) / 12;

  const horas = [];

  /*
   * 12 दिन की Horas
   */
  for(let i = 0; i < 12; i++){

    const startMs =
      sunriseTime.getTime() +
      i * dayHoraMs;

    const endMs =
      sunriseTime.getTime() +
      (i + 1) * dayHoraMs;

    const planetIndex =
      (
        firstPlanetIndex + i
      ) % HORA_PLANETS.length;

    horas.push({
      number: i + 1,
      part: "दिन",
      planet:
        HORA_PLANETS[planetIndex],
      start: new Date(startMs),
      end: new Date(endMs)
    });
  }

  /*
   * 12 रात्रि की Horas
   *
   * Hora planetary cycle दिन की 12वीं
   * Hora के बाद लगातार चलता है।
   */
  for(let i = 0; i < 12; i++){

    const startMs =
      sunsetTime.getTime() +
      i * nightHoraMs;

    const endMs =
      sunsetTime.getTime() +
      (i + 1) * nightHoraMs;

    const planetIndex =
      (
        firstPlanetIndex + 12 + i
      ) % HORA_PLANETS.length;

    horas.push({
      number: i + 13,
      part: "रात्रि",
      planet:
        HORA_PLANETS[planetIndex],
      start: new Date(startMs),
      end: new Date(endMs)
    });
  }

  let current = null;

  if(referenceNow){

    current =
      horas.find(hora =>
        referenceNow >= hora.start &&
        referenceNow < hora.end
      ) || null;
  }

  return {
    available: true,
    horas,
    current
  };
}

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
function createHoraCard(
  horaDetails
){
  const card =
    document.createElement("div");

  card.className =
    "card full";

  card.id =
    "horaCard";

  if(!horaDetails.available){

    card.innerHTML = `
      <div class="label">
        🕐 होरा
      </div>

      <div class="time-row">
        <b>स्थिति</b>
        <span>
          ⚪ होरा गणना उपलब्ध नहीं
        </span>
      </div>
    `;

    return card;
  }

  const current =
    horaDetails.current;

  const currentText =
    current
      ? `
        <div class="time-row">
          <b>🟢 वर्तमान होरा</b>
          <span>
            ${current.planet.symbol}
            <b>${current.planet.name} होरा</b>
            —
            ${formatHoraTime(current.start)}
            से
            ${formatHoraTime(current.end)}
            तक
          </span>
        </div>
      `
      : `
        <div class="time-row">
          <b>🕐 वर्तमान होरा</b>
          <span>
            चयनित तिथि के लिए वर्तमान समय लागू नहीं है।
          </span>
        </div>
      `;

  const rows =
    horaDetails.horas
      .map(hora => {

        const isCurrent =
          current &&
          hora.start.getTime() ===
            current.start.getTime();

        return `
          <div
            class="time-row"
            ${
              isCurrent
                ? 'style="font-weight:700;"'
                : ""
            }
          >
            <b>
              ${
                isCurrent
                  ? "🟢 "
                  : ""
              }
              ${hora.number}.
              ${hora.part}
            </b>

            <span>
              ${hora.planet.symbol}
              <b>
                ${hora.planet.name}
              </b>
              —
              ${formatHoraTime(hora.start)}
              से
              ${formatHoraTime(hora.end)}
              तक
            </span>
          </div>
        `;
      })
      .join("");

  card.innerHTML = `
    <div class="label">
      🕐 होरा
    </div>

    ${currentText}

    <div
      style="
        margin-top:8px;
        margin-bottom:6px;
        font-size:12px;
        font-weight:700;
      "
    >
      📅 चयनित तिथि की 24 होरा
    </div>

    ${rows}

    <div class="yatra-note">
      <b>📌 नोट:</b><br>
      दिन की 12 होरा सूर्योदय से सूर्यास्त तक
      और रात्रि की 12 होरा सूर्यास्त से अगले
      सूर्योदय तक के वास्तविक समय को 12-12
      समान भागों में विभाजित करके निर्धारित की गई हैं।
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
   * =========================================================
   * HORA
   * =========================================================
   */

  const horaDate =
    new Date(
      `${selectedDate}T00:00:00+05:30`
    );

  const horaObserver =
    new Observer(
      location.latitude,
      location.longitude,
      location.elevation
    );

  const pHora =
    getPanchangam(
      horaDate,
      horaObserver,
      {
        timezoneOffset: 330
      }
    );

  const nextHoraDate =
    new Date(horaDate);

  nextHoraDate.setDate(
    nextHoraDate.getDate() + 1
  );

  const nextPHora =
    getPanchangam(
      nextHoraDate,
      horaObserver,
      {
        timezoneOffset: 330
      }
    );

  const today =
    new Date();

  const todayString =
    today.getFullYear() +
    "-" +
    String(
      today.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      today.getDate()
    ).padStart(2, "0");

  const horaReferenceNow =
    selectedDate === todayString
      ? new Date()
      : null;

  const horaDetails =
    calculateHoraDetails(
      pHora.sunrise,
      pHora.sunset,
      nextPHora.sunrise,
      selectedDate,
      horaReferenceNow
    );

  const horaCard =
    createHoraCard(
      horaDetails
    );


  /*
   * =========================================================
   * ग्रह उदय-अस्त
   * =========================================================
   */

  const data =
    PLANETS.map(
      planet =>
        getPlanetEvent(
          planet,
          selectedDate
        )
    );

  const planetCard =
    createPlanetCard(
      data
    );


  /*
   * =========================================================
   * पुराने Extra cards हटाएँ
   * =========================================================
   */

  const oldHoraCard =
    document.getElementById(
      "horaCard"
    );

  if (oldHoraCard) {
    oldHoraCard.remove();
  }

  const oldPlanetCard =
    document.getElementById(
      "planetRiseSetCard"
    );

  if (oldPlanetCard) {
    oldPlanetCard.remove();
  }


  /*
   * =========================================================
   * नए cards लगाएँ
   * =========================================================
   */

  placePlanetCard(
    planetCard
  );

  placeHoraCard(
    horaCard
  );

}
    
function placeHoraCard(
  newCard
) {

  const result =
    document.getElementById(
      "result"
    );

  if (!result) {
    return;
  }

  const planetCard =
    document.getElementById(
      "planetRiseSetCard"
    );

  if (planetCard) {

    planetCard.insertAdjacentElement(
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
   Initialization
   ========================================= */

function initExtraPanchang() {

  /*
   * पहली बार
   */
  updatePlanetRiseSet();


  /*
   * Main Panchang के दोबारा render होने के बाद
   * Extra Panchang भी दोबारा render करें।
   */
  window.addEventListener(
    "ohd:panchangUpdated",
    () => {
      updatePlanetRiseSet();
    }
  );


  /*
   * Location change
   */
  window.addEventListener(
    "ohd:locationChanged",
    () => {
      updatePlanetRiseSet();
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
