// Load the independent classical-yoga engine here so Blogger, GitHub Pages,
// and CDN consumers do not need a separate script tag.
import "./classical-yogas.js";

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

    /*
     * सामान्य स्थिति:
     * selected date के sunrise → next sunrise
     */
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
   Planetary elongation — preliminary
   शास्त्रीय कोणीय सीमा के आधार पर दिन-स्तर
   की प्रारंभिक घटना-तिथि। यह स्थानीय दृश्यता
   या Drik के प्रकाशित समय की पुनर्रचना नहीं है।
   ========================================= */

const PLANET_ASTA_THRESHOLDS = {
  Mercury: 14,
  Venus: 10,
  Mars: 17,
  Jupiter: 11,
  Saturn: 15
};

const planetDailyCache = new Map();

function getPlanetDailyData(body, dateString) {
  const cacheKey = body + "|" + dateString;
  if (planetDailyCache.has(cacheKey)) {
    return planetDailyCache.get(cacheKey);
  }

  const result = Elongation(body, getLocalNoon(dateString));
  const data = {
    date: dateString,
    eclipticSeparation: Number(result.ecliptic_separation)
  };

  planetDailyCache.set(cacheKey, data);
  return data;
}

function findNearestAngularBoundary(body, selectedDate, threshold, eventType) {
  const selected = getPlanetDailyData(body, selectedDate);
  if (!Number.isFinite(selected.eclipticSeparation)) return null;

  // दिन-स्तर पर अधिकतम 400 दिन आगे/पीछे खोजें।
  for (let offset = 1; offset <= 400; offset++) {
    const pastDate = addDays(selectedDate, -offset);
    const pastNextDate = addDays(selectedDate, -offset + 1);
    const futurePrevDate = addDays(selectedDate, offset - 1);
    const futureDate = addDays(selectedDate, offset);

    const pastA = getPlanetDailyData(body, pastDate);
    const pastB = getPlanetDailyData(body, pastNextDate);
    const futureA = getPlanetDailyData(body, futurePrevDate);
    const futureB = getPlanetDailyData(body, futureDate);

    const crossedDown = (a, b) =>
      a.eclipticSeparation > threshold &&
      b.eclipticSeparation <= threshold;

    const crossedUp = (a, b) =>
      a.eclipticSeparation <= threshold &&
      b.eclipticSeparation > threshold;

    const matches = eventType === "asta" ? crossedDown : crossedUp;

    // बराबर दूरी पर पिछले दिन की सीमा को प्राथमिकता दें।
    if (matches(pastA, pastB)) {
      return {
        date: pastB.date,
        degree: pastB.eclipticSeparation,
        threshold,
        direction: "past"
      };
    }

    if (matches(futureA, futureB)) {
      return {
        date: futureB.date,
        degree: futureB.eclipticSeparation,
        threshold,
        direction: "future"
      };
    }
  }

  return null;
}

