import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { findMatchingFestivalTemplates, synchronizeEventContent } from "../scripts/sync-festival-content-from-master.mjs";

const cache = new Map();
const month = async (year, monthNumber) => {
  const key = String(year) + "-" + String(monthNumber).padStart(2, "0");
  if (!cache.has(key)) {
    cache.set(key, JSON.parse(await readFile(new URL("../data/festivals/" + key + ".json", import.meta.url), "utf8")));
  }
  return cache.get(key);
};
const find = async (year, monthNumber, date, pattern) => {
  const data = await month(year, monthNumber);
  const event = data.events.find(item => item.date === date && pattern.test(item.title || ""));
  assert.ok(event, "Missing event: " + date + " / " + pattern);
  return event;
};
const allLinks = event => [
  event.articleUrl,
  event.secondaryArticleUrl,
  ...[...String(event.description || "").matchAll(/href=["']([^"']+)["']/g)].map(match => match[1])
].filter(Boolean);
const assertArticle = async (year, monthNumber, date, pattern, urlPart) => {
  const event = await find(year, monthNumber, date, pattern);
  assert.ok(allLinks(event).some(url => url.includes(urlPart)),
    "Missing " + urlPart + " on " + date + " " + event.title);
};

test("All supplied OurHinduDharm articles are linked to their matching 2026-2030 festival cards", async () => {
  const cases = [
    [2026,2,"2026-02-15",/महाशिवरात्रि/,"shivratri-prahar-pooja-vidhi"],
    [2026,3,"2026-03-26",/श्रीरामनवमी/,"About-Birthday-Of-Lord-Ram-on-Shree-RamNavami"],
    [2026,4,"2026-04-19",/अक्षय तृतीया/,"About-Akshaya-Triteeya"],
    [2026,9,"2026-09-04",/श्री काली/,"Kakaradi-Kali-sahasranam-stotra"],
    [2026,9,"2026-09-04",/श्रीकृष्ण जन्माष्टमी/,"About-Shree-Krishna-Janmaashtami-On-Lord-Krishna-Jayanti"],
    [2026,11,"2026-11-07",/काली चौदस/,"Kakaradi-Kali-sahasranam-stotra"],
    [2026,11,"2026-11-08",/दीपावली/,"Kakaradi-Kali-sahasranam-stotra"],
    [2026,11,"2026-11-20",/भीष्म पंचक/,"About-Shree-Hari-Prabodhini-Ekaadashi"],
    [2026,11,"2026-11-24",/कार्तिक पूर्णिमा/,"aakash-deep-daan-vidhi"],
    [2027,1,"2027-01-22",/पौष पूर्णिमा/,"About-Paush-Mahatmya"],
    [2027,3,"2027-03-06",/महाशिवरात्रि/,"shivratri-prahar-pooja-vidhi"],
    [2027,5,"2027-05-09",/अक्षय तृतीया/,"About-Akshaya-Triteeya"],
    [2027,8,"2027-08-24",/श्रीकृष्ण जन्माष्टमी/,"About-Shree-Krishna-Janmaashtami-On-Lord-Krishna-Jayanti"],
    [2027,11,"2027-11-10",/देवोत्थानी एकादशी \(स्मार्त\)/,"About-Shree-Hari-Prabodhini-Ekaadashi"],
    [2027,11,"2027-11-14",/कार्तिक पूर्णिमा/,"aakash-deep-daan-vidhi"],
    [2028,2,"2028-02-23",/महाशिवरात्रि/,"shivratri-prahar-pooja-vidhi"],
    [2028,4,"2028-04-27",/अक्षय तृतीया/,"About-Akshaya-Triteeya"],
    [2028,8,"2028-08-13",/श्रीकृष्ण जन्माष्टमी/,"About-Shree-Krishna-Janmaashtami-On-Lord-Krishna-Jayanti"],
    [2028,11,"2028-11-01",/देव दीपावली/,"aakash-deep-daan-vidhi"],
    [2029,2,"2029-02-11",/महाशिवरात्रि/,"shivratri-prahar-pooja-vidhi"],
    [2029,5,"2029-05-16",/अक्षय तृतीया/,"About-Akshaya-Triteeya"],
    [2029,9,"2029-09-01",/श्रीकृष्ण जन्माष्टमी/,"About-Shree-Krishna-Janmaashtami-On-Lord-Krishna-Jayanti"],
    [2029,11,"2029-11-04",/काली चौदस/,"Kakaradi-Kali-sahasranam-stotra"],
    [2029,11,"2029-11-16",/देवोत्थानी एकादशी/,"About-Shree-Hari-Prabodhini-Ekaadashi"],
    [2029,11,"2029-11-21",/देव दीपावली/,"aakash-deep-daan-vidhi"],
    [2030,3,"2030-03-02",/महाशिवरात्रि/,"shivratri-prahar-pooja-vidhi"],
    [2030,5,"2030-05-05",/अक्षय तृतीया/,"About-Akshaya-Triteeya"],
    [2030,8,"2030-08-20",/श्रीकृष्ण जन्माष्टमी/,"About-Shree-Krishna-Janmaashtami-On-Lord-Krishna-Jayanti"],
    [2030,11,"2030-11-05",/देवोत्थानी/,"About-Shree-Hari-Prabodhini-Ekaadashi"],
    [2030,10,"2030-10-23",/गोवत्स द्वादशी/,"About-Govats-Dwadashi-vrat"],
    [2030,11,"2030-11-10",/कार्तिक पूर्णिमा/,"aakash-deep-daan-vidhi"]
  ];
  for (const [year, monthNumber, date, pattern, urlPart] of cases) {
    if (typeof pattern === "string") {
      const data = await month(year, monthNumber);
      const event = data.events.find(item => item.date.startsWith(date) && item.title.includes(pattern));
      assert.ok(event, "Missing event: " + date + " / " + pattern);
      assert.ok(allLinks(event).some(url => url.includes(urlPart)), "Missing " + urlPart + " on " + date);
    } else {
      await assertArticle(year, monthNumber, date, pattern, urlPart);
    }
  }
});


