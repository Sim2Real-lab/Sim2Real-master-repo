import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  {
    q: "Who can participate in Sim2Real?",
    a: "Students, robotics enthusiasts from all backgrounds are welcome. We encourage diverse teams with varying skill sets to foster innovation."
  },
  {
    q: "Is there a participation fee?",
    a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."
  },
  {
    q: "What kind of support is available during the competition?",
    a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin gravida dolor sit amet lacus accumsan."
  },
  {
    q: "What are the judging criteria?",
    a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus volutpat nulla id nulla."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !leftColRef.current || !rightColRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rightColRef.current,
        start: "top top+=128", 
        end: "bottom bottom",
        pin: leftColRef.current,
        pinSpacing: false,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="faq" className="py-32 bg-[#f4f5f7] relative" ref={containerRef}>
      {/* FIX 1: Changed to w-full with px-4 md:px-12 to push to extreme edges.
      */}
      <div className="w-full px-4 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* FIX 2: Left Column forced to cols 1-4 */}
        <div className="md:col-span-5 lg:col-span-4 h-full relative">
          <div ref={leftColRef} className="w-full">
            <h2 className="text-5xl md:text-7xl font-display font-semibold italic tracking-tighter text-foreground leading-[1.1]">
             <span className='block'>Frequently</span> 
             <span className='block'>Asked</span>  
             <span className='block'>Questions</span>
            </h2>
          </div>
        </div>
        
        {/* FIX 3: Right Column forced to cols 8-12, leaving cols 5-7 totally empty for the drone */}
        <div className="md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9 flex flex-col w-full mt-4 md:mt-0" ref={rightColRef}>
          
          {/* RIPPED OUT: The top border */}
          
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className="group relative bg-transparent" /* RIPPED OUT: The bottom border */
              >
                <button 
                  className="w-full flex justify-between items-center py-6 text-left focus:outline-none bg-transparent"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {/* FIX 4: Text stays zinc-500, hovers to zinc-800, NEVER turns blue */}
                  <h3 className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] pr-8 transition-colors duration-300 text-zinc-500 group-hover:text-zinc-800">
                     {faq.q}
                  </h3>
                  
                  {/* Raw Plus Icon */}
                  <div className={`shrink-0 flex items-center justify-center transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-45 text-[#0066FF]' : 'text-zinc-400 group-hover:text-zinc-800'}`}>
                    <Plus className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                  </div>
                </button>
                
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                     {/* FIX 5: Only the answer reveals in blue */}
                     <p className="pb-8 text-[#0066FF]/80 font-sans leading-relaxed text-sm md:text-base tracking-wide pr-12">
                        {faq.a}
                     </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};