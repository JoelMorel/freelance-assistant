import React from "react";

export default function JobCard({ job, onGenerate, isGenerating }) {
  const getPlatformBadge = (platform) => {
    switch (platform?.toLowerCase()) {
      case "upwork":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "remoteok":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "weworkremotely":
        return "bg-sky-100 text-sky-800 border-sky-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "bg-green-500 text-white";
    if (score >= 65) return "bg-amber-500 text-white";
    return "bg-slate-400 text-white";
  };

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition p-5 mb-4 rounded-xl border border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPlatformBadge(
                job.platform
              )}`}
            >
              {job.platform}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {job.company || "Direct Client"}
            </span>
            {job.published && (
              <span className="text-xs text-gray-400">• {job.published}</span>
            )}
          </div>

          <h2 className="font-semibold text-lg text-gray-900 leading-snug">
            {job.title}
          </h2>
        </div>

        {job.match_score > 0 && (
          <div
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm flex-shrink-0 ${getScoreColor(
              job.match_score
            )}`}
            title={job.match_reasons?.join(" | ")}
          >
            <span className="text-base leading-none font-black">
              {job.match_score}%
            </span>
            <span className="text-[10px] uppercase tracking-wider font-medium opacity-90">
              Match
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mt-2.5 line-clamp-3 leading-relaxed">
        {job.summary}
      </p>

      {/* Match highlights */}
      {job.match_reasons && job.match_reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {job.match_reasons.map((reason, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
            >
              ✓ {reason}
            </span>
          ))}
        </div>
      )}

      {/* Budget & Tags */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          {job.budget && (
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
              💰 {job.budget}
            </span>
          )}
          {job.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={job.link}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-gray-700 hover:text-black border border-gray-300 px-3 py-1.5 rounded-lg transition hover:bg-gray-50"
          >
            View Job ↗
          </a>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            <span>✨</span>
            <span>{isGenerating ? "Drafting..." : "Draft Proposal"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
