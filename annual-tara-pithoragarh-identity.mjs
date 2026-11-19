import { locations } from "./annual-tara-locations.mjs";
// The regional record is tied to the project's exact observer, not a city-name match.
const canonical = locations["pithoragarh-project-target"];
export function isProjectPithoragarh(observer) {
  return !!observer && Number(observer.latitude) === canonical.latitude &&
    Number(observer.longitude) === canonical.longitude &&
    Number(observer.elevation) === canonical.elevation;
}
export function resolvePithoragarhSearch(place) {
  if (!place || place.timeZone !== "Asia/Kolkata" || place.countryCode !== "IN" ||
      place.nameLocal?.toLocaleLowerCase("en") !== "pithoragarh" ||
      place.admin1?.toLocaleLowerCase("en") !== "uttarakhand" ||
      !Number.isInteger(Number(place.id))) return null;
  const distance = Math.hypot((place.latitude-canonical.latitude)*111,
    (place.longitude-canonical.longitude)*96);
  // Geocoding identifies the city; the calculation retains canonical project coordinates.
  return distance <= 3 ? {...canonical,name:"पिथौरागढ़, उत्तराखंड, भारत"} : null;
}
