// Dharmasindhu, Kartika Shukla Dvitiya. Compare a single Dvitiya against
// adjacent local Aparahnas, even if neither Aparahna contains Dvitiya.
export function selectYamaDvitiyaDay(days, start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const windows = [];
  for (const day of days) {
    const sunrise = new Date(day.sunrise).getTime(), sunset = new Date(day.sunset).getTime();
    if (!day.sunrise || !day.sunset || !(sunset > sunrise)) return null;
    if (windows.length && Date.parse(day.date)-Date.parse(windows.at(-1).date) !== 86400000) return null;
    const a = sunrise + (sunset-sunrise)*3/5, b = sunrise + (sunset-sunrise)*4/5;
    windows.push({date:day.date, start:a, end:b, overlap:end > a && start < b});
  }
  const active = windows.filter(w => w.overlap);
  if (active.length > 2) return null;
  const selected = active.at(-1) ?? windows.find((w,i) =>
    i > 0 && windows[i-1].end <= start && end <= w.start);
  return selected ? {date:selected.date, overlaps:windows.map(w=>w.overlap)} : null;
}
