import { useState, useEffect } from 'react';
import { getWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const WorkoutHistoryPage = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await getWithCookie('/workout/history');
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

            {/* Detail Modal */}
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
                            {/* Warmup */}
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

                            {/* Main */}
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

                            {/* Cooldown */}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutHistoryPage;
