import assert from "node:assert/strict";
import test from "node:test";
import {
  getFestivalMuhurta,
  formatFestivalMuhurtaTime,
  getFestivalMuhurtaContext
} from "../festival-muhurta.js";

test("Abhijit is calculated from the local sunrise-to-sunset interval", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "abhijit" }, {
    date: new Date("2026-10-13T12:00:00+05:30"),
    sunrise: "2026-10-13T06:00:00+05:30",
    sunset: "2026-10-13T18:00:00+05:30"
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), "2026-10-13T06:06:00.000Z");
  assert.equal(result.end.toISOString(), "2026-10-13T06:54:00.000Z");
});

test("Abhijit is suppressed on Wednesday according to the project rule", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "abhijit" }, {
    date: new Date("2026-10-14T12:00:00+05:30"),
    sunrise: "2026-10-14T06:00:00+05:30",
    sunset: "2026-10-14T18:00:00+05:30"
  });
  assert.equal(result.status, "not-applicable");
});

test("Nishita uses the local sunset-to-next-sunrise night interval", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "nishita" }, {
    date: new Date("2026-10-13T12:00:00+05:30"),
    sunset: "2026-10-13T18:00:00+05:30",
    nextSunrise: "2026-10-14T06:00:00+05:30"
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), "2026-10-13T18:06:00.000Z");
  assert.equal(result.end.toISOString(), "2026-10-13T18:54:00.000Z");
});

test("unknown festival rules stay explicitly pending instead of inventing a time", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "diwali-lakshmi-puja" }, {});
  assert.equal(result.status, "rule-pending");
});

test("context keeps location and local Panchang inputs together", () => {
  const location = { name: "Pithoragarh", lat: 29.58, lon: 80.22, elevation: 1650 };
  const context = getFestivalMuhurtaContext(
    { sunrise: "2026-10-13T06:00:00+05:30", sunset: "2026-10-13T18:00:00+05:30", moonrise: "2026-10-13T19:00:00+05:30" },
    { sunrise: "2026-10-14T06:01:00+05:30" },
    new Date("2026-10-13T12:00:00+05:30"),
    location
  );
  assert.equal(context.location, location);
  assert.equal(context.sunrise, "2026-10-13T06:00:00+05:30");
  assert.equal(context.nextSunrise, "2026-10-14T06:01:00+05:30");
});

test("time formatting is explicitly rendered in India Standard Time", () => {
  assert.notEqual(formatFestivalMuhurtaTime("2026-10-13T06:00:00Z"), "—");
});

test("Sharad Purnima moonlight window ends at local midnight", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "moonlight-until-midnight" }, {
    date: new Date("2026-10-25T12:00:00+05:30"),
    moonrise: "2026-10-25T18:20:00+05:30"
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.label, "चंद्रमा के उदय से मध्यरात्रि तक");
  assert.equal(result.end.getHours(), 0);
  assert.equal(result.end.getDate(), 26);
});
