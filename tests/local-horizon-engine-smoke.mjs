import * as Astronomy from "astronomy-engine";
import { findDailyPanchangRiseSet } from "../local-horizon-events.mjs";

const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const events = findDailyPanchangRiseSet({
  astronomy: Astronomy,
  observer,
  localDate: "2026-09-13",
  timeZone: "Asia/Kolkata"
});
const sun = events.find(item => item.body === "Sun");
if (!sun || sun.status !== "both-events-found") {
  throw new Error("Pithoragarh Sun rise/set smoke test failed: " + JSON.stringify(sun));
}
for (const item of events) {
  for (const event of [item.rise, item.set]) {
    if (event && event.localDate !== "2026-09-13") {
      throw new Error("Event escaped the requested local civil day: " + JSON.stringify(item));
    }
  }
}
console.log(JSON.stringify({
  observer: { latitude: observer.latitude, longitude: observer.longitude, elevationMeters: observer.height },
  localDate: "2026-09-13",
  events: events.map(({ body, rise, set, status }) => ({
    body, rise: rise?.localTime ?? null, set: set?.localTime ?? null, status
  }))
}, null, 2));
