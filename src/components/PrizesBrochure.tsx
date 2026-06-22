import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from "../lib/utils";

gsap.registerPlugin(ScrollTrigger);

const PRIZES = [
  { title: 'Second Place', pool: 'Prize Pool (TBD)', emphasis: false },
  { title: 'First Place', pool: 'Grand Prize Pool', emphasis: true },
  { title: 'Third Place', pool: 'Prize Pool (TBD)', emphasis: false }
];

/* HELPER COMPONENT: Physically stacks letters vertically */
const VerticalText = ({ word, className }: { word: string, className?: string }) => (
  <div className={cn("flex flex-col items-center leading-[0.85]", className)}>
    {word.split('').map((char, i) => (
      <span key={i}>{char}</span>
    ))}
  </div>
);

export const PrizesBrochure = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.prize-card') as HTMLElement[];
      
      gsap.fromTo(cards, 
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="prizes" className="py-32 bg-[#f4f5f7] relative">
      {/* 1. THE CENTERED PRIZES CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center" ref={containerRef}>
        
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight text-white mix-blend-exclusion relative z-50 pointer-events-none">
            Exciting Prizes Await!
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto font-sans leading-relaxed">
            Stay tuned for more detailed announcements on prize values and additional categories!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-32 items-end z-20">
          {PRIZES.map((prize, i) => (
            <div 
              key={i}
              className={cn(
                "prize-card w-full p-8 md:p-10 rounded-3xl border border-white/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-primary/30",
                prize.emphasis 
                  ? "bg-white/20 shadow-xl scale-105 z-30" 
                  : "bg-white/10 shadow-lg z-20"
              )}
            >
              {prize.emphasis && (
                <div className="inline-block text-[0.6rem] font-sans font-bold tracking-[0.2em] uppercase text-primary mb-6 bg-primary/10 px-4 py-1.5 rounded-full">
                  Grand Prize
                </div>
              )}
              <h3 className="font-display font-bold text-foreground text-3xl tracking-tighter mb-3">
                {prize.title}
              </h3>
              <p className="font-sans text-primary font-medium text-sm tracking-[0.1em] uppercase">
                {prize.pool}
              </p>
            </div>
          ))}
        </div>
      </div> 
      {/* END CENTERED CONTAINER */}

     {/* 2. THE EXTREME EDGE BROCHURE SECTION */}
      {/* Added relative positioning to anchor the centered text */}
      <div id="brochure" className="w-full px-4 md:px-12 mt-16 relative z-20 flex justify-between items-start">
        
        {/* Left Side: Antimetal Blue, Stacked Vertically */}
        <div className="flex gap-4 md:gap-8 text-[#0066FF] font-display font-extrabold text-[4vw] uppercase select-none">
          <VerticalText word="EVENT" />
          <VerticalText word="BROCHURE" />
        </div>

        {/* NEW: The Absolute Centered Text (Single line, spaced, grey, bold) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none">
          <p className="font-sans text-[9px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] whitespace-nowrap">
            Get the full rulebook, speaker list, competition guidelines, and more in our comprehensive event brochure.
          </p>
        </div>

        {/* Right Side: Black, Clickable Button, Stacked Vertically */}
        <a 
          href="/sim2real-brochure.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex gap-4 md:gap-8 text-[#1a1a1a] font-display font-extrabold text-[4vw] uppercase cursor-pointer hover:text-[#0066FF] transition-colors duration-300"
        >
          <VerticalText word="DOWNLOAD" />
          <VerticalText word="PDF" />
        </a>
        
      </div>
    </section>
  );
};