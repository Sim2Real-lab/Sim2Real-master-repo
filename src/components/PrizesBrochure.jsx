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

const JUDGES = [
  { image: 'https://i.pravatar.cc/300?img=47' },
  { image: 'https://i.pravatar.cc/300?img=11' },
  { image: 'https://i.pravatar.cc/300?img=32' }
];

/* HELPER COMPONENT: Physically stacks letters vertically */
const VerticalText = ({ word, className }) => (
  <div className={cn("flex flex-col items-center leading-[0.85]", className)}>
    {word.split('').map((char, i) => (
      <span key={i}>{char}</span>
    ))}
  </div>
);

export const PrizesBrochure = () => {
  const containerRef = useRef(null);
  const judgesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const prizeCards = gsap.utils.toArray('.prize-card');
      const judgeCards = gsap.utils.toArray('.judge-card');
      
      gsap.fromTo(prizeCards, 
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: prizeCards[0],
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      if (judgeCards.length > 0) {
        gsap.fromTo(judgeCards, 
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.2, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: judgesRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="prizes" className="py-16 md:py-32 bg-[#f4f5f7] relative">
      {/* 1. THE CENTERED PRIZES CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center" ref={containerRef}>
        
        {/* OUR COLLABORATORS SECTION */}
        <div className="text-center mb-24 z-20 relative">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 tracking-tight text-foreground">
            Our Collaborators
          </h2>
          <div className="flex justify-center items-center">
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300">
              <img 
                src="/static/landing_page/logo.jpeg" 
                alt="Engineer NITK Logo" 
                className="h-20 md:h-28 w-auto object-contain rounded-xl"
              />
              <span className="font-display font-bold text-lg md:text-xl tracking-widest text-zinc-900 uppercase">
                ENGINEER
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight text-white mix-blend-exclusion relative z-30 pointer-events-none">
            Exciting Prizes Await!
          </h2>
          <p id="prize-text" className="text-foreground/60 max-w-2xl mx-auto font-sans leading-relaxed">
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

        {/* JUDGES SECTION */}
        <div className="text-center mb-16 w-full" ref={judgesRef}>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-12 tracking-tight text-white mix-blend-exclusion relative z-30 pointer-events-none">
            Meet Our Judges
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto font-sans leading-relaxed mb-12">
             Judges and Speakers to be revealed soon!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto relative z-20">
            {JUDGES.map((judge, i) => (
              <div 
                key={i}
                className="judge-card flex flex-col items-center p-8 bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-900/10"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-md">
                  <img src={judge.image} alt="Judge" className="w-full h-full object-cover blur-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> 
      {/* END CENTERED CONTAINER */}

      {/* 2. BROCHURE SECTION */}
      <div id="brochure" className="w-full px-4 md:px-12 mt-16 relative z-20 flex justify-center">
        <div className="w-full max-w-7xl flex flex-col items-center justify-center gap-8 border-[1px] border-black rounded-[5rem] py-16 px-16 md:px-32">
          
          {/* Top: Event Brochure */}
          <div className="text-[#0066FF] font-display font-extrabold text-[4vw] uppercase select-none">
            EVENT BROCHURE
          </div>

          {/* Middle: The Centered Text */}
          <div className="w-full flex justify-center pointer-events-none px-4">
            <p className="font-sans text-[12px] md:text-[14px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-center">
              Get the full rulebook, speaker list, competition guidelines, and more in our comprehensive event brochure.
            </p>
          </div>

          {/* Bottom: Download PDF Link */}
          <a 
            href="/sim2real-brochure.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#1a1a1a] font-display font-extrabold text-[4vw] uppercase cursor-pointer hover:text-[#0066FF] transition-colors duration-300"
          >
            DOWNLOAD PDF
          </a>
          
        </div>
      </div>
    </section>
  );
};