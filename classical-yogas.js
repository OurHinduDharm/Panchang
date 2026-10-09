/*
 * OurHinduDharm Panchang
 * classical-yogas.js
 *
 * Classical special-yoga engine.
 *
 * Source basis:
 *   मुहूर्त्तचिन्तामणि — दैवज्ञ राम
 *
 * Scope:
 *   - Core classical yogas selected for the Panchang.
 *   - Anandadi 28 Yoga is kept complete.
 *   - No disputed cancellation/remedy rules.
 *   - No location/tradition-specific rules.
 *
 * Important:
 *   This module is intentionally independent from app.js.
 *   Existing app.js logic is NOT removed until this module is
 *   independently validated against the existing output.
 */

const OHN_CLASSICAL_NAKSHATRAS = [
  "अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशीर्ष","आर्द्रा",
  "पुनर्वसु","पुष्य","आश्लेषा","मघा","पूर्वाफाल्गुनी","उत्तराफाल्गुनी",
  "हस्त","चित्रा","स्वाती","विशाखा","अनुराधा","ज्येष्ठा","मूल",
  "पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा",
  "पूर्वाभाद्रपद","उत्तराभाद्रपद","रेवती"
];

const OHN_CLASSICAL_TITHIS = [
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा",
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या"
];

const OHN_CLASSICAL_SOURCE = {
  grantha: "मुहूर्त्तचिन्तामणि",
  rachayita: "दैवज्ञ राम"
};

/* =========================================================
   COMMON HELPERS
   ========================================================= */

function ohdValidDate(value){
  const d = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}


function ohdWeekday(selectedDate){
  if(selectedDate == null) return null;

  /*
   * Date-only ISO string को local date मानें।
   * उदाहरण: "2026-10-09"
   * इससे UTC parsing के कारण वार बदलने का जोखिम नहीं रहेगा।
   */
  if(typeof selectedDate === "string"){
    const match = selectedDate.trim().match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if(match){
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      const d = new Date(year, month - 1, day);

      if(
        d.getFullYear() !== year ||
        d.getMonth() !== month - 1 ||
        d.getDate() !== day
      ){
        return null;
      }

      return d.getDay();
    }
  }

  const d = ohdValidDate(selectedDate);
  return d ? d.getDay() : null;
}


function ohdTithiOrdinal(index){
  if(typeof index !== "number" || index < 0) return null;
  return (index % 15) + 1;
}

function ohdInterval(item){
  if(!item) return null;

  const start = ohdValidDate(item.startTime ?? item.start);
  const end = ohdValidDate(item.endTime ?? item.end);

  if(!start || !end || end <= start) return null;

  return { start, end };
}

function ohdClampInterval(item, sunrise, nextSunrise){
  const raw = ohdInterval(item);
  if(!raw) return null;

  const start = new Date(
    Math.max(raw.start.getTime(), sunrise.getTime())
  );

  const end = new Date(
    Math.min(raw.end.getTime(), nextSunrise.getTime())
  );

  return end > start ? { start, end } : null;
}

function ohdMergeIntervals(intervals){
  const valid = intervals
    .filter(Boolean)
    .sort((a,b) => a.start.getTime() - b.start.getTime());

  const merged = [];

  for(const item of valid){
    const last = merged[merged.length - 1];

if(
  last &&
  item.start.getTime() <= last.end.getTime()
){
      if(item.end > last.end){
        last.end = item.end;
      }
    }else{
      merged.push({
        start:new Date(item.start),
        end:new Date(item.end)
      });
    }
  }

  return merged;
}

function ohdResult(name, category, intervals, extra = {}){
  return {
    name,
    category,
    intervals:ohdMergeIntervals(intervals),
    source:{...OHN_CLASSICAL_SOURCE},
    ...extra
  };
}

function ohdGetMoonNakshatras(p){
  return Array.isArray(p?.nakshatras) ? p.nakshatras : [];
}

function ohdGetTithis(p){
  return Array.isArray(p?.tithis) ? p.tithis : [];
}

/* =========================================================
   AMRIT SIDDHI / SARVARTHA SIDDHI
   Existing app.js tables are reproduced here only as data.
   Actual migration will happen after validation.
   ========================================================= */

