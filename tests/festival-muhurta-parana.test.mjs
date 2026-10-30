import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../festival-muhurta.js", import.meta.url), "utf8");
const engineUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const { getFestivalMuhurta, getFestivalMuhurtaContext, getBhaiDoojDateDecision } = await import(engineUrl);

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
  assert.match(result.note, /कृष्ण चतुर्दशी/);
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
