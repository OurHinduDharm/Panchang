/* OurHinduDharm upcoming-festival widget: JSON-backed renderer.
 * Draft integration. Does not modify the Panchang page's "today's festival" logic.
 */
(function () {
  "use strict";
  var container = typeof document !== "undefined" ? document.getElementById("dynamicFestivalList") : null;

  var DATA_URL = "https://raw.githubusercontent.com/OurHinduDharm/Panchang/data/festival-json-foundation/data/festivals.json";
  var DAYS_AHEAD = 14;
  var DAY_MS = 86400000;

  function localDateString(date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }
  function validDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var d = new Date(value + "T00:00:00");
    return isNaN(d.getTime()) || localDateString(d) !== value ? null : d;
  }
  function safeHttpUrl(value) {
    try {
      var u = new URL(value);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
    } catch (_) { return ""; }
  }
  function make(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = String(text);
    return el;
  }
  function selectUpcoming(data, now) {
    if (!data || !Array.isArray(data.festivals)) throw new Error("Invalid festival data");
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return data.festivals.filter(function (item) {
      var start = validDate(item && item.date && item.date.start);
      var end = validDate(item && item.date && item.date.end) || start;
      if (!start || !end || end < start) return false;
      var startDiff = Math.floor((start.getTime() - today.getTime()) / DAY_MS);
      var ongoing = today >= start && today <= end;
      // Exactly 14 calendar dates: today (day 0) through day 13.
      return ongoing || (startDiff >= 0 && startDiff < DAYS_AHEAD);
    }).sort(function (a, b) {
      return a.date.start.localeCompare(b.date.start) ||
        String(a.name || "").localeCompare(String(b.name || ""), "hi");
    });
  }

  function render(data, now) {
    if (!data || !Array.isArray(data.festivals)) throw new Error("Invalid festival data");
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var todayKey = localDateString(today);
    var upcoming = selectUpcoming(data, today);

    var fragment = document.createDocumentFragment();
    upcoming.forEach(function (item) {
      var card = make("article", "festival-card");
      var dateBox = make("div", "festival-date");
      var d = validDate(item.date.start);
      dateBox.appendChild(make("span", "festival-day", d ? String(d.getDate()) : ""));
      dateBox.appendChild(make("span", "festival-month",
        d ? d.toLocaleDateString("hi-IN", { month: "short" }) : ""));
      card.appendChild(dateBox);

      var body = make("div", "festival-content");
      body.appendChild(make("div", "festival-title", item.name || "त्योहार"));
      if (item.sourceText && item.sourceText.statusText) {
        body.appendChild(make("div", "festival-status", item.sourceText.statusText));
      }
      var links = Array.isArray(item.relatedArticles) ? item.relatedArticles : [];
      if (links.length) {
        var list = make("div", "festival-description");
        links.forEach(function (entry, index) {
          if (index) list.appendChild(document.createTextNode(" · "));
          var url = safeHttpUrl(entry && entry.url);
          if (url) {
            var a = make("a", "", entry.title || "संबंधित लेख");
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            list.appendChild(a);
          } else {
            // Intentionally plain text until the article is written and its URL is verified.
            list.appendChild(document.createTextNode((entry && entry.title) || ""));
          }
        });
        body.appendChild(list);
      } else if (typeof item.description === "string" && item.description) {
        // Preserve existing legacy descriptions and links without injecting raw HTML.
        var parsed = new DOMParser().parseFromString(item.description, "text/html");
        var descriptionBox = make("div", "festival-description");
        function copySafeNode(node, parent) {
          if (node.nodeType === 3) {
            parent.appendChild(document.createTextNode(node.nodeValue || ""));
            return;
          }
          if (node.nodeType !== 1) return;
          if (node.tagName === "A") {
            var href = safeHttpUrl(node.getAttribute("href"));
            if (href) {
              var link = make("a", "", node.textContent || "संबंधित लेख");
              link.href = href;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              parent.appendChild(link);
              return;
            }
          }
          Array.prototype.forEach.call(node.childNodes || [], function (child) {
            copySafeNode(child, parent);
          });
        }
        Array.prototype.forEach.call(parsed.body.childNodes, function (node) {
          copySafeNode(node, descriptionBox);
        });
        body.appendChild(descriptionBox);
      }
      card.appendChild(body);
      fragment.appendChild(card);
    });
    if (upcoming.length) {
      container.replaceChildren(fragment);
      container.setAttribute("data-source", "festivals-json");
      container.setAttribute("data-window-days", String(DAYS_AHEAD));
    }
    return { count: upcoming.length, today: todayKey };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      render: render,
      selectUpcoming: selectUpcoming,
      safeHttpUrl: safeHttpUrl,
      validDate: validDate
    };
  }

  if (!container || typeof fetch !== "function") return;

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("Festival JSON request failed: " + response.status);
      return response.json();
    })
    .then(function (data) { render(data, new Date()); })
    .catch(function (error) {
      // Keep the existing legacy-rendered list visible if JSON loading fails.
      if (window.console && console.warn) console.warn("OurHinduDharm festival JSON fallback:", error);
    });
})();
