import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

      
      const payload = {};
      if (form.age) payload.age = Number(form.age);
      if (form.weight) payload.weight = Number(form.weight);
      if (form.goal) payload.goal = form.goal;

      await postWithToken("/auth/register", token, payload);

      
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
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
          Create your account 🎯
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          Basic info is mandatory, fitness details are optional (you can update
          later).
        </p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Email address *
            </label>
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
            <label className="block text-sm text-slate-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              placeholder="min 6 characters"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Age (optional)
              </label>
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
              <label className="block text-sm text-slate-300 mb-1">
                Weight (kg, optional)
              </label>
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
            <label className="block text-sm text-slate-300 mb-1">
              Fitness Goal (optional)
            </label>
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
