import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { DroneModel } from './DroneModel';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

gsap.registerPlugin(ScrollTrigger);

function DroneController({ droneRef, proxy }) {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    const group = droneRef.current;
    const p = proxy.current;
    if (!group || !p) return;
    elapsed.current += delta;
    const idleY = Math.sin(elapsed.current * 1.6) * 0.06;
    const idleRoll = Math.sin(elapsed.current * 0.9) * 0.025;
    group.position.set(p.x, p.y + idleY, p.z);
    group.rotation.set(p.rotX, p.rotY, p.rotZ + idleRoll);
    const s = p.scale;
    group.scale.set(s, s, s);
  });
  return null;
}

export function DroneScene() {
  const droneRef = useRef(null);
  const gsapCtx = useRef(null);

const initialY = typeof window !== 'undefined' && window.innerWidth < 1024 ? 30 : 6;
  const proxy = useRef({
    x: -5, y: initialY, z:0, rotX: 0.8, rotY: 0, rotZ: 0 , scale: 0.02,
  });

useEffect(() => {
    gsapCtx.current = gsap.context(() => {
      let mm = gsap.matchMedia();
      
      // 1. DESKTOP >= 1024px - ORIGINAL BEHAVIOR
      mm.add("(min-width: 1024px)", () => {
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
          .to(proxy.current, { x: -5, y: 0, z: 0, scale: 0.01, rotX: 0.3, rotY: 0.15, rotZ: 0.15, ease: 'none', duration: 55 })
          .to(proxy.current, { x: -2.5, y: 0, z: 0, scale: 0.02, rotX: 0.3, rotY: 0.3, rotZ: -0.05, ease: 'power2.inOut', duration: 20 })
          .to(proxy.current, { y: 80, scale: 0.01, rotX: -0.2, rotY: 0.8, rotZ: 0, ease: 'power2.in', duration: 20 }, "+=0")
          .to({}, { duration: 40 }); 
      });

      // 2. TABLET 768px - 1023px
      mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
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
          .to(proxy.current, { x: -3.0, y: 0, z: 0, scale: 0.008, rotX: 0.3, rotY: 0.15, rotZ: 0.15, ease: 'none', duration: 55 })
          .to(proxy.current, { x: -1.5, y: 0, z: 0, scale: 0.015, rotX: 0.3, rotY: 0.3, rotZ: -0.05, ease: 'power2.inOut', duration: 20 })
          .to(proxy.current, { y: 80, scale: 0.005, rotX: -0.2, rotY: 0.8, rotZ: 0, ease: 'power2.in', duration: 20 }, "+=0")
          .to({}, { duration: 40 }); 
      });

      // 4. MOBILE < 768px
      mm.add("(max-width: 767px)", () => {
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
          .to(proxy.current, { x: -1.1, y: 0, z: -1, scale: 0.011, rotX: 0.3, rotY: 0.15, rotZ: 0.15, ease: 'none', duration: 55 })
          .to(proxy.current, { x: -0.85, y: 0, z: -0.5, scale: 0.013, rotX: 0.3, rotY: 0.3, rotZ: -0.05, ease: 'power2.inOut', duration: 20 })
          .to(proxy.current, { y: 80, scale: 0.003, rotX: -0.2, rotY: 0.8, rotZ: 0, ease: 'power2.in', duration: 20 }, "+=0")
          .to({}, { duration: 40 }); 
      });
      
      // Dynamically track React layout shifts (like Hero sequenceStep expands at 1.8s) 
      // preventing the timeline trigger from being permanently miscalculated at load.
      const ro = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      ro.observe(document.body);

      return () => {
        ro.disconnect();
        mm.revert();
      };
    });

    return () => gsapCtx.current?.revert();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-[1] pointer-events-none" aria-hidden="true">
      <Canvas 
        // Optimization: Bloom works best when we tell the renderer to handle "High Dynamic Range"
        gl={{ 
          alpha: true, 
          antialias: false, // Bloom often looks smoother with antialias off or handled by the composer
          powerPreference: 'high-performance' 
        }} 
        dpr={[1, 2]} 
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
        
        {/* LIGHTING */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" castShadow />
        <directionalLight position={[-4, -3, -5]} intensity={0.5} color="#4488ff" />
        <spotLight position={[0, 12, 2]} angle={0.25} penumbra={1} intensity={0.4} color="#ffffff" />
        <Environment preset="city" />

        {/* DRONE */}
        <Suspense fallback={null}>
          <DroneModel ref={droneRef} />
        </Suspense>
        <DroneController droneRef={droneRef} proxy={proxy} />

        {/* 2. THE GLOW ENGINE - Add this block here */}
        {/* THE GLOW ENGINE - Updated for latest types */}
          <EffectComposer multisampling={0}> 
            <Bloom 
              luminanceThreshold={1} 
              mipmapBlur 
              intensity={0.05} 
              radius={0.01}    
            />
            {/* Using a fragment wrapper if Vignette still complains about types */}
            
          </EffectComposer>

      </Canvas>
    </div>
  );
}