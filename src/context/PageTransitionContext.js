import { createContext } from "react";

export const PageTransitionContext = createContext({
  isTransitioning: false,
  startTransition: () => {},
});
