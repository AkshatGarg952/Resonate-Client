import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import {
    Heart, Activity, Moon, Zap, ArrowUpRight, Star,
    FlaskConical, Beaker, Clock, TrendingUp
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const GLASS = {
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.60)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05)",
};

const SERIF = { fontFamily: "'DM Serif Display', serif", fontWeight: 400 };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

// ─── METRIC DATA ─────────────────────────────────────────────────────────────

const METRICS = [
    {
        label: "HRV",
        value: "68",
        unit: "ms",
        trend: "+4.2%",
        positive: true,
        color: "#CADB00",
        iconBg: "rgba(202,219,0,0.12)",
        icon: <Activity size={18} strokeWidth={1.7} color="#CADB00" />,
    },
    {
        label: "Resting HR",
        value: "58",
        unit: "bpm",
        trend: "−1 bpm",
        positive: true,
        color: "#7C6FCD",
        iconBg: "rgba(217,95,120,0.12)",
        icon: <Heart size={18} strokeWidth={1.7} color="#D95F78" />,
    },
    {
        label: "Sleep",
        value: "7.4",
        unit: "hrs",
        trend: "+0.3h",
        positive: true,
        color: "#6B94E8",
        iconBg: "rgba(124,111,205,0.12)",
        icon: <Moon size={18} strokeWidth={1.7} color="#7C6FCD" />,
    },
    {
        label: "Cardio Load",
        value: "142",
        unit: "AU",
        trend: "−8",
        positive: false,
        color: "#F59E42",
        iconBg: "rgba(224,122,58,0.12)",
        icon: <Zap size={18} strokeWidth={1.7} color="#E07A3A" />,
    },
];

const ACTIVITIES = [
    { color: "#CADB00", title: "Morning Run", desc: "5.2 km · 28 min", time: "7:14 AM" },
    { color: "#E07A3A", title: "Strength Training", desc: "Upper body · 42 min", time: "Yesterday 6:00 PM" },
    { color: "#7C6FCD", title: "8h Sleep", desc: "Deep 2.1h · REM 1.8h", time: "Yesterday" },
    { color: "#6B94E8", title: "Yoga Flow", desc: "Recovery · 30 min", time: "2 days ago" },
];

const EXPERIMENTS = [
    { name: "Deep Sleep Protocol", progress: 72, color: "#7C6FCD", label: "Sleep protocol — Day 18 / 28" },
    { name: "High Protein Adherence", progress: 85, color: "#CADB00", label: "Protein target — Day 12 / 14" },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function HealthScoreRing({ score = 82 }) {
    const r = 70;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);

    return (
        <div style={{ width: 160, height: 160, position: "relative", flexShrink: 0 }}>
            <svg
                width="160" height="160"
                style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0 0 8px rgba(202,219,0,0.40))" }}
            >
                <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(26,26,24,0.07)" strokeWidth="12" />
                <circle
                    cx="80" cy="80" r={r} fill="none"
                    stroke="#CADB00" strokeWidth="12"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                />
            </svg>
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
            }}>
                <span style={{ ...SERIF, fontSize: 44, color: "#1A1A18", lineHeight: 1 }}>{score}</span>
            </div>
        </div>
    );
}

function MetricSignalCard({ metric }) {
    return (
        <div
            style={{
                ...GLASS,
                borderRadius: 20,
                padding: 20,
                borderTop: `3px solid ${metric.color}`,
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="overline-label">{metric.label}</span>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: metric.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {metric.icon}
                </div>
            </div>

            {/* Value */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ ...SERIF, fontSize: 28, color: "#1A1A18" }}>{metric.value}</span>
                <span style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>{metric.unit}</span>
            </div>

            {/* Trend badge */}
            <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 9999,
                fontSize: 12, fontWeight: 600,
                background: metric.positive ? "rgba(202,219,0,0.10)" : "rgba(26,26,24,0.06)",
                color: metric.positive ? "#3D4000" : "rgba(26,26,24,0.50)",
                alignSelf: "flex-start",
            }}>
                {metric.positive ? "↑" : "↓"} {metric.trend}
            </span>
        </div>
    );
}

function MediumRing({ value, label, max, color, trackColor }) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(value / max, 1);
    const offset = circ * (1 - pct);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 96, height: 96, position: "relative" }}>
                <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="48" cy="48" r={r} fill="none" stroke={trackColor} strokeWidth="8" />
                    <circle
                        cx="48" cy="48" r={r} fill="none"
                        stroke={color} strokeWidth="8"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                </svg>
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <span style={{ ...SERIF, fontSize: 18, fontWeight: 700, color: "#1A1A18" }}>
                        {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
                    </span>
                </div>
            </div>
            <span style={{ fontSize: 12, color: "rgba(26,26,24,0.50)" }}>{label}</span>
        </div>
    );
}

