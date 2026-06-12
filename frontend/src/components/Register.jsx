// src/components/Register.jsx
import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, ArrowLeft, Eye, EyeOff, Loader2, Users } from "lucide-react";

const BASE_URL = "http://localhost:8000";

// FIX: added onLoginClick prop so users can navigate back to login after registering
export default function Register({ onBack, onLoginClick }) {
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (_) {}
  };

  const handleAdd = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Both fields are required."); return;
    }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to register.");
      setSuccess(`✅ "${username.trim()}" registered! You can now log in.`);
      setUsername(""); setPassword("");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uname) => {
    if (!window.confirm(`Remove "${uname}"?`)) return;
    setDeleting(uname);
    try {
      await fetch(`${BASE_URL}/users/${uname}`, { method: "DELETE" });
      fetchUsers();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%), linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)" }}>

      <div className="max-w-lg mx-auto space-y-6">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-indigo-300 hover:text-white text-sm font-body transition-colors">
          <ArrowLeft size={15} /> Back to Home
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            <Users size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Create Account</h1>
          <p className="text-indigo-300 text-sm font-body">Register with a username and password</p>
        </div>

        {/* Register form */}
        <div className="rounded-2xl p-6 space-y-4 border border-white/10"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
          <h2 className="text-white font-semibold font-body text-sm uppercase tracking-wider">New Account</h2>

          <div>
            <label className="text-xs text-indigo-300 font-body block mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Choose a username"
              className="w-full px-4 py-2.5 rounded-xl text-sm font-body text-white placeholder-indigo-400 border border-white/15 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 transition-all"
              style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          <div>
            <label className="text-xs text-indigo-300 font-body block mb-1">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="Choose a password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-body text-white placeholder-indigo-400 border border-white/15 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 transition-all"
                style={{ background: "rgba(255,255,255,0.08)" }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error   && <p className="text-red-300 text-xs font-body bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-violet-300 text-xs font-body bg-violet-500/10 border border-violet-400/20 rounded-lg px-3 py-2">{success}</p>}

          <button onClick={handleAdd} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-body font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 6px 20px rgba(124,58,237,0.35)" }}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> Registering…</> : <><UserPlus size={14} /> Register</>}
          </button>
        </div>

        {/* Existing users list (optional — remove if you don't want this public) */}
        {users.length > 0 && (
          <div className="rounded-2xl p-6 border border-white/10 space-y-3"
            style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
            <h2 className="text-white font-semibold font-body text-sm uppercase tracking-wider mb-4">
              Registered Users ({users.length})
            </h2>
            <ul className="space-y-2">
              {users.map(u => (
                <li key={u.id}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/10"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-600/40 border border-violet-400/30 flex items-center justify-center">
                      <span className="text-violet-200 text-xs font-bold font-body">
                        {u.username[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-white font-body">{u.username}</span>
                  </div>
                  <button onClick={() => handleDelete(u.username)}
                    disabled={deleting === u.username}
                    className="p-1.5 rounded-lg text-indigo-400 hover:text-red-300 hover:bg-red-500/10 transition-all disabled:opacity-40">
                    {deleting === u.username ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* FIX: Login link at bottom */}
        <p className="text-center text-indigo-400 text-xs font-body">
          Already have an account?{" "}
          <button onClick={onLoginClick} className="text-violet-300 hover:text-white underline transition-colors">
            Log in here
          </button>
        </p>

      </div>
    </div>
  );
}