const OHN_AMRIT_SIDDHI = {
  0:[12], // रविवार — हस्त
  1:[4],  // सोमवार — मृगशीर्ष
  2:[0],  // मंगलवार — अश्विनी
  3:[16], // बुधवार — अनुराधा
  4:[7],  // गुरुवार — पुष्य
  5:[26], // शुक्रवार — रेवती
  6:[3]   // शनिवार — रोहिणी
};

const OHN_SARVARTHA_SIDDHI = {
  0:[0,7,11,12,18,20,25],
  1:[3,4,7,16,21],
  2:[0,2,8,25],
  3:[2,3,4,12,16],
  4:[0,6,7,16,26],
  5:[0,6,16,21,26],
  6:[3,14,21]
};

function ohdNakshatraIntervals(p, allowedIndexes, sunrise, nextSunrise){
  return ohdMergeIntervals(
    ohdGetMoonNakshatras(p)
      .filter(item =>
        item &&
        typeof item.index === "number" &&
        allowedIndexes.includes(item.index)
      )
      .map(item =>
        ohdClampInterval(item, sunrise, nextSunrise)
      )
  );
}

/* =========================================================
   TITHI + VARA YOGAS
   ========================================================= */

/*
 * Tithi-sanjna:
 * Nanda = 1,6,11
 * Bhadra = 2,7,12
 * Jaya  = 3,8,13
 * Rikta = 4,9,14
 * Purna = 5,10,15
 */
const OHN_TITHI_SANJNA = {
  Nanda:[1,6,11],
  Bhadra:[2,7,12],
  Jaya:[3,8,13],
  Rikta:[4,9,14],
  Purna:[5,10,15]
};

function ohdTithiSanJna(ordinal){
  for(const [name, values] of Object.entries(OHN_TITHI_SANJNA)){
    if(values.includes(ordinal)) return name;
  }
  return null;
}

/*
 * सिद्धा तिथि-वार योग
 * रविवार — नहीं
 * सोमवार — नहीं
 * मंगलवार — जया
 * बुधवार — भद्रा
 * गुरुवार — पूर्णा
 * शुक्रवार — नन्दा
 * शनिवार — रिक्ता
 */
const OHN_SIDDHA_TITHI_BY_WEEKDAY = {
  0:null,
  1:null,
  2:"Jaya",
  3:"Bhadra",
  4:"Purna",
  5:"Nanda",
  6:"Rikta"
};

const OHN_MRITYU_TITHI_BY_WEEKDAY = {
  0:"Nanda",
  1:"Bhadra",
  2:"Nanda",
  3:"Jaya",
  4:"Rikta",
  5:"Bhadra",
  6:"Purna"
};

const OHN_DAGDHA_TITHI_BY_WEEKDAY = {
  0:[12],
  1:[11],
  2:[5],
  3:[3],
  4:[6],
  5:[8],
  6:[9]
};

const OHN_VISHAKHYA_TITHI_BY_WEEKDAY = {
  0:[4],
  1:[6],
  2:[7],
  3:[2],
  4:[8],
  5:[9],
  6:[7]
};

const OHN_HUTASHANA_TITHI_BY_WEEKDAY = {
  0:[12],
  1:[6],
  2:[7],
  3:[8],
  4:[9],
  5:[10],
  6:[11]
};

const OHN_KRAKACHA_TITHI_BY_WEEKDAY = {
  0:[12],
  1:[11],
  2:[10],
  3:[9],
  4:[8],
  5:[7],
  6:[6]
};

const OHN_SAMVARTAKA_TITHI_BY_WEEKDAY = {
  0:[7],
  3:[1]
};

const OHN_NINDITA_COMBINATIONS = [
  {weekday:0, tithi:5,  nakshatra:12}, // पंचमी + रविवार + हस्त
  {weekday:1, tithi:6,  nakshatra:4},  // षष्ठी + सोमवार + मृगशीर्ष
  {weekday:2, tithi:7,  nakshatra:0},  // सप्तमी + मंगलवार + अश्विनी
  {weekday:3, tithi:8,  nakshatra:16}, // अष्टमी + बुधवार + अनुराधा
  {weekday:4, tithi:9,  nakshatra:7},  // नवमी + गुरुवार + पुष्य
  {weekday:5, tithi:10, nakshatra:26}, // दशमी + शुक्रवार + रेवती
  {weekday:6, tithi:11, nakshatra:3}   // एकादशी + शनिवार + रोहिणी
];

