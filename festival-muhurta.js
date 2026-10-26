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
  return date ? date.getDay() : null;
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
          : "गृहस्थों के लक्ष्मी-गणेश पूजन के लिए प्रदोष काल प्राथमिक विकल्प है। स्थिर लग्न की पुष्टि अलग से उपलब्ध न होने पर इसे वृषभ लग्न का मुहूर्त न मानें।"
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
        "यह विशेष साधना/तांत्रिक परंपराओं के लिए वैकल्पिक समय है; सामान्य गृहस्थ लक्ष्मी पूजन का प्राथमिक मुहूर्त नहीं।"
      );
      if (simhaNishita) windows.push(simhaNishita);
      else windows.push(nishita);
    } else if (nishita) {
      windows.push(nishita);
    }

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
      windows,
      note: "समय चुने हुए स्थान के सूर्यास्त, अगले सूर्योदय और अमावस्या की वास्तविक व्याप्ति से निकाला गया है। वृषभ स्थिर लग्न तभी दिखेगा जब उसके स्थानीय समय उपलब्ध हों।"
    };
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
    yoga: panchang && panchang.yoga,
    yogaEndTime: panchang && panchang.yogaEndTime,
    karanas: panchang && panchang.karanas,
    location: location || null
  };
}

export function getFestivalMuhurtaRuleIds() {
  return Object.keys(rules);
}
