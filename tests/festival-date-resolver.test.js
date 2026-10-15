const test = require("node:test");
const assert = require("node:assert/strict");
const resolver = require("../festival-date-resolver.js");
const catalog = require("../data/festivals.json");
const overrides = require("../data/festival-overrides.json");

test("tithi matching normalizes paksha prefixes and Purnimanta month labels", () => {
  assert.equal(resolver.matchesTithiSpec(
    { date: "2026-09-14", month: "भाद्रपद", paksha: "शुक्ल पक्ष", tithi: "चतुर्थी" },
    { month: "भाद्रपद", paksha: "शुक्ल पक्ष", tithi: "शुक्ल चतुर्थी" }
  ), true);
  assert.equal(resolver.matchesTithiSpec(
    { date: "2026-11-20", month: "कार्तिक", paksha: "कृष्ण पक्ष", tithi: "चतुर्दशी" },
    { month: "कार्तिक (पूर्णिमान्त)", paksha: "कृष्ण पक्ष", tithi: "कृष्ण चतुर्दशी" }
  ), true);
  assert.equal(resolver.matchesTithiSpec(
    { date: "2026-09-14", month: "भाद्रपद", paksha: "शुक्ल पक्ष", tithi: "चतुर्थी" },
    { month: "भाद्रपद", paksha: "कृष्ण पक्ष", tithi: "चतुर्थी" }
  ), false);
});

test("alternate observances can match two different dates without merging traditions", () => {
  const gayatri = catalog.festivals.find((item) => item.id === "festival-087");
  const result = resolver.resolveFestivalDate(gayatri, {
    year: 2026,
    panchangDays: [
      { date: "2026-06-25", month: "ज्येष्ठ", paksha: "शुक्ल पक्ष", tithi: "एकादशी" },
      { date: "2026-08-28", month: "श्रावण", paksha: "शुक्ल पक्ष", tithi: "पूर्णिमा" },
      { date: "2027-08-17", month: "श्रावण", paksha: "शुक्ल पक्ष", tithi: "पूर्णिमा" }
    ]
  });
  assert.deepEqual(result.computedDates.map((item) => item.date), ["2026-06-25", "2026-08-28"]);
  assert.equal(result.status, "matched");
  assert.equal(result.overrideApplied, false);
});

test("inclusive tithi windows include both boundary dates and all intervening local days", () => {
  const tulsi = catalog.festivals.find((item) => item.id === "festival-025");
  const result = resolver.resolveFestivalDate(tulsi, {
    year: 2026,
    panchangDays: [
      { date: "2026-11-20", month: "कार्तिक", paksha: "शुक्ल पक्ष", tithi: "एकादशी" },
      { date: "2026-11-21", month: "कार्तिक", paksha: "शुक्ल पक्ष", tithi: "द्वादशी" },
      { date: "2026-11-22", month: "कार्तिक", paksha: "शुक्ल पक्ष", tithi: "त्रयोदशी" },
      { date: "2026-11-23", month: "कार्तिक", paksha: "शुक्ल पक्ष", tithi: "चतुर्दशी" },
      { date: "2026-11-24", month: "कार्तिक", paksha: "शुक्ल पक्ष", tithi: "पूर्णिमा" }
    ]
  });
  assert.equal(result.status, "matched");
  assert.deepEqual(result.displayDates.map((item) => item.date), [
    "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24"
  ]);
});

test("tithi windows fail closed when either boundary is absent", () => {
  const tulsi = catalog.festivals.find((item) => item.id === "festival-025");
  const result = resolver.resolveFestivalDate(tulsi, {
    year: 2026,
    panchangDays: [
      { date: "2026-11-21", month: "कार्तिक", paksha: "शुक्ल पक्ष", tithi: "द्वादशी" }
    ]
  });
  assert.equal(result.status, "unresolved");
  assert.deepEqual(result.displayDates, []);
  assert.match(result.reason, /window end tithi was not found/);
});

