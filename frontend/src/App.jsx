import React, { useState, useEffect } from "react";
import { fetchJobs, generateProposal } from "./api";
import JobCard from "./components/JobCard";
import ProposalModal from "./components/ProposalModal";
import PreferencesModal from "./components/PreferencesModal";
import CustomProposalModal from "./components/CustomProposalModal";

const DEFAULT_SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "WordPress",
  "WooCommerce",
];

// No default exclusions: give all control to the user!
const DEFAULT_EXCLUDE = [];

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
  const [isCustomOpen, setIsCustomOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 overflow-x-hidden">
      {/* Clean Non-Sticky Navbar */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
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
              onClick={() => setIsCustomOpen(true)}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1 border border-indigo-200/60"
            >
              <span>✍️</span>
              <span className="hidden xs:inline">Custom Job</span>
            </button>

            <button
              onClick={() => setIsPrefsOpen(true)}
              className="text-xs bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1 border border-slate-200/80"
            >
              <span>⚙️</span>
              <span className="hidden xs:inline">Tune</span>
            </button>

            <button
              onClick={() => loadJobs(query, activePlatform, minScore, skills, exclude)}
              className="text-xs bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-2.5 py-2 rounded-xl font-bold transition"
              aria-label="Refresh jobs"
            >
              🔄
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
                placeholder="Search across all platforms (React, WordPress, Node)..."
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

          {/* Row 2: Side-by-Side Mobile Dropdowns */}
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
                <option value="all">🌐 All Platforms ({jobs.length})</option>
                <option value="upwork">🟢 Upwork</option>
                <option value="remoteok">🔴 RemoteOK (100+ Live)</option>
                <option value="weworkremotely">🔵 We Work Remotely (75+ Live)</option>
              </select>
            </div>

            {/* Fit Score Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fit Filter
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>Show All Jobs (Unfiltered)</option>
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
              {exclude.length > 0 && ` • Excluded: ${exclude.length}`}
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

        {/* Upwork Live Search Banner */}
        {activePlatform === "upwork" && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 p-3.5 rounded-2xl mb-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <p className="font-bold text-emerald-950">
                  Upwork Live Marketplace
                </p>
                <p className="text-[11px] text-emerald-800">
                  Search live gigs on the Upwork App or paste any job to draft a proposal.
                </p>
              </div>
              <a
                href={`https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(
                  query || "react node web development"
                )}&sort=recency`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-center active:scale-95 transition shadow-xs text-xs whitespace-nowrap"
              >
                Search Upwork Marketplace ↗
              </a>
            </div>
          </div>
        )}

        {/* Count banner */}
        <div className="flex items-center justify-between mb-3 px-1 text-xs">
          <p className="text-slate-500">
            Displaying <strong className="text-slate-900 font-bold">{jobs.length}</strong>{" "}
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
              Try switching platforms, clearing the search query, or resetting filters.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setMinScore(0);
                setActivePlatform("all");
                setExclude([]);
                loadJobs("", "all", 0, skills, []);
              }}
              className="text-xs bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 active:scale-95 transition"
            >
              Reset All Filters
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

      {/* Custom Job Paste Modal */}
      {isCustomOpen && (
        <CustomProposalModal
          onClose={() => setIsCustomOpen(false)}
          onProposalGenerated={({ job, proposal: prop }) => {
            setIsCustomOpen(false);
            setSelectedJob(job);
            setProposal(prop);
          }}
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
