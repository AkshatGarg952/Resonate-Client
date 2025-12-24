import React, { useState } from "react";
import { postWithCookie } from "../api";
import BiomarkerRing from "../components/BiomarkerRing";

export default function BiomarkerFetchFromApiPage() {
  const [loading, setLoading] = useState(false);
  const [biomarkers, setBiomarkers] = useState([]);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await postWithCookie(
        "/diagnostics/fetch-from-api",
        {}
      );

      const biomarkersArr = Object.entries(
        data.diagnostics.biomarkers || {}
      ).map(([name, info]) => ({
        name,
        value: info.value,
        status: info.status,
      }));

      setBiomarkers(biomarkersArr);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from lab. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-2">
          Fetch blood report from lab
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Automatically fetch your blood test values from supported diagnostic labs.
          No PDF upload required.
        </p>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <button
          onClick={handleFetch}
          disabled={loading}
          className="rounded-xl bg-primary text-slate-950 font-semibold py-2.5 px-6 text-sm hover:bg-emerald-500 disabled:opacity-60"
        >
          {loading ? "Fetching..." : "Fetch from Lab API"}
        </button>
      </section>

      {biomarkers.length > 0 && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-50 mb-3">
            Your biomarkers
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Green ring = good | Red ring = needs attention
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {biomarkers.map((b, idx) => (
              <BiomarkerRing
                key={idx}
                name={b.name}
                value={b.value}
                status={b.status}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
