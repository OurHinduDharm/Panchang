import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("2030 November festival cards have specific descriptions and known links", async () => {
  const data = JSON.parse(await readFile(
    new URL("../data/festivals/2030-11.json", import.meta.url),
    "utf8"
  ));
  const find = pattern => data.events.find(event => pattern.test(event.title || ""));
  const generic = data.events.filter(event =>
    /पूजा, व्रत, जप अथवा दान की परंपरा है/.test(event.description || "")
  );
  assert.equal(generic.length, 0);

  assert.match(find(/कंस वध/).description, /श्रीकृष्ण/);
  const tulsi = find(/तुलसी विवाह/);
  assert.match(tulsi.description, /तुलसी माता और शालिग्राम/);
  assert.match(tulsi.articleUrl || "", /About-Tulsi-vivah-On-Prabodhini-Ekadashi/);
  const devDeepawali = find(/देव दीपावली/);
  assert.equal(devDeepawali.date, "2030-11-09");
  assert.match(devDeepawali.description, /प्रदोषव्याप्ति/);
  assert.equal(devDeepawali.muhurtaRule, "dev-deepawali-pradosh");
  assert.match(devDeepawali.articleUrl || "", /aakash-deep-daan-vidhi/);
  assert.match(find(/कार्तिक पूर्णिमा/).description, /गुरु नानक देव/);
  assert.match(find(/वृश्चिक संक्रांति/).description, /वृश्चिक राशि/);
  const bhairav = find(/कालभैरव जयंती/);
  assert.match(bhairav.description, /मंत्र-जप और रात्रि-उपासना/);
  assert.match(bhairav.articleUrl || "", /AboutBhairavashtamiOn-BhairavaJayanti/);
  assert.match(find(/सोमवती अमावस्या/).description, /पितृ-तर्पण/);
  assert.match(find(/विवाह पंचमी/).description, /श्रीराम और माता सीता/);
});
