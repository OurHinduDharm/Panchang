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
  assert.deepEqual(find(months[2].events, /महाशिवरात्रि/).muhurtaRules,
    ["mahashivaratri-four-prahar", "mahashivaratri-nishita"]);
  assert.equal(find(october.events, /करवा चौथ/).muhurtaRule, "karwa-chauth-puja");
  assert.deepEqual(find(october.events, /धनतेरस/).muhurtaRules,
    ["dhanteras-muhurta", "pradosh-kala"]);
  assert.deepEqual(find(october.events, /दीपावली|दिवाली/).muhurtaRules,
    ["diwali-lakshmi-puja"]);
  const kali = find(october.events, /काली चौदस/);
  assert.equal(kali.date, "2030-10-25");
  const narak = find(october.events, /नरक चतुर्दशी/);
  assert.equal(narak.date, "2030-10-26");
  assert.match(narak.hinduTithi, /क्षय-तिथि निर्णय/);
  assert.equal(narak.muhurtaRule, "narak-chaturdashi-kshaya-abhyanga");
  assert.equal(narak.muhurtaRules, undefined);
  assert.equal(find(october.events, /भैया दूज|भाई दूज/).muhurtaRule, "bhai-dooj-tilak");
});
