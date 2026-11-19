import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDwadashiCalendar } from "../dwadashi-calendar.mjs";
import panchangPackage from "@ishubhamx/panchangam-js";
import { evaluateObservanceRule, evaluateShravanaDwadashiYoga, resolveObservanceCandidates } from "../festival-observance-rules.mjs";

const { getPanchangam, Observer } = panchangPackage;
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const OPTIONS = { timezoneOffset: 330, calendarType: "purnimanta" };

function localNoon(isoDate) {
  return new Date(isoDate + "T06:30:00.000Z");
}
function previousIsoDate(isoDate) {
  const date = new Date(isoDate + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
function nextIsoDate(isoDate) {
  const date = new Date(isoDate + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
function panchang(isoDate) {
  return getPanchangam(localNoon(isoDate), LOCATION, OPTIONS);
}
function masa(day) {
  const raw = day?.masa ?? day?.month;
  const value = raw && typeof raw === "object" ? raw.name ?? raw.value ?? "" : String(raw ?? "");
  return ({ Chaitra: "चैत्र", Vaishakha: "वैशाख", Jyeshtha: "ज्येष्ठ", Ashadha: "आषाढ़", Shravana: "श्रावण", Bhadrapada: "भाद्रपद", Ashwin: "आश्विन", Ashwina: "आश्विन", Kartika: "कार्तिक", Margashirsha: "मार्गशीर्ष", Pausha: "पौष", Magha: "माघ", Phalguna: "फाल्गुन" })[value] ?? value;
}
function nakshatras(...days) {
  return days.flatMap(day => Array.isArray(day?.nakshatras) ? day.nakshatras : []).map(row => ({ index: Number(row.index), name: row.name ?? null, startTime: row.startTime, endTime: row.endTime }));
}
function intervals(...days) {
  return days.flatMap(day => Array.isArray(day?.tithis) ? day.tithis : [])
    .map(row => {
      const index = Number(row.index ?? row.number ?? row.value);
      return {
        index,
        paksha: index >= 15 ? "कृष्ण पक्ष" : "शुक्ल पक्ष",
        name: row.name ?? null,
        startTime: row.startTime,
        endTime: row.endTime
      };
    });
}

test("real Pithoragarh Panchang resolves 2027 Parashurama Jayanti Pradosha pair", () => {
  const dates = ["2027-05-08", "2027-05-09"];
  const contexts = dates.map(date => {
    const previous = panchang(previousIsoDate(date));
    const current = panchang(date);
    const next = panchang(nextIsoDate(date));
    return {
      date,
      masa: masa(current),
      paksha: "शुक्ल पक्ष",
      sunset: current.sunset,
      nextSunrise: next.sunrise,
      tithis: intervals(previous, current, next)
    };
  });
  const result = resolveObservanceCandidates("parashurama-jayanti-pradosha-review", contexts);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2027-05-08");
  assert.equal(result.selectionBasis, "dharmasindhu-not-both-days-pradosha-vyapti-earlier-day");
  assert.equal(result.autoApproved, false);
});

test("real Pithoragarh Panchang resolves 2027 Vaishakha Shukla Narasimha Jayanti Pradosha", () => {
  const dates = ["2027-05-17", "2027-05-18"];
  const contexts = dates.map(date => {
    const previous = panchang(previousIsoDate(date));
    const current = panchang(date);
    const next = panchang(nextIsoDate(date));
    return {
      date,
      masa: masa(current),
      paksha: "शुक्ल पक्ष",
      sunset: current.sunset,
      nextSunrise: next.sunrise,
      tithis: intervals(previous, current, next)
    };
  });
  const result = resolveObservanceCandidates("narasimha-jayanti-smarta-review", contexts);
  assert.equal(result.autoApproved, false);
  assert.ok(
    ["date-selected-needs-source-approval", "insufficient-data"].includes(result.status),
    "real local intervals must either yield a source-review candidate or report incomplete data"
  );
  if (result.status === "date-selected-needs-source-approval") {
    assert.ok(dates.includes(result.selectedDate));
    assert.ok([
      "unique-pradosh-vyapini-chaturdashi",
      "dharmasindhu-both-pradoshas-later-day-to-avoid-trayodashi-contact",
      "dharmasindhu-no-pradosh-vyapti-second-day-to-avoid-trayodashi-contact"
    ].includes(result.selectionBasis));
  }
});

test("real Pithoragarh Panchang resolves 2027 Magha Shukla Ratha Saptami Arunodaya", () => {
  const dates = ["2027-02-12", "2027-02-13"];
  const contexts = dates.map(date => {
    const previous = panchang(previousIsoDate(date));
    const current = panchang(date);
    const next = panchang(nextIsoDate(date));
    return {
      date,
      masa: masa(current),
      paksha: "शुक्ल पक्ष",
      sunrise: current.sunrise,
      tithis: intervals(previous, current, next)
    };
  });
  const result = resolveObservanceCandidates("ratha-saptami-review", contexts);
  assert.ok(
    ["date-selected-needs-source-approval", "manual-review"].includes(result.status),
    "real local intervals must yield an explicit source-review or manual-review state"
  );
  assert.equal(result.autoApproved, false);
  if (result.status === "date-selected-needs-source-approval") {
    assert.ok(dates.includes(result.selectedDate));
    assert.ok([
      "dharmasindhu-arunodaya-vyapti-on-two-days-first-day",
      "magha-shukla-saptami-at-local-arunodaya",
      "dharmasindhu-shashthi-yukta-saptami-kshaya-before-next-arunodaya"
    ].includes(result.selectionBasis));
  }
});

test("real Pithoragarh Panchang confirms the Pradosh profile for a 2026 date", () => {
  const date = "2026-11-06", current = panchang(date), next = panchang(nextIsoDate(date));
  const result = evaluateObservanceRule("pradosh-trayodashi", {
    date, masa: masa(current), sunset: current.sunset, nextSunrise: next.sunrise,
    tithis: intervals(current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.evidence.length > 0);
});

test("real Pithoragarh Panchang confirms Sankashti at moonrise", () => {
  const date = "2026-11-27", current = panchang(date);
  const result = evaluateObservanceRule("sankashti-moonrise", {
    date, moonrise: current.moonrise, tithis: intervals(current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.evidence.length > 0);
});

test("real Pithoragarh Panchang confirms Masik Shivaratri during Nishita", () => {
  const date = "2026-11-07", current = panchang(date), next = panchang(nextIsoDate(date));
  const result = evaluateObservanceRule("masik-shivaratri-nishita", {
    date, masa: masa(current), sunset: current.sunset, nextSunrise: next.sunrise,
    tithis: intervals(current, next)
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.evidence.length > 0);
});

test("real Pithoragarh Panchang confirms Mahashivaratri during Nishita", () => {
  const date = "2026-02-15", previous = panchang(previousIsoDate(date)), current = panchang(date), next = panchang(nextIsoDate(date));
  const result = evaluateObservanceRule("mahashivaratri-nishita", {
    date, masa: masa(current), sunset: current.sunset, nextSunrise: next.sunrise,
    tithis: intervals(previous, current, next)
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.evidence.length > 0);
});

test("real Pithoragarh Panchang confirms Vinayaka Chaturthi during Madhyahna", () => {
  const date = "2026-09-14", current = panchang(date);
  const result = evaluateObservanceRule("vinayaka-chaturthi-madhyahna", {
    date, sunrise: current.sunrise, sunset: current.sunset,
    tithis: intervals(current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.evidence.length > 0);
});

test("real Pithoragarh Panchang supports Smarta Ekadashi at sunrise", () => {
  const date = "2026-11-05", current = panchang(date);
  const result = evaluateObservanceRule("ekadashi-smarta-udaya", {
    date, masa: masa(current), sunrise: current.sunrise,
    tithis: intervals(current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "sunrise");
});

test("real Pithoragarh Panchang finds Smarta Janmashtami in Bhadrapada at Nishita", () => {
  let supportedDate = null;
  const start = new Date("2026-08-20T00:00:00Z");
  for (let offset = 0; offset < 35; offset++) {
    const dateObject = new Date(start);
    dateObject.setUTCDate(dateObject.getUTCDate() + offset);
    const date = dateObject.toISOString().slice(0, 10);
    const previous = panchang(previousIsoDate(date)), current = panchang(date), next = panchang(nextIsoDate(date));
    const result = evaluateObservanceRule("janmashtami-smarta-nishita", {
      date, masa: masa(current), sunset: current.sunset, nextSunrise: next.sunrise,
      tithis: intervals(previous, current, next), nakshatraIntervals: nakshatras(previous, current, next)
    });
    if (result.status === "candidate-supported") { supportedDate = date; break; }
  }
  assert.equal(supportedDate, "2026-09-04", "Pithoragarh Smarta Janmashtami candidate should be 4 September 2026");
});

test("real Pithoragarh Panchang supports Sharad Navratri Pratipada at sunrise", () => {
  const date = "2026-10-11", current = panchang(date);
  const result = evaluateObservanceRule("navratri-udaya", {
    date, masa: masa(current), sunrise: current.sunrise,
    tithis: intervals(current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].tithiIndex, 0);
});

test("real Pithoragarh Panchang confirms Navratri Maha Ashtami sunrise evidence", () => {
  const date = "2026-10-19", previous = panchang(previousIsoDate(date)), current = panchang(date);
  const result = evaluateObservanceRule("navratri-maha-ashtami", {
    date, masa: masa(current), sunrise: current.sunrise,
    tithis: intervals(previous, current)
  });
  assert.equal(result.status, "candidate-supported");
});

test("real Pithoragarh Panchang checks Ashtami-viddha Maha Navami evening coverage", () => {
  const date = "2026-10-19", previous = panchang(previousIsoDate(date)), current = panchang(date);
  const result = evaluateObservanceRule("navratri-navami-ashtami-viddha", {
    date, masa: masa(current), sunrise: current.sunrise, sunset: current.sunset,
    tithis: intervals(previous, current)
  });
  assert.equal(result.status, "candidate-supported");
});

test("real Pithoragarh Panchang identifies the Navratri Sandhi tithi junction", () => {
  const date = "2026-10-19", previous = panchang(previousIsoDate(date)), current = panchang(date);
  const result = evaluateObservanceRule("navratri-sandhi-puja", {
    date, masa: masa(current), tithis: intervals(previous, current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence.length, 2);
});

test("real Pithoragarh Panchang confirms Vijayadashami Aparahna candidate on 20 October 2026", () => {
  const date = "2026-10-20", previous = panchang(previousIsoDate(date)), current = panchang(date);
  const result = evaluateObservanceRule("vijayadashami-aparahna", {
    date, masa: masa(current), sunrise: current.sunrise, sunset: current.sunset,
    tithis: intervals(previous, current), nakshatraIntervals: nakshatras(previous, current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.nakshatraLabel, "श्रवण");
});

test("real Pithoragarh Panchang supports Smarta Rama Navami on 26 March 2026", () => {
  const date = "2026-03-26", previous = panchang(previousIsoDate(date)), current = panchang(date);
  const result = evaluateObservanceRule("ram-navami-madhyahna", {
    date, masa: masa(current), sunrise: current.sunrise, sunset: current.sunset,
    tithis: intervals(previous, current)
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "madhyahna");
});

test("real Pithoragarh Nag Panchami data remains manual until special three-muhurta exceptions are evaluated", () => {
  const date = "2026-08-17", previous = panchang(previousIsoDate(date)), current = panchang(date);
  const result = evaluateObservanceRule("nag-panchami", {
    date, masa: masa(current), sunrise: current.sunrise, sunset: current.sunset,
    tithis: intervals(previous, current)
  });
  assert.equal(result.status, "manual-review");
  assert.match(result.reviewNote, /तीन मुहूर्त/);
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
});


test("real Pithoragarh 2030 Shravana Dwadashi checks local tithi-nakshatra yoga without auto-selecting a fast date", () => {
  const dates = ["2030-09-08", "2030-09-09"];
  const candidateDays = dates.map(date => {
    const previous = panchang(previousIsoDate(date));
    const current = panchang(date);
    const next = panchang(nextIsoDate(date));
    // A vrata-day runs from local sunrise to the following local sunrise,
    // not civil midnight to midnight.
    const dayStart = current.sunrise;
    const dayEnd = next.sunrise;
    return {
      date, dayStart, dayEnd, sunset: current.sunset, masa: masa(current), paksha: "शुक्ल पक्ष",
      tithis: intervals(previous, current, next),
      nakshatraIntervals: nakshatras(previous, current, next)
    };
  });
  const result = evaluateShravanaDwadashiYoga(candidateDays);
  assert.equal(result.status, "candidate-evidence-only");
  assert.deepEqual(result.qualifyingDates, ["2030-09-08"]);
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
  assert.equal(result.matches[0].durationMs, 35515308);
  assert.equal(result.matches[1].durationMs, 2513615);
  assert.ok(result.warnings.includes("tithi-nakshatra-overlap-is-not-a-fast-date-decision"));

  const selection = resolveObservanceCandidates("shravana-yoga-dwadashi-review", candidateDays);
  assert.equal(selection.status, "date-selected-needs-source-approval");
  assert.equal(selection.selectedDate, "2030-09-08");
  assert.equal(selection.finalDate, "2030-09-08");
  assert.equal(selection.selectionBasis, "dharmasindhu-vishnushrinkhala-ekadashi-viddha-dwadashi-shravana-both-vrata-days-previous-day-only");
  assert.equal(selection.evaluations[0].shravanaDwadashiOverlapMs, 35515308);
  assert.equal(selection.evaluations[1].dwadashiRemainingAfterSunriseMs, 2513615);
  assert.equal(selection.autoApproved, false);
});


test("real Pithoragarh Nag Panchami candidates run through the Dharmasindhu resolver without auto-approval", () => {
  const dates = ["2026-08-16", "2026-08-17"];
  const candidates = dates.map(date => {
    const previous = panchang(previousIsoDate(date));
    const current = panchang(date);
    const next = panchang(nextIsoDate(date));
    return {
      date, masa: masa(current), paksha: "शुक्ल पक्ष",
      sunrise: current.sunrise, sunset: current.sunset,
      tithis: intervals(previous, current, next)
    };
  });
  const result = resolveObservanceCandidates("nag-panchami", candidates);
  assert.notEqual(result.status, "insufficient-data");
  assert.equal(result.autoApproved, false);
  if (result.selectedDate) {
    assert.ok(dates.includes(result.selectedDate));
    assert.equal(result.finalDate, result.selectedDate);
  } else {
    assert.equal(result.finalDate, null);
  }
});


test("real Pithoragarh 2030 Shravana Yoga Dwadashi is recorded separately from Mahadwadashi and fast-date decisions", async () => {
  const tithiNames = [
    "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पञ्चमी","षष्ठी","सप्तमी",
    "अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा"
  ];
  const iso = value => new Date(value).toISOString();
  const indexOf = row => Number(row.index ?? row.number ?? row.value);
  const pakshaOf = index => index >= 15 ? "कृष्ण पक्ष" : "शुक्ल पक्ष";
  const tithiOf = index => tithiNames[index % 15];
  const reviewDay = date => {
    const current = panchang(date);
    const sunriseMs = new Date(current.sunrise).getTime();
    const noonMs = localNoon(date).getTime();
    const rawTithis = Array.isArray(current.tithis) ? current.tithis : [];
    const at = instant => rawTithis.find(row => {
      const start = new Date(row.startTime).getTime();
      const end = new Date(row.endTime).getTime();
      return Number.isFinite(start) && Number.isFinite(end) && start <= instant && end > instant;
    });
    const sunriseRow = at(sunriseMs);
    const noonRow = at(noonMs);
    const toTithi = row => {
      if (!row) return null;
      const index = indexOf(row);
      return {
        tithi:tithiOf(index), paksha:pakshaOf(index), masa:masa(current),
        tithiStartTime:iso(row.startTime), tithiEndTime:iso(row.endTime)
      };
    };
    const tithiIntervals = rawTithis.map(row => {
      const index = indexOf(row);
      return {
        tithi:tithiOf(index), paksha:pakshaOf(index),
        startTime:iso(row.startTime), endTime:iso(row.endTime)
      };
    });
    const nakshatraIntervals = (current.nakshatras || []).map(row => ({
      index:Number(row.index), name:row.name ?? null,
      startTime:iso(row.startTime), endTime:iso(row.endTime)
    }));
    const midday = toTithi(noonRow);
    const sunriseTithi = toTithi(sunriseRow);
    return {
      date, masa:masa(current), paksha:midday?.paksha ?? sunriseTithi?.paksha ?? "",
      tithi:midday?.tithi ?? "", noonTithi:midday?.tithi ?? "",
      sunrise:iso(current.sunrise), sunset:iso(current.sunset),
      sunriseTithi, tithiStartTime:midday?.tithiStartTime ?? null,
      tithiEndTime:midday?.tithiEndTime ?? null,
      noonTithiStartTime:midday?.tithiStartTime ?? null,
      noonTithiEndTime:midday?.tithiEndTime ?? null,
      tithiIntervals, nakshatraIntervals
    };
  };
  const rules = JSON.parse(await readFile(
    new URL("../data/dwadashi-vrata-rules.json",import.meta.url),"utf8"
  ));
  const marchFirst = reviewDay("2030-03-01");
  const marchSecond = reviewDay("2030-03-02");
  const first = buildDwadashiCalendar([marchFirst,marchSecond],rules)
    .dwadashiYogas.find(item=>item.observanceDate==="2030-03-01");
  assert.ok(first,"1 March local Dwadashi must be tested against Shravana");
  assert.equal(first.month,"फाल्गुन");
  assert.equal(first.paksha,"कृष्ण");
  assert.equal(first.overlapMs,3027762);
  assert.equal(first.meetsOneMuhurta,true);
  assert.equal(first.status,"candidate-needs-manual-review");
  assert.equal(first.autoApproved,false);
  assert.equal(first.dateSelection,"evidence-only-no-fast-date-selected");

  const march29 = reviewDay("2030-03-29");
  const march30 = reviewDay("2030-03-30");
  const later = buildDwadashiCalendar([march29,march30],rules)
    .dwadashiYogas.find(item=>item.observanceDate==="2030-03-29");
  assert.ok(later,"29 March evening Dwadashi must retain its negative source-label check");
  assert.equal(later.overlapMs,0);
  assert.equal(later.meetsOneMuhurta,false);
  assert.equal(later.status,"not-qualified");
});
