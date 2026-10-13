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
console.log(meridianResult.passed + '/' + meridianResult.total + ' Chapter III.49 meridian comparison tests passed');