function ohdTithiIntervals(
  p,
  weekday,
  predicate,
  sunrise,
  nextSunrise
){
  return ohdMergeIntervals(
    ohdGetTithis(p)
      .filter(item => {
        if(!item || typeof item.index !== "number") return false;
        const ordinal = ohdTithiOrdinal(item.index);
        return predicate(item, ordinal, weekday);
      })
      .map(item => ohdClampInterval(item, sunrise, nextSunrise))
  );
}

/* =========================================================
   NAKSHATRA + VARA YOGAS
   ========================================================= */

const OHN_DAGDHA_NAKSHATRA_BY_WEEKDAY = {
  0:[1],   // रविवार — भरणी
  1:[13],  // सोमवार — चित्रा
  2:[20],  // मंगलवार — उत्तराषाढ़ा
  3:[11],  // बुधवार — उत्तराफाल्गुनी
  4:[17],  // गुरुवार — ज्येष्ठा
  5:[26],  // शुक्रवार — रेवती
  6:[6]    // शनिवार — पुनर्वसु
};

const OHN_YAMAGHANTA_NAKSHATRA_BY_WEEKDAY = {
  0:[9],   // रविवार — मघा
  1:[15],  // सोमवार — विशाखा
  2:[6],   // मंगलवार — आर्द्रा
  3:[18],  // बुधवार — मूल
  4:[2],   // गुरुवार — कृत्तिका
  5:[3],   // शुक्रवार — रोहिणी
  6:[12]   // शनिवार — हस्त
};

function ohdNakshatraWeekdayIntervals(
  p,
  weekday,
  table,
  sunrise,
  nextSunrise
){
  return ohdNakshatraIntervals(
    p,
    table[weekday] || [],
    sunrise,
    nextSunrise
  );
}

/* =========================================================
   DVIPUSHKAR / TRIPUSHKAR
   ========================================================= */

const OHN_PUSKAR_WEEKDAYS = [0,2,6];
const OHN_PUSKAR_TITHIS = [2,7,12];

const OHN_TRIPUSHKAR_NAKSHATRAS = [
  15, // विशाखा
  11, // उत्तराफाल्गुनी
  24, // पूर्वाभाद्रपद
  6,  // पुनर्वसु
  2,  // कृत्तिका
  20  // उत्तराषाढ़ा
];

const OHN_DVIPUSHKAR_NAKSHATRAS = [
  4,  // मृगशीर्ष
  13, // चित्रा
  22  // धनिष्ठा
];

/* =========================================================
   ANANDADI 28 YOGA
   अभिजित सहित 28-नक्षत्र चक्र
   ========================================================= */

const OHN_ANANDADI_NAMES = [
  "आनन्द",
  "कालदण्ड",
  "धूम्र",
  "धाता",
  "सौम्य",
  "ध्वाङ्क्ष",
  "केतु",
  "श्रीवत्स",
  "वज्र",
  "मुद्गर",
  "छत्र",
  "मित्र",
  "मानस",
  "पद्म",
  "लुम्ब",
  "उत्पात",
  "मृत्यु",
  "काण",
  "सिद्धि",
  "शुभ",
  "अमृत",
  "मुसल",
  "गद",
  "मातंग",
  "राक्षस",
  "चर",
  "सुस्थिर",
  "प्रवर्धमान"
];

const OHN_ANANDADI_NAKSHATRAS = [
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,
  14,15,16,17,18,19,20,
  "abhijit",
  21,22,23,24,25,26
];

 const OHN_ANANDADI_STARTS = {
  0:0,   // रविवार — अश्विनी
  1:4,   // सोमवार — मृगशीर्ष
  2:8,   // मंगलवार — आश्लेषा
  3:12,  // बुधवार — हस्त
  4:16,  // गुरुवार — अनुराधा
  5:20,  // शुक्रवार — उत्तराषाढ़ा
  6:24   // शनिवार — शतभिषा
};

