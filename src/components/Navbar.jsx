// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function Navbar({ user, onLogout }) {
//   const location = useLocation();

//   const [open, setOpen] = useState(false); 
//   const [fitnessOpen, setFitnessOpen] = useState(false);

//   const isActive = (path) =>
//     location.pathname === path ? "text-primary" : "text-slate-200";


//   const connectGoogleFit = () => {
//   try {
//     setFitnessOpen(false);
//     window.location.href = `${BASE_URL}/fit/google`;
//   } catch (err) {
//     console.error("Google Fit connection failed", err);
//   }
// };


//   return (
//     <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
//       <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        
//         <Link to="/" className="flex items-center gap-2">
//           <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
//             <span className="text-primary font-bold text-lg">R</span>
//           </div>
//           <div>
//             <p className="font-semibold text-slate-50">Resonate Fitness</p>
//             <p className="text-xs text-slate-400">Your health companion</p>
//           </div>
//         </Link>

//         <div className="flex items-center gap-4 text-sm relative">
//           {user && (
//             <>
//               <Link to="/dashboard" className={isActive("/dashboard")}>
//                 Dashboard
//               </Link>

             
//               <Link to="/profile" className={isActive("/profile")}>
//                 My Profile
//               </Link>

              
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setOpen(!open);
//                     setFitnessOpen(false);
//                   }}
//                   className={`flex items-center gap-1 ${
//                     location.pathname.includes("/biomarkers")
//                       ? "text-primary"
//                       : "text-slate-200"
//                   }`}
//                 >
//                   Blood Diagnostics
//                   <span className="text-xs">▾</span>
//                 </button>

//                 {open && (
//                   <div className="absolute right-0 mt-2 w-52 rounded-lg bg-slate-900 border border-slate-800 shadow-lg z-50">
//                     <Link
//                       to="/biomarkers/upload"
//                       onClick={() => setOpen(false)}
//                       className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
//                     >
//                       Upload Report PDF
//                     </Link>

//                     <Link
//                       to="/biomarkers/api"
//                       onClick={() => setOpen(false)}
//                       className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
//                     >
//                       Fetch from API
//                     </Link>

//                     <div className="my-1 border-t border-slate-800" />

//                     <Link
//                       to="/biomarkers/latest"
//                       onClick={() => setOpen(false)}
//                       className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
//                     >
//                       Latest Analysis
//                     </Link>

//                     <Link
//                       to="/biomarkers/history"
//                       onClick={() => setOpen(false)}
//                       className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
//                     >
//                       Analysis History
//                     </Link>
//                   </div>
//                 )}
//               </div>

            
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setFitnessOpen(!fitnessOpen);
//                     setOpen(false);
//                   }}
//                   className="flex items-center gap-1 text-slate-200"
//                 >
//                   Fitness Sync
//                   <span className="text-xs">▾</span>
//                 </button>

//                 {fitnessOpen && (
//                   <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 border border-slate-800 shadow-lg z-50">
//                     <button
//                       onClick={connectGoogleFit}
//                       className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
//                     >
//                       Connect Google Fit
//                     </button>

//                     <button
//                       disabled
//                       className="w-full text-left px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
//                     >
//                       Connect Apple Health (iOS only)
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}

//           {!user ? (
//             <>
//               <Link
//                 to="/login"
//                 className="px-3 py-1 rounded-full border border-slate-700 hover:border-primary text-xs sm:text-sm"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="px-3 py-1 rounded-full bg-primary text-slate-950 text-xs sm:text-sm font-semibold hover:bg-emerald-500"
//               >
//                 Register
//               </Link>
//             </>
//           ) : (
//             <button
//               onClick={onLogout}
//               className="px-3 py-1 rounded-full border border-red-500/70 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm"
//             >
//               Logout
//             </button>
//           )}
//         </div>
//       </nav>
//     </header>
//   );
// }


