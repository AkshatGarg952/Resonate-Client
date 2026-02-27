
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getWithCookie } from "../api";
import BiomarkerRing from "../components/BiomarkerRing";
import { useNavigate } from "react-router-dom";

export default function LatestAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [biomarkers, setBiomarkers] = useState([]);
  const [biomarkersByCategory, setBiomarkersByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchLatest = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const latest = await getWithCookie("/api/diagnostics/latest");
      if (!latest || latest.status !== "completed") {
        setError("No completed analysis found yet.");
        setBiomarkers([]);
        setMeta(null);
        return;
      }

      const biomarkersData = latest.biomarkersByCategory || {};
      const biomarkersArr = Object.entries(latest.biomarkers || {}).map(([name, info]) => ({
        name,
        value: info?.value,
        status: info?.status,
        unit: info?.unit || "",
        category: info?.category || null,
        categoryLabel: info?.categoryLabel || null,
        reason: info?.reason || null,
        isAvailable: info?.isAvailable !== false,
      }));

      setBiomarkers(biomarkersArr);
      setBiomarkersByCategory(biomarkersData);
      setMeta({ updatedAt: latest.updatedAt, pdfUrl: latest.pdfUrl, overallScore: latest.overallScore });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch latest analysis.");
      setBiomarkers([]);
      setMeta(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLatest(); }, []);

  useEffect(() => {
    if (Object.keys(biomarkersByCategory).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(biomarkersByCategory)[0]);
    }
  }, [biomarkersByCategory, selectedCategory]);

  const getOverallScore = () => {
    if (meta?.overallScore) return meta.overallScore;
    if (biomarkers.length === 0) return null;
    const available = biomarkers.filter(b => b.isAvailable !== false);
    if (available.length === 0) return null;
    const good = available.filter(b => b.status?.toLowerCase() === "good").length;
    return Math.round((good / available.length) * 100);
  };

  const getHealthInsights = () => {
    const total = biomarkers.length;
    const goodCount = biomarkers.filter(b => b.status?.toLowerCase() === "good").length;
    const badCount = biomarkers.filter(b => b.status?.toLowerCase() === "bad").length;
    return { goodCount, badCount, total };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.20)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.45)", marginTop: 12, fontFamily: "'DM Sans',sans-serif" }}>Loading latest analysis…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const overallScore = getOverallScore();
  const insights = getHealthInsights();

  const scoreColor = overallScore >= 70 ? "#34C759" : overallScore >= 40 ? "#FF9F0A" : "#FF3B30";
  const scoreLabel = overallScore >= 70 ? "Excellent Health" : overallScore >= 40 ? "Needs Attention" : "Consult Doctor";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Refresh toast */}
      {refreshing && (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 50, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(26,26,24,0.10)", borderRadius: 9999, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(202,219,0,0.30)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A18" }}>Refreshing…</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>Latest Analysis</h1>
          <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", margin: "0 0 4px" }}>Your most recent blood report results</p>
          {meta?.updatedAt && (
            <span style={{ fontSize: 12, color: "rgba(26,26,24,0.40)" }}>Analyzed {formatDate(meta.updatedAt)}</span>
          )}
        </div>

        <button
          onClick={() => fetchLatest(true)}
          disabled={refreshing}
          style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)", border: "1px solid rgba(26,26,24,0.10)", display: "flex", alignItems: "center", justifyContent: "center", cursor: refreshing ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}
        >
          <svg width="18" height="18" fill="none" stroke="#1A1A18" strokeWidth="1.7" viewBox="0 0 24 24" style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* No data state */}
      {error && !loading && (
        <div className="glass-card" style={{ borderRadius: 24, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(26,26,24,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" fill="none" stroke="rgba(26,26,24,0.30)" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>No Analysis Found</h3>
          <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", maxWidth: 320, margin: "0 auto 24px" }}>{error}</p>
          <button
            onClick={() => navigate('/biomarkers/upload')}
            style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "#1A1A18", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Upload Blood Report
          </button>
        </div>
      )}

      {/* Data sections */}
      {!error && biomarkers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Score card */}
          {overallScore !== null && (
            <div className="glass-card" style={{ borderRadius: 24, padding: 24, borderTop: `3px solid ${scoreColor}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(26,26,24,0.45)", textTransform: "uppercase", letterSpacing: "0.10em" }}>Overall Health Score</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "6px 0 4px" }}>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, color: "#1A1A18", lineHeight: 1 }}>{overallScore}</span>
                    <span style={{ fontSize: 16, color: "rgba(26,26,24,0.35)" }}>/100</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor }}>{scoreLabel}</span>
                </div>

                {/* Score ring */}
                <div style={{ width: 88, height: 88, position: "relative", flexShrink: 0 }}>
                  <svg width="88" height="88" style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 6px ${scoreColor}66)` }}>
                    <circle cx="44" cy="44" r="36" fill="none" stroke={`${scoreColor}22`} strokeWidth="8" />
                    <circle cx="44" cy="44" r="36" fill="none" stroke={scoreColor} strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - overallScore / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#1A1A18" }}>{overallScore}%</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 20 }}>
                <div style={{ textAlign: "center", background: "rgba(26,26,24,0.04)", borderRadius: 12, padding: "10px 8px" }}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#1A1A18" }}>{insights.total}</div>
                  <div style={{ fontSize: 11, color: "rgba(26,26,24,0.45)", marginTop: 2 }}>Total</div>
                </div>
                <div style={{ textAlign: "center", background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.20)", borderRadius: 12, padding: "10px 8px" }}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#14532D" }}>{insights.goodCount}</div>
                  <div style={{ fontSize: 11, color: "#14532D", marginTop: 2 }}>Normal</div>
                </div>
                <div style={{ textAlign: "center", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 12, padding: "10px 8px" }}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#DC2626" }}>{insights.badCount}</div>
                  <div style={{ fontSize: 11, color: "#DC2626", marginTop: 2 }}>Alert</div>
                </div>
              </div>
            </div>
          )}

          {/* Alert banner */}
          {insights.badCount > 0 && (
            <div style={{ background: "rgba(255,159,10,0.08)", border: "1px solid rgba(255,159,10,0.25)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,159,10,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#FF9F0A" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#92400E", margin: "0 0 2px" }}>
                  {insights.badCount} {insights.badCount === 1 ? "biomarker needs" : "biomarkers need"} attention
                </p>
                <p style={{ fontSize: 12, color: "rgba(146,64,14,0.70)", lineHeight: 1.5, margin: 0 }}>
                  Consider consulting with your healthcare provider for personalized advice.
                </p>
              </div>
            </div>
          )}

          {/* Biomarkers section */}
          <div className="glass-card" style={{ borderRadius: 24, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", margin: 0 }}>Your Biomarkers</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34C759", display: "inline-block" }} />
                  <span style={{ color: "rgba(26,26,24,0.50)" }}>Good</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF3B30", display: "inline-block" }} />
                  <span style={{ color: "rgba(26,26,24,0.50)" }}>Alert</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(26,26,24,0.20)", display: "inline-block" }} />
                  <span style={{ color: "rgba(26,26,24,0.50)" }}>N/A</span>
                </span>
              </div>
            </div>

            {Object.keys(biomarkersByCategory).length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16 }}>
                {/* Category sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 160, flexShrink: 0 }}>
                  {Object.keys(biomarkersByCategory).map((cat) => {
                    const count = Object.keys(biomarkersByCategory[cat] || {}).length;
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                          background: isSelected ? "#1A1A18" : "rgba(26,26,24,0.05)",
                          color: isSelected ? "#FFF" : "rgba(26,26,24,0.60)",
                          border: isSelected ? "none" : "1.5px solid rgba(26,26,24,0.10)",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat || "Other"}</span>
                        <span style={{ marginLeft: 6, fontSize: 11, padding: "1px 6px", borderRadius: 9999, background: isSelected ? "rgba(255,255,255,0.20)" : "rgba(26,26,24,0.10)", flexShrink: 0 }}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Biomarker grid */}
                <div>
                  {selectedCategory && biomarkersByCategory[selectedCategory] ? (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", margin: "0 0 2px" }}>{selectedCategory}</h4>
                        <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", margin: 0 }}>
                          {Object.keys(biomarkersByCategory[selectedCategory] || {}).length} biomarkers
                        </p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                        {Object.entries(biomarkersByCategory[selectedCategory] || {}).map(([name, info]) => (
                          <BiomarkerRing
                            key={name}
                            name={name}
                            value={info?.value}
                            status={info?.status}
                            unit={info?.unit || ""}
                            normalRange={info?.normalRange || ""}
                            reason={info?.reason || ""}
                            isAvailable={info?.isAvailable !== false}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center" }}>
                      <p style={{ fontSize: 13, color: "rgba(26,26,24,0.40)" }}>Select a category to view biomarkers</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {biomarkers.map((b, idx) => (
                  <BiomarkerRing key={idx} name={b.name} value={b.value} status={b.status} unit={b.unit} normalRange={b.normalRange} reason={b.reason} isAvailable={b.isAvailable} />
                ))}
              </div>
            )}
          </div>

          {/* Action links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {meta?.pdfUrl && (
              <a
                href={meta.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-card"
                style={{ borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", transition: "transform 0.15s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(202,219,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" fill="none" stroke="#3D4000" strokeWidth="1.7" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A18", margin: 0 }}>View Original PDF</p>
                    <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", margin: 0 }}>Open in new tab</p>
                  </div>
                </div>
                <svg width="16" height="16" fill="none" stroke="rgba(26,26,24,0.35)" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}

            <button
              onClick={() => navigate('/biomarkers/history')}
              className="glass-card"
              style={{ borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(26,26,24,0.10)", cursor: "pointer", background: "transparent", width: "100%" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(124,111,205,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" fill="none" stroke="#7C6FCD" strokeWidth="1.7" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A18", margin: 0 }}>View All Reports</p>
                  <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", margin: 0 }}>See your history &amp; trends</p>
                </div>
              </div>
              <svg width="16" height="16" fill="none" stroke="rgba(26,26,24,0.35)" strokeWidth="1.7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate('/biomarkers/upload')}
              style={{ borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "none", cursor: "pointer", background: "#1A1A18", width: "100%" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(202,219,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" fill="none" stroke="#CADB00" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#FFF", margin: 0 }}>Upload New Report</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: 0 }}>Analyze latest blood test</p>
                </div>
              </div>
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="1.7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
