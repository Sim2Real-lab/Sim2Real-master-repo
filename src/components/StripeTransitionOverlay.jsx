import React, { useEffect, useState } from "react";

/**
 * StripeTransitionOverlay
 * Production-quality, CSS-first full-viewport stripe overlay for initial load & route transitions.
 * Inspired by Visa motion graphics - bold, parallel navy/blue rectangular stripes.
 */
export function StripeTransitionOverlay({ mode = "idle", onAnimationEnd }) {
  // mode: "cover" (animating in to hide screen), "reveal" (animating out to show screen), or "idle" (hidden)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => setReducedMotion(e.matches);

    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  if (mode === "idle") return null;

  const handleAnimationEnd = (e) => {
    // Only trigger on the last stripe (stripe 4) to ensure entire cascade completes
    if (e.target.dataset?.stripeIndex === "4" && onAnimationEnd) {
      onAnimationEnd();
    }
  };

  const stripes = [
    { bg: "bg-[#0a1329]", delayClass: "stripe-delay-0" }, // Deep Navy
    { bg: "bg-[#0f1d3a]", delayClass: "stripe-delay-1" }, // Rich Navy
    { bg: "bg-[#0066FF]", delayClass: "stripe-delay-2" }, // Sim2Real Vibrant Blue
    { bg: "bg-[#112244]", delayClass: "stripe-delay-3" }, // Dark Slate Navy
    { bg: "bg-[#080e1e]", delayClass: "stripe-delay-4" }, // Deepest Navy
  ];

  const animationClass = mode === "cover" ? "animate-stripe-cover" : "animate-stripe-reveal";

  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      className={`fixed inset-0 z-[9999] pointer-events-auto overflow-hidden ${
        reducedMotion ? "transition-opacity duration-200" : ""
      }`}
    >
      <div className="relative w-full h-full flex">
        {stripes.map((stripe, idx) => (
          <div
            key={idx}
            data-stripe-index={idx}
            onAnimationEnd={handleAnimationEnd}
            className={`h-full w-[21%] -ml-[1%] flex-shrink-0 ${stripe.bg} ${
              reducedMotion ? "" : `${animationClass} ${stripe.delayClass}`
            }`}
            style={{
              boxShadow: "0 0 35px rgba(0,0,0,0.3)",
              willChange: "transform",
            }}
          />
        ))}

        {/* Center Minimalist Brand Accent during full cover */}
        {mode === "cover" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-white font-display font-extrabold tracking-widest text-2xl uppercase">
                SIM2REAL
              </span>
              <div className="w-12 h-0.5 bg-cyan-400 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
