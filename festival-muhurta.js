/*
 * OurHinduDharm festival muhurta engine.
 * Event dates stay in monthly JSON; local times are calculated at runtime.
 * Keep rule decisions isolated here so each festival can receive a reviewed rule.
 */

function validDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function interval(startValue, endValue, label, note) {
  const start = validDate(startValue);
  const end = validDate(endValue);
  if (!start || !end || end <= start) return null;
  return { label, start, end, note: note || "" };
}

function fractionInterval(startValue, endValue, from, to, label) {
  const start = validDate(startValue);
  const end = validDate(endValue);
  if (!start || !end || end <= start || from < 0 || to > 1 || to <= from) return null;
  const duration = end.getTime() - start.getTime();
  return interval(
    start.getTime() + duration * from,
    start.getTime() + duration * to,
    label
  );
}

function localWeekday(dateValue) {
  const date = validDate(dateValue);
  if (!date) return null;
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata", weekday: "short"
  }).format(date);
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 })[weekday] ?? null;
}

function rawValue(value) {
  if (value && typeof value === "object") {
    return value.name ?? value.label ?? value.value ?? value.index ?? value.number ?? "";
  }
  return value;
}

function normalizedName(value) {
  return String(rawValue(value) ?? "").normalize("NFC").toLocaleLowerCase("hi").trim();
}

function isChitra(value) {
  const name = normalizedName(value);
  const numeric = Number(rawValue(value));
  return /chitra|चित्रा/.test(name) || numeric === 13 || numeric === 14;
}

function isVaidhriti(value) {
  const name = normalizedName(value);
  const numeric = Number(rawValue(value));
  return /vaidhriti|वैधृति/.test(name) || numeric === 26 || numeric === 27;
}

function isHasta(value) {
  const name = normalizedName(value);
  const raw = value && typeof value === "object"
    ? value.index ?? value.number ?? value.value ?? value.name
    : value;
  return /hasta|हस्त/.test(name) || Number(raw) === 12;
}

function laterDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

function earlierDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() <= b.getTime() ? a : b;
}

function tithiIndex(value) {
  if (value && typeof value === "object") {
    const raw = value.index ?? value.number ?? value.value;
    if (raw !== undefined && raw !== null && raw !== "") {
      const number = Number(raw);
      if (Number.isInteger(number)) return number;
    }
  }
  const name = normalizedName(value);
  if (/dwadashi|द्वादशी/.test(name)) return 11;
  if (/ekadashi|एकादशी/.test(name)) return 10;
  if (/trayodashi|त्रयोदशी/.test(name)) return 12;
  return null;
}

function isAmavasya(value) {
  const name = normalizedName(value);
  if (/amavasya|अमावस्या/.test(name)) return true;
  const raw = value && typeof value === "object"
    ? value.index ?? value.number ?? value.value
    : value;
  return Number(raw) === 29;
}

function isPurnima(value) {
  const name = normalizedName(value);
  if (/purnima|पूर्णिमा/.test(name)) return true;
  const raw = value && typeof value === "object"
    ? value.index ?? value.number ?? value.value
    : value;
  return Number(raw) === 14;
}

function collectNamedIntervals(list, predicate) {
  if (!Array.isArray(list)) return [];
  return list.flatMap(item => {
    if (!item || !predicate(item)) return [];
    const start = validDate(item.startTime ?? item.start);
    const end = validDate(item.endTime ?? item.end);
    return start && end && end > start ? [{ start, end, item }] : [];
  }).sort((a, b) => a.start - b.start);
}

function intersectIntervals(a, b, label, note) {
  if (!a || !b) return null;
  return interval(laterDate(a.start, b.start), earlierDate(a.end, b.end), label, note);
}

function windowWithin(start, end, intervals, label, note) {
  for (const candidate of intervals) {
    const result = intersectIntervals({ start, end }, candidate, label, note);
    if (result) return result;
  }
  return null;
}

function formatDateLabel(dateValue) {
  const date = validDate(dateValue);
  return date ? new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric"
  }).format(date) : "";
}

function localDateKey(dateValue) {
  const date = validDate(dateValue);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const part = type => (parts.find(item => item.type === type) || {}).value || "";
  return part("year") + "-" + part("month") + "-" + part("day");
}

/* Dharmasindhu Yama-Dvitiya day selection. */
export function getBhaiDoojDateDecision(previousDay, currentDay, nextDay) {
  const days = [previousDay, currentDay, nextDay].map(day => ({
    sunrise: validDate(day && day.sunrise),
    sunset: validDate(day && day.sunset),
    tithis: day && Array.isArray(day.tithis) ? day.tithis : []
  }));
  if (days.some(day => !day.sunrise || !day.sunset || day.sunset <= day.sunrise)) {
    return { status: "unavailable", message: "तीनों दिनों के स्थानीय सूर्योदय-सूर्यास्त उपलब्ध नहीं हैं; पर्व-दिन का स्वतः निर्णय नहीं किया गया।" };
  }
  const keys = days.map(day => localDateKey(day.sunrise));
  const timestamps = keys.map(key => Date.parse(key + "T00:00:00Z"));
  if (timestamps.some((value, index) => index > 0 && value - timestamps[index - 1] !== 86400000)) {
    return { status: "unavailable", message: "लगातार तीन स्थानीय दिनों का पंचांग उपलब्ध नहीं है; पर्व-दिन का स्वतः निर्णय नहीं किया गया।" };
  }
  const tithis = collectNamedIntervals(days.flatMap(day => day.tithis), item => {
    const raw = item && typeof item === "object"
      ? item.index ?? item.number ?? item.value
      : item;
    return Number(raw) === 1 ||
      /shukla.*dwitiya|शुक्ल.*द्वितीया/.test(normalizedName(item));
  });
  if (!tithis.length) {
    return { status: "unavailable", message: "कार्तिक शुक्ल द्वितीया की वास्तविक अवधि उपलब्ध नहीं है; पर्व-दिन का स्वतः निर्णय नहीं किया गया।" };
  }
  const overlapsAparahna = day => {
    const duration = day.sunset.getTime() - day.sunrise.getTime();
    const start = new Date(day.sunrise.getTime() + duration * 3 / 5);
    const end = new Date(day.sunrise.getTime() + duration * 4 / 5);
    return tithis.some(tithi => tithi.end > start && tithi.start < end);
  };
  const overlaps = days.map(overlapsAparahna);
  let selectedDateKey = "";
  if (overlaps[0] && overlaps[1] && overlaps[2]) {
    return { status: "unavailable", message: "द्वितीया तीन लगातार दिनों के अपराह्ण में व्याप्त दिख रही है; सामान्य द्विदिनीय नियम से निर्णय सुरक्षित रूप से नहीं किया जा सकता।" };
  }
  if (overlaps[0] && overlaps[1]) selectedDateKey = keys[1];
  else if (overlaps[1] && overlaps[2]) selectedDateKey = keys[2];
  else if (overlaps[0]) selectedDateKey = keys[0];
  else if (overlaps[1]) selectedDateKey = keys[1];
  else if (overlaps[2]) selectedDateKey = keys[2];
  else {
    // Neither compared Aparahna is occupied: the second civil date of the
    // actual Dwitiya interval is the conservative fallback.
    const lastMoment = new Date(Math.max(...tithis.map(item => item.end.getTime())) - 1);
    selectedDateKey = localDateKey(lastMoment);
    if (!keys.includes(selectedDateKey)) {
      return { status: "unavailable", message: "अपराह्ण-व्याप्ति नहीं मिली और द्वितीया की समाप्ति इन तीन दिनों के बाहर है; पर्व-दिन निर्धारित नहीं किया गया।" };
    }
  }
  const selectedIndex = keys.indexOf(selectedDateKey);
  return {
    status: "calculated",
    selectedDate: days[selectedIndex].sunrise,
    selectedDateKey,
    previousAparahnaOverlap: overlaps[0],
    currentAparahnaOverlap: overlaps[1],
    nextAparahnaOverlap: overlaps[2],
    rule: "dharmasindhu-yama-dvitiya"
  };
}

function collectTithiIntervals(...lists) {
  const intervals = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const index = tithiIndex(item);
      const start = validDate(item.startTime ?? item.start);
      const end = validDate(item.endTime ?? item.end);
      if (index === null || !start || !end || end <= start) continue;
      if (index !== 11 && index !== 26) continue; // Shukla/Krishna Dwadashi
      const key = index + "|" + start.getTime() + "|" + end.getTime();
      if (!intervals.some(existing => existing.key === key)) {
        intervals.push({ key, index, start, end });
      }
    }
  }
  return intervals.sort((a, b) => a.start - b.start);
}

/*
 * Rule IDs are attached to event records as muhurtaRule.
 * Add a new reviewed rule here; do not store location-specific clock times in JSON.
 */
