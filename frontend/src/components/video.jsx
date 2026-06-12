// src/components/Video.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Video, Youtube, Loader2, ExternalLink, Search, ArrowLeft } from "lucide-react";
import { getVideos } from "../api/client";

function VideoCard({ video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="aurora-card p-4 flex gap-4 hover:scale-[1.01] transition-all"
    >
      {video.thumbnail && (
        <img src={video.thumbnail} alt={video.title} className="w-40 h-24 rounded-lg object-cover" />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Youtube size={16} className="text-red-500" />
          <h3 className="font-semibold text-stone-800">{video.title}</h3>
        </div>
        <p className="text-sm text-stone-600 mb-2">{video.description}</p>
        <div className="flex items-center gap-2 text-violet-600 text-sm">
          <ExternalLink size={14} />
          Watch Video
        </div>
      </div>
    </a>
  );
}

// ── Props: isReady, onBack, prefillTopic (NEW) ────────────────────────────────
export default function VideoPage({ isReady, onBack, prefillTopic }) {
  const [topic,   setTopic]   = useState("");
  const [videos,  setVideos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ── Prefill topic from Dashboard weak-topic "Videos" button ──
  useEffect(() => {
    if (prefillTopic) setTopic(prefillTopic);
  }, [prefillTopic]);

  const handleSearch = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setVideos([]);
    try {
      const res = await getVideos(topic);
      setVideos(res.videos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topic]);

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
          <h1 className="font-display text-xl text-stone-900 font-bold">Video Recommendations</h1>
          <p className="text-xs text-stone-500 font-body">Find educational videos related to your PDF topic</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="aurora-card p-6 space-y-4">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Neural Networks"
              className="w-full bg-white/80 border border-aurora-sand rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={!isReady || !topic.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-40 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Searching…</> : <><Search size={16} />Find Videos</>}
            </button>
          </div>

          {!isReady && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              ⚠️ Upload a PDF before searching for videos.
            </div>
          )}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {videos.length > 0 && (
            <div className="space-y-4">
              {videos.map((video, index) => <VideoCard key={index} video={video} />)}
            </div>
          )}

          {!loading && videos.length === 0 && topic && (
            <div className="aurora-card p-6 text-center text-stone-500">
              <Video size={32} className="mx-auto mb-3" />
              No videos found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
