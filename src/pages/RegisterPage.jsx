// import React, { useState } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "firebase/auth";
// import { auth } from "../firebase";
// import { postAuth } from "../api";
// import { useNavigate, Link } from "react-router-dom";

// export default function RegisterPage() {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     name: "",
//     gender: "",
//     age: "",
//     height: "",
//     weight: "",
//     dietType: "",
//     goal: "",
//     hasMedicalCondition: false,
//     medicalConditions: "",
//     countryCode: "+91",
//     phone: "",

//     // Menstrual (female only)
//     cycleLengthDays: "",
//     lastPeriodDate: "",
//     menstrualPhase: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const updateField = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const completeBackendRegistration = async (token) => {
//     const payload = {};

//     if (form.name) payload.name = form.name;
//     if (form.gender) payload.gender = form.gender;

//     // Age → Date of Birth (required by schema)
//     if (form.age) {
//       const dob = new Date();
//       dob.setFullYear(dob.getFullYear() - Number(form.age));
//       payload.dateOfBirth = dob;
//     }

//     if (form.height) payload.heightCm = Number(form.height);
//     if (form.weight) payload.weightKg = Number(form.weight);
//     if (form.dietType) payload.dietType = form.dietType;
//     if (form.goal) payload.goals = form.goal;

//     // Menstrual profile (female only, optional)
//     if (
//       form.gender === "female" &&
//       (form.cycleLengthDays || form.lastPeriodDate || form.menstrualPhase)
//     ) {
//       payload.menstrualProfile = {};

//       if (form.cycleLengthDays)
//         payload.menstrualProfile.cycleLengthDays = Number(
//           form.cycleLengthDays
//         );

//       if (form.lastPeriodDate)
//         payload.menstrualProfile.lastPeriodDate = new Date(
//           form.lastPeriodDate
//         );

//       if (form.menstrualPhase)
//         payload.menstrualProfile.phase = form.menstrualPhase;
//     }

//     if (form.hasMedicalCondition && form.medicalConditions) {
//       payload.hasMedicalCondition = true;
//       payload.medicalConditions = form.medicalConditions
//         .split(",")
//         .map((c) => c.trim())
//         .filter(Boolean);
//     }

//     if (form.phone) {
//       payload.phone = `${form.countryCode}${form.phone}`.replace(/\s+/g, "");
//     }
    
//     const res = await postAuth("/auth/register", token, payload);

//     if (res.message === "User Registered") {
//       sessionStorage.setItem("verifiedUser", "true");
//       navigate("/profile");
//       return;
//     }

//     if (res.message === "User already registered!") {
//       setError("User already registered, please try with a different email");
//       await auth.signOut();
//       return;
//     }

