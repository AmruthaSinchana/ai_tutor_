// src/components/LandingPage.jsx
import React from "react";
import {
  BookOpen,
  FileText,
  Bot,
  PenLine,
  Brain,
  ChevronRight,
  Play,
  Layers,
  Database,
  Zap,
  GraduationCap,
  Users,
  Target,
} from "lucide-react";

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onGetStarted }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <GraduationCap size={17} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-stone-800">AI Tutor</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[["Features","#features"],["How It Works","#how-it-works"],["Stats","#stats"],["About","#about"]].map(([label, href]) => (
            <a key={label} href={href} className="text-sm text-stone-600 hover:text-indigo-600 transition-colors font-body">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-xl border-2 border-stone-200 text-sm font-body font-medium text-stone-700 hover:border-indigo-400 hover:text-indigo-700 transition-all"
          >
            Log In
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-body font-semibold shadow-sm transition-all hover:-translate-y-0.5"
            style={{background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)"}}
          >
            Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onGetStarted }) {
  return (
    <section
      className="pt-40 pb-28 px-6 text-center"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), #f8f8ff"
      }}
    >
      <div className="max-w-3xl mx-auto space-y-7">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-100 bg-indigo-50">
          <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full font-body"
            style={{background: "linear-gradient(135deg, #6366f1, #7c3aed)"}}>
            NEW
          </span>
          <span className="text-sm text-indigo-700 font-body">Powered by Groq + RAG Pipeline</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-900 leading-tight">
          Learn Smarter with{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{backgroundImage: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)"}}
          >
            AI-Powered Tutoring
          </span>
        </h1>

        <p className="text-lg text-stone-500 font-body max-w-xl mx-auto leading-relaxed">
          Upload your PDFs. Ask questions, generate summaries, and take
          auto-quizzes — all powered by RAG and Groq AI.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-body font-semibold text-base shadow-lg hover:-translate-y-0.5 transition-all"
            style={{background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)", boxShadow: "0 8px 30px rgba(99,102,241,0.35)"}}
          >
            Start Learning Free
            <ChevronRight size={18} />
          </button>
          <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl border-2 border-stone-200 text-stone-700 font-body font-medium text-base hover:border-indigo-300 hover:bg-indigo-50 transition-all">
            <Play size={15} className="fill-stone-600" />
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileText,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    title: "PDF Upload & Processing",
    desc: "Upload any PDF and our pipeline extracts, chunks, and embeds the content using Sentence Transformers into a FAISS vector database instantly.",
  },
  {
    icon: Bot,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    title: "AI Question Answering",
    desc: "Ask any question about your document. Our RAG pipeline retrieves the most relevant chunks and Groq LLM generates precise, contextual answers.",
  },
  {
    icon: PenLine,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "Chapter Summarization",
    desc: "Generate intelligent summaries for any chapter or section. Get the key insights without reading through every page.",
  },
  {
    icon: Brain,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    title: "Auto Quiz Generation",
    desc: "Turn any document into a quiz instantly. Test your knowledge with AI-generated MCQs tailored to the content you uploaded.",
  },
];

