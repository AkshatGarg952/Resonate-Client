import React from "react";

export default function BiomarkerRing({ name, value, status }) {
  const isGood = status?.toLowerCase() === "good";

  return (
    <div className="flex flex-col items-center bg-slate-900/60 border border-slate-800 rounded-2xl p-4 gap-2">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
          isGood ? "border-emerald-500" : "border-red-500"
        }`}
      >
        <span className="text-lg font-semibold">
          {value !== undefined ? value : "--"}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-100">{name}</p>
      <p
        className={`text-xs px-2 py-1 rounded-full ${
          isGood
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-red-500/15 text-red-400"
        }`}
      >
        {isGood ? "Good" : "Bad"}
      </p>
    </div>
  );
}
