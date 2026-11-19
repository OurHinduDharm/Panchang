import { isProjectPithoragarh, resolvePithoragarhSearch } from "./annual-tara-pithoragarh-identity.mjs";
import { buildPanchangEventUrl, panchangIsoDate } from "./panchang-event-links.mjs";
import { findTaraPlace, searchTaraPlaces } from "./annual-tara-place-search.mjs";
import { locations } from "./annual-tara-locations.mjs";
import { taraObserverKey } from "./research/tara-location-observer.mjs";

const element = id => document.getElementById(id);
const city = element("city"), year = element("forecast-year");
const cards = element("city-events"), status = element("city-status"), retry = element("city-retry");
const searchInput = element("place-search"), results = element("place-results");
const searchStatus = element("search-status"), selectedPlace = element("selected-place");
const embedded = window.top !== window.self;
const dailyPage = embedded ? "https://ourhindudharm.blogspot.com/p/panchang-today.html" : new URL("./", document.baseURI);
const cache = new Map();
let selectionVersion = 0, searchVersion = 0;
let chosenPlace, worker, searchDelay, agastyaPromise;
const timeZone = "Asia/Kolkata";
const dateTime = new Intl.DateTimeFormat("hi-IN", {timeZone, day: "numeric", month: "long"});
const dateOnly = new Intl.DateTimeFormat("hi-IN", {timeZone, day: "numeric", month: "long", year: "numeric"});
const clock = new Intl.DateTimeFormat("en-GB", {timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"});

function formatClock(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours < 4 ? "रात्रि" : hours < 12 ? "प्रातः" : hours < 16 ? "दोपहर" : hours < 20 ? "सायं" : "रात्रि";
  return period + " " + String(hours % 12 || 12).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + " बजे";
}

function formatDate(value) {
  return dateOnly.format(new Date(value + "T12:00:00+05:30"));
}

function regionalRecords() {
  if (!agastyaPromise) {
    agastyaPromise = fetch(new URL("./data/agastya-arghya-pithoragarh.json", import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error("Regional records unavailable");
        return response.json();
      }).catch(() => { agastyaPromise = undefined; return null; });
  }
  return agastyaPromise;
}

function addText(parent, tag, value) {
  const node = document.createElement(tag);
  node.textContent = value;
  parent.append(node);
  return node;
}

function eventLink(card, label, date, location) {
  const link = addText(card, "a", label + " का पंचांग देखें");
  link.className = "event-link";
  link.href = buildPanchangEventUrl(dailyPage, date, location);
  if (embedded) link.target = "_top";
}

async function show({events, unavailable}, selectedYear, location, version) {
  const records = isProjectPithoragarh(location) ? await regionalRecords() : null;
  if (version !== selectionVersion) return;
  const agastya = records?.years?.find(item => item.year === selectedYear &&
    item.source?.status === "source-page-identity-and-arghya-fields-captured");
  const fragment = document.createDocumentFragment();
  for (const [body, name] of [["Jupiter", "गुरु"], ["Venus", "शुक्र"], ["Star1", "अगस्त्य"]]) {
    const card = document.createElement("section");
    card.className = "planet";
    addText(card, "h2", name);
    if (body === "Star1" && agastya) {
      addText(card, "strong", "अगस्त्य अर्घ्य — " + formatDate(agastya.arghyaDate) + " (" + agastya.weekday + ")");
      addText(card, "p", "अर्घ्य का समय — " + formatClock(agastya.arghyaStart) + " से " + formatClock(agastya.arghyaEnd));
      addText(card, "p", "अवधि — " + agastya.duration);
      addText(card, "p", "अगस्त्य तारा उदय — " + formatClock(agastya.taraRise));
      eventLink(card, "अगस्त्य उदय", agastya.arghyaDate, location);
      addText(card, "p", "अगस्त्य तारा अस्त — " + formatDate(agastya.taraSetDate) + " · " + formatClock(agastya.taraSet));
      eventLink(card, "अगस्त्य अस्त", agastya.taraSetDate, location);
    } else {
      for (const event of events.filter(e => e.body === body)) {
        const label = event.event === "Udaya" ? "उदय" : "अस्त";
        const instant = new Date(Math.round(event.utcMilliseconds / 60000) * 60000);
        const row = document.createElement("div");
        row.className = "event";
        addText(row, "p", label + " — " + dateTime.format(instant) + " · " + formatClock(clock.format(instant)));
        eventLink(row, name + " " + label, panchangIsoDate(instant), location);
        card.append(row);
      }
      if (body === "Star1") {
        for (const event of unavailable) addText(card, "p", (event === "Udaya" ? "उदय" : "अस्त") + " — गणना अनुपलब्ध");
      }
      if (card.childElementCount === 1) addText(card, "p", "चुने वर्ष में कोई घटना उपलब्ध नहीं है।");
    }
    fragment.append(card);
  }
  cards.replaceChildren(fragment);
  status.textContent = "";
  cards.setAttribute("aria-busy", "false");
}

function calculateSelection(sync = true) {
  const location = chosenPlace || locations[city.value];
  // A year change during URL restoration applies to the city once it resolves.
  if (!location) return;
  const version = ++selectionVersion;
  worker?.terminate();
  worker = undefined;
  const selectedYear = Number(year.value);
  selectedPlace.textContent = location.name + " · भारतीय मानक समय";
  cards.replaceChildren();
  cards.setAttribute("aria-busy", "true");
  status.textContent = "गणना हो रही है…";
  retry.hidden = true;
  if (sync) {
    const url = new URL(window.location.href);
    url.searchParams.delete("geoname");
    url.searchParams.delete("city");
    url.searchParams.set(chosenPlace ? "geoname" : "city", chosenPlace ? chosenPlace.id : city.value);
    url.searchParams.set("year", selectedYear);
    history.replaceState(null, "", url);
  }
  function failed() {
    if (version !== selectionVersion) return;
    worker?.terminate();
    worker = undefined;
    status.textContent = "गणना लोड नहीं हो पाई।";
    cards.setAttribute("aria-busy", "false");
    retry.hidden = false;
  }
  const key = taraObserverKey(location) + "/" + selectedYear;
  const render = data => show(data, selectedYear, location, version).catch(failed);
  if (cache.has(key)) return render(cache.get(key));
  try {
    worker = new Worker(new URL("./annual-tara-city-worker.mjs", import.meta.url), {type: "module"});
    worker.onmessage = ({data}) => {
      if (version !== selectionVersion) return;
      worker.terminate();
      worker = undefined;
      if (cache.size >= 40) cache.delete(cache.keys().next().value);
      cache.set(key, data);
      render(data);
    };
    worker.onerror = failed;
    worker.postMessage({location, year: selectedYear});
  } catch { failed(); }
}

function clearSearch() {
  ++searchVersion;
  clearTimeout(searchDelay);
  results.replaceChildren();
  results.hidden = true;
  searchStatus.textContent = "";
}

function selectPlace(place) {
  clearSearch();
  chosenPlace = resolvePithoragarhSearch(place) ?? place;
  city.value = "";
  searchInput.value = chosenPlace.city;
  calculateSelection();
}

async function runSearch() {
  clearSearch();
  const version = searchVersion;
  if (searchInput.value.trim().length < 2) {
    searchStatus.textContent = "कम से कम दो अक्षर लिखें।";
    return;
  }
  searchStatus.textContent = "खोज जारी है…";
  try {
    const matches = await searchTaraPlaces(searchInput.value);
    if (version !== searchVersion) return;
    for (const place of matches) {
      const li = document.createElement("li");
      const button = addText(li, "button", place.city);
      button.type = "button";
      addText(button, "small", [place.admin2, place.admin1, "भारत"].filter(Boolean).join(" · "));
      button.onclick = () => { selectPlace(place); searchInput.focus(); };
      results.append(li);
    }
    results.hidden = !matches.length;
    searchStatus.textContent = matches.length ? matches.length + " स्थान मिले।" : "इस नाम का स्थान नहीं मिला।";
  } catch {
    if (version === searchVersion) searchStatus.textContent = "खोज लोड नहीं हो पाई। फिर प्रयास करें।";
  }
}

searchInput.oninput = () => {
  clearSearch();
  if (searchInput.value.trim().length >= 2) searchDelay = setTimeout(runSearch, 160);
};
element("place-form").onsubmit = event => { event.preventDefault(); runSearch(); };
element("place-form").onkeydown = event => {
  if (event.key === "Escape") { clearSearch(); searchInput.focus(); }
};
city.onchange = () => {
  clearSearch();
  chosenPlace = undefined;
  searchInput.value = "";
  calculateSelection();
};
year.onchange = retry.onclick = () => calculateSelection();

const params = new URLSearchParams(window.location.search);
const currentYear = Number(panchangIsoDate(new Date()).slice(0, 4));
for (let y = 2021; y <= Math.max(2030, currentYear + 1); y++) year.add(new Option(String(y), String(y)));
year.value = [...year.options].some(o => o.value === params.get("year")) ? params.get("year") : String(currentYear);
if (params.has("geoname")) {
  city.value = "";
  status.textContent = "स्थान लोड हो रहा है…";
  const initialVersion = selectionVersion;
  findTaraPlace(params.get("geoname")).then(place => {
    if (selectionVersion !== initialVersion) return;
    if (place) selectPlace(place);
    else status.textContent = "स्थान नहीं मिला। कृपया स्थान चुनें।";
  }).catch(() => { if (selectionVersion === initialVersion) status.textContent = "कृपया स्थान फिर से चुनें।"; });
} else {
  if (params.has("city")) city.value = params.get("city");
  if (city.value) calculateSelection(false);
  else status.textContent = "कृपया स्थान चुनें।";
}
