# Loading Screen Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen loading overlay to `index.html` that displays the circular resort logo, then transitions out with 7 horizontal bars sliding left while the logo flies to the navbar — hero video only plays after the transition completes.

**Architecture:** A fixed `#loader` div (highest z-index) sits on top of everything on page load. A GSAP timeline controls sequencing: logo fade-in → hold → trigger CSS bar animations → logo flies to navbar → overlay hidden → video plays. The 7 bars use CSS `animation-delay` (not JS) for the stagger, which is more performant.

**Tech Stack:** Plain HTML/CSS, GSAP 3 (already loaded via CDN in `index.html`)

---

## File Map

| File | Change |
|---|---|
| `index.html` | Add `#loader` div (first child of `<body>`). Remove `autoplay` from `<video>`. |
| `style.css` | Add `#loader`, `#loader-logo`, `#loader-bars`, `.bar`, and `@keyframes bar-left` rules. |
| `script.js` | Add loader GSAP timeline at top of `DOMContentLoaded` callback (before other animations). |

---

## Task 1: Add loader HTML to `index.html`

**Files:**
- Modify: `index.html:20` (first child of `<body>`)
- Modify: `index.html:56` (video element — remove `autoplay`)

- [ ] **Step 1: Add `#loader` as first child of `<body>`**

Open `index.html`. Directly after the opening `<body>` tag (line 20), insert:

```html
<!-- ═══ LOADING SCREEN ═══ -->
<div id="loader">
    <div id="loader-logo">DON<br>HENRICO<br>RESORT</div>
    <div id="loader-bars">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
    </div>
</div>
```

- [ ] **Step 2: Remove `autoplay` from the hero video**

Find this line in `index.html` (around line 56 after the above insertion):

```html
<video autoplay muted loop playsinline>
```

Change it to:

```html
<video muted loop playsinline>
```

- [ ] **Step 3: Verify structure in browser**

Open `index.html` in a browser. The page should show a blank dark screen (the loader is covering everything). The hero video should NOT autoplay. If you see the site content immediately, `#loader` is missing or not styled yet — that's fine for now, proceed to Task 2.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add loader overlay HTML, remove video autoplay"
```

---

## Task 2: Add loader CSS to `style.css`

**Files:**
- Modify: `style.css` (append at end of file)

- [ ] **Step 1: Append loader styles**

Open `style.css` and add the following block at the very end of the file:

```css
/* ══════════════════════════════════
   LOADING SCREEN
   ══════════════════════════════════ */

#loader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #1a1d24;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

#loader-logo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2.5px solid #c9a96e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    text-align: center;
    line-height: 1.4;
    color: #c9a96e;
    opacity: 0;
    position: relative;
    z-index: 2;
}

#loader-bars {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    z-index: 1;
}

.bar {
    flex: 1;
    background: #1a1d24;
}

/* Bars slide left when #loader has class .animate.
   animation-delay truly staggers one-shot (forwards) animations. */
#loader.animate .bar:nth-child(1) { animation: bar-left 0.7s cubic-bezier(.65,0,.35,1) forwards 0s; }
#loader.animate .bar:nth-child(2) { animation: bar-left 0.7s cubic-bezier(.65,0,.35,1) forwards 0.165s; }
#loader.animate .bar:nth-child(3) { animation: bar-left 0.7s cubic-bezier(.65,0,.35,1) forwards 0.33s; }
#loader.animate .bar:nth-child(4) { animation: bar-left 0.7s cubic-bezier(.65,0,.35,1) forwards 0.495s; }
#loader.animate .bar:nth-child(5) { animation: bar-left 0.7s cubic-bezier(.65,0,.35,1) forwards 0.66s; }
#loader.animate .bar:nth-child(6) { animation: bar-left 0.7s cubic-bezier(.65,0,.35,1) forwards 0.825s; }
#loader.animate .bar:nth-child(7) { animation: bar-left 0.7s cubic-bezier(.65,0,.35,1) forwards 0.99s; }

@keyframes bar-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-100%); }
}
```

- [ ] **Step 2: Verify overlay in browser**

Hard-refresh `index.html`. You should now see a solid dark `#1a1d24` full-screen overlay covering the page. The site content underneath is hidden. The `#loader-logo` is invisible (opacity 0 — GSAP will fade it in).

- [ ] **Step 3: Quick-test bar animation manually**

In the browser DevTools console, run:

```js
document.getElementById('loader').classList.add('animate');
```

