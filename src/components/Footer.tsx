export const Footer = () => {
  return (
    <footer className="relative bg-[#f4f5f7] w-full flex flex-col pt-32 pb-12 min-h-[800px] justify-end overflow-hidden z-0">
      
      {/* MASSIVE HORIZON GLOW BACKGROUND */}
      <div className="absolute bottom-0 left-0 right-0 h-[85%] pointer-events-none z-0">
         <div className="absolute inset-0 bg-gradient-to-t from-[#0066FF] via-[#0066FF]/40 to-transparent opacity-90"></div>
         <div className="absolute bottom-[-35%] left-1/2 -translate-x-1/2 w-[180%] md:w-[120%] h-[70%] bg-[#0066FF] rounded-[100%] blur-[100px] opacity-100 mix-blend-multiply"></div>
         <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[100%] h-[40%] bg-[#0044bb] rounded-[100%] blur-[80px] opacity-100 mix-blend-color-burn"></div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 relative mb-24 items-center">
        
        <div className="hidden lg:block"></div>
        
        <div className="flex flex-col items-center w-full px-6">
          
          {/* SIM2REAL Brand Block: Top */}
          <div className="flex flex-col items-center mb-16">
            <div className="font-display font-bold text-7xl md:text-9xl tracking-tighter text-black opacity-90 leading-none select-none">
              SIM2REAL
            </div>
          </div>

          {/* Quick Links & Connect: Middle */}
          <div className="flex flex-col md:flex-row gap-16 md:gap-32 text-center md:text-left">
            
            <div className="flex flex-col gap-8">
              <h4 className="font-sans text-xs md:text-sm font-extrabold uppercase tracking-[0.4em] text-black/40 mb-2">Quick Links</h4>
              <div className="flex flex-col gap-6">
                 {['Event Schedule', 'Prizes', 'NITK Official', 'Sponsor Us', 'Sim2Real - 1st Edition', 'Our Team'].map((link) => (
                 <a key={link} href="#" className="font-sans text-[11px] md:text-xs font-semibold text-black/80 hover:text-[#0066FF] uppercase tracking-[0.3em] transition-colors">
                    {link}
                 </a>
                 ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <h4 className="font-sans text-xs md:text-sm font-extrabold uppercase tracking-[0.4em] text-black/40 mb-2">Connect With Us</h4>
              <div className="flex flex-col gap-6">
                 <a href="mailto:sim2real.robotechnitk@nitk.edu.in" className="font-sans text-[11px] md:text-xs font-semibold text-black/80 hover:text-[#0066FF] uppercase tracking-[0.3em] transition-colors break-all max-w-[300px]">
                   sim2real.robotechnitk@nitk.edu.in
                 </a>
                 <p className="font-sans text-[11px] md:text-xs font-semibold text-black/60 uppercase tracking-[0.3em] leading-relaxed max-w-[300px]">
                   National Institute of Technology Karnataka, Surathkal
                 </p>
              </div>
            </div>
          </div>

          {/* Long Description: Bottom (Where it was originally) */}
          <div className="mt-20 w-full flex justify-center">
             <p className="font-sans text-[11px] md:text-xs font-bold text-black/80 uppercase tracking-[0.3em] whitespace-nowrap">
               Empowering the next generation of Robotics and UAV through immersive education and challenging competitions.
             </p>
          </div>

        </div>

        {/* RIGHT CONTENT: Map */}
        <div className="w-full flex justify-end mt-16 lg:mt-0 pr-6 lg:pr-16">
          <div className="w-full h-[300px] lg:h-[400px] max-w-[280px] lg:max-w-[360px] p-2 bg-white/40 border border-[#1a1a1a]/10 rounded-3xl shadow-xl backdrop-blur-md relative">
            <div className="w-full h-full rounded-2xl overflow-hidden relative bg-[#f4f5f7]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.6672323719605!2d74.7925102!3d13.01128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35211b768ac8f%3A0x6b100c1d46261543!2sNational%20Institute%20of%20Technology%20Karnataka%20(NITK)%20Surathkal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                className="absolute inset-0 w-full h-full filter grayscale contrast-[1.1] opacity-80"
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                title="NITK Location"
              ></iframe>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM LEGAL TEXT */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center pb-0 border-t border-white/10 w-full max-w-7xl mx-auto pt-12 px-6">
         <p className="font-sans text-[11px] md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-white">
            © 2025 Sim2Real. All Rights Reserved.
         </p>
         <p className="font-sans text-[11px] md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-white/90">
            Made with ❤️ for innovators in Robotics and Automation 🤖
         </p>
      </div>

    </footer>
  );
};