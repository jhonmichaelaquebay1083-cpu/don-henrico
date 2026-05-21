# Loading Screen Transition — Design Spec
**Date:** 2026-05-21
**Project:** Don Henrico Resort (static HTML/CSS/JS site)

---

## Overview

A full-screen loading overlay on `index.html` that displays the circular resort logo at center, then transitions out via 7 horizontal bars sliding left in a staggered wave. The logo simultaneously flies from center to its navbar position. Once the animation completes, the hero video begins playing.

---

## Visual Design

| Property | Value |
|---|---|
| Overlay background | `#1a1d24` (matches existing dark navbar) |
| Logo border | `2.5px solid #c9a96e` (gold) |
| Logo text | `DON HENRICO RESORT` |
| Logo text color | `#c9a96e` |
| Logo size | `100px` circle (scales to navbar logo size on fly) |
| Bar color | `#1a1d24` (same as bg — bars are the overlay itself) |
| Bar count | 7 |
| Bar direction | Horizontal (full-width rows), slide LEFT |

---

## Animation Sequence

| Step | Action | Duration |
|---|---|---|
| 1 | Logo fades in at center (opacity 0 → 1) | 0.6s |
| 2 | Logo holds static | 1.2s |
| 3 | 7 bars begin sliding left (CSS keyframes, staggered) | ~1.3s total (0.165s between each bar start) |
| 4 | Logo flies from center → navbar `.logo` position (GSAP) | 0.5s, starts simultaneously with bars |
| 5 | Logo fades out as it arrives at navbar | 0.2s |
| 6 | Overlay removed from DOM | immediate |
| 7 | Hero `<video>` `.play()` called | immediate after step 6 |

**Total perceived duration:** ~2.8s

---

## Implementation

### `index.html` changes

1. Add `#loader` overlay as first child of `<body>`:

```html
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

2. Remove `autoplay` attribute from the hero `<video>` element. Keep `muted`, `loop`, `playsinline`.

---

### `style.css` additions

```css
/* Loader overlay */
#loader {
  position: fixed; inset: 0; z-index: 9999;
  background: #1a1d24;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}

/* Circular logo at center */
#loader-logo {
  width: 100px; height: 100px;
  border-radius: 50%;
  border: 2.5px solid #c9a96e;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
  font-size: 10px; font-weight: 800;
  letter-spacing: 1px; text-align: center; line-height: 1.3;
  color: #c9a96e;
  opacity: 0; /* GSAP fades this in */
  position: relative; z-index: 2;
}

/* 7-bar container — covers full overlay */
#loader-bars {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  z-index: 1;
}

.bar {
  flex: 1;
  background: #1a1d24;
  transform: translateX(0);
}

/* Bar slide-left keyframes — each bar gets its own, stagger via % offsets */
/* Bars animate when #loader has class .animate */
/* offset per bar: 3% of total 100% = ~0.165s at 5.5s duration */
/* Each bar slides over 15% of duration ≈ 0.82s */

#loader.animate .bar:nth-child(1) { animation: bar-left 5.5s cubic-bezier(.65,0,.35,1) forwards; }
#loader.animate .bar:nth-child(2) { animation: bar-left 5.5s cubic-bezier(.65,0,.35,1) forwards 0.165s; }
#loader.animate .bar:nth-child(3) { animation: bar-left 5.5s cubic-bezier(.65,0,.35,1) forwards 0.33s; }
#loader.animate .bar:nth-child(4) { animation: bar-left 5.5s cubic-bezier(.65,0,.35,1) forwards 0.495s; }
#loader.animate .bar:nth-child(5) { animation: bar-left 5.5s cubic-bezier(.65,0,.35,1) forwards 0.66s; }
#loader.animate .bar:nth-child(6) { animation: bar-left 5.5s cubic-bezier(.65,0,.35,1) forwards 0.825s; }
#loader.animate .bar:nth-child(7) { animation: bar-left 5.5s cubic-bezier(.65,0,.35,1) forwards 0.99s; }

@keyframes bar-left {
  0%   { transform: translateX(0); }
  20%, 100% { transform: translateX(-100%); }
}
```

> **Note on bar approach:** Using `animation-delay` on a `forwards` animation (not `infinite`) means the delay truly staggers the start — cleaner than baking delays into keyframe percentages.

---

### `script.js` additions

```js
(function () {
  const loader    = document.getElementById('loader');
  if (!loader) return; // only runs on index.html

  const loaderLogo = document.getElementById('loader-logo');
  const navLogo    = document.querySelector('.navbar .logo');
  const video      = document.querySelector('.hero-bg video');

  const tl = gsap.timeline();

  // Step 1: fade logo in
  tl.to(loaderLogo, { opacity: 1, duration: 0.6, ease: 'power2.out' })

  // Step 2: hold
    .to(loaderLogo, { duration: 1.2 })

  // Step 3: trigger bars (CSS animation via class)
    .add(() => { loader.classList.add('animate'); })

  // Step 4: fly logo to navbar position
    // navLogo is a text <a> element — we translate the circle to its position
    // and scale uniformly (not to match bounding rect) to avoid distorting the circle.
    // Scale 0.22 → 100px circle becomes ~22px, matching rough navbar logo height.
    .add(() => {
      const from = loaderLogo.getBoundingClientRect();
      const to   = navLogo.getBoundingClientRect();
      const dx = (to.left + to.width  / 2) - (from.left + from.width  / 2);
      const dy = (to.top  + to.height / 2) - (from.top  + from.height / 2);
      gsap.to(loaderLogo, {
        x: dx, y: dy,
        scale: 0.22,
        duration: 0.5,
        ease: 'power3.inOut',
        onComplete() {
          gsap.to(loaderLogo, { opacity: 0, duration: 0.2 });
        }
      });
    })

  // Step 5: remove overlay + play video after last bar finishes
    .to({}, { duration: 1.5 }) // wait for bars + logo fade
    .add(() => {
      loader.style.display = 'none';
      if (video) video.play();
    });
})();
```

---

## Scope

- Runs on `index.html` only — guarded by `if (!loader) return`
- No changes to `services.html` or `about.html`
- No dependencies added — GSAP already loaded via CDN

---

## Out of Scope

- Logo image asset — placeholder text used until real circular logo is provided; swap `#loader-logo` content then
- Reduced-motion / `prefers-reduced-motion` — can be added later
