import React, { useState, useEffect, useTransition } from "react";
import { fetchJobs, generateProposal } from "./api";
import JobCard from "./components/JobCard";
import ProposalModal from "./components/ProposalModal";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [activePlatform, setActivePlatform] = useState("all");
  const [minScore, setMinScore] = useState(0);

  // Proposal modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposal, setProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const loadJobs = async (searchQuery = query, platform = activePlatform, scoreThreshold = minScore) => {
    setLoading(true);
    try {
      const data = await fetchJobs(searchQuery, platform, scoreThreshold);
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(query, activePlatform, minScore);
  }, [activePlatform, minScore]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadJobs(query, activePlatform, minScore);
  };

  const handleGenerate = async (job) => {
    setSelectedJob(job);
    setIsGenerating(true);
    setProposal("Generating personalized proposal...");
    try {
      const prop = await generateProposal({
        title: job.title,
        description: job.summary,
        platform: job.platform,
        company: job.company,
        budget: job.budget,
      });
      setProposal(prop);
    } catch (err) {
      setProposal("Failed to generate proposal draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const platforms = [
    { id: "all", label: "All Platforms" },
    { id: "upwork", label: "Upwork" },
    { id: "remoteok", label: "RemoteOK" },
    { id: "weworkremotely", label: "We Work Remotely" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
              FA
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Freelance Assistant
              </h1>
              <p className="text-xs text-slate-500">
                Automated multi-platform job hunter & proposal writer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Upwork MCP Ready
            </span>
            <button
              onClick={() => loadJobs(query, activePlatform, minScore)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs by keyword (e.g. React, Next.js, WordPress, Node)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">
                🔍
              </span>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Platform Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    activePlatform === p.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Min Fit Score Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Match Filter:</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border-0 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>All Matches</option>
                <option value={50}>50%+ Fair Fit</option>
                <option value={75}>75%+ Good Fit</option>
                <option value={85}>85%+ Top Matches 🔥</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status / Count Banner */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-slate-600">
            Found <strong className="text-slate-900">{jobs.length}</strong>{" "}
            {jobs.length === 1 ? "opportunity" : "opportunities"}
            {minScore > 0 && ` with ≥ ${minScore}% match`}
          </p>
          {loading && (
            <span className="text-xs text-indigo-600 font-medium animate-pulse">
              Fetching live opportunities...
            </span>
          )}
        </div>

        {/* Jobs List */}
        {loading && jobs.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-12 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
            <span className="text-4xl block mb-2">🎯</span>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              No jobs matching this criteria
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Try lowering the match filter or clearing your search keywords.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setMinScore(0);
                setActivePlatform("all");
                loadJobs("", "all", 0);
              }}
              className="text-xs bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onGenerate={() => handleGenerate(job)}
                isGenerating={isGenerating && selectedJob?.id === job.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Proposal Modal */}
      {selectedJob && (
        <ProposalModal
          job={selectedJob}
          proposal={proposal}
          onClose={() => setSelectedJob(null)}
          onRegenerate={() => handleGenerate(selectedJob)}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
