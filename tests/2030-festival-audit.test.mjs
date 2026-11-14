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

test("2030 catalog keeps distinct same-date observances on separate cards", () => {
  const seen = new Map();
  const allowedSameDate = new Map([
    ["2030-10-24|कार्तिक कृष्ण त्रयोदशी", new Set(["धनतेरस / धन्वन्तरि जयंती / यमदीपदान", "गुरु प्रदोष व्रत"])],
    ["2030-10-25|कार्तिक कृष्ण चतुर्दशी", new Set(["काली चौदस", "मासिक शिवरात्रि", "हनुमान पूजा"])],
    ["2030-10-26|कार्तिक कृष्ण अमावस्या", new Set(["दीपावली / लक्ष्मी-गणेश पूजन", "श्री कमला महाविद्या जयंती", "काली पूजा"])],
    ["2030-06-22|आषाढ़ कृष्ण सप्तमी / अष्टमी व्याप्ति", new Set(["मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी"])],
    ["2030-07-22|श्रावण कृष्ण अष्टमी", new Set(["प्रथम श्रावण सोमवार", "मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी"])],
    ["2030-08-09|श्रावण शुक्ल एकादशी", new Set(["वरलक्ष्मी व्रत", "श्रावण पुत्रदा एकादशी (स्मार्त)"])],
    ["2030-08-20|भाद्रपद कृष्ण सप्तमी (अष्टमी निशीथ-व्याप्ति)", new Set(["श्रीकृष्ण जन्माष्टमी (स्मार्त)", "मासिक कालाष्टमी", "आद्याकाली महाविद्या जयंती", "विंध्यवासिनी जयंती"])],
    ["2030-08-25|भाद्रपद कृष्ण द्वादशी", new Set(["बछबारस (वत्स द्वादशी)", "कृष्ण दामोदर द्वादशी"])],
    ["2030-09-08|भाद्रपद शुक्ल एकादशी / द्वादशी व्याप्ति", new Set(["परिवर्तिनी / पार्श्व एकादशी (स्मार्त)", "वामन जयंती", "कल्कि द्वादशी", "दामोदर-द्वादशी व्रत", "नीराजन-व्रत"])],
    ["2030-10-19|कार्तिक कृष्ण सप्तमी (अष्टमी व्याप्ति)", new Set(["अहोई अष्टमी", "राधाकुण्ड स्नान", "मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी"])],
    ["2030-11-18|मार्गशीर्ष कृष्ण अष्टमी", new Set(["कालभैरव जयंती", "मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी"])],
    ["2030-12-02|मार्गशीर्ष शुक्ल अष्टमी", new Set(["मासिक दुर्गाष्टमी", "बाबा नीब करौरी जयंती"])],
    ["2030-12-09|मार्गशीर्ष शुक्ल पूर्णिमा", new Set(["दत्तात्रेय जयंती / मार्गशीर्ष पूर्णिमा", "त्रिपुरभैरवी महाविद्या जयंती", "अन्नपूर्णा जयंती"])],
    ["2030-12-17|पौष कृष्ण सप्तमी (अष्टमी व्याप्ति)", new Set(["मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी"])],
    ["2030-02-24|फाल्गुन कृष्ण सप्तमी / अष्टमी", new Set(["भानु सप्तमी", "शबरी जयंती", "मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी"])],
    ["2030-03-26|चैत्र कृष्ण अष्टमी", new Set(["शीतला अष्टमी / बसोड़ा", "मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी"])],
    ["2030-09-19|आश्विन कृष्ण सप्तमी (अष्टमी व्याप्ति)", new Set(["मासिक कालाष्टमी", "मासिक कृष्ण जन्माष्टमी", "महालक्ष्मी व्रत समापन", "अष्टमी श्राद्ध"])],
    ["2030-10-23|कार्तिक कृष्ण द्वादशी", new Set(["गोवत्स द्वादशी", "कृष्ण पद्मनाभ द्वादशी"])],
    ["2030-05-14|वैशाख शुक्ल द्वादशी (त्रिस्पर्शा)", new Set(["माधव-द्वादशी व्रत", "परशुराम-द्वादशी"])],
    ["2030-03-01|फाल्गुन कृष्ण द्वादशी", new Set(["कृष्ण भीष्म द्वादशी"])],
    ["2030-03-01|फाल्गुन कृष्ण त्रयोदशी", new Set(["शुक्र प्रदोष व्रत"])]
  ]);
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    if (seen.has(key)) {
      const allowed = allowedSameDate.get(key);
      assert.ok(allowed && allowed.has(seen.get(key)) && allowed.has(event.title),
        "Unexpected same-date/tithi combination: " + key + ": " + seen.get(key) + " / " + event.title);
    }
    seen.set(key, event.title);
  }
});

