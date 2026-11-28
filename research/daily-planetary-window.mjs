// Convert the independent annual model's events into one daily card interval.
// A date denotes a civil IST day, not the instant at which the user loads it.
const DAY_MS = 86400000;

export function selectDailyPlanetaryWindow(events, body, isoDate) {
  if (!["Jupiter","Venus"].includes(body) || !Array.isArray(events) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const start = Date.parse(isoDate + "T00:00:00+05:30");
  if (!Number.isFinite(start) || new Date(start + 19800000).toISOString().slice(0,10) !== isoDate) return null;
  const end = start + DAY_MS;
  const rows = events.filter(e => e?.body === body && ["Asta","Udaya"].includes(e.event) &&
    Number.isFinite(e.utcMilliseconds)).sort((a,b)=>a.utcMilliseconds-b.utcMilliseconds);
  // The first event at or after midnight determines the relevant window.
  // Never jump over an unpaired crossing to present a later event as current.
  const index = rows.findIndex(e=>e.utcMilliseconds>=start);
  if (index<0) return null;
  const first = rows[index];
  const aIndex = first.event==="Udaya" ? index-1 : index;
  const uIndex = aIndex+1;
  const asta = rows[aIndex], udaya = rows[uIndex];
  if (asta?.event!=="Asta" || udaya?.event!=="Udaya" ||
      asta.utcMilliseconds>=udaya.utcMilliseconds) return null;
  // Repeated same-type transitions or simultaneous conflicting events are ambiguous.
  if (rows[aIndex-1]?.event==="Asta" || rows[uIndex+1]?.event==="Udaya" ||
      rows[aIndex-1]?.utcMilliseconds===asta.utcMilliseconds ||
      rows[uIndex+1]?.utcMilliseconds===udaya.utcMilliseconds) return null;
  return {status:asta.utcMilliseconds<end?"active":"upcoming",
    astaUtcMilliseconds:asta.utcMilliseconds,udayaUtcMilliseconds:udaya.utcMilliseconds};
}
