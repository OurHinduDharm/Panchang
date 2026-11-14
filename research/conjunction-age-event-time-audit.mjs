/**
 * Research-only event-time experiment for the conjunction-age threshold.
 * The implicit condition is:
 *   observed Sun depression at a local planet rise/set event
 *   = fitted threshold(degrees from conjunction age).
 *
 * Candidate events are selected from the complete horizon series and paired
 * to conjunctions. Source boundary timestamps are consulted only afterwards
 * to measure error; they are never used to choose the candidate.
 */
import fs from "node:fs";
import { auditConjunctionAgeThresholds } from "./conjunction-age-threshold-audit.mjs";

const DAY_MS=86_400_000;
const OFFSET_MINUTES=330;

function localDate(instant) {
  return new Date(Date.parse(instant)+OFFSET_MINUTES*60_000).toISOString().slice(0,10);
}
function daysFromConjunction(event,conjunctionInstant) {
  return (Date.parse(event.instant)-Date.parse(conjunctionInstant))/DAY_MS;
}
function residualAt(event,conjunctionInstant,fit) {
  const age=daysFromConjunction(event,conjunctionInstant);
  const threshold=fit.interceptDeg+fit.slopeDegPerConjunctionDay*age;
  return {age,threshold,residual:event.sunDepressionDeg-threshold};
}
function candidateForConjunction({events,conjunctionInstant,boundary,eventType,fit,maxDistanceDays=90}) {
  const direction=boundary==="astaStart"?"before":"after";
  const series=events.filter(event=>event.type===eventType)
    .map(event=>({event,...residualAt(event,conjunctionInstant,fit)}))
    .filter(item=>Number.isFinite(item.age)&&Math.abs(item.age)<=maxDistanceDays&&
      (direction==="before"?item.age<0:item.age>0))
    .sort((a,b)=>a.event.instant.localeCompare(b.event.instant));
  const crossings=[];
  for(let i=1;i<series.length;i++) {
    const a=series[i-1],b=series[i];
    if(a.residual===0) {
      crossings.push({a,b,fraction:0,selected:a});
    } else if(a.residual*b.residual<0) {
      const fraction=-a.residual/(b.residual-a.residual);
      crossings.push({a,b,fraction,selected:fraction<=0.5?a:b});
    }
  }
  if(!crossings.length) return null;
  const crossing=direction==="before"
    ?crossings.sort((a,b)=>Date.parse(b.selected.event.instant)-Date.parse(a.selected.event.instant))[0]
    :crossings.sort((a,b)=>Date.parse(a.selected.event.instant)-Date.parse(b.selected.event.instant))[0];
  const selected=crossing.selected;
  return Object.freeze({
    boundary,eventType,conjunctionInstant,
    instant:selected.event.instant,
    localDate:localDate(selected.event.instant),
    localTime:new Date(Date.parse(selected.event.instant)+OFFSET_MINUTES*60_000).toISOString().slice(11,16),
    daysFromConjunction:selected.age,
    predictedThresholdDeg:selected.threshold,
    actualEventSunDepressionDeg:selected.event.sunDepressionDeg,
    residualAtSelectedEventDeg:selected.residual,
    bracket:[crossing.a.event.instant,crossing.b.event.instant],
    bracketResidualDeg:[crossing.a.residual,crossing.b.residual],
    bracketFraction:crossing.fraction,
    selectedSide:direction,
    selectionPolicy:direction==="before"?"last-crossing-before-conjunction":"first-crossing-after-conjunction"
  });
}

