/**
 * Lossless review-only extraction of stable display content from legacy cards.
 * Identical display payloads may share storage, never religious identity.
 * Annual source files remain authoritative until reviewed migration.
 */
import { createHash } from "node:crypto";

const DISPLAY_FIELDS = new Set([
  "title", "description", "category", "articleUrl", "articleLabel",
  "imageUrl", "imageAlt", "image", "imageCaption"
]);
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
function contentId(display) {
  return "card-" + createHash("sha256").update(JSON.stringify(canonical(display))).digest("hex");
}
export function extractFestivalCatalogue(months) {
  if (!Array.isArray(months)) throw new TypeError("months must be an array");
  const cards = Object.create(null);
  const snapshots = [];
  const seenMonths = new Set();
  for (const month of months) {
    if (!month || !Number.isInteger(month.year) || !Number.isInteger(month.month) ||
        month.month < 1 || month.month > 12 || !Array.isArray(month.events))
      throw new TypeError("invalid legacy month");
    const key = month.year + "-" + month.month;
    if (seenMonths.has(key)) throw new Error("duplicate source month: " + key);
    seenMonths.add(key);
    const {events, ...metadata} = month;
    const occurrences = events.map(event => {
      if (!event || typeof event.title !== "string" || !event.title.trim())
        throw new TypeError("invalid festival card");
      const display = Object.fromEntries(Object.entries(event).filter(([k]) => DISPLAY_FIELDS.has(k)));
      const annual = Object.fromEntries(Object.entries(event).filter(([k]) => !DISPLAY_FIELDS.has(k)));
      const id = contentId(display);
      if (cards[id] && JSON.stringify(canonical(cards[id])) !== JSON.stringify(canonical(display)))
        throw new Error("content ID collision");
      cards[id] = display;
      return {cardId: id, annual};
    });
    snapshots.push({metadata, occurrences});
  }
  return {schemaVersion: 1, status: "review-only", cards, snapshots};
}
export function restoreFestivalMonths(catalogue) {
  if (catalogue?.schemaVersion !== 1 || !Array.isArray(catalogue.snapshots))
    throw new TypeError("invalid catalogue");
  return catalogue.snapshots.map(({metadata, occurrences}) => ({
    ...metadata,
    events: occurrences.map(({cardId, annual}) => {
      if (!Object.hasOwn(catalogue.cards, cardId)) throw new Error("missing card: " + cardId);
      if (Object.keys(annual).some(k => DISPLAY_FIELDS.has(k))) throw new Error("overlapping display fields");
      return {...catalogue.cards[cardId], ...annual};
    })
  }));
}
