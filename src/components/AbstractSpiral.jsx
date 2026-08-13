import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TorusKnot, Float } from '@react-three/drei';
import * as THREE from 'three';

export const AbstractSpiral = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
      <mesh ref={meshRef}>
        <TorusKnot args={[1, 0.3, 128, 64]} scale={1.5}>
          <meshPhysicalMaterial 
            color="#0066FF" 
            metalness={0.9} 
            roughness={0.1}
            transmission={0.5}
            thickness={1}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </TorusKnot>
        
        {/* Wireframe outer shell for precision feel */}
        <TorusKnot args={[1.2, 0.05, 64, 8]} scale={1.5}>
           <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
        </TorusKnot>
      </mesh>
    </Float>
  );
};
