// OurHinduDharm compact upcoming-festivals widget.
// Blogger snippet: <div id="ohd-festival-widget"></div>
// Load this file as a module. Festival text/links come from approved monthly JSON data.
(function () {
  const mount = document.getElementById("ohd-festival-widget");
  if (!mount) return;

  const DAYS_AHEAD = 20;
  const MONTH_NAMES = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
  const WEEKDAYS = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];
  const baseUrl = new URL("./data/festivals/", import.meta.url);
  const monthlyPageUrl = "https://ourhindudharm.blogspot.com/p/masik-vrat-parv.html?m=1";

  function localMidnight(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function monthKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
  }

  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
    const date = new Date(value + "T12:00:00");
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function isPublishable(item) {
    return item && item.reviewStatus === "approved";
  }

  function safeHttpUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, document.baseURI);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Render approved descriptions while retaining their article links; discard unsafe tags/attributes.
  function appendSafeDescription(container, html) {
    if (!html) return;
    const source = document.createElement("template");
    source.innerHTML = String(html);

    function copyNode(node, parent) {
      if (node.nodeType === Node.TEXT_NODE) {
        parent.appendChild(document.createTextNode(node.nodeValue || ""));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      const allowed = ["a", "br", "b", "strong", "em", "i", "span"];
      if (!allowed.includes(tag)) {
        Array.from(node.childNodes).forEach(child => copyNode(child, parent));
        return;
      }
      if (tag === "br") {
        parent.appendChild(document.createElement("br"));
        return;
      }
      if (tag === "a") {
        const href = safeHttpUrl(node.getAttribute("href"));
        if (!href) {
          Array.from(node.childNodes).forEach(child => copyNode(child, parent));
          return;
        }
        const link = document.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        Array.from(node.childNodes).forEach(child => copyNode(child, link));
        parent.appendChild(link);
        return;
      }
      const safe = document.createElement(tag);
      Array.from(node.childNodes).forEach(child => copyNode(child, safe));
      parent.appendChild(safe);
    }

    Array.from(source.content.childNodes).forEach(node => copyNode(node, container));
  }

  function daysBetween(from, to) {
    return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86400000);
  }

  function makeChaturmasCard(events, todayKey) {
    const start = events.find(item => isPublishable(item) &&
      /देवशयनी|हरिशयनी|चातुर्मास प्रारम्भ/i.test(item.title || "") && item.date);
    const end = events.find(item => isPublishable(item) &&
      /देवउठनी|देवप्रबोधिनी|प्रबोधिनी/i.test(item.title || "") && item.date);
    if (!start || !end || end.date < todayKey) return null;

    const startDate = parseDate(start.date);
    const endDate = parseDate(end.date);
    if (!startDate || !endDate || end.date < start.date) return null;

    const card = element("section", "ohd-fw-chaturmas");
    card.appendChild(element("div", "ohd-fw-chaturmas-title", "🪔 चातुर्मास"));
    const range = MONTH_NAMES[startDate.getMonth()] + " " + startDate.getDate() +
      " से " + MONTH_NAMES[endDate.getMonth()] + " " + endDate.getDate() + ", " + endDate.getFullYear();
    card.appendChild(element("div", "ohd-fw-chaturmas-range", range));

    let status;
    if (todayKey < start.date) {
      const remaining = daysBetween(todayKey, start.date);
      status = remaining === 0 ? "आज से प्रारंभ" : remaining === 1 ? "कल से प्रारंभ" : "प्रारंभ होने में " + remaining + " दिन शेष";
    } else {
      const remaining = daysBetween(todayKey, end.date);
      status = remaining === 0 ? "आज चातुर्मास समापन" : "चातुर्मास चल रहा है · समापन में " + remaining + " दिन शेष";
    }
    card.appendChild(element("div", "ohd-fw-chaturmas-status", status));
    const linkUrl = safeHttpUrl(start.articleUrl) || safeHttpUrl(end.articleUrl);
    if (linkUrl) {
      const link = element("a", "ohd-fw-link", start.articleLabel || "चातुर्मास के बारे में पढ़ें →");
      link.href = linkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.appendChild(link);
    }
    return card;
  }

  function render(items, today, endExclusive, chaturmasEvents) {
    mount.replaceChildren();
    mount.classList.add("ohd-festival-widget");

    const style = document.createElement("style");
    style.textContent = `
      /* Blogger/AdSense: keep the whole post container from shrinking beside a floated ad. */
      .post-body-container:has(#ohd-festival-widget){
        display:flow-root!important;
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        clear:both!important;
        box-sizing:border-box!important;
      }
      .post-body-container:has(#ohd-festival-widget) #ohd-festival-widget,
      #ohd-festival-widget{
        display:block!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        clear:both!important;
        flex:0 0 100%!important;
        float:none!important;
        box-sizing:border-box!important;
      }
      #ohd-festival-widget *{box-sizing:border-box}
      #ohd-festival-widget .ohd-fw-head{padding:12px 14px;border-radius:12px 12px 0 0;background:linear-gradient(130deg,#fff1d9,#fffaf1);border:1px solid #eadcc8}
      #ohd-festival-widget .ohd-fw-title{margin:0;font-size:1.1em;line-height:1.4}
      #ohd-festival-widget .ohd-fw-sub{margin-top:3px;font-size:.8em;color:#87562b}
      #ohd-festival-widget .ohd-fw-list{padding:7px 10px;border:1px solid #eadcc8;border-top:0;border-radius:0 0 12px 12px;background:#fff}
      #ohd-festival-widget .ohd-fw-item{display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-bottom:1px solid #f0e7dc;min-width:0}
      /* Keep injected Auto Ads on a separate full-width grid row; preserve date/content columns. */
      #ohd-festival-widget .ohd-fw-item:has(> .google-auto-placed){
        display:grid!important;
        grid-template-columns:49px minmax(0,1fr)!important;
        column-gap:7px!important;
        align-items:start!important;
      }
      #ohd-festival-widget .ohd-fw-item > .google-auto-placed{
        grid-column:1 / -1!important;
        grid-row:1!important;
        min-width:0!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      #ohd-festival-widget .ohd-fw-item:has(> .google-auto-placed) > .ohd-fw-date{
        grid-column:1!important;
        min-width:0!important;
      }
      #ohd-festival-widget .ohd-fw-item:has(> .google-auto-placed) > .ohd-fw-content{
        grid-column:2!important;
        min-width:0!important;
        width:auto!important;
        overflow-wrap:break-word!important;
      }
      #ohd-festival-widget .ohd-fw-item:last-child{border-bottom:0}
      #ohd-festival-widget .ohd-fw-date{flex:0 0 55px;min-width:0;text-align:center;padding:5px 2px;background:#fff2df;border:1px solid #f0d7b2;border-radius:8px;color:#904b11;font-size:.75em;line-height:1.35}
      #ohd-festival-widget .ohd-fw-day{display:block;font-weight:800;font-size:1.35em}
      #ohd-festival-widget .ohd-fw-weekday{display:block;margin-top:3px;font-size:.85em;font-weight:700}
      #ohd-festival-widget .ohd-fw-content{flex:1 1 0;min-width:0;overflow-wrap:anywhere}
      #ohd-festival-widget .ohd-fw-name{font-weight:700;font-size:.92em;line-height:1.45;overflow-wrap:anywhere}
      #ohd-festival-widget .ohd-fw-status{display:inline-block;margin:3px 0 2px;padding:2px 7px;border-radius:20px;background:#fff0d5;color:#8b4a0c;font-size:.73em;font-weight:700;line-height:1.4}
      #ohd-festival-widget .ohd-fw-description{margin-top:3px;font-size:.84em;line-height:1.55;overflow-wrap:anywhere}
      #ohd-festival-widget .ohd-fw-description a,#ohd-festival-widget .ohd-fw-link{color:#8c4810;text-decoration:none;font-weight:600}
      #ohd-festival-widget .ohd-fw-description a:hover,#ohd-festival-widget .ohd-fw-link:hover{text-decoration:underline}
      #ohd-festival-widget .ohd-fw-link{display:inline-block;margin-top:4px;font-size:.8em}
      #ohd-festival-widget .ohd-fw-empty{padding:12px 4px;font-size:.88em;color:#74685a}
      #ohd-festival-widget .ohd-fw-more{display:block;margin:12px 0 2px;padding:10px 8px;text-align:center;font-size:.88em;font-weight:800;color:#8c4810;background:#fff7e9;border:1px solid #f0dfc6;border-radius:9px;text-decoration:none}
      #ohd-festival-widget .ohd-fw-chaturmas{margin:9px 0;padding:10px 12px;border:1px solid #e8c78e;border-left:4px solid #d97706;border-radius:9px;background:#fff8e9}
      #ohd-festival-widget .ohd-fw-chaturmas-title{font-weight:800;line-height:1.4}
      #ohd-festival-widget .ohd-fw-chaturmas-range{margin-top:3px;font-size:.82em}
      #ohd-festival-widget .ohd-fw-chaturmas-status{margin-top:4px;color:#8c4810;font-size:.82em;font-weight:700}
      @media(max-width:380px){#ohd-festival-widget .ohd-fw-list{padding:6px 8px}#ohd-festival-widget .ohd-fw-item{gap:7px}#ohd-festival-widget .ohd-fw-date{flex-basis:49px}#ohd-festival-widget .ohd-fw-description{font-size:.82em}}
    `;
    mount.appendChild(style);

    const head = element("div", "ohd-fw-head");
    head.appendChild(element("h3", "ohd-fw-title", "🪔 आगामी व्रत-पर्व-त्यौहार"));
    head.appendChild(element("div", "ohd-fw-sub", "सूची ऑटो अपडेट होगी"));
    mount.appendChild(head);

    const list = element("div", "ohd-fw-list");
    const todayKey = dateKey(today);
    const endKey = dateKey(endExclusive);
    const visible = items.filter(function (item) {
      if (!isPublishable(item) || !item.date || !parseDate(item.date)) return false;
      const futureWithinWindow = item.date >= todayKey && item.date < endKey;
      const activeRange = item.endDate && item.date <= todayKey && item.endDate >= todayKey;
      return futureWithinWindow || activeRange;
    }).sort(function (a, b) {
      const aActive = a.date < todayKey && a.endDate && a.endDate >= todayKey;
      const bActive = b.date < todayKey && b.endDate && b.endDate >= todayKey;
      if (aActive && !bActive) return -1;
      if (bActive && !aActive) return 1;
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      // On the same Gregorian date, follow the declared Hindu tithi sequence.
      const tithiOrder = ["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या","पूर्णिमा","पूर्णमासी"];
      function rank(item) {
        const tithi = String(item.hinduTithi || "");
        const paksha = /कृष्ण/.test(tithi) ? 0 : /शुक्ल/.test(tithi) ? 1 : 2;
        const index = tithiOrder.findIndex(function (name) { return tithi.includes(name); });
        return index < 0 ? 999 : paksha * 20 + index;
      }
      const rankDiff = rank(a) - rank(b);
      return rankDiff || String(a.title || "").localeCompare(String(b.title || ""), "hi");
    });

    const chaturmas = makeChaturmasCard(chaturmasEvents, todayKey);
    if (chaturmas) list.appendChild(chaturmas);

    if (!visible.length) {
      list.appendChild(element("div", "ohd-fw-empty", "अगले २० दिनों के लिए कोई स्वीकृत व्रत-पर्व उपलब्ध नहीं है।"));
    } else {
      visible.forEach(function (item) {
        const d = parseDate(item.date);
        const card = element("div", "ohd-fw-item");
        const dateBox = element("div", "ohd-fw-date");
        dateBox.appendChild(element("span", "ohd-fw-day", String(d.getDate())));
        dateBox.appendChild(element("span", "", MONTH_NAMES[d.getMonth()]));
        dateBox.appendChild(element("span", "ohd-fw-weekday", WEEKDAYS[d.getDay()]));
        card.appendChild(dateBox);

        const content = element("div", "ohd-fw-content");
        content.appendChild(element("div", "ohd-fw-name", item.title || "व्रत-पर्व"));

        const activeRange = item.endDate && item.date <= todayKey && item.endDate >= todayKey;
        let status;
        if (activeRange) {
          status = item.statusText || "पर्व चल रहा है";
        } else {
          const remaining = daysBetween(todayKey, item.date);
          status = remaining === 0 ? "आज" : remaining === 1 ? "कल" : remaining + " दिन शेष";
        }
        content.appendChild(element("span", "ohd-fw-status", status));

        if (item.endDate && item.endDate >= todayKey && item.endDate > item.date) {
          const endDate = parseDate(item.endDate);
          content.appendChild(element("div", "ohd-fw-period", "पर्व-अवधि: " + d.getDate() + " " + MONTH_NAMES[d.getMonth()] + " – " + endDate.getDate() + " " + MONTH_NAMES[endDate.getMonth()]));
        }

        if (item.description) {
          const description = element("div", "ohd-fw-description");
          appendSafeDescription(description, item.description);
          content.appendChild(description);
        }

        // Sankranti records use a shared date-based rule in the monthly page;
        // older JSON entries do not need a per-record muhurtaRule field.
        const ruleIds = Array.isArray(item.muhurtaRules) ? item.muhurtaRules : (item.muhurtaRule ? [item.muhurtaRule] : []);
        const isSankranti = /संक्रांति|संक्रान्ति|sankranti/i.test(String(item.title || "")) ||
          String(item.category || "") === "संक्रांति";
        const hasMuhurta = ruleIds.length > 0 || isSankranti ||
          (item.muhurtaStart && item.muhurtaEnd) ||
          (item.muhurtaTime && String(item.muhurtaTime).trim());
        if (hasMuhurta) {
          // Deep-link to the exact month and festival card; no extra requests or calculations here.
          const detailUrl = new URL(monthlyPageUrl);
          detailUrl.searchParams.set("year", String(d.getFullYear()));
          detailUrl.searchParams.set("month", String(d.getMonth() + 1));
          detailUrl.searchParams.set("focus", item.date);
          if (item.title) detailUrl.searchParams.set("focusTitle", item.title);
          const detailLink = element("a", "ohd-fw-link", "मुहूर्त देखें →");
          detailLink.href = detailUrl.href;
          content.appendChild(detailLink);
        }

        const articleUrl = safeHttpUrl(item.articleUrl);
        if (articleUrl) {
          const link = element("a", "ohd-fw-link", item.articleLabel || "विस्तार से पढ़ें →");
          link.href = articleUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          content.appendChild(link);
        }
        card.appendChild(content);
        list.appendChild(card);
      });
    }

    const more = element("a", "ohd-fw-more", "इस माह के सभी व्रत-पर्व देखें →");
    more.href = monthlyPageUrl;
    more.rel = "noopener noreferrer";
    list.appendChild(more);
    mount.appendChild(list);
  }

  async function fetchMonth(monthDate) {
    const url = new URL(monthKey(monthDate) + ".json", baseUrl);
    try {
      const response = await fetch(url.href);
      if (!response.ok) return { events: [] };
      const data = await response.json();
      return data && Array.isArray(data.events) ? data : { events: [] };
    } catch (_) {
      return { events: [] };
    }
  }

  async function load() {
    const today = localMidnight(new Date());
    const todayKey = dateKey(today);
    const endExclusive = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DAYS_AHEAD);
    const lastVisible = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DAYS_AHEAD - 1);

    // Include the prior month so an ongoing multi-day observance is not hidden when its start date has passed.
    const monthDates = new Map();
    const addMonth = date => monthDates.set(monthKey(date), new Date(date.getFullYear(), date.getMonth(), 1));
    addMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    addMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    addMonth(new Date(lastVisible.getFullYear(), lastVisible.getMonth(), 1));

    // Read the current year's Chaturmas dates from shared month JSON, not hardcoded dates.
    const currentChaturmasYear = today.getFullYear();
    for (let month = 5; month <= 10; month++) addMonth(new Date(currentChaturmasYear, month, 1));

    mount.textContent = "आगामी पर्व लोड हो रहे हैं…";
    try {
      let responses = await Promise.all(Array.from(monthDates.values()).map(fetchMonth));
      let allEvents = responses.flatMap(data => data.events || []);
      let deduped = new Map();
      allEvents.forEach(item => {
        const key = [item.date || "", item.title || ""].join("|");
        if (!deduped.has(key)) deduped.set(key, item);
      });
      let items = Array.from(deduped.values());

      // Keep this year's card through its actual end date; only then look ahead to next year.
      const currentEnd = items.find(item => {
        const d = parseDate(item.date);
        return d && d.getFullYear() === currentChaturmasYear &&
          /देवउठनी|देवप्रबोधिनी|प्रबोधिनी/i.test(item.title || "");
      });
      let chaturmasYear = currentChaturmasYear;
      if (!currentEnd || currentEnd.date < todayKey) {
        chaturmasYear = currentChaturmasYear + 1;
        const nextYearMonths = [];
        for (let month = 5; month <= 10; month++) {
          nextYearMonths.push(fetchMonth(new Date(chaturmasYear, month, 1)));
        }
        const nextYearData = await Promise.all(nextYearMonths);
        allEvents = allEvents.concat(nextYearData.flatMap(data => data.events || []));
        deduped = new Map();
        allEvents.forEach(item => {
          const key = [item.date || "", item.title || ""].join("|");
          if (!deduped.has(key)) deduped.set(key, item);
        });
        items = Array.from(deduped.values());
      }

      const chaturmasEvents = items.filter(item => {
        const d = parseDate(item.date);
        return d && d.getFullYear() === chaturmasYear;
      });
      render(items, today, endExclusive, chaturmasEvents);
    } catch (_) {
      mount.textContent = "अभी आगामी पर्व लोड नहीं हो पाए।";
    }
  }

  load();
})();
