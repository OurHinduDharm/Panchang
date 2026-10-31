/*
 * Shared local-night Prahar calculation.
 * Used by the main Panchang UI and festival muhurta rules so all four
 * night segments are derived from the same sunset-to-next-sunrise interval.
 */
function asValidDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function getNightPraharWindows(nightStartValue, nightEndValue, referenceNow = null, highlightActive = false) {
  const nightStart = asValidDate(nightStartValue);
  const nightEnd = asValidDate(nightEndValue);
  if (!nightStart || !nightEnd || nightEnd <= nightStart) return [];

  const now = referenceNow == null ? null : asValidDate(referenceNow);
  const duration = nightEnd.getTime() - nightStart.getTime();
  return Array.from({ length: 4 }, (_, index) => {
    const start = new Date(nightStart.getTime() + duration * index / 4);
    const end = new Date(nightStart.getTime() + duration * (index + 1) / 4);
    return {
      start,
      end,
      isActive: Boolean(highlightActive && now && now >= start && now < end),
      type: "night"
    };
  });
}
