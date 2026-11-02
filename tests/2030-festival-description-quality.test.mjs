import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readMonth = async month => JSON.parse(await readFile(
  new URL(`../data/festivals/2030-${String(month).padStart(2, "0")}.json`, import.meta.url),
  "utf8"
));
const find = (events, pattern) => events.find(event => pattern.test(event.title || ""));

test("2030 major festival descriptions are specific and retain known article links", async () => {
  const [march, april, may, september, november] = await Promise.all(
    [3, 4, 5, 9, 11].map(readMonth)
  );
  const shivratri = find(march.events, /महाशिवरात्रि/);
  assert.match(shivratri.description, /चारों प्रहर/);
  assert.match(shivratri.articleUrl || "", /About-Mahashivratri-Vrat/);

  const ram = find(april.events, /श्रीराम नवमी/);
  assert.match(ram.description, /श्रीराम के जन्मोत्सव/);
  assert.match(ram.articleUrl || "", /About-Birthday-Of-Lord-Ram-on-Shree-RamNavami/);

  const narasimha = find(may.events, /नृसिंह जयंती/);
  assert.match(narasimha.description, /नृसिंह अवतार/);
  assert.match(narasimha.articleUrl || "", /About-lord-Nrisimha-On-NrisimhaJayanti/);
  const vat = find(may.events, /वट सावित्री व्रत/);
  assert.match(vat.description, /सावित्री-सत्यवान/);

  const ganesh = find(september.events, /गणेश चतुर्थी/);
  assert.match(ganesh.description, /गणेश की स्थापना/);
  assert.doesNotMatch(ganesh.description, /पूजा, व्रत, जप अथवा दान की परंपरा है/);

  const chhath = find(november.events, /छठ पूजा/);
  assert.match(chhath.description, /नहाय-खाय/);
  assert.match(chhath.description, /संध्या अर्घ्य/);
  assert.match(chhath.description, /उषा अर्घ्य/);
});
