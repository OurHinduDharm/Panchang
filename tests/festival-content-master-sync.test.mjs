import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeFestivalTitle,
  synchronizeEventContent
} from "../scripts/sync-festival-content-from-master.mjs";

test("normalizes Hindi festival titles and punctuation", () => {
  assert.equal(normalizeFestivalTitle("मकर संक्रांति / सूर्य उत्तरायण प्रारम्भ"),
    "मकर संक्रांति सूर्य उत्तरायण प्रारम्भ");
});

test("copies stable description and article links without changing annual dates or tithi", () => {
  const event = {
    date: "2028-01-22",
    title: "षटतिला एकादशी",
    hinduTithi: "माघ कृष्ण एकादशी",
    description: "षटतिला एकादशी पर तिल-दान करें।",
    reviewStatus: "approved",
    muhurtaRule: "ekadashi-parana"
  };
  const template = {
    title: "षट्तिला एकादशी",
    description: "षट्तिला एकादशी पर तिल से स्नान, दान और भगवान विष्णु की पूजा की परंपरा है।",
    articleUrl: "http://example.com/ekadashi",
    articleLabel: "एकादशी व्रत-विधान"
  };
  assert.equal(synchronizeEventContent(event, template), true);
  assert.equal(event.date, "2028-01-22");
  assert.equal(event.hinduTithi, "माघ कृष्ण एकादशी");
  assert.equal(event.reviewStatus, "approved");
  assert.equal(event.muhurtaRule, "ekadashi-parana");
  assert.equal(event.description, "षटतिला एकादशी पर तिल-दान करें।");
  assert.equal(event.articleUrl, template.articleUrl);
});

test("keeps year-specific clock times and adds missing stable article links", () => {
  const event = {
    date: "2029-11-08",
    title: "दीपावली / महालक्ष्मी पूजन",
    description: "पूजन का समय 17:45 से 19:10 तक रहेगा।"
  };
  const template = {
    title: "दीपावली / महालक्ष्मी पूजन",
    description: '<a href="https://example.com/deepawali">दीपावली का महत्व</a>',
    articleUrl: "https://example.com/lakshmi",
    articleLabel: "महालक्ष्मी पूजन विधि"
  };
  synchronizeEventContent(event, template);
  assert.match(event.description, /17:45 से 19:10/);
  assert.match(event.description, /example\.com\/deepawali/);
  assert.equal(event.articleUrl, template.articleUrl);
});

test("does not duplicate an article already attached to the target card", () => {
  const event = {
    title: "एकादशी",
    articleUrl: "https://example.com/ekadashi?m=1",
    articleLabel: "एकादशी व्रत"
  };
  const template = {
    title: "एकादशी",
    articleUrl: "https://example.com/ekadashi",
    articleLabel: "एकादशी व्रत का विधान"
  };
  assert.equal(synchronizeEventContent(event, template), false);
  assert.equal(event.articleUrl, "https://example.com/ekadashi?m=1");
});

test("preserves target-only article links when stable description is synchronized", () => {
  const event = {
    title: "पोंगल",
    description: '<a href="https://example.com/local">स्थानीय परंपरा</a> पुराना विवरण'
  };
  const template = {
    title: "पोंगल",
    description: "पोंगल तमिल फसल-पर्व है।",
  };
  synchronizeEventContent(event, template);
  assert.match(event.description, /पोंगल तमिल फसल-पर्व है/);
  assert.match(event.description, /example\.com\/local/);
});
