import test from "node:test";
import assert from "node:assert/strict";
import { buildLocationEclipseEvents } from "../location-eclipse-events.mjs";

function makeGrahan(type, firstContact, sutakKaal = null) {
  return { type, subtype: "partial", contact: { firstContact: new Date(firstContact) }, sutakKaal };
}

test("location eclipse cards include only eclipses locally visible in the selected year", async () => {
  const visible = makeGrahan("Chandra Grahan", "2026-03-03T12:39:20.000Z", {
    start: new Date("2026-03-03T06:39:20.000Z"),
    end: new Date("2026-03-03T13:17:35.000Z")
  });
  const invisible = makeGrahan("Surya Grahan", "2026-08-12T10:00:00.000Z");
  const calls = [];
  const tools = {
    discoverEclipses: async () => [
      { date: new Date("2026-03-03T12:00:00.000Z"), grahan: visible },
      { date: new Date("2026-08-12T12:00:00.000Z"), grahan: invisible }
    ],
    getEclipseDayPanchangs: (date) => {
      calls.push(date.toISOString());
      return [{}, {}, {}];
    },
    getLocalVisibility: (grahan) => ({
      localVisible: grahan === visible,
      localStatus: grahan === visible ? "दृश्य" : "अदृश्य",
      visibleStart: new Date("2026-03-03T12:39:20.000Z"),
      visibleEnd: new Date("2026-03-03T13:17:35.000Z"),
      visibleDuration: 2295000
    })
  };
  class Observer { constructor(lat, lon, elevation) { Object.assign(this, { lat, lon, elevation }); } }
  const events = await buildLocationEclipseEvents({
    year: 2026,
    location: { name: "पिथौरागढ़", lat: 29.58, lon: 80.22, elevation: 1650 },
    api: { Observer },
    tools
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].date, "2026-03-03");
  assert.equal(events[0].title, "आंशिक चंद्रग्रहण");
  assert.equal(events[0].isLocationEclipse, true);
  assert.equal(events[0].localLocationName, "पिथौरागढ़");
  assert.ok(events[0].sutakKaal.start instanceof Date);
  assert.match(events[0].articleUrl, /grahan-panchang\.html\?m=1$/);
  assert.match(events[0].secondaryArticleUrl, /Grahan-mantra-purashcharan\.html\?m=1$/);
  assert.equal(calls.length, 1);
});

test("missing sutak data stays missing instead of inventing a time", async () => {
  const grahan = makeGrahan("Surya Grahan", "2027-08-02T04:00:00.000Z");
  const tools = {
    discoverEclipses: async () => [{ date: new Date("2027-08-02T12:00:00.000Z"), grahan }],
    getEclipseDayPanchangs: () => [{}, {}, {}],
    getLocalVisibility: () => ({ localVisible: true, localStatus: "ग्रस्तोदय", visibleStart: null, visibleEnd: null, visibleDuration: 0 })
  };
  class Observer {}
  const events = await buildLocationEclipseEvents({
    year: 2027, location: { lat: 29.58, lon: 80.22 }, api: { Observer }, tools
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].sutakKaal, null);
});
