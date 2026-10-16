// OurHinduDharm compact upcoming-festivals widget.
// Load as an ES module after adding <div id="ohd-festival-widget"></div>.
// This reads the same month JSON used by monthly-vrat-parv.html and never runs Panchang calculations.
(function () {
  const mount = document.getElementById("ohd-festival-widget");
  if (!mount) return;

  const DAYS_AHEAD = 15;
  const MONTH_NAMES = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
  const baseUrl = new URL("./data/festivals/", import.meta.url);

  function localMidnight(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function monthKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
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

  function render(items, today, endExclusive) {
    mount.replaceChildren();
    mount.classList.add("ohd-festival-widget");

    const style = document.createElement("style");
    style.textContent = `
      #ohd-festival-widget{font:inherit;color:#392819}
      #ohd-festival-widget .ohd-fw-head{padding:12px 14px;border-radius:12px 12px 0 0;background:linear-gradient(130deg,#fff1d9,#fffaf1);border:1px solid #eadcc8}
      #ohd-festival-widget .ohd-fw-title{margin:0;font-size:1.1em;line-height:1.4}
      #ohd-festival-widget .ohd-fw-sub{margin-top:3px;font-size:.8em;color:#87562b}
      #ohd-festival-widget .ohd-fw-list{padding:7px 10px;border:1px solid #eadcc8;border-top:0;border-radius:0 0 12px 12px;background:#fff}
      #ohd-festival-widget .ohd-fw-item{display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-bottom:1px solid #f0e7dc}
      #ohd-festival-widget .ohd-fw-item:last-child{border-bottom:0}
      #ohd-festival-widget .ohd-fw-date{flex:0 0 55px;text-align:center;padding:5px 2px;background:#fff2df;border:1px solid #f0d7b2;border-radius:8px;color:#904b11;font-size:.75em;line-height:1.35}
      #ohd-festival-widget .ohd-fw-day{display:block;font-weight:800;font-size:1.35em}
      #ohd-festival-widget .ohd-fw-name{font-weight:700;font-size:.92em;line-height:1.45}
      #ohd-festival-widget .ohd-fw-link{display:inline-block;margin-top:3px;font-size:.8em;color:#8c4810;text-decoration:none}
      #ohd-festival-widget .ohd-fw-empty{padding:12px 4px;font-size:.88em;color:#74685a}
      #ohd-festival-widget .ohd-fw-more{display:block;margin:10px 0 2px;text-align:center;font-size:.85em;font-weight:700;color:#8c4810;text-decoration:none}
    `;
    mount.appendChild(style);

    const head = element("div", "ohd-fw-head");
    head.appendChild(element("h3", "ohd-fw-title", "🪔 आगामी व्रत-पर्व"));
    head.appendChild(element("div", "ohd-fw-sub", "अगले 15 दिनों के स्वीकृत पर्व"));
    mount.appendChild(head);

    const list = element("div", "ohd-fw-list");
    const visible = items.filter(function (item) {
      if (!isPublishable(item) || !item.date) return false;
      const d = new Date(item.date + "T12:00:00");
      return !Number.isNaN(d.getTime()) && d >= today && d < endExclusive;
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });

    if (!visible.length) {
      list.appendChild(element("div", "ohd-fw-empty", "अगले 15 दिनों के लिए कोई स्वीकृत पर्व उपलब्ध नहीं है।"));
    } else {
      visible.forEach(function (item) {
        const d = new Date(item.date + "T12:00:00");
        const card = element("div", "ohd-fw-item");
        const dateBox = element("div", "ohd-fw-date");
        dateBox.appendChild(element("span", "ohd-fw-day", String(d.getDate())));
        dateBox.appendChild(element("span", "", MONTH_NAMES[d.getMonth()]));
        card.appendChild(dateBox);

        const content = element("div", "");
        content.appendChild(element("div", "ohd-fw-name", item.title || "व्रत-पर्व"));
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

    const more = element("a", "ohd-fw-more", "मासिक व्रत-पर्व सूची देखें →");
    more.href = new URL("monthly-vrat-parv.html", import.meta.url).href;
    list.appendChild(more);
    mount.appendChild(list);
  }

  async function load() {
    const today = localMidnight(new Date());
    const endExclusive = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DAYS_AHEAD);
    const lastVisible = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DAYS_AHEAD - 1);
    const months = [new Date(today.getFullYear(), today.getMonth(), 1)];
    if (lastVisible.getMonth() !== today.getMonth() || lastVisible.getFullYear() !== today.getFullYear()) {
      months.push(new Date(lastVisible.getFullYear(), lastVisible.getMonth(), 1));
    }

    mount.textContent = "आगामी पर्व लोड हो रहे हैं…";
    try {
      const responses = await Promise.all(months.map(async function (monthDate) {
        const url = new URL(monthKey(monthDate) + ".json", baseUrl);
        const response = await fetch(url.href, { cache: "no-cache" });
        if (!response.ok) return { events: [] };
        return response.json();
      }));
      const items = responses.flatMap(function (data) {
        return Array.isArray(data.events) ? data.events : [];
      });
      render(items, today, endExclusive);
    } catch (_) {
      mount.textContent = "अभी आगामी पर्व लोड नहीं हो पाए।";
    }
  }

  load();
})();