# Don Henrico — GHL HTML Embeds

Self-contained HTML files ready to paste into a GoHighLevel **Custom HTML / Code** element. One file per page.

| Source page    | GHL embed file        |
|----------------|-----------------------|
| `index.html`   | `ghl/home.html`       |
| `services.html`| `ghl/services.html`   |
| `about.html`   | `ghl/about.html`      |

Each file inlines `style.css` and `script.js` and keeps the CDN scripts (GSAP, Google Fonts, GHL form embed) loading from their original URLs.

---

## How to use

1. Open the GHL funnel/page builder for the matching page.
2. Add a **Custom HTML / Code** element (or use the "Source Code" view of a Rich Text element if your plan doesn't expose Custom HTML).
3. Open the matching file from this folder (e.g. `home.html`), copy the entire contents, and paste them into the custom code box.
4. Save / publish the page.

> If the GHL element complains about `<!DOCTYPE>` / `<html>` / `<head>` / `<body>` tags, strip those wrapper tags and paste only the inner content. Everything important is between `<body>...</body>`.

---

## Hosting the assets

The HTML refers to images and videos via `assets/...` relative paths:
- `assets/leaf-left.png`, `assets/leaf-right.png`
- `assets/gcash-qr.png`
- `assets/video.mp4`, `assets/Group 12.png`, gallery photos, etc.

You have two options:

**Option A — Upload to GHL media library**
1. Upload everything from this project's `assets/` folder into the GHL Media Library.
2. Copy the public URL of each asset.
3. Open `build-ghl.py`, set `ASSET_BASE = "https://your-ghl-media-url/"` (with trailing slash), and re-run the script. All `assets/...` paths get rewritten to absolute URLs.

**Option B — Host the `assets/` folder yourself**
- GitHub Pages, Netlify, Cloudflare R2, etc. all work.
- Set `ASSET_BASE` to the public folder URL, e.g. `https://yourcdn.com/donhenrico/assets/`.
- Re-run `build-ghl.py`.

---

## Rebuilding after changes

Whenever you edit `style.css`, `script.js`, or any HTML page, re-run:

```bash
python ghl/build-ghl.py
```

The 3 GHL files regenerate from the current source.

---

## Per-page notes

### `home.html`
- Includes the loading screen overlay (panels split, logo halves slide off).
- Hero video autoplay is triggered by JS after the loader finishes.

### `services.html`
- Loads the GHL form embed helper (`https://link.msgsndr.com/js/form_embed.js`) so the embedded inquiry form auto-resizes.
- The service modal has 4 views: details → form (GHL iframe) → payment (GCash QR) → thanks.

### `about.html`
- Lightest of the three. Standard sections + parallax leaves.
