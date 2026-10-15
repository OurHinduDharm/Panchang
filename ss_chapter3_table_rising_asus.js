/**
 * Research-only Chapter II table path for Sūrya-siddhānta III.43–45 rising-asus.
 *
 * This deliberately keeps the Chapter II sine/versed-sine table route separate
 * from the modern trigonometric control in ss_chapter3_source_rising_asus.js.
 * The input latitude and the source's maximum-declination sine (II.28 = 1397)
 * are used to derive cara endpoints at 30°, 60°, and 90° ecliptic longitude.
 *
 * Scope limit: this is a table-interpolated candidate chain, not proof that all
 * historical table conventions/rounding have been reconstructed. It does not
 * derive solar longitude from ahargana or connect to Chapter IX event dates.
 */

import { chapter2ArcMinutesFromSine } from "./ss_chapter2_versed_sine_table.js";
import { chapter3DayMeasureInputsFromSolarLongitude } from "./ss_chapter3_nata_table_arithmetic.js";
import { chapter3RisingAsusFromCaraEndpoints } from "./ss_chapter3_source_rising_asus.js";

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

/** Derive one cara endpoint using the Chapter II sine-table arithmetic chain. */
export function chapter3CaraEndpointFromChapter2Tables({ latitudeDeg, solarLongitudeDeg }) {
  finite(latitudeDeg, "latitudeDeg");
  finite(solarLongitudeDeg, "solarLongitudeDeg");
  if (Math.abs(latitudeDeg) >= 90) throw new RangeError("latitudeDeg magnitude must be below 90°.");
  const dayMeasure = chapter3DayMeasureInputsFromSolarLongitude({
    latitudeArcMinutes: latitudeDeg * 60,
    solarLongitudeArcMinutes: solarLongitudeDeg * 60
  });
  const caraMagnitude = Math.abs(dayMeasure.caraSine);
  const caraArc = chapter2ArcMinutesFromSine(caraMagnitude);
  return {
    latitudeDeg,
    solarLongitudeDeg,
    caraSine: dayMeasure.caraSine,
    caraArcMinutes: Math.sign(dayMeasure.caraSine) * caraArc.arcMinutes,
    caraArc,
    declinationArcMinutes: dayMeasure.solarDeclinationArcMinutes,
    dayRadius: dayMeasure.dayRadius,
    provenance: "SS II.17–22 table interpolation + II.28 + II.60–61 + III.18–19 + III.34 candidate",
    limitation: "Table interpolation/rounding and historical convention remain candidates; solar longitude is supplied."
  };
}

/** Build the three endpoint charakhandas, then apply the source sequence III.43–45. */
export function chapter3RisingAsusFromChapter2Tables({ latitudeDeg }) {
  const endpoints = [30, 60, 90].map(solarLongitudeDeg =>
    chapter3CaraEndpointFromChapter2Tables({ latitudeDeg, solarLongitudeDeg }));
  const caraAt30 = endpoints[0].caraArcMinutes;
  const caraAt60 = endpoints[1].caraArcMinutes;
  const caraAt90 = endpoints[2].caraArcMinutes;
  const rising = chapter3RisingAsusFromCaraEndpoints({ caraAt30, caraAt60, caraAt90 });
  return {
    ...rising,
    latitudeDeg,
    caraEndpoints: endpoints,
    method: "Chapter II table-derived cara endpoints + Chapter III.43–45 source sequence",
    limitation: "Independent of modern trig for cara endpoints, but still a table-interpolation candidate—not a certified classical event-time model."
  };
}

export function runChapter3TableRisingAsusTests() {
  const tests = [];
  const check = (name, fn) => {
    try {
      tests.push({ name, passed: Boolean(fn()) });
    } catch (error) {
      tests.push({ name, passed: false, error: error.message });
    }
  };
  const close = (a, b, tolerance = 1e-9) => Math.abs(a - b) <= tolerance;

  const washington = chapter3RisingAsusFromChapter2Tables({ latitudeDeg: 38 + 54 / 60 });
  check("Washington table path derives finite cara endpoints from Chapter II tables", () =>
    washington.caraEndpoints.length === 3 &&
    washington.caraEndpoints.every(point =>
      Number.isFinite(point.caraArcMinutes) && Number.isFinite(point.declinationArcMinutes)));

  check("Washington table-derived cara endpoints stay within 3 asu of Burgess's 578/1061/1263 example", () =>
    washington.caraEndpoints.every((point, i) =>
      Math.abs(point.caraArcMinutes - [578, 1061, 1263][i]) < 3));

  check("table path yields twelve finite rising periods totaling 21600 asu", () =>
    washington.risingAsus.length === 12 &&
    washington.risingAsus.every(Number.isFinite) &&
    close(washington.sumAsus, 21600));

  const pithoragarh = chapter3RisingAsusFromChapter2Tables({ latitudeDeg: 29.5828 });
  check("Pithoragarh table path uses Chapter II table values and totals 21600 asu", () =>
    pithoragarh.caraEndpoints.every(point =>
      point.provenance.includes("SS II.17–22")) &&
    pithoragarh.risingAsus.length === 12 &&
    pithoragarh.risingAsus.every(Number.isFinite) &&
    close(pithoragarh.sumAsus, 21600));

  check("southern latitude preserves signed cara direction without silently taking its sign from longitude", () => {
    const north = chapter3CaraEndpointFromChapter2Tables({ latitudeDeg: 29.5828, solarLongitudeDeg: 60 });
    const south = chapter3CaraEndpointFromChapter2Tables({ latitudeDeg: -29.5828, solarLongitudeDeg: 60 });
    return close(north.caraArcMinutes, -south.caraArcMinutes);
  });

  return {
    tests,
    total: tests.length,
    passed: tests.filter(test => test.passed).length,
    allPassed: tests.every(test => test.passed),
    washington,
    pithoragarh,
    note: "These checks validate the table-interpolation candidate against a published example; they do not certify the epoch/frame or Chapter IX event dates."
  };
}
