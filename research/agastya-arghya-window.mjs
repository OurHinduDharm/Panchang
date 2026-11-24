/** Independent Arghya interval candidate, not a fitted heliacal-visibility rule.
 * Start at the calculated annual Canopus first-visible rise; end at the next
 * calculated local sunrise. Keep the astronomy adapter injected for tests.
 * No reference dates or fixed city-specific times are used at runtime.
 */
export function calculateAgastyaArghyaWindows(events, observer, searchSunrise) {
  if (!Array.isArray(events) || typeof searchSunrise !== "function") {
    throw new TypeError("Events and sunrise calculator required");
  }
  return events.filter(event => event.body === "Star1" && event.event === "Udaya")
    .map(event => {
      const start = event.utcMilliseconds;
      if (!Number.isFinite(start)) return null;
      const sunrise = searchSunrise(observer, new Date(start));
      const end = sunrise?.date instanceof Date ? sunrise.date.getTime() : NaN;
      // A valid first-visible morning/evening Arghya interval must end
      // at the next sunrise, not a previous sunrise or a fabricated time.
      if (!Number.isFinite(end) || end <= start || end - start >= 24 * 3600_000) return null;
      return {startUtcMilliseconds: start, endUtcMilliseconds: end};
    }).filter(Boolean);
}
