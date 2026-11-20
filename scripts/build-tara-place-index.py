"""Build the Indian Tara place index from GeoNames IN.zip and cities1000.zip.

Usage: python scripts/build-tara-place-index.py IN.zip cities1000.zip > data/tara-india-places.json
Sources: https://download.geonames.org/export/dump/
GeoNames CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
Two source archives from the same daily release should be used together.
"""
import json
import sys
import zipfile


def rows(path, member):
    with zipfile.ZipFile(path) as archive, archive.open(member) as stream:
        for line in stream:
            yield line.decode("utf-8").rstrip("\r\n").split("\t")


states, districts = {}, {}
for record in rows(sys.argv[1], "IN.txt"):
    if record[7] == "ADM1":
        states[record[10]] = record[2] or record[1]
    if record[7] == "ADM2":
        districts[".".join(record[10:12])] = record[2] or record[1]

cities = []
for r in rows(sys.argv[2], "cities1000.txt"):
    if r[8] != "IN" or r[6] != "P" or r[17] != "Asia/Kolkata":
        continue
    # Prefer point elevation, then the GeoNames DEM of the same point.
    height = next((int(v) for v in r[15:17] if v and -500 <= int(v) <= 9000), None)
    if height is None:
        continue
    aliases = [s for s in r[3].split(",") if any("\u0900" <= c <= "\u097f" for c in s)]
    # Local Hindi names absent from this extract and common historical names.
    aliases += {"1259503": ["पिथौरागढ़", "पिथौरागढ"], "1258637": ["रामनगर"],
                "1253405": ["Kashi", "Banaras"], "1275339": ["Bombay"]}.get(r[0], [])
    cities.append((int(r[14] or 0), [int(r[0]), r[2] or r[1], r[10], r[11],
                   float(r[4]), float(r[5]), height, list(dict.fromkeys(aliases))]))

# Population order breaks ties between otherwise equally good name matches.
cities.sort(key=lambda item: (-item[0], item[1][0]))
def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)

print('{"source":"GeoNames (CC BY 4.0)","sourceDate":' +
      compact("%04d-%02d-%02d" % zipfile.ZipFile(sys.argv[2]).getinfo("cities1000.txt").date_time[:3]) +
      ',"states":' + compact(states) + ',"districts":' + compact(districts) + ',"cities":[')
print(",\n".join(compact(row) for _, row in cities))
print("]}")
