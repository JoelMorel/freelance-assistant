import React, { useState } from "react";

export default function ProposalModal({ job, proposal, onClose, onRegenerate, isGenerating }) {
  const [copied, setCopied] = useState(false);
  const [editedText, setEditedText] = useState(proposal);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const wordCount = editedText ? editedText.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {job.platform}
              </span>
              <span className="text-xs text-gray-500">
                {job.company || "Client"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {job.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Personalized Proposal Draft
            </span>
            <span className="text-xs text-gray-400">
              {wordCount} words
            </span>
          </div>

          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={10}
            className="w-full p-4 border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/30"
            placeholder="Proposal content will appear here..."
          />

          <p className="text-xs text-gray-400 mt-2">
            💡 Tip: You can edit this draft directly before copying or submitting.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isGenerating}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50 disabled:opacity-50"
              >
                🔄 {isGenerating ? "Regenerating..." : "Regenerate"}
              </button>
            )}
            <a
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg transition hover:underline"
            >
              Open Job Page ↗
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-medium text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition hover:bg-gray-200/50"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5 ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <span>{copied ? "✓ Copied to Clipboard" : "📋 Copy Proposal"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
