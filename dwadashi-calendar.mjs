const MONTHS = ["चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद","आश्विन","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन"];
const TITHI_NAMES = ["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पञ्चमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी"];
const MONTH_SLUGS = { "चैत्र":"chaitra", "वैशाख":"vaishakha", "ज्येष्ठ":"jyeshtha", "आषाढ़":"ashadha", "श्रावण":"shravana", "भाद्रपद":"bhadrapada", "आश्विन":"ashwin", "कार्तिक":"kartika", "मार्गशीर्ष":"margashirsha", "पौष":"pausha", "माघ":"magha", "फाल्गुन":"phalguna" };

function normalizePaksha(value) {
  const text = String(value || "").normalize("NFC").trim();
  if (/कृष्ण|krishna/i.test(text)) return "कृष्ण";
  if (/शुक्ल|shukla/i.test(text)) return "शुक्ल";
  return "";
}

function normalizeMonth(value) {
  let text = String(value || "").normalize("NFC").trim();
  const adhika = /^अधिक\s+/.test(text) || /^adhika\s+/i.test(text);
  text = text.replace(/^(?:अधिक|adhika)\s+/i, "");
  const aliases = { "कार्तिक":"कार्तिक", "कातिक":"कार्तिक", "आश्विन":"आश्विन", "अश्विन":"आश्विन" };
  text = aliases[text] || text;
  return { month: MONTHS.includes(text) ? text : "", adhika };
}

function normalizeTithi(value) {
  const text = String(value || "").normalize("NFC").trim();
  return text.replace(/\s*(?:तिथि)?\s*$/, "");
}

function dateSort(a, b) {
  return String(a).localeCompare(String(b));
}

function findDwadashiIntervalOnSunriseDay(dailyPanchang, date, month, paksha, adhika) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return null;

  // A Panchang date runs from its local sunrise to the following local
  // sunrise. Civil-midnight bounds misclassify tithis beginning after
  // midnight but before the next sunrise.
  const byDate = new Map(
    dailyPanchang.filter(day => day && day.date).map(day => [day.date, day])
  );
  const day = byDate.get(date);
  const nextDate = nextCalendarDate(date);
  const nextDay = nextDate ? byDate.get(nextDate) : null;
  const dayStart = Date.parse(day?.sunrise || "");
  const dayEnd = Date.parse(nextDay?.sunrise || "");
  if (!Number.isFinite(dayStart) || !Number.isFinite(dayEnd) || dayEnd <= dayStart) return null;

  for (const observation of dailyPanchang) {
    if (!observation) continue;
    const masa = normalizeMonth(observation.masa);
    if (masa.month !== month || masa.adhika !== !!adhika ||
        normalizePaksha(observation.paksha) !== paksha) continue;
    const intervals = [];
    if (normalizeTithi(observation.tithi) === "द्वादशी") {
      intervals.push({start:observation.tithiStartTime, end:observation.tithiEndTime, basis:"daily-tithi-interval"});
    }
    if (normalizeTithi(observation.noonTithi) === "द्वादशी") {
      intervals.push({start:observation.noonTithiStartTime || observation.tithiStartTime,
        end:observation.noonTithiEndTime || observation.tithiEndTime, basis:"noon-tithi-interval"});
    }
    const sunrise = observation.sunriseTithi;
    if (sunrise && normalizeTithi(sunrise.tithi) === "द्वादशी") {
      intervals.push({start:sunrise.tithiStartTime || observation.tithiStartTime,
        end:sunrise.tithiEndTime || observation.tithiEndTime, basis:"sunrise-tithi-interval"});
    }
    for (const interval of intervals) {
      const intervalStart = Date.parse(interval.start || "");
      const intervalEnd = Date.parse(interval.end || "");
      if (Number.isFinite(intervalStart) && Number.isFinite(intervalEnd) &&
          intervalStart < dayEnd && intervalEnd > dayStart) {
        return {
          date,
          intervalStart:new Date(intervalStart).toISOString(),
          intervalEnd:new Date(intervalEnd).toISOString(),
          sunriseDayStart:new Date(dayStart).toISOString(),
          sunriseDayEnd:new Date(dayEnd).toISOString(),
          basis:interval.basis,
          source:"local-panchang-sunrise-to-next-sunrise"
        };
      }
    }
  }
  return null;
}
function nextCalendarDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return null;
  const value = new Date(date + "T00:00:00Z");
  if (!Number.isFinite(value.getTime())) return null;
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function findSmartaTrisparshaObservations(dailyPanchang, rule) {
  if (!rule || typeof rule !== "object") return [];
  const byDate = new Map(dailyPanchang.filter(day => day && day.date).map(day => [day.date, day]));
  const ordered = dailyPanchang.slice().filter(day => day && day.date).sort((a, b) => dateSort(a.date, b.date));
  const found = [];

  for (const day of ordered) {
    if (normalizeTithi(day.noonTithi ?? day.tithi) !== "द्वादशी") continue;
    const nextDate = nextCalendarDate(day.date);
    const nextDay = nextDate ? byDate.get(nextDate) : null;
    if (!nextDay) continue;

    const firstSunrise = day.sunriseTithi;
    const nextSunrise = nextDay.sunriseTithi;
    if (!firstSunrise || !nextSunrise ||
        normalizeTithi(firstSunrise.tithi) !== "एकादशी" ||
        normalizeTithi(nextSunrise.tithi) !== "त्रयोदशी") continue;

    const masa = normalizeMonth(day.masa);
    const paksha = normalizePaksha(day.paksha);
    const firstMasa = normalizeMonth(firstSunrise.masa || day.masa);
    const nextMasa = normalizeMonth(nextSunrise.masa || nextDay.masa);
    const firstPaksha = normalizePaksha(firstSunrise.paksha || day.paksha);
    const nextPaksha = normalizePaksha(nextSunrise.paksha || nextDay.paksha);
    if (!masa.month || !paksha ||
        firstMasa.month !== masa.month || firstMasa.adhika !== masa.adhika ||
        nextMasa.month !== masa.month || nextMasa.adhika !== masa.adhika ||
        firstPaksha !== paksha || nextPaksha !== paksha) continue;

    const sunriseStart = Date.parse(day.sunrise || "");
    const sunriseEnd = Date.parse(nextDay.sunrise || "");
    const dwadashiStart = Date.parse(day.noonTithiStartTime || day.tithiStartTime || "");
    const dwadashiEnd = Date.parse(day.noonTithiEndTime || day.tithiEndTime || "");
    if (![sunriseStart, sunriseEnd, dwadashiStart, dwadashiEnd].every(Number.isFinite) ||
        !(sunriseStart < dwadashiStart && dwadashiStart < dwadashiEnd && dwadashiEnd < sunriseEnd)) continue;

    // When the engine exposes both sunrise and noon boundaries, they must
    // agree within one minute; missing boundary detail does not invent a value.
    const ekadashiEnd = Date.parse(firstSunrise.tithiEndTime || "");
    const trayodashiStart = Date.parse(nextSunrise.tithiStartTime || "");
    if (Number.isFinite(ekadashiEnd) && Math.abs(ekadashiEnd - dwadashiStart) > 60_000) continue;
    if (Number.isFinite(trayodashiStart) && Math.abs(trayodashiStart - dwadashiEnd) > 60_000) continue;

    found.push({
      id: "trisparsha",
      name: rule.name || "त्रिस्पर्शा महाद्वादशी",
      tradition: rule.tradition || "smarta",
      month: masa.month,
      paksha,
      adhika: masa.adhika,
      observanceDate: day.date,
      followingSunriseDate: nextDay.date,
      firstSunriseTime: new Date(sunriseStart).toISOString(),
      dwadashiStartTime: new Date(dwadashiStart).toISOString(),
      dwadashiEndTime: new Date(dwadashiEnd).toISOString(),
      followingSunriseTime: new Date(sunriseEnd).toISOString(),
      tithiSequence: ["एकादशी", "द्वादशी", "त्रयोदशी"],
      source: rule.source || "धर्मसिंधु एवं निर्णयसिंधु",
      sourceUrl: rule.sourceUrl || null,
      scriptureSource: rule.scriptureSource || null,
      status: "candidate-needs-manual-review"
    });
  }
  return found;
}

