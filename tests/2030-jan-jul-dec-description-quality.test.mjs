import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = async month => JSON.parse(await readFile(
  new URL(`../data/festivals/2030-${String(month).padStart(2, "0")}.json`, import.meta.url),
  "utf8"
));
const find = (events, pattern) => events.find(event => pattern.test(event.title || ""));

test("2030 January to July and December cards use event-specific descriptions", async () => {
  const months = Object.fromEntries(await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 12].map(async month => [month, await read(month)])
  ));
  for (const [month, data] of Object.entries(months)) {
    const generic = data.events.filter(event =>
      /पूजा, व्रत, जप अथवा दान की परंपरा है/.test(event.description || "")
    );
    assert.equal(generic.length, 0, `2030 month ${month} still has generic descriptions`);
  }

  assert.match(find(months[1].events, /सकट चौथ/).description, /तिल-गुड़/);
  assert.match(find(months[2].events, /वसंत पंचमी/).articleUrl || "", /AboutGoddessSaraswatiOnVasantPanchami/);
  assert.match(find(months[2].events, /भीष्म अष्टमी/).articleUrl || "", /AboutBheeshma-Tarpan/);
  assert.match(find(months[3].events, /होली \/ धुलेंडी/).description, /रंग और गुलाल/);
  assert.match(find(months[3].events, /शीतला अष्टमी/).description, /शीतल भोजन/);
  assert.match(find(months[4].events, /यमुना छठ/).description, /यमुना महारानी/);
  assert.match(find(months[4].events, /हनुमान जयंती/).articleUrl || "", /About-Lord-Hanuman-Jayanti/);
  assert.match(find(months[5].events, /सीता नवमी/).articleUrl || "", /About-Worship-Method-Of-Goddess-Sita/);
  assert.match(find(months[5].events, /नारद जयंती/).articleUrl || "", /About-Muni-Naradji/);
  assert.match(find(months[6].events, /शनि जयंती/).articleUrl || "", /About-Shanidev-On-ShanidevJayanti/);
  assert.match(find(months[6].events, /गंगा दशहरा/).articleUrl || "", /about-Godess-Ganga-on-ganga-dussehra/);
  assert.match(find(months[7].events, /जगन्नाथ रथयात्रा/).description, /जगन्नाथ, बलभद्र और सुभद्रा/);
  assert.match(find(months[7].events, /गुरु पूर्णिमा/).description, /व्यास-पूजा/);
  assert.match(find(months[12].events, /दत्तात्रेय जयंती/).articleUrl || "", /About-Lord-Dattatreya-On-DattJayanti/);
  assert.match(find(months[12].events, /धनु संक्रांति/).description, /धनु राशि/);
});
