import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../eclipse-panchang.js", import.meta.url), "utf8");
const storage = new Map();
const sandbox = {
  window: {
    localStorage: {
      getItem: key => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    }
  },
  fetch: async url => ({
    ok: true,
    json: async () => [{
      lat: "29.58",
      lon: "80.22",
      address: { city: "Pithoragarh", state: "Uttarakhand" },
      display_name: "Pithoragarh, Uttarakhand, India"
    }]
  }),
  console, Date, setTimeout, clearTimeout
};
vm.runInNewContext(source, sandbox, { filename: "eclipse-panchang.js" });
const tools = sandbox.window.__OHDEclipsePanchangTools;
assert.ok(tools, "shared local eclipse visibility API must be exposed");

const d = value => new Date(value);

test("solar eclipse beginning before sunrise is visible as Grastodaya", () => {
  const result = tools.getLocalVisibility({
    type: "Surya Grahan",
    contact: {
      firstContact: d("2026-03-03T00:30:00Z"),
      lastContact: d("2026-03-03T02:00:00Z")
    }
  }, [
    { sunrise: d("2026-03-02T00:30:00Z"), sunset: d("2026-03-02T12:30:00Z") },
    { sunrise: d("2026-03-03T01:00:00Z"), sunset: d("2026-03-03T12:30:00Z") },
    { sunrise: d("2026-03-04T00:30:00Z"), sunset: d("2026-03-04T12:30:00Z") }
  ]);
  assert.equal(result.localVisible, true);
  assert.equal(result.grastodaya, true);
  assert.equal(result.grastasta, false);
  assert.equal(result.visibleStart.toISOString(), "2026-03-03T01:00:00.000Z");
  assert.equal(result.visibleEnd.toISOString(), "2026-03-03T02:00:00.000Z");
});

test("solar eclipse after local sunset is invisible at the selected location", () => {
  const result = tools.getLocalVisibility({
    type: "Surya Grahan",
    contact: {
      firstContact: d("2026-03-03T13:00:00Z"),
      lastContact: d("2026-03-03T15:00:00Z")
    }
  }, [
    { sunrise: d("2026-03-02T00:30:00Z"), sunset: d("2026-03-02T12:30:00Z") },
    { sunrise: d("2026-03-03T00:30:00Z"), sunset: d("2026-03-03T12:30:00Z") },
    { sunrise: d("2026-03-04T00:30:00Z"), sunset: d("2026-03-04T12:30:00Z") }
  ]);
  assert.equal(result.localVisible, false);
  assert.equal(result.localStatus, "अदृश्य");
  assert.equal(result.visibleDuration, 0);
});

test("solar eclipse with zero local obscuration remains invisible despite daytime overlap", () => {
  const result = tools.getLocalVisibility({
    type: "Surya Grahan",
    isVisible: false,
    contact: {
      firstContact: d("2026-03-03T04:00:00Z"),
      lastContact: d("2026-03-03T06:00:00Z")
    }
  }, [
    { sunrise: d("2026-03-03T00:30:00Z"), sunset: d("2026-03-03T12:30:00Z") }
  ]);
  assert.equal(result.localVisible, false);
  assert.equal(result.localStatus, "अदृश्य");
  assert.equal(result.visibleStart, null);
  assert.equal(result.visibleDuration, 0);
});

test("lunar eclipse uses local moonrise and moonset rather than solar horizon", () => {
  const result = tools.getLocalVisibility({
    type: "Chandra Grahan",
    contact: {
      firstContact: d("2026-03-03T12:00:00Z"),
      lastContact: d("2026-03-03T15:00:00Z")
    }
  }, [
    { moonrise: d("2026-03-02T12:00:00Z"), moonset: d("2026-03-03T00:00:00Z") },
    { moonrise: d("2026-03-03T13:00:00Z"), moonset: d("2026-03-04T00:00:00Z") },
    { moonrise: d("2026-03-04T13:00:00Z"), moonset: d("2026-03-05T00:00:00Z") }
  ]);
  assert.equal(result.localVisible, true);
  assert.equal(result.grastodaya, true);
  assert.equal(result.visibleStart.toISOString(), "2026-03-03T13:00:00.000Z");
  assert.equal(result.visibleEnd.toISOString(), "2026-03-03T15:00:00.000Z");
});

test("ritual applicability excludes penumbral and locally invisible eclipses", () => {
  for (const subtype of ["Penumbral", " penumbral "]) {
    assert.equal(tools.isEclipseRitualApplicable({subtype}, {localVisible:true}), false);
  }
  for (const subtype of ["Total", "Partial", "Annular"]) {
    assert.equal(tools.isEclipseRitualApplicable({subtype}, {localVisible:false}), false);
    assert.equal(tools.isEclipseRitualApplicable({subtype}, {localVisible:true}), true);
  }
  assert.equal(tools.isEclipseRitualApplicable({subtype:"Total"}, null), false);
});

test("public eclipse card suppresses locally invisible and penumbral events", () => {
  const api = {getPanchangam: () => ({})};
  const contact = {firstContact:d("2026-03-03T04:00:00Z"),lastContact:d("2026-03-03T06:00:00Z"),peak:d("2026-03-03T05:00:00Z")};
  for (const subtype of ["Partial","Penumbral"]) {
    const html = tools.renderEclipseCard({date:contact.peak,grahan:{type:"Chandra Grahan",subtype,isVisible:false,contact}}, {}, api, {});
    if (subtype === "Penumbral") {
      assert.match(html, /उपच्छाया ग्रहण में सूतक/);
      assert.doesNotMatch(html, /प्रथम स्पर्श|पुण्य काल:|सूतक काल:/);
    }
    else {
      assert.match(html, /अदृश्य/);
      assert.doesNotMatch(html, /प्रथम स्पर्श|पुण्य काल:|सूतक काल:/);
    }
  }
});


test("selected city name persists without storing exact coordinates", async () => {
  const location = {
    name: "Pithoragarh, Uttarakhand, भारत",
    city: "Pithoragarh",
    state: "Uttarakhand",
    lat: 29.58,
    lon: 80.22,
    elevation: 1650
  };
  tools.rememberCity(location);
  const saved = storage.get("ohdEclipsePanchangCity");
  assert.equal(saved, "Pithoragarh, Uttarakhand, India");
  assert.doesNotMatch(saved, /29\.58|80\.22|1650/);
});

test("remembered city is geocoded again into a usable observer", async () => {
  const location = await tools.restoreRememberedCity();
  assert.equal(location.city, "Pithoragarh");
  assert.equal(location.state, "Uttarakhand");
  assert.equal(location.lat, 29.58);
  assert.equal(location.lon, 80.22);
  assert.equal(location.elevation, 0);
});

test("GPS-only location does not leave a stale saved city", () => {
  tools.rememberCity({ name: "वर्तमान स्थान", lat: 28.6, lon: 77.2, city: "", state: "" });
  assert.equal(storage.has("ohdEclipsePanchangCity"), false);
});


test("first-time Grahan Panchang visitor gets Pithoragarh as default", async () => {
  const location = await tools.getInitialLocation();
  assert.equal(location.city, "पिथौरागढ़");
  assert.equal(location.state, "उत्तराखंड");
  assert.equal(location.lat, 29.58);
  assert.equal(location.lon, 80.22);
  assert.equal(location.elevation, 1650);
});
