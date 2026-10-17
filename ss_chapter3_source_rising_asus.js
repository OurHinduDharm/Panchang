/**
 * Research-only source-sequence implementation for Sūrya-siddhānta III.43–45.
 *
 * Separates the textual rising-asus construction from any method used to
 * calculate the three ascensional differences (cara endpoints). The primary
 * function accepts those differences as explicit inputs so the source
 * arithmetic can be audited independently.
 *
 * The optional geometry helper is a modern trigonometric control only; it is
 * not represented as the treatise's sine-table calculation.
 */

const LANKA_FIRST_THREE = Object.freeze([1670, 1795, 1935]);

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

function norm360(value) {
  return ((value % 360) + 360) % 360;
}

/**
 * Apply III.43–45 to the three endpoint ascensional differences (in asu).
 *
 * caraAt30/60/90 are the accumulated ascensional differences at 30°, 60°,
 * and 90°. The three charakhaṇḍas are respectively A30, A60-A30, A90-A60.
 * III.44 subtracts these from the Lanka values; III.45 reverses the three
 * Lanka values and adds the corresponding charakhaṇḍas in reverse order.
 */
export function chapter3RisingAsusFromCaraEndpoints({
  caraAt30,
  caraAt60,
  caraAt90
}) {
  for (const [name, value] of Object.entries({ caraAt30, caraAt60, caraAt90 })) {
    finite(value, name);
    if (value < 0 || value >= 5400) throw new RangeError(name + " must be in [0, 5400).");
  }
  if (caraAt60 < caraAt30 || caraAt90 < caraAt60) {
    throw new RangeError("Cara endpoint values must be non-decreasing for this northern-latitude branch.");
  }

  const caraKhandas = [
    caraAt30,
    caraAt60 - caraAt30,
    caraAt90 - caraAt60
  ];
  const firstThree = LANKA_FIRST_THREE.map((lanka, i) => lanka - caraKhandas[i]);
  const nextThree = [
    LANKA_FIRST_THREE[2] + caraKhandas[2],
    LANKA_FIRST_THREE[1] + caraKhandas[1],
    LANKA_FIRST_THREE[0] + caraKhandas[0]
  ];
  const firstSix = [...firstThree, ...nextThree];
  const allTwelve = [...firstSix, ...firstSix.slice().reverse()];

  return {
    lankaFirstThree: [...LANKA_FIRST_THREE],
    caraEndpoints: [caraAt30, caraAt60, caraAt90],
    caraKhandas,
    risingAsus: allTwelve,
    sumAsus: allTwelve.reduce((sum, value) => sum + value, 0),
    provenance: "Sūrya-siddhānta III.43–45 source-sequence arithmetic",
    limitation: "The cara endpoint inputs must be calculated independently; this function does not certify their astronomy."
  };
}

/**
 * Modern trigonometric control for cara endpoints, not the source-table path.
 * With declination of ecliptic longitude λ derived from obliquity ε,
 * ascensional difference A = asin(tan(latitude) * tan(declination)).
 */
export function chapter3CaraEndpointsTrigControl({
  latitudeDeg,
  obliquityDeg = 24
}) {
  finite(latitudeDeg, "latitudeDeg");
  finite(obliquityDeg, "obliquityDeg");
  if (Math.abs(latitudeDeg) >= 90 || Math.abs(obliquityDeg) >= 90) {
    throw new RangeError("Latitude and obliquity must have magnitudes below 90°.");
  }
  const latitude = latitudeDeg * Math.PI / 180;
  const obliquity = obliquityDeg * Math.PI / 180;
  const caraEndpoints = [30, 60, 90].map(longitudeDeg => {
    const longitude = longitudeDeg * Math.PI / 180;
    const declination = Math.asin(Math.max(-1, Math.min(1,
      Math.sin(obliquity) * Math.sin(longitude))));
    const argument = Math.tan(latitude) * Math.tan(declination);
    if (Math.abs(argument) > 1) {
      throw new RangeError("Ascensional difference is undefined for this latitude/declination.");
    }
    return Math.asin(argument) * 180 / Math.PI * 60;
  });
  return {
    latitudeDeg,
    obliquityDeg,
    caraEndpoints,
    provenance: "modern trigonometric comparison control only",
    limitation: "Not a substitute for the historical sine/versed-sine table arithmetic."
  };
}

export function runChapter3SourceRisingAsusTests() {
  const tests = [];
  const check = (name, fn) => {
    try {
      tests.push({ name, passed: Boolean(fn()) });
    } catch (error) {
      tests.push({ name, passed: false, error: error.message });
    }
  };
  const close = (a, b, tolerance = 1e-9) => Math.abs(a - b) <= tolerance;

  const washington = chapter3RisingAsusFromCaraEndpoints({
    caraAt30: 578,
    caraAt60: 1061,
    caraAt90: 1263
  });
  check("Burgess Washington example reproduces Aries/Taurus/Gemini 1092/1312/1733", () =>
    washington.risingAsus.slice(0, 3).every((v, i) =>
      close(v, [1092, 1312, 1733][i])));
  check("III.45 reverses Lanka values and adds reversed charakhandas for Cancer/Virgo sequence", () =>
    washington.risingAsus.slice(3, 6).every((v, i) =>
      close(v, [2137, 2278, 2248][i])));
  check("III.45 mirrors the first six rising periods for the last six", () =>
    washington.risingAsus.slice(6).every((v, i) =>
      close(v, washington.risingAsus[5 - i])));
  check("all twelve source-sequence rising periods total 21600 asu", () =>
    close(washington.sumAsus, 21600));

  const trigWashington = chapter3CaraEndpointsTrigControl({ latitudeDeg: 38 + 54 / 60 });
  check("trigonometric control is within 1.1 asu of Burgess Washington cara endpoints", () =>
    trigWashington.caraEndpoints.every((v, i) =>
      Math.abs(v - [578, 1061, 1263][i]) < 1.1));

  const pithoragarhCara = chapter3CaraEndpointsTrigControl({ latitudeDeg: 29.5828 });
  const pithoragarh = chapter3RisingAsusFromCaraEndpoints({
    caraAt30: pithoragarhCara.caraEndpoints[0],
    caraAt60: pithoragarhCara.caraEndpoints[1],
    caraAt90: pithoragarhCara.caraEndpoints[2]
  });
  check("Pithoragarh candidate is finite and totals one full circle", () =>
    pithoragarh.risingAsus.length === 12 &&
    pithoragarh.risingAsus.every(Number.isFinite) &&
    close(pithoragarh.sumAsus, 21600));

  return {
    tests,
    total: tests.length,
    passed: tests.filter(test => test.passed).length,
    allPassed: tests.every(test => test.passed),
    washington,
    trigWashington,
    pithoragarhCara,
    pithoragarh,
    note: "Passing checks establish source-sequence arithmetic and a benchmark comparison, not a complete classical Asta/Udaya calculation."
  };
}
