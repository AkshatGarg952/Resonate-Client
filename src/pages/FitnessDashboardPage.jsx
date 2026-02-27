
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
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>Fitness</h1>
            <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", margin: 0 }}>Track your daily activity &amp; recovery</p>
          </div>

          {/* Sync badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
            background: syncStatus === "synced" ? "rgba(52,199,89,0.10)" : syncStatus === "syncing" ? "rgba(202,219,0,0.10)" : "rgba(239,68,68,0.10)",
            color: syncStatus === "synced" ? "#14532D" : syncStatus === "syncing" ? "#3D4000" : "#EF4444",
            border: syncStatus === "synced" ? "1px solid rgba(52,199,89,0.20)" : syncStatus === "syncing" ? "1px solid rgba(202,219,0,0.20)" : "1px solid rgba(239,68,68,0.20)",
          }}>
            {syncStatus === "synced" && <span>✓</span>}
            {syncStatus === "syncing" && <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(202,219,0,0.30)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />}
            {syncStatus === "error" && <span>!</span>}
            {syncStatus === "synced" ? "Synced" : syncStatus === "syncing" ? "Syncing" : "Error"}
          </span>
        </div>

        {/* Sync button */}
        <button
          onClick={() => loadFitness(true)}
          disabled={refreshing}
          style={{
            width: "100%", padding: "13px", borderRadius: 14, border: "none",
            background: refreshing ? "rgba(26,26,24,0.08)" : "#1A1A18",
            color: refreshing ? "rgba(26,26,24,0.40)" : "#FFFFFF",
            fontSize: 14, fontWeight: 700, cursor: refreshing ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s",
          }}
        >
          <svg style={{ width: 16, height: 16, animation: refreshing ? "spin 1s linear infinite" : "none" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Syncing…" : "Sync Now"}
        </button>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "0 auto" }}>
            <button
              onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/fit/google`}
              style={{ padding: "12px 20px", borderRadius: 12, background: "#1A1A18", color: "#FFF", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <span style={{ fontSize: 16 }}>🏃</span> Connect Google Fit
            </button>
            <button disabled style={{ padding: "12px 20px", borderRadius: 12, background: "rgba(26,26,24,0.05)", color: "rgba(26,26,24,0.35)", fontSize: 14, fontWeight: 700, border: "1px solid rgba(26,26,24,0.10)", cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🍎</span> Apple Health
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(26,26,24,0.06)", marginLeft: 4 }}>iOS Only</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Row 1: Steps + Mini stat cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: 20 }}>

            {/* Steps card */}
            <div className="glass-card" style={{ borderRadius: 24, padding: 24, borderTop: "3px solid #CADB00" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <span className="overline-label">Steps Today</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "6px 0 4px" }}>
                    <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 42, color: "#1A1A18", lineHeight: 1 }}>{fitness.todaySteps?.toLocaleString() || "0"}</span>
                  </div>

                  {isEditingStepGoal ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <input type="number" value={newStepGoal} onChange={(e) => setNewStepGoal(e.target.value)}
                        style={{ width: 100, padding: "6px 10px", borderRadius: 8, border: "2px solid #CADB00", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", color: "#1A1A18" }}
                        autoFocus />
                      <button onClick={() => updateStepGoal(newStepGoal)}
                        style={{ padding: "6px 12px", borderRadius: 8, background: "#1A1A18", color: "#FFF", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Save</button>
                      <button onClick={() => setIsEditingStepGoal(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "rgba(26,26,24,0.40)" }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>Goal: {stepGoal.toLocaleString()} steps</span>
                      <button onClick={() => { setNewStepGoal(stepGoal); setIsEditingStepGoal(true); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(26,26,24,0.35)" }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Ring */}
                <div style={{ width: 88, height: 88, position: "relative", flexShrink: 0 }}>
                  <svg width="88" height="88" style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0 0 6px rgba(202,219,0,0.30))" }}>
                    <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(202,219,0,0.12)" strokeWidth="8" />
                    <circle cx="44" cy="44" r="36" fill="none" stroke="#CADB00" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - stepsProgress / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: "#1A1A18" }}>{Math.round(stepsProgress)}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="progress-track">
                <div className="progress-fill-lime" style={{ width: `${stepsProgress}%`, height: "100%", borderRadius: 9999, transition: "width 1s ease-out" }} />
              </div>
            </div>

            {/* Right col: Sleep + Workouts + Water */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="grid grid-cols-2 gap-3">
                {/* Sleep */}
                <div className="glass-card" style={{ borderRadius: 20, padding: 18, borderTop: "3px solid #7C6FCD" }}>
                  <span className="overline-label">Last Night</span>
                  <div style={{ margin: "6px 0 4px" }}>
                    <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#1A1A18" }}>{fitness.sleepHours || "–"}</span>
                    {fitness.sleepHours && <span style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", marginLeft: 4 }}>hrs</span>}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 9999,
                    background: sleepQuality.color === "emerald" || sleepQuality.color === "primary" ? "rgba(52,199,89,0.10)" : sleepQuality.color === "amber" ? "rgba(245,165,36,0.10)" : "rgba(26,26,24,0.06)",
                    color: sleepQuality.color === "emerald" || sleepQuality.color === "primary" ? "#14532D" : sleepQuality.color === "amber" ? "#92400E" : "rgba(26,26,24,0.45)",
                  }}>{sleepQuality.emoji} {sleepQuality.label}</span>
                </div>

                {/* Workouts */}
                <div className="glass-card" style={{ borderRadius: 20, padding: 18, borderTop: "3px solid #E07A3A" }}>
                  <span className="overline-label">Workouts</span>
                  <div style={{ margin: "6px 0 4px" }}>
                    <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#1A1A18" }}>{fitness.workoutCount || "0"}</span>
                  </div>
                  <span className="badge-neutral">Today</span>
                </div>
              </div>

              <WaterTracker />
            </div>
          </div>

          {/* Row 2: Chart cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: 20 }}>
            {/* Steps chart */}
            <div className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: "0 0 2px" }}>Steps</h3>
                  <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", margin: 0 }}>Last 7 days</p>
                </div>
                <span className="badge-lime">
                  Avg: {Math.round(fitness.weeklySteps?.reduce((a, b) => a + b, 0) / 7) || 0}
                </span>
              </div>
              <BarChart data={fitness.weeklySteps} labels={fitness.labels} unit="" color="primary" />
            </div>

            {/* Sleep chart */}
            <div className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: "0 0 2px" }}>Sleep</h3>
                  <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", margin: 0 }}>Last 7 nights</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 9999, background: "rgba(124,111,205,0.10)", color: "#4A3D6B" }}>
                  Avg: {(fitness.weeklySleep?.reduce((a, b) => a + b, 0) / 7).toFixed(1) || 0}h
                </span>
              </div>
              <BarChart data={fitness.weeklySleep} labels={fitness.labels} unit="h" color="purple" />
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

