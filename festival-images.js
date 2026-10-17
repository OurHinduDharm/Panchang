/* Curated festival-type image mapping.
 * Each file's source page was checked for its reuse license on Wikimedia Commons.
 * Prefer small thumbnails; show source and license links beside every displayed image.
 */
const LICENSES = {
  cc0: {
    label: "CC0 1.0",
    url: "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  ccBySa40: {
    label: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/"
  }
};

const IMAGES = {
  navratri: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Navratri_festival.jpg/400px-Navratri_festival.jpg",
    alt: "नवरात्रि में देवी-देवताओं की प्रतिमाएँ",
    author: "Jeevitha Madhaiyan",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Navratri_festival.jpg",
    license: LICENSES.cc0
  },
  deepawali: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Deepawali_diya.jpg/640px-Deepawali_diya.jpg",
    alt: "दीपावली का मिट्टी का दीपक",
    author: "Craniax78",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Deepawali_diya.jpg",
    license: LICENSES.cc0
  },
  fullMoon: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Full_moon_at_night.jpg/500px-Full_moon_at_night.jpg",
    alt: "रात में पूर्ण चंद्रमा",
    author: "Karthika Manikandan",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Full_moon_at_night.jpg",
    license: LICENSES.cc0
  },
  shiva: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Shiva_lingam_01.jpg/320px-Shiva_lingam_01.jpg",
    alt: "पूजा से सुसज्जित शिवलिंग",
    author: "Naveen 1009",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Shiva_lingam_01.jpg",
    license: LICENSES.cc0
  },
  ganesha: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Ganesha%2C_India%2C_Tanjore%2C_Tamil_Nadu%2C_Pallava_dynasty%2C_9th_century%2C_bronze%2C_HAA.JPG/480px-Ganesha%2C_India%2C_Tanjore%2C_Tamil_Nadu%2C_Pallava_dynasty%2C_9th_century%2C_bronze%2C_HAA.JPG",
    alt: "भगवान गणेश की कांस्य प्रतिमा",
    author: "Hiart",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ganesha,_India,_Tanjore,_Tamil_Nadu,_Pallava_dynasty,_9th_century,_bronze,_HAA.JPG",
    license: LICENSES.cc0
  },
  karvaChauth: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/KarvaChauthMoon1.jpg/640px-KarvaChauthMoon1.jpg",
    alt: "करवा चौथ पर छलनी से चंद्रमा देखती महिलाएँ",
    author: "CSG-Info",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:KarvaChauthMoon1.jpg",
    license: LICENSES.ccBySa40
  }
};

export function getFestivalImage(event) {
  if (!event || typeof event !== "object") return null;
  if (event.imageUrl) {
    return {
      url: event.imageUrl,
      alt: event.imageAlt || event.title || "व्रत-पर्व का चित्र",
      author: event.imageAuthor || "",
      sourceUrl: event.imageSourceUrl || "",
      license: event.imageLicenseLabel
        ? { label: event.imageLicenseLabel, url: event.imageLicenseUrl || "" }
        : null
    };
  }

  const text = String(event.title || "") + " " + String(event.category || "");
  let key = null;
  if (/करवा.?चौथ|करक.?चतुर्थी/i.test(text)) key = "karvaChauth";
  else if (/नवरात्र|दुर्गा.?पूजा|दुर्गाष्टमी|महाष्टमी|महानवमी/i.test(text)) key = "navratri";
  else if (/दीपावली|दीवाली|दीपावली|धनतेरस|लक्ष्मी.?पूजा|लक्ष्मी.?कुबेर/i.test(text)) key = "deepawali";
  else if (/शरद.?पूर्णिमा|कोजागरी|पूर्णिमा/i.test(text) || String(event.category || "") === "पूर्णिमा") key = "fullMoon";
  else if (/गणेश|गणपति|संकष्टी|सकट.?चौथ/i.test(text)) key = "ganesha";
  else if (/शिव|प्रदोष|कालाष्टमी|भैरव/i.test(text)) key = "shiva";
  return key ? { ...IMAGES[key] } : null;
}

export function getFestivalImageKeys() {
  return Object.keys(IMAGES);
}

export function getFestivalImageManifest() {
  return Object.fromEntries(Object.entries(IMAGES).map(([key, image]) => [key, {
    ...image,
    license: { ...image.license }
  }]));
}
