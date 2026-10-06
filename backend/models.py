from pydantic import BaseModel
from typing import List, Optional

class Job(BaseModel):
    id: str
    platform: str = "Upwork"  # "Upwork", "RemoteOK", "WeWorkRemotely"
    title: str
    company: Optional[str] = "Client"
    link: str
    summary: str
    published: Optional[str] = ""
    budget: Optional[str] = None
    tags: List[str] = []
    match_score: int = 0
    match_reasons: List[str] = []

class ProposalRequest(BaseModel):
    title: str
    description: str
    platform: Optional[str] = "Upwork"
    company: Optional[str] = ""
    budget: Optional[str] = None

class ProposalResponse(BaseModel):
    proposal: str
