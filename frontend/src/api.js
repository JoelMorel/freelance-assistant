import axios from "axios";

// Automatically uses deployed backend URL in production, or localhost in development
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchJobs(query = "", platform = "all", minScore = 0) {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (platform) params.append("platform", platform);
  if (minScore) params.append("min_score", minScore);

  const res = await axios.get(`${API_BASE}/jobs?${params.toString()}`);
  return res.data.jobs || [];
}

export async function generateProposal({ title, description, platform, company, budget }) {
  const res = await axios.post(`${API_BASE}/generate`, {
    title,
    description,
    platform: platform || "Upwork",
    company: company || "",
    budget: budget || ""
  });
  return res.data.proposal;
}
