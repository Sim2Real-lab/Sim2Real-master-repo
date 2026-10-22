import React, { useState, useEffect } from "react";
import { FadeIn } from "./FadeIn";
import { 
  Search, 
  Lightbulb, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";

// Ideathon start threshold (matches Countdown timer constant)
const IDEATHON_START = new Date("2026-10-18T15:00:00+05:30").getTime();

export function Ideathon({ onGoHome }) {
  const [isOpen, setIsOpen] = useState(() => Date.now() >= IDEATHON_START);
  const isAuthenticated = typeof window !== "undefined" && Boolean(window.IS_AUTHENTICATED);

  useEffect(() => {
    const checkStatus = () => {
      setIsOpen(Date.now() >= IDEATHON_START);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-launch teaser (if accessed before IDEATHON_START)
  if (!isOpen) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-24 relative z-20 max-w-5xl mx-auto">
        <FadeIn className="w-full">
          <div className="flex flex-col items-center text-center gap-6 p-12 md:p-20 rounded-3xl bg-white/95 backdrop-blur-2xl border border-gray-200/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <span className="px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-primary text-white shadow-md">
              Sim2Real Ideathon 2026
            </span>

            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-foreground">
              Coming Soon
            </h1>

            <div className="p-4 rounded-2xl bg-zinc-900 text-white font-mono text-sm md:text-base tracking-wide shadow-inner border border-zinc-700">
              ⏰ Registration launches on <span className="text-blue-400 font-bold">18th October 2026, 3:00 PM</span>
            </div>

            <p className="max-w-xl text-base md:text-lg text-foreground/70 font-sans leading-relaxed">
              Unleash your creativity and pitch futuristic robotics ideas! Detailed problem statements, guidelines, and registrations for the Sim2Real Ideathon will open soon.
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  // Active Ideathon View (from screenshot design)
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative z-20 max-w-6xl mx-auto font-sans">
      <FadeIn duration={0.8} className="w-full">
        {/* Main Poster Container */}
        <div className="bg-[#FAF9F5] border border-amber-900/10 rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14 relative overflow-hidden">
          
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* ── Top Header Brand Strip ── */}
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-black/5">
            {/* RoboTech Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-900 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                  <circle cx="12" cy="5" r="2"></circle>
                  <path d="M12 7v4"></path>
                  <line x1="8" y1="16" x2="8" y2="16"></line>
                  <line x1="16" y1="16" x2="16" y2="16"></line>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-none">
                  Robo<span className="text-amber-500">Tech</span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase mt-0.5">
                  Bots, Bytes & Beyond
                </span>
              </div>
            </div>

            {/* Institution / Event Badges */}
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline-flex px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Sim2Real Track
              </span>
              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                NITK Surathkal
              </span>
            </div>
          </div>

          {/* ── Hero Section: Title & Glowing Lightbulb Illustration ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
            {/* Left Typography */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 leading-[0.95] tracking-tight">
                Sim<span className="text-primary">2</span>Real
              </h1>
              <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#5B45FF] leading-[0.95] tracking-tight mt-1">
                Ideathon
              </h2>
              
              <div className="mt-4 tracking-[0.45em] text-lg sm:text-2xl font-display font-bold text-slate-800">
                2 K 2 6
              </div>

              <div className="w-16 h-1 bg-[#5B45FF] rounded-full my-6" />

              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display font-black tracking-wider text-slate-800 uppercase" style={{ WebkitTextStroke: "1px #334155", color: "transparent" }}>
                  FROM PROBLEMS
                </span>
                <span className="text-2xl sm:text-3xl font-display font-black tracking-wider text-[#5B45FF] uppercase">
                  TO POSSIBILITIES
                </span>
              </div>

              <p className="mt-4 text-slate-600 text-sm sm:text-base max-w-lg leading-relaxed">
                Step up to solve critical technological challenges. Collaborate with your team, propose innovative autonomous systems, and pitch your ideas to industry mentors.
              </p>
            </div>

            {/* Right Illustration: Glowing Lightbulb on Summit */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                
                {/* Radiant Glow Effect */}
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
                
                {/* Custom SVG Illustration */}
                <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Rolling Hills Background */}
                  <path d="M40 330 C120 280, 200 320, 280 290 C340 270, 370 290, 400 310 L400 380 L0 380 Z" fill="#E2E8F0" opacity="0.6" />
                  <path d="M180 340 C240 300, 300 270, 360 250 C380 240, 390 245, 400 250 L400 380 L180 380 Z" fill="#CBD5E1" opacity="0.8" />
                  <path d="M0 350 C80 320, 160 340, 240 330 C310 320, 360 340, 400 360 L400 380 L0 380 Z" fill="#94A3B8" opacity="0.4" />
                  
                  {/* Mountain Summit Peak with Flag */}
                  <line x1="360" y1="250" x2="360" y2="190" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                  <polygon points="360,190 395,200 360,212" fill="#5B45FF" />
                  
                  {/* Path / Cable connecting Bulb to Summit */}
                  <path d="M220 280 C270 295, 300 280, 360 250" stroke="#1E293B" strokeWidth="3" strokeDasharray="4 4" fill="none" />

                  {/* Light Rays */}
                  <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.75">
                    <line x1="220" y1="50" x2="220" y2="70" />
                    <line x1="285" y1="75" x2="272" y2="90" />
                    <line x1="315" y1="135" x2="295" y2="140" />
                    <line x1="290" y1="205" x2="275" y2="195" />
                    <line x1="155" y1="75" x2="168" y2="90" />
                    <line x1="125" y1="135" x2="145" y2="140" />
                    <line x1="150" y1="205" x2="165" y2="195" />
                  </g>

                  {/* Outer Glowing Bulb Aura */}
                  <circle cx="220" cy="140" r="72" fill="#FEF3C7" opacity="0.85" />
                  <circle cx="220" cy="140" r="54" fill="#FDE68A" />

                  {/* Glass Bulb Outline */}
                  <path 
                    d="M175 140 C175 105, 195 85, 220 85 C245 85, 265 105, 265 140 C265 162, 250 178, 245 195 L195 195 C190 178, 175 162, 175 140 Z" 
                    fill="#FEF08A" 
                    stroke="#1E293B" 
                    strokeWidth="3.5" 
                  />

                  {/* Brain / Idea Circuit Core inside the Bulb */}
                  <path 
                    d="M205 125 C205 118, 212 112, 220 112 C228 112, 235 118, 235 125 C242 125, 248 132, 248 140 C248 147, 242 153, 235 153 L205 153 C198 153, 192 147, 192 140 C192 132, 198 125, 205 125 Z" 
                    fill="#F59E0B" 
                    opacity="0.7" 
                  />
                  <line x1="220" y1="112" x2="220" y2="153" stroke="#D97706" strokeWidth="2.5" />
                  <line x1="205" y1="133" x2="235" y2="133" stroke="#D97706" strokeWidth="2.5" />

                  {/* Filament & Center Sparkle */}
                  <circle cx="220" cy="140" r="5" fill="#FFFFFF" />
                  
                  {/* Bulb Screw Base */}
                  <rect x="195" y="195" width="50" height="8" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2.5" />
                  <rect x="198" y="203" width="44" height="8" rx="2" fill="#2563EB" stroke="#1E293B" strokeWidth="2.5" />
                  <path d="M204 211 C204 216, 236 216, 236 211 Z" fill="#1D4ED8" stroke="#1E293B" strokeWidth="2.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── HOW IT WORKS? 4-Step Process Card ── */}
          <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-6 sm:p-8 mb-10 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="font-display font-bold text-sm tracking-widest text-[#4338CA] uppercase">
                HOW IT WORKS?
              </h3>
              <div className="flex-1 h-px bg-[#C7D2FE]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Step 1: Analyze */}
              <div className="flex flex-col items-center text-center p-3">
                <div className="w-14 h-14 rounded-full bg-white border border-[#C7D2FE] shadow-sm flex items-center justify-center text-[#4F46E5] mb-3">
                  <Search className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="font-display font-extrabold text-base text-slate-900 tracking-wide mb-1">
                  ANALYZE
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  Understand a real-world problem.
                </p>
              </div>

              {/* Step 2: Propose */}
              <div className="flex flex-col items-center text-center p-3">
                <div className="w-14 h-14 rounded-full bg-white border border-[#C7D2FE] shadow-sm flex items-center justify-center text-[#4F46E5] mb-3">
                  <Lightbulb className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="font-display font-extrabold text-base text-slate-900 tracking-wide mb-1">
                  PROPOSE
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  Come up with an innovative solution.
                </p>
              </div>

              {/* Step 3: Debate */}
              <div className="flex flex-col items-center text-center p-3">
                <div className="w-14 h-14 rounded-full bg-white border border-[#C7D2FE] shadow-sm flex items-center justify-center text-[#4F46E5] mb-3">
                  <MessageSquare className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="font-display font-extrabold text-base text-slate-900 tracking-wide mb-1">
                  DEBATE
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  Defend your idea with your team.
                </p>
              </div>

              {/* Step 4: Win */}
              <div className="flex flex-col items-center text-center p-3">
                <div className="w-14 h-14 rounded-full bg-white border border-[#C7D2FE] shadow-sm flex items-center justify-center text-[#4F46E5] mb-3">
                  <Trophy className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="font-display font-extrabold text-base text-slate-900 tracking-wide mb-1">
                  WIN
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  Present the best approach!
                </p>
              </div>
            </div>
          </div>

          {/* ── Bottom Information & Register Action Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            
            {/* Card 1: Registrations Open */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  REGISTRATIONS OPEN
                </span>
                <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                  18 OCTOBER
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Now Live & Accepting Teams
                </span>
              </div>
            </div>

            {/* Card 2: Prize Pool */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  PRIZE POOL
                </span>
                <span className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
                  ₹20,000
                </span>
                <span className="text-xs text-slate-500 font-medium mt-0.5">
                  Cash Rewards & Merit Certificates
                </span>
              </div>
            </div>

            {/* Card 3: Direct Registration / Dashboard Action */}
            {isAuthenticated ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-center items-center gap-3 shadow-sm text-center">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  PARTICIPANT PORTAL
                </span>
                <a
                  href="/user"
                  className="text-sm font-semibold tracking-tight px-6 py-2.5 bg-zinc-900 text-white rounded-full transition-all duration-300 hover:scale-95 hover:bg-zinc-800 shadow-none inline-block"
                >
                  Go to Dashboard
                </a>
                <span className="text-xs text-slate-500 font-medium">
                  Logged in • Access your team
                </span>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-indigo-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Official Registration
                  </span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20 font-medium">
                    Track: Ideathon
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-bold text-base text-white mb-3">
                    Join the Ideathon Today
                  </h4>

                  <a
                    href="/accounts/login/"
                    className="w-full py-3 px-4 bg-[#5B45FF] hover:bg-[#4E39E6] text-white font-sans font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer text-center"
                  >
                    Register Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>
      </FadeIn>
    </div>
  );
}