function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-body bg-indigo-50 text-indigo-600 mb-4">
            Features
          </span>
          <h2 className="font-display text-4xl font-bold text-stone-900 mt-3 mb-4">
            Everything You Need to Ace Your Exams
          </h2>
          <p className="text-stone-500 font-body text-base max-w-lg mx-auto">
            From document upload to intelligent Q&A — your complete AI study companion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, iconBg, iconColor, title, desc }) => (
            <div
              key={title}
              className="p-7 rounded-2xl border border-stone-100 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-5`}>
                <Icon size={22} className={iconColor} />
              </div>
              <h3 className="font-display font-semibold text-lg text-stone-800 mb-2">{title}</h3>
              <p className="text-stone-500 font-body text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    gradient: "linear-gradient(135deg, #6366f1, #7c3aed)",
    title: "Upload Your PDF",
    desc: "Drag and drop your study material. We support any PDF up to 50MB.",
  },
  {
    num: "02",
    gradient: "linear-gradient(135deg, #f97316, #ef4444)",
    title: "AI Processes It",
    desc: "Text is extracted, chunked, embedded, and indexed in our FAISS vector store.",
  },
  {
    num: "03",
    gradient: "linear-gradient(135deg, #14b8a6, #22c55e)",
    title: "Start Learning",
    desc: "Ask questions, generate summaries, or take auto-created quizzes.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{background:"#f8f8ff"}}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-body bg-indigo-50 text-indigo-600 mb-4">
            How It Works
          </span>
          <h2 className="font-display text-4xl font-bold text-stone-900 mt-3">
            Up and Running in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ num, gradient, title, desc }) => (
            <div key={num} className="p-8 rounded-2xl bg-white border border-stone-100 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{background: gradient}}
              >
                <span className="text-white font-display font-bold text-lg">{num}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-stone-800 mb-2">{title}</h3>
              <p className="text-stone-500 font-body text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "50MB", label: "Max PDF size" },
  { value: "RAG", label: "Retrieval pipeline" },
  { value: "3", label: "Quiz types" },
  { value: "4", label: "Summary formats" },
];

function Stats() {
  return (
    <section id="stats" className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div
                className="font-display text-4xl font-bold mb-1 text-transparent bg-clip-text"
                style={{backgroundImage:"linear-gradient(135deg, #6366f1, #7c3aed)"}}
              >
                {value}
              </div>
              <div className="text-stone-500 font-body text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
const ABOUT_CARDS = [
  {
    icon: Layers,
    title: "RAG Pipeline",
    desc: "Retrieval-Augmented Generation ensures answers come directly from your document — no hallucinations.",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    icon: Database,
    title: "FAISS Vector Store",
    desc: "Lightning-fast semantic search powered by Facebook AI Similarity Search indexes your content instantly.",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: Zap,
    title: "Groq LLM",
    desc: "Llama 3 running on Groq hardware delivers blazing-fast responses — no waiting, no lag.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Target,
    title: "Built for Students",
    desc: "Designed specifically for exam prep — upload your textbook and start studying smarter immediately.",
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
];

function About() {
  return (
    <section id="about" className="py-24 px-6" style={{background:"#f8f8ff"}}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-body bg-indigo-50 text-indigo-600 mb-4">
            About
          </span>
          <h2 className="font-display text-4xl font-bold text-stone-900 mt-3 mb-4">
            Serious Tech, Simple Experience
          </h2>
          <p className="text-stone-500 font-body text-base max-w-lg mx-auto">
            Built on production-grade AI infrastructure so you can focus on learning, not the tech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ABOUT_CARDS.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex gap-4 p-6 rounded-2xl bg-white border border-stone-100 hover:shadow-md transition-all duration-200">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-stone-800 mb-1">{title}</h3>
                <p className="text-stone-500 font-body text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner({ onGetStarted }) {
  return (
    <section className="py-24 px-6 bg-white">
      <div
        className="max-w-3xl mx-auto rounded-3xl p-16 text-center shadow-2xl"
        style={{background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 60%, #6d28d9 100%)"}}
      >
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Ready to Study Smarter?
        </h2>
        <p className="text-indigo-100 font-body text-base mb-8 max-w-md mx-auto leading-relaxed">
          Upload your first PDF and experience AI-powered learning in seconds. No credit card required.
        </p>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 bg-white font-body font-semibold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
          style={{color: "#6366f1"}}
        >
          Get Started for Free
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{background:"#1e1b4b"}} className="py-12 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>
            <GraduationCap size={17} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-white">AI Tutor</span>
        </div>
        <p className="text-indigo-300 font-body text-sm">
          Intelligent learning powered by RAG + Groq AI
        </p>
        <div className="flex items-center justify-center gap-6 pt-2">
          {["Privacy", "Terms", "Contact", "GitHub"].map((item) => (
            <a key={item} href="#" className="text-indigo-400 hover:text-indigo-200 text-sm font-body transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen">
      <Navbar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <HowItWorks />
      <Stats />
      <About />
      <CTABanner onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}