export function auditConjunctionAgeEventTimes(report,{
  trainingEndYear=2025,minTrainingSamples=4,maxDistanceDays=90
}={}) {
  if(!report||!Array.isArray(report.cities)) throw new TypeError("A multi-city back-test report is required");
  const thresholdAudit=auditConjunctionAgeThresholds(report,{trainingEndYear,minTrainingSamples});
  const fittedGroups=new Map(thresholdAudit.groups.map(group=>[group.group,group]));
  const cities=[];
  for(const city of report.cities) {
    const cityCandidates=[];
    const observations=city.sourceObservations??[];
    for(const [planet,horizonEvents] of Object.entries(city.horizonEventsByPlanet??{})) {
      const holdoutConjunctions=new Map();
      for(const row of observations) {
        if(row.sourceYear<=trainingEndYear||row.planet!==planet||
          row.branchMatchesConjunction!==true||!row.conjunctionInstant||
          !row.conjunctionKind) continue;
        const key=row.conjunctionInstant+"|"+row.conjunctionKind;
        if(!holdoutConjunctions.has(key)) holdoutConjunctions.set(key,{
          instant:row.conjunctionInstant,kind:row.conjunctionKind
        });
      }
      for(const boundary of ["astaStart","astaEnd"]) {
        for(const eventType of ["rise","set"]) {
          const key=[city.city,planet,boundary,eventType].join(":");
          const group=fittedGroups.get(key);
          if(!group||group.trainingSampleCount<minTrainingSamples||group.fit.status!=="fitted") continue;
          for(const conjunction of holdoutConjunctions.values()) {
            const candidate=candidateForConjunction({
              events:horizonEvents,conjunctionInstant:conjunction.instant,
              boundary,eventType,fit:group.fit,maxDistanceDays
            });
            if(candidate) cityCandidates.push({
              ...candidate,city:city.city,planet,conjunctionKind:conjunction.kind,
              trainingSampleCount:group.trainingSampleCount,
              trainingYears:group.trainingYears
            });
          }
        }
      }
    }
    const holdout=observations.filter(row=>row.sourceYear>trainingEndYear&&
      row.branchMatchesConjunction===true&&row.conjunctionInstant&&row.conjunctionKind)
      .map(row=>{
        const candidate=cityCandidates.find(item=>item.planet===row.planet&&
          item.boundary===row.boundary&&item.eventType===row.expectedHorizonEventType&&
          item.conjunctionInstant===row.conjunctionInstant&&item.conjunctionKind===row.conjunctionKind);
        if(!candidate) return {
          sourceWindowId:row.sourceWindowId,city:city.city,planet:row.planet,
          sourceYear:row.sourceYear,boundary:row.boundary,
          sourceLocalDateTime:row.sourceLocalDateTime,
          candidate:null,status:"no-conjunction-age-crossing-found",
          publicationEligible:false
        };
        const errorMinutes=(Date.parse(candidate.instant)-Date.parse(row.sourceUtcInstant))/60_000;
        const sourceLocalDate=localDate(row.sourceUtcInstant);
        const candidateLocalDate=candidate.localDate;
        const dateErrorDays=(Date.parse(candidateLocalDate+"T00:00:00Z")-
          Date.parse(sourceLocalDate+"T00:00:00Z"))/DAY_MS;
        return {
          sourceWindowId:row.sourceWindowId,city:city.city,planet:row.planet,
          sourceYear:row.sourceYear,boundary:row.boundary,
          sourceLocalDateTime:row.sourceLocalDateTime,
          sourceLocalDate,candidate,
          signedTimeErrorMinutes:Number(errorMinutes.toFixed(2)),
          absoluteTimeErrorMinutes:Number(Math.abs(errorMinutes).toFixed(2)),
          dateErrorDays,
          status:Math.abs(errorMinutes)<=15?"within-15-minutes":
            Math.abs(errorMinutes)<=60?"within-1-hour":
            dateErrorDays===0?"same-local-date-time-mismatch":"local-date-mismatch",
          publicationEligible:false
        };
      });
    const resolved=holdout.filter(row=>row.candidate);
    const mean=values=>values.length?Number((values.reduce((s,v)=>s+v,0)/values.length).toFixed(2)):null;
    cities.push({
      city:city.city,
      candidateCount:cityCandidates.length,
      candidates:cityCandidates,
      holdout,
      summary:{
        records:holdout.length,
        resolved:resolved.length,
        within15Minutes:resolved.filter(row=>row.absoluteTimeErrorMinutes<=15).length,
        within1Hour:resolved.filter(row=>row.absoluteTimeErrorMinutes<=60).length,
        sameLocalDateButTimeMismatch:resolved.filter(row=>row.status==="same-local-date-time-mismatch").length,
        localDateMismatch:resolved.filter(row=>row.status==="local-date-mismatch").length,
        unresolved:holdout.length-resolved.length,
        meanAbsoluteTimeErrorMinutes:mean(resolved.map(row=>row.absoluteTimeErrorMinutes)),
        maxAbsoluteTimeErrorMinutes:resolved.length?Math.max(...resolved.map(row=>row.absoluteTimeErrorMinutes)):null,
        meanAbsoluteLocalDateErrorDays:mean(resolved.map(row=>Math.abs(row.dateErrorDays)))
      }
    });
  }
  return Object.freeze({
    schemaVersion:1,
    model:"conjunction-age-implicit-local-horizon-event-time-diagnostic-v1",
    selectionPolicy:"Generate residual crossings from all 2026-2027 local horizon events within 90 days of each conjunction. AstaStart selects the last crossing before conjunction; AstaEnd selects the first crossing after conjunction. Source boundary timestamps are used only after selection to calculate errors.",
    thresholdFeature:"Sun depression = linear function of elapsed days from associated conjunction",
    thresholdTrainingYears:"2021-2025, same city/planet/boundary/rise-set branch",
    cities,
    publicationEligible:false,
    interpretation:"Research-only candidate timestamp experiment. No holdout date is used for candidate selection; this diagnostic does not change production thresholds or public data."
  });
}

const input=process.argv.indexOf("--input"),output=process.argv.indexOf("--output");
if(input>=0&&process.argv[input+1]) {
  const result=auditConjunctionAgeEventTimes(JSON.parse(fs.readFileSync(process.argv[input+1],"utf8")));
  if(output>=0&&process.argv[output+1]) fs.writeFileSync(process.argv[output+1],JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result.cities.map(city=>({city:city.city,summary:city.summary})),null,2));
}
