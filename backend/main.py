from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from services.fetchers.aggregator import get_all_jobs
from services.proposal_gen import generate_proposal
from models import ProposalRequest, ProposalResponse

app = FastAPI(title="AI Freelance Assistant API", version="2.0")

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
    return {"status": "ok", "version": "2.0"}

@app.get("/jobs")
def get_jobs(
    q: str = Query("", description="Keyword search"),
    platform: str = Query("all", description="Platform: all, upwork, remoteok, weworkremotely"),
    min_score: int = Query(0, description="Minimum match score (0-100)")
):
    jobs = get_all_jobs(query=q, platform=platform, min_score=min_score)
    return {
        "jobs": [j.model_dump() for j in jobs],
        "total": len(jobs),
        "platform": platform,
        "query": q
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
