"""Pick the next pending blog article from blog-queue.json, generate it, run QA,
and either open a GitHub PR (review mode) or commit directly to main (auto mode).

Usage:
    uv run python -m scraper.publish_next
    uv run python -m scraper.publish_next --publish-mode auto
    uv run python -m scraper.publish_next --dry-run
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import subprocess
import sys
from datetime import timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent
QUEUE_PATH = ROOT / "blog-queue.json"
BLOG_DIR = ROOT / "scraper" / "data" / "blog"
BLOG_TS_PATH = ROOT / "src" / "lib" / "blog.ts"

try:
    from scraper.generate_blog import ARTICLES as _ARTICLE_SPECS
    from scraper.fetch_blog_hero import fetch_article_inline_images as _fetch_inline
    _SPEC_MAP = {s.id: s for s in _ARTICLE_SPECS}
except Exception:
    _SPEC_MAP = {}
    _fetch_inline = None


# ---------------------------------------------------------------------------
# Queue helpers
# ---------------------------------------------------------------------------


def load_queue() -> dict:
    return json.loads(QUEUE_PATH.read_text(encoding="utf-8"))


def save_queue(q: dict) -> None:
    QUEUE_PATH.write_text(json.dumps(q, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def today_str() -> str:
    return datetime.date.today().isoformat()


def cadence_met(q: dict) -> bool:
    next_at_str = q["settings"].get("next_publish_at")
    if next_at_str:
        next_at = datetime.datetime.fromisoformat(next_at_str.replace("Z", "+00:00"))
        return datetime.datetime.now(timezone.utc) >= next_at
    # Legacy fallback: day-based cadence
    last = q.get("last_publish_date")
    if not last:
        return True
    cadence = q["settings"]["cadence_days"]
    delta = (datetime.date.today() - datetime.date.fromisoformat(last)).days
    return delta >= cadence


def next_pending(q: dict) -> dict | None:
    pending = [a for a in q["articles"] if a["status"] == "pending"]
    if not pending:
        return None
    return min(pending, key=lambda a: a["priority"])


def get_publish_mode(q: dict, args: argparse.Namespace) -> str:
    if args.publish_mode:
        return args.publish_mode
    return q["settings"]["publish_mode"]


# ---------------------------------------------------------------------------
# Generation and QA
# ---------------------------------------------------------------------------


def _run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=ROOT, **kwargs)


def generate(article_id: str, article_json: str = "") -> None:
    cmd = ["uv", "run", "python", "-m", "scraper.generate_blog",
           "--article-id", article_id, "--overwrite"]
    if article_json:
        cmd += ["--article-json", article_json]
    result = _run(cmd)
    if result.returncode != 0:
        raise RuntimeError(f"generate_blog failed for '{article_id}'")


def fetch_hero(article_id: str, hero_query: str) -> None:
    result = _run(
        ["uv", "run", "python", "-m", "scraper.fetch_blog_hero",
         "--slug", article_id, "--query", hero_query],
    )
    if result.returncode != 0:
        raise RuntimeError(f"fetch_blog_hero failed for '{article_id}'")


def fetch_inline_images(article_id: str) -> None:
    if not _fetch_inline:
        return
    spec = _SPEC_MAP.get(article_id)
    if spec and spec.inline_image_queries:
        _fetch_inline(article_id, spec.inline_image_queries, force=True)
        return
    # Fall back to sidecar written by auto_generate_spec for articles not in ARTICLES.
    sidecar = ROOT / "scraper" / "data" / "blog" / f"{article_id}_auto_spec.json"
    if sidecar.exists():
        try:
            import json as _j
            data = _j.loads(sidecar.read_text(encoding="utf-8"))
            queries = tuple(data.get("inline_image_queries", []))
            if queries:
                _fetch_inline(article_id, queries, force=True)
        except Exception:
            pass


def qa_check(article_id: str) -> bool:
    result = _run(
        ["uv", "run", "python", "-m", "scraper.qa_blog", "--article-id", article_id],
        capture_output=True, text=True,
    )
    print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    return result.returncode == 0


# ---------------------------------------------------------------------------
# blog.ts entry generation (auto mode only)
# ---------------------------------------------------------------------------


_CITY_KEYWORDS: list[tuple[str, str]] = [
    ("nicosia", "Nicosia"),
    ("leukosia", "Nicosia"),
    ("limassol", "Limassol"),
    ("lemesos", "Limassol"),
    ("larnaca", "Larnaca"),
    ("larnaka", "Larnaca"),
    ("paphos", "Paphos"),
    ("pafos", "Paphos"),
    ("paralimni", "Paralimni"),
]


def _infer_city(article: dict) -> str | None:
    haystack = (article["id"] + " " + article.get("slug_en", "")).lower()
    for keyword, city in _CITY_KEYWORDS:
        if keyword in haystack:
            return city
    return None


def make_blog_ts_entry(article: dict, publish_date: str) -> str:
    def ts(s: str) -> str:
        return json.dumps(str(s))

    city = _infer_city(article)
    city_ts = f'"{city}"' if city else "null"
    hero_path = ts("/blog/" + article["id"] + "/hero.jpg")

    lines = [
        "  {",
        f"    id: {ts(article['id'])},",
        f"    slug_el: {ts(article['slug_el'])},",
        f"    slug_en: {ts(article['slug_en'])},",
        f"    categoryId: {ts(article['category_id'])},",
        f"    title_el: {ts(article['title_el'])},",
        f"    title_en: {ts(article['title_en'])},",
        "    excerpt_el:",
        f"      {ts(article['excerpt_el'])},",
        "    excerpt_en:",
        f"      {ts(article['excerpt_en'])},",
        "    metaDescription_el:",
        f"      {ts(article['meta_description_el'])},",
        "    metaDescription_en:",
        f"      {ts(article['meta_description_en'])},",
        f"    heroImagePath: {hero_path},",
        "    heroImageAlt_el:",
        f"      {ts(article['hero_alt_el'])},",
        f"    heroImageAlt_en: {ts(article['hero_alt_en'])},",
        f"    heroCaption_en: {ts(article['hero_alt_en'] + ', via Pexels.com')},",
        f"    heroCaption_el: {ts(article['hero_alt_el'] + ', via Pexels.com')},",
        f"    publishedDate: {ts(publish_date)},",
        f"    modifiedDate: {ts(publish_date)},",
        '    author: "Matthieu Tissot",',
        '    authorSlug: "matthieu",',
        f"    relatedCity: {city_ts},",
        "    relatedSlugs: [],",
        "  },",
    ]
    return "\n".join(lines)


def update_blog_ts(entry_ts: str, article_id: str = "", publish_date: str = "") -> None:
    content = BLOG_TS_PATH.read_text(encoding="utf-8")
    id_literal = f'id: "{article_id}"' if article_id else ""
    if id_literal and id_literal in content:
        # Stub entry exists — update its publishedDate and modifiedDate in place
        import re as _re
        pos = content.find(id_literal)
        entry_end = content.find("\n  },", pos)
        if entry_end == -1:
            entry_end = content.find("\n];", pos)
        block = content[pos:entry_end]
        block = _re.sub(r'publishedDate: ""', f'publishedDate: "{publish_date}"', block)
        block = _re.sub(r'modifiedDate: ""', f'modifiedDate: "{publish_date}"', block)
        new_content = content[:pos] + block + content[entry_end:]
    else:
        marker = "\n];"
        idx = content.rfind(marker)
        if idx == -1:
            raise RuntimeError("Could not find '];\n' in blog.ts — cannot insert entry")
        new_content = content[:idx] + "\n" + entry_ts + "\n" + content[idx:]
    BLOG_TS_PATH.write_text(new_content, encoding="utf-8")


# ---------------------------------------------------------------------------
# Git / GitHub helpers
# ---------------------------------------------------------------------------


def git(*args: str) -> subprocess.CompletedProcess:
    return _run(["git", *args], check=True)


def git_add(*paths: Path) -> None:
    git("add", "--", *[str(p) for p in paths])


def git_commit(message: str) -> None:
    git("commit", "-m", message)


def create_pr(article: dict) -> int:
    title = f"blog: {article['title_en']}"
    body = (
        f"## Blog article: {article['title_en']}\n\n"
        f"**Article ID:** `{article['id']}`  \n"
        f"**Keyword:** {article['keyword']}  \n"
        f"**Est. volume:** {article.get('volume', 'n/a')}  \n\n"
        "### Review checklist\n"
        "- [ ] Read EN article in full — check facts, tone, word count\n"
        "- [ ] Read EL article in full — check facts, tone, word count\n"
        "- [ ] Hero image looks relevant and high-quality\n"
        "- [ ] Approve with zero edits = progress toward auto mode\n\n"
        "Merging this PR triggers `blog-finalize.yml`, which adds the "
        "`blog.ts` entry with the actual merge date as `publishedDate`."
    )
    result = _run(
        ["gh", "pr", "create",
         "--title", title,
         "--body", body,
         "--label", "blog-publish"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"gh pr create failed:\n{result.stderr}")
    pr_url = result.stdout.strip()
    pr_number = int(pr_url.rstrip("/").split("/")[-1])
    print(f"PR created: {pr_url}")
    return pr_number


# ---------------------------------------------------------------------------
# Publish flows
# ---------------------------------------------------------------------------


def _article_files(article_id: str) -> list[Path]:
    base_dir = ROOT / "public" / "blog" / article_id
    files = [
        BLOG_DIR / f"{article_id}_en.md",
        BLOG_DIR / f"{article_id}_el.md",
        base_dir / "hero.jpg",
    ]
    # Include any inline images that were fetched
    for n in range(1, 4):
        p = base_dir / f"inline-{n}.jpg"
        if p.exists():
            files.append(p)
    # Include the infographic spec sidecar if this article has one
    infographic_path = BLOG_DIR / f"{article_id}_infographic.json"
    if infographic_path.exists():
        files.append(infographic_path)
    return files


def publish_review(article: dict, q: dict, dry_run: bool) -> None:
    today = today_str()
    branch = f"blog/{article['id']}"

    # Create and switch to blog branch
    if not dry_run:
        # Delete local branch if it already exists (leftover from failed run)
        _run(["git", "branch", "-D", branch])  # ignore failure
        git("checkout", "-b", branch)

    # Update queue on the branch: status → in_review
    for a in q["articles"]:
        if a["id"] == article["id"]:
            a["status"] = "in_review"
            a["pr_created_at"] = today
            break

    if not dry_run:
        save_queue(q)
        git_add(*_article_files(article["id"]), QUEUE_PATH)
        git_commit(f"feat(blog): draft {article['id']}")
        git("push", "-u", "origin", branch)
        pr_number = create_pr(article)

        # Switch back to main and update queue with PR tracking
        git("checkout", "main")
        q = load_queue()
        for a in q["articles"]:
            if a["id"] == article["id"]:
                a["status"] = "in_review"
                a["pr_number"] = pr_number
                a["pr_created_at"] = today
                break
        q["state"]["open_pr_number"] = pr_number
        q["state"]["open_pr_article_id"] = article["id"]
        save_queue(q)
        git_add(QUEUE_PATH)
        git_commit(f"chore(blog): track open PR #{pr_number} for {article['id']}")
        git("push")
    else:
        print(f"(dry-run) would: checkout -b {branch}, commit, push, gh pr create, "
              f"checkout main, update queue with pr_number, push")


def emit_github_output(key: str, value: str) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"{key}={value}\n")


def publish_auto(article: dict, q: dict, dry_run: bool) -> None:
    today = today_str()
    entry_ts = make_blog_ts_entry(article, today)

    if not dry_run:
        update_blog_ts(entry_ts, article_id=article["id"], publish_date=today)
    else:
        print("(dry-run) blog.ts entry would be:")
        print(entry_ts)

    for a in q["articles"]:
        if a["id"] == article["id"]:
            a["status"] = "published"
            a["published_at"] = today
            break
    q["last_publish_date"] = today

    # Advance next_publish_at: current scheduled time + cadence_days + 65 min
    cadence_days = q["settings"]["cadence_days"]
    current_next = q["settings"].get("next_publish_at")
    if current_next:
        base = datetime.datetime.fromisoformat(current_next.replace("Z", "+00:00"))
    else:
        base = datetime.datetime.now(timezone.utc)
    new_next = base + timedelta(days=cadence_days, minutes=65)
    q["settings"]["next_publish_at"] = new_next.strftime("%Y-%m-%dT%H:%M:%SZ")

    if not dry_run:
        save_queue(q)
        git_add(*_article_files(article["id"]), BLOG_TS_PATH, QUEUE_PATH)
        git_commit(f"feat(blog): publish {article['id']}")
        git("push")
        print(f"Published: {article['title_en']}")
        print(f"Next publish scheduled: {q['settings']['next_publish_at']}")
        url_el = f"https://clickclickdrive-cyprus.com/arthra/{article['slug_el']}"
        url_en = f"https://clickclickdrive-cyprus.com/en/blog/{article['slug_en']}"
        emit_github_output("published_url_el", url_el)
        emit_github_output("published_url_en", url_en)
        emit_github_output("published_title", article["title_en"])
    else:
        print(f"(dry-run) would: git add files, commit, push to main")
        print(f"Next publish would be: {q['settings']['next_publish_at']}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Publish next pending blog article")
    p.add_argument("--publish-mode", choices=["review", "auto"], default=None,
                   help="Override publish_mode from blog-queue.json settings")
    p.add_argument("--dry-run", action="store_true",
                   help="Skip all git/gh/generate operations — just show what would happen")
    args = p.parse_args(argv)

    q = load_queue()
    mode = get_publish_mode(q, args)

    # Guard: open PR exists in review mode
    if mode == "review" and q["state"]["open_pr_number"]:
        pr = q["state"]["open_pr_number"]
        art = q["state"]["open_pr_article_id"]
        print(f"Skip: PR #{pr} already open for '{art}'. Merge or close it first.")
        return 0

    # Guard: cadence
    if not cadence_met(q):
        last = q.get("last_publish_date", "never")
        cadence = q["settings"]["cadence_days"]
        print(f"Skip: last publish was {last}; cadence requires {cadence} days between publishes.")
        return 0

    # Find next pending
    article = next_pending(q)
    if not article:
        print("No pending articles in queue.")
        return 0

    print(f"Article [{article['priority']}]: {article['id']}")
    print(f"  Title EN: {article['title_en']}")
    print(f"  Mode: {mode}")

    # Step 1: Generate
    print("\n[1/4] Generating content...")
    if not args.dry_run:
        try:
            generate(article["id"], article_json=json.dumps(article))
        except RuntimeError as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 1
    else:
        print("(dry-run) skipping generation")

    # Step 2: Fetch hero + inline images
    print("\n[2/4] Fetching hero image...")
    if not args.dry_run:
        try:
            fetch_hero(article["id"], article["hero_query"])
        except RuntimeError as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 1
        fetch_inline_images(article["id"])
    else:
        print("(dry-run) skipping hero fetch")

    # Step 3: QA with one retry
    print("\n[3/4] Running QA...")
    if not args.dry_run:
        passed = qa_check(article["id"])
        if not passed:
            print("QA failed — regenerating once for a retry...")
            try:
                generate(article["id"], article_json=json.dumps(article))
            except RuntimeError as exc:
                print(f"ERROR on retry: {exc}", file=sys.stderr)
                return 1
            passed = qa_check(article["id"])
            if not passed:
                print("QA failed after retry — article left pending.", file=sys.stderr)
                return 1
        print("QA passed.")
    else:
        print("(dry-run) skipping QA")

    # Step 4: Publish
    print(f"\n[4/4] Publishing ({mode} mode)...")
    if mode == "review":
        publish_review(article, q, args.dry_run)
    else:
        publish_auto(article, q, args.dry_run)

    return 0


if __name__ == "__main__":
    sys.exit(main())
