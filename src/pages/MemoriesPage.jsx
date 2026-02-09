import React, { useEffect, useState } from "react";
import { getUserMemories } from "../api";
import { Link } from "react-router-dom";

export default function MemoriesPage() {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("");

    const categories = ["All", "diet", "workout", "health", "preference", "general"];

    useEffect(() => {
        fetchMemories();
    }, [categoryFilter]);

    const fetchMemories = async () => {
        try {
            setLoading(true);
            const data = await getUserMemories(categoryFilter === "All" ? "" : categoryFilter);
            // Mem0 returns { results: [...] } or just [...] depending on endpoint, 
            // but our service returns { success: true, results: [...] } or just the array if we mapped it in controller.
            // Let's check controller: return res.json(memories);
            // Service `getAllMemories` returns { success: true, results: [...], count: ... }

            if (data.results) {
                setMemories(data.results);
            } else if (Array.isArray(data)) {
                setMemories(data);
            } else {
                setMemories([]);
            }
        } catch (err) {
            console.error("Failed to fetch memories:", err);
            setError("Failed to load your memories. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                            My Memories
                        </h1>
                        <p className="text-slate-400 max-w-2xl">
                            This is what your AI coach knows about you. These memories refine your
                            workout and diet plans to match your evolving needs.
                        </p>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === cat || (categoryFilter === "" && cat === "All")
                                        ? "bg-slate-800 text-emerald-400 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                    }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-40 bg-slate-900/50 rounded-2xl border border-slate-800"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
                        {error}
                    </div>
                ) : memories.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50 dashed">
                        <div className="text-6xl mb-4">🧠</div>
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No memories yet</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Start interacting with your AI coach, log your meals, or complete workouts to build your profile.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {memories.map((memory) => (
                            <div
                                key={memory.id}
                                className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                    ${memory.metadata?.category === 'workout' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                            memory.metadata?.category === 'diet' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                memory.metadata?.category === 'health' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-slate-700/30 text-slate-400 border border-slate-700/50'}`}>
                                        {memory.metadata?.category || "General"}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">
                                        {formatDate(memory.created_at)}
                                    </span>
                                </div>

                                <p className="text-slate-200 leading-relaxed font-medium">
                                    {memory.memory}
                                </p>

                                {/* Decorative glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
