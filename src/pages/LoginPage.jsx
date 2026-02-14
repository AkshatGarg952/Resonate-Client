import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { postAuth } from "../api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await postAuth("/auth/login", token, {});

      if (res.message === "Login Success") {
        sessionStorage.setItem("verifiedUser", "true");
        navigate("/profile");
      } else {
        await auth.signOut();
        setError(res.message);
      }
    } catch (err) {
      await auth.signOut();
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-5 py-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">


      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>


      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-5 w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur-sm
                   border border-slate-700/50 flex items-center justify-center
                   hover:bg-slate-800 active:scale-95 transition-all duration-200 z-10"
      >
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>


      <div
        className={`w-full max-w-md relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                        flex items-center justify-center backdrop-blur-sm border border-primary/20
                        animate-pulse">
            <span className="text-3xl font-black text-primary">R</span>
          </div>
          <h1 className="text-3xl font-black text-slate-50 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400">
            Login to continue your fitness journey
          </p>
        </div>


        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-2xl">

          <form onSubmit={handleLogin} className="space-y-5">


            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-primary' : 'text-slate-500'
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  className={`w-full rounded-2xl bg-slate-950/50 border-2 pl-12 pr-4 py-3.5 text-base text-slate-50
                            placeholder:text-slate-600 transition-all duration-200
                            focus:outline-none focus:bg-slate-950
                            ${focusedField === 'email'
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>


            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:text-emerald-400 transition-colors"
                  onClick={() => { }}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-primary' : 'text-slate-500'
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full rounded-2xl bg-slate-950/50 border-2 pl-12 pr-12 py-3.5 text-base text-slate-50
                            placeholder:text-slate-600 transition-all duration-200
                            focus:outline-none focus:bg-slate-950
                            ${focusedField === 'password'
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300
                           active:scale-95 transition-all"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>


            {error && (
              <div className="flex items-start gap-3 text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/20 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                       text-slate-950 font-bold py-4 text-base overflow-hidden
                       shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
                       disabled:opacity-60 disabled:cursor-not-allowed
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
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>


          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            <span className="text-xs font-medium text-slate-500">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          </div>


          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl
                       bg-slate-800/50 border-2 border-slate-700/50 text-slate-300 font-semibold
                       hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>


          <p className="mt-6 text-sm text-slate-400 text-center">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:text-emerald-400 hover:underline transition-colors"
            >
              Register now
            </Link>
          </p>
        </div>


        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Secure login with end-to-end encryption</span>
        </div>
      </div>


      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

