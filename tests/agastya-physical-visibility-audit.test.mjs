import test from "node:test";
import assert from "node:assert/strict";
import { locateVisibilityTransition, findAnnualVisibilityTransitions, localCivilDayStartUtc } from "../research/agastya-physical-visibility-audit.mjs";

test("refines appearance and disappearance transitions to one second",()=>{
  const start=new Date("2026-09-07T00:00:00Z");
  const end=new Date("2026-09-07T00:10:00Z");
  const sampleAt=instant=>({visible:instant.getTime()>=start.getTime()+300000});
  const appearance=locateVisibilityTransition({
    before:{instant:start.toISOString(),visible:false},
    after:{instant:end.toISOString(),visible:true},
    sampleAt,transition:"appearance",precisionSeconds:1
  });
  assert.equal(appearance.instant,"2026-09-07T00:05:00.000Z");
  const disappearAt=new Date(start.getTime()+420000);
  const disappearance=locateVisibilityTransition({
    before:{instant:start.toISOString(),visible:true},
    after:{instant:end.toISOString(),visible:false},
    sampleAt:instant=>({visible:instant.getTime()<disappearAt.getTime()}),
    transition:"disappearance",precisionSeconds:1
  });
  assert.ok(Math.abs(Date.parse(disappearance.instant)-disappearAt.getTime())<=1000);
});

test("finds annual morning heliacal rise and evening heliacal set without mixing definitions",()=>{
  const result=findAnnualVisibilityTransitions([
    {date:"2026-09-05",morningVisible:false,eveningVisible:true},
    {date:"2026-09-06",morningVisible:false,eveningVisible:true},
    {date:"2026-09-07",morningVisible:true,morningFirstVisible:{localTime:"04:44"},eveningVisible:false},
    {date:"2026-09-08",morningVisible:true,eveningVisible:false}
  ]);
  assert.equal(result.morningRises[0].date,"2026-09-07");
  assert.equal(result.eveningSets[0].date,"2026-09-06");
  assert.equal(result.morningRises[0].firstVisible.localTime,"04:44");
  assert.equal(result.eveningSets[0].lastVisible,null);
});

test("rejects invalid transition endpoints",()=>{
  assert.throws(()=>locateVisibilityTransition({
    before:{instant:"2026-09-07T00:00:00Z",visible:true},
    after:{instant:"2026-09-07T00:10:00Z",visible:true},
    sampleAt:()=>({visible:true}),transition:"appearance"
  }),/appearance requires/);
});

test("starts the observer day at local IST midnight, not UTC midnight",()=>{
  const start=localCivilDayStartUtc("2026-09-07T00:00:00.000Z");
  assert.equal(start.toISOString(),"2026-09-06T18:30:00.000Z");
});
