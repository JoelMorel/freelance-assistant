import os
import json
import httpx
import urllib.parse
from typing import List, Optional, Dict, Any
from models import Job
from services.scorer import score_job

UPWORK_MCP_URL = "https://mcp.upwork.com/mcp"
TOKEN_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".upwork_token.json")

def get_upwork_token() -> Optional[str]:
    """
    Retrieves the Upwork MCP OAuth token from environment variables or saved token store.
    """
    # 1. Environment variable (e.g. set in Railway Variables or .env)
    env_token = os.getenv("UPWORK_ACCESS_TOKEN") or os.getenv("UPWORK_MCP_TOKEN")
    if env_token:
        return env_token.strip()

    # 2. Local token file (saved via OAuth or manual connect)
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r") as f:
                data = json.load(f)
                return data.get("access_token")
        except Exception:
            pass

    return None

def save_upwork_token(token: str, refresh_token: Optional[str] = None):
    """
    Persists the Upwork MCP token.
    """
    try:
        with open(TOKEN_FILE, "w") as f:
            json.dump({
                "access_token": token.strip(),
                "refresh_token": refresh_token.strip() if refresh_token else None
            }, f)
    except Exception as e:
        print(f"[Upwork MCP] Failed to save token: {e}")

def delete_upwork_token():
    """
    Removes the stored Upwork MCP token file.
    """
    if os.path.exists(TOKEN_FILE):
        try:
            os.remove(TOKEN_FILE)
        except Exception as e:
            print(f"[Upwork MCP] Failed to remove token file: {e}")

def exchange_client_credentials(client_id: str, client_secret: str) -> Dict[str, Any]:
    """
    Exchanges Upwork Client ID & Client Secret for an OAuth Access Token.
    """
    url = "https://www.upwork.com/api/v3/oauth2/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id.strip(),
        "client_secret": client_secret.strip()
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, data=data, headers=headers)
            if resp.status_code == 200:
                res_json = resp.json()
                access_token = res_json.get("access_token")
                if access_token:
                    save_upwork_token(access_token, res_json.get("refresh_token"))
                    return {
                        "success": True,
                        "access_token": access_token,
                        "message": "Successfully generated Access Token from Client Credentials!"
                    }
            return {
                "success": False,
                "status_code": resp.status_code,
                "error": f"Upwork returned HTTP {resp.status_code}: {resp.text[:300]}"
            }
    except Exception as e:
        return {"success": False, "error": f"Request failed: {str(e)}"}

def exchange_auth_code(code: str, client_id: str, client_secret: str, redirect_uri: str) -> Dict[str, Any]:
    """
    Exchanges an OAuth Authorization Code for an Access Token.
    """
    url = "https://www.upwork.com/api/v3/oauth2/token"
    data = {
        "grant_type": "authorization_code",
        "code": code.strip(),
        "client_id": client_id.strip(),
        "client_secret": client_secret.strip(),
        "redirect_uri": redirect_uri.strip()
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, data=data, headers=headers)
            if resp.status_code == 200:
                res_json = resp.json()
                access_token = res_json.get("access_token")
                if access_token:
                    save_upwork_token(access_token, res_json.get("refresh_token"))
                    return {
                        "success": True,
                        "access_token": access_token,
                        "message": "Successfully exchanged Authorization Code for Access Token!"
                    }
            return {
                "success": False,
                "status_code": resp.status_code,
                "error": f"Upwork returned HTTP {resp.status_code}: {resp.text[:300]}"
            }
    except Exception as e:
        return {"success": False, "error": f"Request failed: {str(e)}"}

