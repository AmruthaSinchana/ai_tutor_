// src/App.jsx
import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Login       from "./components/Login";
import Register    from "./components/Register";
import Sidebar     from "./components/Sidebar";
import Chat        from "./components/Chat";
import Quiz        from "./components/Quiz";
import Summarize   from "./components/Summarize";
import VideoPage   from "./components/Video";
import Dashboard   from "./components/Dashboard";   // ← NEW
import { useAppState } from "./hooks/useAppState";

// Screens: "landing" | "login" | "register" | "app"

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user,   setUser]   = useState(null);

  // Restore session if previously logged in
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ai_tutor_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token && parsed?.username) {
          setUser(parsed);
          // Don't auto-jump to app — let them land on landing page
        }
      }
    } catch (_) {}
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("ai_tutor_session", JSON.stringify(userData));
    setUser(userData);
    setScreen("app");
  };

  const handleLogout = () => {
    localStorage.removeItem("ai_tutor_session");
    setUser(null);
    setScreen("landing");
  };

  const handleEnterApp = () => setScreen("app");

  const {
    activeTab, setActiveTab,
    isReady, uploadedFiles,
    isUploading, uploadError, uploadSuccess,
    handleUpload,
  } = useAppState();

  // ── Prefill state: when Dashboard "Quiz / Notes / Video" buttons are clicked,
  //    we store the topic + destination here, then navigate to that tab.
  const [prefillTopic,  setPrefillTopic]  = useState("");
  const [prefillTarget, setPrefillTarget] = useState(""); // "quiz" | "summarize" | "video"

  const navigateWithTopic = (tab, topic) => {
    setPrefillTopic(topic);
    setPrefillTarget(tab);
    setActiveTab(tab);
  };

  // ── Screens ──────────────────────────────────────────────────────────────────

  if (screen === "landing") return (
    <LandingPage
      onLoginClick={() => setScreen("login")}
      onRegisterClick={() => setScreen("register")}
      user={user}
      onGetStarted={handleEnterApp}
      onEnterDashboard={handleEnterApp}
      onLogout={handleLogout}
    />
  );

  if (screen === "login") return (
    <Login
      onLogin={handleLogin}
      onBack={() => setScreen("landing")}
      onRegister={() => setScreen("register")}
    />
  );

  if (screen === "register") return (
    <Register
      onBack={() => setScreen("landing")}
      onLoginClick={() => setScreen("login")}
    />
  );

  // ── Main app shell ────────────────────────────────────────────────────────────
  return (
    <div className="aurora-bg min-h-screen flex">
      <Sidebar
        activeTab={activeTab}       setActiveTab={setActiveTab}
        isReady={isReady}           uploadedFiles={uploadedFiles}
        isUploading={isUploading}   uploadError={uploadError}
        uploadSuccess={uploadSuccess} handleUpload={handleUpload}
        onBack={() => setScreen("landing")}
        onLogout={handleLogout}
        user={user}
      />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {activeTab === "chat" && (
          <Chat isReady={isReady} token={user?.token} onBack={() => setScreen("landing")} />
        )}

        {activeTab === "quiz" && (
          <Quiz
            isReady={isReady}
            onBack={() => setScreen("landing")}
            user={user}
            prefillTopic={prefillTarget === "quiz" ? prefillTopic : ""}
          />
        )}

        {activeTab === "summarize" && (
          <Summarize
            isReady={isReady}
            onBack={() => setScreen("landing")}
            prefillTopic={prefillTarget === "summarize" ? prefillTopic : ""}
          />
        )}

        {activeTab === "video" && (
          <VideoPage
            isReady={isReady}
            onBack={() => setScreen("landing")}
            prefillTopic={prefillTarget === "video" ? prefillTopic : ""}
          />
        )}

        {activeTab === "dashboard" && (
          <Dashboard
            user={user}
            onBack={() => setActiveTab("chat")}
            onNavigateQuiz={(topic)  => navigateWithTopic("quiz",      topic)}
            onNavigateNotes={(topic) => navigateWithTopic("summarize", topic)}
            onNavigateVideo={(topic) => navigateWithTopic("video",     topic)}
          />
        )}

        {/* Fallback for any unknown tab */}
        {!["chat", "quiz", "summarize", "video", "dashboard"].includes(activeTab) && (
          <Chat isReady={isReady} token={user?.token} onBack={() => setScreen("landing")} />
        )}

      </main>
    </div>
  );
}