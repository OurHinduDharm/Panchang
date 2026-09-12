import { getPanchangam, Observer } from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";

let selectedLocation = null;
let currentSankalpContext = null;

const cityInput = document.getElementById("cityInput");
const dateInput = document.getElementById("dateInput");
const suggestions = document.getElementById("suggestions");
const selectedCity = document.getElementById("selectedCity");
const result = document.getElementById("result");

/* TODAY */
function todayString(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}
dateInput.value = todayString();

/* HINDI DATA */
const pakshaHindi = {
  Shukla:"शुक्ल पक्ष",
  Krishna:"कृष्ण पक्ष",
  shukla:"शुक्ल पक्ष",
  krishna:"कृष्ण पक्ष"
};

const tithiHindi = [
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा",
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या"
];

const nakshatraHindi = [
  "अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशीर्ष","आर्द्रा",
  "पुनर्वसु","पुष्य","आश्लेषा","मघा","पूर्वाफाल्गुनी",
  "उत्तराफाल्गुनी","हस्त","चित्रा","स्वाती","विशाखा",
  "अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा",
  "श्रवण","धनिष्ठा","शतभिषा","पूर्वाभाद्रपद",
  "उत्तराभाद्रपद","रेवती"
];

const yogaHindi = [
  "विष्कम्भ","प्रीति","आयुष्मान","सौभाग्य","शोभन","अतिगण्ड",
  "सुकर्मा","धृति","शूल","गण्ड","वृद्धि","ध्रुव","व्याघात",
  "हर्षण","वज्र","सिद्धि","व्यतीपात","वरीयान","परिघ","शिव",
  "सिद्ध","साध्य","शुभ","शुक्ल","ब्रह्म","इन्द्र","वैधृति"
];

const karanaHindi = {
  Bava:"बव", Balava:"बालव", Kaulava:"कौलव", Taitila:"तैतिल",
  Gara:"गर", Vanija:"वणिज", Vishti:"विष्टि", Shakuni:"शकुनि",
  Chatushpada:"चतुष्पद", Naga:"नाग", Kimstughna:"किंस्तुघ्न"
};

const masaHindi = {
  Chaitra:"चैत्र", Vaishakha:"वैशाख", Jyeshtha:"ज्येष्ठ", Ashadha:"आषाढ़",
  Shravana:"श्रावण", Bhadrapada:"भाद्रपद", Ashwin:"आश्विन", Kartika:"कार्तिक",
  Margashirsha:"मार्गशीर्ष", Pausha:"पौष", Magha:"माघ", Phalguna:"फाल्गुन",
  Bhadra:"भाद्रपद",
  Ashwina:"आश्विन",
  Kartik:"कार्तिक",
  Margashir:"मार्गशीर्ष",
  Paush:"पौष",
  Phalgun:"फाल्गुन",
  Ashwayuja:"आश्विन",
  Agrahayana:"मार्गशीर्ष",
  Aghrayana:"मार्गशीर्ष"
};

const rituHindi = {
  Vasanta:"वसंत ऋतु", Grishma:"ग्रीष्म ऋतु", Varsha:"वर्षा ऋतु",
  Sharad:"शरद ऋतु", Hemanta:"हेमंत ऋतु", Shishira:"शिशिर ऋतु"
};

const ayanaHindi = {
  Uttarayana:"उत्तरायण",
  Dakshinayana:"दक्षिणायन"
};

const rashiHindi = {
  0: "मेष", 1: "वृषभ", 2: "मिथुन", 3: "कर्क",
  4: "सिंह", 5: "कन्या", 6: "तुला", 7: "वृश्चिक",
  8: "धनु", 9: "मकर", 10: "कुम्भ", 11: "मीन"
};

/* =========================================================
   SANKALP STATE (persists across type switches & date changes)
   ========================================================= */
const sankalpState = {
  type: "sandhya",

  /* Sandhya */
  sandhyaType: "pratah",
  sandhyaDevta: "श्रीगायत्री",
  sandhyaDevtaCustom: "",

  /* Daan */
  daanDevta: "श्रीपरमेश्वर",
  daanDevtaCustom: "",
  daanKamna: "सर्वपापक्षयार्थं",
  daanItem: "अन्न",
  daanItemCustom: "",

  /* Tarpana */
  tarpanaType: "tilanjali",

  /* Rudrabhishek */
  rudraMode: "sakam",
  rudraDravya: "जल",
  rudraDravyaCustom: "",
  rudraPath: "रुद्रसूक्तेन",
  rudraPathCustom: "",

  /* Satyanarayan */
  satyaMode: "sakam",

  /* Puja */
  pujaDevta: "",
  pujaKamna: "सर्वारिष्टशान्त्यर्थं",

  /* Vrat */
  vratMode: "vrat",
  vratName: "एकादशी",
  vratNameCustom: "",
  vratDevta: "",

  /* Common identity */
  gotra: "",
  naam: "",
  varna: "शर्मा",
  kartaMode: "self",
  brahminGotra: "",
  brahminNaam: ""
};

/* =========================================================
   STAGE 3 HELPERS
   ========================================================= */
function getBhadraDetails(p, moonRashiIndex, referenceNow){
  const vishtiKarana = (p.karanas || []).find(
    k => k.name && k.name.toLowerCase() === "vishti"
  );

  if(!vishtiKarana){
    return { available:false };
  }

  const start = new Date(vishtiKarana.startTime);
  const end = new Date(vishtiKarana.endTime);
  const totalMs = end.getTime() - start.getTime();

  if(totalMs <= 0){
    return { available:false };
  }

  const partNames = [
    "मुख", "कंठ", "हृदय", "नाभि", "कटि", "पुच्छ"
  ];

  const parts = [];
  let activeIndex = -1;
  const now = referenceNow;

  for(let i=0;i<6;i++){
    const pStart = new Date(
      start.getTime() + (totalMs * i / 6)
    );
    const pEnd = new Date(
      start.getTime() + (totalMs * (i+1) / 6)
    );

    const isActive = !!(
      now && now >= pStart && now < pEnd
    );

    if(isActive){
      activeIndex = i;
    }

    parts.push({
      name:partNames[i],
      start:pStart,
      end:pEnd,
      isActive
    });
  }

  let niwas = "—";
  let niwasColor = "#95a5a6";

  const isActiveOverall = !!(
    now && now >= start && now < end
  );

  let rashiIndex = null;

  if(typeof moonRashiIndex === "number"){
    rashiIndex = moonRashiIndex + 1;
  }else if(typeof p.moonRashi?.index === "number"){
    rashiIndex = p.moonRashi.index + 1;
  }else if(typeof p.moonLongitude === "number"){
    rashiIndex = Math.floor(p.moonLongitude / 30) + 1;
  }

  const swargaRashi = [1,2,3,8];
  const patalRashi = [6,7,9,10];

  if(
    rashiIndex !== null &&
    rashiIndex >= 1 &&
    rashiIndex <= 12
  ){
    if(swargaRashi.includes(rashiIndex)){
      niwas = "स्वर्ग";
      niwasColor = "#2ecc71";
    }
    else if(patalRashi.includes(rashiIndex)){
      niwas = "पाताल";
      niwasColor = "#8e44ad";
    }
    else{
      niwas = "मृत्युलोक";
      niwasColor = "#e67e22";
    }
  }

  return {
    available:true,
    start,
    end,
    parts,
    activeIndex,
    niwas,
    niwasColor,
    isActive:isActiveOverall
  };
}

function getPraharDetails(
  p,
  nextSunriseTime,
  previousSunsetTime,
  referenceNow
){
  const sunrise = new Date(p.sunrise);
  const sunset = new Date(p.sunset);
  const now = referenceNow;

  if(!nextSunriseTime){
    return {
      dayPrahar:[],
      nightPrahar:[],
      currentPrahar:null,
      error:"अगला सूर्योदय उपलब्ध नहीं"
    };
  }

  const nextSunrise = new Date(nextSunriseTime);
  const shouldHighlight = !!(
    now && dateInput.value === todayString()
  );

  const dayDuration = sunset.getTime() - sunrise.getTime();
  const dayPraharMs = dayDuration / 4;
  const dayPrahar = [];

  for(let i=0;i<4;i++){
    const start = new Date(
      sunrise.getTime() + i * dayPraharMs
    );
    const end = new Date(
      sunrise.getTime() + (i+1) * dayPraharMs
    );
    const isActive = shouldHighlight &&
      now >= start && now < end;

    dayPrahar.push({
      start,
      end,
      isActive,
      type:"day"
    });
  }

  let nightStart;
  let nightEnd;

  if(
    shouldHighlight &&
    now < sunrise &&
    previousSunsetTime
  ){
    nightStart = new Date(previousSunsetTime);
    nightEnd = sunrise;
  }else{
    nightStart = sunset;
    nightEnd = nextSunrise;
  }

  const nightDuration = nightEnd.getTime() - nightStart.getTime();
  const nightPraharMs = nightDuration / 4;
  const nightPrahar = [];

  for(let i=0;i<4;i++){
    const start = new Date(
      nightStart.getTime() + i * nightPraharMs
    );
    const end = new Date(
      nightStart.getTime() + (i+1) * nightPraharMs
    );
    const isActive = shouldHighlight &&
      now >= start && now < end;

    nightPrahar.push({
      start,
      end,
      isActive,
      type:"night"
    });
  }

  let currentPrahar = null;

  if(shouldHighlight){
    const all = [
      ...dayPrahar,
      ...nightPrahar
    ];
    currentPrahar =
      all.find(item => item.isActive) || null;
  }

  return {
    dayPrahar,
    nightPrahar,
    currentPrahar
  };
}

function getGhatiPal(
  p,
  nextSunriseTime,
  referenceNow
){
  if(!referenceNow){
    return {
      ghati:null,
      pal:null,
      error:"चयनित तिथि आज नहीं है"
    };
  }

  const sunrise = new Date(p.sunrise);
  const now = referenceNow;

  if(!nextSunriseTime){
    return {
      ghati:null,
      pal:null,
      error:"अगला सूर्योदय उपलब्ध नहीं"
    };
  }

  const nextSunrise = new Date(nextSunriseTime);
  const diffMs = now.getTime() - sunrise.getTime();

  if(diffMs < 0){
    return { ghati:0, pal:0 };
  }

  const totalMs =
    nextSunrise.getTime() - sunrise.getTime();

  const ghatiMs = totalMs / 60;
  const palMs = ghatiMs / 60;

  const ghati = Math.floor(diffMs / ghatiMs);
  const remaining = diffMs % ghatiMs;
  const pal = Math.floor(remaining / palMs);

  return { ghati:ghati + 1, pal:pal };
}

function getBhadraSuggestion(bhadraDetails){
  if(
    !bhadraDetails ||
    !bhadraDetails.isActive
  ){
    return null;
  }

  const niwas = bhadraDetails.niwas;

  if(niwas === "मृत्युलोक"){
    return {
      text:"🔴 भद्रा (पृथ्वीलोक निवास) चल रही है। परंपरानुसार मांगलिक/शुभ कार्यों के आरंभ के लिए यह समय विशेष रूप से त्याज्य माना जाता है।",
      type:"avoid"
    };
  }else if(
    niwas === "स्वर्ग" ||
    niwas === "पाताल"
  ){
    return {
      text:`🟡 भद्रा (${niwas} वास) चल रही है। भद्रा-निवास के आधार पर यह मृत्युलोक की भद्रा जितनी प्रतिकूल नहीं मानी जाती; विशेष कार्य हेतु संबंधित मुहूर्त देखना उचित है।`,
      type:"neutral"
    };
  }

  return null;
}

