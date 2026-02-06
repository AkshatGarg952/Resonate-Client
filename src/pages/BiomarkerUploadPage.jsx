import React, { useState, useRef, useEffect } from "react";
import { uploadPdfWithCookie } from "../api";
import { auth } from "../firebase";
import BiomarkerRing from "../components/BiomarkerRing";
import { useNavigate } from "react-router-dom";

export default function BiomarkerUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [biomarkers, setBiomarkers] = useState([]);
  const [biomarkersByCategory, setBiomarkersByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    processFile(selected);
  };

  const processFile = (selected) => {
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Please upload a PDF file only. Other formats are not supported.");
      setFile(null);
      return;
    }


    if (selected.size > 10 * 1024 * 1024) {
      setError("File size too large. Please upload a PDF under 10MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
    setBiomarkers([]);
    setAnalysisComplete(false);
  };


  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF file to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);


    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const data = await uploadPdfWithCookie("/diagnostics/upload", file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const biomarkersData = data.diagnostics.biomarkersByCategory || {};

      const biomarkersArr = Object.entries(data.diagnostics.biomarkers || {}).map(
        ([name, info]) => ({
          name,
          value: info?.value,
          status: info?.status,
          unit: info?.unit || "",
          category: info?.category || null,
          categoryLabel: info?.categoryLabel || null,
          reason: info?.reason || null,
          isAvailable: info?.isAvailable !== false,
        })
      );

      setBiomarkers(biomarkersArr);
      setBiomarkersByCategory(biomarkersData);
      setAnalysisComplete(true);

      setAnalysisComplete(true);

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);

    } catch (err) {
      console.error("Upload error:", err);
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError(err.message || "Failed to analyze blood report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    setBiomarkers([]);
    setBiomarkersByCategory({});
    setSelectedCategory(null);
    setAnalysisComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  useEffect(() => {
    if (Object.keys(biomarkersByCategory).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(biomarkersByCategory)[0]);
    }
  }, [biomarkersByCategory, selectedCategory]);

  const getOverallScore = () => {
    if (biomarkers.length === 0) return null;
    if (biomarkers.length === 0) return null;
    const availableBiomarkers = biomarkers.filter(b => b.isAvailable !== false);
    if (availableBiomarkers.length === 0) return null;
    const goodCount = availableBiomarkers.filter(b => b.status?.toLowerCase() === 'good').length;
    return Math.round((goodCount / availableBiomarkers.length) * 100);
  };

  const overallScore = getOverallScore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24">


      <section className="px-5 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-4 
                   active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-3xl font-black text-slate-50 mb-1">
          Blood Report Analysis
        </h1>
        <p className="text-sm text-slate-400">
          Upload your PDF report for instant AI-powered biomarker insights
        </p>
      </section>


      <section className="px-5 mb-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">


          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary mb-1">What we analyze</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We extract 9 key biomarkers including glucose, cholesterol, hemoglobin, and more.
                  Results are categorized as normal or needs attention.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">


            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer
                       transition-all duration-300 ${isDragging
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : file
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/30'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 
                                flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-slate-50 mb-2">
                    {isDragging ? 'Drop your PDF here' : 'Tap to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF files only • Max 10MB
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 
                                flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-slate-50 mb-1 truncate px-4">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                             bg-red-500/10 text-red-400 text-xs font-semibold
                             hover:bg-red-500/20 active:scale-95 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </>
              )}
            </div>


            {error && (
              <div className="flex items-start gap-3 text-sm text-red-400 bg-red-500/10 
                            rounded-2xl px-4 py-3 border border-red-500/20 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}


            {loading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">Analyzing your report...</span>
                  <span className="text-primary font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing biomarkers with AI...</span>
                </div>
              </div>
            )}


            <button
              type="submit"
              disabled={loading || !file}
              className="w-full relative py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                       text-slate-950 font-bold overflow-hidden shadow-lg shadow-primary/25
                       hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed
                       active:scale-[0.98] transition-all duration-200 group"
            >
              {!loading && (
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                               translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
              )}

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Report...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upload & Analyze
                  </>
                )}
              </span>
            </button>

          </form>
        </div>
      </section>


      {analysisComplete && biomarkers.length > 0 && (
        <section id="results-section" className="px-5 space-y-4">


          <div className="bg-gradient-to-r from-emerald-500/10 to-primary/10 border border-emerald-500/20 
                        rounded-3xl p-6 animate-fadeIn">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-50 mb-1">Analysis Complete!</h3>
                <p className="text-sm text-slate-400">
                  We've analyzed {biomarkers.length} biomarkers from your report
                </p>
              </div>
            </div>


            {overallScore !== null && (
              <div className="bg-slate-950/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Overall Health Score</p>
                  <p className="text-3xl font-black text-slate-50">
                    {overallScore}
                    <span className="text-base font-normal text-slate-500 ml-1">/100</span>
                  </p>
                </div>
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                    <circle
                      cx="40" cy="40" r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - overallScore / 100)}`}
                      className={`${overallScore >= 70 ? 'text-emerald-400' : overallScore >= 40 ? 'text-amber-400' : 'text-red-400'} transition-all duration-1000`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-slate-50">{overallScore}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>


          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Your Biomarkers</h3>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Good
                  </span>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Needs attention
                  </span>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    Unavailable
                  </span>
                </p>
              </div>
            </div>


            {Object.keys(biomarkersByCategory).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                <div className="lg:col-span-1">
                  <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
                      Categories
                    </h4>
                    <div className="space-y-2">
                      {Object.keys(biomarkersByCategory).map((categoryLabel) => {
                        const categoryBiomarkers = biomarkersByCategory[categoryLabel] || {};
                        const categoryCount = Object.keys(categoryBiomarkers).length;
                        const isSelected = selectedCategory === categoryLabel;

                        return (
                          <button
                            key={categoryLabel}
                            onClick={() => setSelectedCategory(categoryLabel)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isSelected
                                ? "bg-gradient-to-r from-primary to-emerald-500 text-slate-950 shadow-lg shadow-primary/25"
                                : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{categoryLabel || 'Other'}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${isSelected
                                  ? "bg-slate-950/30 text-slate-950"
                                  : "bg-slate-700/50 text-slate-500"
                                }`}>
                                {categoryCount}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>


                <div className="lg:col-span-3">
                  {selectedCategory && biomarkersByCategory[selectedCategory] ? (
                    <>
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-slate-50 mb-1">
                          {selectedCategory || 'Other'}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {Object.keys(biomarkersByCategory[selectedCategory] || {}).length} biomarkers
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(biomarkersByCategory[selectedCategory] || {}).map(([name, info]) => (
                          <BiomarkerRing
                            key={name}
                            name={name}
                            value={info?.value}
                            status={info?.status}
                            unit={info?.unit || ""}
                            normalRange={info?.normalRange || ""}
                            reason={info?.reason || ""}
                            isAvailable={info?.isAvailable !== false}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-400">Select a category to view biomarkers</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {biomarkers.map((b, idx) => (
                  <BiomarkerRing
                    key={idx}
                    name={b.name}
                    value={b.value}
                    status={b.status}
                    unit={b.unit}
                    normalRange={b.normalRange}
                    reason={b.reason}
                    isAvailable={b.isAvailable}
                  />
                ))}
              </div>
            )}
          </div>


          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/biomarkers/history')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl 
                       bg-slate-800/50 border-2 border-slate-700/50 text-slate-300 font-semibold
                       hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </button>
            <button
              onClick={() => {
                removeFile();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl 
                       bg-primary/10 border-2 border-primary/20 text-primary font-semibold
                       hover:bg-primary/20 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Another
            </button>
          </div>

        </section>
      )}


      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

