// src/components/Login.jsx
import React, { useState } from "react";
import { GraduationCap, Eye, EyeOff, Loader2, Lock, User, ArrowLeft } from "lucide-react";

const BASE_URL = "http://localhost:8000";

// FIX: added onRegister prop so users can navigate to Register from here
export default function Login({ onLogin, onBack, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid credentials.");
      // FIX: data.role now comes from backend (won't be undefined anymore)
      onLogin({ username: data.username, role: data.role, token: data.token });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{background:"radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.18) 0%,transparent 60%),linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)"}}>

      <div className="w-full max-w-md">
        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-indigo-300 hover:text-white text-sm font-body mb-6 transition-colors">
          <ArrowLeft size={15}/> Back to Home
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
            style={{background:"linear-gradient(135deg,#7c3aed,#6366f1)"}}>
            <GraduationCap size={26} className="text-white"/>
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-white">AI Tutor</h1>
            <p className="text-indigo-300 text-sm font-body mt-0.5">RAG + Groq · Your Study Companion</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10"
          style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)"}}>
          <h2 className="font-display text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-indigo-300 text-sm font-body mb-6">Sign in to continue studying</p>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider font-body block mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400"/>
                <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  placeholder="Enter your username" autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body text-white placeholder-indigo-400 border border-white/15 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 transition-all"
                  style={{background:"rgba(255,255,255,0.08)"}}/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider font-body block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400"/>
                <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  placeholder="Enter your password" autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-body text-white placeholder-indigo-400 border border-white/15 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 transition-all"
                  style={{background:"rgba(255,255,255,0.08)"}}/>
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors">
                  {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-400/30 text-sm text-red-300 font-body">{error}</div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-xl text-white font-body font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-2"
              style={{background:"linear-gradient(135deg,#7c3aed 0%,#6366f1 100%)",boxShadow:"0 8px 30px rgba(124,58,237,0.4)"}}>
              {loading ? <><Loader2 size={15} className="animate-spin"/>Signing in…</> : "Sign In"}
            </button>
          </div>
        </div>

        {/* FIX: Register link — was just dead text before */}
        <p className="text-center text-indigo-400 text-xs font-body mt-6">
          Don't have an account?{" "}
          <button onClick={onRegister} className="text-violet-300 hover:text-white underline transition-colors">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

