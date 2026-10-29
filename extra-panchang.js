// Load the independent classical-yoga engine here so Blogger, GitHub Pages,
// and CDN consumers do not need a separate script tag.
import "./ads-layout-print-safety.js";
import "./classical-yogas.js";
import "./festivals.js";
import { calculateNivasa, normalizeTithiIndex } from "./nivas.js";

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

/* समय केवल कोणीय-सीमा पार करने का अनुमान है; यह स्थानीय दृश्यता का समय नहीं है। */
function formatEventDateTime(instant) {
  if (!(instant instanceof Date) || !Number.isFinite(instant.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(instant);
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
   Planetary elongation — preliminary display only
   आधुनिक apparent angular-separation threshold से
   दिन-स्तर का अनुमान। यह शास्त्रीय Chapter IX के
   lagnāntara K/C परिणाम या स्थानीय दृश्यता नहीं है।
   Thresholds are provisional; do not label as classical.
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

function findThresholdCrossingInstant(body, startDateString, endDateString, threshold, eventType) {
  let low = new Date(`${startDateString}T12:00:00+05:30`).getTime();
  let high = new Date(`${endDateString}T12:00:00+05:30`).getTime();
  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) return null;

  const isPastThreshold = value =>
    eventType === "asta" ? value <= threshold : value > threshold;

  // Daily scan locates the crossing; bisection refines it to about one minute.
  for (let i = 0; i < 18 && high - low > 60_000; i++) {
    const middle = (low + high) / 2;
    const result = Elongation(body, new Date(middle));
    const separation = Number(result.ecliptic_separation);
    if (!Number.isFinite(separation)) return null;

    if (isPastThreshold(separation)) high = middle;
    else low = middle;
  }

  return new Date((low + high) / 2);
}

function findNearestAngularBoundaries(body, selectedDate, threshold) {
  const selected = getPlanetDailyData(body, selectedDate);
  if (!Number.isFinite(selected.eclipticSeparation)) {
    return { asta: null, udaya: null };
  }

  let asta = null;
  let udaya = null;

  const crossedDown = (a, b) =>
    a.eclipticSeparation > threshold &&
    b.eclipticSeparation <= threshold;

  const crossedUp = (a, b) =>
    a.eclipticSeparation <= threshold &&
    b.eclipticSeparation > threshold;

  const refine = (a, b, eventType, direction) => ({
    date: b.date,
    instant: findThresholdCrossingInstant(
      body, a.date, b.date, threshold, eventType
    ),
    degree: b.eclipticSeparation,
    threshold,
    direction
  });

  // Keep the legacy search order: at each distance, check past before future.
  // Both boundaries share the same daily scan; thresholds and refinement stay unchanged.
  for (let offset = 1; offset <= 400 && (!asta || !udaya); offset++) {
    const pastDate = addDays(selectedDate, -offset);
    const pastNextDate = addDays(selectedDate, -offset + 1);
    const futurePrevDate = addDays(selectedDate, offset - 1);
    const futureDate = addDays(selectedDate, offset);

    const pastA = getPlanetDailyData(body, pastDate);
    const pastB = getPlanetDailyData(body, pastNextDate);
    const futureA = getPlanetDailyData(body, futurePrevDate);
    const futureB = getPlanetDailyData(body, futureDate);

    if (!asta) {
      if (crossedDown(pastA, pastB)) {
        asta = refine(pastA, pastB, "asta", "past");
      } else if (crossedDown(futureA, futureB)) {
        asta = refine(futureA, futureB, "asta", "future");
      }
    }

    if (!udaya) {
      if (crossedUp(pastA, pastB)) {
        udaya = refine(pastA, pastB, "udaya", "past");
      } else if (crossedUp(futureA, futureB)) {
        udaya = refine(futureA, futureB, "udaya", "future");
      }
    }
  }

  return { asta, udaya };
}

// A previously calculated pair of nearest boundaries remains valid while
// the selected local-noon instant stays strictly between those boundaries.
// This avoids repeating hundreds of ephemeris evaluations when readers move
// between nearby dates that are still inside the same angular-threshold interval.
const planetEventBracketCache = new Map();

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

  const selectedNoon = new Date(
    `${selectedDate}T12:00:00+05:30`
  ).getTime();

  const cachedBrackets = planetEventBracketCache.get(planet.body) || [];
  const cached = cachedBrackets.find(entry =>
    Number.isFinite(selectedNoon) &&
    entry.startMs < selectedNoon &&
    selectedNoon < entry.endMs
  );

  if (cached) {
    return { ...cached.result, name: planet.name };
  }

  try {
    const boundaries = findNearestAngularBoundaries(
      planet.body, selectedDate, threshold
    );
    const asta = boundaries.asta;
    const udaya = boundaries.udaya;

    const result = {
      name: planet.name,
      asta: asta ? formatEventDateTime(asta.instant) : null,
      astaDegree: asta ? `${asta.threshold}° कोणीय सीमा` : null,
      udaya: udaya ? formatEventDateTime(udaya.instant) : null,
      udayaDegree: udaya ? `${udaya.threshold}° कोणीय सीमा` : null,
      verificationPending: true
    };

    const astaMs = asta?.instant instanceof Date ? asta.instant.getTime() : NaN;
    const udayaMs = udaya?.instant instanceof Date ? udaya.instant.getTime() : NaN;

    // Cache only when both independently found boundaries enclose the selected
    // noon. If either boundary is missing or the pair does not enclose noon,
    // recompute on the next date rather than risk reusing a stale estimate.
    if (
      Number.isFinite(selectedNoon) &&
      Number.isFinite(astaMs) &&
      Number.isFinite(udayaMs) &&
      Math.min(astaMs, udayaMs) < selectedNoon &&
      selectedNoon < Math.max(astaMs, udayaMs)
    ) {
      const entries = planetEventBracketCache.get(planet.body) || [];
      entries.unshift({
        startMs: Math.min(astaMs, udayaMs),
        endMs: Math.max(astaMs, udayaMs),
        result
      });
      // Bound memory use; recent date intervals are most likely to be reused.
      planetEventBracketCache.set(planet.body, entries.slice(0, 12));
    }

    return result;
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
  const card = document.createElement("div");
  card.className = "card full";
  card.id = "planetRiseSetCard";

  card.innerHTML = `
    <h3>🌌 ग्रह उदय-अस्त</h3>

    <p class="planet-rise-set-note" style="margin:8px 0 14px;padding:10px 12px;border-left:3px solid #b7791f;background:rgba(183,121,31,.08);font-size:.92em;line-height:1.5">
      नीचे दी गई तिथियाँ आधुनिक सूर्य–ग्रह कोणीय दूरी की प्रारंभिक, दिन-स्तरीय गणना हैं।
      प्रत्येक सीमा-पार समय को उस दिन-स्तरीय अंतराल के भीतर लगभग एक मिनट तक परिशोधित किया जाता है।
      यह सूर्यसिद्धान्त अध्याय ९ की लम्बान्तर-आसु (K/C) गणना, प्रमाणित शास्त्रीय तिथि,
      या स्थानीय आँखों से दृश्यता का दावा नहीं है। प्रयुक्त कोणीय सीमाएँ भी सत्यापनाधीन हैं।
    </p>

    <div class="planet-rise-set-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
      ${data.map(planet => `
        <div class="planet-rise-set-row" style="display:grid;gap:7px;padding:12px;border:1px solid var(--border-color,#d8dce2);border-radius:8px">
          <strong style="font-size:1.02em">${planet.name}</strong>

          ${planet.asta
            ? `<span style="display:block">कोणीय अनुमानित अस्त — ${planet.asta}${planet.astaDegree ? ` (${planet.astaDegree})` : ""}</span>`
            : `<span style="display:block">कोणीय अस्त-अनुमान उपलब्ध नहीं</span>`
          }

          ${planet.udaya
            ? `<span style="display:block">कोणीय अनुमानित उदय — ${planet.udaya}${planet.udayaDegree ? ` (${planet.udayaDegree})` : ""}</span>`
            : `<span style="display:block">कोणीय उदय-अनुमान उपलब्ध नहीं</span>`
          }

          <span style="display:block;font-size:.9em;color:#8a5a00">शास्त्रीय K/C गणना — सत्यापनाधीन</span>
        </div>
      `).join("")}
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
   Agnivasa & Shivavasa
   Daily convention: tithi at local sunrise.
   Tithi index from the library is 0–29; formulas use 1–30.
   ========================================= */

function createNivasCard(tithiIndex, selectedDate) {
  const card = document.createElement("section");
  card.className = "card full";
  card.id = "nivasCard";

  // Use the selected Indian calendar date, independent of device timezone.
  const weekdayIndex = new Date(`${selectedDate}T00:00:00Z`).getUTCDay();
  const normalizedTithiIndex = normalizeTithiIndex(tithiIndex);
  const result = normalizedTithiIndex === null
    ? null
    : calculateNivasa(normalizedTithiIndex, weekdayIndex);

  if (!result) {
    card.innerHTML = `
      <div class="label">🔥 अग्निवास एवं 🔱 शिववास</div>
      <div class="value">गणना उपलब्ध नहीं।</div>
    `;
    return card;
  }

  card.innerHTML = `
    <div class="label">🔥 अग्निवास एवं 🔱 शिववास</div>
    <div class="time-row">
      <b>अग्निवास</b>
      <span>${result.agni.name} — ${result.agni.note}</span>
    </div>
    <div class="time-row">
      <b>शिववास</b>
      <span>${result.shiva.name} — ${result.shiva.note}</span>
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
  if (!grid || !newCard) return;
  grid.appendChild(newCard);
}

function getPanchangCardOrder(card) {
  const id = card.id || "";
  const content = (card.textContent || "").replace(/\s+/g, " ").trim();

  if (id === "ohdHinduFestivalsCard") return 2.5;
  if (id === "nivasCard") return 2.8;
  if (id === "classicalYogasCard") return 3;
  if (id === "planetRiseSetCard") return 11;
  if (id === "horaCard") return 8;
  if (/📍\s*स्थान/.test(content)) return 0;
  if (/सूर्योदय|सूर्यास्त|चंद्रोदय|चन्द्रोदय|चंद्रास्त|चन्द्रास्त/.test(content)) return 1;
  if (/शुभ-अशुभ समय/.test(content)) return 4;
  if (/ब्रह्म मुहूर्त|प्रातः संध्या|मध्याह्न संध्या|विजय मुहूर्त|गोधूलि मुहूर्त|सायं संध्या|निशीथ काल|दुर्मुहूर्त/.test(content)) return 5;
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

  const current = [...grid.children];
  const sorted = current
    .map((element, index) => ({
      element,
      index,
      order: getPanchangCardOrder(element)
    }))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map(item => item.element);

  // Avoid moving every existing card on each refresh. Move only cards that
  // are actually out of position; repeated appendChild() calls can disturb
  // browser scroll anchoring on long, disclosure-heavy pages.
  sorted.forEach((element, index) => {
    if (grid.children[index] !== element) {
      grid.insertBefore(element, grid.children[index] || null);
    }
  });
}

function replaceOrPlacePanchangCard(id, newCard) {
  const oldCard = document.getElementById(id);

  if (!newCard) {
    if (oldCard) oldCard.remove();
    return;
  }

  if (oldCard) {
    oldCard.replaceWith(newCard);
    return;
  }

  const grid = getPanchangResultsGrid();
  if (grid) grid.appendChild(newCard);
}

function capturePanchangDisclosureState() {
  const state = {};

  ["horaCard", "classicalYogasCard"].forEach(id => {
    const card = document.getElementById(id);
    if (!card) return;

    state[id] = Array.from(card.querySelectorAll("details"))
      .map(detail => Boolean(detail.open));
  });

  return state;
}

function restorePanchangDisclosureState(state) {
  Object.keys(state || {}).forEach(id => {
    const card = document.getElementById(id);
    if (!card) return;

    const details = card.querySelectorAll("details");
    (state[id] || []).forEach((wasOpen, index) => {
      if (details[index]) details[index].open = wasOpen;
    });
  });
}

/* =========================================
   Main update
   ========================================= */

function updatePlanetRiseSet() {
  const __ohdPerfEnabled = new URLSearchParams(window.location.search).get("perf") === "1";
  const __ohdPerfStart = performance.now();
  let __ohdPerfLast = __ohdPerfStart;
  const __ohdPerfPhases = [];
  const __ohdPerfMark = label => {
    if (!__ohdPerfEnabled) return;
    const now = performance.now();
    __ohdPerfPhases.push({
      phase: label,
      milliseconds: Number((now - __ohdPerfLast).toFixed(2))
    });
    __ohdPerfLast = now;
  };

  // Preserve reader-opened sections when the cards are refreshed.
  const disclosureState = capturePanchangDisclosureState();

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
  __ohdPerfMark("hora calculations and card");

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
  __ohdPerfMark("classical yoga calculation and card");

  // Nivasa is determined from the tithi prevailing at local sunrise,
  // not from the selected date's midnight input instant.
  const sunrisePanchang = pHora.sunrise
    ? getPanchangam(new Date(pHora.sunrise), horaObserver, { timezoneOffset: 330 })
    : null;
  const nivasCard = createNivasCard(sunrisePanchang?.tithi, selectedDate);
  __ohdPerfMark("Nivasa calculation and card");


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
  __ohdPerfMark("planet rise/set calculation and card");


  /*
   * =========================================================
   * Cards को उनकी मौजूदा grid position पर replace करें।
   * इससे refresh के दौरान सभी cards को हटाकर दोबारा जोड़ने
   * और पूरे grid को अनावश्यक रूप से हिलाने से बचा जाता है।
   * =========================================================
   */

  replaceOrPlacePanchangCard("planetRiseSetCard", planetCard);
  replaceOrPlacePanchangCard("horaCard", horaCard);
  replaceOrPlacePanchangCard("classicalYogasCard", classicalYogaCard);
  replaceOrPlacePanchangCard("nivasCard", nivasCard);

  normalizePanchangCardOrder();
  restorePanchangDisclosureState(disclosureState);
  __ohdPerfMark("DOM card replacement and disclosure restore");

  if (__ohdPerfEnabled) {
    console.info("[OHD performance] Extra Panchang update", {
      date: selectedDate,
      totalMilliseconds: Number((performance.now() - __ohdPerfStart).toFixed(2)),
      phases: __ohdPerfPhases
    });
  }
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

  const yogaByName = new Map(
    (Array.isArray(details?.yogas) ? details.yogas : [])
      .map(item => [item.name, item])
  );

  const renderRows = items => items.map(item => {
    const dotClass = item.category === "शुभ"
      ? "is-auspicious"
      : item.category === "अशुभ"
        ? "is-inauspicious"
        : "is-neutral";
    const intervals = Array.isArray(item.intervals) ? item.intervals : [];
    const timeText = item.unavailable
      ? "गणना उपलब्ध नहीं"
      : intervals.map(interval =>
          `${formatClassicalYogaDateTime(interval.start)} से ${formatClassicalYogaDateTime(interval.end)} तक`
        ).join("<br>");

    return `
      <div class="time-row">
        <b class="classical-yoga-name">
          <span class="classical-yoga-dot ${dotClass}" aria-hidden="true">●</span>
          <span>${item.name}</span>
        </b>
        <span>${timeText}</span>
      </div>
    `;
  }).join("");

  const sectionUnavailable = details?.error || "गणना उपलब्ध नहीं है।";
  const primaryItems = primaryNames.map(name => {
    const item = yogaByName.get(name);
    if (name === "रवि योग" && details?.raviCalculationAvailable === false) {
      return { name, category: "शुभ", intervals: [], unavailable: true };
    }
    return item && Array.isArray(item.intervals) && item.intervals.length > 0 ? item : null;
  }).filter(Boolean);

  const anandadiItems = Array.isArray(details?.anandadi)
    ? details.anandadi.filter(item => Array.isArray(item.intervals) && item.intervals.length > 0)
    : [];
  const otherItems = (Array.isArray(details?.yogas) ? details.yogas : [])
    .filter(item => !primaryNames.includes(item.name) && Array.isArray(item.intervals) && item.intervals.length > 0);

  const sections = [];
  if (!details?.available) {
    sections.push(`<section class="classical-yoga-section"><div class="label">🌟 शास्त्रीय योग</div><div class="time-row"><span>${sectionUnavailable}</span></div></section>`);
  } else {
    if (primaryItems.length) {
      sections.push(`<section class="classical-yoga-section"><div class="label">🌟 विशेष शुभ योग 🌟</div>${renderRows(primaryItems)}</section>`);
    }
    if (anandadiItems.length) {
      sections.push(`<section class="classical-yoga-section"><div class="label">🌼 आनन्दादि योग</div>${renderRows(anandadiItems)}</section>`);
    }
    if (otherItems.length) {
      sections.push(`<details class="classical-yoga-details"><summary><span class="classical-yoga-toggle-arrow" aria-hidden="true">▼</span><span>अन्य शास्त्रीय योग (<span style="color:#188038;">शुभ</span>-<span style="color:#d93025;">अशुभ</span>)</span></summary>${renderRows(otherItems)}</details>`);
    }
  }

  if (details?.available && sections.length === 0) return null;

  card.innerHTML = `
    ${sections.join("")}
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
