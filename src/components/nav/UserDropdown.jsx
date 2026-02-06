import React from "react";
import { Link } from "react-router-dom";

/**
 * User dropdown menu with profile options and logout.
 */
export default function UserDropdown({ user, isOpen, onToggle, onClose, onConnectGoogleFit, onLogout }) {
    const getInitials = () => {
        if (!user?.displayName) return "U";
        return user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center gap-3 focus:outline-none"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
                    {getInitials()}
                </div>
                <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium text-slate-200 leading-none">{user.displayName || "User"}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Free Plan</p>
                </div>
                <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={onClose}></div>
                    <div className="absolute right-0 mt-4 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                            <p className="text-sm font-medium text-white">{user.displayName || "User"}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <span>👤</span> My Profile
                            </Link>
                            <button
                                onClick={onConnectGoogleFit}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors text-left"
                            >
                                <span>🏃</span> Sync Fitness
                            </button>
                            <div className="border-t border-slate-800 my-1"></div>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                            >
                                <span>🚪</span> Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
