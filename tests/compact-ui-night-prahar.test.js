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
