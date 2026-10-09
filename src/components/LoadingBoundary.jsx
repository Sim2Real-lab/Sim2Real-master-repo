import React from "react";

/**
 * LoadingBoundary
 * Reusable component-level loading primitive.
 * Renders lightweight stripe skeleton placeholders with subtle shimmer animations.
 */
export function LoadingBoundary({ isLoading, children, fallback, type = "card", count = 1 }) {
  if (!isLoading) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="w-full grid gap-4" aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 p-6 border border-zinc-200/60 shadow-sm"
        >
          {/* Skeleton Header Stripe */}
          <div className="h-6 w-1/3 bg-zinc-200 dark:bg-zinc-700/60 rounded-md mb-4 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-zinc-600/40 to-transparent animate-stripe-shimmer" />
          </div>

          {/* Skeleton Body Stripes */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-zinc-200/80 dark:bg-zinc-700/40 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-zinc-600/40 to-transparent animate-stripe-shimmer" />
            </div>
            <div className="h-4 w-4/5 bg-zinc-200/80 dark:bg-zinc-700/40 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-zinc-600/40 to-transparent animate-stripe-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
