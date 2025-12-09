import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import { getWithToken, putWithToken } from "../api";
import { auth } from "../firebase";

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    email: user?.email || "",
    age: "",
    weight: "",
    goal: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const data = await getWithToken("/user/profile", token);
      console.log("Profile data:", data.user);
      setProfile((prev) => ({
        ...prev,
        email: data.user.email || user?.email || "",
        age: data.user.age ?? "",
        weight: data.user.weight ?? "",
        goal: data.user.goals ?? "",
      }));
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
      const token = await auth.currentUser.getIdToken();
      const payload = {
        age: profile.age ? Number(profile.age) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        goal: profile.goal || null,
      };
      await putWithToken("/user/profile", token, payload);
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
      <div className="text-center text-slate-300 mt-10">Loading profile...</div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Welcome</p>
          <h2 className="text-2xl font-semibold text-slate-50">
            {profile.email}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Keep your basic info up to date to get better recommendations.
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

      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">
          Update your profile
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={profile.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={profile.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Fitness Goal
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={profile.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
              placeholder="Run 5km, lose 5kg, etc."
            />
          </div>

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
