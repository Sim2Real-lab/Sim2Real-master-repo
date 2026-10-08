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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <a href="/" className="flex items-center gap-3 font-display font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
              <img src={`${import.meta.env.BASE_URL}assets/sim2real_icon.jpeg`} alt="Sim2Real Icon" className="h-8 w-8 object-contain rounded-md" />
              <span>SIM2REAL</span>
            </a>
            {/* Hamburger Icon */}
            <button
              className="md:hidden z-50 p-2 text-foreground focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop and Mobile Menu Container */}
            <div className={cn(
              "w-full md:w-auto md:flex gap-8 text-sm font-medium tracking-tight items-center transition-all duration-300 ease-in-out absolute top-[100%] left-0 md:static md:bg-transparent bg-white/95 md:border-none border-b border-gray-200 shadow-lg md:shadow-none p-6 md:p-0 flex-col md:flex-row",
              isMenuOpen ? "flex" : "hidden"
            )}>
              <a href="#timeline" className="hover:text-primary transition-colors py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Time Line</a>
              <a href="#prizes" className="hover:text-primary transition-colors py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Prizes</a>
              <a href="#brochure" className="hover:text-primary transition-colors py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Brochure</a>
              <a href="#testimonials" className="hover:text-primary transition-colors py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
              <a href="#faq" className="hover:text-primary transition-colors py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>FAQ</a>
              <a href="#queries" className="hover:text-primary transition-colors py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Queries</a>

              {!window.IS_REGISTERED && (
                <div className="flex items-center gap-2 py-2 md:py-0">
                  {!window.IS_AUTHENTICATED ? (
                    <div title="Sign In to Participate!" className="opacity-50 blur-[1px] cursor-not-allowed">
                      <span className="font-bold text-primary">Register!</span>
                    </div>
                  ) : (
                    <a href={window.PROFILE_COMPLETED ? "/user/team/manage/" : "/user/profile/"} className="font-bold text-primary hover:opacity-80 transition-colors py-2 md:py-0">
                      Register!
                    </a>
                  )}

                  <div className="relative flex items-center cursor-help text-gray-500 hover:text-primary transition-colors" title="By registering you automatically comply to T & C, Privacy Policy And Code of Conduct">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-center w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-gray-200">
                {window.IS_AUTHENTICATED ? (
                  <a href="/user" className="w-full md:w-auto text-center text-sm font-semibold tracking-tight px-6 py-2.5 bg-zinc-900 text-white rounded-full transition-all duration-300 hover:scale-95 hover:bg-zinc-800 shadow-none">
                    Go to Dashboard
                  </a>
                ) : (
                  <>
                    <a href="/accounts/login/" className="text-sm font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity">
                      Sign In
                    </a>
                    <a href="/accounts/signup/" className="text-sm font-semibold tracking-tight px-6 py-2.5 bg-zinc-900 text-white rounded-full transition-all duration-300 hover:scale-95 hover:bg-zinc-800 shadow-none whitespace-nowrap">
                      Sign Up
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Hero />

        <section id="timeline">
          <Timeline />
        </section>

        <section id="content-area" className="flex flex-col w-full overflow-hidden">
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