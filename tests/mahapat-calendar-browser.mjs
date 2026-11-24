import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";

// Route the regular page entry points to the checkout and pinned npm engines.
// This isolates rendering from CDN availability. The injected approval exists
// in one browser context only. The second context uses the real empty register.
const root = resolve(".");
const origin = "https://calendar.test";
const panchang = await build({
  stdin: { contents: 'export { getPanchangam } from "@ishubhamx/panchangam-js/dist/core/panchangam.js"; export { Observer } from "astronomy-engine";', resolveDir: root },
  bundle: true, write: false, platform: "browser", format: "esm"
});
const approvalPath = "/special-punya-kaal-public-approval.mjs";
const reviewWindow = { status: "approved", type: "vaidhriti-mahapat", ruleProfile: "drik-geocentric-apparent-disks",
  start: "2026-03-18T22:17:04.035Z", end: "2026-03-19T01:55:18.200Z" };
const mime = { ".mjs": "text/javascript", ".js": "text/javascript", ".html": "text/html", ".json": "application/json", ".css": "text/css" };
const browser = await chromium.launch();
try {
  for (const staged of [true, false]) {
    const context = await browser.newContext({ viewport: {width: 390, height: 844}, timezoneId: "Asia/Kolkata" });
    await context.route("**/*", async route => {
      const url = new URL(route.request().url());
      let pathname = url.pathname;
      const headers = { "Access-Control-Allow-Origin": "*" };
      if (url.origin === "https://esm.sh" && pathname === "/@ishubhamx/panchangam-js@3.0.0") {
        return route.fulfill({ headers, contentType: "text/javascript", body: panchang.outputFiles[0].text });
      }
      if (url.origin === "https://esm.sh" && pathname === "/astronomy-engine@2.1.19") {
        pathname = "/node_modules/astronomy-engine/esm/astronomy.js";
      } else if (url.origin === "https://ourhindudharm.github.io" && pathname.startsWith("/Panchang/")) {
        pathname = pathname.slice("/Panchang".length);
      } else if (url.origin !== origin) return route.abort();
      const file = resolve(root, "." + pathname);
      if (!file.startsWith(root + sep)) return route.abort();
      let body;
      try { body = await readFile(file); }
      catch { return route.fulfill({ status: 404 }); }
      if (staged && pathname === approvalPath) {
        const source = body.toString();
        const declaration = "const reviewedMahapata = Object.freeze([]);";
        assert.ok(source.includes(declaration));
        body = source.replace(declaration, "const reviewedMahapata = [" + JSON.stringify(reviewWindow) + "];");
      }
      await route.fulfill({ headers, contentType: mime[extname(file)] ?? "application/octet-stream", body });
    });
    const page = await context.newPage();
    await page.goto(origin + "/monthly-vrat-parv.html?year=2026&month=03#special-punya-kaal");
    await page.locator("#special-punya-kaal").waitFor({ state: "visible" });
    const monthly = await page.locator("#specialPunyaKaalContent").innerText();
    assert.match(monthly, /वारुणी/);
    assert.equal(monthly.includes("वैधृति महापात"), staged);
    if (staged) assert.match(monthly, /स्पर्श [^\n]+मोक्ष /);
    await page.goto(origin + "/index.html?date=2026-03-19");
    await page.locator(".special-punya-kaal-sentinel").last().scrollIntoViewIfNeeded();
    const daily = await page.locator(".special-punya-kaal-card").innerText();
    assert.equal(daily.includes("वैधृति महापात"), staged);
    if (staged) assert.match(daily, /स्पर्श [^\n]+मोक्ष /);
    await context.close();
  }
} finally {
  await browser.close();
}
