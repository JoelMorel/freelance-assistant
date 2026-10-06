import html
import re
import httpx
import feedparser
from typing import List, Optional
from models import Job
from services.scorer import score_job

def clean_html(raw_html: str) -> str:
    if not raw_html:
        return ""
    clean = re.sub(r"<[^>]+>", " ", raw_html)
    clean = html.unescape(clean)
    return " ".join(clean.split())

WWR_FEEDS = [
    "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
]

def fetch_wwr_jobs(
    query: str = "",
    custom_skills: Optional[List[str]] = None,
    custom_exclude: Optional[List[str]] = None
) -> List[Job]:
    jobs: List[Job] = []
    seen_links = set()
    query_lower = query.lower().strip()
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) FreelanceAssistant/1.0"
    }

    for feed_url in WWR_FEEDS:
        try:
            with httpx.Client(timeout=8.0) as client:
                resp = client.get(feed_url, headers=headers)
                if resp.status_code != 200:
                    continue
                parsed = feedparser.parse(resp.text)
        except Exception as e:
            print(f"[WWR] Fetch failed for {feed_url}: {e}")
            continue

        for entry in parsed.entries:
            link = entry.get("link", "")
            if not link or link in seen_links:
                continue
            seen_links.add(link)

            raw_title = entry.get("title", "")
            if ":" in raw_title:
                parts = raw_title.split(":", 1)
                company = parts[0].strip()
                title = parts[1].strip()
            else:
                company = "Remote Company"
                title = raw_title

            raw_summary = entry.get("summary", "")
            summary = clean_html(raw_summary)[:400]
            published = entry.get("published", "")[:16]

            extracted_tags = []
            for kw in ["React", "Node", "TypeScript", "JavaScript", "WordPress", "Next.js", "Full-Stack", "Frontend", "Backend", "Shopify"]:
                if kw.lower() in f"{title.lower()} {summary.lower()}":
                    extracted_tags.append(kw)

            corpus = f"{title.lower()} {summary.lower()} {company.lower()}"
            if query_lower and query_lower not in corpus:
                continue

            score, reasons = score_job(title, summary, extracted_tags, custom_skills, custom_exclude)

            job = Job(
                id=f"wwr-{abs(hash(link)) % 10000000}",
                platform="WeWorkRemotely",
                title=title,
                company=company,
                link=link,
                summary=summary,
                published=published,
                budget="Competitive / Contract",
                tags=extracted_tags,
                match_score=score,
                match_reasons=reasons
            )
            jobs.append(job)

    return jobs
