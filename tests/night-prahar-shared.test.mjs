import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getNightPraharWindows } from "../night-prahar.js";

test("shared night Prahar module divides local sunset-to-sunrise into four exact equal windows", () => {
  const start = new Date("2026-06-13T18:00:00+05:30");
  const end = new Date("2026-06-14T06:00:00+05:30");
  const windows = getNightPraharWindows(start, end);
  assert.equal(windows.length, 4);
  assert.deepEqual(windows.map(item => [item.start.toISOString(), item.end.toISOString()]), [
    ["2026-06-13T12:30:00.000Z", "2026-06-13T15:30:00.000Z"],
    ["2026-06-13T15:30:00.000Z", "2026-06-13T18:30:00.000Z"],
    ["2026-06-13T18:30:00.000Z", "2026-06-13T21:30:00.000Z"],
    ["2026-06-13T21:30:00.000Z", "2026-06-14T00:30:00.000Z"]
  ]);
  assert.ok(windows.every(item => item.type === "night" && item.isActive === false));
});

test("shared night Prahar module marks only the active segment when requested", () => {
  const windows = getNightPraharWindows(
    "2026-06-13T18:00:00+05:30",
    "2026-06-14T06:00:00+05:30",
    "2026-06-14T02:00:00+05:30",
    true
  );
  assert.deepEqual(windows.map(item => item.isActive), [false,false,false,true]);
});

test("shared night Prahar module rejects invalid or reversed intervals", () => {
  assert.deepEqual(getNightPraharWindows(null, "2026-06-14T06:00:00+05:30"), []);
  assert.deepEqual(getNightPraharWindows("2026-06-14T06:00:00+05:30", "2026-06-13T18:00:00+05:30"), []);
});

test("main Panchang and festival muhurta engine both consume the shared Prahar module", () => {
  const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const festival = readFileSync(new URL("../festival-muhurta.js", import.meta.url), "utf8");
  assert.match(app, /import \{ getNightPraharWindows \} from "\.\/night-prahar\.js"/);
  assert.match(app, /getNightPraharWindows\(\s*nightStart,\s*nightEnd,\s*now,\s*shouldHighlight\s*\)/);
  assert.match(festival, /import \{ getNightPraharWindows \} from "\.\/night-prahar\.js"/);
  assert.ok((festival.match(/getNightPraharWindows\(/g) || []).length >= 2);
});