function findPakshavardhiniObservations(dailyPanchang) {
  const ordered = dailyPanchang.filter(day => day && day.date && day.sunrise && day.sunriseTithi)
    .slice().sort((a,b) => dateSort(a.date,b.date));
  const found = [];
  for (let index=0; index<ordered.length-1; index+=1) {
    const first = ordered[index];
    const second = ordered[index+1];
    if (nextCalendarDate(first.date) !== second.date) continue;
    const boundaryTithi = normalizeTithi(first.sunriseTithi.tithi);
    if (!["पूर्णिमा","अमावस्या"].includes(boundaryTithi) ||
        normalizeTithi(second.sunriseTithi.tithi) !== boundaryTithi) continue;
    const masa = normalizeMonth(first.sunriseTithi.masa || first.masa);
    const nextMasa = normalizeMonth(second.sunriseTithi.masa || second.masa);
    const paksha = normalizePaksha(first.sunriseTithi.paksha || first.paksha);
    const nextPaksha = normalizePaksha(second.sunriseTithi.paksha || second.paksha);
    if (!masa.month || masa.month !== nextMasa.month || masa.adhika !== nextMasa.adhika ||
        !paksha || paksha !== nextPaksha ||
        (boundaryTithi === "पूर्णिमा" && paksha !== "शुक्ल") ||
        (boundaryTithi === "अमावस्या" && paksha !== "कृष्ण")) continue;

    const firstSunrise = Date.parse(first.sunrise);
    const secondSunrise = Date.parse(second.sunrise);
    const firstStart = Date.parse(first.sunriseTithi.tithiStartTime || "");
    const firstEnd = Date.parse(first.sunriseTithi.tithiEndTime || "");
    const secondStart = Date.parse(second.sunriseTithi.tithiStartTime || "");
    const secondEnd = Date.parse(second.sunriseTithi.tithiEndTime || "");
    if (![firstSunrise,secondSunrise,firstStart,firstEnd,secondStart,secondEnd].every(Number.isFinite)) continue;
    const intervalStart = Math.max(firstStart,secondStart);
    const intervalEnd = Math.min(firstEnd,secondEnd);
    if (!(intervalStart <= firstSunrise && intervalEnd > secondSunrise)) continue;

    const firstNumber = Date.parse(first.date+"T00:00:00Z");
    const precedingDwadashi = ordered.filter(day => {
      const dateNumber = Date.parse(day.date+"T00:00:00Z");
      const distance = (firstNumber-dateNumber)/86400000;
      if (!(distance > 0 && distance <= 3)) return false;
      const dayMasa = normalizeMonth(day.sunriseTithi?.masa || day.masa);
      const dayPaksha = normalizePaksha(day.sunriseTithi?.paksha || day.paksha);
      return dayMasa.month === masa.month && dayMasa.adhika === masa.adhika &&
        dayPaksha === paksha &&
        (normalizeTithi(day.noonTithi ?? day.tithi) === "द्वादशी" ||
         normalizeTithi(day.sunriseTithi?.tithi) === "द्वादशी");
    }).sort((a,b)=>dateSort(a.date,b.date))[0];
    if (!precedingDwadashi) continue;

    found.push({
      id:"mahadwadashi-smarta-pakshavardhini",
      name:"पक्षवर्द्धिनी महाद्वादशी",
      sourceProfile:"smartaDharmaSindhu",
      source:"नारद पुराण एवं धर्मसिंधु; Drik Panchang cross-check",
      sourceUrl:"https://www.drikpanchang.com/dwadashi/mahadwadashi/pakshavarddhini-mahadwadashi.html",
      month:masa.month,
      paksha,
      adhika:masa.adhika,
      fortnightTithi:boundaryTithi,
      firstBoundarySunriseDate:first.date,
      secondBoundarySunriseDate:second.date,
      firstSunriseTime:new Date(firstSunrise).toISOString(),
      secondSunriseTime:new Date(secondSunrise).toISOString(),
      boundaryTithiStartTime:new Date(intervalStart).toISOString(),
      boundaryTithiEndTime:new Date(intervalEnd).toISOString(),
      observanceDate:precedingDwadashi.date,
      status:"candidate-needs-manual-review"
    });
  }
  return found;
}

