// import React, { useEffect, useState } from "react";
// import { auth } from "../firebase";
// import { getWithCookie } from "../api";
// import BiomarkerRing from "../components/BiomarkerRing";

// export default function LatestAnalysisPage() {
//   const [loading, setLoading] = useState(true);
//   const [biomarkers, setBiomarkers] = useState([]);
//   const [meta, setMeta] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchLatest = async () => {
//       try {
//         const latest = await getWithCookie("/diagnostics/latest");

//         if (!latest || latest.status !== "completed") {
//           setError("No completed analysis found yet.");
//           return;
//         }

        
//         const biomarkersArr = Object.entries(latest.biomarkers || {}).map(
//           ([name, info]) => ({
//             name,
//             value: info?.value,
//             status: info?.status,
//           })
//         );

//         setBiomarkers(biomarkersArr);
//         setMeta({
//           updatedAt: latest.updatedAt,
//           pdfUrl: latest.pdfUrl,
//         });
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch latest analysis.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLatest();
//   }, []);

//   return (
//     <div className="space-y-6">
    
//       <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
//         <h2 className="text-xl font-semibold text-slate-50 mb-1">
//           Latest blood report analysis
//         </h2>
//         <p className="text-sm text-slate-400">
//           Your most recently analyzed blood report.
//         </p>

//         {meta && (
//           <p className="text-xs text-slate-500 mt-2">
//             Last updated:{" "}
//             {new Date(meta.updatedAt).toLocaleString()}
//           </p>
//         )}
//       </section>

     
//       {loading && (
//         <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
//           <p className="text-sm text-slate-400">
//             Loading latest analysis...
//           </p>
//         </section>
//       )}

//       {!loading && error && (
//         <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
//           <p className="text-sm text-red-400">{error}</p>
//         </section>
//       )}

//       {!loading && biomarkers.length > 0 && (
//         <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
//           <h3 className="text-lg font-semibold text-slate-50 mb-3">
//             Your biomarkers
//           </h3>
//           <p className="text-xs text-slate-400 mb-4">
//             Green ring = good | Red ring = needs attention
//           </p>

//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//             {biomarkers.map((b, idx) => (
//               <BiomarkerRing
//                 key={idx}
//                 name={b.name}
//                 value={b.value}
//                 status={b.status}
//               />
//             ))}
//           </div>

        
//           {meta?.pdfUrl && (
//             <a
//               href={meta.pdfUrl}
//               target="_blank"
//               rel="noreferrer"
//               className="inline-block mt-6 text-sm text-primary hover:underline"
//             >
//               View uploaded PDF →
//             </a>
//           )}
//         </section>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getWithCookie } from "../api";
import BiomarkerRing from "../components/BiomarkerRing";
import { useNavigate } from "react-router-dom";

