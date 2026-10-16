const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ghatasthapanaCandidates,
  moonlightKheerWindow,
  paranaWindow,
  selectPujaWindows
} = require("../festival-muhurta-rules");

const at = (hour, minute = 0, day = "2026-10-11") =>
  new Date(`${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`);

test("Ghatasthapana primary interval is limited to first third of local day and Pratipada", () => {
  const result = ghatasthapanaCandidates({
    sunrise: at(6), sunset: at(18),
    pratipada: { start: at(5), end: at(12) },
    abhijit: { start: at(11, 40), end: at(12, 25) }
  });
  assert.equal(result.status, "candidate");
  assert.equal(result.primary.start.toISOString(), at(6).toISOString());
  assert.equal(result.primary.end.toISOString(), at(10).toISOString());
});

test("Ghatasthapana uses Abhijit only as fallback when primary window is absent", () => {
  const result = ghatasthapanaCandidates({
    sunrise: at(6), sunset: at(18),
    pratipada: { start: at(10, 30), end: at(13) },
    abhijit: { start: at(11, 40), end: at(12, 25) }
  });
  assert.equal(result.status, "fallback-candidate");
  assert.equal(result.primary, null);
  assert.equal(result.fallback.start.toISOString(), at(11, 40).toISOString());
});

test("Ghatasthapana never invents a time when local tithi data is missing", () => {
  const result = ghatasthapanaCandidates({ sunrise: at(6), sunset: at(18) });
  assert.equal(result.status, "calculation-unavailable");
  assert.equal(result.primary, null);
});

test("Sharad Purnima kheer window intersects moonrise-to-moonset with Purnima", () => {
  const result = moonlightKheerWindow({
    moonrise: at(17, 5, "2026-10-25"),
    moonset: at(5, 20, "2026-10-26"),
    purnima: { start: at(11, 55, "2026-10-25"), end: at(9, 40, "2026-10-26") }
  });
  assert.equal(result.status, "candidate");
  assert.equal(result.window.start.toISOString(), at(17, 5, "2026-10-25").toISOString());
  assert.equal(result.window.end.toISOString(), at(5, 20, "2026-10-26").toISOString());
});

test("Ekadashi parana requires Dvadashi, sunrise and can be constrained by tradition rule", () => {
  const result = paranaWindow({
    sunrise: at(6, 20, "2026-11-06"),
    dvadashi: { start: at(6, 20, "2026-11-06"), end: at(11, 30, "2026-11-06") },
    paranaRule: { start: at(6, 26, "2026-11-06"), end: at(10, 4, "2026-11-06") }
  });
  assert.equal(result.status, "candidate");
  assert.equal(result.window.start.toISOString(), at(6, 26, "2026-11-06").toISOString());
  assert.equal(result.window.end.toISOString(), at(10, 4, "2026-11-06").toISOString());
});

test("Dhanteras and Diwali puja windows are intersections, not stale copied times", () => {
  const result = selectPujaWindows({
    tithi: { start: at(11, 27, "2026-11-08"), end: at(12, 31, "2026-11-09") },
    pradosh: { start: at(17, 18, "2026-11-08"), end: at(19, 56, "2026-11-08") },
    vrishabha: { start: at(17, 40, "2026-11-08"), end: at(19, 35, "2026-11-08") },
    nishita: null,
    tradition: "local"
  });
  assert.equal(result.status, "candidate");
  assert.equal(result.pradosh.start.toISOString(), at(17, 18, "2026-11-08").toISOString());
  assert.equal(result.vrishabha.end.toISOString(), at(19, 35, "2026-11-08").toISOString());
  assert.equal(result.nishita, null);
});


test("Ekadashi parana default waits until both local sunrise and first quarter of Dvadashi have passed", () => {
  const dvadashi = { start: at(4, 0, "2026-11-06"), end: at(12, 0, "2026-11-06") };
  const result = paranaWindow({ sunrise: at(6, 0, "2026-11-06"), dvadashi });
  assert.equal(result.status, "candidate");
  assert.equal(result.hariVasaraEnd.toISOString(), at(6, 0, "2026-11-06").toISOString());
  assert.equal(result.window.start.toISOString(), at(6, 0, "2026-11-06").toISOString());
  assert.equal(result.window.end.toISOString(), at(12, 0, "2026-11-06").toISOString());
});

test("Ekadashi parana default waits for Hari-vasara when its first quarter ends after sunrise", () => {
  const result = paranaWindow({
    sunrise: at(6, 0, "2026-11-06"),
    dvadashi: { start: at(5, 0, "2026-11-06"), end: at(13, 0, "2026-11-06") }
  });
  assert.equal(result.status, "candidate");
  assert.equal(result.window.start.toISOString(), at(7, 0, "2026-11-06").toISOString());
});
