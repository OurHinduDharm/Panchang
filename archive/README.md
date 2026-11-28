# ऐतिहासिक अभिलेख

यह निर्देशिका सक्रिय वेबसाइट के imports, data fetch और runtime calculation से अलग अभिलेखों के लिए है। शोध, स्रोत-साक्ष्य और पुरानी गणना का परीक्षण-इतिहास स्थायी रूप से न मिटाएँ।

## 28 नवम्बर 2026 — पहला सफाई चरण

- [PR #27 का गोधूलि/संध्या कार्यवृत्त](worklogs/PR27-WORKLOG.md): मूल PR मर्ज हो चुका है। फ़ाइल के भीतर की draft स्थिति ऐतिहासिक है, वर्तमान निर्देश नहीं।
- पुराने पथ `PR27-WORKLOG.md` से अक्षरशः स्थानांतरण। मूल blob SHA `26a45bb2796b7263e8e525f4452e1df75a6a5ccb`।
- सक्रिय प्रमाण-दस्तावेज़ `ASTA-UDAYA-BENCHMARK-AUDIT.md` को archive नहीं किया गया; वह [docs में](../docs/ASTA-UDAYA-BENCHMARK-AUDIT.md) स्थानांतरित हुआ है। मूल blob SHA `7fcbcea0c47d46b3ac0792fb6a6cd9cbadbea9a6`।
- पूर्व स्थानों की सामग्री Git commit `4083d6b7e470358e35258b80435208bd7b1e5afc` में उपलब्ध है। दोनों प्रतियों के blob SHA सत्यापित करके ही पुराने पथ हटाए गए।

## इस चरण में जानबूझकर सुरक्षित

- `planetary-asta-udaya-page.mjs`: पुराने source-gate की परीक्षण निर्भरता `tests/planetary-asta-udaya-page.test.mjs` है।
- `data/festivals/legacy-source-preserved.json`: 2026 festival coverage test की निर्भरता; मूल धार्मिक विवरण/लिंक सुरक्षित रखता है।
- `data/festivalData-source.txt`: मूल ऐतिहासिक स्रोत, प्रकाशित कार्डों के provenance की कड़ी।
- `research/` के astronomy modules: कुछ सीधे public worker द्वारा आयात होते हैं; पूरी निर्देशिका archival नहीं है।

यह सीमित खोज-आधारित dependency review है, पूरे Git tree और Blogger में externally linked assets की exhaustive जाँच नहीं। बाकी cleanup में प्रकाशित URLs, imports, fetch paths, test globs, workflow triggers और स्रोत-साक्ष्य का सत्यापन आवश्यक है। मूल गणना या सार्वजनिक HTML/JS इस चरण में नहीं बदले गए।

## दूसरा चरण — पुराना निदान और 2026 वार्षिक snapshot

- `worklogs/ASTA-UDAYA-PHASE-DIAGNOSTICS.md`: पुराने geocentric threshold मॉडल का निदान; वर्तमान दृक्-गणना का विवरण नहीं। मूल blob `8d490a864246ac7ba03d155391c5447bbb77e0c7`।
- `data/ohd-annual-panchang-review-2026.json`: पूर्व `data/references/` का 2,292,955-byte वार्षिक समीक्षा snapshot। मूल blob `c9829bee6c99b197a79afd849af3170e67140b44`। वर्तमान `data/ohd-annual-panchang-review-2026.json` (अलग blob, 1,539,052 bytes) जनरेटर, परीक्षण और documented annual data path के लिए यथावत है। पुराने snapshot को duplicate मानकर नष्ट नहीं किया गया है।
- दोनों मूल पथ commit `c09acf3d8b4499cf7e37149b5eb4c6a055208354` में पुनर्प्राप्त किए जा सकते हैं। स्थानांतरण में वही Git blobs रखे गए हैं।
- `test-pr.html`, `test-astronomy.html`, `asta-udaya-calculator.html`, `monthly-vrat-parv-widget-safe-v2.js` तथा मूल चित्र अभी सुरक्षित हैं: browser preview, परीक्षण, workflow या बाहरी Blogger/CDN links हो सकते हैं। केवल खोज में संदर्भ न मिलना हटाने का प्रमाण नहीं है।

## तीसरा चरण — अप्रयुक्त tools और बड़े डेटा का विलोपन

स्वामी के निर्देश पर पुराने standalone astronomy प्रयोग और बहुवर्षीय vector-cache prototype को वर्तमान checkout से हटाया गया। सक्रिय शहरवार उदय-अस्त worker इनमें से किसी का उपयोग नहीं करता। पुराने 2026 archival snapshot को भी हटाया गया; वर्तमान वार्षिक JSON यथावत है। पहले के दो चरणों में archive किए गए snapshot के बारे में ऊपर की जानकारी ऐतिहासिक है, वर्तमान फ़ाइल की उपलब्धता का दावा नहीं। सभी हटाई गई फ़ाइलें Git commit `59b010eaa1a5a178bee7dd929dbfb08da12a01b1` से पुनर्प्राप्त की जा सकती हैं:

- `asta-udaya-calculator.html`
- `data/asta-udaya-all-chunks.json`, `data/asta-udaya-manifest.json`
- `tests/validate-asta-udaya-dataset.mjs`, `tests/measure-asta-udaya-interpolation.mjs`
- `test-astronomy.html`, `tests/asta-udaya-boundary-audit-export.test.mjs`
- `archive/data/ohd-annual-panchang-review-2026.json`

कुल 8 फाइलों के 3,613,618 bytes हटे; दस्तावेज़/guards में छोटे बदलाव अलग हैं। पुराने prototype के परीक्षण ही हटे, सक्रिय गणना और स्रोत सत्यापन परीक्षण सुरक्षित हैं। PR preview utility `test-pr.html` अब वर्तमान index को प्राथमिकता देती है। `data/asta-udaya-benchmark.json` में पुराने experimental page के उल्लेख स्रोत-इतिहास हैं, runtime dependency नहीं। पुरानी Git history rewrite नहीं की गई है; इसलिए GitHub के पूर्ण repository storage में इतनी ही कमी की गारंटी नहीं है।

## चौथा चरण — अप्रयुक्त समीक्षा पेज

स्वामी के निर्देश पर `test-pr.html` (12,654 bytes) और `festival-review.html` (16,192 bytes) वर्तमान checkout से हटाए गए। दोनों मूल फाइलें commit `ec77991a837ea8811abfda1b9858298e3f0aa71d` में पुनर्प्राप्त हैं। `festival-year-review.html` तथा उसके परीक्षण और स्वतंत्र वार्षिक गणना सुरक्षित हैं। पहले के PR preview संबंधी विवरण ऐतिहासिक हैं। कुल 28,846 bytes के दो पेज हटे।
