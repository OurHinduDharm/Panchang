import { getPanchangam, Observer } from "https://esm.sh/@ishubhamx/panchangam-js@3.0.0";

let selectedLocation = null;
let currentSankalpContext = null;

/* =========================================================
   YATRA SHULA — UI STYLES
   ========================================================= */

const yatraShoolaStyles = document.createElement("style");

yatraShoolaStyles.textContent = `
.yatra-section {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 9px 10px;
  margin-top: 9px;
  background: rgba(0, 0, 0, 0.018);
}

.yatra-section-title {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
}

.yatra-section-title span {
  font-size: 11px;
  font-weight: 400;
  color: #777;
}

.yatra-remedy {
  margin-top: 10px;
  padding: 8px 10px;
  border-left: 3px solid #4caf50;
  border-radius: 4px;
  background: rgba(76, 175, 80, 0.07);
  font-size: 12px;
  line-height: 1.5;
}

.yatra-source {
  margin-top: 8px;
}

.yatra-note {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.025);
  color: #666;
  font-size: 11px;
  line-height: 1.5;
}
`;

document.head.appendChild(yatraShoolaStyles);

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

const directionHindi = {
  East: "पूर्व",
  West: "पश्चिम",
  North: "उत्तर",
  South: "दक्षिण"
};

/* =========================================================
   YATRA SHULA — MUHURTA CHINTAMANI
   यात्रा प्रकरण, श्लोक १०–११
   ========================================================= */

/*
 * नक्षत्रशूल
 *
 * पूर्व     → ज्येष्ठा
 * दक्षिण   → पूर्वाभाद्रपदा
 * पश्चिम   → रोहिणी
 * उत्तर    → उत्तराफाल्गुनी
 */
const nakshatraShoolaByDirection = {
  East: 17,   // ज्येष्ठा
  South: 24,  // पूर्वाभाद्रपदा
  West: 3,    // रोहिणी
  North: 11   // उत्तराफाल्गुनी
};

/*
 * कालशूल के लिए नक्षत्र-गण
 *
 * मुहूर्त चिन्तामणि यात्रा प्रकरण, श्लोक ११
 */
const kalaShoolaGroups = {
  Dhruva: {
    hindi: "ध्रुव",
    nakshatras: [
      "रोहिणी",
      "उत्तराफाल्गुनी",
      "उत्तराषाढ़ा",
      "उत्तराभाद्रपद"
    ]
  },

  Mishra: {
    hindi: "मिश्र",
    nakshatras: [
      "कृत्तिका",
      "विशाखा"
    ]
  },

  Tikshna: {
    hindi: "तीक्ष्ण",
    nakshatras: [
      "आर्द्रा",
      "आश्लेषा",
      "ज्येष्ठा",
      "मूल"
    ]
  },

  Laghu: {
    hindi: "लघु",
    nakshatras: [
      "अश्विनी",
      "पुष्य",
      "हस्त"
    ]
  },

  Mridu: {
    hindi: "मृदु",
    nakshatras: [
      "मृगशीर्ष",
      "चित्रा",
      "अनुराधा",
      "रेवती"
    ]
  },

  Ugra: {
    hindi: "उग्र",
    nakshatras: [
      "भरणी",
      "मघा",
      "पूर्वाफाल्गुनी",
      "पूर्वाषाढ़ा",
      "पूर्वाभाद्रपद"
    ]
  },

  Chara: {
    hindi: "चर",
    nakshatras: [
      "पुनर्वसु",
      "स्वाती",
      "श्रवण",
      "धनिष्ठा",
      "शतभिषा"
    ]
  }
};

/*
 * विशेष शुभ नक्षत्र
 *
 * श्रवण, हस्त, पुष्य, मृगशीर्ष
 * → श्लोक ११ में सर्वकाले शुभ
 */
const specialYatraShubhaNakshatras = [
  "श्रवण",
  "हस्त",
  "पुष्य",
  "मृगशीर्ष"
];

/*
 * वारशूल परिहार
 * गुरु के मत के अनुसार
 */
const varShoolaRemedy = {
  0: "घी",     // रविवार
  1: "दूध",    // सोमवार
  2: "गुड़",   // मंगलवार
  3: "तिल",    // बुधवार
  4: "दही",    // गुरुवार
  5: "जौ",     // शुक्रवार
  6: "उड़द"    // शनिवार
};

/*
 * चयनित दिन का relevant नक्षत्र निकालना।
 *
 * आज की तारीख पर referenceNow उपलब्ध है।
 * पुराने/भविष्य के दिन पर दोपहर 12 बजे के आसपास
 * चयनित दिन का Panchang nakshatra लिया जाएगा।
 */
function getYatraNakshatra(
  p,
  referenceNow
){
  const fallback =
    getNakshatraName(p.nakshatra);

  const baseTime =
    referenceNow ||
    new Date(
      dateInput.value + "T12:00:00"
    );

  if(
    Array.isArray(p.nakshatras)
  ){
    const found =
      p.nakshatras.find(item => {

        if(
          !item ||
          typeof item.index !== "number"
        ){
          return false;
        }

        const start =
          new Date(item.startTime);

        const end =
          new Date(item.endTime);

        if(
          isNaN(start.getTime()) ||
          isNaN(end.getTime())
        ){
          return false;
        }

        return (
          baseTime >= start &&
          baseTime < end
        );
      });

    if(found){
      return getNakshatraName(
        found.index
      );
    }
  }

  return fallback || "—";
}

function getNakshatraSanjna(
  nakshatraName
){
  for(
    const group of Object.values(
      kalaShoolaGroups
    )
  ){
    if(
      group.nakshatras.includes(
        nakshatraName
      )
    ){
      return group.hindi;
    }
  }

  return null;
}
/*
 * कालशूल के 6 काल
 *
 * दिन = 3 भाग
 * रात्रि = 3 भाग
 */
 function getKalaShoolaDetails(
  p,
  nextSunrise,
  nakshatraName,
  referenceNow
){
  const sunrise =
    new Date(p.sunrise);

  const sunset =
    new Date(p.sunset);

  const nextRise =
    nextSunrise
      ? new Date(nextSunrise)
      : null;

  if(
    isNaN(sunrise.getTime()) ||
    isNaN(sunset.getTime()) ||
    !nextRise ||
    isNaN(nextRise.getTime())
  ){
    return {
      available:false,
      periods:[],
      active:null,
      activeBlocked:false,
      blockedPeriods:[],
      upcoming:null,
      specialShubha:false
    };
  }

  /*
   * कालशूल के 6 काल
   *
   * दिन = 3 भाग
   * रात्रि = 3 भाग
   */
  const dayPartMs =
    (sunset.getTime() -
      sunrise.getTime()) / 3;

  const nightPartMs =
    (nextRise.getTime() -
      sunset.getTime()) / 3;

  const periods = [
    {
      name:"पूर्वाह्न",
      start:new Date(sunrise),
      end:new Date(
        sunrise.getTime() + dayPartMs
      ),
      groups:["ध्रुव","मिश्र"]
    },
    {
      name:"मध्याह्न",
      start:new Date(
        sunrise.getTime() + dayPartMs
      ),
      end:new Date(
        sunrise.getTime() + dayPartMs * 2
      ),
      groups:["तीक्ष्ण"]
    },
    {
      name:"अपराह्न",
      start:new Date(
        sunrise.getTime() + dayPartMs * 2
      ),
      end:new Date(sunset),
      groups:["लघु"]
    },
    {
      name:"पूर्वरात्रि",
      start:new Date(sunset),
      end:new Date(
        sunset.getTime() + nightPartMs
      ),
      groups:["मृदु"]
    },
    {
      name:"मध्यरात्रि",
      start:new Date(
        sunset.getTime() + nightPartMs
      ),
      end:new Date(
        sunset.getTime() + nightPartMs * 2
      ),
      groups:["उग्र"]
    },
    {
      name:"रात्र्यन्त",
      start:new Date(
        sunset.getTime() + nightPartMs * 2
      ),
      end:new Date(nextRise),
      groups:["चर"]
    }
  ];

  /*
   * वर्तमान 6 काल
   */
  let active = null;

  if(referenceNow){
    active =
      periods.find(period =>
        referenceNow >= period.start &&
        referenceNow < period.end
      ) || null;
  }

  /*
   * नक्षत्र-संज्ञा → कालशूल group
   */
  const getGroupForNakshatra =
    name => {

      for(
        const group of Object.values(
          kalaShoolaGroups
        )
      ){
        if(
          group.nakshatras.includes(name)
        ){
          return group;
        }
      }

      return null;
    };

  /*
   * वास्तविक नक्षत्र intervals को
   * 6 कालों के साथ intersect करें।
   *
   * इससे नक्षत्र बदलने के समय
   * कालशूल भी सही बदलता है।
   */
  const blockedPeriods = [];

  if(
    Array.isArray(p.nakshatras)
  ){

    p.nakshatras.forEach(item => {

      if(
        !item ||
        typeof item.index !== "number"
      ){
        return;
      }

      const nakStart =
        new Date(item.startTime);

      const nakEnd =
        new Date(item.endTime);

      if(
        isNaN(nakStart.getTime()) ||
        isNaN(nakEnd.getTime()) ||
        nakEnd <= nakStart
      ){
        return;
      }

      const actualNakshatra =
        getNakshatraName(item.index);

      const group =
        getGroupForNakshatra(
          actualNakshatra
        );

      if(!group){
        return;
      }

      const specialShubha =
        specialYatraShubhaNakshatras.includes(
          actualNakshatra
        );

      /*
       * विशेष शुभ नक्षत्र पर कालशूल लागू नहीं।
       */
      if(specialShubha){
        return;
      }

      periods.forEach(period => {

        /*
         * केवल overlapping समय लें।
         */
        const startMs =
          Math.max(
            period.start.getTime(),
            nakStart.getTime()
          );

        const endMs =
          Math.min(
            period.end.getTime(),
            nakEnd.getTime()
          );

        if(
          endMs <= startMs
        ){
          return;
        }

        /*
         * इस काल में यह नक्षत्र
         * उसी कालशूल group में है या नहीं।
         */
        if(
          !period.groups.includes(
            group.hindi
          )
        ){
          return;
        }

        blockedPeriods.push({
          periodName:period.name,
          start:new Date(startMs),
          end:new Date(endMs),
          nakshatraName:actualNakshatra,
          sanjna:group.hindi
        });

      });

    });

  }

  /*
   * यदि p.nakshatras उपलब्ध न हो,
   * तो वर्तमान स्थिति के लिए पुराना
   * fallback logic रखें।
   */
  let activeBlocked = false;
  let activeSegment = null;

  if(
    referenceNow &&
    active
  ){

    activeSegment =
      blockedPeriods.find(item =>
        referenceNow >= item.start &&
        referenceNow < item.end
      ) || null;

    if(activeSegment){
      activeBlocked = true;
    }
    else{

      const currentGroup =
        getGroupForNakshatra(
          nakshatraName
        );

      const specialShubha =
        specialYatraShubhaNakshatras.includes(
          nakshatraName
        );

      activeBlocked =
        !specialShubha &&
        !!currentGroup &&
        active.groups.includes(
          currentGroup.hindi
        );
    }
  }

  /*
   * वर्तमान नक्षत्र के लिए
   * special-shubha status।
   */
  const specialShubha =
    specialYatraShubhaNakshatras.includes(
      nakshatraName
    );

  /*
   * आज के वर्तमान समय के बाद आने वाला
   * अगला वास्तविक कालशूल।
   */
  let upcoming = null;

  if(referenceNow){

    upcoming =
      blockedPeriods
        .filter(item =>
          item.start > referenceNow
        )
        .sort(
          (a,b) =>
            a.start.getTime() -
            b.start.getTime()
        )[0] || null;

  }

  /*
   * Selected date के लिए chronological order।
   */
  blockedPeriods.sort(
    (a,b) =>
      a.start.getTime() -
      b.start.getTime()
  );

  return {
    available:true,
    periods,
    active,
    activeBlocked,
    activeSegment,
    blockedPeriods,
    upcoming,
    specialShubha
  };
}

