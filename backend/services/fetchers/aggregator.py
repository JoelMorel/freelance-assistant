from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor
from models import Job
from services.fetchers.upwork import fetch_upwork_jobs
from services.fetchers.remoteok import fetch_remoteok_jobs
from services.fetchers.weworkremotely import fetch_wwr_jobs

def get_all_jobs(query: str = "", platform: str = "all", min_score: int = 0) -> List[Job]:
    """
    Fetches jobs across all supported platforms, scores them, filters, and sorts by match_score descending.
    """
    platform_key = platform.lower().strip()
    results: List[Job] = []

    tasks = []
    with ThreadPoolExecutor(max_workers=3) as executor:
        if platform_key in ["all", "upwork"]:
            tasks.append(executor.submit(fetch_upwork_jobs, query))
        if platform_key in ["all", "remoteok"]:
            tasks.append(executor.submit(fetch_remoteok_jobs, query))
        if platform_key in ["all", "weworkremotely", "wwr"]:
            tasks.append(executor.submit(fetch_wwr_jobs, query))

        for future in tasks:
            try:
                jobs = future.result()
                results.extend(jobs)
            except Exception as e:
                print(f"[Aggregator] Task error: {e}")

    # Filter by min_score
    if min_score > 0:
        results = [j for j in results if j.match_score >= min_score]

    # Sort descending by match_score, then recency
    results.sort(key=lambda j: j.match_score, reverse=True)

    return results
