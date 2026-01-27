import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../App";
import { getWithCookie, putWithCookie } from "../api";
import WeeklyTrends from "../components/WeeklyTrends";
import DailyCheckInModal from "../components/DailyCheckInModal";

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
    cycleLengthDays: "",
    lastPeriodDate: "",
    menstrualPhase: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [refreshTrends, setRefreshTrends] = useState(0); // Trigger to refresh WeeklyTrends
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

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

  const calculateBMI = () => {
    if (!profile.heightCm || !profile.weightKg) return null;
    const heightM = profile.heightCm / 100;
    const bmi = (profile.weightKg / (heightM * heightM)).toFixed(1);
    return bmi;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return { label: "--", color: "slate" };
    if (bmi < 18.5) return { label: "Underweight", color: "blue" };
    if (bmi < 25) return { label: "Normal", color: "emerald" };
    if (bmi < 30) return { label: "Overweight", color: "amber" };
    return { label: "Obese", color: "red" };
  };

  const loadProfile = async () => {
    try {
      const data = await getWithCookie("/user/profile");
      const u = data.user;

      setProfile({
        email: u.email || user?.email || "",
        name: u.name ?? "",
        gender: u.gender ?? "",
        dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Pull-to-refresh implementation
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;
      if (pullDistance > 100 && !refreshing) {
        handleRefresh();
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

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
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        heightCm: profile.heightCm ? Number(profile.heightCm) : null,
        weightKg: profile.weightKg ? Number(profile.weightKg) : null,
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

      if (profile.gender === "female") {
        payload.menstrualProfile = {};
        if (profile.cycleLengthDays)
          payload.menstrualProfile.cycleLengthDays = Number(profile.cycleLengthDays);
        if (profile.lastPeriodDate)
          payload.menstrualProfile.lastPeriodDate = new Date(profile.lastPeriodDate);
        if (profile.menstrualPhase)
          payload.menstrualProfile.phase = profile.menstrualPhase;
      }

      await putWithCookie("/user/profile", payload);
      setMessage("Profile updated successfully ✓");
      setEditMode(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                      flex items-center justify-center mb-4 animate-pulse">
          <span className="text-3xl font-black text-primary">R</span>
        </div>
        <p className="text-slate-400 text-sm">Loading your profile...</p>
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(bmi);

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24"
    >

      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 backdrop-blur-sm 
                      border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium text-slate-300">Refreshing...</span>
        </div>
      )}

      {/* Header Section */}
      <section className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">Welcome back,</p>
            <h1 className="text-3xl font-black text-slate-50 mb-1">
              {profile.name || "User"}
            </h1>
            <p className="text-sm text-slate-400">
              {profile.email}
            </p>
          </div>

          {/* Profile Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 
                        flex items-center justify-center text-2xl font-black text-slate-950 shadow-lg">
            {(profile.name || "U").charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Age Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                        rounded-3xl border border-slate-700/50 p-5 group hover:border-primary/30 
                        transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-1">Age</p>
            <p className="text-3xl font-black text-slate-50">
              {calculateAge(profile.dateOfBirth)}
              {calculateAge(profile.dateOfBirth) !== "--" && (
                <span className="text-sm font-normal text-slate-500 ml-1">yrs</span>
              )}
            </p>
          </div>

          {/* Weight Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                        rounded-3xl border border-slate-700/50 p-5 group hover:border-emerald-500/30 
                        transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-1">Weight</p>
            <p className="text-3xl font-black text-slate-50">
              {profile.weightKg || "--"}
              {profile.weightKg && (
                <span className="text-sm font-normal text-slate-500 ml-1">kg</span>
              )}
            </p>
          </div>

          {/* BMI Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                        rounded-3xl border border-slate-700/50 p-5 group hover:border-purple-500/30 
                        transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-1">BMI</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-slate-50">
                {bmi || "--"}
              </p>
              {bmi && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${bmiInfo.color}-500/10 text-${bmiInfo.color}-400`}>
                  {bmiInfo.label}
                </span>
              )}
            </div>
          </div>

          {/* Height Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                        rounded-3xl border border-slate-700/50 p-5 group hover:border-amber-500/30 
                        transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-1">Height</p>
            <p className="text-3xl font-black text-slate-50">
              {profile.heightCm || "--"}
              {profile.heightCm && (
                <span className="text-sm font-normal text-slate-500 ml-1">cm</span>
              )}
            </p>
          </div>
        </div>

        {/* Weekly Trends Component */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-lg font-bold text-slate-200">Weekly Health Trends</h3>
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="text-sm font-semibold text-primary hover:text-white transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20"
            >
              + Log Today
            </button>
          </div>
          <WeeklyTrends key={refreshTrends} />
        </div>

        {/* Goal Banner */}
        {profile.goal && (
          <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 
                        rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary mb-1">Current Goal</p>
                <p className="text-sm text-slate-300 leading-relaxed">{profile.goal}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Edit Profile Section */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-50">Profile Details</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200
                     active:scale-95 ${editMode
                ? 'bg-slate-800 border-2 border-slate-700 text-slate-300'
                : 'bg-primary/10 border-2 border-primary/20 text-primary'
              }`}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editMode ? (
          /* Edit Form */
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
            <form onSubmit={handleSave} className="space-y-4">

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  className={`w-full rounded-2xl bg-slate-950/50 border-2 px-4 py-3.5 text-base text-slate-50
                            placeholder:text-slate-600 transition-all duration-200 focus:outline-none
                            ${focusedField === 'name'
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Gender</label>
                  <select
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                             text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                             transition-all duration-200"
                    value={profile.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Birth Date</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                             text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                             transition-all duration-200"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>

              {/* Menstrual Profile (Female Only) */}
              {profile.gender === "female" && (
                <div className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/20 
                              rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-bold text-slate-300">Menstrual Cycle Tracking</p>
                  </div>

                  <input
                    type="number"
                    placeholder="Cycle length (days)"
                    min="21"
                    max="35"
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                             text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                             focus:border-primary focus:outline-none transition-all duration-200"
                    value={profile.cycleLengthDays}
                    onChange={(e) => handleChange("cycleLengthDays", e.target.value)}
                  />

                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                             text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                             transition-all duration-200"
                    value={profile.lastPeriodDate}
                    onChange={(e) => handleChange("lastPeriodDate", e.target.value)}
                  />

                  <select
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                             text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                             transition-all duration-200"
                    value={profile.menstrualPhase}
                    onChange={(e) => handleChange("menstrualPhase", e.target.value)}
                  >
                    <option value="">Current phase</option>
                    <option value="follicular">Follicular</option>
                    <option value="ovulatory">Ovulatory</option>
                    <option value="luteal">Luteal</option>
                  </select>
                </div>
              )}

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Height</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Height"
                      min="100"
                      max="250"
                      className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 
                               text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                               focus:border-emerald-500 focus:outline-none transition-all duration-200"
                      value={profile.heightCm}
                      onChange={(e) => handleChange("heightCm", e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">cm</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Weight"
                      min="30"
                      max="200"
                      className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 
                               text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                               focus:border-emerald-500 focus:outline-none transition-all duration-200"
                      value={profile.weightKg}
                      onChange={(e) => handleChange("weightKg", e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">kg</span>
                  </div>
                </div>
              </div>

              {/* Diet Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Diet Preference</label>
                <select
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                           text-base text-slate-50 hover:border-slate-600 focus:border-emerald-500 
                           focus:outline-none transition-all duration-200"
                  value={profile.dietType}
                  onChange={(e) => handleChange("dietType", e.target.value)}
                >
                  <option value="">Select diet type</option>
                  <option value="vegetarian">🥗 Vegetarian</option>
                  <option value="eggetarian">🥚 Eggetarian</option>
                  <option value="non_vegetarian">🍗 Non-Vegetarian</option>
                </select>
              </div>

              {/* Fitness Goal */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Fitness Goal</label>
                <textarea
                  placeholder="e.g., Lose 5kg in 3 months, Build muscle mass"
                  rows="3"
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                           text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                           focus:border-primary focus:outline-none transition-all duration-200 resize-none"
                  value={profile.goal}
                  onChange={(e) => handleChange("goal", e.target.value)}
                />
              </div>

              {/* Medical Condition Toggle */}
              <div className="bg-slate-950/50 border-2 border-slate-700/50 rounded-2xl p-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-6 rounded-full transition-all duration-300 ${profile.hasMedicalCondition ? 'bg-primary' : 'bg-slate-700'
                      }`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all duration-300 ${profile.hasMedicalCondition ? 'ml-5' : 'ml-0.5'
                        }`}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                      I have medical conditions
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={profile.hasMedicalCondition}
                    onChange={(e) => handleChange("hasMedicalCondition", e.target.checked)}
                  />
                </label>
              </div>

              {profile.hasMedicalCondition && (
                <textarea
                  placeholder="List your medical conditions (e.g., diabetes, thyroid, hypertension)"
                  rows="3"
                  className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                           text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                           focus:border-red-400 focus:outline-none transition-all duration-200 resize-none"
                  value={profile.medicalConditions}
                  onChange={(e) => handleChange("medicalConditions", e.target.value)}
                />
              )}

              {/* Success/Error Message */}
              {message && (
                <div className={`flex items-start gap-3 text-sm rounded-2xl px-4 py-3 border ${message.includes('successfully')
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    {message.includes('successfully') ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="leading-relaxed">{message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full relative py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                         text-slate-950 font-bold overflow-hidden shadow-lg shadow-primary/25
                         hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-all duration-200 group"
              >
                {!saving && (
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                )}

                <span className="relative flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </span>
              </button>

            </form>
          </div>
        ) : (
          /* View Mode - Info Cards */
          <div className="space-y-3">
            {/* Personal Info Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-400 mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">Gender</span>
                  <span className="text-sm font-semibold text-slate-50 capitalize">
                    {profile.gender || "Not set"}
                  </span>
                </div>
                <div className="h-px bg-slate-800"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">Date of Birth</span>
                  <span className="text-sm font-semibold text-slate-50">
                    {profile.dateOfBirth || "Not set"}
                  </span>
                </div>
                <div className="h-px bg-slate-800"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">Diet Type</span>
                  <span className="text-sm font-semibold text-slate-50 capitalize">
                    {profile.dietType?.replace('_', ' ') || "Not set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical Info Card */}
            {profile.hasMedicalCondition && profile.medicalConditions && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-sm font-bold text-red-400">Medical Conditions</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{profile.medicalConditions}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Floating Action Button - Quick Edit */}
      {!editMode && (
        <button
          onClick={() => setEditMode(true)}
          className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-emerald-500 
                   text-slate-950 shadow-2xl shadow-primary/30 flex items-center justify-center
                   hover:scale-110 active:scale-95 transition-all duration-200 z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onCheckInComplete={() => setRefreshTrends(prev => prev + 1)}
      />

    </div>
  );
}

