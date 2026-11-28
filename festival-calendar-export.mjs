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
// A deliberately compact public selection; expand only after review.
export function isMajorFestival(item) {
  const title = String(item?.title || "");
  const category = String(item?.category || "").trim();
  if (/^(प्रमुख पर्व|एकादशी|पूर्णिमा|अमावस्या|संक्रांति|श्रावण सोमवार)$/.test(category)) return true;
  return /प्रदोष|नवरात्र(?:ि)?\s*(?:प्रारंभ|प्रारम्भ|आरंभ|आरम्भ)|घटस्थापना|राम\s*नवमी|महाशिवरात्रि|जन्माष्टमी|गणेश चतुर्थी|रक्षा\s*बंधन|रक्षाबंधन|हनुमान जयंती|अक्षय तृतीया|अक्षय नवमी|आंवला नवमी|करवा चौथ|अहोई अष्टमी|भाई दूज|नरक चतुर्दशी|वट सावित्री|हरतालिका तीज|हरियाली तीज|गुरु पूर्णिमा|वसंत पंचमी|बसंत पंचमी|गंगा दशहरा|जगन्नाथ रथ यात्रा|नृसिंह जयंती|नरसिंह जयंती/.test(title) && !/मासिक.*जन्माष्टमी/.test(title);
}
export function approvedCalendarEvents(data,year,month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 ||
      data?.year !== year || data?.month !== month || data.status !== "approved" || !Array.isArray(data.events)) return [];
  const prefix = year + "-" + String(month).padStart(2,"0") + "-";
  const seen = new Set();
  return data.events.filter(item => {
    if (!item || item.reviewStatus !== "approved" || !validPanchangDate(item.date) ||
        !item.date.startsWith(prefix) || typeof item.title !== "string" || !item.title.trim() ||
        !inPublicFestivalScope(item) || !isMajorFestival(item) || /ग्रहण|grahan|eclipse/i.test(item.title + " " + (item.category || ""))) return false;
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
// The ICS serializer above is retained for a future annual download, not exposed in the UI.
export function buildGoogleCalendarUrl(item) {
  if (!item || !validPanchangDate(item.date) || typeof item.title !== "string" || !item.title.trim()) return "";
  const end = new Date(item.date + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate()+1);
  const page = new URL("https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html");
  page.searchParams.set("year",item.date.slice(0,4));
  page.searchParams.set("month",item.date.slice(5,7));
  const url = new URL("https://calendar.google.com/calendar/r/eventedit");
  url.searchParams.set("action","TEMPLATE");
  url.searchParams.set("text",item.title.trim());
  url.searchParams.set("dates",item.date.replace(/-/g,"")+"/"+end.toISOString().slice(0,10).replace(/-/g,""));
  url.searchParams.set("details","OurHinduDharm — प्रकाशित व्रत-पर्व तिथि। स्थानीय मुहूर्त हेतु "+page.href);
  return url.href;
}
export function createFestivalCalendarLinks() {
  let approved = new Map();
  const key = item => item.date + "|" + item.title.trim();
  return {
    update(data,year,month) {
      approved = new Map(approvedCalendarEvents(data,year,month).map(item=>[key(item),buildGoogleCalendarUrl(item)]));
    },
    urlFor(item) {
      if (!item || item.reviewStatus !== "approved" || item.isLocationEclipse || typeof item.title !== "string") return "";
      return approved.get(key(item)) || "";
    }
  };
}
