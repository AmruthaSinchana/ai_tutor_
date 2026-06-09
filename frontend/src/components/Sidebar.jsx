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
  X,
  Video,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "chat", label: "Ask AI", icon: MessageSquare, desc: "Q&A from your PDFs" },
  { id: "quiz", label: "Quiz Me", icon: Brain, desc: "Test your knowledge" },
  { id: "summarize", label: "Summarize", icon: FileText, desc: "Summaries & notes" },
  { id: "video", label: "Videos", icon: Video, desc: "Related Videos" },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isReady,
  uploadedFiles,
  isUploading,
  uploadError,
  uploadSuccess,
  handleUpload,
}) {
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) handleUpload(files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.endsWith(".pdf")
    );
    if (files.length) handleUpload(files);
  };

  return (
    <aside className="sidebar-gradient w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display text-white font-semibold text-lg leading-tight">
              AI Tutor
            </div>
            <div className="text-xs text-stone-400 font-body">RAG + Groq</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-5 flex-1">
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Study Tools
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => (
            <li key={id}>
              <button
                onClick={() => setActiveTab(id)}
                className={`nav-item w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left group ${
                  activeTab === id ? "nav-item-active" : "text-stone-400"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    activeTab === id ? "text-teal-300" : "text-stone-500 group-hover:text-stone-300"
                  }
                />
                <div>
                  <div
                    className={`text-sm font-medium font-body ${
                      activeTab === id ? "text-teal-100" : ""
                    }`}
                  >
                    {label}
                  </div>
                  <div className="text-xs text-stone-500">{desc}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upload section */}
      <div className="px-4 pb-6 space-y-3">
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest px-1 mb-2">
          Documents
        </p>

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-1 mb-2">
            {uploadedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
              >
                <CheckCircle size={13} className="text-teal-400 flex-shrink-0" />
                <span className="text-xs text-stone-300 truncate font-body">{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 rounded-xl p-4 text-center cursor-pointer hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-200 group"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={20} className="text-teal-400 animate-spin" />
              <p className="text-xs text-stone-400">Processing PDFs…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload
                size={20}
                className="text-stone-500 group-hover:text-teal-400 transition-colors"
              />
              <p className="text-xs text-stone-400 group-hover:text-stone-300">
                Drop PDFs or click to upload
              </p>
              <p className="text-xs text-stone-600">Up to 50MB each</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={onFileChange}
          className="hidden"
        />

        {/* Feedback */}
        {uploadError && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">{uploadError}</p>
          </div>
        )}
        {uploadSuccess && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <CheckCircle size={13} className="text-teal-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-teal-300">{uploadSuccess}</p>
          </div>
        )}

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isReady ? "bg-teal-400 animate-pulse" : "bg-stone-600"
            }`}
          />
          <span className="text-xs text-stone-400">
            {isReady ? "Ready to study" : "Upload a PDF to begin"}
          </span>
        </div>
      </div>
    </aside>
  );
}