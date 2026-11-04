import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const paths = ["monthly-vrat-parv.html", "monthly-vrat-parv-widget.js"];

for (const path of paths) {
  test(`${path} sorts same-day festivals by Krishna then Shukla tithi and preserves ties`, async () => {
    const source = await readFile(new URL("../" + path, import.meta.url), "utf8");
    const start = source.indexOf("  // एक ही तारीख़ पर पर्वों को हिन्दू तिथि के क्रम में रखें");
    const end = source.indexOf("  function render(data,year,month,token){", start);
    assert.notEqual(start, -1, "stable tithi sorter helper must exist");
    assert.notEqual(end, -1, "render function must follow the sorter helper");
    const helper = source.slice(start, end);
    const events = [
      { date: "2026-11-08", title: "शुक्ल प्रतिपदा", hinduTithi: "कार्तिक शुक्ल प्रतिपदा" },
      { date: "2026-11-08", title: "कृष्ण अष्टमी", hinduTithi: "कार्तिक कृष्ण अष्टमी" },
      { date: "2026-11-08", title: "कृष्ण प्रतिपदा पहला", hinduTithi: "कार्तिक कृष्ण प्रतिपदा" },
      { date: "2026-11-08", title: "कृष्ण प्रतिपदा दूसरा", hinduTithi: "कार्तिक कृष्ण प्रतिपदा" },
      { date: "2026-11-07", title: "पहले की तारीख़", hinduTithi: "शुक्ल दशमी" }
    ];
    const sorted = vm.runInNewContext(helper + "\nsortFestivalEvents(testEvents);", { testEvents: events });
    assert.deepEqual(Array.from(sorted, item => item.title), [
      "पहले की तारीख़",
      "कृष्ण प्रतिपदा पहला",
      "कृष्ण प्रतिपदा दूसरा",
      "कृष्ण अष्टमी",
      "शुक्ल प्रतिपदा"
    ]);
  });
}

test("upcoming festival widget uses tithi order and keeps original order for equal tithis", async () => {
  const source = await readFile(new URL("../festival-widget.js", import.meta.url), "utf8");
  assert.match(source, /function festivalTithiRank\(item\)/);
  assert.match(source, /const rankDiff = festivalTithiRank\(left\) - festivalTithiRank\(right\);\s*return rankDiff \|\| a\.index - b\.index;/);
  assert.doesNotMatch(source, /String\(a\.title \|\| ""\)\.localeCompare\(String\(b\.title \|\| ""\), "hi"\)/);
});
