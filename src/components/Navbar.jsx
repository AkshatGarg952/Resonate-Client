import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [biomarkersOpen, setBiomarkersOpen] = useState(false);
  const [workoutsOpen, setWorkoutsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setBiomarkersOpen(false);
    setWorkoutsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;
  const isActiveGroup = (paths) => paths.some(path => location.pathname.includes(path));

  const connectGoogleFit = async () => {
    try {
      setUserMenuOpen(false);

      // Fetch the OAuth URL from the server (sends cookies)
      const response = await fetch(`${BASE_URL}/fit/google`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get Google Fit URL');
      }

      const { url } = await response.json();

      // Now navigate to the OAuth URL
      window.location.href = url;
    } catch (err) {
      console.error("Google Fit connection failed", err);
      alert("Failed to connect to Google Fit. Please try again.");
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.displayName) return "U";
    return user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const bottomNavItems = user ? [
    {
      path: "/dashboard",
      label: "Home",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: "/workouts",
      label: "Workouts",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      path: "/nutrition",
      label: "Food",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      path: "/biomarkers/latest",
      label: "Diagnosis",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: "/profile",
      label: "Profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ] : [];

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-lg">
        <nav className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                          flex items-center justify-center border border-primary/20 
                          group-hover:scale-110 transition-transform">
              <span className="text-primary font-black text-xl">R</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-slate-50 text-base">Resonate</p>
              <p className="text-xs text-slate-500">Health Companion</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 text-sm">
            {user ? (
              <>
                {/* 1. Main Navigation */}
                <Link
                  to="/dashboard"
                  className={`font-medium transition-colors flex items-center gap-2 ${isActive("/dashboard") ? "text-primary" : "text-slate-300 hover:text-slate-50"
                    }`}
                >
                  Dashboard
                </Link>

                {/* Workouts Dropdown */}
                <div className="relative group">
                  <button className={`flex items-center gap-1.5 font-medium transition-colors ${isActiveGroup(["/workout", "/workouts"]) ? "text-primary" : "text-slate-300 hover:text-slate-50"
                    }`}
                  >
                    Workouts
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="absolute left-0 mt-4 w-48 rounded-2xl bg-slate-900 border border-slate-800 
                                shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-20 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-2 space-y-1">
                      <Link to="/workout-generator" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                        ⚡ Generator
                      </Link>
                      <Link to="/workouts" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                        📜 History
                      </Link>
                    </div>
                  </div>
                </div>



                {/* Nutrition Link */}
                <Link
                  to="/nutrition"
                  className={`font-medium transition-colors flex items-center gap-2 ${isActive("/nutrition") ? "text-primary" : "text-slate-300 hover:text-slate-50"
                    }`}
                >
                  Nutrition
                </Link>

                {/* Blood Reports Dropdown */}
                <div className="relative group">
                  <button className={`flex items-center gap-1.5 font-medium transition-colors ${isActiveGroup(["/biomarkers", "/demo-report"]) ? "text-primary" : "text-slate-300 hover:text-slate-50"
                    }`}
                  >
                    Diagnosis
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="absolute left-0 mt-4 w-56 rounded-2xl bg-slate-900 border border-slate-800 
                                shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-20 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-2 space-y-1">
                      <Link to="/biomarkers/latest" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                        📊 Latest Diagnosis
                      </Link>
                      <Link to="/biomarkers/history" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                        📂 Diagnosis History
                      </Link>
                      <div className="border-t border-slate-800 my-1"></div>
                      <Link to="/biomarkers/upload" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                        📤 Upload PDF
                      </Link>
                      <Link to="/biomarkers/api" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                        🔗 Fetch via API
                      </Link>
                      <div className="border-t border-slate-800 my-1"></div>
                      <Link to="/demo-report" className="block px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors">
                        🧪 View Demo Report
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to="/get-coach"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 
                           border border-primary/30 text-primary font-semibold text-xs uppercase tracking-wide
                           hover:from-primary/20 hover:to-emerald-500/20 hover:border-primary/50 
                           active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="text-base">🏋️</span>
                  Coach
                </Link>

                {/* Separator */}
                <div className="h-6 w-px bg-slate-800 mx-2"></div>

                {/* 2. User Menu Dropdown (Avatar) */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
                      {getInitials()}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-medium text-slate-200 leading-none">{user.displayName || "User"}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Free Plan</p>
                    </div>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-4 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                          <p className="text-sm font-medium text-white">{user.displayName || "User"}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                            <span>👤</span> My Profile
                          </Link>
                          <button onClick={connectGoogleFit} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors text-left">
                            <span>🏃</span> Sync Fitness
                          </button>
                          <div className="border-t border-slate-800 my-1"></div>
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left">
                            <span>🚪</span> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </>
            ) : (
              // Logged Out State
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl text-slate-300 font-medium hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 
                           transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 
                     flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all text-slate-300"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
      </header >

      {/* Spacer */}
      < div className="h-16" ></div >

      {/* Mobile Menu Overlay */}
      {
        mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 
                        border-l border-slate-800 shadow-2xl animate-slideLeft flex flex-col">

              {/* Menu Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {getInitials()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-50 truncate w-32">{user?.displayName || "Menu"}</p>
                    <p className="text-xs text-slate-500">{user?.email || "Guest"}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable Menu Items */}
              <div className="overflow-y-auto flex-1 p-4 space-y-6">
                {user ? (
                  <>
                    {/* Main Nav */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Navigation</p>
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/50 text-slate-200">
                        <span>🏠</span> Dashboard
                      </Link>
                    </div>

                    {/* Workouts */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Fitness</p>
                      <div className="bg-slate-800/30 rounded-2xl overflow-hidden">
                        <Link to="/workout-generator" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 border-b border-slate-800/50">
                          <span>⚡</span> Generator
                        </Link>
                        <Link to="/workouts" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 border-b border-slate-800/50">
                          <span>📜</span> History
                        </Link>
                        <Link to="/get-coach" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-emerald-400 font-medium">
                          <span>🏋️</span> Book Coach
                        </Link>
                      </div>
                    </div>



                    {/* Nutrition */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Diet</p>
                      <div className="bg-slate-800/30 rounded-2xl overflow-hidden">
                        <Link to="/nutrition" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 font-medium">
                          <span>🥗</span> Daily Plan
                        </Link>
                      </div>
                    </div>

                    {/* Reports */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Health Data</p>
                      <div className="bg-slate-800/30 rounded-2xl overflow-hidden">
                        <Link to="/biomarkers/latest" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 border-b border-slate-800/50">
                          <span>📊</span> Latest Report
                        </Link>
                        <Link to="/biomarkers/upload" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 border-b border-slate-800/50">
                          <span>📤</span> Upload New
                        </Link>
                        <Link to="/demo-report" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-purple-400">
                          <span>🧪</span> View Demo
                        </Link>
                      </div>
                    </div>

                  </>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" className="block w-full text-center py-3 rounded-xl border border-slate-700 text-slate-300 font-bold">Login</Link>
                    <Link to="/register" className="block w-full text-center py-3 rounded-xl bg-primary text-slate-950 font-bold">Register</Link>
                  </div>
                )}
              </div>

              {/* Bottom Account Section (Fixed) */}
              {user && (
                <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 space-y-2">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <span>👤</span> Profile Settings
                  </Link>
                  <button onClick={connectGoogleFit} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-left">
                    <span>🏃</span> Google Fit Sync
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-left">
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}

            </div>
          </div >
        )
      }

      {/* Bottom Navigation Bar - Mobile Only (when logged in) */}
      {
        user && (
          <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-slate-800 
                      bg-slate-950/95 backdrop-blur-lg">
            <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
              {bottomNavItems.map((item) => {
                const active = isActive(item.path) ||
                  (item.path === "/biomarkers/latest" && isActiveGroup(["/biomarkers"]));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl min-w-[4rem] transition-all ${active
                      ? "text-primary bg-primary/10"
                      : "text-slate-400 hover:text-slate-300"
                      }`}
                  >
                    <span className={`transition-transform ${active ? 'scale-110' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )
      }

      {/* Spacer for bottom nav on mobile */}
      {user && <div className="h-20 lg:hidden"></div>}

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideLeft {
          animation: slideLeft 0.3s ease-out;
        }

        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
