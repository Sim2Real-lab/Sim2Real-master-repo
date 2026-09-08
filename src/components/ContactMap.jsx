export const ContactMap = () => {
  return (
    <section id="queries" className="relative py-32 bg-[#f4f5f7] flex flex-col pt-32 pb-0 overflow-hidden">
      
      {/* Background Mesh (shared with Testimonials aesthetic) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[120px] mix-blend-multiply opacity-50 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 w-full mb-32 relative z-10">
        <h2 id="contact-heading" className="text-4xl md:text-6xl font-display font-bold mb-10 text-center tracking-tight text-foreground">
          Have Questions? Let's Connect.
        </h2>
        
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 md:p-12 rounded-3xl shadow-xl shadow-blue-900/5">
          <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold tracking-wider uppercase text-foreground/60">Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-slate-300 py-3.5 px-4 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all font-sans text-foreground shadow-sm focus:shadow-inner" 
                  placeholder="Jane Doe" 
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold tracking-wider uppercase text-foreground/60">Email</label>
                <input 
                  type="email" 
                  className="w-full rounded-xl border border-slate-300 py-3.5 px-4 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all font-sans text-foreground shadow-sm focus:shadow-inner" 
                  placeholder="jane@example.com" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold tracking-wider uppercase text-foreground/60">Institution</label>
              <input 
                type="text" 
                className="w-full rounded-xl border border-slate-300 py-3.5 px-4 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all font-sans text-foreground shadow-sm focus:shadow-inner" 
                placeholder="NITK Surathkal" 
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold tracking-wider uppercase text-foreground/60">Message</label>
              <textarea 
                className="w-full rounded-xl border border-slate-300 py-3.5 px-4 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all font-sans text-foreground shadow-sm focus:shadow-inner resize-none min-h-[140px]" 
                placeholder="How can we help?" 
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-2">
              
              {/* CSS Only ReCaptcha Mockup */}
              <div className="flex items-center justify-between bg-white border border-slate-300 p-3 rounded-lg w-[300px] shadow-sm select-none">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 border-2 border-slate-300 rounded-[4px] relative bg-white cursor-pointer hover:border-slate-400 group flex items-center justify-center">
                    <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                    <svg className="w-5 h-5 text-green-500 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground/80 font-medium">I'm not a robot</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 opacity-40 flex items-center justify-center mb-1">
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#0066FF]">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                     </svg>
                  </div>
                  <span className="text-[9px] text-foreground/40 font-semibold tracking-tighter">reCAPTCHA</span>
                  <span className="text-[8px] text-foreground/40 tracking-tighter">Privacy - Terms</span>
                </div>
              </div>

              <button type="submit" className="px-10 py-4 bg-zinc-900 text-white font-sans font-bold tracking-tight text-sm rounded-full hover:scale-95 hover:bg-zinc-800 transition-all duration-300 shadow-none">
                SUBMIT QUERY
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