function ohdAnandadiPositionFromNakshatraIndex(nakshatraIndex){
  if(typeof nakshatraIndex !== "number") return null;

  /*
   * Physical 27 nakshatra index → 28-slot Anandadi index.
   * अभिजित is inserted after उत्तराषाढ़ा (index 20).
   */
  if(nakshatraIndex <= 20) return nakshatraIndex;
  return nakshatraIndex + 1;
}

function ohdAnandadiYogaName(weekday, nakshatraIndex){
  const start = OHN_ANANDADI_STARTS[weekday];
  const position = ohdAnandadiPositionFromNakshatraIndex(
    nakshatraIndex
  );

  if(
    typeof start !== "number" ||
    typeof position !== "number"
  ){
    return null;
  }

  const distance =
    (position - start + 28) % 28;

  return OHN_ANANDADI_NAMES[distance] || null;
}

/* =========================================================
   RAVI YOGA
   Sun segments are supplied by the caller.
   This deliberately avoids duplicating app.js Sun-transition
   astronomy until the existing implementation is migrated.
   ========================================================= */

function ohdIsRaviYoga(sunNakshatraIndex, moonNakshatraIndex){
  if(
    typeof sunNakshatraIndex !== "number" ||
    typeof moonNakshatraIndex !== "number"
  ){
    return false;
  }

  const distance =
    ((moonNakshatraIndex - sunNakshatraIndex + 27) % 27) + 1;

  return [4,6,9,10,13,20].includes(distance);
}

function ohdRaviYogaIntervals(
  p,
  sunSegments,
  sunrise,
  nextSunrise
){
  if(!Array.isArray(sunSegments)) return [];

  const result = [];

  for(const moon of ohdGetMoonNakshatras(p)){
    if(
      !moon ||
      typeof moon.index !== "number"
    ){
      continue;
    }

    const moonInterval = ohdInterval(moon);
    if(!moonInterval) continue;

    for(const sun of sunSegments){
      if(
        !sun ||
        typeof sun.sunIndex !== "number"
      ){
        continue;
      }

      const sunInterval = ohdInterval(sun);
      if(!sunInterval) continue;

      const start = new Date(Math.max(
        moonInterval.start.getTime(),
        sunInterval.start.getTime(),
        sunrise.getTime()
      ));

      const end = new Date(Math.min(
        moonInterval.end.getTime(),
        sunInterval.end.getTime(),
        nextSunrise.getTime()
      ));

      if(
        end > start &&
        ohdIsRaviYoga(sun.sunIndex, moon.index)
      ){
        result.push({start,end});
      }
    }
  }

  return ohdMergeIntervals(result);
}

/* =========================================================
   MAIN CLASSICAL YOGA CALCULATOR
   ========================================================= */

