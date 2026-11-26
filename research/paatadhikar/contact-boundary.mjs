/** Contact definitions are explicit: a source convention is not a physical disk size. */
// Vatesvara Siddhanta, Spashtadhikara, Pata 22–23 and commentary;
// Surya Siddhanta XI.14: half the sum of the apparent disk diameters.
export const PRIMARY_CONTACT_MODEL = "apparent-disks";
export const CONTACT_MODELS = Object.freeze({
  "apparent-disks": Object.freeze({
    id: "apparent-disks",
    provenance: "sum-of-apparent-solar-and-lunar-semidiameters",
    status: "research-only-not-approved"
  }),
  "drik-31-arcmin": Object.freeze({
    id: "drik-31-arcmin",
    boundaryDegrees: 31 / 60,
    provenance: "inferred-from-80-drik-ramnagar-2025-2027-pairs",
    status: "source-convention-inferred-not-publisher-confirmed"
  }),
  "taraprasad-30-arcmin": Object.freeze({
    id: "taraprasad-30-arcmin",
    boundaryDegrees: 0.5,
    provenance: "inferred-from-user-supplied-taraprasad-2023-2024-endpoints",
    status: "source-convention-inferred-not-publisher-confirmed"
  })
});

export function contactModel(id = PRIMARY_CONTACT_MODEL) {
  if (!Object.hasOwn(CONTACT_MODELS, id)) throw new RangeError(`unknown contact model: ${id}`);
  return CONTACT_MODELS[id];
}

export function contactBoundaryDegrees(model, semidiameterSumDegrees) {
  const selected = contactModel(model);
  if (!Number.isFinite(semidiameterSumDegrees) || semidiameterSumDegrees <= 0) {
    throw new RangeError("positive finite apparent semidiameter sum required");
  }
  return selected.boundaryDegrees ?? semidiameterSumDegrees;
}


/** Signed declination bands (degrees); never change relation at the equator.
 * The caller must independently validate ayana/gola at the middle root.
 * AU distances are apparent geocentric distances at the evaluation instant.
 */
export function pataContactState({ sunDeclination, moonDeclination, sunDistanceAU, moonDistanceAU, model = PRIMARY_CONTACT_MODEL }) {
  const AU_KM = 149597870.7;
  const solarRadiusAU = 695700 / AU_KM;
  const lunarRadiusAU = 1737.4 / AU_KM;
  if (![sunDeclination, moonDeclination, sunDistanceAU, moonDistanceAU].every(Number.isFinite) ||
      Math.abs(sunDeclination) > 90 || Math.abs(moonDeclination) > 90 ||
      sunDistanceAU <= solarRadiusAU || moonDistanceAU <= lunarRadiusAU) {
    throw new RangeError("invalid apparent geocentric coordinates or distances");
  }
  const semidiameterSum = (Math.asin(solarRadiusAU / sunDistanceAU) +
    Math.asin(lunarRadiusAU / moonDistanceAU)) * 180 / Math.PI;
  const contactBoundary = contactBoundaryDegrees(model, semidiameterSum);
  const vyatipataRelation = moonDeclination - sunDeclination;
  const vaidhritiRelation = moonDeclination + sunDeclination;
  return { semidiameterSum, contactBoundary, vyatipataRelation, vaidhritiRelation,
    vyatipataClearance: Math.abs(vyatipataRelation) - contactBoundary,
    vaidhritiClearance: Math.abs(vaidhritiRelation) - contactBoundary };
}
