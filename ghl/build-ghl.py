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

# ═══════════════════════════════════════════════════════════════════
# ASSET HOSTING OPTIONS — pick ONE:
# ═══════════════════════════════════════════════════════════════════
#
# OPTION A — One base URL for everything
#   Use this if your assets are hosted on a CDN that preserves filenames
#   (GitHub Pages, Cloudflare R2, Netlify, S3 with original names).
#   Set ASSET_BASE to the public folder URL with a trailing slash.
#   Leave ASSET_MAP empty (the default).
#
#   Example: ASSET_BASE = "https://yourcdn.com/donhenrico/assets/"
#
ASSET_BASE = "assets/"
#
# OPTION B — Per-file URL mapping (USE THIS FOR GHL MEDIA LIBRARY)
#   GHL media library renames each upload to a random hash, so a single
#   base URL won't work. Upload each asset to the GHL media library, copy
#   its public URL, and paste it as the value next to the matching filename
#   below. Any unmapped filenames will fall back to ASSET_BASE.
#
ASSET_MAP = {
    # Logo/decorative
    "assets/leaf-left.png":   "",
    "assets/leaf-right.png":  "",
    "assets/gcash-qr.png":    "",

    # Home page
    "assets/video.mp4":       "",
    "assets/Group 12.png":    "",
    "assets/bday.jpg":        "",
    "assets/debut.jpg":       "",
    "assets/wedding.jpg":     "",
    "assets/gallery1.jpg":    "",
    "assets/gallery2.jpg":    "",
    "assets/gallery3.jpg":    "",
    "assets/gallery4.jpg":    "",
    "assets/gallery 5.jpg":   "",
    "assets/gallery6.jpg":    "",
    "assets/gallery7.jpg":    "",
    "assets/gallery8.jpg":    "",
    "assets/gallery9.jpg":    "",
    "assets/gallery10.jpg":   "",

    # About page
    "assets/image 6.png":     "",
    "assets/image 2.png":     "",
}

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

        # Rewrite asset paths
        # 1. Per-file map wins — any populated value in ASSET_MAP replaces the
        #    matching path. Filenames with no URL stay as-is (fall through to step 2).
        for original_path, full_url in ASSET_MAP.items():
            if not full_url:
                continue
            html = html.replace(f'"{original_path}"', f'"{full_url}"')

        # 2. Fallback — for anything still using assets/..., swap the prefix to ASSET_BASE.
        if ASSET_BASE != "assets/":
            html = re.sub(
                r'(?P<attr>src|href)="assets/',
                lambda m: f'{m.group("attr")}="{ASSET_BASE}',
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
