import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../monthly-vrat-parv-widget.js", import.meta.url), "utf8");

test("Saraswati event date guard accepts ISO dates and rejects escaped-pattern regression", () => {
  const isoDatePattern = String.raw`^\d{4}-\d{2}-\d{2}$`;
  const dateRegex = new RegExp(isoDatePattern);
  assert.equal(dateRegex.test("2026-10-19"), true);
  assert.equal(dateRegex.test("not-a-date"), false);
  assert.ok(
    source.includes(String.raw`!/^\d{4}-\d{2}-\d{2}$/.test(String(startEvent.date||""))`),
    "Saraswati date validation must use digit classes, not a literal backslash-d sequence"
  );
  assert.ok(
    source.includes(String.raw`/^\d{4}-\d{2}-\d{2}$/.test(String(startEvent.endDate||""))`),
    "Saraswati end-date validation must use the same ISO-date pattern"
  );
});
