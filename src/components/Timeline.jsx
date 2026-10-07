import { useRef } from 'react';

const TIMELINE_DATA = [
  { date: '7th October 2026 00:00AM IST to 14th October 2026 11:59PM IST', title: 'Registration', desc: 'Event Registration Starts. Click here to Register' },
  { date: '14th October 2026 5:30AM IST', title: 'Setup and Simulate Round Starts', desc: 'The problem statement is given and the Simulation Round Starts' },
  { date: 'October 17, 2026, 09:00 IST', title: 'Submission', desc: 'Submission of the Simulation of Problem statement.' },
  { date: 'October 20, 2026, 16:00 IST', title: 'Shortlist', desc: 'Results for the simulation round will be out.' },
  { date: 'October 25, 2026, 11:00 IST', title: 'Real-World Deployment', desc: 'Transition projects from simulation to hardware with mentorship support.' },
  { date: 'October 30, 2026, 15:00 IST', title: 'Closing & Awards', desc: 'Showcase your final outcomes, win prizes, and celebrate innovation.' },
];

export const Timeline = () => {
  const sectionRef = useRef(null);

  return (
    <section
      className="relative w-full overflow-hidden"
      ref={sectionRef}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="hidden md:flex md:col-span-4 lg:col-span-5 relative items-stretch justify-center min-h-full">
          
        </div>

        <div className="w-full md:col-span-8 lg:col-span-7 flex flex-col pt-32 pb-32">
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground">
              Event Schedule
            </h2>
            <p className="mt-6 text-foreground/60 font-sans leading-relaxed tracking-tight text-lg max-w-md">
              Follow the journey from simulation to reality. Each step brings
              you closer to deploying your robotics solutions in the real world.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {TIMELINE_DATA.map((item, i) => (
              <div
                key={i}
                className="timeline-node w-full bg-white/90 backdrop-blur-sm p-8 md:p-10 border border-slate-200/80 rounded-2xl shadow-sm relative overflow-hidden will-change-transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 transition-colors group-hover:bg-primary/30" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-primary font-bold text-sm shrink-0 shadow-inner">
                    {i + 1}
                  </div>
                  <div className="text-primary text-sm font-semibold tracking-wider font-sans uppercase">
                    {item.date}
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold mb-3 text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-foreground/75 font-sans tracking-tight leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};