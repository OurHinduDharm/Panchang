#!/usr/bin/env node
/**
 * Generate location-specific Dwadashi/Chaturmas review candidates for 2026–2030.
 * This deliberately writes review-only files; it never approves dates.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";
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
  const number = Number(rawValue(value));
  if (!Number.isFinite(number)) return String(rawValue(value)).trim();
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

export function extractDwadashiDay(panchang, date) {
  return {
    date,
    tithi: normalizeEngineTithi(panchang.tithi),
    paksha: normalizeEnginePaksha(panchang.paksha, panchang.tithi),
    masa: normalizeEngineMasa(panchang.masa ?? panchang.month),
    tithiStartTime: iso(panchang.tithiStartTime),
    tithiEndTime: iso(panchang.tithiEndTime),
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

export async function generateYear(year, options = {}) {
  if (!Number.isInteger(year) || year < 2026 || year > 2030) {
    throw new RangeError("Supported years are 2026–2030");
  }
  const rules = JSON.parse(await fs.readFile(path.join(ROOT, "data/dwadashi-vrata-rules.json"), "utf8"));
  const location = options.location || { name:"पिथौरागढ़", latitude:29.58, longitude:80.22, elevation:1650 };
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const yearDays = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const currentYearDays = [];
  const allDwadashiDays = [];
  const precedingYearDays = [];

  for (let offset = -31; offset < yearDays + 31; offset += 1) {
    const instant = new Date(Date.UTC(year, 0, 1 + offset, 6, 30));
    const date = instant.toISOString().slice(0, 10);
    const noonPanchang = getPanchangam(instant, observer, { timezoneOffset:330, calendarType:"purnimanta" });
    const day = extractDwadashiDay(noonPanchang, date);

    if (day.sunrise) {
      const sunrisePanchang = getPanchangam(new Date(day.sunrise), observer, { timezoneOffset:330, calendarType:"purnimanta" });
      const sunriseDay = extractDwadashiDay(sunrisePanchang, date);
      day.sunriseTithi = {
        tithi:sunriseDay.tithi,
        paksha:sunriseDay.paksha,
        masa:sunriseDay.masa,
        tithiStartTime:sunriseDay.tithiStartTime,
        tithiEndTime:sunriseDay.tithiEndTime
      };
    }

    if (offset >= 0 && offset < yearDays) currentYearDays.push(day);
    if (offset >= 0) allDwadashiDays.push(day);
    else precedingYearDays.push(day);
  }

  // Keep target-year records first so the package retains the intended Gregorian year.
  allDwadashiDays.push(...precedingYearDays);
  const result = buildAnnualDwadashiPackage(allDwadashiDays, rules, location);
  result.sourceReview = buildSourceReviewMetadata(year);
  result.sourceReview.engine = "@ishubhamx/panchangam-js@3.0.0";
  result.sourceReview.calendar = "Purnimanta";
  result.sourceReview.timezone = "Asia/Kolkata";
  result.sourceReview.localScanCoverage = {
    targetYearDays: currentYearDays.length,
    precedingYearBufferDays: precedingYearDays.length,
    followingYearBufferDays: 31
  };
  result.status = "needs-review";
  result.calculationStatus = "panchang-engine-calculated-needs-source-review";
  result.tithis = result.tithis.map(item => ({ ...item, status:item.status === "needs-observation" ? item.status : "needs-review" }));
  result.chaturmas.status = result.chaturmas.status === "incomplete" ? "incomplete" : "needs-review";
  return result;
}

async function main() {
  const arg = process.argv.slice(2);
  const yearsArg = arg.find(x => x.startsWith("--years="))?.slice(8);
  const oneYear = arg.find(x => x.startsWith("--year="))?.slice(7);
  const years = oneYear ? [Number(oneYear)] : yearsArg ? yearsArg.split(",").map(Number) : [2026,2027,2028,2029,2030];
  const outputDir = path.resolve(ROOT, arg.find(x => x.startsWith("--out="))?.slice(6) || "artifacts/dwadashi-review");
  await fs.mkdir(outputDir, { recursive:true });
  for (const year of years) {
    const result = await generateYear(year);
    const target = path.join(outputDir, `ohd-dwadashi-${year}-review.json`);
    await fs.writeFile(target, JSON.stringify(result, null, 2) + "\n");
    process.stdout.write(`${year}: ${result.tithis.length} month/paksha records, ${result.tithiDates.length} tithi dates, chaturmas=${result.chaturmas.status} -> ${target}\n`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
