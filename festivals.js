import { getPanchangam, Observer } from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";

/*
 * OurHinduDharm — Hindu festival card
 *
 * Intentionally conservative: the library's festival category metadata is
 * not assumed to prove that an event is Hindu. Events are displayed only
 * when their names match known Hindu vrata/parva terminology. This avoids
 * showing national days and festivals of other religions by default.
 *
 * Before broadening this catalogue, audit actual p.festivals output against
 * a trusted Hindu festival list and add regression tests.
 */

const DEFAULT_LOCATION = {
  latitude: 30.1265,
  longitude: 80.4817,
  elevation: 0
};

const HINDU_FESTIVAL_TERMS = [
  /ekadashi|ekādaśī|एकादशी/i,
  /pradosh|pradoṣ|प्रदोष/i,
  /purnima|pūrṇimā|पूर्णिमा/i,
  /amavasya|amāvasyā|अमावस्या/i,
  /sankranti|saṅkrānti|संक्रांति|संक्रान्ति/i,
  /navratri|navarātri|नवरात्रि|नवरात्र/i,
  /durga|दुर्गा|durga ashtami|दुर्गाष्टमी/i,
  /ram navami|rama navami|राम नवमी/i,
  /janmashtami|जन्माष्टमी/i,
  /krishna janma|कृष्ण जन्म/i,
  /shivratri|śivarātri|शिवरात्रि/i,
  /mahashivratri|महाशिवरात्रि/i,
  /ganesh|gaṇeś|गणेश/i,
  /hanuman|हनुमान/i,
  /diwali|deepavali|dīpāvalī|दीपावली|दिवाली/i,
  /holi|होली/i,
  /akshaya tritiya|अक्षय तृतीया/i,
  /dussehra|vijayadashami|दशहरा|विजयादशमी/i,
  /raksha bandhan|रक्षा बंधन|रक्षाबंधन/i,
  /guru purnima|गुरु पूर्णिमा/i,
  /nag panchami|नाग पंचमी/i,
  /vasant panchami|basant panchami|वसंत पंचमी|बसंत पंचमी/i,
  /saraswati puja|सरस्वती पूजा/i,
  /govardhan|गोवर्धन/i,
  /bhai dooj|भाई दूज/i,
  /dhanteras|धनतेरस/i,
  /tulsi vivah|तुलसी विवाह/i,
  /devutthana|dev uthani|देवउठनी|देवोत्थान/i,
  /chhath|छठ/i,
  /vat savitri|वट सावित्री/i,
  /karwa chauth|करवा चौथ/i,
  /sheetala|शीतला/i,
  /ganga dussehra|गंगा दशहरा/i,
  /narasimha|नरसिंह/i,
  /vamana|वामन/i,
  /parashurama|परशुराम/i,
  /pratipada|प्रतिपदा/i,
  /putrada|पुत्रदा/i,
  /nirjala|निर्जला/i,
  /kamika|कामिका/i,
  /mokshada|मोक्षदा/i,
  /jaya ekadashi|जया एकादशी/i,
  /papankusha|पापांकुशा/i,
  /utpanna|उत्पन्ना/i,
  /vaikuntha|वैकुण्ठ|वैकुंठ/i,
  /annakut|अन्नकूट/i,
  /ratha yatra|रथयात्रा|रथ यात्रा/i,
  /jagannath|जगन्नाथ/i,
  /makar sankranti|मकर संक्रांति|मकर संक्रान्ति/i,
  /mesh sankranti|मेष संक्रांति|मेष संक्रान्ति/i,
  /chaitra|चैत्र/i,
  /kartik|kārtik|कार्तिक/i,
  /shravan|śrāvaṇ|श्रावण|सावन/i,
  /pitru paksha|pitṛ pakṣa|पितृ पक्ष/i,
  /mahalaya|महालय/i,
  /akshaya|अक्षय/i
];

const NON_HINDU_OR_CIVIC_TERMS =
  /eid|ramadan|ramzan|christmas|good friday|easter|buddha|guru nanak|vaisakhi|baisakhi|gandhi jayanti|independence day|republic day|constitution day|labour day|labor day|national holiday|government holiday|ईद|क्रिसमस|गांधी जयंती|स्वतंत्रता दिवस|गणतंत्र दिवस/i;

function getSelectedDate() {
  return document.getElementById("dateInput")?.value || null;
}

function getObserver() {
  try {
    const saved = JSON.parse(localStorage.getItem("ohdPanchangLocation") || "null");
    const latitude = Number(saved?.lat);
    const longitude = Number(saved?.lon);
    const elevation = Number(saved?.elevation) || 0;

    if (Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
        Number.isFinite(longitude) && longitude >= -180 && longitude <= 180) {
      return new Observer(latitude, longitude, elevation);
    }
  } catch (error) {
    console.warn("Festival card: saved location could not be read.", error);
  }

  return new Observer(
    DEFAULT_LOCATION.latitude,
    DEFAULT_LOCATION.longitude,
    DEFAULT_LOCATION.elevation
  );
}

