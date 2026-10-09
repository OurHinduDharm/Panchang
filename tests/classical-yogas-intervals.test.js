// Companion integration comparison lives in classical-yogas-real-panchang-comparison.test.js.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("classical-yogas.js", "utf8");
const sandbox = {
  window: {},
  console: { info() {}, warn() {}, error() {} },
  Date,
  Array,
  Number,
  Math,
  Object,
  String
};

// Expose only the private helper to this isolated test context.
vm.runInNewContext(
  source + "\nwindow.__testNormalize = ohdNormalizeTransitionIntervals;",
  sandbox,
  { filename: "classical-yogas.js" }
);

const normalize = sandbox.window.__testNormalize;
const base = Date.parse("2026-10-09T15:00:00.000Z");

function interval(start, end, index) {
  return {
    index,
    startTime: new Date(start),
    endTime: new Date(end)
  };
}

test("closes an exact 60-second gap in the copied interval", () => {
  const input = [
    interval(base, base + 1000, 0),
    interval(base + 61000, base + 90000, 1)
  ];

  const result = normalize(input);

  assert.equal(result[1].startTime.getTime(), base + 1000);
  assert.equal(result[1].endTime.getTime(), base + 90000);
  assert.equal(input[1].startTime.getTime(), base + 61000);
});

test("does not mutate the original array or interval objects", () => {
  const first = interval(base, base + 1000, 0);
  const second = interval(base + 61000, base + 90000, 1);
  const input = [first, second];

  const result = normalize(input);

  assert.notStrictEqual(result, input);
  assert.notStrictEqual(result[0], first);
  assert.notStrictEqual(result[1], second);
  assert.equal(first.endTime.getTime(), base + 1000);
  assert.equal(second.startTime.getTime(), base + 61000);
});

test("preserves all interval end times and indexes", () => {
  const input = [
    interval(base, base + 1000, 5),
    interval(base + 61000, base + 90000, 6)
  ];

  const result = normalize(input);

  assert.deepEqual(result.map(x => x.index), [5, 6]);
  assert.deepEqual(
    result.map(x => x.endTime.getTime()),
    input.map(x => x.endTime.getTime())
  );
});

test("does not alter gaps other than exactly 60,000 ms", () => {
  for (const gap of [59999, 60001, 120000]) {
    const input = [
      interval(base, base + 1000, 0),
      interval(base + 1000 + gap, base + 90000 + gap, 1)
    ];

    const result = normalize(input);
    assert.equal(
      result[1].startTime.getTime(),
      input[1].startTime.getTime(),
      `gap ${gap} ms must remain unchanged`
    );
  }
});

test("leaves contiguous and overlapping intervals unchanged", () => {
  for (const start of [base + 1000, base + 500]) {
    const input = [
      interval(base, base + 1000, 0),
      interval(start, base + 90000, 1)
    ];

    const result = normalize(input);
    assert.equal(result[1].startTime.getTime(), start);
  }
});

test("supports start/end property names and handles non-arrays", () => {
  const input = [
    { index: 0, start: new Date(base), end: new Date(base + 1000) },
    { index: 1, start: new Date(base + 61000), end: new Date(base + 90000) }
  ];

  const result = normalize(input);

  assert.equal(result[1].start.getTime(), base + 1000);
  assert.equal(result[1].end.getTime(), base + 90000);
  assert.equal(normalize(null).length, 0);
});

test("special yoga calculation is owned by Extra Panchang, not app.js", () => {
  const appSource = fs.readFileSync("app.js", "utf8");
  const extraSource = fs.readFileSync("extra-panchang.js", "utf8");

  assert.doesNotMatch(
    appSource,
    /getSpecialYogaDetails|getSunNakshatraTransition|getRaviYogaDistance|विशेष शुभ योग/,
    "legacy special-yoga calculation/rendering must stay out of app.js"
  );
  assert.match(extraSource, /import\s+["']\.\/classical-yogas\.js["']/,
    "Extra Panchang must load the engine itself so the Blogger page works without a separate script tag");
  assert.match(extraSource, /engine\.getClassicalYogas/);
  assert.match(extraSource, /engine\.buildSunNakshatraSegments/);
  assert.match(extraSource, /classicalYogasCard/);
});
