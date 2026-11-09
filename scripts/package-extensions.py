#!/usr/bin/env python3
"""Pack src/extension into Chrome, Edge, and Firefox zip files."""
from __future__ import annotations

import json
import shutil
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "extension"
OUT = ROOT / "dist"
BROWSERS = ("chrome", "edge", "firefox")
MANIFEST_NAMES = {f"manifest.{browser}.json" for browser in BROWSERS}


def copy_shared(dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    for path in SRC.rglob("*"):
        if not path.is_file():
            continue
        if path.name.startswith("manifest") and path.suffix == ".json":
            continue
        rel = path.relative_to(SRC)
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)


def zip_dir(src: Path, zip_path: Path) -> None:
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(src.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(src).as_posix())


def load_manifest(browser: str) -> dict:
    path = SRC / f"manifest.{browser}.json"
    if not path.is_file():
        raise SystemExit(f"missing {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    chrome_manifest = load_manifest("chrome")
    edge_manifest = load_manifest("edge")
    firefox_manifest = load_manifest("firefox")
    if "browser_specific_settings" in chrome_manifest:
        raise SystemExit("Chrome manifest must not include gecko settings")
    if "browser_specific_settings" in edge_manifest:
        raise SystemExit("Edge manifest must not include gecko settings")
    if "gecko" not in firefox_manifest.get("browser_specific_settings", {}):
        raise SystemExit("Firefox manifest must include gecko id")

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("itab-extension-*.zip"):
        old.unlink()

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for browser in BROWSERS:
            dest = tmp_path / browser
            copy_shared(dest)
            shutil.copy2(SRC / f"manifest.{browser}.json", dest / "manifest.json")
            zip_dir(dest, OUT / f"itab-extension-{browser}.zip")

    print("Packed:")
    for browser in BROWSERS:
        path = OUT / f"itab-extension-{browser}.zip"
        print(f"  {path} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