export default function LatestAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [biomarkers, setBiomarkers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchLatest = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const latest = await getWithCookie("/diagnostics/latest");

      if (!latest || latest.status !== "completed") {
        setError("No completed analysis found yet.");
        setBiomarkers([]);
        setMeta(null);
        return;
      }

      const biomarkersArr = Object.entries(latest.biomarkers || {}).map(
        ([name, info]) => ({
          name,
          value: info?.value,
          status: info?.status,
          unit: info?.unit || "",
          normalRange: info?.normalRange || "",
        })
      );

      setBiomarkers(biomarkersArr);
      setMeta({
        updatedAt: latest.updatedAt,
        pdfUrl: latest.pdfUrl,
        overallScore: latest.overallScore,
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch latest analysis.");
      setBiomarkers([]);
      setMeta(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const getOverallScore = () => {
    if (meta?.overallScore) return meta.overallScore;
    if (biomarkers.length === 0) return null;
    
    const goodCount = biomarkers.filter(
      b => b.status?.toLowerCase() === 'good' || b.status?.toLowerCase() === 'normal'
    ).length;
    return Math.round((goodCount / biomarkers.length) * 100);
  };

  const getHealthInsights = () => {
    const goodCount = biomarkers.filter(
      b => b.status?.toLowerCase() === 'good' || b.status?.toLowerCase() === 'normal'
    ).length;
    const badCount = biomarkers.filter(
      b => b.status?.toLowerCase() === 'bad' || b.status?.toLowerCase() === 'high' || b.status?.toLowerCase() === 'low'
    ).length;

    return { goodCount, badCount, total: biomarkers.length };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                      flex items-center justify-center mb-4 animate-pulse">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">Loading latest analysis...</p>
        <div className="mt-4 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const overallScore = getOverallScore();
  const insights = getHealthInsights();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24">
      
      {/* Refresh indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 backdrop-blur-sm 
                      border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium text-slate-300">Refreshing...</span>
        </div>
      )}

      {/* Header Section */}
      <section className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-50 mb-1">
              Latest Analysis
            </h1>
            <p className="text-sm text-slate-400">
              Your most recent blood report results
            </p>
            {meta?.updatedAt && (
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analyzed {formatDate(meta.updatedAt)}
              </p>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchLatest(true)}
            disabled={refreshing}
            className="w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 
                     flex items-center justify-center hover:bg-slate-800 active:scale-95 
                     disabled:opacity-50 transition-all duration-200"
          >
            <svg 
              className={`w-5 h-5 text-slate-300 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </section>

      {/* Error State */}
      {error && !loading && (
        <section className="px-5">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-50 mb-2">No Analysis Found</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={() => navigate('/biomarkers/upload')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                       text-slate-950 font-bold shadow-lg shadow-primary/25
                       hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-200"
            >
              Upload Blood Report
            </button>
          </div>
        </section>
      )}

      {/* Main Content */}
      {!error && biomarkers.length > 0 && (
        <>
          {/* Overall Health Score Card */}
          {overallScore !== null && (
            <section className="px-5 mb-6">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                            border border-slate-700/50 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-400 mb-2">Overall Health Score</p>
                    <h2 className="text-5xl font-black text-slate-50 mb-1">
                      {overallScore}
                      <span className="text-xl font-normal text-slate-500 ml-2">/100</span>
                    </h2>
                    <p className={`text-sm font-semibold ${
                      overallScore >= 70 ? 'text-emerald-400' : 
                      overallScore >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {overallScore >= 70 ? 'Excellent Health' : 
                       overallScore >= 40 ? 'Needs Attention' : 'Consult Doctor'}
                    </p>
                  </div>

                  {/* Circular Progress */}
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" strokeWidth="8" fill="transparent" className="stroke-slate-800"/>
                      <circle 
                        cx="56" cy="56" r="48" 
                        strokeWidth="8" 
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - overallScore / 100)}`}
                        className={`transition-all duration-1000 ${
                          overallScore >= 70 ? 'stroke-emerald-400' : 
                          overallScore >= 40 ? 'stroke-amber-400' : 'stroke-red-400'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-50">{overallScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/30 rounded-2xl p-3 text-center">
                    <p className="text-2xl font-black text-slate-50">{insights.total}</p>
                    <p className="text-xs text-slate-500 mt-1">Total</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 text-center">
                    <p className="text-2xl font-black text-emerald-400">{insights.goodCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Normal</p>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3 text-center">
                    <p className="text-2xl font-black text-red-400">{insights.badCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Alert</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Health Insight Banner */}
          {insights.badCount > 0 && (
            <section className="px-5 mb-6">
              <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 
                            rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-400 mb-1">
                    {insights.badCount} {insights.badCount === 1 ? 'biomarker needs' : 'biomarkers need'} attention
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Consider consulting with your healthcare provider for personalized advice on improving these markers.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Biomarkers Grid */}
          <section className="px-5 mb-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Your Biomarkers</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Normal
                    </span>
                    <span className="mx-2">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      Needs attention
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {biomarkers.map((b, idx) => (
                  <BiomarkerRing
                    key={idx}
                    name={b.name}
                    value={b.value}
                    status={b.status}
                    unit={b.unit}
                    normalRange={b.normalRange}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Action Cards */}
          <section className="px-5 space-y-3">
            {/* View PDF */}
            {meta?.pdfUrl && (
              <a
                href={meta.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-sm 
                         border border-slate-800/50 rounded-2xl hover:border-primary/30 
                         active:scale-[0.98] transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-50">View Original PDF</p>
                    <p className="text-xs text-slate-500">Open in new tab</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}

            {/* View History */}
            <button
              onClick={() => navigate('/biomarkers/history')}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-sm 
                       border border-slate-800/50 rounded-2xl hover:border-emerald-500/30 
                       active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-50">View All Reports</p>
                  <p className="text-xs text-slate-500">See your history & trends</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Upload New Report */}
            <button
              onClick={() => navigate('/biomarkers/upload')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-emerald-500/10 
                       border border-primary/20 rounded-2xl hover:border-primary/40 
                       active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-50">Upload New Report</p>
                  <p className="text-xs text-slate-500">Analyze latest blood test</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </section>
        </>
      )}

    </div>
  );
}

