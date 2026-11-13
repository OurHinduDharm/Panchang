import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PLANET_ORDER,
  getPithoragarhAnnualWindows,
  formatPithoragarhBoundary
} from "../planetary-asta-udaya-page.mjs";

const dataset = JSON.parse(readFileSync(
  new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url),
  "utf8"
));

const calculatedDataset = JSON.parse(readFileSync(
  new URL("../data/pithoragarh-guru-shukra-calculated-2028-2030.json", import.meta.url),
  "utf8"
));

test("annual page selector includes only verified Pithoragarh city-reference windows", () => {
  const all = [2021, 2022, 2023, 2024, 2025, 2026, 2027]
    .flatMap(year => getPithoragarhAnnualWindows(dataset, year));
  assert.equal(all.length, 16);
  assert.ok(all.every(item => ["Jupiter", "Venus"].includes(item.planet)));
  assert.ok(all.every(item => item.id && item.astaStart && item.udaya));
  assert.ok(all.every(item => Date.parse(item.astaStart) < Date.parse(item.udaya)));
});

test("all seven captured years expose only Guru and Shukra and preserve chronological order", () => {
  for (const year of [2021, 2022, 2023, 2024, 2025, 2026, 2027]) {
    const windows = getPithoragarhAnnualWindows(dataset, year);
    assert.ok(windows.length > 0, String(year));
    for (const item of windows) {
      assert.equal(item.sourceYear, year);
      assert.ok(["Jupiter", "Venus"].includes(item.planet));
    }
    for (let index = 1; index < windows.length; index++) {
      assert.ok(Date.parse(windows[index - 1].astaStart) <= Date.parse(windows[index].astaStart));
    }
  }
});

test("Mercury, Mars and Saturn remain outside the public Guru-Shukra annual list", () => {
  for (const year of [2021, 2022, 2023, 2024, 2025, 2026, 2027]) {
    const windows = getPithoragarhAnnualWindows(dataset, year);
    assert.ok(windows.every(item => ["Jupiter", "Venus"].includes(item.planet)));
  }
});

test("does not include other cities or records that claim coordinate-exact acceptance", () => {
  const polluted = {
    windows: [
      ...dataset.windows,
      {
        ...dataset.windows[0],
        id: "other-city",
        sourceLocation: "New Delhi, NCT, India"
      },
      {
        ...dataset.windows[0],
        id: "coordinate-exact",
        strictCoordinateAcceptanceEligible: true
      }
    ]
  };
  const ids = getPithoragarhAnnualWindows(polluted, 2024).map(item => item.id);
  assert.ok(!ids.includes("other-city"));
  assert.ok(!ids.includes("coordinate-exact"));
});

test("formats boundaries in India Standard Time with Hindi date and clock", () => {
  const formatted = formatPithoragarhBoundary("2024-02-07T06:12:00+05:30");
  assert.match(formatted, /2024|२०२४/);
  assert.match(formatted, /06:12|०६:१२/);
  assert.equal(formatPithoragarhBoundary("not-a-date"), "—");
});

test("main Panchang planetary card links to the annual reference page", () => {
  const source = readFileSync(
    new URL("../extra-panchang.js", import.meta.url),
    "utf8"
  );
  assert.match(source, /https:\/\/ourhindudharm\.blogspot\.com\/p\/guru-shukra-agastya-tara-uday-ast\.html/);
  assert.match(source, /गुरु, शुक्र एवं अगस्त्य की वर्षवार सूची देखें/);
});

test("annual page builds its year selector from the available dataset and shows no outside links", () => {
  const page = readFileSync(new URL("../planetary-asta-udaya.html", import.meta.url), "utf8");
  assert.ok(page.includes("const years = [...new Set(["));
  assert.ok(page.includes("...agastya.years.map(entry => entry.year)"));
  assert.ok(page.includes("./data/pithoragarh-guru-shukra-calculated-2028-2030.json"));
  assert.ok(page.includes("...calculated.windows"));
  assert.ok(page.includes("yearSelect.append(option)"));
  assert.ok(!page.includes("<option>2021</option>"));
  assert.ok(!page.includes("http://") && !page.includes("https://"));
  assert.ok(!page.includes("Drik Panchang") && !page.includes("drikpanchang.com"));
});


const agastya = JSON.parse(readFileSync(
  new URL("../data/agastya-arghya-pithoragarh.json", import.meta.url),
  "utf8"
));

test("Pithoragarh Agastya Arghya records preserve supplied annual dates and local times", () => {
  assert.deepEqual(agastya.years.map(item => item.year), [2024, 2025, 2026, 2027, 2028, 2029, 2030]);
  assert.deepEqual(agastya.years.map(item => item.arghyaDate), [
    "2024-09-07", "2025-09-07", "2026-09-07", "2027-09-07", "2028-09-07", "2029-09-07", "2030-09-07"
  ]);
  assert.deepEqual(agastya.years.map(item => item.taraRise), ["04:41", "04:43", "04:44", "04:45", "04:41", "04:43", "04:44"]);
  assert.deepEqual(agastya.years.map(item => item.arghyaEnd), ["05:50", "05:50", "05:49", "05:49", "05:50", "05:50", "05:49"]);
  assert.deepEqual(agastya.years.map(item => item.taraSet), ["19:46", "19:44", "19:44", "19:45", "19:46", "19:44", "19:44"]);
  assert.equal(agastya.location.name, "पिथौरागढ़");
  assert.equal(agastya.location.timeZone, "Asia/Kolkata");
});

