// Derived from the GeoNames India/cities1000 extracts (CC BY 4.0).
// Each row stores id, city, state/district codes, lat/lon, height and aliases.
let indexPromise;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(new URL("./data/tara-india-places.json", import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error("Place index unavailable");
        return response.json();
      }).catch(error => {
        indexPromise = undefined;
        throw error;
      });
  }
  return indexPromise;
}

function searchKey(text) {
  // Fold Latin diacritics while preserving Devanagari vowel signs.
  return text.normalize("NFD").replace(/([a-z])[\u0300-\u036f]+/gi, "$1")
    .replace(/\u093c/g, "").normalize("NFC").toLowerCase().trim();
}

function toPlace([id, city, stateCode, districtCode, latitude, longitude, elevation], index) {
  const admin1 = (index.states[stateCode] || "").replace(/^(State of |Union Territory of )/, "");
  const admin2 = index.districts[stateCode + "." + districtCode] || "";
  return {
    id, city, admin1, admin2, stateCode, countryCode: "IN", timeZone: "Asia/Kolkata",
    name: [city, admin2, admin1, "भारत"].filter(Boolean).join(", "),
    latitude, longitude, elevation, elevationStatus: "estimated", elevationSource: "GeoNames point elevation or DEM"
  };
}

export function matchPlaces(index, query) {
  const term = searchKey(query);
  if (term.length < 2 || term.length > 100) return [];
  const exact = [], prefix = [];
  for (const row of index.cities) {
    const names = [row[1], ...row[7]].map(searchKey);
    if (names.includes(term)) exact.push(row);
    else if (prefix.length < 12 && names.some(name => name.startsWith(term))) prefix.push(row);
    if (exact.length === 12) break;
  }
  return exact.concat(prefix).slice(0, 12).map(row => toPlace(row, index));
}

export async function searchTaraPlaces(query) {
  if (query.trim().length < 2) return [];
  return matchPlaces(await loadIndex(), query);
}

export async function findTaraPlace(id) {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const index = await loadIndex();
  const row = index.cities.find(place => String(place[0]) === id);
  return row ? toPlace(row, index) : null;
}


/** Resolve an exact city/alias against the full index and nearby coordinates.
 * UI search is capped at 12 results; observer resolution must not be.
 */
export function matchNearestPlace(index, query, lat, lon, maxDistanceKm = 3) {
  const term = searchKey(String(query || ""));
  if (term.length < 2 || term.length > 100 ||
      !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  let nearest = null;
  let nearestDistance = maxDistanceKm;
  for (const row of index.cities) {
    if (!Number.isFinite(row[6])) continue;
    if (![row[1], ...(row[7] || [])].some(name => searchKey(name) === term)) continue;
    const midLat = (lat + row[4]) * Math.PI / 360;
    const distance = Math.hypot((lat - row[4]) * 111.2,
      (lon - row[5]) * 111.2 * Math.cos(midLat));
    if (distance <= nearestDistance) {
      nearestDistance = distance;
      nearest = row;
    }
  }
  return nearest ? toPlace(nearest, index) : null;
}

export async function findNearestTaraPlace(query, lat, lon, maxDistanceKm = 3) {
  return matchNearestPlace(await loadIndex(), query, lat, lon, maxDistanceKm);
}
