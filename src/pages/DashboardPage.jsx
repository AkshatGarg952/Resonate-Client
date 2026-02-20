import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../App";
import { getWithCookie, putWithCookie } from "../api";
import WeeklyTrends from "../components/WeeklyTrends";
import DailyCheckInModal from "../components/DailyCheckInModal";

// Extracted UI components
import ProfileHeader from "../components/ui/ProfileHeader";
import StatsGrid from "../components/ui/StatsGrid";
import GoalCard from "../components/ui/GoalCard";
import ProfileDisplay from "../components/ui/ProfileDisplay";
import ProfileForm from "../components/ui/ProfileForm";

/**
 * Dashboard page - User profile management and stats.
 * Refactored from 724 lines to ~200 lines using subcomponents.
 */
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
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [refreshTrends, setRefreshTrends] = useState(0);

  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

  // --- Helper Functions ---

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
    return (profile.weightKg / (heightM * heightM)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return { label: "--", color: "slate" };
    if (bmi < 18.5) return { label: "Underweight", color: "blue" };
    if (bmi < 25) return { label: "Normal", color: "emerald" };
    if (bmi < 30) return { label: "Overweight", color: "amber" };
    return { label: "Obese", color: "red" };
  };

  // --- Data Loading ---

  const loadProfile = async () => {
    try {
      const data = await getWithCookie("/api/user/profile");
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

  // --- Pull to Refresh ---

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

  // --- Form Handlers ---

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
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
          ? profile.medicalConditions.split(",").map((c) => c.trim()).filter(Boolean)
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

      await putWithCookie("/api/user/profile", payload);
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

  // --- Loading State ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mb-4 animate-pulse">
          <span className="text-3xl font-black text-primary">R</span>
        </div>
        <p className="text-slate-400 text-sm">Loading your profile...</p>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24"
    >
      {/* Refresh Indicator */}
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

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 pt-20 lg:pt-24">
        {/* Profile Header */}
        <ProfileHeader name={profile.name} email={profile.email} />

        {/* Stats Grid */}
        <StatsGrid
          profile={profile}
          calculateAge={calculateAge}
          calculateBMI={calculateBMI}
          getBMICategory={getBMICategory}
        />

        {/* Goal Card */}
        <GoalCard goal={profile.goal} />

        {/* Weekly Trends */}
        <div className="mb-6">
          <WeeklyTrends compact refreshTrigger={refreshTrends} />
        </div>

        {/* Daily Check-in Button */}
        <button
          onClick={() => setIsCheckInOpen(true)}
          className="w-full relative py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                   text-slate-950 font-bold overflow-hidden mb-6 shadow-lg shadow-primary/25
                   hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 group"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                         translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
          <span className="relative flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Daily Check-in
          </span>
        </button>

        {/* Edit/Cancel Button */}
        <button
          onClick={() => setEditMode(!editMode)}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold mb-6 transition-all duration-200
                    active:scale-[0.98] ${editMode
              ? "bg-slate-800 border-2 border-slate-700 text-slate-300 hover:bg-slate-700"
              : "bg-slate-800/50 border-2 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
            }`}
        >
          {editMode ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Editing
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </span>
          )}
        </button>

        {/* Profile Form or Display */}
        {editMode ? (
          <ProfileForm
            profile={profile}
            onSave={handleSave}
            saving={saving}
            message={message}
            onChange={handleChange}
          />
        ) : (
          <ProfileDisplay profile={profile} />
        )}
      </div>

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onCheckInComplete={() => setRefreshTrends((prev) => prev + 1)}
      />
    </div>
  );
}
