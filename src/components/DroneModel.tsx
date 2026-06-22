import { forwardRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export const DroneModel = forwardRef<THREE.Group, any>((props, ref) => {
  const { scene, nodes } = useGLTF('/droneage2.glb?v=3');

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
      if ((child as THREE.Light).isLight) child.visible = false;
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
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
      {/* 1. Hyper-Intense Internal Core */}
      <pointLight position={[0, 0, 0]} color="#0066FF" intensity={80} distance={3} />
      
      {/* 2. Propeller "Halo" Lights - One at each corner */}
      <pointLight position={[1.5, 0.2, 1.5]} color="#0066FF" intensity={20} distance={3} />
      <pointLight position={[-1.5, 0.2, 1.5]} color="#0066FF" intensity={20} distance={3} />
      <pointLight position={[1.5, 0.2, -1.5]} color="#0066FF" intensity={20} distance={3} />
      <pointLight position={[-1.5, 0.2, -1.5]} color="#0066FF" intensity={20} distance={3} />
      
      {/* 3. Rim Lighting - Placed behind and above to catch the glossy edges */}
      <spotLight position={[0, 5, -5]} angle={0.5} penumbra={1} color="#00BFFF" intensity={40} />
      
      <primitive object={scene} />
    </group>
  );
});

DroneModel.displayName = 'DroneModel';
useGLTF.preload('/droneage2.glb?v=3');