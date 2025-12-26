import React, { useEffect, useState } from "react";
import { getWithCookie } from "../api";
import { useNavigate } from "react-router-dom";

export default function BiomarkerHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getWithCookie("/diagnostics/history");
        setHistory(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const openAnalysis = (analysis) => {
    navigate(`/biomarkers/history/${analysis._id}`, {
      state: { analysis }
    });
  };

  return (
    <div className="space-y-6">
    
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-50">
          Blood report history
        </h2>
        <p className="text-sm text-slate-400">
          All your previous blood report analyses.
        </p>
      </section>

      
      {loading && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <p className="text-sm text-slate-400">Loading history...</p>
        </section>
      )}

      {error && !loading && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <p className="text-sm text-red-400">{error}</p>
        </section>
      )}

      
      {!loading && history.length > 0 && (
        <div className="grid gap-4">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-slate-50 font-medium">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-400">
                  {item.status}
                </span>
              </div>

              <button
                onClick={() => openAnalysis(item)}
                className="text-sm text-primary hover:underline"
              >
                View full analysis →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