function getClassicalYogas(
  p,
  {
    selectedDate,
    nextSunrise,
    sunSegments = []
  } = {}
){
  const sunrise = ohdValidDate(p?.sunrise);
  const nextRise = ohdValidDate(nextSunrise);
  const weekday = ohdWeekday(selectedDate);

  if(
    !p ||
    !sunrise ||
    !nextRise ||
    weekday === null
  ){
    return {
      available:false,
      error:"शास्त्रीय योगों के लिए आवश्यक समय/तिथि उपलब्ध नहीं है।",
      yogas:[]
    };
  }

  const yogas = [];

  /* शुभ — existing tables */
  yogas.push(
    ohdResult(
      "अमृत सिद्धि योग",
      "शुभ",
      ohdNakshatraIntervals(
        p,
        OHN_AMRIT_SIDDHI[weekday] || [],
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "सर्वार्थ सिद्धि योग",
      "शुभ",
      ohdNakshatraIntervals(
        p,
        OHN_SARVARTHA_SIDDHI[weekday] || [],
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "रवि योग",
      "शुभ",
      ohdRaviYogaIntervals(
        p,
        sunSegments,
        sunrise,
        nextRise
      )
    )
  );

  /* शुभ — तिथि/वार */
  yogas.push(
    ohdResult(
      "सिद्धा तिथि-वार योग",
      "शुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) =>
          ohdTithiSanJna(ordinal) ===
          OHN_SIDDHA_TITHI_BY_WEEKDAY[weekday],
        sunrise,
        nextRise
      )
    )
  );

  /* शुभ — द्विपुष्कर */
  yogas.push(
    ohdResult(
      "द्विपुष्कर योग",
      "शुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) => {
          if(!OHN_PUSKAR_WEEKDAYS.includes(weekday)) return false;
          if(!OHN_PUSKAR_TITHIS.includes(ordinal)) return false;

          return ohdGetMoonNakshatras(p).some(
            n =>
              n &&
              typeof n.index === "number" &&
              OHN_DVIPUSHKAR_NAKSHATRAS.includes(n.index)
          );
        },
        sunrise,
        nextRise
      )
    )
  );

  /*
   * पुष्कर योग वास्तव में तिथि और नक्षत्र दोनों के
   * overlap पर बनता है। इसलिए ऊपर केवल tithi interval
   * पर्याप्त नहीं; इसे वास्तविक overlap से पुनर्गणित करें।
   */
  const buildPushkar = (allowedNakshatras, name) => {
    if(!OHN_PUSKAR_WEEKDAYS.includes(weekday)) return [];

    const result = [];

    for(const tithi of ohdGetTithis(p)){
      const t = ohdInterval(tithi);
      if(!t) continue;

      const ordinal = ohdTithiOrdinal(tithi.index);
      if(!OHN_PUSKAR_TITHIS.includes(ordinal)) continue;

      for(const nak of ohdGetMoonNakshatras(p)){
        if(
          !nak ||
          typeof nak.index !== "number" ||
          !allowedNakshatras.includes(nak.index)
        ){
          continue;
        }

        const n = ohdInterval(nak);
        if(!n) continue;

        const start = new Date(Math.max(
          t.start.getTime(),
          n.start.getTime(),
          sunrise.getTime()
        ));

        const end = new Date(Math.min(
          t.end.getTime(),
          n.end.getTime(),
          nextRise.getTime()
        ));

        if(end > start){
          result.push({start,end});
        }
      }
    }

    return ohdMergeIntervals(result);
  };

  /* Replace the preliminary tithi-only result with true overlap. */
  yogas[yogas.length - 1] = ohdResult(
    "द्विपुष्कर योग",
    "शुभ",
    buildPushkar(OHN_DVIPUSHKAR_NAKSHATRAS, "द्विपुष्कर")
  );

  yogas.push(
    ohdResult(
      "त्रिपुष्कर योग",
      "शुभ",
      buildPushkar(OHN_TRIPUSHKAR_NAKSHATRAS, "त्रिपुष्कर")
    )
  );

  /* अशुभ — तिथि/वार */
  yogas.push(
    ohdResult(
      "मृत्यु योग",
      "अशुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) =>
          ohdTithiSanJna(ordinal) ===
          OHN_MRITYU_TITHI_BY_WEEKDAY[weekday],
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "दग्ध योग — तिथि-वार",
      "अशुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) =>
          (OHN_DAGDHA_TITHI_BY_WEEKDAY[weekday] || [])
            .includes(ordinal),
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "विषाख्य योग",
      "अशुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) =>
          (OHN_VISHAKHYA_TITHI_BY_WEEKDAY[weekday] || [])
            .includes(ordinal),
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "हुताशन योग",
      "अशुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) =>
          (OHN_HUTASHANA_TITHI_BY_WEEKDAY[weekday] || [])
            .includes(ordinal),
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "क्रकच योग",
      "अशुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) =>
          (OHN_KRAKACHA_TITHI_BY_WEEKDAY[weekday] || [])
            .includes(ordinal),
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "संवर्तक योग",
      "अशुभ",
      ohdTithiIntervals(
        p,
        weekday,
        (_, ordinal) =>
          (OHN_SAMVARTAKA_TITHI_BY_WEEKDAY[weekday] || [])
            .includes(ordinal),
        sunrise,
        nextRise
      )
    )
  );

  /* अशुभ — नक्षत्र/वार */
  yogas.push(
    ohdResult(
      "दग्ध योग — नक्षत्र-वार",
      "अशुभ",
      ohdNakshatraWeekdayIntervals(
        p,
        weekday,
        OHN_DAGDHA_NAKSHATRA_BY_WEEKDAY,
        sunrise,
        nextRise
      )
    )
  );

  yogas.push(
    ohdResult(
      "यमघंट योग",
      "अशुभ",
      ohdNakshatraWeekdayIntervals(
        p,
        weekday,
        OHN_YAMAGHANTA_NAKSHATRA_BY_WEEKDAY,
        sunrise,
        nextRise
      )
    )
  );

  /* अशुभ — तिथि + नक्षत्र + वार */
  const ninditaIntervals = [];

  for(const tithi of ohdGetTithis(p)){
    const t = ohdInterval(tithi);
    if(!t) continue;

    const ordinal = ohdTithiOrdinal(tithi.index);

    for(const nak of ohdGetMoonNakshatras(p)){
      if(!nak || typeof nak.index !== "number") continue;

      const match = OHN_NINDITA_COMBINATIONS.some(
        item =>
          item.weekday === weekday &&
          item.tithi === ordinal &&
          item.nakshatra === nak.index
      );

      if(!match) continue;

      const n = ohdInterval(nak);
      if(!n) continue;

      const start = new Date(Math.max(
        t.start.getTime(),
        n.start.getTime(),
        sunrise.getTime()
      ));

      const end = new Date(Math.min(
        t.end.getTime(),
        n.end.getTime(),
        nextRise.getTime()
      ));

      if(end > start){
        ninditaIntervals.push({start,end});
      }
    }
  }

  yogas.push(
    ohdResult(
      "निन्दित योग",
      "अशुभ",
      ninditaIntervals
    )
  );

  /* =======================================================
     ANANDADI 28
     ======================================================= */

  const anandadiIntervals = {};

  for(const item of ohdGetMoonNakshatras(p)){
    if(!item || typeof item.index !== "number") continue;

    const interval = ohdClampInterval(
      item,
      sunrise,
      nextRise
    );

    if(!interval) continue;

    const name = ohdAnandadiYogaName(
      weekday,
      item.index
    );

    if(!name) continue;

    if(!anandadiIntervals[name]){
      anandadiIntervals[name] = [];
    }

    anandadiIntervals[name].push(interval);
  }

  const anandadi = OHN_ANANDADI_NAMES.map(name => ({
    name,
    category:"आनंदादि",
    intervals:ohdMergeIntervals(
      anandadiIntervals[name] || []
    ),
    source:{...OHN_CLASSICAL_SOURCE}
  }));

  return {
    available:true,
    weekday,
    yogas,
    anandadi,
    source:{...OHN_CLASSICAL_SOURCE}
  };
}