const rules = {
  "sandhi-puja"(context) {
    // संधिपूजा: अष्टमी-नवमी के वास्तविक तिथि-संधि क्षण के दोनों ओर 24-24 मिनट।
    const tithi = normalizedName(context.tithi);
    const rawTithi = rawValue(context.tithi);
    const tithiIndex = Number(rawTithi);
    let isAshtami = /अष्टमी|ashtami/i.test(tithi);
    let isNavami = /नवमी|navami/i.test(tithi);
    // Library index is zero-based in this project: Shukla/Krishna Ashtami=7/22, Navami=8/23.
    if (!isAshtami && !isNavami && Number.isFinite(tithiIndex)) {
      isAshtami = tithiIndex === 7 || tithiIndex === 22;
      isNavami = tithiIndex === 8 || tithiIndex === 23;
    }
    let boundary = null;
    if (isAshtami) {
      boundary = validDate(context.tithiEndTime);
    } else if (isNavami) {
      boundary = validDate(context.tithiStartTime);
    }
    if (!boundary) {
      return {
        label: "महाष्टमी संधिपूजा मुहूर्त",
        status: "unavailable",
        message: "अष्टमी की समाप्ति / नवमी के आरम्भ का सटीक समय उपलब्ध नहीं है; अनुमानित मुहूर्त नहीं दिखाया गया।"
      };
    }
    const start = new Date(boundary.getTime() - 24 * 60 * 1000);
    const end = new Date(boundary.getTime() + 24 * 60 * 1000);
    return {
      ...interval(start, end, "महाष्टमी संधिपूजा मुहूर्त"),
      status: "calculated",
      note: "अष्टमी के अंतिम 24 मिनट और नवमी के प्रथम 24 मिनट। तिथि-संधि का समय चयनित पंचांग-गणना पर निर्भर है।"
    };
  },

  "ghata-sthapana"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const pratipadaEnd = validDate(context.tithiEndTime);
    if (!sunrise || !sunset || !pratipadaEnd || sunset <= sunrise) {
      return {
        label: "घटस्थापना मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्योदय और प्रतिपदा की समाप्ति का समय उपलब्ध नहीं है।"
      };
    }

    let avoidUntil = sunrise;
    let missingAvoidEnd = false;
    const avoidNotes = [];
    if (isChitra(context.nakshatra)) {
      const end = validDate(context.nakshatraEndTime);
      if (end) avoidUntil = laterDate(avoidUntil, end);
      else missingAvoidEnd = true;
      avoidNotes.push("चित्रा नक्षत्र से बचने का प्रयास");
    }
    if (isVaidhriti(context.yoga)) {
      const end = validDate(context.yogaEndTime);
      if (end) avoidUntil = laterDate(avoidUntil, end);
      else missingAvoidEnd = true;
      avoidNotes.push("वैधृति योग से बचने का प्रयास");
    }

    // The preferred window is the first third of daylight, while Pratipada
    // remains in force. If the avoided yoga/nakshatra consumes that window,
    // the traditional fallback is Abhijit rather than an afternoon time.
    const firstThirdEnd = new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 3);
    const preferredStart = laterDate(sunrise, avoidUntil);
    const preferredEnd = earlierDate(firstThirdEnd, earlierDate(sunset, pratipadaEnd));
    const preferred = missingAvoidEnd
      ? null
      : interval(preferredStart, preferredEnd, "घटस्थापना मुहूर्त");
    if (preferred) {
      return {
        ...preferred,
        status: "calculated",
        note: avoidNotes.length
          ? "प्रतिपदा-व्याप्ति में; " + avoidNotes.join(" तथा ") + " करते हुए।"
          : "प्रतिपदा-व्याप्ति में स्थानीय दिनमान के अनुसार।"
      };
    }

    // If the avoided period leaves no valid window, use Abhijit only when
    // the complete interval still falls within Pratipada and daylight. This
    // project also suppresses Abhijit on Wednesday.
    if (localWeekday(context.date) === 3) {
      return {
        label: "घटस्थापना मुहूर्त",
        status: "not-applicable",
        message: "बुधवार को इस नियम के अनुसार अभिजित विकल्प लागू नहीं होता।"
      };
    }
    const fallback = fractionInterval(sunrise, sunset, 7 / 15, 8 / 15, "घटस्थापना — अभिजित मुहूर्त");
    if (fallback && fallback.start >= sunrise && fallback.end <= sunset && fallback.end <= pratipadaEnd) {
      return {
        ...fallback,
        status: "calculated",
        note: "चित्रा नक्षत्र/वैधृति योग से बचने का समय उपलब्ध न होने पर अभिजित मुहूर्त का विकल्प।"
      };
    }
    return {
      label: "घटस्थापना मुहूर्त",
      status: "unavailable",
      message: "प्रतिपदा-व्याप्ति में उपयुक्त समय उपलब्ध नहीं है; आवश्यक तिथि और योग-अवधि के बिना मुहूर्त अनुमानित नहीं किया जाएगा।"
    };
  },


  "samaveda-upakarma-aparahna"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const namedHasta = collectNamedIntervals(context.nakshatras, isHasta)[0];
    if (!sunrise || !sunset || sunset <= sunrise) {
      return {
        label: "सामवेदी उपाकर्म — अपराह्ण काल",
        status: "unavailable",
        message: "स्थानीय सूर्योदय और सूर्यास्त उपलब्ध नहीं हैं; उपाकर्म-काल की गणना नहीं की गई।"
      };
    }

    const hastaStart = namedHasta && namedHasta.start;
    const hastaEnd = namedHasta && namedHasta.end;
    if (!hastaStart || !hastaEnd || hastaEnd <= hastaStart) {
      return {
        label: "सामवेदी उपाकर्म — अपराह्ण काल",
        status: "unavailable",
        message: "हस्त नक्षत्र की आरम्भ और समाप्ति अवधि उपलब्ध नहीं है; अनुमानित समय नहीं दिखाया गया।"
      };
    }

    // Sāmaveda Upākarma is an Aparāhṇa rite. Aparāhṇa is the fourth
    // of five equal divisions of the local daylight interval.
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const aparahnaStart = new Date(sunrise.getTime() + dayDuration * 3 / 5);
    const aparahnaEnd = new Date(sunrise.getTime() + dayDuration * 4 / 5);
    const window = interval(
      laterDate(hastaStart, aparahnaStart),
      earlierDate(hastaEnd, aparahnaEnd),
      "सामवेदी उपाकर्म — हस्त नक्षत्र अपराह्ण व्याप्ति",
      "भाद्रपद शुक्ल पक्ष के हस्त नक्षत्र और स्थानीय दिनमान के चौथे भाग (अपराह्ण) की संयुक्त अवधि।"
    );
    if (!window) {
      return {
        label: "सामवेदी उपाकर्म — अपराह्ण काल",
        status: "unavailable",
        message: "इस दिन हस्त नक्षत्र और अपराह्ण काल की संयुक्त व्याप्ति नहीं मिली।"
      };
    }
    return { ...window, status: "calculated" };
  },

  "ekadashi-parana"(context) {
    const sunrise = validDate(context.nextSunrise);
    const sunset = validDate(context.nextSunset);
    const tithis = collectTithiIntervals(context.tithis);
    if (!sunrise || !sunset || sunset <= sunrise || !tithis.length) {
      return {
        label: "एकादशी पारण काल",
        status: "unavailable",
        message: "पारण के लिए अगले दिन का स्थानीय सूर्योदय, सूर्यास्त और तिथि-अवधि उपलब्ध नहीं है।"
      };
    }

    // The event is dated on the fasting day. The Dwadashi interval can start
    // on that day and continue across the following sunrise.
    const dwadashi = tithis.find(item =>
      item.end > new Date(sunrise.getTime() - 36 * 60 * 60 * 1000) &&
      item.start < new Date(sunrise.getTime() + 36 * 60 * 60 * 1000)
    );
    if (!dwadashi) {
      return {
        label: "एकादशी पारण काल",
        status: "unavailable",
        message: "द्वादशी की वास्तविक शुरुआत और समाप्ति नहीं मिली; अनुमानित पारण समय नहीं दिखाया जा रहा है।"
      };
    }

    // If Dwadashi ended before sunrise, traditional calendars allow parana
    // soon after sunrise as an exception. Do not fabricate a longer window.
    if (dwadashi.end <= sunrise) {
      return {
        label: "एकादशी पारण",
        status: "calculated",
        time: sunrise,
        date: sunrise,
        dateLabel: new Intl.DateTimeFormat("hi-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" }).format(sunrise),
        note: "द्वादशी तिथि सूर्योदय से पहले समाप्त हो चुकी है। इस अपवाद में पारण सूर्योदय के तुरंत बाद करें।"
      };
    }

    const duration = dwadashi.end.getTime() - dwadashi.start.getTime();
    if (!Number.isFinite(duration) || duration <= 0) {
      return {
        label: "एकादशी पारण काल",
        status: "unavailable",
        message: "द्वादशी की अवधि विश्वसनीय रूप से निर्धारित नहीं हो सकी।"
      };
    }

    // Hari Vasara is the first quarter of Dwadashi. Parana cannot begin
    // before both local sunrise and the end of that quarter.
    const hariVasaraEnd = new Date(dwadashi.start.getTime() + duration / 4);
    const earliest = laterDate(sunrise, hariVasaraEnd);
    const daylight = sunset.getTime() - sunrise.getTime();
    const madhyahnaStart = new Date(sunrise.getTime() + daylight * 2 / 5);
    const madhyahnaEnd = new Date(sunrise.getTime() + daylight * 3 / 5);

    // Prefer a morning window, ending when Madhyahna begins or Dwadashi ends.
    const morningEnd = earlierDate(dwadashi.end, madhyahnaStart);
    const morning = interval(earliest, morningEnd, "एकादशी पारण काल");
    if (morning) {
      return {
        ...morning,
        status: "calculated",
        date: sunrise,
        dateLabel: new Intl.DateTimeFormat("hi-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" }).format(sunrise),
        note: "हरिवासर (द्वादशी का प्रथम चौथाई भाग) समाप्त होने के बाद और द्वादशी तिथि के भीतर पारण करें। प्रातःकाल को प्राथमिकता दें; मध्याह्न में पारण न करें।"
      };
    }

    // If the valid morning window is already gone, avoid Madhyahna and use
    // a post-Madhyahna window only when Dwadashi still remains in force.
    const laterStart = laterDate(earliest, madhyahnaEnd);
    const later = interval(laterStart, dwadashi.end, "एकादशी पारण काल");
    if (later) {
      return {
        ...later,
        status: "calculated",
        date: sunrise,
        dateLabel: new Intl.DateTimeFormat("hi-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" }).format(sunrise),
        note: "प्रातःकाल का उपयुक्त समय उपलब्ध नहीं रहा। मध्याह्न से बचते हुए द्वादशी समाप्त होने से पहले पारण करें।"
      };
    }

    return {
      label: "एकादशी पारण काल",
      status: "unavailable",
      message: "हरिवासर, सूर्योदय, मध्याह्न और द्वादशी-समाप्ति के नियमों से इस गणना में पारण-अवधि निर्धारित नहीं हो सकी।"
    };
  },

  "dhanteras-muhurta"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const tithis = collectNamedIntervals(context.tithis, item => {
      const index = tithiIndex(item);
      return index === 12 || index === 27 || /trayodashi|त्रयोदशी/.test(normalizedName(item));
    });
    if (!sunrise || !sunset || !nextSunrise || sunset <= sunrise || nextSunrise <= sunset || !tithis.length) {
      return {
        label: "धनतेरस — खरीदारी और पूजा मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्योदय-सूर्यास्त और त्रयोदशी की वास्तविक समय-सीमा उपलब्ध नहीं है; अनुमानित मुहूर्त नहीं दिखाया जा रहा है।"
      };
    }

    const windows = [];
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const weekday = localWeekday(context.date);
    const sequences = [
      ["Udveg","Chal","Labh","Amrit","Kaal","Shubh","Rog","Udveg"],
      ["Amrit","Kaal","Shubh","Rog","Udveg","Chal","Labh","Amrit"],
      ["Rog","Udveg","Chal","Labh","Amrit","Kaal","Shubh","Rog"],
      ["Labh","Amrit","Kaal","Shubh","Rog","Udveg","Chal","Labh"],
      ["Shubh","Rog","Udveg","Chal","Labh","Amrit","Kaal","Shubh"],
      ["Chal","Labh","Amrit","Kaal","Shubh","Rog","Udveg","Chal"],
      ["Kaal","Shubh","Rog","Udveg","Chal","Labh","Amrit","Kaal"]
    ];
    const names = { Amrit: "अमृत चौघड़िया", Shubh: "शुभ चौघड़िया", Labh: "लाभ चौघड़िया", Chal: "चर चौघड़िया" };
    const favorable = new Set(["Amrit","Shubh","Labh","Chal"]);
    if (dayDuration > 0 && Number.isInteger(weekday) && sequences[weekday]) {
      for (let i = 0; i < 8; i++) {
        const kind = sequences[weekday][i];
        if (!favorable.has(kind)) continue;
        const start = new Date(sunrise.getTime() + dayDuration * i / 8);
        const end = new Date(sunrise.getTime() + dayDuration * (i + 1) / 8);
        const overlap = windowWithin(start, end, tithis, names[kind], "दिनमान के आठ बराबर भागों पर आधारित स्थानीय चौघड़िया; त्रयोदशी-व्याप्ति के भीतर।");
        if (overlap) windows.push(overlap);
      }
    }

    // Night Choghadiya begins at local sunset. Its weekday sequence differs
    // from the daytime sequence; include only favourable slots overlapping Trayodashi.
    const nightDuration = nextSunrise.getTime() - sunset.getTime();
    const nightSequences = [
      ["Shubh","Amrit","Chal","Rog","Kaal","Labh","Udveg","Shubh"],
      ["Amrit","Chal","Rog","Kaal","Labh","Udveg","Shubh","Amrit"],
      ["Chal","Rog","Kaal","Labh","Udveg","Shubh","Amrit","Chal"],
      ["Labh","Udveg","Shubh","Amrit","Chal","Rog","Kaal","Labh"],
      ["Shubh","Amrit","Chal","Rog","Kaal","Labh","Udveg","Shubh"],
      ["Rog","Kaal","Labh","Udveg","Shubh","Amrit","Chal","Rog"],
      ["Kaal","Labh","Udveg","Shubh","Amrit","Chal","Rog","Kaal"]
    ];
    if (nightDuration > 0 && Number.isInteger(weekday) && nightSequences[weekday]) {
      for (let i = 0; i < 8; i++) {
        const kind = nightSequences[weekday][i];
        if (!favorable.has(kind)) continue;
        const start = new Date(sunset.getTime() + nightDuration * i / 8);
        const end = new Date(sunset.getTime() + nightDuration * (i + 1) / 8);
        const overlap = windowWithin(start, end, tithis, names[kind], "रात्रिमान के आठ बराबर भागों पर आधारित स्थानीय चौघड़िया; त्रयोदशी-व्याप्ति के भीतर।");
        if (overlap) windows.push(overlap);
      }
    }
    // Trayodashi may continue after the following sunrise. Include the next
    // morning's favourable Choghadiya only for the remaining Trayodashi interval.
    const nextSunset = validDate(context.nextSunset);
    const nextDayDuration = nextSunset && nextSunset.getTime() - nextSunrise.getTime();
    const nextWeekday = localWeekday(nextSunrise);
    if (Number.isFinite(nextDayDuration) && nextDayDuration > 0 &&
        Number.isInteger(nextWeekday) && sequences[nextWeekday]) {
      for (let i = 0; i < 8; i++) {
        const kind = sequences[nextWeekday][i];
        if (!favorable.has(kind)) continue;
        const start = new Date(nextSunrise.getTime() + nextDayDuration * i / 8);
        const end = new Date(nextSunrise.getTime() + nextDayDuration * (i + 1) / 8);
        const overlap = windowWithin(start, end, tithis, names[kind],
          "अगले दिन के दिनमान पर आधारित शुभ चौघड़िया; त्रयोदशी-व्याप्ति के भीतर।");
        if (overlap) windows.push(overlap);
      }
    }

    windows.sort((a, b) => a.start - b.start);

    if (!windows.length) {
      const purchase = windowWithin(sunrise, sunset, tithis, "खरीदारी — त्रयोदशी-व्याप्ति", "यह समय केवल स्थानीय दिनमान और त्रयोदशी के साझा भाग को दर्शाता है; चौघड़िया उपलब्ध न होने से इसे विशेष चौघड़िया मुहूर्त न मानें।");
      if (purchase) windows.push(purchase);
    }

    const pradoshEnd = new Date(sunset.getTime() + (nextSunrise.getTime() - sunset.getTime()) / 5);
    const pradosh = windowWithin(sunset, pradoshEnd, tithis, "धनतेरस पूजा — प्रदोष काल", "त्रयोदशी-व्याप्ति और प्रदोष काल का साझा समय।");
    const fixedLagna = (context.sthirLagnaWindows || []).find(w =>
      /vrishabha|वृषभ|taurus/i.test(String(w.name || w.rashi || "")) &&
      validDate(w.end) > sunset && validDate(w.start) < pradoshEnd
    );
    if (pradosh && fixedLagna) {
      const fixed = interval(
        laterDate(pradosh.start, validDate(fixedLagna.start)),
        earlierDate(pradosh.end, validDate(fixedLagna.end)),
        "प्राथमिक पूजा विकल्प — वृषभ स्थिर लग्न",
        "त्रयोदशी, प्रदोष और उपलब्ध वृषभ स्थिर लग्न की संयुक्त व्याप्ति।"
      );
      if (fixed) windows.push(fixed);
    }
    if (pradosh) windows.push(pradosh);

    if (!windows.length) {
      return {
        label: "धनतेरस — खरीदारी और पूजा मुहूर्त",
        status: "unavailable",
        message: "चुने गए नगर में त्रयोदशी के साथ खरीदारी या प्रदोष-पूजा की कोई साझा समयावधि इस गणना में नहीं मिली।"
      };
    }
    return {
      label: "धनतेरस — खरीदारी और पूजा मुहूर्त",
      status: "calculated",
      date: sunrise,
      dateLabel: formatDateLabel(sunrise),
      windows,
      note: "खरीदारी के लिए त्रयोदशी-व्याप्ति में शुभ चौघड़िया विकल्प दिखाए गए हैं। पूजा का समय स्थानीय प्रदोष और त्रयोदशी के साझा भाग से निकाला गया है; वृषभ स्थिर लग्न तभी दिखेगा जब स्थानीय गणना उपलब्ध हो।"
    };
  },

  "diwali-lakshmi-puja"(context) {
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const tithis = collectNamedIntervals(context.tithis, item => isAmavasya(item) || isAmavasya(item.name));
    if (!sunset || !nextSunrise || nextSunrise <= sunset || !tithis.length) {
      return {
        label: "दीपावली लक्ष्मी-गणेश पूजन मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्यास्त, अगले सूर्योदय और अमावस्या की वास्तविक समय-सीमा उपलब्ध नहीं है।"
      };
    }

    const pradoshStart = sunset;
    const pradoshEnd = new Date(sunset.getTime() + (nextSunrise.getTime() - sunset.getTime()) / 5);
    const pradosh = windowWithin(
      pradoshStart, pradoshEnd, tithis,
      "मुख्य लक्ष्मी-गणेश पूजन — प्रदोष काल",
      "कार्तिक अमावस्या और सूर्यास्त के बाद के प्रदोष काल का साझा समय।"
    );

    const windows = [];
    const fixedLagna = (context.sthirLagnaWindows || []).find(w =>
      /vrishabha|वृषभ|taurus/i.test(String(w.name || w.rashi || "")) &&
      validDate(w.end) > sunset && validDate(w.start) < pradoshEnd
    );
    if (fixedLagna && pradosh) {
      const lagnaWindow = interval(
        laterDate(pradosh.start, validDate(fixedLagna.start)),
        earlierDate(pradosh.end, validDate(fixedLagna.end)),
        "सर्वोत्तम लक्ष्मी पूजन — वृषभ स्थिर लग्न",
        "प्रदोष काल, अमावस्या और वृषभ स्थिर लग्न की संयुक्त व्याप्ति।"
      );
      if (lagnaWindow) windows.push(lagnaWindow);
    }
    if (pradosh) {
      windows.push({
        ...pradosh,
        label: fixedLagna && windows.length
          ? "प्रदोष काल में वैकल्पिक पूजन"
          : "लक्ष्मी-गणेश पूजन — प्रदोष काल",
        note: fixedLagna && windows.length
          ? "वैकल्पिक पूजा समय: अमावस्या-व्याप्ति वाला प्रदोष काल।"
          : "गृहस्थों के लक्ष्मी-गणेश पूजन के लिए प्रदोष काल मुख्य पूजा-समय है."
      });
    }

    const nightDuration = nextSunrise.getTime() - sunset.getTime();
    const nishitaStart = new Date(sunset.getTime() + nightDuration * 7 / 15);
    const nishitaEnd = new Date(sunset.getTime() + nightDuration * 8 / 15);
    const nishita = windowWithin(
      nishitaStart, nishitaEnd, tithis,
      "महानिशीथ काल — विशेष परंपराओं के लिए",
      "यह मध्यरात्रि के निकट का विशेष काल है; सामान्य गृहस्थ लक्ष्मी पूजन के लिए प्रदोष काल को प्राथमिकता दें।"
    );
    const simhaLagna = (context.sthirLagnaWindows || []).find(w =>
      /simha|सिंह|leo/i.test(String(w.name || w.rashi || "")) &&
      validDate(w.end) > nishitaStart && validDate(w.start) < nishitaEnd
    );
    if (nishita && simhaLagna) {
      const simhaNishita = interval(
        laterDate(nishita.start, validDate(simhaLagna.start)),
        earlierDate(nishita.end, validDate(simhaLagna.end)),
        "महानिशीथ काल — सिंह स्थिर लग्न",
        "महानिशीथ और सिंह स्थिर लग्न की संयुक्त व्याप्ति; यह विशेष साधना के लिए वैकल्पिक समय है।"
      );
      // Show the complete Mahanishita interval as well as its smaller Simha overlap.
      // Replacing the full interval with the overlap can hide most of the actual period.
      windows.push(nishita);
      if (simhaNishita) windows.push(simhaNishita);
    } else if (nishita) {
      windows.push(nishita);
    }

    // Godhuli is a separate twilight interval useful for lighting lamps.
    // Keep it distinct from the primary Lakshmi-Ganesha puja window.
    const godhuli = windowWithin(
      new Date(sunset.getTime() - 24 * 60 * 1000),
      new Date(sunset.getTime() + 24 * 60 * 1000),
      tithis,
      "गोधूलि काल — दीपदान",
      "सूर्यास्त के आसपास दीपदान का समय; मुख्य लक्ष्मी-गणेश पूजन के लिए प्रदोष काल प्राथमिक विकल्प है।"
    );
    if (godhuli) windows.push(godhuli);

    if (!windows.length) {
      return {
        label: "दीपावली लक्ष्मी-गणेश पूजन मुहूर्त",
        status: "unavailable",
        message: "चुने गए नगर में प्रदोष/निशीथ काल और अमावस्या की व्याप्ति के बीच कोई साझा समयावधि इस गणना में नहीं मिली।"
      };
    }
    return {
      label: "दीपावली लक्ष्मी-गणेश पूजन मुहूर्त",
      status: "calculated",
      date: sunset,
      dateLabel: formatDateLabel(sunset),
      windows
    };
  },

  "bhai-dooj-tilak"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const decision = context.bhaiDoojDateDecision;
    const currentDateKey = localDateKey(sunrise);
    if (!decision || decision.status !== "calculated" || !decision.selectedDateKey) {
      return {
        label: "भाई दूज तिलक मुहूर्त",
        status: "unavailable",
        message: "धर्मसिंधु के दिन-निर्णय के लिए दोनों दिनों की अपराह्ण-व्याप्ति जाँची नहीं जा सकी; मुहूर्त नहीं दिखाया जा रहा है।"
      };
    }
    if (decision.selectedDateKey !== currentDateKey) {
      return {
        label: "भाई दूज तिलक मुहूर्त",
        status: "unavailable",
        message: "धर्मसिंधु के दिन-निर्णय के अनुसार पर्व की तारीख़ इस प्रविष्टि से मेल नहीं खाती; स्वीकृत पर्व-तिथि की समीक्षा आवश्यक है।"
      };
    }
    const tithis = collectNamedIntervals(context.tithis, item => {
      const name = normalizedName(item);
      const raw = item && typeof item === "object"
        ? item.index ?? item.number ?? item.value
        : item;
      // The project's tithi indices are zero-based: Shukla Dvitiya = 1.
      return Number(raw) === 1 ||
        /shukla.*dwitiya|शुक्ल.*द्वितीया/.test(name);
    });
    if (!sunrise || !sunset || sunset <= sunrise || !tithis.length) {
      return {
        label: "भाई दूज तिलक मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्योदय-सूर्यास्त और कार्तिक शुक्ल द्वितीया की वास्तविक समय-सीमा उपलब्ध नहीं है; अनुमानित मुहूर्त नहीं दिखाया जा रहा है।"
      };
    }

    // Aparahna is the fourth of five equal parts of local daytime.
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const roundMinute = value => new Date(Math.round(value / 60000) * 60000);
    const aparahnaStart = roundMinute(sunrise.getTime() + dayDuration * 3 / 5);
    const aparahnaEnd = roundMinute(sunrise.getTime() + dayDuration * 4 / 5);
    const tilakWindow = windowWithin(
      aparahnaStart,
      aparahnaEnd,
      tithis,
      "भाई दूज तिलक मुहूर्त — अपराह्ण",
      "स्थानीय दिनमान के पाँच बराबर भागों में चौथा भाग (अपराह्ण) और कार्तिक शुक्ल द्वितीया की संयुक्त व्याप्ति।"
    );
    if (!tilakWindow) {
      return {
        label: "भाई दूज तिलक मुहूर्त",
        status: "unavailable",
        message: "चुनी गई तिथि पर अपराह्ण काल और कार्तिक शुक्ल द्वितीया की साझा अवधि नहीं मिली।"
      };
    }
    return {
      label: "भाई दूज तिलक मुहूर्त",
      status: "calculated",
      date: sunrise,
      dateLabel: formatDateLabel(sunrise),
      windows: [tilakWindow],
      note: "धर्मसिंधु के यमद्वितीया दिन-निर्णय में दोनों दिनों की अपराह्ण-व्याप्ति जाँची गई है।"
    };
  },

  "karwa-chauth-puja"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const moonrise = validDate(context.moonrise);
    const tithis = collectNamedIntervals(context.tithis, item => {
      const name = normalizedName(item);
      const raw = item && typeof item === "object"
        ? item.index ?? item.number ?? item.value
        : item;
      // The project's tithi sequence uses 18 for Krishna Chaturthi.
      return Number(raw) === 18 ||
        /krishna.*chaturthi|कृष्ण.*चतुर्थी/.test(name);
    });
    if (!sunrise || !sunset || !nextSunrise || nextSunrise <= sunset || !tithis.length) {
      return {
        label: "करवा चौथ पूजा मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्योदय-सूर्यास्त, अगले सूर्योदय और कृष्ण चतुर्थी की वास्तविक समय-सीमा उपलब्ध नहीं है; अनुमानित मुहूर्त नहीं दिखाया जा रहा है।"
      };
    }

    // Published 2025/2026 Drik Panchang examples match one-tenth of local night.
    const nightDuration = nextSunrise.getTime() - sunset.getTime();
    const pujaWindow = windowWithin(
      sunset,
      new Date(sunset.getTime() + Math.round(nightDuration / 10 / 60000) * 60000),
      tithis,
      "करवा चौथ पूजा मुहूर्त",
      "स्थानीय सूर्यास्त से अगले सूर्योदय तक के रात्रिमान का दसवाँ भाग, कृष्ण चतुर्थी-व्याप्ति के भीतर।"
    );
    if (!pujaWindow) {
      return {
        label: "करवा चौथ पूजा मुहूर्त",
        status: "unavailable",
        message: "स्थानीय रात्रि के प्रथम दसवें भाग और कृष्ण चतुर्थी की व्याप्ति में साझा समय नहीं मिला।"
      };
    }

    const windows = [pujaWindow];
    if (moonrise && moonrise > sunrise) {
      windows.push(interval(
        sunrise,
        moonrise,
        "करवा चौथ व्रत समय",
        "स्थानीय सूर्योदय से चंद्रोदय तक; चंद्र-दर्शन के बाद व्रत-पारण की परंपरा।"
      ));
    }
    return {
      label: "करवा चौथ — पूजा और व्रत समय",
      status: "calculated",
      date: sunset,
      dateLabel: formatDateLabel(sunset),
      windows
    };
  },

  "narak-chaturdashi-abhyanga"(context) {
    const moonrise = validDate(context.moonrise);
    const sunrise = validDate(context.sunrise);
    const chaturdashi = collectNamedIntervals(context.tithis, item => {
      const raw = item && typeof item === "object" ? item.index ?? item.number ?? item.value : item;
      return Number(raw) === 28 || /krishna.*chaturdashi|कृष्ण.*चतुर्दशी/.test(normalizedName(item));
    });
    if (!moonrise || !sunrise || sunrise <= moonrise || !chaturdashi.length) {
      return { label: "नरक चतुर्दशी अभ्यंग स्नान मुहूर्त", status: "unavailable", message: "स्थानीय चंद्रोदय, सूर्योदय और कृष्ण चतुर्दशी की वास्तविक अवधि उपलब्ध नहीं है; समय नहीं दिखाया जा रहा है।" };
    }
    const bath = windowWithin(moonrise, sunrise, chaturdashi, "नरक चतुर्दशी अभ्यंग स्नान मुहूर्त", "स्थानीय चंद्रोदय से सूर्योदय तक और कृष्ण चतुर्दशी की वास्तविक व्याप्ति का साझा समय।");
    if (!bath) {
      return { label: "नरक चतुर्दशी अभ्यंग स्नान मुहूर्त", status: "unavailable", message: "चंद्रोदय से सूर्योदय के बीच कृष्ण चतुर्दशी की व्याप्ति नहीं मिली; अनुमानित समय नहीं दिखाया जा रहा है।" };
    }
    const { note: windowNote, ...bathResult } = bath;
    return { ...bathResult, status: "calculated", date: sunrise, dateLabel: formatDateLabel(sunrise), windows: [bath] };
  },
  moonrise(context) {
    const time = validDate(context.moonrise);
    if (!time) {
      return {
        label: "स्थानीय चंद्रोदय / अर्घ्य का समय",
        status: "unavailable",
        message: "इस स्थान का चंद्रोदय समय उपलब्ध नहीं है।"
      };
    }
    return {
      label: "स्थानीय चंद्रोदय / अर्घ्य का समय",
      status: "calculated",
      time,
      note: "चंद्रोदय के बाद अर्घ्य दें।"
    };
  },

  abhijit(context) {
    if (localWeekday(context.date) === 3) {
      return {
        label: "अभिजित मुहूर्त",
        status: "not-applicable",
        message: "बुधवार को अभिजित मुहूर्त मान्य नहीं।"
      };
    }
    const result = fractionInterval(context.sunrise, context.sunset, 7 / 15, 8 / 15, "अभिजित मुहूर्त");
    return result ? { ...result, status: "calculated" } : null;
  },

  "vinayaka-chaturthi-madhyahna"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const chaturthi = collectNamedIntervals(context.tithis, item => {
      const name = normalizedName(item);
      const raw = item && typeof item === "object"
        ? item.index ?? item.number ?? item.value
        : item;
      return Number(raw) === 3 ||
        /shukla.*chaturthi|शुक्ल.*चतुर्थी/.test(name);
    });
    if (!sunrise || !sunset || sunset <= sunrise || !chaturthi.length) {
      return {
        label: "विनायक चतुर्थी मध्याह्न पूजा मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्योदय-सूर्यास्त और शुक्ल चतुर्थी की वास्तविक समय-सीमा उपलब्ध नहीं है; अनुमानित पूजा-मुहूर्त नहीं दिखाया जा रहा है।"
      };
    }
    const madhyahna = fractionInterval(sunrise, sunset, 2 / 5, 3 / 5, "मध्याह्न काल");
    const pujaWindow = madhyahna && windowWithin(
      madhyahna.start,
      madhyahna.end,
      chaturthi,
      "विनायक चतुर्थी पूजा मुहूर्त — मध्याह्न",
      "स्थानीय दिनमान के पाँच बराबर भागों में तीसरा भाग (मध्याह्न) और शुक्ल चतुर्थी की संयुक्त व्याप्ति।"
    );
    if (!pujaWindow) {
      return {
        label: "विनायक चतुर्थी मध्याह्न पूजा मुहूर्त",
        status: "unavailable",
        message: "स्थानीय मध्याह्न काल और शुक्ल चतुर्थी की साझा व्याप्ति नहीं मिली; पूजा-मुहूर्त नहीं दिखाया जा रहा है।"
      };
    }
    return {
      label: "विनायक चतुर्थी — मध्याह्न पूजा मुहूर्त",
      status: "calculated",
      date: sunrise,
      dateLabel: formatDateLabel(sunrise),
      windows: [pujaWindow]
    };
  },

  "sankranti-punya-kala"(context) {
    const moment = validDate(context.sankrantiMoment);
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const nextSunset = validDate(context.nextSunset);
    const rashi = Number(context.sankrantiRashiIndex);
    if (!moment || !sunrise || !sunset || !nextSunrise || sunset <= sunrise || nextSunrise <= sunset || !Number.isInteger(rashi) || rashi < 0 || rashi > 11) {
      return { label: "संक्रांति पुण्यकाल", status: "unavailable", message: "इस संक्रांति का स्थानीय संक्रमण-क्षण और दिनमान उपलब्ध नहीं है; समय नहीं दिखाया जा रहा है।" };
    }
    // Drik's Sankranti rules use ghatis measured against the local day.
    // Mesha/Tula: 10 before + 10 after; Ayan: 40 after;
    // Vishnupadi: 16 before; Shadashitimukhi: 16 after.
    const dayGhati = (sunset.getTime() - sunrise.getTime()) / 30;
    let before = 0;
    let after = 16;
    if (rashi === 0 || rashi === 6) {
      before = 10; after = 10;
    } else if (rashi === 3 || rashi === 9) {
      before = 0; after = 40;
    } else if (rashi === 1 || rashi === 4 || rashi === 7 || rashi === 10) {
      before = 16; after = 0;
    }
    let start;
    let end;
    let mahaStart;
    let mahaEnd;
    if (moment < sunrise) {
      // A night-time ingress is observed in the following daylight period.
      start = sunrise;
      end = earlierDate(new Date(sunrise.getTime() + dayGhati * (rashi === 3 || rashi === 9 ? 40 : 16)), sunset);
      mahaStart = sunrise;
      mahaEnd = earlierDate(new Date(sunrise.getTime() + dayGhati * 5), sunset);
    } else if (moment >= sunset) {
      if (rashi === 3 || rashi === 9) {
        start = nextSunrise;
        end = nextSunset && nextSunset > nextSunrise ? nextSunset : new Date(nextSunrise.getTime() + (sunset.getTime() - sunrise.getTime()));
        const nextDayGhati = (end.getTime() - nextSunrise.getTime()) / 30;
        mahaStart = nextSunrise;
        mahaEnd = new Date(nextSunrise.getTime() + nextDayGhati * 5);
      } else {
        start = new Date(Math.max(sunrise.getTime(), sunset.getTime() - dayGhati * 15));
        end = sunset;
        mahaStart = new Date(Math.max(sunrise.getTime(), sunset.getTime() - dayGhati * 5));
        mahaEnd = sunset;
      }
    } else {
      start = new Date(Math.max(sunrise.getTime(), moment.getTime() - dayGhati * before));
      end = new Date(Math.min(sunset.getTime(), moment.getTime() + dayGhati * after));
      if (rashi === 0 || rashi === 6) {
        mahaStart = new Date(Math.max(sunrise.getTime(), moment.getTime() - dayGhati * 5));
        mahaEnd = new Date(Math.min(sunset.getTime(), moment.getTime() + dayGhati * 5));
      } else if (before > 0) {
        mahaStart = new Date(Math.max(sunrise.getTime(), moment.getTime() - dayGhati * 5));
        mahaEnd = moment;
      } else {
        mahaStart = moment;
        mahaEnd = new Date(Math.min(sunset.getTime(), moment.getTime() + dayGhati * 5));
      }
    }
    const punya = interval(start, end, "स्नान-दान का पुण्यकाल");
    if (!punya) return { label: "संक्रांति पुण्यकाल", status: "unavailable", message: "स्थानीय दिनमान में पुण्यकाल की मान्य अवधि उपलब्ध नहीं हुई।" };
    const mahaPunya = interval(mahaStart, mahaEnd, "महापुण्यकाल");
    return { label: "संक्रांति पुण्यकाल", status: "calculated", date: moment, dateLabel: formatDateLabel(moment), windows: mahaPunya ? [punya, mahaPunya] : [punya] };
  },

  "holika-dahan-pradosh"(context) {
    const sunrise = validDate(context.sunrise);
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const purnima = collectNamedIntervals(context.tithis, isPurnima);
    if (!sunrise || !sunset || !nextSunrise || sunset <= sunrise || nextSunrise <= sunset || !purnima.length) {
      return { label: "होलिका-दहन मुहूर्त", status: "unavailable", message: "स्थानीय दिनमान और पूर्णिमा की वास्तविक व्याप्ति उपलब्ध नहीं है; अनुमानित समय नहीं दिखाया जा रहा है।" };
    }

    const nightDuration = nextSunrise.getTime() - sunset.getTime();
    const pradoshEnd = new Date(sunset.getTime() + nightDuration / 5);
    const hinduMidnight = new Date(sunset.getTime() + nightDuration / 2);
    const purnimaAtSunrise = purnima.some(item => item.start <= sunrise && item.end > sunrise);
    const purnimaDuringPradosh = purnima.find(item => item.end > sunset && item.start < pradoshEnd);

    // Drik Panchang also publishes the special Udaya-vyapini case:
    // when Purnima prevails at this day's sunrise but ends before Pradosh,
    // Holika Dahan is still assigned to this evening's Pradosh.
    let baseStart = purnimaDuringPradosh
      ? laterDate(sunset, purnimaDuringPradosh.start)
      : purnimaAtSunrise ? sunset : null;
    let baseEnd = purnimaDuringPradosh
      ? earlierDate(pradoshEnd, purnimaDuringPradosh.end)
      : purnimaAtSunrise ? pradoshEnd : null;
    if (!baseStart || !baseEnd || baseEnd <= baseStart) {
      return { label: "होलिका-दहन मुहूर्त", status: "unavailable", message: "पूर्णिमा की स्थानीय व्याप्ति से होलिका-दहन का मान्य समय नहीं मिला।" };
    }

    const bhadra = collectNamedIntervals(context.karanas, item => /vishti|विष्टि/.test(normalizedName(item)));
    const overlap = bhadra.find(item => item.end > baseStart && item.start < baseEnd);
    const windows = [];
    let primary = null;

    if (!overlap) {
      primary = interval(baseStart, baseEnd, "होलिका-दहन — प्रदोष काल", "पूर्णिमा-व्याप्ति और प्रदोष काल का मान्य समय।");
    } else if (overlap.end <= hinduMidnight) {
      // When Bhadra ends before Hindu midnight, wait for its end.
      const afterBhadraStart = laterDate(baseStart, overlap.end);
      const afterBhadraLimit = overlap.end < pradoshEnd ? pradoshEnd : hinduMidnight;
      const afterBhadraEnd = earlierDate(afterBhadraLimit, purnimaDuringPradosh?.end ?? (purnimaAtSunrise ? pradoshEnd : null));
      primary = interval(afterBhadraStart, afterBhadraEnd, "होलिका-दहन — भद्रा समाप्ति के बाद", "प्रदोष में भद्रा होने पर उसके समाप्त होने के बाद का पूर्णिमा-व्याप्त समय।");
      if (!primary && purnimaDuringPradosh) {
        primary = interval(laterDate(pradoshEnd, overlap.end), earlierDate(hinduMidnight, purnimaDuringPradosh.end), "होलिका-दहन — भद्रा समाप्ति के बाद", "भद्रा समाप्ति के बाद उपलब्ध समय।");
      }
    } else {
      // Bhadra lasts beyond Hindu midnight. Its third-prahar tail (last
      // three ghatis) is preferred when it falls between Pradosh and midnight.
      const bhadraDuration = overlap.end.getTime() - overlap.start.getTime();
      const ghati = (nextSunrise.getTime() - sunrise.getTime()) / 60;
      const thirdPraharEnd = new Date(overlap.start.getTime() + bhadraDuration * 3 / 4);
      const puchhaStart = new Date(thirdPraharEnd.getTime() - 3 * ghati);
      const puchha = interval(
        laterDate(baseStart, puchhaStart),
        earlierDate(baseEnd, thirdPraharEnd),
        "होलिका-दहन — भद्रा पुच्छ",
        "भद्रा के तृतीय प्रहर के अंतिम तीन घटी; यह समय प्रदोष और हिन्दू मध्यरात्रि के भीतर होने पर ही ग्रहण किया जाता है।"
      );
      if (puchha && puchha.end <= hinduMidnight) {
        primary = puchha;
      } else {
        // If the tail is not available before Hindu midnight, Drik permits
        // Pradosh during Bhadra, but never during Bhadra Mukha.
        const mukhaStart = thirdPraharEnd;
        const mukhaEnd = new Date(mukhaStart.getTime() + 5 * ghati);
        if (baseStart < mukhaStart) {
          primary = interval(baseStart, earlierDate(baseEnd, mukhaStart), "होलिका-दहन — प्रदोष काल", "भद्रा मध्यरात्रि के बाद तक रहने पर प्रदोष में भद्रा पुच्छ उपलब्ध न होने की स्थिति; भद्रा मुख का समय वर्जित।");
        }
        if (!primary && baseEnd > mukhaEnd) {
          primary = interval(laterDate(baseStart, mukhaEnd), baseEnd, "होलिका-दहन — प्रदोष काल", "भद्रा मुख के बाद उपलब्ध प्रदोष-व्याप्त समय।");
        }
      }

      // Drik also lists the post-midnight alternative after Bhadra ends,
      // provided Purnima is still prevailing.
      const purnimaEnd = purnimaDuringPradosh?.end ?? purnima.find(item => item.end > overlap.end)?.end;
      if (purnimaEnd && overlap.end < nextSunrise) {
        const alternate = interval(overlap.end, earlierDate(nextSunrise, purnimaEnd), "वैकल्पिक मुहूर्त — भद्रा समाप्ति के बाद", "भद्रा समाप्त होने के बाद और सूर्योदय से पहले की पूर्णिमा-व्याप्त अवधि।");
        if (alternate) windows.push(alternate);
      }
    }

    if (!primary) {
      return { label: "होलिका-दहन मुहूर्त", status: "unavailable", message: "पूर्णिमा, प्रदोष और भद्रा के नियमों में कोई पूरा मान्य समय नहीं मिला; अधूरा मुहूर्त नहीं दिखाया जा रहा है।" };
    }
    windows.unshift(primary);
    return { label: "होलिका-दहन मुहूर्त", status: "calculated", date: sunset, dateLabel: formatDateLabel(sunset), windows };
  },

  "mahashivaratri-four-prahar"(context) {
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const chaturdashi = collectNamedIntervals(context.tithis, item => {
      const raw = item && typeof item === "object" ? item.index ?? item.number ?? item.value : item;
      return Number(raw) === 28 || /krishna.*chaturdashi|कृष्ण.*चतुर्दशी/.test(normalizedName(item));
    });
    if (!sunset || !nextSunrise || nextSunrise <= sunset || !chaturdashi.length) {
      return { label: "महाशिवरात्रि — चार प्रहर पूजा समय", status: "unavailable", message: "स्थानीय रात्रिमान और कृष्ण चतुर्दशी की वास्तविक व्याप्ति उपलब्ध नहीं है; प्रहर-समय नहीं दिखाए जा रहे हैं।" };
    }
    const duration = nextSunrise.getTime() - sunset.getTime();
    const names = ["प्रथम प्रहर", "द्वितीय प्रहर", "तृतीय प्रहर", "चतुर्थ प्रहर"];
    const windows = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(sunset.getTime() + duration * i / 4);
      const end = new Date(sunset.getTime() + duration * (i + 1) / 4);
      const part = windowWithin(start, end, chaturdashi, names[i], "रात्रि को सूर्यास्त से अगले सूर्योदय तक चार समान प्रहरों में बाँटा गया है।");
      // Do not publish a clipped/partial prahar as if it were a complete one.
      if (!part || part.start.getTime() !== start.getTime() || part.end.getTime() !== end.getTime()) {
        return { label: "महाशिवरात्रि — चार प्रहर पूजा समय", status: "unavailable", message: "कृष्ण चतुर्दशी की व्याप्ति चारों प्रहरों को पूरा नहीं ढकती; अधूरे प्रहर-समय नहीं दिखाए जा रहे हैं।" };
      }
      windows.push(part);
    }
    if (windows.length !== 4) return { label: "महाशिवरात्रि — चार प्रहर पूजा समय", status: "unavailable", message: "चारों प्रहरों में कृष्ण चतुर्दशी की पूरी व्याप्ति नहीं मिली; अधूरे समय नहीं दिखाए जा रहे हैं।" };
    return { label: "महाशिवरात्रि — चार प्रहर पूजा समय", status: "calculated", date: sunset, dateLabel: formatDateLabel(sunset), windows };
  },

  "mahashivaratri-nishita"(context) {
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const chaturdashi = collectNamedIntervals(context.tithis, item => {
      const raw = item && typeof item === "object" ? item.index ?? item.number ?? item.value : item;
      return Number(raw) === 28 || /krishna.*chaturdashi|कृष्ण.*चतुर्दशी/.test(normalizedName(item));
    });
    if (!sunset || !nextSunrise || nextSunrise <= sunset || !chaturdashi.length) {
      return { label: "महाशिवरात्रि — निशीथ पूजा मुहूर्त", status: "unavailable", message: "स्थानीय रात्रिमान और कृष्ण चतुर्दशी की वास्तविक व्याप्ति उपलब्ध नहीं है; निशीथ समय नहीं दिखाया जा रहा है।" };
    }
    const nishita = fractionInterval(sunset, nextSunrise, 7 / 15, 8 / 15, "निशीथ काल");
    const pujaWindow = nishita && windowWithin(nishita.start, nishita.end, chaturdashi, "महाशिवरात्रि — निशीथ पूजा मुहूर्त", "निशीथ काल और कृष्ण चतुर्दशी की संयुक्त व्याप्ति।");
    if (!pujaWindow) return { label: "महाशिवरात्रि — निशीथ पूजा मुहूर्त", status: "unavailable", message: "निशीथ काल और कृष्ण चतुर्दशी की साझा व्याप्ति नहीं मिली; समय नहीं दिखाया जा रहा है।" };
    return { label: "महाशिवरात्रि — निशीथ पूजा मुहूर्त", status: "calculated", date: sunset, dateLabel: formatDateLabel(sunset), windows: [pujaWindow] };
  },

  "masik-shivaratri-nishita"(context) {
    const sunset = validDate(context.sunset);
    const nextSunrise = validDate(context.nextSunrise);
    const chaturdashi = collectNamedIntervals(context.tithis, item => {
      const name = normalizedName(item);
      const raw = item && typeof item === "object"
        ? item.index ?? item.number ?? item.value
        : item;
      return Number(raw) === 28 ||
        /krishna.*chaturdashi|कृष्ण.*चतुर्दशी/.test(name);
    });
    if (!sunset || !nextSunrise || nextSunrise <= sunset || !chaturdashi.length) {
      return {
        label: "मासिक शिवरात्रि निशीथ पूजा मुहूर्त",
        status: "unavailable",
        message: "स्थानीय सूर्यास्त, अगले सूर्योदय और कृष्ण चतुर्दशी की वास्तविक समय-सीमा उपलब्ध नहीं है; अनुमानित निशीथ मुहूर्त नहीं दिखाया जा रहा है।"
      };
    }
    const nishita = fractionInterval(sunset, nextSunrise, 7 / 15, 8 / 15, "निशीथ काल");
    const pujaWindow = nishita && windowWithin(
      nishita.start,
      nishita.end,
      chaturdashi,
      "मासिक शिवरात्रि निशीथ पूजा मुहूर्त",
      "स्थानीय सूर्यास्त से अगले सूर्योदय तक के रात्रिमान का आठवाँ मुहूर्त और कृष्ण चतुर्दशी की संयुक्त व्याप्ति।"
    );
    if (!pujaWindow) {
      return {
        label: "मासिक शिवरात्रि निशीथ पूजा मुहूर्त",
        status: "unavailable",
        message: "स्थानीय निशीथ काल और कृष्ण चतुर्दशी की साझा व्याप्ति नहीं मिली; समय नहीं दिखाया जा रहा है।"
      };
    }
    return {
      label: "मासिक शिवरात्रि — निशीथ पूजा मुहूर्त",
      status: "calculated",
      date: sunset,
      dateLabel: formatDateLabel(sunset),
      windows: [pujaWindow]
    };
  },

  nishita(context) {
    const result = fractionInterval(context.sunset, context.nextSunrise, 7 / 15, 8 / 15, "निशीथ काल");
    return result ? { ...result, status: "calculated" } : null;
  },

  "moonlight-until-midnight"(context) {
    const moonrise = validDate(context.moonrise);
    const date = validDate(context.date);
    if (!moonrise || !date) return null;
    const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
    const result = interval(moonrise, midnight, "चंद्रमा के उदय से मध्यरात्रि तक");
    return result ? {
      ...result,
      status: "calculated",
      note: "यह चांदनी में खीर रखने की गणना-सीमा है; पूजा निशिता मूहूर्त या शुभ चौघड़िया में उत्तम है।"
    } : null;
  }
};

