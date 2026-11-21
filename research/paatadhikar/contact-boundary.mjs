/** Contact definitions are explicit: a source convention is not a physical disk size. */
export const CONTACT_MODELS = Object.freeze({
  "apparent-disks": Object.freeze({
    id: "apparent-disks",
    provenance: "sum-of-apparent-solar-and-lunar-semidiameters",
    status: "research-only-not-approved"
  }),
  "taraprasad-30-arcmin": Object.freeze({
    id: "taraprasad-30-arcmin",
    boundaryDegrees: 0.5,
    provenance: "inferred-from-user-supplied-taraprasad-2023-2024-endpoints",
    status: "source-convention-inferred-not-publisher-confirmed"
  })
});

export function contactModel(id = "apparent-disks") {
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
