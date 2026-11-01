import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixtureUrl = new URL("../research/fixtures/drik-venus-2026-2027-acceptance.json", import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, "utf8"));

test("Drik Venus fixture remains explicitly provisional and method-separated", () => {
  assert.equal(fixture.schemaVersion, "1.0.0");
  assert.equal(fixture.fixtureId, "drik-venus-2026-2027-city-benchmarks");
  assert.equal(fixture.planet, "Venus");
  assert.equal(fixture.timeZone, "Asia/Kolkata");
  assert.equal(fixture.utcOffset, "+05:30");
  assert.equal(fixture.status, "reference-transcription-not-yet-independently-recaptured");
  assert.equal(fixture.eventSemantics.start, "Drik-published Venus Asta beginning");
  assert.equal(fixture.eventSemantics.end, "Drik-published Venus Asta ending");
  assert.match(fixture.eventSemantics.warning, /not been independently established/i);
  assert.equal(fixture.source.locationSelectionVerified, false);
  assert.equal(fixture.source.capturedAt, null);
  assert.match(fixture.source.captureMethod, /user-provided reference data/i);
  assert.equal(fixture.acceptancePolicy.keepClassicalSuryaSiddhantaKcSeparate, true);
  assert.equal(fixture.acceptancePolicy.doNotTuneArbitraryThresholdsToForceMatch, true);
  assert.equal(fixture.source.independentChecks.length, 1);
  const delhi2027 = fixture.source.independentChecks[0];
  assert.equal(delhi2027.city, "New Delhi");
  assert.equal(delhi2027.year, 2027);
  assert.equal(delhi2027.status, "independently-confirmed");
  const delhi = fixture.locations.find(location => location.city === "New Delhi");
  const delhiEvent = delhi.events.find(event => event.cycle === "2027");
  assert.equal(delhiEvent.astaStartLocal, delhi2027.verifiedStartLocal);
  assert.equal(delhiEvent.astaEndLocal, delhi2027.verifiedEndLocal);
});

test("each city has separate 2026 and 2027 local boundaries with explicit IST offsets", () => {
  assert.equal(fixture.locations.length, 3);
  const cityNames = fixture.locations.map(location => location.city);
  assert.deepEqual([...cityNames].sort(), ["New Delhi", "Pithoragarh", "Varanasi"]);
  assert.equal(new Set(cityNames).size, cityNames.length);

  for (const location of fixture.locations) {
    assert.equal(location.country, "India");
    assert.equal(location.events.length, 2);
    assert.deepEqual(location.events.map(event => event.cycle).sort(), ["2026", "2027"]);
    assert.equal(location.coordinates, null, "unknown coordinates must not be invented");
    assert.equal(location.elevationMeters, null, "unknown elevation must not be invented");

    for (const event of location.events) {
      for (const field of ["astaStartLocal", "astaEndLocal"]) {
        const value = event[field];
        assert.match(value, /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+05:30$/);
        assert.ok(Number.isFinite(Date.parse(value)), `${location.city} ${event.cycle} ${field} must parse`);
      }
      assert.ok(
        Date.parse(event.astaEndLocal) > Date.parse(event.astaStartLocal),
        `${location.city} ${event.cycle}: Asta end must follow Asta start`
      );
    }
  }
});

test("acceptance cannot pass until original city-specific references and method are verified", () => {
  const required = fixture.acceptancePolicy.requiredBeforePass;
  assert.ok(required.length >= 5);
  assert.ok(required.some(item => /Re-capture each event/i.test(item)));
  assert.ok(required.some(item => /event definition/i.test(item)));
  assert.ok(required.some(item => /observer coordinates/i.test(item)));
  assert.ok(required.some(item => /independent ephemeris/i.test(item)));
  assert.ok(required.some(item => /pre-declared tolerance/i.test(item)));
});
