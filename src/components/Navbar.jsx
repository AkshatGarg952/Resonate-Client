import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path ? "text-primary" : "text-slate-200";

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">R</span>
          </div>
          <div>
            <p className="font-semibold text-slate-50">Resonate Fitness</p>
            <p className="text-xs text-slate-400">Your health companion</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-sm relative">
          {user && (
            <>
              <Link to="/dashboard" className={isActive("/dashboard")}>
                Dashboard
              </Link>

              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
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
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900 border border-slate-800 shadow-lg z-50">
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
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Latest Analysis
                    </Link>

                    <Link
                      to="/biomarkers/history"
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Analysis History
                    </Link>

                    
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