You should see 7 horizontal bars slide left in a top-to-bottom staggered wave over ~1.1s total. If all 7 bars slide at exactly the same time, the `animation-delay` is not applying — double-check the CSS selectors use `#loader-bars .bar` vs `.bar` (the `.bar` selector must only match bars inside `#loader-bars`, which it does since `.bar` is only used there).

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: add loader overlay and 7-bar slide-left CSS"
```

---

## Task 3: Add GSAP timeline to `script.js`

**Files:**
- Modify: `script.js` (top of `DOMContentLoaded` callback)

- [ ] **Step 1: Add the loader timeline**

Open `script.js`. Inside `document.addEventListener("DOMContentLoaded", () => {`, add the following block as the **first thing** inside the callback (before the hamburger setup and any other animations):

```js
// ─── 0. Loading Screen ───
(function () {
    const loader     = document.getElementById('loader');
    if (!loader) return; // guard: only runs on index.html

    const loaderLogo = document.getElementById('loader-logo');
    const navLogo    = document.querySelector('.navbar .logo');
    const video      = document.querySelector('.hero-bg video');

    const tl = gsap.timeline();

    // Fade logo in
    tl.to(loaderLogo, { opacity: 1, duration: 0.6, ease: 'power2.out' })

    // Hold
      .to(loaderLogo, { duration: 1.2 })

    // Trigger bar CSS animations + start logo fly simultaneously
      .add(function () {
          loader.classList.add('animate');

          // Compute positions at runtime so it works on all screen sizes
          const from  = loaderLogo.getBoundingClientRect();
          const to    = navLogo.getBoundingClientRect();
          const dx    = (to.left + to.width  / 2) - (from.left + from.width  / 2);
          const dy    = (to.top  + to.height / 2) - (from.top  + from.height / 2);

          gsap.to(loaderLogo, {
              x: dx,
              y: dy,
              scale: 0.22,          // 100px → ~22px, matching nav logo height
              duration: 0.5,
              ease: 'power3.inOut',
              onComplete: function () {
                  gsap.to(loaderLogo, { opacity: 0, duration: 0.2 });
              }
          });
      })

    // Wait for last bar (bar 7 delay 0.99s + animation 0.7s = 1.69s) + logo fade (0.2s)
    // Use 1.9s to cover both safely
      .to({}, { duration: 1.9 })

    // Remove overlay and play video
      .add(function () {
          loader.style.display = 'none';
          if (video) video.play().catch(function () {}); // .catch silences autoplay policy errors
      });
}());
```

- [ ] **Step 2: Verify the full sequence in browser**

Hard-refresh `index.html`. Expected sequence:

1. Dark overlay appears instantly
2. Circular gold logo fades in at center (~0.6s)
3. Logo holds for ~1.2s
4. 7 horizontal bars slide left in a staggered wave (top-to-bottom, ~1.1s total)
5. Logo simultaneously shrinks and flies to the navbar position (~0.5s)
6. Logo fades out at navbar
7. Overlay disappears — site content is fully visible
8. Hero video begins playing

If the logo fly feels off-center, open DevTools, inspect `#loader-logo` after the animation and check the computed `transform`. The `dx/dy` values from `getBoundingClientRect()` are printed if you add `console.log(dx, dy)` after the dx/dy lines.

- [ ] **Step 3: Test on mobile width**

In DevTools, toggle device emulation to 375px wide (iPhone). Reload. The logo should still fly accurately to the navbar logo position — `getBoundingClientRect()` recalculates at runtime so it adapts automatically.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add GSAP loader timeline — logo fly, bar trigger, video play"
```

---

## Task 4: Final polish and cleanup

**Files:**
- Modify: `.gitignore` (add `.superpowers/`)

- [ ] **Step 1: Add `.superpowers/` to `.gitignore`**

Open `.gitignore` and append:

```
.superpowers/
```

- [ ] **Step 2: Full end-to-end test checklist**

Open `index.html` in a browser with DevTools Network tab open (set throttling to "Fast 3G" to simulate slow load):

- [ ] Overlay appears immediately on load — no flash of site content before animation
- [ ] Logo fades in cleanly (no pop)
- [ ] Bars slide left in a smooth top-to-bottom wave (not all at once)
- [ ] Logo flies to navbar and fades out (does not snap or glitch)
- [ ] Video starts after overlay disappears (check Network tab — video request may start early but playback begins post-animation)
- [ ] Navigate to `services.html` and `about.html` — no loader appears on those pages
- [ ] Refresh `services.html` directly — no loader

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm artifacts"
```
