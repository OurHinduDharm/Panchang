import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const directory = new URL("../data/festivals/", import.meta.url);
const root = new URL("../", import.meta.url);
const folder = join(new URL(".", root).pathname, "data", "festivals");
const files = readdirSync(folder).filter(name => /^\d{4}-\d{2}\.json$/.test(name)).sort();

test("monthly festival data files have matching year/month metadata and event arrays", () => {
  assert.ok(files.length >= 12, "expected monthly festival JSON files");
  for (const file of files) {
    const match = /^(\d{4})-(\d{2})\.json$/.exec(file);
    const year = Number(match[1]);
    const month = Number(match[2]);
    assert.ok(month >= 1 && month <= 12, `${file}: invalid month in filename`);
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    assert.equal(data.year, year, `${file}: year metadata does not match filename`);
    assert.equal(data.month, month, `${file}: month metadata does not match filename`);
    assert.ok(Array.isArray(data.events), `${file}: events must be an array`);
  }
});

test("festival event dates are real dates in the month file that contains them", () => {
  for (const file of files) {
    const [, yearText, monthText] = /^(\d{4})-(\d{2})\.json$/.exec(file);
    const year = Number(yearText);
    const month = Number(monthText);
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      assert.equal(typeof event.date, "string", `${file}: event date missing for ${event.title || "(untitled)"}`);
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(event.date);
      assert.ok(match, `${file}: invalid date format ${event.date}`);
      const [, y, m, d] = match;
      const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
      assert.equal(date.getUTCFullYear(), Number(y), `${file}: invalid year in ${event.date}`);
      assert.equal(date.getUTCMonth() + 1, Number(m), `${file}: invalid month in ${event.date}`);
      assert.equal(date.getUTCDate(), Number(d), `${file}: invalid day in ${event.date}`);
      assert.equal(Number(y), year, `${file}: event year mismatch for ${event.title || event.date}`);
      assert.equal(Number(m), month, `${file}: event month mismatch for ${event.title || event.date}`);
      assert.equal(typeof event.title, "string", `${file}: title missing for ${event.date}`);
      assert.ok(event.title.trim(), `${file}: empty title for ${event.date}`);
    }
  }
});


test("Hindi festival descriptions do not end with malformed punctuation", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      const description = String(event.description || "").trim();
      assert.ok(!/(?:[;；][.。]?|[;；]।|[.。]$|[।。]\.)$/.test(description),
        `${file}: malformed ending punctuation in ${event.title || event.date}`);
    }
  }
});

test("every monthly festival record has an explicit review status", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      assert.equal(typeof event.reviewStatus, "string",
        `${file}: review status missing for ${event.title || event.date}`);
      assert.ok(event.reviewStatus.trim(),
        `${file}: empty review status for ${event.title || event.date}`);
    }
  }
});

test("Ekadashi parana metadata is only attached to Ekadashi records", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    for (const event of data.events) {
      if (event.muhurtaRule === "ekadashi-parana" || event.category === "एकादशी") {
        assert.match(event.title, /एकादशी/i, `${file}: Ekadashi metadata on non-Ekadashi event ${event.title}`);
      }
    }
  }
});

test("monthly festival files do not contain exact duplicate date/title records", () => {
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(folder, file), "utf8"));
    const seen = new Set();
    for (const event of data.events) {
      const key = `${event.date}| ${event.title}`;
      assert.ok(!seen.has(key), `${file}: duplicate event ${key}`);
      seen.add(key);
    }
  }
});


test("Gupta Navratri parana and kalash visarjan are a single approved Dashami observance", () => {
  const july = JSON.parse(readFileSync(join(folder, "2026-07.json"), "utf8"));
  const matching = july.events.filter(event => event.date === "2026-07-23" && /गुप्त नवरात्र.*(?:पारण|कलश विसर्जन)/.test(event.title));
  assert.equal(matching.length, 1);
  assert.equal(matching[0].title, "गुप्त नवरात्र पारण एवं कलश विसर्जन");
  assert.equal(matching[0].reviewStatus, "approved");
  assert.equal(matching[0].hinduTithi, "आषाढ़ शुक्ल दशमी");
  assert.match(matching[0].description, /कलश-विसर्जन/);
  assert.equal(matching[0].articleUrl, "https://ourhindudharm.blogspot.com/p/kalashvisarjan.html");
  assert.equal(july.status, "approved");
  assert.ok(july.events.every(event => event.reviewStatus === "approved"));
});
