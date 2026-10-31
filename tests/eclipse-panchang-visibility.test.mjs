import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../eclipse-panchang.js", import.meta.url), "utf8");
const sandbox = { window: {}, console, Date, setTimeout, clearTimeout };
vm.runInNewContext(source, sandbox, { filename: "eclipse-panchang.js" });
const tools = sandbox.window.__OHDEclipsePanchangTools;
assert.ok(tools, "shared local eclipse visibility API must be exposed");

const d = value => new Date(value);

test("solar eclipse beginning before sunrise is visible as Grastodaya", () => {
  const result = tools.getLocalVisibility({
    type: "Surya Grahan",
    contact: {
      firstContact: d("2026-03-03T00:30:00Z"),
      lastContact: d("2026-03-03T02:00:00Z")
    }
  }, [
    { sunrise: d("2026-03-02T00:30:00Z"), sunset: d("2026-03-02T12:30:00Z") },
    { sunrise: d("2026-03-03T01:00:00Z"), sunset: d("2026-03-03T12:30:00Z") },
    { sunrise: d("2026-03-04T00:30:00Z"), sunset: d("2026-03-04T12:30:00Z") }
  ]);
  assert.equal(result.localVisible, true);
  assert.equal(result.grastodaya, true);
  assert.equal(result.grastasta, false);
  assert.equal(result.visibleStart.toISOString(), "2026-03-03T01:00:00.000Z");
  assert.equal(result.visibleEnd.toISOString(), "2026-03-03T02:00:00.000Z");
});

test("solar eclipse after local sunset is invisible at the selected location", () => {
  const result = tools.getLocalVisibility({
    type: "Surya Grahan",
    contact: {
      firstContact: d("2026-03-03T13:00:00Z"),
      lastContact: d("2026-03-03T15:00:00Z")
    }
  }, [
    { sunrise: d("2026-03-02T00:30:00Z"), sunset: d("2026-03-02T12:30:00Z") },
    { sunrise: d("2026-03-03T00:30:00Z"), sunset: d("2026-03-03T12:30:00Z") },
    { sunrise: d("2026-03-04T00:30:00Z"), sunset: d("2026-03-04T12:30:00Z") }
  ]);
  assert.equal(result.localVisible, false);
  assert.equal(result.localStatus, "अदृश्य");
  assert.equal(result.visibleDuration, 0);
});

test("lunar eclipse uses local moonrise and moonset rather than solar horizon", () => {
  const result = tools.getLocalVisibility({
    type: "Chandra Grahan",
    contact: {
      firstContact: d("2026-03-03T12:00:00Z"),
      lastContact: d("2026-03-03T15:00:00Z")
    }
  }, [
    { moonrise: d("2026-03-02T12:00:00Z"), moonset: d("2026-03-03T00:00:00Z") },
    { moonrise: d("2026-03-03T13:00:00Z"), moonset: d("2026-03-04T00:00:00Z") },
    { moonrise: d("2026-03-04T13:00:00Z"), moonset: d("2026-03-05T00:00:00Z") }
  ]);
  assert.equal(result.localVisible, true);
  assert.equal(result.grastodaya, true);
  assert.equal(result.visibleStart.toISOString(), "2026-03-03T13:00:00.000Z");
  assert.equal(result.visibleEnd.toISOString(), "2026-03-03T15:00:00.000Z");
});
