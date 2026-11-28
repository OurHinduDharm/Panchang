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
