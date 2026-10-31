import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const adapterSource = await readFile(new URL("../samaveda-annual-review.js", import.meta.url), "utf8");
const engineSource = await readFile(new URL("../festival-muhurta.js", import.meta.url), "utf8");
const engineUrl = "data:text/javascript;base64," + Buffer.from(engineSource).toString("base64");
const adapterUrl = "data:text/javascript;base64," + Buffer.from(
  adapterSource.replace('"./festival-muhurta.js"', JSON.stringify(engineUrl))
).toString("base64");
const { resolveSamavedaAnnualDecision } = await import(adapterUrl);
import panchangPackage from "@ishubhamx/panchangam-js";
const {getPanchangam,Observer}=panchangPackage;

const d = value => new Date(value).toISOString();
function day(date, sunrise, sunset, intervals, extra = {}) {
  return {
    date, sunrise:d(sunrise), sunset:d(sunset),
    masa:"भाद्रपद", paksha:"शुक्ल पक्ष", tithi:"द्वितीया",
    nakshatra:"हस्त", nakshatraIntervals:intervals,
    ...extra
  };
}

test("annual resolver selects the second day when Hasta covers Aparahna on both days", () => {
  const records = [
    day("2026-09-12","2026-09-12T00:30:00Z","2026-09-12T12:30:00Z",[
      {index:12,startTime:d("2026-09-12T07:00:00Z"),endTime:d("2026-09-12T12:00:00Z")}
    ]),
    day("2026-09-13","2026-09-13T00:30:00Z","2026-09-13T12:30:00Z",[
      {index:12,startTime:d("2026-09-13T00:00:00Z"),endTime:d("2026-09-13T08:00:00Z")}
    ])
  ];
  const result = resolveSamavedaAnnualDecision(records);
  assert.equal(result.status,"selected");
  assert.equal(result.date,"2026-09-13");
  assert.equal(result.calculationStatus,"calculated-approved");
  assert.equal(result.reviewStatus,"approved");
});

test("annual resolver refuses scalar Hasta labels when exact nakshatra intervals are absent", () => {
  const records = [day("2026-09-12","2026-09-12T00:30:00Z","2026-09-12T12:30:00Z",[])];
  const result = resolveSamavedaAnnualDecision(records);
  assert.equal(result.status,"unavailable");
  assert.equal(result.date,null);
  assert.equal(result.coverage.daysWithExactHastaIntervals,0);
});

test("annual resolver carries location-specific Sankranti timestamps into the decision", () => {
  const records = [
    day("2026-09-12","2026-09-12T00:30:00Z","2026-09-12T12:30:00Z",[
      {index:12,startTime:d("2026-09-12T07:00:00Z"),endTime:d("2026-09-12T12:00:00Z")}
    ],{sankrantiTimes:[d("2026-09-12T08:00:00Z")]})
  ];
  const result = resolveSamavedaAnnualDecision(records);
  assert.equal(result.coverage.daysWithSankrantiTimes,1);
  assert.equal(result.reviewStatus,"approved");
});

test("annual Upakarma decision exposes no community-selection option", () => {
  const result = resolveSamavedaAnnualDecision([]);
  assert.equal(result.status,"unavailable");
  assert.equal(Object.hasOwn(result,"sampradaya"),false);
});

test("pinned Panchanga engine resolves real annual Samaveda dates for 2026–2029", () => {
  const observer = new Observer(29.58,80.22,1650);
  const years = [2026,2027,2028,2029];
  const expectedDates = {2026:"2026-09-12",2027:"2027-09-03",2028:"2028-08-23",2029:"2029-09-10"};
  const monthNames = {Bhadrapada:"भाद्रपद",Shravana:"श्रावण",Ashadha:"आषाढ़"};
  for (const year of years) {
    const count = (Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
    const annualDays = [];
    for (let offset=0; offset<count; offset++) {
      const date = new Date(Date.UTC(year,0,1+offset,6,30));
      const iso = year+"-"+String(date.getUTCMonth()+1).padStart(2,"0")+"-"+String(date.getUTCDate()).padStart(2,"0");
      const p = getPanchangam(date,observer,{timezoneOffset:330});
      const raw = value => value && typeof value==="object" ? value.name??value.hindi??value.value??value.index??value.number??"" : value??"";
      const rawMasa = raw(p.masa??p.month);
      const rawPaksha = String(raw(p.paksha));
      const tithiIndex = Number(raw(p.tithi));
      const paksha = /krishna/i.test(rawPaksha) ? "कृष्ण पक्ष" : /shukla/i.test(rawPaksha) ? "शुक्ल पक्ष" : tithiIndex>=15 ? "कृष्ण पक्ष" : "शुक्ल पक्ष";
      annualDays.push({
        date:iso,
        sunrise:p.sunrise ? new Date(p.sunrise).toISOString() : null,
        sunset:p.sunset ? new Date(p.sunset).toISOString() : null,
        masa:monthNames[rawMasa]??String(rawMasa),
        paksha,
        tithi:String(raw(p.tithi)),
        nakshatraIntervals:Array.isArray(p.nakshatras)?p.nakshatras:[],
        sunRashi:p.sunRashi,
        sankrantiTimes:[]
      });
    }
    const result = resolveSamavedaAnnualDecision(annualDays);
    assert.equal(result.status,"selected",year+" must resolve from real exact Panchanga intervals");
    assert.match(result.date,/^\d{4}-\d{2}-\d{2}$/);
    assert.equal(result.date,expectedDates[year],year+" must match the verified published date");
    assert.equal(result.reviewStatus,"approved");
    assert.equal(result.coverage.daysScanned,count);
    assert.ok(result.coverage.daysWithExactHastaIntervals>0,year+" must include exact Hasta intervals");
    console.log("SAMAVEDA_ANNUAL_RESULT",year,result.date,result.label);
    if(year===2026) assert.equal(result.date,"2026-09-12","2026 must match the already reviewed Pithoragarh observance");
  }
});

test("annual resolver detects an eclipse interval that overlaps the Hindu day even when its start is before the day boundary", () => {
  const records = [
    day("2026-09-11","2026-09-11T00:30:00Z","2026-09-11T12:30:00Z",[]),
    day("2026-09-12","2026-09-12T00:30:00Z","2026-09-12T12:30:00Z",[
      {index:12,startTime:d("2026-09-12T07:00:00Z"),endTime:d("2026-09-12T12:00:00Z")}
    ],{
      grahanaIntervals:[{
        startTime:d("2026-09-11T18:20:00Z"),
        endTime:d("2026-09-11T18:40:00Z")
      }]
    }),
    day("2026-09-13","2026-09-13T00:30:00Z","2026-09-13T12:30:00Z",[])
  ];
  records[0].nakshatraIntervals=[{index:3,startTime:d("2026-09-11T00:30:00Z"),endTime:d("2026-09-11T12:30:00Z")}];
  records[2].nakshatraIntervals=[{index:3,startTime:d("2026-09-13T00:30:00Z"),endTime:d("2026-09-13T12:30:00Z")}];
  const result = resolveSamavedaAnnualDecision(records);
  assert.equal(result.status,"selected-with-shanti");
  assert.equal(result.date,"2026-09-12");
  assert.equal(result.requiresShanti,true);
  assert.equal(result.coverage.daysWithEclipseData,1);
});
