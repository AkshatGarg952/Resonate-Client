
import React, { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import BarChart from "../components/BarChart";
import WaterTracker from "../components/WaterTracker"; // [NEW]
import { normalizeFitnessData } from "../utils/fitnessNormalizer";
import { getWithCookie, postWithCookie } from "../api";

export default function FitnessDashboardPage() {
  const [fitness, setFitness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month
  const [syncStatus, setSyncStatus] = useState('synced'); // synced, syncing, error
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

  // Pull-to-refresh
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
    if (stepGoal === 0) return 0; // Avoid division by zero
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

      {/* Pull-to-refresh indicator */}
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

      {/* Header Section */}
      <section className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-50 mb-1">
              Fitness Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Track your daily activity & recovery
            </p>
          </div>

          {/* Sync Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold
                         ${syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                         ${syncStatus === 'syncing' ? 'bg-primary/10 text-primary border border-primary/20' : ''}
                         ${syncStatus === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}`}>
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

        {/* Quick Action Button */}
        <button
          onClick={() => loadFitness(true)}
          disabled={refreshing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl 
                   bg-slate-800/50 border-2 border-slate-700/50 text-slate-300 font-semibold
                   hover:bg-slate-800 hover:border-primary/30 active:scale-[0.98] 
                   disabled:opacity-50 transition-all duration-200"
        >
          <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Syncing...' : 'Sync Now'}
        </button>
      </section>

      {!fitness ? (
        /* No Data State */
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
          {/* Hero Metrics - Today's Stats */}
          <section className="px-5 mb-6">
            {/* Steps Progress Ring */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                          rounded-3xl border border-slate-700/50 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-1">Steps Today</p>
                  <h2 className="text-4xl font-black text-slate-50">
                    {fitness.todaySteps?.toLocaleString() || "0"}
                  </h2>
                  {isEditingStepGoal ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={newStepGoal} // Use temporary state
                        onChange={(e) => setNewStepGoal(e.target.value)}
                        className="w-24 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button
                        onClick={() => updateStepGoal(newStepGoal)}
                        className="px-2 py-1 bg-primary text-slate-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        Save
                      </button>
                      <button onClick={() => setIsEditingStepGoal(false)} className="text-xs text-slate-400 hover:text-white p-1">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500">Goal: {stepGoal.toLocaleString()} steps</p>
                      <button
                        onClick={() => {
                          setNewStepGoal(stepGoal);
                          setIsEditingStepGoal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-primary hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Circular Progress */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-800"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - stepsProgress / 100)}`}
                      className="text-primary transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-slate-50">{Math.round(stepsProgress)}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${stepsProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Sleep & Workouts Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Sleep Card */}
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                            rounded-3xl border border-slate-700/50 p-5 group hover:border-purple-500/30 
                            transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <span className="text-2xl">{sleepQuality.emoji}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium mb-1">Last Night</p>
                <p className="text-3xl font-black text-slate-50 mb-2">
                  {fitness.sleepHours || "--"}
                  {fitness.sleepHours && <span className="text-sm font-normal text-slate-500 ml-1">hrs</span>}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold 
                                bg-${sleepQuality.color}-500/10 text-${sleepQuality.color}-400`}>
                  {sleepQuality.label}
                </span>
              </div>

              {/* Workouts Card */}
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                            rounded-3xl border border-slate-700/50 p-5 group hover:border-amber-500/30 
                            transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium mb-1">Workouts</p>
                <p className="text-3xl font-black text-slate-50 mb-2">
                  {fitness.workoutCount || "0"}
                </p>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold 
                               bg-amber-500/10 text-amber-400">
                  Today
                </span>
              </div>
            </div>

            {/* Water Tracker */}
            <WaterTracker />
          </section>

          {/* Period Selector */}
          <section className="px-5 mb-4">
            <div className="flex gap-2 bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 
                          rounded-2xl p-1.5">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                         ${selectedPeriod === 'week'
                    ? 'bg-primary text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                         ${selectedPeriod === 'month'
                    ? 'bg-primary text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                30 Days
              </button>
            </div>
          </section>

          {/* Charts Section */}
          <section className="px-5 space-y-4 mb-6">
            {/* Steps Chart */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Steps</h3>
                  <p className="text-xs text-slate-500">Last 7 days</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
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

            {/* Sleep Chart */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Sleep</h3>
                  <p className="text-xs text-slate-500">Last 7 nights</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
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
          </section>

          {/* Insights Section */}
          <section className="px-5 mb-6">
            <h3 className="text-lg font-bold text-slate-50 mb-4">Quick Insights</h3>
            <div className="space-y-3">
              {/* Steps Insight */}
              {fitness.todaySteps >= 10000 && (
                <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 
                              rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary mb-1">Goal Achieved! 🎉</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You've reached your daily step goal of {stepGoal.toLocaleString()}. Keep up the great work!
                    </p>
                  </div>
                </div>
              )}

              {/* Sleep Insight */}
              {fitness.sleepHours < 7 && fitness.sleepHours > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
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

          {/* Last Sync Info */}
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
