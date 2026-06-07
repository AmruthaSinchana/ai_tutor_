// src/components/Chat.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Trash2, BookOpen, ChevronDown, ChevronUp, Bot, User, Loader2 } from "lucide-react";
import { streamChat, clearChatHistory } from "../api/client";

function SourceChip({ source }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="source-chip flex items-center gap-1 hover:opacity-80 transition-opacity"
      >
        <BookOpen size={10} />
        {source.filename} · p.{source.page}
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>
      {expanded && (
        <div className="mt-1 text-xs text-stone-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed max-w-sm">
          {source.preview}…
        </div>
      )}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-orange-400 to-orange-600"
            : "bg-gradient-to-br from-teal-400 to-teal-600"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed font-body ${
            isUser ? "chat-user" : "chat-ai text-stone-800"
          } ${msg.streaming ? "typing-cursor" : ""}`}
        >
          {msg.content || (msg.streaming ? "" : "…")}
        </div>

        {/* Sources */}
        {!isUser && msg.sources?.length > 0 && !msg.streaming && (
          <div className="flex flex-wrap gap-1 px-1">
            {msg.sources.map((s, i) => (
              <SourceChip key={i} source={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const suggestions = [
    "Summarize the key concepts in chapter 3",
    "What is the main argument of this document?",
    "Explain the methodology used",
    "What are the conclusions?",
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 py-16 px-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 border border-teal-200 flex items-center justify-center mx-auto mb-4">
          <Bot size={28} className="text-teal-600" />
        </div>
        <h2 className="font-display text-2xl text-stone-800 mb-2">Ask Anything</h2>
        <p className="text-stone-500 text-sm font-body max-w-xs leading-relaxed">
          Upload a PDF and ask questions. The AI answers strictly from your document.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="aurora-card px-4 py-3 text-sm text-stone-600 cursor-default hover:border-teal-200 hover:text-teal-700 transition-all duration-150 font-body"
          >
            "{s}"
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Chat({ isReady }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || isStreaming || !isReady) return;

    setInput("");
    const userMsg = { role: "user", content: q, id: Date.now() };
    const aiMsg = { role: "ai", content: "", sources: [], streaming: true, id: Date.now() + 1 };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsStreaming(true);

    try {
      await streamChat(
        q,
        (token) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content + token } : m))
          );
        },
        (sources) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, sources } : m))
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, streaming: false } : m))
          );
          setIsStreaming(false);
        },
        (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsg.id
                ? { ...m, content: `Error: ${err}`, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
        }
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? { ...m, content: `Error: ${err.message}`, streaming: false }
            : m
        )
      );
      setIsStreaming(false);
    }
  }, [input, isStreaming, isReady]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      await clearChatHistory();
    } catch (_) {}
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-aurora-sand/60 bg-white/40 backdrop-blur-sm">
        <div>
          <h1 className="font-display text-xl text-stone-800">Ask AI</h1>
          <p className="text-xs text-stone-500 font-body">Answers grounded in your documents</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={13} />
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg) => <Message key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-aurora-sand/60 bg-white/40 backdrop-blur-sm">
        {!isReady && (
          <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-body">
            ⚠️ Upload a PDF in the sidebar to start asking questions.
          </div>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isReady ? "Ask a question about your document…" : "Upload a PDF first…"}
            disabled={!isReady || isStreaming}
            rows={1}
            className="flex-1 resize-none bg-white/80 border border-aurora-sand rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-150 font-body disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
            style={{ overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!isReady || isStreaming || !input.trim()}
            className="btn-teal w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isStreaming ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-2 font-body">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}