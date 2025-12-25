export function normalizeFitnessData(apiData) {
  const stepsHistory = apiData.stepsHistory || [];
  const sleepHistory = apiData.sleepHistory || [];
  const workoutHistory = apiData.workoutHistory || [];

  const labels = stepsHistory.map(item =>
    new Date(item.date).toLocaleDateString("en-US", { weekday: "short" })
  );

  const weeklySteps = stepsHistory.map(item => item.steps);
  const weeklySleep = sleepHistory.map(item => item.sleepHours);

  const todaySteps =
    stepsHistory.length > 0
      ? stepsHistory[stepsHistory.length - 1].steps
      : 0;

  const sleepHours =
    sleepHistory.length > 0
      ? sleepHistory[sleepHistory.length - 1].sleepHours
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const todayWorkout = workoutHistory.find(w => w.date === today);
  
  const workoutCount = todayWorkout
    ? todayWorkout.workouts.length
    : 0;

  return {
    todaySteps,
    sleepHours,
    workoutCount,
    weeklySteps,
    weeklySleep,
    labels,
    lastSyncTime: apiData.lastSyncTime
  };
}


