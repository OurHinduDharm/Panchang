import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("Panchang page declares a useful Hindi meta description", () => {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?\s*>/i);
  assert.ok(match, "Hindi meta description must be present");
  assert.ok(match[1].length >= 50 && match[1].length <= 170,
    "Meta description should remain concise");
  assert.match(match[1], /हिंदू पंचांग/);
});

test("Eruda is downloaded only when the debug query parameter is present", () => {
  assert.doesNotMatch(html, /<script[^>]+src=["'][^"']*eruda/i,
    "Eruda must not be loaded as a normal static script");
  assert.match(html,
    /if\s*\(\s*new URLSearchParams\(window\.location\.search\)\.has\(["']debug["']\)\s*\)[\s\S]*?erudaScript\.src\s*=\s*["']https:\/\/cdn\.jsdelivr\.net\/npm\/eruda["']/,
    "Eruda must be dynamically requested only inside the ?debug condition");
  assert.match(html, /erudaScript\.onload\s*=\s*\(\)\s*=>[\s\S]*?window\.eruda\.init\(\)/,
    "Eruda must initialize after its script has loaded");
});
