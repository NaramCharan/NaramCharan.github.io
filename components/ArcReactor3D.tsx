"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Torus } from "@react-three/drei";
import type { Group } from "three";

function Reactor() {
  const ring1 = useRef<Group>(null);
  const ring2 = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.4;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.6;
  });

  return (
    <group>
      {/* Glowing core */}
      <mesh>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial
          color="#7de7f5"
          emissive="#22d3ee"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>

      {/* Inner triangle housing */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.06, 3, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      <group ref={ring1}>
        <Torus args={[1.35, 0.035, 16, 80]}>
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#155e6b"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </Torus>
      </group>

      <group ref={ring2}>
        <Torus args={[1.7, 0.02, 16, 90]}>
          <meshStandardMaterial
            color="#7de7f5"
            emissive="#22d3ee"
            emissiveIntensity={0.9}
            toneMapped={false}
          />
        </Torus>
      </group>
    </group>
  );
}

export default function ArcReactor3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 3]} intensity={6} color="#22d3ee" />
      <pointLight position={[4, 2, 2]} intensity={2} color="#ffb23e" />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
        <Reactor />
      </Float>
    </Canvas>
  );
}
