import { forwardRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export const DroneModel = forwardRef(({ isMobile, ...props }, ref) => {
  const dronePath = `${import.meta.env.BASE_URL}droneage2.glb?v=3`;
  const { scene, nodes } = useGLTF(dronePath);

  useEffect(() => {
    const darkMetal = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#050505'),
      metalness: 1,
      roughness: 0.02, // Mirror-like finish to catch blue reflections
    });

    const neonBlue = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0066FF'),
      emissive: new THREE.Color('#0066FF'),
      emissiveIntensity: 50, // CRANKED to 50
      toneMapped: false, 
    });

    scene.traverse((child) => {
      if (child.isLight) child.visible = false;
      if (child.isMesh) {
        const mesh = child;
        // Apply blue to propellers and any node with 'Neon' or 'Rotation' in the name
        if (mesh.name.includes('Rotation') || mesh.name.includes('Neon')) {
          mesh.material = neonBlue;
        } else {
          mesh.material = darkMetal;
        }
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    const speed = 35;
    const propellers = [nodes['Rotation'], nodes['Rotation001'], nodes['Rotation002'], nodes['Rotation003']];
    for (const p of propellers) {
      if (p) p.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={ref} {...props} dispose={null}>
      {/* 1. Internal Core Light */}
      <pointLight position={[0, 0, 0]} color="#0066FF" intensity={isMobile ? 50 : 80} distance={3} />
      
      {/* 2. Propeller "Halo" Lights - Desktop only */}
      {!isMobile && (
        <>
          <pointLight position={[1.5, 0.2, 1.5]} color="#0066FF" intensity={20} distance={3} />
          <pointLight position={[-1.5, 0.2, 1.5]} color="#0066FF" intensity={20} distance={3} />
          <pointLight position={[1.5, 0.2, -1.5]} color="#0066FF" intensity={20} distance={3} />
          <pointLight position={[-1.5, 0.2, -1.5]} color="#0066FF" intensity={20} distance={3} />
        </>
      )}
      
      {/* 3. Rim Lighting */}
      <spotLight position={[0, 5, -5]} angle={0.5} penumbra={1} color="#00BFFF" intensity={isMobile ? 25 : 40} />
      
      <primitive object={scene} />
    </group>
  );
});

DroneModel.displayName = 'DroneModel';
useGLTF.preload(`${import.meta.env.BASE_URL}droneage2.glb?v=3`);
