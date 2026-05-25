#!/usr/bin/env python3
"""Build self-contained GHL-ready HTML embeds.

For each page (index.html, services.html, about.html):
  - Inline all of style.css inside a <style> tag
  - Inline all of script.js inside a <script> tag
  - Convert relative asset paths (assets/...) to ABSOLUTE_BASE_URL + path
    so the asset files resolve when the embed is pasted into GHL.

Output: ghl/<page>.html — paste the file's contents into a GHL
"Custom HTML/Code" element on the matching funnel page.
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
GHL_DIR = ROOT / "ghl"

# Update this to wherever the assets/ folder will be publicly served from.
# After uploading the assets folder to a CDN, GHL media library, or GitHub Pages,
# replace this with that base URL (with trailing slash).
ASSET_BASE = "assets/"

PAGES = [
    ("index.html",    "home.html"),
    ("services.html", "services.html"),
    ("about.html",    "about.html"),
]

def main() -> None:
    css = (ROOT / "style.css").read_text(encoding="utf-8")
    js  = (ROOT / "script.js").read_text(encoding="utf-8")

    for src_name, out_name in PAGES:
        html = (ROOT / src_name).read_text(encoding="utf-8")

        # Inline CSS — replace <link rel="stylesheet" href="style.css">
        # (use a lambda so backslashes in the replacement aren't treated as regex backrefs)
        css_repl = f"<style>\n{css}\n</style>"
        html = re.sub(
            r'<link\s+rel="stylesheet"\s+href="style\.css"\s*/?>',
            lambda _m: css_repl,
            html,
        )

        # Inline JS — replace <script src="script.js"></script>
        js_repl = f"<script>\n{js}\n</script>"
        html = re.sub(
            r'<script\s+src="script\.js"\s*>\s*</script>',
            lambda _m: js_repl,
            html,
        )

        # Rewrite asset paths if ASSET_BASE is not the default
        if ASSET_BASE != "assets/":
            html = re.sub(
                r'(?:src|href)="assets/',
                lambda m: m.group(0).replace("assets/", ASSET_BASE),
                html,
            )

        out_path = GHL_DIR / out_name
        out_path.write_text(html, encoding="utf-8")
        print(f"  wrote {out_path.relative_to(ROOT)}  ({len(html):,} bytes)")

    print("\nDone. Paste each file's contents into the matching GHL custom HTML element.")
    print(f"Asset base URL: {ASSET_BASE}")
    print("Edit ASSET_BASE at the top of this script before re-running if you host assets elsewhere.")

if __name__ == "__main__":
    main()
