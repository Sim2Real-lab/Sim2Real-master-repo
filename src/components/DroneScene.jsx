import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { DroneModel } from './DroneModel';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function DroneController({ droneRef, proxy, isMobile }) {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    const group = droneRef.current;
    const p = proxy.current;
    if (!group || !p) return;
    elapsed.current += delta;
    const idleY = Math.sin(elapsed.current * 1.6) * 0.06;
    const idleRoll = Math.sin(elapsed.current * 0.9) * 0.025;
    // On narrow mobile screens, adapt horizontal position so it stays in viewport
    const posX = isMobile ? p.x * 0.25 : p.x;
    group.position.set(posX, p.y + idleY, p.z);
    group.rotation.set(p.rotX, p.rotY, p.rotZ + idleRoll);
    const s = isMobile ? p.scale * 0.85 : p.scale;
    group.scale.set(s, s, s);
  });
  return null;
}

export function DroneScene() {
  const droneRef = useRef(null);
  const gsapCtx = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const proxy = useRef({
    x: -5, y: 6, z:0, rotX: 0.8, rotY: 0, rotZ: 0 , scale: 0.02,
  });

useEffect(() => {
    gsapCtx.current = gsap.context(() => {
      
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#timeline',
          start: 'top 85%',
          endTrigger: '#footer',
          end: 'top bottom-=150px',
          scrub: 1.5,
        },
      });

      timeline
        // Phase 1: Lock to the LEFT side. 
        .to(proxy.current, {
          x: -5, 
          y: 0, 
          z: 0, 
          scale: 0.01, 
          rotX: 0.3, 
          rotY: 0.15, 
          rotZ: 0.15, 
          ease: 'none', 
          duration: 55, 
        })
        
        // Phase 2: Move to EXACT MIDDLE. 
        .to(proxy.current, {
          x: -2.5, 
          y: 0, 
          z: 0, 
          scale: 0.02, 
          rotX: 0.3, 
          rotY: 0.3, 
          rotZ: -0.05, 
          ease: 'power2.inOut', 
          duration: 20, 
        })
        
        // Phase 3: Hold & Exit. 
        // Start the exit immediately after Phase 2 (removed the +=40 delay) so it leaves right before Event Brochure
        .to(proxy.current, {
          y: 80, 
          scale: 0.01, 
          rotX: -0.2, 
          rotY: 0.8, 
          rotZ: 0, 
          ease: 'power2.in', 
          duration: 20,
        }, "+=0")
        
        // Padding: Keep the timeline running invisibly so Phase 1 & 2 scroll timings remain completely untouched
        .to({}, { duration: 40 }); 
      
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });

    return () => gsapCtx.current?.revert();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-[15] pointer-events-none" aria-hidden="true">
      <Canvas 
        gl={{ 
          alpha: true, 
          antialias: false,
          powerPreference: 'high-performance' 
        }} 
        dpr={isMobile ? [1, 1.2] : [1, 2]} 
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
        
        {/* LIGHTING */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" castShadow={!isMobile} />
        <directionalLight position={[-4, -3, -5]} intensity={0.5} color="#4488ff" />
        <spotLight position={[0, 12, 2]} angle={0.25} penumbra={1} intensity={0.4} color="#ffffff" />
        <Environment preset="city" />

        {/* DRONE */}
        <Suspense fallback={null}>
          <DroneModel ref={droneRef} isMobile={isMobile} />
        </Suspense>
        <DroneController droneRef={droneRef} proxy={proxy} isMobile={isMobile} />

      </Canvas>
    </div>
  );
}