/* =========================================================
   PUBLIC API
   ========================================================= */

window.OHDPanchangClassicalYogas = {
  getClassicalYogas,
  ohdAnandadiYogaName,
  ohdIsRaviYoga,
  ohdRaviYogaIntervals,

  tables:{
    amritSiddhi:OHN_AMRIT_SIDDHI,
    sarvarthaSiddhi:OHN_SARVARTHA_SIDDHI,
    siddhaTithi:OHN_SIDDHA_TITHI_BY_WEEKDAY,
    mrityuTithi:OHN_MRITYU_TITHI_BY_WEEKDAY,
    dagdhaTithi:OHN_DAGDHA_TITHI_BY_WEEKDAY,
    dagdhaNakshatra:OHN_DAGDHA_NAKSHATRA_BY_WEEKDAY,
    vishakhya:OHN_VISHAKHYA_TITHI_BY_WEEKDAY,
    hutashana:OHN_HUTASHANA_TITHI_BY_WEEKDAY,
    yamaghanta:OHN_YAMAGHANTA_NAKSHATRA_BY_WEEKDAY,
    krakacha:OHN_KRAKACHA_TITHI_BY_WEEKDAY,
    samvartaka:OHN_SAMVARTAKA_TITHI_BY_WEEKDAY,
    nindita:OHN_NINDITA_COMBINATIONS,
    dwipushkar:OHN_DVIPUSHKAR_NAKSHATRAS,
    tripushkar:OHN_TRIPUSHKAR_NAKSHATRAS,
    anandadi:OHN_ANANDADI_NAMES
  }
};

console.info(
  "✓ classical-yogas.js loaded — independent validation mode"
);
