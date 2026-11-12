import test from "node:test";
import assert from "node:assert/strict";
import { getFestivalMuhurta } from "../festival-muhurta.js";

const date = value => new Date(value);
const ghataRule = { muhurtaRule: "ghata-sthapana" };

test("Ghata Sthapana uses the first third of local daylight while Pratipada prevails", () => {
  const sunrise = date("2026-10-11T00:49:00.000Z");
  const sunset = date("2026-10-11T12:13:00.000Z");
  const result = getFestivalMuhurta(ghataRule, {
    date: date("2026-10-11T06:30:00.000Z"),
    sunrise,
    sunset,
    tithiEndTime: date("2026-10-11T14:55:00.000Z"),
    nakshatra: "Swati",
    yoga: "Siddhi"
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), sunrise.toISOString());
  assert.equal(
    result.end.toISOString(),
    new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 3).toISOString()
  );
});

test("Ghata Sthapana can use the Abhijit fallback when the morning window is consumed", () => {
  const result = getFestivalMuhurta(ghataRule, {
    date: date("2026-10-11T06:30:00.000Z"), // Sunday in Asia/Kolkata
    sunrise: date("2026-10-11T00:49:00.000Z"),
    sunset: date("2026-10-11T12:13:00.000Z"),
    tithiEndTime: date("2026-10-11T14:55:00.000Z"),
    nakshatra: "Chitra",
    nakshatraEndTime: date("2026-10-11T13:00:00.000Z"),
    yoga: "Vaidhriti",
    yogaEndTime: date("2026-10-11T13:00:00.000Z")
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.label, "घटस्थापना — अभिजित मुहूर्त");
  assert.ok(result.start < result.end);
  assert.ok(result.end <= date("2026-10-11T14:55:00.000Z"));
});

test("Navratri Sandhi Puja is limited to the 24-minute window on each side of the tithi boundary", () => {
  const boundary = date("2026-10-19T04:00:00.000Z");
  const result = getFestivalMuhurta({ muhurtaRule: "sandhi-puja" }, {
    tithi: 7,
    tithiEndTime: boundary
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), new Date(boundary.getTime() - 24 * 60000).toISOString());
  assert.equal(result.end.toISOString(), new Date(boundary.getTime() + 24 * 60000).toISOString());
});

test("Navratri Sandhi Puja does not invent a time without the exact tithi boundary", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "sandhi-puja" }, { tithi: 7 });
  assert.equal(result.status, "unavailable");
  assert.equal(result.start, undefined);
  assert.equal(result.end, undefined);
});

test("moonlight-until-midnight ends at midnight in Asia/Kolkata, independent of browser timezone", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "moonlight-until-midnight" }, {
    date: date("2026-10-25T06:30:00.000Z"), // 12:00 noon IST on 25 October
    moonrise: date("2026-10-25T12:30:00.000Z")
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), "2026-10-25T12:30:00.000Z");
  assert.equal(result.end.toISOString(), "2026-10-25T18:30:00.000Z"); // 00:00 IST on 26 October
});

test("moonlight-until-midnight returns no interval when moonrise is missing", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "moonlight-until-midnight" }, {
    date: date("2026-10-25T06:30:00.000Z")
  });
  assert.equal(result, null);
});


test("Kalashtami uses Krishna Ashtami during local Pradosh, not Janmashtami Nishita", () => {
  const sunset = date("2026-10-03T12:35:00.000Z");
  const nextSunrise = date("2026-10-04T00:35:00.000Z");
  const ashtamiStart = date("2026-10-03T02:29:00.000Z");
  const ashtamiEnd = date("2026-10-03T23:51:00.000Z");
  const result = getFestivalMuhurta({ muhurtaRule: "kalashtami-pradosh" }, {
    sunset,
    nextSunrise,
    tithis: [{ index: 22, startTime: ashtamiStart, endTime: ashtamiEnd }]
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.label, "कालाष्टमी — प्रदोष पूजा मुहूर्त");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), sunset.toISOString());
  assert.equal(
    result.windows[0].end.toISOString(),
    new Date(sunset.getTime() + (nextSunrise.getTime() - sunset.getTime()) / 5).toISOString()
  );
});

test("Kalashtami does not publish a Pradosh window without one ghati of Ashtami after Pradosh", () => {
  const sunset = date("2026-10-03T12:35:00.000Z");
  const nextSunrise = date("2026-10-04T00:35:00.000Z");
  const pradoshEnd = new Date(sunset.getTime() + (nextSunrise.getTime() - sunset.getTime()) / 5);
  const result = getFestivalMuhurta({ muhurtaRule: "kalashtami-pradosh" }, {
    sunset,
    nextSunrise,
    tithis: [{
      index: 22,
      startTime: date("2026-10-03T02:29:00.000Z"),
      endTime: new Date(pradoshEnd.getTime() + 23 * 60000)
    }]
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.windows, undefined);
});
