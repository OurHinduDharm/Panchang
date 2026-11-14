import test from "node:test";
import assert from "node:assert/strict";
import { auditConjunctionAgeEventTimes } from "../research/conjunction-age-event-time-audit.mjs";

test("selects conjunction-age crossing from the full horizon series without source-date lookahead",()=>{
  const conjunction="2027-01-01T00:00:00.000Z";
  const event=(age,dep)=>({
    type:"set",
    instant:new Date(Date.parse(conjunction)+age*86400000).toISOString(),
    sunDepressionDeg:dep
  });
  const training=[20,21,22,23].map((age,i)=>({
    sourceWindowId:"train-"+age,sourceYear:2021+i,city:"Pithoragarh",
    planet:"Venus",boundary:"astaEnd",expectedHorizonEventType:"set",
    horizonEventType:"set",branchMatchesConjunction:true,
    conjunctionKind:"superior-conjunction",
    conjunctionInstant:"2021-01-01T00:00:00.000Z",
    sourceUtcInstant:new Date(Date.parse("2021-01-01T00:00:00Z")+age*86400000).toISOString(),
    sunDepressionDeg:5.8-(age-20)*0.01
  }));
  const holdout={
    sourceWindowId:"holdout-2027",sourceYear:2027,city:"Pithoragarh",
    planet:"Venus",boundary:"astaEnd",expectedHorizonEventType:"set",
    horizonEventType:"set",branchMatchesConjunction:true,
    conjunctionKind:"superior-conjunction",conjunctionInstant:conjunction,
    sourceUtcInstant:event(21,"5.79").instant,
    sourceLocalDateTime:"2027-01-22T00:00:00+05:30",
    sunDepressionDeg:5.79
  };
  const report=auditConjunctionAgeEventTimes({cities:[{
    city:"Pithoragarh",
    sourceObservations:[...training,holdout],
    horizonEventsByPlanet:{Venus:[
      event(19,5.82),event(20,5.81),event(21,5.79),event(22,5.77),event(23,5.75)
    ]}
  }]});
  const city=report.cities[0];
  assert.equal(city.holdout.length,1);
  assert.equal(city.holdout[0].candidate.localDate,"2027-01-22");
  assert.equal(city.holdout[0].absoluteTimeErrorMinutes,0);
  assert.equal(report.publicationEligible,false);
});

test("does not borrow horizon events or fitted thresholds across cities",()=>{
  const base={
    sourceYear:2027,planet:"Venus",boundary:"astaEnd",expectedHorizonEventType:"set",
    horizonEventType:"set",branchMatchesConjunction:true,conjunctionKind:"superior-conjunction",
    conjunctionInstant:"2027-01-01T00:00:00.000Z",sourceUtcInstant:"2027-01-22T00:00:00.000Z",
    sourceLocalDateTime:"2027-01-22T05:30:00+05:30",sunDepressionDeg:5.79
  };
  const train=[20,21,22,23].map((age,i)=>({
    ...base,sourceWindowId:"train"+i,sourceYear:2021+i,
    conjunctionInstant:"2021-01-01T00:00:00.000Z",
    sourceUtcInstant:new Date(Date.parse("2021-01-01T00:00:00Z")+age*86400000).toISOString(),
    sunDepressionDeg:5.8-(age-20)*0.01
  }));
  const hold={...base,sourceWindowId:"hold",sourceYear:2027};
  const events=[{type:"set",instant:"2027-01-21T00:00:00Z",sunDepressionDeg:5.81},
    {type:"set",instant:"2027-01-22T00:00:00Z",sunDepressionDeg:5.79}];
  const result=auditConjunctionAgeEventTimes({cities:[
    {city:"Pithoragarh",sourceObservations:[...train,hold],horizonEventsByPlanet:{Venus:events}},
    {city:"Mumbai",sourceObservations:[hold],horizonEventsByPlanet:{Venus:events}}
  ]});
  assert.equal(result.cities[0].holdout[0].candidate.localDate,"2027-01-22");
  assert.equal(result.cities[1].holdout[0].status,"no-conjunction-age-crossing-found");
});
