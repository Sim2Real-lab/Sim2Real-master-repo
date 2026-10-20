import React from "react";
import { FadeIn } from "./FadeIn";

export function Ideathon({ onGoHome }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24 relative z-20 max-w-5xl mx-auto">
      <FadeIn className="w-full">
        <div className="flex flex-col items-center text-center gap-6 p-12 md:p-20 rounded-3xl bg-white/90 backdrop-blur-2xl border border-gray-200/80 shadow-2xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <span className="px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-primary text-white shadow-md">
            Sim2Real Ideathon 2026
          </span>

          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-foreground">
            Coming Soon
          </h1>

          <div className="p-4 rounded-2xl bg-zinc-900 text-white font-mono text-sm md:text-base tracking-wide shadow-inner border border-zinc-700">
            ⏰ Stay tuned till <span className="text-blue-400 font-bold">17th October 2026</span>
          </div>

          <p className="max-w-xl text-base md:text-lg text-foreground/70 font-sans leading-relaxed">
            Unleash your creativity and pitch futuristic robotics ideas! Detailed problem statements, guidelines, and registrations for the Sim2Real Ideathon launch on October 17th.
          </p>

          <div className="pt-4">
            <button
              onClick={onGoHome}
              className="px-8 py-4 bg-primary text-white font-sans font-semibold tracking-tight text-sm rounded-full border border-primary hover:bg-primary/90 transition-all transform hover:scale-105 uppercase shadow-lg shadow-primary/20 cursor-pointer"
            >
              Explore Sim2Real
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
