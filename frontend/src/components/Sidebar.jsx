// src/components/Sidebar.jsx
import React, { useRef } from "react";
import {
  MessageSquare,
  Brain,
  FileText,
  Upload,
  BookOpen,
  CheckCircle,
  Loader2,
  AlertCircle,
  Video,
  ArrowLeft,
  LogOut,
  User,
  Download,
  LayoutDashboard,
  X,// ← NEW
} from "lucide-react";

const NAV_ITEMS = [
  { id: "chat", label: "Ask AI", icon: MessageSquare, desc: "Q&A from your PDFs" },
  { id: "quiz", label: "Quiz Me", icon: Brain, desc: "Test your knowledge" },
  { id: "summarize", label: "Summarize", icon: FileText, desc: "Summaries & notes" },
  { id: "video", label: "Videos", icon: Video, desc: "Related Videos" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Progress & weak topics" }, // ← NEW
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isReady,
  uploadedFiles,
  setUploadedFiles,
  isUploading,
  uploadError,
  uploadSuccess,
  handleUpload,
  onBack,
  onLogout,
  user,
}) {
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) handleUpload(files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith(".pdf"));
    if (files.length) handleUpload(files);
  };

  // Download chunks as a JSON file
  const handleDownloadChunks = async () => {
    try {
      const res = await fetch("http://localhost:8000/chunks");
      if (!res.ok) throw new Error("Failed to fetch chunks");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chunks.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download chunks: " + err.message);
    }
  };
  const removePdf = async (filename) => {
  try {
    console.log("Deleting:", filename);

    const res = await fetch(
      `http://localhost:8000/pdfs-by-name/${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
      }
    );

    console.log("Status:", res.status);

    const text = await res.text();
    console.log("Response:", text);

    if (!res.ok) {
      throw new Error(`Delete failed: ${res.status}`);
    }

    setUploadedFiles((prev) =>
      prev.filter(
        (file) =>
          (typeof file === "string" ? file : file.filename) !== filename
      )
    );
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #2e1065 100%)",
      }}
    >
      {/* Logo + Back */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors font-body"
          >
            <ArrowLeft size={13} /> Back to Home
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display text-white font-semibold text-base leading-tight">AI Tutor</div>
            <div className="text-xs text-indigo-400 font-body">RAG + Groq</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-5 flex-1">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Study Tools
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => (
            <li key={id}>
              <button
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left group transition-all ${activeTab === id
                  ? "bg-violet-600/30 border border-violet-500/40"
                  : "hover:bg-white/5 border border-transparent"
                  }`}
              >
                <Icon
                  size={18}
                  className={activeTab === id ? "text-violet-300" : "text-indigo-500 group-hover:text-indigo-300"}
                />
                <div>
                  <div className={`text-sm font-medium font-body ${activeTab === id ? "text-violet-100" : "text-indigo-300"}`}>
                    {label}
                  </div>
                  <div className="text-xs text-indigo-500">{desc}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upload section */}
      <div className="px-4 pb-4 space-y-3">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest px-1 mb-2">
          Documents
        </p>

        {uploadedFiles.length > 0 && (
          <div className="space-y-1 mb-1">
            {uploadedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <CheckCircle
                    size={13}
                    className="text-violet-400 flex-shrink-0"
                  />

                  <span className="text-xs text-indigo-200 truncate font-body">
                    {typeof f === "string" ? f : f.filename}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    removePdf(typeof f === "string" ? f : f.filename);
                    console.log(f);
                  }}
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  <X size={14} />
                </button>


              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 rounded-xl p-4 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-200 group"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={20} className="text-violet-400 animate-spin" />
              <p className="text-xs text-indigo-400">Processing PDFs…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={20} className="text-indigo-500 group-hover:text-violet-400 transition-colors" />
              <p className="text-xs text-indigo-400 group-hover:text-indigo-300">Drop PDFs or click to upload</p>
              <p className="text-xs text-indigo-600">Up to 50MB each</p>
            </div>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={onFileChange} className="hidden" />

        {/* Download Chunks */}
        {isReady && (
          <button
            onClick={handleDownloadChunks}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-body font-medium text-indigo-200 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
          >
            <Download size={13} />
            Download Chunks
          </button>
        )}

        {uploadError && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">{uploadError}</p>
          </div>
        )}
        {uploadSuccess && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <CheckCircle size={13} className="text-violet-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-violet-300">{uploadSuccess}</p>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isReady ? "bg-violet-400 animate-pulse" : "bg-indigo-700"}`} />
          <span className="text-xs text-indigo-400">
            {isReady ? "Ready to study" : "Upload a PDF to begin"}
          </span>
        </div>
      </div>

      {/* User + Logout */}
      <div className="px-4 pb-5 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-600/50 border border-violet-400/30 flex items-center justify-center">
              <User size={13} className="text-violet-200" />
            </div>
            <span className="text-xs text-indigo-200 font-body font-medium truncate max-w-[90px]">
              {user?.username || "User"}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-red-300 transition-colors font-body px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}