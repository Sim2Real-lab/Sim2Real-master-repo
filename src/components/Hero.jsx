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
      className="relative min-h-screen w-full flex bg-background pt-24 pb-12 overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between z-10">
        
        {/* ── Left Content Column ── */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-12 z-20">
          {/* Sequence 1: Main Title */}
          <div className="max-w-xl">
            <GSAPReveal
              lines={[
                `<span class="text-xl md:text-2xl font-sans tracking-tight font-medium text-foreground/80">${mainTitleLines[0]}</span>`,
                `<span class="text-6xl md:text-8xl font-display font-extrabold text-foreground uppercase tracking-tight">${mainTitleLines[1]}</span>`,
                `<span class="text-4xl md:text-6xl font-display font-medium text-foreground/90 uppercase tracking-tighter">${mainTitleLines[2]}</span>`,
                `<span class="text-6xl md:text-8xl font-display font-bold text-primary uppercase tracking-tight block">${mainTitleLines[3]}</span>`,
              ]}
              duration={1}
              stagger={0.15}
              delay={0.2}
              onComplete={handleComplete}
            />
          </div>

          {/* Sequence 2: Sub-headline */}
          <div className="max-w-lg">
            {sequenceStep >= 1 && (
              <FadeIn delay={0.1} duration={1} y={20}>
                <p className="text-lg text-foreground/70 font-sans tracking-tight leading-relaxed text-balance border-l-2 border-primary/30 pl-6">
                  Join the robotics revolution with Sim2Real Robotech NITK.
                  Explore the real impact of Robotics. Compete, create, and
                  change the future with sim2Real.
                </p>
              </FadeIn>
            )}
          </div>

          {/* Sequence 3: CTAs and Countdown Timer */}
          <div className="w-full flex flex-col gap-10 mt-2">
            {sequenceStep >= 1 && (
              <>
                <FadeIn delay={0.4} className="flex flex-wrap items-center gap-4">
                  {/* 1. Register Now */}
                  {!window.IS_REGISTERED && (
                    <div className="flex items-center gap-2">
                      {!window.IS_AUTHENTICATED ? (
                        <div
                          title="Sign In to Participate!"
                          className="px-8 py-4 bg-primary text-white font-sans font-semibold tracking-tight text-sm border border-primary opacity-50 blur-[2px] cursor-not-allowed select-none inline-block uppercase"
                        >
                          Register Now!
                        </div>
                      ) : (
                        <a
                          href="/user/team/"
                          className="px-8 py-4 bg-primary text-white font-sans font-semibold tracking-tight text-sm border border-primary transition-colors hover:bg-transparent hover:text-primary inline-block uppercase"
                        >
                          Register Now!
                        </a>
                      )}

                      <div
                        className="relative flex items-center cursor-help text-gray-500 hover:text-primary transition-colors"
                        title="By registering you automatically comply to T & C, Privacy Policy And Code of Conduct"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* 2. Go to Dashboard (if authenticated) */}
                  {window.IS_AUTHENTICATED && (
                    <a href="/user" className="px-8 py-4 bg-transparent text-foreground font-sans font-semibold tracking-tight text-sm border border-border hover:border-foreground/30 transition-colors inline-block uppercase">
                      GO TO DASHBOARD
                    </a>
                  )}

                  {/* 3. Explore More */}
                  <a href="#timeline" className="px-8 py-4 bg-primary text-white font-sans font-semibold tracking-tight text-sm border border-primary transition-colors hover:bg-transparent hover:text-primary inline-block uppercase">
                    EXPLORE MORE
                  </a>

                  {/* 4. Sign In (if not authenticated) */}
                  {!window.IS_AUTHENTICATED && (
                    <a href="/accounts/login/" className="px-8 py-4 bg-transparent text-foreground font-sans font-semibold tracking-tight text-sm border border-border hover:border-foreground/30 transition-colors inline-block uppercase">
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
<div className="hidden md:flex w-full md:w-1/2 h-[600px] relative items-center justify-center pointer-events-auto overflow-hidden">
  {sequenceStep >= 1 && (
    <FadeIn delay={0.4} duration={1.5} className="w-full h-full relative">
      
      <div className="w-full h-full scale-[1.05] origin-center relative">
        
        {/* WATERMARK REMOVAL: We make the container taller than the parent so the watermark overflows at the bottom and is hidden by the parent's overflow-hidden! 
            We shift it up by 80px so the robot remains perfectly centered. */}
        <div className="absolute top-[-80px] left-0 w-full h-[calc(100%+160px)] filter hue-rotate-[195deg] saturate-[2] brightness-[1] contrast-[1.0]">
          <Spline 
            scene="https://prod.spline.design/0hNXoMGPanwyTxgH/scene.splinecode" 
          />
        </div>
        
      </div>
    </FadeIn>
  )}
</div>

      </div>
    </section>
  );
};