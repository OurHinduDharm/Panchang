import test from "node:test";
import assert from "node:assert/strict";
import {
  findPlanetConjunctions,
  associateCandidatesWithConjunctions,
  pairCandidatesAroundConjunctions
} from "../research/planetary-conjunction-association.mjs";

test("uses documented conjunction targets for Jupiter and Venus", () => {
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

test("associates candidates with nearest conjunction without deciding publication", () => {
  const result = associateCandidatesWithConjunctions({
    candidates: [
      { boundary: "astaStart", instant: "2028-04-20T00:00:00.000Z" },
      { boundary: "astaEnd", instant: "2028-05-12T00:00:00.000Z" }
    ],
    conjunctions: [{ kind: "conjunction", instant: "2028-05-01T00:00:00.000Z" }]
  });
  assert.equal(result[0].conjunctionAssociation.side, "before");
  assert.equal(result[1].conjunctionAssociation.side, "after");
});

test("pairs Jupiter AstaStart set before and AstaEnd rise after conjunction", () => {
  const result = pairCandidatesAroundConjunctions({
    planet: "Jupiter",
    conjunctions: [{ kind: "conjunction", instant: "2028-09-30T12:00:00Z" }],
    candidates: [
      { boundary: "astaStart", eventType: "set", instant: "2028-09-15T12:00:00Z" },
      { boundary: "astaEnd", eventType: "rise", instant: "2028-10-12T12:00:00Z" },
      { boundary: "astaStart", eventType: "rise", instant: "2028-09-20T12:00:00Z" },
      { boundary: "astaEnd", eventType: "set", instant: "2028-10-05T12:00:00Z" }
    ]
  });
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].durationDays, 27);
  assert.equal(result.publicationEligible, false);
});

test("Venus inferior and superior conjunctions require opposite horizon branches", () => {
  const result = pairCandidatesAroundConjunctions({
    planet: "Venus",
    conjunctions: [
      { kind: "inferior-conjunction", instant: "2028-06-01T00:00:00Z" },
      { kind: "superior-conjunction", instant: "2029-03-23T00:00:00Z" }
    ],
    candidates: [
      { boundary: "astaStart", eventType: "set", instant: "2028-05-29T00:00:00Z" },
      { boundary: "astaEnd", eventType: "rise", instant: "2028-06-07T00:00:00Z" },
      { boundary: "astaStart", eventType: "rise", instant: "2029-02-12T00:00:00Z" },
      { boundary: "astaEnd", eventType: "set", instant: "2029-04-17T00:00:00Z" }
    ]
  });
  assert.equal(result.windows.length, 2);
  assert.equal(result.windows[0].astaStartEventType, "set");
  assert.equal(result.windows[0].udayaEventType, "rise");
  assert.equal(result.windows[1].astaStartEventType, "rise");
  assert.equal(result.windows[1].udayaEventType, "set");
});

test("rejects candidates on wrong side or wrong horizon direction", () => {
  const result = pairCandidatesAroundConjunctions({
    planet: "Jupiter",
    conjunctions: [{ kind: "conjunction", instant: "2028-09-30T00:00:00Z" }],
    candidates: [
      { boundary: "astaStart", eventType: "rise", instant: "2028-09-20T00:00:00Z" },
      { boundary: "astaEnd", eventType: "set", instant: "2028-10-10T00:00:00Z" }
    ]
  });
  assert.equal(result.windows.length, 0);
  assert.deepEqual(result.rejectedConjunctions[0].missing, [
    "astaStart:set:before", "astaEnd:rise:after"
  ]);
});

test("rejects unsupported planets and invalid ranges", () => {
  assert.throws(() => findPlanetConjunctions({
    astronomy: {}, planet: "Mars", start: "2028-01-01", end: "2029-01-01"
  }), /Jupiter or Venus/);
  assert.throws(() => pairCandidatesAroundConjunctions({
    planet: "Mars", candidates: [], conjunctions: []
  }), /Jupiter or Venus/);
});
