import React from "react";
import { FadeIn } from "./FadeIn";

export function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 relative z-20 max-w-7xl mx-auto border-t border-gray-200/60">
      <FadeIn>
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
            About Sim2Real
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            Simulating Reality, Engineering the Future
          </h2>
          <p className="max-w-2xl text-base md:text-lg text-foreground/70 font-sans leading-relaxed">
            Sim2Real is the premier robotics challenge hosted by Robotech NITK. We bridge the gap between virtual simulation algorithms and real-world physical robot deployment.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FadeIn delay={0.1}>
          <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                01
              </div>
              <h3 className="text-xl font-bold font-display tracking-tight text-foreground mb-3">
                Physics Simulation
              </h3>
              <p className="text-sm text-foreground/70 font-sans leading-relaxed">
                Design and validate complex autonomous algorithms, control policies, and vision pipelines inside high-fidelity 3D physics simulation environments.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                02
              </div>
              <h3 className="text-xl font-bold font-display tracking-tight text-foreground mb-3">
                Sim-to-Real Transfer
              </h3>
              <p className="text-sm text-foreground/70 font-sans leading-relaxed">
                Deploy your simulated models onto physical robotic hardware, addressing real-world domain randomization, sensor noise, and dynamics.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                03
              </div>
              <h3 className="text-xl font-bold font-display tracking-tight text-foreground mb-3">
                Mentorship & Prizes
              </h3>
              <p className="text-sm text-foreground/70 font-sans leading-relaxed">
                Compete with top engineering minds, gain mentorship from robotics researchers, and win significant cash prizes and recognition.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
