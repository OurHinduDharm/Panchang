import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = async month => JSON.parse(await readFile(
  new URL(`../data/festivals/2030-${String(month).padStart(2, "0")}.json`, import.meta.url),
  "utf8"
));
const find = (events, pattern) => events.find(event => pattern.test(event.title || ""));

test("2030 August and September festival descriptions are specific", async () => {
  const [august, september] = await Promise.all([read(8), read(9)]);
  for (const [month, data] of [[8, august], [9, september]]) {
    const generic = data.events.filter(event =>
      /पूजा, व्रत, जप अथवा दान की परंपरा है/.test(event.description || "")
    );
    assert.equal(generic.length, 0, `month ${month} still has generic descriptions`);
  }

  assert.match(find(august.events, /हरियाली तीज/).description, /शिव-पार्वती/);
  const nag = find(august.events, /नाग पंचमी/);
  assert.match(nag.articleUrl || "", /About-NagPanchami/);
  assert.match(nag.secondaryArticleUrl || "", /About-Naag-Stotratmak/);
  const rakhi = find(august.events, /रक्षाबंधन/);
  assert.match(rakhi.description, /रक्षा-सूत्र/);
  assert.match(rakhi.description, /गायत्री मंत्र-जप/);
  assert.match(rakhi.articleUrl || "", /About-RakshaBandhan/);
  const janmashtami = find(august.events, /श्रीकृष्ण जन्माष्टमी/);
  assert.equal(janmashtami.date, "2030-08-20");
  assert.match(janmashtami.description, /निशीथ काल/);
  assert.match(janmashtami.articleUrl || "", /About-Shree-Krishna-Janmaashtami/);
  assert.match(janmashtami.secondaryArticleUrl || "", /About-Mahavidya-MahaKali/);
  assert.match(find(august.events, /हरतालिका तीज/).description, /शिव और माता पार्वती/);

  assert.match(find(september.events, /ऋषि पंचमी/).description, /सप्तऋषियों/);
  assert.match(find(september.events, /बलराम जयंती/).description, /भगवान बलराम/);
  const radha = find(september.events, /राधाष्टमी/);
  assert.match(radha.articleUrl || "", /About-ShreeRadha-On-Radhaashtami/);
  assert.match(find(september.events, /अगस्त्य अर्घ्य/).description, /अगस्त्य तारे/);
  assert.match(find(september.events, /ओणम/).description, /राजा महाबली/);
  assert.match(find(september.events, /अनंत चतुर्दशी/).description, /अनंत-सूत्र/);
  assert.match(find(september.events, /भाद्रपद पूर्णिमा/).description, /पूर्णिमा श्राद्ध/);
  const pitru = find(september.events, /पितृपक्ष प्रारम्भ/);
  assert.match(pitru.articleUrl || "", /About-Shraaddhs-and-Pitripaksha/);
  assert.match(find(september.events, /विश्वकर्मा पूजा/).description, /कार्यस्थल/);
  assert.match(find(september.events, /सर्वपितृ अमावस्या/).description, /पितृपक्ष का समापन/);
  const navratri = find(september.events, /शारदीय नवरात्रि प्रारम्भ/);
  assert.match(navratri.articleUrl || "", /About-Sharadiya-Navaratri/);
  assert.match(navratri.secondaryArticleUrl || "", /kalash-sthapan/);
});
