import { useState, useCallback } from 'react';
import Spline from '@splinetool/react-spline';
import { GSAPReveal } from './GSAPReveal';
import { FadeIn } from './FadeIn';
import { Countdown } from './Countdown';

export const Hero = () => {
  const [sequenceStep, setSequenceStep] = useState(0);
  
  const handleComplete = useCallback(() => {
    setSequenceStep(1);
  }, []);

  const mainTitleLines = [
    "Let's explore the power of",
    'ROBOTICS',
    'WITH',
    'SIM2REAL',
  ];

  return (
    <section
      id="hero"
      className="relative w-full flex bg-background pt-28 pb-12 overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between z-10 gap-12 lg:gap-0 mt-8 mb-8 lg:mt-0 lg:mb-0">
        
        {/* ── Left Content Column ── */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-12 z-20">
          {/* Sequence 1: Main Title */}
          <div className="max-w-xl w-full">
            <GSAPReveal
              lines={[
                `<span class="text-lg md:text-2xl font-sans tracking-tight font-medium text-foreground/80 break-words block">${mainTitleLines[0]}</span>`,
                `<span class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold text-foreground uppercase tracking-tight block break-words leading-[1.1]">${mainTitleLines[1]}</span>`,
                `<span class="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-foreground/90 uppercase tracking-tighter block break-words leading-tight mt-2 mb-2">${mainTitleLines[2]}</span>`,
                `<span class="text-[clamp(2.5rem,12vw,4rem)] sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-primary uppercase tracking-tight block whitespace-nowrap leading-[1.1]">${mainTitleLines[3]}</span>`,
              ]}
              duration={1}
              stagger={0.15}
              delay={0.2}
              onComplete={handleComplete}
            />
          </div>

          {/* Sequence 2: Sub-headline */}
          <div className="max-w-lg w-full">
            {sequenceStep >= 1 && (
              <FadeIn delay={0.1} duration={1} y={20}>
                <p className="text-base md:text-lg text-foreground/70 font-sans tracking-tight leading-relaxed text-balance border-l-2 border-primary/30 pl-4 md:pl-6">
                  Join the robotics revolution with Sim2Real Robotech NITK.
                  Explore the real impact of Robotics. Compete, create, and
                  change the future with sim2Real.
                </p>
              </FadeIn>
            )}
          </div>

          {/* Sequence 3: CTAs and Countdown Timer */}
          <div className="w-full flex flex-col gap-8 md:gap-10 mt-2">
            {sequenceStep >= 1 && (
              <>
                <FadeIn delay={0.4} className="flex flex-col sm:flex-row flex-wrap gap-4 w-full">
                  <a href="#timeline" className="px-6 md:px-8 py-4 bg-primary text-white font-sans font-semibold tracking-tight text-sm border border-primary transition-colors hover:bg-transparent hover:text-primary inline-block text-center w-full sm:w-auto">
                    EXPLORE MORE
                  </a>
                  {window.IS_AUTHENTICATED ? (
                    <a href="/user" className="px-6 md:px-8 py-4 bg-transparent text-foreground font-sans font-semibold tracking-tight text-sm border border-border hover:border-foreground/30 transition-colors inline-block text-center w-full sm:w-auto">
                      GO TO DASHBOARD
                    </a>
                  ) : (
                    <a href="/accounts/login/" className="px-6 md:px-8 py-4 bg-transparent text-foreground font-sans font-semibold tracking-tight text-sm border border-border hover:border-foreground/30 transition-colors inline-block text-center w-full sm:w-auto">
                      SIGN IN
                    </a>
                  )}
                </FadeIn>

                <FadeIn delay={0.6}>
                  <Countdown />
                </FadeIn>
              </>
            )}
          </div>
        </div>

{/* ── Right Decorative Column (Spline Robot Integration) ── */}
<div className="flex w-full md:w-1/2 h-[350px] sm:h-[450px] md:h-[600px] relative items-center justify-center pointer-events-auto mt-8 md:mt-0">
  {sequenceStep >= 1 && (
    <FadeIn delay={0.4} duration={1.5} className="w-full h-full relative flex items-center justify-center">
      
      <style>{`
        /* Remove the Built with Spline watermark link universally within this container */
        .spline-container-wrapper a[href*="spline.design"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>

      {/* Increased mobile scale from [1.0] to [1.25] per user request (~25% larger) */}
      <div className="spline-container-wrapper w-full h-full scale-[1.25] sm:scale-[1.1] md:scale-[1.05] origin-center relative flex items-center justify-center">
        
        {/* Simple rendering without hacks, allowing the Spline canvas to position itself natively inside the flex container */}
        <Spline 
          className="filter hue-rotate-[195deg] saturate-[2] brightness-[1] contrast-[1.0]"
          scene="https://prod.spline.design/0hNXoMGPanwyTxgH/scene.splinecode" 
        />
        
      </div>
    </FadeIn>
  )}
</div>

      </div>
    </section>
  );
};