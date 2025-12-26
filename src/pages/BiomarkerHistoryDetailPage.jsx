import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import BiomarkerRing from "../components/BiomarkerRing";

export default function BiomarkerHistoryDetailPage() {
  const location = useLocation();
  const analysis = location.state?.analysis;

  if (!analysis) {
    return <Navigate to="/biomarkers/history" replace />;
  }

  const biomarkersArr = Object.entries(analysis.biomarkers || {}).map(
    ([name, info]) => ({
      name,
      value: info?.value,
      status: info?.status,
    })
  );

  return (
    <div className="space-y-6">
      
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-50">
          Blood report analysis
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Analyzed on{" "}
          {new Date(analysis.updatedAt).toLocaleString()}
        </p>
      </section>

      
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-3">
          Your biomarkers
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Green ring = good | Red ring = needs attention
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {biomarkersArr.map((b, idx) => (
            <BiomarkerRing
              key={idx}
              name={b.name}
              value={b.value}
              status={b.status}
            />
          ))}
        </div>

        {analysis.pdfUrl && (
          <a
            href={analysis.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-6 text-sm text-primary hover:underline"
          >
            View uploaded PDF →
          </a>
        )}
      </section>
    </div>
  );
}
