import { useEffect, useRef, useState } from 'react';
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
  },
  {
    quote: "A transformative experience that exceeded our expectations. The resources and support provided allowed us to build robust solutions and learn immensely.",
    author: "Jane Doe",
    role: "Filler Role"
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
  const [currentIndex, setCurrentIndex] = useState(0);

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
  }, []); // Run only on mount

  const nextTestimonial = () => {
    if (currentIndex < TESTIMONIALS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevTestimonial = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    // FIX 1: Stripped 'relative' and 'overflow-hidden' to match the Prizes section exactly
    <section id="testimonials" className="py-32 bg-[#f4f5f7]" ref={sectionRef}>
      
      {/* Premium Blurred Mesh Background */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] mix-blend-multiply opacity-50 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-slate-300/40 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none"></div>

      {/* FIX 2: Switched to flex to match Prizes, stripped 'relative z-10' trap */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        
        <div className="text-center mb-16 relative z-30">
          <h2 
            id="innovators-title" 
            className="text-4xl md:text-6xl font-display font-bold text-center tracking-tight text-white mix-blend-exclusion pointer-events-none"
          >
            Hear From Our Innovators
          </h2>
        </div>
        
        {/* FIX 4: Pushed the z-20 specifically to the cards grid so they float visually over the drone */}
        <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-center gap-4 md:gap-8">
          
          <button 
            onClick={prevTestimonial}
            className={`flex-shrink-0 p-4 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 hover:scale-110 hover:shadow-2xl transition-all z-30 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div className="flex-1 w-full max-w-3xl overflow-hidden p-6 -m-6 rounded-[2.5rem]">
            <div 
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {TESTIMONIALS.map((t, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2 py-2">
                  <div className="testimonial-card flex flex-col justify-between h-full p-10 md:p-14 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-blue-900/5 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer relative group">
                    <div className="absolute top-10 text-primary/10 font-display text-8xl leading-none rotate-180 selection:bg-transparent -ml-2 select-none pointer-events-none">
                      "
                    </div>
                    <p className="text-xl md:text-3xl font-sans text-foreground/80 leading-relaxed font-semibold z-10 relative mb-12 tracking-tight min-h-[160px]">
                      <SplitQuote text={t.quote} />
                    </p>
                    <div className="mt-auto relative z-10">
                      <div className="font-bold font-sans text-foreground text-xl tracking-tight">{t.author}</div>
                      <div className="text-sm font-semibold text-primary mt-1 uppercase tracking-wider">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={nextTestimonial}
            className={`flex-shrink-0 p-4 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 hover:scale-110 hover:shadow-2xl transition-all z-30 ${currentIndex === TESTIMONIALS.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          
        </div>
      </div>
    </section>
  );
};