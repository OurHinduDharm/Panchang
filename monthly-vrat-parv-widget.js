
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
  // सीमित cache: महीने बदलते समय मोबाइल में अनावश्यक Panchang objects जमा न हों।
  var panchangCache=new Map();
  var observerCache=new Map();
  var MAX_PANCHANG_CACHE_ENTRIES=90;
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
          observerCache.clear();
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
      return {p:p,next:next,location:location,date:date,at:function(instant){return panchangLib.getPanchangam(instant,observer,{timezoneOffset:330,calendarType:"purnimanta"});}};
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
  async function appendMuhurta(item,dateIso,content,token){
    var ruleIds=Array.isArray(item.muhurtaRules)?item.muhurtaRules:(item.muhurtaRule?[item.muhurtaRule]:[]);
    // महाष्टमी प्रविष्टि पर संधिपूजा का मुहूर्त स्थानीय तिथि-संधि से निकालें।
    if(!ruleIds.length&&/महाष्टमी|महाअष्टमी|दुर्गाष्टमी|दुर्गा अष्टमी|दुर्गा पूजा.*अष्टमी/i.test(String(item.title||""))) ruleIds=["sandhi-puja"];
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
      description:description+" स्थानीय स्थान: "+locationName+"। यह नक्षत्र-आधारित गणना है; परंपरा-विशेष का अंतिम निर्णय स्थानीय धर्मशास्त्रीय नियम से करें।",
      category:"नवरात्रि",calculationStatus:"nakshatra-derived",reviewStatus:"needs-review",showReviewStatus:true,
      saraswatiRitual:ritual,saraswatiNakshatra:nakshatra});
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
    if(!startEvent||!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(startEvent.date||""))) return [];
    var start=new Date(startEvent.date+"T12:00:00");
    var endIso=/^\\d{4}-\\d{2}-\\d{2}$/.test(String(startEvent.endDate||""))?startEvent.endDate:"";
    var end=endIso?new Date(endIso+"T12:00:00"):new Date(start.getTime()+9*86400000);
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<start) return [];
    var found=[],avahanScheduled=false,avahanFallbackScheduled=false;
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
      var locationName=(values.location&&values.location.name)||"चुना हुआ स्थान";
      // मूल में स्थापना/आवाहन: धर्मसिंधु-पाठ के अनुसार सूर्यास्त से तीन मुहूर्त (144 मिनट) पहले।
      var avahanTime=new Date(sunset.getTime()-144*60000),avahanPanchang;
      try{avahanPanchang=values.at(avahanTime);}catch(_){avahanPanchang=p;}
      if(!avahanScheduled&&panchangNakshatraAt(avahanPanchang)==="मूल"){
        var avahanClock=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:true}).format(avahanTime);
        addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का आवाहन / स्थापना","मूल नक्षत्र में देवी का आवाहन/स्थापन। धर्मसिंधु-पाठ के अनुसार संदर्भ-समय सूर्यास्त से तीन मुहूर्त पूर्व है।","avahana","मूल",locationName);
        found[found.length-1].muhurtaInstant=avahanTime.toISOString();
        found[found.length-1].muhurtaLabel="आवाहन का संदर्भ-समय";
        avahanScheduled=true;
      }else if(!avahanScheduled&&!avahanFallbackScheduled&&findMulaInterval(p,iso)){
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
                addSaraswatiEvent(found,nextIso,"दुर्गा के सरस्वती-रूप का आवाहन / स्थापना","नियत समय पर मूल नक्षत्र उपलब्ध न होने के कारण अगले दिन मूल के द्वितीय पाद का विकल्प: "+clockRange(padaStart,padaEnd)+"।","avahana-fallback","मूल का द्वितीय पाद",locationName);
                avahanFallbackScheduled=true;
              }
            }
          }catch(_){/* मूल-द्वितीय-पाद का समय न निकले तो अनुमान न दिखाएँ */}
        }
      }
      // पूर्वाषाढ़ा और उत्तराषाढ़ा: कर्म-दिवस की मध्याह्न-व्याप्ति जाँचें।
      var noonNakshatra=panchangNakshatraAt(p);
      var dayStart=sunrise,dayEnd=sunset,dayLength=sunset.getTime()-sunrise.getTime();
      // मुख्य पूजा और बलिदान के लिए दिनमान के मध्याह्न-खंड में नक्षत्र की वास्तविक व्याप्ति निकालें।
      var middayStart=new Date(sunrise.getTime()+dayLength*0.4),middayEnd=new Date(sunrise.getTime()+dayLength*0.6);
      var purvaWindow=findNakshatraInterval(p,"पूर्वाषाढ़ा",middayStart,middayEnd);
      if(purvaWindow){
        addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का मुख्य पूजन","पूर्वाषाढ़ा नक्षत्र और स्थानीय दिनमान के मध्याह्न-खंड का संयोग।","puja","पूर्वाषाढ़ा",locationName);
        setSaraswatiMuhurta(found[found.length-1],purvaWindow.start,purvaWindow.end,"पूजन का नक्षत्र-व्याप्ति काल");
      }
      var uttaraWindow=findNakshatraInterval(p,"उत्तराषाढ़ा",middayStart,middayEnd);
      if(uttaraWindow){
        addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का बलिदान / उत्तरपूजा","उत्तराषाढ़ा नक्षत्र और स्थानीय दिनमान के मध्याह्न-खंड का संयोग। बलि का स्वरूप अपनी अहिंसक या कुल-परंपरा के अनुसार निर्धारित करें।","balidan","उत्तराषाढ़ा",locationName);
        setSaraswatiMuhurta(found[found.length-1],uttaraWindow.start,uttaraWindow.end,"बलिदान/उत्तरपूजा का नक्षत्र-व्याप्ति काल");
      }
      // विसर्जन: दिनमान के 3/5 से 4/5 तक अपराह्न-खंड में श्रवण + दशमी का संयोग।
      var aparahnaStart=new Date(sunrise.getTime()+dayLength*0.6),aparahnaEnd=new Date(sunrise.getTime()+dayLength*0.8);
      var aparahnaTime=new Date(sunrise.getTime()+dayLength*0.7),aparahnaPanchang;
      try{aparahnaPanchang=values.at(aparahnaTime);}catch(_){aparahnaPanchang=p;}
      var shravanaWindow=findNakshatraInterval(p,"श्रवण",aparahnaStart,aparahnaEnd);
      if(shravanaWindow&&panchangTithiAt(aparahnaPanchang)==="दशमी"){
        addSaraswatiEvent(found,iso,"दुर्गा के सरस्वती-रूप का विसर्जन / उद्वासन","श्रवण नक्षत्र और दशमी की अपराह्न-व्याप्ति मिलने पर विसर्जन/उद्वासन।","visarjana","श्रवण",locationName);
        setSaraswatiMuhurta(found[found.length-1],shravanaWindow.start,shravanaWindow.end,"विसर्जन का नक्षत्र-व्याप्ति काल");
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
    var found=[],recognized=false;
    var days=new Date(year,month,0).getDate();
    for(var day=1;day<=days;day++){
      if(token!==requestToken)return {events:[],recognized:false};
      var iso=String(year)+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0");
      var values;
      try{values=await getDatePanchang(iso);}catch(_){continue;}
      if(token!==requestToken)return {events:[],recognized:false};
      var p=values.p||{},sunrise=new Date(p.sunrise);
      if(!Number.isFinite(sunrise.getTime()))continue;
      // getPanchangam के scalar masa/tithi/paksha sunrise-based हैं;
      // उसी क्षण पर तीसरी बार पूरा पंचांग निकालने की जरूरत नहीं।
      var masa=normalizedMasaName(p.masa);
      var family=navratriFamily(masa);
      if(!family)continue;
      var rawTithi=p.tithi;
      var rawTithiValue=rawTithi&&typeof rawTithi==="object"?(rawTithi.index??rawTithi.number??rawTithi.value??rawTithi.name):rawTithi;
      var readableTithi=(typeof rawTithiValue==="number"&&Number.isFinite(rawTithiValue)&&rawTithiValue>=0&&rawTithiValue<=29)||
        /प्रतिपदा|द्वितीया|तृतीया|चतुर्थी|पंचमी|षष्ठी|सप्तमी|अष्टमी|नवमी|दशमी|pratipada|dvitiya|tritiya|chaturthi|panchami|shashthi|saptami|ashtami|navami|dashami/i.test(String(rawTithiValue||""));
      if(!readableTithi)continue;
      recognized=true;
      var tithiIndex=shuklaTithiIndex(p);
      if(tithiIndex===null)continue;
      var item=makeDynamicNavratriEvent(iso,family,tithiIndex,(values.location&&values.location.name)||"चुना हुआ स्थान");
      if(item)found.push(item);
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
      list=list.filter(function(item){return item.reviewStatus==="approved"||item.reviewStatus==="user-confirmed-hard-copy"||item.calculationStatus==="nakshatra-derived"||item.calculationStatus==="tithi-derived";});
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
      if(item.calculationStatus==="nakshatra-derived"&&(item.muhurtaInstant||(item.muhurtaStart&&item.muhurtaEnd))){
        var ritualTimeBox=document.createElement("div");ritualTimeBox.className="desc";ritualTimeBox.style.cssText="margin-top:7px;padding:8px 9px;border-radius:8px;background:#fff8e9";
        var ritualTimeTitle=document.createElement("strong");ritualTimeTitle.textContent=item.muhurtaLabel||"नक्षत्र-आधारित मुहूर्त";ritualTimeBox.appendChild(ritualTimeTitle);
        var ritualTimeDetail=document.createElement("div");
        var timeFormatter=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:true});
        if(item.muhurtaInstant){
          ritualTimeDetail.textContent=timeFormatter.format(new Date(item.muhurtaInstant))+" IST";
        }else{
          var ritualStart=new Date(item.muhurtaStart),ritualEnd=new Date(item.muhurtaEnd);
          ritualTimeDetail.textContent=timeFormatter.format(ritualStart)+" – "+timeFormatter.format(ritualEnd)+" IST";
        }
        ritualTimeBox.appendChild(ritualTimeDetail);
        var ritualLocation=document.createElement("div");ritualLocation.style.cssText="margin-top:3px;font-size:11px";
        var locationMatch=String(item.description||"").match(/स्थानीय स्थान: (.*?)।/);
        ritualLocation.textContent=locationMatch?"स्थान: "+locationMatch[1]:"चुने हुए स्थान के अनुसार";
        ritualTimeBox.appendChild(ritualLocation);content.appendChild(ritualTimeBox);
      }
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
      // पहले उपलब्ध मासिक सूची दिखाएँ; नवरात्रि की गतिशील गणना के दौरान
      // उपयोगकर्ता को खाली loading screen पर प्रतीक्षा न करनी पड़े।
      if(Array.isArray(data.events)&&data.events.length) render(data,year,month,token);
      var dynamicNavratri=await buildDynamicNavratriEvents(year,month,token);
      if(token!==requestToken)return;
      var storedEvents=Array.isArray(data.events)?data.events:[];
      // जब मास/तिथि से नवरात्रि सफलतापूर्वक पहचानी जाए, पुराने वर्ष-विशेष
      // दिनांक/मुहूर्त वाले दैनिक नवरात्र शीर्षकों को गतिशील प्रविष्टियों से बदलें।
      if(dynamicNavratri.recognized) storedEvents=storedEvents.filter(function(item){return !isLegacyNavratriDailyEvent(item);});
      data.events=storedEvents.concat(dynamicNavratri.events);
      var computedSaraswatiEvents=await buildSaraswatiNakshatraEvents(data,year,month,token);
      if(token!==requestToken)return;
      data.events=data.events.concat(computedSaraswatiEvents);
      render(data,year,month,token);
    }catch(e){
      if(token!==requestToken)return;
      if(e&&e.name==="AbortError"){
        render({events:[]},year,month,token);
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
          if(!fallbackData.events.length) countEl.textContent="इस महीने की स्थिर सूची उपलब्ध नहीं है; नवरात्रि की कोई गतिशील प्रविष्टि नहीं मिली।";
        }catch(fallbackError){
          render({events:[]},year,month,token);
          countEl.textContent="स्थिर डेटा उपलब्ध नहीं है और गतिशील पंचांग-गणना भी पूरी नहीं हो सकी।";
        }
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

