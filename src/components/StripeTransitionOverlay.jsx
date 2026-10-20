import React, { useEffect, useState } from "react";

/**
 * StripeTransitionOverlay
 * Production-quality, horizontal layered curtain stripe overlay system.
 * Top-to-bottom staggered horizontal curtains for initial load & page transitions.
 */
export function StripeTransitionOverlay({ mode = "idle", onAnimationEnd }) {
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
    // Trigger on the bottom-most layer (stripe 4) completion
    if (e.target.dataset?.stripeIndex === "4" && onAnimationEnd) {
      onAnimationEnd();
    }
  };

  const horizontalStripes = [
    { bg: "bg-[#0a1329]", top: "top-[0%]", delayClass: "stripe-delay-0" },   // Layer 1 (Top)
    { bg: "bg-[#0f1d3a]", top: "top-[20%]", delayClass: "stripe-delay-1" },  // Layer 2
    { bg: "bg-[#0066FF]", top: "top-[40%]", delayClass: "stripe-delay-2" },  // Layer 3 (Brand Blue)
    { bg: "bg-[#112244]", top: "top-[60%]", delayClass: "stripe-delay-3" },  // Layer 4
    { bg: "bg-[#080e1e]", top: "top-[80%]", delayClass: "stripe-delay-4" },  // Layer 5 (Bottom)
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
      <div className="relative w-full h-full">
        {horizontalStripes.map((stripe, idx) => (
          <div
            key={idx}
            data-stripe-index={idx}
            onAnimationEnd={handleAnimationEnd}
            className={`absolute left-0 right-0 w-full h-[20.5%] ${stripe.top} ${stripe.bg} ${
              reducedMotion ? "" : `${animationClass} ${stripe.delayClass}`
            }`}
            style={{
              willChange: "transform",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          />
        ))}

        {/* Center Minimalist Brand Accent during full curtain cover */}
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
