from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.fetchers.aggregator import get_all_jobs
from services.fetchers.upwork import (
    get_upwork_token,
    save_upwork_token,
    delete_upwork_token,
    test_upwork_mcp,
    exchange_client_credentials,
    exchange_auth_code
)
from services.proposal_gen import generate_proposal
from models import ProposalRequest, ProposalResponse

app = FastAPI(title="AI Freelance Assistant API", version="2.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenPayload(BaseModel):
    token: str

class TestTokenPayload(BaseModel):
    token: Optional[str] = None

class CredentialsPayload(BaseModel):
    client_id: str
    client_secret: str
    redirect_uri: Optional[str] = None
    code: Optional[str] = None

@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "2.2",
        "upwork_mcp_connected": bool(get_upwork_token())
    }

@app.get("/auth/upwork/status")
def upwork_status():
    token = get_upwork_token()
    return {
        "connected": bool(token),
        "mcp_url": "https://mcp.upwork.com/mcp",
        "hint": "Set UPWORK_ACCESS_TOKEN in Railway or enter via dashboard modal."
    }

@app.post("/auth/upwork/token")
def set_upwork_token(payload: TokenPayload):
    if not payload.token.strip():
        raise HTTPException(status_code=400, detail="Token cannot be empty")
    save_upwork_token(payload.token.strip())
    return {"status": "success", "message": "Upwork MCP token saved successfully!"}

@app.delete("/auth/upwork/token")
def remove_upwork_token():
    delete_upwork_token()
    return {"status": "success", "message": "Upwork MCP token cleared."}

@app.post("/auth/upwork/test")
def test_upwork_endpoint(payload: TestTokenPayload):
    return test_upwork_mcp(payload.token)

@app.post("/auth/upwork/exchange")
def exchange_upwork_credentials(payload: CredentialsPayload):
    if payload.code:
        return exchange_auth_code(
            code=payload.code,
            client_id=payload.client_id,
            client_secret=payload.client_secret,
            redirect_uri=payload.redirect_uri or ""
        )
    return exchange_client_credentials(
        client_id=payload.client_id,
        client_secret=payload.client_secret
    )

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
        "upwork_mcp_active": bool(get_upwork_token()),
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
