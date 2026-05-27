import xml.etree.ElementTree as ET

ET.register_namespace('', 'http://www.w3.org/2000/svg')
tree = ET.parse('assets/logo.svg')
root = tree.getroot()

tags = {}
for elem in root.iter():
    tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
    tags[tag] = tags.get(tag, 0) + 1

print("=== Element counts ===")
for k, v in sorted(tags.items()):
    print(f"  {k}: {v}")

print("\n=== Top-level children ===")
for i, child in enumerate(root):
    tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
    attrs = dict(child.attrib)
    # Truncate long attrs
    for k in attrs:
        if len(str(attrs[k])) > 60:
            attrs[k] = str(attrs[k])[:60] + "..."
    print(f"  [{i}] <{tag}> {attrs}")

print("\n=== All paths ===")
for i, p in enumerate(root.iter('{http://www.w3.org/2000/svg}path')):
    d = p.attrib.get('d', '')[:50]
    fill = p.attrib.get('fill')
    stroke = p.attrib.get('stroke')
    cls = p.attrib.get('class')
    print(f"  Path {i}: fill={fill} stroke={stroke} class={cls} d={d}...")

print("\n=== All images ===")
for i, img in enumerate(root.iter('{http://www.w3.org/2000/svg}image')):
    w = img.attrib.get('width')
    h = img.attrib.get('height')
    href = img.attrib.get('{http://www.w3.org/1999/xlink}href', 'N/A')[:50]
    print(f"  Image {i}: w={w} h={h} href={href}...")

print("\n=== All circles ===")
for i, c in enumerate(root.iter('{http://www.w3.org/2000/svg}circle')):
    print(f"  Circle {i}: {c.attrib}")

print("\n=== All rects ===")
for i, r in enumerate(root.iter('{http://www.w3.org/2000/svg}rect')):
    print(f"  Rect {i}: {r.attrib}")

print("\n=== Groups with mask/clip ===")
for g in root.iter('{http://www.w3.org/2000/svg}g'):
    if 'mask' in g.attrib or 'clip-path' in g.attrib:
        print(f"  Group: {g.attrib}")

print("\n=== Style elements ===")
for s in root.iter('{http://www.w3.org/2000/svg}style'):
    print(f"  Style content: {s.text[:200] if s.text else 'EMPTY'}")
