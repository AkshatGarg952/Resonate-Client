import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { postWithToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Step 1: Firebase login
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Step 2: Get Firebase ID token
      const token = await cred.user.getIdToken();

      // Step 3: Send token to backend login
      await postWithToken("/auth/login", token, {});

      // Step 4: On success, go to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      {/* <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-lg"> */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-lg relative">

            
          
          <button
    onClick={() => navigate("/")}
    className="absolute top-3 right-3 text-slate-400 hover:text-white text-xl"
  >
    ✕
  </button>
      
        <h2 className="text-2xl font-semibold text-slate-50 mb-1">
          Welcome back 👋
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          Login to continue tracking your health.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-primary text-slate-950 font-semibold py-2.5 text-sm hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400 text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
