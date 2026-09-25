/* =========================================================
   OUR HINDU DHARM — ECLIPSE PANCHANG
   ---------------------------------------------------------
   Uses:
   @ishubhamx/panchangam-js@3.0.0

   Purpose:
   - Upcoming Solar Eclipses
   - Upcoming Lunar Eclipses
   - Location based calculation
   - Contact times
   - Sutak
   - Punya Kala
   - Visibility
   - Year filtering
   - Mobile friendly UI

   IMPORTANT:
   Eclipse calculations are done from Panchangam JS.
   No static eclipse table is used.
   ========================================================= */

import {
  getPanchangam,
  Observer
} from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const ECLIPSE_CONFIG = {

  timezoneOffset: 330,

  defaultLocation: {
    name: "पिथौरागढ़",
    latitude: 29.5829,
    longitude: 80.2182,
    elevation: 1650
  },

  yearsBefore: 0,

  yearsAfter: 5,

  scanStepHours: 6,

  language: "hi-IN"

};


/* =========================================================
   HINDI DATA
   ========================================================= */

const HINDI = {

  type: {
    solar: "सूर्य ग्रहण",
    lunar: "चंद्र ग्रहण"
  },

  subtype: {
    total: "पूर्ण",
    partial: "आंशिक",
    annular: "वलयाकार",
    penumbral: "उपच्छाया"
  },

  contact: {
    first: "प्रथम स्पर्श",
    second: "द्वितीय स्पर्श",
    maximum: "मध्य",
    third: "तृतीय स्पर्श",
    fourth: "मोक्ष"
  }

};


/* =========================================================
   HELPERS
   ========================================================= */

function safeDate(value) {

  if (!value) return null;

  if (value instanceof Date) {

    return isNaN(value.getTime())
      ? null
      : value;

  }

  const d = new Date(value);

  return isNaN(d.getTime())
    ? null
    : d;

}


function pad(n) {

  return String(n).padStart(2, "0");

}


function formatDate(date) {

  const d = safeDate(date);

  if (!d) return "—";

  return new Intl.DateTimeFormat(
    ECLIPSE_CONFIG.language,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      timeZone: "Asia/Kolkata"
    }
  ).format(d);

}


function formatTime(date) {

  const d = safeDate(date);

  if (!d) return "—";

  return new Intl.DateTimeFormat(
    ECLIPSE_CONFIG.language,
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    }
  ).format(d);

}


function dateKey(date) {

  const d = safeDate(date);

  if (!d) return "";

  return [
    d.getUTCFullYear(),
    pad(d.getUTCMonth() + 1),
    pad(d.getUTCDate())
  ].join("-");

}


function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   LOCATION
   ========================================================= */

export function createObserver(location) {

  const loc = {
    ...ECLIPSE_CONFIG.defaultLocation,
    ...(location || {})
  };

  return new Observer(
    Number(loc.latitude),
    Number(loc.longitude),
    Number(loc.elevation || 0)
  );

}


/* =========================================================
   EXTRACT ECLIPSE OBJECT
   ---------------------------------------------------------
   Different builds may expose grahana data with slightly
   different property naming. This adapter keeps UI isolated
   from that difference.
   ========================================================= */

function getGrahanaFromPanchang(panchang) {

  if (!panchang) return null;

  return (
    panchang.grahana ??
    panchang.grahan ??
    panchang.eclipse ??
    panchang.eclipseInfo ??
    null
  );

}


/* =========================================================
   PROPERTY ADAPTER
   ========================================================= */

function pick(obj, names) {

  if (!obj) return null;

  for (const name of names) {

    if (
      Object.prototype.hasOwnProperty.call(obj, name) &&
      obj[name] != null
    ) {

      return obj[name];

    }

  }

  return null;

}


/* =========================================================
   NORMALIZE GRAHANA
   ========================================================= */

