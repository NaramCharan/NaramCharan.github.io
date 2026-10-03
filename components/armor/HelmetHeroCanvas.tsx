"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import HelmetGLB from "./HelmetGLB";
import { ArmorProvider, useArmor } from "./context";
import { smooth } from "./timeline";

/**
 * The /armor helmet, playing as the homepage's opening lock-on.
 *
 * Unlike /armor (scrubbed by scroll), here the build is a short timed
 * sequence driven off the render clock (not a GSAP tween — its lag smoothing
 * stalls on a busy first load), feeding the same 0→1 progress the parts read, so the
 * helmet assembles on load and rebuilds whenever the hero scroll returns to
 * segment A. The canvas only renders while segment A is on screen — once the
 * reactor assembly takes over it stops drawing entirely.
 */

const FOV = 30;
const DEG = Math.PI / 180;

const DURATION = 4.6;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function Rig({
  startRef,
  onDoneRef,
}: {
  startRef: MutableRefObject<number | null>;
  onDoneRef: MutableRefObject<(() => void) | null>;
}) {
  const { progressRef } = useArmor();
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  useFrame(({ clock }) => {
    if (startRef.current === null) startRef.current = clock.elapsedTime;
    const t = Math.min(1, Math.max(0, (clock.elapsedTime - startRef.current - 0.25) / DURATION));
    progressRef.current = easeInOut(t);
    if (t >= 1 && onDoneRef.current) {
      onDoneRef.current();
      onDoneRef.current = null;
    }
    // Swings from a 3/4 view to dead front as the plates lock.
    const k = smooth(Math.min(1, progressRef.current / 0.85));
    const az = 34 * (1 - k) * DEG;
    const el = 8 * (1 - k) * DEG;
    // Helmet (2.04 tall) fills ~half the canvas height; the rest is room
    // for the plates to fly in from.
    const r = (2.04 / Math.tan((FOV / 2) * DEG)) * 1.15 + (1 - k) * 0.8;
    camera.position.set(r * Math.sin(az) * Math.cos(el), r * Math.sin(el), r * Math.cos(az) * Math.cos(el));
    camera.lookAt(target);
  }, -1);
  return null;
}

export default function HelmetHeroCanvas({ onStatus }: { onStatus?: (s: string) => void }) {
  const progress = useRef(0);
  const startRef = useRef<number | null>(null);
  const onDoneRef = useRef<(() => void) | null>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const track = document.getElementById("top");
    const play = () => {
      startRef.current = null; // Rig restarts the clock on its next frame
      onStatus?.("ASSEMBLING");
      onDoneRef.current = () => onStatus?.("SYSTEMS ONLINE");
    };
    play();
    let last = track?.dataset.seg ?? "a";
    const mo = new MutationObserver(() => {
      const seg = track?.dataset.seg ?? "a";
      if (seg === last) return;
      setLive(seg === "a");
      if (seg === "a") play(); // came back up: rebuild it
      last = seg;
    });
    if (track) mo.observe(track, { attributes: true, attributeFilter: ["data-seg"] });
    return () => mo.disconnect();
  }, [onStatus]);

  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={live ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ fov: FOV, near: 0.1, far: 30, position: [0, 0, 8] }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ArmorProvider progress={progress} reduced={false} spread={0.55}>
        <Rig startRef={startRef} onDoneRef={onDoneRef} />
        <ambientLight intensity={0.08} />
        <directionalLight position={[-2.4, 3.2, 4.2]} intensity={2.6} color="#fff1e2" />
        <directionalLight position={[3.2, -0.4, 3]} intensity={0.55} color="#cfe3ff" />
        <directionalLight position={[-3.5, 2.2, -3.2]} intensity={3.4} color="#8fd6ff" />
        <directionalLight position={[3.4, 1.4, -3.0]} intensity={2.6} color="#ffad7a" />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[-1.5, 3.5, 3]} scale={[5, 1.6, 1]} rotation-x={Math.PI / 2.6} />
          <Lightformer form="rect" intensity={1.1} color="#ffd9b0" position={[-4, 0.5, 1]} scale={[2, 5, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={0.9} color="#e6eeff" position={[4, 0.5, -1]} scale={[2, 5, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="ring" intensity={0.5} color="#ffffff" position={[0, 0, 5]} scale={2} />
        </Environment>
        <Suspense fallback={null}>
          <HelmetGLB />
        </Suspense>
      </ArmorProvider>
    </Canvas>
  );
}
