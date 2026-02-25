import React, { useEffect, useState } from "react";
import { getWithCookie, postWithCookie } from "../api";
import { useNavigate } from "react-router-dom";

export default function NutritionPage() {
    const navigate = useNavigate();
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

            const data = await getWithCookie("/api/nutrition/daily-suggestions");

            if (data.status === "success" && data.plan) {
                const normalizedPlan = {};
                Object.keys(data.plan).forEach(key => {
                    normalizedPlan[key.toLowerCase()] = data.plan[key];
                });
                setSuggestions(normalizedPlan);
            } else if (data.status === "no_plan") {
                setSuggestions(null);
            } else {
                if (data.breakfast || data.Breakfast) {
                    const normalizedPlan = {};
                    Object.keys(data).forEach(key => {
                        normalizedPlan[key.toLowerCase()] = data[key];
                    });
                    setSuggestions(normalizedPlan);
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

            // If we are generating from scratch (not regenerating), show loading state differently
            if (!suggestions) setLoading(true);

            const data = await postWithCookie("/api/nutrition/daily-suggestions", {});

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
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-50">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm animate-pulse">Chef AI is preparing your menu...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <section className="px-6 pt-8 pb-4 max-w-4xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent mb-1">
                            Daily Nutrition
                        </h1>
                        <p className="text-sm text-slate-400">Fuel your body with AI-curated meals.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/meal-history')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors border border-slate-700"
                        >
                            History
                        </button>

                        {suggestions && (
                            <button
                                onClick={generateSuggestions}
                                disabled={regenerating}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors border border-slate-700 disabled:opacity-50"
                            >
                                {regenerating ? 'Regenerating...' : 'Regenerate'}
                            </button>
                        )}
                    </div>
                </div>

                {!suggestions && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
                        <div className="text-6xl mb-4">🥗</div>
                        <h2 className="text-2xl font-bold text-white mb-2">No Meal Plan for Today</h2>
                        <p className="text-slate-400 text-center max-w-md mb-8">
                            Ready to eat right? Generate your personalized meal plan for the day based on your goals.
                        </p>
                        <button
                            onClick={generateSuggestions}
                            disabled={regenerating}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 rounded-xl font-bold text-lg text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                        >
                            {regenerating ? 'Generating...' : 'Generate Daily Plan'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-center">
                        {error}
                        <button onClick={fetchSuggestions} className="underline ml-2">Retry</button>
                    </div>
                )}

                {suggestions && (
                    <div className={`space-y-6 transition-opacity duration-300 ${regenerating ? 'opacity-50' : 'opacity-100'}`}>
                        {/* Macro Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MacroCard title="Calories" value={suggestions.total_calories} unit="kcal" color="white" />
                            <MacroCard title="Protein" value={suggestions.total_protein} unit="" color="emerald" />
                            <MacroCard title="Carbs" value={suggestions.total_carbs || "--"} unit="" color="blue" />
                            <MacroCard title="Fats" value={suggestions.total_fats || "--"} unit="" color="amber" />
                        </div>

                        <div className="space-y-4">
                            <MealCard title="Breakfast" data={suggestions.breakfast} icon="🍳" color="orange" />
                            <MealCard title="Lunch" data={suggestions.lunch} icon="🍛" color="emerald" />
                            <MealCard title="Dinner" data={suggestions.dinner} icon="🥘" color="indigo" />

                            {suggestions.snacks && suggestions.snacks.length > 0 && (
                                <div className="pt-4">
                                    <h3 className="text-lg font-bold text-slate-300 mb-3 px-1">Snacks</h3>
                                    <div className="space-y-4">
                                        {suggestions.snacks.map((snack, idx) => (
                                            <MealCard key={idx} title={`Snack ${idx + 1}`} data={snack} icon="🥨" color="pink" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

function MacroCard({ title, value, unit, color }) {
    const colors = {
        white: "text-slate-100",
        emerald: "text-emerald-400",
        blue: "text-blue-400",
        amber: "text-amber-400"
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{title}</span>
            <div className={`text-2xl font-black ${colors[color] || colors.white}`}>
                {value} <span className="text-xs font-normal text-slate-500 ml-0.5">{unit}</span>
            </div>
        </div>
    );
}

function MealCard({ title, data, icon, color }) {
    if (!data) return null;

    const colors = {
        orange: "from-orange-500/10 to-amber-500/5 border-orange-500/20 text-orange-400",
        emerald: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400",
        indigo: "from-indigo-500/10 to-blue-500/5 border-indigo-500/20 text-indigo-400",
        pink: "from-pink-500/10 to-rose-500/5 border-pink-500/20 text-pink-400"
    };

    const styleClass = colors[color] || colors.orange;
    const accentColor = styleClass.split(' ').pop();

    return (
        <div className={`bg-gradient-to-r ${styleClass} border rounded-3xl p-6 relative overflow-hidden group hover:border-opacity-40 transition-all`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl bg-white/5 p-2 rounded-xl">{icon}</span>
                        <div>
                            <h3 className={`font-bold text-sm uppercase tracking-wider opacity-80 ${accentColor}`}>{title}</h3>
                            <h4 className="text-xl font-bold text-slate-50 group-hover:text-white transition-colors">{data.name}</h4>
                        </div>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-4 md:max-w-xl">{data.description}</p>

                    <div className="flex flex-wrap gap-3">
                        <NutrientBadge label="Protein" value={data.protein} />
                        <NutrientBadge label="Carbs" value={data.carbs} />
                        <NutrientBadge label="Fats" value={data.fats} />
                    </div>
                </div>

                <div className="flex flex-col items-end justify-center min-w-[80px]">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Energy</div>
                    <div className="text-2xl font-black text-slate-200">{data.calories}</div>
                    <div className="text-xs text-slate-500">kcal</div>
                </div>
            </div>
        </div>
    );
}

function NutrientBadge({ label, value }) {
    if (!value) return null;
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-950/30 border border-white/5 text-xs font-medium text-slate-300">
            <span className="text-slate-500 mr-1.5">{label}:</span> {value}
        </span>
    );
}

