// src/components/Quiz.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { generateQuiz, scoreQuiz } from "../api/client";
import { recordQuizResult } from "./Dashboard";  // ← NEW: for dashboard tracking

const QUIZ_TYPES      = ["MCQ", "Short Answer", "Fill in the Blank"];
const QUESTION_COUNTS = [3, 5, 7, 10];

function MCQQuestion({ question, index, answer, onAnswer, revealed }) {
  return (
    <div className="space-y-3">
      <p className="font-body text-stone-800 font-medium leading-relaxed">
        <span className="text-violet-600 font-semibold mr-2">Q{index + 1}.</span>
        {question.question}
      </p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let cls = "quiz-option aurora-card px-4 py-3 text-sm font-body text-stone-700 border-2 border-stone-100";
          if (revealed) {
            if (opt === question.answer) cls += " correct";
            else if (opt === answer && opt !== question.answer) cls += " wrong";
          } else if (opt === answer) {
            cls += " border-4 border-violet-400 bg-violet-50";
          }
          return (
            <div key={i} className={cls} onClick={() => !revealed && onAnswer(opt)}>
              <div className="flex items-center gap-3">
                {revealed && opt === question.answer && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                {revealed && opt === answer && opt !== question.answer && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                {opt}
              </div>
            </div>
          );
        })}
      </div>
      {revealed && question.explanation && (
        <div className="flex gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 font-body">
          <Lightbulb size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <span>{question.explanation}</span>
        </div>
      )}
    </div>
  );
}

