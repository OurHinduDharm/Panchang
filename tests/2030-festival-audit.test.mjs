import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) =>
  JSON.parse(readFileSync(join(folder, "2030-" + String(i + 1).padStart(2, "0") + ".json"), "utf8")));
const events = months.flatMap(data => data.events || []);
const has = (date, pattern) => events.find(event => event.date === date && pattern.test(event.title || ""));

test("2030 monthly festival files have approved records dated within their month", () => {
  for (const [index, data] of months.entries()) {
    assert.equal(data.year, 2030);
    assert.equal(data.month, index + 1);
    assert.equal(data.status, "approved");
    for (const event of data.events || []) {
      assert.equal(event.reviewStatus, "approved", event.date + ": " + event.title);
      assert.match(event.date, /^2030-\d{2}-\d{2}$/);
      assert.equal(Number(event.date.slice(5, 7)), index + 1,
        event.date + " is stored in the wrong monthly file");
    }
  }
});

test("2030 catalog has one card per same-date Hindu tithi", () => {
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    assert.ok(!seen.has(key),
      "Duplicate same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
    seen.set(key, event.title);
  }
});

test("2030 Ekadashi cards follow the Smarta-only policy", () => {
  assert.equal(events.filter(event => /(गौण|वैष्णव)/.test(event.title || "")).length, 0);
  assert.ok(has("2030-11-05", /देवउठनी एकादशी \(स्मार्त\)/));
  assert.ok(has("2030-11-21", /उत्पन्ना एकादशी \(स्मार्त\)/));
});

