import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("monthly page does not repeat a window label already used as its muhurta heading", async () => {
  const source = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
  assert.match(
    source,
    /if\(!muhurtaModule\.areFestivalMuhurtaLabelsEquivalent\(result\.label,windowItem\.label\)\)\s*\{\s*var name=document\.createElement\("strong"\)/
  );
});

test("the standalone monthly widget uses the same duplicate-label guard", async () => {
  const source = await readFile(new URL("../monthly-vrat-parv-widget.js", import.meta.url), "utf8");
  assert.match(
    source,
    /if\(!muhurtaModule\.areFestivalMuhurtaLabelsEquivalent\(result\.label,windowItem\.label\)\)/
  );
});
