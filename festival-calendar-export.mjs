import {inPublicFestivalScope} from "./festival-public-scope.mjs";
import {validPanchangDate} from "./panchang-event-links.mjs";

const escapeText = value => String(value).replace(/\\/g,"\\\\").replace(/\r\n|\r|\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,");
function fold(line) {
  const encoder = new TextEncoder();
  let current = "", bytes = 0;
  const parts = [];
  for (const char of line) {
    const n = encoder.encode(char).length;
    if (bytes + n > 75) { parts.push(current); current = " "; bytes = 1; }
    current += char; bytes += n;
  }
  parts.push(current);
  return parts.join("\r\n");
}
export function approvedCalendarEvents(data,year,month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 ||
      data?.year !== year || data?.month !== month || data.status !== "approved" || !Array.isArray(data.events)) return [];
  const prefix = year + "-" + String(month).padStart(2,"0") + "-";
  const seen = new Set();
  return data.events.filter(item => {
    if (!item || item.reviewStatus !== "approved" || !validPanchangDate(item.date) ||
        !item.date.startsWith(prefix) || typeof item.title !== "string" || !item.title.trim() ||
        !inPublicFestivalScope(item) || /ग्रहण|grahan|eclipse/i.test(item.title + " " + (item.category || ""))) return false;
    const key = item.date + "|" + item.title.trim();
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}
export function buildFestivalIcs(events,now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//OurHinduDharm//Vrata Parva//HI","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
  for (const item of events) {
    const end = new Date(item.date + "T00:00:00Z"); end.setUTCDate(end.getUTCDate()+1);
    lines.push("BEGIN:VEVENT","UID:"+item.date+"-"+encodeURIComponent(item.title.trim())+"@ourhindudharm.blogspot.com",
      "DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+item.date.replace(/-/g,""),
      "DTEND;VALUE=DATE:"+end.toISOString().slice(0,10).replace(/-/g,""),
      "SUMMARY:"+escapeText(item.title.trim()),
      "DESCRIPTION:"+escapeText("प्रकाशित व्रत-पर्व तिथि। स्थानीय मुहूर्त हेतु OurHinduDharm देखें।"),
      "URL:https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?year="+item.date.slice(0,4)+"&month="+item.date.slice(5,7),
      "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n")+"\r\n";
}
export function createFestivalCalendarExport(eventsEl) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "स्वीकृत मासिक पर्व कैलेंडर (.ics)";
  button.title = "प्रकाशित पर्व-तिथियाँ; स्थानीय मुहूर्त और ग्रहण शामिल नहीं हैं";
  button.style.cssText = "display:block;min-height:44px;margin:8px auto;padding:8px 12px;max-width:100%;font:inherit;cursor:pointer";
  button.hidden = true;
  button.style.display = "none";
  eventsEl.insertAdjacentElement("beforebegin",button);
  let events = [], filename = "";
  button.addEventListener("click",() => {
    if (!events.length) return;
    const blob = new Blob([buildFestivalIcs(events)],{type:"text/calendar;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
  return (data,year,month) => {
    events = approvedCalendarEvents(data,year,month);
    filename = events.length ? "OurHinduDharm-"+year+"-"+String(month).padStart(2,"0")+".ics" : "";
    button.hidden = !events.length;
    button.style.display = events.length ? "block" : "none";
  };
}
