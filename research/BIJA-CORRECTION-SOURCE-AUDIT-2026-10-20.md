# Bīja-correction source audit — 2026-10-20

## Decision

Research-only. Do not modify production `app.js` or `extra-panchang.js`. Do not treat any one bīja table as the definitive Chapter IX event engine until epoch, kṣepaka, and source recension are reconciled.

## Primary/near-primary sources located

1. **India Meteorological Department, Rashtriya Panchang, “Mean nirayana longitude of planets by Bija Corrections to Surya siddhanta elements”**  
   https://packolkata.imd.gov.in/panchang/en/bija_corrections  
   The 2026–27 table explicitly separates the Surya-siddhānta mean longitude, bīja correction, and resulting modern mean nirayana longitude. It gives, for 22 March 2026 05:30 IST, for example: mean Sun correction +0°21′46.75″; solar perigee +1°52′22.42″; mean Moon +0°10′57.66″; lunar perigee −5°54′21.40″; Mercury śīghrocca −6°07′26.00″; Venus śīghrocca −8°28′18.98″; Mars mean +1°50′54.16″; Jupiter mean −4°39′49.03″; Saturn mean +6°18′59.78″. Mean ayanāṃśa listed: 24°13′24″. The footnote says Mercury and Venus mean positions are computed at śīghrocca (perigee). This proves a real operational tradition, but the table itself does not specify enough of the underlying algorithm to reproduce the entire calculation.
2. **K. Rupa, Padmaja Venugopal, S. Balachandra Rao, “Makaranda Sāriṇī and Allied Saurapakṣa Tables — A Study,” Indian Journal of History of Science 49.2 (2014), pp. 186–208.**  
   https://cahc.jainuniversity.ac.in/assets/ijhs/Vol49_2_9_KRupa.pdf  
   The article identifies Makaranda's tables as composed at Kāśī in 1478 CE and based on the Sūryasiddhānta school. It is the strongest located secondary scholarly source for the Makaranda table tradition. The original tabular readings and parameter derivation must be transcribed directly before using them as code constants.
3. **Burgess, Translation of the Sūrya-Siddhānta (1860), “Mean Motions of the Planets as corrected by the bija.”**  
   https://upload.wikimedia.org/wikipedia/commons/2/2b/Translation_of_the_S%C3%BBrya-Siddh%C3%A2nta%2C_A_Text-Book_of_Hindu_Astronomy%3B_With_Notes%2C_and_an_Appendix_%28IA_jstor-592174%29.pdf  
   Burgess lists corrected revolution counts: Mercury 17,937,044 vs 17,937,060 original (−16); Venus 7,022,364 vs 7,022,376 (−12); Mars unchanged 2,296,832; Jupiter 364,212 vs 364,220 (−8); Saturn 146,580 vs 146,568 (+12); Sun unchanged 4,320,000. These are a historical comparison, not proof that every later bīja school uses the same epoch or kṣepaka.

## Critical reconciliation finding

The Makaranda-related secondary analysis and Burgess's table do not appear to be safe to merge as a single parameter set without checking their definitions. A modern reconstruction of Makaranda's tables reports Mercury-related numbers that differ in sign/quantity from Burgess's corrected revolution table, while Venus/Jupiter/Saturn show near −12/+? relationships dependent on whether the table refers to mean planet, śīghrocca, or revolution correction. This is a source-definition/epoch question, not a licence to choose whichever value matches modern ephemerides.

The IMD table also shows why a single fixed angle is inadequate: corrections differ by body and by computational point (mean planet, solar perigee, lunar perigee, Mercury/Venus śīghrocca). Do not confuse bīja correction with ayanāṃśa; the listed ayanāṃśa is separately about 24°13′ on the stated date.

## Implementation gate

Before coding a Makaranda or TKS bīja variant, record for every parameter:
- exact Sanskrit/table label and whether it is madhyama, śīghrocca, mandocca, or kṣepaka;
- original source page/table and transcription (including sign);
- epoch and ahargaṇa convention;
- unit and denominator (mahāyuga revolutions/days or a dated fixed correction);
- whether correction changes revolution rate, epoch offset, or both;
- at least two hand-checkable dated examples.

Only after that, add a separate research-only adapter and test it against the published IMD table for the exact date and convention. Do not silently substitute IMD modern mean longitudes for classical true longitudes, and do not change production files.

## Next concrete research task

Transcribe the parameter and daily-motion tables from the 1923 Makaranda Sāriṇī scan and the 2014 paper. Reconcile the Mercury sign discrepancy and the Mars correction/possible kṣepaka. Then derive an explicit mapping from the table epoch (Śaka 1400/Kali 4579 as reported in the secondary literature) to the project's Ahargaṇa. Preserve separate “Burgess bīja” and “Makaranda table” variants until proven equivalent.