test("solar-event observance requires independently supplied ingress and egress boundaries", () => {
  const ambubachi = catalog.festivals.find((item) => item.id === "festival-123");
  const events = [
    { body: "Sun", longitudeSystem: "sidereal", targetLongitudeDegrees: 66.6666666667, event: "ingress", instant: "2026-06-22T06:56:05+05:30", localDate: "2026-06-22" },
    { body: "Sun", longitudeSystem: "sidereal", targetLongitudeDegrees: 70, event: "egress", instant: "2026-06-26T00:18:03+05:30", localDate: "2026-06-26" },
    { body: "Sun", longitudeSystem: "sidereal", targetLongitudeDegrees: 66.6666666667, event: "ingress", instant: "2027-06-22T12:00:00+05:30", localDate: "2027-06-22" }
  ];
  const result = resolver.resolveFestivalDate(ambubachi, { year: 2026, solarEvents: events });
  assert.equal(result.status, "matched");
  assert.equal(result.displayDates[0].date, "2026-06-22");
  assert.equal(result.displayDates[1].date, "2026-06-26");
  assert.equal(result.displayDates.length, 2);
  assert.match(result.reason || result.note, /temple's public reopening time/);
  const missingEnd = resolver.resolveFestivalDate(ambubachi, { year: 2026, solarEvents: events.slice(0, 1) });
  assert.equal(missingEnd.status, "matched-start-only");
  assert.equal(missingEnd.displayDates.length, 1);
  assert.match(missingEnd.reason, /no duration is inferred/);
});

test("year-specific override is ignored unless global policy and record are both approved", () => {
  const papankusha = catalog.festivals.find((item) => item.id === "festival-128");
  const pending = overrides.overrides.find((item) => item.id === "gm-2026-papankusha-ekadashi");
  const ignored = resolver.resolveFestivalDate(papankusha, { year: 2026, overridesData: overrides });
  assert.equal(ignored.overrideApplied, false);
  assert.equal(ignored.displayDates[0].date, "2026-10-22");

  const approvedData = JSON.parse(JSON.stringify(overrides));
  approvedData.policy.autoApply = true;
  const approved = approvedData.overrides.find((item) => item.id === pending.id);
  approved.status = "approved-for-application";
  approved.decision = "show-on-reference-date";
  const applied = resolver.resolveFestivalDate(papankusha, { year: 2026, overridesData: approvedData });
  assert.equal(applied.overrideApplied, true);
  assert.equal(applied.displayDates[0].date, approved.displayDate);
  assert.equal(applied.computedDates[0].date, "2026-10-22");
  assert.equal(applied.displayDates[0].method, "approved-reference-override");
});

test("source-only records never become display cards", () => {
  const duplicate = catalog.festivals.find((item) => item.id === "festival-110");
  const result = resolver.resolveFestivalDate(duplicate, { year: 2026 });
  assert.equal(result.status, "suppressed");
  assert.deepEqual(result.displayDates, []);
});

test("monthly Kalashtami resolves every supplied Krishna Ashtami regardless of month label", () => {
  const monthly = catalog.festivals.find((item) => item.id === "festival-kalashtami-recurring");
  const result = resolver.resolveFestivalDate(monthly, {
    year: 2027,
    panchangDays: [
      { date: "2027-01-05", month: "पौष", paksha: "कृष्ण पक्ष", tithi: "अष्टमी" },
      { date: "2027-02-04", month: "माघ (पूर्णिमान्त)", paksha: "कृष्ण पक्ष", tithi: "कृष्ण अष्टमी" },
      { date: "2027-02-05", month: "माघ", paksha: "शुक्ल पक्ष", tithi: "अष्टमी" },
      { date: "2026-12-29", month: "पौष", paksha: "कृष्ण पक्ष", tithi: "अष्टमी" }
    ]
  });
  assert.equal(result.status, "matched");
  assert.deepEqual(result.displayDates.map((item) => item.date), ["2027-01-05", "2027-02-04"]);
  assert.equal(result.method, "recurring-panchang-tithi");
});

test("annual Kalabhairava Ashtami resolves only Margashirsha Krishna Ashtami, separately from monthly observances", () => {
  const annual = catalog.festivals.find((item) => item.id === "festival-027");
  const result = resolver.resolveFestivalDate(annual, {
    year: 2027,
    panchangDays: [
      { date: "2027-01-05", month: "Pausha", paksha: "कृष्ण", tithi: "अष्टमी" },
      { date: "2027-11-20", month: "मार्गशीर्ष", paksha: "कृष्ण पक्ष", tithi: "कृष्ण अष्टमी" },
      { date: "2027-11-21", month: "मार्गशीर्ष", paksha: "शुक्ल पक्ष", tithi: "अष्टमी" },
      { date: "2026-11-30", month: "मार्गशीर्ष", paksha: "कृष्ण", tithi: "अष्टमी" }
    ]
  });
  assert.equal(result.status, "matched");
  assert.deepEqual(result.displayDates.map((item) => item.date), ["2027-11-20"]);
  assert.equal(result.displayDates[0].method, "panchang-tithi-match");
});

test("stored Gregorian candidates from a different year are not reused as recurring dates", () => {
  const papankusha = catalog.festivals.find((item) => item.id === "festival-128");
  const result = resolver.resolveFestivalDate(papankusha, { year: 2027 });
  assert.equal(result.status, "unresolved");
  assert.deepEqual(result.displayDates, []);
  assert.match(result.reason, /different year/);
});
