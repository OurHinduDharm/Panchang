#!/usr/bin/env node
/**
 * Generate location-specific Dwadashi/Chaturmas review candidates for 2026–2030.
 * This deliberately writes review-only files; it never approves dates.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";
import { resolveSamavedaAnnualDecision } from "../samaveda-annual-review.js";
import { buildAnnualDwadashiPackage } from "../dwadashi-calendar.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TITHI_NAMES = ["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पञ्चमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा/अमावस्या"];
const MASA_NAMES = {
  Chaitra:"चैत्र", Vaishakha:"वैशाख", Jyeshtha:"ज्येष्ठ", Ashadha:"आषाढ़",
  Shravana:"श्रावण", Bhadrapada:"भाद्रपद", Ashwin:"आश्विन", Ashwina:"आश्विन",
  Kartika:"कार्तिक", Kartik:"कार्तिक", Margashirsha:"मार्गशीर्ष",
  Pausha:"पौष", Magha:"माघ", Phalguna:"फाल्गुन"
};

function rawValue(value) {
  if (value && typeof value === "object") return value.index ?? value.number ?? value.value ?? value.name ?? "";
  return value ?? "";
}

export function normalizeEngineTithi(value) {
  const raw = String(rawValue(value)).trim();
  const aliases = { Pratipada:"प्रतिपदा", Dwitiya:"द्वितीया", Tritiya:"तृतीया", Chaturthi:"चतुर्थी", Panchami:"पञ्चमी", Shashthi:"षष्ठी", Sashti:"षष्ठी", Saptami:"सप्तमी", Ashtami:"अष्टमी", Navami:"नवमी", Dashami:"दशमी", Ekadashi:"एकादशी", Dwadashi:"द्वादशी", Trayodashi:"त्रयोदशी", Chaturdashi:"चतुर्दशी", Purnima:"पूर्णिमा", Amavasya:"अमावस्या" };
  if (aliases[raw]) return aliases[raw];
  const number = Number(rawValue(value));
  if (!Number.isFinite(number)) return raw;
  const index = ((number % 15) + 15) % 15;
  if (index === 14) return number >= 15 ? "अमावस्या" : "पूर्णिमा";
  return TITHI_NAMES[index] || String(number);
}

export function normalizeEnginePaksha(value, tithiValue) {
  const text = String(rawValue(value)).trim().toLowerCase();
  if (/krishna|कृष्ण/.test(text)) return "कृष्ण पक्ष";
  if (/shukla|शुक्ल/.test(text)) return "शुक्ल पक्ष";
  const n = Number(rawValue(tithiValue));
  return Number.isFinite(n) && n >= 15 ? "कृष्ण पक्ष" : "शुक्ल पक्ष";
}

export function normalizeEngineMasa(value) {
  const name = String(value && typeof value === "object" ? value.name ?? value.value ?? "" : value ?? "").trim();
  const mapped = MASA_NAMES[name] || name;
  if (!mapped) return "—";
  return (value && typeof value === "object" && value.isAdhika ? "अधिक " : "") + mapped;
}

function iso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function extractDwadashiDay(panchang, date, instant = null) {
  const at = instant ? new Date(instant).getTime() : NaN;
  const interval = Number.isFinite(at) && Array.isArray(panchang.tithis)
    ? panchang.tithis.find(item => {
        const start = new Date(item.startTime).getTime();
        const end = new Date(item.endTime).getTime();
        return Number.isFinite(start) && Number.isFinite(end) && start <= at && at < end;
      })
    : null;
  const noonTithi = interval ? normalizeEngineTithi(interval.index ?? interval.name) : Array.isArray(panchang.tithis) ? "" : normalizeEngineTithi(panchang.tithi);
  return {
    date,
    tithi: normalizeEngineTithi(panchang.tithi),
    noonTithi,
    paksha: normalizeEnginePaksha(panchang.paksha, panchang.tithi),
    masa: normalizeEngineMasa(panchang.masa ?? panchang.month),
    tithiStartTime: iso(panchang.tithiStartTime),
    tithiEndTime: iso(panchang.tithiEndTime),
    noonTithiStartTime: iso(interval?.startTime),
    noonTithiEndTime: iso(interval?.endTime),
    sunrise: iso(panchang.sunrise)
  };
}

export function buildSourceReviewMetadata(year) {
  return {
    status: "pending-manual-cross-check",
    primary: {
      name: "Drik Panchang — Dwadashi Dates",
      url: `https://www.drikpanchang.com/dwadashi/dwadashi-dates.html?year=${year}&geoname-id=1259503`,
      location: "Pithoragarh, Uttarakhand, India",
      compare: ["tithi interval", "named Dwadashi", "Mahadwadashi observance"]
    },
    independent: [
      {
        name: "Hindu Calculator — North Indian Panchang",
        url: `https://hinducalculator.com/hindi-panchang/${year}/`,
        location: "New Delhi, India",
        use: "independent tithi sequence cross-check only; not a Pithoragarh date authority"
      },
      {
        name: "HinduCalendar.in",
        url: `https://hinducalendar.in/calendar/${year}/`,
        location: "New Delhi / North India",
        use: "secondary month-grid cross-check only; inspect individual month pages"
      }
    ],
    policy: "No source date is auto-approved. Resolve city, sunrise, tithi interval and vrata-specific rule before approval."
  };
}

const CHATURMAS_START_REFERENCES = {
  2026: { date:"2026-07-25", sources:[
    { name:"EternalSanskriti", location:"Delhi", url:"https://eternalsanskriti.com/en/festivals/f/devshayani-ekadashi" }
  ]},
  2027: { date:"2027-07-14", sources:[
    { name:"ShubhDin Panchang", location:"Delhi", url:"https://shubhdinpanchang.com/ekadashi/devshayani-ekadashi/" },
    { name:"RealPanchang", location:"New Delhi", url:"https://www.realpanchang.in/en/festival/devshayani-ekadashi-2027" }
  ]},
  2028: { date:"2028-07-02", sources:[
    { name:"Drik Panchang", location:"Pithoragarh", url:"https://www.drikpanchang.com/telugu/panchanga/telugu-day-panchanga.html?date=02%2F07%2F2028" },
    { name:"ShubhDin Panchang", location:"Delhi", url:"https://shubhdinpanchang.com/ekadashi/devshayani-ekadashi/" }
  ]},
  2029: { date:"2029-07-21", sources:[
    { name:"Drik Panchang", location:"Dabwali", url:"https://www.drikpanchang.com/panchang/day-panchang.html?date=21%2F07%2F2029" },
    { name:"Drik Panchang Gujarati Calendar", location:"New Delhi", url:"https://www.drikpanchang.com/gujarati/calendar/gujarati-calendar.html?lang=en&year=2029" }
  ]},
  2030: { date:"2030-07-11", sources:[
    { name:"Drik Panchang", location:"Muhammadabad", url:"https://www.drikpanchang.com/festivals/month/festivals-july.html?year=2030" },
    { name:"Drik Panchang", location:"Lucknow", url:"https://www.drikpanchang.com/panchang/month-panchang.html?date=26%2F07%2F2030" }
  ]}
};

const CHATURMAS_END_REFERENCES = {
  2026: { date:"2026-11-20", sources:[
    { name:"Drik Panchang", location:"Pithoragarh", url:"https://www.drikpanchang.com/vrats/ekadashidates.html?year=2026&geoname-id=1259503" },
    { name:"HinduCalendar.org", location:"Delhi", url:"https://hinducalendar.org/articles/devutthana-ekadashi" }
  ]},
  2027: { date:"2027-11-10", sources:[
    { name:"Drik Panchang", location:"Pithoragarh city selector", url:"https://www.drikpanchang.com/vrats/ekadashidates.html?year=2027&geoname-id=1259503" },
    { name:"DharmaSangrah", location:"Ahmedabad", url:"https://dharmasangrah.com/festivals/devutthana-ekadashi" }
  ]},
  2028: { date:"2028-10-28", sources:[
    { name:"Drik Panchang", location:"Pithoragarh city selector", url:"https://www.drikpanchang.com/vrats/ekadashidates.html?year=2028&geoname-id=1259503" },
    { name:"AstroBharat", location:"Delhi", url:"https://www.astrobharat.in/ekadashi/devutthana" }
  ]},
  2029: { date:"2029-11-16", sources:[
    { name:"Drik Panchang", location:"New Delhi", url:"https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=2029" },
    { name:"EternalSanskriti", location:"Delhi", url:"https://eternalsanskriti.com/en/festivals/f/devutthana-ekadashi" }
  ]},
  2030: { date:"2030-11-05", sources:[
    { name:"Drik Panchang", location:"New Delhi", url:"https://www.drikpanchang.com/panchang/month-panchang.html?date=17%2F11%2F2030" },
    { name:"Hindu Calculator", location:"New Delhi", url:"https://hinducalculator.com/hindi-panchang/2030/?m=11" }
  ]}
};

const NAKSHATRA_HINDI = ["अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशीर्ष","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा","मघा","पूर्वाफाल्गुनी","उत्तराफाल्गुनी","हस्त","चित्रा","स्वाती","विशाखा","अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा","पूर्वाभाद्रपदा","उत्तराभाद्रपदा","रेवती"];
const YOGA_HINDI = ["विष्कम्भ","प्रीति","आयुष्मान","सौभाग्य","शोभन","अतिगण्ड","सुकर्मा","धृति","शूल","गण्ड","वृद्धि","ध्रुव","व्याघात","हर्षण","वज्र","सिद्धि","व्यतीपात","वरीयान","परिघ","शिव","सिद्ध","साध्य","शुभ","शुक्ल","ब्रह्म","इन्द्र","वैधृति"];
const RASHI_HINDI = ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
const KARANA_HINDI = { Bava:"बव", Balava:"बालव", Kaulava:"कौलव", Taitila:"तैतिल", Gara:"गर", Garaja:"गरज", Vanija:"वणिज", Vishti:"विष्टि", Shakuni:"शकुनि", Chatushpada:"चतुष्पद", Naga:"नाग", Kimstughna:"किंस्तुघ्न", Kinstughna:"किंस्तुघ्न" };
const WEEKDAY_HINDI = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];

function indexValue(value) {
  const raw = rawValue(value);
  const number = Number(raw);
  return Number.isFinite(number) ? number : -1;
}

function sunriseSunRashiIndex(value) {
  const number = indexValue(value);
  if (number >= 0 && number <= 11) return number;
  const name = String(rawValue(value)).toLowerCase();
  const patterns = [
    [/mesha|aries|मेष/,0],[/vrishabha|taurus|वृषभ/,1],[/mithuna|gemini|मिथुन/,2],
    [/karka|cancer|कर्क/,3],[/simha|leo|सिंह/,4],[/kanya|virgo|कन्या/,5],
    [/tula|libra|तुला/,6],[/vrishchika|scorpio|वृश्चिक/,7],[/dhanu|sagittarius|धनु/,8],
    [/makara|capricorn|मकर/,9],[/kumbha|aquarius|कुम्भ|कुंभ/,10],[/meena|pisces|मीन/,11]
  ];
  return patterns.find(([pattern]) => pattern.test(name))?.[1] ?? -1;
}

export function extractAnnualPanchangDay(panchang, date, instant) {
  const base = extractDwadashiDay(panchang, date, instant);
  const weekdayDate = new Date(date + "T12:00:00Z");
  const nakshatraIndex = indexValue(panchang.nakshatra);
  const yogaIndex = indexValue(panchang.yoga);
  const sunRashiRaw = panchang.sunRashi;
  const sunRashiIndex = sunriseSunRashiIndex(sunRashiRaw);
  const isoInterval = item => ({
    index:item.index,
    name:item.name ?? null,
    startTime:iso(item.startTime),
    endTime:iso(item.endTime)
  });
  const nakshatraIntervals = Array.isArray(panchang.nakshatras)
    ? panchang.nakshatras.filter(Boolean).map(isoInterval).filter(item => item.startTime && item.endTime)
    : [];
  const karanaIntervals = Array.isArray(panchang.karanas)
    ? panchang.karanas.filter(Boolean).map(item => ({
        name:KARANA_HINDI[item.name] || item.name || "—",
        start:iso(item.startTime),
        end:iso(item.endTime)
      }))
    : [];
  return {
    ...base,
    weekday:WEEKDAY_HINDI[weekdayDate.getUTCDay()],
    nakshatra:NAKSHATRA_HINDI[nakshatraIndex] || String(rawValue(panchang.nakshatra) || "—"),
    yoga:YOGA_HINDI[yogaIndex] || String(rawValue(panchang.yoga) || "—"),
    karana:karanaIntervals.map(k => k.name).join("; ") || "—",
    tithiTimeRange:base.tithiStartTime && base.tithiEndTime ? base.tithiStartTime + " से " + base.tithiEndTime : "समय उपलब्ध नहीं",
    karanaIntervals,
    sunset:iso(panchang.sunset),
    nakshatraEndTime:iso(panchang.nakshatraEndTime),
    nakshatraIntervals,
    sankrantiTimes:[],
    sunRashiIndex,
    sunRashi:RASHI_HINDI[sunRashiIndex] || String(rawValue(sunRashiRaw) || "—"),
    grahanaTimes:[],
    grahanaIntervals:[],
    eclipseTimes:[],
    eclipseIntervals:[],
    grahanaVisibilityChecked:false,
    dosha:{}
  };
}

function instantSunRashiIndex(panchang) {
  const sun = panchang?.planetaryPositions?.sun;
  let raw = sun?.rashiName ?? sun?.signName ?? sun?.rashi ?? sun?.rashiIndex ?? sun?.sign;
  if (raw && typeof raw === "object") raw = raw.index ?? raw.number ?? raw.value ?? raw.name ?? raw.label;
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw <= 11) return raw;
  const name = String(raw ?? "").toLowerCase();
  const patterns = [
    [/mesha|aries|मेष/,0],[/vrishabha|taurus|वृषभ/,1],[/mithuna|gemini|मिथुन/,2],
    [/karka|cancer|कर्क/,3],[/simha|leo|सिंह/,4],[/kanya|virgo|कन्या/,5],
    [/tula|libra|तुला/,6],[/vrishchika|scorpio|वृश्चिक/,7],[/dhanu|sagittarius|धनु/,8],
    [/makara|capricorn|मकर/,9],[/kumbha|aquarius|कुम्भ|कुंभ/,10],[/meena|pisces|मीन/,11]
  ];
  return patterns.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}

function computeSankrantiTimes(scanDays, observer) {
  const found = [];
  for (let i = 1; i < scanDays.length; i += 1) {
    const previous = scanDays[i - 1];
    const current = scanDays[i];
    if (!Number.isInteger(previous.sunRashiIndex) || !Number.isInteger(current.sunRashiIndex) ||
        previous.sunRashiIndex === current.sunRashiIndex) continue;
    let low = new Date(previous.date + "T06:30:00Z").getTime();
    let high = new Date(current.date + "T06:30:00Z").getTime();
    const target = current.sunRashiIndex;
    for (let step = 0; step < 24 && high - low > 1000; step += 1) {
      const middle = Math.floor((low + high) / 2);
      const panchang = getPanchangam(new Date(middle), observer, { timezoneOffset:330, calendarType:"purnimanta" });
      if (instantSunRashiIndex(panchang) === target) high = middle;
      else low = middle;
    }
    const time = new Date(high);
    found.push({ date:current.date, time:time.toISOString(), from:previous.sunRashi, to:current.sunRashi });
    for (let k = 1; k < scanDays.length - 1; k += 1) {
      const day = scanDays[k], prev = scanDays[k - 1], next = scanDays[k + 1];
      const before = prev.sunset && day.sunrise ? (new Date(prev.sunset).getTime() + new Date(day.sunrise).getTime()) / 2 : NaN;
      const after = day.sunset && next.sunrise ? (new Date(day.sunset).getTime() + new Date(next.sunrise).getTime()) / 2 : NaN;
      if (time.getTime() >= before && time.getTime() < after) {
        day.sankrantiTimes.push(time.toISOString());
        break;
      }
    }
  }
  return found;
}

async function loadYearCatalog(year) {
  const records = [];
  for (let month = 1; month <= 12; month += 1) {
    const mm = String(month).padStart(2,"0");
    const file = path.join(ROOT,"data","festivals",year+"-"+mm+".json");
    const data = JSON.parse(await fs.readFile(file,"utf8"));
    const events = Array.isArray(data.events) ? data.events : Array.isArray(data.festivals) ? data.festivals : [];
    events.forEach(event => records.push({ ...event, reviewCategory:event.category || event.type || "अन्य" }));
  }
  return records;
}

export async function generateYear(year, options = {}) {
  if (!Number.isInteger(year) || year < 2026 || year > 2030) {
    throw new RangeError("Supported years are 2026–2030");
  }
  const rules = JSON.parse(await fs.readFile(path.join(ROOT, "data/dwadashi-vrata-rules.json"), "utf8"));
  const location = options.location || { name:"पिथौरागढ़", latitude:29.58, longitude:80.22, elevation:1650 };
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const yearDays = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const currentYearDays = [];
  const annualDays = [];
  const scanDays = [];
  const allDwadashiDays = [];
  const engineDiagnostics = [];
  const diagnosticDates = new Set(year === 2026 ? ["2026-07-11","2026-11-20","2026-11-21"] : year === 2028 ? ["2028-11-13"] : []);

  for (let offset = 0; offset < yearDays + 31; offset += 1) {
    const instant = new Date(Date.UTC(year, 0, 1 + offset, 6, 30));
    const date = instant.toISOString().slice(0, 10);
    const noonPanchang = getPanchangam(instant, observer, { timezoneOffset:330, calendarType:"purnimanta" });
    const day = extractDwadashiDay(noonPanchang, date, instant);
    const annualDay = extractAnnualPanchangDay(noonPanchang, date, instant);
    let sunrisePanchang = null;

    if (day.sunrise) {
      sunrisePanchang = getPanchangam(new Date(day.sunrise), observer, { timezoneOffset:330, calendarType:"purnimanta" });
      const sunriseDay = extractDwadashiDay(sunrisePanchang, date, new Date(day.sunrise));
      day.sunriseTithi = {
        tithi:sunriseDay.tithi,
        paksha:sunriseDay.paksha,
        masa:sunriseDay.masa,
        tithiStartTime:sunriseDay.tithiStartTime,
        tithiEndTime:sunriseDay.tithiEndTime
      };
      annualDay.sunriseTithi = day.sunriseTithi;
    }
    if (diagnosticDates.has(date)) {
      const raw = p => p ? { tithi:p.tithi ?? null, paksha:p.paksha ?? null, masa:p.masa ?? p.month ?? null, sunrise:iso(p.sunrise), tithiStartTime:iso(p.tithiStartTime), tithiEndTime:iso(p.tithiEndTime) } : null;
      engineDiagnostics.push({ date, noon:raw(noonPanchang), sunrise:raw(sunrisePanchang), normalized:day });
    }

    scanDays.push(annualDay);
    if (offset < yearDays) { currentYearDays.push(day); annualDays.push(annualDay); }
    allDwadashiDays.push(day);
  }

  const sankrantis = computeSankrantiTimes(scanDays, observer);
  const result = buildAnnualDwadashiPackage(allDwadashiDays, rules, location);
  result.sourceReview = buildSourceReviewMetadata(year);
  result.sourceReview.engine = "@ishubhamx/panchangam-js@3.0.0";
  result.sourceReview.engineDiagnostics = engineDiagnostics;
  const chaturmasStart = result.chaturmas.boundaries?.find(item => item.id === "start")?.selectedDate || null;
  const chaturmasStartReference = CHATURMAS_START_REFERENCES[year];
  result.sourceReview.chaturmasStartCrossCheck = {
    generatedDate:chaturmasStart,
    referenceDate:chaturmasStartReference.date,
    status:chaturmasStart === chaturmasStartReference.date ? "date-match-location-and-vrata-rule-review-still-required" : chaturmasStart ? "date-mismatch-review-required" : "engine-date-missing",
    sources:chaturmasStartReference.sources
  };
  const chaturmasEnd = result.chaturmas.boundaries?.find(item => item.id === "end")?.selectedDate || null;
  const chaturmasReference = CHATURMAS_END_REFERENCES[year];
  result.sourceReview.chaturmasEndCrossCheck = {
    generatedDate:chaturmasEnd,
    referenceDate:chaturmasReference.date,
    status:chaturmasEnd === chaturmasReference.date ? "date-match-location-and-vrata-rule-review-still-required" : chaturmasEnd ? "date-mismatch-review-required" : "engine-date-missing",
    sources:chaturmasReference.sources
  };
  result.sourceReview.calendar = "Purnimanta";
  result.sourceReview.timezone = "Asia/Kolkata";
  result.sourceReview.localScanCoverage = {
    targetYearDays: currentYearDays.length,
    precedingYearBufferDays: 0,
    followingYearBufferDays: 31
  };
  result.status = "needs-review";
  result.calculationStatus = "panchang-engine-calculated-needs-source-review";
  result.tithis = result.tithis.map(item => ({ ...item, status:item.status === "needs-observation" ? item.status : "needs-review" }));
  result.chaturmas.status = result.chaturmas.status === "incomplete" ? "incomplete" : "needs-review";

  const catalog = await loadYearCatalog(year);
  const samaveda = resolveSamavedaAnnualDecision(annualDays);
  samaveda.calculationStatus = "calculated-needs-source-review";
  samaveda.reviewStatus = "needs-review";
  samaveda.note = [samaveda.note || "", "वार्षिक ड्राफ्ट में स्थानीय संक्रांति और ग्रहण-दृश्यता का स्वतंत्र स्रोत-मिलान अभी बाकी है; इसे स्वीकृत निर्णय न मानें।"].filter(Boolean).join(" ");
  const annualReview = {
    schemaVersion:2,
    tool:"ohd-general-annual-festival-review",
    generatedAt:new Date().toISOString(),
    calculationStatus:"research-only-not-approved",
    year,
    location:{name:location.name,latitude:location.latitude,longitude:location.longitude,elevation:location.elevation,timezone:"Asia/Kolkata",timezoneOffset:330},
    library:"@ishubhamx/panchangam-js@3.0.0",
    catalog,
    dailyPanchang:annualDays,
    dwadashiCalendar:result,
    samavedaUpakarma:samaveda,
    reviews:{},
    sourceReview:{
      ...result.sourceReview,
      annualFestivalDates:"pending-manual-Drik-and-independent-Panchang-cross-check",
      localEclipseVisibility:"not-calculated-in-this-review-generator",
      localSankrantiTransitions:"calculated-from-sun-rashi-transitions",
      sankrantiCount:sankrantis.length,
      note:"Daily Panchanga and Dwadashi candidates are calculated for Pithoragarh. This is a research draft, not an approved annual festival calendar."
    }
  };
  return { ...result, annualReview };
}

async function main() {
  const arg = process.argv.slice(2);
  const yearsArg = arg.find(x => x.startsWith("--years="))?.slice(8);
  const oneYear = arg.find(x => x.startsWith("--year="))?.slice(7);
  const years = oneYear ? [Number(oneYear)] : yearsArg ? yearsArg.split(",").map(Number) : [2026,2027,2028,2029,2030];
  const outputDir = path.resolve(ROOT, arg.find(x => x.startsWith("--out="))?.slice(6) || "artifacts/dwadashi-review");
  const annualDir = path.resolve(ROOT, "artifacts/annual-review");
  await fs.mkdir(outputDir, { recursive:true });
  await fs.mkdir(annualDir, { recursive:true });
  for (const year of years) {
    const result = await generateYear(year);
    const target = path.join(outputDir, `ohd-dwadashi-${year}-review.json`);
    const { annualReview, ...dwadashiResult } = result;
    await fs.writeFile(target, JSON.stringify(dwadashiResult, null, 2) + "\n");
    const annualTarget = path.join(annualDir, `ohd-annual-panchang-review-${year}.json`);
    await fs.writeFile(annualTarget, JSON.stringify(result.annualReview, null, 2) + "\n");
    process.stdout.write(`${year}: ${result.tithis.length} Dwadashi records, ${result.tithiDates.length} tithi dates, ${result.annualReview.dailyPanchang.length} daily Panchang days, Chaturmas=${result.chaturmas.status} -> ${target} / ${annualTarget}\n`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
