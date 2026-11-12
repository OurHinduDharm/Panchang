#!/usr/bin/env python3
"""Extract and verify the Pithoragarh GEDTM30 v1.2 1-arc-second window.

Research-only utility. It does not modify Panchang/Festival data.
Requires: rasterio, numpy (and GDAL's /vsicurl/ support).

Example:
  python research/agastya/gedtm30_extract.py --out pithoragarh_n29e080.tif

The script reads only the requested COG window using HTTP range requests;
it does not download the global raster in full.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.transform import rowcol

DTM_URLS = (
    "https://opentopography.s3.sdsc.edu/raster/GEDTM30/GEDTM30_be/"
    "gedtm_rf_m_30m_s_20060101_20151231_go_epsg.4326.3855_v1.2.tif",
    "https://s3.opengeohub.org/global/dtm/v1.2/"
    "gedtm_rf_m_30m_s_20060101_20151231_go_epsg.4326.3855_v1.2.tif",
)
WEST, SOUTH, EAST, NORTH = 80.0, 29.0, 81.0, 30.0
OBSERVER_LAT, OBSERVER_LON = 29.5828, 80.2182
PROJECT_OBSERVER_ELEVATION_M = 1650.0
EXPECTED_RESOLUTION_DEG = 1.0 / 3600.0
NODATA_FLOAT32_MAX = np.finfo(np.float32).max

GDAL_ENV = {
    "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
    "CPL_VSIL_CURL_ALLOWED_EXTENSIONS": ".tif",
    "GDAL_HTTP_TIMEOUT": "45",
    "GDAL_HTTP_MAX_RETRY": "2",
    "VSI_CACHE": "TRUE",
    "VSI_CACHE_SIZE": "50000000",
}


def json_value(value):
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, (np.bool_,)):
        return bool(value)
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="GEDTM30_Pithoragarh_N29E080.tif")
    parser.add_argument("--metadata", default=None,
                        help="JSON sidecar path (default: OUT.metadata.json)")
    args = parser.parse_args()

    out_path = Path(args.out)
    meta_path = Path(args.metadata) if args.metadata else Path(str(out_path) + ".metadata.json")

    last_error = None
    with rasterio.Env(**GDAL_ENV):
        for url in DTM_URLS:
            try:
                src = rasterio.open("/vsicurl/" + url)
                source_url = url
                break
            except Exception as exc:  # try documented mirror
                last_error = exc
        else:
            raise RuntimeError(
                "Could not open either documented GEDTM30 v1.2 COG host. "
                "Check internet/DNS and GDAL /vsicurl/ support. Last error: "
                + repr(last_error)
            )

        with src:
            if src.crs is None or src.crs.to_epsg() != 4326:
                raise RuntimeError(f"Unexpected source CRS: {src.crs}")
            if src.count < 1:
                raise RuntimeError("Source COG has no raster band.")

            xres, yres = src.res
            if not (math.isclose(abs(xres), EXPECTED_RESOLUTION_DEG, abs_tol=1e-10)
                    and math.isclose(abs(yres), EXPECTED_RESOLUTION_DEG, abs_tol=1e-10)):
                raise RuntimeError(
                    f"Source resolution is {src.res}, not 1 arc-second. "
                    "Do not force a 3600x3600 grid; inspect source/overview selection."
                )

            window = from_bounds(WEST, SOUTH, EAST, NORTH, transform=src.transform)
            window = window.round_offsets().round_lengths()
            expected_shape = (3600, 3600)
            if (int(window.height), int(window.width)) != expected_shape:
                raise RuntimeError(
                    f"Computed source window is {window.width}x{window.height}, "
                    f"not 3600x3600. Source transform={src.transform}; "
                    "do not relabel the pixels."
                )

            data = src.read(1, window=window, masked=False)
            if data.shape != expected_shape:
                raise RuntimeError(f"Unexpected read shape: {data.shape}")

            clip_transform = src.window_transform(window)
            clip_bounds = rasterio.transform.array_bounds(
                data.shape[0], data.shape[1], clip_transform
            )
            # array_bounds returns west, south, east, north.
            tol = EXPECTED_RESOLUTION_DEG * 1.1
            expected_bounds = (WEST, SOUTH, EAST, NORTH)
            if any(abs(a - b) > tol for a, b in zip(clip_bounds, expected_bounds)):
                raise RuntimeError(
                    f"Extracted bounds {clip_bounds} do not match requested "
                    f"{expected_bounds}; refusing to write a mislabeled clip."
                )

            nodata = src.nodata
            valid = np.isfinite(data)
            if nodata is not None:
                valid &= data != nodata
            valid &= data < NODATA_FLOAT32_MAX
            valid_values = data[valid]
            if valid_values.size == 0:
                raise RuntimeError("Extracted window contains no valid elevation samples.")

            row, col = rowcol(src.transform, OBSERVER_LON, OBSERVER_LAT)
            local_row, local_col = int(row - window.row_off), int(col - window.col_off)
            observer_sample = None
            if 0 <= local_row < data.shape[0] and 0 <= local_col < data.shape[1]:
                sample = data[local_row, local_col]
                if np.isfinite(sample) and sample < NODATA_FLOAT32_MAX:
                    observer_sample = float(sample)

            profile = src.profile.copy()
            profile.update(
                driver="GTiff",
                height=data.shape[0],
                width=data.shape[1],
                count=1,
                dtype=data.dtype,
                crs=src.crs,
                transform=clip_transform,
                nodata=nodata,
                tiled=True,
                compress="deflate",
                predictor=3 if np.issubdtype(data.dtype, np.floating) else 2,
                BIGTIFF="IF_SAFER",
            )
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with rasterio.open(out_path, "w", **profile) as dst:
                dst.write(data, 1)
                dst.update_tags(
                    source="GEDTM30 v1.2 DTM",
                    source_url=source_url,
                    source_vertical_crs="EPSG:3855 (EGM2008 geoid height)",
                    requested_tile="N29E080",
                    requested_bbox="80,29,81,30",
                    observer_latitude=str(OBSERVER_LAT),
                    observer_longitude=str(OBSERVER_LON),
                    note="Research-only clip; observer height datum must be independently verified.",
                )

            report = {
                "status": "clip_created_from_source_cog",
                "source_url": source_url,
                "source_crs": str(src.crs),
                "source_transform": str(src.transform),
                "source_resolution_degrees": [xres, yres],
                "source_dtype": src.dtypes[0],
                "source_nodata": json_value(nodata),
                "window": {
                    "row_off": int(window.row_off),
                    "col_off": int(window.col_off),
                    "height": int(window.height),
                    "width": int(window.width),
                },
                "output": str(out_path),
                "output_shape": list(data.shape),
                "output_crs": "EPSG:4326",
                "output_transform": str(clip_transform),
                "output_bounds_wsen": list(clip_bounds),
                "valid_pixel_count": int(valid.sum()),
                "elevation_m": {
                    "min": float(valid_values.min()),
                    "p05": float(np.percentile(valid_values, 5)),
                    "median": float(np.median(valid_values)),
                    "mean": float(valid_values.mean()),
                    "p95": float(np.percentile(valid_values, 95)),
                    "max": float(valid_values.max()),
                },
                "observer": {
                    "latitude": OBSERVER_LAT,
                    "longitude": OBSERVER_LON,
                    "project_elevation_m_unverified_datum": PROJECT_OBSERVER_ELEVATION_M,
                    "source_pixel_row": int(row),
                    "source_pixel_col": int(col),
                    "clip_pixel_row": local_row,
                    "clip_pixel_col": local_col,
                    "dtm_sample_m_egm2008": observer_sample,
                    "difference_from_1650m_not_interpreted": (
                        None if observer_sample is None
                        else PROJECT_OBSERVER_ELEVATION_M - observer_sample
                    ),
                },
                "acceptance_notes": [
                    "The source COG transform, not the old clip filename, determines pixel placement.",
                    "A 1650 m observer elevation is not compared physically until its vertical datum is confirmed.",
                    "This DTM clip alone is not a complete terrain-horizon or visibility result.",
                    "Do not use the output to change production Panchang/Festival data.",
                ],
            }
            meta_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n",
                                 encoding="utf-8")
            print(json.dumps(report, indent=2, ensure_ascii=False))
            print(f"\nWrote: {out_path}\nMetadata: {meta_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
