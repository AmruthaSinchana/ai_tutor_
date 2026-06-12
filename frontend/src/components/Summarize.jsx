// src/components/Summarize.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  FileText,
  AlignLeft,
  List,
  BookMarked,
  Key,
  Loader2,
  Copy,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { summarize } from "../api/client";

const SUMMARY_TYPES = [
  { id: "summary",  label: "Overview",      icon: AlignLeft,  desc: "Comprehensive summary of the topic", color: "violet" },
  { id: "revision", label: "Revision Notes", icon: BookMarked, desc: "Structured notes for exam prep",     color: "orange" },
  { id: "bullets",  label: "Bullet Points",  icon: List,       desc: "Key points in scannable format",     color: "amber"  },
  { id: "keyterms", label: "Key Terms",      icon: Key,        desc: "Definitions of important terms",     color: "indigo" },
];

const colorMap = {
  violet: { active: "border-violet-500 bg-violet-50 text-violet-700", icon: "text-violet-500", tag: "bg-violet-100 text-violet-700" },
  orange: { active: "border-orange-400 bg-orange-50 text-orange-700", icon: "text-orange-500", tag: "bg-orange-100 text-orange-700" },
  amber:  { active: "border-amber-400 bg-amber-50 text-amber-700",    icon: "text-amber-500",  tag: "bg-amber-100 text-amber-700"   },
  indigo: { active: "border-indigo-400 bg-indigo-50 text-indigo-700", icon: "text-indigo-500", tag: "bg-indigo-100 text-indigo-700" },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-violet-600 transition-colors font-body">
      {copied ? <><CheckCheck size={13} className="text-violet-500" /> Copied!</> : <><Copy size={13} /> Copy</>}
    </button>
  );
}

function ResultCard({ content, summaryType }) {
  const type   = SUMMARY_TYPES.find((t) => t.id === summaryType);
  const colors = colorMap[type?.color || "violet"];
  return (
    <div className="aurora-card p-6 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type && <type.icon size={15} className={colors.icon} />}
          <span className={`tag-pill ${colors.tag}`}>{type?.label}</span>
        </div>
        <CopyButton text={content} />
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="text-stone-700 font-body text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}

// ── Props: isReady, onBack, prefillTopic (NEW) ────────────────────────────────
export default function Summarize({ isReady, onBack, prefillTopic }) {
  const [topic,       setTopic]       = useState("");
  const [summaryType, setSummaryType] = useState("summary");
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  // ── Prefill topic from Dashboard weak-topic "Notes" button ──
  useEffect(() => {
    if (prefillTopic) setTopic(prefillTopic);
  }, [prefillTopic]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await summarize(topic, summaryType);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topic, summaryType]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-aurora-sand/60 bg-white/40 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-violet-600 transition-colors font-body"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 className="font-display text-xl text-stone-900 font-bold">Summarize</h1>
          <p className="text-xs text-stone-500 font-body">Generate summaries, notes & key terms from your document</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="aurora-card p-6 space-y-5">
            <div>
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-body block mb-2">
                Topic / Chapter
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="e.g. The French Revolution, Chapter 5"
                className="w-full bg-white/80 border border-aurora-sand rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all font-body"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-body block mb-3">
                Output Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUMMARY_TYPES.map(({ id, label, icon: Icon, desc, color }) => {
                  const colors   = colorMap[color];
                  const isActive = summaryType === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSummaryType(id)}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        isActive ? colors.active : "border-stone-200 hover:border-stone-300 text-stone-600"
                      }`}
                    >
                      <Icon size={15} className={`mt-0.5 flex-shrink-0 ${isActive ? colors.icon : "text-stone-400"}`} />
                      <div>
                        <div className="text-xs font-semibold font-body">{label}</div>
                        <div className="text-xs text-stone-400 font-body mt-0.5">{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {!isReady && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-body">
              ⚠️ Upload a PDF in the sidebar before generating summaries.
            </div>
          )}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-body">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!isReady || !topic.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-body font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Generating…</>
            ) : (
              <><FileText size={16} />Generate {SUMMARY_TYPES.find((t) => t.id === summaryType)?.label}</>
            )}
          </button>

          {result && <ResultCard content={result.content} summaryType={result.summary_type} />}
        </div>
      </div>
    </div>
  );
}