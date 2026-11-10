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

function findDwadashiIntervalOnLocalDate(dailyPanchang, date, month, paksha, adhika) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return null;
  const start = Date.parse(date + "T00:00:00+05:30");
  const next = new Date(date + "T00:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const end = Date.parse(next.toISOString().slice(0, 10) + "T00:00:00+05:30");
  if (![start, end].every(Number.isFinite)) return null;

  for (const day of dailyPanchang) {
    if (!day) continue;
    const masa = normalizeMonth(day.masa);
    if (masa.month !== month || masa.adhika !== !!adhika || normalizePaksha(day.paksha) !== paksha) continue;
    const intervals = [];
    if (normalizeTithi(day.tithi) === "द्वादशी") {
      intervals.push({start:day.tithiStartTime, end:day.tithiEndTime, basis:"daily-tithi-interval"});
    }
    if (normalizeTithi(day.noonTithi) === "द्वादशी") {
      intervals.push({start:day.noonTithiStartTime || day.tithiStartTime, end:day.noonTithiEndTime || day.tithiEndTime, basis:"noon-tithi-interval"});
    }
    const sunrise = day.sunriseTithi;
    if (sunrise && normalizeTithi(sunrise.tithi) === "द्वादशी") {
      intervals.push({start:sunrise.tithiStartTime || day.tithiStartTime, end:sunrise.tithiEndTime || day.tithiEndTime, basis:"sunrise-tithi-interval"});
    }
    for (const interval of intervals) {
      const intervalStart = Date.parse(interval.start || "");
      const intervalEnd = Date.parse(interval.end || "");
      if (Number.isFinite(intervalStart) && Number.isFinite(intervalEnd) && intervalStart < end && intervalEnd > start) {
        return {date, intervalStart:new Date(intervalStart).toISOString(), intervalEnd:new Date(intervalEnd).toISOString(), basis:interval.basis, source:"local-panchang-tithi-interval"};
      }
    }
  }
  return null;
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
          !!findDwadashiIntervalOnLocalDate(dailyPanchang, referenceDate, month, paksha, adhika);
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

  // Keep every master month-paksha Dwadashi record visible every year.
  // Names belong to the permanent month/paksha catalogue, not to a Gregorian year.
  catalog.forEach(item => {
    const masa = normalizeMonth(item.month);
    const paksha = normalizePaksha(item.paksha);
    if (masa.month && paksha) ensureEmptyGroup(masa.month, paksha, !!item.adhika);
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
    const drikReferenceDate = group.referenceDate || drik2026Entry?.referenceDate || drikSpecialEntries.find(item => item.referenceDate)?.referenceDate || null;
    const sourceReferenceObservation = drikReferenceDate && !candidateDates.includes(drikReferenceDate)
      ? findDwadashiIntervalOnLocalDate(dailyPanchang, drikReferenceDate, group.month, group.paksha, group.adhika)
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
      drikSpecialObservances: drikSpecialEntries.map(item => ({ ...item, source:"Drik Panchang", sourceUrl:item.sourcePage === "smarta-ekadashi" ? "https://www.drikpanchang.com/ekadashi/ekadashi-dates.html?year=" + year + "&geoname-id=1259503" : "https://www.drikpanchang.com/dwadashi/dwadashi-dates.html?year=" + year + "&geoname-id=1259503", status:"source-cross-reference-needs-local-rule-review" })),
      selectedDate: drikReferenceDate
        ? (candidateDates.includes(drikReferenceDate) || sourceReferenceObservation ? drikReferenceDate : null)
        : candidateDates.length === 1
          ? candidateDates[0]
          : null,
      dateSelection: drikReferenceDate && candidateDates.includes(drikReferenceDate)
        ? "source-reference-date-candidate-review-required"
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
  // The Smarta Ekadashi is the Chaturmas completion observance; retain the final dietary restriction through the following civil day, then complete the vow on Dwadashi.
  if (complete) {
    const finalPhaseEnd = new Date(boundaries[4].selectedDate + "T00:00:00Z");
    finalPhaseEnd.setUTCDate(finalPhaseEnd.getUTCDate() + 1);
    phases[3].endDate = finalPhaseEnd.toISOString().slice(0, 10);
  }
  const last = complete ? new Date(boundaries[4].selectedDate + "T00:00:00Z") : null;
  if (last) last.setUTCDate(last.getUTCDate() + 2);
  const completionDate = last ? last.toISOString().slice(0, 10) : null;
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
    cardVisibleThroughDate: completionDate,
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
    chaturmas
  };
}