/* =========================================================
   NAME FUNCTIONS
   ========================================================= */
function getTithiName(value){
  if(
    typeof value === "object" &&
    value !== null
  ){
    value = value.index ??
      value.number ??
      value.value ??
      value.name;
  }

  if(typeof value === "number"){
    return (
      tithiHindi[value] ||
      tithiHindi[value-1] ||
      "—"
    );
  }

  return (
    tithiHindi[value] ||
    value ||
    "—"
  );
}

function getNakshatraName(value){
  if(
    typeof value === "object" &&
    value !== null
  ){
    value = value.index ??
      value.number ??
      value.value ??
      value.name;
  }

  if(typeof value === "number"){
    return (
      nakshatraHindi[value] ||
      nakshatraHindi[value-1] ||
      "—"
    );
  }

  return (
    nakshatraHindi[value] ||
    value ||
    "—"
  );
}

function getYogaName(value){
  if(
    typeof value === "object" &&
    value !== null
  ){
    value = value.index ??
      value.number ??
      value.value ??
      value.name;
  }

  if(typeof value === "number"){
    return (
      yogaHindi[value] ||
      yogaHindi[value-1] ||
      "—"
    );
  }

  return (
    yogaHindi[value] ||
    value ||
    "—"
  );
}

function getSimpleHindi(value,map){
  if(
    value === null ||
    value === undefined
  ){
    return "—";
  }

  if(typeof value === "object"){
    value = value.name ??
      value.value ??
      value.index ??
      value.number;
  }

  return (
    map[value] ||
    value ||
    "—"
  );
}

/* --- NEW: RASHI HELPER (safe for library object or number) --- */
function getRashiHindi(rashi){
  if(!rashi) return "—";
  if(typeof rashi === "number"){
    return rashiHindi[rashi] || "—";
  }
  if(typeof rashi === "object"){
    const idx = rashi.index ?? rashi.number ?? rashi.value;
    if(typeof idx === "number" && rashiHindi[idx]){
      return rashiHindi[idx];
    }
    return rashi.name || "—";
  }
  return rashiHindi[rashi] || String(rashi) || "—";
}

/* --- NEW: MASA HELPER (handles object, isAdhika, case-insensitive fallback) --- */
function getMasaHindi(masa){
  if(!masa) return "—";

  let name = "";
  let isAdhika = false;

  if(typeof masa === "object"){
    name = masa.name ?? masa.value ?? "";
    isAdhika = masa.isAdhika === true;
  } else {
    name = String(masa);
  }

  if(!name) return "—";

  // exact match
  let hindiName = masaHindi[name];

  // case-insensitive fallback
  if(!hindiName){
    const lowerName = name.toLowerCase();
    for(const [key, val] of Object.entries(masaHindi)){
      if(key.toLowerCase() === lowerName){
        hindiName = val;
        break;
      }
    }
  }

  hindiName = hindiName || name;

  return isAdhika ? `अधिक ${hindiName}` : hindiName;
}

/* =========================================================
   CITY SEARCH
   ========================================================= */
let citySearchAbortController = null;

