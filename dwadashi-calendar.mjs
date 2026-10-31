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
  const groups = new Map();

  dailyPanchang.forEach(day => {
    const sunrise = day && day.sunriseTithi;
    if (!sunrise || normalizeTithi(sunrise.tithi) !== "द्वादशी") return;
    const masa = normalizeMonth(sunrise.masa || day.masa);
    const paksha = normalizePaksha(sunrise.paksha || day.paksha);
    if (!masa.month || !paksha || !/^\d{4}-\d{2}-\d{2}$/.test(String(day.date || ""))) return;
    const key = [masa.month, paksha, masa.adhika ? "adhika" : "nija"].join("|");
    if (!groups.has(key)) groups.set(key, {
      id: MONTH_SLUGS[masa.month] + "-" + (paksha === "कृष्ण" ? "krishna" : "shukla") + (masa.adhika ? "-adhika" : ""),
      month: masa.month,
      paksha,
      adhika: masa.adhika,
      sunriseDates: []
    });
    groups.get(key).sunriseDates.push(day.date);
  });

  const year = Number(dailyPanchang.find(day => day && day.date)?.date?.slice(0, 4));
  const tithis = Array.from(groups.values()).map(group => {
    group.sunriseDates = unique(group.sunriseDates).sort(dateSort);
    const source = !group.adhika
      ? catalog.find(item => item.month === group.month && item.paksha === group.paksha)
      : null;
    const observances = source && Array.isArray(source.observances) ? source.observances : [];
    const drikNames = year === 2026 && source && Array.isArray(source.drik2026Labels)
      ? source.drik2026Labels : [];
    const names = unique(observances.map(item => item.name).concat(drikNames));
    return {
      id: group.id,
      month: group.month,
      paksha: group.paksha,
      adhika: group.adhika,
      tithi: "द्वादशी",
      sunriseDates: group.sunriseDates,
      candidateDates: group.sunriseDates,
      selectedDate: group.sunriseDates.length === 1 ? group.sunriseDates[0] : null,
      dateSelection: group.sunriseDates.length === 1
        ? "single-sunrise-candidate-review-required"
        : "requires-vrata-specific-rule",
      displayNames: names,
      observances,
      drik2026Labels: drikNames,
      status: "needs-review"
    };
  }).sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month) ||
    (a.adhika === b.adhika ? (a.paksha === "कृष्ण" ? -1 : 1) : (a.adhika ? -1 : 1)));

  return {
    schemaVersion: 1,
    year: Number.isFinite(year) ? year : null,
    status: "needs-review",
    locationSelection: "स्थान-विशिष्ट सूर्योदय",
    dateSelection: "सूर्योदय-द्वादशी केवल संभावित तारीख़ें देती है; व्रत-विशेष के नियम से चयन और स्वीकृति आवश्यक है",
    tithis
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
    const matches = dailyPanchang.filter(day => {
      const sunrise = day && day.sunriseTithi;
      if (!sunrise) return false;
      const masa = normalizeMonth(sunrise.masa || day.masa);
      return !masa.adhika && masa.month === spec.month &&
        normalizePaksha(sunrise.paksha || day.paksha) === spec.paksha &&
        normalizeTithi(sunrise.tithi) === spec.tithi;
    }).map(day => day.date).filter(Boolean).sort(dateSort);
    return { ...spec, observedDates: unique(matches), selectedDate: unique(matches).sort(dateSort)[0] || null };
  });
  const missing = boundaries.filter(item => !item.selectedDate).map(item => item.id);
  const complete = missing.length === 0;
  const phases = complete ? [
    { id:"shak", title:"शाक (सब्जी) का त्याग", startDate:boundaries[0].selectedDate, endDate:boundaries[1].selectedDate, startTithi:"आषाढ़ शुक्ल एकादशी", endTithi:"श्रावण शुक्ल द्वादशी", detail:"शाक-सब्जी का त्याग करें; परंपरा के अनुसार किसी एक प्रकार की शाक का सेवन न करने का विकल्प भी है।" },
    { id:"dahi", title:"दही का त्याग", startDate:boundaries[1].selectedDate, endDate:boundaries[2].selectedDate, startTithi:"श्रावण शुक्ल द्वादशी", endTithi:"भाद्रपद शुक्ल द्वादशी", detail:"आरंभ में त्यागी गई सब्जियों का दान करें। तक्र या मट्ठा निषेध नहीं है।" },
    { id:"doodh", title:"दूध का त्याग", startDate:boundaries[2].selectedDate, endDate:boundaries[3].selectedDate, startTithi:"भाद्रपद शुक्ल द्वादशी", endTithi:"आश्विन शुक्ल द्वादशी", detail:"आरंभ में दही का दान करें।" },
    { id:"dal", title:"दालों का त्याग", startDate:boundaries[3].selectedDate, endDate:boundaries[4].selectedDate, startTithi:"आश्विन शुक्ल द्वादशी", endTithi:"कार्तिक शुक्ल एकादशी", detail:"आरंभ में दूध का दान करें; दालों अथवा किसी एक प्रकार की दाल का त्याग करें।" }
  ] : [];
  const last = complete ? new Date(boundaries[4].selectedDate + "T00:00:00Z") : null;
  if (last) last.setUTCDate(last.getUTCDate() + 2);
  const year = Number(dailyPanchang.find(day => day && day.date)?.date?.slice(0, 4));
  return {
    schemaVersion: 1,
    year: Number.isFinite(year) ? year : null,
    status: complete ? "needs-review" : "incomplete",
    selectionMethod: "udayavyapini-smarta-first-sunrise",
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
    cardVisibleThroughDate: last ? last.toISOString().slice(0, 10) : null,
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
    calculationStatus: "research-only-not-approved",
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
    chaturmas
  };
}
