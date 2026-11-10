import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cases = [
  { month: "2026-11", narak: "2026-11-08", kali: "2026-11-07" },
  { month: "2027-10", narak: "2027-10-28", kali: "2027-10-27" },
  { month: "2028-10", narak: "2028-10-17", kali: "2028-10-16" },
  { month: "2029-11", narak: "2029-11-05", kali: "2029-11-04" },
  { month: "2030-10", narak: "2030-10-26", kali: "2030-10-25" }
];
const KALI_URL = "https://ourhindudharm.blogspot.com/2022/09/Kakaradi-Kali-sahasranam-stotra.html";
async function readMonth(name) {
  return JSON.parse(await readFile(new URL("../data/festivals/" + name + ".json", import.meta.url), "utf8"));
}
test("Kali Chaudas and Narak Chaturdashi remain separate observances with the correct night/morning rituals in 2026–2030", async () => {
  for (const item of cases) {
    const data = await readMonth(item.month);
    const kali = data.events.find(e => e.date === item.kali && /काली चौदस/.test(e.title || ""));
    const narak = data.events.find(e => e.date === item.narak && /नरक चतुर्दशी/.test(e.title || ""));
    assert.ok(kali, "Kali Chaudas card missing in " + item.month);
    assert.ok(narak, "Narak Chaturdashi card missing in " + item.month);
    assert.notEqual(kali, narak);
    assert.equal(kali.articleUrl, KALI_URL);
    assert.match(kali.description, /निशीथ|रात्रि/);
    assert.match(narak.description, /अभ्यंग|अभ्यङ्ग/);
    assert.match(narak.description, /उबटन/);
    assert.equal((narak.description.match(/उबटन लगाने की परंपरा/g)||[]).length, 1);
    assert.ok(narak.muhurtaRule, "Abhyanga muhurta rule missing in " + item.month);
  }
});
test("Distinct observances on Diwali cluster dates have individual cards and the Kali stotra link is on the relevant night card", async () => {
  const cases = [
    {month:"2027-10",date:"2027-10-29",kamla:true,kaliPujaDate:"2027-10-28"},
    {month:"2028-10",date:"2028-10-17",kamla:true},
    {month:"2029-11",date:"2029-11-05",kamla:true},
    {month:"2030-10",date:"2030-10-26",kamla:true,kaliPujaDate:"2030-10-26"}
  ];
  for (const c of cases) {
    const d=await readMonth(c.month);
    const diwali=d.events.find(e=>e.date===c.date && /^दीपावली/.test(e.title||""));
    assert.ok(diwali,"Diwali card missing in "+c.month);
    assert.doesNotMatch(diwali.title,/कमला महाविद्या जयंती|काली पूजा|केदार गौरी व्रत/);
    assert.match(diwali.description,/Kakaradi-Kali-sahasranam-stotra/);
    if(c.kamla) {
      const kamla=d.events.find(e=>e.date===c.date && /कमला महाविद्या जयंती/.test(e.title||""));
      assert.ok(kamla);
      assert.equal(kamla.muhurtaRule,undefined);
      assert.equal(kamla.muhurtaRules,undefined);
    }
    if(c.kaliPujaDate) {
      const kp=d.events.find(e=>e.date===c.kaliPujaDate && /काली पूजा/.test(e.title||""));
      assert.ok(kp,"Kali Puja card missing in "+c.month);
      assert.equal(kp.articleUrl,KALI_URL);
      assert.equal(kp.muhurtaRule,undefined);
      assert.equal(kp.muhurtaRules,undefined);
    }
  }
});
test("The 2028 Bhishma Panchak start is not merged into Smarta Devutthani Ekadashi", async()=>{
 const d=await readMonth("2028-10");
 assert.ok(d.events.some(e=>e.title==="देवोत्थानी एकादशी (स्मार्त)"));
 assert.ok(d.events.some(e=>e.title==="भीष्म पंचक प्रारम्भ"));
});
