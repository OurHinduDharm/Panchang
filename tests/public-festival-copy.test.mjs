import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const directory = new URL("../data/festivals/", import.meta.url);
const files = (await readdir(directory)).filter(name => /^\d{4}-\d{2}\.json$/.test(name));
const forbiddenPublicCopy = /(?:स्थानीय पंचांग|दूसरे पंचांग|अपने पंचांग|तारीख़[^।]*(?:पुष्टि|समीक्षा)[^।]*(?:बाकी|आवश्यक)|(?:अपनी|स्थानीय|क्षेत्रीय|परिवार की) परंपरा के अनुसार (?:करें|निर्णय करें|तय करें)|स्थानीय नियमों के अनुसार तय करें|स्थानीय तिथि-व्याप्ति[^।]*(?:सत्यापित|निर्णय) करें|तारीख़ न मानें[^"]*(?:स्थानीय|पुष्टि))/;

test("public yearly festival descriptions do not send users to another Panchang or expose pending-review caveats", async () => {
  assert.ok(files.length >= 48, "Expected monthly data for 2026–2029");
  const violations = [];
  for (const file of files) {
    const data = JSON.parse(await readFile(new URL(file, directory), "utf8"));
    for (const event of data.events || []) {
      const description = String(event.description || "");
      if (forbiddenPublicCopy.test(description)) {
        violations.push({ file, date: event.date, title: event.title, description });
      }
    }
  }
  assert.deepEqual(violations, []);
});

test("city selection obtains terrain elevation instead of hardcoding zero metres", async () => {
  const widget = await readFile(new URL("../monthly-vrat-parv-widget.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
  for (const source of [widget, html]) {
    assert.match(source, /api\.open-meteo\.com\/v1\/elevation/);
    assert.match(source, /selected\.elevation=await getTerrainElevation\(selected\.lat,selected\.lon\)/);
    assert.match(source, /defaultLocationElevation=await getTerrainElevation\(29\.5828,80\.2182\)/);
    assert.doesNotMatch(source, /lat:Number\(place\.lat\),lon:Number\(place\.lon\),elevation:0/);
  }
});
