
import React, { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import BarChart from "../components/BarChart";
import QuickAddWidget from "../components/QuickAddWidget";
import WaterTracker from "../components/WaterTracker";
import LineChart from "../components/LineChart";
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
  const [waterData, setWaterData] = useState({ amountMl: 0, goalMl: 2500 });
  const [waterLoading, setWaterLoading] = useState(true);

  const loadWater = async () => {
    try {
      const res = await getWithCookie('/api/water');
      if (res && res.today) {
        setWaterData({
          amountMl: res.today.amountMl || 0,
          goalMl: res.today.goalMl || 2500
        });
      }
    } catch (error) {
      console.error("Failed to fetch water data", error);
    } finally {
      setWaterLoading(false);
    }
  };

  const logWater = async (amount) => {
    try {
      const res = await postWithCookie('/api/water/log', { amountMl: amount });
      if (res) {
        setWaterData({
          amountMl: res.amountMl || 0,
          goalMl: res.goalMl || 2500
        });
      }
    } catch (error) {
      console.error("Failed to log water", error);
    }
  };

  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

  const loadFitness = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setSyncStatus('syncing');
    }

    try {
      const apiData = await getWithCookie("/api/fit/getGoogleFitData");
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
    loadWater();
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
      await postWithCookie("/api/fit/step-goal", { stepGoal: parseInt(newGoal) });
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
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(202,219,0,0.20)",
          borderTopColor: "#CADB00",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.45)", marginTop: 12, fontFamily: "'DM Sans',sans-serif" }}>Syncing fitness data…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Refresh toast */}
      {refreshing && (
        <div style={{
          position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 50,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(26,26,24,0.10)", borderRadius: 9999,
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(202,219,0,0.30)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A18" }}>Syncing…</span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#1A1A18] mb-1">Fitness</h1>
          <p className="text-[15px] text-[#1A1A18]/60 m-0">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {fitness ? (
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-[#1A1A18]/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CADB00]"></span>
              Google Fit Connected
            </span>
          </div>
        ) : (
          <button
            onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/fit/google`}
            className="border border-[#CADB00] text-[#8C9800] px-5 py-2.5 rounded-2xl font-medium flex items-center gap-2 hover:bg-[#CADB00]/10 transition-colors"
          >
            Connect Google Fit
          </button>
        )}
      </div>

      {/* No data state */}
      {!fitness ? (
        <div className="glass-card" style={{ borderRadius: 24, padding: 32, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(26,26,24,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" fill="none" stroke="rgba(26,26,24,0.30)" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>No Fitness Data</h3>
          <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
            Connect your fitness device to see your activity, sleep, and workout data here.
          </p>
        </div>
      ) : (
        <>
          {/* Row 1: 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {/* Steps Card */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Steps Today</p>
                  <h2 className="text-[40px] font-bold text-[#1A1A18] leading-none mb-1">
                    {fitness.todaySteps?.toLocaleString() || "0"}
                  </h2>
                  <p className="text-[13px] text-[#1A1A18]/50 flex items-center gap-1">
                    of {stepGoal.toLocaleString()} goal
                    <button onClick={() => { setNewStepGoal(stepGoal); setIsEditingStepGoal(true); }}
                      className="text-[#1A1A18]/40 hover:text-[#CADB00] transition-colors p-1"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </p>

                  {isEditingStepGoal && (
                    <div className="flex items-center gap-2 mt-2 bg-white/50 p-1.5 rounded-lg border border-[#1A1A18]/10">
                      <input
                        type="number"
                        value={newStepGoal}
                        onChange={(e) => setNewStepGoal(e.target.value)}
                        className="w-20 px-2 py-1 rounded-md border border-[#CADB00] text-[13px] outline-none text-[#1A1A18] bg-transparent"
                        autoFocus
                      />
                      <button onClick={() => updateStepGoal(newStepGoal)}
                        className="text-[#CADB00] font-bold text-[12px] px-2 py-1 rounded-md hover:bg-[#CADB00]/10 transition-colors"
                      >
                        Save
                      </button>
                      <button onClick={() => setIsEditingStepGoal(false)}
                        className="text-[#1A1A18]/40 hover:text-[#1A1A18]/70 text-[12px] p-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-[#CADB00]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 9a2 2 0 100-4 2 2 0 000 4z" />
                    <path d="M14 19a2 2 0 100-4 2 2 0 000 4z" />
                    <path d="M10 13c-1.5 0-3-1-3-2.5S8.5 8 10 8" />
                    <path d="M14 15c1.5 0 3 1 3 2.5s-1.5 2.5-3 2.5" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="h-3 w-full bg-[#1A1A18]/5 rounded-full mb-3">
                  <div className="h-full bg-[#CADB00] rounded-full" style={{ width: `${Math.min(stepsProgress, 100)}%` }}></div>
                </div>
                <p className="text-[13px] font-medium text-[#8C9800]">
                  {Math.round(stepsProgress)}% of daily goal
                </p>
              </div>
            </div>

            {/* Sleep Card */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div>
                <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Sleep Duration</p>
                <h2 className="text-[40px] font-bold text-[#1A1A18] leading-none mb-4">
                  {fitness.sleepHours || "0"}<span className="text-[24px]">h</span>
                </h2>
                <div className="flex gap-1 mb-6">
                  <div className="h-2.5 w-1/3 bg-[#1A1A18] rounded-full"></div>
                  <div className="h-2.5 w-2/3 bg-[#1A1A18]/60 rounded-full"></div>
                </div>
              </div>
              <p className="text-[14px] text-[#1A1A18]/70 font-medium">
                Quality: {sleepQuality.label}
              </p>
            </div>

            {/* Workouts Card */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div>
                <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Workouts Today</p>
                <h2 className="text-[40px] font-bold text-[#CADB00] leading-none mb-6">
                  {fitness.workoutCount || "0"}
                </h2>
                {fitness.workoutCount > 0 && (
                  <div className="bg-[#CADB00]/10 border-l-4 border-[#CADB00] rounded-r-lg px-3 py-2 mb-4">
                    <p className="text-[13px] text-[#1A1A18] font-medium">Morning Run · 5km · 32min</p>
                  </div>
                )}
              </div>
              <p className="text-[14px] text-[#1A1A18]/70 font-medium">
                Cardio Load: 32
              </p>
            </div>

            {/* Hydration Card View */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Hydration</p>
                  <h2 className="text-[40px] font-bold text-[#1A1A18] leading-none mb-1">
                    {waterData.amountMl}<span className="text-[24px]">ml</span>
                  </h2>
                  <p className="text-[13px] text-[#1A1A18]/50">of {waterData.goalMl}ml goal</p>
                </div>
                <div className="text-[#1A1A18]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => logWater(200)} className="text-[14px] font-medium text-[#1A1A18]/70 hover:text-[#1A1A18]">
                  +200ml
                </button>
                <button onClick={() => logWater(500)} className="text-[14px] font-medium text-[#1A1A18]/70 hover:text-[#1A1A18]">
                  +500ml
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Chart cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {/* Steps chart */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-bold text-[#1A1A18]">Weekly Steps</h3>
                <span className="text-[13px] text-[#1A1A18]/70 font-medium">
                  Avg: {Math.round(fitness.weeklySteps?.reduce((a, b) => a + b, 0) / 7)?.toLocaleString() || 0}
                </span>
              </div>
              <BarChart
                data={fitness.weeklySteps}
                labels={fitness.labels}
                unit=""
                color="lime"
                average={Math.round(fitness.weeklySteps?.reduce((a, b) => a + b, 0) / 7) || 0}
              />
            </div>

            {/* Sleep chart */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-bold text-[#1A1A18]">Sleep This Week</h3>
                <span className="text-[13px] text-[#1A1A18]/70 font-medium">
                  Avg: {(fitness.weeklySleep?.reduce((a, b) => a + b, 0) / 7)?.toFixed(1) || 0}h
                </span>
              </div>
              <LineChart
                data={fitness.weeklySleep}
                labels={fitness.labels}
                unit="h"
                color="purple"
                average={(fitness.weeklySleep?.reduce((a, b) => a + b, 0) / 7)?.toFixed(1) || 0}
              />
            </div>
          </div>

          {/* Row 3: Quick Insights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: 0 }}>Quick Insights</h3>

            {fitness.todaySteps >= 10000 && (
              <div className="glass-card insight-block-lime" style={{ borderRadius: "0 12px 12px 0", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(202,219,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="#CADB00" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#3D4000", marginBottom: 2 }}>Goal Achieved! 🎉</p>
                  <p style={{ fontSize: 12, color: "rgba(26,26,24,0.55)", lineHeight: 1.5, margin: 0 }}>
                    You've reached your daily step goal of {stepGoal.toLocaleString()}.
                  </p>
                </div>
              </div>
            )}

            {fitness.sleepHours < 7 && fitness.sleepHours > 0 && (
              <div className="badge-amber" style={{ borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12, width: "auto" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#92400E", marginBottom: 2 }}>Improve Sleep</p>
                  <p style={{ fontSize: 12, color: "rgba(146,64,14,0.70)", lineHeight: 1.5, margin: 0 }}>
                    You slept {fitness.sleepHours}h last night. Aim for 7-9 hrs for optimal recovery.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Hydration Log Integration */}
          <div className="mb-8">
            <WaterTracker externalData={waterData} setExternalData={setWaterData} />
          </div>

          {/* Footer: Last synced */}
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <p style={{ fontSize: 12, color: "rgba(26,26,24,0.35)", margin: 0 }}>
              Last synced:{" "}
              <span style={{ color: "rgba(26,26,24,0.50)", fontWeight: 500 }}>
                {fitness.lastSyncTime
                  ? new Date(fitness.lastSyncTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : "Never"}
              </span>
            </p>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

