"""Export the self-contained large-image style gallery to a new directory."""
import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def export(destination, update=False):
    records = json.loads((ROOT / 'references/style-index.json').read_text(encoding='utf-8'))
    if len(records) != 86 or {r['id'] for r in records} != set(range(1, 87)):
        raise ValueError('Expected all 86 unique styles')
    labels = json.loads((ROOT / 'references/gallery-zh.json').read_text(encoding='utf-8'))
    if len(labels['names']) != 86:
        raise ValueError('Expected 86 Chinese names')
    template = (ROOT / 'assets/gallery.template.html').read_text(encoding='utf-8')
    if template.count('__STYLE_DATA__') != 1:
        raise ValueError('Invalid gallery template')
    atlas = (ROOT / 'assets/atlas').resolve()
    sources = []
    data = []
    for record in records:
        source = (atlas / record['folder'] / 'poster.jpg').resolve()
        if not source.is_relative_to(atlas) or not source.is_file():
            raise ValueError(f'Missing or invalid poster: {record["id"]}')
        relative = f'posters/{record["id"]:03d}.jpg'
        sources.append((source, relative))
        data.append({k: record[k] for k in ('id', 'name', 'family', 'description')})
        data[-1]['image'] = relative
        data[-1]['nameZh'] = labels['names'][record['id'] - 1]
        data[-1]['familyZh'] = labels['families'][record['family']]
        for key, filename in [('explainer', 'explainer.mp4'), ('styleClip', 'style-clip.mp4')]:
            video = (atlas / record['folder'] / filename).resolve()
            if not video.is_relative_to(atlas) or not video.is_file():
                raise ValueError(f'Missing or invalid video: {record["id"]}')
            relative = f'videos/{record["id"]:03d}-{filename}'
            sources.append((video, relative))
            data[-1][key] = relative
    payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
    # Updating is explicit and restricted to an existing gallery generated here.
    if destination.exists():
        if not update:
            raise FileExistsError(f'Destination exists: {destination}')
        existing = (destination / 'index.html').read_text(encoding='utf-8')
        if '<script id="style-data" type="application/json">' not in existing or not any(brand in existing for brand in ('Claude Opus 5.5 New', 'Opus 5.5 — 86 Styles in Motion')):
            raise ValueError('Refusing to update an unrelated directory')
    destination.mkdir(parents=True, exist_ok=True)
    (destination / 'posters').mkdir(exist_ok=True)
    (destination / 'videos').mkdir(exist_ok=True)
    for source, relative in sources:
        target = destination / relative
        if not target.resolve().is_relative_to(destination.resolve()):
            raise ValueError('Destination asset escapes gallery directory')
        shutil.copy2(source, target)
    (destination / 'index.html').write_text(template.replace('__STYLE_DATA__', payload), encoding='utf-8')
    return destination / 'index.html'


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--update', action='store_true', help='Update only a previously generated gallery')
    args = parser.parse_args()
    try:
        output = export(args.output.resolve(), args.update)
    except (ValueError, OSError) as exc:
        parser.exit(1, f'Gallery export failed: {exc}\n')
    print(output)


if __name__ == '__main__':
    main()
