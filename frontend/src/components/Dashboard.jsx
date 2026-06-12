// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell,
} from "recharts";
import {
  Brain, TrendingUp, BookOpen, Download, Trophy, Target, Zap,
  ChevronRight, RefreshCw, AlertCircle, CheckCircle, Star,
  ArrowLeft, Youtube, PenTool, LayoutDashboard,
} from "lucide-react";

// ─── localStorage helpers ──────────────────────────────────────────────────────
export const STORAGE_KEY = (user) => `ai_tutor_dashboard_${user || "guest"}`;

export function loadDashboardData(user) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(user));
    return raw ? JSON.parse(raw) : { quizSessions: [], topicMap: {} };
  } catch {
    return { quizSessions: [], topicMap: {} };
  }
}

export function saveDashboardData(user, data) {
  try { localStorage.setItem(STORAGE_KEY(user), JSON.stringify(data)); } catch (_) {}
}

// Call this from Quiz.jsx after scoring
export function recordQuizResult(user, { topic, quizType, score, total, percentage, timestamp }) {
  const data = loadDashboardData(user);
  const session = {
    topic, quizType, score, total, percentage,
    timestamp: timestamp || new Date().toISOString(),
  };
  data.quizSessions.push(session);

  if (!data.topicMap[topic]) {
    data.topicMap[topic] = { attempts: 0, totalPct: 0, lastPct: 0, history: [] };
  }
  const tm = data.topicMap[topic];
  tm.attempts += 1;
  tm.totalPct += percentage;
  tm.lastPct = percentage;
  tm.history = [...(tm.history || []), { pct: percentage, date: session.timestamp }];

  saveDashboardData(user, data);
}

// ─── colour helpers ────────────────────────────────────────────────────────────
const SCORE_COLOR = (pct) => (pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444");
const SCORE_LABEL = (pct) => (pct >= 80 ? "Strong" : pct >= 50 ? "Needs Practice" : "Weak");

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)",
      borderRadius: 16, border: "1px solid rgba(124,58,237,0.10)",
      padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: gradient || "linear-gradient(135deg,#7c3aed,#6366f1)",
      }}>
        <Icon size={19} color="#fff" />
      </div>
      <div>
        <p style={{ fontSize: 11, color: "#78716c", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: "#1c1917", margin: "2px 0 0" }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({ icon: Icon, label, onClick, color }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 12, fontWeight: 600,
        padding: "6px 12px", borderRadius: 8,
        border: `1.5px solid ${color}44`,
        background: hover ? color : color + "15",
        color: hover ? "#fff" : color,
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <Icon size={13} />{label}
    </button>
  );
}

