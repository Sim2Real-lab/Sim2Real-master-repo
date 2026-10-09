import React, { useState, useEffect, useCallback } from "react";
import { PageTransitionContext } from "../context/PageTransitionContext";
import { StripeTransitionOverlay } from "./StripeTransitionOverlay";

export function PageTransitionProvider({ children }) {
  // mode: "initial_cover" | "reveal" | "cover" | "idle"
  const [overlayMode, setOverlayMode] = useState("cover");
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);

  // 1. Initial Page Load Sequence
  useEffect(() => {
    // Safety fallback timer to prevent screen locking if asset fails to load
    const safetyTimer = setTimeout(() => {
      setOverlayMode("reveal");
    }, 1200);

    return () => clearTimeout(safetyTimer);
  }, []);

  // 2. Start a Page / View Transition programmatically
  const startTransition = useCallback((actionCallback) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setPendingAction(() => actionCallback);
    setOverlayMode("cover");
  }, [isTransitioning]);

  // 3. Handle Animation End Sequence
  const handleAnimationEnd = useCallback(() => {
    if (overlayMode === "cover") {
      // Execute the pending view change / routing update
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      // Small pause to allow React DOM update to finalize before revealing
      setTimeout(() => {
        setOverlayMode("reveal");
      }, 50);
    } else if (overlayMode === "reveal") {
      setOverlayMode("idle");
      setIsTransitioning(false);
    }
  }, [overlayMode, pendingAction]);

  // 4. Global Link Click Interceptor for seamless internal navigation
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        anchor.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      if (href.startsWith("#") || href.startsWith("/")) {
        if (href.startsWith("#") && href.length > 1) {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            e.preventDefault();
            startTransition(() => {
              targetElement.scrollIntoView({ behavior: "instant" });
            });
          }
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [startTransition]);

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition }}>
      {children}
      <StripeTransitionOverlay
        mode={overlayMode}
        onAnimationEnd={handleAnimationEnd}
      />
    </PageTransitionContext.Provider>
  );
}
