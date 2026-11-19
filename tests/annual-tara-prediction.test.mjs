import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { predictAnnualTara } from "../research/annual-tara-prediction.mjs";
import { LOCATION_PROFILES, measureSunAltitudeAtTargetRiseSet } from "../research/drik-ganita-time-separation.mjs";

const cli = fileURLToPath(new URL("../scripts/predict-annual-tara.mjs", import.meta.url));
const report = JSON.parse(execFileSync(process.execPath, [cli], { encoding: "utf8" }));
const pithoragarh = report.forecasts.filter(f => f.observer.name === LOCATION_PROFILES["pithoragarh-project-target"].name);

test("offline forecast uses the selected observer for all fifteen city-years", () => {
  assert.equal(report.trainingSourceId, "drikpanchang-almora");
  assert.equal(report.trainingThroughYear, 2025);
  assert.equal(report.forecasts.length, 15);
  for (const id of ["pithoragarh-project-target", "drikpanchang-almora", "drikpanchang-ramnagar"]) {
    const {latitude, longitude, elevation} = LOCATION_PROFILES[id];
    const city = report.forecasts.filter(f => f.observer.latitude === latitude && f.observer.longitude === longitude);
    assert.deepEqual(city.map(f => f.year), [2026, 2027, 2028, 2029, 2030]);
    for (const {year, observer, events, canopusIssues} of city) {
      assert.equal(observer.elevation, elevation);
      assert.deepEqual(new Set(events.map(e => e.body)), new Set(["Jupiter", "Venus", "Canopus"]));
      const times = events.map(e => e.local);
      assert.ok(times.every(t => t.startsWith(year + "-") && t.endsWith("+05:30") && Number.isFinite(Date.parse(t))));
      assert.deepEqual(times, [...new Set(times)].sort());
      for (const event of ["Asta", "Udaya"]) {
        const count = events.filter(e => e.body === "Canopus" && e.event === event).length;
        const issue = canopusIssues.find(item => item.event === event);
        if (count === 1) assert.equal(issue, undefined);
        else {
          assert.equal(issue.count, count);
          assert.ok(issue.reason);
        }
      }
    }
  }
  const times = report.forecasts.filter(f => f.year === 2028)
    .map(f => f.events.find(e => e.body === "Jupiter" && e.event === "Udaya").local);
  assert.equal(new Set(times).size, 3);
});

test("Pithoragarh retains the nine source-backed planetary dates in 2026 and 2027", () => {
  const {windows} = JSON.parse(fs.readFileSync(new URL("../data/drik-pithoragarh-asta-udaya-2024-2027.json", import.meta.url)));
  const expected = new Set();
  for (const w of windows.filter(w => w.acceptanceEligible && ["Jupiter", "Venus"].includes(w.planet))) {
    for (const [key, event] of [["astaStart", "Asta"], ["astaEnd", "Udaya"]]) {
      const date = w.boundaries[key].normalizedLocalDateTime.slice(0, 10);
      if (/^202[67]-/.test(date)) expected.add([w.planet, event, date].join("|"));
    }
  }
  const actual = pithoragarh.filter(f => f.year <= 2027).flatMap(f => f.events.filter(e => e.body !== "Canopus")
    .map(e => [e.body, e.event, e.local.slice(0, 10)].join("|")));
  assert.equal(expected.size, 9);
  assert.deepEqual(actual.sort(), [...expected].sort());
});

test("2028 Pithoragarh Canopus dates are compared only after the forecast", () => {
  const {years} = JSON.parse(fs.readFileSync(new URL("../data/agastya-arghya-pithoragarh.json", import.meta.url)));
  const source = years.find(y => y.year === 2028);
  assert.equal(source.source.status, "source-page-identity-and-arghya-fields-captured");
  assert.equal(source.source.locationMatch, "city-label-only");
  assert.match(source.source.raw.arghyaDate, /2028/);
  const stars = pithoragarh.find(f => f.year === 2028).events.filter(e => e.body === "Canopus");
  assert.equal(stars.length, 2);
  for (const [event, date, toleranceDays] of [["Asta", source.taraSetDate, 1], ["Udaya", source.arghyaDate, 2]]) {
    const predicted = stars.find(e => e.event === event).local.slice(0, 10);
    assert.ok(Math.abs(Date.parse(predicted) - Date.parse(date)) / 86_400_000 <= toleranceDays);
  }
});

test("the preceding December sample can trigger an event on January 1 IST", () => {
  const engine = createRequire(import.meta.url)("astronomy-engine");
  const location = LOCATION_PROFILES["pithoragarh-project-target"];
  const observer = new engine.Observer(location.latitude, location.longitude, location.elevation);
  const altitudes = ["2027-12-31", "2028-01-01"].map(date => measureSunAltitudeAtTargetRiseSet({
    ...engine, body: "Venus", observer, branch: "rise",
    localDayStartUtc: Date.parse(date + "T00:00:00+05:30")
  }).sunAltitudeDeg);
  const event = altitudes[1] > altitudes[0] ? "Asta" : "Udaya";
  const thresholdSunAltitudeDeg = (altitudes[0] + altitudes[1]) / 2;
  const profiles = ["direct", "retrograde"].map(state => ({ key: `Venus|rise|${event}|${state}`, thresholdSunAltitudeDeg }));
  const {events, canopusIssues} = predictAnnualTara(location, 2028, profiles);
  assert.ok(events.some(e => e.event === event && new Date(e.utcMilliseconds + 330 * 60_000).toISOString().startsWith("2028-01-01")));
  assert.deepEqual(canopusIssues.map(i => i.reason), ["no-fitted-profile", "no-fitted-profile"]);
});
