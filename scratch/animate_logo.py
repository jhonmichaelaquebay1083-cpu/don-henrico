import xml.etree.ElementTree as ET

# Register namespaces to prevent prefixing issues (like ns0:svg)
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')

ET.register_namespace('c2pa', 'http://c2pa.org/manifest')

# Load the source (loader) and destination (original) SVGs
loader_tree = ET.parse('assets/logo-loader.svg')
loader_root = loader_tree.getroot()

original_tree = ET.parse('assets/logo.svg')
original_root = original_tree.getroot()

# Find the style block in the loader SVG
style_elem = loader_root.find('{http://www.w3.org/2000/svg}style')
if style_elem is not None:
    # Insert it at the very beginning of the original SVG
    original_root.insert(0, style_elem)
    print("Injected style element.")

# Helper to find elements with class in loader and copy them to original
loader_elements = list(loader_root.iter())
original_elements = list(original_root.iter())

print(f"Loader total elements: {len(loader_elements)}")
print(f"Original total elements: {len(original_elements)}")

# We can also map them specifically by matching tags and path definitions to be safe.
# Let's count how many rects and paths we matched.
paths_copied = 0
rects_copied = 0

loader_paths = list(loader_root.iter('{http://www.w3.org/2000/svg}path'))
original_paths = list(original_root.iter('{http://www.w3.org/2000/svg}path'))

for l_path, o_path in zip(loader_paths, original_paths):
    cls = l_path.get('class')
    if cls:
        o_path.set('class', cls)
        paths_copied += 1

loader_rects = list(loader_root.iter('{http://www.w3.org/2000/svg}rect'))
original_rects = list(original_root.iter('{http://www.w3.org/2000/svg}rect'))

for l_rect, o_rect in zip(loader_rects, original_rects):
    cls = l_rect.get('class')
    if cls:
        o_rect.set('class', cls)
        rects_copied += 1

print(f"Copied classes for {paths_copied} paths and {rects_copied} rects.")

# Write the modified original SVG back to logo.svg
original_tree.write('assets/logo.svg', encoding='utf-8', xml_declaration=True)
print("Saved to assets/logo.svg")
