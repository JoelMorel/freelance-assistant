import React, { useState, useEffect } from "react";
import { fetchJobs, generateProposal } from "./api";
import JobCard from "./components/JobCard";
import ProposalModal from "./components/ProposalModal";
import PreferencesModal from "./components/PreferencesModal";

const DEFAULT_SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "WordPress",
  "WooCommerce",
];

const DEFAULT_EXCLUDE = ["C++", "Embedded", "DevOps", "Kubernetes"];

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [activePlatform, setActivePlatform] = useState("all");
  const [minScore, setMinScore] = useState(0);

  // User preferences (skills and negative keywords)
  const [skills, setSkills] = useState(() => {
    try {
      const saved = localStorage.getItem("fa_user_skills");
      return saved ? JSON.parse(saved) : DEFAULT_SKILLS;
    } catch {
      return DEFAULT_SKILLS;
    }
  });

  const [exclude, setExclude] = useState(() => {
    try {
      const saved = localStorage.getItem("fa_user_exclude");
      return saved ? JSON.parse(saved) : DEFAULT_EXCLUDE;
    } catch {
      return DEFAULT_EXCLUDE;
    }
  });

  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  // Proposal modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposal, setProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const loadJobs = async (
    searchQuery = query,
    platform = activePlatform,
    scoreThreshold = minScore,
    activeSkills = skills,
    activeExclude = exclude
  ) => {
    setLoading(true);
    try {
      const data = await fetchJobs(
        searchQuery,
        platform,
        scoreThreshold,
        activeSkills,
        activeExclude
      );
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(query, activePlatform, minScore, skills, exclude);
  }, [activePlatform, minScore, skills, exclude]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadJobs(query, activePlatform, minScore, skills, exclude);
  };

  const handleSavePreferences = ({ skills: newSkills, exclude: newExclude }) => {
    setSkills(newSkills);
    setExclude(newExclude);
    try {
      localStorage.setItem("fa_user_skills", JSON.stringify(newSkills));
      localStorage.setItem("fa_user_exclude", JSON.stringify(newExclude));
    } catch (err) {
      console.error("Failed to persist preferences", err);
    }
    loadJobs(query, activePlatform, minScore, newSkills, newExclude);
  };

  const handleGenerate = async (job) => {
    setSelectedJob(job);
    setIsGenerating(true);
    setProposal("Writing customized proposal using your profile...");
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Mobile-Optimized Sticky Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              FA
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
                Freelance AI
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Live Opportunity Radar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrefsOpen(true)}
              className="text-xs bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 border border-slate-200/80"
              aria-label="Tuning preferences"
            >
              <span>⚙️</span>
              <span className="hidden xs:inline">Preferences</span>
            </button>

            <button
              onClick={() => loadJobs(query, activePlatform, minScore, skills, exclude)}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1"
              aria-label="Refresh jobs"
            >
              <span>🔄</span>
              <span className="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 pt-4 sm:pt-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200 mb-4 space-y-3">
          {/* Row 1: Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                enterKeyHint="search"
                placeholder="Search keywords (React, Next.js, WordPress)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60"
              />
              <span className="absolute left-3 top-3 text-slate-400 text-sm">
                🔍
              </span>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs"
            >
              Find
            </button>
          </form>

          {/* Row 2: Clean Side-by-Side Mobile Dropdowns */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {/* Platform Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Platform
              </label>
              <select
                value={activePlatform}
                onChange={(e) => setActivePlatform(e.target.value)}
                className="w-full bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">🌐 All Platforms</option>
                <option value="upwork">🟢 Upwork</option>
                <option value="remoteok">🔴 RemoteOK</option>
                <option value="weworkremotely">🔵 We Work Remotely</option>
              </select>
            </div>

            {/* Fit Score Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fit Score
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>🎯 All Fits</option>
                <option value={60}>⚡ 60%+ Match</option>
                <option value={80}>🔥 80%+ Top Matches</option>
              </select>
            </div>
          </div>

          {/* Active Skills Pill Bar */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span className="truncate pr-2">
              <strong>Prioritizing:</strong> {skills.slice(0, 4).join(", ")}
              {skills.length > 4 && ` +${skills.length - 4}`}
            </span>
            <button
              type="button"
              onClick={() => setIsPrefsOpen(true)}
              className="text-indigo-600 font-bold hover:underline whitespace-nowrap active:scale-95"
            >
              Tune ⚙️
            </button>
          </div>
        </div>

        {/* Count banner */}
        <div className="flex items-center justify-between mb-3 px-1 text-xs">
          <p className="text-slate-500">
            Found <strong className="text-slate-900 font-bold">{jobs.length}</strong>{" "}
            {jobs.length === 1 ? "gig" : "gigs"}
          </p>
          {loading && (
            <span className="text-indigo-600 font-bold animate-pulse">
              Syncing live feeds...
            </span>
          )}
        </div>

        {/* Jobs List */}
        {loading && jobs.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-2.5"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-5 bg-slate-200 rounded w-4/5"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
            <span className="text-4xl block mb-2">🎯</span>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              No matching gigs found
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Try switching platforms, lowering the fit score, or tuning skills.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setMinScore(0);
                setActivePlatform("all");
                loadJobs("", "all", 0, skills, exclude);
              }}
              className="text-xs bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 active:scale-95 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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

      {/* Preferences / Tuning Modal */}
      {isPrefsOpen && (
        <PreferencesModal
          skills={skills}
          exclude={exclude}
          onSave={handleSavePreferences}
          onClose={() => setIsPrefsOpen(false)}
        />
      )}

      {/* Mobile Bottom-Sheet Proposal Modal */}
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
