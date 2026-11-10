import test from "node:test";
import assert from "node:assert/strict";
import { getFestivalMuhurta } from "../festival-muhurta.js";

const at = iso => new Date(iso);
const day = {
  sunrise: at("2027-04-15T05:56:00+05:30"),
  sunset: at("2027-04-15T18:47:00+05:30"),
  nextSunrise: at("2027-04-16T05:55:00+05:30"),
  moonrise: at("2027-04-15T20:10:00+05:30")
};

test("Sankashti moonrise is shown only when Krishna Chaturthi prevails", () => {
  const event = { muhurtaRule: "sankashti-chaturthi-moonrise" };
  const valid = getFestivalMuhurta(event, {
    ...day,
    tithis: [{ index: 18, startTime: "2027-04-15T17:00:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }]
  });
  assert.equal(valid.status, "calculated");
  assert.equal(valid.time.getTime(), day.moonrise.getTime());
  const invalid = getFestivalMuhurta(event, {
    ...day,
    tithis: [{ index: 18, startTime: "2027-04-15T21:00:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }]
  });
  assert.equal(invalid.status, "unavailable");
});

test("Pradosh muhurta is restricted to the local sunset window and Trayodashi", () => {
  const event = { muhurtaRule: "pradosh-kala" };
  const valid = getFestivalMuhurta(event, {
    ...day,
    tithis: [{ index: 12, startTime: "2027-04-15T18:00:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }]
  });
  assert.equal(valid.status, "calculated");
  assert.equal(valid.windows.length, 1);
  assert.equal(valid.windows[0].start.getTime(), day.sunset.getTime());
  assert.ok(valid.windows[0].end < day.nextSunrise);
  const invalid = getFestivalMuhurta(event, {
    ...day,
    tithis: [{ index: 12, startTime: "2027-04-15T21:30:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }]
  });
  assert.equal(invalid.status, "unavailable");
});

test("Vasant Panchami puja is clipped to Purvahna and Shukla Panchami", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "vasant-panchami-saraswati" }, {
    ...day,
    tithis: [{ index: 4, startTime: "2027-04-15T08:00:00+05:30", endTime: "2027-04-15T13:00:00+05:30" }]
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), at("2027-04-15T08:00:00+05:30").toISOString());
});

test("Ratha Saptami gives Arunodaya bath start and sunrise arghya", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "ratha-saptami-arunodaya" }, {
    ...day,
    tithis: [{ index: 6, startTime: "2027-04-15T00:00:00+05:30", endTime: "2027-04-15T12:00:00+05:30" }]
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.times.length, 2);
  assert.equal(result.times[0].time.getTime(), day.sunrise.getTime() - 96 * 60000);
  assert.equal(result.times[1].time.getTime(), day.sunrise.getTime());
});

test("Rama Navami puja is restricted to Madhyahna and Navami overlap", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "ram-navami-madhyahna" }, {
    ...day,
    tithis: [{ index: 8, startTime: "2027-04-15T11:00:00+05:30", endTime: "2027-04-15T14:00:00+05:30" }]
  });
  assert.equal(result.status, "calculated");
  assert.ok(result.windows[0].start >= day.sunrise);
  assert.ok(result.windows[0].end <= day.sunset);
});

test("Janmashtami Nishita puja requires Krishna Ashtami overlap", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "janmashtami-nishita" }, {
    ...day,
    tithis: [{ index: 22, startTime: "2027-04-15T22:00:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }]
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.ok(result.windows[0].start < result.windows[0].end);
});

test("Kalashtami Nishita puja requires Krishna Ashtami overlap", () => {
  const event = { muhurtaRule: "kalashtami-nishita" };
  const valid = getFestivalMuhurta(event, {
    ...day,
    tithis: [{ index: 22, startTime: "2027-04-15T23:00:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }]
  });
  assert.equal(valid.status, "calculated");
  assert.equal(valid.windows.length, 1);
  const invalid = getFestivalMuhurta(event, {
    ...day,
    tithis: [{ index: 22, startTime: "2027-04-16T01:00:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }]
  });
  assert.equal(invalid.status, "unavailable");
});

test("Raksha Bandhan excludes Bhadra and preserves an early Purnima window", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "raksha-bandhan-thread" }, {
    ...day,
    tithis: [{ index: 14, startTime: "2027-04-14T10:00:00+05:30", endTime: "2027-04-15T09:00:00+05:30" }],
    karanas: [{ name: "Vishti", startTime: "2027-04-15T02:00:00+05:30", endTime: "2027-04-15T04:00:00+05:30" }]
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.getTime(), day.sunrise.getTime());
  assert.equal(result.windows[0].end.toISOString(), at("2027-04-15T09:00:00+05:30").toISOString());
});

test("Raksha Bandhan falls back to the Bhadra-free Pradosh interval", () => {
  const bhadraEnd = at("2027-04-15T19:30:00+05:30");
  const result = getFestivalMuhurta({ muhurtaRule: "raksha-bandhan-thread" }, {
    ...day,
    tithis: [{ index: 14, startTime: "2027-04-15T00:00:00+05:30", endTime: "2027-04-16T02:00:00+05:30" }],
    karanas: [{ name: "Vishti", startTime: "2027-04-15T13:00:00+05:30", endTime: bhadraEnd }]
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.getTime(), bhadraEnd.getTime());
  assert.ok(result.windows[0].end > result.windows[0].start);
});
