import React, { useState } from "react";

const SUGGESTED_SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "WordPress",
  "WooCommerce",
  "Shopify",
  "Tailwind",
  "SEO",
  "PHP",
  "Full-Stack",
  "Stripe",
];

const SUGGESTED_EXCLUDES = [
  "C++",
  "Embedded",
  "DevOps",
  "Kubernetes",
  "iOS/Android",
  "Junior",
  "Angular",
  "Vue",
];

export default function PreferencesModal({
  skills,
  exclude,
  onSave,
  onClose,
}) {
  const [selectedSkills, setSelectedSkills] = useState(skills);
  const [selectedExclude, setSelectedExclude] = useState(exclude);
  const [customSkill, setCustomSkill] = useState("");
  const [customExcludeInput, setCustomExcludeInput] = useState("");

  const toggleSkill = (sk) => {
    if (selectedSkills.includes(sk)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== sk));
    } else {
      setSelectedSkills([...selectedSkills, sk]);
    }
  };

  const toggleExclude = (ex) => {
    if (selectedExclude.includes(ex)) {
      setSelectedExclude(selectedExclude.filter((e) => e !== ex));
    } else {
      setSelectedExclude([...selectedExclude, ex]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const val = customSkill.trim();
    if (val && !selectedSkills.includes(val)) {
      setSelectedSkills([...selectedSkills, val]);
      setCustomSkill("");
    }
  };

  const handleAddCustomExclude = (e) => {
    e.preventDefault();
    const val = customExcludeInput.trim();
    if (val && !selectedExclude.includes(val)) {
      setSelectedExclude([...selectedExclude, val]);
      setCustomExcludeInput("");
    }
  };

  const handleSave = () => {
    onSave({ skills: selectedSkills, exclude: selectedExclude });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              Job Match Preferences
            </h2>
            <p className="text-xs text-gray-500">
              Customize how jobs are scored & filtered
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition active:scale-95 leading-none"
          >
            <span className="text-xl font-bold">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Target Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                Target Skills (+20 pts each)
              </span>
              <span className="text-gray-400 text-xs">
                {selectedSkills.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {SUGGESTED_SKILLS.map((sk) => {
                const active = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition active:scale-95 text-xs ${
                      active
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {active ? `✓ ${sk}` : `+ ${sk}`}
                  </button>
                );
              })}
            </div>

            {/* Custom skill input */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-1.5">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add other skill (e.g. Supabase, GraphQL)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs active:scale-95"
              >
                Add
              </button>
            </form>
          </div>

          {/* Excluded Keywords */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-rose-700 uppercase tracking-wider text-[11px]">
                Exclude / Penalize (-35 pts)
              </span>
              <span className="text-gray-400 text-xs">
                {selectedExclude.length} active
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {SUGGESTED_EXCLUDES.map((ex) => {
                const active = selectedExclude.includes(ex);
                return (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => toggleExclude(ex)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition active:scale-95 text-xs ${
                      active
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {active ? `✕ ${ex}` : `+ ${ex}`}
                  </button>
                );
              })}
            </div>

            {/* Custom exclude input */}
            <form onSubmit={handleAddCustomExclude} className="flex gap-1.5">
              <input
                type="text"
                value={customExcludeInput}
                onChange={(e) => setCustomExcludeInput(e.target.value)}
                placeholder="Add keyword to avoid (e.g. Java, Blockchain)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs active:scale-95"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setSelectedSkills(SUGGESTED_SKILLS.slice(0, 6));
              setSelectedExclude(SUGGESTED_EXCLUDES.slice(0, 4));
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-gray-600 px-3.5 py-2.5 rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs active:scale-95 transition"
            >
              Apply & Rescore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
