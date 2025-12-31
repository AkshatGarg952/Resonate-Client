import React, { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import BiomarkerRing from "../components/BiomarkerRing";

export default function BiomarkerHistoryDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!analysis) {
    return <Navigate to="/biomarkers/history" replace />;
  }

  // Use biomarkersByCategory if available
  const biomarkersByCategory = analysis.biomarkersByCategory || {};
  
  // Set first category as default on mount if available
  useEffect(() => {
    if (Object.keys(biomarkersByCategory).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(biomarkersByCategory)[0]);
    }
  }, [biomarkersByCategory, selectedCategory]);
  
  // Flatten biomarkers for overall calculations
  const biomarkersArr = Object.entries(analysis.biomarkers || {}).map(
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

  const getOverallScore = () => {
    if (analysis.overallScore) return analysis.overallScore;
    if (biomarkersArr.length === 0) return null;
    
    // Only count available biomarkers
    const availableBiomarkers = biomarkersArr.filter(b => b.isAvailable !== false);
    if (availableBiomarkers.length === 0) return null;
    
    const goodCount = availableBiomarkers.filter(
      b => b.status?.toLowerCase() === 'good'
    ).length;
    return Math.round((goodCount / availableBiomarkers.length) * 100);
  };

  const getHealthInsights = () => {
    // Count ALL biomarkers from backend (no filtering)
    const total = biomarkersArr.length;
    
    const goodCount = biomarkersArr.filter(
      b => b.status?.toLowerCase() === 'good'
    ).length;
    const badCount = biomarkersArr.filter(
      b => b.status?.toLowerCase() === 'bad'
    ).length;

    return { goodCount, badCount, total };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My Blood Report Analysis',
      text: `Health Score: ${overallScore}/100 | ${insights.goodCount} normal, ${insights.badCount} need attention`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareModal(true);
    }
  };

  const overallScore = getOverallScore();
  const insights = getHealthInsights();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24">
      
      {/* Header with Back Button */}
      <section className="px-5 pt-6 pb-4 sticky top-0 bg-slate-950/80 backdrop-blur-lg z-10 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 
                     active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 
                       flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-50 mb-1">
            Analysis Report
          </h1>
          <p className="text-sm text-slate-400 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(analysis.updatedAt)}
          </p>
        </div>
      </section>

      {/* Overall Health Score Card */}
      {overallScore !== null && (
        <section className="px-5 py-6">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                        border border-slate-700/50 rounded-3xl p-6 animate-fadeIn">
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
                        rounded-2xl p-4 flex items-start gap-3 animate-fadeIn"
               style={{ animationDelay: '0.1s' }}>
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

      {/* Biomarkers by Category */}
      <section className="px-5 mb-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-50">Biomarker Results</h3>
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

          {/* Category List and Biomarkers Display */}
          {Object.keys(biomarkersByCategory).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category List */}
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
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            isSelected
                              ? "bg-gradient-to-r from-primary to-emerald-500 text-slate-950 shadow-lg shadow-primary/25"
                              : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{categoryLabel || 'Other'}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                              isSelected 
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

              {/* Selected Category Biomarkers */}
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
              {biomarkersArr.map((b, idx) => (
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
      </section>

      {/* Detailed Summary - What needs attention */}
      {insights.badCount > 0 && (
        <section className="px-5 mb-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-50 mb-4">Priority Markers</h3>
            <div className="space-y-3">
              {biomarkersArr
                .filter(b => b.isAvailable !== false && b.status?.toLowerCase() === 'bad')
                .map((b, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 
                             rounded-2xl animate-fadeIn"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">⚠️</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-50">{b.name}</p>
                        <p className="text-xs text-slate-400">
                          Current: {b.value} {b.unit}
                          {b.normalRange && ` • Normal: ${b.normalRange}`}
                          {b.reason && ` • ${b.reason}`}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
                      Alert
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Action Cards */}
      <section className="px-5 space-y-3">
        {/* View PDF */}
        {analysis.pdfUrl && (
          <a
            href={analysis.pdfUrl}
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

        {/* Back to History */}
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
              <p className="text-xs text-slate-500">Compare with past results</p>
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
              <p className="text-xs text-slate-500">Track your progress</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Share Modal (Fallback for non-native share) */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center 
                   justify-center p-0 sm:p-5 animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl 
                     w-full sm:max-w-md p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-50 mb-4">Share Report</h3>
            <p className="text-sm text-slate-400 mb-4">
              Copy link to share this report with your healthcare provider
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowShareModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-semibold text-sm
                         hover:bg-emerald-500 active:scale-95 transition-all"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
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

