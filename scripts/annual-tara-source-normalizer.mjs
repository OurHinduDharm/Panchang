const MONTHS = new Map([
  ["jan", 0], ["january", 0], ["feb", 1], ["february", 1],
  ["mar", 2], ["march", 2], ["apr", 3], ["april", 3],
  ["may", 4], ["jun", 5], ["june", 5], ["jul", 6], ["july", 6],
  ["aug", 7], ["august", 7], ["sep", 8], ["sept", 8], ["september", 8],
  ["oct", 9], ["october", 9], ["nov", 10], ["november", 10],
  ["dec", 11], ["december", 11]
]);

function pad(value) {
  return String(value).padStart(2, "0");
}

/**
 * Normalize a source-printed Drik boundary without discarding its original text.
 * Drik 24+ clocks (e.g. 29:07+) roll into the following civil date.
 */
export function parseDrikBoundary(rawText) {
  if (typeof rawText !== "string") return null;
  const match = rawText.trim().match(
    /^([A-Za-z]+)\\s+(\\d{1,2}),\\s*(\\d{4}),?\\s+[A-Za-z]+\\s+at\\s+(\\d{1,2}):(\\d{2})(\\+)?$/i
  );
  if (!match) return null;

  const month = MONTHS.get(match[1].toLowerCase());
  const day = Number(match[2]);
  const year = Number(match[3]);
  const printedHour = Number(match[4]);
  const minute = Number(match[5]);
  if (month === undefined || !Number.isInteger(year) || year < 1900 ||
      day < 1 || day > 31 || printedHour > 47 || minute > 59) return null;

  const instant = new Date(Date.UTC(year, month, day));
  if (instant.getUTCMonth() !== month || instant.getUTCDate() !== day) return null;
  instant.setUTCDate(instant.getUTCDate() + Math.floor(printedHour / 24));
  const hour = printedHour % 24;
  const localDate = [
    instant.getUTCFullYear(),
    pad(instant.getUTCMonth() + 1),
    pad(instant.getUTCDate())
  ].join("-");
  return {
    rawText: rawText.trim(),
    normalizedLocalDateTime: localDate + "T" + pad(hour) + ":" + pad(minute) + ":00+05:30",
    dayRollover: Math.floor(printedHour / 24)
  };
}

export function pairDrikEventRows(rows) {
  const windows = [];
  const unpaired = [];
  let pendingStart = null;
  for (const row of rows) {
    if (!row || !["astaStart", "astaEnd"].includes(row.event)) {
      unpaired.push(row);
      continue;
    }
    if (row.event === "astaStart") {
      if (pendingStart) unpaired.push(pendingStart);
      pendingStart = row;
      continue;
    }
    if (!pendingStart) {
      unpaired.push(row);
      continue;
    }
    const startTime = Date.parse(pendingStart.boundary?.normalizedLocalDateTime || "");
    const endTime = Date.parse(row.boundary?.normalizedLocalDateTime || "");
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
      unpaired.push(pendingStart, row);
      pendingStart = null;
      continue;
    }
    windows.push({
      astaStart: pendingStart.boundary,
      astaEnd: row.boundary
    });
    pendingStart = null;
  }
  if (pendingStart) unpaired.push(pendingStart);
  return { windows, unpaired };
}
