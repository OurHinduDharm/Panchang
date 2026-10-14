#!/usr/bin/env python3
"""Split the OCR source into small UTF-8 text files for reliable review.

The chunks preserve the source text in order. Boundaries may fall mid-line if
the source contains an exceptionally long line; concatenating all parts in
numeric order reconstructs the original text exactly.
"""
from pathlib import Path
import hashlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "vrat-parichay.txt"
OUT = ROOT / "data" / "vrat-parichay-chunks"
CHUNK_CHARS = 12000

def main():
    if not SOURCE.exists():
        raise SystemExit(f"Source file not found: {SOURCE}")
    text = SOURCE.read_text(encoding="utf-8-sig")
    if not text.strip():
        raise SystemExit("Source file is empty; refusing to create empty chunks.")

    OUT.mkdir(parents=True, exist_ok=True)
    # Remove old numbered chunks so reruns do not leave stale trailing parts.
    for old in OUT.glob("part-*.txt"):
        old.unlink()

    parts = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_CHARS, len(text))
        if end < len(text):
            # Prefer a newline boundary without creating tiny chunks.
            newline = text.rfind("\n", start + CHUNK_CHARS // 2, end)
            if newline > start:
                end = newline + 1
        parts.append(text[start:end])
        start = end

    for index, part in enumerate(parts, 1):
        (OUT / f"part-{index:03d}.txt").write_text(part, encoding="utf-8", newline="")

    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    index_lines = [
        "# Vrat Parichay OCR — readable chunks",
        "",
        "Generated from `data/vrat-parichay.txt` by `tools/split_vrat_parichay.py`.",
        "",
        f"- Source characters: {len(text):,}",
        f"- Chunk size target: {CHUNK_CHARS:,} characters",
        f"- Number of parts: {len(parts)}",
        f"- Source SHA-256 (UTF-8 text): `{digest}`",
        "",
        "Read the parts in numeric order. Chunk boundaries preserve the original text; "
        "a boundary can split a line only when needed.",
        "",
    ]
    for index in range(1, len(parts) + 1):
        name = f"part-{index:03d}.txt"
        index_lines.append(f"- [{name}]({name}) — {len(parts[index - 1]):,} characters")
    (OUT / "README.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    print(f"Split {len(text):,} characters into {len(parts)} chunks; SHA-256 {digest}")

if __name__ == "__main__":
    main()