function findConsecutiveSunriseMahadwadashiObservations(dailyPanchang) {
  const ordered = dailyPanchang.filter(day => day && day.date && day.sunrise && day.sunriseTithi)
    .slice().sort((a,b) => dateSort(a.date,b.date));
  const found = [];
  for (let index=0; index<ordered.length-1; index+=1) {
    const first = ordered[index];
    const second = ordered[index+1];
    if (nextCalendarDate(first.date) !== second.date) continue;
    const firstTithi = normalizeTithi(first.sunriseTithi.tithi);
    const secondTithi = normalizeTithi(second.sunriseTithi.tithi);
    if (firstTithi !== secondTithi || !["एकादशी","द्वादशी"].includes(firstTithi)) continue;
    const firstMasa = normalizeMonth(first.sunriseTithi.masa || first.masa);
    const secondMasa = normalizeMonth(second.sunriseTithi.masa || second.masa);
    const firstPaksha = normalizePaksha(first.sunriseTithi.paksha || first.paksha);
    const secondPaksha = normalizePaksha(second.sunriseTithi.paksha || second.paksha);
    if (!firstMasa.month || firstMasa.month !== secondMasa.month ||
        firstMasa.adhika !== secondMasa.adhika || firstPaksha !== secondPaksha) continue;
    const firstSunrise = Date.parse(first.sunrise);
    const secondSunrise = Date.parse(second.sunrise);
    const firstStart = Date.parse(first.sunriseTithi.tithiStartTime || "");
    const firstEnd = Date.parse(first.sunriseTithi.tithiEndTime || "");
    const secondStart = Date.parse(second.sunriseTithi.tithiStartTime || "");
    const secondEnd = Date.parse(second.sunriseTithi.tithiEndTime || "");
    if (![firstSunrise,secondSunrise,firstStart,firstEnd,secondStart,secondEnd].every(Number.isFinite)) continue;
    const intervalStart = Math.max(firstStart,secondStart);
    const intervalEnd = Math.min(firstEnd,secondEnd);
    if (!(intervalStart <= firstSunrise && intervalEnd > secondSunrise)) continue;

    const isEkadashi = firstTithi === "एकादशी";
    const id = isEkadashi ? "unmilini" : "vanjuli";
    found.push({
      id:"mahadwadashi-smarta-" + id,
      name:isEkadashi ? "उन्मीलिनी महाद्वादशी" : "वंजुली महाद्वादशी",
      sourceProfile:"smartaDharmaSindhu",
      source:"धर्मसिंधु एवं निर्णयसिंधु; Drik Panchang cross-check",
      sourceUrl:isEkadashi
        ? "https://www.drikpanchang.com/dwadashi/mahadwadashi/unmilini-mahadwadashi.html"
        : "https://www.drikpanchang.com/dwadashi/mahadwadashi/vanjuli-mahadwadashi.html",
      month:firstMasa.month,
      paksha:firstPaksha,
      adhika:firstMasa.adhika,
      tithi:firstTithi,
      firstSunriseDate:first.date,
      secondSunriseDate:second.date,
      observanceDate:isEkadashi ? second.date : first.date,
      firstSunriseTime:new Date(firstSunrise).toISOString(),
      secondSunriseTime:new Date(secondSunrise).toISOString(),
      tithiStartTime:new Date(intervalStart).toISOString(),
      tithiEndTime:new Date(intervalEnd).toISOString(),
      status:"candidate-needs-manual-review"
    });
  }
  return found;
}

const NAKSHATRA_NAMES = [
  "अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशीर्ष","आर्द्रा","पुनर्वसु","पुष्य",
  "आश्लेषा","मघा","पूर्वाफाल्गुनी","उत्तराफाल्गुनी","हस्त","चित्रा","स्वाती",
  "विशाखा","अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण",
  "धनिष्ठा","शतभिषा","पूर्वाभाद्रपदा","उत्तराभाद्रपदा","रेवती"
];
const NAKSHATRA_ENGLISH = [
  "ashwini","bharani","krittika","rohini","mrigashira","ardra","punarvasu","pushya",
  "ashlesha","magha","purva phalguni","uttara phalguni","hasta","chitra","swati",
  "vishakha","anuradha","jyeshtha","mula","purva ashadha","uttara ashadha","shravana",
  "dhanishta","shatabhisha","purva bhadrapada","uttara bhadrapada","revati"
];

function normalizeNakshatra(value) {
  if (value && typeof value === "object") {
    const index = Number(value.index);
    if (Number.isInteger(index) && index >= 0 && index < NAKSHATRA_NAMES.length) {
      return NAKSHATRA_NAMES[index];
    }
    value = value.name ?? value.label ?? value.value ?? "";
  }
  const text = String(value || "").normalize("NFC").trim().toLocaleLowerCase("hi");
  const hindi = NAKSHATRA_NAMES.find(name => text.includes(name));
  if (hindi) return hindi;
  const englishIndex = NAKSHATRA_ENGLISH.findIndex(name => text.includes(name));
  return englishIndex >= 0 ? NAKSHATRA_NAMES[englishIndex] : "";
}

const MAHADWADASHI_NAMES = {
  jaya:"जया महाद्वादशी",
  vijaya:"विजया महाद्वादशी",
  jayanti:"जयन्ती महाद्वादशी",
  aparajita:"अपराजिता महाद्वादशी",
  papanashini:"पापनाशिनी महाद्वादशी"
};

function findDwadashiNakshatraObservations(dailyPanchang, sourceVariants) {
  if (!Array.isArray(sourceVariants)) return [];
  const found = [];
  const seen = new Set();
  for (const day of dailyPanchang) {
    if (!day || !day.date || !Array.isArray(day.tithiIntervals) ||
        !Array.isArray(day.nakshatraIntervals)) continue;
    const masa = normalizeMonth(day.masa);
    const dayPaksha = normalizePaksha(day.paksha);
    for (const variant of sourceVariants) {
      if (!variant || !variant.id || !variant.criteria || typeof variant.criteria !== "object") continue;
      for (const [ruleId, criterion] of Object.entries(variant.criteria)) {
        if (!MAHADWADASHI_NAMES[ruleId]) continue;
        const criterionText = String(criterion || "");
        if (!/द्वादशी/.test(criterionText)) continue;
        const requiredPaksha = normalizePaksha(criterionText);
        if (!dayPaksha || (requiredPaksha && requiredPaksha !== dayPaksha)) continue;
        const requiredNakshatra = normalizeNakshatra(criterionText.split("+").pop());
        if (!requiredNakshatra) continue;
        for (const tithi of day.tithiIntervals) {
          if (normalizeTithi(tithi.tithi) !== "द्वादशी" ||
              normalizePaksha(tithi.paksha) !== dayPaksha) continue;
          const tithiStart = Date.parse(tithi.startTime || "");
          const tithiEnd = Date.parse(tithi.endTime || "");
          if (!Number.isFinite(tithiStart) || !Number.isFinite(tithiEnd) || tithiEnd <= tithiStart) continue;
          for (const nakshatra of day.nakshatraIntervals) {
            if (normalizeNakshatra(nakshatra) !== requiredNakshatra) continue;
            const nakshatraStart = Date.parse(nakshatra.startTime || "");
            const nakshatraEnd = Date.parse(nakshatra.endTime || "");
            if (!Number.isFinite(nakshatraStart) || !Number.isFinite(nakshatraEnd) || nakshatraEnd <= nakshatraStart) continue;
            const sunrise = Date.parse(day.sunrise || "");
            const sunset = Date.parse(day.sunset || "");
            const coversFullDaylight = Number.isFinite(sunrise) && Number.isFinite(sunset) &&
              sunset > sunrise && tithiStart <= sunrise && tithiEnd >= sunset &&
              nakshatraStart <= sunrise && nakshatraEnd >= sunset;
            if (variant.timing === "sunrise-to-sunset" && !coversFullDaylight) continue;
            const start = variant.timing === "sunrise-to-sunset"
              ? Math.max(tithiStart, nakshatraStart, sunrise)
              : Math.max(tithiStart, nakshatraStart);
            const end = variant.timing === "sunrise-to-sunset"
              ? Math.min(tithiEnd, nakshatraEnd, sunset)
              : Math.min(tithiEnd, nakshatraEnd);
            if (end <= start) continue;
            const key = [variant.id, ruleId, day.date, start, end].join("|");
            if (seen.has(key)) continue;
            seen.add(key);
            found.push({
              id:"mahadwadashi-" + variant.id + "-" + ruleId,
              name:MAHADWADASHI_NAMES[ruleId],
              sourceProfile:variant.id,
              source:variant.source || variant.id,
              sourceUrl:variant.sourceUrl || null,
              month:masa.month,
              paksha:dayPaksha,
              adhika:masa.adhika,
              observanceDate:day.date,
              nakshatra:requiredNakshatra,
              tithiStartTime:new Date(tithiStart).toISOString(),
              tithiEndTime:new Date(tithiEnd).toISOString(),
              nakshatraStartTime:new Date(nakshatraStart).toISOString(),
              nakshatraEndTime:new Date(nakshatraEnd).toISOString(),
              overlapStartTime:new Date(start).toISOString(),
              overlapEndTime:new Date(end).toISOString(),
              overlapMinutes:(end-start)/60000,
              meetsOneMuhurta:end-start >= 48*60000,
              coversFullDaylight,
              status:"candidate-needs-manual-review"
            });
          }
        }
      }
    }
  }
  return found;
}


