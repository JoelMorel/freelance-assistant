import feedparser

# def fetch_jobs(query: str):
#     url = f"https://www.upwork.com/ab/feed/jobs/rss?q={query}&sort=recency"
#     feed = feedparser.parse(url)
#     jobs = []
#     for entry in feed.entries[:10]:  # Limit for demo
#         jobs.append({
#             "id": entry.get("id", ""),
#             "title": entry.title,
#             "link": entry.link,
#             "summary": entry.summary,
#             "published": entry.published,
#         })
#     return jobs
def fetch_jobs(query: str):
    return [
        {
            "id": "1",
            "title": "Test Job",
            "link": "https://example.com",
            "summary": "This is a test job",
            "published": "2025-10-13"
        }
    ]