test("2030 Ekadashi cards follow the Smarta-only policy", () => {
  assert.equal(events.filter(event => /(गौण|वैष्णव)/.test(event.title || "")).length, 0);
  assert.ok(has("2030-11-05", /देवोत्थानी एकादशी \(स्मार्त\)/));
  assert.ok(has("2030-11-21", /उत्पन्ना एकादशी \(स्मार्त\)/));
});

test("2030 important annual festivals and jayantis are represented", () => {
  assert.ok(has("2030-01-10", /श्री गुरु गोबिंद सिंह जयंती/));
  assert.ok(has("2030-01-15", /धर्मसावर्णि मन्वादि/));
  assert.ok(has("2030-01-13", /लोहड़ी/));
  assert.ok(has("2030-01-15", /तैलंग स्वामी जयंती/));
  assert.ok(has("2030-02-18", /गुरु रविदास जयंती/));
  assert.ok(has("2030-02-23", /यशोदा जयंती/));
  assert.ok(has("2030-02-24", /^भानु सप्तमी$/));
  assert.ok(has("2030-02-24", /^शबरी जयंती$/));
  assert.ok(has("2030-02-25", /जानकी जयंती/));
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
  assert.equal(events.filter(event => event.date === "2030-05-08" && /आदि शंकराचार्य जयंती|सूरदास जयंती/.test(event.title || "")).length, 1);
  assert.ok(has("2030-05-08", /मासिक स्कन्द षष्ठी/)?.hinduTithi.includes("पंचमी / षष्ठी"));
  assert.ok(has("2030-06-04", /महाराणा प्रताप जयंती/));
  assert.ok(has("2030-08-06", /गोस्वामी तुलसीदास जयंती/));
  assert.ok(has("2030-10-06", /मध्वाचार्य जयंती/));
  assert.ok(has("2030-10-11", /वाल्मीकि जयंती.*मीराबाई जयंती/));
  assert.ok(has("2030-12-30", /गुरु गोबिंद सिंह जयंती/));
  assert.ok(has("2030-08-06", /गोस्वामी तुलसीदास जयंती/));
  assert.ok(has("2030-12-02", /बाबा नीब करौरी जयंती/));
  assert.equal(events.some(event => /कबीर जयंती|कबीरदास जयंती|विवेकानंद जयंती|स्वामी विवेकानंद|दयानंद सरस्वती जयंती|गांधी जयंती|प्रभुपाद जयंती/.test(event.title || "")), false);
});

