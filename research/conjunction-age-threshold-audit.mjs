/**
 * Research-only: test whether the time from the associated conjunction to a
 * Drik boundary explains per-city Sun-depression thresholds better than a
 * fixed median. City, planet, boundary and local rise/set branch are isolated.
 *
 * This never predicts/publishes an event timestamp or changes calibration.
 */
import fs from "node:fs";

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a,b)=>a-b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length/2);
  return sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
}

function conjunctionAgeDays(row) {
  const source = Date.parse(row.horizonEventInstant ?? row.sourceUtcInstant);
  const conjunction = Date.parse(row.conjunctionInstant);
  if (!Number.isFinite(source) || !Number.isFinite(conjunction)) return null;
  return (source-conjunction)/86_400_000;
}

function fitLinear(rows) {
  const points = rows.map(row=>({
    x: conjunctionAgeDays(row),
    y: row.sunDepressionDeg
  })).filter(point=>Number.isFinite(point.x)&&Number.isFinite(point.y));
  if (points.length<2) return {status:"insufficient-samples",sampleCount:points.length};
  const meanX=points.reduce((s,p)=>s+p.x,0)/points.length;
  const meanY=points.reduce((s,p)=>s+p.y,0)/points.length;
  let covariance=0,variance=0;
  for (const point of points) {
    covariance+=(point.x-meanX)*(point.y-meanY);
    variance+=(point.x-meanX)**2;
  }
  if (variance<1e-12) return {status:"degenerate-conjunction-age",sampleCount:points.length};
  const slope=covariance/variance;
  return {
    status:"fitted",
    sampleCount:points.length,
    interceptDeg:meanY-slope*meanX,
    slopeDegPerConjunctionDay:slope
  };
}

function mae(values) {
  return values.length ? values.reduce((s,v)=>s+v,0)/values.length : null;
}

function auditGroup(key, rows, trainingEndYear, minTrainingSamples) {
  const training=rows.filter(row=>row.sourceYear<=trainingEndYear);
  const holdout=rows.filter(row=>row.sourceYear>trainingEndYear);
  const loo=[];
  for (const target of training) {
    const rest=training.filter(row=>row.sourceYear!==target.sourceYear);
    const fit=fitLinear(rest);
    if (fit.status!=="fitted") continue;
    const age=conjunctionAgeDays(target);
    const predicted=fit.interceptDeg+fit.slopeDegPerConjunctionDay*age;
    const fixedMedian=median(rest.map(row=>row.sunDepressionDeg));
    loo.push({
      targetYear:target.sourceYear,
      sourceWindowId:target.sourceWindowId,
      conjunctionAgeDays:age,
      actualSunDepressionDeg:target.sunDepressionDeg,
      predictedSunDepressionDeg:predicted,
      absoluteErrorDeg:Math.abs(target.sunDepressionDeg-predicted),
      fixedMedianPredictionDeg:fixedMedian,
      fixedMedianAbsoluteErrorDeg:Math.abs(target.sunDepressionDeg-fixedMedian)
    });
  }
  const fit=fitLinear(training);
  const fixedMedian=median(training.map(row=>row.sunDepressionDeg));
  const predictions=holdout.map(target=>{
    const age=conjunctionAgeDays(target);
    const predicted=fit.status==="fitted" ? fit.interceptDeg+fit.slopeDegPerConjunctionDay*age : null;
    const enough=training.length>=minTrainingSamples && fit.status==="fitted";
    return {
      targetYear:target.sourceYear,
      sourceWindowId:target.sourceWindowId,
      conjunctionAgeDays:age,
      actualSunDepressionDeg:target.sunDepressionDeg,
      conjunctionAgePredictionDeg:enough?predicted:null,
      conjunctionAgeResidualDeg:enough?target.sunDepressionDeg-predicted:null,
      fixedMedianPredictionDeg:enough?fixedMedian:null,
      fixedMedianResidualDeg:enough?target.sunDepressionDeg-fixedMedian:null,
      status:enough?"diagnostic-only-no-event-time-prediction":"insufficient-training-review-only"
    };
  });
  return {
    group:key,
    trainingSampleCount:training.length,
    trainingYears:[...new Set(training.map(r=>r.sourceYear))].sort((a,b)=>a-b),
    holdoutSampleCount:holdout.length,
    fit,
    fixedMedianThresholdDeg:fixedMedian,
    leaveOneYearOut:{
      evaluatedSamples:loo.length,
      conjunctionAgeMaeDeg:mae(loo.map(r=>r.absoluteErrorDeg)),
      fixedMedianMaeDeg:mae(loo.map(r=>r.fixedMedianAbsoluteErrorDeg)),
      rows:loo
    },
    holdout:predictions
  };
}