/**
 * Detect the general Shravana Yoga Dwadashi in either paksha.
 * This is deliberately separate from Mahadwadashi and from the
 * Bhadrapada Shukla Vishnushrinkhala fast-date resolver: it records only
 * local Dwadashi–Shravana overlap within each sunrise-to-next-sunrise day.
 */
function findGeneralDwadashiYogaObservations(dailyPanchang, rule) {
  if (!rule || typeof rule !== "object") return [];
  const minimumOverlapMs = Number.isFinite(Number(rule.minimumOverlapMinutes))
    ? Math.max(0, Number(rule.minimumOverlapMinutes)) * 60_000
    : 48 * 60_000;
  const byDate = new Map(
    dailyPanchang.filter(day => day && day.date).map(day => [day.date, day])
  );
  const ordered = dailyPanchang.filter(day => day && day.date && day.sunrise)
    .slice().sort((a,b) => dateSort(a.date,b.date));
  const found = [];

  for (const day of ordered) {
    const masa = normalizeMonth(day.masa);
    const paksha = normalizePaksha(day.paksha);
    if (!masa.month || !paksha) continue;
    const nextDate = nextCalendarDate(day.date);
    const nextDay = nextDate ? byDate.get(nextDate) : null;
    const dayStart = Date.parse(day.sunrise || "");
    const dayEnd = Date.parse(nextDay?.sunrise || "");
    if (!Number.isFinite(dayStart) || !Number.isFinite(dayEnd) || dayEnd <= dayStart) continue;

    const dwadashis = (Array.isArray(day.tithiIntervals) ? day.tithiIntervals : [])
      .map(row => ({
        start: Date.parse(row?.startTime || ""),
        end: Date.parse(row?.endTime || ""),
        paksha: normalizePaksha(row?.paksha || day.paksha),
        tithi: normalizeTithi(row?.tithi)
      }))
      .filter(row => Number.isFinite(row.start) && Number.isFinite(row.end) &&
        row.end > row.start && row.paksha === paksha && row.tithi === "द्वादशी")
      .map(row => ({
        start: Math.max(row.start, dayStart),
        end: Math.min(row.end, dayEnd)
      }))
      .filter(row => row.end > row.start)
      .sort((a,b) => a.start-b.start);

    if (!dwadashis.length) continue;

    const shravanas = (Array.isArray(day.nakshatraIntervals) ? day.nakshatraIntervals : [])
      .filter(row => normalizeNakshatra(row) === "श्रवण")
      .map(row => ({
        start: Date.parse(row?.startTime || ""),
        end: Date.parse(row?.endTime || "")
      }))
      .filter(row => Number.isFinite(row.start) && Number.isFinite(row.end) && row.end > row.start)
      .map(row => ({
        start: Math.max(row.start, dayStart),
        end: Math.min(row.end, dayEnd)
      }))
      .filter(row => row.end > row.start)
      .sort((a,b) => a.start-b.start);

    const segments = [];
    for (const tithi of dwadashis) for (const nakshatra of shravanas) {
      const start = Math.max(tithi.start, nakshatra.start);
      const end = Math.min(tithi.end, nakshatra.end);
      if (end > start) segments.push({start,end});
    }
    segments.sort((a,b) => a.start-b.start);
    const merged = [];
    for (const item of segments) {
      const last = merged[merged.length-1];
      if (last && item.start <= last.end + 1_000) {
        if (item.end > last.end) last.end = item.end;
      } else {
        merged.push({start:item.start,end:item.end});
      }
    }
    const overlapMs = merged.reduce((sum,item) => sum + item.end-item.start,0);
    const meetsOneMuhurta = overlapMs >= minimumOverlapMs;
    found.push({
      id: rule.id || "shravana-yoga-dwadashi",
      name: rule.name || "श्रवण योग द्वादशी",
      source: rule.source || "धर्मसिंधु; Drik Panchang cross-check",
      sourceUrl: rule.sourceUrl || null,
      month: masa.month,
      paksha,
      adhika: masa.adhika,
      observanceDate: day.date,
      vrataDayStart: new Date(dayStart).toISOString(),
      vrataDayEnd: new Date(dayEnd).toISOString(),
      dwadashiIntervals: dwadashis.map(item => ({
        start:new Date(item.start).toISOString(),
        end:new Date(item.end).toISOString()
      })),
      shravanaIntervals: shravanas.map(item => ({
        start:new Date(item.start).toISOString(),
        end:new Date(item.end).toISOString()
      })),
      overlapIntervals: merged.map(item => ({
        start:new Date(item.start).toISOString(),
        end:new Date(item.end).toISOString()
      })),
      overlapMs,
      overlapMinutes: overlapMs/60_000,
      minimumOverlapMs,
      meetsOneMuhurta,
      status: meetsOneMuhurta ? "candidate-needs-manual-review" : "not-qualified",
      dateSelection: "evidence-only-no-fast-date-selected",
      autoApproved: false
    });
  }
  return found;
}

