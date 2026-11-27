// Shared by the standalone page and the Blogger widget. Older Blogger snippets
// have no section markup; install it next to the event list at first use.
export function createMonthlySpecialCalendar(getLocalLocation, yearSelect, monthSelect, eventsEl) {
  if (!document.getElementById("special-punya-kaal")) {
    eventsEl.insertAdjacentHTML("afterend", `<div id="special-punya-kaal-sentinel" class="special-punya-kaal-sentinel" aria-hidden="true"></div>
<section id="special-punya-kaal" class="special-calendar" aria-label="विशेष साधना काल एवं पुण्यकाल" hidden>
  <details id="specialPunyaKaalDetails" open>
    <summary>विशेष साधना काल एवं पुण्यकाल</summary>
    <div id="specialPunyaKaalContent" class="special-calendar-content"></div>
  </details>
</section>`);
  }
  // Some Blogger templates remove empty nodes; repair a missing lazy-load sentinel.
  if(!document.getElementById("special-punya-kaal-sentinel")){
    document.getElementById("special-punya-kaal").insertAdjacentHTML("beforebegin", '<div id="special-punya-kaal-sentinel" class="special-punya-kaal-sentinel" aria-hidden="true"></div>');
  }
  var specialPunyaKaalRequest=0;
  var lastRenderKey=null;
  var specialDateTimeFormatter=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit",hourCycle:"h23",numberingSystem:"latn"});
  var specialDateFormatter=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"long",year:"numeric"});
  var specialPunyaKaalApprovalPromise=import("./special-punya-kaal-public-approval.mjs");
  function formatSpecialPunyaKaalDateTime(value){
    var date=new Date(value);
    if(Number.isNaN(date.getTime()))return "";
    var parts=specialDateTimeFormatter.formatToParts(date);
    var values=Object.fromEntries(parts.map(function(part){return [part.type,part.value];}));
    var hour=Number(values.hour);
    var period=hour<4?"रात्रि":hour<12?"प्रातः":hour<16?"अपराह्ण":hour<19?"सायं":"रात्रि";
    if(hour===12)period="मध्याह्न";
    return values.day+" "+values.month+", "+period+" "+(hour%12||12)+":"+values.minute+" बजे";
  }
  // Render approved geocentric Mahapata records immediately.
  function renderApproved(approved,openOnLink){
    var section=document.getElementById("special-punya-kaal");
    var content=document.getElementById("specialPunyaKaalContent");
    var details=document.getElementById("specialPunyaKaalDetails");
    var renderKey=JSON.stringify(approved);
    if(renderKey===lastRenderKey)return;
    lastRenderKey=renderKey;
    content.replaceChildren();
    section.hidden=!approved.length;
    if(!approved.length)return;
    if(approved.some(item=>item.isMahapata)){
      var zone=document.createElement("p");zone.className="special-kaal-zone";
      zone.textContent="महापात का समय — भारतीय मानक समय (IST)";
      content.appendChild(zone);
    }
    approved.forEach(function(item){
      var card=document.createElement("article");card.className="special-kaal-card";
      var title=document.createElement("div");title.className="special-kaal-title";title.textContent=item.labels[0];card.appendChild(title);
      var date=document.createElement("div");date.className="special-kaal-date";
      date.textContent=(item.isMahapata?"स्पर्श की तिथि ":"संयोग की तिथि: ")+specialDateFormatter.format(new Date(item.date+"T12:00:00+05:30"));
      card.appendChild(date);
      var time=document.createElement("div");time.className="special-kaal-time";
      time.textContent=(item.isMahapata?"स्पर्श ":"संयोग आरंभ : ")+formatSpecialPunyaKaalDateTime(item.startTime)
        +(item.isMahapata?" · मोक्ष ":" · संयोग समाप्ति : ")+formatSpecialPunyaKaalDateTime(item.endTime);
      card.appendChild(time);
      if(item.isMahapata){
        if(item.middleTime){
          var middle=document.createElement("div");
          middle.className="special-kaal-middle";
          middle.textContent="मध्यकाल : "+formatSpecialPunyaKaalDateTime(item.middleTime);
          card.appendChild(middle);
        }
        var minutes=Math.round((Date.parse(item.endTime)-Date.parse(item.startTime))/60000);
        if(Number.isFinite(minutes)&&minutes>=0){
          var duration=document.createElement("div");
          duration.className="special-kaal-duration";
          duration.textContent="अवधि : "+Math.floor(minutes/60)+" घंटे "+(minutes%60)+" मिनट";
          card.appendChild(duration);
        }

      }
      content.appendChild(card);
    });

    if(approved.some(item=>item.isMahapata)){
      var guide=document.createElement("aside");guide.className="special-mahapata-guide";
      var heading=document.createElement("h3");heading.textContent="महापात का धार्मिक महत्त्व";guide.appendChild(heading);
      var guidance=document.createElement("p");
      guidance.className="special-kaal-guidance";
      guidance.textContent="महापात काल में विवाहादि मांगलिक कार्य वर्जित माने गए हैं, किन्तु स्नान, दान, जप, तप एवं होम का विशेष महत्त्व है। इस पुण्यकाल में साधक अपनी श्रद्धा एवं रुचि के अनुसार किसी भी देवी-देवता की स्तोत्रात्मक उपासना भी कर सकते हैं।";
      var verse=document.createElement("blockquote");
      verse.className="special-kaal-verse";
      verse.textContent="स्नानदानजपश्राद्धव्रतहोमादिकर्मभिः । प्राप्यते सुमहच्छ्रेयस्तत्कालज्ञानतस्तथा ॥";
      guide.appendChild(verse);
      var reference=document.createElement("div");
      reference.textContent="— सूर्यसिद्धान्त, पाताधिकार ११.१८";
      guide.appendChild(reference);
      var meaning=document.createElement("p");
      meaning.textContent="अर्थ — पातकाल में स्नान, दान, जप, श्राद्ध, व्रत और होम आदि से महान् श्रेय प्राप्त होता है; इस काल के ज्ञान से भी श्रेय प्राप्त होता है।";
      guide.appendChild(meaning);
      guide.appendChild(guidance);
      content.appendChild(guide);
    }
    section.hidden=false;
    if(openOnLink&&window.location.hash==="#special-punya-kaal"){
      details.open=true;
      window.requestAnimationFrame(function(){section.scrollIntoView({block:"start",behavior:"smooth"});});
    }
  }
  function currentRequest(token,year,month){
    return token===specialPunyaKaalRequest&&Number(yearSelect.value)===year&&Number(monthSelect.value)===month;
  }
  async function loadSpecialPunyaKaal(year,month,token){
    try{
      var approval=await specialPunyaKaalApprovalPromise;
      if(!currentRequest(token,year,month))return;
      renderApproved(approval.publicSpecialPunyaKaalMonth(null,year,month),true);
    }catch(error){
      console.warn("Special calendar rendering unavailable",error);
    }
  }
  return function scheduleSpecialPunyaKaal(year,month){
    var token=++specialPunyaKaalRequest;
    lastRenderKey=null;
    document.getElementById("special-punya-kaal").hidden=true;
    document.getElementById("specialPunyaKaalContent").replaceChildren();
    // Varuni-family dates are included in the ordinary monthly catalogue.
    // Never load the local ephemeris from the special calendar.
    loadSpecialPunyaKaal(year,month,token);
  };
}
