import { useState } from 'react';
import { postWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const WorkoutGenerator = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [error, setError] = useState(null);

    const [workoutId, setWorkoutId] = useState(null);
    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(false);

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
            if (customBarrier.trim()) finalBarriers.push(customBarrier.trim());
            const res = await postWithCookie('/api/workout/generate', {
                ...formData,
                equipment: formData.equipment.includes('None (Bodyweight)') ? [] : formData.equipment,
                injuries: formData.injuries.includes('None') ? [] : formData.injuries,
                goalBarriers: finalBarriers.includes('None') ? [] : finalBarriers
            });
            setGeneratedPlan(res.plan);
            setWorkoutId(res.workoutId);
            setStep(totalSteps + 1);
        } catch (err) {
            setError(err.message || "Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!workoutId) return;
        setCompleting(true);
        try {
            await postWithCookie('/api/workout/complete', { workoutId, rpe: 5, energyLevel: 5, notes: "Quick completed from generator" });
            setCompleted(true);
        } catch (err) {
            setError("Failed to mark workout as complete");
        } finally {
            setCompleting(false);
        }
    };

    const cardStyle = {
        background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.80)", borderRadius: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "32px",
        width: "100%", maxWidth: 560,
    };

    const btnPrimary = {
        padding: "12px 28px", borderRadius: 12, border: "none",
        background: "#1A1A18", color: "#FFF", fontSize: 14, fontWeight: 700,
        cursor: "pointer", transition: "all 0.15s",
    };

    const btnSecondary = {
        padding: "10px 20px", borderRadius: 12,
        background: "none", border: "none", color: "rgba(26,26,24,0.50)",
        fontSize: 14, fontWeight: 600, cursor: "pointer",
    };

    const optionBtn = (isSelected) => ({
        padding: "16px 20px", borderRadius: 14, textAlign: "left", width: "100%",
        border: `2px solid ${isSelected ? "#CADB00" : "rgba(26,26,24,0.10)"}`,
        background: isSelected ? "rgba(202,219,0,0.10)" : "rgba(255,255,255,0.60)",
        cursor: "pointer", transition: "all 0.15s",
    });

    const pillBtn = (isSelected, color = "#CADB00") => ({
        padding: "8px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
        border: `2px solid ${isSelected ? color : "rgba(26,26,24,0.10)"}`,
        background: isSelected ? `${color}22` : "rgba(255,255,255,0.60)",
        color: isSelected ? "#1A1A18" : "rgba(26,26,24,0.60)",
        cursor: "pointer", transition: "all 0.15s",
    });

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            {/* Header */}
            {step <= totalSteps && !generatedPlan && (
                <div style={{ textAlign: "center", marginBottom: 24, width: "100%", maxWidth: 560 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>
                        AI Workout Planner
                    </h1>
                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.50)", marginBottom: 14 }}>
                        Step {step + 1} of {totalSteps}
                    </p>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(26,26,24,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${((step + 1) / totalSteps) * 100}%`, background: "#CADB00", borderRadius: 3, transition: "width 0.4s ease" }} />
                    </div>
                </div>
            )}

            <div style={cardStyle}>
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.20)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
                        <p style={{ fontSize: 15, color: "rgba(26,26,24,0.55)" }}>Constructing your perfect routine…</p>
                    </div>

                ) : step === 0 ? (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", textAlign: "center", marginBottom: 20 }}>What's your current fitness level?</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {levels.map(level => (
                                <button key={level} onClick={() => { setFormData({ ...formData, fitnessLevel: level }); handleNext(); }} style={optionBtn(formData.fitnessLevel === level)}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", marginBottom: 2 }}>{level}</div>
                                    <div style={{ fontSize: 12, color: "rgba(26,26,24,0.50)" }}>
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
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", textAlign: "center", marginBottom: 20 }}>What equipment do you have?</h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, justifyContent: "center" }}>
                            {equipmentList.map(item => (
                                <button key={item} onClick={() => toggleSelection('equipment', item)} style={pillBtn(formData.equipment.includes(item), "#CADB00")}>
                                    {item}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button style={btnSecondary} onClick={handleBack}>Back</button>
                            <button style={{ ...btnPrimary, opacity: formData.equipment.length === 0 ? 0.4 : 1 }} disabled={formData.equipment.length === 0} onClick={handleNext}>Next</button>
                        </div>
                    </div>

                ) : step === 2 ? (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", textAlign: "center", marginBottom: 20 }}>How much time do you have?</h2>
                        <div style={{ padding: "0 8px", marginBottom: 24 }}>
                            <input type="range" min="15" max="90" step="5" value={formData.timeAvailable}
                                onChange={(e) => setFormData({ ...formData, timeAvailable: parseInt(e.target.value) })}
                                style={{ width: "100%", accentColor: "#CADB00" }}
                            />
                            <div style={{ textAlign: "center", marginTop: 12 }}>
                                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, color: "#1A1A18" }}>{formData.timeAvailable}</span>
                                <span style={{ fontSize: 16, color: "rgba(26,26,24,0.50)", marginLeft: 6 }}>minutes</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button style={btnSecondary} onClick={handleBack}>Back</button>
                            <button style={btnPrimary} onClick={handleNext}>Next</button>
                        </div>
                    </div>

                ) : step === 3 ? (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", textAlign: "center", marginBottom: 6 }}>Any injuries or limitations?</h2>
                        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(26,26,24,0.50)", marginBottom: 20 }}>We'll filter out exercises that might aggravate these areas.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                            {injuryList.map(item => (
                                <button key={item} onClick={() => toggleSelection('injuries', item)} style={pillBtn(formData.injuries.includes(item), "#EF4444")}>
                                    {item}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button style={btnSecondary} onClick={handleBack}>Back</button>
                            <button style={btnPrimary} onClick={handleNext}>Next</button>
                        </div>
                    </div>

                ) : step === 4 ? (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", textAlign: "center", marginBottom: 20 }}>How motivated are you today?</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                            {motivationLevels.map(level => (
                                <button key={level} onClick={() => { setFormData({ ...formData, motivationLevel: level }); handleNext(); }} style={optionBtn(formData.motivationLevel === level)}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", marginBottom: 2 }}>{level}</div>
                                    <div style={{ fontSize: 12, color: "rgba(26,26,24,0.50)" }}>
                                        {level === 'Low' && "I need something easy to get moving"}
                                        {level === 'Medium' && "I'm ready for a solid workout"}
                                        {level === 'High' && "Push me to my limits!"}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button style={btnSecondary} onClick={handleBack}>Back</button>
                    </div>

                ) : step === 5 ? (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", textAlign: "center", marginBottom: 20 }}>When do you plan to workout?</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                            {timingOptions.map(time => (
                                <button key={time} onClick={() => { setFormData({ ...formData, workoutTiming: time }); handleNext(); }} style={{ ...optionBtn(formData.workoutTiming === time), textAlign: "center", padding: "20px 8px" }}>
                                    <div style={{ fontSize: 22, marginBottom: 4 }}>
                                        {time === 'Morning' ? '🌅' : time === 'Afternoon' ? '☀️' : '🌙'}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A18" }}>{time}</div>
                                </button>
                            ))}
                        </div>
                        <button style={btnSecondary} onClick={handleBack}>Back</button>
                    </div>

                ) : step === 6 ? (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", textAlign: "center", marginBottom: 6 }}>Any barriers to your goal?</h2>
                        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(26,26,24,0.50)", marginBottom: 20 }}>We'll tailor the plan to help you overcome these.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 18 }}>
                            {barrierOptions.map(item => (
                                <button key={item} onClick={() => toggleSelection('goalBarriers', item)} style={pillBtn(formData.goalBarriers.includes(item), "#7C6FCD")}>
                                    {item}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text" placeholder="Other constraints? (e.g. quiet apartment)"
                            value={customBarrier} onChange={(e) => setCustomBarrier(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid rgba(26,26,24,0.10)", fontSize: 13, color: "#1A1A18", outline: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" }}
                        />
                        {error && <div style={{ fontSize: 13, color: "#EF4444", marginBottom: 12, textAlign: "center" }}>{error}</div>}
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button style={btnSecondary} onClick={handleBack}>Back</button>
                            <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} onClick={generatePlan} disabled={loading}>
                                {loading ? 'Generating…' : '✨ Generate Plan'}
                            </button>
                        </div>
                    </div>

                ) : (
                    // Generated plan view
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1.5px solid rgba(26,26,24,0.08)", paddingBottom: 16, marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A18", margin: "0 0 6px" }}>{generatedPlan?.title}</h2>
                                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(26,26,24,0.50)" }}>
                                    <span>⏱ {generatedPlan?.duration}</span>
                                    <span>🎯 {generatedPlan?.focus}</span>
                                </div>
                            </div>
                            <button onClick={() => { setStep(0); setGeneratedPlan(null); }} style={{ fontSize: 12, fontWeight: 600, color: "rgba(26,26,24,0.45)", background: "none", border: "none", cursor: "pointer" }}>
                                Start Over
                            </button>
                        </div>

                        <div style={{ maxHeight: "50vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 4 }}>
                            {/* Warmup */}
                            <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: 12, padding: "12px 14px" }}>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#14532D", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Warmup</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                                    {generatedPlan?.warmup.map((ex, i) => (
                                        <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1A18" }}>
                                            <span>{ex.name}</span><span style={{ color: "rgba(26,26,24,0.45)" }}>{ex.duration || ex.reps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Main circuit */}
                            <div>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#3D4000", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Main Circuit</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {generatedPlan?.exercises.map((ex, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(202,219,0,0.07)", border: "1px solid rgba(202,219,0,0.16)", borderRadius: 10, padding: "10px 12px" }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>{ex.name}</div>
                                                <div style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>
                                                    {ex.sets && `${ex.sets} sets`}{ex.sets && ex.reps && ' × '}{ex.reps && `${ex.reps}`}{ex.duration && `${ex.duration}`}
                                                </div>
                                                {ex.notes && <div style={{ fontSize: 11, color: "#E07A3A", fontStyle: "italic" }}>{ex.notes}</div>}
                                            </div>
                                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(26,26,24,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(26,26,24,0.40)", fontWeight: 700 }}>{i + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cooldown */}
                            <div style={{ background: "rgba(124,111,205,0.06)", border: "1px solid rgba(124,111,205,0.15)", borderRadius: 12, padding: "12px 14px" }}>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#4A3D6B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Cooldown</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                                    {generatedPlan?.cooldown.map((ex, i) => (
                                        <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1A18" }}>
                                            <span>{ex.name}</span><span style={{ color: "rgba(26,26,24,0.45)" }}>{ex.duration || ex.reps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                            {!completed ? (
                                <button onClick={handleComplete} disabled={completing} style={{ ...btnPrimary, opacity: completing ? 0.6 : 1, padding: "12px 36px" }}>
                                    {completing ? 'Completing…' : 'Mark Workout Complete'}
                                </button>
                            ) : (
                                <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: "#14532D", padding: "12px 24px", background: "rgba(52,199,89,0.08)", borderRadius: 12, border: "1px solid rgba(52,199,89,0.20)" }}>
                                    🎉 Workout Recorded!
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default WorkoutGenerator;
