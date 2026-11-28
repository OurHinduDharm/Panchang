// Read-only tracked-file inventory. A missing literal reference is not proof
// of dead code: dynamic imports, globs and external Blogger/CDN URLs exist.
import {execFileSync} from "node:child_process";
import {readFileSync,statSync} from "node:fs";
import {basename} from "node:path";
import {createHash} from "node:crypto";
const files=execFileSync("git",["ls-files","-z"],{encoding:"utf8"}).split("\0").filter(Boolean);
const text=new Map(),hashes=new Map();
for(const path of files){
 const b=readFileSync(path),hash=createHash("sha256").update(b).digest("hex");
 if(!hashes.has(hash))hashes.set(hash,[]);
 hashes.get(hash).push(path);
 if(/\.(?:m?js|cjs|html|css|json|md|ya?ml|txt|py|sh)$/i.test(path))text.set(path,b.toString("utf8"));
}
const candidates=[
 "ASTA-UDAYA-PHASE-DIAGNOSTICS.md",
 "data/references/ohd-annual-panchang-review-2026.json",
 "test-pr.html","test-astronomy.html","asta-udaya-calculator.html",
 "monthly-vrat-parv-widget-safe-v2.js","planetary-asta-udaya-page.mjs",
 "data/festivals/legacy-source-preserved.json","data/festivalData-source.txt"
];
const refs=(needle,excluded)=>[...text].filter(([p,s])=>p!==excluded&&p!=="scripts/audit-repository-layout.mjs"&&!p.startsWith("archive/")&&s.includes(needle)).map(([p])=>p);
for(const path of candidates){
 const present=files.includes(path);
 const exact=refs(path,path),name=refs(basename(path),path);
 console.log(JSON.stringify({path,present,exactPathReferences:exact,basenameReferences:name}));
}
const oldPath="data/references/ohd-annual-panchang-review-2026.json";
const activeRefs=refs(oldPath,oldPath).filter(p=>!p.endsWith(".md"));
const dynamicRefs=refs("references/ohd-annual-panchang",oldPath).filter(p=>!p.endsWith(".md"));
if(activeRefs.length||dynamicRefs.length)throw Error("Archived annual source path still referenced: "+JSON.stringify([...new Set([...activeRefs,...dynamicRefs])]));
const required=["archive/worklogs/ASTA-UDAYA-PHASE-DIAGNOSTICS.md","data/ohd-annual-panchang-review-2026.json"];
for(const p of required)if(!files.includes(p))throw Error("Required preserved file missing: "+p);
const retired=["asta-udaya-calculator.html","test-astronomy.html","data/asta-udaya-all-chunks.json","data/asta-udaya-manifest.json","tests/validate-asta-udaya-dataset.mjs","tests/measure-asta-udaya-interpolation.mjs","tests/asta-udaya-boundary-audit-export.test.mjs","archive/data/ohd-annual-panchang-review-2026.json"];
for(const path of retired){
 if(files.includes(path))throw Error("Retired file unexpectedly restored: "+path);
 const dependencies=refs(basename(path),path).filter(p=>!p.endsWith(".md")&&p!=="data/asta-udaya-benchmark.json"&&!(path.startsWith("archive/data/")&&basename(p)===basename(path))&&!(path.startsWith("archive/data/")));
 if(dependencies.length)throw Error("Retired tool dependency: "+path+" "+JSON.stringify(dependencies));
}
const duplicates=[...hashes.values()].filter(a=>a.length>1);
console.log(JSON.stringify({trackedFiles:files.length,workflowFiles:files.filter(p=>p.startsWith(".github/workflows/")).length,exactDuplicates:duplicates,largest:files.map(path=>({path,bytes:statSync(path).size})).sort((a,b)=>b.bytes-a.bytes).slice(0,15)}));
