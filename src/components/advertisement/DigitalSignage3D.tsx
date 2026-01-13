import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  RoundedBox, 
  Text, 
  Environment, 
  Float, 
  MeshReflectorMaterial,
  OrbitControls
} from "@react-three/drei";
import * as THREE from "three";

// Individual screen component
function DigitalScreen({ 
  position, 
  rotation, 
  scale = 1, 
  color = "#0ea5e9",
  label = "AD",
  floatIntensity = 1
}: { 
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  label?: string;
  floatIntensity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  // Animate the screen glow
  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <Float 
      speed={2} 
      rotationIntensity={0.3} 
      floatIntensity={floatIntensity}
    >
      <group position={position} rotation={rotation} scale={scale}>
        {/* Screen Frame */}
        <RoundedBox 
          ref={meshRef}
          args={[2.4, 1.6, 0.1]} 
          radius={0.05} 
          smoothness={4}
        >
          <meshStandardMaterial 
            color="#1a1a2e" 
            metalness={0.8} 
            roughness={0.2}
          />
        </RoundedBox>

        {/* Screen Display */}
        <mesh ref={screenRef} position={[0, 0, 0.06]}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.1}
            roughness={0.3}
          />
        </mesh>

        {/* Screen Content - Gradient overlay */}
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshBasicMaterial 
            transparent
            opacity={0.3}
            color="#ffffff"
          />
        </mesh>

        {/* Brand text */}
        <Text
          position={[0, 0, 0.08]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          {label}
        </Text>

        {/* Stand/Mount */}
        <mesh position={[0, -1, -0.05]}>
          <cylinderGeometry args={[0.05, 0.08, 0.5, 16]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.9} roughness={0.3} />
        </mesh>
        
        {/* Base */}
        <mesh position={[0, -1.3, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// Large billboard screen
function Billboard({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Billboard Frame */}
      <RoundedBox args={[5, 3, 0.2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial 
          color="#0f0f1a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </RoundedBox>

      {/* LED Display */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[4.6, 2.6]} />
        <meshStandardMaterial 
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Content Grid Effect */}
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <mesh 
            key={`${row}-${col}`}
            position={[-1.8 + col * 0.9, 0.8 - row * 0.8, 0.12]}
          >
            <planeGeometry args={[0.7, 0.6]} />
            <meshBasicMaterial 
              color={col % 2 === row % 2 ? "#a855f7" : "#6366f1"}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))
      )}

      {/* Support Poles */}
      <mesh position={[-2, -2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 2, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[2, -2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 2, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Rotating kiosk display
function Kiosk({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main body */}
      <RoundedBox args={[0.8, 2.5, 0.4]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </RoundedBox>

      {/* Screen */}
      <mesh position={[0, 0.3, 0.21]}>
        <planeGeometry args={[0.65, 1.2]} />
        <meshStandardMaterial 
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Touch indicator */}
      <mesh position={[0, -0.6, 0.21]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial 
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#0f0f1a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Scene component
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#06b6d4" />
      <spotLight 
        position={[0, 10, 5]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1}
        color="#f472b6"
      />

      {/* Main Billboard */}
      <Billboard position={[0, 1.5, -3]} />

      {/* Left Screen - Mall Display */}
      <DigitalScreen 
        position={[-4, 0, 0]} 
        rotation={[0, 0.3, 0]}
        color="#f97316"
        label="MALL"
        floatIntensity={0.5}
      />

      {/* Right Screen - Transit Display */}
      <DigitalScreen 
        position={[4, 0, 0]} 
        rotation={[0, -0.3, 0]}
        color="#22c55e"
        label="TRANSIT"
        floatIntensity={0.5}
      />

      {/* Interactive Kiosk */}
      <Kiosk position={[-2, -0.5, 2]} />
      <Kiosk position={[2, -0.5, 2]} />

      {/* Floor reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050510"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>

      {/* Environment */}
      <Environment preset="night" />

      {/* Particles/Stars effect */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10 + 2,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
      ))}
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950/50">
      <div className="text-white/60 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-sm">Loading 3D Display...</span>
      </div>
    </div>
  );
}

export default function DigitalSignage3D() {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 to-purple-950/50">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={15}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
          <Scene />
        </Canvas>
      </Suspense>
      
      {/* Overlay gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}
