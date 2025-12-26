import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const [open, setOpen] = useState(false); // Blood diagnostics dropdown
  const [fitnessOpen, setFitnessOpen] = useState(false); // Fitness sync dropdown

  const isActive = (path) =>
    location.pathname === path ? "text-primary" : "text-slate-200";


  const connectGoogleFit = () => {
  try {
    setFitnessOpen(false);

    // OAuth must use full browser redirect
    window.location.href = `${BASE_URL}/fit/google`;
  } catch (err) {
    console.error("Google Fit connection failed", err);
  }
};


  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">R</span>
          </div>
          <div>
            <p className="font-semibold text-slate-50">Resonate Fitness</p>
            <p className="text-xs text-slate-400">Your health companion</p>
          </div>
        </Link>

        {/* Right Menu */}
        <div className="flex items-center gap-4 text-sm relative">
          {user && (
            <>
              {/* Dashboard */}
              <Link to="/dashboard" className={isActive("/dashboard")}>
                Dashboard
              </Link>

              {/* Profile */}
              <Link to="/profile" className={isActive("/profile")}>
                My Profile
              </Link>

              {/* Blood Diagnostics */}
              <div className="relative">
                <button
                  onClick={() => {
                    setOpen(!open);
                    setFitnessOpen(false);
                  }}
                  className={`flex items-center gap-1 ${
                    location.pathname.includes("/biomarkers")
                      ? "text-primary"
                      : "text-slate-200"
                  }`}
                >
                  Blood Diagnostics
                  <span className="text-xs">▾</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg bg-slate-900 border border-slate-800 shadow-lg z-50">
                    <Link
                      to="/biomarkers/upload"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Upload Report PDF
                    </Link>

                    <Link
                      to="/biomarkers/api"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Fetch from API
                    </Link>

                    <div className="my-1 border-t border-slate-800" />

                    <Link
                      to="/biomarkers/latest"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Latest Analysis
                    </Link>

                    <Link
                      to="/biomarkers/history"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Analysis History
                    </Link>
                  </div>
                )}
              </div>

              {/* Fitness Sync */}
              <div className="relative">
                <button
                  onClick={() => {
                    setFitnessOpen(!fitnessOpen);
                    setOpen(false);
                  }}
                  className="flex items-center gap-1 text-slate-200"
                >
                  Fitness Sync
                  <span className="text-xs">▾</span>
                </button>

                {fitnessOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 border border-slate-800 shadow-lg z-50">
                    <button
                      onClick={connectGoogleFit}
                      className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Connect Google Fit
                    </button>

                    <button
                      disabled
                      className="w-full text-left px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
                    >
                      Connect Apple Health (iOS only)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-primary text-xs sm:text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 rounded-full bg-primary text-slate-950 text-xs sm:text-sm font-semibold hover:bg-emerald-500"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="px-3 py-1 rounded-full border border-red-500/70 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
