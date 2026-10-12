import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

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

test("Madhyahna Sandhya is calculated around local solar midday", () => {
  assert.match(source, /const dayMidpointMs = sunrise\.getTime\(\) \+ dayMs \/ 2;/);
  assert.match(source, /const madhyahnaSandhya = \{/);
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
