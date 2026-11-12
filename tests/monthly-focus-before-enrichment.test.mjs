import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("monthly-vrat-parv-widget.js", "utf8");

test("deep-linked festival card is focused during the first synchronous render", () => {
  const renderStart = source.indexOf("function render(data,year,month,token)");
  const fetchStart = source.indexOf("async function fetchDwadashiYear");
  assert.ok(renderStart >= 0, "monthly render function must exist");
  assert.ok(fetchStart > renderStart, "render function must precede asynchronous enrichment");

  const renderBody = source.slice(renderStart, fetchStart);
  const appendCards = renderBody.indexOf("card.appendChild(content);eventsEl.appendChild(card);");
  const focusCall = renderBody.indexOf("focusFestivalCard();");
  assert.ok(appendCards >= 0, "festival cards must be appended");
  assert.ok(focusCall > appendCards, "focus must run after cards are in the DOM");
  assert.ok(focusCall < renderBody.indexOf("\n  }"), "focus must run before render returns");
});

test("focus logic does not wait for the browser load event or AdSense", () => {
  const focusStart = source.indexOf("function focusFestivalCard()");
  const focusEnd = source.indexOf("\n  function categoryFor", focusStart);
  const focusBody = source.slice(focusStart, focusEnd);
  assert.ok(focusBody.includes("window.scrollTo("), "focus must scroll to the target card");
  assert.ok(!/addEventListener\s*\(\s*["']load["']/.test(focusBody));
  assert.ok(!/adsbygoogle|adsense/i.test(focusBody));
});
