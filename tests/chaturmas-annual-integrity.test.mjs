import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const dataDir = new URL("../data/chaturmas/", import.meta.url);
const widget = await readFile(new URL("../festival-widget.js", import.meta.url), "utf8");
const generator = await readFile(new URL("../scripts/generate-annual-dwadashi-review.mjs", import.meta.url), "utf8");

function validDate(value) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(value || ""))) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function compare(a, b) {
  return a.localeCompare(b);
}

const files = (await readdir(dataDir))
  .filter(name => /^[0-9]{4}[.]json$/.test(name))
  .sort();

test("annual Chaturmas configs exist and every file is named for its year", () => {
  for (const year of [2026, 2027, 2028, 2029, 2030]) assert.ok(files.includes(`${year}.json`), `missing annual Chaturmas config ${year}`);
});

for (const file of files) {
  test(`Chaturmas ${file.slice(0, 4)} follows the Smarta annual date contract`, async () => {
    const config = JSON.parse(await readFile(new URL(file, dataDir), "utf8"));
    const year = Number(file.slice(0, 4));

    assert.equal(config.year, year, "config year must match filename");
    assert.equal(config.status, "approved");
    assert.ok(config.schemaVersion >= 2, "new annual configs must use schemaVersion 2 or later");
    assert.equal(config.endObservance, "smarta-ekadashi", "Smarta Ekadashi is the sole primary end observance");
    assert.match(config.completionTithi || "", /द्वादशी/, "completion must explicitly identify Dwadashi");
    assert.ok(validDate(config.startDate), "startDate must be a real ISO calendar date");
    assert.ok(validDate(config.endDate), "endDate must be a real ISO calendar date");
    assert.ok(validDate(config.completionDate), "completionDate must be a real ISO calendar date");
    assert.ok(validDate(config.cardVisibleThroughDate), "cardVisibleThroughDate must be a real ISO calendar date");
    assert.ok(compare(config.startDate, config.endDate) <= 0);
    assert.ok(compare(config.endDate, config.completionDate) < 0, "Dwadashi completion must follow Smarta Ekadashi");
    assert.ok(compare(config.completionDate, config.cardVisibleThroughDate) <= 0,
      "card must remain visible through at least the completion date");

    assert.ok(Array.isArray(config.phases) && config.phases.length === 4,
      "all four dietary phases must be present");
    assert.equal(config.phases[0].startDate, config.startDate,
      "first phase must begin on Chaturmas start date");
    assert.equal(config.phases[3].endDate, config.endDate,
      "last phase must end on Smarta Ekadashi date");
    assert.match(config.phases[3].endTithi || "", /एकादशी/,
      "last dietary phase must end on Ekadashi");

    for (let index = 0; index < config.phases.length; index++) {
      const phase = config.phases[index];
      assert.ok(phase.id && phase.title, `phase ${index + 1} needs an id and title`);
      assert.ok(validDate(phase.startDate) && validDate(phase.endDate),
        `phase ${index + 1} dates must be real ISO calendar dates`);
      assert.ok(compare(phase.startDate, phase.endDate) <= 0,
        `phase ${index + 1} must not end before it starts`);
      if (index > 0) {
        assert.equal(phase.startDate, config.phases[index - 1].endDate,
          `phase ${index + 1} must begin on the previous phase transition date`);
      }
    }

    const phaseDetails = config.phases.map(phase => String(phase.detail || "").trim());
    assert.ok(phaseDetails.every(Boolean), "every phase must have a concise instruction");
    assert.equal(new Set(phaseDetails).size, phaseDetails.length,
      "phase descriptions must not be duplicated");
    assert.ok(String(config.completionDetail || "").trim(),
      "completion detail must be present for the Dwadashi observance");
    assert.ok(!/कार्तिक शुक्ल द्वादशी|नवंबर|दिसंबर/.test(config.completionDetail),
      "completion date and tithi belong in their own structured fields, not repeated in the instruction");
  });
}

test("10-day widget gives precedence to Smarta Devutthana Ekadashi over Gauna/Vaishnava entries", () => {
  assert.ok(widget.includes('!/वैष्णव|गौण/i.test(item.title || "")'));
  assert.ok(widget.includes("देवोत्थानी एकादशी (स्मार्त)"));
  assert.ok(widget.includes("/देवोत्थानी|देवउठनी|देवप्रबोधिनी|प्रबोधिनी/i"),
    "the actual approved Smarta title must be recognized when locating the Chaturmas end date");
  assert.ok(widget.includes("cardVisibleThroughDate"));
  assert.ok(widget.includes("if (todayKey < startKey) return null;"),
    "the Chaturmas card must remain hidden until the annual Panchang-derived start date");
  assert.ok(widget.includes("chaturmasConfig.completionTithi"));
  assert.ok(widget.includes("व्रत-समापन · "));
});


test("2029 and 2030 Chaturmas boundaries use local sunrise Dwadashi and next-day completion", async () => {
  const expected = {
    2029: { start: "2029-07-21", phases: ["2029-08-21", "2029-09-19", "2029-10-19"], end: "2029-11-16", completion: "2029-11-17", visible: "2029-11-18" },
    2030: { start: "2030-07-11", phases: ["2030-08-10", "2030-09-09", "2030-10-08"], end: "2030-11-05", completion: "2030-11-06", visible: "2030-11-07" }
  };
  for (const [year, dates] of Object.entries(expected)) {
    const config = JSON.parse(await readFile(new URL(`../data/chaturmas/${year}.json`, import.meta.url), "utf8"));
    assert.equal(config.startDate, dates.start);
    assert.deepEqual(config.phases.map(phase => phase.endDate).slice(0, 3), dates.phases);
    assert.equal(config.endDate, dates.end);
    assert.equal(config.completionDate, dates.completion);
    assert.equal(config.cardVisibleThroughDate, dates.visible);
    assert.equal(config.completionTithi, "कार्तिक शुक्ल द्वादशी");
    assert.ok(config.completionDetail.includes("दालों"));
  }
});



