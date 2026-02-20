import { useState, useEffect } from 'react';
import { getWithCookie, postWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const WorkoutHistoryPage = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completionData, setCompletionData] = useState({ rpe: 7, energyLevel: 7, notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await getWithCookie('/api/workout/history');
            setWorkouts(res.workouts || []);
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

    const handleComplete = async () => {
        if (!selectedWorkout) return;
        setIsSubmitting(true);
        try {
            await postWithCookie('/api/workout/complete', {
                workoutId: selectedWorkout._id,
                ...completionData
            });

            setWorkouts(prev => prev.map(w =>
                w._id === selectedWorkout._id ? { ...w, status: 'completed' } : w
            ));
            setShowCompleteModal(false);
            setSelectedWorkout(null);
        } catch (err) {
            console.error("Failed to complete workout", err);
            alert("Failed to log workout completion");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 pb-24 gradient-bg relative">
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto z-10 relative">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        Workout History
                    </h1>
                    <button
                        onClick={() => navigate('/workout-generator')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-700"
                    >
                        + New Workout
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : workouts.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5">
                        <p className="text-slate-400 mb-4">No workouts generated yet.</p>
                        <button
                            onClick={() => navigate('/workout-generator')}
                            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold"
                        >
                            Generate Your First Plan
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {workouts.map(workout => (
                            <div
                                key={workout._id}
                                onClick={() => setSelectedWorkout(workout)}
                                className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/80 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-mono text-slate-500">{formatDate(workout.createdAt)}</span>
                                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-purple-300">
                                        {workout.inputs?.fitnessLevel || 'Custom'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
                                    {workout.plan.title || "Workout Plan"}
                                </h3>
                                <div className="flex gap-4 text-sm text-slate-400 mb-4">
                                    <span>⏱ {workout.plan.duration}</span>
                                    <span className="truncate">🎯 {workout.plan.focus}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    {workout.plan.exercises?.length || 0} exercises
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {selectedWorkout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-slate-800/50">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedWorkout.plan.title}</h2>
                                <div className="flex gap-3 text-sm text-slate-400">
                                    <span>{formatDate(selectedWorkout.createdAt)}</span>
                                    <span>•</span>
                                    <span>{selectedWorkout.plan.duration}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedWorkout(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                            <div className="bg-white/5 p-4 rounded-xl">
                                <h3 className="text-green-400 font-semibold mb-3 uppercase tracking-wider text-xs">Warmup</h3>
                                <ul className="space-y-2">
                                    {selectedWorkout.plan.warmup?.map((ex, i) => (
                                        <li key={i} className="flex justify-between text-sm">
                                            <span>{ex.name}</span>
                                            <span className="text-slate-400">{ex.duration || ex.reps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>


                            <div className="space-y-3">
                                <h3 className="text-blue-400 font-semibold uppercase tracking-wider text-xs">Main Circuit</h3>
                                {selectedWorkout.plan.exercises?.map((ex, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <div>
                                            <div className="font-medium">{ex.name}</div>
                                            <div className="text-slate-400 text-xs mt-1">
                                                {ex.sets && `${ex.sets} sets`}
                                                {ex.sets && ex.reps && ' × '}
                                                {ex.reps && `${ex.reps}`}
                                                {ex.duration && `${ex.duration}`}
                                            </div>
                                            {ex.notes && <div className="text-orange-400/80 text-xs mt-1 italic">{ex.notes}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>


                            <div className="bg-white/5 p-4 rounded-xl">
                                <h3 className="text-indigo-400 font-semibold mb-3 uppercase tracking-wider text-xs">Cooldown</h3>
                                <ul className="space-y-2">
                                    {selectedWorkout.plan.cooldown?.map((ex, i) => (
                                        <li key={i} className="flex justify-between text-sm">
                                            <span>{ex.name}</span>
                                            <span className="text-slate-400">{ex.duration || ex.reps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>


                            {selectedWorkout.status !== 'completed' && (
                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setShowCompleteModal(true)}
                                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-white shadow-lg shadow-green-500/20 transition-all"
                                    >
                                        Log as Completed
                                    </button>
                                </div>
                            )}
                            {selectedWorkout.status === 'completed' && (
                                <div className="pt-4 border-t border-white/10 text-center text-green-400 font-semibold">
                                    ✓ Workout Completed
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {showCompleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-green-500/20 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-white mb-6">Log Completion</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Rate of Perceived Exertion (RPE)</label>
                                <input
                                    type="range" min="1" max="10"
                                    value={completionData.rpe}
                                    onChange={(e) => setCompletionData({ ...completionData, rpe: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Easy</span>
                                    <span className="text-green-400 font-bold text-lg">{completionData.rpe}</span>
                                    <span>Max Effort</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Energy Level</label>
                                <input
                                    type="range" min="1" max="10"
                                    value={completionData.energyLevel}
                                    onChange={(e) => setCompletionData({ ...completionData, energyLevel: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Exhausted</span>
                                    <span className="text-blue-400 font-bold text-lg">{completionData.energyLevel}</span>
                                    <span>Energized</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Notes (Optional)</label>
                                <textarea
                                    value={completionData.notes}
                                    onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                                    rows="3"
                                    placeholder="How did it feel?"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowCompleteModal(false)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white shadow-lg transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Confirm Log'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutHistoryPage;
