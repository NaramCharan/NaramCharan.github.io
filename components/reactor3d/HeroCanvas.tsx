"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reactor3D from "./Reactor3D";

gsap.registerPlugin(ScrollTrigger);

/**
 * Client-only WebGL hero. Owns the shared scroll-progress ref: one ScrollTrigger
 * (scrubbed to the pinned #top track) writes 0..1 into `progress`, which both the
 * reactor and the glasses read in useFrame. Also drives the DOM overlays via a
 * CSS var + `data-seg` on the track so text/panels stay in sync without React
 * re-renders. Mounts only after hydration (WebGL can't SSR).
 */
export default function HeroCanvas({
  trackId = "top",
}: {
  trackId?: string;
}) {
  const progress = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const track = document.getElementById(trackId);
    if (!track) return;

    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress;
        track.style.setProperty("--p", self.progress.toFixed(4));
        track.dataset.seg =
          self.progress < 0.28 ? "a" : self.progress < 0.74 ? "b" : "c";
      },
    });
    return () => st.kill();
  }, [mounted, trackId]);

  if (!mounted) return null;

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 9.2], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05080f"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#bfefff" />
      <directionalLight position={[-5, -2, 3]} intensity={0.6} color="#2a6b7a" />
      <spotLight position={[0, 0, 8]} angle={0.5} penumbra={1} intensity={1.2} color="#7de7f5" />

      {/* Framed environment (metal reflections, no network fetch) */}
      <Environment resolution={256}>
        <Lightformer intensity={2} color="#7de7f5" position={[0, 3, 4]} scale={[6, 3, 1]} />
        <Lightformer intensity={1.2} color="#ffb23e" position={[-4, -2, 2]} scale={[4, 4, 1]} />
        <Lightformer intensity={1.5} color="#22d3ee" position={[4, -1, 2]} scale={[3, 3, 1]} />
      </Environment>

      <group position={[0, 0.35, 0]}>
        <Reactor3D progress={progress} />
      </group>

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