test("annual iframe page renders Agastya data from its separate JSON dataset", () => {
  const page = readFileSync(new URL("../planetary-asta-udaya.html", import.meta.url), "utf8");
  assert.ok(page.includes("./data/agastya-arghya-pithoragarh.json"));
  assert.ok(page.includes("renderAgastya"));
  assert.ok(page.includes("अगस्त्य तारा उदय एवं अर्घ्य"));
  assert.ok(page.includes("taraSetDate"));
});

test("public Agastya selector excludes legacy years without captured source provenance", () => {
  const published = agastya.years.filter(item =>
    item.source?.status === "source-page-identity-and-arghya-fields-captured"
  );
  assert.deepEqual(published.map(item => item.year), [2028, 2029, 2030]);
  assert.deepEqual(agastya.years.filter(item => !item.source).map(item => item.year), [2024, 2025, 2026, 2027]);

  const page = readFileSync(new URL("../planetary-asta-udaya.html", import.meta.url), "utf8");
  assert.ok(page.includes("const agastyaPublished = agastya.years.filter(entry =>"));
  assert.ok(page.includes('entry.source?.status === "source-page-identity-and-arghya-fields-captured"'));
  assert.ok(page.includes("...agastyaPublished.map(entry => entry.year)"));
  assert.ok(page.includes("renderAgastya(agastyaPublished, year)"));
});


test("2028-2030 Agastya Arghya records retain direct Pithoragarh source evidence", () => {
  const future = agastya.years.filter(item => item.year >= 2028);
  assert.equal(future.length, 3);
  for (const item of future) {
    assert.equal(item.source.provider, "Drik Panchang");
    assert.equal(item.source.location, "Pithoragarh, Uttarakhand, India");
    assert.equal(item.source.locationMatch, "city-label-only");
    assert.equal(item.source.coordinateExact, false);
    assert.equal(item.source.status, "source-page-identity-and-arghya-fields-captured");
    assert.match(item.source.url, /geoname-id=1259503/);
    assert.match(item.source.url, new RegExp("year=" + item.year));
    assert.ok(item.source.raw.arghyaDate);
    assert.ok(item.source.raw.arghyaWindow.includes("28:"));
    assert.ok(item.source.raw.taraRise.includes("28:"));
    assert.ok(item.source.raw.taraSet.includes("अप्रैल"));
  }
  assert.deepEqual(future.map(item => item.arghyaStart), ["04:41", "04:43", "04:44"]);
  assert.deepEqual(future.map(item => item.duration), ["01 घंटा 08 मिनट", "01 घंटा 07 मिनट", "01 घंटा 05 मिनट"]);
  assert.deepEqual(future.map(item => item.taraSetDate), ["2028-04-14", "2029-04-15", "2030-04-15"]);
});


test("calculated Pithoragarh Guru-Shukra annual windows are available for 2028-2030", () => {
  const expected = {
    2028: 2,
    2029: 2,
    2030: 3
  };
  for (const [yearText, count] of Object.entries(expected)) {
    const year = Number(yearText);
    const windows = getPithoragarhAnnualWindows(dataset, year, calculatedDataset);
    assert.equal(windows.length, count);
    assert.ok(windows.every(item => item.sourceYear === year));
    assert.ok(windows.every(item => ["Jupiter", "Venus"].includes(item.planet)));
    assert.ok(windows.every(item => Date.parse(item.astaStart) < Date.parse(item.udaya)));
  }
  assert.equal(getPithoragarhAnnualWindows(dataset, 2031, calculatedDataset).length, 0);
});

test("future calculated records preserve the reviewed local Pithoragarh dates and times", () => {
  const all = [2028, 2029, 2030].flatMap(year =>
    getPithoragarhAnnualWindows(dataset, year, calculatedDataset)
  );
  const find = (planet, startPrefix) => all.find(item =>
    item.planet === planet && item.astaStart.startsWith(startPrefix)
  );
  assert.equal(find("Jupiter", "2028-09-15").udaya, "2028-10-13T05:26:26+05:30");
  assert.equal(find("Jupiter", "2029-10-17").udaya, "2029-11-12T05:47:14+05:30");
  assert.equal(find("Jupiter", "2030-11-18").udaya, "2030-12-13T06:10:26+05:30");
  assert.equal(find("Venus", "2028-05-29").udaya, "2028-06-08T04:32:38+05:30");
  assert.equal(find("Venus", "2029-02-12").udaya, "2029-04-17T19:04:16+05:30");
  assert.equal(find("Venus", "2030-01-04").udaya, "2030-01-09T06:35:34+05:30");
  assert.equal(find("Venus", "2030-09-28").udaya, "2030-11-20T17:38:42+05:30");
});

test("calculated annual records are rejected if the observer profile does not match Pithoragarh", () => {
  const wrongLocation = {
    ...calculatedDataset,
    location: { ...calculatedDataset.location, latitude: 28.6139 }
  };
  assert.equal(getPithoragarhAnnualWindows(dataset, 2028, wrongLocation).length, 0);
});

test("calculated annual records are rejected if the model identifier is unknown", () => {
  const wrongModel = {
    ...calculatedDataset,
    calculation: { ...calculatedDataset.calculation, modelId: "unknown-model" }
  };
  assert.equal(getPithoragarhAnnualWindows(dataset, 2028, wrongModel).length, 0);
});
