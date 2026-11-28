import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";

// Route the regular page entry points to the checkout and pinned npm engines.
// This isolates rendering from CDN availability. The injected approval exists
// in one browser context only. The second context explicitly injects an empty register. The third uses the actual release data.
const root = resolve(".");
const origin = "https://calendar.test";
const panchang = await build({
  stdin: { contents: 'export { getPanchangam } from "@ishubhamx/panchangam-js/dist/core/panchangam.js"; export { Observer } from "astronomy-engine";', resolveDir: root },
  bundle: true, write: false, platform: "browser", format: "esm",
  // The dependency uses CommonJS require; provide a synchronous ESM namespace shim.
  banner: { js: 'import * as sharedAstronomy from "https://esm.sh/astronomy-engine@2.1.19"; const require = name => { if (name === "https://esm.sh/astronomy-engine@2.1.19") return sharedAstronomy; throw new Error("Unexpected require: " + name); };' },
  plugins: [{ name: "shared-observer", setup(build) {
    build.onResolve({ filter: /^astronomy-engine$/ }, () => ({ path: "https://esm.sh/astronomy-engine@2.1.19", external: true }));
  } }]
});
const bloggerCdn = "https://cdn.jsdelivr.net/gh/OurHinduDharm/Panchang@main";
const approvalPath = "/special-punya-kaal-public-approval.mjs";
const reviewWindow = { status: "approved", type: "vaidhriti-mahapat", ruleProfile: "drik-geocentric-apparent-disks",
  start: "2026-03-18T22:17:04.035Z", end: "2026-03-19T01:55:18.200Z" };
const nextWindow = {...reviewWindow,type:"vyatipata-mahapat",
  start:"2026-04-01T10:00:00.000Z",end:"2026-04-01T12:00:00.000Z"};
