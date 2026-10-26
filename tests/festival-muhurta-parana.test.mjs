import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../festival-muhurta.js", import.meta.url), "utf8");
const engineUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const { getFestivalMuhurta, getFestivalMuhurtaContext } = await import(engineUrl);

const date = value => new Date(value);
const sunrise = date("2026-10-22T06:00:00+05:30");
const sunset = date("2026-10-22T17:45:00+05:30");

function contextWithTithis(tithis) {
  const p = {
    sunrise: date("2026-10-21T06:00:00+05:30"),
    sunset: date("2026-10-21T17:45:00+05:30"),
    tithis: tithis.fast || []
  };
  const next = {
    sunrise,
    sunset,
    tithis: tithis.parana || []
  };
  return getFestivalMuhurtaContext(p, next, date("2026-10-21T12:00:00+05:30"), { name: "परीक्षण स्थान" });
}

function calculate(context) {
  return getFestivalMuhurta({ muhurtaRule: "ekadashi-parana" }, context);
}

test("Ekadashi parana prefers a morning window after Hari Vasara", () => {
  const dwadashi = {
    index: 11,
    startTime: date("2026-10-21T14:00:00+05:30"),
    endTime: date("2026-10-22T15:00:00+05:30")
  };
  const context = contextWithTithis({
    fast: [
      { index: 10, startTime: date("2026-10-20T13:00:00+05:30"), endTime: dwadashi.startTime },
      dwadashi
    ],
    parana: [
      dwadashi,
      { index: 12, startTime: dwadashi.endTime, endTime: date("2026-10-23T16:00:00+05:30") }
    ]
  });
  const result = calculate(context);
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), sunrise.toISOString());
  assert.equal(result.end.toISOString(), date("2026-10-22T10:42:00+05:30").toISOString());
  assert.match(result.dateLabel, /2026/);
});

test("Hari Vasara delays parana when its first quarter continues after sunrise", () => {
  const dwadashi = {
    index: 26,
    startTime: date("2026-10-22T05:00:00+05:30"),
    endTime: date("2026-10-22T10:00:00+05:30")
  };
  const result = calculate(contextWithTithis({ fast: [dwadashi], parana: [dwadashi] }));
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), date("2026-10-22T06:15:00+05:30").toISOString());
  assert.equal(result.end.toISOString(), dwadashi.endTime.toISOString());
});

test("Dwadashi ended before sunrise uses the explicit sunrise exception", () => {
  const dwadashi = {
    index: 11,
    startTime: date("2026-10-21T10:00:00+05:30"),
    endTime: date("2026-10-22T04:30:00+05:30")
  };
  const result = calculate(contextWithTithis({ fast: [dwadashi], parana: [dwadashi] }));
  assert.equal(result.status, "calculated");
  assert.equal(result.time.toISOString(), sunrise.toISOString());
  assert.match(result.note, /सूर्योदय से पहले समाप्त/);
});

test("missing tithi intervals never produce an invented parana time", () => {
  const result = calculate(contextWithTithis({ fast: [], parana: [] }));
  assert.equal(result.status, "unavailable");
  assert.equal(result.time, undefined);
  assert.equal(result.start, undefined);
});


test("Diwali returns Pradosh and special Nishita options only during Amavasya", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const sunset = date("2026-11-08T17:30:00+05:30");
  const nextSunrise = date("2026-11-09T06:20:00+05:30");
  const context = {
    sunset,
    nextSunrise,
    tithis: [{
      index: 29,
      name: "Amavasya",
      startTime: date("2026-11-08T11:27:00+05:30"),
      endTime: date("2026-11-09T12:31:00+05:30")
    }],
    sthirLagnaWindows: []
  };
  const result = getFestivalMuhurta({ muhurtaRule: "diwali-lakshmi-puja" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 2);
  assert.match(result.windows[0].label, /प्रदोष काल/);
  assert.equal(result.windows[0].start.toISOString(), sunset.toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-11-08T20:04:00+05:30").toISOString());
  assert.match(result.windows[1].label, /महानिशीथ/);
});

test("Diwali does not invent a puja window when Amavasya interval is missing", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const result = getFestivalMuhurta({
    muhurtaRule: "diwali-lakshmi-puja"
  }, {
    sunset: date("2026-11-08T17:30:00+05:30"),
    nextSunrise: date("2026-11-09T06:20:00+05:30"),
    tithis: []
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.windows, undefined);
});


test("Diwali prioritizes Vrishabha in Pradosh and offers Simha in Nishita when available", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const sunset = date("2026-11-08T17:30:00+05:30");
  const nextSunrise = date("2026-11-09T06:20:00+05:30");
  const context = {
    sunset,
    nextSunrise,
    tithis: [{
      index: 29,
      name: "Amavasya",
      startTime: date("2026-11-08T11:27:00+05:30"),
      endTime: date("2026-11-09T12:31:00+05:30")
    }],
    sthirLagnaWindows: [
      { name: "Vrishabha", start: date("2026-11-08T18:00:00+05:30"), end: date("2026-11-08T19:00:00+05:30") },
      { name: "Simha", start: date("2026-11-08T23:00:00+05:30"), end: date("2026-11-09T01:00:00+05:30") }
    ]
  };
  const result = getFestivalMuhurta({ muhurtaRule: "diwali-lakshmi-puja" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 3);
  assert.match(result.windows[0].label, /वृषभ स्थिर लग्न/);
  assert.equal(result.windows[0].start.toISOString(), date("2026-11-08T18:00:00+05:30").toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-11-08T19:00:00+05:30").toISOString());
  assert.match(result.windows[2].label, /सिंह स्थिर लग्न/);
});


test("Dhanteras shows Trayodashi shopping Choghadiya and Pradosh puja windows", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const context = {
    date: date("2026-11-06T12:00:00+05:30"),
    sunrise: date("2026-11-06T06:37:00+05:30"),
    sunset: date("2026-11-06T17:33:00+05:30"),
    nextSunrise: date("2026-11-07T06:37:00+05:30"),
    tithis: [{
      index: 12,
      name: "Trayodashi",
      startTime: date("2026-11-06T10:30:00+05:30"),
      endTime: date("2026-11-07T10:47:00+05:30")
    }],
    sthirLagnaWindows: [
      { name: "Vrishabha", start: date("2026-11-06T18:02:00+05:30"), end: date("2026-11-06T19:57:00+05:30") }
    ]
  };
  const result = getFestivalMuhurta({ muhurtaRule: "dhanteras-muhurta" }, context);
  assert.equal(result.status, "calculated");
  assert.ok(result.windows.some(w => /चौघड़िया/.test(w.label)));
  assert.ok(result.windows.some(w => /वृषभ स्थिर लग्न/.test(w.label)));
  assert.ok(result.windows.some(w => /धनतेरस पूजा/.test(w.label)));
  assert.ok(result.windows.every(w => w.end > w.start));
});

test("Dhanteras does not invent shopping or puja times without Trayodashi", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const result = getFestivalMuhurta({ muhurtaRule: "dhanteras-muhurta" }, {
    date: date("2026-11-06T12:00:00+05:30"),
    sunrise: date("2026-11-06T06:37:00+05:30"),
    sunset: date("2026-11-06T17:33:00+05:30"),
    nextSunrise: date("2026-11-07T06:37:00+05:30"),
    tithis: []
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.windows, undefined);
});
