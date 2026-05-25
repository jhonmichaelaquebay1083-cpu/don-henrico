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
    "assets/leaf-left.png":   "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a149952e05851175c8067fd.png",
    "assets/leaf-right.png":  "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499537c135509c88772b1.png",
    "assets/gcash-qr.png":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994e1f1059c428fb1a7d.jpg",

    # Home page
    "assets/video.mp4":       "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499534c82f7be921c2bca.mp4",
    "assets/Group 12.png":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994fe05851175c80679d.png",
    "assets/bday.jpg":        "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499487e7c5a2f715a4490.jpg",
    "assets/debut.jpg":       "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499487c135509c88771c5.jpg",
    "assets/wedding.jpg":     "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499533c3aed7c63c1cadc.jpg",
    "assets/gallery1.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994be05851175c806745.jpg",
    "assets/gallery2.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994b3c3aed7c63c1ca4f.jpg",
    "assets/gallery3.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994b9b6d07a704ae3113.jpg",
    "assets/gallery4.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994b4c82f7be921c2b1c.jpg",
    "assets/gallery 5.jpg":   "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499487c135509c88771c6.jpg",
    "assets/gallery6.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994ce05851175c80675b.jpg",
    "assets/gallery7.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994d4c82f7be921c2b38.jpg",
    "assets/gallery8.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994ee05851175c80677b.jpg",
    "assets/gallery9.jpg":    "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994e4c82f7be921c2b58.jpg",
    "assets/gallery10.jpg":   "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a14994b9b6d07a704ae3111.jpg",

    # About page
    "assets/image 6.png":     "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499517c135509c8877286.png",
    "assets/image 2.png":     "https://assets.cdn.filesafe.space/raNrpm2VM5nDQSCKZYNE/media/6a1499507e7c5a2f715a4544.png",
}

PAGES = [
    # (source filename, output filename, optional body wrapper class)
    ("index.html",    "home.html",     ""),
    ("services.html", "services.html", "page-sub"),
    ("about.html",    "about.html",    "page-sub"),
]

# CSS injected at the top of the inlined <style> block. Forces the embed to
# break out of GHL's column container and span the full viewport width.
# Without this, the content sits inside GHL's max-width section and the host
# section's background bleeds through on the left/right.
GHL_BREAKOUT_CSS = """
/* ── GHL full-bleed breakout ── */
.dh-embed-root {
    width: 100vw !important;
    max-width: 100vw !important;
    margin-left: calc(50% - 50vw) !important;
    margin-right: calc(50% - 50vw) !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    position: relative;
    overflow-x: hidden;
}
"""


# JS shim prepended to the inlined script. Body manipulations (class adds for
# scroll-lock, subpage detection) need to target the wrapper, not GHL's <body>.
JS_EMBED_ROOT_PRELUDE = """
// ── dh-embed-root scope shim ──
// Body class manipulations target the wrapper instead of GHL's <body>.
var __dhEmbedRoot = document.querySelector('.dh-embed-root') || document.body;
"""


def scope_js_to_embed_root(js: str) -> str:
    """Redirect document.body references to the embed wrapper."""
    js = re.sub(r'\bdocument\.body\b', '__dhEmbedRoot', js)
    return JS_EMBED_ROOT_PRELUDE + "\n" + js


def scope_css_to_embed_root(css: str) -> str:
    """Rewrite body/html selectors to .dh-embed-root.

    The project's CSS targets <body> directly (background colours, font,
    page-load animation, scroll lock, etc). Pasted into GHL, those rules
    leak onto GHL's own <body> and repaint the host page — most visibly,
    `body { background: #fff }` makes the area around the embed white.

    This rewrites every body/html selector so it only matches our wrapper
    instead of GHL's <body>.
    """
    # 1. Compound selectors first: "html, body" or "body, html" → ".dh-embed-root"
    css = re.sub(r'\bhtml\s*,\s*body\b', '.dh-embed-root', css)
    css = re.sub(r'\bbody\s*,\s*html\b', '.dh-embed-root', css)
    # 2. Standalone "body" with word boundaries → ".dh-embed-root"
    #    Negative lookbehind avoids matching inside class names / attributes.
    css = re.sub(r'(?<![\w.\-#])body(?![\w-])', '.dh-embed-root', css)
    # 3. Standalone "html" → ".dh-embed-root" (rare, but match for safety)
    css = re.sub(r'(?<![\w.\-#])html(?![\w-])', '.dh-embed-root', css)
    return css


