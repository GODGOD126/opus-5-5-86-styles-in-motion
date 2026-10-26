"""Locate or verify the bundled 86-style atlas; never execute reference code."""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ATLAS = ROOT / "assets" / "atlas"


def inside(base, relative):
    path = (base / relative).resolve()
    if not path.is_relative_to(base.resolve()):
        raise ValueError(f"Path escapes resource directory: {relative}")
    return path


def verify(records):
    errors = []
    checked = 0
    if len(records) != 86 or {r["id"] for r in records} != set(range(1, 87)):
        errors.append("Expected unique style IDs 1..86")
    for record in records:
        folder = inside(ATLAS, record["folder"])
        try:
            detail = json.loads((folder / "style.json").read_text(encoding="utf-8"))
            if detail["id"] != record["id"] or detail["name"] != record["name"]:
                errors.append(f"Metadata mismatch: {record['id']}")
            entries = [(detail["prompt"]["file"], detail["prompt"]["sha256"])]
            entries += [(v["path"], v["sha256"]) for v in detail["codeBlocks"]]
            entries += [(detail["media"][k]["file"], detail["media"][k]["sha256"])
                        for k in ("explainer", "styleClip", "poster")]
            if len(detail["codeBlocks"]) != 3:
                errors.append(f"Expected three code blocks: {record['id']}")
            for relative, expected in entries:
                path = inside(folder, relative)
                digest = hashlib.sha256()
                with path.open("rb") as source:
                    for chunk in iter(lambda: source.read(1024 * 1024), b""):
                        digest.update(chunk)
                if digest.hexdigest() != expected:
                    errors.append(f"Hash mismatch: {path}")
                checked += 1
        except (KeyError, OSError, ValueError) as exc:
            errors.append(f"Style {record.get('id')}: {exc}")
    print(json.dumps({"styles": len(records), "hashedFiles": checked,
                      "passed": not errors, "errors": errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--list", action="store_true")
    group.add_argument("--id", type=int)
    group.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    records = json.loads((ROOT / "references" / "style-index.json").read_text(encoding="utf-8"))
    if args.verify:
        return verify(records)
    if args.list:
        for record in records:
            print(f"{record['id']:02d}\t{record['name']}\t{record['family']}")
        return 0
    match = next((r for r in records if r["id"] == args.id), None)
    if match is None:
        parser.error(f"Unknown style ID: {args.id}; use 1..86")
    folder = inside(ATLAS, match["folder"])
    detail = json.loads((folder / "style.json").read_text(encoding="utf-8"))
    print(json.dumps({"directory": str(folder), "style": detail}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
