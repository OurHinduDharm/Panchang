/**
 * Resolve city-centre observer profiles for every city in the captured Drik
 * Guru/Shukra reference dataset. Coordinates come from OSM Nominatim;
 * elevation comes from Open-Meteo's Copernicus DEM elevation endpoint.
 *
 * This produces research metadata only. DEM elevation is a ~90 m grid sample,
 * not a surveyed building/site height or a local skyline/horizon profile.
 *
 * Usage: node research/city-observer-profiles.mjs --output city-observer-profiles.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "data/drik-planetary-reference-2024-2027.json");
const USER_AGENT = "OurHinduDharm-Panchang-Research/1.0 (open-source city observer profile audit)";
const EXPECTED_CITIES = [
  { geonameId: "1261481", city: "New Delhi", state: "Delhi", aliases: ["New Delhi", "Delhi"] },
  { geonameId: "1275339", city: "Mumbai", state: "Maharashtra", aliases: ["Mumbai"] },
  { geonameId: "1253914", city: "Ujjain", state: "Madhya Pradesh", aliases: ["Ujjain"] },
  { geonameId: "1253405", city: "Varanasi", state: "Uttar Pradesh", aliases: ["Varanasi", "Banaras"] },
  { geonameId: "1259503", city: "Pithoragarh", state: "Uttarakhand", aliases: ["Pithoragarh"] }
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const normalize = value => String(value || "").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT }
  });
  if (!response.ok) throw new Error("HTTP_" + response.status + " for " + url);
  return response.json();
}

async function resolveCity(target) {
  const query = [target.city, target.state, "India"].join(", ");
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("accept-language", "en");
  url.searchParams.set("q", query);

  const candidates = await fetchJson(url);
  const match = candidates.find(place => {
    const address = place.address || {};
    const cityLabels = [
      address.city, address.town, address.village, address.municipality,
      address.county, place.name
    ].filter(Boolean).map(normalize);
    const stateLabel = normalize(address.state || address.state_district || "");
    const cityMatch = target.aliases.some(alias => cityLabels.includes(normalize(alias)));
    const stateMatch = stateLabel === normalize(target.state) ||
      (target.state === "Delhi" && stateLabel.includes("delhi"));
    return cityMatch && stateMatch && normalize(address.country_code) === "in";
  });
  if (!match) {
    throw new Error("No unambiguous exact city/state geocoding match for " + query);
  }

  const latitude = Number(match.lat);
  const longitude = Number(match.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < 6 || latitude > 38 || longitude < 68 || longitude > 98) {
    throw new Error("Invalid India coordinates for " + query);
  }

  const elevationUrl = new URL("https://api.open-meteo.com/v1/elevation");
  elevationUrl.searchParams.set("latitude", String(latitude));
  elevationUrl.searchParams.set("longitude", String(longitude));
  const elevationData = await fetchJson(elevationUrl);
  const elevationMeters = Number(elevationData.elevation?.[0]);
  if (!Number.isFinite(elevationMeters) || elevationMeters < -500 || elevationMeters > 9000) {
    throw new Error("Missing or invalid DEM elevation for " + query);
  }

  return {
    geonameId: target.geonameId,
    city: target.city,
    state: target.state,
    country: "India",
    latitude,
    longitude,
    elevationMeters: Math.round(elevationMeters * 10) / 10,
    timeZone: "Asia/Kolkata",
    coordinateSource: "OpenStreetMap Nominatim",
    coordinateDisplayName: match.display_name,
    osmType: match.osm_type,
    osmId: match.osm_id,
    elevationSource: "Open-Meteo Elevation API / Copernicus DEM",
    elevationResolutionMeters: 90,
    elevationExact: false,
    observerScope: "city-centre research profile; not arbitrary address or hilltop",
    profileVersion: 1
  };
}

async function main() {
  const reference = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
  const referenceCities = new Set((reference.cities || []).map(city => city.geonameId));
  const missing = EXPECTED_CITIES.filter(city => !referenceCities.has(city.geonameId));
  if (missing.length) throw new Error("Expected city IDs missing from Drik source data: " +
    missing.map(city => city.geonameId).join(", "));

  const snapshotIndex = process.argv.indexOf("--snapshot");
  let report;
  if (snapshotIndex >= 0) {
    const snapshotPath = process.argv[snapshotIndex + 1];
    if (!snapshotPath) throw new Error("--snapshot requires a JSON file path");
    report = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    if (report.schemaVersion !== 1 || report.publicationEligible !== false ||
        !Array.isArray(report.profiles)) {
      throw new Error("Invalid or publication-eligible city observer snapshot");
    }
    const byId = new Map(report.profiles.map(profile => [profile.geonameId, profile]));
    if (byId.size !== EXPECTED_CITIES.length ||
        EXPECTED_CITIES.some(city => !byId.has(city.geonameId))) {
      throw new Error("Snapshot must contain exactly the five expected city profiles");
    }
    for (const target of EXPECTED_CITIES) {
      const profile = byId.get(target.geonameId);
      if (profile.city !== target.city || profile.state !== target.state ||
          profile.country !== "India" ||
          !Number.isFinite(profile.latitude) || profile.latitude < 6 || profile.latitude > 38 ||
          !Number.isFinite(profile.longitude) || profile.longitude < 68 || profile.longitude > 98 ||
          !Number.isFinite(profile.elevationMeters) || profile.elevationMeters < -500 ||
          profile.elevationMeters > 9000 ||
          profile.elevationExact !== false ||
          profile.elevationResolutionMeters !== 90 ||
          !String(profile.coordinateSource || "").includes("OpenStreetMap") ||
          !String(profile.elevationSource || "").includes("Copernicus DEM")) {
        throw new Error("Invalid provenance, location or elevation metadata for " + target.city);
      }
    }
    report = {
      ...report,
      snapshotMode: true,
      snapshotPath,
      interpretation: String(report.interpretation || "") +
        " CI used the pinned, versioned snapshot; refresh it deliberately rather than querying public geocoding/elevation services on every commit."
    };
  } else {
    const profiles = [];
    for (const city of EXPECTED_CITIES) {
      profiles.push(await resolveCity(city));
      // Respect Nominatim's public-service usage policy: at most one request/second.
      await sleep(1100);
    }

    report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      sourceReference: "data/drik-planetary-reference-2024-2027.json",
      coordinateProvider: "OpenStreetMap Nominatim",
      elevationProvider: "Open-Meteo Elevation API / Copernicus DEM",
      elevationResolutionMeters: 90,
      profiles,
      publicationEligible: false,
      snapshotMode: false,
      interpretation: "City-centre coordinates and DEM elevations are inputs for separate city-wise research back-tests. They do not establish Drik's undisclosed observer coordinates, surveyed elevation, local skyline, or publication-grade visibility times."
    };
  }

  const outputIndex = process.argv.indexOf("--output");
  if (outputIndex >= 0 && process.argv[outputIndex + 1]) {
    fs.writeFileSync(process.argv[outputIndex + 1], JSON.stringify(report, null, 2) + "\n");
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
