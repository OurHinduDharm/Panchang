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
  assert.ok(has("2030-06-01", /शनि जयंती.*वट सावित्री व्रत.*ज्येष्ठ अमावस्या/));
  assert.ok(has("2030-06-07", /मासिक स्कन्द षष्ठी/));
  assert.ok(has("2030-06-09", /मासिक दुर्गाष्टमी.*धूमावती/));
  assert.ok(has("2030-06-10", /महेश नवमी/));
  assert.ok(has("2030-06-11", /गंगा दशहरा/));
  assert.ok(has("2030-06-12", /निर्जला एकादशी.*गायत्री जयंती.*रामलक्ष्मण द्वादशी/));
  assert.ok(has("2030-06-15", /ज्येष्ठ पूर्णिमा.*वट पूर्णिमा व्रत.*मिथुन संक्रांति.*बटुक भैरव.*वैवस्वत मन्वादि तिथि/));
  assert.ok(has("2030-06-22", /मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी/));
  assert.ok(has("2030-06-27", /कृष्ण रामलक्ष्मण द्वादशी/));
  assert.ok(has("2030-06-28", /शुक्र प्रदोष व्रत.*मासिक शिवरात्रि/)?.hinduTithi.includes("त्रयोदशी / चतुर्दशी"));
  assert.equal(has("2030-06-28", /^शुक्र प्रदोष व्रत$/), undefined);
  assert.ok(has("2030-06-30", /आषाढ़ अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-07-01", /आषाढ़ गुप्त नवरात्र प्रारंभ/)?.muhurtaRule === "ghata-sthapana");
  assert.ok(has("2030-07-04", /अनिरुद्ध चतुर्थी.*विनायक चतुर्थी.*चन्द्रघंटा/)?.muhurtaRule === "vinayaka-chaturthi-madhyahna");
  assert.ok(has("2030-07-07", /भानु सप्तमी.*कात्यायनी.*कालरात्रि/));
  assert.ok(has("2030-07-08", /मासिक दुर्गाष्टमी.*महागौरी.*पार्वती जयंती/));
  assert.ok(has("2030-07-09", /सिद्धिदात्री.*भड़ली नवमी/));
  assert.ok(has("2030-07-10", /आशा दशमी व्रत.*रैवत मन्वादि तिथि/));
  assert.ok(has("2030-07-11", /देवशयनी.*गौरी व्रत प्रारम्भ/)?.muhurtaRule === "ekadashi-parana");
  assert.ok(has("2030-07-12", /शुक्र प्रदोष व्रत.*वासुदेव द्वादशी/)?.hinduTithi.includes("द्वादशी / त्रयोदशी"));
  assert.equal(has("2030-07-12", /शुक्र प्रदोष व्रत/)?.muhurtaRule, "pradosh-kala");
  assert.ok(has("2030-07-17", /जयापार्वती व्रत समापन/));
  assert.ok(has("2030-07-14", /कोकिला व्रत.*व्यास पूजा.*चाक्षुष मन्वादि तिथि/));
  assert.ok(has("2030-07-15", /गुरु पूर्णिमा.*दक्षिणामूर्ति जयंती/));
  assert.equal(has("2030-07-16", /कर्क संक्रांति.*श्रावण मासारम्भ.*प्रथम मंगला गौरी/)?.muhurtaRule, "sankranti-punya-kala");
  assert.ok(has("2030-07-16", /कर्क संक्रांति.*श्रावण मासारम्भ.*प्रथम मंगला गौरी/)?.description.includes("17 जुलाई को 00:16 बजे"));
  assert.equal(has("2030-07-18", /गजानन संकष्टी/)?.muhurtaRule, "sankashti-chaturthi-moonrise");
  assert.ok(has("2030-07-21", /भानु सप्तमी/));
  assert.equal(has("2030-07-22", /प्रथम श्रावण सोमवार.*मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी/)?.muhurtaRule, "janmashtami-nishita");
  assert.ok(has("2030-07-23", /द्वितीय मंगला गौरी व्रत/));
  assert.equal(has("2030-07-26", /कामिका एकादशी \(स्मार्त\).*कृष्ण वासुदेव द्वादशी/)?.muhurtaRule, "ekadashi-parana");
  assert.equal(has("2030-07-27", /शनि प्रदोष व्रत/)?.muhurtaRule, "pradosh-kala");
  assert.equal(has("2030-07-28", /श्रावण शिवरात्रि.*मासिक शिवरात्रि/)?.muhurtaRule, "masik-shivaratri-nishita");
  assert.equal(has("2030-07-29", /द्वितीय श्रावण सोमवार/)?.hinduTithi, "श्रावण कृष्ण चतुर्दशी");
  assert.ok(has("2030-07-30", /हरियाली अमावस्या.*श्रावण अमावस्या.*दर्श अमावस्या.*तृतीय मंगला गौरी/));
  assert.ok(has("2030-08-04", /नाग पंचमी.*कल्कि जयंती/));
  assert.equal(has("2030-08-05", /मासिक स्कन्द षष्ठी/)?.hinduTithi, "श्रावण शुक्ल षष्ठी");
  assert.ok(has("2030-08-09", /वरलक्ष्मी व्रत.*श्रावण पुत्रदा एकादशी.*स्मार्त/)?.muhurtaRule === "ekadashi-parana");
  assert.equal(has("2030-08-11", /रवि प्रदोष व्रत/)?.muhurtaRule, "pradosh-kala");
  assert.equal(has("2030-08-13", /रक्षाबंधन/)?.muhurtaRule, "raksha-bandhan-thread");
  assert.ok(has("2030-08-16", /कजरी तीज/) && has("2030-08-16", /हेरम्ब संकष्टी/));
  assert.equal(has("2030-08-16", /हेरम्ब संकष्टी/)?.muhurtaRule, "sankashti-chaturthi-moonrise");
  assert.ok(has("2030-08-17", /सिंह संक्रांति/)?.muhurtaRule === "sankranti-punya-kala");
  assert.ok(has("2030-08-19", /हलषष्ठी/));

  assert.ok(has("2030-08-20", /मासिक कालाष्टमी.*श्रीकृष्ण जन्माष्टमी.*स्मार्त.*आद्याकाली.*विंध्यवासिनी/)?.muhurtaRule === "janmashtami-nishita");
  assert.equal(has("2030-08-21", /श्रीकृष्ण जन्माष्टमी/), undefined);
  assert.ok(has("2030-08-22", /दही हांडी/));
  assert.ok(has("2030-08-24", /अजा एकादशी/)?.muhurtaRule === "ekadashi-parana");
  assert.ok(has("2030-08-25", /बछबारस/));
  assert.ok(has("2030-08-26", /सोम प्रदोष व्रत/)?.muhurtaRule === "pradosh-kala");
  assert.ok(has("2030-08-27", /मासिक शिवरात्रि/)?.muhurtaRule === "masik-shivaratri-nishita");
  assert.ok(has("2030-08-28", /पिठोरी अमावस्या.*भाद्रपद अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-08-31", /वराह जयंती.*हरतालिका तीज.*रुद्र सावर्णि मन्वादि तिथि/));


  assert.ok(has("2030-09-04", /ललिता सप्तमी.*दूर्वाष्टमी.*ज्येष्ठा गौरी आवाहन/));
  assert.ok(has("2030-09-05", /राधाष्टमी.*महालक्ष्मी व्रत प्रारम्भ.*ज्येष्ठा गौरी पूजा.*दधीचि जयंती/));
  assert.ok(has("2030-09-06", /ज्येष्ठा गौरी विसर्जन.*दशावतार व्रत/));
  assert.ok(has("2030-09-08", /परिवर्तिनी.*स्मार्त.*वामन जयंती.*कल्कि द्वादशी/)?.muhurtaRule === "ekadashi-parana");
  assert.equal(has("2030-09-09", /सोम प्रदोष/)?.muhurtaRule, "pradosh-kala");
  assert.equal(has("2030-09-15", /विघ्नराज संकष्टी/)?.muhurtaRule, "sankashti-chaturthi-moonrise");
  assert.ok(has("2030-09-16", /महा भरणी श्राद्ध/));
  assert.equal(has("2030-09-17", /कन्या संक्रांति/)?.muhurtaRule, "sankranti-punya-kala");
  assert.ok(has("2030-09-19", /मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी.*महालक्ष्मी व्रत पूर्ण/)?.muhurtaRule === "janmashtami-nishita");
  assert.ok(has("2030-09-20", /जीवित्पुत्रिका व्रत/));
  assert.equal(has("2030-09-24", /कृष्ण कल्कि द्वादशी.*भौम प्रदोष/)?.muhurtaRule, "pradosh-kala");
  assert.ok(has("2030-09-27", /सर्वपितृ अमावस्या.*आश्विन अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-09-28", /महाराजा अग्रसेन जयंती.*शारदीय नवरात्रि प्रारम्भ/)?.muhurtaRule === "ghata-sthapana");
  assert.ok(has("2030-09-30", /कपर्दीश चतुर्थी.*शारदीय नवरात्र तृतीया-चतुर्थी/)?.muhurtaRule === "vinayaka-chaturthi-madhyahna");
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


test("2030 October-November-December source audit covers same-tithi and annual observances", () => {
  const oct = months[9].events;
  const nov = months[10].events;
  const dec = months[11].events;
  const at = (list, date, pattern) => list.find(event => event.date === date && pattern.test(event.title || ""));
  assert.equal(oct.length, 26);
  assert.equal(nov.length, 24);
  assert.equal(dec.length, 19);
  assert.ok(at(oct, "2030-10-01", /उपांग ललिता व्रत/));
  assert.ok(at(oct, "2030-10-05", /दक्ष सावर्णि मन्वादि तिथि/));
  assert.ok(at(oct, "2030-10-07", /पद्मनाभ द्वादशी.*काशी भरत मिलाप/));
  assert.ok(at(oct, "2030-10-19", /मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी.*अहोई अष्टमी/)?.muhurtaRule === "janmashtami-nishita");
  assert.equal(at(oct, "2030-10-19", /^अहोई अष्टमी$/), undefined);
  assert.ok(at(oct, "2030-10-23", /^गोवत्स द्वादशी.*कृष्ण पद्मनाभ द्वादशी$/)?.hinduTithi === "कार्तिक कृष्ण द्वादशी");
  assert.ok(at(oct, "2030-10-23", /^रमा एकादशी$/)?.hinduTithi === "कार्तिक कृष्ण एकादशी");
  assert.ok(at(oct, "2030-10-24", /यमदीपदान/));
  assert.ok(at(oct, "2030-10-25", /हनुमान पूजा/));
  assert.ok(at(oct, "2030-10-27", /अन्नकूट/));
  assert.ok(at(oct, "2030-10-28", /यम द्वितीया.*चित्रगुप्त पूजा/));
  assert.ok(at(oct, "2030-10-31", /लाभ पंचमी/)?.hinduTithi === "कार्तिक शुक्ल पंचमी");

  assert.ok(at(nov, "2030-11-02", /गोपाष्टमी.*मासिक दुर्गाष्टमी/));
  assert.ok(at(nov, "2030-11-03", /सतयुगादि तिथि.*अक्षय नवमी/));
  assert.ok(at(nov, "2030-11-05", /देवउठनी एकादशी \(स्मार्त\).*भीष्म पंचक प्रारम्भ/));
  assert.ok(at(nov, "2030-11-07", /गुरु प्रदोष.*विश्वेश्वर व्रत/));
  assert.ok(at(nov, "2030-11-08", /वैकुण्ठ चतुर्दशी.*मणिकर्णिका स्नान/));
  assert.ok(at(nov, "2030-11-09", /देव दीपावली/)?.muhurtaRule === "dev-deepawali-pradosh");
  assert.ok(at(nov, "2030-11-10", /कार्तिक पूर्णिमा.*गुरु नानक जयंती/));
  assert.equal(at(nov, "2030-11-10", /देव दीपावली/), undefined);
  assert.ok(at(nov, "2030-11-17", /भानु सप्तमी/));
  assert.ok(at(nov, "2030-11-18", /मासिक कृष्ण जन्माष्टमी/)?.muhurtaRule === "janmashtami-nishita");
  assert.ok(at(nov, "2030-11-22", /कृष्ण योगेश्वर द्वादशी/));
  assert.ok(at(nov, "2030-11-24", /बाला जयंती.*दर्श अमावस्या/));
  assert.ok(at(nov, "2030-11-25", /सोमवती अमावस्या/));

  assert.ok(at(dec, "2030-12-01", /भानु सप्तमी/));
  assert.ok(at(dec, "2030-12-06", /मत्स्य द्वादशी/)?.hinduTithi === "मार्गशीर्ष शुक्ल द्वादशी");
  assert.ok(at(dec, "2030-12-09", /अन्नपूर्णा जयंती/));
  assert.ok(at(dec, "2030-12-17", /मासिक कालाष्टमी.*मासिक कृष्ण जन्माष्टमी/)?.muhurtaRule === "janmashtami-nishita");
  assert.ok(at(dec, "2030-12-21", /कृष्ण मत्स्य द्वादशी/)?.hinduTithi === "पौष कृष्ण द्वादशी");
  assert.ok(at(dec, "2030-12-24", /दर्श अमावस्या.*पौष अमावस्या/));
  assert.ok(at(dec, "2030-12-31", /बाणदा अष्टमी.*मासिक दुर्गाष्टमी/));
  assert.equal(events.length, 264);
});
