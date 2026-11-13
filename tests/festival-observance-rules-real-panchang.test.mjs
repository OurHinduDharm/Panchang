import test from "node:test";
import assert from "node:assert/strict";
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
    const dayStart = new Date(date + "T00:00:00+05:30");
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    return {
      date, dayStart, dayEnd,
      tithis: intervals(previous, current, next),
      nakshatraIntervals: nakshatras(previous, current, next)
    };
  });
  const result = evaluateShravanaDwadashiYoga(candidateDays);
  console.log("OHD_SHRAVANA_2030_DIAGNOSTIC " + JSON.stringify({
    days: candidateDays.map(day => ({
      date: day.date,
      tithis: day.tithis.filter(item => [11, 26].includes(item.index)).map(item => ({ index:item.index, start:new Date(item.startTime).toISOString(), end:new Date(item.endTime).toISOString() })),
      shravana: day.nakshatraIntervals.filter(item => item.index === 21).map(item => ({ start:new Date(item.startTime).toISOString(), end:new Date(item.endTime).toISOString() }))
    })),
    result
  }));
  assert.ok(
    ["candidate-evidence-only", "manual-review", "brief-overlap-needs-review"].includes(result.status),
    "the detector must return an explicit evidence/review state"
  );
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
  assert.ok(result.warnings.includes("tithi-nakshatra-overlap-is-not-a-fast-date-decision"));
  assert.ok(
    result.matches.length > 0,
    "Pithoragarh 2030 Bhadrapada Shukla Dwadashi should be checked against real Shravana intervals"
  );
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
