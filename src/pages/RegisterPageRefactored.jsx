import React, { useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { postAuth } from "../../api";
import { useNavigate, Link } from "react-router-dom";

import StepIndicator, { StepDots } from "../../components/registration/StepIndicator";
import { CredentialsStep, PersonalDetailsStep, MenstrualHealthStep, GoalsStep } from "../../components/registration/FormSteps";

/**
 * Multi-step registration page.
 * Refactored from 671 lines to ~200 lines using modular components.
 */
export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
        gender: "",
        age: "",
        height: "",
        weight: "",
        dietType: "",
        goal: "",
        hasMedicalCondition: false,
        medicalConditions: "",
        countryCode: "+91",
        phone: "",
        cycleLengthDays: "",
        lastPeriodDate: "",
        menstrualPhase: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const totalSteps = form.gender === "female" ? 4 : 3;

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const completeBackendRegistration = async (token) => {
        const payload = {};

        if (form.name) payload.name = form.name;
        if (form.gender) payload.gender = form.gender;

        if (form.age) {
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - Number(form.age));
            payload.dateOfBirth = dob;
        }

        if (form.height) payload.heightCm = Number(form.height);
        if (form.weight) payload.weightKg = Number(form.weight);
        if (form.dietType) payload.dietType = form.dietType;
        if (form.goal) payload.goals = form.goal;

        if (
            form.gender === "female" &&
            (form.cycleLengthDays || form.lastPeriodDate || form.menstrualPhase)
        ) {
            payload.menstrualProfile = {};
            if (form.cycleLengthDays)
                payload.menstrualProfile.cycleLengthDays = Number(form.cycleLengthDays);
            if (form.lastPeriodDate)
                payload.menstrualProfile.lastPeriodDate = new Date(form.lastPeriodDate);
            if (form.menstrualPhase)
                payload.menstrualProfile.phase = form.menstrualPhase;
        }

        if (form.hasMedicalCondition && form.medicalConditions) {
            payload.hasMedicalCondition = true;
            payload.medicalConditions = form.medicalConditions
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
        }

        if (form.phone) {
            payload.phone = `${form.countryCode}${form.phone}`.replace(/\s+/g, "");
        }

        const res = await postAuth("/auth/register", token, payload);

        if (res.message === "User Registered") {
            sessionStorage.setItem("verifiedUser", "true");
            navigate("/profile");
            return;
        }

        if (res.message === "User already registered!") {
            setError("User already registered, please try with a different email");
            await auth.signOut();
            return;
        }

        await auth.signOut();
        setError("Something went wrong!");
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;
        setError("");
        setLoading(true);

        try {
            const cred = await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );
            const token = await cred.user.getIdToken();
            await completeBackendRegistration(token);
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                try {
                    const signinCred = await signInWithEmailAndPassword(
                        auth,
                        form.email,
                        form.password
                    );
                    const token = await signinCred.user.getIdToken();
                    await completeBackendRegistration(token);
                    return;
                } catch (err2) {
                    setError(err2.message);
                }
            } else {
                setError(err.message || "Failed to register");
            }
        } finally {
            setLoading(false);
        }
    };

    const validateStep = () => {
        if (step === 1) {
            if (!form.email || !form.password) {
                setError("Email and password are required");
                return false;
            }
            if (form.password.length < 6) {
                setError("Password must be at least 6 characters");
                return false;
            }
        }
        if (step === 2) {
            if (!form.name || !form.gender || !form.age || !form.height || !form.weight) {
                setError("All fields are required");
                return false;
            }
        }
        if ((step === 3 && form.gender !== "female") || step === 4) {
            if (!form.dietType || !form.goal) {
                setError("Diet type and fitness goal are required");
                return false;
            }
        }
        setError("");
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setError("");
        setStep(step - 1);
    };

    const getStepTitle = () => {
        if (step === 1) return "Create your account";
        if (step === 2) return "Tell us about yourself";
        if (step === 3 && form.gender === "female") return "Menstrual health";
        return "Health & Goals";
    };

    const getStepSubtitle = () => {
        if (step === 1) return "Start your fitness journey today";
        if (step === 2) return "Basic info helps personalize your experience";
        if (step === 3 && form.gender === "female") return "Optional but recommended for better insights";
        return "Set your targets and preferences";
    };

    const renderCurrentStep = () => {
        if (step === 1) {
            return (
                <CredentialsStep
                    form={form}
                    updateField={updateField}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                />
            );
        }
        if (step === 2) {
            return <PersonalDetailsStep form={form} updateField={updateField} />;
        }
        if (step === 3 && form.gender === "female") {
            return <MenstrualHealthStep form={form} updateField={updateField} onSkip={nextStep} />;
        }
        return <GoalsStep form={form} updateField={updateField} />;
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen px-5 py-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Background glow */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

            {/* Back button */}
            <button
                onClick={() => step > 1 ? prevStep() : navigate("/")}
                className="absolute top-6 left-5 w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur-sm
                   border border-slate-700/50 flex items-center justify-center
                   hover:bg-slate-800 active:scale-95 transition-all duration-200 z-10"
            >
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="w-full max-w-md relative">
                <StepIndicator step={step} totalSteps={totalSteps} />

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                        flex items-center justify-center backdrop-blur-sm border border-primary/20">
                        <span className="text-3xl font-black text-primary">R</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-50 mb-1">{getStepTitle()}</h1>
                    <p className="text-sm text-slate-400">{getStepSubtitle()}</p>
                </div>

                {/* Form card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-2xl">
                    <form onSubmit={step === totalSteps ? handleRegister : (e) => { e.preventDefault(); nextStep(); }}>
                        {renderCurrentStep()}

                        {/* Error display */}
                        {error && (
                            <div className="flex items-start gap-3 text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/20 animate-shake mt-4">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="leading-relaxed">{error}</span>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex gap-3 mt-6">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-800/50 border-2 border-slate-700
                           text-slate-300 font-semibold hover:bg-slate-800 hover:border-slate-600
                           active:scale-[0.98] transition-all duration-200"
                                >
                                    Back
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 relative py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                         text-slate-950 font-bold overflow-hidden shadow-lg shadow-primary/25
                         hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-all duration-200 group"
                            >
                                {!loading && (
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                                )}

                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : step === totalSteps ? (
                                        "Create Account"
                                    ) : (
                                        <>
                                            Continue
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                    {/* Login link */}
                    <p className="mt-6 text-sm text-slate-400 text-center">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary font-semibold hover:text-emerald-400 hover:underline transition-colors"
                        >
                            Login
                        </Link>
                    </p>
                </div>

                <StepDots step={step} totalSteps={totalSteps} />
            </div>

            {/* Animations CSS */}
            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
        </div>
    );
}
