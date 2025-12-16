import React, { createContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BiomarkerFetchFromApiPage from "./pages/BiomarkerFetchFromApiPage";
import BiomarkerUploadPage from "./pages/BiomarkerUploadPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LatestAnalysisPage from "./pages/LatestAnalysisPage";
import BiomarkerHistoryPage from "./pages/BiomarkerHistoryPage";
import BiomarkerHistoryDetailPage from "./pages/BiomarkerHistoryDetailPage";

export const AuthContext = createContext(null);

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
  const MICROSERVICE_URL = import.meta.env.VITE_MICROSERVICE_API_URL;

  if (BACKEND_URL) {
    fetch(`${BACKEND_URL}/health`)
      .then(() => console.log("Backend warmed up"))
      .catch(() => {});
  }

  if (MICROSERVICE_URL) {
    fetch(`${MICROSERVICE_URL}/`)
      .then(() => console.log("Microservice warmed up"))
      .catch(() => {});
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

      <Routes>
        <Route path="/" element={<LandingPage />} />  

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/biomarkers/upload"
          element={
            <ProtectedRoute>
              <BiomarkerUploadPage />
            </ProtectedRoute>
          }
        />

        <Route path="/biomarkers/api"
          element={
            <ProtectedRoute>
              <BiomarkerFetchFromApiPage />
            </ProtectedRoute>
          }
        />

        <Route path="/biomarkers/latest"
          element={
            <ProtectedRoute>
              <LatestAnalysisPage />
            </ProtectedRoute>
          }
        />

        <Route path="/biomarkers/history"
          element={
            <ProtectedRoute>
              <BiomarkerHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route path="/biomarkers/history/:id"
          element={
            <ProtectedRoute>
              <BiomarkerHistoryDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default AppWrapper;
