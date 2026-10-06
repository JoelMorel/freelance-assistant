import React from "react";
import { openJobLink, isMobileDevice } from "../utils/deepLink";

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
    if (score >= 85) return "bg-emerald-500 text-white";
    if (score >= 65) return "bg-amber-500 text-white";
    return "bg-slate-400 text-white";
  };

  return (
    <div className="bg-white shadow-xs hover:shadow-md transition p-4 sm:p-5 mb-3.5 rounded-2xl border border-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPlatformBadge(
                job.platform
              )}`}
            >
              {job.platform}
            </span>
            <span className="text-xs text-gray-500 font-medium truncate max-w-[160px] sm:max-w-none">
              {job.company || "Direct Client"}
            </span>
            {job.published && (
              <span className="text-[11px] text-gray-400">• {job.published}</span>
            )}
          </div>

          <h2 className="font-bold text-base sm:text-lg text-gray-900 leading-snug">
            {job.title}
          </h2>
        </div>

        {job.match_score > 0 && (
          <div
            className={`flex flex-col items-center justify-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-bold text-xs shadow-xs flex-shrink-0 ${getScoreColor(
              job.match_score
            )}`}
            title={job.match_reasons?.join(" | ")}
          >
            <span className="text-sm sm:text-base leading-none font-black">
              {job.match_score}%
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold opacity-90">
              Fit
            </span>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
        {job.summary}
      </p>

      {/* Match highlights */}
      {job.match_reasons && job.match_reasons.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {job.match_reasons.slice(0, 2).map((reason, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
            >
              ✓ {reason}
            </span>
          ))}
        </div>
      )}

      {/* Budget & Actions (stacked / responsive on mobile) */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {job.budget && (
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
              💰 {job.budget}
            </span>
          )}
          {job.tags?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <a
            href={job.link}
            target={isMobileDevice() ? "_self" : "_blank"}
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openJobLink(job.link, job.platform);
            }}
            className="flex-1 sm:flex-none text-center text-xs font-semibold text-slate-700 hover:text-black border border-slate-300 px-3 py-2.5 sm:py-1.5 rounded-xl transition hover:bg-slate-50 active:scale-95"
          >
            View Job ↗
          </a>
          <button
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2.5 sm:py-1.5 rounded-xl transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
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
