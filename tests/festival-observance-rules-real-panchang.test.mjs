import test from "node:test";
import assert from "node:assert/strict";
import * as panchangApi from "@ishubhamx/panchangam-js";
import { evaluateObservanceRule } from "../festival-observance-rules.mjs";

const { getPanchangam, Observer } = panchangApi;
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const OPTIONS = { timezoneOffset: 330, calendarType: "purnimanta" };

function localNoon(isoDate) {
  return new Date(isoDate + "T06:30:00.000Z");
}
function nextIsoDate(isoDate) {
  const date = new Date(isoDate + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
function panchang(isoDate) {
  return getPanchangam(localNoon(isoDate), LOCATION, OPTIONS);
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
    date, sunset: current.sunset, nextSunrise: next.sunrise,
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
    date, sunset: current.sunset, nextSunrise: next.sunrise,
    tithis: intervals(current, next)
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.evidence.length > 0);
});

test("real Pithoragarh Panchang confirms Mahashivaratri during Nishita", () => {
  const date = "2026-02-15", current = panchang(date), next = panchang(nextIsoDate(date));
  const result = evaluateObservanceRule("mahashivaratri-nishita", {
    date, sunset: current.sunset, nextSunrise: next.sunrise,
    tithis: intervals(current, next)
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
