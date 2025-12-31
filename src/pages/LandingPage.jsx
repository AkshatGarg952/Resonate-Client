import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const scrollContainerRef = useRef(null);

  // Entrance animation on mount
  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track horizontal scroll for card indicators
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleCardScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85; // Approximate card width
      const index = Math.round(scrollLeft / cardWidth);
      setActiveCard(Math.min(index, 2));
    };

    container.addEventListener("scroll", handleCardScroll);
    return () => container.removeEventListener("scroll", handleCardScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      
      {/* Animated Background Orbs - Premium feel */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }}
        ></div>
        <div 
          className="absolute bottom-40 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '2s' }}
        ></div>
      </div>

      {/* Hero Section with Staggered Animations */}
      <section 
        className={`relative flex-1 flex flex-col items-center justify-center px-5 pt-12 pb-24 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Animated Badge with Pulse Effect */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-6 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-xs font-semibold text-primary tracking-wide">AI-POWERED INSIGHTS</span>
        </div>

        {/* Main Heading with Gradient Animation */}
        <h1 
          className={`text-[2.75rem] leading-[1.1] sm:text-5xl md:text-6xl font-black text-center mb-4 max-w-xs sm:max-w-lg transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-slate-50">Track your health.</span>
          <br />
          <span className="inline-block bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
            Resonate
          </span>
          <span className="text-slate-50"> with fitness.</span>
        </h1>

        {/* Subheading with Fade-in */}
        <p 
          className={`text-base sm:text-lg text-slate-400 text-center mb-10 max-w-md px-2 leading-relaxed transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Your all-in-one fitness companion for profile tracking, biomarker analysis, and goal crushing.
        </p>

        {/* Primary CTA with Haptic-like Animation */}
        <div 
          className={`flex flex-col w-full max-w-sm gap-3.5 mb-10 px-5 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            to="/register"
            className="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                     text-slate-950 text-lg font-bold overflow-hidden
                     shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
                     active:scale-[0.97] transition-all duration-200"
          >
            {/* Shimmer effect on hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
            
            <span className="relative flex items-center justify-center gap-2">
              Get Started Free
              <svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>

          {/* Secondary CTA with Hover Glow */}
          <Link
            to="/login"
            className="relative w-full py-4 px-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm
                     border-2 border-slate-700 text-slate-300 text-base font-semibold 
                     hover:bg-slate-800 hover:border-slate-600 hover:text-slate-100
                     active:scale-[0.97] transition-all duration-200
                     before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r 
                     before:from-primary/0 before:via-primary/5 before:to-primary/0 before:opacity-0 
                     hover:before:opacity-100 before:transition-opacity before:duration-300"
          >
            <span className="relative">Already have an account? Login</span>
          </Link>
        </div>

        {/* Social Proof with Count-up Animation */}
        <div 
          className={`flex items-center gap-8 text-center mb-12 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="flex flex-col">
            <p className="text-3xl font-black text-slate-50 mb-0.5">
              10K<span className="text-primary">+</span>
            </p>
            <p className="text-xs text-slate-500 font-medium">Active Users</p>
          </div>
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
          <div className="flex flex-col">
            <p className="text-3xl font-black text-slate-50 mb-0.5 flex items-center justify-center gap-1">
              4.8
              <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </p>
            <p className="text-xs text-slate-500 font-medium">App Rating</p>
          </div>
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
          <div className="flex flex-col">
            <p className="text-3xl font-black text-slate-50 mb-0.5">
              50K<span className="text-primary">+</span>
            </p>
            <p className="text-xs text-slate-500 font-medium">Reports Analyzed</p>
          </div>
        </div>

        {/* Scroll Indicator - Animated bounce */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Feature Cards - Enhanced with Micro-interactions */}
      <section className="relative px-5 pb-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-2xl font-black text-slate-50">Why Choose Us?</h2>
          <div className="text-xs text-slate-500 font-medium">Swipe to explore →</div>
        </div>
        
        {/* Horizontal Scroll Container with Snap */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 -mx-5 px-5 scrollbar-hide scroll-smooth"
        >
          {/* Feature Card 1 - Smart Profile */}
          <div className="flex-shrink-0 w-[85vw] max-w-sm snap-center group">
            <div className="h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl 
                          border border-slate-700/50 p-6 backdrop-blur-md
                          hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10
                          active:scale-[0.98] transition-all duration-300">
              {/* Icon with Bounce on Hover */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 
                            flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-50 mb-3">Smart Profile</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Keep your age, weight, and fitness goals synced. Track progress with real-time insights and personalized recommendations.
              </p>
              {/* Progress Bar Example */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-emerald-400 rounded-full"></div>
                </div>
                <span className="font-semibold">75%</span>
              </div>
            </div>
          </div>

          {/* Feature Card 2 - Blood Biomarkers */}
          <div className="flex-shrink-0 w-[85vw] max-w-sm snap-center group">
            <div className="h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl 
                          border border-slate-700/50 p-6 backdrop-blur-md
                          hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10
                          active:scale-[0.98] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 
                            flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-50 mb-3">Blood Biomarkers</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Upload your blood report PDF and get instant AI-powered analysis with personalized health recommendations.
              </p>
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  PDF Upload
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  AI Analysis
                </span>
              </div>
            </div>
          </div>

          {/* Feature Card 3 - Goal Tracking */}
          <div className="flex-shrink-0 w-[85vw] max-w-sm snap-center group">
            <div className="h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl 
                          border border-slate-700/50 p-6 backdrop-blur-md
                          hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10
                          active:scale-[0.98] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 
                            flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-50 mb-3">Goal Tracking</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Set targets, monitor daily progress, and celebrate milestones with beautiful visual dashboards and insights.
              </p>
              {/* Mini Chart Visualization */}
              <div className="flex items-end gap-1 h-12">
                {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t opacity-60 hover:opacity-100 transition-opacity"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicators with Active State */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeCard === index 
                  ? 'w-8 bg-primary' 
                  : 'w-1.5 bg-slate-700 hover:bg-slate-600'
              }`}
            ></div>
          ))}
        </div>
      </section>

      {/* Trust Section - New addition for credibility */}
      <section className="px-5 py-10">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-medium text-slate-300">Trusted by healthcare professionals</span>
          </div>

          {/* Testimonial Card */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 p-6 backdrop-blur-sm">
            <div className="flex gap-1 mb-3 justify-center">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <p className="text-slate-300 italic leading-relaxed mb-4">
              "Finally, an app that makes sense of my blood reports. The AI insights helped me understand my health better than my doctor's 5-minute consultation."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500"></div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-50">Priya Sharma</p>
                <p className="text-xs text-slate-500">Fitness Enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Sticky Feel */}
      <section className="sticky bottom-0 px-5 py-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent backdrop-blur-lg border-t border-slate-800/50">
        <div className="max-w-md mx-auto">
          <p className="text-center text-slate-400 text-sm mb-4">
            Join <span className="text-primary font-semibold">10,000+ users</span> transforming their health
          </p>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full px-8 py-3.5 rounded-2xl 
                     bg-slate-800/70 border-2 border-slate-700 text-slate-200 font-semibold 
                     hover:bg-slate-800 hover:border-primary/50 hover:text-slate-50
                     active:scale-[0.97] transition-all duration-200 group"
          >
            Start Your Free Trial
            <svg 
              className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        /* Smooth scroll behavior for iOS */
        .scroll-smooth {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}
