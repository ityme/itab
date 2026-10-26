#!/usr/bin/env python3
"""Inline tab.css and tab.js into src/tab.html to produce a standalone page."""
import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def replace_placeholder(html, kind, content, tag):
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

    block = f"{start}\n<{tag}>\n{content.rstrip()}\n</{tag}>\n{end}"
    return html[:start_index] + block + html[end_index + len(end):]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o", "--output",
        type=Path,
        default=ROOT / "tab.browser.iWonder.html",
        help="output path (default: tab.browser.iWonder.html in the project root)",
    )
    args = parser.parse_args()
    output_path = args.output if args.output.is_absolute() else ROOT / args.output

    html_path = ROOT / "src/tab.html"
    css_path = ROOT / "src/tab.css"
    js_path = ROOT / "src/tab.js"

    try:
        html = html_path.read_text(encoding="utf-8")
        css = css_path.read_text(encoding="utf-8")
        js = js_path.read_text(encoding="utf-8")
        html = replace_placeholder(html, "CSS", css, "style")
        html = replace_placeholder(html, "JS", js, "script")
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")
    print(f"Created {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
