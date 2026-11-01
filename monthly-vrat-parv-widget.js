
(function(){
  "use strict";
  // सार्वजनिक दृश्य में केवल स्वीकृत प्रविष्टियाँ; ?review=1 से समीक्षा संकेत दिखते हैं।
  // Blogger page editor may drop or ignore a stylesheet link in the page body.
  // Ensure the shared stylesheet is attached even when the HTML link is stripped.
  var cssHref="https://cdn.jsdelivr.net/gh/OurHinduDharm/Panchang@a7019e1ab2aaa167f5f3eec3df95d3dc45fa496a/monthly-vrat-parv-widget.css";
  if(!Array.from(document.styleSheets).some(function(sheet){try{return sheet.href===cssHref;}catch(_){return false;}})){
    var cssLink=document.createElement("link");
    cssLink.rel="stylesheet";cssLink.href=cssHref;document.head.appendChild(cssLink);
  }
  var pageParams=new URLSearchParams(window.location.search);
  var focusDate=pageParams.get("focus")||"";
  var focusTitle=pageParams.get("focusTitle")||"";
  var focusPending=/^\d{4}-\d{2}-\d{2}$/.test(focusDate);
  var reviewMode=pageParams.get("review")==="1";
  var widgetRoot=document.getElementById("ohd-monthly-festivals");
  if(!widgetRoot){console.error("OHD monthly festival widget root not found.");return;}
  widgetRoot.classList.toggle("review-mode",reviewMode);
  var reviewBanner=document.getElementById("reviewBanner");
  if(reviewBanner) reviewBanner.hidden=!reviewMode;
  var months=["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
  function getIndiaCalendarDate(){
    var parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
    var part=function(type){return (parts.find(function(item){return item.type===type;})||{}).value||"";};
    return new Date(Number(part("year")),Number(part("month"))-1,Number(part("day")),12,0,0);
  }
  var monthSelect=document.getElementById("monthSelect");
  var yearSelect=document.getElementById("yearSelect");
  var currentMonthBtn=document.getElementById("currentMonthBtn");
  // पुराने Blogger HTML में बटन न हो तो नेविगेशन के नीचे स्वयं जोड़ें।
  if(!currentMonthBtn){
    var monthNav=document.getElementById("nextBtn");
    if(monthNav&&monthNav.parentElement){
      var currentMonthRow=document.createElement("div");
      currentMonthRow.className="current-month-row";
      currentMonthBtn=document.createElement("button");
      currentMonthBtn.type="button";
      currentMonthBtn.id="currentMonthBtn";
      currentMonthBtn.textContent="वर्तमान महीना";
      currentMonthRow.appendChild(currentMonthBtn);
      monthNav.parentElement.insertAdjacentElement("afterend",currentMonthRow);
    }
  }
  var eventsEl=document.getElementById("events");
  // मासिक सूची के नीचे उपयोगी नियम और गणना-सीमाएँ दिखाएँ; Blogger HTML में
  // अलग से यह खंड न होने पर भी विजेट इसे सुरक्षित DOM APIs से बना देता है।
  function ensureUsageGuide(){
    if(!eventsEl||document.getElementById("ohd-monthly-usage-guide"))return;
    var section=document.createElement("section");
    section.id="ohd-monthly-usage-guide";section.className="note";
    var heading=document.createElement("h2");
    heading.textContent="इस मासिक व्रत-पर्व सूची का सही उपयोग कैसे करें?";
    heading.style.cssText="font-size:17px;margin:0 0 7px;color:var(--ink)";
    section.appendChild(heading);
    var list=document.createElement("ul");list.style.cssText="margin:0;padding-left:20px";
    [
      ["पहले अपना नगर चुनें: ","सूर्योदय, सूर्यास्त, चंद्रोदय और पूजा-मुहूर्त स्थान के अनुसार बदल सकते हैं।"],
      ["तिथि-निर्णय: ","पर्व की तिथि और मुहूर्त चुने गए नगर के सूर्योदय, चंद्रोदय और संबंधित तिथि-व्याप्ति से निर्धारित होते हैं।"],
      ["मुहूर्त की गणना: ","प्रत्येक उपलब्ध मुहूर्त चुने गए नगर के खगोलीय समय और संबंधित तिथि-व्याप्ति से निकाला जाता है।"],
      ["विधि और पंचांग: ","पर्व के उपलब्ध लेख और “इस दिन का पंचांग देखें” लिंक से विस्तृत जानकारी खोलें।"]
    ].forEach(function(pair){
      var li=document.createElement("li"),strong=document.createElement("strong");
      strong.textContent=pair[0];li.appendChild(strong);li.appendChild(document.createTextNode(pair[1]));list.appendChild(li);
    });
    section.appendChild(list);
    var note=document.createElement("p");
    note.style.margin="9px 0 0";
    note.textContent="सूर्योदय, सूर्यास्त, चंद्रोदय और मुहूर्त चुने गए नगर के निर्देशांकों के अनुसार गणना किए जाते हैं।";
    section.appendChild(note);
    var links=document.createElement("div");links.className="links";links.style.marginTop="9px";
    [
      ["https://ourhindudharm.github.io/Panchang/","विस्तृत दैनिक पंचांग खोलें"],
      ["https://ourhindudharm.blogspot.com/","OurHinduDharm के धार्मिक लेख"]
    ].forEach(function(pair){
      var link=makeLink(pair[0],pair[1]);if(link)links.appendChild(link);
    });
    section.appendChild(links);
    eventsEl.insertAdjacentElement("afterend",section);
  }
  ensureUsageGuide();
  var listTitle=document.getElementById("listTitle");
  var countEl=document.getElementById("count");
  var searchInput=document.getElementById("searchInput");
  var locationInput=document.getElementById("locationInput");
  var locationSearchBtn=document.getElementById("locationSearchBtn");
  var locationStatus=document.getElementById("locationStatus");
  var locationSuggestions=document.getElementById("locationSuggestions");
  if(!locationSuggestions && locationStatus){
    locationSuggestions=document.createElement("div");
    locationSuggestions.id="locationSuggestions";
    locationStatus.insertAdjacentElement("afterend",locationSuggestions);
  }
  var requestToken=0;
  var activeMonthRequest=null;
  // सीमित cache: महीने बदलते समय मोबाइल में अनावश्यक Panchang objects जमा न हों।
  var panchangCache=new Map();
  var observerCache=new Map();
  var MAX_PANCHANG_CACHE_ENTRIES=90;
  // Keep precise coordinates only in page memory; do not persist geolocation in browser storage.
  var selectedLocationInSession=null;
  var defaultLocationElevation=1650;
  var defaultElevationFromDem=false;
  // मुहूर्त मॉड्यूल वैकल्पिक रूप से लोड हो; इसके विफल होने पर खोज/फ़िल्टर बंद न हों।
  var muhurtaModulePromise=import("https://ourhindudharm.github.io/Panchang/festival-muhurta.js").catch(function(error){
    console.warn("Festival muhurta module unavailable:",error);return null;
  });
  function getLocalLocation(){
    // A reload intentionally returns to the default; selected coordinates are never persisted.
    if(selectedLocationInSession){
      return {
        name:selectedLocationInSession.name||selectedLocationInSession.city||"चुना हुआ स्थान",
        lat:selectedLocationInSession.lat,lon:selectedLocationInSession.lon,
        elevation:Number(selectedLocationInSession.elevation)||0,
        state:selectedLocationInSession.state||"",city:selectedLocationInSession.city||""
      };
    }
    return {name:"पिथौरागढ़, उत्तराखंड, भारत",lat:29.5828,lon:80.2182,elevation:defaultLocationElevation,state:"उत्तराखंड",city:"पिथौरागढ़"};
  }
  function syncLocationUI(){
    var location=getLocalLocation();
    locationStatus.textContent="मुहूर्त की गणना का स्थान: "+location.name+((selectedLocationInSession||defaultElevationFromDem)?" · ऊँचाई डेटा: Open-Meteo / Copernicus DEM":"");
    if(!locationInput.value) locationInput.value=location.city||location.name||"";
  }
  async function getTerrainElevation(lat,lon){
    var url="https://api.open-meteo.com/v1/elevation?latitude="+encodeURIComponent(lat)+"&longitude="+encodeURIComponent(lon);
    var response=await fetch(url,{headers:{"Accept":"application/json"}});
    if(!response.ok) throw new Error("Elevation_HTTP_"+response.status);
    var data=await response.json();
    var elevation=Array.isArray(data.elevation)?Number(data.elevation[0]):NaN;
    if(!Number.isFinite(elevation)) throw new Error("Elevation data unavailable");
    return elevation;
  }
  async function searchLocation(){
    var query=locationInput.value.trim();
    if(query.length<2){
      locationStatus.textContent="कृपया शहर या स्थान का नाम लिखें।";
      locationSuggestions.replaceChildren();
      return;
    }
    locationSearchBtn.disabled=true;
    locationSearchBtn.textContent="खोज रहे हैं…";
    locationStatus.textContent="स्थान खोजा जा रहा है…";
    locationSuggestions.replaceChildren();
    try{
      var url="https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=in&accept-language=hi&q="+encodeURIComponent(query);
      var response=await fetch(url,{headers:{"Accept":"application/json"}});
      if(!response.ok) throw new Error("HTTP_"+response.status);
      var places=await response.json();
      if(!places.length){
        locationStatus.textContent="स्थान नहीं मिला। नाम थोड़ा बदलकर खोजें।";
        return;
      }
      places.forEach(function(place){
        var button=document.createElement("button");
        button.type="button";
        button.setAttribute("role","option");
        button.textContent=place.display_name||place.name||query;
        button.addEventListener("click",async function(){
          var address=place.address||{};
          var selected={
            name:place.display_name||place.name||query,
            lat:Number(place.lat),lon:Number(place.lon),elevation:null,
            state:address.state||address.state_district||address.region||"",
            city:address.city||address.town||address.village||address.municipality||place.name||query
          };
          if(!Number.isFinite(selected.lat)||!Number.isFinite(selected.lon)){
            locationStatus.textContent="इस परिणाम के निर्देशांक उपलब्ध नहीं हैं। दूसरा परिणाम चुनें।";
            return;
          }
          button.disabled=true;
          locationStatus.textContent="चुने गए स्थान की ऊँचाई प्राप्त की जा रही है…";
          try{
            selected.elevation=await getTerrainElevation(selected.lat,selected.lon);
          }catch(error){
            console.warn("Location elevation unavailable:",error);
            locationStatus.textContent="इस स्थान की ऊँचाई का डेटा अभी नहीं मिल सका। कृपया थोड़ी देर बाद पुनः प्रयास करें।";
            button.disabled=false;
            return;
          }
          selectedLocationInSession=selected;
          panchangCache.clear();
          observerCache.clear();
          locationEclipseCache.clear();
          locationInput.value=selected.city||selected.name;
          locationSuggestions.replaceChildren();
          locationStatus.textContent="मुहूर्त की गणना का स्थान: "+selected.name+" · ऊँचाई डेटा: Open-Meteo / Copernicus DEM";
          loadMonth();
        });
        locationSuggestions.appendChild(button);
      });
      locationStatus.textContent="नीचे दिए परिणामों में से अपना स्थान चुनें।";
    }catch(error){
      console.warn("Location search failed:",error);
      locationStatus.textContent="स्थान खोजने में समस्या हुई। कृपया थोड़ी देर बाद पुनः प्रयास करें।";
    }finally{
      locationSearchBtn.disabled=false;
      locationSearchBtn.textContent="खोजें";
    }
  }
  function getDatePanchang(dateIso){
    var location=getLocalLocation();
    var cacheKey=[dateIso,location.lat,location.lon,location.elevation].join("|");
    if(panchangCache.has(cacheKey)) return panchangCache.get(cacheKey);
    var promise=Promise.resolve().then(async function(){
      // Blogger के mini-panchang ने लाइब्रेरी पहले से उपलब्ध करा दी हो,
      // तो उसी API का उपयोग करें; अन्यथा उसी मॉड्यूल को fallback के रूप में import करें।
      var ready=window.__ohdPanchangam;
      var panchangLib=(ready&&typeof ready.getPanchangam==="function"&&typeof ready.Observer==="function"&&typeof ready.getKundli==="function")
        ? ready
        : await import("https://esm.sh/@ishubhamx/panchangam-js@3.0.0");
      if(typeof panchangLib.Observer!=="function"||typeof panchangLib.getPanchangam!=="function"){
        throw new Error("Panchang library API unavailable");
      }
      var observerKey=[location.lat,location.lon,location.elevation].join("|");
      var observer=observerCache.get(observerKey);
      if(!observer){
        observer=new panchangLib.Observer(location.lat,location.lon,location.elevation);
        observerCache.set(observerKey,observer);
      }
      // तारीख़ को भारत के नागरिक समय के भीतर एक निश्चित UTC instant से बनाएं।
      // इससे विदेशी time-zone पर चल रहे मोबाइल में भी चुनी हुई भारतीय तारीख़ एक दिन आगे/पीछे नहीं खिसकेगी।
      var date=new Date(dateIso+"T06:30:00.000Z");
      var nextDate=new Date(date);nextDate.setUTCDate(nextDate.getUTCDate()+1);
      var p=panchangLib.getPanchangam(date,observer,{timezoneOffset:330,calendarType:"purnimanta"});
      var next=panchangLib.getPanchangam(nextDate,observer,{timezoneOffset:330,calendarType:"purnimanta"});
      return {p:p,next:next,location:location,date:date,panchangLib:panchangLib,observer:observer,at:function(instant){return panchangLib.getPanchangam(instant,observer,{timezoneOffset:330,calendarType:"purnimanta"});}};
    }).catch(function(error){
      // अस्थायी CDN/API विफलता को cache में स्थायी न रखें; अगली कोशिश दोबारा लोड कर सके।
      panchangCache.delete(cacheKey);
      throw error;
    });
    panchangCache.set(cacheKey,promise);
    while(panchangCache.size>MAX_PANCHANG_CACHE_ENTRIES){
      var oldestKey=panchangCache.keys().next().value;
      if(oldestKey===undefined)break;
      panchangCache.delete(oldestKey);
    }
    return promise;
  }

  // ग्रहण-पंचांग के उसी सत्यापित discovery/visibility module का उपयोग करें।
  // केवल चुने हुए स्थान पर वास्तव में दृश्य ग्रहण ही मासिक सूची में जोड़ा जाएगा।
  var locationEclipseCalculationFailed=false;
  var eclipseToolsPromise=import("https://ourhindudharm.github.io/Panchang/eclipse-panchang.js").then(function(){
    var tools=window.__OHDEclipsePanchangTools||null;
    if(!tools)locationEclipseCalculationFailed=true;
    return tools;
  }).catch(function(error){
    locationEclipseCalculationFailed=true;
    console.warn("Eclipse visibility module unavailable:",error);return null;
  });
  var locationEclipseCache=new Map();
  function istDateKey(value){
    var date=value instanceof Date?value:new Date(value);
    if(!Number.isFinite(date.getTime()))return "";
    var parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
    var get=function(type){return (parts.find(function(part){return part.type===type;})||{}).value||"";};
    return get("year")+"-"+get("month")+"-"+get("day");
  }
  function formatGrahanDateTime(value){
    var date=value instanceof Date?value:new Date(value);
    if(!Number.isFinite(date.getTime()))return "";
    return new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(date);
  }
  function getGrahanTitle(grahan){
    var type=String(grahan&&grahan.type||"").toLowerCase();
    var body=type.indexOf("surya")>=0||type.indexOf("solar")>=0?"सूर्य":"चंद्र";
    var subtype=String(grahan&&grahan.subtype||"").toLowerCase();
    var kinds={total:"पूर्ण",partial:"आंशिक",annular:"वलयाकार",hybrid:"संकर",penumbral:"उपच्छाया"};
    var kind=kinds[subtype]||"";
    return (kind?kind+" ":"")+body+" ग्रहण";
  }
  async function buildLocationEclipseEvents(year,month,token){
    var location=getLocalLocation();
    var cacheKey=[year,location.lat,location.lon,location.elevation].join("|");
    if(locationEclipseCache.has(cacheKey)){
      var cachedEvents=await locationEclipseCache.get(cacheKey);
      return cachedEvents.filter(function(item){return Number(String(item.date||"").slice(5,7))===month;});
    }
    var task=(async function(){
      var tools=await eclipseToolsPromise;
      if(!tools||typeof tools.discoverEclipses!=="function"||
         typeof tools.getLocalVisibility!=="function"||
         typeof tools.getEclipseDayPanchangs!=="function"){
        locationEclipseCalculationFailed=true;
        return [];
      }
      // getDatePanchang supplies the same pinned Panchang API and observer
      // already used by the monthly muhurta calculations.
      var values=await getDatePanchang(String(year)+"-01-01");
      var eclipses=await tools.discoverEclipses(year,values.location,values.panchangLib);
      var events=[];
      (Array.isArray(eclipses)?eclipses:[]).forEach(function(item){
        var grahan=item&&item.grahan;
        if(!grahan)return;
        var firstContact=grahan.contact&&grahan.contact.firstContact;
        var eclipseDate=firstContact||item.date;
        var dateKey=istDateKey(eclipseDate);
        if(!dateKey||Number(dateKey.slice(0,4))!==year)return;
        var visibilityDate=new Date(dateKey+"T12:00:00+05:30");
        var dayPanchangs=tools.getEclipseDayPanchangs(visibilityDate,values.observer,values.panchangLib);
        var visibility=tools.getLocalVisibility(grahan,dayPanchangs);
        if(!visibility||visibility.localVisible!==true)return;
        var description="स्थान: "+String(values.location.name||values.location.city||"चयनित स्थान")+" में यह ग्रहण दृश्य है।";
        var sutak=grahan.sutakKaal;
        if(sutak&&sutak.start&&sutak.end){
          description+=" सूतक काल: "+formatGrahanDateTime(sutak.start)+" से "+formatGrahanDateTime(sutak.end)+"।";
        }
        events.push({
          date:dateKey,
          dateLabel:new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"long"}).format(new Date(dateKey+"T12:00:00+05:30")),
          title:getGrahanTitle(grahan),
          category:"ग्रहण",
          description:description,
          articleUrl:"https://ourhindudharm.blogspot.com/p/grahan-panchang.html?m=1",
          articleLabel:"ग्रहण का विस्तृत पंचांग देखें",
          secondaryArticleUrl:"https://ourhindudharm.blogspot.com/2022/10/About-Grahan-mantra-purashcharan.html?m=1",
          secondaryArticleLabel:"ग्रहण-मन्त्र पुरश्चरण",
          isLocationEclipse:true,
          showReviewStatus:false
        });
      });
      return events;
    })().catch(function(error){
      locationEclipseCalculationFailed=true;
      console.warn("Location-based eclipse discovery failed:",error);return [];
    });
    locationEclipseCache.set(cacheKey,task);
    var result=await task;
    return result.filter(function(item){return Number(String(item.date||"").slice(5,7))===month;});
  }

  function getSankrantiRashiIndex(item){
    var title=String(item&&item.title||"").normalize("NFC").toLocaleLowerCase("hi");
    var entries=[["मेष",0],["वृषभ",1],["मिथुन",2],["कर्क",3],["सिंह",4],["कन्या",5],["तुला",6],["वृश्चिक",7],["धनु",8],["मकर",9],["कुम्भ",10],["कुंभ",10],["मीन",11]];
    for(var i=0;i<entries.length;i++)if(title.includes(entries[i][0])&&/संक्रांति|संक्रान्ति|sankranti/.test(title))return entries[i][1];
    return null;
  }
  function getInstantSunRashiIndex(p){
    var sun=p&&p.planetaryPositions&&p.planetaryPositions.sun;
    var raw=sun&&(sun.rashiName??sun.signName??sun.rashi??sun.rashiIndex??sun.sign);
    if(raw&&typeof raw==="object")raw=raw.index??raw.number??raw.value??raw.name??raw.label;
    if(typeof raw==="number"&&Number.isInteger(raw)&&raw>=0&&raw<=11)return raw;
    var name=String(raw??"").normalize("NFC").toLocaleLowerCase("hi");
    var names=[[/mesha|मेष|aries/,0],[/vrishabha|वृषभ|taurus/,1],[/mithuna|मिथुन|gemini/,2],[/karka|कर्क|cancer/,3],[/simha|सिंह|leo/,4],[/kanya|कन्या|virgo/,5],[/tula|तुला|libra/,6],[/vrishchika|वृश्चिक|scorpio/,7],[/dhanu|धनु|sagittarius/,8],[/makara|मकर|capricorn/,9],[/kumbha|कुम्भ|कुंभ|aquarius/,10],[/meena|मीन|pisces/,11]];
    for(var i=0;i<names.length;i++)if(names[i][0].test(name))return names[i][1];
    return null;
  }
  function findSankrantiMoment(values,item,dateIso){
    var target=getSankrantiRashiIndex(item);
    if(target===null||!values||typeof values.at!=="function")return null;
    var dayStart=Date.parse(dateIso+"T00:00:00+05:30");
    if(!Number.isFinite(dayStart))return null;
    var start=dayStart-36*60*60*1000,end=dayStart+36*60*60*1000,step=30*60*1000;
    function signAt(ms){try{return getInstantSunRashiIndex(values.at(new Date(ms)));}catch(_){return null;}}
    var previousTime=start,previousSign=signAt(start);
    for(var time=start+step;time<=end;time+=step){
      var sign=signAt(time);
      if(sign===target&&previousSign!==null&&previousSign!==target){
        var left=previousTime,right=time;
        while(right-left>30000){var middle=Math.floor((left+right)/2);if(signAt(middle)===target)right=middle;else left=middle;}
        return new Date(right);
      }
      previousTime=time;previousSign=sign;
    }
    return null;
  }
  function getLagnaIndex(p){
    var value=p&&(p.udayaLagna??p.lagna??p.ascendant);
    if(value&&typeof value==="object"){
      var raw=value.index??value.number??value.value??value.rashiIndex??value.rashiName??value.rashi??value.signName??value.name??value.label;
      if(raw&&typeof raw==="object")raw=raw.index??raw.number??raw.value??raw.name??raw.label;
      if(raw!==undefined)value=raw;
    }
    if(typeof value==="number"&&Number.isFinite(value)){
      return Number.isInteger(value)&&value>=0&&value<=11?value:null;
    }
    var name=String(value??"").normalize("NFC").toLocaleLowerCase("hi");
    var names=[
      [/mesh|मेष|aries/,0],[/vrishabha|वृषभ|taurus/,1],
      [/mithun|मिथुन|gemini/,2],[/karka|कर्क|cancer/,3],
      [/simha|सिंह|leo/,4],[/kanya|कन्या|virgo/,5],
      [/tula|तुला|libra/,6],[/vrishchik|वृश्चिक|scorpio/,7],
      [/dhanu|धनु|sagittarius/,8],[/makar|मकर|capricorn/,9],
      [/kumbh|कुम्भ|कुंभ|aquarius/,10],[/meen|मीन|pisces/,11]
    ];
    for(var i=0;i<names.length;i++)if(names[i][0].test(name))return names[i][1];
    var numeric=Number(value);
    return Number.isInteger(numeric)&&numeric>=0&&numeric<=11?numeric:null;
  }
  function getStiraLagnaWindows(lib,observer,startValue,endValue){
    var start=new Date(startValue),end=new Date(endValue);
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start||
       !lib||typeof lib.getPanchangam!=="function")return [];
    var fixedNames={1:"Vrishabha",4:"Simha",7:"Vrishchika",10:"Kumbha"};
    function signAt(ms){
      var instant=new Date(ms);
      try{
        var panchang=lib.getPanchangam(instant,observer,{timezoneOffset:330});
        var index=getLagnaIndex(panchang);
        if(index!==null)return index;
        // कुछ package builds में getPanchangam के परिणाम पर Udaya Lagna
        // उपलब्ध नहीं होता; Kundli API का Ascendant उसी क्षण का लग्न देता है।
        if(typeof lib.getKundli==="function"){
          var kundli=lib.getKundli(instant,observer);
          return getLagnaIndex({ascendant:kundli&&kundli.ascendant});
        }
      }catch(_){}
      return null;
    }
    function isFixed(sign){return Object.prototype.hasOwnProperty.call(fixedNames,sign);}
    var step=5*60*1000,points=[];
    for(var t=start.getTime();t<end.getTime();t+=step)points.push(t);
    points.push(end.getTime());
    var signs=points.map(signAt),segments=[],segmentStart=null,segmentSign=null;
    function boundary(left,right,target){
      var leftMatches=signAt(left)===target;
      while(right-left>30000){
        var mid=Math.floor((left+right)/2);
        if((signAt(mid)===target)===leftMatches)left=mid;else right=mid;
      }
      return right;
    }
    for(var i=0;i<points.length;i++){
      var sign=signs[i];
      if(i===0){
        if(isFixed(sign)){segmentStart=points[i];segmentSign=sign;}
        continue;
      }
      var prev=signs[i-1],prevTime=points[i-1],time=points[i];
      if(prev===sign)continue;
      if(isFixed(prev)&&segmentStart!==null){
        var segEnd=boundary(prevTime,time,prev);
        segments.push({name:fixedNames[prev],start:new Date(segmentStart),end:new Date(segEnd)});
        segmentStart=null;segmentSign=null;
      }
      if(isFixed(sign)){
        segmentStart=boundary(prevTime,time,sign);
        segmentSign=sign;
      }
    }
    if(segmentStart!==null&&isFixed(segmentSign)){
      segments.push({name:fixedNames[segmentSign],start:new Date(segmentStart),end:end});
    }
    return segments;
  }

  async function appendMuhurta(item,dateIso,content,token){
    // नक्षत्र-आधारित सरस्वती अनुष्ठानों का मुहूर्त सीधे पंचांग से निकला है।
    // इसे नियम-मॉड्यूल वाले पर्वों से स्वतंत्र दिखाएँ।
    if(item.muhurtaStart&&item.muhurtaEnd){
      var nakshatraStart=new Date(item.muhurtaStart),nakshatraEnd=new Date(item.muhurtaEnd);
      if(Number.isFinite(nakshatraStart.getTime())&&Number.isFinite(nakshatraEnd.getTime())&&nakshatraEnd>nakshatraStart){
        var timeFormatter=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:true});
        var startLabel=timeFormatter.format(nakshatraStart),endLabel=timeFormatter.format(nakshatraEnd);
        var timeBox=document.createElement("div");timeBox.className="desc";
        timeBox.style.cssText="margin-top:6px;font-size:12px;line-height:1.45";
        var timeTitle=document.createElement("strong");timeTitle.textContent=item.muhurtaLabel||"मुहूर्त";
        timeBox.appendChild(timeTitle);
        var timeText=document.createElement("div");
        timeText.textContent=startLabel+"–"+endLabel+" IST";
        timeBox.appendChild(timeText);content.appendChild(timeBox);
      }
    }
    var ruleIds=Array.isArray(item.muhurtaRules)?item.muhurtaRules:(item.muhurtaRule?[item.muhurtaRule]:[]);
    // मासिक शिवरात्रि में निशीथ के साथ चारों रात्रि-प्रहर भी दिखाएँ।
    if(/मासिक\s*शिवरात्रि/i.test(String(item.title||""))&&!/महाशिवरात्रि|महा\s*शिवरात्रि/i.test(String(item.title||""))){
      if(ruleIds.indexOf("masik-shivaratri-nishita")===-1) ruleIds.push("masik-shivaratri-nishita");
      if(ruleIds.indexOf("masik-shivaratri-four-prahar")===-1) ruleIds.push("masik-shivaratri-four-prahar");
    }
    // महाष्टमी प्रविष्टि पर संधिपूजा का मुहूर्त स्थानीय तिथि-संधि से निकालें।
    if(!ruleIds.length&&/महाष्टमी|महाअष्टमी|दुर्गाष्टमी|दुर्गा अष्टमी|दुर्गा पूजा.*अष्टमी/i.test(String(item.title||""))) ruleIds=["sandhi-puja"];
    if(!ruleIds.length&&(/संक्रांति|संक्रान्ति|sankranti/i.test(String(item.title||""))||String(item.category||"")==="संक्रांति")) ruleIds=["sankranti-punya-kala"];
    if(!ruleIds.length&&/महाशिवरात्रि|महा शिवरात्रि/i.test(String(item.title||""))) ruleIds=["mahashivaratri-four-prahar","mahashivaratri-nishita"];
    if(!ruleIds.length&&/होलिका[\s-]*दहन/i.test(String(item.title||""))) ruleIds=["holika-dahan-pradosh"];
    if(!ruleIds.length) return;
    try{
      var muhurtaModule=await muhurtaModulePromise;
      if(!muhurtaModule) return;
      var usableRules=[];
      ruleIds.forEach(function(ruleId){
        var ruleItem=Object.assign({},item,{muhurtaRule:ruleId});
        var preliminary=muhurtaModule.getFestivalMuhurta(ruleItem,{});
        if(!(preliminary&&preliminary.status==="rule-pending")) usableRules.push(ruleItem);
      });
      if(!usableRules.length) return;
      var values=await getDatePanchang(dateIso);
      if(token!==requestToken||!content.isConnected) return;
      var context=muhurtaModule.getFestivalMuhurtaContext(values.p,values.next,values.date,values.location);
      if(usableRules.some(function(ruleItem){return ruleItem.muhurtaRule==="sankranti-punya-kala";})){
        context.sankrantiMoment=findSankrantiMoment(values,item,dateIso);
        context.sankrantiRashiIndex=getSankrantiRashiIndex(item);
      }
      if(usableRules.some(function(ruleItem){return ruleItem.muhurtaRule==="narak-chaturdashi-abhyanga";})){
        // Panchang day intervals are clipped at sunrise; include the previous sunrise-day interval
        // so a pre-dawn Chaturdashi already active at moonrise is not lost.
        var previousDate=new Date(dateIso+"T12:00:00.000Z");
        previousDate.setUTCDate(previousDate.getUTCDate()-1);
        var previousIso=previousDate.toISOString().slice(0,10);
        var previousValues=await getDatePanchang(previousIso);
        if(token!==requestToken||!content.isConnected) return;
        context.tithis=[...(previousValues.p.tithis||[]),...(previousValues.next.tithis||[]),...(context.tithis||[])];
      }
      if(usableRules.some(function(ruleItem){return ruleItem.muhurtaRule==="bhai-dooj-tilak";})){
        var previousDate=new Date(dateIso+"T12:00:00.000Z");
        previousDate.setUTCDate(previousDate.getUTCDate()-1);
        var previousIso=previousDate.toISOString().slice(0,10);
        var previousValues=await getDatePanchang(previousIso);
        var nextDate=new Date(dateIso+"T12:00:00.000Z");
        nextDate.setUTCDate(nextDate.getUTCDate()+1);
        var nextIso=nextDate.toISOString().slice(0,10);
        var nextValues=await getDatePanchang(nextIso);
        if(token!==requestToken||!content.isConnected) return;
        context.bhaiDoojDateDecision=muhurtaModule.getBhaiDoojDateDecision(
          {sunrise:previousValues.p.sunrise,sunset:previousValues.p.sunset,
            tithis:[...(previousValues.p.tithis||[]),...(previousValues.next.tithis||[])]},
          {sunrise:values.p.sunrise,sunset:values.p.sunset,
            tithis:[...(values.p.tithis||[]),...(values.next.tithis||[])]},
          {sunrise:nextValues.p.sunrise,sunset:nextValues.p.sunset,
            tithis:[...(nextValues.p.tithis||[]),...(nextValues.next.tithis||[])]}
        );
      }
      if(usableRules.some(function(ruleItem){return ruleItem.muhurtaRule==="diwali-lakshmi-puja"||ruleItem.muhurtaRule==="dhanteras-muhurta";})){
        var sunset=new Date(values.p.sunset);
        var nextSunrise=new Date(values.next.sunrise);
        var nightDuration=nextSunrise.getTime()-sunset.getTime();
        var pradoshEnd=new Date(sunset.getTime()+nightDuration/5);
        // लक्ष्मी-पूजन का मुख्य लग्न प्रदोष में चाहिए; पूरे दिन/रात को स्कैन न करें।
        context.sthirLagnaWindows=[
          ...getStiraLagnaWindows(values.panchangLib,values.observer,sunset,pradoshEnd)
        ];
      }
      usableRules.forEach(function(ruleItem){
        var result=muhurtaModule.getFestivalMuhurta(ruleItem,context);
        if(!result) return;
        var box=document.createElement("div");box.className="desc";
        box.style.marginTop="7px";box.style.padding="8px 9px";box.style.borderRadius="8px";box.style.background="#fff8e9";
        var title=document.createElement("strong");title.textContent=result.label||"मुहूर्त";box.appendChild(title);
        var detail=document.createElement("div");
        var paranaDatePrefix=result.dateLabel?result.dateLabel+" · ":"";
        if(result.status==="calculated"&&Array.isArray(result.windows)&&result.windows.length){
          result.windows.forEach(function(windowItem){
            var row=document.createElement("div");row.style.marginTop="5px";
            // यदि विंडो का नाम ऊपर दिए मुख्य मुहूर्त-शीर्षक जैसा ही है, तो उसे दोबारा न दिखाएँ।
            if(!muhurtaModule.areFestivalMuhurtaLabelsEquivalent(result.label,windowItem.label)){
              var name=document.createElement("strong");name.textContent=windowItem.label||"पूजन समय";row.appendChild(name);
            }
            var time=document.createElement("div");
            var startTime=muhurtaModule.formatFestivalMuhurtaTime(windowItem.start);
            var endTime=muhurtaModule.formatFestivalMuhurtaTime(windowItem.end);
            function dateKey(value){
              var parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(value);
              var part=function(type){return (parts.find(function(item){return item.type===type;})||{}).value||"";};
              return part("year")+"-"+part("month")+"-"+part("day");
            }
            var startDateKey=dateKey(windowItem.start),endDateKey=dateKey(windowItem.end);
            if(startDateKey!==dateIso||endDateKey!==dateIso){
              var dateFormatter=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short"});
              time.textContent=dateFormatter.format(windowItem.start)+" "+startTime+" – "+dateFormatter.format(windowItem.end)+" "+endTime;
            }else{
              time.textContent=startTime+" – "+endTime;
            }
            row.appendChild(time);
            if(windowItem.note){var windowNote=document.createElement("div");windowNote.style.fontSize="12px";windowNote.textContent=windowItem.note;row.appendChild(windowNote);}
            detail.appendChild(row);
          });
        }else if(result.status==="calculated"&&result.time){
          detail.textContent=paranaDatePrefix+muhurtaModule.formatFestivalMuhurtaTime(result.time);
        }else if(result.status==="calculated"&&result.start&&result.end){
          detail.textContent=paranaDatePrefix+muhurtaModule.formatFestivalMuhurtaTime(result.start)+" – "+muhurtaModule.formatFestivalMuhurtaTime(result.end);
        }else{
          detail.textContent=result.message||"इस समय की गणना उपलब्ध नहीं है।";
        }
        box.appendChild(detail);
        if(result.note){var note=document.createElement("div");note.style.marginTop="3px";note.textContent=result.note;box.appendChild(note);}
        var loc=document.createElement("div");loc.style.marginTop="3px";loc.style.fontSize="11px";loc.textContent="स्थान: "+values.location.name;box.appendChild(loc);
        content.appendChild(box);
      });
    }catch(error){console.warn("Festival muhurta unavailable:",item.muhurtaRule||item.muhurtaRules,error);}
  }

  // शारदीय नवरात्रि का सरस्वती-रूप: तिथि की स्थिर तारीख़ नहीं,
  // स्थानीय नक्षत्र-स्थिति और कर्म-विशेष के समय से प्रविष्टि बनाएँ।
  var saraswatiNakshatraNames=["मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण"];
  function normalizedPanchangName(value,kind){
    if(value&&typeof value==="object") value=value.name??value.label??value.index??value.number??value.value??"";
    if(typeof value==="number"){
      var names=kind==="nakshatra"?["अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशीर्ष","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा","मघा","पूर्वाफाल्गुनी","उत्तराफाल्गुनी","हस्त","चित्रा","स्वाती","विशाखा","अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा","पूर्वाभाद्रपद","उत्तराभाद्रपद","रेवती"]
        :["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा","प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या"];
      value=names[value]||names[value-1]||"";
    }
    var text=String(value||"").normalize("NFC").toLocaleLowerCase("hi").trim();
    var aliases={
      "moola":"मूल","mula":"मूल","मूला":"मूल",
      "purva ashadha":"पूर्वाषाढ़ा","purvashadha":"पूर्वाषाढ़ा","पूर्वाषाढा":"पूर्वाषाढ़ा",
      "uttara ashadha":"उत्तराषाढ़ा","uttarashadha":"उत्तराषाढ़ा","उत्तराषाढा":"उत्तराषाढ़ा",
      "shravana":"श्रवण","sravana":"श्रवण","श्रवणा":"श्रवण",
      "dashami":"दशमी","dasami":"दशमी"
    };
    return aliases[text]||text;
  }
  function panchangNakshatraAt(panchang){return normalizedPanchangName(panchang&&panchang.nakshatra,"nakshatra");}
  function findNakshatraInterval(panchang,name,dayStart,dayEnd){
    var rows=Array.isArray(panchang&&panchang.nakshatras)?panchang.nakshatras:[];
    for(var i=0;i<rows.length;i++){
      var row=rows[i],start=new Date(row&&row.startTime),end=new Date(row&&row.endTime);
      if(row&&normalizedPanchangName(row.index,"nakshatra")===name&&Number.isFinite(start.getTime())&&Number.isFinite(end.getTime())&&end>start&&end>dayStart&&start<dayEnd){
        return {start:new Date(Math.max(start.getTime(),dayStart.getTime())),end:new Date(Math.min(end.getTime(),dayEnd.getTime()))};
      }
    }
    return null;
  }
  function setSaraswatiMuhurta(item,start,end,label){
    if(!(start instanceof Date)||!(end instanceof Date)||!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start)return;
    item.muhurtaStart=start.toISOString();
    item.muhurtaEnd=end.toISOString();
    item.muhurtaLabel=label;
  }

  function panchangTithiAt(panchang){return normalizedPanchangName(panchang&&panchang.tithi,"tithi");}
  function addSaraswatiEvent(events,iso,title,description,ritual,nakshatra,locationName){
    events.push({date:iso,dateLabel:iso.slice(8,10)+" "+months[Number(iso.slice(5,7))-1],title:title,
      description:description,
      category:"नवरात्रि",calculationStatus:"nakshatra-derived",reviewStatus:"needs-review",showReviewStatus:true,
      saraswatiRitual:ritual,saraswatiNakshatra:nakshatra,
      saraswatiLocation:locationName||"चुना हुआ स्थान"});
  }
  async function buildSaraswatiNakshatraEvents(data,year,month,token){
    if(month!==9&&month!==10) return [];
    var events=Array.isArray(data&&data.events)?data.events:[];
    var startEvent=events.find(function(item){return /शारदीय नवरात्र.*प्रारम्भ|शारदीय नवरात्र.*प्रारंभ/.test(String(item.title||""));});
    // नवरात्रि सितंबर में आरम्भ होकर अक्टूबर में हो तो अक्टूबर सूची पिछले महीने का आरम्भ पढ़े।
    if(!startEvent){
      try{
        var previousMonth=month===1?12:month-1;
        var previousYear=month===1?year-1:year;
        var previousResponse=await fetch("https://ourhindudharm.github.io/Panchang/data/festivals/"+previousYear+"-"+String(previousMonth).padStart(2,"0")+".json",{cache:"no-cache"});
        if(previousResponse.ok){var previousData=await previousResponse.json();startEvent=(previousData.events||[]).find(function(item){return /शारदीय नवरात्र.*प्रारम्भ|शारदीय नवरात्र.*प्रारंभ/.test(String(item.title||""));});}
      }catch(_){/* पिछले महीने का डेटा न मिले तो गतिशील पंचांग से प्रयास करें */}
      if(!startEvent){
        try{
          var priorDynamic=await buildDynamicNavratriEvents(previousYear,previousMonth,token);
          startEvent=(priorDynamic.events||[]).find(function(item){return item.navratriFamily==="sharad"&&/प्रारम्भ|प्रारंभ/.test(String(item.title||""));})||null;
        }catch(_){/* पंचांग न मिले तो स्थिर तारीख़ न गढ़ें */}
      }
    }
    if(!startEvent||!/^\d{4}-\d{2}-\d{2}$/.test(String(startEvent.date||""))) return [];
    var start=new Date(startEvent.date+"T12:00:00");
    var endIso=/^\d{4}-\d{2}-\d{2}$/.test(String(startEvent.endDate||""))?startEvent.endDate:"";
    var end=endIso?new Date(endIso+"T12:00:00"):new Date(start.getTime()+9*86400000);
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<start) return [];
    var found=[],avahanScheduled=false,avahanFallbackScheduled=false;
    var pujaScheduled=false,balidanScheduled=false,visarjanaScheduled=false;
    function findMulaInterval(panchang,dateIso){
      var rows=Array.isArray(panchang&&panchang.nakshatras)?panchang.nakshatras:[];
      var dayStart=new Date(dateIso+"T00:00:00"),dayEnd=new Date(dateIso+"T23:59:59.999");
      for(var ri=0;ri<rows.length;ri++){
        var row=rows[ri],a=new Date(row&&row.startTime),b=new Date(row&&row.endTime);
        if(row&&normalizedPanchangName(row.index,"nakshatra")==="मूल"&&Number.isFinite(a.getTime())&&Number.isFinite(b.getTime())&&b>a&&b>dayStart&&a<dayEnd) return {start:a,end:b};
      }
      return null;
    }
    function clockRange(a,b){
      var fmt=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:true});
      return fmt.format(a)+"–"+fmt.format(b)+" IST";
    }
    for(var cursor=new Date(start);cursor<=end;cursor.setDate(cursor.getDate()+1)){
      if(token!==requestToken) return [];
      var iso=cursor.getFullYear()+"-"+String(cursor.getMonth()+1).padStart(2,"0")+"-"+String(cursor.getDate()).padStart(2,"0");
      if(Number(iso.slice(5,7))!==month) continue;
      var values;
      try{values=await getDatePanchang(iso);}catch(_){continue;}
      if(token!==requestToken) return [];
      var p=values.p||{},sunrise=new Date(p.sunrise),sunset=new Date(p.sunset);
      if(!Number.isFinite(sunrise.getTime())||!Number.isFinite(sunset.getTime())||sunset<=sunrise) continue;
      // मूल में स्थापना/आवाहन: धर्मसिंधु-पाठ के अनुसार सूर्यास्त से तीन मुहूर्त (144 मिनट) पहले।
      var avahanTime=new Date(sunset.getTime()-144*60000);
      var mulaWindow=findMulaInterval(p,iso);
      var avahanStart=mulaWindow?new Date(Math.max(avahanTime.getTime(),mulaWindow.start.getTime())):null;
      var avahanEnd=mulaWindow?new Date(Math.min(sunset.getTime(),mulaWindow.end.getTime())):null;
      // आवाहन-मुहूर्त और मूल नक्षत्र का वास्तविक समय-संयोग जाँचें;
      // केवल दिन के मुख्य नक्षत्र-लेबल पर निर्भर न रहें।
      if(!avahanScheduled&&!avahanFallbackScheduled&&avahanStart&&avahanEnd&&avahanEnd>avahanStart){
        addSaraswatiEvent(found,iso,"देवी सरस्वती का आवाहन / स्थापना","मूल नक्षत्र में आवाहन / स्थापना। सूर्यास्त से तीन मुहूर्त पूर्व का समय।","avahana","मूल",values.location&&values.location.name);
        setSaraswatiMuhurta(found[found.length-1],avahanStart,avahanEnd,"आवाहन का मुहूर्त");
        found[found.length-1].muhurtaInstant=avahanStart.toISOString();
        avahanScheduled=true;
      }else if(!avahanScheduled&&!avahanFallbackScheduled&&mulaWindow){
        // धर्मसिंधु-पाठ का विकल्प: नियत समय पर मूल उपलब्ध न हो तो अगले दिन मूल का द्वितीय पाद।
        var nextCursor=new Date(cursor);nextCursor.setDate(nextCursor.getDate()+1);
        var nextIso=nextCursor.getFullYear()+"-"+String(nextCursor.getMonth()+1).padStart(2,"0")+"-"+String(nextCursor.getDate()).padStart(2,"0");
        if(nextCursor<=end&&Number(nextIso.slice(5,7))===month){
          try{
            var nextValues=await getDatePanchang(nextIso);
            var nextMula=findMulaInterval(nextValues.p,nextIso);
            if(nextMula){
              var mulaDuration=nextMula.end.getTime()-nextMula.start.getTime();
              var padaStart=new Date(nextMula.start.getTime()+mulaDuration/4);
              var padaEnd=new Date(nextMula.start.getTime()+mulaDuration/2);
              var nextDayStart=new Date(nextIso+"T00:00:00"),nextDayEnd=new Date(nextIso+"T23:59:59.999");
              if(padaStart>=nextDayStart&&padaStart<nextDayEnd&&padaEnd>nextDayStart){
                if(padaEnd>nextDayEnd)padaEnd=nextDayEnd;
                addSaraswatiEvent(found,nextIso,"देवी सरस्वती का आवाहन / स्थापना","मूल नक्षत्र के द्वितीय पाद में विकल्प: "+clockRange(padaStart,padaEnd)+"।","avahana-fallback","मूल का द्वितीय पाद",nextValues.location&&nextValues.location.name);
                setSaraswatiMuhurta(found[found.length-1],padaStart,padaEnd,"आवाहन का विकल्प-मुहूर्त");
                avahanFallbackScheduled=true;
                avahanScheduled=true;
              }
            }
          }catch(_){/* मूल-द्वितीय-पाद का समय न निकले तो अनुमान न दिखाएँ */}
        }
      }
      // इन चार अनुष्ठानों में दिन-निर्णय नक्षत्र-विशेष के मुहूर्त से करें।
      // पूजा/बलिदान का प्रकाशित मुहूर्त दिनमान के अंतिम पाँचवें भाग में पड़ता है।
      // नक्षत्र दो दिनों के मुहूर्त में फैला हो तो एक ही अनुष्ठान की दो प्रविष्टियाँ न बनाएँ।
      var dayLength=sunset.getTime()-sunrise.getTime();
      var ritualWindowStart=new Date(sunrise.getTime()+dayLength*0.8);
      var purvaWindow=findNakshatraInterval(p,"पूर्वाषाढ़ा",ritualWindowStart,sunset);
      if(!pujaScheduled&&purvaWindow){
        addSaraswatiEvent(found,iso,"देवी सरस्वती का मुख्य पूजन","पूर्वाषाढ़ा नक्षत्र के मुहूर्त में मुख्य पूजन।","puja","पूर्वाषाढ़ा",values.location&&values.location.name);
        setSaraswatiMuhurta(found[found.length-1],purvaWindow.start,purvaWindow.end,"मुख्य पूजन का मुहूर्त");
        pujaScheduled=true;
      }
      var uttaraWindow=findNakshatraInterval(p,"उत्तराषाढ़ा",ritualWindowStart,sunset);
      if(!balidanScheduled&&uttaraWindow){
        addSaraswatiEvent(found,iso,"देवी सरस्वती की उत्तरपूजा / बलिदान","उत्तराषाढ़ा नक्षत्र के मुहूर्त में उत्तरपूजा / बलिदान।","balidan","उत्तराषाढ़ा",values.location&&values.location.name);
        setSaraswatiMuhurta(found[found.length-1],uttaraWindow.start,uttaraWindow.end,"उत्तरपूजा / बलिदान का मुहूर्त");
        balidanScheduled=true;
      }
      // विसर्जन श्रवण नक्षत्र के अपराह्न मुहूर्त में; दशमी अनिवार्य करने से
      // 2026 जैसी स्थिति में वास्तविक विसर्जन प्रविष्टि छूट जाती है।
      var shravanaWindow=findNakshatraInterval(p,"श्रवण",ritualWindowStart,sunset);
      if(!visarjanaScheduled&&shravanaWindow){
        addSaraswatiEvent(found,iso,"देवी सरस्वती का विसर्जन / उद्वासन","श्रवण नक्षत्र के मुहूर्त में विसर्जन / उद्वासन।","visarjana","श्रवण",values.location&&values.location.name);
        setSaraswatiMuhurta(found[found.length-1],shravanaWindow.start,shravanaWindow.end,"विसर्जन का मुहूर्त");
        visarjanaScheduled=true;
      }
    }
    return found;
  }

  // चारों नवरात्रों की प्रविष्टियाँ स्थिर Gregorian तारीख़ों से नहीं,
  // चयनित स्थान के सूर्योदय-पंचांग में मास और शुक्ल तिथि देखकर बनती हैं।
  var navratriDeities=["माँ शैलपुत्री","माँ ब्रह्मचारिणी","माँ चन्द्रघण्टा","माँ कूष्माण्डा","माँ स्कन्दमाता","माँ कात्यायनी","माँ कालरात्रि","माँ महागौरी","माँ सिद्धिदात्री"];
  var navratriLinks=[
    "http://ourhindudharm.blogspot.com/2013/10/About-Shailputriji-On-FirstDay-OfNavaratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-Brahmacharini-Ma-On-Navaratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-ChadraghantaMaa-On-Navaratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-KooshmandaMata-On-Navaratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-BhagwatiSkandaMata-On-Navratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-GodessKaatyaayani-On-Navratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-KalratriMaa-On-Navratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-GoddessMahagauri-On-Mahaashtami-Of-Navratri.html",
    "http://ourhindudharm.blogspot.com/2013/10/About-Goddess-Siddhidaatri-On-MahaNavami-Of-Navratri.html"
  ];
  function normalizedMasaName(value){
    if(value&&typeof value==="object") value=value.name??value.label??value.value??"";
    var text=String(value||"").normalize("NFC").toLocaleLowerCase("hi").trim();
    var aliases={
      "magha":"माघ","माघ":"माघ",
      "chaitra":"चैत्र","चैत्र":"चैत्र",
      "ashadha":"आषाढ़","ashada":"आषाढ़","आषाढ":"आषाढ़","आषाढ़":"आषाढ़",
      "ashvina":"आश्विन","ashwin":"आश्विन","asvina":"आश्विन","आश्विन":"आश्विन","क्वार":"आश्विन"
    };
    return aliases[text]||text;
  }
  function shuklaTithiIndex(panchang){
    var value=panchang&&panchang.tithi;
    var raw=value&&typeof value==="object"?(value.index??value.number??value.value??value.name):value;
    if(typeof raw==="number"||/^\d+$/.test(String(raw||""))){
      var n=Number(raw);
      return n>=0&&n<=9?n:null;
    }
    var paksha=String((panchang&&panchang.paksha)||"").toLocaleLowerCase("hi");
    if(paksha&&!/shukla|शुक्ल/.test(paksha)) return null;
    var name=normalizedPanchangName(raw,"tithi");
    var names=["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी"];
    var index=names.indexOf(name);
    return index>=0?index:null;
  }
  function navratriFamily(masa){
    if(masa==="माघ") return {id:"magha-gupta",label:"माघ गुप्त नवरात्र",kind:"गुप्त"};
    if(masa==="चैत्र") return {id:"vasanta",label:"चैत्र / वासन्तिक नवरात्र",kind:"वासन्तिक"};
    if(masa==="आषाढ़") return {id:"ashadha-gupta",label:"आषाढ़ गुप्त नवरात्र",kind:"गुप्त"};
    if(masa==="आश्विन") return {id:"sharad",label:"शारदीय नवरात्र",kind:"शारदीय"};
    return null;
  }
  function makeDynamicNavratriEvent(iso,family,tithiIndex,locationName){
    var item={date:iso,dateLabel:iso.slice(8,10)+" "+months[Number(iso.slice(5,7))-1],category:"नवरात्रि",
      calculationStatus:"tithi-derived",reviewStatus:"needs-review",showReviewStatus:true,
      navratriFamily:family.id,hinduTithi:"शुक्ल "+["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी"][tithiIndex]};
    var note="तिथि और मास चयनित स्थान के सूर्योदय-पंचांग के अनुसार हैं; तिथि-परिवर्तन वाले दिनों में पूजा और व्रत का निर्णय संबंधित परंपरा के नियम से किया जाता है।";
    if(tithiIndex===0){
      item.title=family.label+" प्रारम्भ";
      item.description=family.kind==="वासन्तिक"
        ?"चैत्र शुक्ल प्रतिपदा से वासन्तिक नवरात्र तथा नवसंवत्सर का आरम्भ। घटस्थापना का समय स्थानीय तिथि-व्याप्ति के अनुसार देखें। "+note
        :family.kind==="शारदीय"
        ?"आश्विन शुक्ल प्रतिपदा से शारदीय नवरात्र। घटस्थापना का समय स्थानीय तिथि-व्याप्ति के अनुसार देखें। "+note
        :"शुक्ल प्रतिपदा से गुप्त नवरात्र-साधना का आरम्भ। अनुष्ठान, घटस्थापना और साधना अपनी गुरु/कुल-परंपरा के अनुसार करें। "+note;
      item.articleUrl=family.kind==="गुप्त"
        ?"http://ourhindudharm.blogspot.com/2013/07/About-Gupt-Navratris.html"
        :family.kind==="वासन्तिक"
        ?"http://ourhindudharm.blogspot.com/2015/03/About-The-Significance-of-Vasanti-Or-Chaitra-Navratri.html"
        :"http://ourhindudharm.blogspot.com/2013/10/About-Sharadiya-Navaratri.html";
      item.articleLabel=family.kind==="गुप्त"?"गुप्त नवरात्र का महत्व":family.kind==="वासन्तिक"?"वासन्तिक / चैत्र नवरात्र का महत्व":"शारदीय नवरात्र का महत्व";
      item.secondaryArticleUrl="https://ourhindudharm.blogspot.com/p/kalash-sthapan.html";
      item.secondaryArticleLabel="घटस्थापना की संपूर्ण विधि";
      item.muhurtaRule="ghata-sthapana";
    }else if(tithiIndex>=1&&tithiIndex<=8){
      item.title=family.label+" "+["","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी"][tithiIndex]+" — "+navratriDeities[tithiIndex];
      item.description="नवरात्र के इस दिन "+navratriDeities[tithiIndex]+" की आराधना करें। पूजा, पाठ, जप और व्रत अपनी कुल-परंपरा के अनुसार करें। "+note;
      item.articleUrl=navratriLinks[tithiIndex];
      item.articleLabel=navratriDeities[tithiIndex]+" की पूजा";
      if(tithiIndex===7){
        item.title=family.label+" महाष्टमी — माँ महागौरी";
        item.description+=" इस दिन अष्टमी-पूजन और कन्या-पूजन अपनी परंपरा के अनुसार करें। संधिपूजा के लिए अष्टमी समाप्ति और नवमी आरम्भ के स्थानीय समय को साथ में देखें।";
      }
      if(tithiIndex===8){
        item.title=family.label+" महानवमी — माँ सिद्धिदात्री";
        item.description+=" नवमी हवन की विधि तथा पारण अपनी परंपरा के अनुसार करें।";
        item.secondaryArticleUrl="https://ourhindudharm.blogspot.com/p/navratrihavanvidhi.html";
        item.secondaryArticleLabel="नवमी हवन विधि";
        if(family.kind==="वासन्तिक"){
          item.description+=" चैत्र नवरात्र की नवमी श्रीरामनवमी भी है; श्रीरामनवमी का पृथक तिथि-निर्णय देखें।";
          item.secondaryArticleUrl="http://ourhindudharm.blogspot.com/2014/04/About-Birthday-Of-Lord-Ram-on-Shree-RamNavami.html";
          item.secondaryArticleLabel="श्रीरामनवमी पूजा-विधि";
        }
      }
    }else if(tithiIndex===9){
      item.title=family.kind==="शारदीय"?"शारदीय नवरात्र दशमी — विजयादशमी":family.label+" दशमी — साधना-समापन / पारण";
      item.description=family.kind==="शारदीय"
        ?"विजयादशमी पर परंपरा के अनुसार अपराजिता-पूजन, शमी-पूजन, सीमोल्लंघन तथा कलश-विसर्जन करें। स्थानीय दशमी-व्याप्ति के अनुसार पूजा का समय देखें। "+note
        :"गुप्त या वासन्तिक नवरात्र-साधना का समापन और पारण अपनी गुरु, कुल तथा क्षेत्रीय परंपरा के अनुसार करें। "+note;
      item.articleUrl="https://ourhindudharm.blogspot.com/p/kalashvisarjan.html";
      item.articleLabel=family.kind==="शारदीय"?"कलश-विसर्जन विधि":"पारण और अनुष्ठान-समापन की जानकारी";
    }else return null;
    item.description+=" चयनित स्थान: "+locationName+"।";
    return item;
  }
  async function buildDynamicNavratriEvents(year,month,token){
    var monthToFamilies={1:true,2:true,3:true,4:true,6:true,7:true,9:true,10:true};
    if(!monthToFamilies[month]) return {events:[],recognized:false};
    var found=[],sunriseRows=[],recognized=false;
    var days=new Date(year,month,0).getDate();
    for(var day=1;day<=days;day++){
      if(token!==requestToken)return {events:[],recognized:false};
      var iso=String(year)+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0");
      var values;
      try{values=await getDatePanchang(iso);}catch(_){continue;}
      if(token!==requestToken)return {events:[],recognized:false};
      var p=values.p||{},sunrise=new Date(p.sunrise);
      if(!Number.isFinite(sunrise.getTime()))continue;
      // getPanchangam के scalar masa/tithi/paksha स्थानीय सूर्योदय के आधार पर हैं।
      var masa=normalizedMasaName(p.masa);
      var family=navratriFamily(masa);
      if(!family)continue;
      var rawTithi=p.tithi;
      var rawTithiValue=rawTithi&&typeof rawTithi==="object"?(rawTithi.index??rawTithi.number??rawTithi.value??rawTithi.name):rawTithi;
      var readableTithi=(typeof rawTithiValue==="number"&&Number.isFinite(rawTithiValue)&&rawTithiValue>=0&&rawTithiValue<=29)||
        /प्रतिपदा|द्वितीया|तृतीया|चतुर्थी|पंचमी|षष्ठी|सप्तमी|अष्टमी|नवमी|दशमी|pratipada|dvitiya|tritiya|chaturthi|panchami|shashthi|saptami|ashtami|navami|dashami/i.test(String(rawTithiValue||""));
      if(!readableTithi)continue;
      var tithiIndex=shuklaTithiIndex(p);
      // केवल शुक्ल प्रतिपदा से दशमी तक की सूर्योदय-व्यापिनी तिथियाँ लें।
      if(tithiIndex===null)continue;
      recognized=true;
      sunriseRows.push({date:iso,family:family,tithiIndex:tithiIndex,locationName:(values.location&&values.location.name)||"चुना हुआ स्थान"});
    }
    // तिथि-वृद्धि में एक ही तिथि दो सूर्योदय पर मिले तो पहला दिन लें।
    // तिथि-क्षय में अगली सूर्योदय-तिथि दो अंक आगे हो तो छूटी तिथि की देवी
    // का पूजन उसी पूर्ववर्ती सूर्योदय-तिथि वाले दिन जोड़ें। यह क्रम Drik के
    // 2026 आषाढ़ गुप्त नवरात्र (17 जुलाई: तृतीया पर चन्द्रघंटा + कूष्माण्डा)
    // से मिलाया गया है।
    var tithiNames=["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी"];
    for(var i=0;i<sunriseRows.length;){
      var row=sunriseRows[i],nextIndex=i+1;
      while(nextIndex<sunriseRows.length&&sunriseRows[nextIndex].family.id===row.family.id&&sunriseRows[nextIndex].tithiIndex===row.tithiIndex)nextIndex++;
      var base=makeDynamicNavratriEvent(row.date,row.family,row.tithiIndex,row.locationName);
      if(base)found.push(base);
      var nextRow=sunriseRows[nextIndex];
      if(nextRow&&nextRow.family.id===row.family.id&&nextRow.tithiIndex>row.tithiIndex+1){
        for(var skipped=row.tithiIndex+1;skipped<nextRow.tithiIndex&&skipped<=8;skipped++){
          var extra=makeDynamicNavratriEvent(row.date,row.family,skipped,row.locationName);
          if(!extra)continue;
          var sunriseName=tithiNames[row.tithiIndex],skippedName=tithiNames[skipped];
          var deity=navratriDeities[skipped]||"देवी";
          extra.title=row.family.label+" "+sunriseName+" (क्षय "+skippedName+") — "+deity;
          extra.hinduTithi=base?base.hinduTithi:"शुक्ल "+sunriseName;
          extra.description="सूर्योदय-व्यापिनी "+extra.hinduTithi+" के दिन "+skippedName+" तिथि का क्षय होने से "+deity+" का पूजन भी इसी दिन किया जाता है। "+String(extra.description||"");
          found.push(extra);
        }
      }
      i=nextIndex;
    }
    return {events:found,recognized:recognized};
  }
  function isLegacyNavratriDailyEvent(item){
    var title=String(item&&item.title||"");
    return /नवरात्र|नवदुर्गा|शैलपुत्री|ब्रह्मचारिणी|चन्द्रघण्टा|चन्द्रघंटा|कूष्माण्डा|स्कन्दमाता|कात्यायनी|कालरात्रि|महागौरी|सिद्धिदात्री|कलश विसर्जन/i.test(title);
  }

  function safeUrl(value){
    if(!value) return "";
    try { var u=new URL(value,window.location.href); return (u.protocol==="https:"||u.protocol==="http:")?u.href:""; }
    catch(e){ return ""; }
  }
  function linkKey(url){
    var href=safeUrl(url);
    if(!href)return "";
    try{
      var parsed=new URL(href);
      parsed.hash="";
      return parsed.href;
    }catch(e){return href;}
  }
  function makeLink(url,label,seenUrls){
    var href=safeUrl(url);
    if(!href) return null;
    var key=linkKey(href);
    if(seenUrls&&key&&seenUrls.has(key))return null;
    if(seenUrls&&key)seenUrls.add(key);
    var a=document.createElement("a");
    a.href=href;a.target="_blank";a.rel="noopener noreferrer";a.textContent=label||"लेख पढ़ें";
    return a;
  }
  // Legacy descriptions may contain article anchors and line breaks.
  // Render only safe text, HTTP(S) links, and <br>; never inject raw HTML.
  function appendSafeDescriptionNode(parent,node,seenUrls){
    if(node.nodeType===Node.TEXT_NODE){
      parent.appendChild(document.createTextNode(node.nodeValue||""));
      return;
    }
    if(node.nodeType!==Node.ELEMENT_NODE) return;
    var tag=node.tagName.toLowerCase();
    if(tag==="br"){
      parent.appendChild(document.createElement("br"));
      return;
    }
    if(tag==="a"){
      var href=safeUrl(node.getAttribute("href"));
      if(href){
        var key=linkKey(href);
        var duplicate=seenUrls&&key&&seenUrls.has(key);
        if(seenUrls&&key)seenUrls.add(key);
        if(duplicate){
          Array.from(node.childNodes).forEach(function(child){appendSafeDescriptionNode(parent,child,seenUrls);});
          return;
        }
        var link=document.createElement("a");
        link.href=href;link.target="_blank";link.rel="noopener noreferrer";
        Array.from(node.childNodes).forEach(function(child){appendSafeDescriptionNode(link,child,seenUrls);});
        parent.appendChild(link);
        return;
      }
    }
    Array.from(node.childNodes).forEach(function(child){appendSafeDescriptionNode(parent,child,seenUrls);});
  }
  function renderDescription(container,value,seenUrls){
    var parsed=new DOMParser().parseFromString(String(value||""),"text/html");
    Array.from(parsed.body.childNodes).forEach(function(node){appendSafeDescriptionNode(container,node,seenUrls);});
  }
  function normalizeSearch(value){
    return String(value||"")
      .replace(/<[^>]*>/g," ")
      .replace(/&nbsp;|&#160;/gi," ")
      .normalize("NFC")
      .toLocaleLowerCase("hi")
      .replace(/[\s\u200b\u200c\u200d]+/g," ")
      .replace(/[।॥,;:()\[\]{}·—–-]+/g," ")
      .trim();
  }
  function focusFestivalCard(){
    if(!focusPending)return;
    var cards=Array.from(eventsEl.querySelectorAll(".event"));
    var sameDate=cards.filter(function(card){return card.dataset.date===focusDate;});
    if(!sameDate.length)return;

    var wanted=normalizeSearch(focusTitle);
    var target=wanted?sameDate.find(function(card){
      return normalizeSearch(card.dataset.eventTitle)===wanted;
    }):null;
    // Festival titles can be normalized/expanded by dynamic monthly rules.
    // If exact matching fails, prefer a title containing the other title, then the date's first card.
    if(!target&&wanted)target=sameDate.find(function(card){
      var actual=normalizeSearch(card.dataset.eventTitle);
      return actual&&(actual.includes(wanted)||wanted.includes(actual));
    });
    if(!target)target=sameDate[0];

    focusPending=false;
    target.style.scrollMarginTop="100px";
    window.requestAnimationFrame(function(){
      if(!target.isConnected)return;
      var top=target.getBoundingClientRect().top+window.pageYOffset-100;
      window.scrollTo({top:Math.max(0,top),behavior:"auto"});
      target.style.outline="3px solid #d97706";
      target.style.outlineOffset="3px";
      window.setTimeout(function(){
        target.style.outline="";
        target.style.outlineOffset="";
      },3000);
    });
  }
  function categoryFor(item){
    var title=normalizeSearch(item.title||"");
    var raw=normalizeSearch(item.category||"");
    if(/एकादशी/.test(title)||raw==="एकादशी") return "एकादशी";
    if(/प्रदोष/.test(title)||raw==="प्रदोष") return "प्रदोष व्रत";
    if(/कालाष्टमी|अष्टमी व्रत|अहोई अष्टमी/.test(title)) return "अष्टमी व्रत";
    if(/चतुर्थी|संकष्टी|विनायक/.test(title)) return "चतुर्थी व्रत";
    if(/अमावस्या/.test(title)||raw==="अमावस्या") return "अमावस्या";
    if(/पूर्णिमा/.test(title)||raw==="पूर्णिमा") return "पूर्णिमा";
    if(/संक्रांति/.test(title)||raw==="संक्रांति") return "संक्रांति";
    if(/नवरात्र|दुर्गा पूजा/.test(title)||raw==="नवरात्रि") return "नवरात्रि एवं दुर्गा पूजा";
    if(/जयंती|जन्मोत्सव/.test(title)||raw==="जयंती") return "जयंती";
    if(/पूजा|दीपावली|दशहरा|विजयादशमी|धनतेरस|भाई दूज|छठ|गोवर्धन|तुलसी विवाह|देव दीपावली|काली चौदस|नरक चतुर्दशी|गोपाष्टमी|कंस वध/.test(title)) return "पर्व एवं त्योहार";
    if(/व्रत/.test(title)||raw==="व्रत"||raw==="व्रत पर्व"||raw==="व्रत-पर्व") return "अन्य व्रत";
    return "अन्य पर्व";
  }
  function applyFilters(){
    var query=normalizeSearch(searchInput.value);
    var cards=Array.from(eventsEl.querySelectorAll(".event"));
    var matches=[],others=[];
    cards.forEach(function(card){
      var haystack=normalizeSearch(card.dataset.search||"");
      var isMatch=!query||haystack.includes(query);
      card.hidden=!!query&&!isMatch;
      (isMatch?matches:others).push(card);
    });
    // मिलान वाली प्रविष्टि सूची में सबसे ऊपर; बाकी खोज के दौरान छिपी रहती हैं।
    matches.concat(others).forEach(function(card){eventsEl.appendChild(card);});
    var visible=matches.length,total=cards.length;
    countEl.textContent=query?visible+" / "+total+" पर्व":total+" पर्व";
    var empty=eventsEl.querySelector(".filter-empty");
    if(query&&!visible&&total){
      if(!empty){
        empty=document.createElement("div");empty.className="empty filter-empty";
        empty.textContent="कोई पर्व नहीं मिला। खोज का शब्द बदलें।";
        eventsEl.appendChild(empty);
      }
      empty.hidden=false;
    }else if(empty){empty.hidden=true;}
  }
  function render(data,year,month,token){
    eventsEl.replaceChildren();
    if(reviewMode&&data&&data.status&&data.status!=="approved"){
      var dataNotice=document.createElement("div");dataNotice.className="note";dataNotice.style.marginTop="0";
      dataNotice.textContent="डेटा स्थिति: "+String(data.status)+"। "+String(data.locationScope||"इस महीने की प्रविष्टियों की प्रकाशन-पूर्व समीक्षा आवश्यक है।")+" सार्वजनिक सूची में केवल स्वीकृत प्रविष्टियाँ दिखाई जाती हैं।";
      eventsEl.appendChild(dataNotice);
    }
    listTitle.textContent=months[month-1]+" "+year+" के व्रत-पर्व";
    var pageTitle=document.getElementById("pageTitle");
    if(pageTitle) pageTitle.textContent=months[month-1]+" "+year+" — व्रत एवं त्योहार";
    var list=(data&&Array.isArray(data.events))?data.events.slice():[];
    // वर्ष के सामान्य ग्रहण-कैटलॉग कार्ड स्थान-विशिष्ट नहीं होते।
    // उन्हें हटाकर केवल ऊपर की स्थानीय दृश्यता-जाँच से बने कार्ड दिखाएँ।
    list=list.filter(function(item){
      var eclipseText=String(item.title||"")+" "+String(item.category||"");
      return item.isLocationEclipse===true||!/ग्रहण|grahan|eclipse/i.test(eclipseText);
    });
    if(!reviewMode){
      list=list.filter(function(item){return item.isLocationEclipse===true||item.reviewStatus==="approved"||item.reviewStatus==="user-confirmed-hard-copy"||item.calculationStatus==="nakshatra-derived"||item.calculationStatus==="tithi-derived";});
    }
    list.sort(function(a,b){return String(a.date||"").localeCompare(String(b.date||""));});
    countEl.textContent=list.length+" प्रविष्टियाँ";
    searchInput.value="";
    if(!list.length){
      var empty=document.createElement("div");empty.className="empty";
      empty.textContent="इस महीने का डेटा अभी उपलब्ध नहीं है। सत्यापित डेटा जोड़ने पर यहाँ व्रत-पर्व दिखाई देंगे।";
      eventsEl.appendChild(empty);return;
    }
    list.forEach(function(item){
      var card=document.createElement("article");card.className="event";
      card.dataset.date=String(item.date||"");
      card.dataset.eventTitle=String(item.title||"");
      var date=document.createElement("div");date.className="date";
      var strong=document.createElement("strong");strong.textContent=String(item.date||"").slice(8,10)||item.dateLabel||"";
      date.appendChild(strong);
      var dateObj=new Date(String(item.date||"")+"T12:00:00+05:30");
      var monthName=document.createElement("span");
      monthName.className="month-name";
      monthName.textContent=Number.isNaN(dateObj.getTime())?"":months[dateObj.getMonth()];
      monthName.style.cssText="display:block;font-size:10px;line-height:1.3;overflow-wrap:normal;word-break:keep-all";
      date.appendChild(monthName);
      var small=document.createElement("small");
      small.className="weekday";
      small.textContent=Number.isNaN(dateObj.getTime())?"":["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"][dateObj.getDay()];
      small.style.cssText="font-size:10px;line-height:1.3;overflow-wrap:normal;word-break:keep-all";
      date.appendChild(small);card.appendChild(date);

      card.dataset.search=[item.title,item.hinduTithi,item.description,item.category].join(" ");
      card.dataset.category=String(item.category||"");
      var content=document.createElement("div");content.className="content";
      var title=document.createElement("div");title.className="title";title.textContent=item.title||"व्रत-पर्व";
      content.appendChild(title);
      if(item.hinduTithi){var tithi=document.createElement("div");tithi.className="hindu-tithi";tithi.textContent=item.hinduTithi;content.appendChild(tithi);}
      var cardLinkUrls=new Set();
      if(item.description){
        var desc=document.createElement("div");desc.className="desc";
        var description=String(item.description);
        // नियम-आधारित मुहूर्त होने पर पुराने विवरण का स्थिर घड़ी-समय न दिखाएँ।
        if(item.muhurtaRule||Array.isArray(item.muhurtaRules)){
          description=description
            .replace(/(?:विशेष\s*)?(?:पूजा\s*)?मुहूर्त\s*[=:：-]*\s*शाम?\s*\d{1,2}[.:：]\d{1,2}\s*[-–—to]+\s*\d{1,2}[.:：]\d{1,2}\s*(?:AM|PM|am|pm|पूर्वाह्न|अपराह्न)?/gi,"")
            .replace(/\s{2,}/g," ")
            .trim();
        }
        renderDescription(desc,description,cardLinkUrls);content.appendChild(desc);
      }
      if(item.saraswatiLocation){
        var locationNote=document.createElement("div");
        locationNote.className="saraswati-location";
        locationNote.textContent="स्थान: "+item.saraswatiLocation;
        locationNote.style.cssText="font-size:10px;line-height:1.35;color:#74685a;margin-top:4px";
        content.appendChild(locationNote);
      }
      appendMuhurta(item,String(item.muhurtaDate||item.date||""),content,token);
      var links=document.createElement("div");links.className="links";
      var mainLink=makeLink(item.articleUrl,item.articleLabel,cardLinkUrls);
      if(mainLink)links.appendChild(mainLink);
      var secondaryLink=makeLink(item.secondaryArticleUrl,item.secondaryArticleLabel,cardLinkUrls);
      if(secondaryLink)links.appendChild(secondaryLink);

      // चुनी हुई पर्व-तारीख़ के लिए मुख्य पंचांग का सीधा लिंक।
      // केवल वैध YYYY-MM-DD तारीख़ पर लिंक बनता है; गणना यहाँ दोबारा नहीं होती।
      var panchangDate=String(item.date||"");
      if(/^\d{4}-\d{2}-\d{2}$/.test(panchangDate)){
        var panchangDateCheck=new Date(panchangDate+"T12:00:00");
        if(!Number.isNaN(panchangDateCheck.getTime())&&
           panchangDateCheck.getFullYear()===Number(panchangDate.slice(0,4))&&
           panchangDateCheck.getMonth()+1===Number(panchangDate.slice(5,7))&&
           panchangDateCheck.getDate()===Number(panchangDate.slice(8,10))){
          var panchangLink=makeLink("https://ourhindudharm.blogspot.com/p/panchang-today.html?date="+panchangDate,"इस दिन का पंचांग देखें",cardLinkUrls);
          if(panchangLink)links.appendChild(panchangLink);
        }
      }

      // ग्रहण की प्रविष्टि पर मौजूदा Blogger ग्रहण-पंचांग का लिंक दें।
      // मासिक सूची में ग्रहण की भारी गणना दोबारा शुरू नहीं होती।
      var eclipseText=String(item.title||"")+" "+String(item.category||"");
      var isEclipseEvent=/ग्रहण|grahan|eclipse/i.test(eclipseText);
      var eclipsePageUrl="https://ourhindudharm.blogspot.com/p/grahan-panchang.html";
      var eclipsePageKey=linkKey(eclipsePageUrl);
      var hasEclipsePageLink=!!(eclipsePageKey&&cardLinkUrls.has(eclipsePageKey));
      if(isEclipseEvent&&!hasEclipsePageLink){
        var eclipseLink=makeLink(eclipsePageUrl,"सूतक, मंत्र-जप एवं पुरश्चरण की जानकारी",cardLinkUrls);
        if(eclipseLink)links.appendChild(eclipseLink);
      }
      if(links.childNodes.length)content.appendChild(links);
      if(reviewMode&&item.showReviewStatus!==false){
        var status=document.createElement("div");status.className="pill";
        if(item.reviewStatus==="user-confirmed-hard-copy"||item.reviewStatus==="approved"){
          status.classList.add("confirmed");
          status.textContent=item.reviewStatus==="approved"?"तारीख़ स्वीकृत":"तारीख़ की पुष्टि की गई";
        }else {status.classList.add("review");status.textContent="समीक्षा बाकी";}
        content.appendChild(status);
      }
      card.appendChild(content);eventsEl.appendChild(card);
    });
    applyFilters();
    if(locationEclipseCalculationFailed&&!document.getElementById("ohd-eclipse-calculation-note")){
      var eclipseFailureNote=document.createElement("div");
      eclipseFailureNote.id="ohd-eclipse-calculation-note";
      eclipseFailureNote.className="note";
      eclipseFailureNote.style.marginTop="8px";
      eclipseFailureNote.textContent="इस स्थान के ग्रहण की दृश्यता अभी जाँची नहीं जा सकी। विस्तृत जानकारी के लिए ग्रहण-पंचांग खोलें।";
      var eclipseFailureLink=makeLink("https://ourhindudharm.blogspot.com/p/grahan-panchang.html?m=1","ग्रहण-पंचांग खोलें");
      if(eclipseFailureLink)eclipseFailureNote.appendChild(eclipseFailureLink);
      eventsEl.appendChild(eclipseFailureNote);
    }
  }
  async function fetchDwadashiYear(year,signal){
    var url="https://ourhindudharm.github.io/Panchang/data/dwadashi/"+year+".json";
    try{
      var response=await fetch(url,{signal:signal,cache:"no-cache"});
      if(!response.ok)return null;
      var data=await response.json();
      if(Number(data.year)!==Number(year)||data.status!=="approved"||!Array.isArray(data.tithis))return null;
      // वार्षिक तिथि-निर्णय स्थान-विशिष्ट है। दूसरे शहर में पिथौरागढ़ की तारीख़ें न दिखाएँ।
      var location=getLocalLocation();
      var annualLocation=data.location||{};
      var sameLatitude=Number.isFinite(Number(annualLocation.latitude))&&Math.abs(Number(annualLocation.latitude)-location.lat)<=0.01;
      var sameLongitude=Number.isFinite(Number(annualLocation.longitude))&&Math.abs(Number(annualLocation.longitude)-location.lon)<=0.01;
      if(!sameLatitude||!sameLongitude)return null;
      return data;
    }catch(_){return null}
  }
  function mergeAnnualDwadashiEvents(data,annual,year,month){
    if(!annual||annual.status!=="approved"||Number(annual.year)!==Number(year)||!Array.isArray(annual.tithis))return data;
    var events=Array.isArray(data.events)?data.events.slice():[];
    // वार्षिक पंचांग से सभी शुक्ल/कृष्ण द्वादशी की वास्तविक तिथि-उपस्थिति
    // मासिक सूची में जोड़ें; ये तिथि-सूचनाएँ व्रत-निर्णय का विकल्प नहीं हैं।
    (Array.isArray(annual.tithiDates)?annual.tithiDates:[]).forEach(function(item){
      if(!item||!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(item.date||"")))return;
      var date=String(item.date);
      if(Number(date.slice(0,4))!==Number(year)||Number(date.slice(5,7))!==Number(month))return;
      var paksha=String(item.paksha||"");
      if(!/^(शुक्ल|कृष्ण)$/.test(paksha)||!item.month)return;
      var tithiLabel=String(item.month)+" "+paksha+" द्वादशी";
      var exists=events.some(function(event){
        return String(event.date||"")===date&&String(event.hinduTithi||"")===tithiLabel;
      });
      if(exists)return;
      var observation=[];
      if(item.observedAtSunrise)observation.push("सूर्योदय पर");
      if(item.observedAtNoon)observation.push("दोपहर में");
      events.push({
        date:date,
        title:tithiLabel,
        description:"पंचांग गणना में "+(observation.join(" एवं ")||"")+
          " द्वादशी तिथि की उपस्थिति। यह तिथि-सूचना है; किसी विशेष व्रत का दिन व्रत-विशेष के शास्त्रीय नियम से निर्धारित होगा।",
        category:"द्वादशी तिथि",
        reviewStatus:"approved",
        calculationStatus:"panchang-engine-calculated",
        hinduTithi:tithiLabel,
        dwadashiTithi:true
      });
    });
    annual.tithis.forEach(function(record){
      if(!record||record.status!=="approved"||!record.selectedDate||!Array.isArray(record.displayNames)||!record.displayNames.length)return;
      var date=String(record.selectedDate);
      if(Number(date.slice(0,4))!==Number(year)||Number(date.slice(5,7))!==Number(month))return;
      var names=record.displayNames.map(function(name){return String(name||"").trim()}).filter(Boolean);
      if(!names.length)return;
      var paksha=String(record.paksha||"");
      var tithiLabel=String(record.month||"")+" "+paksha+" द्वादशी";
      var existing=events.find(function(item){
        if(String(item.date||"")!==date||/एकादशी|पारण|parana/i.test(String(item.title||"")))return false;
        return String(item.hinduTithi||"").includes(record.month)&&
          String(item.hinduTithi||"").includes(paksha)&&
          /द्वादशी/.test(String(item.hinduTithi||""))&&
          (/द्वादशी/.test(String(item.category||""))||/द्वादशी/.test(String(item.title||"")));
      });
      var details=(Array.isArray(record.observances)?record.observances:[]).map(function(item){
        return [item.name,item.deity,item.shortDetail].filter(Boolean).join(" — ");
      }).filter(Boolean);
      var description=details.join("\n\n");
      if(existing){
        var oldTitle=String(existing.title||"");
        var mergedNames=names.filter(function(name){return !oldTitle.includes(name)});
        if(mergedNames.length)existing.title=oldTitle+" / "+mergedNames.join(" / ");
        if(description&&!String(existing.description||"").includes(description))existing.description=[existing.description,description].filter(Boolean).join("\n\n");
        existing.dwadashiAliases=names;
        return;
      }
      events.push({
        date:date,
        title:names.join(" / "),
        description:description,
        category:"द्वादशी व्रत",
        reviewStatus:"approved",
        calculationStatus:"tithi-derived",
        hinduTithi:tithiLabel,
        dwadashiAliases:names
      });
    });
    return Object.assign({},data,{events:events});
  }

  async function loadMonth(preserveViewportAnchor){
    var anchorTop=preserveViewportAnchor&&preserveViewportAnchor.isConnected
      ?preserveViewportAnchor.getBoundingClientRect().top:null;
    function restoreViewportAnchor(){
      if(anchorTop===null||!preserveViewportAnchor||!preserveViewportAnchor.isConnected)return;
      window.requestAnimationFrame(function(){
        if(!preserveViewportAnchor.isConnected)return;
        var delta=preserveViewportAnchor.getBoundingClientRect().top-anchorTop;
        if(Math.abs(delta)>1)window.scrollBy(0,delta);
      });
    }
    var token=++requestToken;
    // नई navigation पर पुराने अटके हुए request को रद्द करें।
    if(activeMonthRequest){activeMonthRequest.abort();activeMonthRequest=null;}
    var controller=new AbortController();
    activeMonthRequest=controller;
    var timeoutId=setTimeout(function(){controller.abort();},15000);
    var year=Number(yearSelect.value),month=Number(monthSelect.value);
    syncMonthNavigationButtons();
    listTitle.textContent=months[month-1]+" "+year+" के व्रत-पर्व";
    countEl.textContent="लोड हो रहा है…";
    eventsEl.replaceChildren();
    var loading=document.createElement("div");loading.className="empty";loading.textContent="इस महीने की सूची लोड हो रही है…";eventsEl.appendChild(loading);
    var url="https://ourhindudharm.github.io/Panchang/data/festivals/"+year+"-"+String(month).padStart(2,"0")+".json";
    try{
      var response=await fetch(url,{signal:controller.signal,cache:"no-cache"});
      if(!response.ok) throw new Error("not-found");
      var data=await response.json();
      if(token!==requestToken)return;
      var dwadashiYearPromise=fetchDwadashiYear(year,controller.signal);
      // पहले उपलब्ध मासिक सूची दिखाएँ; नवरात्रि की गतिशील गणना के दौरान
      // उपयोगकर्ता को खाली loading screen पर प्रतीक्षा न करनी पड़े।
      if(Array.isArray(data.events)&&data.events.length){render(data,year,month,token);restoreViewportAnchor();}
      var storedEvents=Array.isArray(data.events)?data.events:[];
      // 2026 आषाढ़ गुप्त नवरात्र के स्वीकृत कार्ड विशेष तिथि-व्याप्ति पर आधारित हैं:
      // 17 जुलाई को सूर्योदय-व्यापिनी तृतीया थी; चतुर्थी 06:28 पर शुरू होकर
      // 18 जुलाई के सूर्योदय से पहले समाप्त हुई (क्षय चतुर्थी)। इसलिए Drik के अनुसार
      // चन्द्रघंटा तथा कूष्माण्डा दोनों की पूजा 17 जुलाई को है।
      // सूर्योदय की एकल तिथि से बने dynamic cards कूष्माण्डा को हटा देते,
      // अतः इस सत्यापित वर्ष-मास में JSON के नौ देवी-पूजन कार्ड सुरक्षित रखें।
      var curatedAshadhaGupta2026=year===2026&&month===7&&storedEvents.some(function(item){
        return item.date==="2026-07-15"&&/आषाढ़ गुप्त नवरात्र प्रारम्भ/.test(String(item.title||""))&&item.reviewStatus==="approved";
      });
      var curatedSharadNavratri2026=year===2026&&month===10&&storedEvents.some(function(item){
        return item.date==="2026-10-11"&&/शारदीय नवरात्र प्रारम्भ/.test(String(item.title||""))&&item.reviewStatus==="approved";
      });
      // 2026 शारदीय नवरात्र में 18 अक्टूबर को सप्तमी सूर्योदय पर दोहराई गई;
      // 19 अक्टूबर को सूर्योदय पर अष्टमी और दिन में नवमी-व्याप्ति से महाष्टमी
      // तथा महानवमी दोनों हैं। इन सत्यापित स्थिर कार्डों को sunrise-only
      // dynamic सूची से बदलना नहीं है।
      var keepCuratedNavratri2026=curatedAshadhaGupta2026||curatedSharadNavratri2026;
      var dynamicNavratri=keepCuratedNavratri2026?{events:[],recognized:false}:await buildDynamicNavratriEvents(year,month,token);
      if(token!==requestToken)return;
      // जब मास/तिथि से नवरात्रि सफलतापूर्वक पहचानी जाए, पुराने वर्ष-विशेष
      // दिनांक/मुहूर्त वाले दैनिक नवरात्र शीर्षकों को गतिशील प्रविष्टियों से बदलें।
      if(dynamicNavratri.recognized) storedEvents=storedEvents.filter(function(item){return !isLegacyNavratriDailyEvent(item);});
      data.events=storedEvents.concat(dynamicNavratri.events);
      var computedSaraswatiEvents=await buildSaraswatiNakshatraEvents(data,year,month,token);
      if(token!==requestToken)return;
      data.events=data.events.concat(computedSaraswatiEvents);
      var locationEclipseEvents=await buildLocationEclipseEvents(year,month,token);
      if(token!==requestToken)return;
      data.events=data.events.concat(locationEclipseEvents);
      var approvedDwadashiYear=await dwadashiYearPromise;
      if(token!==requestToken)return;
      data=mergeAnnualDwadashiEvents(data,approvedDwadashiYear,year,month);
      render(data,year,month,token);
      restoreViewportAnchor();
      focusFestivalCard();
    }catch(e){
      if(token!==requestToken)return;
      if(e&&e.name==="AbortError"){
        render({events:[]},year,month,token);
        restoreViewportAnchor();
        countEl.textContent="लोड होने में समय लगा। कृपया फिर से महीना चुनें।";
      }else{
        // भविष्य-वर्ष की स्थिर JSON फ़ाइल न होने पर भी नवरात्रि पंचांग से बने।
        try{
          var fallbackData={events:[]};
          var fallbackNavratri=await buildDynamicNavratriEvents(year,month,token);
          fallbackData.events=fallbackNavratri.events;
          var fallbackSaraswati=await buildSaraswatiNakshatraEvents(fallbackData,year,month,token);
          if(token!==requestToken)return;
          fallbackData.events=fallbackData.events.concat(fallbackSaraswati);
          render(fallbackData,year,month,token);
          restoreViewportAnchor();
          focusFestivalCard();
          if(!fallbackData.events.length) countEl.textContent="इस महीने की स्थिर सूची उपलब्ध नहीं है; नवरात्रि की कोई गतिशील प्रविष्टि नहीं मिली।";
        }catch(fallbackError){
          render({events:[]},year,month,token);
          restoreViewportAnchor();
          countEl.textContent="स्थिर डेटा उपलब्ध नहीं है और गतिशील पंचांग-गणना भी पूरी नहीं हो सकी।";
        }
      }
    }finally{
      clearTimeout(timeoutId);
      if(token===requestToken)activeMonthRequest=null;
    }
  }
  function ensureYearOption(year){
    var numeric=Number(year);
    if(!Number.isInteger(numeric)||numeric<2026||numeric>2029)return null;
    var value=String(numeric);
    var existing=Array.from(yearSelect.options).find(function(option){return option.value===value;});
    if(existing)return existing;
    var option=document.createElement("option");
    option.value=value;option.textContent=value;
    yearSelect.appendChild(option);
    Array.from(yearSelect.options)
      .sort(function(a,b){return Number(a.value)-Number(b.value);})
      .forEach(function(item){yearSelect.appendChild(item);});
    return option;
  }
  function syncMonthNavigationButtons(){
    var year=Number(yearSelect.value),month=Number(monthSelect.value);
    var atStart=year===2026&&month===1,atEnd=year===2029&&month===12;
    var previous=document.getElementById("prevBtn");
    var next=document.getElementById("nextBtn");
    if(previous)previous.disabled=atStart;
    if(next)next.disabled=atEnd;
    var footerNav=widgetRoot.querySelector(".footer-month-nav");
    if(footerNav){
      var buttons=footerNav.querySelectorAll("button");
      if(buttons[0])buttons[0].disabled=atStart;
      if(buttons[1])buttons[1].disabled=atEnd;
    }
  }
  function shiftMonth(delta,shouldScrollToHeading,preserveViewportAnchor){
    var y=Number(yearSelect.value),m=Number(monthSelect.value)+delta;
    if(!Number.isFinite(y)||!Number.isFinite(m))return;
    if(m<1){m=12;y--;}else if(m>12){m=1;y++;}
    if(y<2026||y>2029){syncMonthNavigationButtons();return;}
    ensureYearOption(y);
    yearSelect.value=String(y);
    monthSelect.value=String(m).padStart(2,"0");
    syncMonthNavigationButtons();
    loadMonth(preserveViewportAnchor);
    // Only the top navigation intentionally moves the reader to the month heading.
    // Footer navigation keeps the reader near the controls they just used.
    if(shouldScrollToHeading!==false){
      var monthHeading=listTitle&&listTitle.closest(".summary")||listTitle;
      if(monthHeading){
        window.requestAnimationFrame(function(){
          var top=monthHeading.getBoundingClientRect().top+window.pageYOffset-12;
          window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
        });
      }
    }
  }
  function ensureFooterMonthNav(){
    var footer=widgetRoot.querySelector("footer");
    var nav=widgetRoot.querySelector(".footer-month-nav");
    if(!nav){
      nav=document.createElement("nav");
      nav.className="footer-month-nav";
      nav.setAttribute("aria-label","महीने बदलें");
      var prev=document.createElement("button");
      prev.type="button";prev.textContent="← पिछला महीना";
      var nextButton=document.createElement("button");
      nextButton.type="button";nextButton.textContent="अगला महीना →";
      nav.appendChild(prev);nav.appendChild(nextButton);
    }
    var navButtons=nav.querySelectorAll("button");
    if(navButtons[0]&&!navButtons[0].dataset.ohdNavBound){
      navButtons[0].dataset.ohdNavBound="1";
      navButtons[0].addEventListener("click",function(event){event.preventDefault();shiftMonth(-1,false,event.currentTarget);});
    }
    if(navButtons[1]&&!navButtons[1].dataset.ohdNavBound){
      navButtons[1].dataset.ohdNavBound="1";
      navButtons[1].addEventListener("click",function(event){event.preventDefault();shiftMonth(1,false,event.currentTarget);});
    }
    // महीने बदलने के बटन उपयोग-निर्देश शीर्षक के ठीक ऊपर रहें, पृष्ठ के सबसे नीचे नहीं।
    var guide=widgetRoot.querySelector("#ohd-monthly-usage-guide, section.note[aria-labelledby='howToUseTitle']");
    if(guide&&guide.parentNode){
      guide.parentNode.insertBefore(nav,guide);
    }else if(footer){
      footer.insertBefore(nav,footer.firstChild);
    }
  }
  function goToCurrentMonth(){
    var now=getIndiaCalendarDate();
    var year=now.getFullYear();
    ensureYearOption(year);
    if(!ensureYearOption(year))return;
    yearSelect.value=String(year);
    monthSelect.value=String(now.getMonth()+1).padStart(2,"0");
    syncMonthNavigationButtons();
    loadMonth();
  }
  locationSearchBtn.addEventListener("click",searchLocation);
  locationInput.addEventListener("keydown",function(event){
    if(event.key==="Enter"){event.preventDefault();searchLocation();}
  });
  ensureFooterMonthNav();
  syncLocationUI();
  searchInput.addEventListener("input",applyFilters);
  monthSelect.addEventListener("change",loadMonth);
  yearSelect.addEventListener("change",loadMonth);
  document.getElementById("prevBtn").addEventListener("click",function(event){
    event.preventDefault();shiftMonth(-1);
  });
  document.getElementById("nextBtn").addEventListener("click",function(event){
    event.preventDefault();shiftMonth(1);
  });
  if(currentMonthBtn) currentMonthBtn.addEventListener("click",function(event){
    event.preventDefault();goToCurrentMonth();
  });
  // पेज हर वर्ष अपने-आप वर्तमान महीने से खुले; पुराने/आने वाले वर्ष भी नेविगेशन में जुड़ सकें।
  var initialDate=getIndiaCalendarDate();
  var requestedYear=Number(pageParams.get("year"));
  var requestedMonth=Number(pageParams.get("month"));
  if(focusPending&&requestedYear>=1900&&requestedYear<=2200&&requestedMonth>=1&&requestedMonth<=12&&
     focusDate.slice(0,4)===String(requestedYear)&&Number(focusDate.slice(5,7))===requestedMonth){
    initialDate=new Date(requestedYear,requestedMonth-1,1,12,0,0);
  }
  var initialYear=Math.min(2029,Math.max(2026,initialDate.getFullYear()));
  if(initialYear!==initialDate.getFullYear())initialDate=new Date(initialYear,initialDate.getMonth(),1,12,0,0);
  ensureYearOption(initialYear);
  yearSelect.value=String(initialYear);
  monthSelect.value=String(initialDate.getMonth()+1).padStart(2,"0");
  syncMonthNavigationButtons();
  syncLocationUI();
  // The festival list must not wait for the external elevation service.
  loadMonth();
  (async function(){
    try{
      var fetchedElevation=await getTerrainElevation(29.5828,80.2182);
      var elevationChanged=fetchedElevation!==defaultLocationElevation;
      defaultLocationElevation=fetchedElevation;
      defaultElevationFromDem=true;
      syncLocationUI();
      if(elevationChanged){
        panchangCache.clear();
        locationEclipseCache.clear();
        loadMonth();
      }
    }catch(error){
      console.warn("Default location elevation unavailable; using configured elevation.",error);
    }
  })();
})();