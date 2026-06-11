"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Option { label: string; value: string; }
interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[] | null;
  marks: number;
  order: number;
}
interface Test {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: number;
  totalMarks: number;
  passMark: number | null;
  questions: Question[];
}

type TestState = "intro" | "in-progress" | "submitted";

interface Result {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean | null;
  correctAnswers: Record<string, string>;
}

export function MockTestClient({ test }: { test: Test }) {
  const { user } = useAuth();
  const [state, setState] = useState<TestState>("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const submitTest = useCallback(async (userAnswers: Record<string, string>, timeTaken?: number) => {
    if (!user) return;
    setLoading(true);

    const res = await fetch(`/api/mock-tests/${test.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId: test.id, answers: userAnswers, timeTaken }),
    });

    const data = await res.json();
    if (data.success) {
      setResult(data.data);
      setState("submitted");
    }
    setLoading(false);
  }, [test, user]);

  useEffect(() => {
    if (state !== "in-progress") return;
    if (timeLeft <= 0) {
      submitTest(answers, test.duration * 60);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft, answers, test.duration, submitTest]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const q = test.questions[current];
  const answeredCount = Object.keys(answers).length;
  const timeTaken = test.duration * 60 - timeLeft;

  // Intro screen
  if (state === "intro") {
    return (
      <div>
        <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-8 mb-6">
          <Badge variant="default" className="mb-4">Mock Test</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">{test.title}</h1>
          {test.description && <p className="text-gray-600 dark:text-gray-300 mb-6">{test.description}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Questions", value: test.questions.length },
              { label: "Duration", value: `${test.duration} mins` },
              { label: "Total Marks", value: test.totalMarks },
              { label: "Pass Mark", value: test.passMark ? `${test.passMark}/${test.totalMarks}` : "N/A" },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-800">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{item.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {!user ? (
          <div className="p-5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <Link href="/auth/login" className="font-semibold underline">Sign in</Link> to submit and track your results.
              You can still practice without an account.
            </p>
          </div>
        ) : null}

        {test.questions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">This test has no questions yet.</p>
        ) : (
          <Button onClick={() => setState("in-progress")} className="w-full sm:w-auto px-8" aria-label="Start mock test">
            Start Test
          </Button>
        )}
      </div>
    );
  }

  // Results screen
  if (state === "submitted" && result) {
    return (
      <div>
        <div className={`rounded-2xl p-8 mb-6 border ${result.passed === false ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"}`}>
          <div className="text-center mb-6">
            {result.passed === false ? (
              <XCircle size={48} className="text-red-500 mx-auto mb-3" aria-hidden="true" />
            ) : (
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" aria-hidden="true" />
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {result.passed === null ? "Test Completed!" : result.passed ? "Congratulations! You Passed!" : "Keep Practicing!"}
            </h2>
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 my-4">
              {result.percentage}%
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Score: {result.score} / {result.totalMarks}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Review Answers</h3>
          {test.questions.map((q, idx) => {
            const userAns = answers[q.id];
            const correctAns = result.correctAnswers[q.id];
            const isCorrect = userAns === correctAns;

            return (
              <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10" : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 mt-0.5 ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                    {isCorrect ? <CheckCircle size={18} aria-label="Correct" /> : <XCircle size={18} aria-label="Incorrect" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Q{idx + 1}. {q.text}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Your answer: <span className={isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>{userAns || "Not answered"}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Correct: <span className="font-medium">{correctAns}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setState("intro"); setAnswers({}); setCurrent(0); setTimeLeft(test.duration * 60); setResult(null); }} variant="outline" aria-label="Retry test">
            Try Again
          </Button>
          <Link href="/mock-tests"><Button variant="secondary" aria-label="Back to mock tests">Back to Tests</Button></Link>
        </div>
      </div>
    );
  }

  // Test in progress
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{test.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Question {current + 1} of {test.questions.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">{answeredCount}/{test.questions.length} answered</span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${timeLeft < 300 ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
            <Clock size={14} aria-hidden="true" />
            <time aria-label={`Time remaining: ${formatTime(timeLeft)}`}>{formatTime(timeLeft)}</time>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-6" role="progressbar" aria-valuenow={answeredCount} aria-valuemax={test.questions.length} aria-label="Test progress">
        <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${(answeredCount / test.questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-5">
        <p className="text-base font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
          <span className="text-blue-600 dark:text-blue-400 font-bold mr-2">Q{current + 1}.</span>
          {q.text}
        </p>

        {q.type === "MCQ" && q.options && (
          <div className="space-y-3" role="radiogroup" aria-label={`Question ${current + 1} options`}>
            {(q.options as Option[]).map((opt) => (
              <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q.id] === opt.value ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"}`}>
                <input type="radio" name={q.id} value={opt.value} checked={answers[q.id] === opt.value} onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt.value }))} className="sr-only" />
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${answers[q.id] === opt.value ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}>
                  {answers[q.id] === opt.value && <div className="w-full h-full rounded-full bg-white scale-[0.4] block" />}
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === "TRUE_FALSE" && (
          <div className="flex gap-4" role="radiogroup" aria-label={`Question ${current + 1} true/false`}>
            {["True", "False"].map((val) => (
              <label key={val} className={`flex-1 py-4 text-center rounded-xl border-2 cursor-pointer font-semibold transition-all ${answers[q.id] === val ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300"}`}>
                <input type="radio" name={q.id} value={val} checked={answers[q.id] === val} onChange={() => setAnswers((p) => ({ ...p, [q.id]: val }))} className="sr-only" />
                {val}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} variant="outline" className="flex items-center gap-2" aria-label="Previous question">
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </Button>

        {current < test.questions.length - 1 ? (
          <Button onClick={() => setCurrent((c) => c + 1)} className="flex items-center gap-2" aria-label="Next question">
            Next <ChevronRight size={16} aria-hidden="true" />
          </Button>
        ) : (
          <Button
            onClick={() => submitTest(answers, timeTaken)}
            loading={loading}
            className="bg-green-600 hover:bg-green-700"
            aria-label="Submit test"
          >
            Submit Test
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="mt-6 flex flex-wrap gap-1.5" role="navigation" aria-label="Question navigation">
        {test.questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${idx === current ? "bg-blue-600 text-white" : answers[test.questions[idx].id] ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            aria-label={`Go to question ${idx + 1}`}
            aria-current={idx === current ? "true" : undefined}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