function getPlanetEvent(planet, selectedDate) {
  const threshold = PLANET_ASTA_THRESHOLDS[planet.body];

  if (!Number.isFinite(threshold)) {
    return {
      name: planet.name,
      asta: null,
      astaDegree: null,
      udaya: null,
      udayaDegree: null,
      verificationPending: true
    };
  }

  try {
    const asta = findNearestAngularBoundary(
      planet.body, selectedDate, threshold, "asta"
    );
    const udaya = findNearestAngularBoundary(
      planet.body, selectedDate, threshold, "udaya"
    );

    return {
      name: planet.name,
      asta: asta ? formatEventDate(asta.date) : null,
      astaDegree: asta ? `${asta.threshold}° सीमा` : null,
      udaya: udaya ? formatEventDate(udaya.date) : null,
      udayaDegree: udaya ? `${udaya.threshold}° सीमा` : null,
      verificationPending: true
    };
  } catch (error) {
    console.warn("Planetary angular-boundary estimate failed:", planet.body, error);
    return {
      name: planet.name,
      asta: null,
      astaDegree: null,
      udaya: null,
      udayaDegree: null,
      verificationPending: true
    };
  }
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

    <p class="planet-rise-set-note">
      शास्त्रीय कोणीय सीमाओं (बुध 14°, शुक्र 10°, मंगल 17°, गुरु 11°, शनि 15°) पर आधारित प्रारंभिक अनुमान।
      तिथियाँ दिन-स्तर पर हैं; ये स्थानीय दृश्यता या Drik के प्रकाशित समय नहीं हैं।
    </p>

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
                  अस्त (अनुमान) — ${planet.asta}
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
                  उदय (अनुमान) — ${planet.udaya}
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

  /*
   * =========================================
   * वर्तमान होरा
   *
   * यह details के बाहर रहेगा।
   * इसलिए पूरा chart collapsed होने पर भी
   * वर्तमान होरा हमेशा दिखाई देगा।
   * =========================================
   */

  const currentText =
    current
      ? `
        <div style="
          margin:0 0 8px 0;
          padding:8px 10px;
          border-radius:7px;
          background:rgba(76,175,80,0.09);
          border:1px solid rgba(76,175,80,0.28);
        ">

          <div class="time-row" style="
            margin:0;
            font-weight:600;
          ">

            <b>
              🟢 वर्तमान होरा
            </b>

            <span>
              ${current.planet.symbol}
              <b>
                ${current.planet.name} होरा
              </b>
              —
              ${formatHoraTime(current.start)}
              से
              ${formatHoraTime(current.end)}
              तक
            </span>

          </div>

        </div>
      `
      : `
        <div style="
          margin:0 0 8px 0;
          padding:6px 9px;
          border-radius:6px;
          background:rgba(128,128,128,0.045);
          color:#777;
          font-size:11px;
        ">
          🕐 चयनित तिथि के लिए वर्तमान समय लागू नहीं है।
        </div>
      `;


  /*
   * =========================================
   * पूरी 24 होरा
   * =========================================
   */

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
                ? `
                  style="
                    font-weight:700;
                    border-radius:6px;
                  "
                `
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


  /*
   * =========================================
   * दिन / रात की heading
   * =========================================
   */

  const dayRows =
    horaDetails.horas
      .filter(
        hora => hora.part === "दिन"
      )
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
                ? `
                  style="
                    font-weight:700;
                    border-radius:6px;
                  "
                `
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


  const nightRows =
    horaDetails.horas
      .filter(
        hora => hora.part === "रात्रि"
      )
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
                ? `
                  style="
                    font-weight:700;
                    border-radius:6px;
                  "
                `
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


  /*
   * =========================================
   * Card
   *
   * वर्तमान होरा बाहर
   * बाकी chart details में collapsed
   * =========================================
   */

  card.innerHTML = `

<div class="label">
  🕐 होरा
</div>

<div style="
  margin:2px 0 8px;
  font-size:11px;
  color:#777;
">
  ℹ️ होरा क्या है?
  <a
    href="https://ourhindudharm.blogspot.com/2026/10/about-hora-chakra-what-is-hora-in-astrology.html"
    target="_blank"
    rel="noopener noreferrer"
    style="
      color:inherit;
      text-decoration:underline;
    "
  >
    संक्षेप में जानें
  </a>
</div>

${currentText}

    <details>

      <summary style="
        cursor:pointer;
        font-weight:700;
        list-style-position:inside;
      ">

        📅 चयनित तिथि की 24 होरा

        <span style="
          float:right;
          font-size:11px;
          font-weight:400;
          color:#777;
        ">
          विस्तार करें
        </span>

      </summary>


      <div style="
        margin-top:10px;
      ">

        <div style="
          margin:4px 0 6px;
          font-size:12px;
          font-weight:700;
        ">
          🌞 दिन की 12 होरा
        </div>

        ${dayRows}


        <div style="
          margin:12px 0 6px;
          font-size:12px;
          font-weight:700;
        ">
          🌙 रात्रि की 12 होरा
        </div>

        ${nightRows}

      </div>

    </details>


<div class="yatra-note">
  <b>📌 नोट:</b>
  रात्रि की होरा सूर्यास्त से अगले सूर्योदय तक रहती हैं; मध्यरात्रि के बाद का समय अगले दिन की तारीख में आता है।
</div>

  `;

  return card;
}

/* =========================================
   Card placement
   ========================================= */

function getPanchangResultsGrid() {
  return document.querySelector("#result > .grid");
}

/*
 * सभी कार्ड एक ही परिणाम-ग्रिड में रहें।
 * अंतिम क्रम normalizePanchangCardOrder() तय करता है,
 * ताकि अलग-अलग मॉड्यूल के render timing से क्रम न बिगड़े।
 */
