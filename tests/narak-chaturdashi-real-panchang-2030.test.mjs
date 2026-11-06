import test from "node:test";
import assert from "node:assert/strict";
import panchangPackage from "@ishubhamx/panchangam-js";
import { getFestivalMuhurta, getFestivalMuhurtaContext } from "../festival-muhurta.js";

const { getPanchangam, Observer } = panchangPackage;
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const TZ = 330;
const atLocalNoon = (year, month, day) => new Date(Date.UTC(year, month - 1, day, 6, 30, 0));

test("Pithoragarh 2030 kshaya Chaturdashi misses both consecutive Arunodaya windows", () => {
  const date25 = atLocalNoon(2030, 10, 25);
  const date26 = atLocalNoon(2030, 10, 26);
  const date27 = atLocalNoon(2030, 10, 27);
  const p25 = getPanchangam(date25, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  const p26 = getPanchangam(date26, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
  const p27 = getPanchangam(date27, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });

  assert.ok(p25?.sunrise && p26?.sunrise, "Pithoragarh sunrises must be available");
  const intervals = [...(p25.tithis || []), ...(p26.tithis || []), ...(p27.tithis || [])];
  const chaturdashi = intervals.find(item => {
    const raw = item && typeof item === "object" ? item.index ?? item.number ?? item.value : item;
    return Number(raw) === 28 || /krishna.*chaturdashi|कृष्ण.*चतुर्दशी/i.test(String(item?.name || item || ""));
  });
  assert.ok(chaturdashi, "Kartika Krishna Chaturdashi interval must be present");

  const start = new Date(chaturdashi.startTime ?? chaturdashi.start);
  const end = new Date(chaturdashi.endTime ?? chaturdashi.end);
  const sunrise25 = new Date(p25.sunrise);
  const sunrise26 = new Date(p26.sunrise);

  const arunodayaStart25 = new Date(sunrise25.getTime() - 96 * 60 * 1000);
  const arunodayaStart26 = new Date(sunrise26.getTime() - 96 * 60 * 1000);
  assert.ok(start > arunodayaStart25, "Chaturdashi starts after the 25 October Arunodaya");
  assert.ok(end < arunodayaStart26, "Chaturdashi ends before the 26 October Arunodaya");
  const context = getFestivalMuhurtaContext(p26, p27, date26, { name: "Pithoragarh" });
  context.previousSunrise = p25.sunrise;
  context.tithis = [...(p25.tithis || []), ...(p26.tithis || []), ...(context.tithis || [])];
  const result = getFestivalMuhurta({ muhurtaRule: "narak-chaturdashi-kshaya-abhyanga" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), new Date(p26.moonrise).toISOString());
  assert.equal(result.windows[0].end.toISOString(), sunrise26.toISOString());
  assert.match(result.windows[0].note, /धर्मसिंधु के विशेष क्षय-तिथि निर्णय/);
});
