#!/usr/bin/env python3
"""Research-only terrain-horizon audit from the GEDTM30 Pithoragarh clip.

Computes conditional geometric terrain horizons. It does NOT determine Canopus
visibility by itself and does NOT modify Panchang/Festival production data.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
from pathlib import Path

import numpy as np
import rasterio

LAT0, LON0 = 29.5828, 80.2182
PROJECT_OBSERVER_ELEVATION_M = 1650.0
EARTH_RADIUS_M = 6_371_000.0
REFRACTION_K = 7.0 / 6.0


def bilinear(array, rows, cols, nodata):
    r0 = np.floor(rows).astype(np.int64)
    c0 = np.floor(cols).astype(np.int64)
    dr, dc = rows - r0, cols - c0
    inside = (r0 >= 0) & (c0 >= 0) & (r0 + 1 < array.shape[0]) & (c0 + 1 < array.shape[1])
    out = np.full(rows.shape, np.nan, dtype=np.float64)
    idx = np.where(inside)[0]
    if idx.size == 0:
        return out
    rr, cc = r0[idx], c0[idx]
    z00 = array[rr, cc].astype(np.float64)
    z01 = array[rr, cc + 1].astype(np.float64)
    z10 = array[rr + 1, cc].astype(np.float64)
    z11 = array[rr + 1, cc + 1].astype(np.float64)
    good = np.isfinite(z00) & np.isfinite(z01) & np.isfinite(z10) & np.isfinite(z11)
    if nodata is not None:
        good &= (z00 != nodata) & (z01 != nodata) & (z10 != nodata) & (z11 != nodata)
    gi = idx[good]
    if gi.size:
        a, b = dr[gi], dc[gi]
        out[gi] = (
            (1-a)*(1-b)*z00[good] + (1-a)*b*z01[good]
            + a*(1-b)*z10[good] + a*b*z11[good]
        )
    return out


def ray_horizon(data, transform, nodata, azimuth_deg, observer_elev, max_distance, step):
    distances = np.arange(step, max_distance + step * 0.5, step, dtype=np.float64)
    az = math.radians(azimuth_deg)
    north = distances * math.cos(az)
    east = distances * math.sin(az)
    lat = LAT0 + north / 111_132.0
    lon = LON0 + east / (111_320.0 * math.cos(math.radians(LAT0)))
    inv = ~transform
    # Rasterio affine inverse maps coordinates to pixel-corner coordinates.
    cols_corner = inv.a * lon + inv.b * lat + inv.c
    rows_corner = inv.d * lon + inv.e * lat + inv.f
    rows = rows_corner - 0.5
    cols = cols_corner - 0.5
    heights = bilinear(data, rows, cols, nodata)
    valid = np.isfinite(heights)
    if not np.any(valid):
        return {
            "azimuth_deg": round(float(azimuth_deg), 3),
            "horizon_altitude_deg": None,
            "distance_km": None,
            "sample_count": 0,
            "coverage_to_km": 0.0,
        }
    d = distances[valid]
    z = heights[valid]
    curvature_drop = d * d / (2.0 * EARTH_RADIUS_M * REFRACTION_K)
    apparent = np.degrees(np.arctan2(z - observer_elev - curvature_drop, d))
    j = int(np.argmax(apparent))
    return {
        "azimuth_deg": round(float(azimuth_deg), 3),
        "horizon_altitude_deg": round(float(apparent[j]), 4),
        "distance_km": round(float(d[j] / 1000.0), 3),
        "sample_count": int(valid.sum()),
        "coverage_to_km": round(float(d.max() / 1000.0), 3),
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dem", required=True)
    p.add_argument("--json", required=True)
    p.add_argument("--csv", required=True)
    p.add_argument("--max-distance-m", type=int, default=20000)
    p.add_argument("--step-m", type=int, default=30)
    args = p.parse_args()

    with rasterio.open(args.dem) as ds:
        data = ds.read(1, masked=False)
        transform = ds.transform
        nodata = ds.nodata
        tags = ds.tags()
        crs = str(ds.crs)
        sample = list(ds.sample([(LON0, LAT0)]))[0][0]
        if not np.isfinite(sample) or (nodata is not None and sample == nodata):
            raise RuntimeError("Observer DTM sample is invalid; cannot calculate horizon.")
        observer_ground = float(sample)

        # 1-degree full-circle overview and 0.25-degree detailed southern sector.
        azimuths = list(np.arange(0.0, 360.0, 1.0))
        azimuths += list(np.arange(140.0, 220.0001, 0.25))
        azimuths = sorted(set(round(float(x), 3) for x in azimuths))

        scenarios = [
            ("observer_at_dtm_ground_plus_2m", observer_ground + 2.0,
             "Conditional: observer is 2 m above GEDTM30 sampled ground."),
            ("observer_at_project_1650m_assumed_egm2008", PROJECT_OBSERVER_ELEVATION_M,
             "Conditional only: treats project 1650 m as EGM2008 orthometric height; datum/location not yet verified."),
        ]
        all_rows = []
        scenario_reports = []
        for name, observer_elev, note in scenarios:
            rows = [
                ray_horizon(data, transform, nodata, az, observer_elev,
                            args.max_distance_m, args.step_m)
                for az in azimuths
            ]
            for row in rows:
                row["scenario"] = name
                row["observer_elevation_assumed_m_egm2008"] = round(observer_elev, 3)
            all_rows.extend(rows)
            south = [x for x in rows if 140.0 <= x["azimuth_deg"] <= 220.0]
            usable = [x for x in south if x["horizon_altitude_deg"] is not None]
            peak = max(usable, key=lambda x: x["horizon_altitude_deg"]) if usable else None
            scenario_reports.append({
                "scenario": name,
                "observer_elevation_assumed_m_egm2008": round(observer_elev, 3),
                "assumption": note,
                "southern_sector_azimuth_deg": [140.0, 220.0],
                "southern_peak_horizon": peak,
                "southern_min_horizon_deg": (
                    round(min(x["horizon_altitude_deg"] for x in usable), 4) if usable else None
                ),
                "southern_max_horizon_deg": (
                    round(max(x["horizon_altitude_deg"] for x in usable), 4) if usable else None
                ),
                "southern_ray_count": len(south),
                "southern_valid_ray_count": len(usable),
            })

        out = {
            "status": "conditional_terrain_horizon_computed",
            "source": "GEDTM30 v1.2 official COG clip",
            "dem": args.dem,
            "crs": crs,
            "raster_tags": tags,
            "observer": {
                "latitude": LAT0,
                "longitude": LON0,
                "dtm_ground_sample_m_egm2008": round(observer_ground, 3),
                "project_elevation_m_datum_unverified": PROJECT_OBSERVER_ELEVATION_M,
                "difference_m_uninterpreted": round(PROJECT_OBSERVER_ELEVATION_M - observer_ground, 3),
            },
            "method": {
                "azimuth_sampling": "1 degree full circle; 0.25 degree from 140 to 220 degrees",
                "distance_step_m": args.step_m,
                "maximum_distance_m": args.max_distance_m,
                "terrain_interpolation": "bilinear",
                "earth_curvature": "7/6 effective Earth radius",
                "refraction_model": "standard 7/6 effective-radius approximation",
                "height_reference": "GEDTM30 EGM2008; 1650 m scenario is explicitly assumed, not verified",
            },
            "scenarios": scenario_reports,
            "limitations": [
                "Terrain horizon only; not a Canopus rise/set or naked-eye visibility calculation.",
                "The 1650 m observer datum and exact physical observer elevation remain unverified.",
                "DEM raster registration and observer pixel-center alignment require independent audit.",
                "The 1-degree clip may limit coverage for some full-circle rays; inspect coverage_to_km in CSV.",
                "No production Panchang or Festival data was changed.",
            ],
        }
    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with open(args.csv, "w", newline="", encoding="utf-8") as f:
        fields = ["scenario", "azimuth_deg", "observer_elevation_assumed_m_egm2008",
                  "horizon_altitude_deg", "distance_km", "sample_count", "coverage_to_km"]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(all_rows)
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
