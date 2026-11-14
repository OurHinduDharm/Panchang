import fs from "node:fs";
import assert from "node:assert/strict";

const inputIndex=process.argv.indexOf("--input");
if(inputIndex<0||!process.argv[inputIndex+1]) {
  throw new Error("--input conjunction-age-event-time-audit.json is required");
}
const report=JSON.parse(fs.readFileSync(process.argv[inputIndex+1],"utf8"));
assert.equal(report.publicationEligible,false,"research candidates must remain publication-ineligible");
assert.match(report.selectionPolicy,/Source boundary timestamps are used only after selection/);

const findHoldout=(city,planet,year,boundary)=>{
  const cityReport=report.cities.find(item=>item.city===city);
  assert.ok(cityReport,"Missing city "+city);
  const row=cityReport.holdout.find(item=>
    item.planet===planet&&item.sourceYear===year&&item.boundary===boundary
  );
  assert.ok(row,"Missing "+city+" "+planet+" "+year+" "+boundary+" holdout");
  assert.ok(row.candidate,"No candidate for "+city+" "+planet+" "+year+" "+boundary);
  return row;
};

const pithStart=findHoldout("Pithoragarh","Venus",2027,"astaStart");
const pithEnd=findHoldout("Pithoragarh","Venus",2027,"astaEnd");
assert.equal(pithStart.candidate.localDate,pithStart.sourceLocalDate);
assert.equal(pithEnd.candidate.localDate,pithEnd.sourceLocalDate);
assert.ok(pithStart.absoluteTimeErrorMinutes<=15);
assert.ok(pithEnd.absoluteTimeErrorMinutes<=15);

const expectedCities=["New Delhi","Mumbai","Ujjain","Varanasi","Pithoragarh"];
const cityResults=expectedCities.map(city=>{
  const row=findHoldout(city,"Venus",2027,"astaEnd");
  assert.equal(row.candidate.localDate,row.sourceLocalDate,city+" Venus AstaEnd date mismatch");
  assert.ok(row.absoluteTimeErrorMinutes<=15,city+" Venus AstaEnd clock-time error exceeded 15 minutes");
  return {city,date:row.candidate.localDate,time:row.candidate.localTime,errorMinutes:row.signedTimeErrorMinutes};
});
console.log(JSON.stringify({
  status:"key-venus-2027-holdouts-pass",
  pithoragarhAstaStart:{date:pithStart.candidate.localDate,time:pithStart.candidate.localTime,errorMinutes:pithStart.signedTimeErrorMinutes},
  pithoragarhAstaEnd:{date:pithEnd.candidate.localDate,time:pithEnd.candidate.localTime,errorMinutes:pithEnd.signedTimeErrorMinutes},
  fiveCityVenusAstaEnd:cityResults,
  publicationEligible:false
},null,2));
