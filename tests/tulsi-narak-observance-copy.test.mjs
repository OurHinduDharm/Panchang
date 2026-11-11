import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const tulsiUrl = "https://ourhindudharm.blogspot.com/2013/11/About-Tulsi-vivah-On-Prabodhini-Ekadashi.html";
const tulsiGuidance = "द्वादशी से पूर्णिमा तक किसी भी दिन यह कर सकते हैं। रविवार को तुलसी-स्पर्श शास्त्रानुसार वर्जित है।";
const narakGuidance = "अभ्यंग स्नान: अरुणोदय में तैल-उबटन लगाएं। प्रति सदस्य पृथक अपामार्ग की टहनी, तोरई या लौकी मस्तक पर घुमाकर पैर से खंडित करें, फिर गृह-सीमा से बाहर फेंककर स्नान करें।";

async function readMonth(name) {
  return JSON.parse(await readFile(new URL("../data/festivals/" + name + ".json", import.meta.url), "utf8"));
}

test("Tulsi Vivah article and observance guidance are consistent for 2026–2030", async () => {
  const months = ["2026-11", "2027-11", "2028-10", "2029-11", "2030-11"];
  for (const name of months) {
    const data = await readMonth(name);
    const event = data.events.find(item => /तुलसी विवाह/.test(item.title || ""));
    assert.ok(event, "Tulsi Vivah card should exist in " + name);
    assert.equal(event.articleUrl, tulsiUrl, "Tulsi article URL should be canonical in " + name);
    assert.ok((event.description || "").includes(tulsiUrl), "Tulsi link should appear in the card description for " + name);
    assert.ok(event.description.includes(tulsiGuidance), "Tulsi observance guidance should appear in " + name);
    assert.equal(event.articleLabel, "प्रबोधिनी एकादशी पर तुलसी विवाह");
  }
});

test("Narak Chaturdashi cards include the complete Abhyanga Snan procedure for 2026–2030", async () => {
  const months = ["2026-11", "2027-10", "2028-10", "2029-11", "2030-10"];
  for (const name of months) {
    const data = await readMonth(name);
    const event = data.events.find(item => /नरक चतुर्दशी/.test(item.title || ""));
    assert.ok(event, "Narak Chaturdashi card should exist in " + name);
    assert.match(event.description, /अभ्यंग स्नान:/, "Abhyanga Snan section label should appear in " + name);
    assert.match(event.description, /प्रति सदस्य पृथक अपामार्ग की टहनी/, "Complete traditional procedure should appear in " + name);
    if (name === "2030-10") {
      assert.match(event.description, /दूसरे दिन चंद्रोदय से सूर्योदय तक अभ्यंग-स्नान/);
      assert.match(event.description, /दोनों दिनों के अरुणोदय और चंद्रोदय में चतुर्दशी की व्याप्ति नहीं होने पर/);
    } else {
      assert.ok(event.description.includes(narakGuidance), "Abhyanga Snan procedure should appear in " + name);
    }
  }
});
