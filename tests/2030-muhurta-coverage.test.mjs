import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readMonth = async month => JSON.parse(await readFile(
  new URL(`../data/festivals/2030-${String(month).padStart(2, "0")}.json`, import.meta.url),
  "utf8"
));

test("2030 Smarta Ekadashi cards carry the same parana rule and guides as earlier years", async () => {
  const months = await Promise.all(Array.from({ length: 12 }, (_, i) => readMonth(i + 1)));
  const events = months.flatMap(month => month.events || []);
  const ekadashis = events.filter(event =>
    /एकादशी/.test(event.title || "") && !/वैष्णव|गौण/.test(event.title || "")
  );
  assert.ok(ekadashis.length >= 20, "expected the annual Smarta Ekadashi series");
  for (const event of ekadashis) {
    assert.equal(event.muhurtaRule, "ekadashi-parana", event.title);
    assert.match(event.articleUrl || "", /About-Ekadashi-Vrat-Vidhan/);
    assert.match(event.secondaryArticleUrl || "", /About-Ekadashi-Vrat-Udyapan-vidhi/);
    assert.ok(event.articleLabel && event.secondaryArticleLabel, event.title);
    assert.match(event.description || "", /द्वादशी-व्याप्ति और हरिवासर/);
  }
});

test("2030 major festival cards retain their implemented muhurta rules", async () => {
  const september = await readMonth(9);
  const october = await readMonth(10);
  const find = (events, pattern) => events.find(event => pattern.test(event.title || ""));
  assert.equal(find(september.events, /गणेश चतुर्थी/).muhurtaRule, "vinayaka-chaturthi-madhyahna");
  assert.equal(find(october.events, /करवा चौथ/).muhurtaRule, "karwa-chauth-puja");
  assert.equal(find(october.events, /धनतेरस/).muhurtaRule, "dhanteras-muhurta");
  assert.deepEqual(find(october.events, /दीपावली|दिवाली/).muhurtaRules,
    ["diwali-lakshmi-puja", "narak-chaturdashi-abhyanga"]);
  assert.equal(find(october.events, /भैया दूज|भाई दूज/).muhurtaRule, "bhai-dooj-tilak");
});
