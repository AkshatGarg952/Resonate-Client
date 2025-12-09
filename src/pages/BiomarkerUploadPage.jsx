import React, { useState } from "react";
import { uploadPdfWithToken } from "../api";
import { auth } from "../firebase";
import BiomarkerRing from "../components/BiomarkerRing";

export default function BiomarkerUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [biomarkers, setBiomarkers] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = await auth.currentUser.getIdToken();
      const data = await uploadPdfWithToken("/diagnostics/upload", token, file);
      console.log("API response:", data.diagnostics);
      // setBiomarkers(data.diagnostics.biomarkers || []);
      setBiomarkers(Object.values(data.diagnostics.biomarkers || {}));

    } catch (err) {
      console.error(err);
      setError("Failed to analyze the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-2">
          Blood report analysis
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Upload your blood report PDF. We&apos;ll extract 8 key biomarkers and
          show if they are in a good or bad range.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full sm:w-auto text-sm text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-primary file:text-slate-950 hover:file:bg-emerald-500"
            />
            {file && (
              <p className="text-xs text-slate-400">
                Selected: <span className="text-slate-200">{file.name}</span>
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary text-slate-950 font-semibold py-2.5 px-6 text-sm hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </form>
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
