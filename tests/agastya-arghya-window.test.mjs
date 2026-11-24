import test from "node:test";
import assert from "node:assert/strict";
import {calculateAgastyaArghyaWindows} from "../research/agastya-arghya-window.mjs";

test("Agastya Arghya is independently bounded by next local sunrise", () => {
  const start = Date.parse("2026-09-07T04:44:00+05:30");
  const end = Date.parse("2026-09-07T05:49:00+05:30");
  const observer = {latitude: 29.5828, longitude: 80.2182, elevation: 1650};
  const events = [{body:"Star1", event:"Udaya", utcMilliseconds:start},
    {body:"Jupiter",event:"Udaya",utcMilliseconds:start}];
  const result = calculateAgastyaArghyaWindows(events, observer, (site, from) => {
    assert.equal(site, observer);
    assert.equal(from.getTime(), start);
    return {date:new Date(end)};
  });
  assert.deepEqual(result, [{startUtcMilliseconds:start,endUtcMilliseconds:end}]);
});

test("No sunrise or invalid ordering never fabricates Arghya", () => {
  const start = Date.parse("2026-09-07T04:44:00+05:30");
  const events = [{body:"Star1",event:"Udaya",utcMilliseconds:start}];
  for (const sunrise of [null, {date:new Date(start)}, {date:new Date(start-60000)},
    {date:new Date(start+86400000)}]) {
    assert.deepEqual(calculateAgastyaArghyaWindows(events, {}, () => sunrise), []);
  }
});

test("Southern hemisphere evening Canopus rise can yield next-day sunrise", () => {
  const start = Date.parse("2026-11-17T17:19:00+02:00");
  const end = Date.parse("2026-11-18T04:51:00+02:00");
  const result = calculateAgastyaArghyaWindows(
    [{body:"Star1",event:"Udaya",utcMilliseconds:start}], {}, () => ({date:new Date(end)}));
  assert.equal(result[0].endUtcMilliseconds-result[0].startUtcMilliseconds, 692*60000);
});
