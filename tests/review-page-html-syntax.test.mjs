import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const pages = ["monthly-vrat-parv.html", "festival-year-review.html", "festival-review.html"];

test("inline JavaScript in festival pages parses without syntax errors", () => {
  const temp = mkdtempSync(join(tmpdir(), "ohd-review-page-check-"));
  try {
    for (const page of pages) {
      const html = readFileSync(resolve(page), "utf8");
      const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
      assert.ok(scripts.length, page + " should contain an inline script");
      scripts.forEach((match, index) => {
        const path = join(temp, page.replace(/[^a-z0-9]/gi, "_") + "-" + index + ".mjs");
        writeFileSync(path, match[1], "utf8");
        const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
        assert.equal(result.status, 0, page + " inline script " + index + " syntax error: " + result.stderr);
      });
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