function placePlanetCard(newCard) {
  const grid = getPanchangResultsGrid();
  if (!grid) return;
  grid.appendChild(newCard);
}

function placeHoraCard(newCard) {
  const grid = getPanchangResultsGrid();
  if (!grid) return;
  grid.appendChild(newCard);
}

function placeClassicalYogaCard(newCard) {
  const grid = getPanchangResultsGrid();
  if (!grid) return;
  grid.appendChild(newCard);
}

function getPanchangCardOrder(card) {
  const id = card.id || "";
  const content = (card.textContent || "").replace(/\s+/g, " ").trim();

  if (id === "classicalYogasCard") return 3;
  if (id === "planetRiseSetCard") return 11;
  if (id === "horaCard") return 8;
  if (/📍\s*स्थान/.test(content)) return 0;
  if (/सूर्योदय|सूर्यास्त|चंद्रोदय|चन्द्रोदय|चंद्रास्त|चन्द्रास्त/.test(content)) return 1;
  if (/शुभ-अशुभ समय/.test(content)) return 4;
  if (/ब्रह्म मुहूर्त|प्रातः संध्या|विजय मुहूर्त|गोधूलि मुहूर्त|सायं संध्या|निशीथ काल|दुर्मुहूर्त/.test(content)) return 5;
  if (/यात्रा शूल विचार|दिशाशूल|कालशूल/.test(content)) return 6;
  if (/चौघड़िया|चौघडिया|गौरी काल|गौरी/.test(content)) return 7;
  if (/चयनित तिथि के प्रहर/.test(content)) return 9;
  if (/भद्रा|घटी|पल/.test(content)) return 9.5;
  if (/संकल्प/.test(content)) return 10;
  // विक्रम संवत्, मास, पक्ष, तिथि, वार आदि मुख्य पंचांग।
  return 2;
}

function normalizePanchangCardOrder() {
  const grid = getPanchangResultsGrid();
  if (!grid) return;

  const children = [...grid.children];
  children
    .map((element, index) => ({
      element,
      index,
      order: getPanchangCardOrder(element)
    }))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .forEach(item => grid.appendChild(item.element));
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

const now =
  new Date();

const indiaDateParts =
  new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).formatToParts(now);

const indiaYear =
  indiaDateParts.find(
    part => part.type === "year"
  )?.value;

const indiaMonth =
  indiaDateParts.find(
    part => part.type === "month"
  )?.value;

const indiaDay =
  indiaDateParts.find(
    part => part.type === "day"
  )?.value;

const indiaToday =
  `${indiaYear}-${indiaMonth}-${indiaDay}`;

 const horaReferenceNow =
  selectedDate === indiaToday
    ? now
    : null;

let horaDetails = calculateHoraDetails(
  pHora.sunrise,
  pHora.sunset,
  nextPHora.sunrise,
  selectedDate,
  horaReferenceNow
);

/*
 * =========================================================
 * CURRENT HORA — MIDNIGHT AWARE
 *
 * यदि अभी today's sunrise से पहले है,
 * तो वर्तमान समय previous Panchang day की
 * रात्रि की Horā में है।
 *
 * UI की 24-Hora list selected date की ही रहेगी।
 * केवल CURRENT Horā previous astronomical day
 * से resolve होगी।
 * =========================================================
 */

