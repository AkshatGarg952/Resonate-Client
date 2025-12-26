import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import BarChart from "../components/BarChart";
import { normalizeFitnessData } from "../utils/fitnessNormalizer";
import { getWithCookie } from "../api";

export default function FitnessDashboardPage() {
  const [fitness, setFitness] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFitness = async () => {
    try {
      
      const apiData = await getWithCookie("/fit/getGoogleFitData");
      const normalizedData = normalizeFitnessData(apiData);

      setFitness(normalizedData);
    } catch (error) {
      console.error("Failed to load fitness data:", error);
      setFitness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFitness();
  }, []);

  return (
    <div className="space-y-6">

      
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h1 className="text-2xl font-semibold text-slate-50">
          Fitness Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Your daily activity & recovery overview
        </p>
      </section>

      
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        {loading ? (
          <p className="text-sm text-slate-400">
            Loading fitness data…
          </p>
        ) : !fitness ? (
          <p className="text-sm text-slate-400">
            No fitness data available. Sync your device.
          </p>
        ) : (
          <div className="space-y-8">

            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Steps Today"
                value={fitness.todaySteps}
              />
              <MetricCard
                title="Last Night Sleep (hrs)"
                value={fitness.sleepHours}
              />
              <MetricCard
                title="Workouts Today"
                value={fitness.workoutCount}
              />
            </div>

           
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <BarChart
                title="Steps (Last 7 Days)"
                data={fitness.weeklySteps}
                labels={fitness.labels}
                unit=""
              />
              <BarChart
                title="Sleep (Last 7 Nights)"
                data={fitness.weeklySleep}
                labels={fitness.labels}
                unit="h"
              />
            </div>

            <div className="text-xs text-slate-400">
              Last synced:{" "}
              {fitness.lastSyncTime
                ? new Date(fitness.lastSyncTime).toLocaleString()
                : "--"}
            </div>

          </div>
        )}
      </section>
    </div>
  );
}
