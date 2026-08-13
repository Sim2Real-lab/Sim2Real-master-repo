export const Footer = () => {
  return (
    <footer className="relative bg-[#f4f5f7] w-full flex flex-col pt-8 pb-8 px-4 md:px-8 overflow-hidden z-0 items-center">
      
      {/* #FFF2DB Colored Panel */}
      <div className="w-full max-w-7xl mx-auto bg-[#FFF2DB] px-8 md:px-16 pt-16 pb-8 relative z-10 shadow-sm">
        
        {/* Top Section: SIM2REAL and Description */}
        <div className="w-full mb-24 relative z-10">
          <div className="font-display font-bold text-5xl md:text-7xl tracking-tighter text-black opacity-90 leading-none select-none mb-8">
            SIM2REAL
          </div>
          <p className="font-sans text-[11px] md:text-xs font-bold text-black/80 uppercase tracking-[0.3em] leading-relaxed w-full">
            Empowering the next generation of Robotics and UAV through immersive education and challenging competitions.
          </p>
        </div>

        {/* 2-Column Grid Layout: Quick Links/Connect & Map */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 z-10 relative mb-[15px] items-start">
          
          {/* LEFT COLUMN: Links & Connect */}
          <div className="flex flex-col sm:flex-row gap-16 md:gap-32 text-left w-full">
            
            <div className="flex flex-col gap-8">
              <h4 className="font-sans text-xs md:text-sm font-extrabold uppercase tracking-[0.4em] text-black/40 mb-6">Quick Links</h4>
              <div className="flex flex-col gap-6">
                 {['Event Schedule', 'Prizes', 'NITK Official', 'Sponsor Us', 'Sim2Real - 1st Edition', 'Our Team'].map((link) => (
                 <a key={link} href="#" className="font-sans text-[11px] md:text-xs font-semibold text-black/80 hover:text-[#0066FF] uppercase tracking-[0.3em] transition-colors relative z-20">
                    {link}
                 </a>
                 ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <h4 className="font-sans text-xs md:text-sm font-extrabold uppercase tracking-[0.4em] text-black/40 mb-6">Connect With Us</h4>
              <div className="flex flex-col gap-6">
                 <a href="mailto:sim2real.robotechnitk@nitk.edu.in" className="font-sans text-[11px] md:text-xs font-semibold text-black/80 hover:text-[#0066FF] uppercase tracking-[0.3em] transition-colors break-all max-w-[280px] relative z-20">
                   sim2real.robotechnitk@nitk.edu.in
                 </a>
                 <p className="font-sans text-[11px] md:text-xs font-semibold text-black/60 uppercase tracking-[0.3em] leading-relaxed max-w-[280px]">
                   National Institute of Technology Karnataka, Surathkal
                 </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Map */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full h-[400px] lg:h-[500px] max-w-full lg:max-w-[500px] p-2 bg-white/40 border border-[#1a1a1a]/10 rounded-3xl shadow-xl backdrop-blur-md relative z-20">
              <div className="w-full h-full rounded-2xl overflow-hidden relative bg-[#f4f5f7]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.6672323719605!2d74.7925102!3d13.01128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35211b768ac8f%3A0x6b100c1d46261543!2sNational%20Institute%20of%20Technology%20Karnataka%20(NITK)%20Surathkal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0, pointerEvents: 'auto' }} 
                  allowFullScreen 
                  loading="lazy"
                  title="NITK Location"
                ></iframe>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM LEGAL TEXT */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-0 border-t border-black/10 w-full pt-8 mt-12">
           <p className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-black/80">
              © 2025 Sim2Real. All Rights Reserved.
           </p>
           <p className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-black/80">
              Made with ❤️ for innovators in Robotics and Automation 🤖
           </p>
        </div>

      </div>
    </footer>
  );
};