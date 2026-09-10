import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '../lib/utils';

export const FadeIn = ({ 
  children, 
  delay = 0, 
  className,
  y = 30,
  duration = 1
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, 
        { opacity: 0, y }, 
        { opacity: 1, y: 0, duration, delay, ease: 'power3.out' }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, y, duration]);

  return <div ref={ref} className={cn("opacity-0", className)}>{children}</div>;
};