// Render a shared muhurta title only once when its window repeats the same wording.
function normalizedMuhurtaLabelTokens(value) {
  return String(value || "")
    .normalize("NFC")
    .toLocaleLowerCase("hi")
    .replace(/[।॥,;:()\[\]{}·—–-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort();
}

export function areFestivalMuhurtaLabelsEquivalent(first, second) {
  const a = normalizedMuhurtaLabelTokens(first);
  const b = normalizedMuhurtaLabelTokens(second);
  return a.length > 0 && a.length === b.length && a.every((token, index) => token === b[index]);
}

export function registerFestivalMuhurtaRule(ruleId, calculate) {
  if (typeof ruleId !== "string" || !/^[a-z0-9-]+$/.test(ruleId)) {
    throw new TypeError("Rule ID must use lowercase letters, digits, or hyphens.");
  }
  if (typeof calculate !== "function") throw new TypeError("Rule calculator must be a function.");
  rules[ruleId] = calculate;
}

export function getFestivalMuhurta(event, context) {
  if (!event || !event.muhurtaRule) return null;
  const calculate = rules[event.muhurtaRule];
  if (!calculate) {
    return {
      label: "मुहूर्त",
      status: "rule-pending",
      message: "इस पर्व का मुहूर्त-नियम अभी निर्धारित नहीं किया गया है।"
    };
  }
  try {
    return calculate(context || {});
  } catch (error) {
    console.warn("Festival muhurta calculation failed:", event.muhurtaRule, error);
    return {
      label: "मुहूर्त",
      status: "unavailable",
      message: "इस तिथि के मुहूर्त की गणना के लिए आवश्यक खगोलीय समय उपलब्ध नहीं हैं।"
    };
  }
}

export function formatFestivalMuhurtaTime(value, timeZone = "Asia/Kolkata") {
  const date = validDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export function getFestivalMuhurtaContext(panchang, nextPanchang, date, location) {
  return {
    date: validDate(date),
    sunrise: panchang && panchang.sunrise,
    sunset: panchang && panchang.sunset,
    moonrise: panchang && panchang.moonrise,
    moonset: panchang && panchang.moonset,
    nextSunrise: nextPanchang && nextPanchang.sunrise,
    nextSunset: nextPanchang && nextPanchang.sunset,
    tithi: panchang && panchang.tithi,
    tithiStartTime: panchang && panchang.tithiStartTime,
    tithiEndTime: panchang && panchang.tithiEndTime,
    // Transition arrays cover the fast day and the following parana day.
    // Keep the full intervals: scalar sunrise tithi fields alone are insufficient.
    tithis: [
      ...(panchang && Array.isArray(panchang.tithis) ? panchang.tithis : []),
      ...(nextPanchang && Array.isArray(nextPanchang.tithis) ? nextPanchang.tithis : [])
    ],
    nextTithi: nextPanchang && nextPanchang.tithi,
    nextTithiStartTime: nextPanchang && nextPanchang.tithiStartTime,
    nextTithiEndTime: nextPanchang && nextPanchang.tithiEndTime,
    nakshatra: panchang && panchang.nakshatra,
    nakshatraEndTime: panchang && panchang.nakshatraEndTime,
    nakshatras: [
      ...(panchang && Array.isArray(panchang.nakshatras) ? panchang.nakshatras : []),
      ...(nextPanchang && Array.isArray(nextPanchang.nakshatras) ? nextPanchang.nakshatras : [])
    ],
    nextNakshatra: nextPanchang && nextPanchang.nakshatra,
    nextNakshatraEndTime: nextPanchang && nextPanchang.nakshatraEndTime,
    yoga: panchang && panchang.yoga,
    yogaEndTime: panchang && panchang.yogaEndTime,
    karanas: [
      ...(panchang && Array.isArray(panchang.karanas) ? panchang.karanas : []),
      ...(nextPanchang && Array.isArray(nextPanchang.karanas) ? nextPanchang.karanas : [])
    ],
    location: location || null
  };
}


/*
 * Annual Sāmaveda Upākarma date nirṇaya.
 * Input is a chronological set of daily panchāṅga records already classified
 * by lunar month/pakṣa. It applies the Aparāhṇa overlap rule and the
 * Sāmaveda-specific fallback order; it does not infer missing astronomy.
 */
export function getSamavedaUpakarmaDateDecision(days) {
  const records = (Array.isArray(days) ? days : [])
    .map(day => ({
      ...day,
      sunrise: validDate(day && day.sunrise),
      sunset: validDate(day && day.sunset),
      date: validDate(day && (day.date || day.sunrise))
    }))
    .filter(day => day.date && day.sunrise && day.sunset && day.sunset > day.sunrise)
    .sort((a, b) => a.date - b.date);

  if (!records.length) {
    return { status: "unavailable", message: "स्थानीय दिनमान और पंचांग-अवधि उपलब्ध नहीं है; उपाकर्म-दिन निर्धारित नहीं किया गया।" };
  }

  const hasName = (value, pattern) => pattern.test(normalizedName(value));
  const isBhadrapada = day => hasName(day.month, /bhadrapada|भाद्रपद|प्रौष्ठपद/);
  const isShravana = day => hasName(day.month, /shravana|श्रावण/);
  const isShukla = day => hasName(day.paksha, /shukla|शुक्ल/);
  const isPanchami = day => hasName(day.tithi, /panchami|पञ्चमी|पंचमी/);

  function hastaInterval(day) {
    const named = collectNamedIntervals(day.nakshatras, isHasta);
    if (named.length) return { start: named[0].start, end: named[0].end };
    const explicitStart = validDate(day.hastaStartTime);
    const explicitEnd = validDate(day.hastaEndTime);
    if (explicitStart && explicitEnd && explicitEnd > explicitStart) {
      return { start: explicitStart, end: explicitEnd };
    }
    const current = day.nakshatra;
    const next = day.nextNakshatra;
    if (isHasta(current)) {
      const end = validDate(day.nakshatraEndTime);
      return end && end > day.sunrise ? { start: day.sunrise, end } : null;
    }
    if (isHasta(next)) {
      const start = validDate(day.nakshatraEndTime);
      const end = validDate(day.nextNakshatraEndTime);
      return start && end && end > start ? { start, end } : null;
    }
    return null;
  }

  function aparahna(day) {
    const duration = day.sunset.getTime() - day.sunrise.getTime();
    return {
      start: new Date(day.sunrise.getTime() + duration * 3 / 5),
      end: new Date(day.sunrise.getTime() + duration * 4 / 5)
    };
  }

  function hasHastaAparahna(day) {
    const hasta = hastaInterval(day);
    if (!hasta) return false;
    const afternoon = aparahna(day);
    return laterDate(hasta.start, afternoon.start) < earlierDate(hasta.end, afternoon.end);
  }

  function hasDosha(day) {
    const flags = day.dosha || {};
    const index = records.indexOf(day);
    const previous = index > 0 ? records[index - 1] : null;
    const next = index >= 0 && index + 1 < records.length ? records[index + 1] : null;
    const beforeMidnight = previous
      ? new Date((previous.sunset.getTime() + day.sunrise.getTime()) / 2)
      : null;
    const afterMidnight = next
      ? new Date((day.sunset.getTime() + next.sunrise.getTime()) / 2)
      : null;
    const occursInDay = values => {
      if (!beforeMidnight || !afterMidnight) return false;
      const items = Array.isArray(values) ? values : values ? [values] : [];
      return items.some(value => {
        if (value && typeof value === "object") {
          const start = validDate(value.startTime ?? value.start);
          const end = validDate(value.endTime ?? value.end);
          // Exact eclipse visibility is an interval, not a representative
          // midpoint. Any overlap with this Hindu day is sufficient.
          if (start && end && end > start) {
            return start < afterMidnight && end > beforeMidnight;
          }
          const time = validDate(value.time ?? value.date ?? value.startTime);
          return Boolean(time && time >= beforeMidnight && time < afterMidnight);
        }
        const time = validDate(value);
        return Boolean(time && time >= beforeMidnight && time < afterMidnight);
      });
    };
    const kalaDosha = Boolean(
      day.grahana || day.eclipse || day.sankranti ||
      flags.grahana || flags.eclipse || flags.sankranti ||
      occursInDay([
        ...(Array.isArray(day.grahanaTimes) ? day.grahanaTimes : day.grahanaTimes ? [day.grahanaTimes] : []),
        ...(Array.isArray(day.grahanaIntervals) ? day.grahanaIntervals : day.grahanaIntervals ? [day.grahanaIntervals] : []),
        ...(Array.isArray(day.eclipseTimes) ? day.eclipseTimes : day.eclipseTimes ? [day.eclipseTimes] : []),
        ...(Array.isArray(day.eclipseIntervals) ? day.eclipseIntervals : day.eclipseIntervals ? [day.eclipseIntervals] : []),
        ...(day.grahanaTime ? [day.grahanaTime] : []),
        ...(day.eclipseTime ? [day.eclipseTime] : [])
      ]) ||
      occursInDay(day.sankrantiTimes || day.sankrantiTime)
    );
    // Guru/Shukra Asta and Guru-in-Simha are intentionally excluded from
    // this annual resolver. They are being handled in a separate project task.
    return kalaDosha;
  }

  function chooseHasta(candidates, label) {
    const sorted = candidates.slice().sort((a, b) => a.date - b.date);
    if (!sorted.length) return null;
    // The śāstric two-day rule compares the Aparāhṇa overlap of the
    // same Hasta passage on consecutive days:
    // both days -> second; only first -> first; only second/neither -> second.
    for (let i = 0; i < sorted.length - 1; i++) {
      const first = sorted[i], second = sorted[i + 1];
      const gap = localDateKey(second.date) === localDateKey(new Date(first.date.getTime() + 86400000));
      if (!gap) continue;
      const firstHas = hasHastaAparahna(first);
      const secondHas = hasHastaAparahna(second);
      const selected = firstHas && !secondHas ? first : second;
      return { day: selected, label, note: "दो लगातार दिनों में हस्त नक्षत्र की अपराह्ण-व्याप्ति की शास्त्रीय तुलना से चयन।" };
    }
    const only = sorted.find(day => hasHastaAparahna(day)) || sorted[0];
    return { day: only, label, note: "हस्त नक्षत्र की स्थानीय अपराह्ण-व्याप्ति के आधार पर चयन।" };
  }

  const bhadrapadaHasta = records.filter(day =>
    isBhadrapada(day) && isShukla(day) && (isHasta(day.nakshatra) || isHasta(day.nextNakshatra) || hastaInterval(day))
  );
  const shravanaHasta = records.filter(day =>
    isShravana(day) && isShukla(day) && (isHasta(day.nakshatra) || isHasta(day.nextNakshatra) || hastaInterval(day))
  );
  const isKarkaSun = day => hasName(day.sunRashi ?? day.sunSign, /karka|cancer|कर्क/) ||
    Number(day.sunRashi ?? day.sunSign) === 3;
  const shravanaHastaRegular = shravanaHasta.filter(day => !isKarkaSun(day));
  const shravanaHastaKarka = shravanaHasta.filter(isKarkaSun);
  const bhadrapadaPanchami = records.filter(day => isBhadrapada(day) && isShukla(day) && isPanchami(day));
  const shravanaPanchami = records.filter(day => isShravana(day) && isShukla(day) && isPanchami(day));
  const primary = chooseHasta(bhadrapadaHasta, "भाद्रपद शुक्ल हस्त");
  const ordered = [
    primary,
    chooseHasta(shravanaHastaRegular, "श्रावण शुक्ल हस्त"),
    ...bhadrapadaPanchami.map(day => ({ day, label: "भाद्रपद शुक्ल पंचमी", note: "सामवेदी उपाकर्म का पंचमी विकल्प।" })),
    ...shravanaPanchami.map(day => ({ day, label: "श्रावण शुक्ल पंचमी", note: "सामवेदी उपाकर्म का अगला पंचमी विकल्प।" })),
    chooseHasta(shravanaHastaKarka, "श्रावण शुक्ल हस्त — कर्कस्थ सूर्य में अंतिम विकल्प")
  ].filter(Boolean);

  for (const candidate of ordered) {
    if (!hasDosha(candidate.day, candidate !== primary)) {
      return {
        status: "selected",
        date: localDateKey(candidate.day.date),
        label: candidate.label,
        note: candidate.note,
        requiresShanti: false,
        sourceDay: candidate.day
      };
    }
  }

  if (primary) {
    return {
      status: "selected-with-shanti",
      date: localDateKey(primary.day.date),
      label: primary.label,
      note: "सभी उपलब्ध विकल्पों में काल-दोष मिला; मुख्य भाद्रपद हस्त पर शान्ति-विधान सहित निर्णय।",
      requiresShanti: true,
      sourceDay: primary.day
    };
  }
  return {
    status: "unavailable",
    message: "भाद्रपद हस्त और शास्त्रीय वैकल्पिक कालों की पर्याप्त पंचांग-अवधि उपलब्ध नहीं है; तिथि अनुमानित नहीं की गई।"
  };
}

export function getFestivalMuhurtaRuleIds() {
  return Object.keys(rules);
}
