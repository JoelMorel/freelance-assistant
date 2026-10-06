import json
import os
from typing import List, Optional
from models import Job
from services.scorer import score_job

SAMPLE_UPWORK_JOBS = [
    {
        "id": "upwork-001",
        "title": "Full-Stack React & Node.js Developer for SaaS Dashboard",
        "company": "SaaS Startup (US - Verified)",
        "link": "https://www.upwork.com/freelance-jobs/apply/react-developer",
        "summary": "Looking for an experienced React and Node.js developer to help finalize and launch our customer portal. Must be proficient with modern React, Tailwind CSS, REST APIs, and authentication. Ongoing contract for the right freelancer.",
        "published": "1 hour ago",
        "budget": "$65 - $90 / hr",
        "tags": ["React", "Node.js", "Tailwind CSS", "REST API", "TypeScript"],
    },
    {
        "id": "upwork-002",
        "title": "Custom WordPress & WooCommerce Checkout Optimization with Stripe",
        "company": "E-Commerce Brand (UK - Verified)",
        "link": "https://www.upwork.com/freelance-jobs/apply/wordpress-developer",
        "summary": "We need a WordPress/WooCommerce specialist to customize our checkout flow, optimize site speed/SEO, and integrate custom webhooks with Stripe. Experience with headless or modern PHP/JS preferred.",
        "published": "3 hours ago",
        "budget": "$1,800 Fixed Price",
        "tags": ["WordPress", "WooCommerce", "PHP", "Stripe", "SEO"],
    },
    {
        "id": "upwork-003",
        "title": "Next.js & Supabase Frontend Developer for MVP",
        "company": "Fintech Studio (Canada - Verified)",
        "link": "https://www.upwork.com/freelance-jobs/apply/nextjs-developer",
        "summary": "Seeking a talented Next.js developer to build clean, responsive components and connect with Supabase backend. Pixel-perfect Figma design provided. Quick turnaround needed.",
        "published": "5 hours ago",
        "budget": "$70 - $100 / hr",
        "tags": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    },
    {
        "id": "upwork-004",
        "title": "E-Commerce Website Speed & Core Web Vitals Optimization",
        "company": "Retail Brand (US - Verified)",
        "link": "https://www.upwork.com/freelance-jobs/apply/web-performance",
        "summary": "Need an expert to audit and boost PageSpeed / Core Web Vitals (LCP & CLS) scores across mobile and desktop. Must know modern caching, asset optimization, and SEO best practices.",
        "published": "Today",
        "budget": "$1,200 Fixed Price",
        "tags": ["SEO", "Performance", "JavaScript", "WordPress"],
    }
]

def fetch_upwork_jobs(
    query: str = "",
    custom_skills: Optional[List[str]] = None,
    custom_exclude: Optional[List[str]] = None
) -> List[Job]:
    jobs: List[Job] = []
    query_lower = query.lower().strip()

    for item in SAMPLE_UPWORK_JOBS:
        title = item["title"]
        summary = item["summary"]
        tags = item["tags"]
        
        corpus = f"{title.lower()} {summary.lower()} {' '.join(t.lower() for t in tags)}"
        if query_lower and query_lower not in corpus:
            continue

        score, reasons = score_job(title, summary, tags, custom_skills, custom_exclude)
        score = min(100, score + 5)
        reasons.append("Payment Verified Client")

        job = Job(
            id=item["id"],
            platform="Upwork",
            title=title,
            company=item["company"],
            link=item["link"],
            summary=summary,
            published=item["published"],
            budget=item["budget"],
            tags=tags,
            match_score=score,
            match_reasons=reasons
        )
        jobs.append(job)

    return jobs