test("2030 important annual festivals and jayantis are represented", () => {
  assert.ok(has("2030-01-10", /श्री गुरु गोबिंद सिंह जयंती/));
  assert.ok(has("2030-01-15", /धर्मसावर्णि मन्वादि/));
  assert.ok(has("2030-01-12", /स्वामी विवेकानंद जयंती/));
  assert.ok(has("2030-01-13", /लोहड़ी/));
  assert.ok(has("2030-01-15", /तैलंग स्वामी जयंती/));
  assert.ok(has("2030-02-18", /गुरु रविदास जयंती/));
  assert.ok(has("2030-02-23", /यशोदा जयंती/));
  assert.ok(has("2030-02-24", /भानु सप्तमी.*शबरी जयंती/));
  assert.ok(has("2030-02-25", /जानकी जयंती/));
  assert.ok(has("2030-02-27", /महर्षि दयानंद सरस्वती जयंती/));
  assert.ok(has("2030-03-06", /फुलेरा दूज.*श्रीरामकृष्ण परमहंस जयंती/));
  assert.ok(has("2030-03-19", /चैतन्य महाप्रभु जयंती.*सावर्णि मन्वादि तिथि/));
  assert.ok(has("2030-03-21", /भाई दूज.*भ्रातृ द्वितीया/));
  assert.ok(has("2030-03-22", /छत्रपति शिवाजी महाराज जयंती.*भालचन्द्र संकष्टी/));
  assert.ok(has("2030-03-24", /रंग पंचमी/));
  assert.ok(has("2030-03-25", /शीतला सप्तमी/));
  assert.ok(has("2030-04-02", /चैत्र अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-04-05", /मत्स्य जयंती.*स्वायम्भुव मन्वादि तिथि/));
  assert.ok(has("2030-04-18", /हनुमान जयंती.*स्वरोचिष मन्वादि तिथि/));
  assert.ok(has("2030-04-04", /झूलेलाल जयंती/));
  assert.ok(has("2030-04-14", /बैसाखी/));
  assert.ok(has("2030-04-28", /वल्लभाचार्य जयंती/));
  assert.ok(has("2030-05-08", /आदि शंकराचार्य जयंती.*सूरदास जयंती/));
  assert.ok(has("2030-06-04", /महाराणा प्रताप जयंती/));
  assert.ok(has("2030-08-06", /गोस्वामी तुलसीदास जयंती/));
  assert.ok(has("2030-10-06", /मध्वाचार्य जयंती/));
  assert.ok(has("2030-10-11", /वाल्मीकि जयंती.*मीराबाई जयंती/));
  assert.ok(has("2030-12-30", /गुरु गोबिंद सिंह जयंती/));
});

test("2030 same-tithi Navratri and festival observances are combined", () => {
  assert.ok(has("2030-03-03", /द्वापरादि तिथि.*दर्श अमावस्या/));
  assert.ok(has("2030-03-01", /कृष्ण भीष्म द्वादशी.*शुक्र प्रदोष/));
  assert.ok(has("2030-03-16", /नृसिंह द्वादशी/));
  assert.ok(has("2030-03-26", /शीतला अष्टमी.*मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी/));
  assert.ok(has("2030-02-03", /चन्द्र दर्शन.*माघ गुप्त नवरात्र प्रारंभ/));
  assert.ok(has("2030-02-06", /गौरी गणेश.*कूष्माण्डा/));
  assert.ok(has("2030-02-07", /वसंत पंचमी.*स्कन्दमाता/));
  assert.ok(has("2030-02-08", /मासिक स्कन्द षष्ठी.*कात्यायनी/));
  assert.ok(has("2030-02-09", /रथ सप्तमी.*नर्मदा जयंती.*ब्रह्मसावर्णि मन्वादि तिथि.*कालरात्रि/));
  assert.ok(has("2030-02-24", /भानु सप्तमी.*शबरी जयंती.*मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी/));
  assert.equal(has("2030-02-25", /मासिक कालाष्टमी/), undefined);
  assert.ok(has("2030-02-10", /भीष्म अष्टमी.*मासिक दुर्गाष्टमी.*महागौरी/));
  assert.ok(has("2030-04-04", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
  assert.ok(has("2030-04-06", /गणगौर.*चन्द्रघंटा/));
  assert.ok(has("2030-04-07", /कूष्माण्डा.*लक्ष्मी पंचमी/));
  assert.ok(has("2030-04-08", /पंचमी.*स्कन्दमाता.*मासिक स्कन्द षष्ठी/));
  assert.equal(has("2030-04-08", /^मासिक स्कन्द षष्ठी$/), undefined);
  assert.ok(has("2030-04-09", /यमुना छठ.*कात्यायनी/));
  assert.ok(has("2030-05-02", /वैशाख अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-05-05", /त्रेतायुगादि तिथि.*परशुराम जयंती.*अक्षय तृतीया.*मातंगी/));
  assert.ok(has("2030-05-06", /^विनायक चतुर्थी$/));
  assert.ok(has("2030-05-11", /मासिक दुर्गाष्टमी.*सीता नवमी.*वगलामुखी/));
  assert.equal(has("2030-05-11", /^सीता नवमी$/), undefined);
  assert.ok(has("2030-05-13", /मोहिनी एकादशी.*सिद्धिलक्ष्मी जयंती/));
  assert.ok(has("2030-05-17", /वैशाख पूर्णिमा.*बुद्ध पूर्णिमा.*कूर्म अवतार जयंती.*चण्डिका जयंती/));
  assert.ok(has("2030-05-30", /मासिक शिवरात्रि/)?.hinduTithi.includes("त्रयोदशी / चतुर्दशी"));
  assert.ok(has("2030-05-31", /वट सावित्री व्रत.*शनि जयंती.*ज्येष्ठ अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-09-29", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
  assert.ok(has("2030-10-02", /मासिक स्कन्द षष्ठी.*कात्यायनी/));
});

test("2030 Sharadiya Navratri puja labels match the actual tithi and Devi form", () => {
  assert.ok(has("2030-10-01", /पंचमी पूजा.*माँ स्कन्दमाता/));
  assert.ok(has("2030-10-02", /षष्ठी.*माँ कात्यायनी/));
  assert.ok(has("2030-10-03", /सप्तमी पूजा.*माँ कालरात्रि/));
  assert.ok(has("2030-10-04", /दुर्गाष्टमी.*सरस्वती पूजा/));
});

test("2030 Agastya Arghya remains a separate observance card", () => {
  assert.ok(has("2030-09-04", /अगस्त्य अर्घ्य/));
  assert.ok(has("2030-08-24", /अजा एकादशी/));
  assert.notEqual(
    has("2030-09-04", /अगस्त्य अर्घ्य/)?.title,
    has("2030-08-24", /अजा एकादशी/)?.title
  );
});

test("2030 only Pithoragarh-visible solar and partial lunar eclipses are listed", () => {
  const eclipses = events.filter(event => /ग्रहण/.test(event.title || ""));
  assert.equal(eclipses.filter(event => event.date === "2030-06-01").length, 1);
  assert.equal(eclipses.filter(event => event.date === "2030-06-15").length, 1);
  assert.equal(eclipses.some(event => event.date === "2030-11-25" || event.date === "2030-12-10"), false);
  const solar = has("2030-06-01", /आंशिक सूर्यग्रहण/);
  assert.match(solar.description, /3:57 बजे.*5:15:56 बजे.*6:38:21 बजे/);
  const lunar = has("2030-06-15", /आंशिक चंद्रग्रहण/);
  assert.match(lunar.description, /10:51 बजे.*1:15 बजे/);
});
