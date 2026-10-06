from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from services.fetchers.aggregator import get_all_jobs
from services.proposal_gen import generate_proposal
from models import ProposalRequest, ProposalResponse

app = FastAPI(title="AI Freelance Assistant API", version="2.1")

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.1"}

@app.get("/jobs")
def get_jobs(
    q: str = Query("", description="Keyword search"),
    platform: str = Query("all", description="Platform: all, upwork, remoteok, weworkremotely"),
    min_score: int = Query(0, description="Minimum match score (0-100)"),
    skills: str = Query("", description="Comma-separated skills to prioritize"),
    exclude: str = Query("", description="Comma-separated keywords to exclude")
):
    skills_list = [s.strip() for s in skills.split(",") if s.strip()] if skills else None
    exclude_list = [e.strip() for e in exclude.split(",") if e.strip()] if exclude else None

    jobs = get_all_jobs(
        query=q,
        platform=platform,
        min_score=min_score,
        custom_skills=skills_list,
        custom_exclude=exclude_list
    )
    return {
        "jobs": [j.model_dump() for j in jobs],
        "total": len(jobs),
        "platform": platform,
        "query": q,
        "skills": skills_list or [],
        "exclude": exclude_list or []
    }

@app.post("/generate", response_model=ProposalResponse)
def gen_proposal(req: ProposalRequest):
    proposal = generate_proposal(
        title=req.title,
        description=req.description,
        platform=req.platform,
        company=req.company or "",
        budget=req.budget or ""
    )
    return ProposalResponse(proposal=proposal)
