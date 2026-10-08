import { useState, useEffect, lazy, Suspense } from "react";
import { Hero } from "./components/Hero";
import { Timeline } from "./components/Timeline";
import { PrizesBrochure } from "./components/PrizesBrochure";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { ContactMap } from "./components/ContactMap";
import { Footer } from "./components/Footer";
import { CanvasErrorBoundary } from "./components/CanvasErrorBoundary";
import { cn } from "./lib/utils";

const DroneScene = lazy(() => import('./components/DroneScene').then(m => ({ default: m.DroneScene })));

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
        <Suspense fallback={null}>
          <DroneScene />
        </Suspense>
      </CanvasErrorBoundary>

      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
        <nav
          className={cn(
            "fixed top-0 w-full p-6 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm text-foreground",
            scrolled ? "py-4" : "py-6"
          )}
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <a href="/" className="flex items-center gap-3 font-display font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
              <img src={`${import.meta.env.BASE_URL}assets/sim2real_icon.jpeg`} alt="Sim2Real Icon" className="h-8 w-8 object-contain rounded-md" />
              <span>SIM2REAL</span>
            </a>
            <div className="hidden md:flex gap-8 text-sm font-medium tracking-tight">
              <a href="#timeline" className="hover:text-primary transition-colors">Time Line</a>
              <a href="#prizes" className="hover:text-primary transition-colors">Prizes</a>
              <a href="#brochure" className="hover:text-primary transition-colors">Brochure</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
              <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
              <a href="#queries" className="hover:text-primary transition-colors">Queries</a>
              
              {!window.IS_REGISTERED && (
                <div className="flex items-center gap-1">
                  <a
                    href={window.IS_AUTHENTICATED ? (window.PROFILE_COMPLETED ? "/user/team/manage/" : "/user/profile/") : "/accounts/signup/"}
                    className="font-bold text-primary hover:opacity-80 transition-colors"
                  >
                    Register!
                  </a>
                  
                  <div className="relative flex items-center cursor-help text-gray-500 hover:text-primary transition-colors" title="By registering you automatically comply to T & C, Privacy Policy And Code of Conduct">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4 items-center">
              {window.IS_AUTHENTICATED ? (
                <a href="/user" className="text-sm font-semibold tracking-tight px-6 py-2.5 bg-zinc-900 text-white rounded-full transition-all duration-300 hover:scale-95 hover:bg-zinc-800 shadow-none">
                  Go to Dashboard
                </a>
              ) : (
                <>
                  <a href="/accounts/login/" className="text-sm font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity">
                    Sign In
                  </a>
                  <a href="/accounts/signup/" className="text-sm font-semibold tracking-tight px-6 py-2.5 bg-zinc-900 text-white rounded-full transition-all duration-300 hover:scale-95 hover:bg-zinc-800 shadow-none">
                    Sign Up
                  </a>
                </>
              )}
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