function normalizeGrahana(raw, calculationDate, location) {

  if (!raw) return null;

  const typeRaw = String(
    pick(raw, [
      "type",
      "grahanaType",
      "eclipseType"
    ]) || ""
  ).toLowerCase();

  let type = null;

  if (
    typeRaw.includes("solar") ||
    typeRaw.includes("surya")
  ) {

    type = "solar";

  }

  if (
    typeRaw.includes("lunar") ||
    typeRaw.includes("chandra")
  ) {

    type = "lunar";

  }

  /*
   * Some versions may expose a boolean.
   */

  if (!type) {

    if (
      raw.isSolar === true ||
      raw.solar === true
    ) {

      type = "solar";

    }

    if (
      raw.isLunar === true ||
      raw.lunar === true
    ) {

      type = "lunar";

    }

  }

  if (!type) return null;


  const subtypeRaw = String(
    pick(raw, [
      "subtype",
      "grahanaSubtype",
      "eclipseSubtype",
      "kind"
    ]) || ""
  ).toLowerCase();


  let subtype = subtypeRaw || "unknown";


  if (
    subtype.includes("total") ||
    subtype.includes("पूर्ण")
  ) {

    subtype = "total";

  } else if (
    subtype.includes("annular") ||
    subtype.includes("वलय")
  ) {

    subtype = "annular";

  } else if (
    subtype.includes("partial") ||
    subtype.includes("आंशिक")
  ) {

    subtype = "partial";

  } else if (
    subtype.includes("penumbral") ||
    subtype.includes("उपच्छाया")
  ) {

    subtype = "penumbral";

  }


  const firstContact = safeDate(
    pick(raw, [
      "firstContact",
      "firstContactTime",
      "contact1",
      "c1",
      "partialStart",
      "partialBegin",
      "startTime",
      "start"
    ])
  );


  const secondContact = safeDate(
    pick(raw, [
      "secondContact",
      "secondContactTime",
      "contact2",
      "c2",
      "totalStart",
      "centralStart",
      "centralBegin"
    ])
  );


  const maximum = safeDate(
    pick(raw, [
      "maximum",
      "maximumTime",
      "maxTime",
      "greatest",
      "greatestEclipse",
      "midTime",
      "peakTime",
      "peak"
    ])
  );


  const thirdContact = safeDate(
    pick(raw, [
      "thirdContact",
      "thirdContactTime",
      "contact3",
      "c3",
      "totalEnd",
      "centralEnd"
    ])
  );


  const fourthContact = safeDate(
    pick(raw, [
      "fourthContact",
      "fourthContactTime",
      "contact4",
      "c4",
      "partialEnd",
      "partialEndTime",
      "endTime",
      "end"
    ])
  );


  const sutakStart = safeDate(
    pick(raw, [
      "sutakStartTime",
      "sutakStart",
      "sutakBegin"
    ])
  );


  const sutakEnd = safeDate(
    pick(raw, [
      "sutakEndTime",
      "sutakEnd"
    ])
  );


  const punyaStart = safeDate(
    pick(raw, [
      "punyaKalaStart",
      "punyaKalaStartTime",
      "punyaStart",
      "punyaStartTime"
    ])
  );


  const punyaEnd = safeDate(
    pick(raw, [
      "punyaKalaEnd",
      "punyaKalaEndTime",
      "punyaEnd",
      "punyaEndTime"
    ])
  );


  const visible = pick(raw, [
    "visible",
    "isVisible",
    "visibleAtLocation",
    "visibility"
  ]);


  return {

    raw,

    type,

    subtype,

    calculationDate,

    location,

    date:
      maximum ||
      firstContact ||
      fourthContact ||
      calculationDate,

    firstContact,

    secondContact,

    maximum,

    thirdContact,

    fourthContact,

    sutakStart,

    sutakEnd,

    punyaStart,

    punyaEnd,

    visible

  };

}


/* =========================================================
   SINGLE DATE CALCULATION
   ========================================================= */

export function calculateEclipseAt(
  date,
  location
) {

  const loc = {
    ...ECLIPSE_CONFIG.defaultLocation,
    ...(location || {})
  };

  const observer = createObserver(loc);

  const panchang = getPanchangam(
    date,
    observer,
    {
      timezoneOffset:
        ECLIPSE_CONFIG.timezoneOffset,

      calendarType: "purnimanta"
    }
  );

  const raw =
    getGrahanaFromPanchang(panchang);

  return normalizeGrahana(
    raw,
    date,
    loc
  );

}


/* =========================================================
   SCAN DATE RANGE
   ========================================================= */

export function findEclipses({
  startDate,
  endDate,
  location
}) {

  const start =
    safeDate(startDate);

  const end =
    safeDate(endDate);

  if (!start || !end) {

    throw new Error(
      "Invalid eclipse date range."
    );

  }


  const results = [];

  const seen = new Set();

  const step =
    ECLIPSE_CONFIG.scanStepHours *
    60 *
    60 *
    1000;


  for (
    let cursor = start.getTime();
    cursor <= end.getTime();
    cursor += step
  ) {

    const date =
      new Date(cursor);

    const eclipse =
      calculateEclipseAt(
        date,
        location
      );


    if (!eclipse) continue;


    /*
     * Event identity:
     * type + maximum/first contact
     */

    const identity =
      eclipse.type +
      "|" +
      dateKey(
        eclipse.maximum ||
        eclipse.firstContact ||
        date
      );


    if (seen.has(identity)) {

      continue;

    }


    seen.add(identity);

    results.push(eclipse);

  }


  /*
   * Sort chronologically.
   */

  results.sort(
    (a, b) =>
      a.date.getTime() -
      b.date.getTime()
  );


  return results;

}


