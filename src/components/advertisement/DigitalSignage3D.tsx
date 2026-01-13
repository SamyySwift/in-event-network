import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Display() {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Screen Frame */}
      <RoundedBox args={[4, 2.5, 0.15]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </RoundedBox>

      {/* Screen Display */}
      <mesh ref={screenRef} position={[0, 0, 0.08]}>
        <planeGeometry args={[3.7, 2.2]} />
        <meshStandardMaterial 
          color="#f5f5f7"
          emissive="#e8e8ed"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Content blocks - minimal grid */}
      <mesh position={[-1, 0.4, 0.09]}>
        <planeGeometry args={[1.2, 0.6]} />
        <meshBasicMaterial color="#0071e3" />
      </mesh>
      <mesh position={[0.8, 0.4, 0.09]}>
        <planeGeometry args={[1.8, 0.6]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, -0.5, 0.09]}>
        <planeGeometry args={[3.2, 0.8]} />
        <meshBasicMaterial color="#f5f5f7" />
      </mesh>

      {/* Stand */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Base */}
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 64]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      
      <Display />
      
      <Environment preset="studio" />
    </>
  );
}

export default function DigitalSignage3D() {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-white">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <OrbitControls 
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.8}
          />
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
