import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-4rem)]">
      <div className="max-w-xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-50 mb-4">
          Track your health. <span className="text-primary">Resonate</span> with
          fitness.
        </h1>
        <p className="text-slate-400 mb-8">
          Manage your profile, monitor key blood biomarkers, and keep your goals
          aligned — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link
            to="/login"
            className="flex-1 px-6 py-3 rounded-2xl bg-primary text-slate-950 font-semibold hover:bg-emerald-500"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 px-6 py-3 rounded-2xl border border-accent text-accent font-semibold hover:bg-accent/10"
          >
            Register
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left text-sm text-slate-300">
          <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4">
            <p className="font-semibold mb-1">Smart Profile</p>
            <p>Keep your age, weight, and goal updated in your fitness dashboard.</p>
          </div>
          <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4">
            <p className="font-semibold mb-1">Blood Biomarkers</p>
            <p>Upload your blood report PDF and see how your biomarkers look.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
