// Synthetic structural fixtures only; these tests do not classify Mahadvadashi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../data/ekadashi-mahadvadashi-fixtures.json"), "utf8"
));

function at(interval, instant) {
  return interval.start <= instant && instant < interval.end;
}

test("MDV-FIX-01: fixture pack is explicitly synthetic and non-runtime", () => {
  assert.equal(data.status, "synthetic-research-fixtures-not-runtime");
  assert.match(data.source.caution, /invented/);
});

test("MDV-FIX-02: Trisprsha-shaped fixture has the stated sunrise sequence", () => {
  const fixture = data.fixtures.find(item => item.id === "MDV-TRISPRSHA-SYN-01");
  assert.ok(fixture);
  const [first, second] = fixture.sunrises;
  assert.ok(first.at < second.at);
  const firstTithi = fixture.tithis.find(item => at(item, first.at));
  const secondTithi = fixture.tithis.find(item => at(item, second.at));
  assert.equal(firstTithi.name, fixture.structuralExpectations.firstSunriseTithi);
  assert.equal(secondTithi.name, fixture.structuralExpectations.secondSunriseTithi);
  const dvadashi = fixture.tithis.find(item => item.name === "Dvadashi");
  assert.ok(dvadashi, "fixture must contain Dvadashi");
  assert.ok(first.at < dvadashi.start, "Dvadashi must begin after the first sunrise");
  assert.ok(dvadashi.end < second.at, "Dvadashi must end before the second sunrise");
  assert.ok(dvadashi.start < dvadashi.end, "Dvadashi interval must be positive");
  const touching = fixture.tithis
    .filter(item => item.start < second.at && item.end > first.at)
    .map(item => item.name);
  assert.deepEqual(touching, fixture.structuralExpectations.tithisTouchingInterveningAhoratra);
  assert.equal(fixture.decision, "not-evaluated");
});

test("MDV-FIX-03: half-open intervals assign exact transitions to the following tithi", () => {
  const fixture = data.fixtures.find(item => item.id === "MDV-TRISPRSHA-SYN-01");
  assert.equal(fixture.tithis.find(item => at(item, 1500)).name, "Dvadashi");
  assert.equal(fixture.tithis.find(item => at(item, 1800)).name, "Trayodashi");
});

test("MDV-FIX-04: Pakshavardhini stays unresolved without source-defined dinavriddhi predicate", () => {
  const fixture = data.fixtures.find(item => item.id === "MDV-PAKSHAVARDHINI-UNRESOLVED-01");
  assert.ok(fixture);
  assert.equal(fixture.lunarTithiIdentity, "Amavasya");
  assert.equal(fixture.genericDayIncreaseObserved, true);
  assert.equal(fixture.sourceDefinedDinavriddhiPredicate, null);
  assert.equal(fixture.decision, "unresolved");
});
