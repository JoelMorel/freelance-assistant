import React, { useState } from "react";
import { setUpworkMcpToken, clearUpworkMcpToken, testUpworkMcpConnection } from "../api";

export default function UpworkMcpModal({ isConnected, onClose, onTokenSaved }) {
  const [tokenInput, setTokenInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [msg, setMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setSaving(true);
    setMsg("");
    try {
      await setUpworkMcpToken(tokenInput.trim());
      setMsg("✅ Token saved! Testing connection...");
      const test = await testUpworkMcpConnection(tokenInput.trim());
      setTestResult(test);
      if (test.success) {
        setMsg("🎉 Upwork MCP connected and verified!");
        setTimeout(() => {
          onTokenSaved();
          onClose();
        }, 1500);
      } else {
        setMsg(`⚠️ Saved, but verification returned: ${test.error || "Check token"}`);
        onTokenSaved();
      }
    } catch (err) {
      setMsg("❌ Failed to save token. Check server connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestOnly = async () => {
    setTesting(true);
    setTestResult(null);
    setMsg("");
    try {
      const res = await testUpworkMcpConnection(tokenInput.trim() || null);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        error: "Failed to connect to backend test endpoint."
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Disconnect Upwork MCP token?")) return;
    try {
      await clearUpworkMcpToken();
      setTokenInput("");
      setTestResult(null);
      setMsg("Token cleared.");
      onTokenSaved();
    } catch (err) {
      setMsg("Failed to clear token.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                Upwork MCP Integration
              </h2>
              <p className="text-xs text-gray-500">
                Official Model Context Protocol (<code>mcp.upwork.com</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition active:scale-95 leading-none"
          >
            <span className="text-xl font-bold">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Status Pill */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isConnected
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isConnected
                ? "Upwork MCP: Active & Connected"
                : "Upwork MCP: Bearer Token Required"}
            </div>
            <span className="text-[11px] opacity-80 font-mono">
              mcp.upwork.com
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">How Upwork MCP Works:</p>
            <p>
              Upwork's official MCP server at <code>https://mcp.upwork.com/mcp</code> is protected by <strong>OAuth 2.1</strong>. It requires an authorization Bearer token to query the live marketplace via JSON-RPC.
            </p>
            <p className="text-[11px] text-slate-500">
              💡 <strong>Tip:</strong> You can paste your token below, or set <code>UPWORK_ACCESS_TOKEN</code> in your Railway backend variables so it stays permanently connected.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Enter Upwork Bearer / OAuth Token
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="oauth2:bearer:... or Bearer token"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            {msg && (
              <p className="text-xs font-semibold p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                {msg}
              </p>
            )}

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                <p className="font-bold">
                  {testResult.success ? "✅ Connection Successful" : "❌ Connection Test Failed"}
                </p>
                <p className="mt-1 text-[11px]">
                  {testResult.message || testResult.error}
                </p>
                {testResult.tools && testResult.tools.length > 0 && (
                  <p className="mt-1 text-[10px] font-mono text-emerald-800">
                    Discovered Tools: {testResult.tools.slice(0, 5).join(", ")}
                    {testResult.tools.length > 5 && ` +${testResult.tools.length - 5} more`}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestOnly}
                  disabled={testing}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition active:scale-95 disabled:opacity-50"
                >
                  {testing ? "Testing..." : "🔍 Test MCP Server"}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-2 rounded-xl transition active:scale-95"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving || !tokenInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs active:scale-95 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save & Connect"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
