import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '../lib/utils';

export const GSAPReveal = ({ 
  lines, 
  className, 
  delay = 0, 
  onComplete,
  stagger = 0.15,
  duration = 1.2
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const elements = containerRef.current.querySelectorAll('.reveal-text');
      gsap.set(elements, { y: '100%' });
      
      const tl = gsap.timeline({
        delay,
        onComplete,
      });
      
      tl.to(elements, {
        y: '0%',
        duration,
        stagger,
        ease: 'power4.out',
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, [delay, onComplete, stagger, duration]);

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-1 md:gap-2", className)}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden leading-[1.1] pb-2">
          <div className="reveal-text translate-y-full" dangerouslySetInnerHTML={{ __html: line }}>
          </div>
        </div>
      ))}
    </div>
  );
};


