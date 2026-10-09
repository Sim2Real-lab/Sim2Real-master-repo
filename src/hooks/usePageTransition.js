import { useContext } from "react";
import { PageTransitionContext } from "../context/PageTransitionContext";

export function usePageTransition() {
  return useContext(PageTransitionContext);
}
