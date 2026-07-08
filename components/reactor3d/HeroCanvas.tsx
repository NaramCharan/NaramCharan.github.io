"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
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
      <fog attach="fog" args={["#05080f", 10, 22]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} color="#bfefff" />
      <directionalLight position={[-5, -2, 3]} intensity={0.6} color="#2a6b7a" />
      {/* Rim/kicker light from behind-below — separates the dark bezel edge
          from the black background like a studio product shot. */}
      <directionalLight position={[-2, -6, -6]} intensity={1.1} color="#3fa6bd" />
      <spotLight position={[0, 0, 8]} angle={0.5} penumbra={1} intensity={1.2} color="#7de7f5" />

      {/* Framed environment (metal reflections, no network fetch) */}
      <Environment resolution={256}>
        <Lightformer intensity={2} color="#7de7f5" position={[0, 3, 4]} scale={[6, 3, 1]} />
        <Lightformer intensity={1.2} color="#ffb23e" position={[-4, -2, 2]} scale={[4, 4, 1]} />
        <Lightformer intensity={1.5} color="#22d3ee" position={[4, -1, 2]} scale={[3, 3, 1]} />
        <Lightformer intensity={0.8} color="#ffffff" position={[0, -4, 3]} scale={[5, 2, 1]} />
      </Environment>

      <group position={[0, 0.35, 0]}>
        <Reactor3D progress={progress} />
      </group>

      <EffectComposer multisampling={0}>
        {/* Two-pass bloom: a tight hot core plus a much wider, softer bleed —
            the huge soft halo is what reads as "real light in a dark room"
            instead of a clean CG glow. */}
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.82}
          luminanceSmoothing={0.25}
          mipmapBlur
          radius={0.5}
        />
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.9}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0006, 0.0006)}
          radialModulation={true}
          modulationOffset={0.4}
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette eskil={false} offset={0.28} darkness={0.62} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </Canvas>
  );
}
