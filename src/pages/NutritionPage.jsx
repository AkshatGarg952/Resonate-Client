import React, { useEffect, useState } from "react";
import { getWithCookie, postWithCookie } from "../api";

export default function NutritionPage() {
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState("");
    const [suggestions, setSuggestions] = useState(null);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            setError("");
            // Call the endpoint. The response format is { status: "success", plan: { ... } } or just the plan depending on controller
            // My controller returns response.data from microservice.
            // Microservice returns { status: "success", plan: { ... } }
            const data = await getWithCookie("/nutrition/daily-suggestions");

            if (data.status === "success" && data.plan) {
                const normalizedPlan = {};
                Object.keys(data.plan).forEach(key => {
                    normalizedPlan[key.toLowerCase()] = data.plan[key];
                });
                setSuggestions(normalizedPlan);
            } else if (data.breakfast || data.Breakfast) {
                const normalizedPlan = {};
                Object.keys(data).forEach(key => {
                    normalizedPlan[key.toLowerCase()] = data[key];
                });
                setSuggestions(normalizedPlan);
            } else {
                // If no plan, we might want to trigger generation automatically or just show empty state
                // For now, let's treat it as "no plan found", maybe trigger generation
                if (!suggestions) {
                    generateSuggestions();
                }
            }

        } catch (err) {
            console.error(err);
            setError("Failed to fetch suggestions.");
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestions = async () => {
        try {
            setRegenerating(true);
            setError("");
            // Use POST to force regeneration
            const data = await postWithCookie("/nutrition/daily-suggestions", {});

            if (data.status === "success" && data.plan) {
                const normalizedPlan = {};
                Object.keys(data.plan).forEach(key => {
                    normalizedPlan[key.toLowerCase()] = data.plan[key];
                });
                setSuggestions(normalizedPlan);
            } else {
                setError("Failed to generate new plan.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to generate suggestions. Please try again later.");
        } finally {
            setRegenerating(false);
            setLoading(false);
        }
    };

    if (loading && !suggestions) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400/20 to-red-500/20 flex items-center justify-center mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <p className="text-slate-400 text-sm">Chef AI is accessing your pantry...</p>
            </div>
        );
    }

    if (error && !suggestions) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full text-center">
                    <h2 className="text-lg font-bold text-red-400 mb-2">Oops!</h2>
                    <p className="text-slate-300 mb-4">{error}</p>
                    <button
                        onClick={fetchSuggestions}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24">
            <section className="px-5 pt-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-50 mb-1">Daily Meal Plan</h1>
                        <p className="text-sm text-slate-400">Personalized AI suggestions based on your goals.</p>
                    </div>

                    <button
                        onClick={generateSuggestions}
                        disabled={regenerating}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                        title="Regenerate Plan"
                    >
                        {regenerating ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                    </button>
                </div>

                {suggestions && (
                    <div className={`space-y-6 transition-opacity duration-300 ${regenerating ? 'opacity-50' : 'opacity-100'}`}>

                        {/* Summary Stats */}
                        <div className="flex gap-4">
                            <div className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                                <p className="text-xs text-slate-400 mb-1">Total Calories</p>
                                <p className="text-2xl font-black text-slate-50">{suggestions.total_calories || "--"}</p>
                            </div>
                            <div className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                                <p className="text-xs text-slate-400 mb-1">Protein</p>
                                <p className="text-2xl font-black text-emerald-400">{suggestions.total_protein || "--"}</p>
                            </div>
                        </div>

                        {/* Meals */}
                        <MealCard title="Breakfast" data={suggestions.breakfast} icon="🍳" color="orange" />
                        <MealCard title="Lunch" data={suggestions.lunch} icon="🍛" color="emerald" />
                        <MealCard title="Dinner" data={suggestions.dinner} icon="🥘" color="indigo" />

                        {/* Snacks */}
                        {suggestions.snacks && suggestions.snacks.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-300 px-1">Snacks</h3>
                                {suggestions.snacks.map((snack, idx) => (
                                    <MealCard key={idx} title={`Snack ${idx + 1}`} data={snack} icon="🥨" color="pink" />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

function MealCard({ title, data, icon, color }) {
    if (!data) return null;

    // Define color classes map
    const colors = {
        orange: "from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-400",
        emerald: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400",
        indigo: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20 text-indigo-400",
        pink: "from-pink-500/10 to-rose-500/10 border-pink-500/20 text-pink-400"
    };

    const styleClass = colors[color] || colors.orange;

    return (
        <div className={`bg-gradient-to-r ${styleClass} border rounded-3xl p-5 relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <h3 className={`font-bold text-lg ${styleClass.split(' ').pop()}`}>{title}</h3>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold bg-slate-950/30 px-2 py-1 rounded-lg text-slate-300">
                        {data.calories} kcal
                    </span>
                </div>
            </div>

            <div className="relative z-10">
                <h4 className="text-xl font-bold text-slate-50 mb-1">{data.name}</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">{data.description}</p>
                <div className="flex gap-3">
                    <span className="text-xs font-medium text-slate-500">Protein: <span className="text-slate-300">{data.protein}</span></span>
                </div>
            </div>
        </div>
    );
}
