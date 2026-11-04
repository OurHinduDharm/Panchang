import { readFile } from "node:fs/promises";
import { Equator, Observer } from "astronomy-engine";

const dataset = JSON.parse(await readFile(new URL("../data/asta-udaya-benchmark.json", import.meta.url), "utf8"));
const thresholds = { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 };

function localNoon(dateString) {
  return new Date(dateString + "T12:00:00+05:30");
}

function addDays(dateString, days) {
  const date = new Date(dateString + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function angularSeparation(body, date, observer) {
  const planet = Equator(body, date, observer, true, true);
  const sun = Equator("Sun", date, observer, true, true);
  const vector = point => {
    const ra = point.ra * Math.PI / 12;
    const dec = point.dec * Math.PI / 180;
    return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  };
  const a = vector(planet);
  const b = vector(sun);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return Math.acos(dot) * 180 / Math.PI;
}

function formatIST(date) {\n  return new Date(date.getTime() + 330 * 60000).toISOString().replace("Z", "+05:30");\n}\n\nfunction findBoundary(body, timestamp, threshold, type, observer) {
  const target = Date.parse(timestamp);
  const centerDate = timestamp.slice(0, 10);
  let previousDate = addDays(centerDate, -30);
  let previousValue = angularSeparation(body, localNoon(previousDate), observer);

  for (let day = -29; day <= 30; day++) {
    const date = addDays(centerDate, day);
    const value = angularSeparation(body, localNoon(date), observer);
    const crossed = type === "asta"
      ? previousValue > threshold && value <= threshold
      : previousValue <= threshold && value > threshold;
    if (crossed) {
      let low = localNoon(previousDate).getTime();
      let high = localNoon(date).getTime();
      for (let i = 0; i < 24 && high - low > 30000; i++) {
        const middle = (low + high) / 2;
        const angle = angularSeparation(body, new Date(middle), observer);
        const past = type === "asta" ? angle <= threshold : angle > threshold;
        if (past) high = middle;
        else low = middle;
      }
      return new Date((low + high) / 2);
    }
    previousDate = date;
    previousValue = value;
  }
  return null;
}

const report = [];
for (const entry of dataset.cases) {
  if (entry.precision !== "minute" || !entry.testObserver?.latitude || !entry.testObserver?.longitude) continue;
  const observer = new Observer(
    entry.testObserver.latitude,
    entry.testObserver.longitude,
    entry.testObserver.elevationMeters ?? 0
  );
  const threshold = thresholds[entry.planet];
  for (const [key, type] of [["astaStart", "asta"], ["astaEnd", "udaya"]]) {
    const published = entry.boundaries[key];
    const calculated = findBoundary(entry.planet, published, threshold, type, observer);
    report.push({
      case: entry.id,
      location: entry.sourceLocation,
      boundary: key,
      publishedIST: published,
      modelIST: calculated ? formatIST(calculated) : null,
      signedDifferenceMinutes: calculated ? Math.round((calculated.getTime() - Date.parse(published)) / 60000) : null,
      thresholdDegrees: threshold,
      observer: { latitude: observer.latitude, longitude: observer.longitude, elevationMeters: observer.height },
      status: calculated ? "diagnostic-only" : "no-crossing-found"
    });
  }
}

console.log(JSON.stringify({
  title: "Drik similarity diagnostic — topocentric angular-threshold candidate",
  warning: "Not a Drik clone or acceptance result. Pithoragarh provider coordinates are undisclosed; this compares a project-selected observer at the same city label.",
  cases: report
}, null, 2));