/* =========================================================
   YEAR RANGE
   ========================================================= */

export function getEclipsesForYears(
  startYear,
  numberOfYears,
  location
) {

  const start =
    new Date(
      `${startYear}-01-01T00:00:00Z`
    );

  const end =
    new Date(
      `${startYear + numberOfYears}-01-01T00:00:00Z`
    );


  return findEclipses({

    startDate: start,

    endDate: end,

    location

  });

}


/* =========================================================
   TYPE LABEL
   ========================================================= */

function getTypeLabel(eclipse) {

  const type =
    HINDI.type[eclipse.type] ||
    eclipse.type;


  const subtype =
    HINDI.subtype[eclipse.subtype] ||
    "";


  return subtype
    ? `${type} — ${subtype}`
    : type;

}


/* =========================================================
   VISIBILITY LABEL
   ========================================================= */

function getVisibilityLabel(
  eclipse
) {

  if (
    eclipse.visible === true
  ) {

    return `
      <span class="ohd-eclipse-visible">
        ✓ इस स्थान से दृश्य
      </span>
    `;

  }


  if (
    eclipse.visible === false
  ) {

    return `
      <span class="ohd-eclipse-not-visible">
        इस स्थान से अदृश्य
      </span>
    `;

  }


  return "";

}


/* =========================================================
   TIME ROW
   ========================================================= */

function timeRow(
  label,
  value
) {

  if (!value) return "";

  return `
    <div class="ohd-eclipse-time-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(
        formatTime(value)
      )}</strong>
    </div>
  `;

}


/* =========================================================
   ECLIPSE CARD
   ========================================================= */

export function renderEclipseCard(
  eclipse
) {

  const solar =
    eclipse.type === "solar";

  const cardClass =
    solar
      ? "ohd-eclipse-solar"
      : "ohd-eclipse-lunar";


  return `

    <article
      class="
        ohd-eclipse-card
        ${cardClass}
      "
    >

      <div class="ohd-eclipse-card-header">

        <div>

          <div class="ohd-eclipse-type">

            ${solar ? "☀️" : "🌙"}

            ${escapeHtml(
              getTypeLabel(eclipse)
            )}

          </div>

          <div class="ohd-eclipse-date">

            ${escapeHtml(
              formatDate(eclipse.date)
            )}

          </div>

        </div>

        ${getVisibilityLabel(eclipse)}

      </div>


      <div class="ohd-eclipse-times">

        ${timeRow(
          solar
            ? "प्रथम स्पर्श"
            : "उपच्छाया स्पर्श",
          eclipse.firstContact
        )}

        ${timeRow(
          solar
            ? "द्वितीय स्पर्श"
            : "खग्रास आरम्भ",
          eclipse.secondContact
        )}

        ${timeRow(
          "मध्य",
          eclipse.maximum
        )}

        ${timeRow(
          solar
            ? "तृतीय स्पर्श"
            : "खग्रास समाप्ति",
          eclipse.thirdContact
        )}

        ${timeRow(
          "मोक्ष",
          eclipse.fourthContact
        )}

      </div>


      ${
        eclipse.sutakStart
          ? `

            <div
              class="ohd-eclipse-special sutak"
            >

              <div>
                <span>
                  सूतक प्रारम्भ
                </span>

                <strong>
                  ${escapeHtml(
                    formatTime(
                      eclipse.sutakStart
                    )
                  )}
                </strong>
              </div>


              ${
                eclipse.sutakEnd
                  ? `
                    <div>
                      <span>
                        सूतक समाप्ति
                      </span>

                      <strong>
                        ${escapeHtml(
                          formatTime(
                            eclipse.sutakEnd
                          )
                        )}
                      </strong>
                    </div>
                  `
                  : ""
              }

            </div>

          `
          : ""
      }


      ${
        eclipse.punyaStart
          ? `

            <div
              class="
                ohd-eclipse-special
                punya
              "
            >

              <div>
                <span>
                  पुण्य काल
                </span>

                <strong>

                  ${escapeHtml(
                    formatTime(
                      eclipse.punyaStart
                    )
                  )}

                  ${
                    eclipse.punyaEnd
                      ? `
                        – ${escapeHtml(
                          formatTime(
                            eclipse.punyaEnd
                          )
                        )}
                      `
                      : ""
                  }

                </strong>
              </div>

            </div>

          `
          : ""
      }


      <div class="ohd-eclipse-note">

        समय चयनित स्थान के स्थानीय समय के अनुसार
        प्रदर्शित किया गया है।

      </div>

    </article>

  `;

}


