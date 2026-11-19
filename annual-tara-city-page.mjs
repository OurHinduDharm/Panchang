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
let selectionVersion = 0;

const eventDate = new Intl.DateTimeFormat("hi-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "long"
});
const eventTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});
function hindiTime(hours, minutes) {
  const period = hours < 4 ? "रात्रि" : hours < 12 ? "प्रातः" : hours < 16 ? "दोपहर" : hours < 20 ? "सायं" : "रात्रि";
  return period + " " + String(hours % 12 || 12).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + " बजे";
}
function formatClock(value) {
  const parts = String(value).split(":");
  if (parts.length !== 2 || !parts.every(part => /^[0-9]{2}$/.test(part))) return value;
  const hours = Number(parts[0]), minutes = Number(parts[1]);
  return hours < 24 && minutes < 60 ? hindiTime(hours, minutes) : value;
}
function formatEvent(utcMilliseconds) {
  const instant = new Date(Math.round(utcMilliseconds / 60000) * 60000);
  const [hours, minutes] = eventTime.format(instant).split(":").map(Number);
  return eventDate.format(instant) + " · " + hindiTime(hours, minutes);
}
const dateOnly = new Intl.DateTimeFormat("hi-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric"
});

const agastyaDataPromise = fetch("./data/agastya-arghya-pithoragarh.json", {cache: "no-cache"})
  .then(response => response.ok ? response.json() : null)
  .catch(() => null);

function formatDate(value) {
  return dateOnly.format(new Date(value + "T12:00:00+05:30"));
}

async function show({events, unavailable}, selectedYear, presetId, version) {
  const agastyaData = presetId === "pithoragarh-project-target"
    ? await agastyaDataPromise
    : null;
  if (version !== selectionVersion) return;
  status.textContent = "";
  const agastya = agastyaData?.years?.find(item => item.year === selectedYear);

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
        "अर्घ्य का समय — " + formatClock(agastya.arghyaStart) + " से " + formatClock(agastya.arghyaEnd),
        "अवधि — " + agastya.duration,
        "अगस्त्य तारा उदय — " + formatClock(agastya.taraRise),
        "अगस्त्य तारा अस्त — " + formatDate(agastya.taraSetDate) + " · " + formatClock(agastya.taraSet)
      ]) {
        const p = document.createElement("p");
        p.textContent = line;
        card.append(p);
      }
      cards.append(card);
      continue;
    }

    const lines = events.filter(e => e.body === body).map(e =>
      (e.event === "Udaya" ? "उदय" : "अस्त") + " — " + formatEvent(e.utcMilliseconds));
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
  const version = ++selectionVersion;
  activeWorker?.terminate();
  activeWorker = undefined;
  cards.replaceChildren();
  retry.hidden = true;
  status.textContent = "गणना हो रही है…";
  function failed() {
    if (version !== selectionVersion) return;
    status.textContent = "गणना लोड नहीं हो पाई।";
    retry.hidden = false;
  }
  try {
    const {observer} = resolveTaraLocation(location);
    const key = taraObserverKey(observer) + "/" + selectedYear;
    if (cache.has(key)) {
      show(cache.get(key), selectedYear, presetId, version);
      return;
    }
    const worker = new Worker(new URL("./annual-tara-city-worker.mjs", import.meta.url), {type: "module"});
    activeWorker = worker;
    worker.onmessage = ({data}) => {
      if (worker !== activeWorker) return;
      worker.terminate();
      activeWorker = undefined;
      cache.set(key, data);
      show(data, selectedYear, presetId, version);
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
