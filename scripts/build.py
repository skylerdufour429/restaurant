#!/usr/bin/env python3
"""Validate the archive metadata and summarize app inventory."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APPS_PATH = ROOT / "apps.json"


def main() -> int:
    apps = json.loads(APPS_PATH.read_text(encoding="utf-8"))
    total_size = sum(float(app.get("binarySizeMb", 0)) for app in apps)

    for app in apps:
        path = ROOT / app["download"]
        if not path.exists():
            print(f"Missing archive: {path}")

    print(f"Apps: {len(apps)}")
    print(f"Total size: {total_size:.1f} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
