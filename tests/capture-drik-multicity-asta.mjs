import { chromium } from "playwright";

const CITIES = [
  { id: "1261481", name: "New Delhi, NCT, India", pattern: /New Delhi/i },
  { id: "1275339", name: "Mumbai, Maharashtra, India", pattern: /Mumbai/i },
  { id: "1253914", name: "Ujjain, Madhya Pradesh, India", pattern: /Ujjain/i },
  { id: "1253405", name: "Varanasi, Uttar Pradesh, India", pattern: /Varanasi|Banaras/i },
  { id: "1259503", name: "Pithoragarh, Uttarakhand, India", pattern: /Pithoragarh/i }
];
const TARGETS = [
  { planet: "Mercury", slug: "budha", names: /Mercury|Budha/i },
  { planet: "Venus", slug: "shukra", names: /Venus|Shukra/i },
  { planet: "Mars", slug: "mangal", names: /Mars|Mangal/i },
  { planet: "Jupiter", slug: "guru", names: /Jupiter|Guru/i },
  { planet: "Saturn", slug: "shani", names: /Saturn|Shani/i }
];
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  locale: "en-IN",
  timezoneId: "Asia/Kolkata"
});
page.setDefaultNavigationTimeout(15000);
const captures = [];

try {
  for (const city of CITIES) {
    for (const target of TARGETS) {
      for (const year of YEARS) {
        const url = new URL(
          `https://www.drikpanchang.com/planet/asta/${target.slug}-asta-date-time.html`
        );
        url.searchParams.set("geoname-id", city.id);
        url.searchParams.set("year", String(year));
        url.searchParams.set("time-format", "24plushour");
        url.searchParams.set("lang", "en");

        const capture = {
          planet: target.planet, year, city: city.name, cityId: city.id,
          requestedUrl: url.toString(), status: "not-attempted",
          httpStatus: null, title: null, cityConfirmed: false,
          planetConfirmed: false, eventRows: [], relevantLines: [], error: null
        };
        try {
          const response = await page.goto(url.toString(), {
            waitUntil: "domcontentloaded", timeout: 15000
          });
          capture.httpStatus = response?.status() ?? null;
          await page.waitForTimeout(300);
          capture.title = await page.title();
          const renderedYear = Number(capture.title.match(/^(20\d{2})/)?.[1] || NaN);
          capture.renderedYear = Number.isFinite(renderedYear) ? renderedYear : null;
          capture.requestedYearConfirmed = capture.renderedYear === year;
          const body = await page.locator("body").innerText({ timeout: 10000 });
          const lines = body.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
          capture.cityConfirmed = city.pattern.test(body);
          capture.planetConfirmed = target.names.test(body);
          capture.eventRows = lines.flatMap((line, index) =>
            /Tara Asta (Starts|Ends) On/i.test(line)
              ? [{ label: line, context: lines.slice(index, index + 4) }]
              : []
          );
          capture.relevantLines = lines.filter(line =>
            /Tara Asta|Asta Starts|Asta Ends|Total Asta Duration|Internal Error|Access Denied|not found|Change Year/i.test(line)
          ).slice(0, 60);
          const cityPlanetVerified = capture.httpStatus >= 200 && capture.httpStatus < 400 &&
            capture.cityConfirmed && capture.planetConfirmed && /Asta/i.test(body) &&
            !/Internal Error/i.test(body);
          capture.status = !cityPlanetVerified
            ? "page-loaded-but-source-not-verified"
            : capture.requestedYearConfirmed
              ? "page-loaded-city-planet-and-year-confirmed"
              : "page-loaded-city-and-planet-confirmed-year-mismatch";
        } catch (error) {
          capture.status = "navigation-or-extraction-failed";
          capture.error = String(error?.message || error);
        }
        captures.push(capture);
      }
    }
  }
  const cityPlanetVerified = captures.filter(x =>
    x.httpStatus >= 200 && x.httpStatus < 400 && x.cityConfirmed && x.planetConfirmed
  );
  const yearVerified = cityPlanetVerified.filter(x => x.requestedYearConfirmed);
  const yearMismatch = cityPlanetVerified.filter(x => !x.requestedYearConfirmed);
  const summary = {
    title: "Drik five-planet multi-city annual Tara Asta capture 2021–2027",
    capturedAt: new Date().toISOString(),
    policy: "Every city/planet/year page is independently opened with geoname-id. Rendered city, planet and requested page year are checked separately. A city+planet match with a different rendered year is quarantined, never counted as requested-year evidence. No New Delhi fallback, search-result substitution, or zero-event inference.",
    attempted: captures.length,
    cityPlanetVerifiedPageLoads: cityPlanetVerified.length,
    verifiedPageLoads: yearVerified.length,
    yearMismatchPages: yearMismatch.length,
    rawEventRows: captures.reduce((sum, x) => sum + x.eventRows.length, 0),
    verifiedEventRows: yearVerified.reduce((sum, x) => sum + x.eventRows.length, 0),
    provisionalEventRows: yearMismatch.reduce((sum, x) => sum + x.eventRows.length, 0),
    cityCoverage: CITIES.map(city => ({
      city: city.name,
      cityPlanetVerifiedPages: cityPlanetVerified.filter(x => x.cityId === city.id).length,
      verifiedPages: yearVerified.filter(x => x.cityId === city.id).length,
      yearMismatchPages: yearMismatch.filter(x => x.cityId === city.id).length,
      verifiedEventRows: yearVerified.filter(x => x.cityId === city.id)
        .reduce((sum, x) => sum + x.eventRows.length, 0)
    })),
    planetCoverage: TARGETS.map(target => ({
      planet: target.planet,
      cityPlanetVerifiedPages: cityPlanetVerified.filter(x => x.planet === target.planet).length,
      verifiedPages: yearVerified.filter(x => x.planet === target.planet).length,
      yearMismatchPages: yearMismatch.filter(x => x.planet === target.planet).length,
      verifiedEventRows: yearVerified.filter(x => x.planet === target.planet)
        .reduce((sum, x) => sum + x.eventRows.length, 0)
    })),
    captures
  };  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
