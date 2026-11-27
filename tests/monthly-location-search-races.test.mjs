import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
const place=(name,lat="29",lon="80")=>({name,lat,lon,address:{city:name}});
const response=rows=>({ok:true,json:async()=>rows});

function harness(filename,fetch,getTerrainElevation=async()=>42){
  const source=readFileSync(new URL("../"+filename,import.meta.url),"utf8");
  const start=source.indexOf("  var locationSearchGeneration=0;");
  const end=source.indexOf("  async function getDatePanchang(",start);
  assert.ok(start>=0&&end>start);
  const input={value:""},status={},searchButton={};
  const suggestions={children:[],replaceChildren(){this.children=[]},appendChild(button){this.children.push(button)}};
  const document={createElement(){return {setAttribute(){},addEventListener(name,fn){this.click=fn}}}};
  let selectedLocationInSession=null;
  const loads=[];
  const getSelection=new Function("locationInput","locationStatus","locationSearchBtn","locationSuggestions","document","fetch","getTerrainElevation","tzLookup","isValidTimeZone","panchangCache","observerCache","locationEclipseCache","syncLocationUI","loads","console",
    "var selectedLocationInSession=null;function loadMonth(){loads.push(selectedLocationInSession)}\n"+source.slice(start,end)+"\nreturn {searchLocation,parseSearchCoordinate,get selected(){return selectedLocationInSession}};")(
      input,status,searchButton,suggestions,document,fetch,getTerrainElevation,()=>"Asia/Kolkata",()=>true,new Map(),new Map(),new Map(),()=>{},loads,{warn(){}});
  return {input,status,searchButton,suggestions,loads,...getSelection};
}

for(const filename of ["monthly-vrat-parv-widget.js","monthly-vrat-parv.html"]){
  test(filename+" ignores an older search response that completes last",async()=>{
    const first=deferred(),second=deferred();let calls=0;
    const h=harness(filename,()=>++calls===1?first.promise:second.promise);
    h.input.value="Almora";const a=h.searchLocation();
    h.input.value="Delhi";const b=h.searchLocation();
    second.resolve(response([place("Delhi")]));await b;
    first.resolve(response([place("Almora")]));await a;
    assert.deepEqual(h.suggestions.children.map(x=>x.textContent),["Delhi"]);
    await h.suggestions.children[0].click();
    assert.deepEqual(h.loads.map(x=>x.city),["Delhi"]);
  });

  test(filename+" rejects missing and out-of-range coordinates, but accepts zero",async()=>{
    const h=harness(filename,async()=>response([place("Invalid",null,"80"),place("Outside","91","80"),place("Zero","0","0")]));
    h.input.value="city";await h.searchLocation();
    const [invalid,outside,zero]=h.suggestions.children;
    await invalid.click();await outside.click();
    assert.equal(h.loads.length,0);
    await zero.click();
    assert.deepEqual([h.loads[0].lat,h.loads[0].lon],[0,0]);
    assert.ok(Number.isNaN(h.parseSearchCoordinate("",90)));
    assert.ok(Number.isNaN(h.parseSearchCoordinate(false,90)));
  });
}

test("standalone ignores older elevation request after a newer city is selected",async()=>{
  const first=deferred(),second=deferred();let calls=0;
  const h=harness("monthly-vrat-parv.html",async()=>response([place("A"),place("B")]),()=>++calls===1?first.promise:second.promise);
  h.input.value="city";await h.searchLocation();
  const [a,b]=h.suggestions.children;
  const pa=a.click(),pb=b.click();
  second.resolve(100);await pb;
  first.resolve(200);await pa;
  assert.deepEqual(h.loads.map(x=>[x.city,x.elevation]),[["B",100]]);
});

test("standalone elevation parser distinguishes missing from real sea level",async()=>{
  const source=readFileSync(new URL("../monthly-vrat-parv.html",import.meta.url),"utf8");
  const start=source.indexOf("  async function getTerrainElevation(");
  const end=source.indexOf("  var locationSearchGeneration=0;",start);
  const parse=new Function("fetch",source.slice(start,end)+"\nreturn getTerrainElevation;");
  for(const raw of [null,"",false,undefined]){
    await assert.rejects(parse(async()=>response({elevation:[raw]}))(1,2),/Elevation data unavailable/);
  }
  assert.equal(await parse(async()=>response({elevation:[0]}))(1,2),0);
});
