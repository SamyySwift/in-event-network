import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const Display = () => {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Display Frame - Sleek dark frame */}
      <RoundedBox args={[4.2, 2.6, 0.15]} radius={0.08} smoothness={4} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#1d1d1f" metalness={0.9} roughness={0.1} />
      </RoundedBox>
      
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.3, 0.08]}>
        <planeGeometry args={[3.9, 2.3]} />
        <meshStandardMaterial 
          color="#0071e3"
          emissive="#0071e3"
          emissiveIntensity={0.5}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>

      {/* Screen Content - Brand text */}
      <mesh position={[0, 0.5, 0.09]}>
        <planeGeometry args={[2.5, 0.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[1.8, 0.25]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} opacity={0.7} transparent />
      </mesh>

      {/* Stand - Minimal pole */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.8, 32]} />
        <meshStandardMaterial color="#1d1d1f" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Base - Circular */}
      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 64]} />
        <meshStandardMaterial color="#1d1d1f" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.5} penumbra={1} />
      
      <Display />
      
      <Environment preset="studio" />
    </>
  );
};

const DigitalSignage3D = () => {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#f5f5f7]">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#0071e3] rounded-full animate-spin" />
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
          <OrbitControls 
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default DigitalSignage3D;