/*
 * पूरी यात्रा-विचार जानकारी
 */
function getYatraShoolaDetails(
  p,
  nextSunrise,
  referenceNow,
  previousPanchang
){
  const selectedDate =
    new Date(
      dateInput.value + "T00:00:00"
    );

  /*
   * वर्तमान तारीख पर सूर्योदय से पहले,
   * अभी चल रहे सूर्योदय-से-सूर्योदय वार
   * के लिए पिछले दिन का पंचांग लें।
   * चुनी हुई पुरानी/भविष्य की तारीख नहीं बदलें।
   */
  const isPreSunriseToday = !!(
    referenceNow &&
    dateInput.value === todayString() &&
    p.sunrise &&
    referenceNow < new Date(p.sunrise)
  );

  const effectivePanchang =
    isPreSunriseToday && previousPanchang
      ? previousPanchang
      : p;

  let weekday = selectedDate.getDay();

  if (isPreSunriseToday && previousPanchang) {
    const weekdayNames = [
      "रविवार", "सोमवार", "मंगलवार", "बुधवार",
      "गुरुवार", "शुक्रवार", "शनिवार"
    ];
    const previousVara = getVara(previousPanchang);
    const previousVaraIndex = weekdayNames.indexOf(previousVara);

    if (previousVaraIndex >= 0) {
      weekday = previousVaraIndex;
    } else if (typeof previousPanchang.vara === "number") {
      weekday = previousPanchang.vara;
    }
  }

  /*
   * दिशाशूल और वारशूल परिहार एक ही
   * प्रभावी वार से लें, ताकि सूर्योदय से पहले
   * दोनों अलग-अलग वार न दिखाएँ।
   */
  const direction =
    effectivePanchang.dishaShoola?.inauspiciousDirection ||
    null;

  const directionHindiName =
    directionHindi[direction] ||
    "—";

  const nakshatraName =
    getYatraNakshatra(
      p,
      referenceNow
    );

  const nakshatraIndex =
    nakshatraHindi.indexOf(
      nakshatraName
    );

  const nakshatraShoolaDirection =
    Object.keys(
      nakshatraShoolaByDirection
    ).find(
      d =>
        nakshatraShoolaByDirection[d] ===
        nakshatraIndex
    ) || null;

  const nakshatraShoola =
    nakshatraShoolaDirection
      ? directionHindi[
          nakshatraShoolaDirection
        ]
      : null;

  const nakshatraShoolaActive =
    nakshatraShoolaDirection ===
    direction;

  const kalaShoola =
    getKalaShoolaDetails(
      p,
      nextSunrise,
      nakshatraName,
      referenceNow
    );

  return {
    weekday,
    direction,
    directionHindiName,
    nakshatraName,
    nakshatraShoola,
    nakshatraShoolaDirection,
    nakshatraShoolaActive,
    kalaShoola,
    remedy:
      varShoolaRemedy[weekday] ||
      null
  };
}
const gowriHindi = {
  Shunya: "शून्य",
  Udyoga: "उद्योग",
  Visha: "विष",
  Amrita: "अमृत",
  Roga: "रोग",
  Laabha: "लाभ",
  Dhana: "धन",
  Shubha: "शुभ"
};

 function getGowriDisplay(item){
  if(!item){
    return "—";
  }

  const name =
    gowriHindi[item.name] ||
    item.name ||
    "—";

  const rating =
    String(item.rating || "")
      .toLowerCase();

  const indicator =
    rating === "good"
      ? "🟢"
      : rating === "bad"
        ? "🔴"
        : "";

  return `${indicator}${name}`;
}


/* =========================================================
   COLLAPSIBLE TIME PERIODS
   चौघड़िया / गौरी काल
   ========================================================= */
function renderCollapsibleTimePeriods(
  items,
  title,
  referenceNow,
  displayNameFn,
  currentItems = null
){
  const list =
    Array.isArray(items)
      ? items
      : [];

  if(!list.length){
    return `
      <div class="card full">
        <div class="label">
          ${title}
        </div>
        <div style="color:#777;">
          उपलब्ध नहीं
        </div>
      </div>
    `;
  }

  /*
   * केवल आज के वास्तविक वर्तमान समय पर
   * वर्तमान चौघड़िया / गौरी निकालें।
   *
   * पुराने/भविष्य के दिन में referenceNow = null
   * रहता है, इसलिए वहाँ कोई कालखंड
   * "अभी चल रहा है" नहीं बताया जाएगा।
   */
  const currentList =
    Array.isArray(currentItems) ? currentItems : list;

  const current =
    referenceNow
      ? currentList.find(item => {

          const start =
            new Date(item.startTime);

          const end =
            new Date(item.endTime);

          return (
            !Number.isNaN(start.getTime()) &&
            !Number.isNaN(end.getTime()) &&
            referenceNow >= start &&
            referenceNow < end
          );

        })
      : null;

  /*
   * वर्तमान item का नाम
   * और उसके अनुसार हल्का रंग।
   *
   * 🟢 = शुभ
   * 🔴 = अशुभ
   * अन्य = neutral
   */
  const currentDisplay =
    current
      ? displayNameFn(current)
      : "";

  const isGood =
    currentDisplay.startsWith("🟢");

  const isBad =
    currentDisplay.startsWith("🔴");

  const currentBg =
    isGood
      ? "rgba(76,175,80,0.09)"
      : isBad
        ? "rgba(244,67,54,0.08)"
        : "rgba(128,128,128,0.06)";

  const currentBorder =
    isGood
      ? "rgba(76,175,80,0.28)"
      : isBad
        ? "rgba(244,67,54,0.25)"
        : "rgba(128,128,128,0.18)";

  /*
   * वर्तमान चौघड़िया / गौरी
   * details के बाहर रहेगा।
   *
   * इसलिए section collapsed होने पर भी
   * यह हमेशा दिखाई देगा।
   */
  const currentText =
    current
      ? `
        <div style="
          margin:0 0 7px 0;
          padding:7px 9px;
          border-radius:7px;
          background:${currentBg};
          border:1px solid ${currentBorder};
        ">
          <div class="time-row" style="
            margin:0;
            font-weight:600;
          ">
            <b>${currentDisplay}</b>
            <span>
              ${formatTimeRange(
                current.startTime,
                current.endTime
              )}
            </span>
          </div>
        </div>
      `
      : `
        <div style="
          margin:0 0 7px 0;
          padding:6px 9px;
          border-radius:6px;
          background:rgba(128,128,128,0.045);
          color:#777;
          font-size:11px;
        ">
          ${referenceNow
            ? "इस समय यह कालखंड नहीं चल रहा है।"
            : "चयनित तिथि के लिए वर्तमान समय लागू नहीं है।"
          }
        </div>
      `;

  /*
   * पूरी सूची
   */
  const allRows =
    list
      .map(item => {

        const isCurrent =
          current === item;

        return `
          <div class="time-row"
            ${isCurrent
              ? `style="font-weight:600;"`
              : ""
            }
          >
            <b>${displayNameFn(item)}</b>
            <span>
              ${formatTimeRange(
                item.startTime,
                item.endTime
              )}
            </span>
          </div>
        `;

      })
      .join("");

  return `
    <div class="card full">

      <!-- वर्तमान काल हमेशा दिखाई देगा -->
      ${currentText}

      <!-- पूरी सूची collapsed रहेगी -->
      <details>

        <summary style="
          cursor:pointer;
          font-weight:700;
          list-style-position:inside;
        ">
          ${title}

          <span style="
            float:right;
            font-size:11px;
            font-weight:400;
            color:#777;
          ">
            विस्तार करें
          </span>
        </summary>

        <div style="
          margin-top:8px;
        ">
          ${allRows}
        </div>

      </details>

    </div>
  `;
}
/* =========================================================
   SANKALP STATE (persists across type switches & date changes)
   ========================================================= */