function unique(values) {
  const seen = new Set();
  return values.filter(value => {
    const key = String(value || "").normalize("NFC").replace(/[\s\-–—।,;:]+/g, "").toLocaleLowerCase("hi");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildDwadashiCalendar(dailyPanchang, rules) {
  if (!Array.isArray(dailyPanchang)) throw new TypeError("dailyPanchang must be an array");
  const catalog = rules && rules.unifiedTithiIndex && Array.isArray(rules.unifiedTithiIndex.tithis)
    ? rules.unifiedTithiIndex.tithis : [];
  const year = Number(dailyPanchang.find(day => day && day.date)?.date?.slice(0, 4));
  const targetYearPrefix = Number.isFinite(year) ? String(year) + "-" : "";
  const groups = new Map();
  const groupBuckets = new Map();
  const trisparshaCandidates = findSmartaTrisparshaObservations(dailyPanchang, rules?.mahaDwadashi?.trisparshaSmarta);
  const consecutiveSunriseMahadwadashiCandidates = findConsecutiveSunriseMahadwadashiObservations(dailyPanchang);
  const pakshavardhiniCandidates = findPakshavardhiniObservations(dailyPanchang);
  const nakshatraMahadwadashiCandidates = findDwadashiNakshatraObservations(
    dailyPanchang, rules?.mahaDwadashi?.sourceVariants
  );
  const generalDwadashiYogaCandidates = findGeneralDwadashiYogaObservations(
    dailyPanchang, rules?.generalDwadashiYogas?.shravana
  );

  // Process observations chronologically so separate lunar occurrences of
  // the same masa/paksha never collapse into one annual record.
  dailyPanchang.slice().sort((a, b) => dateSort(a?.date, b?.date)).forEach(day => {
    if (!day || !String(day.date || "").startsWith(targetYearPrefix)) return;
    const sunrise = day && day.sunriseTithi;
    const atSunrise = !!sunrise && normalizeTithi(sunrise.tithi) === "द्वादशी";
    const noonTithi = day && (day.noonTithi ?? day.tithi);
    const atNoon = normalizeTithi(noonTithi) === "द्वादशी";
    if (!atSunrise && !atNoon) return;
    const masa = normalizeMonth(atSunrise ? (sunrise.masa || day.masa) : day.masa);
    const paksha = normalizePaksha(atSunrise ? (sunrise.paksha || day.paksha) : day.paksha);
    if (!masa.month || !paksha || !/^\d{4}-\d{2}-\d{2}$/.test(String(day.date || ""))) return;
    const baseKey = [masa.month, paksha, masa.adhika ? "adhika" : "nija"].join("|");
    const bucket = groupBuckets.get(baseKey) || [];
    const dayNumber = Date.parse(day.date + "T00:00:00Z");
    let group = bucket.length ? bucket[bucket.length - 1] : null;
    const lastDate = group && group.lastObservationDate;
    const lastNumber = lastDate ? Date.parse(lastDate + "T00:00:00Z") : NaN;
    const dayGap = Number.isFinite(dayNumber) && Number.isFinite(lastNumber)
      ? Math.round((dayNumber - lastNumber) / 86400000) : Infinity;

    // A single Dwadashi tithi can touch only a short run of civil dates.
    // A gap greater than 3 days therefore starts a distinct lunar occurrence.
    if (!group || dayGap > 3) {
      const occurrence = bucket.length + 1;
      const baseId = MONTH_SLUGS[masa.month] + "-" +
        (paksha === "कृष्ण" ? "krishna" : "shukla") + (masa.adhika ? "-adhika" : "");
      group = {
        id: baseId + (occurrence > 1 ? "-occurrence-" + occurrence : ""),
        baseKey,
        occurrence,
        month: masa.month,
        paksha,
        adhika: masa.adhika,
        sunriseDates: [],
        noonDates: [],
        sunriseObservations: [],
        noonObservations: [],
        drik2026Entry: null,
        drikSpecialEntries: [],
        referenceDate: null
      };
      bucket.push(group);
      groupBuckets.set(baseKey, bucket);
      groups.set(baseKey + "|occurrence|" + occurrence, group);
    }
    group.lastObservationDate = day.date;
    if (atSunrise) {
      group.sunriseDates.push(day.date);
      group.sunriseObservations.push({
        date: day.date,
        sunrise: day.sunrise || null,
        tithiStartTime: sunrise.tithiStartTime || null,
        tithiEndTime: sunrise.tithiEndTime || null
      });
    }
    if (atNoon) {
      group.noonDates.push(day.date);
      group.noonObservations.push({
        date: day.date,
        tithiStartTime: day.noonTithiStartTime || day.tithiStartTime || null,
        tithiEndTime: day.noonTithiEndTime || day.tithiEndTime || null
      });
    }
  });

  const ensureEmptyGroup = (month, paksha, adhika = false, referenceDate = null, sourceEntry = null, sourceKind = null) => {
    const baseKey = [month, paksha, adhika ? "adhika" : "nija"].join("|");
    const bucket = groupBuckets.get(baseKey) || [];
    let target = null;
    const associationDate = referenceDate || sourceEntry?.observanceDate || null;
    if (associationDate) {
      const associationNumber = Date.parse(associationDate + "T00:00:00Z");
      const matches = bucket.map(group => {
        const dates = unique(group.sunriseDates.concat(group.noonDates));
        const exact = dates.includes(associationDate);
        const overlap = !!referenceDate && !exact &&
          !!findDwadashiIntervalOnSunriseDay(dailyPanchang, referenceDate, month, paksha, adhika);
        const distance = dates.length && Number.isFinite(associationNumber)
          ? Math.min(...dates.map(date => Math.abs(Date.parse(date + "T00:00:00Z") - associationNumber) / 86400000))
          : Infinity;
        return {group, exact, overlap, distance};
      }).filter(item => item.exact || item.overlap || item.distance <= 3)
        .sort((a, b) => (a.exact ? -1 : a.overlap ? -1 : 0) - (b.exact ? -1 : b.overlap ? -1 : 0) || a.distance - b.distance);
      target = matches[0]?.group || null;
    }
    if (!target && bucket.length === 0) {
      const baseId = MONTH_SLUGS[month] + "-" + (paksha === "कृष्ण" ? "krishna" : "shukla") + (adhika ? "-adhika" : "");
      target = {
        id: baseId, baseKey, occurrence: 1, month, paksha, adhika,
        referenceDate: null, sunriseDates: [], noonDates: [],
        sunriseObservations: [], noonObservations: [],
        drik2026Entry: null, drikSpecialEntries: []
      };
      bucket.push(target);
      groupBuckets.set(baseKey, bucket);
      groups.set(baseKey + "|occurrence|1", target);
    } else if (!target && referenceDate) {
      const unusedCatalogueRow = bucket.length === 1 &&
        !bucket[0].sunriseDates.length && !bucket[0].noonDates.length &&
        !bucket[0].drik2026Entry && !bucket[0].drikSpecialEntries.length &&
        !bucket[0].referenceDate;
      if (unusedCatalogueRow) {
        // Reuse the catalogue placeholder instead of creating a duplicate.
        target = bucket[0];
      } else {
        // Keep a source reference as its own review row when it cannot be
        // safely associated with any locally observed occurrence.
        const occurrence = bucket.length + 1;
        const baseId = MONTH_SLUGS[month] + "-" + (paksha === "कृष्ण" ? "krishna" : "shukla") + (adhika ? "-adhika" : "");
        target = {
          id: baseId + "-occurrence-" + occurrence, baseKey, occurrence,
          month, paksha, adhika, referenceDate,
          sunriseDates: [], noonDates: [], sunriseObservations: [], noonObservations: [],
          drik2026Entry: null, drikSpecialEntries: []
        };
        bucket.push(target);
        groupBuckets.set(baseKey, bucket);
        groups.set(baseKey + "|occurrence|" + occurrence, target);
      }
    }
    if (!target) target = bucket[0];
    if (referenceDate && target) target.referenceDate = referenceDate;
    if (sourceKind === "drik2026" && target) target.drik2026Entry = sourceEntry;
    if (sourceKind === "special" && target && sourceEntry &&
        !target.drikSpecialEntries.some(item => item.referenceDate === sourceEntry.referenceDate && item.labels?.join("|") === sourceEntry.labels?.join("|"))) {
      target.drikSpecialEntries.push(sourceEntry);
    }
  };

  // Keep regular master month-paksha records visible every year. Adhika
  // catalogue rows are only applicable when that Adhika month occurs inside
  // this scan window; otherwise they create false "needs-observation" rows.
  const scannedAdhikaMonths = new Set();
  dailyPanchang.forEach(day => {
    const masa = normalizeMonth(day?.sunriseTithi?.masa || day?.masa);
    if (masa.month && masa.adhika) scannedAdhikaMonths.add(masa.month);
  });
  catalog.forEach(item => {
    const masa = normalizeMonth(item.month);
    const paksha = normalizePaksha(item.paksha);
    const adhika = !!item.adhika || masa.adhika;
    if (masa.month && paksha && (!adhika || scannedAdhikaMonths.has(masa.month))) {
      ensureEmptyGroup(masa.month, paksha, adhika);
    }
  });

  // Preserve user-approved 2026 Drik cross-references as review-only records
  // when the local scan has no observation for that month/paksha.
  if (year === 2026 && rules && Array.isArray(rules.drik2026Calendar)) {
    rules.drik2026Calendar.forEach(item => {
      const masa = normalizeMonth(item.month);
      const paksha = normalizePaksha(item.paksha);
      if (masa.month && paksha) {
        ensureEmptyGroup(masa.month, paksha, !!item.adhika, item.referenceDate || null, item, "drik2026");
      }
    });
  }

  if (rules && Array.isArray(rules.drikSpecialObservances)) {
    rules.drikSpecialObservances.filter(item => Number(item.year) === year).forEach(item => {
      const masa = normalizeMonth(item.month);
      const paksha = normalizePaksha(item.paksha);
      if (masa.month && paksha) ensureEmptyGroup(masa.month, paksha, !!item.adhika, item.referenceDate || null, item, "special");
    });
  }

  const tithis = Array.from(groups.values()).map(group => {
    group.sunriseDates = unique(group.sunriseDates).sort(dateSort);
    group.noonDates = unique(group.noonDates).sort(dateSort);
    group.sunriseObservations.sort((a, b) => dateSort(a.date, b.date));
    group.noonObservations.sort((a, b) => dateSort(a.date, b.date));
    // Keep sunrise and noon observations separately. Named Dwadashi
    // observances can follow vrata-specific rules, so neither observation
    // alone overrides an available source reference date.
    const candidateDates = unique(group.sunriseDates.concat(group.noonDates)).sort(dateSort);
    const source = catalog.find(item =>
      item.month === group.month &&
      item.paksha === group.paksha &&
      !!item.adhika === !!group.adhika
    );
    const observances = source && Array.isArray(source.observances) ? source.observances : [];
    const drik2026Entry = group.drik2026Entry || null;
    const drikSpecialEntries = group.drikSpecialEntries || [];
    const specialTithiYogas = trisparshaCandidates.filter(item =>
      item.month === group.month && item.paksha === group.paksha &&
      !!item.adhika === !!group.adhika && group.noonDates.includes(item.observanceDate)
    ).concat(consecutiveSunriseMahadwadashiCandidates.filter(item =>
      item.month === group.month && item.paksha === group.paksha &&
      !!item.adhika === !!group.adhika &&
      candidateDates.some(date => Math.abs(Date.parse(date+"T00:00:00Z")-Date.parse(item.observanceDate+"T00:00:00Z")) <= 86400000)
    )).concat(pakshavardhiniCandidates.filter(item =>
      item.month === group.month && item.paksha === group.paksha &&
      !!item.adhika === !!group.adhika && candidateDates.includes(item.observanceDate)
    )).concat(nakshatraMahadwadashiCandidates.filter(item =>
      item.month === group.month && item.paksha === group.paksha &&
      !!item.adhika === !!group.adhika && candidateDates.includes(item.observanceDate)
    ));
    const drikReferenceDate = group.referenceDate || drik2026Entry?.referenceDate || drikSpecialEntries.find(item => item.referenceDate)?.referenceDate || null;
    const sourceReferenceObservation = drikReferenceDate && !candidateDates.includes(drikReferenceDate)
      ? findDwadashiIntervalOnSunriseDay(dailyPanchang, drikReferenceDate, group.month, group.paksha, group.adhika)
      : null;
    const drikLabels = unique(
      (Array.isArray(drik2026Entry?.labels) ? drik2026Entry.labels : [])
        .concat(drikSpecialEntries.flatMap(item => Array.isArray(item.labels) ? item.labels : []))
    );
    const names = unique(
      observances.map(item => item.name)
        .concat(source && Array.isArray(source.displayNames) ? source.displayNames : [])
    );
    return {
      id: group.id,
      occurrence: group.occurrence || 1,
      month: group.month,
      paksha: group.paksha,
      adhika: group.adhika,
      tithi: "द्वादशी",
      sunriseDates: group.sunriseDates,
      noonDates: group.noonDates,
      sunriseObservations: group.sunriseObservations,
      noonObservations: group.noonObservations,
      candidateDates,
      referenceDate: drikReferenceDate,
      sourceReferenceObservation,
      drikLabels,
      drik2026Labels: year === 2026 && Array.isArray(drik2026Entry?.labels) ? unique(drik2026Entry.labels) : [],
      drik2026SourceUrl: year === 2026 ? (drik2026Entry?.sourceUrl || null) : null,
      drikSpecialObservances: drikSpecialEntries.map(item => {
        const observanceDate = item.observanceDate || item.referenceDate || null;
        const localPanchangObservation = observanceDate && !candidateDates.includes(observanceDate)
          ? findDwadashiIntervalOnSunriseDay(dailyPanchang, observanceDate, group.month, group.paksha, group.adhika)
          : null;
        return {
          ...item,
          ...(localPanchangObservation ? {localPanchangObservation} : {}),
          source:"Drik Panchang",
          sourceUrl:item.sourcePage === "smarta-ekadashi"
            ? "https://www.drikpanchang.com/ekadashi/ekadashi-dates.html?year=" + year + "&geoname-id=1259503"
            : "https://www.drikpanchang.com/dwadashi/dwadashi-dates.html?year=" + year + "&geoname-id=1259503",
          status:"source-cross-reference-needs-local-rule-review"
        };
      }),
      selectedDate: drikReferenceDate
        ? (candidateDates.includes(drikReferenceDate) || sourceReferenceObservation ? drikReferenceDate : null)
        : candidateDates.length === 1
          ? candidateDates[0]
          : null,
      dateSelection: drikReferenceDate && candidateDates.includes(drikReferenceDate)
        ? "source-reference-date-candidate-review-required"
        : specialTithiYogas.length && candidateDates.length === 1 && candidateDates[0] === specialTithiYogas[0].observanceDate
          ? "trisparsha-mahadwadashi-candidate-review-required"
        : drikReferenceDate && sourceReferenceObservation
          ? "source-reference-date-tithi-overlap-review-required"
          : drikReferenceDate && candidateDates.length && !candidateDates.includes(drikReferenceDate)
          ? "reference-date-outside-local-observations-review-required"
          : candidateDates.length === 1
            ? "single-observation-candidate-review-required"
            : candidateDates.length > 1
              ? "requires-vrata-specific-rule"
              : drikReferenceDate
                ? "reference-date-awaiting-local-observation"
                : "no-observation-in-scan-window",
      displayNames: names,
      observances,
      specialTithiYogas,
      // Conditional Mahadwadashi and calendar cross-reference labels are
      // preserved as metadata; they are not displayed as permanent names.
      conditionalObservances: source && Array.isArray(source.conditionalObservances) ? source.conditionalObservances : [],
      crossReferences: source && Array.isArray(source.crossReferences) ? source.crossReferences : [],
      status: candidateDates.length
        ? "needs-review"
        : drikReferenceDate
          ? "needs-local-observation"
          : "needs-observation"
    };
  }).sort((a, b) => {
    const monthOrder = MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    if (monthOrder) return monthOrder;
    if (a.adhika !== b.adhika) return a.adhika ? -1 : 1;
    if (a.paksha !== b.paksha) return a.paksha === "कृष्ण" ? -1 : 1;
    return (a.occurrence || 1) - (b.occurrence || 1);
  });

  const tithiDateMap = new Map();
  tithis.forEach(record => {
    record.candidateDates.forEach(date => {
      const key = [date, record.month, record.paksha, record.adhika ? "adhika" : "nija"].join("|");
      if (!tithiDateMap.has(key)) tithiDateMap.set(key, {
        date, month: record.month, paksha: record.paksha, adhika: record.adhika,
        tithi: "द्वादशी", observedAtSunrise: false, observedAtNoon: false,
        sunriseObservations: [], noonObservations: []
      });
      const entry = tithiDateMap.get(key);
      if (record.sunriseDates.includes(date)) {
        entry.observedAtSunrise = true;
        entry.sunriseObservations.push(...record.sunriseObservations.filter(item => item.date === date));
      }
      if (record.noonDates.includes(date)) {
        entry.observedAtNoon = true;
        entry.noonObservations.push(...record.noonObservations.filter(item => item.date === date));
      }
    });
  });
  const tithiDates = Array.from(tithiDateMap.values()).sort((a,b) =>
    dateSort(a.date,b.date) || MONTHS.indexOf(a.month)-MONTHS.indexOf(b.month) ||
    (a.paksha === b.paksha ? 0 : a.paksha === "शुक्ल" ? -1 : 1)
  );

  return {
    schemaVersion: 1,
    year: Number.isFinite(year) ? year : null,
    status: "needs-review",
    locationSelection: "स्थान-विशिष्ट सूर्योदय",
    tithiDates,
    dateSelection: "सूर्योदय-द्वादशी केवल संभावित तारीख़ें देती है; व्रत-विशेष के नियम से चयन और स्वीकृति आवश्यक है",
    tithis,
    dwadashiYogas: generalDwadashiYogaCandidates
  };
}

export function buildChaturmasProposal(dailyPanchang, location = {}) {
  const boundarySpecs = [
    { id: "start", month: "आषाढ़", paksha: "शुक्ल", tithi: "एकादशी" },
    { id: "shak-end", month: "श्रावण", paksha: "शुक्ल", tithi: "द्वादशी" },
    { id: "dahi-end", month: "भाद्रपद", paksha: "शुक्ल", tithi: "द्वादशी" },
    { id: "doodh-end", month: "आश्विन", paksha: "शुक्ल", tithi: "द्वादशी" },
    { id: "end", month: "कार्तिक", paksha: "शुक्ल", tithi: "एकादशी" }
  ];
  const boundaries = boundarySpecs.map(spec => {
    const observations = dailyPanchang.filter(day => {
      const sunrise = day && day.sunriseTithi;
      if (!sunrise) return false;
      const masa = normalizeMonth(sunrise.masa || day.masa);
      return !masa.adhika && masa.month === spec.month &&
        normalizePaksha(sunrise.paksha || day.paksha) === spec.paksha &&
        normalizeTithi(sunrise.tithi) === spec.tithi;
    }).map(day => ({
      date: day.date,
      basis: "sunrise-tithi",
      sunrise: day.sunrise || null,
      tithiStartTime: day.sunriseTithi.tithiStartTime || null,
      tithiEndTime: day.sunriseTithi.tithiEndTime || null
    })).filter(item => item.date).sort((a, b) => dateSort(a.date, b.date));
    let observedDates = unique(observations.map(item => item.date));
    let selectedDate = observedDates[0] || null;
    let selectionBasis = selectedDate ? "udayavyapini-smarta-first-sunrise" : null;

    // Kartik Shukla Ekadashi may be the Smarta observance day even when
    // Dashami is present at that day's sunrise and Ekadashi ends before
    // the following sunrise. In that case sunrise-only matching misses it.
    if (spec.id === "end" && !selectedDate) {
      const byDate = new Map(dailyPanchang.map(day => [day.date, day]));
      const smartaCandidates = dailyPanchang.filter(day => {
        if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(String(day.date || ""))) return false;
        const masa = normalizeMonth(day.masa);
        if (masa.adhika || masa.month !== spec.month ||
            normalizePaksha(day.paksha) !== spec.paksha ||
            normalizeTithi(day.noonTithi ?? day.tithi) !== spec.tithi ||
            !(day.noonTithiStartTime || day.tithiStartTime) || !(day.noonTithiEndTime || day.tithiEndTime) || !day.sunrise) return false;
        const nextDate = new Date(day.date + "T00:00:00Z");
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        const nextKey = nextDate.toISOString().slice(0, 10);
        const nextSunrise = byDate.get(nextKey)?.sunrise;
        if (!nextSunrise) return false;
        const start = new Date(day.noonTithiStartTime || day.tithiStartTime).getTime();
        const end = new Date(day.noonTithiEndTime || day.tithiEndTime).getTime();
        const sunrise = new Date(day.sunrise).getTime();
        const followingSunrise = new Date(nextSunrise).getTime();
        return [start, end, sunrise, followingSunrise].every(Number.isFinite) &&
          start >= sunrise && end <= followingSunrise;
      }).map(day => ({
        date: day.date,
        basis: "smarta-ekadashi-between-sunrises",
        sunrise: day.sunrise,
        nextSunrise: byDate.get((() => { const d=new Date(day.date+"T00:00:00Z"); d.setUTCDate(d.getUTCDate()+1); return d.toISOString().slice(0,10); })())?.sunrise || null,
        tithiStartTime: day.noonTithiStartTime || day.tithiStartTime,
        tithiEndTime: day.noonTithiEndTime || day.tithiEndTime
      })).sort((a, b) => dateSort(a.date, b.date));
      if (smartaCandidates.length === 1) {
        observations.push(...smartaCandidates);
        observedDates = unique(observations.map(item => item.date));
        selectedDate = smartaCandidates[0].date;
        selectionBasis = "smarta-ekadashi-between-sunrises";
      }
    }
    return { ...spec, observations, observedDates, selectedDate, selectionBasis };
  });
  const missing = boundaries.filter(item => !item.selectedDate).map(item => item.id);
  const complete = missing.length === 0;
  const phases = complete ? [
    { id:"shak", title:"शाक (सब्जी) का त्याग", startDate:boundaries[0].selectedDate, endDate:boundaries[1].selectedDate, startTithi:"आषाढ़ शुक्ल एकादशी", endTithi:"श्रावण शुक्ल द्वादशी", detail:"शाक-सब्जी का त्याग करें; परंपरा के अनुसार किसी एक प्रकार की शाक का सेवन न करने का विकल्प भी है।" },
    { id:"dahi", title:"दही का त्याग", startDate:boundaries[1].selectedDate, endDate:boundaries[2].selectedDate, startTithi:"श्रावण शुक्ल द्वादशी", endTithi:"भाद्रपद शुक्ल द्वादशी", detail:"आरंभ में त्यागी गई सब्जियों का दान करें। तक्र या मट्ठा निषेध नहीं है।" },
    { id:"doodh", title:"दूध का त्याग", startDate:boundaries[2].selectedDate, endDate:boundaries[3].selectedDate, startTithi:"भाद्रपद शुक्ल द्वादशी", endTithi:"आश्विन शुक्ल द्वादशी", detail:"आरंभ में दही का दान करें।" },
    { id:"dal", title:"दालों का त्याग", startDate:boundaries[3].selectedDate, endDate:boundaries[4].selectedDate, startTithi:"आश्विन शुक्ल द्वादशी", endTithi:"कार्तिक शुक्ल एकादशी", detail:"आरंभ में दूध का दान करें; दालों अथवा किसी एक प्रकार की दाल का त्याग करें।" }
  ] : [];
  // The final dietary restriction ends on Smarta Ekadashi.
  // The vow is completed on the following Kartik Shukla Dwadashi.
  const completion = complete ? new Date(boundaries[4].selectedDate + "T00:00:00Z") : null;
  if (completion) completion.setUTCDate(completion.getUTCDate() + 1);
  const completionDate = completion ? completion.toISOString().slice(0, 10) : null;
  const visibleThrough = completion ? new Date(completion) : null;
  if (visibleThrough) visibleThrough.setUTCDate(visibleThrough.getUTCDate() + 1);
  const cardVisibleThroughDate = visibleThrough ? visibleThrough.toISOString().slice(0, 10) : null;
  const year = Number(dailyPanchang.find(day => day && day.date)?.date?.slice(0, 4));
  return {
    schemaVersion: 1,
    year: Number.isFinite(year) ? year : null,
    status: complete ? "needs-review" : "incomplete",
    selectionMethod: "udayavyapini-smarta-first-sunrise-with-kartik-ekadashi-vrata-rule",
    rulesArticleUrl: "http://ourhindudharm.blogspot.com/2014/07/About-Chaaturmaas.html",
    location: {
      name: String(location.name || ""),
      latitude: Number.isFinite(Number(location.latitude)) ? Number(location.latitude) : null,
      longitude: Number.isFinite(Number(location.longitude)) ? Number(location.longitude) : null,
      elevation: Number.isFinite(Number(location.elevation)) ? Number(location.elevation) : null,
      timezone: "Asia/Kolkata",
      timezoneOffset: 330
    },
    boundaries,
    missingBoundaries: missing,
    startDate: complete ? boundaries[0].selectedDate : null,
    endDate: complete ? boundaries[4].selectedDate : null,
    completionDate,
    cardVisibleThroughDate,
    phases
  };
}

export function buildAnnualDwadashiPackage(dailyPanchang, rules, location = {}) {
  const dwadashi = buildDwadashiCalendar(dailyPanchang, rules);
  const chaturmas = buildChaturmasProposal(dailyPanchang, location);
  return {
    schemaVersion: 1,
    year: dwadashi.year,
    status: "needs-review",
    calculationStatus: "panchang-engine-calculated",
    location: {
      name: String(location.name || ""),
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      elevation: Number(location.elevation),
      timezone: "Asia/Kolkata",
      timezoneOffset: 330
    },
    selectionPolicy: {
      dwadashiCalendar: "सूर्योदय पर द्वादशी की तारीख़ें candidate हैं; प्रत्येक व्रत के स्वतंत्र काल-नियम के बाद ही selectedDate स्वीकृत करें",
      chaturmas: "उदयव्यापिनी स्मार्त मान्यता; एकाधिक सूर्योदय-दिन हों तो प्रथम सूर्योदय-दिन",
      traditions: "एक तिथि का एक कार्ड; अनेक नाम aliases, अलग observance विवरण सुरक्षित"
    },
    tithis: dwadashi.tithis,
    tithiDates: dwadashi.tithiDates,
    dwadashiYogas: dwadashi.dwadashiYogas,
    chaturmas
  };
}
