import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../festival-muhurta.js", import.meta.url), "utf8");
const engineUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const { getFestivalMuhurta, getFestivalMuhurtaContext, getBhaiDoojDateDecision, areFestivalMuhurtaLabelsEquivalent } = await import(engineUrl);

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
  assert.equal(result.windows.length, 3);
  assert.match(result.windows[0].label, /प्रदोष काल/);
  assert.equal(result.windows[0].start.toISOString(), sunset.toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-11-08T20:04:00+05:30").toISOString());
  assert.match(result.windows[1].label, /महानिशीथ/);
  assert.match(result.windows[2].label, /गोधूलि काल.*दीपदान/);
  assert.equal(result.note, undefined);
  assert.equal(result.windows[2].start.toISOString(), date("2026-11-08T17:06:00+05:30").toISOString());
  assert.equal(result.windows[2].end.toISOString(), date("2026-11-08T17:54:00+05:30").toISOString());
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
      { name: "Simha", start: date("2026-11-09T00:10:00+05:30"), end: date("2026-11-09T01:00:00+05:30") }
    ]
  };
  const result = getFestivalMuhurta({ muhurtaRule: "diwali-lakshmi-puja" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 5);
  assert.match(result.windows[0].label, /वृषभ स्थिर लग्न/);
  assert.equal(result.windows[0].start.toISOString(), date("2026-11-08T18:00:00+05:30").toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-11-08T19:00:00+05:30").toISOString());
  assert.match(result.windows[2].label, /महानिशीथ काल — विशेष परंपराओं के लिए/);
  assert.equal(result.windows[2].start.toISOString(), date("2026-11-08T23:29:20+05:30").toISOString());
  assert.match(result.windows[3].label, /सिंह स्थिर लग्न/);
  assert.match(result.windows[4].label, /गोधूलि काल.*दीपदान/);
});


