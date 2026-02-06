
import React, { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import BarChart from "../components/BarChart";
import QuickAddWidget from "../components/QuickAddWidget";
import WaterTracker from "../components/WaterTracker";
import { normalizeFitnessData } from "../utils/fitnessNormalizer";
import { getWithCookie, postWithCookie } from "../api";

export default function FitnessDashboardPage() {
  const [fitness, setFitness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [syncStatus, setSyncStatus] = useState('synced');
  const [stepGoal, setStepGoal] = useState(0);
  const [newStepGoal, setNewStepGoal] = useState(0);
  const [isEditingStepGoal, setIsEditingStepGoal] = useState(false);
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

  const loadFitness = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setSyncStatus('syncing');
    }

    try {
      const apiData = await getWithCookie("/fit/getGoogleFitData");
      const normalizedData = normalizeFitnessData(apiData);
      setFitness(normalizedData);
      setStepGoal(apiData.stepGoal || 0);
      setSyncStatus('synced');
    } catch (error) {
      console.error("Failed to load fitness data:", error);
      setFitness(null);
      setSyncStatus('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFitness();
  }, []);


  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;
      if (pullDistance > 100 && !refreshing) {
        loadFitness(true);
      }
    }
  };

  const getStepsProgress = () => {
    if (!fitness?.todaySteps) return 0;
    if (stepGoal === 0) return 0;
    return Math.min((fitness.todaySteps / stepGoal) * 100, 100);
  };

  const updateStepGoal = async (newGoal) => {
    try {
      await postWithCookie("/fit/step-goal", { stepGoal: parseInt(newGoal) });
      setStepGoal(parseInt(newGoal));
      setIsEditingStepGoal(false);
    } catch (error) {
      console.error("Failed to update step goal", error);
    }
  };

  const getSleepQuality = (hours) => {
    if (!hours) return { label: "No data", color: "slate", emoji: "😴" };
    if (hours < 6) return { label: "Poor", color: "red", emoji: "😫" };
    if (hours < 7) return { label: "Fair", color: "amber", emoji: "😐" };
    if (hours < 9) return { label: "Good", color: "emerald", emoji: "😊" };
    return { label: "Excellent", color: "primary", emoji: "😴" };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                      flex items-center justify-center mb-4 animate-pulse">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">Syncing fitness data...</p>
        <div className="mt-4 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const sleepQuality = getSleepQuality(fitness?.sleepHours);
  const stepsProgress = getStepsProgress();

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24"
    >


      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 backdrop-blur-sm 
                      border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium text-slate-300">Syncing...</span>
        </div>
      )}


      <section className="px-5 pt-6 pb-4 relative">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black mb-1">
              <span className="gradient-text">Fitness Dashboard</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Track your daily activity & recovery
            </p>
          </div>


          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-sm
                         transition-all duration-300 hover:scale-105
                         ${syncStatus === 'synced' ? 'glass-card border-emerald-500/30 text-emerald-400 shadow-glow' : ''}
                         ${syncStatus === 'syncing' ? 'glass-card border-primary/30 text-primary' : ''}
                         ${syncStatus === 'error' ? 'glass-card border-red-500/30 text-red-400' : ''}`}>
            {syncStatus === 'synced' && (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Synced
              </>
            )}
            {syncStatus === 'syncing' && (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Syncing
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Error
              </>
            )}
          </div>
        </div>


        <button
          onClick={() => loadFitness(true)}
          disabled={refreshing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl 
                   bg-gradient-to-r from-primary to-emerald-500 text-slate-950 font-bold
                   hover:shadow-premium hover:scale-[1.02] active:scale-[0.98] 
                   disabled:opacity-50 transition-all duration-300 shimmer overflow-hidden
                   relative group"
        >
          <svg className={`w-5 h-5 relative z-10 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="relative z-10">{refreshing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </section>

      {!fitness ? (

        <section className="px-5">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-50 mb-2">No Fitness Data</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Connect your Google Fit or other fitness devices to see your activity, sleep, and workout data here.
            </p>
            <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                             text-slate-950 font-bold shadow-lg shadow-primary/25
                             hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-200">
              Connect Device
            </button>
          </div>
        </section>
      ) : (
        <>

          <section className="px-5 mb-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

              <div className="glass-card rounded-3xl p-6 hover:border-primary/50 hover:bg-white/10
                            transition-all duration-300 hover:shadow-premium shimmer">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wide">Steps Today</p>
                    <h2 className="text-5xl font-black text-slate-50">
                      {fitness.todaySteps?.toLocaleString() || "0"}
                    </h2>
                    {isEditingStepGoal ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={newStepGoal}
                          onChange={(e) => setNewStepGoal(e.target.value)}
                          className="w-28 glass-card rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                          autoFocus
                        />
                        <button
                          onClick={() => updateStepGoal(newStepGoal)}
                          className="px-3 py-2 bg-gradient-to-r from-primary to-emerald-500 text-slate-900 rounded-xl text-xs font-bold hover:shadow-premium transition-all"
                        >
                          Save
                        </button>
                        <button onClick={() => setIsEditingStepGoal(false)} className="text-xs text-slate-400 hover:text-white p-2 transition-colors">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-slate-500 font-medium">Goal: {stepGoal.toLocaleString()} steps</p>
                        <button
                          onClick={() => {
                            setNewStepGoal(stepGoal);
                            setIsEditingStepGoal(true);
                          }}
                          className="p-1.5 rounded-lg glass-card text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>


                  <div className="relative w-28 h-28 float">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - stepsProgress / 100)}`}
                        className="transition-all duration-1000"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-50">{Math.round(stepsProgress)}%</span>
                    </div>
                  </div>
                </div>


                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000 shadow-glow"
                    style={{ width: `${stepsProgress}%` }}
                  ></div>
                </div>
              </div>


              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-3">

                  <div className="glass-card rounded-3xl p-5 group hover:border-purple-500/50 hover:bg-white/10
                                transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-purple shimmer">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 
                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">{sleepQuality.emoji}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wide">Last Night</p>
                    <p className="text-4xl font-black text-slate-50 mb-2">
                      {fitness.sleepHours || "--"}
                      {fitness.sleepHours && <span className="text-sm font-normal text-slate-500 ml-1">hrs</span>}
                    </p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold 
                                    bg-${sleepQuality.color}-500/10 text-${sleepQuality.color}-400 border border-${sleepQuality.color}-500/20`}>
                      {sleepQuality.label}
                    </span>
                  </div>


                  <div className="glass-card rounded-3xl p-5 group hover:border-amber-500/50 hover:bg-white/10
                                transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-amber shimmer">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 
                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wide">Workouts</p>
                    <p className="text-4xl font-black text-slate-50 mb-2">
                      {fitness.workoutCount || "0"}
                    </p>
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold 
                                    bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Today
                    </span>
                  </div>
                </div>


                <WaterTracker />
              </div>
            </div>
          </section>


          <section className="px-5 mb-6">
            <QuickAddWidget />
          </section>


          <section className="px-5 mb-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div className="glass-card rounded-3xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-50">Steps</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl glass-card border-primary/30 text-primary text-xs font-bold">
                    Avg: {Math.round(fitness.weeklySteps?.reduce((a, b) => a + b, 0) / 7) || 0}
                  </div>
                </div>
                <BarChart
                  data={fitness.weeklySteps}
                  labels={fitness.labels}
                  unit=""
                  color="primary"
                />
              </div>


              <div className="glass-card rounded-3xl p-6 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-50">Sleep</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Last 7 nights</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl glass-card border-purple-500/30 text-purple-400 text-xs font-bold">
                    Avg: {(fitness.weeklySleep?.reduce((a, b) => a + b, 0) / 7).toFixed(1) || 0}h
                  </div>
                </div>
                <BarChart
                  data={fitness.weeklySleep}
                  labels={fitness.labels}
                  unit="h"
                  color="purple"
                />
              </div>
            </div>
          </section>


          <section className="px-5 mb-6">
            <h3 className="text-xl font-black text-slate-50 mb-4">Quick Insights</h3>
            <div className="space-y-3">

              {fitness.todaySteps >= 10000 && (
                <div className="relative glass-card rounded-2xl p-4 flex items-start gap-3 overflow-hidden group
                              hover:border-primary/50 transition-all duration-300 hover:shadow-premium">

                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient"></div>

                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                              flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="relative flex-1">
                    <p className="text-sm font-bold text-primary mb-1">Goal Achieved! 🎉</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You've reached your daily step goal of {stepGoal.toLocaleString()}. Keep up the great work!
                    </p>
                  </div>
                </div>
              )}


              {fitness.sleepHours < 7 && fitness.sleepHours > 0 && (
                <div className="glass-card border-amber-500/30 rounded-2xl p-4 flex items-start gap-3
                              hover:border-amber-500/50 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 
                              flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-400 mb-1">Improve Sleep</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You slept {fitness.sleepHours}h last night. Aim for 7-9 hours for optimal recovery.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>


          <section className="px-5">
            <div className="text-center py-4">
              <p className="text-xs text-slate-500">
                Last synced:{" "}
                <span className="text-slate-400 font-medium">
                  {fitness.lastSyncTime
                    ? new Date(fitness.lastSyncTime).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : "Never"}
                </span>
              </p>
            </div>
          </section>
        </>
      )}

    </div>
  );
}
