import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import { getWithCookie, putWithCookie } from "../api";

export default function DashboardPage() {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    email: user?.email || "",
    name: "",
    gender: "",
    dateOfBirth: "",
    heightCm: "",
    weightKg: "",
    dietType: "",
    goal: "",
    hasMedicalCondition: false,
    medicalConditions: "",

    // Menstrual
    cycleLengthDays: "",
    lastPeriodDate: "",
    menstrualPhase: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const calculateAge = (dob) => {
    if (!dob) return "--";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const loadProfile = async () => {
    try {
      const data = await getWithCookie("/user/profile");
      const u = data.user;

      setProfile({
        email: u.email || user?.email || "",
        name: u.name ?? "",
        gender: u.gender ?? "",
        dateOfBirth: u.dateOfBirth
          ? u.dateOfBirth.slice(0, 10)
          : "",
        heightCm: u.heightCm ?? "",
        weightKg: u.weightKg ?? "",
        dietType: u.dietType ?? "",
        goal: u.goals ?? "",
        hasMedicalCondition: u.hasMedicalCondition ?? false,
        medicalConditions: (u.medicalConditions || []).join(", "),

        cycleLengthDays: u.menstrualProfile?.cycleLengthDays ?? "",
        lastPeriodDate: u.menstrualProfile?.lastPeriodDate
          ? u.menstrualProfile.lastPeriodDate.slice(0, 10)
          : "",
        menstrualPhase: u.menstrualProfile?.phase ?? "",
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
      const payload = {
        name: profile.name || null,
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth)
          : null,
        heightCm: profile.heightCm
          ? Number(profile.heightCm)
          : null,
        weightKg: profile.weightKg
          ? Number(profile.weightKg)
          : null,
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

      // Female-only menstrual update
      if (profile.gender === "female") {
        payload.menstrualProfile = {};

        if (profile.cycleLengthDays)
          payload.menstrualProfile.cycleLengthDays = Number(
            profile.cycleLengthDays
          );

        if (profile.lastPeriodDate)
          payload.menstrualProfile.lastPeriodDate = new Date(
            profile.lastPeriodDate
          );

        if (profile.menstrualPhase)
          payload.menstrualProfile.phase = profile.menstrualPhase;
      }

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
      {/* Header */}
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
              {calculateAge(profile.dateOfBirth)}
            </p>
          </div>
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-slate-400 text-xs">Weight (kg)</p>
            <p className="text-lg font-semibold text-slate-50">
              {profile.weightKg || "--"}
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">
          Update your profile
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

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
              type="date"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.dateOfBirth}
              onChange={(e) =>
                handleChange("dateOfBirth", e.target.value)
              }
            />
          </div>

          {/* Female-only menstrual */}
          {profile.gender === "female" && (
            <div className="border border-slate-800 rounded-xl p-3 space-y-3">
              <p className="text-xs text-slate-400 font-medium">
                Menstrual cycle
              </p>

              <input
                type="number"
                placeholder="Cycle length (days)"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={profile.cycleLengthDays}
                onChange={(e) =>
                  handleChange("cycleLengthDays", e.target.value)
                }
              />

              <input
                type="date"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={profile.lastPeriodDate}
                onChange={(e) =>
                  handleChange("lastPeriodDate", e.target.value)
                }
              />

              <select
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={profile.menstrualPhase}
                onChange={(e) =>
                  handleChange("menstrualPhase", e.target.value)
                }
              >
                <option value="">Cycle phase</option>
                <option value="follicular">Follicular</option>
                <option value="ovulatory">Ovulatory</option>
                <option value="luteal">Luteal</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Height (cm)"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.heightCm}
              onChange={(e) =>
                handleChange("heightCm", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              value={profile.weightKg}
              onChange={(e) =>
                handleChange("weightKg", e.target.value)
              }
            />
          </div>

          <select
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            value={profile.dietType}
            onChange={(e) =>
              handleChange("dietType", e.target.value)
            }
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
            value={profile.goal}
            onChange={(e) => handleChange("goal", e.target.value)}
          />

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
            className="rounded-xl bg-primary text-slate-950 font-semibold py-2.5 px-6 text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
