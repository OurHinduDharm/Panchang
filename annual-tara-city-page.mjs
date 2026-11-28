import { resolvePithoragarhSearch } from "./annual-tara-pithoragarh-identity.mjs";
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
let chosenPlace, worker, searchDelay;
const timeZone = "Asia/Kolkata";
const dateTime = new Intl.DateTimeFormat("hi-IN", {timeZone, day: "numeric", month: "long"});
const dateOnly = new Intl.DateTimeFormat("hi-IN", {timeZone, day: "numeric", month: "long", year: "numeric"});
const clock = new Intl.DateTimeFormat("en-GB", {timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"});

function formatClock(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours < 4 ? "रात्रि" : hours < 12 ? "प्रातः" : hours < 16 ? "दोपहर" : hours < 20 ? "सायं" : "रात्रि";
  return period + " " + String(hours % 12 || 12).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + " बजे";
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
  try {
    link.href = buildPanchangEventUrl(dailyPage, date, location);
    if (embedded) link.target = "_top";
  } catch {
    link.remove();
  }
}

async function show({events, arghya = [], kanyaCalendar = null, elevationSourceApproximate}, selectedYear, location, version) {
  if (version !== selectionVersion) return;
  const fragment = document.createDocumentFragment();
  for (const [body, name] of [["Jupiter", "गुरु"], ["Venus", "शुक्र"], ["Star1", "अगस्त्य"]]) {
    const card = document.createElement("section");
    card.className = "planet";
    addText(card, "h2", name);
    const bodyEvents = events.filter(e => e.body === body);
    for (const event of bodyEvents) {
      const label = event.event === "Udaya" ? "उदय" : "अस्त";
      const instant = new Date(Math.round(event.utcMilliseconds / 60000) * 60000);
      const row = document.createElement("div");
      row.className = "event";
      addText(row, "p", label + " — " + dateTime.format(instant) + " · " + formatClock(clock.format(instant)));
      eventLink(row, name + " " + label, panchangIsoDate(instant), location);
      card.append(row);
    }
    if (body === "Star1") {
      // Visibility is an astronomical result, not a reviewed ritual decision.
      if (bodyEvents.length) addText(card, "p", "दृश्यता-आधारित उदय-अस्त");
      for (const window of arghya) {
        const start = new Date(window.startUtcMilliseconds);
        const end = new Date(window.endUtcMilliseconds);
        // Dawn is supported by Nirnayasindhu; the computed visibility date
        // itself is not a verified traditional Udaya. Keep that distinction.
        const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
        const morningWindow = panchangIsoDate(start) === panchangIsoDate(end) &&
          minutes > 0 && minutes <= 180 && Number(clock.format(end).split(":")[0]) < 12;
        if (morningWindow) addText(card, "h3", "अगस्त्यार्घ्य हेतु दृश्यता-आधारित दर्शनकाल");
        addText(card, morningWindow ? "p" : "h3", "उदय से सूर्योदय तक — " + dateOnly.format(start));
        addText(card, "p", "समय — " + formatClock(clock.format(start)) + " से " + formatClock(clock.format(end)) + " तक");
        if (minutes > 0) {
          const hours = Math.floor(minutes / 60), remainder = minutes % 60;
          addText(card, "p", "अवधि — " + [hours ? hours + " घंटा" : "", remainder ? remainder + " मिनट" : ""].filter(Boolean).join(" "));
        }
      }
      if (kanyaCalendar?.dawns?.length === 7 && Number.isFinite(kanyaCalendar.ingressUtcMilliseconds)) {
        const ingress = new Date(kanyaCalendar.ingressUtcMilliseconds);
        addText(card, "h3", "कन्या संक्रान्ति से पूर्व अगस्त्यार्घ्य");
        addText(card, "p", "भविष्यपुराण के अनुसार सात प्रातःकालीन अवसर");
        addText(card, "p", "कन्या संक्रान्ति — " + dateOnly.format(ingress) + " · " + formatClock(clock.format(ingress)));
        addText(card, "p", "संक्रान्ति के बाद अर्घ्यकाल समाप्त। सातों दिन अर्घ्य देना अनिवार्य नहीं है।");
        const list = document.createElement("ol");
        for (const dawn of kanyaCalendar.dawns) {
          // Round inward so the published minute never extends past the bound.
          const from = new Date(Math.ceil(dawn.startUtcMilliseconds / 60000) * 60000);
          const to = new Date(Math.floor(dawn.endUtcMilliseconds / 60000) * 60000);
          if (from >= to) continue;
          const row = addText(list, "li", dateOnly.format(from) + " — " + formatClock(clock.format(from)) + " से " + formatClock(clock.format(to)) + " तक");
          row.style.marginBottom = "0.5em";
        }
        card.append(list);
        addText(card, "p", "समय-गणना: स्थानीय प्रभात (सूर्य क्षितिज से 12° नीचे) से सूर्योदय तक; संक्रान्ति पहले हो तो वहीं तक। यह गणितीय प्रभात-सीमा है।");
      }
    }
    fragment.append(card);
  }
  cards.replaceChildren(fragment);
  const elevationNote = elevationSourceApproximate
    ? "शहर की उपलब्ध मानक ऊँचाई का उपयोग किया गया है।"
    : "शहर की दर्ज ऊँचाई का उपयोग किया गया है।";
  status.textContent = elevationNote;
  cards.setAttribute("aria-busy", "false");
}

function calculateSelection(sync = true) {
  const location = chosenPlace || locations[city.value];
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
  function failed(message) {
    if (version !== selectionVersion) return;
    worker?.terminate();
    worker = undefined;
    status.textContent = message || "गणना लोड नहीं हो पाई।";
    cards.setAttribute("aria-busy", "false");
    retry.hidden = false;
  }
  const key = taraObserverKey(location) + "/" + selectedYear;
  const render = data => {
    if (data.error) return failed("अभी परिणाम उपलब्ध नहीं हैं। कृपया दोबारा प्रयास करें।");
    show(data, selectedYear, location, version).catch(() => failed("गणना परिणाम दिखाने में समस्या आई।"));
  };
  if (cache.has(key)) return render(cache.get(key));
  try {
    worker = new Worker(new URL("./annual-tara-city-worker.mjs", import.meta.url), {type: "module"});
    worker.onmessage = ({data}) => {
      if (version !== selectionVersion) return;
      worker.terminate();
      worker = undefined;
      // A transient worker failure must not poison the retry cache.
      if (!data.error) {
        if (cache.size >= 40) cache.delete(cache.keys().next().value);
        cache.set(key, data);
      }
      render(data);
    };
    worker.onerror = () => failed();
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
  const preset = "geoname:" + chosenPlace.id;
  city.value = [...city.options].some(o => o.value === preset) ? preset : "";
  searchInput.value = city.value ? "" : chosenPlace.city;
  calculateSelection();
}

// Use the identical indexed observer as text search; no duplicate city
// coordinates or second elevation value. Load the index only on demand.
async function loadMajorCity(id) {
  const version = ++selectionVersion;
  worker?.terminate();
  worker = undefined;
  chosenPlace = undefined;
  cards.replaceChildren();
  cards.setAttribute("aria-busy", "true");
  selectedPlace.textContent = "";
  status.textContent = "स्थान लोड हो रहा है…";
  retry.hidden = true;
  try {
    const place = await findTaraPlace(id);
    if (version !== selectionVersion) return;
    if (!place) throw new Error("City missing");
    selectPlace(place);
  } catch {
    if (version !== selectionVersion) return;
    cards.setAttribute("aria-busy", "false");
    status.textContent = "स्थान लोड नहीं हो पाया। कृपया फिर प्रयास करें।";
    retry.hidden = false;
  }
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
  if (city.value.startsWith("geoname:")) {
    loadMajorCity(city.value.slice(8));
  } else {
    calculateSelection();
  }
};
year.onchange = () => calculateSelection();
retry.onclick = () => {
  if (!chosenPlace && city.value.startsWith("geoname:")) loadMajorCity(city.value.slice(8));
  else calculateSelection();
};

const params = new URLSearchParams(window.location.search);
const currentYear = Number(panchangIsoDate(new Date()).slice(0, 4));
for (let y = 2021; y <= 2035; y++) year.add(new Option(String(y), String(y)));
year.value = [...year.options].some(o => o.value === params.get("year")) ? params.get("year") : String(currentYear);
const restoredMajorCity = "geoname:" + params.get("geoname");
if (params.has("geoname") && [...city.options].some(o => o.value === restoredMajorCity)) {
  city.value = restoredMajorCity;
  loadMajorCity(params.get("geoname"));
} else if (params.has("geoname")) {
  city.value = "";
  status.textContent = "स्थान लोड हो रहा है…";
  const initialVersion = selectionVersion;
  findTaraPlace(params.get("geoname")).then(place => {
    if (selectionVersion !== initialVersion) return;
    if (place) selectPlace(place);
    else status.textContent = "स्थान नहीं मिला। कृपया स्थान चुनें।";
  }).catch(() => { if (selectionVersion === initialVersion) status.textContent = "कृपया स्थान फिर से चुनें।"; });
} else {
  if (params.has("city") && Object.hasOwn(locations, params.get("city"))) city.value = params.get("city");
  if (city.value) calculateSelection(false);
  else status.textContent = "कृपया स्थान चुनें।";
}
