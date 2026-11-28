# Agastya morning rise: latitude-aware depression comparator (28 Nov 2026)

The previous traditional ritual decision (#565) is merged. The new candidate predicts an actual geometric horizon rise on a selected morning, not the continuous traditional Udaya time in Tara Prasad. It does not replace the current public azimuth model or solve Asta.

## Method and independently executed results

Offline Python Swiss Ephemeris 2.10.03 Moshier Sun apparent equatorial coordinates, sidereal time, IAU 1976 approximate precession of the repo Canopus ICRS position and proper motion. No stellar nutation/annual aberration in this comparator; standard geometric horizon, no refraction or terrain. For each local day, bracket the ascending stellar altitude-zero root in 30-minute steps; solve with scipy brentq; compute solar altitude and hour angle there. Select first daily morning crossing from solar altitude greater than -D to <= -D, with Sun eastern hour angle. Offline sweep Jun 20 + 100 days; JS review scans full year. Use city-center approximate coordinates (not exact provider observer). Model not verified outside calibration latitude range.

At the published date and previous morning, the solar altitudes (degrees):
| City | Latitude | Longitude | Previous | Reference day |
|---|---:|---:|---:|---:|
| Pithoragarh |29.5828|80.2182|-13.928|-14.880|
| Pathankot |32.2748|75.6521|-16.291|-17.243|
| Perundurai |11.2756|77.5879|-10.817|-11.770|
| Delhi |28.6139|77.209|-13.396|-14.348|
| Varanasi |25.3176|82.9739|-12.984|-13.936|

Calibrate least-squares on midpoint of the first three rows only, solar altitude against 1/(37.3-latitude); D=9.984385535955107+34.09106559579235/(37.3-latitude). This is a low-culmination/extinction proxy, not a physical extinction law or classical constant. The 37.3 degree limit approximates 90° minus absolute Canopus declination. Keep domain 11.2756–32.2748 degrees; do not extrapolate.

| Site/year | Reference | Candidate | Error days | Group |
|---|---|---|---:|---|
| Pithoragarh 2027 | Sep 7 | Sep 7 |0|calibration|
| Pathankot 2027 | Sep 17 | Sep 17 |0|calibration|
| Perundurai 2027 | Jul 29 | Jul 29 |0|calibration|
| Delhi 2027 | Sep 4 | Sep 4 |0|held-out city|
| Varanasi 2027 | Aug 27 | Aug 26 |-1|held-out city|
| Pithoragarh 2024 | Sep 7 | Sep 6 |-1|held-out year|
| Pithoragarh 2025 | Sep 7 | Sep 7 |0|held-out year|
| Pithoragarh 2026 | Sep 7 | Sep 7 |0|held-out year|
| Pithoragarh 2028 | Sep 7 | Sep 6 |-1|held-out year|
| Pithoragarh 2029 | Sep 7 | Sep 6 |-1|held-out year|
| Pithoragarh 2030 | Sep 7 | Sep 7 |0|held-out year|
| Delhi 2024 | Sep 4 | Sep 3 |-1|held-out year|
| Moradabad 2026 | Sep 5 | Sep 4 |-1|held-out city/year|

10 held-out cases: 4 exact, 6 one day earlier; all within one day. All references are one provider, city label, not independent publisher verification; spatial/temporal holdouts are limited and model choice made after exploring 2 functional forms. A fixed 7° solar depression yielded 5–10 day early errors across five 2027 sites; fixed 13°/15° has up to 4 days error. Do not claim independent exact publisher formula. New CI verifies Astronomy Engine separately with two-day research gate.

References: Pithoragarh rows and Delhi 2024/Moradabad 2026 in existing research/agastya/traditional-arghya-source-provenance-audit.md; Delhi 2027 https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1273294&year=2027; Varanasi 2027 https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1253405&year=2027; Pathankot and Perundurai rendered city-specific Drik ritual pages captured in prior audit. General geometric method: S. Balachandra Rao et al., Helical Rising of Canopus in Indian Astronomy, IJHS 51.1 (2016), pp.83–91 https://cahc.jainuniversity.ac.in/assets/ijhs/Vol51_2016_1_Art10.pdf. It does NOT supply our fitted coefficients.

## Acceptance gate
No public replacement until actual JS benchmark and comparison with existing azimuth model on the same cases; no Asta change, no fabricated traditional timestamp. Tara Prasad Ramnagar 2027 Sep 1 12:35 remains separate event definition. The ritual decision requires explicit traditional rise and local dawn/ingress. Southern rises before Simha (e.g. Perundurai) are outside the Simha-limited ritual review and must not be treated as absent astronomical rises.
