import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { postWithToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    age: "",
    weight: "",
    goal: "",
    countryCode: "+91",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };


  const completeBackendRegistration = async (token) => {
    const payload = {};
    if (form.age) payload.age = Number(form.age);
    if (form.weight) payload.weight = Number(form.weight);
    if (form.goal) payload.goal = form.goal;

    const finalPhone = `${form.countryCode}${form.phone}`.replace(/\s+/g, "");
    if (form.phone) payload.phone = finalPhone;
    

    
    const res = await postWithToken("/auth/register", token, payload);

    if (res.message === "User Registered" || res.message === "User already registered!") {
      sessionStorage.setItem("verifiedUser", "true");
      navigate("/dashboard");
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
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const token = await cred.user.getIdToken();
      await completeBackendRegistration(token);

    } catch (err) {

      if (err.code === "auth/email-already-in-use") {
        try {
          const signinCred = await signInWithEmailAndPassword(auth, form.email, form.password);
          const token = await signinCred.user.getIdToken();
          await completeBackendRegistration(token);
          return;

        } catch (err2) {
          setError(err2.message);
          return;
        }
      }

      setError(err.message || "Failed to register");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-lg relative">

        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-3 text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-slate-50 mb-1">
          Create your account
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          Basic info is mandatory, fitness details are optional (you can update later).
        </p>

        <form onSubmit={handleRegister} className="space-y-4">

          
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email address *</label>
            <input
              type="email"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

         
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password *</label>
            <input
              type="password"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              placeholder="min 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Phone number</label>
            <div className="flex gap-2">
              <select
                className="w-24 rounded-xl bg-slate-950 border border-slate-700 px-2 py-2 text-sm focus:outline-none"
                value={form.countryCode}
                onChange={(e) => updateField("countryCode", e.target.value)}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+971">🇦🇪 +971</option>
              </select>

              <input
                type="tel"
                className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
              />
            </div>
          </div>

         
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Age (optional)</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="e.g. 24"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Weight (kg, optional)</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="e.g. 65"
              />
            </div>
          </div>

          
          <div>
            <label className="block text-sm text-slate-300 mb-1">Fitness Goal (optional)</label>
            <input
              type="text"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.goal}
              onChange={(e) => updateField("goal", e.target.value)}
              placeholder="Lose fat, gain muscle, etc."
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-primary text-slate-950 font-semibold py-2.5 text-sm hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
