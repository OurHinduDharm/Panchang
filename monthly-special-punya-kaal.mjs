// Shared by the standalone page and the Blogger widget. Older Blogger snippets
// have no section markup; install it next to the event list at first use.
export function createMonthlySpecialCalendar(getLocalLocation, yearSelect, monthSelect, eventsEl) {
  if (!document.getElementById("special-punya-kaal")) {
    eventsEl.insertAdjacentHTML("afterend", `<div id="special-punya-kaal-sentinel" class="special-punya-kaal-sentinel" aria-hidden="true"></div>
<section id="special-punya-kaal" class="special-calendar" aria-label="विशेष साधना काल एवं पुण्यकाल" hidden>
  <details id="specialPunyaKaalDetails">
    <summary>विशेष साधना काल एवं पुण्यकाल</summary>
    <div id="specialPunyaKaalContent" class="special-calendar-content"></div>
  </details>
</section>`);
  }
  var specialPunyaKaalRequest=0;
  var specialPunyaKaalEnginePromise=null;
  var specialPunyaKaalMonthCache=new Map();
  var specialPunyaKaalObserver=null;
  var specialPunyaKaalApprovalPromise=import("./special-punya-kaal-public-approval.mjs");
  function formatSpecialPunyaKaalDateTime(value){
    var date=new Date(value);
    if(Number.isNaN(date.getTime()))return "";
    return new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}).format(date);
  }
  function sameObserver(a,b){
    if(!a||!b)return false;
    return Math.abs(Number(a.lat)-Number(b.lat))<0.0001&&Math.abs(Number(a.lon)-Number(b.lon))<0.0001&&Math.abs(Number(a.elevation)-Number(b.elevation))<1;
  }
  function getSpecialPunyaKaalEngine(){
    if(!specialPunyaKaalEnginePromise){
      specialPunyaKaalEnginePromise=Promise.all([
        import("./special-punya-kaal-runtime.mjs"),
        specialPunyaKaalApprovalPromise,
        import("https://esm.sh/@ishubhamx/panchangam-js@3.0.0")
      ]).then(function(modules){
        return {runtime:modules[0],approval:modules[1],panchang:modules[2]};
      }).catch(function(error){
        specialPunyaKaalEnginePromise=null;
        throw error;
      });
    }
    return specialPunyaKaalEnginePromise;
  }
  async function loadSpecialPunyaKaal(year,month){
    var token=++specialPunyaKaalRequest;
    var section=document.getElementById("special-punya-kaal");
    var content=document.getElementById("specialPunyaKaalContent");
    var details=document.getElementById("specialPunyaKaalDetails");
    section.hidden=true;content.replaceChildren();
    try{
      var location=getLocalLocation();
      var cacheKey=[year,month,Number(location.lat).toFixed(5),Number(location.lon).toFixed(5),Number(location.elevation)||0].join(":");
      var calculation=specialPunyaKaalMonthCache.get(cacheKey);
      if(!calculation){
        calculation=getSpecialPunyaKaalEngine().then(function(engine){
          var observer=new engine.panchang.Observer(location.lat,location.lon,location.elevation);
          return engine.runtime.calculateSpecialPunyaKaalMonth({
            year:year,month:month,observer:observer,getPanchangam:engine.panchang.getPanchangam,
            timezoneOffsetMinutes:330,calendarType:"purnimanta"
          });
        }).catch(function(error){
          specialPunyaKaalMonthCache.delete(cacheKey);
          throw error;
        });
        specialPunyaKaalMonthCache.set(cacheKey,calculation);
        if(specialPunyaKaalMonthCache.size>12){
          specialPunyaKaalMonthCache.delete(specialPunyaKaalMonthCache.keys().next().value);
        }
      }
      // Reviewed geocentric Mahapata windows do not depend on the local Varuni scan.
      // A failed local scan must not suppress independently approved windows.
      var data=await calculation.catch(function(error){
        console.warn("Local special calendar calculation unavailable",error);
        return null;
      });
      if(token!==specialPunyaKaalRequest||Number(yearSelect.value)!==year||Number(monthSelect.value)!==month)return;
      if(!sameObserver(location,getLocalLocation()))return;
      var approval=await specialPunyaKaalApprovalPromise;
      if(token!==specialPunyaKaalRequest||Number(yearSelect.value)!==year||Number(monthSelect.value)!==month)return;
      if(!sameObserver(location,getLocalLocation()))return;
      var approved=approval.publicSpecialPunyaKaalMonth(data,year,month);
      if(!approved.length)return;
      approved.forEach(function(item){
        var card=document.createElement("article");card.className="special-kaal-card";
        var title=document.createElement("div");title.className="special-kaal-title";title.textContent=item.labels[0];card.appendChild(title);
        var date=document.createElement("div");date.className="special-kaal-date";
        date.textContent=(item.isMahapata?"स्पर्श की तिथि ":"संयोग की तिथि: ")+new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"long",year:"numeric"}).format(new Date(item.date+"T12:00:00+05:30"));
        card.appendChild(date);
        var time=document.createElement("div");time.className="special-kaal-time";
        time.textContent=(item.isMahapata?"स्पर्श ":"संयोग आरंभ : ")+formatSpecialPunyaKaalDateTime(item.startTime)
          +(item.isMahapata?" · मोक्ष ":" · संयोग समाप्ति : ")+formatSpecialPunyaKaalDateTime(item.endTime);
        card.appendChild(time);
        content.appendChild(card);
      });
      section.hidden=false;
      if(window.location.hash==="#special-punya-kaal"){
        details.open=true;
        window.requestAnimationFrame(function(){section.scrollIntoView({block:"start",behavior:"smooth"});});
      }
    }catch(error){
      console.warn("Special calendar rendering unavailable",error);
      if(token===specialPunyaKaalRequest)section.hidden=true;
    }
  }
  return function scheduleSpecialPunyaKaal(year,month){
    specialPunyaKaalRequest++;
    document.getElementById("special-punya-kaal").hidden=true;
    if(specialPunyaKaalObserver){specialPunyaKaalObserver.disconnect();specialPunyaKaalObserver=null;}
    var sentinel=document.getElementById("special-punya-kaal-sentinel");
    if(!sentinel)return;
    var run=function(){loadSpecialPunyaKaal(year,month);};
    if(window.location.hash==="#special-punya-kaal"){run();return;}
    if("IntersectionObserver" in window){
      var observer=new IntersectionObserver(function(entries){
        if(entries.some(function(entry){return entry.isIntersecting;})){
          observer.disconnect();
          if(observer!==specialPunyaKaalObserver)return;
          specialPunyaKaalObserver=null;run();
        }
      },{rootMargin:"550px 0px"});
      specialPunyaKaalObserver=observer;
      observer.observe(sentinel);
    }else{
      run();
    }
  };
}