function SectionHeader({ title, children }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ ...SANS, fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: 0 }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

function FilterButtons({ active, setActive, options }) {
    return (
        <div style={{ display: "flex", gap: 4 }}>
            {options.map(opt => (
                <button key={opt}
                    onClick={() => setActive(opt)}
                    className={active === opt ? "filter-btn-active" : "filter-btn-inactive"}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function NewDashboardPage() {
    const [recoveryFilter, setRecoveryFilter] = useState("7d");
    const [nutritionFilter, setNutritionFilter] = useState("7d");

    return (
        <div style={{ maxWidth: 1400 }}>

            {/* ── Row 1: Health Score + Intelligence Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                {/* Health Score Card */}
                <div style={{
                    ...GLASS, borderRadius: 20, padding: 24,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", minHeight: 280,
                }}>
                    <HealthScoreRing score={82} />
                    <span className="overline-label" style={{ marginTop: 14, marginBottom: 8 }}>
                        Health Score
                    </span>
                    <span className="badge-lime">
                        <ArrowUpRight size={12} strokeWidth={2} /> +3.2% this month
                    </span>
                </div>

                {/* Intelligence Summary Card */}
                <div style={{ ...GLASS, borderRadius: 16, padding: 24 }} className="lg:col-span-2">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: "rgba(124,111,205,0.12)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Star size={14} strokeWidth={1.7} color="#7C6FCD" />
                            </div>
                            <h3 style={{ ...SANS, fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: 0 }}>
                                Intelligence Summary
                            </h3>
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(26,26,24,0.35)" }}>Updated 2h ago</span>
                    </div>

                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(26,26,24,0.70)", marginBottom: 16 }}>
                        Your recovery metrics are trending positively — HRV is up 4.2% and resting heart rate dropped 1 bpm.
                        Sleep quality remains excellent at 7.4 hours average. Cardio load is moderate; a rest or active-recovery
                        session today would optimize tomorrow's performance.
                    </p>

                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <div className="insight-block-lime" style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", marginBottom: 2 }}>
                                Recovery Optimal
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(26,26,24,0.50)" }}>
                                HRV &amp; RHR trending in the right direction
                            </div>
                        </div>
                        <div className="insight-block-purple" style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", marginBottom: 2 }}>
                                Protein on Track
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(26,26,24,0.50)" }}>
                                6/7 days hitting protein target this week
                            </div>
                        </div>
                    </div>

                    <Link to="/insights" className="cta-link">View full insights →</Link>
                </div>
            </div>

            {/* ── Row 2: Physiological Signals ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {METRICS.map((m) => <MetricSignalCard key={m.label} metric={m} />)}
            </div>

            {/* ── Row 3: Recovery & Sleep | Nutrition Intelligence ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                {/* Recovery & Sleep */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Recovery & Sleep">
                        <FilterButtons active={recoveryFilter} setActive={setRecoveryFilter} options={["7d", "30d"]} />
                    </SectionHeader>

                    {/* Two rings */}
                    <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                        <MediumRing value={68} max={100} label="Recovery %" color="#CADB00" trackColor="rgba(202,219,0,0.12)" />
                        <MediumRing value={7.2} max={10} label="Sleep hrs" color="#7C6FCD" trackColor="rgba(124,111,205,0.12)" />

                        {/* Sleep quality bar */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: "rgba(26,26,24,0.55)" }}>Sleep Quality</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18" }}>82%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill-purple" style={{ width: "82%", height: "100%", borderRadius: 9999, transition: "width 0.8s ease-out" }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: "rgba(26,26,24,0.55)" }}>Deep Sleep</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18" }}>65%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill-lavender" style={{ width: "65%", height: "100%", borderRadius: 9999 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HRV mini chart */}
                    <svg viewBox="0 0 280 68" className="w-full" style={{ height: 64, overflow: "visible" }}>
                        <defs>
                            <linearGradient id="hrv-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(202,219,0,0.18)" />
                                <stop offset="100%" stopColor="rgba(202,219,0,0)" />
                            </linearGradient>
                        </defs>
                        <polyline points="10,50 50,45 90,48 130,40 170,30 210,42 250,38"
                            fill="none" stroke="#CADB00" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
                        <polygon points="10,50 50,45 90,48 130,40 170,30 210,42 250,38 250,68 10,68"
                            fill="url(#hrv-grad)" />
                    </svg>

                    <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(26,26,24,0.50)", marginTop: 10 }}>
                        HRV trending upward — recovery is improving steadily.
                    </p>
                </div>

                {/* Nutrition Intelligence */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Nutrition Intelligence">
                        <span className="badge-neutral">7-day avg</span>
                    </SectionHeader>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                        {/* Protein */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 13, color: "rgba(26,26,24,0.70)" }}>Protein Adherence</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>85%</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill-lime" style={{ width: "85%", height: "100%", borderRadius: 9999, transition: "width 0.8s ease-out" }} />
                            </div>
                        </div>
                        {/* Glucose */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 13, color: "rgba(26,26,24,0.70)" }}>Glucose Stability</span>
                                    <span className="badge-green" style={{ padding: "2px 8px", fontSize: 11 }}>Stable</span>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>91%</span>
                            </div>
                            <div className="progress-track">
                                <div style={{ width: "91%", height: "100%", background: "#34C759", borderRadius: 9999 }} />
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", lineHeight: 1.6, marginBottom: 14 }}>
                        Consistent protein intake is supporting muscle retention and recovery. Glucose remains stable
                        with no significant spikes detected this week.
                    </p>

                    {/* Macro pills */}
                    <div style={{ display: "flex", gap: 8 }}>
                        {["Protein", "Carbs", "Fats"].map(m => (
                            <span key={m} style={{
                                fontSize: 12, fontWeight: 500, padding: "6px 12px",
                                borderRadius: 9999, background: "rgba(26,26,24,0.05)",
                                color: "rgba(26,26,24,0.55)",
                            }}>{m}</span>
                        ))}
                    </div>

                    <Link to="/nutrition" className="cta-link" style={{ display: "block", marginTop: 14 }}>
                        View full nutrition →
                    </Link>
                </div>
            </div>

            {/* ── Row 4: Diagnostics (full width) ── */}
            <Link
                to="/diagnostics"
                style={{
                    ...GLASS, borderRadius: 20, padding: 24,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", textDecoration: "none", marginBottom: 20,
                    transition: "box-shadow 0.2s",
                }}
                className="hover:shadow-xl block mb-5"
            >
                <div>
                    <span className="overline-label">Diagnostics</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "6px 0" }}>
                        <span style={{ ...SERIF, fontSize: 28, color: "#1A1A18" }}>78</span>
                        <span style={{ fontSize: 13, color: "rgba(26,26,24,0.45)" }}>/ 100</span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>Last updated 3 days ago</p>

                    {/* Status dots */}
                    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                        {[
                            { color: "#34C759", count: 3 },
                            { color: "#F59E42", count: 2 },
                            { color: "rgba(26,26,24,0.20)", count: 1 },
                        ].flatMap(({ color, count }) =>
                            Array(count).fill(0).map((_, i) => (
                                <div key={`${color}-${i}`} style={{
                                    width: 10, height: 10, borderRadius: "50%", background: color
                                }} />
                            ))
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    <span className="badge-amber">⚠ 2 Flagged</span>
                    <span className="cta-link">View Report →</span>
                </div>
            </Link>

            {/* ── Row 5: Active Experiments | Training Balance ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                {/* Active Experiments */}
                <div style={{ ...GLASS, borderRadius: 24, padding: 24 }}>
                    <SectionHeader title="Active Experiments" />

                    {/* Stats row */}
                    <div style={{
                        display: "flex", gap: 0, marginBottom: 20,
                        border: "1px solid rgba(26,26,24,0.06)", borderRadius: 12, overflow: "hidden",
                    }}>
                        {[
                            { label: "Active Protocols", value: "2" },
                            { label: "Compliance", value: "79%", lime: true },
                            { label: "Avg Duration", value: "21d" },
                        ].map((s, i, arr) => (
                            <div key={s.label} style={{
                                flex: 1, padding: "12px 16px", textAlign: "center",
                                borderRight: i < arr.length - 1 ? "1px solid rgba(26,26,24,0.06)" : "none",
                                background: "rgba(255,255,255,0.50)",
                            }}>
                                <div style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", marginBottom: 4 }}>{s.label}</div>
                                <div style={{
                                    ...SERIF, fontSize: 22,
                                    color: s.lime ? "#CADB00" : "#1A1A18",
                                }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Experiment bars */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {EXPERIMENTS.map(exp => (
                            <div key={exp.name}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A18" }}>{exp.name}</span>
                                    <span style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>{exp.progress}%</span>
                                </div>
                                <div className="progress-track">
                                    <div style={{
                                        width: `${exp.progress}%`, height: "100%",
                                        background: exp.color, borderRadius: 9999,
                                        transition: "width 0.8s ease-out"
                                    }} />
                                </div>
                                <p style={{ fontSize: 11, color: "rgba(26,26,24,0.40)", marginTop: 4 }}>{exp.label}</p>
                            </div>
                        ))}
                    </div>

                    <Link to="/interventions" style={{ fontSize: 12, color: "rgba(26,26,24,0.40)", display: "block", marginTop: 16, textDecoration: "none" }}>
                        Manage Experiments →
                    </Link>
                </div>

                {/* Training Balance */}
                <div style={{ ...GLASS, borderRadius: 24, padding: 24 }}>
                    <SectionHeader title="Training Balance" />

                    {/* Donut */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                        <div style={{ width: 130, height: 130, position: "relative", flexShrink: 0 }}>
                            <svg viewBox="0 0 130 130" width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
                                {/* Track */}
                                <circle cx="65" cy="65" r="60" fill="none" stroke="rgba(26,26,24,0.08)" strokeWidth="16" />
                                {/* Lime arc ~60% */}
                                <circle cx="65" cy="65" r="60" fill="none"
                                    stroke="#CADB00" strokeWidth="16"
                                    strokeDasharray={`${2 * Math.PI * 60 * 0.60} ${2 * Math.PI * 60 * 0.40}`}
                                    strokeLinecap="round"
                                />
                                {/* Orange arc ~25% offset */}
                                <circle cx="65" cy="65" r="60" fill="none"
                                    stroke="#E07A3A" strokeWidth="16"
                                    strokeDasharray={`${2 * Math.PI * 60 * 0.25} ${2 * Math.PI * 60 * 0.75}`}
                                    strokeDashoffset={`-${2 * Math.PI * 60 * 0.62}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18" }}>Balanced</span>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                { color: "#CADB00", label: "Aerobic", pct: "60%" },
                                { color: "#E07A3A", label: "Anaerobic", pct: "25%" },
                                { color: "rgba(26,26,24,0.12)", label: "Rest / Recovery", pct: "15%" },
                            ].map(s => (
                                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, color: "rgba(26,26,24,0.70)", flex: 1 }}>{s.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>{s.pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <span className="badge-lime">Training load optimal this week</span>
                </div>
            </div>

            {/* ── Row 6: Recent Activity | Weekly Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Recent Activity */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Recent Activity" />

                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {ACTIVITIES.map((act, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < ACTIVITIES.length - 1 ? 16 : 0 }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: act.color, flexShrink: 0 }} />
                                    {i < ACTIVITIES.length - 1 && (
                                        <div style={{ width: 1, flex: 1, marginTop: 4, background: "rgba(26,26,24,0.08)" }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, paddingBottom: 4 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>{act.title}</div>
                                    <div style={{ fontSize: 13, color: "rgba(26,26,24,0.50)", marginTop: 1 }}>{act.desc}</div>
                                    <div style={{ fontSize: 11, color: "rgba(26,26,24,0.40)", marginTop: 2 }}>{act.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Summary */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Weekly Summary" />

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {[
                            { label: "Overall Health", value: <span style={{ color: "#34C759", fontWeight: 600, fontSize: 13 }}>↑ +3.2%</span>, border: true },
                            { label: "Workouts Completed", value: <span style={{ fontSize: 15, fontWeight: 700, ...SERIF }}>5/7</span>, border: true },
                            { label: "Recovery Status", value: <span className="badge-lime">Optimal</span>, border: false },
                        ].map(row => (
                            <div key={row.label} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "16px 0",
                                borderBottom: row.border ? "1px solid rgba(26,26,24,0.07)" : "none",
                            }}>
                                <span style={{ fontSize: 13, color: "rgba(26,26,24,0.65)" }}>{row.label}</span>
                                {row.value}
                            </div>
                        ))}
                    </div>

                    {/* Summary text */}
                    <div style={{ marginTop: 16, padding: "14px", background: "rgba(202,219,0,0.06)", borderRadius: 12 }}>
                        <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(26,26,24,0.60)", margin: 0 }}>
                            Great week overall. 5 workouts completed with strong recovery metrics. Keep your sleep consistent
                            into next week to maintain this momentum.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
