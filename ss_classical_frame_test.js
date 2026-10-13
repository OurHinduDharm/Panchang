import { runClassicalFrameTransformTests } from "./ss_classical_frame.js";

const result = runClassicalFrameTransformTests();
for (const test of result.tests) {
  console.log(`${test.passed ? "PASS" : "FAIL"} — ${test.name}`);
}
console.log(`${result.passed}/${result.total} classical-frame transform tests passed`);
console.log(result.note);
if (!result.allPassed) process.exit(1);

import { runChapter3MeridianFrameTests } from './ss_chapter3_meridian_frame.js';
const meridianResult = runChapter3MeridianFrameTests();
for (const test of meridianResult.tests) console.log((test.passed ? 'PASS' : 'FAIL') + ' — ' + test.name);
console.log(meridianResult.passed + '/' + meridianResult.total + ' Chapter III.49 meridian comparison tests passed');
if (!meridianResult.allPassed) process.exitCode = 1;

import { runChapter3NataGeometryTests } from './ss_chapter3_nata_geometry.js';
const nataGeometryResult = runChapter3NataGeometryTests();
for (const test of nataGeometryResult.tests) {
  console.log((test.passed ? 'PASS' : 'FAIL') + ' — ' + test.name);
  if (test.error) console.log('  ' + test.error);
}
console.log(nataGeometryResult.passed + '/' + nataGeometryResult.total + ' Chapter III.37–39 geometry-control tests passed');
if (!nataGeometryResult.allPassed) process.exitCode = 1;

import { runChapter3NataTableArithmeticTests } from './ss_chapter3_nata_table_arithmetic.js';
const nataTableArithmeticResult = runChapter3NataTableArithmeticTests();
for (const test of nataTableArithmeticResult.tests) {
  console.log((test.passed ? 'PASS' : 'FAIL') + ' — ' + test.name);
  if (test.error) console.log('  ' + test.error);
}
console.log(nataTableArithmeticResult.passed + '/' + nataTableArithmeticResult.total + ' Chapter III source-transcription arithmetic tests passed');
if (!nataTableArithmeticResult.allPassed) process.exitCode = 1;