test("annual Panchang generator is not hard-limited to the 2026–2030 data window", () => {
  assert.ok(generator.includes("year > 2199"));
  assert.ok(generator.includes("CHATURMAS_START_REFERENCES[year] || null"));
  assert.ok(generator.includes("CHATURMAS_END_REFERENCES[year] || null"));
  assert.ok(generator.includes("no-configured-reference-manual-cross-check-required"));
  assert.ok(generator.includes("catalogMonthsMissing"));
  assert.ok(generator.includes('error.code === "ENOENT"'));
});

test("2027 and 2028 Chaturmas use approved Smarta cards and local sunrise Dwadashi evidence", async () => {
  for (const year of [2027,2028]) {
    const config=JSON.parse(await readFile(new URL(`../data/chaturmas/${year}.json`,import.meta.url),"utf8"));
    const reference=JSON.parse(await readFile(new URL(`../data/references/ohd-dwadashi-${year}-review.json`,import.meta.url),"utf8"));
    const boundaries=reference.chaturmas.boundaries;
    assert.deepEqual([config.startDate,...config.phases.map(p=>p.endDate)],boundaries.map(b=>b.selectedDate));
    for(const boundary of boundaries){
      const selected=boundary.observations.find(o=>o.date===boundary.selectedDate);
      assert.ok(selected, "missing local observation");
      assert.ok(Date.parse(selected.tithiStartTime)<=Date.parse(selected.sunrise));
      assert.ok(Date.parse(selected.sunrise)<Date.parse(selected.tithiEndTime));
    }
    for(const [date,pattern] of [[config.startDate,/देवशयनी/],[config.endDate,/देवोत्थानी.*स्मार्त/]]){
      const monthly=JSON.parse(await readFile(new URL(`../data/festivals/${date.slice(0,7)}.json`,import.meta.url),"utf8"));
      assert.ok(monthly.events.some(e=>e.date===date&&pattern.test(e.title)&&e.reviewStatus==="approved"));
    }
    const completion=reference.tithiDates.find(t=>t.date>config.endDate&&t.month==="कार्तिक"&&t.paksha==="शुक्ल"&&t.observedAtSunrise);
    assert.equal(config.completionDate,completion.date);
    assert.ok(completion.sunriseObservations.some(o=>Date.parse(o.tithiStartTime)<=Date.parse(o.sunrise)&&Date.parse(o.sunrise)<Date.parse(o.tithiEndTime)));
    assert.equal(config.cardVisibleThroughDate,new Date(Date.parse(config.completionDate)+86400000).toISOString().slice(0,10));
  }
});

test("upcoming widget limits requests to visible months outside approved Chaturmas and boundary months inside it", async () => {
  const start=widget.indexOf("  async function load() {");
  const end=widget.indexOf("\n  load();",start);
  assert.ok(start>=0&&end>start);
  const source=widget.slice(start,end);
  const config={year:2026,status:"approved",startDate:"2026-07-25",endDate:"2026-11-20",cardVisibleThroughDate:"2026-11-22"};
  async function simulate(day,annual) {
    const [y,m,d]=day.split("-").map(Number);
    class FixedDate extends Date {
      constructor(...args){super(...(args.length?args:[y,m-1,d,12]));}
    }
    const dateKey=date=>date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
    const monthKey=date=>dateKey(date).slice(0,7);
    const parseDate=value=>value?new FixedDate(value+"T12:00:00"):null;
    const requests=[],draws=[];
    const mount={textContent:""};
    const load=new Function("Date","localMidnight","dateKey","monthKey","parseDate","fetchMonth","fetchChaturmasConfig","mount","render","DAYS_AHEAD",source+"\nreturn load;")(
      FixedDate,date=>new FixedDate(date.getFullYear(),date.getMonth(),date.getDate()),dateKey,monthKey,parseDate,
      async date=>{requests.push(monthKey(date));return {events:[{date:monthKey(date)+"-15",title:"पर्व"}]}},
      async()=>annual,mount,(...args)=>draws.push(args),20
    );
    await load();
    assert.equal(draws.length,1);
    assert.equal(requests.length,new Set(requests).size);
    return {requests:requests.sort(),chaturmasEvents:draws[0][2]};
  }
  const after=await simulate("2026-11-28",config);
  assert.deepEqual(after.requests,["2026-10","2026-11","2026-12"]);
  assert.deepEqual(after.chaturmasEvents,[]);
  const active=await simulate("2026-08-15",config);
  assert.deepEqual(active.requests,["2026-07","2026-08","2026-09","2026-11"]);
  assert.ok(active.chaturmasEvents.length);
  const fallback=await simulate("2026-11-28",null);
  assert.deepEqual(fallback.requests,["2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"]);
  const boundary=await simulate("2026-12-25",config);
  assert.deepEqual(boundary.requests,["2026-11","2026-12","2027-01"]);
});
