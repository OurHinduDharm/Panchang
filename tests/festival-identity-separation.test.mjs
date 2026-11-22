import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "data", "festivals");
function month(year, number) {
  return JSON.parse(readFileSync(join(root, year + "-" + String(number).padStart(2, "0") + ".json"), "utf8")).events || [];
}
function has(events, date, title) {
  return events.some(event => event.date === date && event.title === title);
}

test("Neem Karoli Baba Jayanti text preserves Ram and Hanuman devotion", () => {
  for (const [year, monthNumber, date] of [
    [2026, 12, "2026-12-17"],
    [2027, 12, "2027-12-06"],
    [2028, 11, "2028-11-24"],
    [2029, 12, "2029-12-13"],
    [2030, 12, "2030-12-02"]
  ]) {
    const event = month(year, monthNumber).find(item => item.date === date && item.title === "बाबा नीब करौरी जयंती");
    assert.ok(event, "missing Baba Neem Karoli Jayanti for " + year);
    assert.match(event.description, /महाराज का श्रद्धापूर्वक स्मरण/);
    assert.match(event.description, /श्रीराम और श्रीहनुमान जी के भजन/);
    assert.match(event.description, /‘श्रीराम’ नाम का जप/);
    assert.match(event.description, /श्रीराम और श्रीहनुमान जी के नाम पर अन्नदान/);
  }
});

test("independent observances sharing a date retain separate cards", () => {
  const checks = [
    [2026, 12, "2026-12-23", ["मार्गशीर्ष पूर्णिमा", "दत्तात्रेय जयंती", "अन्नपूर्णा सिद्धविद्या जयंती", "त्रिपुरभैरवी महाविद्या जयंती"]],
    [2026, 12, "2026-12-14", ["विवाह पंचमी", "नाग पंचमी (तेलुगु परंपरा)"]],
    [2030, 3, "2030-03-06", ["फुलेरा दूज", "श्रीरामकृष्ण परमहंस जयंती"]],
    [2030, 3, "2030-03-19", ["होलिका दहन", "फाल्गुन पूर्णिमा", "श्री महालक्ष्मी जयंती", "चैतन्य महाप्रभु जयंती", "सावर्णि मन्वादि तिथि"]],
    [2029, 11, "2029-11-13", ["मासिक दुर्गाष्टमी", "गोपाष्टमी"]],
    [2030, 2, "2030-02-06", ["गौरी गणेश चतुर्थी / गणेश जयंती", "माघ गुप्त नवरात्र चतुर्थ — माँ कूष्माण्डा"]],
    [2030, 2, "2030-02-09", ["रथ सप्तमी / सूर्य जयंती", "नर्मदा जयंती", "ब्रह्मसावर्णि मन्वादि तिथि", "माघ गुप्त नवरात्र सप्तमी — माँ कालरात्रि"]],
    [2030, 2, "2030-02-18", ["माघ पूर्णिमा", "ललिता षोडशी महाविद्या जयंती", "गुरु रविदास जयंती"]],
    [2030, 4, "2030-04-04", ["चन्द्र दर्शन", "चैत्र नवरात्र द्वितीय — माँ ब्रह्मचारिणी", "झूलेलाल जयंती"]],
    [2030, 4, "2030-04-12", ["श्रीराम नवमी", "चैत्र नवरात्र नवमी — माँ सिद्धिदात्री"]],
    [2030, 4, "2030-04-18", ["हनुमान जयंती", "चैत्र पूर्णिमा", "स्वरोचिष मन्वादि तिथि"]],
    [2030, 4, "2030-04-28", ["वरुथिनी एकादशी", "श्री वल्लभाचार्य जयंती"]],
    [2030, 10, "2030-10-06", ["विजयादशमी / दशहरा", "नवरात्रि पारण एवं कलश विसर्जन", "मध्वाचार्य जयंती"]],
    [2030, 10, "2030-10-15", ["करवा चौथ", "वक्रतुण्ड संकष्टी चतुर्थी"]],
    [2030, 10, "2030-10-28", ["भैया दूज / यम द्वितीया", "चन्द्र दर्शन", "चित्रगुप्त पूजा"]],
    [2030, 11, "2030-11-02", ["गोपाष्टमी", "मासिक दुर्गाष्टमी"]],
    [2030, 12, "2030-12-09", ["दत्तात्रेय जयंती", "मार्गशीर्ष पूर्णिमा", "त्रिपुरभैरवी महाविद्या जयंती", "अन्नपूर्णा जयंती"]]
  ];
  for (const [year, monthNumber, date, titles] of checks) {
    const events = month(year, monthNumber);
    for (const title of titles) assert.ok(has(events, date, title), year + " " + date + " missing separate card: " + title);
  }
});

test("independent saint jayantis are not merged with each other or Purnima", () => {
  const shankaraSurdas = [
    [2026, 4, "2026-04-21"], [2027, 5, "2027-05-10"], [2028, 4, "2028-04-29"],
    [2029, 5, "2029-05-18"], [2030, 5, "2030-05-18"]
  ];
  for (const [year, monthNumber, date] of shankaraSurdas) {
    const events = month(year, monthNumber);
    assert.ok(has(events, date, "आदि शंकराचार्य जयंती"), "missing Shankara Jayanti " + year);
    assert.ok(has(events, date, "सूरदास जयंती"), "missing Surdas Jayanti " + year);
  }
  const valmikiMeera = [
    [2026, 10, "2026-10-26"], [2027, 10, "2027-10-15"], [2028, 10, "2028-10-03"],
    [2029, 10, "2029-10-22"], [2030, 10, "2030-10-11"]
  ];
  for (const [year, monthNumber, date] of valmikiMeera) {
    const events = month(year, monthNumber);
    assert.ok(has(events, date, "वाल्मीकि जयंती"), "missing Valmiki Jayanti " + year);
    assert.ok(has(events, date, "मीराबाई जयंती"), "missing Meera Jayanti " + year);
    assert.ok(has(events, date, "आश्विन पूर्णिमा"), "missing Ashwin Purnima " + year);
  }
});
