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
