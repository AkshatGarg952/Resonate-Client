import { useState, useEffect } from 'react';
import { getWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const MealHistoryPage = () => {
    const navigate = useNavigate();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMeal, setSelectedMeal] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await getWithCookie('/nutrition/history');
            setMeals(res.history || []);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto z-10 relative">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                        Meal History
                    </h1>
                    <button
                        onClick={() => navigate('/nutrition')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-700"
                    >
                        Back to Daily Plan
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : meals.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5">
                        <p className="text-slate-400 mb-4">No meal plans generated yet.</p>
                        <button
                            onClick={() => navigate('/nutrition')}
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl font-bold"
                        >
                            Generate Today's Plan
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {meals.map(meal => (
                            <div
                                key={meal._id}
                                onClick={() => setSelectedMeal(meal)}
                                className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl cursor-pointer hover:border-orange-500/50 hover:bg-slate-800/80 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-mono text-slate-500">{formatDate(meal.date)}</span>
                                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-orange-300">
                                        {meal.plan.total_calories} kcal
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 group-hover:text-orange-400 transition-colors">
                                    Daily Nutrition Plan
                                </h3>
                                <div className="flex gap-4 text-sm text-slate-400 mb-4">
                                    <span>🥩 {meal.plan.total_protein}</span>
                                    <span>🗓 {new Date(meal.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    Breakfast, Lunch, Dinner {meal.plan.snacks?.length > 0 && `+ ${meal.plan.snacks.length} Snacks`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedMeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-slate-800/50">
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Meal Plan Detail</div>
                                <h2 className="text-2xl font-bold text-white mb-1">{formatDate(selectedMeal.date)}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedMeal(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-xs text-slate-500 mb-1">Total Calories</div>
                                    <div className="text-xl font-bold text-white">{selectedMeal.plan.total_calories}</div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-xs text-slate-500 mb-1">Total Protein</div>
                                    <div className="text-xl font-bold text-emerald-400">{selectedMeal.plan.total_protein}</div>
                                </div>
                            </div>

                            <MealDetailSection title="Breakfast" data={selectedMeal.plan.breakfast} />
                            <MealDetailSection title="Lunch" data={selectedMeal.plan.lunch} />
                            <MealDetailSection title="Dinner" data={selectedMeal.plan.dinner} />

                            {selectedMeal.plan.snacks?.map((snack, i) => (
                                <MealDetailSection key={i} title={`Snack ${i + 1}`} data={snack} />
                            ))}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function MealDetailSection({ title, data }) {
    if (!data) return null;
    return (
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-orange-400 font-semibold uppercase tracking-wider text-xs">{title}</h3>
                <span className="text-xs text-slate-400">{data.calories} kcal</span>
            </div>

            <div className="font-bold text-lg mb-1">{data.name}</div>
            <div className="text-sm text-slate-400 mb-2">{data.description}</div>

            <div className="flex gap-3 text-xs text-slate-500">
                {data.protein && <span>P: <span className="text-slate-300">{data.protein}</span></span>}
                {data.carbs && <span>C: <span className="text-slate-300">{data.carbs}</span></span>}
                {data.fats && <span>F: <span className="text-slate-300">{data.fats}</span></span>}
            </div>
        </div>
    );
}

export default MealHistoryPage;
