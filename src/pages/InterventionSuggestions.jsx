import { useState } from 'react';
import { postWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const InterventionSuggestions = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const [contextUsed, setContextUsed] = useState(null);

    const generateSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await postWithCookie('/api/interventions/suggest', {});
            setSuggestions(res.suggestions || []);
            setContextUsed(res.contextUsed);
        } catch (err) {
            setError(err.message || "Failed to generate suggestions");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (suggestion) => {
        try {
            await postWithCookie('/api/interventions', {
                type: suggestion.type,
                title: suggestion.title,
                description: suggestion.description,
                status: 'active',
                startDate: new Date(),
                // Default duration if not provided
                endDate: new Date(Date.now() + (suggestion.durationDays || 14) * 86400000)
            });
            alert("Intervention added to your active plans!");
            // Remove from list or mark as added
            setSuggestions(prev => prev.filter(s => s !== suggestion));
        } catch (err) {
            alert("Failed to add intervention: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-6 gradient-bg relative overflow-hidden">

            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

            <div className="z-10 w-full max-w-4xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
                        AI Health Interventions
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Personalized strategies based on your recent sleep, stress, and activity data.
                    </p>
                </header>

                {suggestions.length === 0 && !loading && (
                    <div className="text-center py-20 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                        <div className="mb-6 text-6xl">🧬</div>
                        <h2 className="text-2xl font-semibold mb-4">Ready to optimize your health?</h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Our AI analyzes your recent logs to find areas for improvement.
                        </p>
                        <button
                            onClick={generateSuggestions}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/25 transition-all text-white"
                        >
                            Generate Suggestions
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-xl animate-pulse">Analyzing your health data...</p>
                        <p className="text-sm text-slate-500 mt-2">Checking sleep patterns, stress levels, and nutrition adherence</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center mb-8">
                        {error}
                        <button onClick={generateSuggestions} className="block mx-auto mt-4 text-sm underline hover:text-red-300">Try Again</button>
                    </div>
                )}

                {suggestions.length > 0 && (
                    <div className="grid gap-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Recommended for You</h3>
                            <button onClick={generateSuggestions} className="text-sm text-slate-400 hover:text-white">Regenerate</button>
                        </div>

                        {suggestions.map((suggestion, idx) => (
                            <div key={idx} className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-all group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${suggestion.type === 'sleep' ? 'bg-indigo-500/20 text-indigo-300' :
                                                suggestion.type === 'nutrition' ? 'bg-green-500/20 text-green-300' :
                                                    suggestion.type === 'stress' ? 'bg-amber-500/20 text-amber-300' :
                                                        'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                {suggestion.type}
                                            </span>
                                            {suggestion.priority === 'high' && (
                                                <span className="flex items-center text-red-400 text-xs font-bold gap-1">
                                                    <span className="animate-pulse">●</span> High Priority
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{suggestion.title}</h3>
                                        <p className="text-slate-400 leading-relaxed mb-4">{suggestion.description}</p>

                                        {suggestion.reasoning && (
                                            <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300 italic mb-4">
                                                "Because {suggestion.reasoning}"
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                ⏱ {suggestion.durationDays || 14} Days
                                            </span>
                                            <span className="flex items-center gap-1">
                                                💪 Difficulty: {suggestion.difficulty || 'Medium'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAccept(suggestion)}
                                        className="px-6 py-3 bg-white/10 hover:bg-green-600 hover:text-white text-slate-300 rounded-xl font-semibold transition-all flex-shrink-0"
                                    >
                                        Accept Plan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {contextUsed && suggestions.length > 0 && (
                    <div className="mt-12 p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">AI Context Used</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 font-mono">
                            <div>
                                <strong className="text-slate-300 block mb-1">Recent Events:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    {contextUsed.recent_events?.slice(0, 5).map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <strong className="text-slate-300 block mb-1">Key Facts:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    {contextUsed.key_facts?.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InterventionSuggestions;