// ─── Topic row ────────────────────────────────────────────────────────────────
function TopicRow({ topic, avgPct, attempts, lastPct, onQuiz, onNotes, onVideo }) {
  const color = SCORE_COLOR(avgPct);
  const isWeak = avgPct < 60;
  return (
    <div style={{
      background: isWeak ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.60)",
      border: `1px solid ${isWeak ? "rgba(239,68,68,0.18)" : "rgba(124,58,237,0.08)"}`,
      borderRadius: 14, padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
    }}>
      {/* name */}
      <div style={{ flex: "1 1 160px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {isWeak
            ? <AlertCircle size={13} color="#ef4444" />
            : <CheckCircle size={13} color="#10b981" />}
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1c1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {topic}
          </span>
        </div>
        <span style={{
          display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 700,
          padding: "2px 8px", borderRadius: 99, background: color + "22", color,
        }}>{SCORE_LABEL(avgPct)}</span>
      </div>

      {/* score bar */}
      <div style={{ flex: "0 0 130px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#78716c", marginBottom: 4 }}>
          <span>Avg</span>
          <span style={{ fontWeight: 700, color }}>{avgPct}%</span>
        </div>
        <div style={{ height: 5, background: "#e7e5e4", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${avgPct}%`, background: color, borderRadius: 99, transition: "width 0.6s" }} />
        </div>
        <p style={{ fontSize: 11, color: "#a8a29e", margin: "3px 0 0" }}>
          {attempts} attempt{attempts !== 1 ? "s" : ""} · last {lastPct}%
        </p>
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        <ActionBtn icon={PenTool} label="Quiz"   onClick={() => onQuiz(topic)}  color="#7c3aed" />
        <ActionBtn icon={BookOpen} label="Notes" onClick={() => onNotes(topic)} color="#0891b2" />
        <ActionBtn icon={Youtube}  label="Videos" onClick={() => onVideo(topic)} color="#dc2626" />
      </div>
    </div>
  );
}

// ─── PDF export (browser print) ───────────────────────────────────────────────
function exportPDF(data, username) {
  const topics = Object.entries(data.topicMap).map(([topic, v]) => ({
    topic,
    avgPct: Math.round(v.totalPct / v.attempts),
    attempts: v.attempts,
    lastPct: v.lastPct,
  })).sort((a, b) => a.avgPct - b.avgPct);

  const weak = topics.filter((t) => t.avgPct < 60);
  const total = data.quizSessions.length;
  const avg = total > 0
    ? Math.round(data.quizSessions.reduce((s, q) => s + q.percentage, 0) / total)
    : 0;

  const html = `<!DOCTYPE html><html><head><title>AI Tutor Report — ${username}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;color:#1c1917}
  h1{color:#7c3aed;font-size:24px;margin-bottom:4px}
  .sub{color:#78716c;font-size:13px;margin-bottom:28px}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px}
  .stat{background:#f5f3ff;border-radius:12px;padding:16px 20px}
  .stat-val{font-size:28px;font-weight:800;color:#7c3aed}
  .stat-lbl{font-size:11px;color:#78716c;font-weight:700;text-transform:uppercase}
  h2{font-size:15px;font-weight:700;border-bottom:2px solid #ede9fe;padding-bottom:6px;margin:24px 0 10px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#ede9fe;padding:8px 12px;text-align:left;font-weight:700;color:#5b21b6}
  td{padding:8px 12px;border-bottom:1px solid #f5f3ff}
  .w{color:#ef4444;font-weight:700}.m{color:#f59e0b;font-weight:700}.s{color:#10b981;font-weight:700}
</style></head><body>
<h1>📊 AI Tutor Dashboard Report</h1>
<p class="sub">Student: <strong>${username}</strong> · ${new Date().toLocaleString()}</p>
<div class="grid">
  <div class="stat"><div class="stat-val">${total}</div><div class="stat-lbl">Quizzes Taken</div></div>
  <div class="stat"><div class="stat-val">${avg}%</div><div class="stat-lbl">Overall Average</div></div>
  <div class="stat"><div class="stat-val">${weak.length}</div><div class="stat-lbl">Weak Topics</div></div>
</div>
${weak.length
    ? `<h2>⚠️ Weak Topics (below 60%)</h2>
<table><tr><th>Topic</th><th>Avg Score</th><th>Attempts</th><th>Last</th></tr>
${weak.map((t) => `<tr><td>${t.topic}</td><td class="w">${t.avgPct}%</td><td>${t.attempts}</td><td>${t.lastPct}%</td></tr>`).join("")}
</table>`
    : "<p style='color:#10b981;font-weight:600'>✅ No weak topics — great job!</p>"}
<h2>📋 All Topics</h2>
<table><tr><th>Topic</th><th>Avg</th><th>Attempts</th><th>Status</th></tr>
${topics.map((t) => `<tr><td>${t.topic}</td>
<td class="${t.avgPct >= 80 ? "s" : t.avgPct >= 60 ? "m" : "w"}">${t.avgPct}%</td>
<td>${t.attempts}</td>
<td>${t.avgPct >= 80 ? "✅ Strong" : t.avgPct >= 60 ? "⚡ Practicing" : "❌ Weak"}</td></tr>`).join("")}
</table>
<h2>📝 Recent Sessions (last 15)</h2>
<table><tr><th>Topic</th><th>Type</th><th>Score</th><th>Date</th></tr>
${[...data.quizSessions].reverse().slice(0, 15).map((s) =>
  `<tr><td>${s.topic}</td><td>${s.quizType}</td>
<td class="${s.percentage >= 80 ? "s" : s.percentage >= 60 ? "m" : "w"}">${s.score}/${s.total} (${s.percentage}%)</td>
<td>${new Date(s.timestamp).toLocaleDateString()}</td></tr>`).join("")}
</table>
</body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Dashboard({ user, onBack, onNavigateQuiz, onNavigateNotes, onNavigateVideo }) {
  const username = user?.username || "guest";
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview"); // overview | topics | history

  const refresh = useCallback(() => {
    setData(loadDashboardData(username));
  }, [username]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!data) return null;

  // ── derived ──
  const sessions = data.quizSessions;
  const totalQ = sessions.length;
  const overallAvg = totalQ > 0
    ? Math.round(sessions.reduce((s, q) => s + q.percentage, 0) / totalQ)
    : 0;

  const topics = Object.entries(data.topicMap).map(([topic, v]) => ({
    topic,
    avgPct: Math.round(v.totalPct / v.attempts),
    attempts: v.attempts,
    lastPct: v.lastPct,
  })).sort((a, b) => a.avgPct - b.avgPct);

  const weakTopics   = topics.filter((t) => t.avgPct < 60);
  const strongTopics = topics.filter((t) => t.avgPct >= 80);

  const barData = topics.slice(0, 8).map((t) => ({
    name: t.topic.length > 13 ? t.topic.slice(0, 12) + "…" : t.topic,
    score: t.avgPct,
    fill: SCORE_COLOR(t.avgPct),
  }));

  const radarData = topics.slice(0, 6).map((t) => ({
    topic: t.topic.length > 10 ? t.topic.slice(0, 9) + "…" : t.topic,
    score: t.avgPct,
  }));

  const recentSessions = [...sessions].reverse().slice(0, 12);

  const goQuiz  = (topic) => onNavigateQuiz  && onNavigateQuiz(topic);
  const goNotes = (topic) => onNavigateNotes && onNavigateNotes(topic);
  const goVideo = (topic) => onNavigateVideo && onNavigateVideo(topic);

  // ── empty state ──
  const isEmpty = totalQ === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: "1px solid rgba(124,58,237,0.12)",
        background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
        flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c", display: "flex", padding: 4 }}>
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#1c1917", display: "flex", alignItems: "center", gap: 7 }}>
              <LayoutDashboard size={18} color="#7c3aed" /> My Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#78716c" }}>Hello, {username} 👋</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Tab pills */}
          <div style={{ display: "flex", gap: 3, background: "rgba(124,58,237,0.07)", borderRadius: 10, padding: 3 }}>
            {["overview", "topics", "history"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "6px 15px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: tab === t ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent",
                  color: tab === t ? "#fff" : "#7c3aed",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* PDF */}
          <button
            onClick={() => exportPDF(data, username)}
            disabled={isEmpty}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "7px 13px",
              borderRadius: 9, border: "1.5px solid rgba(124,58,237,0.28)",
              background: "rgba(124,58,237,0.07)", color: "#7c3aed",
              fontSize: 12, fontWeight: 700, cursor: isEmpty ? "not-allowed" : "pointer",
              opacity: isEmpty ? 0.4 : 1,
            }}
          >
            <Download size={13} /> Export PDF
          </button>

          {/* Refresh */}
          <button
            onClick={refresh}
            style={{
              display: "flex", alignItems: "center", padding: "7px 10px",
              borderRadius: 9, border: "1.5px solid rgba(124,58,237,0.12)",
              background: "none", color: "#a8a29e", cursor: "pointer",
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>

        {/* ════ EMPTY STATE ════ */}
        {isEmpty && (
          <div style={{ textAlign: "center", padding: "64px 24px", color: "#a8a29e" }}>
            <Brain size={48} style={{ margin: "0 auto 14px", display: "block", color: "#c4b5fd" }} />
            <p style={{ fontWeight: 700, color: "#6b7280", fontSize: 16, marginBottom: 6 }}>No quiz data yet</p>
            <p style={{ fontSize: 13 }}>Take a quiz from the <strong>Quiz Me</strong> tab to start tracking your progress here.</p>
          </div>
        )}

        {/* ════ OVERVIEW ════ */}
        {!isEmpty && tab === "overview" && (
          <>
            {/* stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 13, marginBottom: 24 }}>
              <StatCard icon={Trophy}       label="Quizzes Taken"    value={totalQ}         sub="total attempts"      gradient="linear-gradient(135deg,#7c3aed,#6366f1)" />
              <StatCard icon={Target}       label="Overall Average"  value={`${overallAvg}%`} sub="across all topics"  gradient="linear-gradient(135deg,#0891b2,#06b6d4)" />
              <StatCard icon={AlertCircle}  label="Weak Topics"      value={weakTopics.length}   sub="need attention"  gradient="linear-gradient(135deg,#ef4444,#f97316)" />
              <StatCard icon={Star}         label="Strong Topics"    value={strongTopics.length} sub="80%+ average"    gradient="linear-gradient(135deg,#10b981,#059669)" />
            </div>

            {/* Weak topics */}
            {weakTopics.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 7 }}>
                  <AlertCircle size={15} color="#ef4444" /> Weak Topics — needs attention
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {weakTopics.slice(0, 4).map((t) => (
                    <TopicRow key={t.topic} {...t} onQuiz={goQuiz} onNotes={goNotes} onVideo={goVideo} />
                  ))}
                  {weakTopics.length > 4 && (
                    <button
                      onClick={() => setTab("topics")}
                      style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#7c3aed", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      See all {weakTopics.length} weak topics <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bar chart */}
            {barData.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", borderRadius: 16, border: "1px solid rgba(124,58,237,0.08)", padding: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 7 }}>
                  <TrendingUp size={15} color="#7c3aed" /> Score by Topic
                </p>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f3ff" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716c" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#78716c" }} />
                    <Tooltip
                      formatter={(v) => [`${v}%`, "Avg Score"]}
                      contentStyle={{ borderRadius: 10, border: "none", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Radar */}
            {radarData.length >= 3 && (
              <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", borderRadius: 16, border: "1px solid rgba(124,58,237,0.08)", padding: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
                  <Zap size={15} color="#7c3aed" /> Skill Radar
                </p>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#ede9fe" />
                    <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: "#78716c" }} />
                    <Radar name="Score" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ════ TOPICS ════ */}
        {!isEmpty && tab === "topics" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                <BookOpen size={15} color="#7c3aed" /> All Topics ({topics.length})
              </p>
              <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#78716c" }}>
                {[["#ef4444", "Weak (<60%)"], ["#f59e0b", "Practicing"], ["#10b981", "Strong (≥80%)"]].map(([c, l]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
                  </span>
                ))}
              </div>
            </div>
            {topics.length === 0 ? (
              <p style={{ textAlign: "center", color: "#a8a29e", padding: 40 }}>No topics yet. Complete a quiz first.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {topics.map((t) => (
                  <TopicRow key={t.topic} {...t} onQuiz={goQuiz} onNotes={goNotes} onVideo={goVideo} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ════ HISTORY ════ */}
        {!isEmpty && tab === "history" && (
          <>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 7 }}>
              <TrendingUp size={15} color="#7c3aed" /> Quiz History
            </p>
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, border: "1px solid rgba(124,58,237,0.08)", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ede9fe" }}>
                    {["Topic", "Type", "Score", "Date"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#5b21b6", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f5f3ff" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1c1917" }}>{s.topic}</td>
                      <td style={{ padding: "10px 14px", color: "#78716c" }}>{s.quizType}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontWeight: 700, color: SCORE_COLOR(s.percentage) }}>
                          {s.score}/{s.total}
                        </span>
                        <span style={{
                          marginLeft: 6, fontSize: 11, fontWeight: 700,
                          padding: "2px 7px", borderRadius: 99,
                          background: SCORE_COLOR(s.percentage) + "18",
                          color: SCORE_COLOR(s.percentage),
                        }}>{s.percentage}%</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#a8a29e", fontSize: 12 }}>
                        {new Date(s.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}