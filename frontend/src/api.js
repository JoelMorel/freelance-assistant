import axios from "axios";

// Normalize configured backend URL
let rawBase = import.meta.env.VITE_API_BASE_URL || "";
if (rawBase && !rawBase.startsWith("http://") && !rawBase.startsWith("https://")) {
  rawBase = `https://${rawBase}`;
}
if (rawBase.endsWith("/")) {
  rawBase = rawBase.slice(0, -1);
}

// In development: use localhost:8000
// In production: if rawBase exists and isn't localhost, use it; otherwise use relative path "" so frontend proxy forwards it
const API_BASE = (rawBase && !rawBase.includes("localhost"))
  ? rawBase
  : (import.meta.env.DEV ? "http://localhost:8000" : "");

export async function fetchJobs(
  query = "",
  platform = "all",
  minScore = 0,
  skills = [],
  exclude = []
) {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (platform) params.append("platform", platform);
  if (minScore) params.append("min_score", minScore);
  if (skills && skills.length > 0) params.append("skills", skills.join(","));
  if (exclude && exclude.length > 0) params.append("exclude", exclude.join(","));

  try {
    const res = await axios.get(`${API_BASE}/jobs?${params.toString()}`);
    return res.data.jobs || [];
  } catch (err) {
    console.error("fetchJobs error:", err);
    throw err;
  }
}

export async function generateProposal({ title, description, platform, company, budget }) {
  try {
    const res = await axios.post(`${API_BASE}/generate`, {
      title,
      description,
      platform: platform || "Upwork",
      company: company || "",
      budget: budget || ""
    });
    return res.data.proposal;
  } catch (err) {
    console.error("generateProposal error:", err);
    throw err;
  }
}

export async function getUpworkMcpStatus() {
  try {
    const res = await axios.get(`${API_BASE}/auth/upwork/status`);
    return res.data;
  } catch (err) {
    return { connected: false };
  }
}

export async function setUpworkMcpToken(token) {
  const res = await axios.post(`${API_BASE}/auth/upwork/token`, { token });
  return res.data;
}

export async function clearUpworkMcpToken() {
  const res = await axios.delete(`${API_BASE}/auth/upwork/token`);
  return res.data;
}

export async function testUpworkMcpConnection(token = null) {
  try {
    const res = await axios.post(`${API_BASE}/auth/upwork/test`, { token });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || err.message || "Failed to reach server"
    };
  }
}

export async function exchangeUpworkCredentials({ clientId, clientSecret, redirectUri = "", code = "" }) {
  try {
    const res = await axios.post(`${API_BASE}/auth/upwork/exchange`, {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code
    });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || err.message || "Failed to reach server"
    };
  }
}
