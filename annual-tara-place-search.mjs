// Global place search; elevation and IANA timezone must come from the same selected result.
export function normalizeSearchPlace(item) {
  if (!item || typeof item !== "object") return null;
  const latitude = Number(item.latitude), longitude = Number(item.longitude);
  const elevation = item.elevation == null || item.elevation === "" ? NaN : Number(item.elevation);
  const timeZone = item.timezone;
  if (![latitude, longitude, elevation].every(Number.isFinite) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180 ||
      elevation < -500 || elevation > 9000 ||
      typeof timeZone !== "string" || !timeZone.includes("/")) return null;
  try { new Intl.DateTimeFormat("en", {timeZone}); } catch { return null; }
  if (!item.name || !item.country) return null;
  const name = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
  return Object.freeze({
    id: String(item.id ?? [latitude, longitude].join(":")),
    name, latitude, longitude, elevation, timeZone
  });
}

export function uniqueSearchPlaces(items) {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).map(normalizeSearchPlace).filter(place => {
    if (!place) return false;
    const key = [place.latitude.toFixed(5), place.longitude.toFixed(5), place.timeZone].join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchTaraPlaces(query, signal) {
  const term = query.trim();
  if (term.length < 2 || term.length > 100) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({name: term, count: "10", language: "en", format: "json"}).toString();
  const response = await fetch(url, {signal});
  if (!response.ok) throw new Error("Location lookup failed");
  const data = await response.json();
  return uniqueSearchPlaces(data.results);
}