def strip_document_wrapper(html: str, body_class: str) -> str:
    """Strip <!DOCTYPE>, <html>, <head>, <body> tags.

    GHL custom HTML elements live inside their own page, so duplicate
    document wrappers cause conflicts. We keep everything that was inside
    <head> AND <body>, concatenated, and (for sub-pages) wrap the body in
    a <div> with the original body class so the .page-sub CSS still scopes
    correctly.
    """
    # 1. Drop the doctype.
    html = re.sub(r'<!DOCTYPE[^>]*>\s*', '', html, flags=re.IGNORECASE)

    # 2. Pull out everything between <head>...</head>.
    head_match = re.search(r'<head[^>]*>(.*?)</head>', html, flags=re.DOTALL | re.IGNORECASE)
    head = head_match.group(1) if head_match else ''

    # 3. Pull out everything between <body>...</body>.
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, flags=re.DOTALL | re.IGNORECASE)
    body = body_match.group(1) if body_match else ''

    # 4. Strip head contents that GHL provides on its own page and
    #    that can collide with the host doc.
    head = re.sub(r'<meta\s+charset[^>]*>\s*', '', head, flags=re.IGNORECASE)
    head = re.sub(r'<meta\s+name="viewport"[^>]*>\s*', '', head, flags=re.IGNORECASE)
    head = re.sub(r'<meta\s+name="description"[^>]*>\s*', '', head, flags=re.IGNORECASE)
    head = re.sub(r'<title>.*?</title>\s*', '', head, flags=re.IGNORECASE | re.DOTALL)

    # 5. Wrap body in .dh-embed-root so it breaks out of GHL's column.
    #    Combine with any per-page body class (e.g. .page-sub) so class-scoped
    #    CSS still applies even though we lost the <body class="..."> wrapper.
    body = body.strip()
    classes = " ".join(c for c in ("dh-embed-root", body_class) if c)
    body = f'<div class="{classes}">\n{body}\n</div>'

    # 6. Combine: head leftovers (fonts, GSAP, inline <style>) + body content.
    return f'{head.strip()}\n{body}'


def main() -> None:
    css = (ROOT / "style.css").read_text(encoding="utf-8")
    js  = (ROOT / "script.js").read_text(encoding="utf-8")

    # Scope body/html rules so they don't leak onto GHL's own document.
    css = scope_css_to_embed_root(css)

    # Redirect document.body references so JS class manipulations target the
    # embed wrapper (e.g. .no-scroll, .page-sub checks).
    js = scope_js_to_embed_root(js)

    for src_name, out_name, body_class in PAGES:
        html = (ROOT / src_name).read_text(encoding="utf-8")

        # Inline CSS — replace <link rel="stylesheet" href="style.css">
        # (use a lambda so backslashes in the replacement aren't treated as regex backrefs)
        # Prepend the GHL breakout CSS so .dh-embed-root rule is defined.
        css_repl = f"<style>\n{GHL_BREAKOUT_CSS}\n{css}\n</style>"
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

        # 3. Strip document wrappers so the result drops cleanly into GHL.
        html = strip_document_wrapper(html, body_class)

        out_path = GHL_DIR / out_name
        out_path.write_text(html, encoding="utf-8")
        print(f"  wrote {out_path.relative_to(ROOT)}  ({len(html):,} bytes)")

    print("\nDone. Paste each file's contents into the matching GHL custom HTML element.")
    print(f"Asset base URL: {ASSET_BASE}")
    print("Edit ASSET_BASE at the top of this script before re-running if you host assets elsewhere.")

if __name__ == "__main__":
    main()
