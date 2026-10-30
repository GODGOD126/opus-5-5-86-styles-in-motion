"""Read and verify locally curated styles without altering the original atlas."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def inside(base, relative):
    path = (base / relative).resolve()
    if not path.is_relative_to(base.resolve()):
        raise ValueError(f'Path escapes resource directory: {relative}')
    return path


def records():
    data = json.loads((ROOT / 'references/custom-style-index.json').read_text(encoding='utf-8'))
    ids = [r['id'] for r in data]
    if len(ids) != len(set(ids)) or any(i <= 86 for i in ids):
        raise ValueError('Custom style IDs must be unique and greater than 86')
    for record in data:
        base = inside(ROOT / 'assets/custom', Path(record['folder']).relative_to('assets/custom'))
        for field in ('poster', 'explainer', 'styleClip', 'sourceEntry'):
            if not inside(base, record[field]).is_file():
                raise ValueError(f'Missing custom resource: {record["id"]} / {field}')
        if not inside(ROOT, record['guide']).is_file():
            raise ValueError(f'Missing custom style guide: {record["id"]}')
        variants = record.get('variants', [])
        variant_ids = [v['id'] for v in variants]
        if len(variant_ids) != len(set(variant_ids)):
            raise ValueError(f'Duplicate variants: {record["id"]}')
        for variant in variants:
            if variant['videoField'] not in ('explainer', 'styleClip'):
                raise ValueError('Invalid variant video field')
            for field in ('poster', 'sourceEntry'):
                if not inside(base, variant[field]).is_file():
                    raise ValueError(f'Missing variant resource: {record["id"]} / {field}')
        if record.get('videoLabels') and set(record['videoLabels']) != {'explainer', 'styleClip'}:
            raise ValueError('Both video labels are required')
    return data


def verify(data):
    errors, checked = [], 0
    for record in data:
        base = inside(ROOT, record['folder'])
        try:
            manifest = json.loads((base / 'manifest.json').read_text(encoding='utf-8'))
            entries = manifest['files']
            required = {record[k] for k in ('poster', 'explainer', 'styleClip', 'sourceEntry')}
            if not required.issubset(entries):
                errors.append(f'Incomplete manifest: {record["id"]}')
            actual = {p.relative_to(base).as_posix() for p in base.rglob('*') if p.is_file() and p.name != 'manifest.json'}
            if actual != set(entries):
                errors.append(f'Manifest inventory mismatch: {record["id"]}')
            for relative, expected in entries.items():
                path = inside(base, relative)
                digest = hashlib.sha256()
                with path.open('rb') as stream:
                    for block in iter(lambda: stream.read(1024 * 1024), b''):
                        digest.update(block)
                if digest.hexdigest() != expected:
                    errors.append(f'Hash mismatch: {relative}')
                checked += 1
        except (OSError, ValueError, KeyError) as exc:
            errors.append(f'Custom style {record["id"]}: {exc}')
    print(json.dumps({'customStyles': len(data), 'hashedFiles': checked,
                      'passed': not errors, 'errors': errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0