test("2030 same-tithi festival observances preserve distinct cards where required", () => {
  assert.ok(has("2030-03-03", /द्वापरादि तिथि.*दर्श अमावस्या/));
  const bhishma=has("2030-03-01", /^कृष्ण भीष्म द्वादशी$/);
  const shukraPradosh=has("2030-03-01", /^शुक्र प्रदोष व्रत$/);
  assert.ok(bhishma);
  assert.ok(shukraPradosh);
  assert.equal(bhishma.hinduTithi,"फाल्गुन कृष्ण द्वादशी");
  assert.equal(bhishma.muhurtaRule,undefined);
  assert.equal(shukraPradosh.hinduTithi,"फाल्गुन कृष्ण त्रयोदशी");
  assert.equal(shukraPradosh.muhurtaRule,"pradosh-kala");
  assert.equal(has("2030-03-01", /कृष्ण भीष्म द्वादशी.*शुक्र प्रदोष/),undefined);
  assert.ok(has("2030-03-16", /नृसिंह द्वादशी/));
  assert.ok(has("2030-03-26", /^शीतला अष्टमी \/ बसोड़ा$/));
  assert.ok(has("2030-03-26", /^मासिक कालाष्टमी$/));
  assert.equal(has("2030-03-26", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
  assert.ok(has("2030-02-03", /चन्द्र दर्शन.*माघ गुप्त नवरात्र प्रारंभ/));
  assert.ok(has("2030-02-06", /गौरी गणेश.*कूष्माण्डा/));
  assert.ok(has("2030-02-07", /वसंत पंचमी.*स्कन्दमाता/));
  assert.ok(has("2030-02-08", /मासिक स्कन्द षष्ठी.*कात्यायनी/));
  assert.ok(has("2030-02-09", /रथ सप्तमी.*नर्मदा जयंती.*ब्रह्मसावर्णि मन्वादि तिथि.*कालरात्रि/));
  assert.ok(has("2030-02-24", /^भानु सप्तमी$/));
  assert.ok(has("2030-02-24", /^शबरी जयंती$/));
  assert.ok(has("2030-02-24", /^मासिक कालाष्टमी$/));
  assert.equal(has("2030-02-24", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
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
  const madhavaDwadashi = has("2030-05-14", /^माधव-द्वादशी व्रत$/);
  const parashuramaDwadashi = has("2030-05-14", /^परशुराम-द्वादशी$/);
  assert.ok(madhavaDwadashi);
  assert.ok(parashuramaDwadashi);
  assert.notEqual(madhavaDwadashi, parashuramaDwadashi);
  assert.equal(madhavaDwadashi.hinduTithi, "वैशाख शुक्ल द्वादशी (त्रिस्पर्शा)");
  assert.equal(parashuramaDwadashi.hinduTithi, "वैशाख शुक्ल द्वादशी (त्रिस्पर्शा)");
  assert.equal(madhavaDwadashi.muhurtaRule, undefined);
  assert.equal(parashuramaDwadashi.muhurtaRule, undefined);
  assert.equal(parashuramaDwadashi.followingMorningActionDate, "2030-05-15");
  assert.equal(has("2030-05-14", /माधव-द्वादशी.*परशुराम-द्वादशी/), undefined);
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
  assert.ok(has("2030-06-22", /^मासिक कालाष्टमी$/));
  assert.equal(has("2030-06-22", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
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
  assert.ok(has("2030-07-22", /^प्रथम श्रावण सोमवार$/));
  assert.ok(has("2030-07-22", /^मासिक कालाष्टमी$/));
  assert.equal(has("2030-07-22", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
  assert.ok(has("2030-07-23", /द्वितीय मंगला गौरी व्रत/));
  assert.equal(has("2030-07-26", /^कामिका एकादशी \(स्मार्त\)$/)?.muhurtaRule, "ekadashi-parana");
  assert.equal(has("2030-07-26", /^कामिका एकादशी \(स्मार्त\)$/)?.hinduTithi, "श्रावण कृष्ण एकादशी");
  assert.equal(has("2030-07-26", /^कृष्ण वासुदेव द्वादशी$/)?.muhurtaRule, undefined);
  assert.equal(has("2030-07-26", /^कृष्ण वासुदेव द्वादशी$/)?.hinduTithi, "श्रावण कृष्ण द्वादशी");
  assert.equal(has("2030-07-27", /शनि प्रदोष व्रत/)?.muhurtaRule, "pradosh-kala");
  assert.equal(has("2030-07-28", /श्रावण शिवरात्रि.*मासिक शिवरात्रि/)?.muhurtaRule, "masik-shivaratri-nishita");
  assert.equal(has("2030-07-29", /द्वितीय श्रावण सोमवार/)?.hinduTithi, "श्रावण कृष्ण चतुर्दशी");
  assert.ok(has("2030-07-30", /हरियाली अमावस्या.*श्रावण अमावस्या.*दर्श अमावस्या.*तृतीय मंगला गौरी/));
  assert.ok(has("2030-08-04", /नाग पंचमी.*कल्कि जयंती/));
  assert.equal(has("2030-08-05", /मासिक स्कन्द षष्ठी/)?.hinduTithi, "श्रावण शुक्ल षष्ठी");
  assert.equal(has("2030-08-09", /^वरलक्ष्मी व्रत$/)?.muhurtaRule, undefined);
  assert.equal(has("2030-08-09", /^श्रावण पुत्रदा एकादशी \(स्मार्त\)$/)?.muhurtaRule, "ekadashi-parana");
  assert.equal(has("2030-08-11", /रवि प्रदोष व्रत/)?.muhurtaRule, "pradosh-kala");
  assert.equal(has("2030-08-13", /रक्षाबंधन/)?.muhurtaRule, "raksha-bandhan-thread");
  assert.ok(has("2030-08-16", /कजरी तीज/) && has("2030-08-16", /हेरम्ब संकष्टी/));
  assert.equal(has("2030-08-16", /हेरम्ब संकष्टी/)?.muhurtaRule, "sankashti-chaturthi-moonrise");
  assert.ok(has("2030-08-17", /सिंह संक्रांति/)?.muhurtaRule === "sankranti-punya-kala");
  assert.ok(has("2030-08-19", /हलषष्ठी/));

  assert.equal(has("2030-08-20", /^श्रीकृष्ण जन्माष्टमी \(स्मार्त\)$/)?.muhurtaRule, "janmashtami-nishita");
  assert.equal(has("2030-08-20", /^मासिक कालाष्टमी$/)?.muhurtaRule, undefined);
  assert.ok(has("2030-08-20", /^आद्याकाली महाविद्या जयंती$/));
  assert.ok(has("2030-08-20", /^विंध्यवासिनी जयंती$/));
  assert.equal(has("2030-08-21", /श्रीकृष्ण जन्माष्टमी/), undefined);
  assert.ok(has("2030-08-22", /दही हांडी/));
  assert.ok(has("2030-08-24", /अजा एकादशी/)?.muhurtaRule === "ekadashi-parana");
  assert.ok(has("2030-08-25", /बछबारस/));
  assert.equal(has("2030-08-25", /जयन्ती महाद्वादशी|जयन्ती द्वादशी/), undefined);
  const krishnaDamodara=has("2030-08-25", /कृष्ण दामोदर द्वादशी/);
  assert.ok(krishnaDamodara);
  assert.equal(krishnaDamodara.hinduTithi,"भाद्रपद कृष्ण द्वादशी");
  assert.equal(krishnaDamodara.muhurtaRule,undefined);
  assert.ok(has("2030-08-26", /सोम प्रदोष व्रत/)?.muhurtaRule === "pradosh-kala");
  assert.ok(has("2030-08-27", /मासिक शिवरात्रि/)?.muhurtaRule === "masik-shivaratri-nishita");
  assert.ok(has("2030-08-28", /पिठोरी अमावस्या.*भाद्रपद अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-08-31", /वराह जयंती.*हरतालिका तीज.*रुद्र सावर्णि मन्वादि तिथि/));


  assert.ok(has("2030-09-04", /ललिता सप्तमी.*दूर्वाष्टमी.*ज्येष्ठा गौरी आवाहन/));
  assert.ok(has("2030-09-05", /राधाष्टमी.*महालक्ष्मी व्रत प्रारम्भ.*ज्येष्ठा गौरी पूजा.*दधीचि जयंती/));
  assert.ok(has("2030-09-06", /ज्येष्ठा गौरी विसर्जन.*दशावतार व्रत/));
  assert.equal(has("2030-09-08", /^परिवर्तिनी \/ पार्श्व एकादशी \(स्मार्त\)$/)?.muhurtaRule, "ekadashi-parana");
  assert.equal(has("2030-09-08", /^वामन जयंती$/)?.muhurtaRule, undefined);
  assert.equal(has("2030-09-08", /^कल्कि द्वादशी$/)?.muhurtaRule, undefined);
  const damodaraDwadashi=has("2030-09-08", /^दामोदर-द्वादशी व्रत$/);
  const niranjanaVrata=has("2030-09-08", /^नीराजन-व्रत$/);
  const kalkiDwadashi=has("2030-09-08", /^कल्कि द्वादशी$/);
  assert.ok(damodaraDwadashi);
  assert.ok(niranjanaVrata);
  assert.ok(kalkiDwadashi);
  assert.equal(damodaraDwadashi.hinduTithi,"भाद्रपद शुक्ल एकादशी / द्वादशी व्याप्ति");
  assert.equal(niranjanaVrata.hinduTithi,"भाद्रपद शुक्ल एकादशी / द्वादशी व्याप्ति");
  assert.equal(damodaraDwadashi.muhurtaRule,undefined);
  assert.equal(niranjanaVrata.muhurtaRule,undefined);
  assert.equal(niranjanaVrata.ritualTime,"रात्रि-संध्या");
  assert.equal(kalkiDwadashi.followingMorningActionDate,"2030-09-09");
  assert.equal(has("2030-09-09", /^दामोदर-द्वादशी व्रत$/),undefined);
  assert.equal(has("2030-09-09", /^नीराजन-व्रत$/),undefined);
  assert.equal(has("2030-09-09", /^भुवनेश्वरी महाविद्या जयंती$/)?.hinduTithi, "भाद्रपद शुक्ल द्वादशी");
  assert.equal(has("2030-09-09", /^भुवनेश्वरी महाविद्या जयंती$/)?.muhurtaRule, undefined);
  assert.equal(has("2030-09-09", /^सोम प्रदोष व्रत$/)?.hinduTithi, "भाद्रपद शुक्ल त्रयोदशी");
  assert.equal(has("2030-09-09", /^सोम प्रदोष व्रत$/)?.muhurtaRule, "pradosh-kala");
  assert.equal(has("2030-09-15", /विघ्नराज संकष्टी/)?.muhurtaRule, "sankashti-chaturthi-moonrise");
  assert.ok(has("2030-09-16", /महा भरणी श्राद्ध/));
  assert.equal(has("2030-09-17", /कन्या संक्रांति/)?.muhurtaRule, "sankranti-punya-kala");
  assert.equal(has("2030-09-19", /^मासिक कालाष्टमी$/)?.muhurtaRule, undefined);
  assert.equal(has("2030-09-19", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
  assert.ok(has("2030-09-19", /^महालक्ष्मी व्रत समापन$/));
  assert.ok(has("2030-09-19", /^अष्टमी श्राद्ध$/));
  assert.ok(has("2030-09-20", /जीवित्पुत्रिका व्रत/));
  assert.equal(has("2030-09-24", /कृष्ण कल्कि द्वादशी.*भौम प्रदोष/)?.muhurtaRule, "pradosh-kala");
  assert.ok(has("2030-09-27", /सर्वपितृ अमावस्या.*आश्विन अमावस्या.*दर्श अमावस्या/));
  assert.ok(has("2030-09-28", /महाराजा अग्रसेन जयंती.*शारदीय नवरात्रि प्रारम्भ/)?.muhurtaRule === "ghata-sthapana");
  assert.ok(has("2030-09-30", /कपर्दीश चतुर्थी.*शारदीय नवरात्र तृतीया-चतुर्थी/)?.muhurtaRule === "vinayaka-chaturthi-madhyahna");
  assert.ok(has("2030-09-29", /चन्द्र दर्शन.*ब्रह्मचारिणी/));
  assert.ok(has("2030-10-02", /मासिक स्कन्द षष्ठी.*कात्यायनी/));
});

test("2030 October-December descriptions do not repeat the same article link", () => {
  for (const event of events.filter(event => /^2030-(10|11|12)-/.test(event.date))) {
    const hrefs = [...String(event.description || "").matchAll(/href=["']([^"']+)["']/g)]
      .map(match => match[1]);
    assert.equal(new Set(hrefs).size, hrefs.length,
      event.date + " " + event.title + " repeats an article link");
  }
});

test("2030 Sankashti, Narak Chaturdashi and Diwali retain their specific timing rules", () => {
  for (const event of events.filter(event => /संकष्टी/.test(event.title || ""))) {
    const ruleIds = Array.isArray(event.muhurtaRules) ? event.muhurtaRules : [event.muhurtaRule];
    assert.ok(
      ruleIds.some(rule => ["sankashti-chaturthi-moonrise", "karwa-chauth-puja"].includes(rule)),
      event.date + " " + event.title + " is missing its moonrise/puja rule"
    );
  }
  assert.equal(has("2030-10-26", /नरक चतुर्दशी/)?.muhurtaRule,
    "narak-chaturdashi-kshaya-abhyanga");
  assert.deepEqual(has("2030-10-26", /दीपावली/)?.muhurtaRules,
    ["diwali-lakshmi-puja"]);
});

test("2030 every Pradosh observance has its correct local muhurta rule", () => {
  const allowed = new Set([
    "pradosh-kala",
    "dev-deepawali-pradosh"
  ]);
  for (const event of events.filter(event => /प्रदोष/.test(event.title || ""))) {
    const ruleIds = Array.isArray(event.muhurtaRules) ? event.muhurtaRules : [event.muhurtaRule];
    assert.ok(ruleIds.some(rule => allowed.has(rule)),
      event.date + " " + event.title + " is missing a Pradosh-capable muhurta rule");
  }
  assert.deepEqual(has("2030-06-28", /शुक्र प्रदोष.*मासिक शिवरात्रि/)?.muhurtaRules,
    ["pradosh-kala", "masik-shivaratri-nishita"]);
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
  assert.equal(solar.hinduTithi, "ज्येष्ठ अमावस्या");
  assert.match(solar.description, /1 जून 2030 को पिथौरागढ़ में आंशिक सूर्यग्रहण दिखाई देगा/);
  assert.doesNotMatch(solar.description, /\d{1,2}:\d{2}/,
    "Do not publish local solar-eclipse contacts while the Pithoragarh timing source remains unresolved");
  assert.match(solar.sourceName || "", /NASA 2030 eclipse catalog/);
  const lunar = has("2030-06-15", /आंशिक चंद्रग्रहण/);
  assert.match(lunar.description, /10:51 बजे.*1:15 बजे/);
  assert.match(lunar.description, /16 जून 00:03 बजे/);
});


test("2030 October-November-December source audit covers same-tithi and annual observances", () => {
  const oct = months[9].events;
  const nov = months[10].events;
  const dec = months[11].events;
  const at = (list, date, pattern) => list.find(event => event.date === date && pattern.test(event.title || ""));
  assert.equal(months[1].events.length, 23);
  assert.equal(months[2].events.length, 24);
  assert.equal(months[8].events.length, 34);
  assert.equal(oct.length, 35);
  assert.equal(nov.length, 26);
  assert.equal(dec.length, 23);
  assert.ok(at(oct, "2030-10-01", /उपांग ललिता व्रत/));
  assert.ok(at(oct, "2030-10-05", /दक्ष सावर्णि मन्वादि तिथि/));
  assert.ok(at(oct, "2030-10-07", /पद्मनाभ द्वादशी.*काशी भरत मिलाप/));
  assert.ok(at(oct, "2030-10-19", /^अहोई अष्टमी$/));
  assert.ok(at(oct, "2030-10-19", /^राधाकुण्ड स्नान$/));
  assert.equal(at(oct, "2030-10-19", /^मासिक कालाष्टमी$/)?.muhurtaRule, undefined);
  assert.equal(at(oct, "2030-10-19", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
  assert.equal(at(oct, "2030-10-23", /^गोवत्स द्वादशी$/)?.hinduTithi, "कार्तिक कृष्ण द्वादशी");
  assert.equal(at(oct, "2030-10-23", /^गोवत्स द्वादशी$/)?.muhurtaRule, "govatsa-dwadashi-pradosh-kala");
  assert.equal(at(oct, "2030-10-23", /^कृष्ण पद्मनाभ द्वादशी$/)?.hinduTithi, "कार्तिक कृष्ण द्वादशी");
  assert.equal(at(oct, "2030-10-23", /^कृष्ण पद्मनाभ द्वादशी$/)?.muhurtaRule, undefined);
  assert.ok(at(oct, "2030-10-23", /^रमा एकादशी$/)?.hinduTithi === "कार्तिक कृष्ण एकादशी");
  assert.ok(at(oct, "2030-10-24", /यमदीपदान/));
  assert.ok(at(oct, "2030-10-25", /हनुमान पूजा/));
  assert.ok(at(oct, "2030-10-27", /अन्नकूट/));
  assert.ok(at(oct, "2030-10-28", /यम द्वितीया.*चित्रगुप्त पूजा/));
  assert.ok(at(oct, "2030-10-31", /लाभ पंचमी/)?.hinduTithi === "कार्तिक शुक्ल पंचमी");

  assert.ok(at(nov, "2030-11-02", /गोपाष्टमी.*मासिक दुर्गाष्टमी/));
  assert.ok(at(nov, "2030-11-03", /सतयुगादि तिथि.*अक्षय नवमी/));
  assert.ok(at(nov, "2030-11-05", /देवोत्थानी एकादशी \(स्मार्त\).*भीष्म पंचक प्रारम्भ/));
  assert.ok(at(nov, "2030-11-07", /गुरु प्रदोष.*विश्वेश्वर व्रत/));
  assert.ok(at(nov, "2030-11-08", /वैकुण्ठ चतुर्दशी.*मणिकर्णिका स्नान/));
  assert.ok(at(nov, "2030-11-09", /देव दीपावली/)?.muhurtaRule === "dev-deepawali-pradosh");
  assert.ok(at(nov, "2030-11-10", /कार्तिक पूर्णिमा.*गुरु नानक जयंती/));
  assert.equal(at(nov, "2030-11-10", /देव दीपावली/), undefined);
  assert.ok(at(nov, "2030-11-17", /भानु सप्तमी/));
  assert.ok(at(nov, "2030-11-18", /^कालभैरव जयंती$/));
  assert.equal(at(nov, "2030-11-18", /^मासिक कालाष्टमी$/)?.muhurtaRule, undefined);
  assert.equal(at(nov, "2030-11-18", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
  assert.ok(at(nov, "2030-11-22", /कृष्ण योगेश्वर द्वादशी/));
  assert.ok(at(nov, "2030-11-24", /बाला जयंती.*दर्श अमावस्या/));
  assert.ok(at(nov, "2030-11-25", /सोमवती अमावस्या/));

  assert.ok(at(dec, "2030-12-01", /भानु सप्तमी/));
  assert.ok(at(dec, "2030-12-06", /मत्स्य द्वादशी/)?.hinduTithi === "मार्गशीर्ष शुक्ल द्वादशी");
  assert.ok(at(dec, "2030-12-09", /^दत्तात्रेय जयंती \/ मार्गशीर्ष पूर्णिमा$/));
  assert.ok(at(dec, "2030-12-09", /^त्रिपुरभैरवी महाविद्या जयंती$/));
  assert.ok(at(dec, "2030-12-09", /^अन्नपूर्णा जयंती$/));
  assert.equal(at(dec, "2030-12-17", /^मासिक कालाष्टमी$/)?.muhurtaRule, undefined);
  assert.equal(at(dec, "2030-12-17", /^मासिक कृष्ण जन्माष्टमी$/)?.muhurtaRule, "janmashtami-nishita");
  assert.ok(at(dec, "2030-12-21", /कृष्ण मत्स्य द्वादशी/)?.hinduTithi === "पौष कृष्ण द्वादशी");
  assert.ok(at(dec, "2030-12-24", /दर्श अमावस्या.*पौष अमावस्या/));
  assert.ok(at(dec, "2030-12-31", /बाणदा अष्टमी.*मासिक दुर्गाष्टमी/));
  assert.equal(events.length, 301);

  // Every Pradosh observance must use the local sunset/tithi-overlap rule.
  assert.equal(at(oct, "2030-10-08", /भौम प्रदोष/)?.muhurtaRule, "pradosh-kala");
  assert.equal(at(oct, "2030-10-24", /^गुरु प्रदोष व्रत$/)?.muhurtaRule, "pradosh-kala");
  assert.equal(at(oct, "2030-10-24", /धनतेरस/)?.muhurtaRule, "dhanteras-muhurta");
  assert.equal(at(oct, "2030-10-24", /धनतेरस/)?.muhurtaRules, undefined);
  assert.equal(at(nov, "2030-11-07", /गुरु प्रदोष/)?.muhurtaRule, "pradosh-kala");
  assert.equal(at(nov, "2030-11-23", /शनि प्रदोष/)?.muhurtaRule, "pradosh-kala");
  assert.equal(at(dec, "2030-12-07", /शनि प्रदोष/)?.muhurtaRule, "pradosh-kala");
  assert.equal(at(dec, "2030-12-22", /रवि प्रदोष/)?.muhurtaRule, "pradosh-kala");

  // Deepawali must render its city-specific Lakshmi-Ganesha puja windows.
  assert.deepEqual(at(oct, "2030-10-26", /दीपावली.*लक्ष्मी-गणेश पूजन/)?.muhurtaRules, ["diwali-lakshmi-puja"]);
  assert.match(at(oct, "2030-10-25", /हनुमान पूजा/)?.description || "", /हनुमान जी की विशेष पूजा/);
});


test("2030 Kalashtami records never carry a Janmashtami rule unless Janmashtami is also named", () => {
  for (const event of events.filter(event => /कालाष्टमी|कालभैरव/.test(event.title || ""))) {
    const rules = Array.isArray(event.muhurtaRules) ? event.muhurtaRules : [event.muhurtaRule].filter(Boolean);
    if (!/कृष्ण जन्माष्टमी/.test(event.title || "")) {
      assert.equal(rules.includes("janmashtami-nishita"), false,
        event.date + " " + event.title + " has an unrelated Janmashtami muhurta rule");
    }
  }
});

test("2030 separated recurring Janmashtami cards alone own Nishita muhurta", () => {
  const dates = ["2030-06-22","2030-07-22","2030-10-19","2030-11-18","2030-12-17"];
  for (const date of dates) {
    const janmashtami = events.find(event => event.date === date && /^मासिक कृष्ण जन्माष्टमी$/.test(event.title || ""));
    const kalashtami = events.find(event => event.date === date && /^मासिक कालाष्टमी$/.test(event.title || ""));
    assert.equal(janmashtami?.muhurtaRule, "janmashtami-nishita", date + " monthly Janmashtami must retain Nishita");
    assert.equal(kalashtami?.muhurtaRule, undefined, date + " Kalashtami must not inherit Janmashtami Nishita");
  }
  const separateJanmashtami = events.find(event => event.date === "2030-08-20" && event.title === "श्रीकृष्ण जन्माष्टमी (स्मार्त)");
  assert.equal(separateJanmashtami?.muhurtaRule, "janmashtami-nishita");
});

test("2030 February, March and September split recurring tithi observances from major festivals", () => {
  for (const date of ["2030-02-24","2030-03-26","2030-09-19"]) {
    const janmashtami = events.find(event => event.date === date && event.title === "मासिक कृष्ण जन्माष्टमी");
    const kalashtami = events.find(event => event.date === date && event.title === "मासिक कालाष्टमी");
    assert.equal(janmashtami?.muhurtaRule, "janmashtami-nishita", date + " monthly Janmashtami must own Nishita");
    assert.equal(kalashtami?.muhurtaRule, undefined, date + " Kalashtami must not inherit Nishita");
  }
});

