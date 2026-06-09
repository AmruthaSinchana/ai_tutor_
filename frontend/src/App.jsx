// src/App.jsx
import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import Quiz from "./components/Quiz";
import Summarize from "./components/Summarize";
import { useAppState } from "./hooks/useAppState";
import VideoPage from "./components/Video";

export default function App() {
  const [showApp, setShowApp] = useState(false);

  const {
    activeTab,
    setActiveTab,
    isReady,
    uploadedFiles,
    isUploading,
    uploadError,
    uploadSuccess,
    handleUpload,
  } = useAppState();

const renderContent = () => {
  switch (activeTab) {
    case "chat":
      return <Chat isReady={isReady} />;

    case "quiz":
      return <Quiz isReady={isReady} />;

    case "summarize":
      return <Summarize isReady={isReady} />;

    case "video":
      return <VideoPage isReady={isReady} />;

    default:
      return <Chat isReady={isReady} />;
  }
};

  // Show landing page until user clicks Get Started
  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  // Show the main app dashboard
  return (
    <div className="aurora-bg min-h-screen flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isReady={isReady}
        uploadedFiles={uploadedFiles}
        isUploading={isUploading}
        uploadError={uploadError}
        uploadSuccess={uploadSuccess}
        handleUpload={handleUpload}
      />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}