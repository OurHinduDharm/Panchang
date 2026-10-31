const IST_OFFSET_MS = 330 * 60 * 1000;

function asDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function istDateKey(value) {
  const date = asDate(value);
  return date ? new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10) : null;
}

function eclipseTitle(grahan) {
  const type = String(grahan?.type || "").toLowerCase();
  const subtype = String(grahan?.subtype || grahan?.eclipseType || "").toLowerCase();
  const body = /chandra|lunar/.test(type) ? "चंद्रग्रहण" :
    /surya|solar/.test(type) ? "सूर्यग्रहण" : "ग्रहण";
  const kind = /annular|वलय/.test(subtype) ? "वलयाकार" :
    /hybrid|संकर/.test(subtype) ? "संकर" :
    /penumbral|उपच्छाया/.test(subtype) ? "उपच्छाया" :
    /total|पूर्ण/.test(subtype) ? "पूर्ण" :
    /partial|आंशिक/.test(subtype) ? "आंशिक" : "";
  return [kind, body].filter(Boolean).join(" ");
}

/**
 * Discover eclipses for one observer and return only eclipses with a real
 * local horizon-overlap interval. The visibility decision is delegated to
 * the same tested functions used by eclipse-panchang.js.
 */
export async function buildLocationEclipseEvents({ year, location, api, tools }) {
  if (!Number.isInteger(Number(year)) || !location || !api || !tools ||
      typeof tools.discoverEclipses !== "function" ||
      typeof tools.getLocalVisibility !== "function" ||
      typeof tools.getEclipseDayPanchangs !== "function") {
    throw new Error("स्थान-आधारित ग्रहण गणना के लिए आवश्यक API उपलब्ध नहीं है।");
  }

  const module = api.module || api;
  const Observer = api.Observer || module.Observer;
  if (typeof Observer !== "function") {
    throw new Error("Panchang Observer उपलब्ध नहीं है।");
  }

  const observer = new Observer(
    Number(location.lat),
    Number(location.lon),
    Number(location.elevation) || 0
  );
  const discovered = await tools.discoverEclipses(Number(year), location, api);
  const visibleEvents = [];

  for (const item of Array.isArray(discovered) ? discovered : []) {
    const grahan = item && item.grahan;
    if (!grahan) continue;

    const firstContact = asDate(grahan.contact && grahan.contact.firstContact);
    const eclipseDate = firstContact || asDate(item.date);
    const date = istDateKey(eclipseDate);
    if (!date || date.slice(0, 4) !== String(year)) continue;

    const dayPanchangs = tools.getEclipseDayPanchangs(eclipseDate, observer, api);
    const visibility = tools.getLocalVisibility(grahan, dayPanchangs);
    if (!visibility || visibility.localVisible !== true) continue;

    visibleEvents.push({
      date,
      title: eclipseTitle(grahan),
      category: "ग्रहण",
      isLocationEclipse: true,
      localLocationName: location.name || location.city || "चयनित स्थान",
      localVisibility: visibility,
      sutakKaal: grahan.sutakKaal || null,
      articleUrl: "https://ourhindudharm.blogspot.com/p/grahan-panchang.html?m=1",
      articleLabel: "ग्रहण का विस्तृत पंचांग देखें",
      secondaryArticleUrl: "https://ourhindudharm.blogspot.com/2022/10/About-Grahan-mantra-purashcharan.html?m=1",
      secondaryArticleLabel: "ग्रहण मन्त्र-पुरश्चरण की विधि पढ़ें"
    });
  }

  visibleEvents.sort((a, b) => a.date.localeCompare(b.date));
  return visibleEvents;
}
