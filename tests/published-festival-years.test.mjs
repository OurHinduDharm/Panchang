import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {publishedYearNavigation as nav,createPublishedYearNavigation,syncPublishedYearOptions} from "../festival-public-years.mjs";
import {discoverPublishedYears,isPublishedMonth} from "../scripts/update-published-festival-years.mjs";

test("real published index agrees with all complete approved monthly catalogues",async()=>{
  assert.deepEqual(nav.years,await discoverPublishedYears(new URL("../data/festivals/",import.meta.url).pathname));
  assert.ok(nav.has(2030));
  assert.equal(nav.has(2031),false);
  assert.equal(nav.shift(2030,12,1),null);
  assert.equal(nav.shift(2026,1,-1),null);
  assert.deepEqual(nav.shift(2029,12,1),{year:2030,month:1});
  assert.deepEqual(nav.initial(2033,6),{year:2030,month:12});
});
test("new approved years and gaps work without HTML edits",()=>{
  const next=createPublishedYearNavigation([2026,2027,2028,2029,2030,2031,2033]);
  assert.deepEqual(next.shift(2030,12,1),{year:2031,month:1});
  assert.equal(next.shift(2031,12,1),null);
  assert.equal(next.shift(2033,1,-1),null);
  assert.deepEqual(next.initial(2032,3),{year:2031,month:12});
  const select={value:"2031",ownerDocument:{createElement(){return {}; }},replaceChildren(...options){this.options=options;this.value=options[0].value;}};
  syncPublishedYearOptions(select,next);
  assert.deepEqual(select.options.map(x=>x.value),next.years.map(String));
  assert.equal(select.value,"2031");
  syncPublishedYearOptions(select,nav);
  assert.ok(!select.options.some(x=>x.value==="2031"));
});
test("discovery excludes incomplete, unapproved, and invalid-month years",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"ohd-published-years-"));
  const month=(y,m)=>({year:y,month:m,status:"approved",events:[{date:y+"-"+String(m).padStart(2,"0")+"-01",title:"पर्व",description:"पूजन",reviewStatus:"approved"}]});
  try{
    for(const y of [2031,2032,2033,2034])for(let m=1;m<=12;m++){
      if(y===2032&&m===12)continue;
      const data=month(y,m);
      if(y===2033&&m===6)data.events[0].reviewStatus="needs-review";
      if(y===2034&&m===9)data.events[0].date="2034-09-31";
      await writeFile(join(dir,y+"-"+String(m).padStart(2,"0")+".json"),JSON.stringify(data));
    }
    assert.deepEqual(await discoverPublishedYears(dir),[2031]);
    assert.equal(isPublishedMonth({...month(2031,1),events:[]},2031,1),false);
  }finally{await rm(dir,{recursive:true,force:true});}
});
