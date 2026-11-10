import * as Astronomy from "astronomy-engine";

const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const timeZone = "Asia/Kolkata";
const start = new Date("2028-01-01T00:00:00Z");
const finish = new Date("2028-06-16T00:00:00Z");

function local(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

function eventRows(direction) {
  const rows = [];
  let cursor = new Date(start);
  for (let count = 0; count < 400; count++) {
    const event = Astronomy.SearchRiseSet("Mars", observer, direction, cursor, 1, 0);
    if (!event?.date || event.date >= finish) break;
    const date = event.date;
    const mars = Astronomy.Equator("Mars", date, observer, true, true);
    const sun = Astronomy.Equator("Sun", date, observer, true, true);
    const marsHorizon = Astronomy.Horizon(date, observer, mars.ra, mars.dec, "normal");
    const sunHorizon = Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal");
    const illumination = Astronomy.Illumination("Mars", date);
    const relativeLongitude = Astronomy.PairLongitude("Mars", "Sun", date);
    const signedLongitude = relativeLongitude > 180 ? relativeLongitude - 360 : relativeLongitude;
    rows.push({
      event: direction === 1 ? "rise" : "set",
      localIST: local(date),
      utc: date.toISOString(),
      marsAltitudeDeg: Number(marsHorizon.altitude.toFixed(4)),
      sunAltitudeDeg: Number(sunHorizon.altitude.toFixed(4)),
      marsAzimuthDeg: Number(marsHorizon.azimuth.toFixed(4)),
      sunAzimuthDeg: Number(sunHorizon.azimuth.toFixed(4)),
      signedEclipticLongitudeDeltaDeg: Number(signedLongitude.toFixed(4)),
      elongationDeg: Number(Astronomy.AngleFromSun("Mars", date).toFixed(4)),
      apparentMagnitude: Number(illumination.mag.toFixed(3)),
      illuminatedFraction: Number(illumination.phase_fraction.toFixed(4))
    });
    cursor = new Date(date.getTime() + 1000);
  }
  return rows;
}

const rows = [...eventRows(1), ...eventRows(-1)]
  .sort((a, b) => a.utc.localeCompare(b.utc));
const focus = rows.filter(row =>
  row.localIST.startsWith("2028-01-") ||
  row.localIST.startsWith("2028-02-") ||
  row.localIST.startsWith("2028-05-") ||
  row.localIST.startsWith("2028-06-")
);
console.log(JSON.stringify({
  title: "Pithoragarh Mars local horizon-event geometry, Jan-Jun 2028",
  observer: { latitude: 29.5828, longitude: 80.2182, elevationMeters: 1650, timeZone },
  method: "Astronomy Engine topocentric SearchRiseSet for every Mars rise and set. At each event, record refracted-horizon altitude/azimuth, Sun altitude/azimuth, signed geocentric ecliptic longitude difference from Sun, angular separation, apparent magnitude and illuminated fraction. This is a geometry diagnostic, not a fitted heliacal threshold or a Tara Asta/Udaya prediction.",
  sourceBenchmarks: {
    angular17DegreeStart: "2028-01-04T18:15:00+05:30",
    angular17DegreeEnd: "2028-06-05T20:18:00+05:30",
    siddhantaUjjainAsta: "2028-01-13T18:44:00+05:30",
    siddhantaUjjainUdaya: "2028-06-08T04:55:00+05:30"
  },
  totalRiseEvents: rows.filter(x => x.event === "rise").length,
  totalSetEvents: rows.filter(x => x.event === "set").length,
  focusedEvents: focus
}, null, 2));
