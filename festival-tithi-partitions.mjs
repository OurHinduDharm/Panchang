const ms = Date.parse;
const dayMs = 86400000;
export const nextIndex = index => (index + 1) % 30;

// Input consists of sunrise-to-sunrise partitions, after the annual adapter
// has removed the scanner's documented one-minute cursor offset.
export function completeDay(day, next) {
  const start = ms(day.sunrise), end = ms(next.sunrise), sunset = ms(day.sunset);
  if (!(start < sunset && sunset < end) || ms(next.date)-ms(day.date) !== dayMs) return false;
  let cursor = start, previous;
  for (const row of day.tithis) {
    const a = ms(row.startTime), b = ms(row.endTime);
    if (a !== cursor || !(b > a) || !Number.isInteger(row.index) ||
        row.index < 0 || row.index > 29 ||
        (previous !== undefined && row.index !== nextIndex(previous))) return false;
    cursor = b;
    previous = row.index;
  }
  return cursor === end;
}
