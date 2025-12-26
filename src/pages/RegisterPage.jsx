import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { postAuth } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const completeBackendRegistration = async (token) => {
    const payload = {};

    if (form.name) payload.name = form.name;
    if (form.gender) payload.gender = form.gender;
    if (form.age) payload.age = Number(form.age);
    if (form.height) payload.height = Number(form.height);
    if (form.weight) payload.weight = Number(form.weight);
    if (form.dietType) payload.dietType = form.dietType;
    if (form.goal) payload.goals = form.goal;

    if (form.hasMedicalCondition && form.medicalConditions) {
      payload.hasMedicalCondition = true;
      payload.medicalConditions = form.medicalConditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    const finalPhone = `${form.countryCode}${form.phone}`.replace(/\s+/g, "");
    if (form.phone) payload.phone = finalPhone;

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
          Basic info is mandatory, fitness details are optional.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
        
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>

         
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              <select
                className="w-24 rounded-xl bg-slate-950 border border-slate-700 px-2 py-2 text-sm"
                value={form.countryCode}
                onChange={(e) =>
                  updateField("countryCode", e.target.value)
                }
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <input
                type="tel"
                className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />
            </div>
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <select
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              type="number"
              placeholder="Age"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.age}
              onChange={(e) => updateField("age", e.target.value)}
            />
          </div>

         
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Height (cm)"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.height}
              onChange={(e) => updateField("height", e.target.value)}
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.weight}
              onChange={(e) => updateField("weight", e.target.value)}
            />
          </div>

       
          <select
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            value={form.dietType}
            onChange={(e) => updateField("dietType", e.target.value)}
          >
            <option value="">Diet Type</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="non_vegetarian">Non-Vegetarian</option>
          </select>

          <input
            type="text"
            placeholder="Fitness goal"
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            value={form.goal}
            onChange={(e) => updateField("goal", e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.hasMedicalCondition}
              onChange={(e) =>
                updateField("hasMedicalCondition", e.target.checked)
              }
            />
            I have a medical condition
          </label>

          {form.hasMedicalCondition && (
            <input
              type="text"
              placeholder="e.g. diabetes, thyroid"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={form.medicalConditions}
              onChange={(e) =>
                updateField("medicalConditions", e.target.value)
              }
            />
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-slate-950 font-semibold py-2.5 text-sm"
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
