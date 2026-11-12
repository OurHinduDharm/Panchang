import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const renderers = [
  "monthly-vrat-parv-widget.js",
  "monthly-vrat-parv.html"
];

test("public monthly renderers hide unavailable and internal muhurta statuses", () => {
  for (const file of renderers) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    assert.match(
      source,
      /if\(!result\s*\|\|\s*\(result\.status!==["']calculated["']\s*&&\s*result\.status!==["']reference["']\)\)\s*return;/,
      file + " must render only calculated or reference results"
    );
    assert.match(
      source,
      /result\.status===["']reference["']&&result\.time/,
      file + " must display a reference time distinctly"
    );
    assert.doesNotMatch(
      source,
      /detail\.textContent\s*=\s*result\.message/,
      file + " must not expose internal calculation diagnostics"
    );
    assert.doesNotMatch(
      source,
      /इस समय की गणना उपलब्ध नहीं है|मुहूर्त उपलब्ध नहीं है/,
      file + " must not show generic unavailable messages"
    );
  }
});


test("monthly renderers independently infer Kalashtami Pradosh and Janmashtami Nishita", () => {
  for (const file of renderers) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    assert.ok(source.includes("कालाष्टमी|कालभैरव") &&
      source.includes('ruleIds.push("kalashtami-pradosh")'),
      file + " must attach the independent Kalashtami Pradosh rule");
    assert.ok(source.includes("कृष्ण जन्माष्टमी") &&
      source.includes('ruleIds.push("janmashtami-nishita")'),
      file + " must preserve the separate Janmashtami Nishita rule");
  }
});