const mime = { ".mjs": "text/javascript", ".js": "text/javascript", ".html": "text/html", ".json": "application/json", ".css": "text/css" };
const browser = await chromium.launch();
try {
  for (const staged of [true, false, "release"]) {
    const context = await browser.newContext({ viewport: {width: 390, height: 844}, timezoneId: "Asia/Kolkata" });
    let localRuntimeRequests=0;
    await context.route("**/*", async route => {
      const url = new URL(route.request().url());
      let pathname = url.pathname;
      if(pathname.endsWith("/special-punya-kaal-runtime.mjs"))localRuntimeRequests++;
      // Model a failed jsDelivr component and local ephemeris import on the
      // release Blogger host. The public Mahapata must still render.
      if(staged==="release"&&url.href.startsWith(bloggerCdn+"/monthly-special-punya-kaal.mjs"))return route.abort();
      if(staged==="release"&&pathname.endsWith("/special-punya-kaal-runtime.mjs"))return route.abort();

      const headers = { "Access-Control-Allow-Origin": "*" };
      if (url.origin === "https://esm.sh" && pathname === "/@ishubhamx/panchangam-js@3.0.0") {
        return route.fulfill({ headers, contentType: "text/javascript", body: panchang.outputFiles[0].text });
      }
      if (url.origin === "https://esm.sh" && pathname === "/astronomy-engine@2.1.19") {
        pathname = "/node_modules/astronomy-engine/esm/astronomy.js";
      } else if (url.origin === "https://ourhindudharm.github.io" && pathname.startsWith("/Panchang/")) {
        pathname = pathname.slice("/Panchang".length);
      } else if (url.href.startsWith(bloggerCdn + "/")) {
        pathname = url.href.slice(bloggerCdn.length);
      } else if (url.origin !== origin && url.origin !== "https://ourhindudharm.blogspot.com") return route.abort();
      const bloggerDaily = pathname === "/p/panchang-today.html";
      if (bloggerDaily) pathname = "/index.html";
      if (pathname === "/p/masik-vrat-parv.html") pathname = "/docs/monthly-vrat-parv-blogger-snippet.html";
      const file = resolve(root, "." + pathname);
      if (!file.startsWith(root + sep)) return route.abort();
      let body;
      try { body = await readFile(file); }
      catch { return route.fulfill({ status: 404 }); }
      if (bloggerDaily) body = body.toString().replace('src="app.js"', 'src="' + bloggerCdn + '/app.js"');
      if (staged !== "release" && pathname === approvalPath) {
        const source = body.toString();
        const declaration = "const reviewedMahapata = mahapataPublicRecords;";
        assert.ok(source.includes(declaration));
        body = source.replace(declaration, staged ? "const reviewedMahapata = [" + JSON.stringify(reviewWindow) + "," + JSON.stringify(nextWindow) + "];" : "const reviewedMahapata = Object.freeze([]);");
      }
      await route.fulfill({ headers, contentType: mime[extname(file)] ?? "application/octet-stream", body });
    });
    const page = await context.newPage();
    page.on("pageerror", error => console.error("Calendar page error:", error));
    page.on("console", message => { if (["warning", "error"].includes(message.type())) console.error("Calendar console:", message.text()); });
    page.on("response", response => { if (response.status() >= 400) console.error("Calendar HTTP:", response.status(), response.url()); });
    if(staged==="release"){
      await page.clock.setFixedTime(new Date("2026-11-27T00:00:00+05:30"));
      await page.goto(origin+"/index.html?date=2026-11-27");
      const card=page.locator(".upcoming-mahapata-card");
      await card.waitFor({state:"visible"});
      assert.match(await card.innerText(),/वैधृति महापात/);
      assert.match(await card.innerText(),/आगामी महापात पुण्यकाल/);
      const href=await card.locator("a").getAttribute("href");
      const targetUrl=new URL(href);
      assert.equal(targetUrl.origin,"https://ourhindudharm.blogspot.com");
      assert.equal(targetUrl.pathname,"/p/masik-vrat-parv.html");
      assert.equal(targetUrl.searchParams.get("year"),"2026");
      assert.equal(targetUrl.searchParams.get("month"),"11");
      assert.equal(targetUrl.searchParams.get("specialType"),"vaidhriti-mahapat");
      assert.match(targetUrl.searchParams.get("specialFocus"),/^2026-11-\d{2}$/);
      assert.equal(targetUrl.hash,"#special-punya-kaal");
      await page.locator(".special-punya-kaal-sentinel").last().scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      assert.equal(await page.locator(".special-punya-kaal-card").count(),0);
      assert.equal(await page.locator(".upcoming-mahapata-card a:visible").count(),1);
      assert.equal(localRuntimeRequests,0,"November daily page must not request the local runtime");
      await page.goto(new URL(href,origin).href);
      await page.locator("#special-punya-kaal").waitFor({state:"visible"});
      await page.waitForFunction(({date,type})=>{
        const card=Array.from(document.querySelectorAll(".special-kaal-card")).find(el=>el.dataset.specialDate===date&&el.dataset.specialType===type);
        if(!card||!card.style.outline)return false;
        const rect=card.getBoundingClientRect();
        return rect.top>=0&&rect.top<innerHeight/2;
      },{date:targetUrl.searchParams.get("specialFocus"),type:targetUrl.searchParams.get("specialType")});
      const details=await page.locator("#specialPunyaKaalContent").innerText();
      assert.match(details,/वैधृति महापात/);
      assert.match(details,/मध्यकाल/);
      async function assertNovemberMahapata(){
        const section=page.locator("#special-punya-kaal");
        await section.waitFor({state:"visible"});
        await section.locator(".special-mahapata-guide").waitFor({state:"visible"});
        assert.equal(await section.locator(".special-kaal-card").count(),3);
        assert.equal(await section.locator(".special-mahapata-guide").count(),1);
        assert.equal(await section.locator(".special-kaal-verse").count(),1);
        assert.equal(await section.locator(".special-kaal-card .special-kaal-verse").count(),0);
        assert.equal(await section.locator(".special-kaal-middle").count(),3);
        assert.equal(await section.locator(".special-kaal-duration").count(),3);
      }
      await assertNovemberMahapata();
      // No hash, no scroll, no functioning local ephemeris, and a failed CDN
      // import. The real Blogger entry point should still display the month.
      await page.goto(origin+"/p/masik-vrat-parv.html?year=2026&month=11");
      await assertNovemberMahapata();
      await page.locator("#monthSelect").selectOption("12");
      await page.locator("#specialPunyaKaalContent").getByText(/स्पर्श की तिथि .*दिसंबर|स्पर्श की तिथि .*दिसम्बर/).first().waitFor({state:"visible"});
      assert.equal(await page.locator(".special-mahapata-guide").count(),1);
      // The exact old mobile URL must still focus after a deliberately slow
      // December catalogue load; the new query also works without a fragment.
      await page.route("**/data/festivals/2026-12.json",async route=>{
        await new Promise(resolve=>setTimeout(resolve,500));
        await route.fallback();
      });
      await page.goto("https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?year=2026&month=12&m=1#special-punya-kaal");
      await page.waitForFunction(()=>{
        const card=document.querySelector(".special-kaal-card");
        return card?.style.outline&&card.getBoundingClientRect().top>=0&&card.getBoundingClientRect().top<innerHeight/2;
      });
      // Reproduce a Blogger ad/header expanding AFTER the first successful
      // landing. Disable native scroll anchoring so the app correction is tested.
      await page.evaluate(()=>{
        document.documentElement.style.overflowAnchor="none";
        const spacer=document.createElement("div");
        spacer.id="late-blogger-layout";
        spacer.style.height="480px";
        document.body.insertBefore(spacer,document.body.firstChild);
      });
      await page.waitForFunction(()=>{
        const card=document.querySelector(".special-kaal-card");
        return card&&Math.abs(card.getBoundingClientRect().top-100)<=12;
      });
      // A second hash navigation without reloading the module works too.
      await page.evaluate(()=>{location.hash="";});
      await page.waitForFunction(()=>location.hash==="");
      await page.evaluate(()=>{window.scrollTo(0,0);location.hash="special-punya-kaal";});
      await page.waitForFunction(()=>{
        const card=document.querySelector(".special-kaal-card");
        return card?.style.outline&&Math.abs(card.getBoundingClientRect().top-100)<=12;
      });
      // User scroll cancels late corrections; another layout shift must
      // not pull them back after they have chosen a different position.
      await page.evaluate(()=>{
        window.dispatchEvent(new WheelEvent("wheel",{deltaY:-200}));
        window.scrollTo(0,0);
        document.getElementById("late-blogger-layout").style.height="960px";
      });
      await page.waitForTimeout(1700);
      assert.ok(await page.evaluate(()=>scrollY<20),"late corrections must respect user scroll");
      await page.goto("https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?year=2026&month=12&m=1&special=mahapat");
      await page.waitForFunction(()=>{
        const card=document.querySelector(".special-kaal-card");
        return card?.style.outline&&card.getBoundingClientRect().top>=0&&card.getBoundingClientRect().top<innerHeight/2;
      });
      const second=await page.locator(".special-kaal-card").last().evaluate(el=>({date:el.dataset.specialDate,type:el.dataset.specialType}));
      const exact=new URL("https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?year=2026&month=12&m=1");
      exact.searchParams.set("specialFocus",second.date);exact.searchParams.set("specialType",second.type);
      await page.goto(exact.href);
      await page.waitForFunction(({date,type})=>{
        const card=Array.from(document.querySelectorAll(".special-kaal-card")).find(el=>el.dataset.specialDate===date&&el.dataset.specialType===type);
        return card?.style.outline&&card.getBoundingClientRect().top>=0&&card.getBoundingClientRect().top<innerHeight/2;
      },second);
      await page.locator("#monthSelect").selectOption("11");
      await assertNovemberMahapata();
      await page.locator("#special-punya-kaal").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await assertNovemberMahapata();
      assert.equal(localRuntimeRequests,0,"November/December monthly navigation must not request the local runtime");
      // Calendar export runs on both public entry points, not just as a serializer.
      for (const host of [origin+"/monthly-vrat-parv.html","https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html"]){
        await page.goto(host+"?year=2026&month=12&m=1");
        const ekadashi=page.locator("#events .event").filter({hasText:"उत्पन्ना एकादशी"}).first();
        const google=ekadashi.getByRole("link",{name:"Google Calendar में जोड़ें"});
        await google.waitFor({state:"visible"});
        const target=new URL(await google.getAttribute("href"));
        assert.equal(target.origin,"https://calendar.google.com");
        assert.equal(target.searchParams.get("dates"),"20261204/20261205");
        const button=page.locator(".ohd-calendar-download button");
        await button.waitFor({state:"visible"});
        const downloadPromise=page.waitForEvent("download");
        await button.click();
        const download=await downloadPromise;
        assert.equal(download.suggestedFilename(),"OurHinduDharm-2026-12.ics");
        const ics=(await readFile(await download.path(),"utf8")).replace(/\r\n /g,"");
        assert.match(ics,/BEGIN:VCALENDAR/);
        assert.match(ics,/DTSTART;VALUE=DATE:20261204/);
        assert.match(ics,/SUMMARY:उत्पन्ना एकादशी/);
        assert.doesNotMatch(ics,/DTSTART;VALUE=DATE:202611/);
        await page.locator("#monthSelect").selectOption("11");
        await page.locator("#events .event").filter({hasText:"रमा एकादशी"}).first().getByRole("link",{name:"Google Calendar में जोड़ें"}).waitFor({state:"visible"});
        const novemberPromise=page.waitForEvent("download");
        await button.click();
        assert.equal((await novemberPromise).suggestedFilename(),"OurHinduDharm-2026-11.ics");
      }
      console.log("Performance guard: zero local runtime requests in November daily and November/December monthly views.");
      await context.close();
      continue;
    }
    await page.goto(origin + "/monthly-vrat-parv.html?year=2026&month=03#special-punya-kaal");
    const varuniCard=page.locator("#events .event").filter({hasText:"वारुणी योग"});
    await varuniCard.first().waitFor({state:"visible"});
    assert.equal(await varuniCard.count(),1);
    assert.match(await varuniCard.innerText(),/पिथौरागढ़/);
    await page.setViewportSize({width:320,height:844});
    const conjunction=varuniCard.locator(".varuni-conjunction");
    assert.equal(await conjunction.count(),1);
    assert.match(await conjunction.innerText(),/आरम्भ.*प्रातः.*6:22/);
    assert.match(await conjunction.innerText(),/समाप्ति.*प्रातः.*9:23/);
    assert.ok(await conjunction.evaluate(el=>el.scrollWidth<=el.clientWidth+1),"Varuni time panel must fit a 320px viewport");
    await page.setViewportSize({width:390,height:844});
    assert.equal(localRuntimeRequests,0,"monthly March must not load the local runtime");
    if(staged){
      await page.locator("#special-punya-kaal").waitFor({state:"visible"});
      assert.match(await page.locator("#specialPunyaKaalContent").innerText(),/वैधृति महापात/);
    }
    assert.equal(await page.locator(".special-mahapata-guide").count(),staged?1:0);
    await page.goto(origin + "/index.html?date=2026-03-19");
    await page.locator(".special-punya-kaal-sentinel").last().scrollIntoViewIfNeeded();
    if(staged){
      const daily = await page.locator(".special-punya-kaal-card").innerText();
      assert.match(daily,/वैधृति महापात/);
      assert.match(daily,/स्पर्श [^\n]+मोक्ष /);
      assert.equal(await page.locator(".special-punya-kaal-card a").getAttribute("href"),"https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?year=2026&month=03&specialFocus=2026-03-19&specialType=vaidhriti-mahapat#special-punya-kaal");
    }else{
      await page.waitForTimeout(1000);
      assert.equal(await page.locator(".special-punya-kaal-card").count(),0);
    }
    await page.goto(origin + "/p/panchang-today.html?date=2026-03-19");
    await page.locator(".special-punya-kaal-sentinel").last().scrollIntoViewIfNeeded();
    const canonical="https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?year=2026&month=03&specialFocus=2026-03-19&specialType=vaidhriti-mahapat#special-punya-kaal";
    if(staged)assert.equal(await page.locator(".special-punya-kaal-card a").getAttribute("href"),canonical);
    const runtimeBeforeMonthly=localRuntimeRequests;
    await page.goto(canonical);
    const bloggerVaruni=page.locator("#events .event").filter({hasText:"वारुणी योग"});
    await bloggerVaruni.first().waitFor({state:"visible"});
    assert.equal(await bloggerVaruni.count(),1);
    assert.equal(localRuntimeRequests,runtimeBeforeMonthly,"Blogger monthly must not request the local runtime");
    if(staged)await page.locator("#special-punya-kaal").waitFor({state:"visible"});
    // Test the real daily card on a fixed current IST date, not the host's date.
    await page.clock.setFixedTime(new Date("2026-03-18T12:00:00Z"));
    await page.goto(origin + "/index.html?date=2026-03-18");
    if(staged){
      const upcoming=page.locator(".upcoming-mahapata-card");
      await upcoming.waitFor({state:"visible"});
      assert.match(await upcoming.innerText(),/आगामी महापात पुण्यकाल/);
      assert.equal(await upcoming.locator("a").getAttribute("href"),canonical);
      await page.clock.setFixedTime(new Date("2026-03-19T00:00:00Z"));
      await page.goto(origin + "/index.html?date=2026-03-19");
      await upcoming.waitFor({state:"visible"});
      assert.match(await upcoming.innerText(),/अभी महापात पुण्यकाल/);
      await page.clock.setFixedTime(new Date("2026-03-19T02:00:00Z"));
      await page.goto(origin + "/index.html?date=2026-03-19");
      await upcoming.waitFor({state:"visible"});
      assert.match(await upcoming.innerText(),/आगामी महापात पुण्यकाल/);
      assert.equal(await upcoming.locator("a").getAttribute("href"),"https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?year=2026&month=04&specialFocus=2026-04-01&specialType=vyatipata-mahapat#special-punya-kaal");
    }else{
      await page.locator(".special-punya-kaal-sentinel").last().scrollIntoViewIfNeeded();
      assert.equal(await page.locator(".upcoming-mahapata-card").isVisible(),false);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
