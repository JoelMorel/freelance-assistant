import React, { useState } from "react";

export default function ProposalModal({
  job,
  proposal,
  onClose,
  onRegenerate,
  isGenerating,
}) {
  const [copied, setCopied] = useState(false);
  const [editedText, setEditedText] = useState(proposal);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    if ("vibrate" in navigator) {
      navigator.vibrate([40]); // Subtle haptic buzz on Android
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Proposal for ${job.title}`,
          text: editedText,
          url: job.link,
        });
      } catch (err) {
        // User canceled share
      }
    } else {
      handleCopy();
    }
  };

  const wordCount = editedText ? editedText.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      {/* Container: Full bottom-sheet on phone, centered modal on tablet/desktop */}
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 flex items-start justify-between bg-slate-50/70">
          <div className="pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                {job.platform}
              </span>
              <span className="text-xs text-gray-500 font-medium truncate max-w-[180px] sm:max-w-xs">
                {job.company || "Client"}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">
              {job.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition active:scale-95 leading-none"
          >
            <span className="text-xl font-bold">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Proposal Draft
            </span>
            <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full">
              {wordCount} words
            </span>
          </div>

          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={10}
            className="w-full p-3.5 sm:p-4 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40 resize-none"
            placeholder="Proposal content will appear here..."
          />

          <p className="text-[11px] text-gray-400">
            💡 Tap text to edit directly before copying or applying.
          </p>
        </div>

        {/* Sticky Mobile Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Quick links & regenerate */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isGenerating}
                className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-xl transition active:scale-95 disabled:opacity-50"
              >
                🔄 {isGenerating ? "Drafting..." : "Redo"}
              </button>
            )}

            <a
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-xl transition hover:bg-indigo-50 active:scale-95"
            >
              Open Job ↗
            </a>
          </div>

          {/* Action buttons (thumb accessible) */}
          <div className="flex items-center gap-2">
            {/* Native Android Share */}
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="flex-1 sm:flex-none text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 px-3.5 py-3 sm:py-2.5 rounded-xl transition active:scale-95 text-center"
              >
                📤 Share
              </button>
            )}

            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-none text-xs font-bold px-5 py-3 sm:py-2.5 rounded-xl transition shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <span>{copied ? "✓ Copied!" : "📋 Copy Proposal"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
