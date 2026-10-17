import assert from "node:assert/strict";
import test from "node:test";
import {
  getFestivalImage,
  getFestivalImageKeys,
  getFestivalImageManifest
} from "../festival-images.js";

test("festival image mapping covers the intended main visual categories", () => {
  const keys = getFestivalImageKeys();
  for (const key of ["navratri", "deepawali", "fullMoon", "shiva", "ganesha", "karvaChauth"]) {
    assert.ok(keys.includes(key), "missing image category: " + key);
  }
});

test("Navratri and Durga Puja use the Navratri image", () => {
  assert.match(getFestivalImage({ title: "शारदीय नवरात्र प्रारम्भ", category: "नवरात्रि" }).sourceUrl, /Navratri_festival\.jpg/);
  assert.match(getFestivalImage({ title: "दुर्गा पूजा", category: "पर्व" }).sourceUrl, /Navratri_festival\.jpg/);
});

test("Diwali, Sharad Purnima, Shiva, Ganesh and Karwa Chauth choose relevant images", () => {
  assert.match(getFestivalImage({ title: "दीपावली", category: "प्रमुख पर्व" }).sourceUrl, /Deepawali_diya\.jpg/);
  assert.match(getFestivalImage({ title: "कोजागरी पूर्णिमा", category: "पूर्णिमा" }).sourceUrl, /Full_moon_at_night\.jpg/);
  assert.match(getFestivalImage({ title: "मासिक कालाष्टमी", category: "व्रत" }).sourceUrl, /Shiva_lingam_01\.jpg/);
  assert.match(getFestivalImage({ title: "संकष्टी चतुर्थी", category: "व्रत" }).sourceUrl, /Ganesha,/);
  const karva = getFestivalImage({ title: "करवा चौथ", category: "व्रत-पर्व" });
  assert.match(karva.sourceUrl, /KarvaChauthMoon1\.jpg/);
  assert.equal(karva.license.label, "CC BY-SA 4.0");
  assert.match(karva.license.url, /creativecommons\.org\/licenses\/by-sa\/4\.0/);
});

test("event-specific image overrides the category default", () => {
  const event = {
    title: "दीपावली",
    imageUrl: "https://example.org/custom.jpg",
    imageAlt: "विशेष चित्र",
    imageAuthor: "Site editor",
    imageSourceUrl: "https://example.org/source",
    imageLicenseLabel: "CC0",
    imageLicenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/"
  };
  const image = getFestivalImage(event);
  assert.equal(image.url, event.imageUrl);
  assert.equal(image.alt, event.imageAlt);
  assert.equal(image.author, event.imageAuthor);
  assert.equal(image.sourceUrl, event.imageSourceUrl);
  assert.equal(image.license.label, "CC0");
});

test("unmapped observances do not receive an unrelated image", () => {
  assert.equal(getFestivalImage({ title: "कार्तिक मास प्रारंभ", category: "व्रत-पर्व" }), null);
  assert.equal(getFestivalImage(null), null);
});

test("manifest records source and license metadata for every image", () => {
  const manifest = getFestivalImageManifest();
  for (const [key, image] of Object.entries(manifest)) {
    assert.ok(image.url.startsWith("https://"));
    assert.ok(image.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:"));
    assert.ok(image.author, "missing author for " + key);
    assert.ok(image.license && image.license.label && image.license.url, "missing license for " + key);
  }
});
