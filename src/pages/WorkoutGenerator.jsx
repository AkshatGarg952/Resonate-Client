import { useState } from 'react';
import { postWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const WorkoutGenerator = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        fitnessLevel: '',
        equipment: [],
        timeAvailable: 30,
        injuries: [],
        motivationLevel: '',
        workoutTiming: '',
        goalBarriers: []
    });
    const [customBarrier, setCustomBarrier] = useState("");

    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const equipmentList = ['Dumbbells', 'Kettlebells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Gym Machine', 'None (Bodyweight)'];
    const injuryList = ['None', 'Knees', 'Shoulders', 'Back', 'Wrists', 'Ankles'];
    const motivationLevels = ['Low', 'Medium', 'High'];
    const timingOptions = ['Morning', 'Afternoon', 'Evening'];
    const barrierOptions = ['Time Constraints', 'Low Energy', 'Lack of Discipline', 'Boredom', 'Slow Progress', 'None'];

    const totalSteps = 7;

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const toggleSelection = (category, item) => {
        setFormData(prev => {
            const list = prev[category];
            if (list.includes(item)) {
                return { ...prev, [category]: list.filter(i => i !== item) };
            } else {
                if ((category === 'injuries' || category === 'goalBarriers') && item === 'None') return { ...prev, [category]: ['None'] };
                if ((category === 'injuries' || category === 'goalBarriers') && list.includes('None')) return { ...prev, [category]: [item] };
                return { ...prev, [category]: [...list, item] };
            }
        });
    };

    const generatePlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const finalBarriers = [...formData.goalBarriers];
            if (customBarrier.trim()) {
                finalBarriers.push(customBarrier.trim());
            }

            const res = await postWithCookie('/workout/generate', {
                ...formData,
                equipment: formData.equipment.includes('None (Bodyweight)') ? [] : formData.equipment,
                injuries: formData.injuries.includes('None') ? [] : formData.injuries,
                goalBarriers: finalBarriers.includes('None') ? [] : finalBarriers
            });
            setGeneratedPlan(res.plan);
            setStep(totalSteps + 1);
        } catch (err) {
            setError(err.message || "Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4 gradient-bg relative overflow-hidden">

            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

            <div className="z-10 w-full max-w-2xl">
                {step <= totalSteps && !generatedPlan && (
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
                            AI Workout Planner
                        </h1>
                        <p className="text-slate-400">Step {step + 1} of {totalSteps}</p>
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    {loading ? (
                        <div className="flex flex-col items-center py-20">
                            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-xl animate-pulse">Constructing your perfect routine...</p>
                        </div>
                    ) : step === 0 ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold mb-4 text-center">What's your current fitness level?</h2>
                            <div className="grid gap-4">
                                {levels.map(level => (
                                    <button
                                        key={level}
                                        onClick={() => { setFormData({ ...formData, fitnessLevel: level }); handleNext(); }}
                                        className={`p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] text-left group ${formData.fitnessLevel === level
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="text-xl font-bold mb-1">{level}</div>
                                        <div className="text-slate-400 text-sm">
                                            {level === 'Beginner' && "I'm just starting out"}
                                            {level === 'Intermediate' && "I train regularly"}
                                            {level === 'Advanced' && "I'm looking for a challenge"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 1 ? (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-center">What equipment do you have?</h2>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {equipmentList.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection('equipment', item)}
                                        className={`p-4 rounded-xl border text-sm transition-all ${formData.equipment.includes(item)
                                            ? 'border-blue-500 bg-blue-500/20 text-blue-100'
                                            : 'border-white/10 hover:bg-white/5 text-slate-300'
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between">
                                <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">Back</button>
                                <button
                                    onClick={handleNext}
                                    disabled={formData.equipment.length === 0}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-center">How much time do you have?</h2>
                            <div className="mb-8 px-4">
                                <input
                                    type="range"
                                    min="15"
                                    max="90"
                                    step="5"
                                    value={formData.timeAvailable}
                                    onChange={(e) => setFormData({ ...formData, timeAvailable: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                                <div className="text-center mt-4">
                                    <span className="text-5xl font-bold text-green-400">{formData.timeAvailable}</span>
                                    <span className="text-xl text-slate-400 ml-2">minutes</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">Back</button>
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : step === 3 ? (
                        <div>
                            <h2 className="text-2xl font-semibold mb-2 text-center">Any injuries or limitations?</h2>
                            <p className="text-center text-slate-400 mb-6 text-sm">We'll filter out exercises that might aggravate these areas.</p>
                            <div className="flex flex-wrap gap-3 justify-center mb-8">
                                {injuryList.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection('injuries', item)}
                                        className={`px-4 py-2 rounded-full border transition-all ${formData.injuries.includes(item)
                                            ? 'border-red-500 bg-red-500/20 text-red-100'
                                            : 'border-white/10 hover:bg-white/5 text-slate-300'
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between items-center">
                                <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">Back</button>
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : step === 4 ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold mb-4 text-center">How motivated are you today?</h2>
                            <div className="grid gap-4">
                                {motivationLevels.map(level => (
                                    <button
                                        key={level}
                                        onClick={() => { setFormData({ ...formData, motivationLevel: level }); handleNext(); }}
                                        className={`p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] text-center group ${formData.motivationLevel === level
                                            ? 'border-amber-500 bg-amber-500/10 text-amber-100'
                                            : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="text-xl font-bold mb-1">{level}</div>
                                        <div className="text-slate-400 text-sm">
                                            {level === 'Low' && "I need something easy to get moving"}
                                            {level === 'Medium' && "I'm ready for a solid workout"}
                                            {level === 'High' && "Push me to my limits!"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">Back</button>
                            </div>
                        </div>
                    ) : step === 5 ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold mb-4 text-center">When do you plan to workout?</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {timingOptions.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => { setFormData({ ...formData, workoutTiming: time }); handleNext(); }}
                                        className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] text-center group ${formData.workoutTiming === time
                                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100'
                                            : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="text-lg font-bold">{time}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">Back</button>
                            </div>
                        </div>
                    ) : step === 6 ? (
                        <div>
                            <h2 className="text-2xl font-semibold mb-2 text-center">Any barriers to your goal?</h2>
                            <p className="text-center text-slate-400 mb-6 text-sm">We'll tailor the plan to help you overcome these.</p>
                            <div className="flex flex-wrap gap-3 justify-center mb-8">
                                {barrierOptions.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection('goalBarriers', item)}
                                        className={`px-4 py-2 rounded-full border transition-all ${formData.goalBarriers.includes(item)
                                            ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                                            : 'border-white/10 hover:bg-white/5 text-slate-300'
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8 max-w-sm mx-auto">
                                <input
                                    type="text"
                                    placeholder="Any other constraints? (e.g. Quiet apartment, no jumping)"
                                    value={customBarrier}
                                    onChange={(e) => setCustomBarrier(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            {error && <div className="text-red-400 text-center mb-4">{error}</div>}
                            <div className="flex justify-between items-center">
                                <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">Back</button>
                                <button
                                    onClick={generatePlan}
                                    disabled={loading}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/25 transition-all text-white disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {loading ? 'Generating...' : 'Generate Plan'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{generatedPlan?.title}</h2>
                                    <div className="flex gap-4 text-sm text-slate-400">
                                        <span className="flex items-center"><span className="text-green-400 mr-2">⏱</span> {generatedPlan?.duration}</span>
                                        <span className="flex items-center"><span className="text-blue-400 mr-2">🎯</span> {generatedPlan?.focus}</span>
                                    </div>
                                </div>
                                <button onClick={() => { setStep(0); setGeneratedPlan(null); }} className="text-sm text-slate-400 hover:text-white">Start Over</button>
                            </div>

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <h3 className="text-green-400 font-semibold mb-3 uppercase tracking-wider text-xs">Warmup</h3>
                                    <ul className="space-y-3">
                                        {generatedPlan?.warmup.map((ex, i) => (
                                            <li key={i} className="flex justify-between items-center">
                                                <span>{ex.name}</span>
                                                <span className="text-slate-400 text-sm">{ex.duration || ex.reps}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-blue-400 font-semibold uppercase tracking-wider text-xs">Main Circuit</h3>
                                    {generatedPlan?.exercises.map((ex, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div>
                                                <div className="font-medium text-lg">{ex.name}</div>
                                                <div className="text-slate-400 text-sm">
                                                    {ex.sets && `${ex.sets} sets`}
                                                    {ex.sets && ex.reps && ' × '}
                                                    {ex.reps && `${ex.reps}`}
                                                    {ex.duration && `${ex.duration}`}
                                                </div>
                                                {ex.notes && <div className="text-xs text-slate-500 mt-1 italic">{ex.notes}</div>}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-mono text-slate-400">
                                                {i + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl">
                                    <h3 className="text-indigo-400 font-semibold mb-3 uppercase tracking-wider text-xs">Cooldown</h3>
                                    <ul className="space-y-3">
                                        {generatedPlan?.cooldown.map((ex, i) => (
                                            <li key={i} className="flex justify-between items-center">
                                                <span>{ex.name}</span>
                                                <span className="text-slate-400 text-sm">{ex.duration || ex.reps}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutGenerator;
