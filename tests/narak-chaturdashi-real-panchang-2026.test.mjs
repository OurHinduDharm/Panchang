import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import panchangPackage from "@ishubhamx/panchangam-js";

const { getPanchangam, Observer } = panchangPackage;
const engineSource = await readFile(new URL("../festival-muhurta.js", import.meta.url), "utf8");
const engineUrl = "data:text/javascript;base64," + Buffer.from(engineSource).toString("base64");
const { getFestivalMuhurta, getFestivalMuhurtaContext } = await import(engineUrl);
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const TZ = 330;
const atLocalNoon = (day) => new Date(Date.UTC(2026, 10, day, 6, 30, 0));

test("Pithoragarh Narak Chaturdashi Abhyanga Snan is the real Chaturdashi overlap from moonrise to sunrise", () => {
  const date = atLocalNoon(8);
  const nextDate = atLocalNoon(9);
  const p = getPanchangam(date, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  const next = getPanchangam(nextDate, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  assert.ok(p?.moonrise, "Pithoragarh moonrise must be available");
  assert.ok(p?.sunrise, "Pithoragarh sunrise must be available");
  const context = getFestivalMuhurtaContext(p, next, date, { name: "Pithoragarh" });
  const result = getFestivalMuhurta({ muhurtaRule: "narak-chaturdashi-abhyanga" }, context);
  console.log("OHD_NARAK_CHATURDASHI_PITHORAGARH_2026=" + JSON.stringify({ moonrise: new Date(p.moonrise).toISOString(), sunrise: new Date(p.sunrise).toISOString(), result: result && { status: result.status, start: result.start?.toISOString(), end: result.end?.toISOString() } }));
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), new Date(p.moonrise).toISOString());
  assert.equal(result.windows[0].end.toISOString(), new Date(p.sunrise).toISOString());
});