def test_upwork_mcp(token: Optional[str] = None) -> Dict[str, Any]:
    """
    Tests live communication with https://mcp.upwork.com/mcp using JSON-RPC tools/list.
    """
    active_token = token.strip() if token else get_upwork_token()
    if not active_token:
        return {
            "success": False,
            "status_code": 401,
            "error": "No token found. Please paste your Upwork Bearer token or configure UPWORK_ACCESS_TOKEN in Railway variables."
        }

    headers = {
        "Authorization": f"Bearer {active_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "FreelanceAssistant-MCP/1.0"
    }

    payload = {
        "jsonrpc": "2.0",
        "method": "tools/list",
        "params": {},
        "id": 1
    }

    try:
        with httpx.Client(timeout=12.0) as client:
            resp = client.post(UPWORK_MCP_URL, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                tools = data.get("result", {}).get("tools", [])
                tool_names = [t.get("name") for t in tools if isinstance(t, dict)]
                return {
                    "success": True,
                    "status_code": 200,
                    "message": f"Successfully connected to Upwork MCP! Discovered {len(tools)} tools.",
                    "tools": tool_names
                }
            elif resp.status_code == 401:
                return {
                    "success": False,
                    "status_code": 401,
                    "error": "Upwork rejected token with HTTP 401 (Unauthorized / Invalid Token)."
                }
            else:
                return {
                    "success": False,
                    "status_code": resp.status_code,
                    "error": f"Upwork MCP returned HTTP {resp.status_code}: {resp.text[:200]}"
                }
    except Exception as e:
        return {
            "success": False,
            "status_code": 500,
            "error": f"Connection failed: {str(e)}"
        }

def query_upwork_mcp(method_name: str, arguments: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
    """
    Sends a direct JSON-RPC 2.0 tool call to the official Upwork MCP Server.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "FreelanceAssistant-MCP/1.0"
    }

    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": method_name,
            "arguments": arguments
        },
        "id": 1
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(UPWORK_MCP_URL, json=payload, headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"[Upwork MCP] HTTP {resp.status_code}: {resp.text[:300]}")
    except Exception as e:
        print(f"[Upwork MCP] Connection error: {e}")

    return None

def fetch_upwork_jobs(
    query: str = "",
    custom_skills: Optional[List[str]] = None,
    custom_exclude: Optional[List[str]] = None
) -> List[Job]:
    """
    Fetches real live jobs directly from Upwork MCP when connected.
    Falls back to live search feeds if the OAuth token has not yet been authorized.
    """
    token = get_upwork_token()
    jobs: List[Job] = []

    # 1. LIVE UPWORK MCP CONNECTION
    if token:
        search_query = query.strip() or (", ".join(custom_skills) if custom_skills else "react developer")

        # Try possible tool names used by Upwork MCP for job search
        candidate_tools = ["upwork_search_jobs", "search_jobs", "jobs_search"]
        mcp_res = None
        for tool_name in candidate_tools:
            mcp_res = query_upwork_mcp(
                method_name=tool_name,
                arguments={
                    "query": search_query,
                    "paging": {"offset": 0, "count": 30}
                },
                token=token
            )
            if mcp_res and "result" in mcp_res:
                break

        if mcp_res and "result" in mcp_res:
            content = mcp_res["result"].get("content", [])
            for item in content:
                job_data = item.get("data", {}) if isinstance(item, dict) else {}
                if not job_data and isinstance(item, dict) and "text" in item:
                    try:
                        job_data = json.loads(item["text"])
                    except Exception:
                        pass

                if job_data:
                    title = job_data.get("title", "Upwork Opportunity")
                    summary = job_data.get("description", "") or job_data.get("snippet", "")
                    tags = job_data.get("skills", []) or job_data.get("attrs", [])
                    job_id = job_data.get("id", f"upwork-{abs(hash(title))}")
                    url = job_data.get("url") or job_data.get("ciphertext") or f"https://www.upwork.com/jobs/{job_id}"
                    budget = job_data.get("budget") or job_data.get("amount") or job_data.get("hourly_rate")

                    score, reasons = score_job(title, summary, tags, custom_skills, custom_exclude)
                    reasons.append("⚡ Verified Upwork MCP Live Stream")

                    jobs.append(Job(
                        id=f"upwork-mcp-{job_id}",
                        platform="Upwork (MCP Live)",
                        title=title,
                        company=job_data.get("client", {}).get("country", "Upwork Client"),
                        link=url,
                        summary=summary[:450],
                        published=job_data.get("created_on", "Recent")[:10],
                        budget=str(budget) if budget else "Competitive",
                        tags=tags[:6],
                        match_score=score,
                        match_reasons=reasons
                    ))

            if jobs:
                return jobs

    # 2. IF MCP NOT CONNECTED YET:
    # Dynamically generate search links tailored to the user's actual query and skills
    user_keywords = []
    if query.strip():
        user_keywords.append(query.strip())
    if custom_skills:
        for s in custom_skills:
            if s.lower() not in [k.lower() for k in user_keywords]:
                user_keywords.append(s)

    # Defaults if neither query nor custom_skills provided
    if not user_keywords:
        user_keywords = ["React Developer", "Next.js", "Node.js", "WordPress", "Shopify", "Full Stack"]

    for kw in user_keywords:
        live_link = f"https://www.upwork.com/nx/search/jobs/?q={urllib.parse.quote(kw)}&sort=recency"
        score, reasons = score_job(
            f"{kw} Opportunities",
            f"Live marketplace search on Upwork for '{kw}'. Connect Upwork MCP in the header bar for direct API data.",
            [kw, "Remote", "Upwork"],
            custom_skills,
            custom_exclude
        )
        reasons.append("⚡ Connect Upwork MCP for Live API Streaming")

        jobs.append(Job(
            id=f"upwork-feed-{abs(hash(kw)) % 1000000}",
            platform="Upwork",
            title=f"Upwork Jobs: {kw}",
            company="Upwork Marketplace (Authorize MCP for live stream)",
            link=live_link,
            summary=f"Click 'View Job' to browse all live Upwork listings for '{kw}' directly in the Upwork App. To pull raw API jobs directly into this feed, tap '⚡ Upwork MCP' in the top bar and enter your token.",
            published="Real-Time",
            budget="Market Rate",
            tags=[kw, "Upwork", "Marketplace"],
            match_score=score,
            match_reasons=reasons
        ))

    return jobs