test("Dhanteras shows Trayodashi shopping Choghadiya and Pradosh puja windows", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const context = {
    date: date("2026-11-06T12:00:00+05:30"),
    sunrise: date("2026-11-06T06:37:00+05:30"),
    sunset: date("2026-11-06T17:32:00+05:30"),
    nextSunrise: date("2026-11-07T06:37:00+05:30"),
    nextSunset: date("2026-11-07T17:32:00+05:30"),
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
  const shopping = result.windows.filter(w => /चौघड़िया/.test(w.label));
  assert.equal(shopping.length, 8);
  assert.ok(Math.abs(shopping[0].start.getTime() - date("2026-11-06T10:30:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[0].end.getTime() - date("2026-11-06T10:43:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[1].start.getTime() - date("2026-11-06T12:05:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[1].end.getTime() - date("2026-11-06T13:27:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[2].start.getTime() - date("2026-11-06T16:11:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[3].start.getTime() - date("2026-11-06T20:48:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[3].end.getTime() - date("2026-11-06T22:26:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[4].start.getTime() - date("2026-11-07T00:04:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[7].start.getTime() - date("2026-11-07T07:59:00+05:30").getTime()) < 60_000);
  assert.ok(Math.abs(shopping[7].end.getTime() - date("2026-11-07T09:21:00+05:30").getTime()) < 60_000);
  const puja = result.windows.find(w => /वृषभ स्थिर लग्न/.test(w.label));
  assert.ok(puja);
  assert.equal(puja.start.toISOString(), date("2026-11-06T18:02:00+05:30").toISOString());
  assert.equal(puja.end.toISOString(), date("2026-11-06T19:57:00+05:30").toISOString());
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


test("2026 Rama Ekadashi is wired to the location-aware parana calculation", async () => {
  const { readFile } = await import("node:fs/promises");
  const month = JSON.parse(await readFile(new URL("../data/festivals/2026-11.json", import.meta.url), "utf8"));
  const rama = month.events.find(event => /रमा.*एकादशी/.test(event.title));
  assert.ok(rama, "Rama Ekadashi must be present in November 2026");
  assert.equal(rama.date, "2026-11-05");
  assert.equal(rama.muhurtaRule, "ekadashi-parana");
  assert.equal(rama.reviewStatus, "approved");
});


test("Karwa Chauth puja window uses one tenth of local night and Krishna Chaturthi overlap", () => {
  const sunset = date("2026-10-29T17:25:00+05:30");
  const sunrise = date("2026-10-29T06:20:00+05:30");
  const nextSunrise = date("2026-10-30T06:21:00+05:30");
  const moonrise = date("2026-10-29T20:02:00+05:30");
  const chaturthi = {
    index: 18,
    name: "Krishna Chaturthi",
    startTime: date("2026-10-29T01:06:00+05:30"),
    endTime: date("2026-10-29T22:09:00+05:30")
  };
  const result = getFestivalMuhurta({ muhurtaRule: "karwa-chauth-puja" }, {
    date: date("2026-10-29T12:00:00+05:30"),
    sunrise, sunset, nextSunrise, moonrise,
    tithis: [chaturthi]
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows[0].start.toISOString(), sunset.toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-10-29T18:43:00+05:30").toISOString());
  assert.equal(result.windows[1].start.toISOString(), sunrise.toISOString());
  assert.equal(result.windows[1].end.toISOString(), moonrise.toISOString());
  assert.equal(result.note, undefined);
  assert.ok(result.windows.every(windowItem => windowItem.note));
});

test("Karwa Chauth does not show puja muhurta without Krishna Chaturthi overlap", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "karwa-chauth-puja" }, {
    sunrise: date("2026-10-29T06:20:00+05:30"),
    sunset: date("2026-10-29T17:25:00+05:30"),
    nextSunrise: date("2026-10-30T06:20:00+05:30"),
    moonrise: date("2026-10-29T20:02:00+05:30"),
    tithis: [{
      index: 18, name: "Krishna Chaturthi",
      startTime: date("2026-10-29T01:06:00+05:30"),
      endTime: date("2026-10-29T17:00:00+05:30")
    }]
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.windows, undefined);
});


const bhaiDecision = {status:"calculated",selectedDateKey:"2026-11-11",previousAparahnaOverlap:true,currentAparahnaOverlap:true};

test("Bhai Dooj date follows Dharmasindhu when both days have Aparahna Dwitiya overlap", () => {
  const ps=date("2026-11-10T06:40:30+05:30"), pe=date("2026-11-10T17:29:30+05:30");
  const cs=date("2026-11-11T06:40:30+05:30"), ce=date("2026-11-11T17:29:30+05:30");
  const d={index:1,name:"Shukla Dwitiya",startTime:date("2026-11-10T14:00:00+05:30"),endTime:date("2026-11-11T15:53:00+05:30")};
    const ns=date("2026-11-12T06:40:30+05:30"), ne=date("2026-11-12T17:29:30+05:30");
  const result=getBhaiDoojDateDecision({sunrise:ps,sunset:pe,tithis:[d]},{sunrise:cs,sunset:ce,tithis:[d]},{sunrise:ns,sunset:ne,tithis:[d]});
  assert.equal(result.previousAparahnaOverlap,true);
  assert.equal(result.currentAparahnaOverlap,true);
  assert.equal(result.selectedDateKey,"2026-11-11");
});

test("Bhai Dooj selects the first day only when only its Aparahna overlaps", () => {
  const ps=date("2026-11-10T06:40:30+05:30"), pe=date("2026-11-10T17:29:30+05:30");
  const cs=date("2026-11-11T06:40:30+05:30"), ce=date("2026-11-11T17:29:30+05:30");
  const d={index:1,name:"Shukla Dwitiya",startTime:date("2026-11-10T14:00:00+05:30"),endTime:date("2026-11-11T12:00:00+05:30")};
    const ns=date("2026-11-12T06:40:30+05:30"), ne=date("2026-11-12T17:29:30+05:30");
  const result=getBhaiDoojDateDecision({sunrise:ps,sunset:pe,tithis:[d]},{sunrise:cs,sunset:ce,tithis:[d]},{sunrise:ns,sunset:ne,tithis:[d]});
  assert.equal(result.previousAparahnaOverlap,true);
  assert.equal(result.currentAparahnaOverlap,false);
  assert.equal(result.selectedDateKey,"2026-11-10");
});

test("Bhai Dooj selects the second day when only its Aparahna overlaps", () => {
  const ps=date("2026-11-10T06:40:30+05:30"), pe=date("2026-11-10T17:29:30+05:30");
  const cs=date("2026-11-11T06:40:30+05:30"), ce=date("2026-11-11T17:29:30+05:30");
  const d={index:1,name:"Shukla Dwitiya",startTime:date("2026-11-11T12:00:00+05:30"),endTime:date("2026-11-11T15:53:00+05:30")};
    const ns=date("2026-11-12T06:40:30+05:30"), ne=date("2026-11-12T17:29:30+05:30");
  const result=getBhaiDoojDateDecision({sunrise:ps,sunset:pe,tithis:[d]},{sunrise:cs,sunset:ce,tithis:[d]},{sunrise:ns,sunset:ne,tithis:[d]});
  assert.equal(result.previousAparahnaOverlap,false);
  assert.equal(result.currentAparahnaOverlap,true);
  assert.equal(result.selectedDateKey,"2026-11-11");
});

test("Bhai Dooj date decision refuses missing tithi intervals", () => {
  const result=getBhaiDoojDateDecision(
    {sunrise:date("2026-11-10T06:40:30+05:30"),sunset:date("2026-11-10T17:29:30+05:30"),tithis:[]},
    {sunrise:date("2026-11-11T06:40:30+05:30"),sunset:date("2026-11-11T17:29:30+05:30"),tithis:[]},
    {sunrise:date("2026-11-12T06:40:30+05:30"),sunset:date("2026-11-12T17:29:30+05:30"),tithis:[]}
  );
  assert.equal(result.status,"unavailable");
});

test("Bhai Dooj tilak muhurta is Aparahna (fourth fifth of daytime) intersected with Shukla Dwitiya", () => {
  const sunrise = date("2026-11-11T06:40:30+05:30");
  const sunset = date("2026-11-11T17:29:30+05:30");
  const dwitiya = {
    index: 1,
    name: "Shukla Dwitiya",
    startTime: date("2026-11-10T14:00:00+05:30"),
    endTime: date("2026-11-11T15:53:00+05:30")
  };
  const result = getFestivalMuhurta({ muhurtaRule: "bhai-dooj-tilak" }, {
    date: date("2026-11-11T12:00:00+05:30"),
    sunrise, sunset, tithis: [dwitiya], bhaiDoojDateDecision: bhaiDecision
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows[0].start.toISOString(), date("2026-11-11T13:10:00+05:30").toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-11-11T15:20:00+05:30").toISOString());
  assert.match(result.note, /धर्मसिंधु/);
  assert.doesNotMatch(result.note, /स्थानीय दिनमान/);
  assert.ok(result.windows[0].note);
});

test("Bhai Dooj tilak muhurta is clipped when Dwitiya ends during Aparahna", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "bhai-dooj-tilak" }, {
    sunrise: date("2026-11-11T06:40:30+05:30"),
    sunset: date("2026-11-11T17:29:30+05:30"),
    tithis: [{
      index: 1, name: "Shukla Dwitiya",
      startTime: date("2026-11-10T14:00:00+05:30"),
      endTime: date("2026-11-11T14:00:00+05:30")
    }],
    bhaiDoojDateDecision: bhaiDecision
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows[0].start.toISOString(), date("2026-11-11T13:10:00+05:30").toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-11-11T14:00:00+05:30").toISOString());
});

test("Bhai Dooj does not invent a tilak window when Dwitiya does not overlap Aparahna", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "bhai-dooj-tilak" }, {
    sunrise: date("2026-11-11T06:40:30+05:30"),
    sunset: date("2026-11-11T17:29:30+05:30"),
    tithis: [{
      index: 1, name: "Shukla Dwitiya",
      startTime: date("2026-11-10T10:00:00+05:30"),
      endTime: date("2026-11-11T12:00:00+05:30")
    }],
    bhaiDoojDateDecision: bhaiDecision
  });
  assert.equal(result.status, "unavailable");
});


test("Masik Shivaratri Nishita muhurta intersects Krishna Chaturdashi", () => {
  const sunset = date("2026-06-13T17:45:00+05:30");
  const nextSunrise = date("2026-06-14T05:15:00+05:30");
  const night = nextSunrise.getTime() - sunset.getTime();
  const nishitaStart = new Date(sunset.getTime() + night * 7 / 15);
  const nishitaEnd = new Date(sunset.getTime() + night * 8 / 15);
  const chaturdashi = {
    index: 28,
    startTime: new Date(nishitaStart.getTime() - 15 * 60000),
    endTime: new Date(nishitaEnd.getTime() + 15 * 60000)
  };
  const context = getFestivalMuhurtaContext(
    { sunset, tithis: [chaturdashi] },
    { sunrise: nextSunrise, tithis: [] },
    date("2026-06-13T12:00:00+05:30"),
    { name: "पिथौरागढ़" }
  );
  const result = getFestivalMuhurta({ muhurtaRule: "masik-shivaratri-nishita" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), nishitaStart.toISOString());
  assert.equal(result.windows[0].end.toISOString(), nishitaEnd.toISOString());
  assert.equal(result.note, undefined);
  assert.match(result.windows[0].note, /कृष्ण चतुर्दशी/);
});

test("Masik Shivaratri never shows a Nishita time without Chaturdashi overlap", () => {
  const context = getFestivalMuhurtaContext(
    {
      sunset: date("2026-06-13T17:45:00+05:30"),
      tithis: [{ index: 27, startTime: date("2026-06-13T17:00:00+05:30"), endTime: date("2026-06-14T06:00:00+05:30") }]
    },
    { sunrise: date("2026-06-14T05:15:00+05:30"), tithis: [] },
    date("2026-06-13T12:00:00+05:30"),
    { name: "पिथौरागढ़" }
  );
  const result = getFestivalMuhurta({ muhurtaRule: "masik-shivaratri-nishita" }, context);
  assert.equal(result.status, "unavailable");
  assert.equal(result.windows, undefined);
});


test("Vinayaka Chaturthi puja muhurta intersects Shukla Chaturthi during Madhyahna", () => {
  const sunrise = date("2026-06-18T05:15:00+05:30");
  const sunset = date("2026-06-18T19:05:00+05:30");
  const day = sunset.getTime() - sunrise.getTime();
  const madhyahnaStart = new Date(sunrise.getTime() + day * 2 / 5);
  const madhyahnaEnd = new Date(sunrise.getTime() + day * 3 / 5);
  const chaturthi = {
    index: 3,
    startTime: new Date(madhyahnaStart.getTime() - 20 * 60000),
    endTime: new Date(madhyahnaEnd.getTime() + 20 * 60000)
  };
  const context = getFestivalMuhurtaContext(
    { sunrise, sunset, tithis: [chaturthi] },
    { sunrise: date("2026-06-19T05:15:00+05:30"), tithis: [] },
    date("2026-06-18T12:00:00+05:30"),
    { name: "पिथौरागढ़" }
  );
  const result = getFestivalMuhurta({ muhurtaRule: "vinayaka-chaturthi-madhyahna" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), madhyahnaStart.toISOString());
  assert.equal(result.windows[0].end.toISOString(), madhyahnaEnd.toISOString());
  assert.equal(result.note, undefined);
  assert.ok(result.windows[0].note);
});

test("Vinayaka Chaturthi does not show Madhyahna time without Shukla Chaturthi overlap", () => {
  const context = getFestivalMuhurtaContext(
    {
      sunrise: date("2026-06-18T05:15:00+05:30"),
      sunset: date("2026-06-18T19:05:00+05:30"),
      tithis: [{ index: 2, startTime: date("2026-06-18T05:00:00+05:30"), endTime: date("2026-06-18T20:00:00+05:30") }]
    },
    { sunrise: date("2026-06-19T05:15:00+05:30"), tithis: [] },
    date("2026-06-18T12:00:00+05:30"),
    { name: "पिथौरागढ़" }
  );
  const result = getFestivalMuhurta({ muhurtaRule: "vinayaka-chaturthi-madhyahna" }, context);
  assert.equal(result.status, "unavailable");
  assert.equal(result.windows, undefined);
});

test("Narak Chaturdashi Abhyanga Snan uses the actual moonrise-to-sunrise Chaturdashi overlap", () => {
  const moonrise = date("2026-11-08T05:37:00+05:30");
  const sunrise = date("2026-11-08T06:38:00+05:30");
  const chaturdashi = { index: 28, name: "Krishna Chaturdashi", startTime: date("2026-11-07T10:48:00+05:30"), endTime: date("2026-11-08T11:28:00+05:30") };
  const result = getFestivalMuhurta({ muhurtaRule: "narak-chaturdashi-abhyanga" }, { moonrise, sunrise, tithis: [chaturdashi] });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), moonrise.toISOString());
  assert.equal(result.windows[0].end.toISOString(), sunrise.toISOString());
  assert.equal(result.note, undefined);
  assert.ok(result.windows[0].note);
});

test("Narak Chaturdashi does not invent Abhyanga time without Chaturdashi overlap", () => {
  const result = getFestivalMuhurta({ muhurtaRule: "narak-chaturdashi-abhyanga" }, {
    moonrise: date("2026-11-08T05:37:00+05:30"), sunrise: date("2026-11-08T06:38:00+05:30"),
    tithis: [{ index: 28, name: "Krishna Chaturdashi", startTime: date("2026-11-07T10:48:00+05:30"), endTime: date("2026-11-08T05:30:00+05:30") }]
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.windows, undefined);
});

test("equivalent overall and window muhurta labels are not repeated", () => {
  assert.equal(areFestivalMuhurtaLabelsEquivalent(
    "मासिक शिवरात्रि — निशीथ पूजा मुहूर्त",
    "मासिक शिवरात्रि निशीथ पूजा मुहूर्त"
  ), true);
  assert.equal(areFestivalMuhurtaLabelsEquivalent(
    "विनायक चतुर्थी — मध्याह्न पूजा मुहूर्त",
    "विनायक चतुर्थी पूजा मुहूर्त — मध्याह्न"
  ), true);
  assert.equal(areFestivalMuhurtaLabelsEquivalent(
    "करवा चौथ — पूजा और व्रत समय",
    "करवा चौथ पूजा मुहूर्त"
  ), false);
});

test("Maha Shivaratri exposes all four complete night prahars", () => {
  const context = {
    sunset: date("2026-02-15T18:00:00+05:30"),
    nextSunrise: date("2026-02-16T06:00:00+05:30"),
    tithis: [{ index: 28, name: "Krishna Chaturdashi", startTime: date("2026-02-15T17:00:00+05:30"), endTime: date("2026-02-16T17:00:00+05:30") }]
  };
  const result = getFestivalMuhurta({ muhurtaRule: "mahashivaratri-four-prahar" }, context);
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 4);
  assert.deepEqual(result.windows.map(w => w.label), ["प्रथम प्रहर", "द्वितीय प्रहर", "तृतीय प्रहर", "चतुर्थ प्रहर"]);
  assert.equal(result.windows[0].start.toISOString(), date("2026-02-15T18:00:00+05:30").toISOString());
  assert.equal(result.windows[3].end.toISOString(), date("2026-02-16T06:00:00+05:30").toISOString());
});

test("Holika Dahan uses local Pradosh when Purnima prevails at sunrise and Bhadra is absent", () => {
  const sunset = date("2026-03-03T18:00:00+05:30");
  const result = getFestivalMuhurta({ muhurtaRule: "holika-dahan-pradosh" }, {
    sunrise: date("2026-03-03T06:30:00+05:30"), sunset,
    nextSunrise: date("2026-03-04T06:00:00+05:30"),
    tithis: [{ index: 14, name: "Purnima", startTime: date("2026-03-02T17:55:00+05:30"), endTime: date("2026-03-03T17:07:00+05:30") }],
    karanas: []
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].start.toISOString(), sunset.toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-03-03T20:24:00+05:30").toISOString());
});

test("Sankranti Punya Kala follows sign-specific ghatis measured from local day length", () => {
  const sunrise = date("2026-04-14T06:00:00+05:30");
  const sunset = date("2026-04-14T18:00:00+05:30");
  const moment = date("2026-04-14T12:00:00+05:30");
  const result = getFestivalMuhurta({ muhurtaRule: "sankranti-punya-kala" }, {
    sankrantiMoment: moment, sankrantiRashiIndex: 0, sunrise, sunset,
    nextSunrise: date("2026-04-15T06:00:00+05:30"),
    nextSunset: date("2026-04-15T18:00:00+05:30")
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows[0].start.toISOString(), date("2026-04-14T08:00:00+05:30").toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-04-14T16:00:00+05:30").toISOString());
  assert.equal(result.windows[1].start.toISOString(), date("2026-04-14T10:00:00+05:30").toISOString());
  assert.equal(result.windows[1].end.toISOString(), date("2026-04-14T14:00:00+05:30").toISOString());
});

test("Night-time non-Ayana Sankranti moves its punya period to the following daylight", () => {
  const sunrise = date("2026-02-13T06:00:00+05:30");
  const sunset = date("2026-02-13T18:00:00+05:30");
  const moment = date("2026-02-13T04:14:00+05:30");
  const result = getFestivalMuhurta({ muhurtaRule: "sankranti-punya-kala" }, {
    sankrantiMoment: moment, sankrantiRashiIndex: 10, sunrise, sunset,
    nextSunrise: date("2026-02-14T06:00:00+05:30"),
    nextSunset: date("2026-02-14T18:00:00+05:30")
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows[0].start.toISOString(), sunrise.toISOString());
  assert.equal(result.windows[0].end.toISOString(), date("2026-02-13T12:24:00+05:30").toISOString());
});

test("After-sunset Sankranti uses the daylight interval preceding sunset", () => {
  const sunrise = date("2026-10-17T06:00:00+05:30");
  const sunset = date("2026-10-17T18:00:00+05:30");
  const result = getFestivalMuhurta({ muhurtaRule: "sankranti-punya-kala" }, {
    sankrantiMoment: date("2026-10-17T19:57:00+05:30"),
    sankrantiRashiIndex: 6, sunrise, sunset,
    nextSunrise: date("2026-10-18T06:00:00+05:30"),
    nextSunset: date("2026-10-18T18:00:00+05:30")
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.windows[0].start.toISOString(), date("2026-10-17T12:00:00+05:30").toISOString());
  assert.equal(result.windows[0].end.toISOString(), sunset.toISOString());
});

test("Narak Chaturdashi identical main and window labels are equivalent", () => {
  assert.equal(areFestivalMuhurtaLabelsEquivalent("नरक चतुर्दशी अभ्यंग स्नान मुहूर्त", "नरक चतुर्दशी अभ्यंग स्नान मुहूर्त"), true);
});


test("Samaveda Upakarma uses the overlap of Bhadrapada Hasta and local Aparahna", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const result = getFestivalMuhurta({ muhurtaRule: "samaveda-upakarma-aparahna" }, {
    date: date("2026-09-12T12:00:00+05:30"),
    sunrise: date("2026-09-12T06:00:00+05:30"),
    sunset: date("2026-09-12T18:00:00+05:30"),
    nakshatra: "Uttara Phalguni",
    nakshatraEndTime: date("2026-09-12T12:55:00+05:30"),
    nextNakshatra: "Hasta",
    nextNakshatraEndTime: date("2026-09-13T13:07:00+05:30")
  });
  assert.equal(result.status, "calculated");
  assert.equal(result.start.toISOString(), date("2026-09-12T13:12:00+05:30").toISOString());
  assert.equal(result.end.toISOString(), date("2026-09-12T15:36:00+05:30").toISOString());
  assert.match(result.label, /हस्त नक्षत्र अपराह्ण/);
});

test("Samaveda Upakarma does not invent a time when Hasta does not overlap Aparahna", async () => {
  const { getFestivalMuhurta } = await import(engineUrl);
  const result = getFestivalMuhurta({ muhurtaRule: "samaveda-upakarma-aparahna" }, {
    sunrise: date("2026-09-13T05:53:00+05:30"),
    sunset: date("2026-09-13T18:17:00+05:30"),
    nakshatra: "Hasta",
    nakshatraEndTime: date("2026-09-13T13:07:00+05:30")
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.start, undefined);
});


test("Samaveda Upakarma date decision follows the two-day Aparahna overlap rule", () => {
  const { getSamavedaUpakarmaDateDecision } = await import(engineUrl);
  const mk = (dateValue, nakshatra, end, nextNakshatra, nextEnd) => ({
    date: date(dateValue + "T12:00:00+05:30"),
    sunrise: date(dateValue + "T06:00:00+05:30"),
    sunset: date(dateValue + "T18:00:00+05:30"),
    month: "भाद्रपद", paksha: "शुक्ल",
    nakshatra, nakshatraEndTime: date(end),
    nextNakshatra, nextNakshatraEndTime: nextEnd ? date(nextEnd) : null
  });
  const result = getSamavedaUpakarmaDateDecision([
    mk("2026-09-11", "उत्तराफाल्गुनी", "2026-09-11T12:55:00+05:30", "हस्त", "2026-09-12T12:55:00+05:30"),
    mk("2026-09-12", "हस्त", "2026-09-12T12:55:00+05:30", "चित्रा", "2026-09-13T13:07:00+05:30")
  ]);
  assert.equal(result.status, "selected");
  assert.equal(result.date, "2026-09-12");
  assert.equal(result.label, "भाद्रपद शुक्ल हस्त");
});

test("Samaveda Upakarma falls back from a Sankranti-dosha primary Hasta", () => {
  const { getSamavedaUpakarmaDateDecision } = await import(engineUrl);
  const day = (dateValue, month, sankranti = false) => ({
    date: date(dateValue + "T12:00:00+05:30"),
    sunrise: date(dateValue + "T06:00:00+05:30"),
    sunset: date(dateValue + "T18:00:00+05:30"),
    month, paksha: "शुक्ल", nakshatra: "हस्त",
    nakshatraEndTime: date(dateValue + "T17:00:00+05:30"),
    sankranti
  });
  const result = getSamavedaUpakarmaDateDecision([
    day("2026-09-12", "भाद्रपद", true),
    day("2026-08-29", "श्रावण")
  ]);
  assert.equal(result.status, "selected");
  assert.equal(result.date, "2026-08-29");
  assert.equal(result.label, "श्रावण शुक्ल हस्त");
});

test("Samaveda Upakarma returns a no-guess result when candidate Panchanga data is absent", async () => {
  const { getSamavedaUpakarmaDateDecision } = await import(engineUrl);
  const result = getSamavedaUpakarmaDateDecision([]);
  assert.equal(result.status, "unavailable");
});
