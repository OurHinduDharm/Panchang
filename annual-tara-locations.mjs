import { LOCATION_PROFILES } from "./research/drik-ganita-time-separation.mjs";

export const locations = {
  ...LOCATION_PROFILES,
  "pithoragarh-project-target": {
    ...LOCATION_PROFILES["pithoragarh-project-target"], id: 1259503,
    stateCode: "39", countryCode: "IN", timeZone: "Asia/Kolkata",
    name: "पिथौरागढ़, उत्तराखंड, भारत", city: "पिथौरागढ़", admin1: "उत्तराखंड"
  },
  "drikpanchang-almora": {
    ...LOCATION_PROFILES["drikpanchang-almora"], name: "अल्मोड़ा, उत्तराखंड, भारत",
    city: "अल्मोड़ा", admin1: "उत्तराखंड"
  },
  "drikpanchang-ramnagar": {
    ...LOCATION_PROFILES["drikpanchang-ramnagar"], name: "रामनगर, नैनीताल, उत्तराखंड, भारत",
    city: "रामनगर", admin1: "उत्तराखंड"
  },
  delhi: { name: "नई दिल्ली, दिल्ली, भारत", city: "नई दिल्ली", admin1: "दिल्ली",
    latitude: 28.6139, longitude: 77.2090, elevation: 216 },
  dehradun: { name: "देहरादून, उत्तराखंड, भारत", city: "देहरादून", admin1: "उत्तराखंड",
    latitude: 30.3165, longitude: 78.0322, elevation: 640 }
};
