import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "monthly-vrat-parv-widget.js"), "utf8");

test("monthly Vrat-Parv list suppresses global/static eclipse entries", () => {
  assert.match(source, /return item\.isLocationEclipse===true\|\|!\/ग्रहण\|grahan\|eclipse\/i\.test\(eclipseText\)/);
});

test("monthly eclipse cards are generated only after local visibility is true", () => {
  assert.match(source, /visibility\.localVisible!==true\)return;/);
  assert.match(source, /isLocationEclipse:true/);
});

test("monthly eclipse card links to both detailed Blogger resources", () => {
  assert.match(source, /https:\/\/ourhindudharm\.blogspot\.com\/p\/grahan-panchang\.html\?m=1/);
  assert.match(source, /https:\/\/ourhindudharm\.blogspot\.com\/2022\/10\/About-Grahan-mantra-purashcharan\.html\?m=1/);
});

test("Sutak is shown only when both complete boundaries are available", () => {
  assert.match(source, /if\(sutak&&sutak\.start&&sutak\.end\)/);
  assert.match(source, /formatGrahanDateTime\(sutak\.start\).*formatGrahanDateTime\(sutak\.end\)/);
});