function ShortAnswerQuestion({ question, index, answer, onAnswer, revealed }) {
  return (
    <div className="space-y-3">
      <p className="font-body text-stone-800 font-medium leading-relaxed">
        <span className="text-violet-600 font-semibold mr-2">Q{index + 1}.</span>
        {question.question}
      </p>
      <textarea
        value={answer || ""}
        onChange={(e) => !revealed && onAnswer(e.target.value)}
        placeholder="Type your answer here…"
        disabled={revealed}
        rows={3}
        className="w-full resize-none bg-white/80 border border-aurora-sand rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all font-body disabled:bg-stone-50"
      />
      {revealed && (
        <div className="space-y-2">
          <div className="px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl text-sm font-body text-violet-800">
            <span className="font-semibold">Model Answer: </span>{question.answer}
          </div>
          {question.hint && (
            <div className="flex gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 font-body">
              <Lightbulb size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              {question.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FITBQuestion({ question, index, answer, onAnswer, revealed }) {
  return (
    <div className="space-y-3">
      <p className="font-body text-stone-800 font-medium leading-relaxed">
        <span className="text-violet-600 font-semibold mr-2">Q{index + 1}.</span>
        {question.question}
      </p>
      <input
        type="text"
        value={answer || ""}
        onChange={(e) => !revealed && onAnswer(e.target.value)}
        placeholder="Fill in the blank…"
        disabled={revealed}
        className="w-full bg-white/80 border border-aurora-sand rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all font-body disabled:bg-stone-50"
      />
      {revealed && (
        <div className="px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl text-sm font-body text-violet-800">
          <span className="font-semibold">Answer: </span>{question.answer}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ score, total, percentage, onRetry }) {
  const pct   = percentage ?? Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "📖";
  const label = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : "Keep Studying!";
  return (
    <div className="flex flex-col items-center gap-6 py-16 animate-fade-in">
      <div className="text-6xl">{emoji}</div>
      <div className="text-center">
        <div className="font-display text-4xl text-stone-800 mb-1">{score}/{total}</div>
        <div className="text-stone-500 font-body">{label} · {pct}% correct</div>
      </div>
      <div className="w-64 bg-stone-100 rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #6366f1)" }} />
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-body font-medium transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
      >
        <RotateCcw size={16} />
        Try Another Quiz
      </button>
    </div>
  );
}

// ── Props: isReady, onBack, user (NEW), prefillTopic (NEW) ────────────────────
export default function Quiz({ isReady, onBack, user, prefillTopic }) {
  const [topic,      setTopic]      = useState("");
  const [quizType,   setQuizType]   = useState("MCQ");
  const [numQ,       setNumQ]       = useState(5);
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed,   setRevealed]   = useState(false);
  const [scoreData,  setScoreData]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [phase,      setPhase]      = useState("config"); // config | quiz | score

  // ── Prefill topic from Dashboard weak-topic button ──
  useEffect(() => {
    if (prefillTopic) setTopic(prefillTopic);
  }, [prefillTopic]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateQuiz(topic, quizType, numQ);
      setQuestions(res.questions);
      setAnswers({});
      setCurrentIdx(0);
      setRevealed(false);
      setScoreData(null);
      setPhase("quiz");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topic, quizType, numQ]);

  const handleAnswer = (val) => setAnswers((prev) => ({ ...prev, [currentIdx]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userAnswers = questions.map((_, i) => answers[i] || "");
      const res = await scoreQuiz(questions, userAnswers, quizType);
      setScoreData(res);
      setPhase("score");

      // ── Record result in Dashboard ──────────────────────────────
      const username = user?.username || "guest";
      const pct = res.percentage ?? Math.round(((res.correct ?? res.score ?? 0) / (res.total ?? questions.length)) * 100);
      recordQuizResult(username, {
        topic,
        quizType,
        score:      res.correct ?? res.score ?? 0,
        total:      res.total   ?? questions.length,
        percentage: pct,
        timestamp:  new Date().toISOString(),
      });
      // ────────────────────────────────────────────────────────────

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setPhase("config"); setQuestions([]); setAnswers({}); setScoreData(null); setError(null); };

  const q        = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-aurora-sand/60 bg-white/40 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-violet-600 transition-colors font-body"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 className="font-display text-xl text-stone-900 font-bold">Quiz Me</h1>
          <p className="text-xs text-stone-500 font-body">AI-generated questions from your document</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Config phase */}
        {phase === "config" && (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <div className="aurora-card p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-body block mb-2">
                  Topic / Chapter
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Chapter 3 — Photosynthesis"
                  className="w-full bg-white/80 border border-aurora-sand rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all font-body"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-body block mb-2">
                  Quiz Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {QUIZ_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuizType(t)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-body font-medium border-2 transition-all ${
                        quizType === t
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-stone-200 text-stone-600 hover:border-violet-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-body block mb-2">
                  Number of Questions
                </label>
                <div className="flex gap-2">
                  {QUESTION_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumQ(n)}
                      className={`w-12 h-10 rounded-xl text-sm font-body font-medium border-2 transition-all ${
                        numQ === n
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-stone-200 text-stone-600 hover:border-violet-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-body">{error}</div>
            )}
            {!isReady && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-body">
                ⚠️ Upload a PDF first to generate quiz questions.
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!isReady || !topic.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-body font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Generating quiz…</> : <><Brain size={16} />Generate Quiz</>}
            </button>
          </div>
        )}

        {/* Quiz phase */}
        {phase === "quiz" && q && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-stone-500 font-body">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span className="tag-pill">{quizType}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #6366f1)" }} />
              </div>
            </div>

            <div className="aurora-card p-6">
              {quizType === "MCQ"               && <MCQQuestion         question={q} index={currentIdx} answer={answers[currentIdx]} onAnswer={handleAnswer} revealed={revealed} />}
              {quizType === "Short Answer"      && <ShortAnswerQuestion question={q} index={currentIdx} answer={answers[currentIdx]} onAnswer={handleAnswer} revealed={revealed} />}
              {quizType === "Fill in the Blank" && <FITBQuestion        question={q} index={currentIdx} answer={answers[currentIdx]} onAnswer={handleAnswer} revealed={revealed} />}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setCurrentIdx((i) => i - 1); setRevealed(false); }}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-30 font-body transition-all"
              >
                <ChevronLeft size={15} /> Prev
              </button>

              {quizType !== "MCQ" && !revealed && (
                <button
                  onClick={() => setRevealed(true)}
                  className="px-4 py-2.5 rounded-xl border border-amber-300 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 font-body transition-all"
                >
                  Reveal Answer
                </button>
              )}

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => { setCurrentIdx((i) => i + 1); setRevealed(false); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-body ml-auto transition-all"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
                >
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-body font-semibold ml-auto disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Trophy size={15} />}
                  Submit Quiz
                </button>
              )}
            </div>

            <button
              onClick={reset}
              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 font-body transition-colors"
            >
              <RotateCcw size={12} /> Start over
            </button>
          </div>
        )}

        {/* Score phase */}
        {phase === "score" && scoreData && (
          <div className="max-w-lg mx-auto">
            <ScoreCard
              score={scoreData.correct ?? scoreData.score ?? 0}
              total={scoreData.total ?? questions.length}
              percentage={scoreData.percentage}
              onRetry={reset}
            />
          </div>
        )}
      </div>
    </div>
  );
}