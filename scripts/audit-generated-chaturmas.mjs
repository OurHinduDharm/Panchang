// Compare fresh year-independent engine outputs to the existing accepted
// Chaturmas data; never rewrite the public calendar or approve future years.
import {readFile} from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const directory=process.argv[2]||"artifacts/dwadashi-review";
const read=async file=>JSON.parse(await readFile(file,"utf8"));
const fields=c=>({startDate:c.startDate,endDate:c.endDate,completionDate:c.completionDate,cardVisibleThroughDate:c.cardVisibleThroughDate,phases:c.phases.map(p=>[p.id,p.startDate,p.endDate])});
const mismatches=[];
for(const year of [2026,2027,2028,2029,2030,2031]){
 const draft=await read(path.join(directory,"ohd-dwadashi-"+year+"-review.json"));
 const actual=draft.chaturmas;
 assert.notEqual(actual.status,"approved");
 if(year===2031){console.log(JSON.stringify({year,status:actual.status,...fields(actual),missing:actual.missingBoundaries}));continue;}
 const expected=await read("data/chaturmas/"+year+".json");
 const a=fields(actual),e=fields(expected);
 const equal=JSON.stringify(a)===JSON.stringify(e);
 console.log(JSON.stringify({year,match:equal,actual:a,expected:e,missing:actual.missingBoundaries}));
 if(!equal)mismatches.push(year);
}
assert.deepEqual(mismatches,[],"Historical Chaturmas discrepancies require review; do not approve automatic publication");
