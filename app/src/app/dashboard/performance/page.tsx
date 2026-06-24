"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  TrendingUp, BarChart3, Clock, CheckCircle2, Trophy, HelpCircle, 
  RefreshCw, Award, ArrowUpRight, Flame, Target, BookOpen, AlertCircle,
  FileText, ArrowDownRight, Compass, ShieldAlert, Zap, BookMarked
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4"];

export default function PerformanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "predictions" | "history" | "leaderboard">("overview");
  const [leaderboardTab, setLeaderboardTab] = useState<"overall" | "college" | "branch" | "state">("overall");
  
  // Goals (local state synced to localStorage)
  const [targetRank, setTargetRank] = useState(100);
  const [targetScore, setTargetScore] = useState(85);
  const [dailyGoal, setDailyGoal] = useState(60); // minutes
  const [editingGoals, setEditingGoals] = useState(false);

  // Log study session modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logTime, setLogTime] = useState(30);
  const [logQuestions, setLogQuestions] = useState(10);
  const [logNotes, setLogNotes] = useState(2);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
    
    // Load goals from local storage if available
    const savedTargetRank = localStorage.getItem("leet_target_rank");
    const savedTargetScore = localStorage.getItem("leet_target_score");
    const savedDailyGoal = localStorage.getItem("leet_daily_goal");
    if (savedTargetRank) setTargetRank(parseInt(savedTargetRank));
    if (savedTargetScore) setTargetScore(parseInt(savedTargetScore));
    if (savedDailyGoal) setDailyGoal(parseInt(savedDailyGoal));
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/performance");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load performance metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("leet_target_rank", targetRank.toString());
    localStorage.setItem("leet_target_score", targetScore.toString());
    localStorage.setItem("leet_daily_goal", dailyGoal.toString());
    setEditingGoals(false);
  };

  const handleLogStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogging(true);
    try {
      const res = await fetch("/api/dashboard/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyTime: logTime,
          questionsSolved: logQuestions,
          notesViewed: logNotes,
          testsAttempted: 0
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowLogModal(false);
        // Refresh dashboard data
        await fetchPerformanceData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <RefreshCw className="animate-spin text-blue-500 mb-4" size={36} />
        <p className="text-sm">Compiling your LEET performance analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 text-center">
        <AlertCircle className="text-red-500 mb-3" size={48} />
        <h1 className="text-xl font-bold">Failed to load performance metrics</h1>
        <p className="text-sm mt-1 mb-6">Please make sure you are signed in and have database connections ready.</p>
        <Button onClick={fetchPerformanceData} className="bg-blue-600 hover:bg-blue-700">Retry</Button>
      </div>
    );
  }

  const { overview, streaks, predictions, subjectPerformance, branchPerformance, weakTopics, strongTopics, dailyStudyReport, testWisePerformance, leaderboards } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-semibold mb-3">
                <Zap size={12} className="animate-pulse" />
                Performance Dashboard
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your LEET Exam Insights
              </h1>
              <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">Detailed evaluation of test performance, study habits, predictions, and state ranking.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowLogModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all font-semibold rounded-xl text-white border-0"
              >
                Log Study Session
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchPerformanceData}
                className="border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-900"
              >
                <RefreshCw size={14} className="mr-1.5" />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Overall Accuracy", value: `${overview.overallAccuracy}%`, desc: "Correct answers", icon: Target, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50/30 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-slate-900 dark:text-white" },
              { label: "Tests Attempted", value: overview.totalTests, desc: "Mock tests taken", icon: BookOpen, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-50/30 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30 text-slate-900 dark:text-white" },
              { label: "Consecutive Study Streak", value: `${streaks.currentStreak} Days`, desc: "Study streak", icon: Flame, color: "text-amber-500", bg: "bg-amber-50/30 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-slate-900 dark:text-white" }
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`border rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-200 ${stat.bg}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold">{stat.label}</span>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{stat.value}</div>
                  <span className="text-[10px] text-slate-500 dark:text-gray-500 font-medium block mt-1">{stat.desc}</span>
                </div>
              );
            })}
          </div>

          {/* Grid Layout: left side navigation tabs, right side dynamic content */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Tabs List Sidebar */}
            <div className="w-full lg:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-4 lg:pb-0 lg:pr-6 flex-shrink-0 scrollbar-none">
              {[
                { id: "overview", label: "Overview & Habits", icon: TrendingUp },
                { id: "subjects", label: "Subject-wise Analysis", icon: BarChart3 },
                { id: "predictions", label: "Rank & Admissions", icon: Trophy },
                { id: "leaderboard", label: "Leaderboards", icon: Award },
                { id: "history", label: "Test History", icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" 
                        : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-900"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full min-w-0">
              
              {/* ─── TAB: OVERVIEW & HABITS ─── */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Row 1: Study Streaks & Goal Tracker */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Goal Tracker */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Target size={120} />
                      </div>
                      <CardHeader className="flex flex-row justify-between items-center pb-2">
                        <div>
                          <CardTitle className="text-slate-900 dark:text-white text-base">Targets & Goals</CardTitle>
                          <CardDescription className="text-slate-500 dark:text-gray-400 text-xs">Track progress against exam targets</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingGoals(!editingGoals)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                        >
                          {editingGoals ? "Cancel" : "Edit Goals"}
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {editingGoals ? (
                          <form onSubmit={saveGoals} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase">Target Rank</label>
                                <input type="number" value={targetRank} onChange={(e) => setTargetRank(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase">Target %</label>
                                <input type="number" value={targetScore} onChange={(e) => setTargetScore(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase">Daily Goal (Mins)</label>
                                <input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none" />
                              </div>
                            </div>
                            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 w-full rounded-lg text-xs font-semibold text-white border-0">Save Goals</Button>
                          </form>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock size={12} /> Daily Study Habit</span>
                                <span className="text-slate-700 dark:text-slate-350">{Math.min(100, Math.round((overview.dailyStudyTime / dailyGoal) * 100))}% ({overview.dailyStudyTime}/{dailyGoal} mins)</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-gray-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-gray-850">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (overview.dailyStudyTime / dailyGoal) * 100)}%` }} />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                              <div>
                                <span className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold uppercase block">Target Rank</span>
                                <span className="text-lg font-extrabold text-slate-900 dark:text-white"># {targetRank}</span>
                                <span className="text-[9px] text-slate-500 dark:text-gray-500 block">Current estimated: #{predictions.expectedRank}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold uppercase block">Target Score</span>
                                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{targetScore}%</span>
                                <span className="text-[9px] text-slate-550 dark:text-gray-500 block">Current average: {predictions.expectedScore}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Streak Info */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Flame size={120} />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-slate-900 dark:text-white text-base">Study Streaks</CardTitle>
                        <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Consistent habits build success</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-gray-850">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg">
                              <Flame size={18} className="animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">Study Streak</p>
                              <p className="text-[10px] text-slate-500 dark:text-gray-500">Consecutive study logs</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-amber-500">{streaks.currentStreak} Days</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-gray-850 rounded-xl flex flex-col justify-between">
                            <span className="text-[10px] text-slate-550 dark:text-gray-400 font-semibold uppercase">Tests Attempted</span>
                            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{overview.totalTests}</span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-gray-850 rounded-xl flex flex-col justify-between">
                            <span className="text-[10px] text-slate-550 dark:text-gray-400 font-semibold uppercase">Total Study Time</span>
                            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{Math.round(overview.totalStudyTime / 60)} Hrs</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Earned Badges */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Award size={120} />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-slate-900 dark:text-white text-base">Earned Badges</CardTitle>
                      <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Achievements unlocked through consistent studying</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-amber-200 dark:border-amber-900/30 rounded-xl text-center">
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 text-amber-500 rounded-full flex items-center justify-center mb-2">
                            <Flame size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">7 Day Streak</span>
                          <span className="text-[9px] text-slate-500 dark:text-gray-500 mt-1">Consistency is key</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-blue-200 dark:border-blue-900/30 rounded-xl text-center">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                            <BookOpen size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">First Test</span>
                          <span className="text-[9px] text-slate-500 dark:text-gray-500 mt-1">Journey begins</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-purple-200 dark:border-purple-900/30 rounded-xl text-center">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-500 rounded-full flex items-center justify-center mb-2">
                            <Target size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">High Scorer</span>
                          <span className="text-[9px] text-slate-500 dark:text-gray-500 mt-1">Above 80% accuracy</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-center">
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Goal Crusher</span>
                          <span className="text-[9px] text-slate-500 dark:text-gray-500 mt-1">Met daily goal 5x</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Row 2: Study Habits Trend Graph */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Clock className="text-blue-500" size={18} />
                        Time Spent Learning Tracker
                      </CardTitle>
                      <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Total study hours, questions solved, and progress over the last week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dailyStudyReport} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                            <XAxis dataKey="label" className="fill-slate-400 dark:fill-slate-500" fontSize={11} />
                            <YAxis className="fill-slate-400 dark:fill-slate-500" fontSize={11} label={{ value: "Minutes", angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }} />
                            <Area type="monotone" dataKey="studyTime" name="Study Time (Mins)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudy)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Strong Topics */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                          <CheckCircle2 className="text-green-500" size={18} />
                          Strong Topics (High Accuracy)
                        </CardTitle>
                        <CardDescription className="text-slate-555 dark:text-gray-400 text-xs">Subjects and topics where accuracy is above 80%</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {strongTopics.map((topic: any, idx: number) => (
                          <div key={`${topic.topic}-${idx}`} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-gray-850 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{topic.topic}</p>
                              <p className="text-[10px] text-slate-500 dark:text-gray-500">{topic.subject}</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{topic.accuracy}% accuracy</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
 
                    {/* Weak Topics */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-red-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                          <ShieldAlert className="text-red-500" size={18} />
                          Weak Topics (Review Needed)
                        </CardTitle>
                        <CardDescription className="text-slate-555 dark:text-gray-400 text-xs">Topics below 60% accuracy. Practice papers suggested</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {weakTopics.map((topic: any, idx: number) => (
                          <div key={`${topic.topic}-${idx}`} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-gray-850 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{topic.topic}</p>
                                <p className="text-[10px] text-slate-500 dark:text-gray-500">{topic.subject}</p>
                              </div>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{topic.accuracy}% accuracy</span>
                            </div>
                            <div className="flex gap-2 pt-1 border-t border-slate-200 dark:border-gray-800">
                              <a href="/papers" className="inline-flex items-center text-[10px] text-blue-600 dark:text-blue-400 hover:underline gap-0.5 font-semibold">
                                <FileText size={10} /> Practice Papers
                              </a>
                              <a href="/resources" className="inline-flex items-center text-[10px] text-purple-600 dark:text-purple-400 hover:underline gap-0.5 font-semibold">
                                <BookMarked size={10} /> Review Study Notes
                              </a>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ─── TAB: SUBJECT-WISE PERFORMANCE ─── */}
              {activeTab === "subjects" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Subject Accuracy Chart */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white text-base">Subject Accuracy Breakdown</CardTitle>
                      <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Evaluate accuracy percentage across all LEET core subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={subjectPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                            <XAxis dataKey="subject" className="fill-slate-400 dark:fill-slate-500" stroke="#9ca3af" fontSize={10} />
                            <YAxis className="fill-slate-400 dark:fill-slate-500" stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }} />
                            <Bar dataKey="accuracy" name="Accuracy %" radius={[4, 4, 0, 0]} barSize={35}>
                              {subjectPerformance.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subject Audit Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjectPerformance.map((sub: any, idx: number) => (
                      <div key={sub.subject} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sub.subject}</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-550">Attempted {sub.attempts} questions</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold block" style={{ color: COLORS[idx % COLORS.length] }}>
                              {sub.accuracy}%
                            </span>
                            <span className="text-[9px] text-slate-550 dark:text-gray-400 font-semibold block uppercase">Estimated Rank: #{sub.rank}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-gray-400 leading-relaxed p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-slate-100 dark:border-gray-850">
                          {sub.suggestions}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Branch-wise comparison */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Compass className="text-purple-500" size={18} />
                        Branch-wise Comparison Dashboard
                      </CardTitle>
                      <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Compare your average score with other engineering branch averages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={branchPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                            <XAxis dataKey="branch" className="fill-slate-400 dark:fill-slate-500" stroke="#9ca3af" fontSize={11} />
                            <YAxis className="fill-slate-400 dark:fill-slate-500" stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="averageScore" name="Branch Avg Score" fill="#cbd5e1" stroke="#94a3b8" className="dark:fill-slate-800 dark:stroke-slate-700" strokeWidth={1} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="userScore" name="My Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── TAB: PREDICTIONS & ADMISSIONS ─── */}
              {activeTab === "predictions" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Circular/Premium Readiness Meter */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Readiness */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-slate-900 dark:text-white text-base">Exam Readiness</CardTitle>
                        <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Percent ready for final LEET exam</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="72" cy="72" r="62" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                            <circle cx="72" cy="72" r="62" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray={389} strokeDashoffset={389 - (389 * overview.examReadiness) / 100} className="transition-all duration-1000 ease-out" />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{overview.examReadiness}%</span>
                            <span className="text-[10px] text-slate-550 dark:text-gray-400 block font-semibold uppercase mt-0.5">Ready</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rank Predictor */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl md:col-span-2 relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Trophy size={160} />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-slate-900 dark:text-white text-base">State Rank & Score Predictor</CardTitle>
                        <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Estimated based on test performance and state competition trends</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-gray-950 border border-slate-100 dark:border-gray-850 rounded-xl">
                            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase">Predicted Score</span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">{predictions.expectedScore}%</span>
                            <span className="text-[9px] text-slate-500 dark:text-gray-400 block mt-1">Accuracy proxy score</span>
                          </div>
                          
                          <div className="p-4 bg-slate-50 dark:bg-gray-950 border border-slate-100 dark:border-gray-850 rounded-xl">
                            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase">Expected State Rank</span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-500 block mt-1"># {predictions.expectedRank}</span>
                            <span className="text-[9px] text-slate-500 dark:text-gray-400 block mt-1">Out of ~15,000 candidates</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-gray-950 border border-slate-100 dark:border-gray-850 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase">Admission Chances</span>
                            <span className={`text-sm font-extrabold block mt-0.5 ${predictions.chanceColor}`}>
                              {predictions.admissionChances}
                            </span>
                          </div>
                          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                            <ArrowUpRight size={18} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Results Analytics Breakdown */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white text-base">Detailed Result Analytics</CardTitle>
                      <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Analysis of correct/wrong answer counts and time taken per test</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      {testWisePerformance.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-10">Attempt mock tests to populate detailed result breakdown.</p>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-y border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-550 dark:text-gray-400">
                              <th className="p-4 font-semibold">Mock Test Name</th>
                              <th className="p-4 font-semibold text-center">Score Obtained</th>
                              <th className="p-4 font-semibold text-center">Accuracy %</th>
                              <th className="p-4 font-semibold text-center">Status</th>
                              <th className="p-4 font-semibold">Attempt Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testWisePerformance.map((row: any) => (
                              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-550/5 dark:hover:bg-gray-850/20">
                                <td className="p-4 text-slate-900 dark:text-white font-medium">{row.testName}</td>
                                <td className="p-4 text-center text-blue-600 dark:text-blue-400 font-bold">{row.score} / {row.totalMarks}</td>
                                <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{row.accuracy}%</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.score >= row.totalMarks * 0.4 ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                                    {row.score >= row.totalMarks * 0.4 ? "PASSED" : "FAILED"}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-500 dark:text-gray-400">{row.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── TAB: LEADERBOARD ─── */}
              {activeTab === "leaderboard" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Leaderboard Category Selector */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
                    {[
                      { id: "overall", label: "Overall Rankings" },
                      { id: "college", label: "My College" },
                      { id: "branch", label: "My Branch" },
                      { id: "state", label: "My State" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setLeaderboardTab(tab.id as any)}
                        className={`py-3 text-xs font-bold border-b-2 -mb-px transition-all ${
                          leaderboardTab === tab.id 
                            ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                            : "border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Leaderboard Table */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-y border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-550 dark:text-gray-400">
                            <th className="p-4 font-semibold w-16 text-center">Rank</th>
                            <th className="p-4 font-semibold">Student Name</th>
                            {leaderboardTab === "overall" && <th className="p-4 font-semibold">College / State</th>}
                            <th className="p-4 font-semibold text-center">Avg Score %</th>
                            <th className="p-4 font-semibold text-center">Estimated Accuracy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboards[leaderboardTab].map((row: any) => (
                            <tr 
                              key={row.name} 
                              className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-550/5 dark:hover:bg-gray-850/20 ${
                                row.name === "Nishant" ? "bg-blue-600/5 hover:bg-blue-600/10 font-medium" : ""
                              }`}
                            >
                              <td className="p-4 text-center font-bold">
                                {row.rank <= 3 ? (
                                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                                    row.rank === 1 ? "bg-amber-500 text-black" :
                                    row.rank === 2 ? "bg-gray-300 text-black" :
                                    "bg-amber-800 text-white"
                                  }`}>
                                    {row.rank}
                                  </span>
                                ) : row.rank}
                              </td>
                              <td className="text-slate-900 dark:text-white p-4">
                                <div className="flex items-center gap-2">
                                  {row.name}
                                  {row.name === "Nishant" && (
                                    <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">You</span>
                                  )}
                                </div>
                              </td>
                              {leaderboardTab === "overall" && (
                                <td className="p-4 text-slate-550 dark:text-gray-400">
                                  <div className="truncate max-w-[180px] text-slate-900 dark:text-slate-300">{row.college}</div>
                                  <div className="text-[10px] text-slate-500 dark:text-gray-500">{row.state}</div>
                                </td>
                              )}
                              <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">{row.score}%</td>
                              <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{row.accuracy}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── TAB: TEST HISTORY ─── */}
              {activeTab === "history" && (
                <div className="space-y-4 animate-fadeIn">
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CardHeader className="pb-2 flex flex-row justify-between items-center">
                      <div>
                        <CardTitle className="text-slate-900 dark:text-white text-base">Test History Archive</CardTitle>
                        <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">History of all attempted mock exams</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      {testWisePerformance.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-slate-500 text-sm">You haven&apos;t taken any mock tests yet.</p>
                          <a href="/mock-tests">
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Browse Mock Tests</Button>
                          </a>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-y border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-550 dark:text-gray-400">
                              <th className="p-4 font-semibold">Test Name</th>
                              <th className="p-4 font-semibold text-center">Score</th>
                              <th className="p-4 font-semibold text-center">Accuracy</th>
                              <th className="p-4 font-semibold">Completed Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testWisePerformance.map((row: any) => (
                              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-550/5 dark:hover:bg-gray-850/20">
                                <td className="p-4 text-slate-900 dark:text-white font-medium">{row.testName}</td>
                                <td className="p-4 text-center text-blue-600 dark:text-blue-400 font-bold">{row.score} / {row.totalMarks}</td>
                                <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{row.accuracy}%</td>
                                <td className="p-4 text-slate-500 dark:text-gray-400">{row.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>

      {/* Log Study Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden animate-slide-up text-slate-900 dark:text-white">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Today&apos;s Study Progress</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Track your study time and daily solved questions.</p>
            </div>
            
            <form onSubmit={handleLogStudy} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="logTime" className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase">Study Time (Minutes)</label>
                <input 
                  type="number" 
                  id="logTime" 
                  value={logTime} 
                  onChange={(e) => setLogTime(parseInt(e.target.value))} 
                  required
                  min={1}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="logQuestions" className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase">Questions Solved</label>
                <input 
                  type="number" 
                  id="logQuestions" 
                  value={logQuestions} 
                  onChange={(e) => setLogQuestions(parseInt(e.target.value))} 
                  required
                  min={0}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="logNotes" className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase">Study Notes / Chapters Viewed</label>
                <input 
                  type="number" 
                  id="logNotes" 
                  value={logNotes} 
                  onChange={(e) => setLogNotes(parseInt(e.target.value))} 
                  required
                  min={0}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={logging}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  Log Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline constant for subject matching in performance evaluation
const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Aptitude", "Engineering Subjects"];
const TOPICS: Record<string, string[]> = {
  "Mathematics": ["Calculus", "Linear Algebra", "Probability & Statistics", "Differential Equations", "Numerical Methods"],
  "Physics": ["Mechanics", "Thermodynamics", "Wave Optics", "Electromagnetism", "Modern Physics"],
  "Chemistry": ["Atomic Structure", "Chemical Bonding", "Electrochemistry", "Organic Reactions", "Coordination Compounds"],
  "Aptitude": ["Quantitative Aptitude", "Logical Reasoning", "Data Interpretation", "Verbal Ability"],
  "Engineering Subjects": ["Programming in C/C++", "Basic Electronics", "Electrical Circuits", "Engineering Mechanics", "Digital Logic"]
};
