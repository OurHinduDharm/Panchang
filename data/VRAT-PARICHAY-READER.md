# Reading the Vrat Parichay OCR file

The original OCR text is kept at `data/vrat-parichay.txt`. If it is too large for a reader/tool to return in one response, this workflow splits it into smaller UTF-8 files under `data/vrat-parichay-chunks/`.

## How to generate the chunks

1. Merge the pull request that adds this tool.
2. Open **Actions** → **Prepare readable Vrat Parichay text chunks**.
3. Choose **Run workflow** on the `main` branch.
4. After it completes, open `data/vrat-parichay-chunks/README.md` and read the numbered parts.

The script refuses to proceed if the source file is missing or empty. It keeps the original source untouched and writes only generated review copies. Each part is small enough to inspect separately, and the index records the source text length and SHA-256 digest.

This is a reading/research aid, not a Panchang calculation engine. The OCR may contain recognition errors; verify important Sanskrit verses and references against the book scan or a reliable edition before implementing rules.
