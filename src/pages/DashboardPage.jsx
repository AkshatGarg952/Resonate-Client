import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import { getWithCookie, putWithCookie } from "../api";

export default function DashboardPage() {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    email: user?.email || "",
    name: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    dietType: "",
    goal: "",
    hasMedicalCondition: false,
    medicalConditions: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      const data = await getWithCookie("/user/profile");

      const u = data.user;

      setProfile({
        email: u.email || user?.email || "",
        name: u.name ?? "",
        gender: u.gender ?? "",
        age: u.age ?? "",
        height: u.height ?? "",
        weight: u.weight ?? "",
        dietType: u.dietType ?? "",
        goal: u.goals ?? "",
        hasMedicalCondition: u.hasMedicalCondition ?? false,
        medicalConditions: (u.medicalConditions || []).join(", "),
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // const token = await auth.currentUser.getIdToken();

      const payload = {
        name: profile.name || null,
        gender: profile.gender || null,
        age: profile.age ? Number(profile.age) : null,
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        dietType: profile.dietType || null,
        goals: profile.goal || null,
        hasMedicalCondition: profile.hasMedicalCondition,
        medicalConditions: profile.hasMedicalCondition
          ? profile.medicalConditions
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
      };

      await putWithCookie("/user/profile", payload);
      setMessage("Profile updated successfully");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-slate-300 mt-10">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Welcome</p>
          <h2 className="text-2xl font-semibold text-slate-50">
            {profile.name || profile.email}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Keep your profile updated for better recommendations.
          </p>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-slate-400 text-xs">Age</p>
            <p className="text-lg font-semibold text-slate-50">
              {profile.age || "--"}
            </p>
          </div>
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-slate-400 text-xs">Weight (kg)</p>
            <p className="text-lg font-semibold text-slate-50">
              {profile.weight || "--"}
            </p>
          </div>
        </div>
      </section>

      {/* EDIT FORM */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">
          Update your profile
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Gender + Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              type="number"
              min="1"
              placeholder="Age"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.age}
              onChange={(e) => handleChange("age", e.target.value)}
            />
          </div>

          {/* Height + Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Height (cm)"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.height}
              onChange={(e) => handleChange("height", e.target.value)}
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
            />
          </div>

          {/* Diet */}
          <select
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            value={profile.dietType}
            onChange={(e) => handleChange("dietType", e.target.value)}
          >
            <option value="">Diet Type</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="non_vegetarian">Non-Vegetarian</option>
          </select>

          {/* Goal */}
          <input
            type="text"
            placeholder="Fitness goal"
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            value={profile.goal}
            onChange={(e) => handleChange("goal", e.target.value)}
          />

          {/* Medical */}
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={profile.hasMedicalCondition}
              onChange={(e) =>
                handleChange("hasMedicalCondition", e.target.checked)
              }
            />
            I have a medical condition
          </label>

          {profile.hasMedicalCondition && (
            <input
              type="text"
              placeholder="e.g. diabetes, thyroid"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.medicalConditions}
              onChange={(e) =>
                handleChange("medicalConditions", e.target.value)
              }
            />
          )}

          {message && (
            <p className="text-xs text-slate-300 bg-slate-800/60 rounded-xl px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-xl bg-primary text-slate-950 font-semibold py-2.5 px-6 text-sm hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}

