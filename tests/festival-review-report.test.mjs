import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve("scripts/build-festival-review-report.mjs");

test("report defaults to review and leaves source JSON unchanged", () => {
  const dir = mkdtempSync(join(tmpdir(), "festival-review-"));
  try {
    const input = join(dir, "input"); mkdirSync(input);
    const path = join(input, "2026-10.json");
    const original = JSON.stringify({year:2026,month:10,events:[{
      date:"2026-10-03",title:"मासिक कालाष्टमी",description:"test",category:"व्रत",reviewStatus:"approved"
    }]}, null, 2);
    writeFileSync(path, original);
    const run = spawnSync(process.execPath, [script, input], {encoding:"utf8"});
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(run.stdout);
    assert.equal(report.totalEvents, 1);
    assert.equal(report.events[0].proposedStatus, "needs-review");
    assert.ok(report.events[0].reasons.includes("panchang-calculation-not-completed"));
    assert.equal(readFileSync(path, "utf8"), original);
  } finally { rmSync(dir, {recursive:true,force:true}); }
});

test("complete explicit evidence may pass a reviewed routine rule", () => {
  const dir = mkdtempSync(join(tmpdir(), "festival-review-"));
  try {
    const input = join(dir, "input"); mkdirSync(input);
    writeFileSync(join(input, "2026-10.json"), JSON.stringify({year:2026,month:10,events:[{
      date:"2026-10-03",title:"मासिक कालाष्टमी",description:"test",category:"व्रत"
    }]}));
    const evidence = join(dir, "evidence.json");
    writeFileSync(evidence, JSON.stringify({"2026-10-03|मासिक कालाष्टमी":{
      calculationCompleted:true,calculationTestsPassed:true,expectedTithi:"कृष्ण अष्टमी",
      computedTithi:"कृष्ण अष्टमी",computedDate:"2026-10-03",conflict:false,
      exceptionDetected:false,independentCheckPassed:true,
      ruleProfile:{reviewMode:"routine",ruleId:"sample-reviewed-rule",ruleVersion:"1"}
    }}));
    const run = spawnSync(process.execPath,[script,input,"--evidence",evidence],{encoding:"utf8"});
    assert.equal(run.status,0,run.stderr);
    assert.equal(JSON.parse(run.stdout).events[0].proposedStatus,"auto-approved");
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
