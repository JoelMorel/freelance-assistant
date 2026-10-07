import json
import os
import urllib.parse
from typing import List, Optional
from models import Job
from services.scorer import score_job

UPWORK_JOB_CATALOG = [
    {
        "id": "upwork-001",
        "title": "Full-Stack React & Node.js Developer for SaaS Dashboard",
        "company": "SaaS Studio (US - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=react%20node%20developer&sort=recency",
        "summary": "Looking for an experienced React and Node.js developer to help finalize and launch our customer portal. Must be proficient with modern React, Tailwind CSS, REST APIs, and authentication. Ongoing contract for the right freelancer.",
        "published": "1 hour ago",
        "budget": "$65 - $90 / hr",
        "tags": ["React", "Node.js", "Tailwind CSS", "REST API", "TypeScript"],
    },
    {
        "id": "upwork-002",
        "title": "Custom WordPress & WooCommerce Checkout Optimization with Stripe",
        "company": "E-Commerce Brand (UK - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=wordpress%20woocommerce%20stripe&sort=recency",
        "summary": "We need a WordPress/WooCommerce specialist to customize our checkout flow, optimize site speed/SEO, and integrate custom webhooks with Stripe. Experience with headless or modern PHP/JS preferred.",
        "published": "2 hours ago",
        "budget": "$1,800 Fixed Price",
        "tags": ["WordPress", "WooCommerce", "PHP", "Stripe", "SEO"],
    },
    {
        "id": "upwork-003",
        "title": "Next.js & Supabase Frontend Developer for MVP",
        "company": "Fintech Studio (Canada - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=nextjs%20frontend%20developer&sort=recency",
        "summary": "Seeking a talented Next.js developer to build clean, responsive components and connect with Supabase backend. Pixel-perfect Figma design provided. Quick turnaround needed.",
        "published": "3 hours ago",
        "budget": "$70 - $100 / hr",
        "tags": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    },
    {
        "id": "upwork-004",
        "title": "Shopify Plus Theme Customization & Liquid Development",
        "company": "Apparel Brand (US - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=shopify%20plus%20liquid&sort=recency",
        "summary": "Looking for an expert Shopify developer to build custom product page sections, integrate third-party apps, and optimize mobile cart conversion. Must know Liquid, JavaScript, and Tailwind.",
        "published": "4 hours ago",
        "budget": "$2,500 Fixed Price",
        "tags": ["Shopify", "Liquid", "JavaScript", "E-Commerce"],
    },
    {
        "id": "upwork-005",
        "title": "Technical SEO Audit & Core Web Vitals Optimization",
        "company": "Digital Agency (Australia - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=technical%20seo%20core%20web%20vitals&sort=recency",
        "summary": "Need an expert to audit our client sites and boost Google PageSpeed & Core Web Vitals (LCP, CLS, INP) scores. Deep understanding of JS performance, caching, and technical SEO required.",
        "published": "5 hours ago",
        "budget": "$55 - $80 / hr",
        "tags": ["SEO", "Performance", "JavaScript", "WordPress"],
    },
    {
        "id": "upwork-006",
        "title": "Kubernetes & DevOps Infrastructure Engineer",
        "company": "Cloud Systems (US - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=devops%20kubernetes%20engineer&sort=recency",
        "summary": "Looking for a Senior DevOps engineer to maintain CI/CD pipelines, Terraform configs, and Kubernetes clusters in AWS.",
        "published": "6 hours ago",
        "budget": "$80 - $110 / hr",
        "tags": ["DevOps", "Kubernetes", "AWS", "Terraform"],
    },
    {
        "id": "upwork-007",
        "title": "Vue 3 & Nuxt Full-Stack Web Application",
        "company": "Media Corp (Germany - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=vue%20nuxt%20developer&sort=recency",
        "summary": "Seeking a developer experienced in Vue 3, Nuxt, and Tailwind to build interactive widgets and API integration.",
        "published": "7 hours ago",
        "budget": "$1,400 Fixed Price",
        "tags": ["Vue", "Nuxt", "JavaScript", "CSS"],
    },
    {
        "id": "upwork-008",
        "title": "Stripe Connect Marketplace Billing Integration",
        "company": "Platform Startup (US - Verified)",
        "link": "https://www.upwork.com/nx/search/jobs/?q=stripe%20connect%20integration&sort=recency",
        "summary": "Need a backend/full-stack engineer to implement Stripe Connect split payments, automated payouts, and webhook handlers in Node.js.",
        "published": "8 hours ago",
        "budget": "$2,200 Fixed Price",
        "tags": ["Stripe", "Node.js", "API", "TypeScript"],
    }
]

def fetch_upwork_jobs(
    query: str = "",
    custom_skills: Optional[List[str]] = None,
    custom_exclude: Optional[List[str]] = None
) -> List[Job]:
    jobs: List[Job] = []
    query_lower = query.lower().strip()

    for item in UPWORK_JOB_CATALOG:
        title = item["title"]
        summary = item["summary"]
        tags = item["tags"]
        
        corpus = f"{title.lower()} {summary.lower()} {' '.join(t.lower() for t in tags)}"
        if query_lower and query_lower not in corpus:
            continue

        score, reasons = score_job(title, summary, tags, custom_skills, custom_exclude)
        score = min(100, score + 5)
        reasons.append("Payment Verified Client")

        # Dynamic query link if query is active, otherwise real search feed link
        job_link = item["link"]
        if query_lower:
            job_link = f"https://www.upwork.com/nx/search/jobs/?q={urllib.parse.quote(query)}&sort=recency"

        job = Job(
            id=item["id"],
            platform="Upwork",
            title=title,
            company=item["company"],
            link=job_link,
            summary=summary,
            published=item["published"],
            budget=item["budget"],
            tags=tags,
            match_score=score,
            match_reasons=reasons
        )
        jobs.append(job)

    return jobs
