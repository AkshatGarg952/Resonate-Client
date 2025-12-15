import React from "react";

export default function BiomarkerRing({ name, value, status }) {
  const isUndetermined = value == null || status == null;
  const isGood = status?.toLowerCase() === "good";

  const ringColor = isUndetermined
    ? "border-slate-500"
    : isGood
    ? "border-emerald-500"
    : "border-red-500";

  const badgeStyle = isUndetermined
    ? "bg-slate-500/15 text-slate-400"
    : isGood
    ? "bg-emerald-500/15 text-emerald-400"
    : "bg-red-500/15 text-red-400";

  const label = isUndetermined
    ? "Cannot be determined"
    : isGood
    ? "Good"
    : "Bad";

  return (
    <div className="flex flex-col items-center bg-slate-900/60 border border-slate-800 rounded-2xl p-4 gap-2">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${ringColor}`}
      >
        <span className="text-lg font-semibold text-slate-100">
          {isUndetermined ? "--" : value}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-100">{name}</p>

      <p className={`text-xs px-2 py-1 rounded-full ${badgeStyle}`}>
        {label}
      </p>
    </div>
  );
}
