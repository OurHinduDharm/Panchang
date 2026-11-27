# Sankashti Chaturthi: exceptional absence at both moonrises

Issue #546. The independent 2030 comparison left Vikata Sankashti unresolved because neither candidate moonrise covered Krishna Chaturthi.

## Sources verified
- Dharmasindhu, first pariccheda, Chaturthi-nirnaya (tenth uddesha): https://whm.cdsharma.in/dharma-nirnay?g=ds&p=3&t=path — explicitly prescribes the later day if neither day's moonrise is covered (दिनद्वये चन्द्रोदयव्याप्यभावे परैव). Marathi translation corroborates this: https://www.transliteral.org/pages/z80422023632/view.
- Viramitrodaya, Samayaprakasha, Chaturthi-nirnaya: https://sa.wikisource.org/wiki/वीरमित्रोदयः_-_समयप्रकाशः — establishes the ordinary moonrise criterion, not an independent explicit confirmation of the fallback.
- Drik Panchang, Delhi 21 April 2030: https://www.drikpanchang.com/panchang/month-panchang.html?date=21%2F04%2F2030&time-format=24plushour — lists Vikata Sankashti on 21 April; Chaturthi ends 19:02 IST, moonrise 22:44 IST. Birthastro Delhi also lists 21 April: https://www.birthastro.com/hindi/vrats/sankashti-chaturthi-dates-2030. These are date cross-checks, not Pithoragarh time inputs.
- Existing Pithoragarh regression tests/sankashti-real-panchang-2030.test.mjs retains the reviewed 21 April exception.

## Implementation scope
Only select the later candidate when two consecutive days have known chronological local moonrises and one continuous calculated Krishna Chaturthi lies entirely between those moonrises. No fabricated tithi coverage at worship time. No change to public dates, puja timings or other profiles. Both-moonrise tie and incomplete evidence remain manual review; Dharmasindhu also gives a tie rule, but other tradition variants need separate review. Annual candidate remains unpublished. Real annual regression and synthetic missing/gap/nonconsecutive cases are included.
