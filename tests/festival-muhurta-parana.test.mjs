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
  assert.equal(result.dateLabel, "22 अक्टूबर 2026");
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
  assert.equal(result.end.toISOString(), dwadashi.end.toISOString());
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
