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
SKIP_NAMES = {"manifest.firefox.json"}


def copy_src(dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    for path in SRC.rglob("*"):
        if not path.is_file():
            continue
        if path.name in SKIP_NAMES:
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


def main() -> None:
    if not (SRC / "manifest.json").is_file():
        raise SystemExit(f"missing extension manifest: {SRC / 'manifest.json'}")
    if not (SRC / "manifest.firefox.json").is_file():
        raise SystemExit(f"missing firefox manifest: {SRC / 'manifest.firefox.json'}")

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("itab-extension-*.zip"):
        old.unlink()

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        chrome_dir = tmp_path / "chrome"
        copy_src(chrome_dir)
        chrome_zip = OUT / "itab-extension-chrome.zip"
        zip_dir(chrome_dir, chrome_zip)
        shutil.copy2(chrome_zip, OUT / "itab-extension-edge.zip")

        firefox_dir = tmp_path / "firefox"
        copy_src(firefox_dir)
        shutil.copy2(SRC / "manifest.firefox.json", firefox_dir / "manifest.json")
        zip_dir(firefox_dir, OUT / "itab-extension-firefox.zip")

    chrome_manifest = json.loads((SRC / "manifest.json").read_text(encoding="utf-8"))
    firefox_manifest = json.loads((SRC / "manifest.firefox.json").read_text(encoding="utf-8"))
    if "browser_specific_settings" in chrome_manifest:
        raise SystemExit("Chrome/Edge manifest must not include gecko settings")
    if "gecko" not in firefox_manifest.get("browser_specific_settings", {}):
        raise SystemExit("Firefox manifest must include gecko id")

    print("Packed:")
    for name in (
        "itab-extension-chrome.zip",
        "itab-extension-edge.zip",
        "itab-extension-firefox.zip",
    ):
        path = OUT / name
        print(f"  {path} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