function festivalName(item) {
  return String(item?.name || item?.title || "").trim();
}

function isHinduFestival(item) {
  const name = festivalName(item);
  if (!name || NON_HINDU_OR_CIVIC_TERMS.test(name)) return false;

  // Some versions may provide explicit category metadata. Reject clearly
  // non-Hindu categories, but do not rely on a generic "festival" label.
  const category = String(item?.category || "").toLowerCase();
  if (/islam|muslim|christian|christ|sikh|buddhist|national|government|civic|public holiday/.test(category)) {
    return false;
  }

  return HINDU_FESTIVAL_TERMS.some(pattern => pattern.test(name));
}

function formatHindiDate(dateString) {
  const date = new Date(dateString + "T12:00:00+05:30");
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getResultsGrid() {
  return document.querySelector("#result > .grid, #result .grid");
}

function renderFestivalCard(dateString, festivals, errorMessage = "") {
  const grid = getResultsGrid();
  if (!grid) return;

  grid.querySelector("#ohdHinduFestivalsCard")?.remove();

  const card = document.createElement("section");
  card.className = "card full";
  card.id = "ohdHinduFestivalsCard";
  card.style.borderLeftColor = "#b45309";

  const heading = document.createElement("div");
  heading.className = "label";
  heading.textContent = "🪔 आज के हिंदू व्रत-पर्व";
  card.appendChild(heading);

  const dateLine = document.createElement("div");
  dateLine.style.cssText = "font-size:12px;color:#777;margin-bottom:8px;";
  dateLine.textContent = formatHindiDate(dateString);
  card.appendChild(dateLine);

  if (errorMessage) {
    const message = document.createElement("div");
    message.className = "value";
    message.style.fontSize = "13px";
    message.textContent = "पर्वों की जानकारी अभी उपलब्ध नहीं है।";
    card.appendChild(message);
    console.warn("Festival card:", errorMessage);
  } else if (!festivals.length) {
    const message = document.createElement("div");
    message.style.cssText = "font-size:13px;color:#666;";
    message.textContent = "इस तिथि के लिए सूची में कोई सत्यापित हिंदू पर्व नहीं मिला।";
    card.appendChild(message);
  } else {
    const list = document.createElement("ul");
    list.style.cssText = "margin:0;padding-left:20px;line-height:1.7;";
    festivals.forEach(item => {
      const row = document.createElement("li");
      row.textContent = festivalName(item);
      list.appendChild(row);
    });
    card.appendChild(list);
  }

  const note = document.createElement("div");
  note.style.cssText = "margin-top:8px;font-size:11px;color:#777;line-height:1.5;";
  note.textContent = "पर्वों की सूची लाइब्रेरी के डेटा से तैयार होती है; पूजा-मुहूर्त और व्रत-पारण का समय अलग से सत्यापित किया जाना चाहिए।";
  card.appendChild(note);

  grid.appendChild(card);
}

let lastRenderKey = "";

function updateHinduFestivals() {
  const dateString = getSelectedDate();
  if (!dateString) return;

  const location = getObserver();
  const renderKey = dateString + "|" + location.latitude + "|" + location.longitude;
  if (renderKey === lastRenderKey && document.getElementById("ohdHinduFestivalsCard")) return;

  try {
    // Use noon in IST to avoid UTC date rollover from YYYY-MM-DD parsing.
    const date = new Date(dateString + "T12:00:00+05:30");
    const panchang = getPanchangam(date, location, { timezoneOffset: 330 });
    const allFestivals = Array.isArray(panchang?.festivals) ? panchang.festivals : [];
    const filtered = allFestivals.filter(isHinduFestival);
    renderFestivalCard(dateString, filtered);
    lastRenderKey = renderKey;

    // Diagnostic counts help audit the conservative allowlist during preview.
    console.info("OHD festivals audit", {
      date: dateString,
      totalFromLibrary: allFestivals.length,
      displayedHinduCandidates: filtered.map(festivalName),
      filteredOut: allFestivals.filter(item => !isHinduFestival(item)).map(festivalName)
    });
  } catch (error) {
    lastRenderKey = "";
    renderFestivalCard(dateString, [], error?.message || String(error));
  }
}

function initHinduFestivals() {
  const dateInput = document.getElementById("dateInput");
  dateInput?.addEventListener("change", () => {
    lastRenderKey = "";
    updateHinduFestivals();
  });

  window.addEventListener("ohd:panchangUpdated", () => {
    lastRenderKey = "";
    updateHinduFestivals();
  });

  window.addEventListener("ohd:locationChanged", () => {
    lastRenderKey = "";
    updateHinduFestivals();
  });

  updateHinduFestivals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHinduFestivals, { once: true });
} else {
  initHinduFestivals();
}