function debounce(fn, delay){
  let timer = null;
  return function(...args){
    if(timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

async function performCitySearch(){
  const q = cityInput.value.trim();

  if(q.length < 2){
    alert(
      "कम से कम 2 अक्षर शहर का नाम लिखें।"
    );
    return;
  }

  if(citySearchAbortController){
    citySearchAbortController.abort();
  }

  citySearchAbortController = new AbortController();

  suggestions.innerHTML =
    `<div class="loading">🔎 शहर खोजा जा रहा है...</div>`;

  try{
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&accept-language=hi&q=" +
      encodeURIComponent(q);

    const response = await fetch(
      url,
      {
        headers:{
          "Accept":"application/json"
        },
        signal: citySearchAbortController.signal
      }
    );

    if(response.status === 429){
      throw new Error("RATE_LIMIT");
    }

    if(!response.ok){
      throw new Error("HTTP_" + response.status);
    }

    const places = await response.json();

    if(!places.length){
      suggestions.innerHTML =
        `<div class="error">❌ शहर नहीं मिला। दूसरा नाम आज़माएँ।</div>`;
      return;
    }

    suggestions.innerHTML = "";

    places.forEach(place => {
      const div =
        document.createElement("div");

      div.className = "city";

      div.textContent =
        "📍 " + place.display_name;

      div.onclick = () =>
        selectCity(place);

      suggestions.appendChild(div);
    });

  }catch(error){
    if(error.name === "AbortError"){
      return;
    }

    console.error(error);

    let msg =
      "❌ शहर खोजने में समस्या हुई। कृपया Internet connection जाँचें।";

    if(error.message === "RATE_LIMIT"){
      msg =
        "❌ बहुत अधिक खोजें की गईं। कृपया कुछ क्षण रुककर पुनः प्रयास करें।";
    }else if(error.message && error.message.startsWith("HTTP_")){
      msg =
        "❌ सर्वर से प्रतिक्रिया नहीं मिली। कृपया कुछ देर बाद प्रयास करें।";
    }

    suggestions.innerHTML =
      `<div class="error">${msg}</div>`;
  }
}

window.searchCity = debounce(performCitySearch, 500);

/* =========================================================
   SELECT CITY (stores state & city for Sankalp)
   ========================================================= */
function selectCity(place){
  const addr = place.address || {};

  const state = (
    addr.state ||
    addr.state_district ||
    addr.region ||
    ""
  ).trim();

  const city = (
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    addr.municipality ||
    place.name ||
    ""
  ).trim();

  selectedLocation = {
    name: place.display_name,
    lat: Number(place.lat),
    lon: Number(place.lon),
    elevation: 0,
    state: state,
    city: city
  };

  cityInput.value =
    place.name ||
    place.display_name;

  selectedCity.style.display = "block";
  selectedCity.textContent =
    "✅ चुना गया स्थान: " +
    place.display_name;
  suggestions.innerHTML = "";

  try{
    localStorage.setItem(
      "ohdPanchangLocation",
      JSON.stringify(selectedLocation)
    );
  }catch(e){}

  calculatePanchang();
}

/* =========================================================
   DEFAULT PITHORAGARH
   ========================================================= */
const defaultPithoragarh = {
  name:"पिथौरागढ़, उत्तराखंड, भारत",
  lat:29.5828,
  lon:80.2182,
  elevation:1650,
  state:"उत्तराखंड",
  city:"पिथौरागढ़"
};

try{
  const saved = localStorage.getItem(
    "ohdPanchangLocation"
  );

  if(saved){
    selectedLocation = JSON.parse(saved);

    selectedCity.style.display = "block";

    selectedCity.textContent =
      "💾 पिछला चुना गया स्थान: " +
      selectedLocation.name;
  }else{
    selectedLocation =
      defaultPithoragarh;

    selectedCity.style.display = "block";

    selectedCity.textContent =
      "📍 डिफ़ॉल्ट स्थान: " +
      selectedLocation.name;

    localStorage.setItem(
      "ohdPanchangLocation",
      JSON.stringify(selectedLocation)
    );
  }
}catch(e){
  selectedLocation =
    defaultPithoragarh;

  selectedCity.style.display = "block";

  selectedCity.textContent =
    "📍 डिफ़ॉल्ट स्थान: " +
    selectedLocation.name;
}

/* =========================================================
   FORMAT FUNCTIONS
   ========================================================= */
function formatTime(value){
  if(!value) return "—";

  try{
    return new Date(value).toLocaleTimeString(
      "hi-IN",
      {
        hour:"2-digit",
        minute:"2-digit",
        hour12:true
      }
    );
  }catch(e){
    return "—";
  }
}

function formatTimeRange(start,end){
  if(!start || !end) return "—";

  return (
    `${formatTime(start)} से ${formatTime(end)} तक`
  );
}

function formatDateTimeHindi(value){
  if(!value) return "—";

  try{
    const d = new Date(value);

    const date =
      d.toLocaleDateString(
        "hi-IN",
        {
          day:"numeric",
          month:"long"
        }
      );

    const time =
      d.toLocaleTimeString(
        "hi-IN",
        {
          hour:"2-digit",
          minute:"2-digit",
          hour12:true
        }
      );

    return date + ", " + time;
  }catch(e){
    return "—";
  }
}

/* =========================================================
   SAMVAT PARTS
   ========================================================= */

const samvatsaraHindiMap = {
  Prabhava:"प्रभव", Vibhava:"विभव", Shukla:"शुक्ल", Pramoda:"प्रमोद",
  Prajapati:"प्रजापति", Angirasa:"आंगिरस", Shrimukha:"श्रीमुख", Bhava:"भाव",
  Yuva:"युवा", Dhata:"धाता", Ishvara:"ईश्वर", Bahudhanya:"बहुधान्य",
  Pramathi:"प्रमाथी", Vikrama:"विक्रम", Vrisha:"वृष", Chitrabhanu:"चित्रभानु",
  Svabhanu:"स्वभानु", Tarana:"तारण", Parthiva:"पार्थिव", Vyaya:"व्यय",
  Sarvajit:"सर्वजित", Sarvadhari:"सर्वधारी", Virodhi:"विरोधी", Vikrita:"विकृति",
  Khara:"खर", Nandana:"नंदन", Vijaya:"विजय", Jaya:"जय", Manmatha:"मन्मथ",
  Durmukha:"दुर्मुख", Hevilambi:"हेमलंब", Vilambi:"विलंबी", Vikari:"विकारी",
  Sharvari:"शार्वरी", Plava:"प्लव", Shubhakrit:"शुभकृत", Shobhana:"शोभन",
  Krodhi:"क्रोधी", Vishvavasu:"विश्वावसु", Parabhava:"पराभव", Plavanga:"प्लवंग",
  Kilaka:"कीलक", Saumya:"सौम्य", Sadharana:"साधारण", Virodhikrit:"विरोधकृत",
  Paridhavi:"परिधावी", Pramadin:"प्रमादी", Ananda:"आनंद", Rakshasa:"राक्षस",
  Nala:"नल", Pingala:"पिंगल", Kalayukti:"कालयुक्ति", Siddharthi:"सिद्धार्थी",
  Raudra:"रौद्र", Durmati:"दुर्मति", Dundubhi:"दुन्दुभि", Rudhirodgari:"रुधिरोद्गारी",
  Raktakshi:"रक्ताक्षी", Krodhana:"क्रोधन", Kshaya:"क्षय"
};

const samvatsaraList = Object.values(samvatsaraHindiMap);

function getSamvatParts(p) {
  const s = p.samvat;

  if (!s) {
    return { year: null, name: null };
  }

  const year = Number(s.vikram);

  if (!Number.isFinite(year)) {
    return {
      year: s.vikram || null,
      name: null
    };
  }

  /*
   * OurHinduDharm tradition fix:
   * Vikram Samvat 2083 = Raudra (रौद्र)
   * 
   * Formula: (Vikram year + 10) % 60
   * Calculation for 2083: (2083 + 10) % 60 = 2093 % 60 = 53
   * Index 53 in array = "रौद्र"
   */
  const index = (year + 10) % 60;
  const name = samvatsaraList[index];

  return {
    year,
    name: name || null
  };
}

function getSamvat(p) {
  const parts = getSamvatParts(p);

  if (!parts.year && !parts.name) {
    return "उपलब्ध नहीं";
  }

  const namePart = parts.name ? " (" + parts.name + ")" : "";

  return "विक्रम संवत् " + (parts.year || "—") + namePart;
}
/* =========================================================
   SANSKRIT CASE-FORM HELPERS
   ========================================================= */
function toAyanaForm(v){
  const s = String(v || "").trim();

  if(!s || s === "—") return "";
  if(/दक्षिणायन/.test(s)) return "सूर्य दक्षिणायने";
  if(/उत्तरायण/.test(s)) return "सूर्य उत्तरायणे";
  return s.replace(/अयने\s*$/, "").replace(/अयन\s*$/, "").trim() + "े";
}

function toRituForm(v){
  const s = String(v || "").trim();
  if(!s || s === "—") return "";
  const base = s.replace(/ऋतौ\s*$/, "").replace(/ऋतु\s*$/, "").trim();
  return base ? base + " ऋतौ" : "";
}

function toMasaForm(v){
  const s = String(v || "").trim();
  if(!s || s === "—") return "";
  const base = s.replace(/मासे\s*$/, "").replace(/मास\s*$/, "").trim();
  return base ? base + " मासे" : "";
}

function toPakshaForm(v){
  const s = String(v || "").trim();
  if(!s || s === "—") return "";
  const base = s.replace(/पक्षे\s*$/, "").replace(/पक्ष\s*$/, "").trim();
  return base ? base + " पक्षे" : "";
}

const tithiSanskritMap = {
  "प्रथमा": "प्रतिपदि तिथौ",
  "प्रतिपदा": "प्रतिपदि तिथौ",
  "द्वितीया": "द्वितीयायाम् तिथौ",
  "तृतीया": "तृतीयायाम् तिथौ",
  "चतुर्थी": "चतुर्थ्याम् तिथौ",
  "पञ्चमी": "पञ्चम्याम् तिथौ",
  "पंचमी": "पञ्चम्याम् तिथौ",
  "षष्ठी": "षष्ठ्याम् तिथौ",
  "सप्तमी": "सप्तम्याम् तिथौ",
  "अष्टमी": "अष्टम्याम् तिथौ",
  "नवमी": "नवम्याम् तिथौ",
  "दशमी": "दशम्याम् तिथौ",
  "एकादशी": "एकादश्याम् तिथौ",
  "द्वादशी": "द्वादश्याम् तिथौ",
  "त्रयोदशी": "त्रयोदश्याम् तिथौ",
  "चतुर्दशी": "चतुर्दश्याम् तिथौ",
  "पूर्णिमा": "पूर्णिमायाम् तिथौ",
  "पौर्णमासी": "पौर्णमास्याम् तिथौ",
  "अमावस्या": "अमावास्यायाम् तिथौ",
  "अमावास्या": "अमावास्यायाम् तिथौ"
};

function toTithiForm(v){
  const s = String(v || "").trim();
  if(!s || s === "—") return "";

  const base = s.replace(/तिथौ\s*$/, "").replace(/तिथि\s*$/, "").trim();

  if(tithiSanskritMap[base]) {
    return tithiSanskritMap[base];
  }

  return base;
}

function toNakshatraForm(v){
  const s = String(v || "").trim();
  if(!s || s === "—") return "";
  const base = s.replace(/नक्षत्रे\s*$/, "").replace(/नक्षत्र\s*$/, "").trim();
  return base ? base + " नक्षत्रे" : "";
}

function toYogaForm(v){
  const s = String(v || "").trim();
  if(!s || s === "—") return "";
  const base = s.replace(/योगे\s*$/, "").replace(/योग\s*$/, "").trim();
  return base ? base + " योगे" : "";
}

function toKaranaForm(v){
  const s = String(v || "").trim();
  if(!s || s === "—") return "";
  const base = s.replace(/करणे\s*$/, "").replace(/करण\s*$/, "").trim();
  return base ? base + " करणे" : "";
}


function toVaraForm(v){
  const map = {
    "रविवार":"रविवासरे", "सोमवार":"सोमवासरे", "मंगलवार":"भौमवासरे",
    "बुधवार":"बुधवासरे", "गुरुवार":"गुरुवासरे", "शुक्रवार":" भृगुवासरे",
    "शनिवार":"शनिवासरे"
  };

  const s = String(v || "").trim();
  if(!s || s === "—") return "";
  return map[s] || (s + "वासरे");
}

function toSamvatForm(parts){
  if(!parts) return "";

  if(parts.name && parts.name !== "—"){
    return parts.name + "नाम्नि संवत्सरे";
  }
  if(parts.year){
    return "विक्रमसंवत्सरे " + parts.year;
  }
  return "";
}

/* =========================================================
   LOCATION FOR SANKALP — only state + city (no full address)
   ========================================================= */
function extractStateCity(loc){
  if(!loc) return { state:"", city:"" };

  let state = String(loc.state || "").trim();
  let city = String(loc.city || "").trim();

  if(state && city) return { state, city };

  const raw = String(loc.name || "").trim();
  const parts = raw.split(",").map(s => s.trim()).filter(Boolean);

  if(!parts.length) return { state, city };

  if(!city && parts[0]) city = parts[0];

  if(!state && parts.length >= 2){
    const countryWords = [
      "india","भारत","nepal","नेपाल",
      "bhutan","भूटान","bangladesh","बांग्लादेश",
      "pakistan","पाकिस्तान","sri lanka","श्रीलंका",
      "china","चीन"
    ];

    for(let i = parts.length - 1; i >= 0; i--){
      const rawPart = parts[i];
      const p = rawPart.toLowerCase();

      if(countryWords.some(c => p === c || p.includes(c))) continue;
      if(/^\d+$/.test(rawPart.replace(/\s+/g, ""))) continue;

      if(
        /\b(district|tehsil|taluka|taluk|subdistrict|sub-district|mandal|block|pargana)\b/i.test(rawPart) ||
        /(जिला|तहसील|तालुका|मंडल|ब्लॉक|परगना)/.test(rawPart)
      ) continue;

      state = rawPart;
      break;
    }
  }

  return { state, city };
}
   
function formatSankalpLocation(loc){
  if(!loc) return "";

  const { state, city } = extractStateCity(loc);

  if(state && city && state === city)
  return city + "-नगरे";

if(state && city)
  return state + "-राज्यान्तर्गते " + city + "-नगरे";

if(state)
  return state + "-राज्ये";

if(city)
  return city + "-नगरे";
  return "";
}

/* =========================================================
   KAAL / PRAHAR FOR SANKALP
   ========================================================= */
function getCurrentKaalPrahar(p, praharData, referenceNow){
  if(!referenceNow) return { kaal:"", praharName:"" };

  const sunrise = new Date(p.sunrise);
  const sunset = new Date(p.sunset);
  const now = referenceNow;

  let kaal = "";

  if(now >= sunrise && now < sunset){
    const dayMs = sunset.getTime() - sunrise.getTime();
    const fromSunrise = now.getTime() - sunrise.getTime();

    if(fromSunrise < dayMs/4) kaal = "प्रातः";
    else if(fromSunrise < 3*dayMs/4) kaal = "मध्याह्न";
    else kaal = "सायं";
  } else {
    kaal = "रात्रि";
  }

  let praharName = "";

  if(praharData){
    const dayActive = praharData.dayPrahar.find(pr => pr.isActive);
    const nightActive = praharData.nightPrahar.find(pr => pr.isActive);

    const names = ["प्रथम", "द्वितीय", "तृतीय", "चतुर्थ"];

    if(dayActive){
      const idx = praharData.dayPrahar.indexOf(dayActive);
      if(idx >= 0 && idx < 4) praharName = names[idx];
    }
    else if(nightActive){
      const idx = praharData.nightPrahar.indexOf(nightActive);
      if(idx >= 0 && idx < 4) praharName = names[idx];
    }
  }

  return { kaal, praharName };
}

/* =========================================================
   SANKALP TYPE — AUTO SANDHYA
   ========================================================= */
function getAutoSandhyaType(){
  const isToday = (dateInput.value === todayString());
  if(!isToday) return "pratah";

  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  if(minutes >= 4*60 && minutes < 8*60) return "pratah";
  if(minutes >= 11*60+30 && minutes < 13*60+30) return "madhyahna";
  if(minutes >= 17*60+30 && minutes < 19*60+30) return "sayam";
  return "pratah";
}

/* =========================================================
   KARMA PHRASE (WITHOUT final verb & without अहं)
   ========================================================= */
function getKarmaPhrase(){
  const st = sankalpState;

  switch(st.type){
    case "sandhya": {
      const dev =
        st.sandhyaDevta === "अन्य"
          ? (String(st.sandhyaDevtaCustom || "").trim() || "श्रीपरमेश्वर")
          : st.sandhyaDevta;

      const timeMap = {
        pratah:"प्रातः", madhyahna:"मध्याह्न", sayam:"सायं"
      };

      const time = timeMap[st.sandhyaType] || "प्रातः";

      return `ममोपात्त-समस्त-दुरितक्षयद्वारा ${dev} प्रीत्यर्थं ${time}-संध्योपासन-कर्म`;
    }

    case "daan": {
      const dev =
        st.daanDevta === "अन्य"
          ? (String(st.daanDevtaCustom || "").trim() || "श्रीपरमेश्वर")
          : st.daanDevta;

      const item =
        st.daanItem === "अन्य"
          ? (String(st.daanItemCustom || "").trim() || "अन्न")
          : st.daanItem;

      return `मम पूर्वजन्मतथैतज्जन्मकृत-पापक्षयार्थं, ${st.daanKamna}, ${dev} प्रीत्यर्थं, यथाशक्ति ${item} दानं`;
    }

    case "tarpana": {
      const act =
        st.tarpanaType === "ekaparvan"
          ? "एकपार्वण-श्राद्ध-कर्म"
          : "तिलाञ्जलि-तर्पणम्";

      return `मम समस्तपितृणां तृप्त्यर्थं, अक्षयतृप्तिलोकप्राप्तये, ${act}`;
    }

    case "rudrabhishek": {
      const dravya =
        st.rudraDravya === "अन्य"
          ? (String(st.rudraDravyaCustom || "").trim() || "जल")
          : st.rudraDravya;

      const path =
        st.rudraPath === "अन्य"
          ? (String(st.rudraPathCustom || "").trim() || "रुद्रसूक्तेन")
          : st.rudraPath;

      if(st.rudraMode === "sakam"){
        return `ममात्मनः सर्वारिष्टनिरसनपूर्वकं सर्वपापक्षयार्थं मनसेप्सितफलप्राप्तिपूर्वकं श्रुतिस्मृतिपुराणोक्तफलप्राप्त्यर्थं दीर्घायुरारोग्यैश्वर्यादिवृद्ध्यर्थं लिङ्गोपरि यथोपचारैः श्रीसाम्बसदाशिवपूजनपूर्वकं ${dravya}धारया ${path} रुद्राभिषेककर्म`;
      }

      return `श्रीसाम्बसदाशिवप्रीत्यर्थं लिङ्गोपरि यथोपचारैः श्रीसाम्बसदाशिवपूजनपूर्वकं ${dravya}धारया ${path} रुद्राभिषेककर्म`;
    }

    case "satyanarayan": {
      if(st.satyaMode === "sakam"){
        return `श्रीसत्यनारायण-विष्णुप्रीति द्वारा ममात्मनः सर्वारिष्टनिरसनपूर्वकं मनोवांछितफलप्राप्त्यर्थं सकुटुम्बस्य सुखशान्तिसमृद्धिप्राप्तये श्रीसत्यनारायण-व्रतकथा-पठनं/श्रवणं पूजनं च`;
      }

      return `श्रीविष्णुप्रीत्यर्थे श्रीसत्यनारायणव्रतकथाश्रवणं पूजनं च`;
    }

    case "puja": {
      const dev = String(st.pujaDevta || "").trim() || "श्रीपरमेश्वर";

      return `मम ${st.pujaKamna} ${dev} पूजनं`;
    }

    case "vrat": {
      const vratName =
        st.vratName === "अन्य"
          ? (String(st.vratNameCustom || "").trim() || "व्रत")
          : st.vratName;

      const dev = String(st.vratDevta || "").trim() || "श्रीपरमेश्वर";

      if(st.vratMode === "vrat"){
        return `मम कायिक-वाचिक-मानसिक-पापनिवारणार्थं, ${dev} प्रीत्यर्थं ${vratName} व्रत`;
      }
      else if(st.vratMode === "upavas"){
        return `मम सर्वपापक्षयार्थं, ${dev} प्रीत्यर्थं ${vratName} उपवासं`;
      }
      else if(st.vratMode === "nirjal"){
        return `${dev} प्रीत्यर्थं ${vratName} निर्जल व्रतं`;
      }

      return "मम सकलदुरितक्षयपूर्वकं श्रीपरमेश्वरप्रीत्यर्थं यथाशक्ति पूजन-जपादिकं";
    }
  }
}

/* =========================================================
   IDENTITY CONSTRUCTION
   ========================================================= */
function buildYajmanIdentity(){
  const gotra = String(sankalpState.gotra || "").trim();
  const naam = String(sankalpState.naam || "").trim();
  const varna = sankalpState.varna || "";

  const gotraPart = gotra
    ? (gotra + "गोत्रोत्पन्नः")
    : "अमुकगोत्रोत्पन्नः";

  const naamPart = naam || "अमुकः";

  const varnaPart =
    (varna && varna !== "none")
      ? (" " + varna)
      : "";

  return (
    gotraPart +
    " " +
    naamPart +
    varnaPart
  );
}

function buildBrahminIdentity(){
  const bGotra = String(sankalpState.brahminGotra || "").trim();
  const bNaam = String(sankalpState.brahminNaam || "").trim();

  const gotraPart = bGotra
    ? (bGotra + "गोत्रोत्पन्नेन")
    : "अमुकगोत्रोत्पन्नेन";

  const naamPart = bNaam
    ? (bNaam + "शर्मणा")
    : "अमुकशर्मणा";

  return (
    gotraPart +
    " " +
    naamPart +
    " ब्राह्मणेन"
  );
}

/* =========================================================
   SANKALP TEXT BUILDER
   ========================================================= */
function buildSankalpText(){
  if(!currentSankalpContext){
    return "पंचांग की गणना के बाद संकल्प दिखाया जाएगा।";
  }

  const ctx = currentSankalpContext;

  const samvatForm = toSamvatForm(ctx.samvatParts);
  const ayanaForm = toAyanaForm(ctx.ayana);
  const rituForm = toRituForm(ctx.ritu);
  const masaForm = toMasaForm(ctx.masa);
  const pakshaForm = toPakshaForm(ctx.paksha);
  const tithiForm = toTithiForm(ctx.tithi);
  const varaForm = toVaraForm(ctx.vara);
  const nakshatraForm = toNakshatraForm(ctx.nakshatra);
  const yogaForm = toYogaForm(ctx.yoga);
  const karanaForm = toKaranaForm(ctx.karana);
 
const sunRashiForm = getRashiHindi(
  ctx.panchang?.sunRashi
);

const moonRashiForm = getRashiHindi(
  ctx.panchang?.moonRashi
);

const suryaSthitiForm =
  sunRashiForm && sunRashiForm !== "—"
    ? `${sunRashiForm} राशि स्थितो सूर्यो`
    : "";

const chandraSthitiForm =
  moonRashiForm && moonRashiForm !== "—"
    ? `${moonRashiForm} राशि स्थितो चन्द्रो`
    : "";

  const locationForm = formatSankalpLocation(ctx.location);

  const kaalPrahar = getCurrentKaalPrahar(
    ctx.panchang,
    ctx.praharData,
    ctx.referenceNow
  );

  const kaalForm = kaalPrahar.kaal
    ? (kaalPrahar.kaal + " काले")
    : "";

  const praharForm = kaalPrahar.praharName
    ? (kaalPrahar.praharName + " प्रहरे")
    : "";

  const yajmanId = buildYajmanIdentity();
  const karmaPhrase = getKarmaPhrase();

  const parts = [];

  parts.push(
    "श्रीगणपतिर्जयति। श्रीविष्णुर्विष्णुर्विष्णुः। ॐ तत्सत्"
  );

  parts.push(
    "अद्य श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य श्रीब्रह्मणोऽह्नि द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे, अष्टाविंशतितमे कलियुगे, कलिप्रथमचरणे जम्बूद्वीपे भरतखण्डे भारतवर्षे आर्यावर्तान्तर्गत पुण्यभूप्रदेशे"
  );

  if(locationForm) parts.push(locationForm);
  if(samvatForm) parts.push(samvatForm);
  if(ayanaForm) parts.push(ayanaForm);
  if(rituForm) parts.push(rituForm);
  if(masaForm) parts.push(masaForm);
  if(pakshaForm) parts.push(pakshaForm);
  if(tithiForm) parts.push(tithiForm);
  if(varaForm) parts.push(varaForm);
  if(nakshatraForm) parts.push(nakshatraForm);
  if(yogaForm) parts.push(yogaForm);
  if(karanaForm) parts.push(karanaForm);
if(suryaSthitiForm) parts.push(suryaSthitiForm);
if(chandraSthitiForm) parts.push(chandraSthitiForm);
  if(kaalForm) parts.push(kaalForm);
  if(praharForm) parts.push(praharForm);

  const useAvagraha = ["दासो", "गुप्तो"];
const ahamWord = useAvagraha.includes(sankalpState.varna)
  ? "ऽहं"
  : " अहं";


  const isRestrictedType =
    restrictedSankalpTypes.includes(sankalpState.type);

  let identity = "";

  if(!isRestrictedType && sankalpState.kartaMode === "brahmin"){
    const brahminId = buildBrahminIdentity();
    identity =
      yajmanId +
      ahamWord +
      " " +
      brahminId;
  } else {
    identity =
      yajmanId +
      ahamWord;
  }

  parts.push(identity);

  const verb =
    (!isRestrictedType && sankalpState.kartaMode === "brahmin")
      ? "कारयिष्ये"
      : "करिष्ये";

  const tail =
    karmaPhrase +
    " " +
    verb +
    "।";

  return (
    parts.join(", ") +
    " " +
    tail
  );
}

/* =========================================================
   SANKALP CONTROLS — render / update
   ========================================================= */
const restrictedSankalpTypes = ["sandhya", "daan", "tarpana", "vrat"];

function escapeHtmlAttr(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function renderSankalpControls(){
  const container = document.getElementById(
    "sankalpControls"
  );

  if(!container) return;

  const typeLabels = {
    sandhya: "संध्या",
    daan: "दान",
    tarpana: "तर्पण / श्राद्ध",
    rudrabhishek: "रुद्राभिषेक",
    satyanarayan: "सत्यनारायण",
    puja: "सामान्य पूजा",
    vrat: "व्रत"
  };

  const buttonsHtml = Object.keys(typeLabels)
    .map(t => {
      const active =
        sankalpState.type === t
          ? " active"
          : "";

      return `<button type="button" class="sankalp-type-btn${active}" data-type="${t}">${typeLabels[t]}</button>`;
    })
    .join("");

  const isRestrictedType =
    restrictedSankalpTypes.includes(sankalpState.type);

  if(isRestrictedType){
    sankalpState.kartaMode = "self";
  }

  const kartaToggleHtml = isRestrictedType
    ? `<div class="karta-toggle">
         <label><input type="radio" name="kartaMode" value="self" checked/> स्वयं (करिष्ये)</label>
       </div>`
    : `<div class="karta-toggle">
         <label><input type="radio" name="kartaMode" value="self" ${sankalpState.kartaMode === "self" ? "checked" : ""}/> स्वयं (करिष्ये)</label>
         <label><input type="radio" name="kartaMode" value="brahmin" ${sankalpState.kartaMode === "brahmin" ? "checked" : ""}/> ब्राह्मण द्वारा (कारयिष्ये)</label>
       </div>`;

  container.innerHTML = `
    <div class="sankalp-types">${buttonsHtml}</div>
    <div id="sankalpTypeInputs"></div>
    <div class="sankalp-personal three-col">
      <div class="sp-item">
        <label for="sankalpGotra">गोत्र</label>
        <input id="sankalpGotra" type="text" placeholder="जैसे कश्यप, भारद्वाज" value="${escapeHtmlAttr(sankalpState.gotra)}" autocomplete="off"/>
      </div>
      <div class="sp-item">
        <label for="sankalpNaam">आपका नाम</label>
        <input id="sankalpNaam" type="text" placeholder="जैसे हिमांशु" value="${escapeHtmlAttr(sankalpState.naam)}" autocomplete="off"/>
      </div>
      <div class="sp-item">
        <label for="sankalpVarna">वर्ण</label>
        <select id="sankalpVarna">
          <option value="शर्मा" ${sankalpState.varna === "शर्मा" ? "selected" : ""}>शर्मा (ब्राह्मण)</option>
          <option value="वर्मा" ${sankalpState.varna === "वर्मा" ? "selected" : ""}>वर्मा (क्षत्रिय)</option>
          <option value="गुप्तो" ${sankalpState.varna === "गुप्तो" ? "selected" : ""}>गुप्त (वैश्य)</option>
          <option value="दासो" ${sankalpState.varna === "दासो" ? "selected" : ""}>दास (शूद्र)</option>
          <option value="none" ${sankalpState.varna === "none" ? "selected" : ""}>कुछ न लगायें</option>
        </select>
      </div>
    </div>
    ${kartaToggleHtml}
    <div id="brahminFieldsWrap"></div>
  `;

  container
    .querySelectorAll(".sankalp-type-btn")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const t = btn.dataset.type;

        if(
          !t ||
          t === sankalpState.type
        ) return;

        sankalpState.type = t;

        if(restrictedSankalpTypes.includes(t)){
          sankalpState.kartaMode = "self";
        }

        container
          .querySelectorAll(
            ".sankalp-type-btn"
          )
          .forEach(b => {
            b.classList.toggle(
              "active",
              b === btn
            );
          });

        renderSankalpControls();
        updateSankalpText();
      });
    });

  const gotraEl = document.getElementById(
    "sankalpGotra"
  );

  const naamEl = document.getElementById(
    "sankalpNaam"
  );

  const varnaEl = document.getElementById(
    "sankalpVarna"
  );

  if(gotraEl){
    gotraEl.addEventListener(
      "input",
      e => {
        sankalpState.gotra =
          e.target.value;
        updateSankalpText();
      }
    );
  }

  if(naamEl){
    naamEl.addEventListener(
      "input",
      e => {
        sankalpState.naam =
          e.target.value;
        updateSankalpText();
      }
    );
  }

  if(varnaEl){
    varnaEl.addEventListener(
      "change",
      e => {
        sankalpState.varna =
          e.target.value;
        updateSankalpText();
      }
    );
  }

  container
    .querySelectorAll(
      'input[name="kartaMode"]'
    )
    .forEach(r => {
      r.addEventListener("change", e => {
        if(e.target.checked){
          sankalpState.kartaMode =
            e.target.value;

          renderBrahminFields();
          updateSankalpText();
        }
      });
    });

  renderSankalpTypeInputs();
  renderBrahminFields();
}