export function auditConjunctionAgeThresholds(report,{
  trainingEndYear=2025,
  minTrainingSamples=4
}={}) {
  if (!report || !Array.isArray(report.cities)) {
    throw new TypeError("A multi-city planetary back-test report with cities[] is required");
  }
  const groups=new Map();
  for (const city of report.cities) {
    for (const row of city.sourceObservations??[]) {
      if (row.branchMatchesConjunction!==true ||
          !["Jupiter","Venus"].includes(row.planet) ||
          !["astaStart","astaEnd"].includes(row.boundary) ||
          !["rise","set"].includes(row.horizonEventType) ||
          !Number.isInteger(row.sourceYear) ||
          !Number.isFinite(row.sunDepressionDeg) ||
          conjunctionAgeDays(row)===null) continue;
      const key=[city.city,row.planet,row.boundary,row.horizonEventType].join(":");
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push({...row,city:city.city});
    }
  }
  const results=[...groups.entries()]
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([key,rows])=>auditGroup(key,rows,trainingEndYear,minTrainingSamples));
  const evaluable=results.filter(g=>g.holdout.some(r=>r.status==="diagnostic-only-no-event-time-prediction"));
  const looLinear=results.map(g=>g.leaveOneYearOut.conjunctionAgeMaeDeg).filter(Number.isFinite);
  const looMedian=results.map(g=>g.leaveOneYearOut.fixedMedianMaeDeg).filter(Number.isFinite);
  const holdout=evaluable.flatMap(g=>g.holdout.filter(r=>r.status==="diagnostic-only-no-event-time-prediction"));
  return Object.freeze({
    schemaVersion:1,
    model:"conjunction-age-conditioned-sun-depression-linear-diagnostic-v1",
    trainingPolicy:`Source years <= ${trainingEndYear}; leave-one-year-out excludes the entire target year.`,
    feature:"elapsed days from the associated planet-Sun conjunction to the captured source boundary",
    isolation:"separate city, planet, Asta boundary and actual local horizon rise/set branch; branch mismatches excluded",
    comparison:"linear conjunction-age fit versus fixed median Sun-depression threshold",
    summary:{
      evaluatedGroups:looLinear.length,
      groupsLinearBetterThanMedian:results.filter(g=>g.leaveOneYearOut.conjunctionAgeMaeDeg!==null&&g.leaveOneYearOut.conjunctionAgeMaeDeg<g.leaveOneYearOut.fixedMedianMaeDeg).length,
      groupsMedianBetterOrTied:results.filter(g=>g.leaveOneYearOut.conjunctionAgeMaeDeg!==null&&g.leaveOneYearOut.conjunctionAgeMaeDeg>=g.leaveOneYearOut.fixedMedianMaeDeg).length,
      meanGroupLooMaeLinearDeg:mae(looLinear),
      meanGroupLooMaeMedianDeg:mae(looMedian),
      holdoutBoundaries:holdout.length,
      holdoutLinearWins:holdout.filter(r=>Math.abs(r.conjunctionAgeResidualDeg)<Math.abs(r.fixedMedianResidualDeg)).length,
      holdoutMedianWinsOrTies:holdout.filter(r=>Math.abs(r.conjunctionAgeResidualDeg)>=Math.abs(r.fixedMedianResidualDeg)).length,
      holdoutMaeLinearDeg:mae(holdout.map(r=>Math.abs(r.conjunctionAgeResidualDeg))),
      holdoutMaeMedianDeg:mae(holdout.map(r=>Math.abs(r.fixedMedianResidualDeg)))
    },
    groups:results,
    publicationEligible:false,
    interpretation:"Small-sample diagnostic only. It predicts a Sun-depression threshold, not an Asta/Udaya timestamp. Aggregate multi-city holdout performance must govern; a promising single branch cannot be generalized or published."
  });
}

const inputIndex=process.argv.indexOf("--input");
const outputIndex=process.argv.indexOf("--output");
if (inputIndex>=0&&process.argv[inputIndex+1]) {
  const result=auditConjunctionAgeThresholds(JSON.parse(fs.readFileSync(process.argv[inputIndex+1],"utf8")));
  if (outputIndex>=0&&process.argv[outputIndex+1]) {
    fs.writeFileSync(process.argv[outputIndex+1],JSON.stringify(result,null,2)+"\n");
  }
  console.log(JSON.stringify(result.summary,null,2));
}
