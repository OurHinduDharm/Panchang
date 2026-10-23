
(function(){
  "use strict";
  // सार्वजनिक दृश्य में केवल स्वीकृत प्रविष्टियाँ; ?review=1 से समीक्षा संकेत दिखते हैं।
  // Blogger page editor may drop or ignore a stylesheet link in the page body.
  // Ensure the shared stylesheet is attached even when the HTML link is stripped.
  var cssHref="https://cdn.jsdelivr.net/gh/OurHinduDharm/Panchang@efd797e1972027ec11a79498a2c575cf61f581ba/monthly-vrat-parv-widget.css";
  if(!Array.from(document.styleSheets).some(function(sheet){try{return sheet.href===cssHref;}catch(_){return false;}})){
    var cssLink=document.createElement("link");
    cssLink.rel="stylesheet";cssLink.href=cssHref;document.head.appendChild(cssLink);
  }
  var reviewMode=new URLSearchParams(window.location.search).get("review")==="1";
  var widgetRoot=document.getElementById("ohd-monthly-festivals");
  if(!widgetRoot){console.error("OHD monthly festival widget root not found.");return;}
  widgetRoot.classList.toggle("review-mode",reviewMode);
  var reviewBanner=document.getElementById("reviewBanner");
  if(reviewBanner) reviewBanner.hidden=!reviewMode;
  var months=["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
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
  var panchangCache=new Map();
  // Keep precise coordinates only in page memory; do not persist geolocation in browser storage.
  var selectedLocationInSession=null;
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
    return {name:"पिथौरागढ़, उत्तराखंड, भारत",lat:29.5828,lon:80.2182,elevation:1650,state:"उत्तराखंड",city:"पिथौरागढ़"};
  }
  function syncLocationUI(){
    var location=getLocalLocation();
    locationStatus.textContent="मुहूर्त की गणना का स्थान: "+location.name;
    if(!locationInput.value) locationInput.value=location.city||location.name||"";
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
      var url="https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&accept-language=hi&q="+encodeURIComponent(query);
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
        button.addEventListener("click",function(){
          var address=place.address||{};
          var selected={
            name:place.display_name||place.name||query,
            lat:Number(place.lat),lon:Number(place.lon),elevation:0,
            state:address.state||address.state_district||address.region||"",
            city:address.city||address.town||address.village||address.municipality||place.name||query
          };
          if(!Number.isFinite(selected.lat)||!Number.isFinite(selected.lon)){
            locationStatus.textContent="इस परिणाम के निर्देशांक उपलब्ध नहीं हैं। दूसरा परिणाम चुनें।";
            return;
          }
          selectedLocationInSession=selected;
          panchangCache.clear();
          locationInput.value=selected.city||selected.name;
          locationSuggestions.replaceChildren();
          locationStatus.textContent="मुहूर्त की गणना का स्थान: "+selected.name+" · ऊँचाई उपलब्ध न होने पर 0 मीटर मानकर गणना होगी।";
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
      var panchangLib=(ready&&typeof ready.getPanchangam==="function"&&typeof ready.Observer==="function")
        ? ready
        : await import("https://esm.sh/@ishubhamx/panchangam-js@3.0.0");
      if(typeof panchangLib.Observer!=="function"||typeof panchangLib.getPanchangam!=="function"){
        throw new Error("Panchang library API unavailable");
      }
      var observer=new panchangLib.Observer(location.lat,location.lon,location.elevation);
      var date=new Date(dateIso+"T12:00:00");
      var nextDate=new Date(date);nextDate.setDate(nextDate.getDate()+1);
      var p=panchangLib.getPanchangam(date,observer,{timezoneOffset:330});
      var next=panchangLib.getPanchangam(nextDate,observer,{timezoneOffset:330});
      return {p:p,next:next,location:location,date:date,at:function(instant){return panchangLib.getPanchangam(instant,observer,{timezoneOffset:330});}};
    });
    panchangCache.set(cacheKey,promise);
    return promise;
  }
  async function appendMuhurta(item,dateIso,content,token){
    var ruleIds=Array.isArray(item.muhurtaRules)?item.muhurtaRules:(item.muhurtaRule?[item.muhurtaRule]:[]);
    if(!ruleIds.length) return;
    try{
      var muhurtaModule=await muhurtaModulePromise;
      if(!muhurtaModule) return;
      var usableRules=[];
      ruleIds.forEach(function(ruleId){
        var ruleItem=Object.assign({},item,{muhurtaRule:ruleId});
        var preliminary=muhurtaModule.getFestivalMuhurta(ruleItem,{});
        if(preliminary&&preliminary.status==="rule-pending"){
          var pending=document.createElement("div");pending.className="desc";
          pending.style.marginTop="7px";pending.textContent=preliminary.message||"मुहूर्त-नियम लंबित है।";
          content.appendChild(pending);
        }else usableRules.push(ruleItem);
      });
      if(!usableRules.length) return;
      var values=await getDatePanchang(dateIso);
      if(token!==requestToken||!content.isConnected) return;
      var context=muhurtaModule.getFestivalMuhurtaContext(values.p,values.next,values.date,values.location);
      usableRules.forEach(function(ruleItem){
        var result=muhurtaModule.getFestivalMuhurta(ruleItem,context);
        if(!result) return;
        var box=document.createElement("div");box.className="desc";
        box.style.marginTop="7px";box.style.padding="8px 9px";box.style.borderRadius="8px";box.style.background="#fff8e9";
        var title=document.createElement("strong");title.textContent=result.label||"मुहूर्त";box.appendChild(title);
        var detail=document.createElement("div");
        if(result.status==="calculated"&&result.time){
          detail.textContent=muhurtaModule.formatFestivalMuhurtaTime(result.time);
        }else if(result.status==="calculated"&&result.start&&result.end){
          detail.textContent=muhurtaModule.formatFestivalMuhurtaTime(result.start)+" – "+muhurtaModule.formatFestivalMuhurtaTime(result.end);
        }else{
          detail.textContent=result.message||"मुहूर्त उपलब्ध नहीं है।";
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
  function panchangTithiAt(panchang){return normalizedPanchangName(panchang&&panchang.tithi,"tithi");}
  function addSaraswatiEvent(events,iso,title,description,ritual,nakshatra,locationName){
    events.push({date:iso,dateLabel:iso.slice(8,10)+" "+months[Number(iso.slice(5,7))-1],title:title,
      description:description+" स्थानीय स्थान: "+locationName+"। यह नक्षत्र-आधारित गणना है; परंपरा-विशेष का अंतिम निर्णय स्थानीय धर्मशास्त्रीय नियम से करें।",
      category:"नवरात्रि",calculationStatus:"nakshatra-derived",reviewStatus:"needs-review",showReviewStatus:true,
      hinduTithi:"स्थानीय पंचांगानुसार",saraswatiRitual:ritual,saraswatiNakshatra:nakshatra});
  }
  async function buildSaraswatiNakshatraEvents(data,year,month,token){
    if(month!==9&&month!==10) return [];
    var events=Array.isArray(data&&data.events)?data.events:[];
    var startEvent=events.find(function(item){return /शारदीय नवरात्र.*प्रारम्भ|शारदीय नवरात्र.*प्रारंभ/.test(String(item.title||""));});
    // नवरात्रि सितंबर में आरम्भ होकर अक्टूबर में हो तो अक्टूबर सूची पिछले महीने का आरम्भ पढ़े।
    if(!startEvent&&month===10){
      try{
        var previousMonth=9;
        var previousResponse=await fetch("https://ourhindudharm.github.io/Panchang/data/festivals/"+year+"-09.json",{cache:"no-cache"});
        if(previousResponse.ok){var previousData=await previousResponse.json();startEvent=(previousData.events||[]).find(function(item){return /शारदीय नवरात्र.*प्रारम्भ|शारदीय नवरात्र.*प्रारंभ/.test(String(item.title||""));});}
      }catch(_){/* मौजूदा माह के डेटा से आगे प्रयास करें */}
    }
    if(!startEvent||!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(startEvent.date||""))) return [];
    var start=new Date(startEvent.date+"T12:00:00");
    var endIso=/^\\d{4}-\\d{2}-\\d{2}$/.test(String(startEvent.endDate||""))?startEvent.endDate:"";
    var end=endIso?new Date(endIso+"T12:00:00"):new Date(start.getTime()+9*86400000);
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<start) return [];
    var found=[];
    for(var cursor=new Date(start);cursor<=end;cursor.setDate(cursor.getDate()+1)){
      if(token!==requestToken) return [];
      var iso=cursor.getFullYear()+"-"+String(cursor.getMonth()+1).padStart(2,"0")+"-"+String(cursor.getDate()).padStart(2,"0");
      if(Number(iso.slice(5,7))!==month) continue;
      var values;
      try{values=await getDatePanchang(iso);}catch(_){continue;}
      if(token!==requestToken) return [];
      var p=values.p||{},sunrise=new Date(p.sunrise),sunset=new Date(p.sunset);
      if(!Number.isFinite(sunrise.getTime())||!Number.isFinite(sunset.getTime())||sunset<=sunrise) continue;
      var locationName=(values.location&&values.location.name)||"चुना हुआ स्थान";
      // मूल में स्थापना/आवाहन: धर्मसिंधु-पाठ के अनुसार सूर्यास्त से तीन मुहूर्त (144 मिनट) पहले।
      var avahanTime=new Date(sunset.getTime()-144*60000),avahanPanchang;
      try{avahanPanchang=values.at(avahanTime);}catch(_){avahanPanchang=p;}
      if(panchangNakshatraAt(avahanPanchang)==="मूल"){
        var avahanClock=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:true}).format(avahanTime);
        addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का आवाहन / स्थापना","मूल नक्षत्र में देवी का आवाहन/स्थापन। धर्मसिंधु-पाठ के अनुसार संदर्भ-समय सूर्यास्त से तीन मुहूर्त पूर्व है; गणित समय: "+avahanClock+" IST।","avahana","मूल",locationName);
      }
      // पूर्वाषाढ़ा और उत्तराषाढ़ा: कर्म-दिवस की मध्याह्न-व्याप्ति जाँचें।
      var noonNakshatra=panchangNakshatraAt(p);
      if(noonNakshatra==="पूर्वाषाढ़ा") addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का मुख्य पूजन","पूर्वाषाढ़ा नक्षत्र की मध्याह्न-व्याप्ति में सरस्वती-पूजन।","puja","पूर्वाषाढ़ा",locationName);
      if(noonNakshatra==="उत्तराषाढ़ा") addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का बलिदान / उत्तरपूजा","उत्तराषाढ़ा नक्षत्र की मध्याह्न-व्याप्ति में बलिदान/उत्तरपूजा; बलि का स्वरूप अपनी अहिंसक या कुल-परंपरा के अनुसार निर्धारित करें।","balidan","उत्तराषाढ़ा",locationName);
      // विसर्जन के लिए अपराह्न में श्रवण और दशमी दोनों जाँचें; केवल तारीख़ गिनकर निर्णय न लें।
      var aparahnaTime=new Date(sunrise.getTime()+(sunset.getTime()-sunrise.getTime())*0.7),aparahnaPanchang;
      try{aparahnaPanchang=values.at(aparahnaTime);}catch(_){aparahnaPanchang=p;}
      if(panchangNakshatraAt(aparahnaPanchang)==="श्रवण"&&panchangTithiAt(aparahnaPanchang)==="दशमी"){
        addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का विसर्जन / उद्वासन","श्रवण नक्षत्र और दशमी की अपराह्न-व्याप्ति मिलने पर विसर्जन/उद्वासन।","visarjana","श्रवण",locationName);
      }
    }
    return found;
  }

  function safeUrl(value){
    if(!value) return "";
    try { var u=new URL(value,window.location.href); return (u.protocol==="https:"||u.protocol==="http:")?u.href:""; }
    catch(e){ return ""; }
  }
  function makeLink(url,label){
    var href=safeUrl(url);
    if(!href) return null;
    var a=document.createElement("a");
    a.href=href;a.target="_blank";a.rel="noopener noreferrer";a.textContent=label||"लेख पढ़ें";
    return a;
  }
  // Legacy descriptions may contain article anchors and line breaks.
  // Render only safe text, HTTP(S) links, and <br>; never inject raw HTML.
  function appendSafeDescriptionNode(parent,node){
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
        var link=document.createElement("a");
        link.href=href;link.target="_blank";link.rel="noopener noreferrer";
        Array.from(node.childNodes).forEach(function(child){appendSafeDescriptionNode(link,child);});
        parent.appendChild(link);
        return;
      }
    }
    Array.from(node.childNodes).forEach(function(child){appendSafeDescriptionNode(parent,child);});
  }
  function renderDescription(container,value){
    var parsed=new DOMParser().parseFromString(String(value||""),"text/html");
    Array.from(parsed.body.childNodes).forEach(function(node){appendSafeDescriptionNode(container,node);});
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
    listTitle.textContent=months[month-1]+" "+year+" के व्रत-पर्व";
    var pageTitle=document.getElementById("pageTitle");
    if(pageTitle) pageTitle.textContent=months[month-1]+" "+year+" — व्रत एवं त्योहार";
    var list=(data&&Array.isArray(data.events))?data.events.slice():[];
    if(!reviewMode){
      list=list.filter(function(item){return item.reviewStatus==="approved"||item.reviewStatus==="user-confirmed-hard-copy"||item.calculationStatus==="nakshatra-derived";});
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
      var date=document.createElement("div");date.className="date";
      var strong=document.createElement("strong");strong.textContent=String(item.date||"").slice(8,10)||item.dateLabel||"";
      date.appendChild(strong);
      var dateObj=new Date(String(item.date||"")+"T12:00:00");
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
      if(item.description){var desc=document.createElement("div");desc.className="desc";renderDescription(desc,item.description);content.appendChild(desc);}
      appendMuhurta(item,String(item.muhurtaDate||item.date||""),content,token);
      var links=document.createElement("div");links.className="links";
      var mainLink=makeLink(item.articleUrl,item.articleLabel);
      if(mainLink)links.appendChild(mainLink);
      var secondaryLink=makeLink(item.secondaryArticleUrl,item.secondaryArticleLabel);
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
          var panchangLink=document.createElement("a");
          panchangLink.href="https://ourhindudharm.blogspot.com/p/panchang-today.html?date="+panchangDate;
          panchangLink.target="_blank";
          panchangLink.rel="noopener noreferrer";
          panchangLink.textContent="इस दिन का पंचांग देखें";
          links.appendChild(panchangLink);
        }
      }

      // ग्रहण की प्रविष्टि पर मौजूदा Blogger ग्रहण-पंचांग का लिंक दें।
      // मासिक सूची में ग्रहण की भारी गणना दोबारा शुरू नहीं होती।
      var eclipseText=String(item.title||"")+" "+String(item.category||"");
      var isEclipseEvent=/ग्रहण|grahan|eclipse/i.test(eclipseText);
      var eclipsePageUrl="https://ourhindudharm.blogspot.com/p/grahan-panchang.html";
      var hasEclipsePageLink=[item.articleUrl,item.secondaryArticleUrl].some(function(url){
        var href=safeUrl(url);
        if(!href)return false;
        try{
          var parsed=new URL(href);
          return parsed.protocol==="https:"&&parsed.hostname==="ourhindudharm.blogspot.com"&&parsed.pathname==="/p/grahan-panchang.html";
        }catch(e){return false;}
      });
      if(isEclipseEvent&&!hasEclipsePageLink){
        var eclipseLink=makeLink(eclipsePageUrl,"सूतक, मंत्र-जप एवं पुरश्चरण की जानकारी");
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
  }
  async function loadMonth(){
    var token=++requestToken;
    // नई navigation पर पुराने अटके हुए request को रद्द करें।
    if(activeMonthRequest){activeMonthRequest.abort();activeMonthRequest=null;}
    var controller=new AbortController();
    activeMonthRequest=controller;
    var timeoutId=setTimeout(function(){controller.abort();},15000);
    var year=Number(yearSelect.value),month=Number(monthSelect.value);
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
      var computedSaraswatiEvents=await buildSaraswatiNakshatraEvents(data,year,month,token);
      if(token!==requestToken)return;
      data.events=(Array.isArray(data.events)?data.events:[]).concat(computedSaraswatiEvents);
      render(data,year,month,token);
    }catch(e){
      if(token!==requestToken)return;
      render({events:[]},year,month,token);
      if(e&&e.name==="AbortError"){
        countEl.textContent="लोड होने में समय लगा। कृपया फिर से महीना चुनें।";
      }
    }finally{
      clearTimeout(timeoutId);
      if(token===requestToken)activeMonthRequest=null;
    }
  }
  function ensureYearOption(year){
    var value=String(year);
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
  function shiftMonth(delta){
    var y=Number(yearSelect.value),m=Number(monthSelect.value)+delta;
    if(!Number.isFinite(y)||!Number.isFinite(m))return;
    if(m<1){m=12;y--;}else if(m>12){m=1;y++;}
    ensureYearOption(y);
    yearSelect.value=String(y);
    monthSelect.value=String(m).padStart(2,"0");
    loadMonth();
  }
  function goToCurrentMonth(){
    var now=new Date();
    var year=now.getFullYear();
    ensureYearOption(year);
    yearSelect.value=String(year);
    monthSelect.value=String(now.getMonth()+1).padStart(2,"0");
    loadMonth();
  }
  locationSearchBtn.addEventListener("click",searchLocation);
  locationInput.addEventListener("keydown",function(event){
    if(event.key==="Enter"){event.preventDefault();searchLocation();}
  });
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
  var initialDate=new Date();
  ensureYearOption(initialDate.getFullYear());
  yearSelect.value=String(initialDate.getFullYear());
  monthSelect.value=String(initialDate.getMonth()+1).padStart(2,"0");
  loadMonth();
})();

