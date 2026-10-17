import test from "node:test";
import assert from "node:assert/strict";
import { calculateNivasa } from "../nivas.js";

// Cross-check values shown by the dated Panchang references gathered during research.
test("2026-09-22: tithi 11, Tuesday -> Agni Prithvi and Shiva Kreeda", () => {
  const result = calculateNivasa(10, 2);
  assert.equal(result.tithi, 11);
  assert.equal(result.agni.name, "पृथ्वी");
  assert.equal(result.shiva.name, "क्रीड़ा");
  assert.equal(result.agniRemainder, 3);
  assert.equal(result.shivaRemainder, 6);
});

test("2026-10-05: tithi 25, Monday -> Agni Prithvi and Shiva Kreeda", () => {
  const result = calculateNivasa(24, 1);
  assert.equal(result.tithi, 25);
  assert.equal(result.agni.name, "पृथ्वी");
  assert.equal(result.shiva.name, "क्रीड़ा");
  assert.equal(result.agniRemainder, 0);
  assert.equal(result.shivaRemainder, 6);
});

test("all 210 tithi-weekday combinations follow the published remainder tables", () => {
  const agniNames = ["पृथ्वी", "आकाश", "पाताल", "पृथ्वी"];
  const shivaNames = ["श्मशान", "कैलाश", "गौरी-सन्निधि", "नन्दी पर", "सभा", "भोजन", "क्रीड़ा"];

  for (let tithi = 1; tithi <= 30; tithi++) {
    for (let weekdayIndex = 0; weekdayIndex <= 6; weekdayIndex++) {
      const result = calculateNivasa(tithi - 1, weekdayIndex);
      const weekdayNumber = weekdayIndex + 1;
      const agniRemainder = (tithi + weekdayNumber + 1) % 4;
      const shivaRemainder = (tithi * 2 + 5) % 7;

      assert.equal(result.tithi, tithi);
      assert.equal(result.agniRemainder, agniRemainder);
      assert.equal(result.shivaRemainder, shivaRemainder);
      assert.equal(result.agni.name, agniNames[agniRemainder]);
      assert.equal(result.shiva.name, shivaNames[shivaRemainder]);
    }
  }
});

test("rejects invalid tithi and weekday inputs", () => {
  assert.equal(calculateNivasa(-1, 0), null);
  assert.equal(calculateNivasa(30, 0), null);
  assert.equal(calculateNivasa(0, 7), null);
});
