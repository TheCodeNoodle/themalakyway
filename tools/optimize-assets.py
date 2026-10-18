"""Losslessly pack exported pixel SVG paths. Run from any directory."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / 'dist'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
PIXEL = re.compile(r'M(\d+) (\d+)h1v1h-1z')
saved = 0
for file in ROOT.rglob('*.svg'):
    original = file.read_bytes()
    root = ET.fromstring(original)
    changed = False
    for element in root:
        d = element.get('d', '')
        pixels = list(PIXEL.finditer(d))
        if not pixels or ''.join(m[0] for m in pixels) != d:
            continue
        points = {(int(m[1]), int(m[2])) for m in pixels}
        rows = {}
        for x, y in points:
            rows.setdefault(y, []).append(x)
        packed, verified = [], set()
        for y, xs in sorted(rows.items()):
            xs.sort()
            start = end = xs[0]
            for x in xs[1:] + [None]:
                if x == end + 1:
                    end = x
                    continue
                packed.append(f'M{start} {y}h{end-start+1}v1H{start}z')
                verified.update((px, y) for px in range(start, end + 1))
                start = end = x
        assert verified == points, file
        element.set('d', ''.join(packed))
        changed = True
    if changed:
        result = ET.tostring(root, encoding='utf-8')
        if len(result) < len(original):
            file.write_bytes(result)
            saved += len(original) - len(result)
            print(f'{file.relative_to(ROOT)}: {len(original)} -> {len(result)} bytes; pixels verified')
print(f'Total SVG bytes saved: {saved}')