function renderBrahminFields(){
  const wrap = document.getElementById(
    "brahminFieldsWrap"
  );

  if(!wrap) return;

  if(sankalpState.kartaMode !== "brahmin"){
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = `
    <div class="brahmin-fields">
      <div class="sp-item">
        <label for="sankalpBrahminGotra">ब्राह्मण का गोत्र</label>
        <input id="sankalpBrahminGotra" type="text" placeholder="जैसे कश्यप" value="${escapeHtmlAttr(sankalpState.brahminGotra)}" autocomplete="off"/>
      </div>
      <div class="sp-item">
        <label for="sankalpBrahminNaam">ब्राह्मण का नाम</label>
        <input id="sankalpBrahminNaam" type="text" placeholder="जैसे राम" value="${escapeHtmlAttr(sankalpState.brahminNaam)}" autocomplete="off"/>
      </div>
    </div>
  `;

  const gEl = document.getElementById(
    "sankalpBrahminGotra"
  );

  const nEl = document.getElementById(
    "sankalpBrahminNaam"
  );

  if(gEl){
    gEl.addEventListener("input", e => {
      sankalpState.brahminGotra =
        e.target.value;
      updateSankalpText();
    });
  }

  if(nEl){
    nEl.addEventListener("input", e => {
      sankalpState.brahminNaam =
        e.target.value;
      updateSankalpText();
    });
  }
}

function renderSankalpTypeInputs(){
  const container = document.getElementById(
    "sankalpTypeInputs"
  );

  if(!container) return;

  const st = sankalpState;

  if(st.type === "sandhya"){
    container.innerHTML = `
      <div class="ti-block">
        <label class="ti-label">संध्या का समय</label>
        <div class="radio-row">
          <label><input type="radio" name="sandhyaType" value="pratah" ${st.sandhyaType==="pratah"?"checked":""}/> प्रातः संध्या</label>
          <label><input type="radio" name="sandhyaType" value="madhyahna" ${st.sandhyaType==="madhyahna"?"checked":""}/> मध्याह्न संध्या</label>
          <label><input type="radio" name="sandhyaType" value="sayam" ${st.sandhyaType==="sayam"?"checked":""}/> सायं संध्या</label>
        </div>
      </div>
      <div class="ti-block">
        <label class="ti-label">देवता</label>
        <select id="sankalpSandhyaDevta">
          <option value="श्रीगायत्री" ${st.sandhyaDevta==="श्रीगायत्री"?"selected":""}>श्रीगायत्री</option>
          <option value="श्रीपरमेश्वर" ${st.sandhyaDevta==="श्रीपरमेश्वर"?"selected":""}>श्रीपरमेश्वर</option>
          <option value="अन्य" ${st.sandhyaDevta==="अन्य"?"selected":""}>अन्य देवता का नाम</option>
        </select>
        ${st.sandhyaDevta==="अन्य" ? `<input type="text" id="sankalpSandhyaDevtaCustom" placeholder="देवता का नाम" value="${escapeHtmlAttr(st.sandhyaDevtaCustom)}" autocomplete="off" style="margin-top:6px;"/>` : ""}
      </div>
    `;

    container
      .querySelectorAll(
        'input[name="sandhyaType"]'
      )
      .forEach(r => {
        r.addEventListener("change", e => {
          if(e.target.checked){
            st.sandhyaType =
              e.target.value;
            updateSankalpText();
          }
        });
      });

    const sd = document.getElementById(
      "sankalpSandhyaDevta"
    );

    if(sd){
      sd.addEventListener("change", e => {
        st.sandhyaDevta =
          e.target.value;
        renderSankalpTypeInputs();
        updateSankalpText();
      });
    }

    const sdc = document.getElementById(
      "sankalpSandhyaDevtaCustom"
    );

    if(sdc){
      sdc.addEventListener("input", e => {
        st.sandhyaDevtaCustom =
          e.target.value;
        updateSankalpText();
      });
    }

  } else if(st.type === "daan"){
    container.innerHTML = `
      <div class="ti-block">
        <label class="ti-label">देवता</label>
        <select id="sankalpDaanDevta">
          <option value="नवग्रह" ${st.daanDevta==="नवग्रह"?"selected":""}>नवग्रह</option>
          <option value="श्रीपरमेश्वर" ${st.daanDevta==="श्रीपरमेश्वर"?"selected":""}>श्रीपरमेश्वर</option>
          <option value="अन्य" ${st.daanDevta==="अन्य"?"selected":""}>अन्य</option>
        </select>
        ${st.daanDevta==="अन्य" ? `<input type="text" id="sankalpDaanDevtaCustom" placeholder="देवता का नाम" value="${escapeHtmlAttr(st.daanDevtaCustom)}" autocomplete="off" style="margin-top:6px;"/>` : ""}
      </div>
      <div class="ti-block">
        <label class="ti-label">कामना</label>
        <select id="sankalpDaanKamna">
          <option value="ग्रहपीड़ानिवारणार्थं" ${st.daanKamna==="ग्रहपीड़ानिवारणार्थं"?"selected":""}>ग्रहपीड़ानिवारणार्थं</option>
          <option value="सर्वपापक्षयार्थं" ${st.daanKamna==="सर्वपापक्षयार्थं"?"selected":""}>सर्वपापक्षयार्थं</option>
          <option value="अक्षयपुण्यप्राप्तये" ${st.daanKamna==="अक्षयपुण्यप्राप्तये"?"selected":""}>अक्षयपुण्यप्राप्तये</option>
        </select>
      </div>
      <div class="ti-block">
        <label class="ti-label">दान वस्तु</label>
        <select id="sankalpDaanItem">
          <option value="अन्न" ${st.daanItem==="अन्न"?"selected":""}>अन्न</option>
          <option value="वस्त्र" ${st.daanItem==="वस्त्र"?"selected":""}>वस्त्र</option>
          <option value="गो" ${st.daanItem==="गो"?"selected":""}>गो</option>
          <option value="दीप" ${st.daanItem==="दीप"?"selected":""}>दीप</option>
          <option value="अन्य" ${st.daanItem==="अन्य"?"selected":""}>अन्य सामग्री दक्षिणा आदि </option>
        </select>
        ${st.daanItem==="अन्य" ? `<input type="text" id="sankalpDaanItemCustom" placeholder="दान सामग्री" value="${escapeHtmlAttr(st.daanItemCustom)}" autocomplete="off" style="margin-top:6px;"/>` : ""}
      </div>
    `;

    const dd = document.getElementById(
      "sankalpDaanDevta"
    );

    if(dd) dd.addEventListener("change", e => {
      st.daanDevta = e.target.value;
      renderSankalpTypeInputs();
      updateSankalpText();
    });

    const ddc = document.getElementById(
      "sankalpDaanDevtaCustom"
    );

    if(ddc) ddc.addEventListener("input", e => {
      st.daanDevtaCustom = e.target.value;
      updateSankalpText();
    });

    const dk = document.getElementById(
      "sankalpDaanKamna"
    );

    if(dk) dk.addEventListener("change", e => {
      st.daanKamna = e.target.value;
      updateSankalpText();
    });

    const di = document.getElementById(
      "sankalpDaanItem"
    );

    if(di) di.addEventListener("change", e => {
      st.daanItem = e.target.value;
      renderSankalpTypeInputs();
      updateSankalpText();
    });

    const dic = document.getElementById(
      "sankalpDaanItemCustom"
    );

    if(dic) dic.addEventListener("input", e => {
      st.daanItemCustom = e.target.value;
      updateSankalpText();
    });

  } else if(st.type === "tarpana"){
    container.innerHTML = `
      <div class="ti-block">
        <label class="ti-label">तर्पण / श्राद्ध प्रकार</label>
        <div class="radio-row">
          <label><input type="radio" name="tarpanaType" value="tilanjali" ${st.tarpanaType==="tilanjali"?"checked":""}/> तिलाञ्जलि-तर्पणम्</label>
          <label><input type="radio" name="tarpanaType" value="ekaparvan" ${st.tarpanaType==="ekaparvan"?"checked":""}/> एकपार्वण-श्राद्ध-कर्मं</label>
        </div>
      </div>
    `;

    container
      .querySelectorAll(
        'input[name="tarpanaType"]'
      )
      .forEach(r => {
        r.addEventListener("change", e => {
          if(e.target.checked){
            st.tarpanaType =
              e.target.value;
            updateSankalpText();
          }
        });
      });

  } else if(st.type === "rudrabhishek"){
    container.innerHTML = `
      <div class="ti-block">
        <label class="ti-label">कामना / Mode</label>
        <div class="radio-row">
          <label><input type="radio" name="rudraMode" value="sakam" ${st.rudraMode==="sakam"?"checked":""}/> सकाम</label>
          <label><input type="radio" name="rudraMode" value="nishkam" ${st.rudraMode==="nishkam"?"checked":""}/> निष्काम</label>
        </div>
      </div>
      <div class="ti-block">
        <label class="ti-label">अभिषेक द्रव्य</label>
        <select id="sankalpRudraDravya">
          <option value="जल" ${st.rudraDravya==="जल"?"selected":""}>जल</option>
          <option value="दुग्ध" ${st.rudraDravya==="दुग्ध"?"selected":""}>दुग्ध</option>
          <option value="पञ्चामृत" ${st.rudraDravya==="पञ्चामृत"?"selected":""}>पञ्चामृत</option>
          <option value="अन्य" ${st.rudraDravya==="अन्य"?"selected":""}>अन्य</option>
        </select>
        ${st.rudraDravya==="अन्य" ? `<input type="text" id="sankalpRudraDravyaCustom" placeholder="द्रव्य" value="${escapeHtmlAttr(st.rudraDravyaCustom)}" autocomplete="off" style="margin-top:6px;"/>` : ""}
      </div>
      <div class="ti-block">
        <label class="ti-label">पाठ / मंत्र</label>
        <select id="sankalpRudraPath">
          <option value="शिव मन्त्रेण" ${st.rudraPath==="शिव मन्त्रेण"?"selected":""}>शिव पंचाक्षरी / महामृत्युंजय मन्त्रेण</option>
          <option value="रुद्रसूक्तेन" ${st.rudraPath==="रुद्रसूक्तेन"?"selected":""}>रुद्रसूक्तेन</option>
          <option value="षडङ्गरुद्रेण" ${st.rudraPath==="षडङ्गरुद्रेण"?"selected":""}>षडङ्गरुद्रेण</option>
          <option value="रुद्रैकादशिन्या" ${st.rudraPath==="रुद्रैकादशिन्या"?"selected":""}>रुद्रैकादशिन्या</option>
          <option value="लघुरुद्रेण" ${st.rudraPath==="लघुरुद्रेण"?"selected":""}>लघुरुद्रेण</option>
          <option value="शिवस्तोत्रेण" ${st.rudraPath==="शिवस्तोत्रेण"?"selected":""}>शिवस्तोत्रेण</option>
          <option value="अन्य" ${st.rudraPath==="अन्य"?"selected":""}>अन्य</option>
        </select>
        ${st.rudraPath==="अन्य" ? `<input type="text" id="sankalpRudraPathCustom" placeholder="पाठ/मंत्र" value="${escapeHtmlAttr(st.rudraPathCustom)}" autocomplete="off" style="margin-top:6px;"/>` : ""}
      </div>
    `;

    container
      .querySelectorAll(
        'input[name="rudraMode"]'
      )
      .forEach(r => {
        r.addEventListener("change", e => {
          if(e.target.checked){
            st.rudraMode = e.target.value;
            updateSankalpText();
          }
        });
      });

    const rd = document.getElementById(
      "sankalpRudraDravya"
    );

    if(rd) rd.addEventListener("change", e => {
      st.rudraDravya = e.target.value;
      renderSankalpTypeInputs();
      updateSankalpText();
    });

    const rdc = document.getElementById(
      "sankalpRudraDravyaCustom"
    );

    if(rdc) rdc.addEventListener("input", e => {
      st.rudraDravyaCustom = e.target.value;
      updateSankalpText();
    });

    const rp = document.getElementById(
      "sankalpRudraPath"
    );

    if(rp) rp.addEventListener("change", e => {
      st.rudraPath = e.target.value;
      renderSankalpTypeInputs();
      updateSankalpText();
    });

    const rpc = document.getElementById(
      "sankalpRudraPathCustom"
    );

    if(rpc) rpc.addEventListener("input", e => {
      st.rudraPathCustom = e.target.value;
      updateSankalpText();
    });

  } else if(st.type === "satyanarayan"){
    container.innerHTML = `
      <div class="ti-block">
        <label class="ti-label">कामना / Mode</label>
        <div class="radio-row">
          <label><input type="radio" name="satyaMode" value="sakam" ${st.satyaMode==="sakam"?"checked":""}/> सकाम</label>
          <label><input type="radio" name="satyaMode" value="nishkam" ${st.satyaMode==="nishkam"?"checked":""}/> निष्काम</label>
        </div>
      </div>
    `;

    container
      .querySelectorAll(
        'input[name="satyaMode"]'
      )
      .forEach(r => {
        r.addEventListener("change", e => {
          if(e.target.checked){
            st.satyaMode = e.target.value;
            updateSankalpText();
          }
        });
      });

  } else if(st.type === "puja"){
    container.innerHTML = `
      <div class="ti-block">
        <label class="ti-label">देवता का नाम</label>
        <input type="text" id="sankalpPujaDevta" placeholder="जैसे गणेश, शिव, दुर्गा, लक्ष्मी" value="${escapeHtmlAttr(st.pujaDevta)}" autocomplete="off"/>
      </div>
      <div class="ti-block">
        <label class="ti-label">कामना</label>
        <select id="sankalpPujaKamna">
          <option value="सर्वविघ्ननिवारणपूर्वकं चतुर्विधपुरुषार्थसिद्धये" ${st.pujaKamna==="सर्वविघ्ननिवारणपूर्वकं चतुर्विधपुरुषार्थसिद्धये"?"selected":""}>सर्वविघ्ननिवारणपूर्वकं चतुर्विधपुरुषार्थसिद्धये</option>
          <option value="सर्वारिष्टशान्त्यर्थं" ${st.pujaKamna==="सर्वारिष्टशान्त्यर्थं"?"selected":""}>सर्वारिष्टशान्त्यर्थं</option>
          <option value="भगवत्प्रीत्यर्थम्" ${st.pujaKamna==="भगवत्प्रीत्यर्थम्"?"selected":""}>भगवत्प्रीत्यर्थम्</option>
          <option value="मम दीर्घायुष्यारोग्यप्राप्त्यर्थम्" ${st.pujaKamna==="मम दीर्घायुष्यारोग्यप्राप्त्यर्थम्"?"selected":""}>मम दीर्घायुष्यारोग्यप्राप्त्यर्थम् (उत्तम स्वास्थ्य और लंबी आयु हेतु)</option>
          <option value="धनधान्यसमृद्धिसुखशान्त्यैश्वर्यप्राप्त्यर्थम्" ${st.pujaKamna==="धनधान्यसमृद्धिसुखशान्त्यैश्वर्यप्राप्त्यर्थम्"?"selected":""}>धनधान्यसमृद्धिसुखशान्त्यैश्वर्यप्राप्त्यर्थम् (धन, समृद्धि, सुख-शांति और ऐश्वर्य हेतु)</option>
          <option value="पुत्रपौत्रादिवंशवृद्ध्यर्थम्" ${st.pujaKamna==="पुत्रपौत्रादिवंशवृद्ध्यर्थम्"?"selected":""}>पुत्रपौत्रादिवंशवृद्ध्यर्थम् (संतान और वंश वृद्धि हेतु)</option>
          <option value="नवग्रहपीडानिवारणपूर्वकं अनुकूलतासिद्धये" ${st.pujaKamna==="नवग्रहपीडानिवारणपूर्वकं अनुकूलतासिद्धये"?"selected":""}>नवग्रहपीडानिवारणपूर्वकं अनुकूलतासिद्धये (नवग्रह शांति व अनुकूलता हेतु)</option>
        </select>
      </div>
    `;

    const pd = document.getElementById(
      "sankalpPujaDevta"
    );

    if(pd) pd.addEventListener("input", e => {
      st.pujaDevta = e.target.value;
      updateSankalpText();
    });

    const pk = document.getElementById(
      "sankalpPujaKamna"
    );

    if(pk) pk.addEventListener("change", e => {
      st.pujaKamna = e.target.value;
      updateSankalpText();
    });

  } else if(st.type === "vrat"){
    container.innerHTML = `
      <div class="ti-block">
        <label class="ti-label">Mode</label>
        <div class="radio-row">
          <label><input type="radio" name="vratMode" value="vrat" ${st.vratMode==="vrat"?"checked":""}/> व्रत</label>
          <label><input type="radio" name="vratMode" value="upavas" ${st.vratMode==="upavas"?"checked":""}/> उपवास</label>
          <label><input type="radio" name="vratMode" value="nirjal" ${st.vratMode==="nirjal"?"checked":""}/> निर्जल</label>
        </div>
      </div>
      <div class="ti-block">
        <label class="ti-label">व्रत का नाम</label>
        <select id="sankalpVratName">
          <option value="एकादशी" ${st.vratName==="एकादशी"?"selected":""}>एकादशी</option>
          <option value="प्रदोष" ${st.vratName==="प्रदोष"?"selected":""}>प्रदोष</option>
          <option value="सोमवार" ${st.vratName==="सोमवार"?"selected":""}>सोमवार</option>
          <option value="अन्य" ${st.vratName==="अन्य"?"selected":""}>अन्य</option>
        </select>
        ${st.vratName==="अन्य" ? `<input type="text" id="sankalpVratNameCustom" placeholder="व्रत का नाम" value="${escapeHtmlAttr(st.vratNameCustom)}" autocomplete="off" style="margin-top:6px;"/>` : ""}
      </div>
      <div class="ti-block">
        <label class="ti-label">देवता का नाम</label>
        <input type="text" id="sankalpVratDevta" placeholder="जैसे विष्णु, शिव, गणेश" value="${escapeHtmlAttr(st.vratDevta)}" autocomplete="off"/>
      </div>
    `;

    container
      .querySelectorAll(
        'input[name="vratMode"]'
      )
      .forEach(r => {
        r.addEventListener("change", e => {
          if(e.target.checked){
            st.vratMode = e.target.value;
            updateSankalpText();
          }
        });
      });

    const vn = document.getElementById(
      "sankalpVratName"
    );

    if(vn) vn.addEventListener("change", e => {
      st.vratName = e.target.value;
      renderSankalpTypeInputs();
      updateSankalpText();
    });

    const vnc = document.getElementById(
      "sankalpVratNameCustom"
    );

    if(vnc) vnc.addEventListener("input", e => {
      st.vratNameCustom = e.target.value;
      updateSankalpText();
    });

    const vd = document.getElementById(
      "sankalpVratDevta"
    );

    if(vd) vd.addEventListener("input", e => {
      st.vratDevta = e.target.value;
      updateSankalpText();
    });
  }
}

function decodeHtmlEntities(str){
  if(str == null) return "";

  try{
    const doc = new DOMParser().parseFromString(
      String(str),
      "text/html"
    );
    const decoded = doc.documentElement.textContent;
    return decoded == null ? String(str) : decoded;
  }catch(e){
    return String(str);
  }
}

function updateSankalpText(){
  const el = document.getElementById(
    "sankalpText"
  );

  if(!el) return;
  el.textContent = decodeHtmlEntities(buildSankalpText());
}

/* =========================================================
   PANCHANG CALCULATE
   ========================================================= */
function calculatePanchang(){
  if(!selectedLocation){
    result.innerHTML =
      `<div class="loading">पहले अपना शहर चुनें।</div>`;
    return;
  }

  result.innerHTML =
    `<div class="loading">🕉️ पंचांग की गणना हो रही है...</div>`;

  try{
    const observer = new Observer(
      selectedLocation.lat,
      selectedLocation.lon,
      selectedLocation.elevation
    );

    const date = new Date(
      dateInput.value + "T12:00:00"
    );

    const p = getPanchangam(
      date,
      observer,
      { timezoneOffset:330 }
    );

    const referenceNow = (
      dateInput.value === todayString()
    )
      ? new Date()
      : null;

    let nextSunrise = null;

    try{
      const nextDate = new Date(date);
      nextDate.setDate(
        nextDate.getDate() + 1
      );

      const nextPanchang = getPanchangam(
        nextDate,
        observer,
        { timezoneOffset:330 }
      );

      if(
        nextPanchang &&
        nextPanchang.sunrise
      ){
        nextSunrise =
          nextPanchang.sunrise;
      }
    }catch(e){
      console.warn(
        "Next sunrise calculation failed:",
        e
      );
    }

    let previousSunset = null;

    try{
      const previousDate = new Date(date);
      previousDate.setDate(
        previousDate.getDate() - 1
      );

      const previousPanchang = getPanchangam(
        previousDate,
        observer,
        { timezoneOffset:330 }
      );

      if(
        previousPanchang &&
        previousPanchang.sunset
      ){
        previousSunset =
          previousPanchang.sunset;
      }
    }catch(e){
      console.warn(
        "Previous sunset calculation failed:",
        e
      );
    }

    window.__panchangTest = p;
    window.__nextSunrise = nextSunrise;
    window.__previousSunset = previousSunset;

    displayPanchang(
      p,
      nextSunrise,
      previousSunset,
      referenceNow
    );

  }catch(error){
    console.error(error);

    result.innerHTML = `
      <div class="error">
        ❌ पंचांग की गणना नहीं हो सकी।
        <br><br>
        <small>${error.message || error}</small>
      </div>
    `;
  }
}

/* =========================================================
   DISPLAY PANCHANG
   ========================================================= */
function displayPanchang(
  p,
  nextSunrise,
  previousSunset,
  referenceNow
){
  const date = new Date(
    dateInput.value + "T12:00:00"
  );

  const dateText = date.toLocaleDateString(
    "hi-IN",
    {
      weekday:"long",
      year:"numeric",
      month:"long",
      day:"numeric"
    }
  );

  const selectedDateObj = new Date(
    dateInput.value + "T00:00:00"
  );

  const isWednesday =
    selectedDateObj.getDay() === 3;

  const paksha = getSimpleHindi(
    p.paksha,
    pakshaHindi
  );

  const tithi = getTithiName(p.tithi);

  /* ---- TASK 2 FIX: use getMasaHindi for adhika + case-insensitive ---- */
  const masa = getMasaHindi(p.masa);

  const nakshatra =
    getNakshatraName(p.nakshatra);

  const yoga = getYogaName(p.yoga);

  const rituBySunRashi = {
    11: "वसंत ऋतु", 0: "वसंत ऋतु",
    1: "ग्रीष्म ऋतु", 2: "ग्रीष्म ऋतु",
    3: "वर्षा ऋतु", 4: "वर्षा ऋतु",
    5: "शरद ऋतु", 6: "शरद ऋतु",
    7: "हेमंत ऋतु", 8: "हेमंत ऋतु",
    9: "शिशिर ऋतु", 10: "शिशिर ऋतु"
  };

  const ritu =
    rituBySunRashi[
      p.sunRashi?.index
    ] || "—";

  const ayana = getSimpleHindi(
    p.ayana,
    ayanaHindi
  );

  const samvat = getSamvat(p);
  const samvatParts = getSamvatParts(p);

  let primaryKarana = "";

  if(
    p.karanas &&
    Array.isArray(p.karanas) &&
    p.karanas.length > 0
  ){
    const k0 = p.karanas[0];

    primaryKarana =
      karanaHindi[k0.name] ||
      k0.name ||
      "";
  }

  const moonRashiIndex =
    p.moonRashi?.index;

  const bhadra = getBhadraDetails(
    p,
    moonRashiIndex,
    referenceNow
  );

  const prahar = getPraharDetails(
    p,
    nextSunrise,
    previousSunset,
    referenceNow
  );

  const ghatiPal = getGhatiPal(
    p,
    nextSunrise,
    referenceNow
  );

  const bhadraSuggestion =
    getBhadraSuggestion(bhadra);

  const vara = getVara(p);

  /* Store context for Sankalp */
  currentSankalpContext = {
    samvatParts: samvatParts,
    ayana: ayana,
    ritu: ritu,
    masa: masa,
    paksha: paksha,
    tithi: tithi,
    vara: vara,
    nakshatra: nakshatra,
    yoga: yoga,
    karana: primaryKarana,
    location: selectedLocation,
    panchang: p,
    praharData: prahar,
    referenceNow: referenceNow
  };

  let nextTithi = null;
  let nextNakshatra = null;
  let nextYoga = null;

  try{
    let tithiVal = p.tithi;

    if(
      typeof tithiVal === "object" &&
      tithiVal !== null
    ){
      tithiVal =
        tithiVal.index ??
        tithiVal.number ??
        tithiVal.value ??
        tithiVal.name;
    }

    if(typeof tithiVal === "number"){
      const len = tithiHindi.length;

      if(
        tithiVal >= 0 &&
        tithiVal < len
      ){
        const nextIdx =
          (tithiVal + 1) % len;
        nextTithi =
          tithiHindi[nextIdx];
      }
    }
  }catch(e){}

  try{
    let nakVal = p.nakshatra;

    if(
      typeof nakVal === "object" &&
      nakVal !== null
    ){
      nakVal =
        nakVal.index ??
        nakVal.number ??
        nakVal.value ??
        nakVal.name;
    }

    if(typeof nakVal === "number"){
      const len = nakshatraHindi.length;

      if(
        nakVal >= 0 &&
        nakVal < len
      ){
        const nextIdx =
          (nakVal + 1) % len;
        nextNakshatra =
          nakshatraHindi[nextIdx];
      }
    }
  }catch(e){}

  try{
    let yogaVal = p.yoga;

    if(
      typeof yogaVal === "object" &&
      yogaVal !== null
    ){
      yogaVal =
        yogaVal.index ??
        yogaVal.number ??
        yogaVal.value ??
        yogaVal.name;
    }

    if(typeof yogaVal === "number"){
      const len = yogaHindi.length;

      if(
        yogaVal >= 0 &&
        yogaVal < len
      ){
        const nextIdx =
          (yogaVal + 1) % len;
        nextYoga =
          yogaHindi[nextIdx];
      }
    }
  }catch(e){}

  let bhadraStatus = "नहीं";

  if(bhadra.available){
    if(bhadra.isActive){
      bhadraStatus = "चल रही है";
    }
    else if(
      referenceNow &&
      referenceNow < bhadra.start
    ){
      bhadraStatus = "आगामी";
    }
    else{
      bhadraStatus = "समाप्त";
    }
  }

  let ghatiHtml = "";

  if(
    ghatiPal.ghati !== null &&
    ghatiPal.pal !== null
  ){
    ghatiHtml = `<div style="font-size:13px;color:#555;margin-bottom:10px;">
      🕰️ सूर्योदय से वर्तमान घटी-पल (Dynamic): ${ghatiPal.ghati} घटी ${ghatiPal.pal} पल
    </div>`;
  }else{
    ghatiHtml = `<div style="font-size:13px;color:#999;margin-bottom:10px;">
      🕰️ घटी-पल (Dynamic) उपलब्ध नहीं
    </div>`;
  }

  let praharHtml = `<div class="prahar-groups">`;

  praharHtml += `<div class="prahar-group">`;

  praharHtml += `<div class="prahar-group-title">
    🌙 रात्रि के प्रहर
  </div>`;

  praharHtml += `<div class="prahar-grid">`;

  const praharNames = [
    "प्रथम",
    "द्वितीय",
    "तृतीय",
    "चतुर्थ"
  ];

  prahar.nightPrahar.forEach(
    (pItem,i) => {
      const activeClass =
        pItem.isActive ? "active" : "";

      praharHtml += `
        <div class="prahar-item ${activeClass}">
          <div class="p-name">
            ${praharNames[i]} प्रहर
          </div>
          <div class="p-time">
            ${formatTime(pItem.start)} - ${formatTime(pItem.end)}
          </div>
        </div>
      `;
    }
  );

  praharHtml += `</div></div>`;

  praharHtml += `</div>`;

  let bhadraPartsHtml = "";

  if(bhadra.available && bhadra.parts){
    bhadraPartsHtml = `<div>
      <b>भद्रा अंग:</b>
      <div class="bhadra-parts">`;

    bhadra.parts.forEach(part => {
      const cls = part.isActive
        ? "bhadra-part active"
        : "bhadra-part";

      bhadraPartsHtml += `<span class="${cls}">
        ${part.name} (${formatTime(part.start)})
      </span>`;
    });

    bhadraPartsHtml += `</div></div>`;

    bhadraPartsHtml += `<div>
      <b>निवास स्थान:</b>
      <span class="bhadra-niwas" style="background:${bhadra.niwasColor};" >
        ${bhadra.niwas}
      </span>
    </div>`;

    if(bhadraSuggestion){
      const cls =
        bhadraSuggestion.type === "avoid"
          ? "bhadra-suggestion avoid"
          : "bhadra-suggestion";

      bhadraPartsHtml += `<div class="${cls}">
        💡 ${bhadraSuggestion.text}
      </div>`;
    }
  }else{
    bhadraPartsHtml = `<div style="font-size:13px;color:#777;">
      भद्रा नहीं है</div>`;
  }

  let abhijitDisplay = "";

  if(
    isWednesday &&
    p.abhijitMuhurta
  ){
    abhijitDisplay = `⚪ अभिजीत मुहूर्त — आज मान्य नहीं <br>
      <span style="font-size:12px;color:#999;">
        बुधवार होने के कारण पारंपरिक नियम के अनुसार आज अभिजीत मुहूर्त का शुभ प्रयोग मान्य नहीं माना जाता।
      </span>`;
  }
  else if(
    p.abhijitMuhurta?.start &&
    p.abhijitMuhurta?.end
  ){
    abhijitDisplay = `<span style="color:#188038;font-weight:bold;">
      ${formatTimeRange(
        p.abhijitMuhurta.start,
        p.abhijitMuhurta.end
      )}
    </span>`;
  }
  else{
    abhijitDisplay = `<span style="color:#999;">
      उपलब्ध नहीं
    </span>`;
  }

  const renderNext = nextName => {
    if(!nextName) return "";

    return `<div style="font-size:13px;color:#555;margin-top:4px;">
      तत्पश्चात ${nextName}
    </div>`;
  };

  result.innerHTML = `
    <div class="date-title">
      ${dateText}
    </div>

    <div class="grid">
      <div class="card full">
        <div class="label">
          विक्रम संवत्
        </div>
        <div class="value">
          ${samvat}
        </div>
      </div>

      <div class="card">
        <div class="label">
          मास
        </div>
        <div class="value">
          ${masa}
        </div>
      </div>

      <div class="card">
        <div class="label">
          पक्ष
        </div>
        <div class="value">
          ${paksha}
        </div>
      </div>

      <div class="card">
        <div class="label">
          तिथि
        </div>
        <div class="value">
          ${tithi}
        </div>
        ${getEndTimeText(p.tithiEndTime)}
        ${renderNext(nextTithi)}
      </div>

      <div class="card">
        <div class="label">
          वार
        </div>
        <div class="value">
          ${vara}
        </div>
      </div>

      <div class="card">
        <div class="label">
          नक्षत्र
        </div>
        <div class="value">
          ${nakshatra}
        </div>
        ${getEndTimeText(p.nakshatraEndTime)}
        ${renderNext(nextNakshatra)}
      </div>

      <div class="card">
        <div class="label">
          योग
        </div>
        <div class="value">
          ${yoga}
        </div>
        ${getEndTimeText(p.yogaEndTime)}
        ${renderNext(nextYoga)}
      </div>

      <div class="card full">
        <div class="label">
          करण
        </div>
        ${getKaranaList(p)}
      </div>

      <div class="card">
        <div class="label">
          ऋतु
        </div>
        <div class="value">
          ${ritu}
        </div>
      </div>

      <div class="card full">
        <div class="label">
          🌞 सूर्य व 🌙 चंद्र स्थिति
        </div>
        <div class="value" style="font-size:14px;line-height:1.7;">
          सूर्य राशि — ${getRashiHindi(p.sunRashi)}<br>
          चंद्र राशि — ${getRashiHindi(p.moonRashi)}<br>
          सूर्य नक्षत्र — ${p.sunNakshatra ? getNakshatraName(p.sunNakshatra) : "—"}${p.sunNakshatra?.pada ? ` (पाद ${p.sunNakshatra.pada})` : ""}
        </div>
      </div>

      <div class="card">
        <div class="label">
          अयन
        </div>
        <div class="value">
          ${ayana}
        </div>
      </div>

      <div class="card">
        <div class="label">
          🌅 सूर्योदय
        </div>
        <div class="value">
          ${formatTime(p.sunrise)}
        </div>
      </div>

      <div class="card">
        <div class="label">
          🌇 सूर्यास्त
        </div>
        <div class="value">
          ${formatTime(p.sunset)}
        </div>
      </div>

      <div class="card">
        <div class="label">
          🌙 चंद्रोदय
        </div>
        <div class="value">
          ${formatTime(p.moonrise)}
        </div>
      </div>

      <div class="card">
        <div class="label">
          🌙 चंद्रास्त
        </div>
        <div class="value">
          ${formatTime(p.moonset)}
        </div>
      </div>

      <div class="card full">
        <div class="label">
          🕉️ शुभ-अशुभ समय
        </div>

        <div class="time-row">
          <b>🟢 अभिजीत मुहूर्त</b>
          <span>${abhijitDisplay}</span>
        </div>

        <div class="time-row">
          <b>🔴 राहुकाल</b>
          <span>
            ${formatTimeRange(
              p.rahuKalamStart,
              p.rahuKalamEnd
            )}
          </span>
        </div>

        <div class="time-row">
          <b>🔴 यमगण्ड</b>
          <span>
            ${formatTimeRange(
              p.yamagandaKalam?.start,
              p.yamagandaKalam?.end
            )}
          </span>
        </div>

        <div class="time-row">
          <b>🔴 गुलिक काल</b>
          <span>
            ${formatTimeRange(
              p.gulikaKalam?.start,
              p.gulikaKalam?.end
            )}
          </span>
        </div>
      </div>

      <div class="card full">
        <div class="label">
          ⏳ चयनित तिथि के प्रहर
        </div>
        ${praharHtml}
      </div>

      <div class="card full">
        <div class="label">
          🔴 भद्रा (विष्टि करण) — ${bhadraStatus}
        </div>
        ${bhadraPartsHtml}
      </div>

      <div class="card full">
        ${ghatiHtml}
      </div>

      <div class="card full">
        <div class="label">
          🕉️ संकल्प
        </div>

        <div id="sankalpControls" class="sankalp-controls"></div>

        <div class="sankalp-box">
          <div class="sankalp-text" id="sankalpText"></div>

          <button class="sankalp-copy" type="button" onclick="copySankalp()">
            📋 संकल्प कॉपी करें
          </button>

          <div class="sankalp-note">
            यह संकल्प चयनित प्रकार के अनुसार स्वतः निर्मित है। गोत्र, नाम, वर्ण आदि भरने पर वे संकल्प में सम्मिलित हो जाते हैं। (विशेष: जिनका यज्ञोपवीत संस्कार नहीं हुआ हो, वे 'ॐ' की जगह 'औं' का उच्चारण करें।) अपनी परंपरा व गुरु-निर्देशानुसार संकल्प वाक्य में परिवर्तन किया जा सकता है।
          </div>
        </div>
      </div>

      <div class="card full">
        <div class="label">
          🕐 दिन के चौघड़िया
        </div>
        ${(p.choghadiya?.day || [])
          .map(c => {
            const names = {
              Shubh:"शुभ",
              Rog:"रोग",
              Udveg:"उद्वेग",
              Chal:"चल",
              Labh:"लाभ",
              Amrit:"अमृत",
              Kaal:"काल"
            };

            return `
              <div class="time-row">
                <b>${names[c.name] || c.name}</b>
                <span>
                  ${formatTimeRange(
                    c.startTime,
                    c.endTime
                  )}
                </span>
              </div>
            `;
          })
          .join("") || '<div style="color:#777;">उपलब्ध नहीं</div>'
        }
      </div>

      <div class="card full">
        <div class="label">
          🌙 रात्रि के चौघड़िया
        </div>
        ${(p.choghadiya?.night || [])
          .map(c => {
            const names = {
              Shubh:"शुभ",
              Rog:"रोग",
              Udveg:"उद्वेग",
              Chal:"चल",
              Labh:"लाभ",
              Amrit:"अमृत",
              Kaal:"काल"
            };

            return `
              <div class="time-row">
                <b>${names[c.name] || c.name}</b>
                <span>
                  ${formatTimeRange(
                    c.startTime,
                    c.endTime
                  )}
                </span>
              </div>
            `;
          })
          .join("") || '<div style="color:#777;">उपलब्ध नहीं</div>'
        }
      </div>

      <div class="card full">
        <div class="label">
          🌅 ब्रह्म मुहूर्त
        </div>
        <div class="time-row">
          <span>
            ${formatTimeRange(
              p.brahmaMuhurta?.start,
              p.brahmaMuhurta?.end
            )}
          </span>
        </div>
      </div>

      <div class="card full">
        <div class="label">
          ⚠️ दुर्मुहूर्त
        </div>
        <div class="time-row">
          <span>
            ${getDurMuhurtaText(
              p,
              isWednesday
            )}
          </span>
        </div>
      </div>

      <div class="card full">
        <div class="label">
          📍 स्थान
        </div>
        <div class="value">
          ${selectedLocation.name}
        </div>
      </div>

    </div>
  `;

  renderSankalpControls();
  updateSankalpText();
}

/* =========================================================
   COPY SANKALP
   ========================================================= */
window.copySankalp = async function(){
  const element = document.getElementById(
    "sankalpText"
  );

  if(!element){
    return;
  }

  const text =
    element.innerText.trim();

  if(!text){
    return;
  }

  const setButtonState = () => {
    const button =
      document.querySelector(
        ".sankalp-copy"
      );

    if(button){
    const oldText =
  decodeHtmlEntities(button.textContent);
  button.textContent =
    "✅ संकल्प कॉपी हो गया";
  setTimeout(() => {
  button.textContent = oldText;
}, 1800);
    }
  };

  try{
    if(
      navigator.clipboard &&
      navigator.clipboard.writeText
    ){
      await navigator.clipboard.writeText(
        text
      );

      setButtonState();
      return;
    }

    throw new Error(
      "clipboard-api-unavailable"
    );
  }catch(error){
    try{
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value = text;

      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.left = "-1000px";
      textarea.style.opacity = "0";

      document.body.appendChild(
        textarea
      );

      textarea.focus();
      textarea.select();

      const ok =
        document.execCommand("copy");

      document.body.removeChild(
        textarea
      );

      if(ok){
        setButtonState();
      }else{
        throw new Error(
          "execCommand-failed"
        );
      }
    }catch(e){
      alert(
        "संकल्प कॉपी नहीं हो सका। कृपया इसे manually select करके copy करें।"
      );
    }
  }
};

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */
function getDurMuhurtaText(
  p,
  isWednesday
){
  const sunrise = p.sunrise;
  const sunset = p.sunset;

  if(!sunrise || !sunset){
    return "—";
  }

  const dayMs =
    sunset.getTime() -
    sunrise.getTime();

  const nightStart = sunset;

  const nextSunrise =
    new Date(sunrise);

  nextSunrise.setDate(
    nextSunrise.getDate() + 1
  );

  const nightMs =
    nextSunrise.getTime() -
    nightStart.getTime();

  if(isWednesday){
    const firstStart = new Date(
      sunrise.getTime() +
      dayMs * (3/15)
    );

    const firstEnd = new Date(
      sunrise.getTime() +
      dayMs * (4/15)
    );

    const secondStart = new Date(
      nightStart.getTime() +
      nightMs * (6/15)
    );

    const secondEnd = new Date(
      nightStart.getTime() +
      nightMs * (7/15)
    );

    return (
      formatTimeRange(
        firstStart,
        firstEnd
      ) +
      "<br>" +
      formatTimeRange(
        secondStart,
        secondEnd
      )
    );
  }

  return Array.isArray(p.durMuhurta)
    ? p.durMuhurta
        .map(x =>
          formatTimeRange(
            x?.start,
            x?.end
          )
        )
        .join("<br>")
    : "—";
}

function getEndTimeText(value){
  if(!value) return "";

  return `<span class="endtime">
    समाप्ति: ${formatDateTimeHindi(value)}
  </span>`;
}

function getKaranaList(p){
  if(
    !p.karanas ||
    !Array.isArray(p.karanas)
  ){
    return "—";
  }

  return `
    <div class="karana-list">
      ${p.karanas
        .map(k => {
          const name =
            karanaHindi[k.name] ||
            k.name ||
            "—";

          return `
            <div class="karana-item">
              <b>${name}</b>
              <span class="endtime">
                ${formatDateTimeHindi(k.endTime)} तक
              </span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

/* =========================================================
   VARA
   ========================================================= */
function getVara(p){
  const names = [
    "रविवार",
    "सोमवार",
    "मंगलवार",
    "बुधवार",
    "गुरुवार",
    "शुक्रवार",
    "शनिवार"
  ];

  if(typeof p.vara === "number"){
    return (
      names[p.vara] || "—"
    );
  }

  if(p.varaName){
    return p.varaName;
  }

  return (
    p.vara || "—"
  );
}

/* =========================================================
   DATE EVENTS
   ========================================================= */
dateInput.addEventListener(
  "change",
  calculatePanchang
);

window.today = function(){
  dateInput.value = todayString();

  sankalpState.sandhyaType =
    getAutoSandhyaType();

  calculatePanchang();
};

window.previousDay = function(){
  const d = new Date(
    dateInput.value + "T12:00:00"
  );

  d.setDate(d.getDate() - 1);

  dateInput.value =
    d.getFullYear() +
    "-" +
    String(d.getMonth()+1)
      .padStart(2,"0") +
    "-" +
    String(d.getDate())
      .padStart(2,"0");

  calculatePanchang();
};

window.nextDay = function(){
  const d = new Date(
    dateInput.value + "T12:00:00"
  );

  d.setDate(d.getDate() + 1);

  dateInput.value =
    d.getFullYear() +
    "-" +
    String(d.getMonth()+1)
      .padStart(2,"0") +
    "-" +
    String(d.getDate())
      .padStart(2,"0");

  calculatePanchang();
};

/* =========================================================
   GPS with reverse geocoding for state/city
   ========================================================= */
window.useMyLocation = function(){
  if(!navigator.geolocation){
    alert(
      "आपके browser में Location सुविधा उपलब्ध नहीं है।"
    );
    return;
  }

  result.innerHTML = `<div class="loading">
    📍 आपकी स्थिति ली जा रही है...
  </div>`;

  navigator.geolocation.getCurrentPosition(
    async position => {
      selectedLocation = {
        name: "वर्तमान स्थान",
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        elevation:
          position.coords.altitude || 0,
        state: "",
        city: ""
      };

      try{
        const url =
          "https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=10&accept-language=hi&lat=" +
          selectedLocation.lat +
          "&lon=" +
          selectedLocation.lon;

        const r = await fetch(
          url,
          {
            headers:{
              "Accept":"application/json"
            }
          }
        );

        if(r.ok){
          const data = await r.json();

          if(data && data.address){
            selectedLocation.state =
              data.address.state ||
              data.address.state_district ||
              "";

            selectedLocation.city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county ||
              "";

            if(data.display_name){
              selectedLocation.name =
                data.display_name;
            }
          }
        }
      }catch(e){
        console.warn(
          "Reverse geocoding failed:",
          e
        );
      }

      selectedCity.style.display = "block";

      const locLine =
        selectedLocation.city
          ? " - " + selectedLocation.city
          : "";

      selectedCity.textContent =
        "📍 वर्तमान स्थान" + locLine;

      try{
        localStorage.setItem(
          "ohdPanchangLocation",
          JSON.stringify(
            selectedLocation
          )
        );
      }catch(e){}

      calculatePanchang();
    },
    error => {
      result.innerHTML = `<div class="error">
        ❌ Location permission नहीं मिली।
        <br><br>
        आप शहर का नाम manually खोज सकते हैं।
      </div>`;
    },
    {
      enableHighAccuracy:true,
      timeout:10000,
      maximumAge:86400000
    }
  );
};

/* =========================================================
   FOOTER
   ========================================================= */
document.getElementById(
  "current-year"
).textContent = new Date().getFullYear();

/* =========================================================
   INITIAL CALCULATION
   ========================================================= */
sankalpState.sandhyaType =
  getAutoSandhyaType();

calculatePanchang();
