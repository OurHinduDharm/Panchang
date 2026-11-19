import { locations } from "./annual-tara-locations.mjs";
import { taraObserverKey } from "./research/tara-location-observer.mjs";
import { resolveTaraLocation } from "./research/tara-astronomy-context.mjs";

const city = document.getElementById("city");
const year = document.getElementById("forecast-year");
const cards = document.getElementById("city-events");
const status = document.getElementById("city-status");
const retry = document.getElementById("city-retry");
const cache = new Map();
let activeWorker;

const clock = new Intl.DateTimeFormat("hi-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "long", hour: "2-digit",
  minute: "2-digit", hourCycle: "h23"
});
const dateOnly = new Intl.DateTimeFormat("hi-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric"
});

const agastyaDataPromise = fetch("./data/agastya-arghya-pithoragarh.json", {cache: "no-cache"})
  .then(response => response.ok ? response.json() : null)
  .catch(() => null);

function formatDate(value) {
  return dateOnly.format(new Date(value + "T12:00:00+05:30"));
}

async function show({events, unavailable}, selectedYear, presetId) {
  status.textContent = "";
  const agastyaData = presetId === "pithoragarh-project-target"
    ? await agastyaDataPromise
    : null;
  const agastya = agastyaData?.years?.find(item => item.year === selectedYear &&
    item.source?.status === "source-page-identity-and-arghya-fields-captured");

  for (const [body, name] of [["Jupiter", "गुरु"], ["Venus", "शुक्र"], ["Star1", "अगस्त्य"]]) {
    const card = document.createElement("section");
    card.className = "planet";
    const heading = document.createElement("h2");
    heading.textContent = name;
    card.append(heading);

    if (body === "Star1" && agastya) {
      const title = document.createElement("strong");
      title.textContent = "अगस्त्य अर्घ्य — " + formatDate(agastya.arghyaDate) + " (" + agastya.weekday + ")";
      card.append(title);
      for (const line of [
        "अर्घ्य का समय — " + agastya.arghyaStart + " से " + agastya.arghyaEnd,
        "अवधि — " + agastya.duration,
        "अगस्त्य तारा उदय — " + agastya.taraRise,
        "अगस्त्य तारा अस्त — " + formatDate(agastya.taraSetDate) + " · " + agastya.taraSet
      ]) {
        const p = document.createElement("p");
        p.textContent = line;
        card.append(p);
      }
      cards.append(card);
      continue;
    }

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
  status.textContent = "गणना हो रही है…";
  function failed() {
    status.textContent = "गणना लोड नहीं हो पाई।";
    retry.hidden = false;
  }
  try {
    const {observer} = resolveTaraLocation(location);
    const key = taraObserverKey(observer) + "/" + selectedYear;
    if (cache.has(key)) {
      show(cache.get(key), selectedYear, presetId);
      return;
    }
    const worker = new Worker(new URL("./annual-tara-city-worker.mjs", import.meta.url), {type: "module"});
    activeWorker = worker;
    worker.onmessage = ({data}) => {
      if (worker !== activeWorker) return;
      worker.terminate();
      activeWorker = undefined;
      cache.set(key, data);
      show(data, selectedYear, presetId);
    };
    worker.onerror = () => {
      if (worker !== activeWorker) return;
      worker.terminate();
      activeWorker = undefined;
      failed();
    };
    worker.postMessage({location: observer, city: presetId, year: selectedYear});
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
