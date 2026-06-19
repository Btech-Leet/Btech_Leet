"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Award, RefreshCw, Lock, Unlock, Trophy, Flame, Star,
  TrendingUp, AlertCircle, Sparkles, CheckCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Badge {
  type: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface BadgeData {
  badges: Badge[];
  totalUnlocked: number;
  totalBadges: number;
  progress: number;
}

const BADGE_GLOW_COLORS: Record<string, string> = {
  BEGINNER: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  INTERMEDIATE: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  ADVANCED: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  EXPERT: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  TOP_PERFORMER: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  WEEKLY_TOPPER: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  CONSISTENCY: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
  STREAK_7: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  STREAK_30: "from-cyan-500/20 to-teal-500/20 border-cyan-500/30",
  STREAK_100: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  IMPROVEMENT: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  FAST_LEARNER: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
};

export default function BadgesDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BadgeData | null>(null);
  const [checking, setChecking] = useState(false);
  const [newAwards, setNewAwards] = useState<string[]>([]);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/badges");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Failed to load badges:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/dashboard/badges", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data.count > 0) {
        setNewAwards(json.data.newlyAwarded.map((b: any) => b.title));
        await fetchBadges();
      }
    } catch (err) {
      console.error("Badge check error:", err);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <RefreshCw className="animate-spin text-purple-500 mb-4" size={36} />
        <p className="text-sm">Loading your achievement badges...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 text-center">
        <AlertCircle className="text-red-500 mb-3" size={48} />
        <h1 className="text-xl font-bold">Failed to load badges</h1>
        <p className="text-sm mt-1 mb-6">Please make sure you are signed in.</p>
        <Button onClick={fetchBadges} className="bg-purple-600 hover:bg-purple-700">Retry</Button>
      </div>
    );
  }

  const unlockedBadges = data.badges.filter((b) => b.unlocked);
  const lockedBadges = data.badges.filter((b) => !b.unlocked);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-semibold mb-3">
                <Award size={12} className="animate-pulse" />
                Achievements
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your Achievement Badges
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Complete challenges, maintain streaks, and ace your exams to unlock badges.
              </p>
            </div>
            <Button 
              onClick={triggerCheck}
              disabled={checking}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all font-semibold rounded-xl"
            >
              {checking ? <><RefreshCw size={14} className="mr-1.5 animate-spin" />Checking...</> : <><Sparkles size={14} className="mr-1.5" />Check for New Badges</>}
            </Button>
          </div>

          {/* New Awards Toast */}
          {newAwards.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 animate-bounce-subtle">
              <Trophy className="text-amber-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-amber-400">🎉 New Badges Unlocked!</p>
                <p className="text-xs text-amber-300/70">{newAwards.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* Progress Ring */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center py-8">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="55" stroke="#f1f5f9" strokeWidth="7" fill="transparent" className="dark:stroke-slate-800" />
                  <circle
                    cx="64" cy="64" r="55"
                    stroke="url(#badgeGrad)"
                    strokeWidth="7"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={345}
                    strokeDashoffset={345 - (345 * data.progress) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{data.progress}%</span>
                  <span className="text-[9px] text-slate-500 dark:text-gray-400 block font-semibold uppercase mt-0.5">Complete</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">{data.totalUnlocked} / {data.totalBadges} Badges Unlocked</p>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Trophy size={120} />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-900 dark:text-white text-base">Achievement Stats</CardTitle>
                <CardDescription className="text-slate-550 dark:text-gray-400 text-xs">Your badge collection overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-gray-850">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <Unlock size={14} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">Unlocked</span>
                  </div>
                  <span className="text-lg font-black text-emerald-500 dark:text-emerald-400">{data.totalUnlocked}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-gray-850">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-200 dark:bg-gray-700/30 text-slate-500 dark:text-gray-500 rounded-lg">
                      <Lock size={14} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">Locked</span>
                  </div>
                  <span className="text-lg font-black text-slate-500">{data.totalBadges - data.totalUnlocked}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Unlocks */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Star className="text-amber-500" size={16} />
                  Latest Unlocks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unlockedBadges.slice(0, 3).map((badge) => (
                  <div key={badge.type} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-gray-850">
                    <span className="text-xl">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{badge.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500">
                        {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                      </p>
                    </div>
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
                {unlockedBadges.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-gray-500 text-center py-4">No badges unlocked yet. Keep going!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Unlocked Badges Grid */}
          {unlockedBadges.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Unlock size={18} className="text-emerald-500" />
                Unlocked Achievements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.type}
                    className={`group relative p-5 bg-white dark:bg-slate-900 bg-gradient-to-br ${BADGE_GLOW_COLORS[badge.type] || "from-slate-50 to-slate-100 dark:from-gray-800/50 dark:to-gray-900/50 border-slate-200 dark:border-gray-700/30"} border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:scale-[1.03] transition-all duration-300 cursor-default`}
                  >
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={14} className="text-emerald-500" />
                    </div>
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{badge.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed mb-2">{badge.description}</p>
                    <div className="text-[9px] text-slate-500 dark:text-gray-500 font-semibold uppercase">
                      {badge.unlockedAt ? `Unlocked ${new Date(badge.unlockedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Unlocked"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges Grid */}
          {lockedBadges.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock size={18} className="text-slate-500" />
                Locked Badges — How to Unlock
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.type}
                    className="relative p-5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-2xl opacity-60 hover:opacity-80 transition-all duration-300 cursor-default"
                  >
                    <div className="absolute top-3 right-3">
                      <Lock size={12} className="text-slate-400 dark:text-gray-600" />
                    </div>
                    <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-gray-400 mb-1">{badge.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed mb-2">{badge.description}</p>
                    <div className="text-[9px] text-slate-600 dark:text-gray-400 font-semibold uppercase bg-slate-100 dark:bg-gray-950/50 rounded-lg px-2 py-1 inline-block">
                      🔒 {badge.condition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <style jsx global>{`
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 0.6s ease-in-out;
          }
        `}</style>
      </div>
    );
}