if(
  horaReferenceNow &&
  horaReferenceNow < new Date(pHora.sunrise)
){

  try{

    const previousDateObj =
      new Date(
        `${selectedDate}T12:00:00`
      );

    previousDateObj.setDate(
      previousDateObj.getDate() - 1
    );

    const previousSelectedDate =
      previousDateObj.getFullYear() +
      "-" +
      String(
        previousDateObj.getMonth() + 1
      ).padStart(2,"0") +
      "-" +
      String(
        previousDateObj.getDate()
      ).padStart(2,"0");

    const previousPanchang =
      getPanchangam(
        previousDateObj,
        horaObserver,
        { timezoneOffset:330 }
      );

    const previousHoraDetails =
      calculateHoraDetails(
        previousPanchang.sunrise,
        previousPanchang.sunset,
        pHora.sunrise,
        previousSelectedDate,
        horaReferenceNow
      );

    /*
     * Selected date की 24-Hora list preserve रहेगी।
     * केवल current को previous night से लिया जाएगा।
     */
    horaDetails.current =
      previousHoraDetails.current || null;

  }catch(e){

    console.warn(
      "Previous-day current Hora calculation failed:",
      e
    );

    horaDetails.current =
      null;
  }
}

  const horaCard =
    createHoraCard(
      horaDetails
    );

  const classicalYogaDetails =
    getClassicalYogaDetails(
      selectedDate,
      location,
      horaObserver
    );

  const classicalYogaCard =
    createClassicalYogaCard(
      classicalYogaDetails
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

  const oldClassicalYogaCard =
    document.getElementById(
      "classicalYogasCard"
    );

  if (oldClassicalYogaCard) {
    oldClassicalYogaCard.remove();
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

  placeClassicalYogaCard(
    classicalYogaCard
  );

  normalizePanchangCardOrder();

}
    
function nextSelectedDate(isoDate) {
  const match = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

let classicalYogaCacheKey = null;
let classicalYogaCacheDetails = null;

function getClassicalYogaDetails(selectedDate, location, observer) {
  const engine = window.OHDPanchangClassicalYogas;

  if (
    !engine ||
    typeof engine.getClassicalYogas !== "function" ||
    typeof engine.buildSunNakshatraSegments !== "function"
  ) {
    return {
      available: false,
      error: "शास्त्रीय योग गणना मॉड्यूल उपलब्ध नहीं है।",
      yogas: []
    };
  }

  const cacheKey = [
    selectedDate,
    location.latitude,
    location.longitude,
    location.elevation
  ].join("|");

  if (cacheKey === classicalYogaCacheKey && classicalYogaCacheDetails) {
    return classicalYogaCacheDetails;
  }

  try {
    const nextDate = nextSelectedDate(selectedDate);
    if (!nextDate) {
      return { available: false, error: "चयनित तिथि अमान्य है।", yogas: [] };
    }

    const p = getPanchangam(
      new Date(`${selectedDate}T12:00:00+05:30`),
      observer,
      { timezoneOffset: 330 }
    );

    const nextP = getPanchangam(
      new Date(`${nextDate}T12:00:00+05:30`),
      observer,
      { timezoneOffset: 330 }
    );

    if (!p?.sunrise || !nextP?.sunrise) {
      return {
        available: false,
        error: "सूर्योदय का समय उपलब्ध नहीं है।",
        yogas: []
      };
    }

    const sunSegments = engine.buildSunNakshatraSegments(
      p.sunrise,
      nextP.sunrise,
      instant => {
        const snapshot = getPanchangam(
          new Date(instant),
          observer,
          { timezoneOffset: 330 }
        );
        const longitude = snapshot?.planetaryPositions?.sun?.longitude;
        return Number.isFinite(longitude) ? longitude : null;
      }
    );

    const details = engine.getClassicalYogas(p, {
      selectedDate,
      nextSunrise: nextP.sunrise,
      sunSegments
    });

    // If Sun-segment calculation itself failed, don't misreport Ravi Yoga
    // as absent; Amrit/Sarvartha can still be reported from Moon intervals.
    details.raviCalculationAvailable =
      Array.isArray(sunSegments) && sunSegments.length > 0;

    if (details?.available) {
      classicalYogaCacheKey = cacheKey;
      classicalYogaCacheDetails = details;
    }

    return details;
  } catch (error) {
    console.error("Classical yoga calculation failed:", error);
    return {
      available: false,
      error: "शास्त्रीय योगों की गणना नहीं हो सकी।",
      yogas: []
    };
  }
}

function formatClassicalYogaDateTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";

  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function formatClassicalYogaIntervals(details, name) {
  if (!details?.available) return "गणना उपलब्ध नहीं";
  if (name === "रवि योग" && details.raviCalculationAvailable === false) {
    return "गणना उपलब्ध नहीं";
  }

  const yoga = (details.yogas || []).find(item => item.name === name);
  if (!yoga) return "गणना उपलब्ध नहीं";
  if (!Array.isArray(yoga.intervals) || yoga.intervals.length === 0) return "नहीं है";

  return yoga.intervals.map(interval =>
    `${formatClassicalYogaDateTime(interval.start)} से ${formatClassicalYogaDateTime(interval.end)} तक`
  ).join("<br>");
}

function createClassicalYogaCard(details) {
  const card = document.createElement("div");
  card.className = "card full";
  card.id = "classicalYogasCard";

  const primaryNames = [
    "अमृत सिद्धि योग",
    "सर्वार्थ सिद्धि योग",
    "रवि योग",
    "रवि पुष्य योग",
    "गुरु पुष्य योग",
    "द्विपुष्कर योग",
    "त्रिपुष्कर योग"
  ];

  const anandadiRows = details?.available
    ? (details.anandadi || [])
        .filter(item => Array.isArray(item.intervals) && item.intervals.length > 0)
        .map(item => `
          <div class="time-row">
            <b>${item.name}</b>
            <span>${item.intervals.map(interval =>
              `${formatClassicalYogaDateTime(interval.start)} से ${formatClassicalYogaDateTime(interval.end)} तक`
            ).join("<br>")}</span>
          </div>
        `)
        .join("")
    : `<div class="time-row"><b>आनन्दादि योग</b><span>${details?.error || "गणना उपलब्ध नहीं"}</span></div>`;

  const otherYogaRows = details?.available
    ? (details.yogas || [])
        .filter(item => !primaryNames.includes(item.name))
        .map(item => `
          <div class="time-row">
            <b>${item.name}</b>
            <span>${formatClassicalYogaIntervals(details, item.name)}</span>
          </div>
        `)
        .join("")
    : `<div class="time-row"><span>${details?.error || "गणना उपलब्ध नहीं"}</span></div>`;

  card.innerHTML = `
    <div class="label">🌟 विशेष शुभ योग 🌟</div>
    <div class="time-row">
      <b>अमृत सिद्धि योग</b>
      <span>${formatClassicalYogaIntervals(details, "अमृत सिद्धि योग")}</span>
    </div>
    <div class="time-row">
      <b>सर्वार्थ सिद्धि योग</b>
      <span>${formatClassicalYogaIntervals(details, "सर्वार्थ सिद्धि योग")}</span>
    </div>
    <div class="time-row">
      <b>रवि योग</b>
      <span>${formatClassicalYogaIntervals(details, "रवि योग")}</span>
    </div>
    <div class="time-row">
      <b>रवि पुष्य योग</b>
      <span>${formatClassicalYogaIntervals(details, "रवि पुष्य योग")}</span>
    </div>
    <div class="time-row">
      <b>गुरु पुष्य योग</b>
      <span>${formatClassicalYogaIntervals(details, "गुरु पुष्य योग")}</span>
    </div>
    <div class="time-row">
      <b>द्विपुष्कर योग</b>
      <span>${formatClassicalYogaIntervals(details, "द्विपुष्कर योग")}</span>
    </div>
    <div class="time-row">
      <b>त्रिपुष्कर योग</b>
      <span>${formatClassicalYogaIntervals(details, "त्रिपुष्कर योग")}</span>
    </div>
    <div class="label" style="margin-top:10px;">🌼 आनन्दादि योग</div>
    ${anandadiRows || '<div class="time-row"><span>इस दिन आनन्दादि योग का अंतराल उपलब्ध नहीं है।</span></div>'}
    <details class="classical-yoga-details">
      <summary>अन्य शास्त्रीय योग (शुभ-अशुभ)</summary>
      ${otherYogaRows}
    </details>
    <div class="yatra-note">
      स्रोत: मुहूर्त्तचिन्तामणि — दैवज्ञ राम। योगों का समय चयनित स्थानीय सूर्योदय से अगले सूर्योदय तक सीमित है।
    </div>
  `;

  return card;
}

/* =========================================
   Initialization
   ========================================= */

function initExtraPanchang() {

  updatePlanetRiseSet();

  window.addEventListener(
    "ohd:panchangUpdated",
    () => {
      updatePlanetRiseSet();
    }
  );

  window.addEventListener(
    "ohd:locationChanged",
    () => {
      updatePlanetRiseSet();
    }
  );

  setInterval(
    () => {

      const selectedDate =
        getSelectedDate();

      if (!selectedDate) {
        return;
      }

      const now =
        new Date();

      const indiaToday =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone: "Asia/Kolkata"
          }
        ).format(now);

      if (
        selectedDate === indiaToday
      ) {
        updatePlanetRiseSet();
      }

    },
    30000
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