const sankalpState = {
  type: "sandhya",

  /* Sandhya */
  sandhyaType: "pratah",
  sandhyaManualOverride: false,
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
  tarpanaTypeCustom: "",
  
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
  brahminNaam: "",

  /* Sankalp — optional night Prahar */
  includeNightPrahar: false
};

 function getPartEffect(part){

  switch(part){

    case "मुख":
      return {
        text:
          "कार्यहानि — सामान्य शुभ कार्यों के आरंभ में त्याज्य।",
        type:"avoid"
      };

    case "कंठ":
      return {
        text:
          "मृत्यु-फल से संबद्ध — शुभ कार्यों में त्याज्य।",
        type:"avoid"
      };

    case "हृदय":
      return {
        text:
          "निःस्वता अर्थात् धन-क्षय का फल।",
        type:"avoid"
      };

    case "नाभि":
      return {
        text:
          "च्युति अर्थात् स्थान या स्थिति से विचलन का फल।",
        type:"avoid"
      };

    case "कटि":
      return {
        text:
          "उन्मत्तता अर्थात् अस्थिरता का फल।",
        type:"avoid"
      };

    case "पुच्छ":
      return {
        text:
          "ध्रुव जय अर्थात् विजय और कार्यसिद्धि का फल।",
        type:"good"
      };

    default:
      return null;
  }
 }

