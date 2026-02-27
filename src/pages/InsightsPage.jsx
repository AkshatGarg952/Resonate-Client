import React from "react";
import { Link } from "react-router-dom";

export default function InsightsPage() {
    const insights = [
        { title: "HRV Trending Up", text: "Your heart rate variability has improved 12% over the past 30 days — a strong recovery signal." },
        { title: "Sleep Consistency", text: "You've maintained 7+ hours of sleep 5 out of 7 nights this week. Keep it up!" },
        { title: "Protein Adherence", text: "You hit your protein target on 6 out of 7 days this week. Excellent macro compliance." },
        { title: "Cardio Load Balance", text: "Your training load is well-balanced between aerobic and anaerobic zones this week." },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 style={{ fontSize: 30, fontWeight: 700, color: "#1A1A18", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    Insights
                </h1>
                <p style={{ fontSize: 14, color: "rgba(26,26,24,0.55)" }}>
                    Data-driven health recommendations, powered by your data.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {insights.map((ins, i) => (
                    <div
                        key={i}
                        className="glass-card rounded-[20px] p-6 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "#CADB00", flexShrink: 0
                                }}
                            />
                            <span className="overline-label">Insight</span>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", marginBottom: 8 }}>
                            {ins.title}
                        </h3>
                        <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(26,26,24,0.60)" }}>
                            {ins.text}
                        </p>
                    </div>
                ))}
            </div>

            {/* Coming soon notice */}
            <div
                className="glass-card rounded-[20px] p-6 mt-5 text-center"
            >
                <div
                    style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "rgba(202,219,0,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 12px",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CADB00" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", marginBottom: 6 }}>
                    More insights coming soon
                </h3>
                <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)" }}>
                    Personalized AI-driven recommendations will appear here as your data grows.
                </p>
            </div>
        </div>
    );
}
