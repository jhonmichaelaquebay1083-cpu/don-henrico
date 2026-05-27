import xml.etree.ElementTree as ET

ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
ET.register_namespace('c2pa', 'http://c2pa.org/manifest')

tree = ET.parse('assets/logo.svg')
root = tree.getroot()

for style in root.iter('{http://www.w3.org/2000/svg}style'):
    style.text = """
/* ===== SEQUENCE =====
   0.0s  Black ring slowly fades in (while borders draw)
   0.2s  Border circles outline-draw
   1.2s  Text outline-draw & outer blackline draw
   3.2s  Text fills white
   3.4s  Human photo fades in
   ===================== */

/* Border outline draw */
.svg-border {
    fill: transparent;
    stroke: #c9a96e;
    stroke-width: 6;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: dh-draw-border 1.4s cubic-bezier(.4,0,.2,1) 0.2s forwards;
}

/* Text outline draw then fill */
.svg-text {
    fill: transparent;
    stroke: #ffffff;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 800;
    stroke-dashoffset: 800;
    animation:
        dh-draw-text 2.0s cubic-bezier(.4,0,.2,1) 1.2s forwards,
        dh-fill-text 0.7s ease-out 3.2s forwards;
}

/* New outer blackline draw */
.svg-outer-blackline {
    fill: transparent;
    stroke: #0a0a0a;
    stroke-width: 6;
    stroke-dasharray: 4800;
    stroke-dashoffset: 4800;
    animation: dh-draw-text 2.0s cubic-bezier(.4,0,.2,1) 1.2s forwards;
}

/* Black ring + white center: smooth, long fade in */
.svg-ring {
    opacity: 0;
    animation: dh-fade-in 2.6s ease-in-out 0s forwards;
}

/* Human photo: fade in after text fills */
.svg-photo {
    opacity: 0;
    animation: dh-fade-in 1.5s ease 3.4s forwards;
}

@keyframes dh-draw-border  { to { stroke-dashoffset: 0; } }
@keyframes dh-draw-text    { to { stroke-dashoffset: 0; } }
@keyframes dh-fill-text    { to { fill: #ffffff; } }
@keyframes dh-fade-in      { to { opacity: 1; } }
"""
    print("Updated style!")

# Add the new outer black circle
outer_circle = ET.Element('{http://www.w3.org/2000/svg}circle', {
    'cx': '750.1',
    'cy': '750.1',
    'r': '742',
    'class': 'svg-outer-blackline'
})
root.append(outer_circle)

# Save the final modified SVG
tree.write('assets/logo.svg', encoding='utf-8', xml_declaration=False)
print("Done! SVG successfully updated.")
