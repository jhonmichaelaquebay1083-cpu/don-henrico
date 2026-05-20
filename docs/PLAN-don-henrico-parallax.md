# PLAN: Don Henrico Resort Immersive Parallax

Implement a premium "Camera Walkthrough" experience using GSAP and ScrollTrigger. The user will start at a closed gate, which opens on scroll, leading to a vertical snapping journey through the resort's key locations.

## User Review Required

> [!IMPORTANT]
> This plan uses **GSAP (GreenSock)** for the animation logic. I will add the necessary CDN scripts to your `index.html`.
> The images used are high-quality AI-generated visuals to ensure a consistent, premium aesthetic for the resort.

## Proposed Changes

### [Core Structure]

#### [MODIFY] [index.html](file:///d:/Don%20Henrico/index.html)
- Add GSAP and ScrollTrigger CDN links.
- Define a full-height container with multiple "Scene" sections.
- Implement the "Gate" as two separate halves (`.gate-left`, `.gate-right`) for the opening animation.
- Add descriptive text overlays for each section.

#### [MODIFY] [style.css](file:///d:/Don%20Henrico/style.css)
- Reset styles and set `overflow-x: hidden`.
- Create the "Gate" layout using absolute positioning and high `z-index`.
- Style the typography with premium fonts (e.g., 'Playfair Display' for headers).
- Define the layout for the background scenes (Building, Pool, Hall) to be full-screen fixed or relative for snapping.

#### [MODIFY] [script.js](file:///d:/Don%20Henrico/script.js)
- Register GSAP ScrollTrigger.
- **Timeline 1**: The Gate Opening. Animate the gate halves sliding out and the camera "zooming in" (scaling the background).
- **Timeline 2**: Vertical Snapping. Configure ScrollTrigger with `snap` to lock onto the Building, Pool, and Hall.
- Add text reveal animations for each stop.

## Visual Assets

The following generated images will be used:
1. **Gate**: `resort_gate_1777978474903.png`
2. **Building**: `resort_building_1777978634646.png`
3. **Pool**: `resort_pool_1777978695247.png`
4. **Hall**: `resort_hall_1777978716443.png`

## Verification Plan

### Automated Tests
- Use `browser_subagent` to verify that the gate opens on initial scroll.
- Verify that scrolling snaps to exactly four sections.

### Manual Verification
- Test smooth transitions between sections.
- Ensure text overlays are readable on all background images.
