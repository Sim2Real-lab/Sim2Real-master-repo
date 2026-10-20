import React, { useState, useEffect } from "react";

export function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing System...");
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const statuses = [
      "Initializing System...",
      "Loading Physics Engine...",
      "Configuring 3D Models...",
      "Sim2Real Environment Ready"
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 8;
      if (currentProgress > 100) currentProgress = 100;

      setProgress(currentProgress);

      if (currentProgress < 30) {
        setStatusText(statuses[0]);
      } else if (currentProgress < 65) {
        setStatusText(statuses[1]);
      } else if (currentProgress < 90) {
        setStatusText(statuses[2]);
      } else {
        setStatusText(statuses[3]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 700); // Duration matching fade out transition
        }, 300);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center text-white overflow-hidden transition-all duration-700 ease-out ${
        isFadingOut
          ? "opacity-0 scale-105 pointer-events-none filter blur-md"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient motion graphics */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[90px] animate-ping pointer-events-none" />

      {/* Main Motion Graphic Spinner Container */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer Orbit Ring 1 */}
        <div className="w-36 h-36 rounded-full border border-blue-500/30 border-t-blue-500 border-r-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />

        {/* Counter Orbit Ring 2 */}
        <div className="absolute w-28 h-28 rounded-full border border-cyan-500/20 border-b-cyan-400 border-l-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />

        {/* Inner Pulsing Circle */}
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-20 animate-ping" />

        {/* Center Logo Icon */}
        <div className="absolute flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900/90 border border-blue-500/40 shadow-xl shadow-blue-500/20">
          <svg
            className="w-8 h-8 text-cyan-400 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>

      {/* Brand Title */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
          SIM2REAL
        </h1>
        <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
          Robotech NITK • Simulation to Reality
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-64 md:w-80 flex flex-col gap-2 items-center">
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 rounded-full transition-all duration-150 ease-out shadow-lg shadow-cyan-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="w-full flex justify-center items-center text-xs font-mono text-zinc-400 px-1">
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
}
