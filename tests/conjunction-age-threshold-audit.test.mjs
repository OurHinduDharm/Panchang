import test from "node:test";
import assert from "node:assert/strict";
import { auditConjunctionAgeThresholds } from "../research/conjunction-age-threshold-audit.mjs";

test("conjunction-age audit excludes branch mismatches and keeps city groups separate",()=>{
  const make=(city,year,age,dep,branch=true)=>({
    sourceWindowId:city+"-"+year,sourceYear:year,sourceUtcInstant:new Date(Date.UTC(2020,0,1)+age*86400000).toISOString(),
    conjunctionInstant:"2020-01-01T00:00:00.000Z",planet:"Venus",boundary:"astaEnd",
    horizonEventType:"set",branchMatchesConjunction:branch,sunDepressionDeg:dep
  });
  const report=auditConjunctionAgeThresholds({cities:[
    {city:"Pithoragarh",sourceObservations:[
      make("P",2021,20,6),make("P",2022,22,5.8),make("P",2024,24,5.6),
      make("P",2025,26,5.4),make("P",2027,28,5.2),make("P",2025,27,5.3,false)
    ]},
    {city:"Mumbai",sourceObservations:[
      make("M",2021,20,6.1),make("M",2022,22,5.9),make("M",2024,24,5.7),
      make("M",2025,26,5.5),make("M",2027,28,5.3)
    ]}
  ]});
  assert.equal(report.groups.length,2);
  assert.ok(report.groups.some(g=>g.group.startsWith("Pithoragarh:")));
  assert.ok(report.groups.some(g=>g.group.startsWith("Mumbai:")));
  assert.ok(report.groups.every(g=>g.trainingSampleCount===4));
  assert.equal(report.summary.holdoutBoundaries,2);
  assert.equal(report.publicationEligible,false);
});
