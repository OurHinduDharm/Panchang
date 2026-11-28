import {completeDay,nextIndex} from "./festival-tithi-partitions.mjs";

// Dharmasindhu II, Chaitra, Manvadi-nirnaya. The names identify catalogue
// slots; only the month and zero-based tithi enter the calculation.
export const shuklaManvadi = Object.freeze([
  ["स्वायम्भुव","चैत्र",2], ["स्वरोचिष","चैत्र",14],
  ["वैवस्वत","ज्येष्ठ",14], ["रैवत","आषाढ़",9], ["चाक्षुष","आषाढ़",14],
  ["रुद्रसावर्णि","भाद्रपद",2], ["दक्षसावर्णि","आश्विन",8],
  ["तामस","कार्तिक",11], ["औत्तम","कार्तिक",14], ["धर्मसावर्णि","पौष",10],
  ["ब्रह्मसावर्णि","माघ",6], ["सावर्णि","फाल्गुन",14]
].map(Object.freeze));

const ms = Date.parse;
const iso = value => new Date(value).toISOString();
export function resolveShuklaManvadiCycles(days) {
  const results = [];
  for (const [name, month, index] of shuklaManvadi) {
    const matches = day => day.tithis.some(row => row.index === index);
    for (let i = 0; i < days.length; i++) {
      if (!matches(days[i])) continue;
      const first = i;
      while (i+1 < days.length && matches(days[i+1])) i++;
      const cycle = days.slice(first,i+1);
      // A day's noon masa can already be the next Purnimanta month on
      // Purnima. Assign month only from a sample inside the target tithi.
      const knownMonths = new Set();
      for (const day of cycle) {
        const noon = ms(day.date+"T06:30:00Z"); // annual Indian local noon sample
        for (const row of day.tithis.filter(row => row.index === index)) {
          if (ms(row.startTime) <= noon && noon < ms(row.endTime) && day.masa)
            knownMonths.add(day.masa);
          if (ms(row.startTime) === ms(day.sunrise) && day.sunriseMasa)
            knownMonths.add(day.sunriseMasa);
        }
      }
      const belongs = m => m === month || m === "अधिक "+month;
      const plausibleMonths = knownMonths.size ? [...knownMonths] : cycle.map(d => d.masa);
      if (!plausibleMonths.some(belongs)) continue;
      const before = days[first-1], after = days[i+1];
      const checked = before && after && [before,...cycle].every((day,offset) => {
        const next = days[first+offset];
        if (!completeDay(day,next)) return false;
        const lastIndex = day.tithis.at(-1).index;
        const firstIndex = next.tithis[0]?.index;
        return lastIndex === firstIndex || nextIndex(lastIndex) === firstIndex;
      });
      const windows = [];
      if (checked && knownMonths.size === 1) {
        for (const d of cycle) {
          const sunrise = ms(d.sunrise), midpoint = (sunrise+ms(d.sunset))/2;
          for (const row of d.tithis.filter(row => row.index === index)) {
            const start = Math.max(sunrise,ms(row.startTime));
            const end = Math.min(midpoint,ms(row.endTime));
            if (end > start) windows.push({date:d.date,start:iso(start),end:iso(end)});
          }
        }
      }
      results.push({name,month,index,monthKind:knownMonths.size !== 1 ? null :
        knownMonths.has(month) ? "regular" : "adhika", firstEvidenceDate:cycle[0].date,
        selectedDate:windows.length === 1 ? windows[0].date : null, windows,
        status:windows.length === 1 ? "date-selected-needs-source-approval" : "manual-review",
        reason:!checked ? "incomplete-cycle" : knownMonths.size !== 1 ? "month-unconfirmed" :
          windows.length === 0 ? "no-purvahna-overlap" : windows.length > 1 ? "two-purvahna-overlaps" : "unique-purvahna-overlap",
        publishable:false});
    }
  }
  return results;
}