//     await auth.signOut();
//     setError("Something went wrong!");
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const cred = await createUserWithEmailAndPassword(
//         auth,
//         form.email,
//         form.password
//       );
//       const token = await cred.user.getIdToken();
//       await completeBackendRegistration(token);
//     } catch (err) {
//       if (err.code === "auth/email-already-in-use") {
//         try {
//           const signinCred = await signInWithEmailAndPassword(
//             auth,
//             form.email,
//             form.password
//           );
//           const token = await signinCred.user.getIdToken();
//           await completeBackendRegistration(token);
//           return;
//         } catch (err2) {
//           setError(err2.message);
//         }
//       } else {
//         setError(err.message || "Failed to register");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
//       <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-lg relative">
//         <button
//           onClick={() => navigate("/")}
//           className="absolute top-3 right-3 text-slate-400 hover:text-white text-xl"
//         >
//           ✕
//         </button>

//         <h2 className="text-2xl font-semibold text-slate-50 mb-1">
//           Create your account
//         </h2>
//         <p className="text-sm text-slate-400 mb-5">
//           Basic info is mandatory, health details are optional.
//         </p>

//         <form onSubmit={handleRegister} className="space-y-4">
//           <input
//             type="email"
//             required
//             placeholder="Email *"
//             className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//             value={form.email}
//             onChange={(e) => updateField("email", e.target.value)}
//           />

//           <input
//             type="password"
//             required
//             placeholder="Password *"
//             className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//             value={form.password}
//             onChange={(e) => updateField("password", e.target.value)}
//           />

//           <input
//             type="text"
//             placeholder="Full Name"
//             className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//             value={form.name}
//             onChange={(e) => updateField("name", e.target.value)}
//           />

//           <div className="grid grid-cols-2 gap-3">
//             <select
//               className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//               value={form.gender}
//               onChange={(e) => updateField("gender", e.target.value)}
//             >
//               <option value="">Gender</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>

//             <input
//               type="number"
//               placeholder="Age"
//               className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//               value={form.age}
//               onChange={(e) => updateField("age", e.target.value)}
//             />
//           </div>

//           {/* Female-only menstrual section */}
//           {form.gender === "female" && (
//             <div className="space-y-3 border border-slate-800 rounded-xl p-3">
//               <p className="text-xs text-slate-400 font-medium">
//                 Menstrual cycle (optional)
//               </p>

//               <input
//                 type="number"
//                 placeholder="Cycle length (days)"
//                 className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//                 value={form.cycleLengthDays}
//                 onChange={(e) =>
//                   updateField("cycleLengthDays", e.target.value)
//                 }
//               />

//               <input
//                 type="date"
//                 className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//                 value={form.lastPeriodDate}
//                 onChange={(e) =>
//                   updateField("lastPeriodDate", e.target.value)
//                 }
//               />

//               <select
//                 className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//                 value={form.menstrualPhase}
//                 onChange={(e) =>
//                   updateField("menstrualPhase", e.target.value)
//                 }
//               >
//                 <option value="">Cycle phase</option>
//                 <option value="follicular">Follicular</option>
//                 <option value="ovulatory">Ovulatory</option>
//                 <option value="luteal">Luteal</option>
//               </select>
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3">
//             <input
//               type="number"
//               placeholder="Height (cm)"
//               className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//               value={form.height}
//               onChange={(e) => updateField("height", e.target.value)}
//             />
//             <input
//               type="number"
//               placeholder="Weight (kg)"
//               className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//               value={form.weight}
//               onChange={(e) => updateField("weight", e.target.value)}
//             />
//           </div>

//           <select
//             className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//             value={form.dietType}
//             onChange={(e) => updateField("dietType", e.target.value)}
//           >
//             <option value="">Diet Type</option>
//             <option value="vegetarian">Vegetarian</option>
//             <option value="eggetarian">Eggetarian</option>
//             <option value="non_vegetarian">Non-Vegetarian</option>
//           </select>

//           <input
//             type="text"
//             placeholder="Fitness goal"
//             className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//             value={form.goal}
//             onChange={(e) => updateField("goal", e.target.value)}
//           />

//           <label className="flex items-center gap-2 text-sm text-slate-300">
//             <input
//               type="checkbox"
//               checked={form.hasMedicalCondition}
//               onChange={(e) =>
//                 updateField("hasMedicalCondition", e.target.checked)
//               }
//             />
//             I have a medical condition
//           </label>

//           {form.hasMedicalCondition && (
//             <input
//               type="text"
//               placeholder="e.g. diabetes, thyroid"
//               className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
//               value={form.medicalConditions}
//               onChange={(e) =>
//                 updateField("medicalConditions", e.target.value)
//               }
//             />
//           )}

//           {error && (
//             <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
//               {error}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-xl bg-primary text-slate-950 font-semibold py-2.5 text-sm"
//           >
//             {loading ? "Creating account..." : "Register"}
//           </button>
//         </form>

//         <p className="mt-4 text-xs text-slate-400 text-center">
//           Already have an account?{" "}
//           <Link to="/login" className="text-primary hover:underline">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { postAuth } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // Multi-step form
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
    setError(""); // Clear error on input change
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
      if (!form.name || !form.gender || !form.age) {
        setError("Name, gender, and age are required");
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

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-5 py-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      
      {/* Animated Background */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Back Button */}
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

      {/* Registration Form */}
      <div className="w-full max-w-md relative">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs text-slate-500">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Logo/Brand */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                        flex items-center justify-center backdrop-blur-sm border border-primary/20">
            <span className="text-3xl font-black text-primary">R</span>
          </div>
          <h1 className="text-2xl font-black text-slate-50 mb-1">
            {step === 1 && "Create your account"}
            {step === 2 && "Tell us about yourself"}
            {step === 3 && form.gender === "female" ? "Menstrual health" : "Health & Goals"}
            {step === 4 && "Health & Goals"}
          </h1>
          <p className="text-sm text-slate-400">
            {step === 1 && "Start your fitness journey today"}
            {step === 2 && "Basic info helps personalize your experience"}
            {step === 3 && form.gender === "female" ? "Optional but recommended for better insights" : "Set your targets and preferences"}
            {step === 4 && "Set your targets and preferences"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-2xl">
          
          <form onSubmit={step === totalSteps ? handleRegister : (e) => { e.preventDefault(); nextStep(); }}>
            
            {/* STEP 1: Email & Password */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Email address *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg 
                        className={`w-5 h-5 transition-colors duration-200 ${
                          focusedField === 'email' ? 'text-primary' : 'text-slate-500'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      className={`w-full rounded-2xl bg-slate-950/50 border-2 pl-12 pr-4 py-3.5 text-base text-slate-50
                                placeholder:text-slate-600 transition-all duration-200
                                focus:outline-none focus:bg-slate-950
                                ${focusedField === 'email' 
                                  ? 'border-primary shadow-lg shadow-primary/10' 
                                  : 'border-slate-700/50 hover:border-slate-600'
                                }`}
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg 
                        className={`w-5 h-5 transition-colors duration-200 ${
                          focusedField === 'password' ? 'text-primary' : 'text-slate-500'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={`w-full rounded-2xl bg-slate-950/50 border-2 pl-12 pr-12 py-3.5 text-base text-slate-50
                                placeholder:text-slate-600 transition-all duration-200
                                focus:outline-none focus:bg-slate-950
                                ${focusedField === 'password' 
                                  ? 'border-primary shadow-lg shadow-primary/10' 
                                  : 'border-slate-700/50 hover:border-slate-600'
                                }`}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300
                               active:scale-95 transition-all"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Use a strong password with letters and numbers
                  </p>
                </div>

              </div>
            )}

            {/* STEP 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                           placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                           focus:shadow-lg focus:shadow-primary/10 transition-all duration-200"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    required
                    className="rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                             hover:border-slate-600 focus:border-primary focus:outline-none transition-all duration-200"
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option value="">Gender *</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="number"
                    required
                    placeholder="Age *"
                    min="10"
                    max="100"
                    className="rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                             placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                             transition-all duration-200"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Height"
                      min="100"
                      max="250"
                      className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 text-base text-slate-50
                               placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500 focus:outline-none
                               transition-all duration-200"
                      value={form.height}
                      onChange={(e) => updateField("height", e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">cm</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Weight"
                      min="30"
                      max="200"
                      className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 text-base text-slate-50
                               placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500 focus:outline-none
                               transition-all duration-200"
                      value={form.weight}
                      onChange={(e) => updateField("weight", e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">kg</span>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 3: Menstrual Health (Female Only) */}
            {step === 3 && form.gender === "female" && (
              <div className="space-y-4 animate-fadeIn">
                
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Track your menstrual cycle for personalized health insights and recommendations
                    </p>
                  </div>
                </div>

                <input
                  type="number"
                  placeholder="Cycle length (days)"
                  min="21"
                  max="35"
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                           placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                           transition-all duration-200"
                  value={form.cycleLengthDays}
                  onChange={(e) => updateField("cycleLengthDays", e.target.value)}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Last period start date
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                             hover:border-slate-600 focus:border-primary focus:outline-none transition-all duration-200"
                    value={form.lastPeriodDate}
                    onChange={(e) => updateField("lastPeriodDate", e.target.value)}
                  />
                </div>

                <select
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                           hover:border-slate-600 focus:border-primary focus:outline-none transition-all duration-200"
                  value={form.menstrualPhase}
                  onChange={(e) => updateField("menstrualPhase", e.target.value)}
                >
                  <option value="">Current cycle phase</option>
                  <option value="follicular">Follicular (Days 1-13)</option>
                  <option value="ovulatory">Ovulatory (Days 14-16)</option>
                  <option value="luteal">Luteal (Days 17-28)</option>
                </select>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full text-sm text-slate-400 hover:text-slate-300 py-2 transition-colors"
                >
                  Skip for now →
                </button>

              </div>
            )}

            {/* STEP 3/4: Health & Goals */}
            {((step === 3 && form.gender !== "female") || step === 4) && (
              <div className="space-y-4 animate-fadeIn">
                
                <select
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                           hover:border-slate-600 focus:border-emerald-500 focus:outline-none transition-all duration-200"
                  value={form.dietType}
                  onChange={(e) => updateField("dietType", e.target.value)}
                >
                  <option value="">Diet Type</option>
                  <option value="vegetarian">🥗 Vegetarian</option>
                  <option value="eggetarian">🥚 Eggetarian</option>
                  <option value="non_vegetarian">🍗 Non-Vegetarian</option>
                </select>

                <input
                  type="text"
                  placeholder="Fitness goal (e.g., lose 5kg, build muscle)"
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                           placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500 focus:outline-none
                           transition-all duration-200"
                  value={form.goal}
                  onChange={(e) => updateField("goal", e.target.value)}
                />

                {/* Medical Condition Toggle */}
                <div className="bg-slate-950/50 border-2 border-slate-700/50 rounded-2xl p-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-6 rounded-full transition-all duration-300 ${
                        form.hasMedicalCondition ? 'bg-primary' : 'bg-slate-700'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all duration-300 ${
                          form.hasMedicalCondition ? 'ml-5' : 'ml-0.5'
                        }`}></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                        I have a medical condition
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.hasMedicalCondition}
                      onChange={(e) => updateField("hasMedicalCondition", e.target.checked)}
                    />
                  </label>
                </div>

                {form.hasMedicalCondition && (
                  <textarea
                    placeholder="List your medical conditions (e.g., diabetes, thyroid)"
                    rows="3"
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                             placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                             transition-all duration-200 resize-none"
                    value={form.medicalConditions}
                    onChange={(e) => updateField("medicalConditions", e.target.value)}
                  />
                )}

              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/20 animate-shake mt-4">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Navigation Buttons */}
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

          {/* Login Link */}
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

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index + 1 <= step 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-slate-700'
              }`}
            ></div>
          ))}
        </div>

      </div>

      {/* Custom CSS */}
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

