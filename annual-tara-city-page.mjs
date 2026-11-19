import { locations } from "./annual-tara-locations.mjs";
import { taraObserverKey } from "./research/tara-location-observer.mjs";

const city = document.getElementById("city");
const year = document.getElementById("forecast-year");
const cards = document.getElementById("city-events");
const status = document.getElementById("city-status");
const retry = document.getElementById("city-retry");
const records = document.getElementById("pithoragarh-records");
const cache = new Map();
let activeWorker;

const clock = new Intl.DateTimeFormat("hi-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "long", hour: "2-digit",
  minute: "2-digit", hourCycle: "h23"
});

function show({events, unavailable}) {
  status.textContent = "";
  for (const [body, name] of [["Jupiter", "गुरु"], ["Venus", "शुक्र"], ["Star1", "अगस्त्य"]]) {
    const card = document.createElement("section");
    card.className = "planet";
    const heading = document.createElement("h2");
    heading.textContent = name;
    card.append(heading);
    const lines = events.filter(e => e.body === body).map(e =>
      (e.event === "Udaya" ? "उदय" : "अस्त") + " — " + clock.format(Math.round(e.utcMilliseconds / 60000) * 60000));
    if (body === "Star1") {
      for (const event of unavailable) lines.push((event === "Udaya" ? "उदय" : "अस्त") + " — गणना अनुपलब्ध");
    }
    if (!lines.length) lines.push("चुने वर्ष में कोई घटना उपलब्ध नहीं है।");
    for (const line of lines) {
      const p = document.createElement("p");
      p.textContent = line;
      card.append(p);
    }
    cards.append(card);
  }
}

function calculate(location, selectedYear, presetId) {
  activeWorker?.terminate();
  activeWorker = undefined;
  cards.replaceChildren();
  retry.hidden = true;
  records.hidden = presetId !== "pithoragarh-project-target";
  const key = taraObserverKey(location) + "/" + selectedYear;
  if (cache.has(key)) return show(cache.get(key));
  status.textContent = "गणना हो रही है…";
  function failed() {
    status.textContent = "गणना लोड नहीं हो पाई।";
    retry.hidden = false;
  }
  try {
    const worker = new Worker(new URL("./annual-tara-city-worker.mjs", import.meta.url), {type: "module"});
    activeWorker = worker;
    worker.onmessage = ({data}) => {
      if (worker !== activeWorker) return;
      worker.terminate();
      activeWorker = undefined;
      cache.set(key, data);
      show(data);
    };
    worker.onerror = () => {
      if (worker !== activeWorker) return;
      worker.terminate();
      activeWorker = undefined;
      failed();
    };
    worker.postMessage({location, city: presetId, year: selectedYear});
  } catch {
    failed();
  }
}

const currentYear = Number(new Intl.DateTimeFormat("en", {year: "numeric", timeZone: "Asia/Kolkata"}).format(new Date()));
for (let y = 2021; y <= Math.max(2030, currentYear + 1); y++) year.add(new Option(String(y), String(y)));
year.value = String(currentYear);
function calculateSelection() {
  calculate(locations[city.value], Number(year.value), city.value);
}
year.onchange = city.onchange = retry.onclick = calculateSelection;
calculateSelection();
