import test from "node:test";
import assert from "node:assert/strict";
import panchangPackage from "@ishubhamx/panchangam-js";

const { getPanchangam, Observer } = panchangPackage;
const { getFestivalMuhurta, getFestivalMuhurtaContext } = await import("../festival-muhurta.js");
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const TZ = 330;
const atLocalNoon = (day) => new Date(Date.UTC(2026, 10, day, 6, 30, 0));

test("Pithoragarh Narak Chaturdashi Abhyanga Snan is the real Chaturdashi overlap from moonrise to sunrise", () => {
  const date = atLocalNoon(8);
  const nextDate = atLocalNoon(9);
  const previous = getPanchangam(atLocalNoon(7), LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  const p = getPanchangam(date, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  const next = getPanchangam(nextDate, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  assert.ok(p?.moonrise, "Pithoragarh moonrise must be available");
  assert.ok(p?.sunrise, "Pithoragarh sunrise must be available");
  const context = getFestivalMuhurtaContext(p, next, date, { name: "Pithoragarh" });
  context.tithis = [...(previous.tithis || []), ...(context.tithis || [])];
  const result = getFestivalMuhurta({ muhurtaRule: "narak-chaturdashi-abhyanga" }, context);
  console.log("OHD_NARAK_TITHIS=" + JSON.stringify([...(previous.tithis || []), ...(p.tithis || []), ...(next.tithis || [])].map(x => ({ index: x.index, name: x.name, startTime: x.startTime, endTime: x.endTime }))));
  console.log("OHD_NARAK_CHATURDASHI_PITHORAGARH_2026=" + JSON.stringify({ moonrise: new Date(p.moonrise).toISOString(), sunrise: new Date(p.sunrise).toISOString(), result: result && { status: result.status, start: result.start?.toISOString(), end: result.end?.toISOString() } }));
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), new Date(p.moonrise).toISOString());
  assert.equal(result.windows[0].end.toISOString(), new Date(p.sunrise).toISOString());
});

test("Pithoragarh 2028 Narak Chaturdashi is on the Chaturdashi sunrise date, October 17", () => {
  const at = day => new Date(Date.UTC(2028, 9, day, 6, 30, 0));
  const previous = getPanchangam(at(16), LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  const date = at(17);
  const next = getPanchangam(at(18), LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  const p = getPanchangam(date, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  assert.ok(p?.moonrise, "Pithoragarh moonrise must be available");
  assert.ok(p?.sunrise, "Pithoragarh sunrise must be available");
  const context = getFestivalMuhurtaContext(p, next, date, { name: "Pithoragarh" });
  context.tithis = [...(previous.tithis || []), ...(context.tithis || [])];
  const result = getFestivalMuhurta({ muhurtaRule: "narak-chaturdashi-abhyanga" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), new Date(p.moonrise).toISOString());
  assert.equal(result.windows[0].end.toISOString(), new Date(p.sunrise).toISOString());
});
