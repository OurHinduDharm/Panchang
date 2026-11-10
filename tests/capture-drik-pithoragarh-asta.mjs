import { chromium } from "playwright";

const CITY_ID = "1259503";
const CITY = "Pithoragarh, Uttarakhand, India";
const TARGETS = [
  { planet: "Mercury", slug: "budha" },
  { planet: "Jupiter", slug: "guru" }
];
const YEARS = [2024, 2025, 2026, 2027];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  locale: "en-IN",
  timezoneId: "Asia/Kolkata"
});
page.setDefaultNavigationTimeout(45000);
const captures = [];

try {
  for (const target of TARGETS) {
    for (const year of YEARS) {
      const url = new URL(
        `https://www.drikpanchang.com/planet/asta/${target.slug}-asta-date-time.html`
      );
      url.searchParams.set("geoname-id", CITY_ID);
      url.searchParams.set("year", String(year));
      url.searchParams.set("time-format", "24plushour");
      url.searchParams.set("lang", "en");

      const capture = {
        planet: target.planet,
        year,
        city: CITY,
        cityId: CITY_ID,
        requestedUrl: url.toString(),
        status: "not-attempted",
        httpStatus: null,
        title: null,
        cityConfirmed: false,
        planetConfirmed: false,
        relevantLines: [],
        error: null
      };

      try {
        const response = await page.goto(url.toString(), {
          waitUntil: "domcontentloaded",
          timeout: 45000
        });
        capture.httpStatus = response?.status() ?? null;
        await page.waitForTimeout(1200);
        capture.title = await page.title();
        const body = await page.locator("body").innerText({ timeout: 15000 });
        const lines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        capture.cityConfirmed = /Pithoragarh/i.test(body);
        capture.planetConfirmed = new RegExp(target.planet === "Mercury" ? "Mercury|Budha" : "Jupiter|Guru", "i").test(body);
        capture.relevantLines = lines.filter(line =>
          /Pithoragarh|Tara Asta|Asta Starts|Asta Ends|Uday|Total Asta Duration|Internal Error|Access Denied|not found|Change Year/i.test(line)
        ).slice(0, 80);

        if (capture.httpStatus && capture.httpStatus >= 200 && capture.httpStatus < 400 &&
            capture.cityConfirmed && capture.planetConfirmed &&
            /Asta/i.test(body) && !/Internal Error/i.test(body)) {
          capture.status = "page-loaded-city-and-planet-confirmed";
        } else {
          capture.status = "page-loaded-but-source-not-verified";
        }
      } catch (error) {
        capture.status = "navigation-or-extraction-failed";
        capture.error = String(error?.message || error);
      }
      captures.push(capture);
    }
  }

  const summary = {
    title: "Drik Pithoragarh Mercury/Jupiter named-city page capture",
    capturedAt: new Date().toISOString(),
    policy: "No New Delhi fallback. A capture is eligible for review only when the page itself confirms Pithoragarh and the requested planet. Search-index text is not substituted for page content.",
    attempted: captures.length,
    verifiedPageLoads: captures.filter(x => x.status === "page-loaded-city-and-planet-confirmed").length,
    captures
  };
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
