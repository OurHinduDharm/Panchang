import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = async () => JSON.parse(await readFile(
  new URL("../data/festivals/2030-10.json", import.meta.url),
  "utf8"
));
const find = (events, pattern) => events.find(event => pattern.test(event.title || ""));

test("2030 October Navratri and Deepawali cards have distinct useful descriptions", async () => {
  const data = await read();
  const events = data.events;
  const generic = events.filter(event =>
    /पूजा, व्रत, जप अथवा दान की परंपरा है/.test(event.description || "")
  );
  assert.equal(generic.length, 0, "October must not contain generic placeholder descriptions");

  assert.match(find(events, /सरस्वती आवाहन/).description, /आवाहन और स्थापना/);
  const durgaAshtami = find(events, /दुर्गाष्टमी/);
  assert.match(durgaAshtami.description, /माँ दुर्गा/);
  assert.doesNotMatch(durgaAshtami.description, /मासिक दुर्गाष्टमी पर/);
  const navami = find(events, /महानवमी/);
  assert.match(navami.description, /हवन/);
  assert.match(navami.articleUrl || "", /About-Goddess-Siddhidaatri/);
  const vijaya = find(events, /विजयादशमी/);
  assert.match(vijaya.description, /शमी-पूजन/);
  assert.match(vijaya.articleUrl || "", /kalashvisarjan/);

  const kojagara = find(events, /कोजागरा/);
  assert.match(kojagara.description, /लक्ष्मी-कुबेर पूजन/);
  assert.match(kojagara.articleUrl || "", /About-kojaagari/);
  const karwa = find(events, /करवा चौथ/);
  assert.match(karwa.description, /चंद्रमा को अर्घ्य/);
  assert.equal((karwa.description.match(/चंद्रमा को अर्घ्य/g) || []).length, 1);
  const ahoi = find(events, /अहोई अष्टमी/);
  assert.match(ahoi.description, /तारों को अर्घ्य/);
  assert.match(ahoi.description, /राधाकुण्ड स्नान/);

  const govats = find(events, /गोवत्स द्वादशी/);
  assert.match(govats.articleUrl || "", /About-Govats-Dwadashi-vrat/);
  assert.doesNotMatch([govats.articleUrl, govats.secondaryArticleUrl, govats.description].join(" "), /About-Ekadashi/);

  const dhan = find(events, /धनतेरस/);
  assert.match(dhan.description, /धन्वन्तरि/);
  const diwali = find(events, /दीपावली/);
  assert.match(diwali.description, /लक्ष्मी-गणेश पूजन/);
  assert.doesNotMatch(diwali.title, /काली पूजा/);
  assert.doesNotMatch(diwali.description, /माँ काली की विशेष पूजा/);
  const kaliPuja = find(events, /^काली पूजा$/);
  assert.ok(kaliPuja, "Kali Puja must have its own observance card");
  assert.equal(kaliPuja.date, "2030-10-26");
  assert.match(kaliPuja.articleUrl || "", /Kakaradi-Kali-sahasranam-stotra/);
  assert.match(diwali.articleUrl || "", /About-Deepawali/);
  const kali = find(events, /काली चौदस/);
  assert.equal(kali.date, "2030-10-25");
  const narak = find(events, /नरक चतुर्दशी/);
  assert.equal(narak.date, "2030-10-26");
  assert.match(narak.description, /धर्मसिंधु में वर्णित विशेष क्षय-तिथि निर्णय/);
  assert.match(narak.description, /चंद्रोदय से सूर्योदय तक अभ्यंग-स्नान/);
  assert.doesNotMatch(narak.description, /चंद्रोदय-काल \(अरुणोदय\)/);
  assert.match(kali.description, /निशीथकालीन माँ काली/);
  assert.match(narak.articleUrl || "", /About-Narak-Chaturdashi/);
  const govardhan = find(events, /गोवर्धन पूजा/);
  assert.match(govardhan.description, /अन्नकूट/);
  assert.match(find(events, /भैया दूज/).description, /तिलक/);

  assert.equal(find(events, /करवा चौथ/).muhurtaRule, "karwa-chauth-puja");
  assert.deepEqual(find(events, /धनतेरस/).muhurtaRules, ["dhanteras-muhurta", "pradosh-kala"]);
  assert.deepEqual(diwali.muhurtaRules, ["diwali-lakshmi-puja"]);
  const diwaliLinks = [...diwali.description.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(diwaliLinks).size, diwaliLinks.length, "Diwali article links must be valid and unique");
  assert.equal(narak.muhurtaRule, "narak-chaturdashi-kshaya-abhyanga");
  assert.equal(find(events, /भैया दूज/).muhurtaRule, "bhai-dooj-tilak");
});
