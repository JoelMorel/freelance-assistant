import html
import re
import httpx
from typing import List
from models import Job
from services.scorer import score_job

def clean_html(raw_html: str) -> str:
    if not raw_html:
        return ""
    clean = re.sub(r"<[^>]+>", " ", raw_html)
    clean = html.unescape(clean)
    return " ".join(clean.split())

def fetch_remoteok_jobs(query: str = "") -> List[Job]:
    jobs: List[Job] = []
    url = "https://remoteok.com/api"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) FreelanceAssistant/1.0"
    }

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code != 200:
                return []
            data = resp.json()
    except Exception as e:
        print(f"[RemoteOK] Fetch failed: {e}")
        return []

    query_lower = query.lower().strip()

    for item in data:
        # First item in RemoteOK is usually API terms metadata
        if not isinstance(item, dict) or "id" not in item:
            continue

        title = item.get("position", "")
        company = item.get("company", "Remote Company")
        tags = item.get("tags", [])
        raw_desc = item.get("description", "")
        summary = clean_html(raw_desc)[:400]
        link = item.get("url", "")
        published = item.get("date", "")[:10]

        # Check budget / salary
        sal_min = item.get("salary_min", 0)
        sal_max = item.get("salary_max", 0)
        budget = None
        if sal_min or sal_max:
            if sal_min and sal_max:
                budget = f"${sal_min:,} - ${sal_max:,}"
            elif sal_min:
                budget = f"From ${sal_min:,}"
            elif sal_max:
                budget = f"Up to ${sal_max:,}"

        # Filter by search query if provided
        corpus = f"{title.lower()} {summary.lower()} {' '.join(t.lower() for t in tags)}"
        if query_lower and query_lower not in corpus:
            continue

        score, reasons = score_job(title, summary, tags)

        job = Job(
            id=f"remoteok-{item.get('id')}",
            platform="RemoteOK",
            title=title,
            company=company,
            link=link,
            summary=summary,
            published=published,
            budget=budget,
            tags=tags[:6],
            match_score=score,
            match_reasons=reasons
        )
        jobs.append(job)

    return jobs
