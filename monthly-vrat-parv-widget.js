
(function(){
  "use strict";
  // सार्वजनिक दृश्य में केवल स्वीकृत प्रविष्टियाँ; ?review=1 से समीक्षा संकेत दिखते हैं।
  // Blogger page editor may drop or ignore a stylesheet link in the page body.
  // Ensure the shared stylesheet is attached even when the HTML link is stripped.
  var cssHref="https://cdn.jsdelivr.net/gh/OurHinduDharm/Panchang@5a5ff9855a1fcc182d79c1684036881b920e2b99/monthly-vrat-parv-widget.css";
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
  var panchangCache=new Map();
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
      var panchangLib=(ready&&typeof ready.getPanchangam==="function"&&typeof ready.Observer==="function")
        ? ready
        : await import("https://esm.sh/@ishubhamx/panchangam-js@3.0.0");
      if(typeof panchangLib.Observer!=="function"||typeof panchangLib.getPanchangam!=="function"){
        throw new Error("Panchang library API unavailable");
      }
      var observer=new panchangLib.Observer(location.lat,location.lon,location.elevation);
      var date=new Date(dateIso+"T12:00:00+05:30");
      var nextDate=new Date(date.getTime()+24*60*60*1000);
      var p=panchangLib.getPanchangam(date,observer,{timezoneOffset:330});
      var next=panchangLib.getPanchangam(nextDate,observer,{timezoneOffset:330});
      return {p:p,next:next,location:location,date:date,panchangLib:panchangLib,observer:observer};
    });
    panchangCache.set(cacheKey,promise);
    return promise;
  }
  function getLagnaIndex(p){
    var value=p&&p.udayaLagna;
    if(value&&typeof value==="object"){
      var raw=value.index??value.number??value.value??value.name??value.label;
      if(raw!==undefined)value=raw;
    }
    if(typeof value==="number"&&Number.isFinite(value))return value;
    var name=String(value??"").normalize("NFC").toLocaleLowerCase("hi");
    if(/vrishabha|वृषभ|taurus/.test(name))return 1;
    if(/simha|सिंह|leo/.test(name))return 4;
    var numeric=Number(value);
    return Number.isInteger(numeric)?numeric:null;
  }
  function getStiraLagnaWindows(lib,observer,startValue,endValue){
    var start=new Date(startValue),end=new Date(endValue);
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start||
       !lib||typeof lib.getPanchangam!=="function")return [];
    function signAt(ms){
      try{return getLagnaIndex(lib.getPanchangam(new Date(ms),observer,{timezoneOffset:330}));}
      catch(_){return null;}
    }
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
        if(sign===1||sign===4){segmentStart=points[i];segmentSign=sign;}
        continue;
      }
      var prev=signs[i-1],prevTime=points[i-1],time=points[i];
      if(prev===sign)continue;
      if((prev===1||prev===4)&&segmentStart!==null){
        var segEnd=boundary(prevTime,time,prev);
        segments.push({name:prev===1?"Vrishabha":"Simha",start:new Date(segmentStart),end:new Date(segEnd)});
        segmentStart=null;segmentSign=null;
      }
      if(sign===1||sign===4){
        segmentStart=boundary(prevTime,time,sign);
        segmentSign=sign;
      }
    }
    if(segmentStart!==null&&(segmentSign===1||segmentSign===4)){
      segments.push({name:segmentSign===1?"Vrishabha":"Simha",start:new Date(segmentStart),end:end});
    }
    return segments;
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
      if(usableRules.some(function(ruleItem){return ruleItem.muhurtaRule==="diwali-lakshmi-puja"||ruleItem.muhurtaRule==="dhanteras-muhurta";})){
        var sunset=new Date(values.p.sunset);
        var nextSunrise=new Date(values.next.sunrise);
        var nightDuration=nextSunrise.getTime()-sunset.getTime();
        var pradoshEnd=new Date(sunset.getTime()+nightDuration/5);
        context.sthirLagnaWindows=[
          ...getStiraLagnaWindows(values.panchangLib,values.observer,sunset,pradoshEnd)
        ];
        if(usableRules.some(function(ruleItem){return ruleItem.muhurtaRule==="diwali-lakshmi-puja";})){
          var nishitaStart=new Date(sunset.getTime()+nightDuration*7/15);
          var nishitaEnd=new Date(sunset.getTime()+nightDuration*8/15);
          context.sthirLagnaWindows.push(...getStiraLagnaWindows(values.panchangLib,values.observer,nishitaStart,nishitaEnd));
        }
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
            var name=document.createElement("strong");name.textContent=windowItem.label||"पूजन समय";row.appendChild(name);
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
          detail.textContent=result.message||"मुहूर्त उपलब्ध नहीं है।";
        }
        box.appendChild(detail);
        if(result.note){var note=document.createElement("div");note.style.marginTop="3px";note.textContent=result.note;box.appendChild(note);}
        var loc=document.createElement("div");loc.style.marginTop="3px";loc.style.fontSize="11px";loc.textContent="स्थान: "+values.location.name;box.appendChild(loc);
        content.appendChild(box);
      });
    }catch(error){console.warn("Festival muhurta unavailable:",item.muhurtaRule||item.muhurtaRules,error);}
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
    if(reviewMode&&data&&data.status&&data.status!=="approved"){
      var dataNotice=document.createElement("div");dataNotice.className="note";dataNotice.style.marginTop="0";
      dataNotice.textContent="डेटा स्थिति: "+String(data.status)+"। "+String(data.locationScope||"इस महीने की प्रविष्टियों की प्रकाशन-पूर्व समीक्षा आवश्यक है।")+" सार्वजनिक सूची में केवल स्वीकृत प्रविष्टियाँ दिखाई जाती हैं।";
      eventsEl.appendChild(dataNotice);
    }
    listTitle.textContent=months[month-1]+" "+year+" के व्रत-पर्व";
    var pageTitle=document.getElementById("pageTitle");
    if(pageTitle) pageTitle.textContent=months[month-1]+" "+year+" — व्रत एवं त्योहार";
    var list=(data&&Array.isArray(data.events))?data.events.slice():[];
    if(!reviewMode){
      list=list.filter(function(item){return item.reviewStatus==="approved"||item.reviewStatus==="user-confirmed-hard-copy";});
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
        renderDescription(desc,description);content.appendChild(desc);
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
    // Footer navigation should return the reader to the newly selected month's heading.
    var monthHeading=listTitle&&listTitle.closest(".summary")||listTitle;
    if(monthHeading){
      window.requestAnimationFrame(function(){
        var top=monthHeading.getBoundingClientRect().top+window.pageYOffset-12;
        window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
      });
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
      prev.addEventListener("click",function(event){event.preventDefault();shiftMonth(-1);});
      var next=document.createElement("button");
      next.type="button";next.textContent="अगला महीना →";
      next.addEventListener("click",function(event){event.preventDefault();shiftMonth(1);});
      nav.appendChild(prev);nav.appendChild(next);
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
    yearSelect.value=String(year);
    monthSelect.value=String(now.getMonth()+1).padStart(2,"0");
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
  ensureYearOption(initialDate.getFullYear());
  yearSelect.value=String(initialDate.getFullYear());
  monthSelect.value=String(initialDate.getMonth()+1).padStart(2,"0");
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
        loadMonth();
      }
    }catch(error){
      console.warn("Default location elevation unavailable; using configured elevation.",error);
    }
  })();
})();