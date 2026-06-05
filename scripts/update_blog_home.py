#!/usr/bin/env python3
"""
Scan jg_blog_*.html files and generate blog-posts.json for the blog home page.

Usage:
    python scripts/update_blog_home.py

After adding a new blog HTML file (e.g. jg_blog_12.html), run this script.
The home page (jg_blog_home.html) loads blog-posts.json automatically.
"""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "blog-posts.json"

# Only include these blog numbers when set (e.g. [1, 2] for test). None = all blogs.
INCLUDE_BLOG_NUMBERS: list[int] | None = [1, 2]

# Optional overrides: filename -> custom URL (e.g. external links)
URL_OVERRIDES: dict[str, str] = {}


def parse_date(text: str) -> datetime:
    """Parse YYYY.MM.DD display date."""
    text = text.strip()
    try:
        return datetime.strptime(text, "%Y.%m.%d")
    except ValueError:
        return datetime.min


def extract_post(path: Path) -> dict | None:
    content = path.read_text(encoding="utf-8")

    time_match = re.search(
        r'<time datetime="[^"]*">(?:<i[^>]*></i>)?([^<]+)</time>',
        content,
    )
    h1_match = re.search(r"<h1><strong>([^<]+)</strong></h1>", content)
    img_match = re.search(
        r'class="blog-content"[\s\S]*?<img src="([^"]+)"',
        content,
    )
    category_match = re.search(
        r'bg-emerald-50 text-brand-green[^>]*>([^<]+)</span>',
        content,
    )
    excerpt_match = re.search(
        r'bg-slate-50 p-6[\s\S]*?<p class="m-0">([\s\S]*?)</p>',
        content,
    )

    if not h1_match:
        print(f"  skip {path.name}: no h1 title found")
        return None

    display_date = time_match.group(1).strip() if time_match else "1970.01.01"
    filename = path.name

    return {
        "id": path.stem,
        "title": h1_match.group(1).strip(),
        "url": URL_OVERRIDES.get(filename, filename),
        "image": img_match.group(1) if img_match else "img/Blog/blog_1.png",
        "imageAlt": h1_match.group(1).strip(),
        "category": category_match.group(1).strip() if category_match else "ブログ",
        "date": display_date,
        "excerpt": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", excerpt_match.group(1))).strip()
        if excerpt_match
        else "",
        "_sort": parse_date(display_date).isoformat(),
    }


def main() -> None:
    files = [
        p for p in ROOT.glob("jg_blog_*.html")
        if p.name != "jg_blog_home.html" and re.search(r"jg_blog_(\d+)", p.name)
    ]
    if INCLUDE_BLOG_NUMBERS is not None:
        allowed = {f"jg_blog_{n}.html" for n in INCLUDE_BLOG_NUMBERS}
        files = [p for p in files if p.name in allowed]
    files.sort(key=lambda p: int(re.search(r"jg_blog_(\d+)", p.name).group(1)))

    posts = []
    print(f"Scanning {len(files)} blog files in {ROOT}")
    for path in files:
        post = extract_post(path)
        if post:
            posts.append(post)
            print(f"  + {path.name}: {post['title'][:40]}... ({post['date']})")

    posts.sort(key=lambda p: p["_sort"], reverse=True)
    for post in posts:
        del post["_sort"]

    json_text = json.dumps(posts, ensure_ascii=False, indent=2)

    OUTPUT.write_text(json_text + "\n", encoding="utf-8")
    inject_posts_into_home(json_text)

    print(f"\nWrote {len(posts)} posts to {OUTPUT.name}")
    if posts:
        print(f"Latest: {posts[0]['title']}")


def inject_posts_into_home(json_text: str) -> None:
    """Embed JSON in jg_blog_home.html so it works without a web server."""
    home_path = ROOT / "jg_blog_home.html"
    content = home_path.read_text(encoding="utf-8")
    marker = '<script id="blog-posts-data" type="application/json">'
    end_marker = "</script>"

    if marker in content:
        start = content.index(marker)
        end = content.index(end_marker, start) + len(end_marker)
        content = content[:start] + marker + json_text + end_marker + content[end:]
    else:
        insert = f'{marker}{json_text}{end_marker}\n            <script src="js/blog-home.js"></script>'
        if '<script src="js/blog-home.js"></script>' in content:
            content = content.replace(
                '<script src="js/blog-home.js"></script>',
                insert,
            )
        else:
            content = content.replace(
                '</body>',
                f'            {insert}\n        </body>',
            )

    home_path.write_text(content, encoding="utf-8")
    print(f"Updated {home_path.name} with embedded post data")


if __name__ == "__main__":
    main()
