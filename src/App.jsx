import React, { createContext, lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

// Non-lazy: always needed immediately on any route
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages — Vite will split each into its own JS chunk.
// Users only download the code for pages they actually visit.
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const BiomarkerFetchFromApiPage = lazy(() => import("./pages/BiomarkerFetchFromApiPage"));
const BiomarkerUploadPage = lazy(() => import("./pages/BiomarkerUploadPage"));
const LatestAnalysisPage = lazy(() => import("./pages/LatestAnalysisPage"));
const BiomarkerHistoryPage = lazy(() => import("./pages/BiomarkerHistoryPage"));
const BiomarkerHistoryDetailPage = lazy(() => import("./pages/BiomarkerHistoryDetailPage"));
const FitnessDashboardPage = lazy(() => import("./pages/FitnessDashboardPage"));
const DemoReportPage = lazy(() => import("./pages/DemoReportPage"));
const GetACoachPage = lazy(() => import("./pages/GetACoachPage"));
const WorkoutGenerator = lazy(() => import("./pages/WorkoutGenerator"));
const WorkoutHistoryPage = lazy(() => import("./pages/WorkoutHistoryPage"));
const NutritionPage = lazy(() => import("./pages/NutritionPage"));
const MealHistoryPage = lazy(() => import("./pages/MealHistoryPage"));
const FoodAnalyzer = lazy(() => import("./components/FoodAnalyzer"));
const InterventionsPage = lazy(() => import("./pages/InterventionsPage"));
const InterventionSuggestions = lazy(() => import("./pages/InterventionSuggestions"));
const AdminMemoryDashboard = lazy(() => import("./pages/AdminMemoryDashboard"));
const MemoriesPage = lazy(() => import("./pages/MemoriesPage"));

export const AuthContext = createContext(null);

// Simple loading spinner shown while a lazy chunk is downloading
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
    const MICROSERVICE_URL = import.meta.env.VITE_API_MICROSERVICE_URL;

    if (BACKEND_URL) {
      fetch(`${BACKEND_URL}/health`).catch(() => { });
    }

    if (MICROSERVICE_URL) {
      fetch(`${MICROSERVICE_URL}/`).catch(() => { });
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("verifiedUser");
    navigate("/");
  };

  if (loadingAuth) return null;

  return (
    <AuthContext.Provider value={{ user }}>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="pt-16 lg:pt-[4.5rem] min-h-screen">
        {/* Suspense catches all lazy page loads and shows PageLoader while the chunk downloads */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/demo-report" element={<DemoReportPage />} />
            <Route path="/get-coach" element={<GetACoachPage />} />

            <Route path="/workout-generator" element={<ProtectedRoute><WorkoutGenerator /></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><WorkoutHistoryPage /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
            <Route path="/meal-history" element={<ProtectedRoute><MealHistoryPage /></ProtectedRoute>} />
            <Route path="/food-analysis" element={<ProtectedRoute><FoodAnalyzer /></ProtectedRoute>} />
            <Route path="/interventions" element={<ProtectedRoute><InterventionsPage /></ProtectedRoute>} />
            <Route path="/interventions/suggest" element={<ProtectedRoute><InterventionSuggestions /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/memory" element={<ProtectedRoute><AdminMemoryDashboard /></ProtectedRoute>} />
            <Route path="/memories" element={<ProtectedRoute><MemoriesPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><FitnessDashboardPage /></ProtectedRoute>} />
            <Route path="/biomarkers/upload" element={<ProtectedRoute><BiomarkerUploadPage /></ProtectedRoute>} />
            <Route path="/biomarkers/api" element={<ProtectedRoute><BiomarkerFetchFromApiPage /></ProtectedRoute>} />
            <Route path="/biomarkers/latest" element={<ProtectedRoute><LatestAnalysisPage /></ProtectedRoute>} />
            <Route path="/biomarkers/history" element={<ProtectedRoute><BiomarkerHistoryPage /></ProtectedRoute>} />
            <Route path="/biomarkers/history/:id" element={<ProtectedRoute><BiomarkerHistoryDetailPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
    </AuthContext.Provider>
  );
}

export default AppWrapper;

