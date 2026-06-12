// src/components/LandingPage.jsx
import React from "react";
import {
  GraduationCap, ChevronRight, FileText, Bot, PenLine, Brain,
  Layers, Database, Zap, Target, LogOut, User, BookOpen,
} from "lucide-react";

function Navbar({ onLoginClick, user, onEnterDashboard, onLogout }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <GraduationCap size={17} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-stone-800">AI Tutor</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[["Features","#features"],["How It Works","#how"],["About","#about"]].map(([l,h])=>(
            <a key={l} href={h} className="text-sm text-stone-600 hover:text-indigo-600 transition-colors font-body">{l}</a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <User size={13} className="text-indigo-500" />
                <span className="text-sm font-body text-indigo-700 font-medium">{user.username}</span>
              </div>
              <button onClick={onEnterDashboard}
                className="px-5 py-2 rounded-xl text-white text-sm font-body font-semibold transition-all hover:-translate-y-0.5"
                style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>
                Dashboard
              </button>
              <button onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-500 hover:text-red-500 hover:bg-red-50 transition-all font-body">
                <LogOut size={13}/> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={onLoginClick}
                className="px-4 py-2 rounded-xl text-sm font-body font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-all">
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// FIX: Hero now takes onGetStarted — clicking "Get Started Free" goes straight to app, no login
function Hero({ onGetStarted, user, onEnterDashboard }) {
  return (
    <section className="pt-40 pb-28 px-6 text-center"
      style={{background:"radial-gradient(ellipse at 50% 0%,rgba(99,102,241,0.09) 0%,transparent 65%),#f8f8ff"}}>
      <div className="max-w-3xl mx-auto space-y-7">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-100 bg-indigo-50">
          <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full font-body"
            style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>NEW</span>
          <span className="text-sm text-indigo-700 font-body">Powered by Groq + RAG Pipeline</span>
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-900 leading-tight">
          Learn Smarter with{" "}
          <span className="text-transparent bg-clip-text"
            style={{backgroundImage:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>
            AI-Powered Tutoring
          </span>
        </h1>

        <p className="text-lg text-stone-500 font-body max-w-xl mx-auto leading-relaxed">
          Upload your PDFs. Ask questions, generate summaries, take auto-quizzes — all from your own documents.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          {user ? (
            <button onClick={onEnterDashboard}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-body font-semibold text-base shadow-lg hover:-translate-y-0.5 transition-all"
              style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)",boxShadow:"0 8px 30px rgba(99,102,241,0.35)"}}>
              Open Dashboard <ChevronRight size={18}/>
            </button>
          ) : (
            // FIX: goes directly into the app, no login required
            <button onClick={onGetStarted}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-body font-semibold text-base shadow-lg hover:-translate-y-0.5 transition-all"
              style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)",boxShadow:"0 8px 30px rgba(99,102,241,0.35)"}}>
              Get Started Free <ChevronRight size={18}/>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {icon:FileText, bg:"bg-indigo-50", color:"text-indigo-500", title:"PDF Upload & Processing",  desc:"Upload any PDF and our pipeline extracts, chunks, and embeds content into a FAISS vector store instantly."},
  {icon:Bot,      bg:"bg-violet-50", color:"text-violet-500", title:"AI Question Answering",    desc:"Ask anything about your document. RAG retrieves relevant chunks and Groq LLM generates precise answers."},
  {icon:PenLine,  bg:"bg-orange-50", color:"text-orange-500", title:"Chapter Summarization",    desc:"Generate intelligent summaries for any chapter. Revision notes, bullet points, key terms — all formats."},
  {icon:Brain,    bg:"bg-pink-50",   color:"text-pink-500",   title:"Auto Quiz Generation",     desc:"Turn any document into MCQs, short-answer, or fill-in-the-blank questions to test your knowledge."},
];

function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-body bg-indigo-50 text-indigo-600 mb-4">Features</span>
          <h2 className="font-display text-4xl font-bold text-stone-900 mt-3 mb-4">Everything You Need to Ace Your Exams</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(({icon:Icon,bg,color,title,desc})=>(
            <div key={title} className="p-7 rounded-2xl border border-stone-100 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5`}><Icon size={22} className={color}/></div>
              <h3 className="font-display font-semibold text-lg text-stone-800 mb-2">{title}</h3>
              <p className="text-stone-500 font-body text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps=[
    {n:"01",g:"linear-gradient(135deg,#6366f1,#7c3aed)",t:"Get Started",      d:"Click Get Started and you're in — no login required. Upload your study material and begin immediately."},
    {n:"02",g:"linear-gradient(135deg,#f97316,#ef4444)",t:"Upload Your PDF",  d:"Drag and drop any study material. Instantly embedded into a vector store."},
    {n:"03",g:"linear-gradient(135deg,#7c3aed,#6366f1)",t:"Start Learning",   d:"Ask questions, generate summaries, or take auto-created quizzes — all from your doc."},
  ];
  return (
    <section id="how" className="py-24 px-6" style={{background:"#f8f8ff"}}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-body bg-indigo-50 text-indigo-600 mb-4">How It Works</span>
          <h2 className="font-display text-4xl font-bold text-stone-900 mt-3">Up and Running in 3 Steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({n,g,t,d})=>(
            <div key={n} className="p-8 rounded-2xl bg-white border border-stone-100 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{background:g}}>
                <span className="text-white font-display font-bold text-lg">{n}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-stone-800 mb-2">{t}</h3>
              <p className="text-stone-500 font-body text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const cards=[
    {icon:Layers,   color:"text-indigo-500",bg:"bg-indigo-50",t:"RAG Pipeline",      d:"Retrieval-Augmented Generation ensures answers come directly from your document — no hallucinations."},
    {icon:Database, color:"text-violet-500",bg:"bg-violet-50",t:"FAISS Vector Store", d:"Lightning-fast semantic search powered by Facebook AI Similarity Search."},
    {icon:Zap,      color:"text-orange-500",bg:"bg-orange-50",t:"Groq LLM",           d:"Llama 3 on Groq hardware delivers blazing-fast responses — no waiting, no lag."},
    {icon:Target,   color:"text-pink-500",  bg:"bg-pink-50",  t:"Built for Students", d:"Designed for exam prep — upload your textbook and start studying smarter immediately."},
  ];
  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-body bg-indigo-50 text-indigo-600 mb-4">About</span>
          <h2 className="font-display text-4xl font-bold text-stone-900 mt-3 mb-4">Serious Tech, Simple Experience</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(({icon:Icon,color,bg,t,d})=>(
            <div key={t} className="flex gap-4 p-6 rounded-2xl bg-white border border-stone-100 hover:shadow-md transition-all duration-200">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}><Icon size={20} className={color}/></div>
              <div>
                <h3 className="font-display font-semibold text-stone-800 mb-1">{t}</h3>
                <p className="text-stone-500 font-body text-sm leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FIX: CTA banner "Get Started" also goes straight into the app
function CTABanner({ onGetStarted, user, onEnterDashboard }) {
  return (
    <section className="py-24 px-6" style={{background:"#f8f8ff"}}>
      <div className="max-w-3xl mx-auto rounded-3xl p-16 text-center shadow-2xl"
        style={{background:"linear-gradient(135deg,#6366f1 0%,#7c3aed 60%,#6d28d9 100%)"}}>
        <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Study Smarter?</h2>
        <p className="text-indigo-100 font-body text-base mb-8 max-w-md mx-auto leading-relaxed">
          Upload your first PDF in seconds — no account required.
        </p>
        <button onClick={user ? onEnterDashboard : onGetStarted}
          className="inline-flex items-center gap-2 bg-white font-body font-semibold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
          style={{color:"#6366f1"}}>
          {user ? "Go to Dashboard" : "Get Started"} <ChevronRight size={18}/>
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{background:"#1e1b4b"}} className="py-12 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>
            <GraduationCap size={17} className="text-white"/>
          </div>
          <span className="font-display font-semibold text-lg text-white">AI Tutor</span>
        </div>
        <p className="text-indigo-300 font-body text-sm">Intelligent learning powered by RAG + Groq AI</p>
      </div>
    </footer>
  );
}

export default function LandingPage({ onLoginClick, onRegisterClick, user, onGetStarted, onEnterDashboard, onLogout }) {
  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={onLoginClick} user={user} onEnterDashboard={onEnterDashboard} onLogout={onLogout}/>
      <Hero   onGetStarted={onGetStarted} user={user} onEnterDashboard={onEnterDashboard}/>
      <Features/>
      <HowItWorks/>
      <About/>
      <CTABanner onGetStarted={onGetStarted} user={user} onEnterDashboard={onEnterDashboard}/>
      <Footer/>
    </div>
  );
}