const normalizeArticleUrl = value => String(value || "")
  .replace(/^http:/i, "https:")
  .replace(/[?&]m=1/g, "")
  .replace(/#.*$/, "");
const articleUrls = event => [
  event.articleUrl,
  event.secondaryArticleUrl,
  ...[...String(event.description || "").matchAll(/href=["']([^"']+)["']/g)].map(match => match[1])
].filter(Boolean).map(normalizeArticleUrl);

test("every linked master article is present on its matching 2026-2030 festival cards", async () => {
  const master = JSON.parse(await readFile(new URL("../data/festival-content-master.json", import.meta.url), "utf8"));
  const missing = [];
  for (let year = 2026; year <= 2030; year++) {
    for (let monthNumber = 1; monthNumber <= 12; monthNumber++) {
      const data = await month(year, monthNumber);
      for (const event of data.events || []) {
        const simulated = JSON.parse(JSON.stringify(event));
        for (const template of findMatchingFestivalTemplates(event, master.templates)) {
          synchronizeEventContent(simulated, template);
        }
        const actual = new Set(articleUrls(event));
        for (const url of articleUrls(simulated)) {
          if (!actual.has(url)) missing.push({ date: event.date, title: event.title, url });
        }
      }
    }
  }
  assert.deepEqual(missing, []);
});

test("public 2026-2030 festival cards and content master contain no Vaishnava or Gauna Ekadashi entries", async () => {
  const master = JSON.parse(await readFile(new URL("../data/festival-content-master.json", import.meta.url), "utf8"));
  const masterViolations = master.templates.filter(item => /एकादशी/.test(item.key || "") && /(वैष्णव|गौण)/.test(item.key || "")).map(item => item.key);
  assert.deepEqual(masterViolations, []);
  const violations = [];
  for (let year = 2026; year <= 2030; year++) {
    for (let monthNumber = 1; monthNumber <= 12; monthNumber++) {
      const data = await month(year, monthNumber);
      for (const event of data.events || []) {
        if (/एकादशी/.test(event.title || "") && /(वैष्णव|गौण)/.test(event.title || "")) {
          violations.push({ date: event.date, title: event.title });
        }
      }
    }
  }
  assert.deepEqual(violations, []);
});


test("links the Mahalakshmi puja-vidhi article on every Diwali card from 2026 to 2030", async () => {
  const cases = [
    [2026,11,"2026-11-08",/दीपावली/],
    [2027,10,"2027-10-29",/दीपावली/],
    [2028,10,"2028-10-17",/दीपावली/],
    [2029,11,"2029-11-05",/दीपावली/],
    [2030,10,"2030-10-26",/दीपावली/]
  ];
  for (const [year, monthNumber, date, pattern] of cases) {
    await assertArticle(year, monthNumber, date, pattern, "About-MahalakshmiPooja");
  }
});

test("links Paush Mahatmya and Tailang Swami articles only to their matching observances", async () => {
  const paushCases = [
    [2026,1,"2026-01-03",/पौष पूर्णिमा/],
    [2027,1,"2027-01-22",/पौष पूर्णिमा/],
    [2028,1,"2028-01-12",/पौष पूर्णिमा/],
    [2028,12,"2028-12-31",/पौष पूर्णिमा/],
    [2030,1,"2030-01-19",/पौष पूर्णिमा/]
  ];
  for (const [year, monthNumber, date, pattern] of paushCases) {
    await assertArticle(year, monthNumber, date, pattern, "About-Paush-Mahatmya");
  }
  const tailangCases = [
    [2030,1,"2030-01-15",/तैलंग स्वामी/]
  ];
  for (const [year, monthNumber, date, pattern] of tailangCases) {
    await assertArticle(year, monthNumber, date, pattern, "About-Tailang-SwamiJi-On-His-Jayanti");
  }
  for (const [year, monthNumber] of [[2028,1],[2028,12]]) {
    const data = await month(year, monthNumber);
    assert.equal(data.events.some(event => /तैलंग स्वामी|टेलंग स्वामी/.test(event.title || "")), false);
  }
});

test("requested Pitri, Navratri-havan and Kalash-visarjan pages cover missing annual cards", async () => {
  const cases = [
    [2026,3,"2026-03-28",/कलश विसर्जन/,"kalashvisarjan"],
    [2027,9,"2027-09-29",/महालया|सर्वपितृ/,"pitri-visarjan"],
    [2027,10,"2027-10-09",/विजयादशमी/,"kalashvisarjan"],
    [2028,4,"2028-04-03",/चैत्र नवरात्र नवमी/,"navratrihavanvidhi"],
    [2028,9,"2028-09-18",/महालया/,"pitri-visarjan"],
    [2028,9,"2028-09-26",/महानवमी/,"navratrihavanvidhi"],
    [2029,4,"2029-04-23",/चैत्र नवरात्र नवमी/,"navratrihavanvidhi"],
    [2029,10,"2029-10-07",/सर्वपितृ/,"pitri-visarjan"],
    [2029,10,"2029-10-15",/महानवमी/,"navratrihavanvidhi"],
    [2030,4,"2030-04-12",/श्रीराम नवमी.*चैत्र नवरात्र/,"navratrihavanvidhi"],
    [2030,9,"2030-09-27",/सर्वपितृ/,"pitri-visarjan"]
  ];
  for (const [year, monthNumber, date, pattern, urlPart] of cases) {
    await assertArticle(year, monthNumber, date, pattern, urlPart);
  }
  const pitriCases = [
    [2027,9,"2027-09-29",/महालया|सर्वपितृ/],
    [2028,9,"2028-09-18",/महालया/],
    [2029,10,"2029-10-07",/सर्वपितृ/],
    [2030,9,"2030-09-27",/सर्वपितृ/]
  ];
  for (const [year, monthNumber, date, pattern] of pitriCases) {
    await assertArticle(year, monthNumber, date, pattern, "pitri-tarpan-vidhi");
  }
});