/* =========================================================
   YEAR SELECTOR
   ========================================================= */

function createYearOptions(
  currentYear,
  yearsBefore = 1,
  yearsAfter = 10
) {

  let html = "";

  for (
    let y =
      currentYear - yearsBefore;

    y <=
      currentYear + yearsAfter;

    y++
  ) {

    html += `
      <option value="${y}">
        ${y}
      </option>
    `;

  }

  return html;

}


/* =========================================================
   MAIN RENDER
   ========================================================= */

export async function initEclipsePanchang(
  options = {}
) {

  const container =
    document.getElementById(
      "ohd-eclipse-panchang"
    );


  if (!container) {

    console.warn(
      "OurHinduDharm Eclipse Panchang container not found."
    );

    return;

  }


  const location = {

    ...ECLIPSE_CONFIG.defaultLocation,

    ...(options.location || {})

  };


  const now =
    new Date();

  const currentYear =
    now.getFullYear();


  container.innerHTML = `

    <section class="ohd-eclipse-widget">

      <header class="ohd-eclipse-widget-header">

        <div>

          <h2>
            ग्रहण पंचांग
          </h2>

          <p>
            आगामी सूर्य एवं चंद्र ग्रहण
          </p>

        </div>

      </header>


      <div class="ohd-eclipse-controls">

        <label>

          वर्ष

          <select
            id="ohd-eclipse-year"
          >

            ${createYearOptions(
              currentYear,
              ECLIPSE_CONFIG.yearsBefore,
              ECLIPSE_CONFIG.yearsAfter
            )}

          </select>

        </label>


        <label>

          स्थान

          <span
            class="ohd-eclipse-location"
          >

            ${escapeHtml(
              location.name
            )}

          </span>

        </label>

      </div>


      <div
        id="ohd-eclipse-results"
        class="ohd-eclipse-results"
      >

        <div class="ohd-eclipse-loading">

          ग्रहण की गणना की जा रही है…

        </div>

      </div>

    </section>

  `;


  const yearSelect =
    document.getElementById(
      "ohd-eclipse-year"
    );


  const results =
    document.getElementById(
      "ohd-eclipse-results"
    );


  async function loadYear(
    year
  ) {

    results.innerHTML = `

      <div class="ohd-eclipse-loading">

        ${year} के ग्रहण खोजे जा रहे हैं…

      </div>

    `;


    /*
     * Let browser paint loading state
     * before astronomical calculations.
     */

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          20
        )
    );


    try {

      const eclipses =
        getEclipsesForYears(
          year,
          1,
          location
        );


      if (!eclipses.length) {

        results.innerHTML = `

          <div
            class="ohd-eclipse-empty"
          >

            इस वर्ष के लिए कोई ग्रहण
            उपलब्ध नहीं मिला।

          </div>

        `;

        return;

      }


      const solar =
        eclipses.filter(
          e => e.type === "solar"
        );


      const lunar =
        eclipses.filter(
          e => e.type === "lunar"
        );


      results.innerHTML = `

        ${
          solar.length
            ? `

              <section>

                <h3>
                  ☀️ सूर्य ग्रहण
                </h3>

                <div>

                  ${solar
                    .map(
                      renderEclipseCard
                    )
                    .join("")}

                </div>

              </section>

            `
            : ""
        }


        ${
          lunar.length
            ? `

              <section>

                <h3>
                  🌙 चंद्र ग्रहण
                </h3>

                <div>

                  ${lunar
                    .map(
                      renderEclipseCard
                    )
                    .join("")}

                </div>

              </section>

            `
            : ""
        }

      `;


    } catch (error) {

      console.error(
        "Eclipse calculation error:",
        error
      );


      results.innerHTML = `

        <div
          class="ohd-eclipse-error"
        >

          ग्रहण गणना करते समय त्रुटि हुई।

          <br>

          कृपया पृष्ठ को पुनः लोड करें।

        </div>

      `;

    }

  }


  yearSelect.addEventListener(
    "change",
    () =>
      loadYear(
        Number(
          yearSelect.value
        )
      )
  );


  /*
   * Default year
   */

  yearSelect.value =
    String(currentYear);


  await loadYear(
    currentYear
  );

}


/* =========================================================
   AUTO INIT
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () =>
      initEclipsePanchang()
  );

} else {

  initEclipsePanchang();

}
