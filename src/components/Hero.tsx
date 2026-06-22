import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { GSAPReveal } from './GSAPReveal';
import { FadeIn } from './FadeIn';
import { Countdown } from './Countdown';

export const Hero = () => {
  const [sequenceStep, setSequenceStep] = useState(0);

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
              onComplete={() => setSequenceStep(1)}
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
                <FadeIn delay={0.4} className="flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-primary text-white font-sans font-semibold tracking-tight text-sm border border-primary transition-colors hover:bg-transparent hover:text-primary">
                    EXPLORE MORE
                  </button>
                  <button className="px-8 py-4 bg-transparent text-foreground font-sans font-semibold tracking-tight text-sm border border-border hover:border-foreground/30 transition-colors">
                    SIGN IN
                  </button>
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
        
        {/* THE COLOR FILTER: Hue shift to deep blue + lowered brightness for the "Dark" look */}
        <div className="w-full h-full filter hue-rotate-[195deg] saturate-[2] brightness-[1] contrast-[1.0]">
          <Spline 
            scene="https://prod.spline.design/0hNXoMGPanwyTxgH/scene.splinecode" 
          />
        </div>
        
        {/* SURGICAL WATERMARK REMOVAL:
            Spline badge is usually 120x30. We use a slightly larger div 
            to ensure it's fully clipped regardless of screen size.
        */}
        <div className="absolute bottom-0 right-0 w-41.5 h-16 bg-white z-50 translate-x-2 translate-y-2" />
        
      </div>
    </FadeIn>
  )}
</div>

      </div>
    </section>
  );
};