import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { Body, Observer, SearchAltitude } from "astronomy-engine";

const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("compact layout puts result cards in two columns and full cards span both", () => {
  assert.match(source, /#result > \.grid \{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(source, /#result > \.grid > \.card\.full \{ grid-column:1 \/ -1; \}/);
});

test("night Prahar can be included while the Sankalp kaal remains night", () => {
  const start = source.indexOf("function getCurrentKaalPrahar(");
  const end = source.indexOf("/* =========================================================\n   SANKALP TYPE — AUTO SANDHYA", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const sandbox = {
    sankalpState: { includeNightPrahar: true }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);

  const now = new Date("2026-10-11T03:02:00+05:30");
  const p = {
    sunrise: "2026-10-11T06:08:00+05:30",
    sunset: "2026-10-10T17:43:00+05:30",
    brahmaMuhurta: { start: "2026-10-11T04:29:00+05:30" }
  };
  const nightPrahar = [
    { isActive: false },
    { isActive: false },
    { isActive: false },
    { isActive: true }
  ];

  assert.deepEqual(
    JSON.parse(JSON.stringify(sandbox.getCurrentKaalPrahar(p, { nightPrahar }, now))),
    { kaal: "रात्रि", praharName: "चतुर्थ" }
  );
});

test("active night Prahar can accompany Pratahkaal after Brahma Muhurta starts", () => {
  const start = source.indexOf("function getCurrentKaalPrahar(");
  const end = source.indexOf("/* =========================================================\n   SANKALP TYPE — AUTO SANDHYA", start);
  const sandbox = { sankalpState: { includeNightPrahar: true } };
  vm.runInNewContext(source.slice(start, end), sandbox);

  const p = {
    sunrise: "2026-10-11T06:08:00+05:30",
    sunset: "2026-10-10T17:43:00+05:30",
    brahmaMuhurta: { start: "2026-10-11T04:29:00+05:30" }
  };
  const nightPrahar = [
    { isActive: false },
    { isActive: false },
    { isActive: false },
    { isActive: true }
  ];

  const result = sandbox.getCurrentKaalPrahar(
    p,
    { nightPrahar },
    new Date("2026-10-11T05:00:00+05:30")
  );

  assert.equal(result.kaal, "प्रातः");
  assert.equal(result.praharName, "चतुर्थ");
});

test("Sankalp keeps the four requested kaal labels and appends night Prahar without replacing Ratrikale", () => {
  const start = source.indexOf("function getCurrentKaalPrahar(");
  const end = source.indexOf("/* =========================================================\n   SANKALP TYPE — AUTO SANDHYA", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const sandbox = { sankalpState: { includeNightPrahar: true } };
  vm.runInNewContext(source.slice(start, end), sandbox);

  const p = {
    sunrise: "2026-10-12T06:00:00+05:30",
    sunset: "2026-10-12T18:00:00+05:30",
    brahmaMuhurta: { start: "2026-10-12T04:00:00+05:30" }
  };
  const nightPrahar = [
    { isActive: true }, { isActive: false },
    { isActive: false }, { isActive: false }
  ];
  const get = (time) => sandbox.getCurrentKaalPrahar(
    p, { nightPrahar }, new Date(time)
  );

  assert.equal(get("2026-10-12T03:59:59+05:30").kaal, "रात्रि");
  assert.equal(get("2026-10-12T04:00:00+05:30").kaal, "प्रातः");
  assert.equal(get("2026-10-12T05:00:00+05:30").kaal, "प्रातः");
  assert.equal(get("2026-10-12T06:00:00+05:30").kaal, "प्रातः"); // sunrise
  assert.equal(get("2026-10-12T09:00:00+05:30").kaal, "प्रातः");
  assert.equal(get("2026-10-12T10:47:59+05:30").kaal, "प्रातः"); // before 2/5 boundary
  assert.equal(get("2026-10-12T10:48:00+05:30").kaal, "मध्याह्न"); // 2/5 boundary
  assert.equal(get("2026-10-12T11:00:00+05:30").kaal, "मध्याह्न");
  assert.equal(get("2026-10-12T13:11:59+05:30").kaal, "मध्याह्न"); // before 3/5 boundary
  assert.equal(get("2026-10-12T13:12:00+05:30").kaal, "सायं"); // 3/5 boundary
  assert.equal(get("2026-10-12T15:00:00+05:30").kaal, "सायं");
  assert.equal(get("2026-10-12T18:00:00+05:30").kaal, "रात्रि"); // sunset
  assert.deepEqual(
    JSON.parse(JSON.stringify(get("2026-10-12T19:00:00+05:30"))),
    { kaal: "रात्रि", praharName: "प्रथम" }
  );

  assert.match(source, /const kaalForm = \({[\s\S]*?"रात्रि": "रात्रिकाले"/);
  assert.doesNotMatch(source, /useNightPraharAsKaal/);
  assert.doesNotMatch(source, /sankalpState\.type === "sandhya"\s*\)\s*\? ""/);
  assert.ok(
    source.indexOf("if(kaalForm) parts.push(kaalForm);") <
      source.indexOf("if(praharForm) parts.push(praharForm);"),
    "the Kaal word must precede the optional Prahar label"
  );
});

test("Sankalp month and tithi qualifiers use the requested classical wording", () => {
  assert.match(source, /parts\.push\("मासानामुत्तमे मासे " \+ masaForm\)/);
  assert.doesNotMatch(source, /मासानामुत्तमे महामाङ्गल्ये/);
  assert.match(source, /एवं गुणविशेषणविशिष्टायां शुभपुण्यतिथौ/);
  assert.doesNotMatch(source, /एवं गुणविशिष्टायां पुण्यतिथौ/);
  assert.ok(
    source.indexOf('if(tithiForm) parts.push(tithiForm);') <
      source.indexOf('if(tithiForm) parts.push("एवं गुणविशेषणविशिष्टायां शुभपुण्यतिथौ");'),
    "the actual tithi must be stated before its auspicious-tithi qualifier"
  );
});

test("night Prahar toggle is enabled only when a current active night segment exists", () => {
  assert.match(source, /currentSankalpContext\.praharData\.nightPrahar\.some\(pr => pr\.isActive\)/);
  assert.match(source, /sankalpState\.includeNightPrahar\s*=\s*e\.target\.checked/);
});

test("special Muhurtas are grouped in one compact two-column section", () => {
  assert.match(source, /<div class="label">🌄 विशेष मुहूर्त<\/div>\s*<div class="special-muhurta-grid">/);
  for (const label of [
    "🌅 ब्रह्म मुहूर्त",
    "🌄 प्रातः संध्या",
    "🕛 मध्याह्न संध्या",
    "☀️ विजय मुहूर्त",
    "🌇 गोधूलि मुहूर्त",
    "🌆 सायं संध्या",
    "🌙 निशीथ काल",
    "⚠️ दुर्मुहूर्त"
  ]) {
    assert.ok(source.includes(label), `missing special Muhurta: ${label}`);
  }
  assert.match(source, /\.special-muhurta-grid \{ display:grid; grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test("Anandadi yogas show auspiciousness colors and use Lumbaka spelling", () => {
  const classical = readFileSync(new URL("../classical-yogas.js", import.meta.url), "utf8");
  assert.match(classical, /"लुम्बक"/);
  assert.match(classical, /const OHN_ANANDADI_AUSPICIOUS = new Set/);
  assert.match(classical, /category:OHN_ANANDADI_AUSPICIOUS\.has\(name\) \? "शुभ" : "अशुभ"/);
});

test("Godhuli uses the season-specific solar altitude and one fixed 48-minute window", () => {
  const start = source.indexOf("function getGodhuliMuhurta(");
  const end = source.indexOf("function getSpecialKaalDetails(", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const sandbox = {
    SearchAltitude: (_body, _observer, direction, searchStart, limitDays, altitude) => {
      sandbox.lastSearch = { direction, searchStart, limitDays, altitude };
      return { date: new Date("2026-10-12T12:00:00.000Z") };
    },
    Body: { Sun: "Sun" },
    Observer: class { constructor(lat, lon, elevation){ this.lat=lat; this.lon=lon; this.elevation=elevation; } }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);

  const sunset = new Date("2026-10-12T12:09:00.000Z");
  const location = { lat: 30.1265, lon: 80.4817, elevation: 0 };
  const minutes = (a, b) => (new Date(b).getTime() - new Date(a).getTime()) / 60000;

  const deps = { SearchAltitude: sandbox.SearchAltitude, Body: sandbox.Body, Observer: sandbox.Observer };
  const hemanta = sandbox.getGodhuliMuhurta({ ritu: "हेमन्त" }, sunset, location, deps);
  assert.ok(Math.abs(sandbox.lastSearch.altitude - (16 / 60)) < 1e-9);
  assert.equal(sandbox.lastSearch.direction, -1);
  assert.equal(minutes(hemanta.start, hemanta.end), 48);

  const varsha = sandbox.getGodhuliMuhurta({ ritu: "वर्षा" }, sunset, location, deps);
  assert.ok(Math.abs(sandbox.lastSearch.altitude - (-16 / 60)) < 1e-9);
  assert.equal(minutes(varsha.start, varsha.end), 48);

  // The library output can lack p.ritu; then season must be derived from Sun rashi.
  sandbox.getGodhuliMuhurta({ sunRashi: { index: 7 } }, sunset, location, deps);
  assert.ok(Math.abs(sandbox.lastSearch.altitude - (16 / 60)) < 1e-9, "Hemanta from Sun rashi");
  sandbox.getGodhuliMuhurta({ sunRashi: { index: 9 } }, sunset, location, deps);
  assert.ok(Math.abs(sandbox.lastSearch.altitude - (16 / 60)) < 1e-9, "Shishira from Sun rashi");
  sandbox.getGodhuliMuhurta({ sunRashi: { index: 3 } }, sunset, location, deps);
  assert.ok(Math.abs(sandbox.lastSearch.altitude - (-16 / 60)) < 1e-9, "Varsha from Sun rashi");
  sandbox.getGodhuliMuhurta({ ritu: "Hemanta" }, sunset, location, deps);
  assert.ok(Math.abs(sandbox.lastSearch.altitude - (16 / 60)) < 1e-9, "English ritu alias");

  sandbox.SearchAltitude = () => null;
  const fallback = sandbox.getGodhuliMuhurta({ ritu: "शरद" }, sunset, location, { ...deps, SearchAltitude: sandbox.SearchAltitude });
  assert.equal(minutes(fallback.start, sunset), 12);
  assert.equal(minutes(sunset, fallback.end), 12);

  // Integration check against the actual Astronomy Engine dependency, not only a mock.
  const realSunset = new Date("2026-10-12T12:12:00.000Z"); // 17:42 IST; published city-level sunset for Pithoragarh
  const realObserver = new Observer(location.lat, location.lon, location.elevation);
  const actualEvent = SearchAltitude(
    Body.Sun,
    realObserver,
    -1,
    new Date(realSunset.getTime() - 4 * 60 * 60 * 1000),
    0.5,
    0
  );
  assert.ok(actualEvent?.date, "Astronomy Engine should return the evening 0-degree solar-center crossing");
  assert.ok(
    realSunset.getTime() - actualEvent.date.getTime() >= 0 &&
    realSunset.getTime() - actualEvent.date.getTime() <= 10 * 60000,
    `Astronomical crossing was ${actualEvent.date.toISOString()} for sunset ${realSunset.toISOString()}`
  );
  const realGodhuliEnd = new Date(actualEvent.date.getTime() + 48 * 60000);
  assert.ok(actualEvent.date < realSunset, "The 0° solar-center crossing should precede apparent sunset");
  assert.equal(minutes(actualEvent.date, realGodhuliEnd), 48);
});

test("displayed Sandhya windows use fixed 48-minute Muhurtas around sunrise, midday, and sunset", () => {
  const start = source.indexOf("function getGodhuliMuhurta(");
  const end = source.indexOf("function getPraharDetails(", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const sandbox = {
    SearchAltitude: () => ({ date: new Date("2026-10-12T12:00:00.000Z") }),
    AstroBody: { Sun: "Sun" },
    AstroObserver: class { constructor(lat, lon, elevation){ this.lat=lat; this.lon=lon; this.elevation=elevation; } },
    selectedLocation: { lat: 30.1265, lon: 80.4817, elevation: 0 }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);

  const p = {
    sunrise: "2026-10-12T06:07:00+05:30",
    sunset: "2026-10-12T17:40:00+05:30"
  };
  const nextSunrise = "2026-10-13T06:08:00+05:30";
  const result = sandbox.getSpecialKaalDetails(p, nextSunrise);
  const minutes = (a, b) => (new Date(b).getTime() - new Date(a).getTime()) / 60000;

  assert.equal(minutes(result.pratahSandhya.start, p.sunrise), 48);
  assert.equal(minutes(p.sunrise, result.pratahSandhya.end), 96);

  const midpoint = (new Date(p.sunrise).getTime() + new Date(p.sunset).getTime()) / 2;
  assert.equal(new Date(result.madhyahnaSandhya.start).getTime(), midpoint - 48 * 60000);
  assert.equal(new Date(result.madhyahnaSandhya.end).getTime(), midpoint + 48 * 60000);

  assert.equal(minutes(result.sayahnaSandhya.start, p.sunset), 96);
  assert.equal(minutes(p.sunset, result.sayahnaSandhya.end), 48);

  // A fixed 48-minute unit must not stretch or shrink with seasonal day/night length.
  assert.equal(minutes(result.madhyahnaSandhya.start, result.madhyahnaSandhya.end), 96);
});

test("Ritu and Ayana cards are adjacent in the compact grid", () => {
  const ritu = source.indexOf(`          ऋतु`);
  const ayana = source.indexOf(`          अयन`);
  const sunMoon = source.indexOf(`🌞 सूर्य व 🌙 चंद्र स्थिति`);
  assert.ok(ritu >= 0 && ayana >= 0 && sunMoon >= 0);
  assert.ok(ritu < ayana && ayana < sunMoon, "Ayana should follow Ritu before the full-width Sun/Moon card");
  assert.ok(!source.slice(ritu, ayana).includes('class="card full"'));
});

test("classical-yoga card renders Anandadi, Dwipushkar, Tripushkar, and remaining calculated yogas", () => {
  const extra = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  assert.match(extra, /"द्विपुष्कर योग"/);
  assert.match(extra, /"त्रिपुष्कर योग"/);
  assert.match(extra, /details\.anandadi/);
  assert.match(extra, /अन्य शास्त्रीय योग \(शुभ-अशुभ\)/);
  assert.match(extra, /details\.yogas/);
  assert.match(extra, /function createClassicalYogaCard\(details\)/);
});


test("Sankalp Sanskrit forms use the selected consistent wording", () => {
  const helperStart = source.indexOf("function toAyanaForm(v){");
  const helperEnd = source.indexOf("function toPakshaForm(v){", helperStart);
  assert.notEqual(helperStart, -1);
  assert.notEqual(helperEnd, -1);

  const sandbox = {};
  vm.runInNewContext(source.slice(helperStart, helperEnd), sandbox);

  assert.equal(sandbox.toAyanaForm("दक्षिणायन"), "सूर्ये दक्षिणायने");
  assert.equal(sandbox.toAyanaForm("उत्तरायण"), "सूर्ये उत्तरायणे");
  assert.equal(sandbox.toRituForm("शरद ऋतु"), "शरदृतौ");
  assert.equal(sandbox.toRituForm("शरद"), "शरदृतौ");
  assert.equal(sandbox.toRituForm("वसन्त"), "वसन्तर्तौ");
  assert.equal(sandbox.toRituForm("ग्रीष्म"), "ग्रीष्मर्तौ");
  assert.equal(sandbox.toRituForm("वर्षा"), "वर्षार्तौ");
  assert.equal(sandbox.toRituForm("हेमन्त"), "हेमन्तर्तौ");
  assert.equal(sandbox.toRituForm("शिशिर"), "शिशिरर्तौ");

  const varaStart = source.indexOf("function toVaraForm(v){");
  const varaEnd = source.indexOf("function toSamvatForm(", varaStart + 1);
  assert.notEqual(varaStart, -1);
  assert.notEqual(varaEnd, -1);
  vm.runInNewContext(source.slice(varaStart, varaEnd), sandbox);

  assert.equal(sandbox.toVaraForm("रविवार"), "भानुवासरे");
  assert.equal(sandbox.toVaraForm("सोमवार"), "चन्द्रवासरे");
  assert.equal(sandbox.toVaraForm("मंगलवार"), "भौमवासरे");
  assert.equal(sandbox.toVaraForm("बुधवार"), "बुधवासरे");
  assert.equal(sandbox.toVaraForm("गुरुवार"), "गुरुवासरे");
  assert.equal(sandbox.toVaraForm("शुक्रवार"), "भृगुवासरे");
  assert.equal(sandbox.toVaraForm("शनिवार"), "शनिवासरे");
});

test("Auto Sandhya follows actual intervals instead of broad daytime labels", () => {
  const start = source.indexOf("function getAutoSandhyaType(");
  const end = source.indexOf("\n/* =========================================================", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const sandbox = {
    dateInput: { value: "2026-10-12" },
    todayString: () => "2026-10-12"
  };
  vm.runInNewContext(source.slice(start, end), sandbox);

  const p = {
    sunrise: "2026-10-12T06:09:00+05:30",
    sunset: "2026-10-12T17:41:00+05:30",
    brahmaMuhurta: { start: "2026-10-12T04:30:00+05:30" }
  };
  const praharData = {
    nightPrahar: [
      { start: "2026-10-12T17:41:00+05:30" },
      {},
      {},
      { end: "2026-10-13T06:09:00+05:30" }
    ]
  };
  const getType = time => sandbox.getAutoSandhyaType(
    p, praharData, new Date(time)
  );

  assert.equal(getType("2026-10-12T04:50:00+05:30"), "turiya");
  assert.equal(getType("2026-10-12T05:30:00+05:30"), "pratah");
  assert.equal(getType("2026-10-12T11:55:00+05:30"), "madhyahna");
  assert.equal(getType("2026-10-12T16:20:00+05:30"), "turiya");
  assert.equal(getType("2026-10-12T17:40:00+05:30"), "turiya");
  assert.equal(getType("2026-10-12T17:41:00+05:30"), "sayam");
  assert.equal(getType("2026-10-12T18:32:00+05:30"), "turiya");
});


test("Sankalp kaal covers every daylight division and sunrise/sunset boundaries", () => {
  const start = source.indexOf("function getCurrentKaalPrahar(");
  const end = source.indexOf("\n/* =========================================================\n   SANKALP TYPE — AUTO SANDHYA", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const sandbox = { sankalpState: { includeNightPrahar: false } };
  vm.runInNewContext(source.slice(start, end), sandbox);
  const p = {
    sunrise: "2026-10-12T06:09:00+05:30",
    sunset: "2026-10-12T17:41:00+05:30",
    brahmaMuhurta: { start: "2026-10-12T04:30:00+05:30" }
  };
  const getKaal = time => sandbox.getCurrentKaalPrahar(p, null, new Date(time)).kaal;
  const cases = [
    ["2026-10-12T04:29:59+05:30", "रात्रि"],
    ["2026-10-12T04:30:00+05:30", "प्रातः"],
    ["2026-10-12T08:27:23+05:30", "प्रातः"],
    ["2026-10-12T08:27:24+05:30", "प्रातः"],
    ["2026-10-12T10:45:47+05:30", "प्रातः"],
    ["2026-10-12T10:45:48+05:30", "मध्याह्न"],
    ["2026-10-12T13:04:11+05:30", "मध्याह्न"],
    ["2026-10-12T13:04:12+05:30", "सायं"],
    ["2026-10-12T15:22:35+05:30", "सायं"],
    ["2026-10-12T15:22:36+05:30", "सायं"],
    ["2026-10-12T17:40:59+05:30", "सायं"],
    ["2026-10-12T17:41:00+05:30", "रात्रि"],
    ["2026-10-12T23:59:59+05:30", "रात्रि"]
  ];
  for (const [time, expected] of cases) {
    assert.equal(getKaal(time), expected, "unexpected kaal at " + time);
  }
});


test("Auto Sandhya transitions exactly at each calculated interval boundary", () => {
  const start = source.indexOf("function getAutoSandhyaType(");
  const end = source.indexOf("\n/* =========================================================", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const sandbox = {
    dateInput: { value: "2026-10-12" },
    todayString: () => "2026-10-12"
  };
  vm.runInNewContext(source.slice(start, end), sandbox);
  const p = {
    sunrise: "2026-10-12T06:09:00+05:30",
    sunset: "2026-10-12T17:41:00+05:30"
  };
  const praharData = {
    nightPrahar: [
      { start: "2026-10-12T17:41:00+05:30" },
      {}, {},
      { end: "2026-10-13T06:09:00+05:30" }
    ]
  };
  const getType = time => sandbox.getAutoSandhyaType(p, praharData, new Date(time));
  const cases = [
    ["2026-10-12T05:19:07+05:30", "turiya"],
    ["2026-10-12T05:19:08+05:30", "pratah"],
    ["2026-10-12T06:08:59+05:30", "pratah"],
    ["2026-10-12T06:09:00+05:30", "turiya"],
    ["2026-10-12T11:31:55+05:30", "turiya"],
    ["2026-10-12T11:31:56+05:30", "madhyahna"],
    ["2026-10-12T12:18:03+05:30", "madhyahna"],
    ["2026-10-12T12:18:04+05:30", "turiya"],
    ["2026-10-12T17:40:59+05:30", "turiya"],
    ["2026-10-12T17:41:00+05:30", "sayam"],
    ["2026-10-12T18:30:51+05:30", "sayam"],
    ["2026-10-12T18:30:52+05:30", "turiya"]
  ];
  for (const [time, expected] of cases) {
    assert.equal(getType(time), expected, "unexpected Sandhya transition at " + time);
  }
});


test("Sandhya and Tarpana phrases read naturally before the final verb", () => {
  const start = source.indexOf("function getKarmaPhrase()");
  const end = source.indexOf("\n/* =========================================================", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const sandbox = { sankalpState: {} };
  vm.runInNewContext(source.slice(start, end), sandbox);

  const expected = {
    pratah: "ममोपात्तसमस्तदुरितक्षयद्वारा श्रीगायत्रीप्रीत्यर्थं प्रातःसंध्योपासनं",
    madhyahna: "ममोपात्तसमस्तदुरितक्षयद्वारा श्रीगायत्रीप्रीत्यर्थं मध्याह्नसंध्योपासनं",
    sayam: "ममोपात्तसमस्तदुरितक्षयद्वारा श्रीगायत्रीप्रीत्यर्थं सायंसंध्योपासनं",
    turiya: "ममोपात्तसमस्तदुरितक्षयद्वारा श्रीगायत्रीप्रीत्यर्थं तुरीयसंध्योपासनं"
  };
  for (const [sandhyaType, phrase] of Object.entries(expected)) {
    sandbox.sankalpState = {
      type: "sandhya",
      sandhyaDevta: "श्रीगायत्री",
      sandhyaType
    };
    assert.equal(sandbox.getKarmaPhrase(), phrase);
  }

  sandbox.sankalpState = { type: "tarpana", tarpanaType: "tilanjali" };
  assert.equal(
    sandbox.getKarmaPhrase(),
    "मम समस्तपितॄणाम् अक्षयतृप्त्यर्थं तिलाञ्जलि-तर्पणं"
  );
  sandbox.sankalpState = { type: "tarpana", tarpanaType: "ekaparvan" };
  assert.equal(
    sandbox.getKarmaPhrase(),
    "मम समस्तपितॄणाम् अक्षयतृप्त्यर्थं एकपार्वण-श्राद्धं"
  );
});
