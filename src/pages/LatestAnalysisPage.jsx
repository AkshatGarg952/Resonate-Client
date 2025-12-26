import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getWithCookie } from "../api";
import BiomarkerRing from "../components/BiomarkerRing";

export default function LatestAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [biomarkers, setBiomarkers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latest = await getWithCookie("/diagnostics/latest");

        if (!latest || latest.status !== "completed") {
          setError("No completed analysis found yet.");
          return;
        }

        
        const biomarkersArr = Object.entries(latest.biomarkers || {}).map(
          ([name, info]) => ({
            name,
            value: info?.value,
            status: info?.status,
          })
        );

        setBiomarkers(biomarkersArr);
        setMeta({
          updatedAt: latest.updatedAt,
          pdfUrl: latest.pdfUrl,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch latest analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return (
    <div className="space-y-6">
    
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-1">
          Latest blood report analysis
        </h2>
        <p className="text-sm text-slate-400">
          Your most recently analyzed blood report.
        </p>

        {meta && (
          <p className="text-xs text-slate-500 mt-2">
            Last updated:{" "}
            {new Date(meta.updatedAt).toLocaleString()}
          </p>
        )}
      </section>

     
      {loading && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <p className="text-sm text-slate-400">
            Loading latest analysis...
          </p>
        </section>
      )}

      {!loading && error && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <p className="text-sm text-red-400">{error}</p>
        </section>
      )}

      {!loading && biomarkers.length > 0 && (
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

        
          {meta?.pdfUrl && (
            <a
              href={meta.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-6 text-sm text-primary hover:underline"
            >
              View uploaded PDF →
            </a>
          )}
        </section>
      )}
    </div>
  );
}
