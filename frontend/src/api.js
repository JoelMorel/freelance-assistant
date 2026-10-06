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

export async function fetchJobs(query = "", platform = "all", minScore = 0) {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (platform) params.append("platform", platform);
  if (minScore) params.append("min_score", minScore);

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
