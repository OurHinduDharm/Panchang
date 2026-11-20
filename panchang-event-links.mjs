const locationKeys = ["lat", "lon", "elevation", "elevationStatus", "place", "city", "state"];
const istDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
});

export function panchangIsoDate(instant) {
  const fields = Object.fromEntries(istDate.formatToParts(instant).map(p => [p.type, p.value]));
  return fields.year + "-" + fields.month + "-" + fields.day;
}

export function hasPanchangLinkLocation(params) {
  return locationKeys.some(key => params.has(key));
}

export function clearPanchangLinkLocation(url) {
  for (const key of locationKeys) url.searchParams.delete(key);
}

export function readPanchangLinkLocation(params) {
  if (locationKeys.some(key => params.getAll(key).length > 1)) return null;
  const numbers = ["lat", "lon", "elevation"].map(key => params.get(key));
  if (!numbers.every(s => typeof s === "string" && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))) return null;
  const [lat, lon, elevation] = numbers.map(Number);
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || elevation < -500 || elevation > 9000) return null;
  const statusValue = params.get("elevationStatus");
  if (statusValue !== null && !["provided", "estimated"].includes(statusValue)) return null;
  const [name, city, state] = ["place", "city", "state"].map(key => (params.get(key) || "").trim());
  if ([name, city, state].some(s => s.length > 200 || /[\u0000-\u001f\u007f]/u.test(s))) return null;
  return {name: name || `निर्देशांक ${lat}, ${lon}`, city: city || (name ? name.split(",")[0] : ""), state, lat, lon, elevation, elevationStatus: statusValue || "provided"};
}

export function validPanchangDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const instant = new Date(date + "T00:00:00Z");
  return Number.isFinite(+instant) && instant.toISOString().slice(0, 10) === date && !date.startsWith("0000");
}

export function buildPanchangEventUrl(baseUrl, date, location) {
  if (!validPanchangDate(date)) throw new Error("Invalid event date");
  const elevationStatus = location?.elevationStatus || "provided";
  if (!["provided", "estimated"].includes(elevationStatus)) throw new Error("Observer elevation is unverified");
  const url = new URL(baseUrl);
  clearPanchangLinkLocation(url);
  url.searchParams.set("date", date);
  for (const [key, value] of Object.entries({lat: location.latitude, lon: location.longitude,
    elevation: location.elevation, elevationStatus})) {
    if (value != null && value !== "") url.searchParams.set(key, value);
  }
  if (!readPanchangLinkLocation(url.searchParams)) throw new Error("Invalid event observer");
  return url.href;
}
