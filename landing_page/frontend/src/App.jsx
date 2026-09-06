import { useState, useEffect } from "react";
import { Hero } from "./components/Hero";
import { Timeline } from "./components/Timeline";
import { PrizesBrochure } from "./components/PrizesBrochure";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { ContactMap } from "./components/ContactMap";
import { Footer } from "./components/Footer";
import { DroneScene } from "./components/DroneScene";
import { CanvasErrorBoundary } from "./components/CanvasErrorBoundary";
import { cn } from "./lib/utils";

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <CanvasErrorBoundary>
        <DroneScene />
      </CanvasErrorBoundary>

      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
        <nav
          className={cn(
            "fixed top-0 w-full p-6 z-50 transition-all duration-300",
            scrolled
              ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm text-foreground py-4"
              : "bg-transparent border-transparent text-foreground py-6"
          )}
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="font-display font-bold text-2xl tracking-tighter">
              SIM2REAL
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium tracking-tight">
              <a href="#timeline" className="hover:text-primary transition-colors">Time Line</a>
              <a href="#prizes" className="hover:text-primary transition-colors">Prizes</a>
              <a href="#brochure" className="hover:text-primary transition-colors">Brochure</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
              <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
              <a href="#queries" className="hover:text-primary transition-colors">Queries</a>
            </div>
            <div className="flex gap-4 items-center">
              <button className="text-sm font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity">
                Sign In
              </button>
              <button className="text-sm font-semibold tracking-tight px-6 py-2.5 bg-zinc-900 text-white rounded-full transition-all duration-300 hover:scale-95 hover:bg-zinc-800 shadow-none">
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        <Hero />

        <section id="timeline">
          <Timeline />
        </section>

        <section id="content-area" className="min-h-[350vh] ">
          <PrizesBrochure />
          <Testimonials />
          <FAQ />
          <ContactMap />
        </section>

        <footer id="footer">
          <Footer />
        </footer>
      </main>
    </>
  );
}

export default App;