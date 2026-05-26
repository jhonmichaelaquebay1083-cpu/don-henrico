#!/usr/bin/env python3
"""Extract just the vector content from assets/logo.svg for the loader animation.

The full SVG is 945KB — mostly 6 embedded raster bitmaps + a 23KB Canva-AI
C2PA manifest. The actual vector content (44 paths forming the border and
text glyphs) is only ~40KB.

This script:
  1. Reads assets/logo.svg
  2. Strips the <metadata> (C2PA manifest)
  3. Strips all <image> tags (embedded base64 rasters)
  4. Tags the first 2 paths as .svg-border (the rectangular frame)
     and the rest as .svg-text (letter glyph outlines)
  5. Saves the cleaned, class-tagged version to assets/logo-loader.svg

The loader then inlines / uses this stripped SVG, so CSS can target
.svg-border and .svg-text with stroke-dasharray animations.
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "logo.svg"
OUT = ROOT / "assets" / "logo-loader.svg"

def main():
    s = SRC.read_text(encoding="utf-8")
    print(f"Source: {len(s):,} bytes")

    # 1. Strip <metadata>...</metadata> (C2PA manifest)
    s = re.sub(r'<metadata>.*?</metadata>', '', s, flags=re.DOTALL)

    # 2. Strip all <image .../> tags (embedded base64 rasters).
    # The base64 payload can be huge, so use a generous DOTALL match that
    # accepts any content inside the attributes (including newlines + slashes).
    s = re.sub(r'<image\b[\s\S]*?/>', '', s)
    s = re.sub(r'<image\b[\s\S]*?</image>', '', s)

    # 3. Tag paths with classes — first 2 are the border frame, rest are text
    path_count = [0]
    def tag_path(m):
        i = path_count[0]
        path_count[0] += 1
        cls = "svg-border" if i < 2 else "svg-text"
        tag = m.group(0)
        # Inject class attribute (or merge if one already exists)
        if 'class="' in tag:
            tag = re.sub(r'class="([^"]*)"', lambda mm: f'class="{mm.group(1)} {cls}"', tag)
        else:
            tag = tag.replace('<path', f'<path class="{cls}"', 1)
        return tag
    s = re.sub(r'<path\b[^>]*>', tag_path, s)

    # 3b. The 2 "border" paths in the original Canva export are inside
    #     <clipPath> defs and never render directly. Inject a VISIBLE
    #     rect at the same coords so .svg-border has something to stroke.
    visible_border = (
        '<rect class="svg-border" x="327.5" y="327.5" '
        'width="845" height="845" fill="transparent" stroke="#c9a96e" stroke-width="6"/>'
    )

    # 4. Inject a <style> block right after the opening <svg> tag with the
    #    stroke-draw + fill animation. Borders draw first, then text outlines,
    #    then text fills in. All animations start automatically on SVG load.
    style_block = """<style>
        .svg-border {
            fill: transparent;
            stroke: #c9a96e;
            stroke-width: 6;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 5000;
            stroke-dashoffset: 5000;
            animation: dh-draw-border 1.4s cubic-bezier(.4,0,.2,1) 0.2s forwards;
        }
        .svg-text {
            fill: transparent;
            stroke: #c9a96e;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 800;
            stroke-dashoffset: 800;
            animation:
                dh-draw-text 1.4s cubic-bezier(.4,0,.2,1) 1.5s forwards,
                dh-fill-text 0.7s ease-out 2.7s forwards;
        }
        @keyframes dh-draw-border { to { stroke-dashoffset: 0; } }
        @keyframes dh-draw-text   { to { stroke-dashoffset: 0; } }
        @keyframes dh-fill-text   { to { fill: #c9a96e; } }
    </style>"""
    s = re.sub(r'(<svg\b[^>]*>)', r'\1' + style_block + visible_border, s, count=1)

    # 5. Collapse extra whitespace
    s = re.sub(r'\n\s*\n', '\n', s)

    OUT.write_text(s, encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}  ({len(s):,} bytes)")
    print(f"  -> {path_count[0]} paths tagged ({min(2, path_count[0])} border, {max(0, path_count[0]-2)} text)")

if __name__ == "__main__":
    main()
