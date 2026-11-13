import test from "node:test";
import assert from "node:assert/strict";
import {
  findPlanetConjunctions,
  associateCandidatesWithConjunctions
} from "../research/planetary-conjunction-association.mjs";

test("uses the documented conjunction targets for Jupiter and Venus", () => {
  const calls = [];
  const astronomy = {
    Body: { Jupiter: "Jupiter", Venus: "Venus" },
    SearchRelativeLongitude(body, target, start) {
      calls.push([body, target]);
      const key = body + ":" + target;
      const first = key === "Jupiter:180" ? "2028-05-01T00:00:00.000Z"
        : key === "Venus:0" ? "2028-02-01T00:00:00.000Z"
          : "2028-08-01T00:00:00.000Z";
      const date = new Date(first);
      return date >= start ? { date } : null;
    }
  };
  const jupiter = findPlanetConjunctions({
    astronomy, planet: "Jupiter",
    start: "2028-01-01T00:00:00Z", end: "2029-01-01T00:00:00Z"
  });
  assert.equal(jupiter.length, 1);
  assert.equal(jupiter[0].targetRelLon, 180);
  const venus = findPlanetConjunctions({
    astronomy, planet: "Venus",
    start: "2028-01-01T00:00:00Z", end: "2029-01-01T00:00:00Z"
  });
  assert.deepEqual(venus.map(event => event.kind), [
    "inferior-conjunction", "superior-conjunction"
  ]);
  assert.ok(calls.some(call => call[0] === "Venus" && call[1] === 0));
  assert.ok(calls.some(call => call[0] === "Venus" && call[1] === 180));
});

test("associates candidates to nearest conjunction without choosing a window", () => {
  const result = associateCandidatesWithConjunctions({
    candidates: [
      { boundary: "astaStart", instant: "2028-04-20T00:00:00.000Z" },
      { boundary: "astaEnd", instant: "2028-05-12T00:00:00.000Z" },
      { boundary: "unrelated", instant: "2029-01-01T00:00:00.000Z" }
    ],
    conjunctions: [
      { kind: "conjunction", instant: "2028-05-01T00:00:00.000Z" }
    ],
    maxDistanceDays: 60
  });
  assert.equal(result[0].conjunctionAssociation.side, "before");
  assert.equal(result[1].conjunctionAssociation.side, "after");
  assert.equal(result[2].conjunctionAssociation, null);
});

test("rejects unsupported planet and malformed inputs", () => {
  assert.throws(() => findPlanetConjunctions({
    astronomy: {}, planet: "Mars", start: "2028-01-01", end: "2029-01-01"
  }), /Jupiter or Venus/);
  assert.throws(() => associateCandidatesWithConjunctions({
    candidates: [], conjunctions: [], maxDistanceDays: 0
  }), /positive/);
});