/* =========================================================
   STAGE 3 HELPERS
   ========================================================= */
  function getBhadraDetails(
  p,
  moonRashiIndex,
  referenceNow,
  nextSunrise,
  previousSunset
){
  /*
   * =========================================================
   * भद्रा / विष्टि करण
   *
   * शास्त्रीय आधार:
   * मुहूर्त चिन्तामणि — भद्रा विचार
   *
   * भद्रा केवल इन 8 तिथियों पर:
   *
   * शुक्ल:
   * 4, 8, 11, 15
   *
   * कृष्ण:
   * 3, 7, 10, 14
   *
   * 0-based tithiIndex:
   * शुक्ल = 3, 7, 10, 14
   * कृष्ण = 17, 21, 24, 28
   * =========================================================
   */

  /*
   * ---------------------------------------------------------
   * तिथि index निकालना
   * ---------------------------------------------------------
   */
  let tithiIndex = p.tithi;

  if(
    typeof tithiIndex === "object" &&
    tithiIndex !== null
  ){
    tithiIndex =
      tithiIndex.index ??
      tithiIndex.number ??
      tithiIndex.value;
  }

  /*
   * ---------------------------------------------------------
   * पक्ष निकालना
   * ---------------------------------------------------------
   */
  const pakshaValue =
    typeof p.paksha === "object" &&
    p.paksha !== null
      ? (
          p.paksha.name ??
          p.paksha.value
        )
      : p.paksha;

  const pakshaText =
    String(pakshaValue || "")
      .toLowerCase();

  const pakshaKey =
    pakshaText.includes("shukla")
      ? "Shukla"
      : (
          pakshaText.includes("krishna") ||
          pakshaText.includes("kṛṣṇa")
        )
          ? "Krishna"
          : null;

  /*
   * ---------------------------------------------------------
   * STRICT BHADRA TITHI GUARD
   * ---------------------------------------------------------
   */
  const validBhadraTithis = [
    3, 7, 10, 14,
    17, 21, 24, 28
  ];

  if(
    !validBhadraTithis.includes(
      tithiIndex
    )
  ){
    return {
      available:false,
      reason:"Non-Bhadra Tithi"
    };
  }

  /*
   * ---------------------------------------------------------
   * भद्रा पूर्वार्ध / उत्तरार्ध
   * ---------------------------------------------------------
   */
  let bhadraHalf = null;

  if(pakshaKey === "Shukla"){

    if(
      [3,10].includes(tithiIndex)
    ){
      bhadraHalf = "उत्तरार्ध";
    }
    else if(
      [7,14].includes(tithiIndex)
    ){
      bhadraHalf = "पूर्वार्ध";
    }

  }
  else if(pakshaKey === "Krishna"){

    if(
      [17,24].includes(tithiIndex)
    ){
      bhadraHalf = "उत्तरार्ध";
    }
    else if(
      [21,28].includes(tithiIndex)
    ){
      bhadraHalf = "पूर्वार्ध";
    }

  }

  /*
   * ---------------------------------------------------------
   * केवल Vishti करण खोजें
   * ---------------------------------------------------------
   */
  const vishtiCandidates =
    (p.karanas || [])
      .filter(
        k =>
          k &&
          String(k.name || "")
            .toLowerCase() === "vishti"
      )
      .map(k => ({
        raw:k,
        start:new Date(k.startTime),
        end:new Date(k.endTime)
      }))
      .filter(k =>
        !isNaN(k.start.getTime()) &&
        !isNaN(k.end.getTime()) &&
        k.end > k.start
      );

  /*
   * आज की तारीख पर यदि अभी Vishti चल रही है
   * तो उसे प्राथमिकता।
   */
  let vishtiKarana = null;

  if(referenceNow){

    vishtiKarana =
      vishtiCandidates.find(
        k =>
          referenceNow >= k.start &&
          referenceNow < k.end
      ) || null;

  }

  /*
   * अन्यथा चयनित civil date से संबंधित Vishti लें।
   */
  if(!vishtiKarana){

    const selectedDayStart =
      new Date(
        dateInput.value + "T00:00:00"
      );

    const selectedDayEnd =
      new Date(selectedDayStart);

    selectedDayEnd.setDate(
      selectedDayEnd.getDate() + 1
    );

    vishtiKarana =
      vishtiCandidates.find(
        k =>
          k.start < selectedDayEnd &&
          k.end > selectedDayStart
      ) || null;
  }

  if(!vishtiKarana){

    return {
      available:false,
      reason:"Vishti not found"
    };

  }

  const start =
    vishtiKarana.start;

  const end =
    vishtiKarana.end;

  const totalMs =
    end.getTime() -
    start.getTime();

  if(totalMs <= 0){

    return {
      available:false
    };

  }

  /*
   * =========================================================
   * भद्रा के 6 अंग
   *
   * मुख  5
   * कंठ  1
   * हृदय 11
   * नाभि  4
   * कटि   6
   * पुच्छ 3
   *
   * कुल = 30
   *
   * वास्तविक Vishti अवधि पर त्रैराशिक।
   * =========================================================
   */

  const partNames = [
    "मुख",
    "कंठ",
    "हृदय",
    "नाभि",
    "कटि",
    "पुच्छ"
  ];

  const partRatios = [
    5,
    1,
    11,
    4,
    6,
    3
  ];

  const ratioTotal = 30;

  const parts = [];

  let activeIndex = -1;

  let cursor =
    start.getTime();

  for(
    let i = 0;
    i < partNames.length;
    i++
  ){

    const partMs =
      totalMs *
      partRatios[i] /
      ratioTotal;

    const pStart =
      new Date(cursor);

    const pEnd =
      new Date(
        i === partNames.length - 1
          ? end.getTime()
          : cursor + partMs
      );

    const isActive = !!(
      referenceNow &&
      referenceNow >= pStart &&
      referenceNow < pEnd
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

    cursor =
      pEnd.getTime();
  }

  /*
   * =========================================================
   * भद्रा मुख / पुच्छ
   *
   * मुहूर्त चिन्तामणि के अनुसार:
   *
   * पूर्ण तिथि-मान = 60 घटी मानकर
   *
   * 1 प्रहर = तिथि का 1/8
   *
   * मुख = 5 घटी
   *      = तिथि का 5/60
   *      = तिथि का 1/12
   *
   * पुच्छ = 3 घटी
   *       = तिथि का 3/60
   *       = तिथि का 1/20
   *
   * वास्तविक तिथि छोटी/बड़ी हो तो
   * यही अनुपात वास्तविक तिथि पर लगाया जाता है।
   * =========================================================
   */

  const bhadraPraharRules = {

    Shukla:{
      3:{
        mukha:5,
        puccha:8
      },

      7:{
        mukha:2,
        puccha:1
      },

      10:{
        mukha:7,
        puccha:6
      },

      14:{
        mukha:4,
        puccha:3
      }
    },

    Krishna:{
      17:{
        mukha:8,
        puccha:7
      },

      21:{
        mukha:3,
        puccha:2
      },

      24:{
        mukha:6,
        puccha:5
      },

      28:{
        mukha:1,
        puccha:4
      }
    }

  };

  const praharRule =
    bhadraPraharRules[pakshaKey]?.[
      tithiIndex
    ] || null;

  let mukha = null;
  let puccha = null;

  /*
   * ---------------------------------------------------------
   * वास्तविक तिथि का Start / End
   *
   * Library के scalar tithiStartTime / tithiEndTime
   * sunrise वाली तिथि की वास्तविक सीमा देते हैं।
   * ---------------------------------------------------------
   */
  const tithiStart =
    p.tithiStartTime
      ? new Date(p.tithiStartTime)
      : null;

  const tithiEnd =
    p.tithiEndTime
      ? new Date(p.tithiEndTime)
      : null;

  if(
    praharRule &&
    tithiStart &&
    tithiEnd &&
    !isNaN(tithiStart.getTime()) &&
    !isNaN(tithiEnd.getTime()) &&
    tithiEnd > tithiStart
  ){

    const tithiDuration =
      tithiEnd.getTime() -
      tithiStart.getTime();

    /*
     * एक शास्त्रीय प्रहर =
     * पूर्ण तिथि का 1/8
     */
    const tithiPraharMs =
      tithiDuration / 8;

    /*
     * 5 घटी मुख =
     * वास्तविक तिथि का 5/60 = 1/12
     */
    const mukhaDurationMs =
      tithiDuration / 12;

    /*
     * 3 घटी पुच्छ =
     * वास्तविक तिथि का 3/60 = 1/20
     */
    const pucchaDurationMs =
      tithiDuration / 20;

    /*
     * -------------------------------------------------------
     * मुख
     *
     * संबंधित प्रहर के आरंभ से।
     * -------------------------------------------------------
     */
    const mukhaPraharStart =
      new Date(
        tithiStart.getTime() +
        (
          praharRule.mukha - 1
        ) *
        tithiPraharMs
      );

    const mukhaEnd =
      new Date(
        mukhaPraharStart.getTime() +
        mukhaDurationMs
      );

    mukha = {
      prahar:
        praharRule.mukha,

      start:
        mukhaPraharStart,

      end:
        mukhaEnd,

      isActive:!!(
        referenceNow &&
        referenceNow >= mukhaPraharStart &&
        referenceNow < mukhaEnd
      )
    };

    /*
     * -------------------------------------------------------
     * पुच्छ
     *
     * संबंधित प्रहर के अंतिम 3 घटी।
     * -------------------------------------------------------
     */
    const pucchaPraharStart =
      new Date(
        tithiStart.getTime() +
        (
          praharRule.puccha - 1
        ) *
        tithiPraharMs
      );

    const pucchaPraharEnd =
      new Date(
        pucchaPraharStart.getTime() +
        tithiPraharMs
      );

    const pucchaStart =
      new Date(
        pucchaPraharEnd.getTime() -
        pucchaDurationMs
      );

    puccha = {
      prahar:
        praharRule.puccha,

      start:
        pucchaStart,

      end:
        pucchaPraharEnd,

      isActive:!!(
        referenceNow &&
        referenceNow >= pucchaStart &&
        referenceNow < pucchaPraharEnd
      )
    };

  }

  /*
   * =========================================================
   * भद्रा निवास
   *
   * मेष, वृषभ, मिथुन, वृश्चिक → स्वर्ग
   * कन्या, तुला, धनु, मकर → पाताल
   * कुम्भ, मीन, कर्क, सिंह → मृत्युलोक
   * =========================================================
   */

  let niwas = "—";
  let niwasColor = "#95a5a6";

  const isActiveOverall = !!(
    referenceNow &&
    referenceNow >= start &&
    referenceNow < end
  );

  let rashiIndex = null;

  if(
    typeof moonRashiIndex === "number"
  ){
    rashiIndex =
      moonRashiIndex + 1;
  }
  else if(
    typeof p.moonRashi?.index === "number"
  ){
    rashiIndex =
      p.moonRashi.index + 1;
  }
  else if(
    typeof p.moonLongitude === "number"
  ){
    rashiIndex =
      Math.floor(
        p.moonLongitude / 30
      ) + 1;
  }

  const swargaRashi = [
    1,2,3,8
  ];

  const patalRashi = [
    6,7,9,10
  ];

    if(
    rashiIndex !== null &&
    rashiIndex >= 1 &&
    rashiIndex <= 12
  ){
    if(
      swargaRashi.includes(
        rashiIndex
      )
    ){

      niwas = "स्वर्ग";
      niwasColor = "#2ecc71";

    }
    else if(
      patalRashi.includes(
        rashiIndex
      )
    ){

      niwas = "पाताल";
      niwasColor = "#8e44ad";

    }
    else{

      niwas = "मृत्युलोक";
      niwasColor = "#e67e22";

    }

  }

  /*
   * =========================================================
   * भद्रा — दिन / रात्रि एवं परिहार
   *
   * मुख्य आधार:
   * मुहूर्त चिन्तामणि — भद्रा विचार, श्लोक ४४
   *
   * तिथि के उत्तरार्ध की भद्रा यदि दिन में हो
   * तथा तिथि के पूर्वार्ध की भद्रा यदि रात्रि में हो,
   * तो विशेष परिहार माना गया है।
   * =========================================================
   */

  const sunrise =
    p.sunrise
      ? new Date(p.sunrise)
      : null;

  const sunset =
    p.sunset
      ? new Date(p.sunset)
      : null;

  const previousSunsetDate =
    previousSunset
      ? new Date(previousSunset)
      : null;

  const nextSunriseDate =
    nextSunrise
      ? new Date(nextSunrise)
      : null;

  const validTime =
    date => (
      date &&
      !isNaN(date.getTime())
    );

  /*
   * भद्रा का वास्तविक interval
   * दिन/रात्रि से overlap।
   */
  const dayStart =
    validTime(sunrise)
      ? sunrise
      : null;

  const dayEnd =
    validTime(sunset)
      ? sunset
      : null;

  const nightStart =
    validTime(sunset)
      ? sunset
      : previousSunsetDate;

  const nightEnd =
    validTime(nextSunriseDate)
      ? nextSunriseDate
      : null;

  const overlaps =
    (aStart, aEnd, bStart, bEnd) =>
      validTime(aStart) &&
      validTime(aEnd) &&
      validTime(bStart) &&
      validTime(bEnd) &&
      aStart.getTime() < bEnd.getTime() &&
      aEnd.getTime() > bStart.getTime();

  const bhadraDayOverlap =
    overlaps(
      start,
      end,
      dayStart,
      dayEnd
    );

  const bhadraNightOverlap =
    overlaps(
      start,
      end,
      nightStart,
      nightEnd
    );

  /*
   * विशेष शास्त्रीय परिहार
   *
   * उत्तरार्ध + दिन
   * पूर्वार्ध + रात्रि
   */
  const specialParihara =
    (
      bhadraHalf === "उत्तरार्ध" &&
      bhadraDayOverlap
    ) ||
    (
      bhadraHalf === "पूर्वार्ध" &&
      bhadraNightOverlap
    );

  /*
   * शास्त्रीय फल
   */
  let shastriyaPhal = "";

  if(niwas === "मृत्युलोक"){
    shastriyaPhal =
      "मृत्युलोकवासी भद्रा पृथ्वी के सामान्य शुभ एवं मांगलिक कार्यों में दोषकारी मानी गई है; ऐसे कार्यों में भद्रा का त्याग उचित माना जाता है।";
  }
  else if(niwas === "स्वर्ग"){
    shastriyaPhal =
      "स्वर्गवासी भद्रा का फल स्वर्ग के लिए माना गया है; पृथ्वी पर इसके भद्रा-दोष का प्रभाव सामान्यतः नहीं माना जाता।";
  }
  else if(niwas === "पाताल"){
    shastriyaPhal =
      "पातालवासी भद्रा का फल पाताल में माना गया है; शास्त्रीय मत में इसे धनागम से संबद्ध माना गया है।";
  }

  /*
   * यदि शास्त्रीय परिहार लागू है,
   * तो उसे अलग और स्पष्ट रखें।
   */
  let pariharaText = "";

  if(specialParihara){

    if(bhadraHalf === "उत्तरार्ध"){
      pariharaText =
        "तिथि के उत्तरार्ध की यह भद्रा दिन में है; मुहूर्त चिन्तामणि के अनुसार ऐसी स्थिति में भद्रा-दोष का परिहार माना गया है।";
    }
    else if(bhadraHalf === "पूर्वार्ध"){
      pariharaText =
        "तिथि के पूर्वार्ध की यह भद्रा रात्रि में है; मुहूर्त चिन्तामणि के अनुसार ऐसी स्थिति में भद्रा-दोष का परिहार माना गया है।";
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

    isActive:
      isActiveOverall,

    bhadraHalf,

    mukha,
    puccha,

    mukhaPrahar:
      praharRule?.mukha ||
      null,

    pucchaPrahar:
      praharRule?.puccha ||
      null,

    /*
     * दिन / रात्रि स्थिति
     */
    bhadraDayOverlap,
    bhadraNightOverlap,

    /*
     * शास्त्रीय परिहार
     */
    specialParihara,
    pariharaText,

    /*
     * शास्त्रीय फल
     */
    shastriyaPhal,

    source:
      "मुहूर्त चिन्तामणि — शुभाशुभ प्रकरण, श्लोक ४४–४५"

  };
}

/* =========================================================
   SPECIAL KAAL / MUHURTA
   ========================================================= */
function getSpecialKaalDetails(
  p,
  nextSunriseTime
){
  const sunrise = new Date(p.sunrise);
  const sunset = new Date(p.sunset);
  const nextSunrise = nextSunriseTime
    ? new Date(nextSunriseTime)
    : null;

  if(
    isNaN(sunrise.getTime()) ||
    isNaN(sunset.getTime()) ||
    !nextSunrise ||
    isNaN(nextSunrise.getTime())
  ){
    return {
      pratahSandhya:null,
      vijayaMuhurta:null,
      godhuliMuhurta:null,
      sayahnaSandhya:null,
      nishitaKaal:null
    };
  }

  /* दिनमान */
  const dayMs =
    sunset.getTime() -
    sunrise.getTime();

  /* रात्रिमान */
  const nightMs =
    nextSunrise.getTime() -
    sunset.getTime();

  /*
   * दिन के 15 मुहूर्त
   */
  const dayMuhurtaMs =
    dayMs / 15;

  /*
   * रात के 15 मुहूर्त
   */
  const nightMuhurtaMs =
    nightMs / 15;

  /*
   * प्रातः संध्या
   * रात्रि के अंतिम 1/15 भाग से सूर्योदय तक।
   * अवधि वास्तविक रात्रिमान से निकलेगी।
   */
  const pratahSandhya = {
    start:new Date(
      sunrise.getTime() - nightMuhurtaMs
    ),
    end:new Date(
      sunrise.getTime()
    )
  };

  /*
   * विजय मुहूर्त
   * दिन के 15 मुहूर्तों में 11वाँ मुहूर्त
   */
  const vijayaMuhurta = {
    start:new Date(
      sunrise.getTime() + dayMuhurtaMs * 10
    ),
    end:new Date(
      sunrise.getTime() + dayMuhurtaMs * 11
    )
  };

  /*
   * गोधूलि मुहूर्त
   * सूर्यास्त से 12 मिनट पूर्व → 12 मिनट बाद
   */
  const godhuliMuhurta = {
    start:new Date(
      sunset.getTime() - 12 * 60 * 1000
    ),
    end:new Date(
      sunset.getTime() + 12 * 60 * 1000
    )
  };

  /*
   * सायं संध्या
   * सूर्यास्त से अगले 1 रात्रि-मुहूर्त तक।
   * अवधि वास्तविक रात्रिमान से निकलेगी।
   */
  const sayahnaSandhya = {
    start:new Date(
      sunset.getTime()
    ),
    end:new Date(
      sunset.getTime() + nightMuhurtaMs
    )
  };

  /*
   * निशीथ काल
   * रात्रि के 15 मुहूर्तों में 8वाँ मुहूर्त
   */
  const nishitaKaal = {
    start:new Date(
      sunset.getTime() + nightMuhurtaMs * 7
    ),
    end:new Date(
      sunset.getTime() + nightMuhurtaMs * 8
    )
  };

  return {
    pratahSandhya,
    vijayaMuhurta,
    godhuliMuhurta,
    sayahnaSandhya,
    nishitaKaal
  };
}
function getPraharDetails(
  p,
  nextSunriseTime,
  previousSunsetTime,
  referenceNow
){

  const sunrise =
    new Date(p.sunrise);

  const sunset =
    new Date(p.sunset);

  const now =
    referenceNow;

  if(!nextSunriseTime){

    return {
      nightPrahar:[],
      currentPrahar:null,
      error:"अगला सूर्योदय उपलब्ध नहीं"
    };
  }

  const nextSunrise =
    new Date(nextSunriseTime);

  const shouldHighlight =
    !!(
      now &&
      dateInput.value === todayString()
    );

  /*
   * ---------------------------------------------------------
   * वर्तमान रात्रि की सही सीमा
   *
   * यदि अभी today's sunrise से पहले है,
   * तो current astronomical night पिछली sunset से
   * today's sunrise तक है।
   *
   * अन्यथा today's sunset से next sunrise तक।
   * ---------------------------------------------------------
   */

  let nightStart;
  let nightEnd;

  if(
    shouldHighlight &&
    now < sunrise &&
    previousSunsetTime
  ){

    nightStart =
      new Date(
        previousSunsetTime
      );

    nightEnd =
      sunrise;

  }else{

    nightStart =
      sunset;

    nightEnd =
      nextSunrise;
  }

  const nightDuration =
    nightEnd.getTime() -
    nightStart.getTime();

  if(nightDuration <= 0){

    return {
      nightPrahar:[],
      currentPrahar:null,
      error:"रात्रि अवधि अमान्य"
    };
  }

  const nightPraharMs =
    nightDuration / 4;

  const nightPrahar = [];

  for(
    let i = 0;
    i < 4;
    i++
  ){

    const start =
      new Date(
        nightStart.getTime() +
        i * nightPraharMs
      );

    const end =
      new Date(
        nightStart.getTime() +
        (i + 1) * nightPraharMs
      );

    const isActive =
      shouldHighlight &&
      now >= start &&
      now < end;

    nightPrahar.push({
      start,
      end,
      isActive,
      type:"night"
    });
  }

  let currentPrahar = null;

  if(shouldHighlight){

    currentPrahar =
      nightPrahar.find(
        item => item.isActive
      ) || null;
  }

  return {
    nightPrahar,
    currentPrahar
  };
}
function getGhatiPal(
  p,
  nextSunriseTime,
  previousSunriseTime,
  referenceNow
){

  if(!referenceNow){

    return {
      ghati:null,
      pal:null,
      error:"चयनित तिथि आज नहीं है"
    };
  }

  if(!nextSunriseTime){

    return {
      ghati:null,
      pal:null,
      error:"अगला सूर्योदय उपलब्ध नहीं"
    };
  }

  const sunrise =
    new Date(p.sunrise);

  const nextSunrise =
    new Date(nextSunriseTime);

  const previousSunrise =
    previousSunriseTime
      ? new Date(previousSunriseTime)
      : null;

  const now =
    referenceNow;

  /*
   * ---------------------------------------------------------
   * सामान्य स्थिति:
   * आज के sunrise से अगले sunrise तक
   * ---------------------------------------------------------
   */

  let dayStart =
    sunrise;

  let dayEnd =
    nextSunrise;

  /*
   * ---------------------------------------------------------
   * Midnight → today's sunrise
   *
   * अभी current astronomical day पिछली sunrise से
   * चल रहा है।
   * ---------------------------------------------------------
   */

  if(
    now < sunrise
  ){

    if(!previousSunrise){

      return {
        ghati:null,
        pal:null,
        error:"पिछला सूर्योदय उपलब्ध नहीं"
      };
    }

    dayStart =
      previousSunrise;

    dayEnd =
      sunrise;
  }

  const totalMs =
    dayEnd.getTime() -
    dayStart.getTime();

  if(totalMs <= 0){

    return {
      ghati:null,
      pal:null,
      error:"अहोरात्र अवधि अमान्य"
    };
  }

  const diffMs =
    now.getTime() -
    dayStart.getTime();

  if(
    diffMs < 0 ||
    diffMs >= totalMs
  ){

    return {
      ghati:null,
      pal:null,
      error:"वर्तमान समय अहोरात्र सीमा से बाहर"
    };
  }

  /*
   * पूर्ण अहोरात्र = 60 घटी
   * 1 घटी = 60 पल
   */

  const ghatiMs =
    totalMs / 60;

  const palMs =
    ghatiMs / 60;

  const ghatiIndex =
    Math.floor(
      diffMs / ghatiMs
    );

  const remainingMs =
    diffMs % ghatiMs;

  const pal =
    Math.floor(
      remainingMs / palMs
    );

  return {
    ghati:
      ghatiIndex + 1,

    pal,

    dayStart,
    dayEnd
  };
}
 
 function getBhadraSuggestion(
  bhadraDetails,
  referenceNow
){
  if(!bhadraDetails || !bhadraDetails.available){
    return null;
  }

  const niwas = bhadraDetails.niwas;

  /* वर्तमान भद्रा अंग */
  const activePart =
    bhadraDetails.parts?.find(
      part => part.isActive
    );

  /* =========================
     चल रही भद्रा
     ========================= */
  if(bhadraDetails.isActive){

    const partName =
      activePart?.name || "";

    if(niwas === "मृत्युलोक"){
      return {
        text:
          `🔴 भद्रा चल रही है` +
          `${partName ? ` — वर्तमान अंग: ${partName}` : ""}। ` +
          `परंपरानुसार सामान्य शुभ एवं मांगलिक कार्यों का आरंभ इस समय टालना उचित है। ` +
          `आवश्यक कार्य हो तो भद्रा के अंग और अन्य मुहूर्त भी देखें।`,
        type:"avoid"
      };
    }

    if(niwas === "स्वर्ग"){
      return {
        text:
          `🟢 भद्रा चल रही है` +
          `${partName ? ` — वर्तमान अंग: ${partName}` : ""}। ` +
          `स्वर्गवासी भद्रा को पृथ्वी पर सामान्यतः शुभ फलदायिनी माना जाता है; ` +
          `फिर भी विशेष मांगलिक कार्य के लिए अन्य मुहूर्त भी देखना उचित है।`,
        type:"neutral"
      };
    }

    if(niwas === "पाताल"){
      return {
        text:
          `🟢 भद्रा चल रही है` +
          `${partName ? ` — वर्तमान अंग: ${partName}` : ""}। ` +
          `पातालवासी भद्रा को धनागम एवं शुभ फल से संबद्ध माना जाता है; ` +
          `फिर भी विशेष मांगलिक कार्य के लिए संपूर्ण मुहूर्त देखना उचित है।`,
        type:"neutral"
      };
    }

    return null;
  }

  /* =========================
     भद्रा प्रारंभ होने वाली है
     ========================= */
  if(
    bhadraDetails.start &&
    bhadraDetails.end &&
    bhadraDetails.isActive === false &&
  referenceNow &&
  referenceNow < bhadraDetails.start
  ){

    if(niwas === "मृत्युलोक"){
      return {
        text:
          `🔴 भद्रा प्रारंभ होने वाली है। ` +
          `इसके आरंभ होने के बाद सामान्य शुभ एवं मांगलिक कार्यों का आरंभ टालना उचित है।`,
        type:"avoid"
      };
    }

    if(niwas === "स्वर्ग"){
      return {
        text:
          `🟢 भद्रा प्रारंभ होने वाली है। ` +
          `स्वर्गवासी भद्रा को पृथ्वी पर सामान्यतः शुभ फलदायिनी माना जाता है; ` +
          `फिर भी विशेष मांगलिक कार्य के लिए सम्पूर्ण मुहूर्त देखना उचित है।`,
        type:"neutral"
      };
    }

    if(niwas === "पाताल"){
      return {
        text:
          `🟢 भद्रा प्रारंभ होने वाली है। ` +
          `पातालवासी भद्रा को धनागम एवं शुभ फल से संबद्ध माना जाता है; ` +
          `फिर भी विशेष मांगलिक कार्य के लिए संपूर्ण मुहूर्त देखना उचित है।`,
        type:"neutral"
      };
    }
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

function formatDateTimeRangeHindi(start,end){
  if(!start || !end) return "—";

  try{
    const startDate = new Date(start);
    const endDate = new Date(end);

    if(
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ){
      return "—";
    }

    return (
      `${formatDateTimeHindi(startDate)} से ` +
      `${formatDateTimeHindi(endDate)} तक`
    );

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
function getCurrentKaalPrahar(
  p,
  praharData,
  referenceNow
){
  if(!referenceNow){
    return {
      kaal:"",
      praharName:""
    };
  }

  const sunrise = new Date(p.sunrise);
  const sunset = new Date(p.sunset);
  const now = referenceNow;

  let kaal = "";
  let praharName = "";

  /*
   * ---------------------------------------------------------
   * दिन का काल
   *
   * Classical Panchadha:
   * प्रातः → संगव → मध्याह्न → अपराह्न → सायाह्न
   *
   * Sankalp में इन्हें चार broad कालों में map किया जाता है:
   *
   * प्रातः + संगव      → प्रातः
   * मध्याह्न            → मध्याह्न
   * अपराह्न + सायाह्न → सायं
   *
   * ---------------------------------------------------------
   */

  if(now < sunrise){

    const brahmaStart =
      p?.brahmaMuhurta?.start
        ? new Date(p.brahmaMuhurta.start)
        : null;

    if(
      brahmaStart &&
      !Number.isNaN(brahmaStart.getTime()) &&
      now >= brahmaStart
    ){
      kaal = "प्रातः";
    }else{
      kaal = "रात्रि";
    }

  }else if(
    now >= sunrise &&
    now < sunset
  ){

    const dayMs =
      sunset.getTime() -
      sunrise.getTime();

    const oneFifth =
      dayMs / 5;

    const fromSunrise =
      now.getTime() -
      sunrise.getTime();

    if(fromSunrise < 2 * oneFifth){

      kaal = "प्रातः";

    }else if(
      fromSunrise < 3 * oneFifth
    ){

      kaal = "मध्याह्न";

    }else{

      kaal = "सायं";
    }

  }else{

    /*
     * सूर्यास्त के बाद से अगले सूर्योदय तक
     * रात्रि।
     */
    kaal = "रात्रि";

    /*
     * रात्रि प्रहर केवल तभी Sankalp में जोड़ें
     * जब user ने checkbox ON किया हो।
     */
    if(
      kaal === "रात्रि" &&
      sankalpState.includeNightPrahar &&
      praharData &&
      Array.isArray(
        praharData.nightPrahar
      )
    ){

      const nightActive =
        praharData.nightPrahar.find(
          pr => pr.isActive
        );

      const names = [
        "प्रथम",
        "द्वितीय",
        "तृतीय",
        "चतुर्थ"
      ];

      if(nightActive){

        const idx =
          praharData.nightPrahar.indexOf(
            nightActive
          );

        if(
          idx >= 0 &&
          idx < 4
        ){
          praharName =
            names[idx];
        }
      }
    }
  }

  return {
    kaal,
    praharName
  };
}

/* =========================================================
   SANKALP TYPE — AUTO SANDHYA
   ========================================================= */
function getAutoSandhyaType(
  p = null,
  praharData = null,
  referenceNow = null
){

  const isToday =
    dateInput.value === todayString();

  if(
    !isToday ||
    !p ||
    !referenceNow
  ){
    return "pratah";
  }

  const sunrise =
    new Date(p.sunrise);

  const sunset =
    new Date(p.sunset);

  const now =
    referenceNow;

  /*
   * वास्तविक रात्रिमान:
   * sunset → next sunrise.
   *
   * चार Night Prahar से कुल रात्रि अवधि
   * निकालकर 15 रात्रि-मुहूर्त प्राप्त होते हैं।
   */
  let nightMuhurtaMs = null;

  if(
    praharData &&
    Array.isArray(praharData.nightPrahar)
  ){
    const night =
      praharData.nightPrahar;

    if(
      night.length === 4 &&
      night[0]?.start &&
      night[3]?.end
    ){
      const nightMs =
        new Date(night[3].end).getTime() -
        new Date(night[0].start).getTime();

      if(nightMs > 0){
        nightMuhurtaMs =
          nightMs / 15;
      }
    }
  }

  /*
   * सूर्यास्त के बाद पहला रात्रि-मुहूर्त
   * सायं संध्या है।
   */
  if(now >= sunset){

    if(
      nightMuhurtaMs &&
      now.getTime() <
        sunset.getTime() + nightMuhurtaMs
    ){
      return "sayam";
    }

    return "turiya";
  }

  /*
   * सूर्योदय से पहले अंतिम रात्रि-मुहूर्त
   * प्रातः संध्या है।
   *
   * उससे पहले के समय को स्वतः तुरीय
   * नहीं माना जाएगा।
   */
  if(now < sunrise){

    if(
      nightMuhurtaMs &&
      now.getTime() >=
        sunrise.getTime() - nightMuhurtaMs
    ){
      return "pratah";
    }

    /*
     * Brahma Muhurta के बाद pre-sunrise समय
     * morning context है; केवल उससे पहले तुरीय।
     */
    const brahmaStart =
      p?.brahmaMuhurta?.start
        ? new Date(p.brahmaMuhurta.start)
        : null;

    if(
      brahmaStart &&
      !Number.isNaN(brahmaStart.getTime()) &&
      now >= brahmaStart
    ){
      return "pratah";
    }

    return "turiya";
  }

  /*
   * दिन के broad Panchadha काल:
   * प्रातः + संगव → प्रातः
   * मध्याह्न → मध्याह्न
   * अपराह्न + सायाह्न → सायं
   */
  const dayMs =
    sunset.getTime() -
    sunrise.getTime();

  const oneFifth =
    dayMs / 5;

  const fromSunrise =
    now.getTime() -
    sunrise.getTime();

  if(
    fromSunrise < 2 * oneFifth
  ){
    return "pratah";
  }

  if(
    fromSunrise < 3 * oneFifth
  ){
    return "madhyahna";
  }

  return "sayam";
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
        pratah:"प्रातः", madhyahna:"मध्याह्न", sayam:"सायं", turiya:"तुरीय"
      };

      const time = timeMap[st.sandhyaType] || "प्रातः";

      return `ममोपात्त-समस्त-दुरितक्षयद्वारा ${dev} प्रीत्यर्थं ${time}-संध्योपासनं`;
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
          ? "एकपार्वण-श्राद्धं"
          : st.tarpanaType === "अन्य"
            ? (
                String(
                  st.tarpanaTypeCustom || ""
                ).trim() || "तर्पणं / श्राद्धं"
              )
            : "तिलाञ्जलि-तर्पणम्";

      return `मम समस्तपितॄणां अक्षयतृप्तिनिमित्तकं, ${act}`;
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

      return `श्रीसाम्बसदाशिवप्रीत्यर्थं लिङ्गोपरि यथोपचारैः श्रीसाम्बसदाशिवपूजनपूर्वकं ${dravya}धारया ${path} रुद्राभिषेकं`;
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

      return "मम सकलदुरितक्षयपूर्वकं नित्यकल्याणलाभाय श्रीपरमेश्वरप्रीत्यर्थं यथाशक्ति पूजन-जपादिकं";
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
    ? `${sunRashiForm} राशि स्थिते अर्के`
    : "";

const chandraSthitiForm =
  moonRashiForm && moonRashiForm !== "—"
    ? `${moonRashiForm} राशि स्थिते चन्द्रे`
    : "";

  const locationForm = formatSankalpLocation(ctx.location);

  const kaalPrahar = getCurrentKaalPrahar(
    ctx.panchang,
    ctx.praharData,
    ctx.referenceNow
  );

const kaalForm = {
  "प्रातः": "प्रातःकाले",
  "मध्याह्न": "मध्याह्नकाले",
  "सायं": "सायंकाले",
  "रात्रि": "रात्रिकाले"
}[kaalPrahar.kaal] || "";

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

    <div class="sankalp-night-prahar-toggle"
         style="
           margin-top:10px;
           padding:8px 10px;
           border:1px solid #e2e2e2;
           border-radius:8px;
           background:#fafafa;
         ">

      <label style="
        display:flex;
        align-items:center;
        gap:7px;
        cursor:pointer;
        font-size:13px;
      ">

        <input
          type="checkbox"
          id="sankalpNightPrahar"
          ${sankalpState.includeNightPrahar ? "checked" : ""}
          ${
            currentSankalpContext?.referenceNow &&
            getCurrentKaalPrahar(
              currentSankalpContext.panchang,
              currentSankalpContext.praharData,
              currentSankalpContext.referenceNow
            ).kaal === "रात्रि"
              ? ""
              : "disabled"
          }
        />

        <span>
          संकल्प में रात्रि प्रहर जोड़ें
        </span>

      </label>

    </div>

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
const nightPraharEl = document.getElementById(
  "sankalpNightPrahar"
);

if(nightPraharEl){
  nightPraharEl.addEventListener(
    "change",
    e => {
      sankalpState.includeNightPrahar =
        e.target.checked;

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
        <label><input type="radio" name="sandhyaType" value="turiya" ${st.sandhyaType==="turiya"?"checked":""}/> तुरीय संध्या</label>
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
            st.sandhyaManualOverride = true;
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
          <label>
            <input
              type="radio"
              name="tarpanaType"
              value="tilanjali"
              ${st.tarpanaType==="tilanjali"?"checked":""}
            />
            तिलाञ्जलि-तर्पणम्
          </label>

          <label>
            <input
              type="radio"
              name="tarpanaType"
              value="ekaparvan"
              ${st.tarpanaType==="ekaparvan"?"checked":""}
            />
            एकपार्वण-श्राद्ध-कर्म
          </label>

          <label>
            <input
              type="radio"
              name="tarpanaType"
              value="अन्य"
              ${st.tarpanaType==="अन्य"?"checked":""}
            />
            अन्य
          </label>
        </div>

        ${
          st.tarpanaType === "अन्य"
            ? `
              <input
                type="text"
                id="tarpanaTypeCustom"
                placeholder="श्राद्ध / तर्पण का प्रकार लिखें"
                value="${escapeHtmlAttr(st.tarpanaTypeCustom || "")}"
                autocomplete="off"
                style="margin-top:6px;"
              />
            `
            : ""
        }
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

            renderSankalpTypeInputs();
            updateSankalpText();
          }
        });
      });

    const tc = document.getElementById(
      "tarpanaTypeCustom"
    );

    if(tc){
      tc.addEventListener("input", e => {
        st.tarpanaTypeCustom =
          e.target.value;

        updateSankalpText();
      });
    }

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
  return String(str);
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
let nextMoonset = null;

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

if(
  !p.moonset &&
  nextPanchang &&
  nextPanchang.moonset &&
  nextPanchang.moonset <= nextSunrise
){
  nextMoonset =
    nextPanchang.moonset;
}
    }catch(e){
      console.warn(
        "Next sunrise calculation failed:",
        e
      );
    }

let previousSunset = null;
let previousSunrise = null;
let previousPanchang = null

try{

  const previousDate =
    new Date(date);

  previousDate.setDate(
    previousDate.getDate() - 1
  );

  previousPanchang =
    getPanchangam(
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

  if(
    previousPanchang &&
    previousPanchang.sunrise
  ){
    previousSunrise =
      previousPanchang.sunrise;
  }

}catch(e){

  console.warn(
    "Previous sunrise/sunset calculation failed:",
    e
  );
}

    
window.__panchangTest = p;
window.__previousSunset =
  previousSunset;
window.__previousSunrise =
  previousSunrise;

displayPanchang(
  p,
  nextSunrise,
  previousSunset,
  previousSunrise,
  referenceNow,
  nextMoonset,
  previousPanchang
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
  previousSunrise,
  referenceNow,
  nextMoonset,
  previousPanchang
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
  referenceNow,
  nextSunrise,
  previousSunset
);

window.__bhadraTest = bhadra;

  const prahar = getPraharDetails(
  p,
  nextSunrise,
  previousSunset,
  referenceNow
);
  
if(
  referenceNow &&
  dateInput.value === todayString() &&
  !sankalpState.sandhyaManualOverride
){
  sankalpState.sandhyaType =
    getAutoSandhyaType(
      p,
      prahar,
      referenceNow
    );
}

const specialKaal = getSpecialKaalDetails(
  p,
  nextSunrise
);

const yatraShoola =
  getYatraShoolaDetails(
    p,
    nextSunrise,
    referenceNow,
    previousPanchang
  );

const ghatiPal = getGhatiPal(
  p,
  nextSunrise,
  previousSunrise,
  referenceNow
);

  const isPreSunriseToday = !!(
    referenceNow &&
    dateInput.value === todayString() &&
    referenceNow < new Date(p.sunrise)
  );

  const currentNightChoghadiya =
    isPreSunriseToday ? (previousPanchang?.choghadiya?.night || []) : (p.choghadiya?.night || []);

  const currentNightGowri =
    isPreSunriseToday ? (previousPanchang?.gowri?.night || []) : (p.gowri?.night || []);
 
  const bhadraSuggestion =
  getBhadraSuggestion(
    bhadra,
    referenceNow
  );
  
  /*
   * Sankalp का वर्तमान वार सूर्योदय-से-सूर्योदय
   * परंपरा के अनुसार लें। दैनिक Panchang के p.vara
   * को स्वयं नहीं बदलते; केवल आज सूर्योदय से पहले
   * वर्तमान Sankalp के लिए पिछले पंचांग का वार लें।
   */
  const vara = getVara(
    isPreSunriseToday && previousPanchang
      ? previousPanchang
      : p
  );

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

    /*
     * आज की तारीख:
     * वर्तमान समय के आधार पर live status।
     */
    if(referenceNow){

      if(bhadra.isActive){
        bhadraStatus = "चल रही है";
      }
      else if(
        referenceNow < bhadra.start
      ){
        bhadraStatus = "आगामी";
      }
      else{
        bhadraStatus = "समाप्त";
      }

    }

    /*
     * पुरानी/भविष्य की चयनित तारीख:
     * वर्तमान समय से तुलना नहीं।
     */
    else{

      bhadraStatus = "उपलब्ध";

    }

  }
  /*
   * कालशूल UI data
   */
  const kalaShoola =
    yatraShoola.kalaShoola;

  const activeKalaSegment =
    kalaShoola.activeSegment;

  const upcomingKalaShoola =
    kalaShoola.upcoming;

  const selectedDateKalaShoola =
    kalaShoola.blockedPeriods || [];
   const formatKalaShoolaUpcomingDate = (date) => {
  if (!date || !referenceNow) return "";

  const sameDate =
    date.getFullYear() === referenceNow.getFullYear() &&
    date.getMonth() === referenceNow.getMonth() &&
    date.getDate() === referenceNow.getDate();

  if (sameDate) {
    return "आज";
  }

  return date.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long"
  });
};
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

const praharNames = [
  "प्रथम",
  "द्वितीय",
  "तृतीय",
  "चतुर्थ"
];

/* केवल रात्रि के प्रहर */

praharHtml += `
  <div class="prahar-group">
    <div class="prahar-group-title">
      🌙 रात्रि के प्रहर
    </div>

    <div class="prahar-grid">
`;

prahar.nightPrahar.forEach(
  (pItem,i) => {

    const activeClass =
      pItem.isActive
        ? "active"
        : "";

    praharHtml += `
      <div class="prahar-item ${activeClass}">
        <div class="p-name">
          ${praharNames[i]} प्रहर
        </div>

        <div class="p-time">
          ${formatTime(pItem.start)}
          -
          ${formatTime(pItem.end)}
        </div>
      </div>
    `;
  }
);

praharHtml += `
    </div>
  </div>
</div>
`;

 let bhadraPartsHtml = "";

if(
  bhadra.available &&
  bhadra.parts
){

  bhadraPartsHtml = `<div>
    <b>भद्रा अंग:</b>
    <div class="bhadra-parts">`;

   bhadra.parts.forEach(part => {
const cls =
  part.isActive
    ? "bhadra-part active"
    : "bhadra-part";

const partBg =
  part.isActive
    ? "#c62828"
    : "";

const partColor =
  part.isActive
    ? "#ffffff"
    : "#212121";

const effectColor =
  part.isActive
    ? "#ffffff"
    : "#555";

const effect =
  getPartEffect(part.name);

bhadraPartsHtml += `
  <div class="${cls}" style="
    display:block;
    margin-bottom:7px;
    padding:7px 9px;
    ${partBg ? `background:${partBg};` : ""}
    color:${partColor};
  ">
    <div>
      <b style="color:${partColor};">
        ${part.name}
      </b>
      —
      ${formatTime(part.start)}
      से
      ${formatTime(part.end)}
      तक
    </div>
    ${
      effect
        ? `
          <div style="
            margin-top:4px;
            font-size:11px;
            line-height:1.5;
            color:${effectColor};
          ">
            📜 ${effect.text}
          </div>
        `
        : ""
    }
  </div>
`;
  });

  bhadraPartsHtml += `
    </div>
  </div>`;

  /*
   * मुख
   */
  if(bhadra.mukha){

    bhadraPartsHtml += `
      <div class="time-row">
        <b>🔴 भद्रा मुख</b>
        <span>
          ${formatTimeRange(
            bhadra.mukha.start,
            bhadra.mukha.end
          )}
          <small>
            — ${bhadra.mukhaPrahar}वाँ प्रहर
          </small>
        </span>
      </div>
    `;
  }

  /*
   * पुच्छ
   */
  if(bhadra.puccha){

    bhadraPartsHtml += `
      <div class="time-row">
        <b>🟢 भद्रा पुच्छ</b>
        <span>
          ${formatTimeRange(
            bhadra.puccha.start,
            bhadra.puccha.end
          )}
          <small>
            — ${bhadra.pucchaPrahar}वाँ प्रहर
          </small>
        </span>
      </div>
    `;
  }

  /*
   * भद्रा किस तिथि-अर्ध से उत्पन्न हुई
   */
  if(bhadra.bhadraHalf){

    bhadraPartsHtml += `
      <div class="time-row">
        <b>📖 भद्रा अर्ध</b>
        <span>
          ${bhadra.bhadraHalf}
        </span>
      </div>
    `;
  }

   /*
   * =========================================================
   * भद्रा निवास + शास्त्रीय फल
   * =========================================================
   */
  bhadraPartsHtml += `
    <div>
      <b>निवास स्थान:</b>
      <span
        class="bhadra-niwas"
        style="background:${bhadra.niwasColor};"
      >
        ${bhadra.niwas}
      </span>
    </div>
  `;

  if(bhadra.shastriyaPhal){

    bhadraPartsHtml += `
      <div style="
        margin-top:8px;
        padding:8px 10px;
        border-left:3px solid #8a6d3b;
        border-radius:4px;
        background:rgba(138,109,59,0.07);
        font-size:12px;
        line-height:1.55;
      ">
        <b>📜 शास्त्रीय फल:</b>
        ${bhadra.shastriyaPhal}
      </div>
    `;

  }

  /*
   * =========================================================
   * विशेष भद्रा परिहार
   * =========================================================
   */
  if(bhadra.specialParihara){

    bhadraPartsHtml += `
      <div style="
        margin-top:8px;
        padding:8px 10px;
        border-left:3px solid #188038;
        border-radius:4px;
        background:rgba(24,128,56,0.07);
        font-size:12px;
        line-height:1.55;
      ">
        <b>🟢 विशेष भद्रा-परिहार:</b>
        ${bhadra.pariharaText}
      </div>
    `;

  }


  /*
   * =========================================================
   * स्रोत
   * =========================================================
   */
  bhadraPartsHtml += `
    <div style="
      font-size:12px;
      color:#777;
      margin-top:9px;
    ">
      📖 शास्त्रीय आधार:
      मुहूर्त चिन्तामणि — (पीयूषधारा टीका)
      शुभाशुभ प्रकरण, श्लोक ४४–४५
    </div>
  `;

  /*
   * स्रोत
   */
  bhadraPartsHtml += `
    <div style="
      font-size:12px;
      color:#777;
      margin-top:8px;
    ">
      📖 मुहूर्त मार्तण्ड
    </div>
  `;

  /*
   * मौजूदा suggestion
   */
  if(bhadraSuggestion){

    const cls =
      bhadraSuggestion.type === "avoid"
        ? "bhadra-suggestion avoid"
        : "bhadra-suggestion";

    bhadraPartsHtml += `
      <div class="${cls}">
        💡 ${bhadraSuggestion.text}
      </div>
    `;
  }

}else{

  bhadraPartsHtml = `
    <div style="
      font-size:13px;
      color:#777;
    ">
      भद्रा नहीं है
    </div>
  `;
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

  const selectedDayStart =
    new Date(dateInput.value + "T00:00:00");

  const selectedDayEnd =
    new Date(selectedDayStart);

  selectedDayEnd.setDate(
    selectedDayEnd.getDate() + 1
  );

  const amritKalamForDate =
    (p.amritKalam || []).filter(item => {
      const start = new Date(item.start);

      return (
        start >= selectedDayStart &&
        start < selectedDayEnd
      );
    });

  const varjyamForDate =
    (p.varjyam || []).filter(item => {
      const start = new Date(item.start);

      return (
        start >= selectedDayStart &&
        start < selectedDayEnd
      );
    });

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
          सूर्य - ${ayana}
        </div>
      </div>
<div class="card">
  <div class="label">
    🌅 सूर्योदय — ${formatTime(p.sunrise)}
  </div>
</div>

<div class="card">
  <div class="label">
    🌇 सूर्यास्त — ${formatTime(p.sunset)}
  </div>
</div>

<div class="card">
  <div class="label">
    🌙 चंद्रोदय — ${formatTime(p.moonrise)}
  </div>
</div>

<div class="card">
  <div class="label">
🌙 चंद्रास्त — ${formatTime(p.moonset || nextMoonset)}
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
          <b>🟢 अमृत काल</b>
          <span>
            ${
              amritKalamForDate.length
                ? amritKalamForDate
                    .map(item =>
                      formatTimeRange(
                        item.start,
                        item.end
                      )
                    )
                    .join("<br>")
                : "उपलब्ध नहीं"
            }
          </span>
        </div>

        <div class="time-row">
          <b>🔴 वर्ज्यम्</b>
          <span>
            ${
              varjyamForDate.length
                ? varjyamForDate
                    .map(item =>
                      formatTimeRange(
                        item.start,
                        item.end
                      )
                    )
                    .join("<br>")
                : "उपलब्ध नहीं"
            }
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
    🧭 यात्रा शूल विचार
  </div>

  <!-- ================= दिशाशूल ================= -->
  <div class="yatra-section">

    <div class="yatra-section-title">
      🔴 दिशाशूल
      <span>वार आधारित</span>
    </div>

    <div class="time-row">
      <b>वर्ज्य दिशा</b>
      <span>
        ${yatraShoola.directionHindiName}
      </span>
    </div>

    <div class="time-row">
      <b>🟢 दिशाशूल से मुक्त दिशाएँ</b>
      <span>
        ${
          Array.isArray(
            p.dishaShoola?.safeDirections
          )
            ? p.dishaShoola.safeDirections
                .map(
                  d =>
                    directionHindi[d] || d
                )
                .join(", ")
            : "—"
        }
      </span>
    </div>

  </div>


  <!-- ================= नक्षत्रशूल ================= -->
  <div class="yatra-section">

    <div class="yatra-section-title">
      🔴 नक्षत्रशूल
      <span>नक्षत्र आधारित</span>
    </div>

    <div class="time-row">
      <b>स्थिति</b>
      <span>
        ${
          yatraShoola.nakshatraShoola
            ? `${yatraShoola.nakshatraShoola} दिशा — ${yatraShoola.nakshatraName}`
            : "नक्षत्रशूल नहीं"
        }
      </span>
    </div>

    ${
      yatraShoola.nakshatraShoolaActive
        ? `
          <div class="time-row">
            <b>⚠️ वर्तमान स्थिति</b>
            <span>
              नक्षत्रशूल लागू
            </span>
          </div>
        `
        : ""
    }

  </div>


    <!-- ================= कालशूल ================= -->
  <div class="yatra-section">

    <div class="yatra-section-title">
      ⏳ कालशूल
      <span>समय आधारित</span>
    </div>

    ${
      !kalaShoola.available
        ? `
          <div class="time-row">
            <b>स्थिति</b>
            <span>⚪ कालशूल समय उपलब्ध नहीं</span>
          </div>
        `
        : referenceNow
          ? (
              kalaShoola.activeBlocked
                ? `
                  <div class="time-row">
                    <b>🔴 वर्तमान स्थिति</b>
                    <span>
                      अभी कालशूल का वर्ज्य काल चल रहा है।
                    </span>
                  </div>

                  ${
                    activeKalaSegment
                      ? `
                        <div class="time-row">
                          <b>वर्ज्य काल</b>
                          <span>
                            ${activeKalaSegment.periodName}
                            —
                            ${formatTime(
                              activeKalaSegment.start
                            )}
                            से
                            ${formatTime(
                              activeKalaSegment.end
                            )}
                            तक
                            <br>
                            <small>
                              ${activeKalaSegment.nakshatraName}
                              — ${activeKalaSegment.sanjna} संज्ञा
                            </small>
                          </span>
                        </div>
                      `
                      : ""
                  }
                `
                : `
                  <div class="time-row">
                    <b>🟢 वर्तमान स्थिति</b>
                    <span>
                      अभी कालशूल वर्ज्य काल नहीं है।
                    </span>
                  </div>

                  ${
                    upcomingKalaShoola
                      ? `
                        <div class="time-row">
 <b>⚠️ आगामी कालशूल वर्ज्य काल</b>
<span>
  <b>
    ${formatKalaShoolaUpcomingDate(
      upcomingKalaShoola.start
    )}
    — ${upcomingKalaShoola.periodName}
  </b>
  <br>
  ${formatTime(
    upcomingKalaShoola.start
  )}
  से
  ${formatTime(
    upcomingKalaShoola.end
  )}
  तक
  <br>
  <small>
    ${upcomingKalaShoola.nakshatraName}
    — ${upcomingKalaShoola.sanjna} संज्ञा
  </small>
</span>
                        </div>
                      `
                      : `
                        <div class="time-row">
                          <b>🟢 आगे की स्थिति</b>
                          <span>
                            आज आगे कोई कालशूल वर्ज्य काल नहीं है।
                          </span>
                        </div>
                      `
                  }
                `
            )
          : `
            <div class="time-row">
              <b>📅 चयनित तिथि के वर्ज्य काल</b>
              <span>
                ${
                  selectedDateKalaShoola.length
                    ? selectedDateKalaShoola
                        .map(item => `
                          <div style="margin-bottom:6px;">
                            <b>${item.periodName}</b>
                            —
                            ${formatTime(item.start)}
                            से
                            ${formatTime(item.end)}
                            तक
                            <br>
                            <small>
                              ${item.nakshatraName}
                              — ${item.sanjna} संज्ञा
                            </small>
                          </div>
                        `)
                        .join("")
                    : "इस चयनित तिथि में कालशूल का वर्ज्य काल नहीं मिला।"
                }
              </span>
            </div>
          `
}
    ${
      kalaShoola.specialShubha &&
      referenceNow
        ? `
          <div class="time-row">
            <b>🟢 वर्तमान नक्षत्र</b>
            <span>
              ${yatraShoola.nakshatraName}
              — विशेष यात्रा-शुभ नक्षत्र
            </span>
          </div>
        `
        : ""
    }

  </div>

  <!-- ================= वारशूल परिहार ================= -->
  <div class="yatra-remedy">

    🟢 <b>वारशूल परिहार:</b>

    ${
      yatraShoola.remedy
        ? `आपात यात्रा में ${yatraShoola.remedy} का सेवन करें। <br> (प्राश्य गच्छन् शूले न दोषभाक्।)`
        : "—"
    }

  </div>


  <!-- ================= स्रोत ================= -->
  <div class="time-row yatra-source">

    <b>📖 स्रोत</b>

    <span>
      मुहूर्त चिन्तामणि — यात्रा प्रकरण, श्लोक १०–११
    </span>

  </div>


  <!-- ================= नोट ================= -->
  <div class="yatra-note">

    <b>📌 नोट:</b><br>
    • <b>दिशाशूल</b> (वारानुसार) व
      <b>नक्षत्रशूल</b> में
      <i>वर्ज्य दिशा</i> देखी जाती है।<br>

    • <b>कालशूल</b> में
      दिन-रात्रि के 6 कालखण्डों के अनुसार
      <i>वर्ज्य समय</i> देखा जाता है।

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
      
       ${renderCollapsibleTimePeriods(
        p.choghadiya?.day,
        "🕐 दिन के चौघड़िया",
        referenceNow,
        item => {
          const names = {
            Shubh:"🟢शुभ",
            Rog:"🔴रोग",
            Udveg:"🔴उद्वेग",
            Chal:"🟢चल",
            Labh:"🟢लाभ",
            Amrit:"🟢अमृत",
            Kaal:"🔴काल"
          };

          return names[item.name] ||
            item.name ||
            "—";
        },
      )}
      ${renderCollapsibleTimePeriods(
  p.gowri?.day,
  "🌞 दिन का गौरी काल",
  referenceNow,
  getGowriDisplay
)}
      ${renderCollapsibleTimePeriods(
        p.choghadiya?.night,
        "🌙 रात्रि के चौघड़िया",
        referenceNow,
        item => {
          const names = {
            Shubh:"🟢शुभ",
            Rog:"🔴रोग",
            Udveg:"🔴उद्वेग",
            Chal:"🟢चल",
            Labh:"🟢लाभ",
            Amrit:"🟢अमृत",
            Kaal:"🔴काल"
          };

          return names[item.name] ||
            item.name ||
            "—";
        },
        currentNightChoghadiya
      )}
      ${renderCollapsibleTimePeriods(
  p.gowri?.night,
  "🌙 रात्रि का गौरी काल",
  referenceNow,
  getGowriDisplay,
  currentNightGowri
)}
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
    🌄 प्रातः संध्या
  </div>
  <div class="time-row">
    <span>
      ${formatTimeRange(
        specialKaal?.pratahSandhya?.start,
        specialKaal?.pratahSandhya?.end
      )}
    </span>
  </div>
</div>

<div class="card full">
  <div class="label">
    ☀️ विजय मुहूर्त
  </div>
  <div class="time-row">
    <span>
      ${formatTimeRange(
        specialKaal?.vijayaMuhurta?.start,
        specialKaal?.vijayaMuhurta?.end
      )}
    </span>
  </div>
</div>

<div class="card full">
  <div class="label">
    🌇 गोधूलि मुहूर्त
  </div>
  <div class="time-row">
    <span>
      ${formatTimeRange(
        specialKaal?.godhuliMuhurta?.start,
        specialKaal?.godhuliMuhurta?.end
      )}
    </span>
  </div>
</div>

<div class="card full">
  <div class="label">
    🌆 सायं संध्या
  </div>
  <div class="time-row">
    <span>
      ${formatTimeRange(
        specialKaal?.sayahnaSandhya?.start,
        specialKaal?.sayahnaSandhya?.end
      )}
    </span>
  </div>
</div>

<div class="card full">
  <div class="label">
    🌙 निशीथ काल
  </div>
  <div class="time-row">
    <span>
      ${formatTimeRange(
        specialKaal?.nishitaKaal?.start,
        specialKaal?.nishitaKaal?.end
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
        isWednesday,
        nextSunrise
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
   window.dispatchEvent(
  new CustomEvent(
    "ohd:panchangUpdated"
  )
);
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
  isWednesday,
  nextSunriseTime
){
  const sunrise = new Date(p?.sunrise);
  const sunset = new Date(p?.sunset);

  if(
    Number.isNaN(sunrise.getTime()) ||
    Number.isNaN(sunset.getTime())
  ){
    return "—";
  }

  if(!isWednesday){
    return Array.isArray(p?.durMuhurta)
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

  const nextSunrise =
    nextSunriseTime
      ? new Date(nextSunriseTime)
      : null;

  if(
    !nextSunrise ||
    Number.isNaN(nextSunrise.getTime())
  ){
    return "—";
  }

  const dayMs =
    sunset.getTime() -
    sunrise.getTime();

  const nightStart = sunset;

  const nightMs =
    nextSunrise.getTime() -
    nightStart.getTime();

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
  () => {
    sankalpState.sandhyaManualOverride = false;
    sankalpState.includeNightPrahar = false;
    calculatePanchang();
  }
);

window.today = function(){

  dateInput.value =
    todayString();

  /*
   * calculatePanchang() के बाद वास्तविक
   * sunrise/sunset उपलब्ध होते हैं।
   *
   * इसलिए auto Sandhya type को वहाँ
   * calculate किया जाएगा।
   */

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
