// Public catalogue scope applies equally to static cards and engine output.
const excludedTradition = /iskcon|इ[सष]्?क[ॉोा]न/i;
export function inPublicFestivalScope(event) {
  if (typeof event === "string") return !excludedTradition.test(event);
  if (!event || typeof event !== "object") return false;
  return ![event.tradition, event.calendarVariant, event.observanceId, event.ruleId,
    event.name, event.title, event.festival, event.label, event.description,
    event.articleLabel, event.secondaryArticleLabel].some(value =>
      typeof value === "string" && excludedTradition.test(value));
}
