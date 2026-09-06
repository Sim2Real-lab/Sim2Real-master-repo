import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: "Sim2Real provided an unparalleled platform to test our algorithms in a dynamic environment.",
    author: "Team RosLeeLa",
    role: "Participants"
  },
  {
    quote: "The workshops were incredibly insightful, bridging the gap between theoretical and practical robotics. This competition truly pushes the boundaries of innovation.",
    author: "Dr. Mervin Joe Thomas",
    role: "Faculty Advisor"
  }
];

const SplitQuote = ({ text }) => {
  return (
    <span className="inline-block">
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-2 mb-1 align-top">
          <span className="quote-word inline-block translate-y-[120%] opacity-0">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

export const Testimonials = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.testimonial-card');
      
      cards.forEach((card) => {
        const words = card.querySelectorAll('.quote-word');
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
            toggleActions: "play none none reverse"
          }
        });

        tl.fromTo(card, 
          { y: 50, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        )
        .to(words, {
          y: "0%",
          opacity: 1,
          duration: 0.6,
          stagger: 0.03,
          ease: "power3.out"
        }, "-=0.4");
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    // FIX 1: Stripped 'relative' and 'overflow-hidden' to match the Prizes section exactly
    <section id="testimonials" className="py-32 bg-[#f4f5f7]" ref={sectionRef}>
      
      {/* Premium Blurred Mesh Background */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] mix-blend-multiply opacity-50 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-slate-300/40 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none"></div>

      {/* FIX 2: Switched to flex to match Prizes, stripped 'relative z-10' trap */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        
        {/* Wrapped Header in Card UI */}
        <div className="p-8 md:p-10 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-blue-900/5 mb-16 relative z-50">
          <h2 
            id="innovators-title" 
            className="text-4xl md:text-6xl font-display font-bold text-center tracking-tight text-foreground pointer-events-none"
          >
            Hear From Our Innovators
          </h2>
        </div>
        
        {/* FIX 4: Pushed the z-20 specifically to the cards grid so they float visually over the drone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-20 w-full">
          {TESTIMONIALS.map((t, i) => (
            <div 
              key={i} 
              className="testimonial-card flex flex-col justify-between h-full p-10 md:p-12 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-blue-900/5 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer relative group"
            >
              <div className="absolute top-10 text-primary/10 font-display text-8xl leading-none rotate-180 selection:bg-transparent -ml-2 select-none pointer-events-none">
                "
              </div>
              <p className="text-xl md:text-2xl font-sans text-foreground/80 leading-relaxed font-semibold z-10 relative mb-12 tracking-tight">
                <SplitQuote text={t.quote} />
              </p>
              <div className="mt-auto relative z-10">
                <div className="font-bold font-sans text-foreground text-lg tracking-tight">{t.author}</div>
                <div className="text-sm font-semibold text-primary mt-1 uppercase tracking-wider">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};