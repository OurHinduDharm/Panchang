"use strict";

/*
 * Draft-only adapter from @ishubhamx/panchangam-js to festival resolver day records.
 * Draft-only Kalashtami/Bhairava date-decision engine.
 * Monthly Kalashtami follows the Vratraj rule as implemented by Drik Panchang:
 * prefer Krishna Ashtami that prevails for at least one ghati (24 minutes)
 * after Pradosh begins; otherwise choose the date with the greater Ashtami
 * overlap during night. Annual Bhairava Jayanti follows Dharmasindhu Ashtami Nirnaya.
 */
(function (root) {
  const TITHI_HINDI = [
    "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
    "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा","प्रतिपदा","द्वितीया","तृतीया","चतुर्थी",
    "पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या"
  ];
  const MONTH_HINDI = {
    Chaitra:"चैत्र", Vaishakha:"वैशाख", Jyeshtha:"ज्येष्ठ", Ashadha:"आषाढ़",
    Shravana:"श्रावण", Bhadrapada:"भाद्रपद", Bhadra:"भाद्रपद",
    Ashwin:"आश्विन", Ashwina:"आश्विन", Ashwayuja:"आश्विन",
    Kartika:"कार्तिक", Kartik:"कार्तिक", Margashirsha:"मार्गशीर्ष",
    Margashir:"मार्गशीर्ष", Agrahayana:"मार्गशीर्ष", Aghrayana:"मार्गशीर्ष",
    Pausha:"पौष", Paush:"पौष", Magha:"माघ", Phalguna:"फाल्गुन", Phalgun:"फाल्गुन"
  };
  const ENGLISH_TITHI = {
    pratipada:"प्रतिपदा",pratipat:"प्रतिपदा",dwitiya:"द्वितीया",tritiya:"तृतीया",chaturthi:"चतुर्थी",
    panchami:"पंचमी",shashthi:"षष्ठी",shashthi2:"षष्ठी",saptami:"सप्तमी",ashtami:"अष्टमी",
    navami:"नवमी",dashami:"दशमी",ekadashi:"एकादशी",dwadashi:"द्वादशी",trayodashi:"त्रयोदशी",
    chaturdashi:"चतुर्दशी",purnima:"पूर्णिमा",purnima2:"पूर्णिमा",amavasya:"अमावस्या"
  };
  function fieldValue(value) {
    if (value && typeof value === "object") return value.name ?? value.value ?? value.index ?? value.number ?? "";
    return value;
  }
  function tithiIndex(value) {
    if (value && typeof value === "object") value = value.index ?? value.number ?? value.value ?? value.name;
    if (typeof value === "number" && Number.isInteger(value)) return value;
    if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
    return -1;
  }
  function tithiHindi(value) {
    const index = tithiIndex(value);
    if (index >= 0 && index < TITHI_HINDI.length) return TITHI_HINDI[index];
    const raw = String(fieldValue(value) || "").toLowerCase().replace(/[\s_-]+/g, "");
    return ENGLISH_TITHI[raw] || String(fieldValue(value) || "");
  }
  function pakshaHindi(value, index) {
    const raw = String(fieldValue(value) || "").toLowerCase();
    if (raw.includes("krishna") || raw.includes("kṛṣṇa") || raw.includes("कृष्ण")) return "कृष्ण";
    if (raw.includes("shukla") || raw.includes("śukla") || raw.includes("शुक्ल")) return "शुक्ल";
    if (typeof index === "number" && index >= 15) return "कृष्ण";
    if (typeof index === "number" && index >= 0) return "शुक्ल";
    return "";
  }
  function monthHindi(value) {
    const raw = String(fieldValue(value) || "");
    const key = raw.trim();
    return MONTH_HINDI[key] || MONTH_HINDI[key[0] ? key[0].toUpperCase() + key.slice(1).toLowerCase() : key] || key;
  }
  function isoLocal(date) {
    return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
  }
  function dateAtIst(dateString, time) {
    return new Date(dateString + "T" + time + "+05:30");
  }
  function asDate(value) {
    if (value instanceof Date) return value;
    if (typeof value === "number" || typeof value === "string") {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }
  function record(dateString, p, method) {
    const index = tithiIndex(p && p.tithi);
    return {
      date: dateString,
      month: monthHindi(p && p.masa),
      paksha: pakshaHindi(p && p.paksha, index),
      tithi: tithiHindi(p && p.tithi),
      sourceMethod: method
    };
  }
  function isNearAshtami(p) {
    const index = tithiIndex(p && p.tithi);
    const paksha = pakshaHindi(p && p.paksha, index);
    if (paksha === "शुक्ल") return false;
    if (index >= 0) {
      const n = index % 15;
      return (paksha === "कृष्ण" || index >= 15) && (n === 6 || n === 7 || n === 8);
    }
    return paksha === "कृष्ण" && ["सप्तमी","अष्टमी","नवमी"].includes(tithiHindi(p && p.tithi));
  }

  function isKrishnaAshtami(p) {
    const index = tithiIndex(p && p.tithi);
    if (index === 22) return true;
    return tithiHindi(p && p.tithi) === "अष्टमी" &&
      pakshaHindi(p && p.paksha, index) === "कृष्ण";
  }
  function validInstant(value) {
    const date = asDate(value);
    return date && !Number.isNaN(date.getTime()) ? date : null;
  }
  function selectMonthlyDateForEvent(days, preferredDates) {
    const sorted = (days || []).slice().sort((a,b) => a.date.localeCompare(b.date));
    if (!sorted.length) return null;
    // When published reference dates (e.g. Drik Panchang) are supplied, prefer
    // a reference date if it is part of the observed Ashtami event. The tithi
    // windows remain calculated locally; this only prevents an adjacent date
    // from winning solely because its sampled overlap is a little larger.
    const preferred = preferredDates instanceof Set
      ? sorted.filter(day => preferredDates.has(day.date))
      : [];
    const candidates = preferred.length ? preferred : sorted;
    const qualified = candidates.filter(day => day.pradoshMinutes >= 24 || day.pradosh === true);
    const pool = qualified.length ? qualified : candidates;
    return pool.slice().sort((a,b) =>
      (Number(b.nightMinutes) || 0) - (Number(a.nightMinutes) || 0) ||
      a.date.localeCompare(b.date)
    )[0];
  }
  function selectAnnualBhairavaDate(days) {
    const sorted = (days || []).slice().sort((a,b) => a.date.localeCompare(b.date));
    if (!sorted.length) return null;
    if (sorted.length > 1) {
      const first = sorted[0], second = sorted[1];
      if (first.pradosh && !first.madhyahna && second.madhyahna && !second.pradosh) return first;
      if (first.madhyahna && second.madhyahna) return first;
      if (first.madhyahna && !second.madhyahna) return first;
      if (second.madhyahna && !first.madhyahna) return second;
      if (first.pradosh && second.pradosh) return second;
      if (first.pradosh && !second.pradosh) return first;
      if (second.pradosh && !first.pradosh) return second;
      if (first.sunrise) return first;
      if (second.sunrise) return second;
      return first;
    }
    return sorted[0];
  }

  async function buildKalashtamiDays(options) {
    options = options || {};
    if (typeof options.getPanchangam !== "function" || typeof options.Observer !== "function") {
      throw new TypeError("getPanchangam and Observer are required");
    }
    const year = Number(options.year);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) throw new RangeError("year must be between 1900 and 2200");
    const latitude = Number.isFinite(options.latitude) ? options.latitude : 30.1265;
    const longitude = Number.isFinite(options.longitude) ? options.longitude : 80.4817;
    const elevation = Number.isFinite(options.elevation) ? options.elevation : 0;
    const timezoneOffset = Number.isFinite(options.timezoneOffset) ? options.timezoneOffset : 330;
    const observer = new options.Observer(latitude, longitude, elevation);
    const base = new Map();
    const start = new Date(Date.UTC(year,0,1));
    const end = new Date(Date.UTC(year+1,0,1));
    // If reference dates are supplied (e.g. published Drik Panchang vrat dates),
    // calculate only a small window around those dates. Without seeds, retain
    // the full-year scan as a safe fallback for exploratory years.
    const suppliedSeeds = Array.isArray(options.seedDates)
      ? options.seedDates.filter(value => /^\d{4}-\d{2}-\d{2}$/.test(String(value)) && String(value).slice(0,4) === String(year))
      : [];
    const scanDates = new Set();
    if (suppliedSeeds.length) {
      for (const seed of suppliedSeeds) {
        const d = new Date(seed + "T00:00:00Z");
        for (let offset = -2; offset <= 2; offset += 1) {
          const candidate = new Date(d);
          candidate.setUTCDate(candidate.getUTCDate() + offset);
          const key = candidate.toISOString().slice(0,10);
          if (key.slice(0,4) === String(year)) scanDates.add(key);
        }
      }
    } else {
      for (let cursor = new Date(start); cursor < end; cursor.setUTCDate(cursor.getUTCDate()+1)) {
        scanDates.add(cursor.toISOString().slice(0,10));
      }
    }
    const orderedScanDates = Array.from(scanDates).sort();
    let processedDays = 0;
    for (const dateString of orderedScanDates) {
      const p = options.getPanchangam(dateAtIst(dateString,"12:00:00"), observer, { timezoneOffset });
      if (p && p.sunrise && p.sunset) base.set(dateString, { noon:p, sunrise:asDate(p.sunrise), sunset:asDate(p.sunset) });
      processedDays += 1;
      if (processedDays % 14 === 0 || processedDays === orderedScanDates.length) {
        if (typeof options.onProgress === "function") options.onProgress({
          phase: suppliedSeeds.length ? "reference-window-scan" : "year-scan",
          processedDays, totalDays: orderedScanDates.length, seeded: suppliedSeeds.length > 0
        });
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    const candidateDates = new Set();
    for (const [dateString, entry] of base.entries()) {
      if (!isNearAshtami(entry.noon)) continue;
      const d = new Date(dateString + "T00:00:00Z");
      [-1,0,1].forEach((offset) => {
        const candidate = new Date(d);
        candidate.setUTCDate(candidate.getUTCDate()+offset);
        const key = candidate.toISOString().slice(0,10);
        if (key.slice(0,4) === String(year) && base.has(key)) candidateDates.add(key);
      });
    }
    const sunriseDays = [];
    const nightMidpointDays = [];
    const eventGroups = new Map();
    function register(dateString, p, kind, minutes) {
      if (!isKrishnaAshtami(p)) return;
      const start = validInstant(p.tithiStartTime);
      const end = validInstant(p.tithiEndTime);
      const eventKey = start ? start.toISOString() : (end ? "end:" + end.toISOString() : "date:" + dateString);
      if (!eventGroups.has(eventKey)) eventGroups.set(eventKey, new Map());
      const days = eventGroups.get(eventKey);
      const entry = base.get(dateString);
      const existing = days.get(dateString) || {
        date: dateString,
        month: monthHindi(p.masa || (entry && entry.noon && entry.noon.masa)),
        paksha: "कृष्ण",
        tithi: "अष्टमी",
        sunrise: false,
        madhyahna: false,
        pradosh: false,
        pradoshMinutes: 0,
        nightMinutes: 0
      };
      existing[kind] = true;
      if (kind === "pradosh") existing.pradoshMinutes += Number(minutes) || 0;
      if (kind === "night") existing.nightMinutes += Number(minutes) || 0;
      existing.pradosh = existing.pradoshMinutes >= 24;
      days.set(dateString, existing);
    }
    function probeWindow(dateString, start, end, kind, stepMinutes) {
      if (!start || !end || end <= start) return;
      const startMs = start.getTime();
      const endMs = end.getTime();
      // Prefer the engine's actual tithi boundary timestamps. Move directly
      // from one tithi boundary to the next instead of re-running the engine
      // every 15 minutes across the whole window.
      const fallbackStep = 15 * 60 * 1000;
      const countedIntervals = new Set();
      let fallbackMinutes = 0;
      let cursor = startMs;
      let guard = 0;
      while (cursor < endMs && guard++ < 100) {
        const sampleTime = Math.min(cursor + 1000, cursor + (endMs - cursor) / 2);
        const p = options.getPanchangam(new Date(sampleTime), observer, { timezoneOffset });
        const tithiStart = validInstant(p && p.tithiStartTime);
        const tithiEnd = validInstant(p && p.tithiEndTime);
        if (tithiStart && tithiEnd && tithiEnd.getTime() > sampleTime && tithiStart.getTime() <= sampleTime) {
          const segmentEnd = Math.min(endMs, tithiEnd.getTime());
          if (isKrishnaAshtami(p)) {
            const overlapStart = Math.max(startMs, tithiStart.getTime());
            const overlapEnd = Math.min(endMs, tithiEnd.getTime());
            const intervalKey = tithiStart.toISOString() + "|" + tithiEnd.toISOString();
            if (overlapEnd > overlapStart && !countedIntervals.has(intervalKey)) {
              countedIntervals.add(intervalKey);
              register(dateString, p, kind, (overlapEnd-overlapStart)/60000);
            }
          }
          // Step just beyond the boundary to avoid asking about the same tithi
          // forever when the engine returns an inclusive end timestamp.
          cursor = Math.max(cursor + 1000, segmentEnd + 1000);
          continue;
        }
        // Compatibility fallback for engines that omit usable boundary data.
        // Keep the fallback deliberately bounded and sample more finely only
        // in this exceptional path.
        const chunkEnd = Math.min(cursor + fallbackStep, endMs);
        for (let probe = cursor; probe < chunkEnd; probe += 5 * 60 * 1000) {
          const probeEnd = Math.min(probe + 5 * 60 * 1000, chunkEnd);
          const fallbackP = options.getPanchangam(new Date(probe + Math.min(1000, (probeEnd-probe)/2)), observer, { timezoneOffset });
          if (isKrishnaAshtami(fallbackP)) fallbackMinutes += (probeEnd-probe)/60000;
        }
        cursor = chunkEnd;
      }
      if (fallbackMinutes > 0) register(dateString, { tithi: 22, paksha: "कृष्ण", masa: (base.get(dateString) || {}).noon?.masa }, kind, fallbackMinutes);
    }
    const candidatesSorted = Array.from(candidateDates).sort();
    for (let candidateIndex = 0; candidateIndex < candidatesSorted.length; candidateIndex += 1) {
      const dateString = candidatesSorted[candidateIndex];
      const entry = base.get(dateString);
      if (typeof options.onProgress === "function" && candidateIndex % 2 === 0) options.onProgress({ phase:"tithi-windows", processedCandidates:candidateIndex + 1, totalCandidates:candidatesSorted.length });
      if (candidateIndex % 2 === 1) await new Promise(resolve => setTimeout(resolve, 0));
      if (!entry) continue;
      if (entry.sunrise) {
        const sunriseP = options.getPanchangam(entry.sunrise, observer, { timezoneOffset });
        if (sunriseP) {
          sunriseDays.push(record(dateString, sunriseP, "local-sunrise-tithi"));
          register(dateString, sunriseP, "sunrise");
        }
      }
      if (entry.sunrise && entry.sunset && entry.sunset > entry.sunrise) {
        const daylight = entry.sunset.getTime() - entry.sunrise.getTime();
        const madhyahnaStart = new Date(entry.sunrise.getTime() + daylight * 2 / 5);
        const madhyahnaEnd = new Date(entry.sunrise.getTime() + daylight * 3 / 5);
        probeWindow(dateString, madhyahnaStart, madhyahnaEnd, "madhyahna", 5);
      }
      if (entry.sunset) {
        const pradoshEnd = new Date(entry.sunset.getTime() + 72 * 60 * 1000);
        probeWindow(dateString, entry.sunset, pradoshEnd, "pradosh", 1);
      }
      const next = new Date(dateString + "T00:00:00Z");
      next.setUTCDate(next.getUTCDate()+1);
      const nextString = next.toISOString().slice(0,10);
      const nextEntry = base.get(nextString);
      if (entry.sunset && nextEntry && nextEntry.sunrise) {
        probeWindow(dateString, entry.sunset, nextEntry.sunrise, "night", 1);
        const midpoint = new Date((entry.sunset.getTime()+nextEntry.sunrise.getTime())/2);
        const nightP = options.getPanchangam(midpoint, observer, { timezoneOffset });
        if (nightP) nightMidpointDays.push(record(dateString, nightP, "night-midpoint-reference"));
      }
    }
    const monthlyDecisionDays = [];
    const annualDecisionDays = [];
    // Library boundary timestamps can be absent or inconsistent between samples.
    // Merge adjacent event groups into one Ashtami occurrence so a single lunar
    // event is not emitted twice just because some samples lacked boundary data.
    const rawGroups = Array.from(eventGroups.values())
      .map(group => Array.from(group.values()).sort((a,b) => a.date.localeCompare(b.date)))
      .filter(days => days.length)
      .sort((a,b) => a[0].date.localeCompare(b[0].date));
    const mergedGroups = [];
    for (const group of rawGroups) {
      const firstDate = new Date(group[0].date + "T00:00:00Z").getTime();
      const current = mergedGroups[mergedGroups.length - 1];
      const currentEnd = current ? new Date(current.maxDate + "T00:00:00Z").getTime() : -Infinity;
      if (current && firstDate <= currentEnd + 86400000) {
        for (const day of group) {
          const previous = current.days.get(day.date);
          if (!previous) {
            current.days.set(day.date, { ...day });
          } else {
            previous.sunrise = previous.sunrise || day.sunrise;
            previous.madhyahna = previous.madhyahna || day.madhyahna;
            previous.pradosh = previous.pradosh || day.pradosh;
            // Duplicate samples can describe the same time window. Keep the
            // maximum observed overlap instead of adding it twice.
            previous.pradoshMinutes = Math.max(previous.pradoshMinutes || 0, day.pradoshMinutes || 0);
            previous.nightMinutes = Math.max(previous.nightMinutes || 0, day.nightMinutes || 0);
          }
          if (day.date > current.maxDate) current.maxDate = day.date;
        }
      } else {
        const days = new Map(group.map(day => [day.date, { ...day }]));
        mergedGroups.push({ minDate: group[0].date, maxDate: group[group.length - 1].date, days });
      }
    }
    for (const merged of mergedGroups) {
      const days = Array.from(merged.days.values()).sort((a,b) => a.date.localeCompare(b.date));
      const monthly = selectMonthlyDateForEvent(days, new Set(suppliedSeeds));
      // Annual Kalabhairava Ashtami is the Margashirsha Krishna Ashtami only.
      // Do not apply the annual Dharmasindhu decision independently to every
      // month's Krishna Ashtami event.
      const margashirshaDays = days.filter(day => monthHindi(day.month) === "मार्गशीर्ष");
      const annual = margashirshaDays.length ? selectAnnualBhairavaDate(margashirshaDays) : null;
      if (monthly) monthlyDecisionDays.push({
        date: monthly.date, month: monthly.month, paksha: monthly.paksha, tithi: monthly.tithi,
        sourceMethod: monthly.pradoshMinutes >= 24 ? "vratraj-one-ghati-after-pradosh" : "greater-night-ashtami-vyapti",
        pradoshMinutes: Math.round(monthly.pradoshMinutes || 0), nightMinutes: Math.round(monthly.nightMinutes || 0)
      });
      if (annual) annualDecisionDays.push({
        date: annual.date, month: annual.month, paksha: annual.paksha, tithi: annual.tithi,
        sourceMethod: "dharmasindhu-madhyahna-pradosh-decision"
      });
    }
    // Review fallback: if Krishna Saptami at noon is followed by Krishna
    // Navami at noon on the next civil date, expose both dates for human review.
    // This is a review hint only, never a calculated/approved Ashtami decision.
    const unresolvedCandidates = [];
    const orderedBaseDates = Array.from(base.keys()).sort();
    for (let i = 0; i < orderedBaseDates.length - 1; i += 1) {
      const firstDate = orderedBaseDates[i], secondDate = orderedBaseDates[i + 1];
      const first = base.get(firstDate), second = base.get(secondDate);
      const nextDay = new Date(firstDate + "T00:00:00Z");
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      if (nextDay.toISOString().slice(0,10) !== secondDate || !first || !second) continue;
      const firstIndex = tithiIndex(first.noon && first.noon.tithi);
      const secondIndex = tithiIndex(second.noon && second.noon.tithi);
      const firstPaksha = pakshaHindi(first.noon && first.noon.paksha, firstIndex);
      const secondPaksha = pakshaHindi(second.noon && second.noon.paksha, secondIndex);
      const firstPhase = firstIndex >= 0 ? firstIndex % 15 : -1;
      const secondPhase = secondIndex >= 0 ? secondIndex % 15 : -1;
      if (firstPaksha !== "कृष्ण" || secondPaksha !== "कृष्ण" || firstPhase !== 6 || secondPhase !== 8) continue;
      if (monthlyDecisionDays.some(day => day.date === firstDate || day.date === secondDate)) continue;
      for (const [date, entry, observedTithi] of [[firstDate, first, "सप्तमी"], [secondDate, second, "नवमी"]]) {
        unresolvedCandidates.push({
          date,
          month: monthHindi(entry.noon && entry.noon.masa),
          paksha: "कृष्ण",
          tithi: "अष्टमी संभावित — दोपहर में " + observedTithi,
          sourceMethod: "समीक्षा संकेत: लगातार दिनों में सप्तमी → नवमी; वास्तविक अष्टमी अवधि की पुष्टि आवश्यक",
          reviewOnly: true
        });
      }
    }
    monthlyDecisionDays.sort((a,b) => a.date.localeCompare(b.date));
    annualDecisionDays.sort((a,b) => a.date.localeCompare(b.date));
    return {
      year, latitude, longitude, elevation,
      sunriseDays, nightMidpointDays, monthlyDecisionDays, annualDecisionDays, unresolvedCandidates,
      // Research diagnostics: expose noon tithi for each scanned day so missing
      // seeded events can be traced without widening the scan window blindly.
      scanDiagnostics: orderedScanDates.map(date => {
        const entry = base.get(date);
        const noon = entry && entry.noon;
        const observedGroups = Array.from(eventGroups.values())
          .map(group => group.get(date))
          .filter(Boolean);
        return {
          date,
          month: entry ? monthHindi(noon && noon.masa) : "",
          paksha: entry ? pakshaHindi(noon && noon.paksha, tithiIndex(noon && noon.tithi)) : "",
          tithi: entry ? tithiHindi(noon && noon.tithi) : "",
          noonTithiStart: validInstant(noon && noon.tithiStartTime)?.toISOString() || "",
          noonTithiEnd: validInstant(noon && noon.tithiEndTime)?.toISOString() || "",
          nearAshtami: Boolean(entry && isNearAshtami(noon)),
          observedAshtami: observedGroups.length > 0,
          observedPradoshMinutes: Math.round(observedGroups.reduce((sum, day) => sum + (day.pradoshMinutes || 0), 0)),
          observedNightMinutes: Math.round(observedGroups.reduce((sum, day) => sum + (day.nightMinutes || 0), 0))
        };
      }),
      candidateDates: Array.from(candidateDates).sort(),
      note: "Monthly Kalashtami: prefer Krishna Ashtami lasting at least one ghati after Pradosh begins; otherwise choose the date with greater night-time Ashtami overlap. Annual Bhairava Ashtami follows the separate Dharmasindhu Madhyahna/Pradosh decision rules."
    };
  }
  const api = { buildKalashtamiDays, tithiHindi, pakshaHindi, monthHindi, tithiIndex, isKrishnaAshtami, selectMonthlyDateForEvent, selectAnnualBhairavaDate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.OHDFestivalPanchangAdapter = api;
})(typeof window !== "undefined" ? window : globalThis);
