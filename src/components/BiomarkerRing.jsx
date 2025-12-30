// import React from "react";

// export default function BiomarkerRing({ name, value, status }) {
//   const isUndetermined = value == null || status == null;
//   const isGood = status?.toLowerCase() === "good";

//   const ringColor = isUndetermined
//     ? "border-slate-500"
//     : isGood
//     ? "border-emerald-500"
//     : "border-red-500";

//   const badgeStyle = isUndetermined
//     ? "bg-slate-500/15 text-slate-400"
//     : isGood
//     ? "bg-emerald-500/15 text-emerald-400"
//     : "bg-red-500/15 text-red-400";

//   const label = isUndetermined
//     ? "Cannot be determined"
//     : isGood
//     ? "Good"
//     : "Bad";

//   return (
//     <div className="flex flex-col items-center bg-slate-900/60 border border-slate-800 rounded-2xl p-4 gap-2">
//       <div
//         className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${ringColor}`}
//       >
//         <span className="text-lg font-semibold text-slate-100">
//           {isUndetermined ? "--" : value}
//         </span>
//       </div>

//       <p className="text-sm font-medium text-slate-100">{name}</p>

//       <p className={`text-xs px-2 py-1 rounded-full ${badgeStyle}`}>
//         {label}
//       </p>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";

export default function BiomarkerRing({ name, value, status, unit = "", normalRange = "" }) {
  const [showDetails, setShowDetails] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const isUndetermined = value == null || status == null;
  const isGood = status?.toLowerCase() === "good" || status?.toLowerCase() === "normal";
  const isBorderline = status?.toLowerCase() === "borderline" || status?.toLowerCase() === "warning";

  // Color configurations
  const getColors = () => {
    if (isUndetermined) {
      return {
        ring: "stroke-slate-500",
        bg: "stroke-slate-800",
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        gradient: "from-slate-500/10 to-slate-600/5",
        icon: "text-slate-500",
      };
    }
    if (isGood) {
      return {
        ring: "stroke-emerald-400",
        bg: "stroke-slate-800",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        gradient: "from-emerald-500/10 to-emerald-600/5",
        icon: "text-emerald-400",
      };
    }
    if (isBorderline) {
      return {
        ring: "stroke-amber-400",
        bg: "stroke-slate-800",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        gradient: "from-amber-500/10 to-amber-600/5",
        icon: "text-amber-400",
      };
    }
    return {
      ring: "stroke-red-400",
      bg: "stroke-slate-800",
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      gradient: "from-red-500/10 to-red-600/5",
      icon: "text-red-400",
    };
  };

  const colors = getColors();

  const getLabel = () => {
    if (isUndetermined) return "Unknown";
    if (isGood) return "Normal";
    if (isBorderline) return "Borderline";
    return "Needs Attention";
  };

  const getIcon = () => {
    if (isUndetermined) return "❓";
    if (isGood) return "✓";
    if (isBorderline) return "⚠️";
    return "⚠️";
  };

  // Calculate stroke dashoffset for animation (simulate 75% progress ring)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = isUndetermined ? 0 : 75; // Show 75% filled ring for visual appeal
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {/* Biomarker Card */}
      <div
        onClick={() => setShowDetails(true)}
        className={`relative flex flex-col items-center bg-gradient-to-br ${colors.gradient} 
                  backdrop-blur-sm border border-slate-700/50 rounded-3xl p-5 gap-3
                  hover:border-${isGood ? 'emerald' : 'red'}-500/30 
                  active:scale-[0.97] transition-all duration-300 cursor-pointer group`}
      >
        {/* Info Icon - Top Right */}
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-800/50 
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Animated Progress Ring */}
        <div className="relative w-24 h-24 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              strokeWidth="6"
              fill="transparent"
              className={colors.bg}
            />
            {/* Progress circle with animation */}
            {!isUndetermined && (
              <circle
                cx="48"
                cy="48"
                r={radius}
                strokeWidth="6"
                fill="transparent"
                className={`${colors.ring} transition-all duration-1000 ease-out`}
                strokeDasharray={circumference}
                strokeDashoffset={animated ? strokeDashoffset : circumference}
                strokeLinecap="round"
              />
            )}
          </svg>
          
          {/* Center Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-slate-50">
              {isUndetermined ? "--" : value}
            </span>
            {unit && !isUndetermined && (
              <span className="text-xs text-slate-500 font-medium">{unit}</span>
            )}
          </div>
        </div>

        {/* Biomarker Name */}
        <div className="text-center">
          <p className="text-sm font-bold text-slate-50 mb-1 leading-tight">{name}</p>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full 
                          border font-semibold ${colors.badge}`}>
            <span>{getIcon()}</span>
            {getLabel()}
          </span>
        </div>

        {/* Tap hint */}
        <div className="text-xs text-slate-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Tap for details
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center 
                   justify-center p-0 sm:p-5 animate-fadeIn"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl 
                     w-full sm:max-w-md max-h-[80vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 
                          px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-black text-slate-50">{name}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 
                         flex items-center justify-center active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              
              {/* Large Status Card */}
              <div className={`bg-gradient-to-br ${colors.gradient} border border-slate-700/50 
                            rounded-2xl p-6 text-center`}>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" strokeWidth="8" fill="transparent" className={colors.bg} />
                    {!isUndetermined && (
                      <circle
                        cx="64" cy="64" r="56" strokeWidth="8" fill="transparent"
                        className={colors.ring}
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={2 * Math.PI * 56 * (1 - progress / 100)}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-50">
                      {isUndetermined ? "--" : value}
                    </span>
                    {unit && !isUndetermined && (
                      <span className="text-sm text-slate-500 font-medium">{unit}</span>
                    )}
                  </div>
                </div>
                
                <span className={`inline-flex items-center gap-2 text-base px-4 py-2 rounded-full 
                                border font-bold ${colors.badge}`}>
                  <span className="text-xl">{getIcon()}</span>
                  {getLabel()}
                </span>
              </div>

              {/* Normal Range Info */}
              {normalRange && (
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-400 mb-1">Normal Range</p>
                      <p className="text-sm font-bold text-slate-50">{normalRange}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* What This Means */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">What This Means</h4>
                <div className={`bg-${isGood ? 'emerald' : 'red'}-500/5 border border-${isGood ? 'emerald' : 'red'}-500/20 
                              rounded-2xl p-4`}>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isUndetermined ? (
                      "This biomarker value could not be determined from your report. Please ensure the PDF is clear and contains all relevant data."
                    ) : isGood ? (
                      `Your ${name} level is within the normal range. Keep maintaining your healthy lifestyle!`
                    ) : (
                      `Your ${name} level is outside the normal range. Consider consulting with your healthcare provider for personalized advice.`
                    )}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              {!isGood && !isUndetermined && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-300">Recommendations</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Consult with your healthcare provider</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Monitor this biomarker regularly</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Consider lifestyle modifications</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-700 
                         text-slate-300 font-semibold hover:bg-slate-700 active:scale-95 transition-all"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

