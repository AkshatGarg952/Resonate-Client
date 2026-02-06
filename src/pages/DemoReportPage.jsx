import React, { useEffect, useState } from "react";
import BiomarkerRing from "../components/BiomarkerRing";
import { useNavigate } from "react-router-dom";

export default function DemoReportPage() {
  const [biomarkers, setBiomarkers] = useState([]);
  const [biomarkersByCategory, setBiomarkersByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [meta, setMeta] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const demoData = {
      updatedAt: new Date().toISOString(),
      overallScore: 78,
      biomarkersByCategory: {
        "Complete Blood Count": {
          "Hemoglobin": {
            value: "14.2",
            status: "good",
            unit: "g/dL",
            normalRange: "12.0 - 16.0 g/dL",
            reason: "Your hemoglobin level is within the normal range, indicating good oxygen-carrying capacity.",
            isAvailable: true
          },
          "White Blood Cells": {
            value: "6.8",
            status: "good",
            unit: "×10³/µL",
            normalRange: "4.0 - 11.0 ×10³/µL",
            reason: "Your white blood cell count is normal, suggesting a healthy immune system.",
            isAvailable: true
          },
          "Platelets": {
            value: "285",
            status: "good",
            unit: "×10³/µL",
            normalRange: "150 - 450 ×10³/µL",
            reason: "Platelet count is within normal range, indicating proper blood clotting function.",
            isAvailable: true
          },
          "Red Blood Cells": {
            value: "4.5",
            status: "good",
            unit: "×10⁶/µL",
            normalRange: "4.0 - 5.5 ×10⁶/µL",
            reason: "Your red blood cell count is healthy.",
            isAvailable: true
          }
        },
        "Lipid Profile": {
          "Total Cholesterol": {
            value: "185",
            status: "good",
            unit: "mg/dL",
            normalRange: "< 200 mg/dL",
            reason: "Your total cholesterol is within the desirable range.",
            isAvailable: true
          },
          "HDL Cholesterol": {
            value: "58",
            status: "good",
            unit: "mg/dL",
            normalRange: "> 40 mg/dL",
            reason: "Your HDL (good cholesterol) level is excellent.",
            isAvailable: true
          },
          "LDL Cholesterol": {
            value: "112",
            status: "good",
            unit: "mg/dL",
            normalRange: "< 100 mg/dL (optimal)",
            reason: "Your LDL cholesterol is slightly elevated but still acceptable.",
            isAvailable: true
          },
          "Triglycerides": {
            value: "145",
            status: "bad",
            unit: "mg/dL",
            normalRange: "< 150 mg/dL",
            reason: "Your triglyceride level is slightly elevated. Consider dietary modifications and regular exercise.",
            isAvailable: true
          }
        },
        "Liver Function": {
          "ALT (SGPT)": {
            value: "32",
            status: "good",
            unit: "U/L",
            normalRange: "7 - 56 U/L",
            reason: "Your ALT level is normal, indicating healthy liver function.",
            isAvailable: true
          },
          "AST (SGOT)": {
            value: "28",
            status: "good",
            unit: "U/L",
            normalRange: "10 - 40 U/L",
            reason: "Your AST level is within normal range.",
            isAvailable: true
          },
          "Bilirubin Total": {
            value: "0.9",
            status: "good",
            unit: "mg/dL",
            normalRange: "0.2 - 1.2 mg/dL",
            reason: "Total bilirubin is normal.",
            isAvailable: true
          }
        },
        "Kidney Function": {
          "Creatinine": {
            value: "0.95",
            status: "good",
            unit: "mg/dL",
            normalRange: "0.6 - 1.2 mg/dL",
            reason: "Your creatinine level is normal, indicating healthy kidney function.",
            isAvailable: true
          },
          "Blood Urea Nitrogen": {
            value: "18",
            status: "good",
            unit: "mg/dL",
            normalRange: "7 - 20 mg/dL",
            reason: "BUN level is within normal range.",
            isAvailable: true
          }
        },
        "Diabetes": {
          "Fasting Blood Glucose": {
            value: "92",
            status: "good",
            unit: "mg/dL",
            normalRange: "70 - 100 mg/dL",
            reason: "Your fasting blood glucose is within the normal range.",
            isAvailable: true
          },
          "HbA1c": {
            value: "5.4",
            status: "good",
            unit: "%",
            normalRange: "< 5.7%",
            reason: "Your HbA1c level indicates good long-term blood sugar control.",
            isAvailable: true
          }
        }
      }
    };


    const biomarkersArr = Object.entries(demoData.biomarkersByCategory).flatMap(([category, markers]) =>
      Object.entries(markers).map(([name, info]) => ({
        name,
        value: info?.value,
        status: info?.status,
        unit: info?.unit || "",
        category: category,
        categoryLabel: category,
        reason: info?.reason || null,
        isAvailable: info?.isAvailable !== false,
      }))
    );

    setBiomarkers(biomarkersArr);
    setBiomarkersByCategory(demoData.biomarkersByCategory);
    setMeta({
      updatedAt: demoData.updatedAt,
      overallScore: demoData.overallScore,
    });
  }, []);


  useEffect(() => {
    if (Object.keys(biomarkersByCategory).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(biomarkersByCategory)[0]);
    }
  }, [biomarkersByCategory, selectedCategory]);

  const getOverallScore = () => {
    if (meta?.overallScore) return meta.overallScore;
    if (biomarkers.length === 0) return null;

    if (biomarkers.length === 0) return null;
    const availableBiomarkers = biomarkers.filter(b => b.isAvailable !== false);
    if (availableBiomarkers.length === 0) return null;

    const goodCount = availableBiomarkers.filter(
      b => b.status?.toLowerCase() === 'good'
    ).length;
    return Math.round((goodCount / availableBiomarkers.length) * 100);
  };

  const getHealthInsights = () => {

    const total = biomarkers.length;

    const goodCount = biomarkers.filter(
      b => b.status?.toLowerCase() === 'good'
    ).length;
    const badCount = biomarkers.filter(
      b => b.status?.toLowerCase() === 'bad'
    ).length;

    return { goodCount, badCount, total };
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

  const overallScore = getOverallScore();
  const insights = getHealthInsights();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24">


      <section className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                DEMO
              </span>
            </div>
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


          <button
            onClick={() => navigate('/biomarkers/latest')}
            className="w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 
                     flex items-center justify-center hover:bg-slate-800 active:scale-95 
                     transition-all duration-200"
          >
            <svg
              className="w-5 h-5 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </section>


      {biomarkers.length > 0 && (
        <>

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
                    <p className={`text-sm font-semibold ${overallScore >= 70 ? 'text-emerald-400' :
                        overallScore >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                      {overallScore >= 70 ? 'Excellent Health' :
                        overallScore >= 40 ? 'Needs Attention' : 'Consult Doctor'}
                    </p>
                  </div>


                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" strokeWidth="8" fill="transparent" className="stroke-slate-800" />
                      <circle
                        cx="56" cy="56" r="48"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - overallScore / 100)}`}
                        className={`transition-all duration-1000 ${overallScore >= 70 ? 'stroke-emerald-400' :
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


          <section className="px-5 mb-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
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
          </section>


          <section className="px-5 space-y-3">

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