import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [biomarkersOpen, setBiomarkersOpen] = useState(false);
  const [fitnessOpen, setFitnessOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setBiomarkersOpen(false);
    setFitnessOpen(false);
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

  const connectGoogleFit = () => {
    try {
      setFitnessOpen(false);
      setMobileMenuOpen(false);
      window.location.href = `${BASE_URL}/fit/google`;
    } catch (err) {
      console.error("Google Fit connection failed", err);
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  // Bottom nav items for mobile
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
      path: "/fitness",
      label: "Fitness",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      path: "/biomarkers/latest",
      label: "Reports",
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
      {/* Top Header - Desktop & Mobile */}
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
          <div className="hidden lg:flex items-center gap-6 text-sm">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`font-medium transition-colors ${
                    isActive("/dashboard") ? "text-primary" : "text-slate-300 hover:text-slate-50"
                  }`}
                >
                  Dashboard
                </Link>

                <Link 
                  to="/profile" 
                  className={`font-medium transition-colors ${
                    isActive("/profile") ? "text-primary" : "text-slate-300 hover:text-slate-50"
                  }`}
                >
                  Profile
                </Link>

                {/* Biomarkers Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setBiomarkersOpen(!biomarkersOpen);
                      setFitnessOpen(false);
                    }}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      isActiveGroup(["/biomarkers"]) ? "text-primary" : "text-slate-300 hover:text-slate-50"
                    }`}
                  >
                    Blood Reports
                    <svg className={`w-4 h-4 transition-transform ${biomarkersOpen ? 'rotate-180' : ''}`} 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {biomarkersOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setBiomarkersOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 
                                    shadow-xl overflow-hidden z-20">
                        <div className="p-2 space-y-1">
                          <Link
                            to="/biomarkers/upload"
                            className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            📤 Upload Report PDF
                          </Link>
                          <Link
                            to="/biomarkers/api"
                            className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            🔗 Fetch from Lab API
                          </Link>
                          <div className="my-1 border-t border-slate-800"></div>
                          <Link
                            to="/biomarkers/latest"
                            className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            📊 Latest Analysis
                          </Link>
                          <Link
                            to="/biomarkers/history"
                            className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            📂 Analysis History
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Fitness Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setFitnessOpen(!fitnessOpen);
                      setBiomarkersOpen(false);
                    }}
                    className="flex items-center gap-1.5 font-medium text-slate-300 hover:text-slate-50 transition-colors"
                  >
                    Fitness Sync
                    <svg className={`w-4 h-4 transition-transform ${fitnessOpen ? 'rotate-180' : ''}`} 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {fitnessOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setFitnessOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 
                                    shadow-xl overflow-hidden z-20">
                        <div className="p-2 space-y-1">
                          <button
                            onClick={connectGoogleFit}
                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 
                                     rounded-xl transition-colors flex items-center gap-2"
                          >
                            <span className="text-lg">🏃</span>
                            Connect Google Fit
                          </button>
                          <button
                            disabled
                            className="w-full text-left px-3 py-2 text-sm text-slate-600 cursor-not-allowed 
                                     rounded-xl flex items-center gap-2"
                          >
                            <span className="text-lg">🍎</span>
                            Apple Health (iOS only)
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 font-semibold
                           hover:bg-red-500/10 active:scale-95 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold
                           hover:border-slate-600 hover:bg-slate-800 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 
                           text-slate-950 font-bold hover:shadow-lg hover:shadow-primary/25 
                           active:scale-95 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 
                     flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 
                        border-l border-slate-800 shadow-2xl animate-slideLeft">
            
            {/* Menu Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                              flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-black text-xl">R</span>
                </div>
                <div>
                  <p className="font-bold text-slate-50">Menu</p>
                  <p className="text-xs text-slate-500">Navigate</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-800/50 flex items-center justify-center
                         hover:bg-slate-800 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div className="overflow-y-auto h-[calc(100vh-5rem)] p-4 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
                      isActive("/dashboard")
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
                      isActive("/profile")
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>

                  {/* Blood Reports Section */}
                  <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">
                      Blood Reports
                    </p>
                    <div className="space-y-1">
                      <Link
                        to="/biomarkers/upload"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <span className="text-base">📤</span>
                        Upload Report PDF
                      </Link>
                      <Link
                        to="/biomarkers/api"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <span className="text-base">🔗</span>
                        Fetch from Lab API
                      </Link>
                      <Link
                        to="/biomarkers/latest"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <span className="text-base">📊</span>
                        Latest Analysis
                      </Link>
                      <Link
                        to="/biomarkers/history"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <span className="text-base">📂</span>
                        Analysis History
                      </Link>
                    </div>
                  </div>

                  {/* Fitness Sync Section */}
                  <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">
                      Fitness Sync
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={connectGoogleFit}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <span className="text-base">🏃</span>
                        Connect Google Fit
                      </button>
                      <button
                        disabled
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 cursor-not-allowed"
                      >
                        <span className="text-base">🍎</span>
                        Apple Health (iOS only)
                      </button>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="pt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 
                               border border-red-500/20 text-red-400 font-semibold 
                               hover:bg-red-500/20 active:scale-95 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-slate-700 
                             text-slate-300 font-bold hover:bg-slate-800 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl 
                             bg-gradient-to-r from-primary to-emerald-500 text-slate-950 font-bold 
                             hover:shadow-lg hover:shadow-primary/25 transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Mobile Only (when logged in) */}
      {user && (
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
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl min-w-[4rem] transition-all ${
                    active
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
      )}

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
