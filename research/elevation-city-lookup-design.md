# स्वचालित नगर-ऊँचाई निर्धारण: शोध एवं कार्यान्वयन निर्णय

दिनांक: 10 नवम्बर 2026  
परियोजना: OurHinduDharm Panchang — उदय-अस्त

## निर्णय

1. पिथौरागढ़ के लिए परियोजना का स्वीकृत observer elevation **1,650 m** रहेगा। निर्देशांक `29.5828° N, 80.2182° E` हैं। यह नगर-स्तरीय औसत/प्रतिनिधि ऊँचाई है; इसे किसी सर्वेक्षित भवन या सटीक प्रेक्षण-बिंदु की ऊँचाई न कहा जाए।
2. अन्य नगरों के लिए अक्षांश-देशांतर से elevation स्वतः प्राप्त करने की सुविधा बनाई जा सकती है। उपयोगकर्ता द्वारा चुनी गई/सत्यापित ऊँचाई को API परिणाम पर प्राथमिकता मिलेगी।
3. ऊँचाई के साथ हमेशा provider, dataset, resolution, retrieval date, vertical reference/datum (यदि उपलब्ध हो), coordinates और quality flag सहेजे जाएँ। केवल एक integer metre को बिना provenance के स्थायी तथ्य न मानें।
4. किसी API की अनुपलब्धता पर चुपचाप `0`, दिल्ली, निकटतम शहर या कोई मनगढ़ंत ऊँचाई fallback न हो। उपयोगकर्ता की पिछली सत्यापित ऊँचाई cache से ली जा सकती है; अन्यथा स्पष्ट रूप से elevation unavailable दिखे।

## उपलब्ध खुले स्रोत / सेवाएँ

### प्राथमिक स्वतः-प्राप्ति: Open-Meteo Elevation API

- दस्तावेज़: https://open-meteo.com/en/docs/elevation-api
- अनुरोध: `https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}`
- एक अनुरोध में अनेक coordinates भेजे जा सकते हैं (दस्तावेज़ के अनुसार अधिकतम 100)।
- स्रोत डेटा: Copernicus DEM GLO-90, लगभग 90 m resolution, वैश्विक कवरेज और खुला उपयोग।
- यह तेज़ city-level default के लिए उपयोगी है; 90 m raster किसी खास घर/मंदिर/वेधशाला की surveyed ऊँचाई नहीं है।
- Copernicus GLO-90 को DSM/terrain-surface product समझकर सावधानी रखें; इसे exact geodetic ellipsoidal height न मानें। API response को उसके documentation के अनुसार ही label करें।

### द्वितीय स्वतंत्र जाँच: OpenTopoData

- दस्तावेज़: https://www.opentopodata.org/api/
- सार्वजनिक API: `https://api.opentopodata.org/v1/srtm30m?locations={lat},{lon}&interpolation=bilinear`
- सार्वजनिक सेवा की प्रकाशित सीमाएँ: अधिकतम 100 locations/request, लगभग 1 request/second और 1000 requests/day (सेवा की मौजूदा नीति बदल सकती है)।
- `srtm30m`, `aster30m`, `mapzen` आदि datasets उपलब्ध; response में प्रयुक्त dataset का नाम लौटता है।
- इसे प्राथमिक स्रोत के साथ cross-check के रूप में उपयोग करें, न कि दोनों के बीच औसत निकालकर बिना जाँच के final elevation बनाने के लिए।

### वैकल्पिक उच्च-गुणवत्ता स्रोत: OpenTopography

- दस्तावेज़: https://opentopography.org/developers
- Point Elevation API में COP30, SRTM, ALOS आदि datasets उपलब्ध हैं।
- API key आवश्यक है; free key की daily limits हैं और key को सार्वजनिक frontend/app में embed करना निषिद्ध है। इसलिए बिना सुरक्षित server-side proxy और स्पष्ट अनुमति के इसे browser app में सीधे न जोड़ें।

## गणना-इंजन के लिए आवश्यक नियम

- Observer elevation का इस्तेमाल तभी करें जब event engine/ephemeris स्पष्ट रूप से topocentric altitude या horizon geometry में उसका उपयोग करता हो। केवल नाममात्र elevation जोड़ने से समय अपने-आप अधिक सटीक नहीं हो जाता।
- JPL Horizons `SITE_COORD` को ellipsoidal height चाहिए; जबकि आम DEM/API ऊँचाइयाँ प्रायः mean-sea-level/orthometric या dataset-specific vertical reference होती हैं। बिना geoid conversion के API की ऊँचाई को `SITE_COORD` में सीधे न डालें।
- सामान्य पंचांग display के लिए city-level representative elevation पर्याप्त हो सकती है; sub-minute local visibility claim के लिए surveyed observer position, horizon obstruction, atmospheric refraction और datum की अलग जाँच चाहिए।
- Elevation lookup को Panchang की हर date calculation पर न चलाएँ। Location select/save पर एक बार प्राप्त करें, cache करें और explicit refresh दें। इससे मुख्य गणना की performance प्रभावित नहीं होगी।

## सुझाया गया डेटा आकार

```json
{
  "lat": 29.5828,
  "lon": 80.2182,
  "elevationMeters": 1650,
  "source": "manual-city-reference",
  "dataset": "Pithoragarh town representative elevation",
  "verticalDatum": "mean sea level (reported town elevation; not ellipsoidal)",
  "resolutionMeters": null,
  "retrievedAt": null,
  "quality": "city-level-approved",
  "userOverride": true
}
```

API-आधारित शहरों के लिए `source`, `dataset`, `retrievedAt`, `resolutionMeters` और quality अलग से भरे जाएँ। Manual override हमेशा API value से ऊपर रहे।

## अगला implementation क्रम

1. मौजूदा location model में optional elevation provenance fields जोड़ने की जगह पहचानें; existing location storage को तोड़े बिना backward compatibility रखें।
2. एक isolated `getLocationElevation(lat, lon)` helper बनाएँ: प्राथमिक Open-Meteo, वैकल्पिक OpenTopoData cross-check; timeout/error पर null लौटाए, कभी zero/default नहीं।
3. परिणाम को location-selection/save के समय cache करें; Panchang date-change path में network request न हो।
4. पिथौरागढ़ के लिए `1650 m` manual approved override रखें। दूसरे शहरों में API result को `estimated` label दें और user override की अनुमति दें।
5. unit tests में valid response, null/error, timeout, stale cache, manual override precedence, no-zero-fallback और no-network-on-date-change जाँचें।
6. उसके बाद ही इसे UI में जोड़ें; उदय-अस्त के मौजूदा event results/performance को बदलने वाला कोई बदलाव अलग validation के बिना न करें।

## स्रोत

- Open-Meteo Elevation API: https://open-meteo.com/en/docs/elevation-api
- OpenTopoData API: https://www.opentopodata.org/api/
- OpenTopography developer/API documentation: https://opentopography.org/developers
- Copernicus DEM acknowledgement/DOI, Open-Meteo docs में उद्धृत: https://doi.org/10.5270/ESA-c5d3d65
