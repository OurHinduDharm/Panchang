import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const month = number => JSON.parse(readFileSync(join(folder, \`2027-\${String(number).padStart(2,"0")}.json\`), "utf8"));
const year = Array.from({length:12}, (_,i) => month(i+1));
const events = year.flatMap(data => data.events);
const find = (m, date, pattern) => month(m).events.find(event => event.date === date && pattern.test(event.title || ""));

test("2027 festival catalog excludes Vaishnava/Gauna Ekadashi cards", () => {
  const excluded = events.filter(event =>
    event.category === "एकादशी" && /(गौण|वैष्णव)/.test(event.title || ""));
  assert.deepEqual(excluded, []);
});

test("2027 has one card per same-date Hindu tithi", () => {
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = \`\${event.date}|\${event.hinduTithi}\`;
    assert.ok(!seen.has(key),
      \`Duplicate same-date/tithi cards: \${key}: \${seen.get(key)} / \${event.title}\`);
    seen.set(key, event.title);
  }
});

test("2027 same-tithi festival cards retain their combined observances", () => {
  assert.match(find(2,"2027-02-14",/भीष्माष्टमी/).title, /मासिक दुर्गाष्टमी/);
  assert.match(find(4,"2027-04-07",/नवसंवत्सर/).title, /गुड़ी पड़वा/);
  assert.match(find(5,"2027-05-09",/अक्षय तृतीया/).title, /त्रेतायुगादि/);
  assert.match(find(6,"2027-06-04",/वट सावित्री/).title, /शनि जयंती/);
  assert.match(find(8,"2027-08-17",/रक्षाबंधन/).title, /गायत्री जयंती/);
  assert.match(find(9,"2027-09-08",/राधाष्टमी/).title, /मासिक दुर्गाष्टमी/);
  assert.match(find(10,"2027-10-05",/दुर्गा पूजा/).title, /मासिक स्कन्द षष्ठी/);
  assert.match(find(10,"2027-10-27",/धनतेरस/).title, /प्रदोष व्रत/);
  assert.match(find(10,"2027-10-27",/काली चौदस/).title, /मासिक शिवरात्रि/);
  assert.match(find(11,"2027-11-04",/छठ पूजा/).title, /मासिक स्कन्द षष्ठी/);
  assert.match(find(12,"2027-12-13",/दत्तात्रेय जयंती/).title, /त्रिपुरभैरवी/);
});

test("Pithoragarh-visible 2027 eclipses have local contact timings", () => {
  const lunar = find(2,"2027-02-21",/उपच्छाया चंद्रग्रहण/);
  assert.ok(lunar);
  assert.equal(lunar.hinduTithi,"माघ शुक्ल पूर्णिमा");
  assert.match(lunar.description,/02:42 से प्रातः 06:45/);
  assert.match(lunar.sourceUrl,/timeanddate\.com\/eclipse\/in\/india\/pithoragarh/);

  const solar = find(8,"2027-08-02",/आंशिक सूर्यग्रहण/);
  assert.ok(solar);
  assert.match(solar.title,/सोमवती अमावस्या/);
  assert.equal(solar.hinduTithi,"श्रावण कृष्ण अमावस्या");
  assert.match(solar.description,/16:01 से 16:56/);
  assert.match(solar.description,/16:29/);
});

test("2027 combined cards retain their special muhurta rules", () => {
  assert.equal(find(10,"2027-10-27",/धनतेरस/).muhurtaRule,"dhanteras-muhurta");
  assert.equal(find(10,"2027-10-27",/काली चौदस/).muhurtaRule,"masik-shivaratri-nishita");
  assert.equal(find(11,"2027-11-04",/छठ पूजा/).muhurtaRule,"chhath-arghya");
});

test("2027 Gayatri Jayanti card has only relevant article links", () => {
  const event = find(8,"2027-08-17",/गायत्री जयंती/);
  assert.ok(event);
  assert.match(event.description,/About-Goddess-Gayatri-On-Gayatri-Jayanti/);
  assert.doesNotMatch(event.description,/About-Ekadashi-Vrat/);
});

test("2027 festival descriptions do not repeat the same article URL", () => {
  for (const event of events) {
    const urls = [...String(event.description || "").matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)]
      .map(match => match[1].replace(/^http:/i,"https:").replace(/\?m=1$/i,"").toLowerCase());
    assert.equal(urls.length,new Set(urls).size,\`\${event.date}: duplicate article link in \${event.title}\`);
  }
});
