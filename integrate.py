#!/usr/bin/env python3
"""Inline tab.css and tab.js into src/tab.html to produce a standalone page."""
import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def replace_placeholder(html, kind, content, tag, attrs=""):
    start = f"<!-- INTEGRATE:{kind}:START -->"
    end = f"<!-- INTEGRATE:{kind}:END -->"
    start_count = html.count(start)
    end_count = html.count(end)

    if start_count != 1 or end_count != 1:
        raise ValueError(
            f"{kind} placeholders must each appear exactly once "
            f"(found {start_count} start, {end_count} end)"
        )

    start_index = html.index(start)
    end_index = html.index(end)
    if start_index >= end_index:
        raise ValueError(f"{kind} placeholder end must follow its start")

    attr_str = f" {attrs}" if attrs else ""
    block = f"{start}\n<{tag}{attr_str}>\n{content.rstrip()}\n</{tag}>\n{end}"
    return html[:start_index] + block + html[end_index + len(end):]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o", "--output",
        type=Path,
        default=ROOT / "itab.html",
        help="output path (default: itab.html in the project root)",
    )
    args = parser.parse_args()
    output_path = args.output if args.output.is_absolute() else ROOT / args.output

    html_path = ROOT / "src/tab.html"
    css_path = ROOT / "src/tab.css"
    js_path = ROOT / "src/tab.js"

    # 收集 background 模块文件
    bg_files = [
        "01-symbols-network.js",
        "02-kaleidoscope.js",
        "03-sakura-webgl.js",
        "04-noise-neural-grid.js",
        "05-random-particles.js",
        "index.js"
    ]
    bundled_modules = []
    for bf in bg_files:
        bf_path = ROOT / "src/background" / bf
        if bf_path.exists():
            mod_code = bf_path.read_text(encoding="utf-8")
            bundled_modules.append(f"// --- MODULE: {bf} ---\n{mod_code}")

    try:
        html = html_path.read_text(encoding="utf-8")
        css = css_path.read_text(encoding="utf-8")
        js = js_path.read_text(encoding="utf-8")

        # 将模块内联打包
        bundled_js = "\n\n".join(bundled_modules) + "\n\n// --- MAIN TAB LOGIC ---\n" + js.replace('import { selectRandomBackground } from "./background/index.js";', '// inlined selectRandomBackground')
        html = replace_placeholder(html, "CSS", css, "style")
        html = replace_placeholder(html, "JS", bundled_js, "script", attrs='type="module"')
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")
    print(f"Created {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
