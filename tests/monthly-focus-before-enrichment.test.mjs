import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("monthly-vrat-parv-widget.js", "utf8");

test("deep-link focus waits for the final enriched monthly card list", () => {
  const renderStart = source.indexOf("function render(data,year,month,token)");
  const fetchStart = source.indexOf("async function fetchDwadashiYear");
  const loadStart = source.indexOf("async function loadMonth(preserveViewportAnchor)");
  assert.ok(renderStart >= 0 && fetchStart > renderStart && loadStart > fetchStart);

  const renderBody = source.slice(renderStart, fetchStart);
  assert.ok(renderBody.includes("eventsEl.appendChild(card)"), "render must append festival cards");
  assert.ok(!renderBody.includes("focusFestivalCard();"), "intermediate renders must not move the viewport");

  const loadBody = source.slice(loadStart);
  const finalRender = loadBody.indexOf("render(data,year,month,token);");
  const finalFocus = loadBody.indexOf("focusFestivalCard();", finalRender);
  assert.ok(finalRender >= 0, "final enriched list must be rendered");
  assert.ok(finalFocus > finalRender, "focus must occur after the final render");
  assert.ok(finalFocus < loadBody.indexOf("}catch(e)", finalRender), "focus must happen in the successful final-load path");
});

test("independent monthly enrichments run concurrently", () => {
  const loadStart = source.indexOf("async function loadMonth(preserveViewportAnchor)");
  const loadBody = source.slice(loadStart);
  const parallelStart = loadBody.indexOf("var parallelResults=await Promise.all([");
  const parallelEnd = loadBody.indexOf("]);", parallelStart);
  assert.ok(parallelStart >= 0 && parallelEnd > parallelStart, "independent enrichments must use Promise.all");
  const parallelBlock = loadBody.slice(parallelStart, parallelEnd);
  assert.ok(parallelBlock.includes("buildDynamicNavratriEvents"), "Navratri calculation must be included");
  assert.ok(parallelBlock.includes("buildLocationEclipseEvents"), "local eclipse calculation must be included");
  assert.ok(loadBody.indexOf("var dwadashiYearPromise=fetchDwadashiYear") < parallelStart, "Dwadashi fetch should already be running concurrently");
});

test("focus logic scrolls to the matching card without waiting for browser load or AdSense", () => {
  const focusStart = source.indexOf("function focusFestivalCard()");
  const focusEnd = source.indexOf("\n  function categoryFor", focusStart);
  const focusBody = source.slice(focusStart, focusEnd);
  assert.ok(focusBody.includes("window.scrollTo("), "focus must scroll to the target card");
  assert.ok(!/addEventListener\s*\(\s*["']load["']/.test(focusBody));
  assert.ok(!/adsbygoogle|adsense/i.test(focusBody));
});

test("deep-link focus waits for active user scrolling, then resumes automatically", () => {
  const focusStart = source.indexOf("var focusScrollIdleTimer=null;");
  const focusEnd = source.indexOf("\n  function categoryFor", focusStart);
  const focusBody = source.slice(focusStart, focusEnd);
  assert.ok(focusBody.includes('addEventListener("wheel",markFocusUserScroll,{passive:true})'), "mouse-wheel scrolling must be detected");
  assert.ok(focusBody.includes('addEventListener("touchmove",markFocusUserScroll,{passive:true})'), "mobile touch scrolling must be detected");
  assert.ok(focusBody.includes('addEventListener("keydown"'), "keyboard scrolling must be detected");
  assert.ok(focusBody.includes("},700);"), "focus should wait until scrolling has been idle");
  assert.match(focusBody, /if\(!focusPending\|\|focusUserScrollActive\)return;/, "active scrolling must defer focus without cancelling it");
  assert.match(focusBody, /if\(focusPending\)focusFestivalCard\(\);/, "pending focus must resume when scrolling settles");
  assert.match(focusBody, /if\(!target\.isConnected\|\|!focusPending\|\|focusUserScrollActive\)return;/, "a new scroll before the animation frame must prevent a jump");
});
