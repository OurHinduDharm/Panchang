const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");
const { createFestivalMuhurtaEngine } = require("../festival-muhurta-engine.js");
const rules = require("../festival-muhurta-rules.js");
const muhurtaEngine = createFestivalMuhurtaEngine({ getPanchangam, Observer, rules });

// Fixed project reference location: Pithoragarh, Uttarakhand.
// Noon IST is used as the query instant; the library's tithis array
// provides the sunrise-to-next-sunrise interval for that civil date.
const observer = new Observer(30.1265, 80.4817, 0);
const dates = [
  "2026-10-10", "2026-10-11", "2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21",
  "2026-10-24", "2026-10-25", "2026-10-26",
  "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08",
  "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12"
];

function asIso(value) {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value ?? "") : parsed.toISOString();
}

test("emit fixed-location festival tithi interval diagnostics (review required)", () => {
  const report = dates.map((date) => {
    const queryInstant = new Date(date + "T06:30:00.000Z"); // 12:00 IST
    const p = getPanchangam(queryInstant, observer, { timezoneOffset: 330 });
    assert.ok(Array.isArray(p.tithis) && p.tithis.length > 0,
      `No tithi interval array returned for ${date}`);
    return {
      queryDateIST: date,
      snapshotKeys: Object.keys(p),
      sunrise: asIso(p.sunrise),
      sunset: asIso(p.sunset),
      moonrise: asIso(p.moonrise),
      moonset: asIso(p.moonset),
      abhijitMuhurta: p.abhijitMuhurta ?? null,
      tithiObjectKeys: Object.keys(p.tithis[0] || {}),
      nakshatraObjectKeys: Object.keys((p.nakshatras || [])[0] || {}),
      yogaObjectKeys: Object.keys((p.yogas || [])[0] || {}),
      tithis: (p.tithis || []).map((item) => ({ ...item, startTime: asIso(item.startTime), endTime: asIso(item.endTime) })),
      nakshatras: (p.nakshatras || []).map((item) => ({ ...item, startTime: asIso(item.startTime), endTime: asIso(item.endTime) })),
      yogas: (p.yogas || []).map((item) => ({ ...item, startTime: asIso(item.startTime), endTime: asIso(item.endTime) })),
      ghatasthapanaDiagnostic: date === "2026-10-11" ? (() => {
        const result = muhurtaEngine.calculateGhatasthapana({
          date, latitude: 30.1265, longitude: 80.4817, elevation: 0, timezoneOffset: 330
        });
        return {
          status: result.status,
          selectedBy: result.selectedBy || null,
          window: result.window ? { startUTC: asIso(result.window.start), endUTC: asIso(result.window.end) } : null,
          warnings: result.warnings || [],
          inputsAvailable: result.inputsAvailable || null
        };
      })() : null
    };
  });

  const outputDir = path.join(process.cwd(), "artifacts");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "festival-tithi-diagnostic-2026.json"),
    JSON.stringify({
      status: "diagnostic-only-not-a-festival-date-verdict",
      location: { name: "Pithoragarh", latitude: 30.1265, longitude: 80.4817, elevationMeters: 0 },
      timezoneOffsetMinutes: 330,
      report
    }, null, 2) + "\n"
  );
  console.log("FESTIVAL_TITHI_DIAGNOSTIC_2026 " + JSON.stringify(report));
});
