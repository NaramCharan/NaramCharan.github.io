"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HelmetGLB from "./HelmetGLB";
import { ArmorProvider, useArmor } from "./context";
import { smooth } from "./timeline";

/**
 * The /armor helmet, assembling in the homepage's opening view.
 *
 * Scroll-driven, like /armor: at the top of the page the pieces float apart;
 * scrolling the hero from 0 to HELMET_END of its track assembles the helmet
 * (scrolling back up takes it apart again). Raw scroll is damped in the
 * render loop for weight. The camera swings from 3/4 to dead front as the
 * plates lock. The canvas only renders while the hero is in segment A.
 */

export const HELMET_END = 0.2;

const FOV = 30;
const DEG = Math.PI / 180;

function Rig({ raw, onStatus }: { raw: MutableRefObject<number>; onStatus?: (s: string) => void }) {
  const { progressRef } = useArmor();
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const status = useRef("");
  useFrame((_, dt) => {
    const p = THREE.MathUtils.damp(progressRef.current, raw.current, 5, Math.min(dt, 0.1));
    progressRef.current = Math.abs(p - raw.current) < 1e-4 ? raw.current : p;
    const next = progressRef.current < 0.01 ? "STANDBY · SCROLL TO ASSEMBLE" : progressRef.current > 0.99 ? "SYSTEMS ONLINE" : "ASSEMBLING";
    if (next !== status.current) {
      status.current = next;
      onStatus?.(next);
    }
    // Swings from a 3/4 view to dead front as the plates lock.
    const k = smooth(Math.min(1, progressRef.current / 0.85));
    const az = 34 * (1 - k) * DEG;
    const el = 8 * (1 - k) * DEG;
    // Helmet fills ~half the canvas height; the rest is room for the plates
    // to fly in from.
    const r = (2.04 / Math.tan((FOV / 2) * DEG)) * 1.15 + (1 - k) * 0.8;
    camera.position.set(r * Math.sin(az) * Math.cos(el), r * Math.sin(el), r * Math.cos(az) * Math.cos(el));
    camera.lookAt(target);
  }, -1);
  return null;
}

export default function HelmetHeroCanvas({ onStatus }: { onStatus?: (s: string) => void }) {
  const progress = useRef(0);
  const raw = useRef(0);
  const [live, setLive] = useState(true);
  // Tighter fly-in on phones so loose pieces stay clear of the name below.
  const [spread] = useState(() => (typeof window !== "undefined" && window.innerWidth < 640 ? 0.4 : 0.55));

  useEffect(() => {
    const track = document.getElementById("top");
    if (!track) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        raw.current = Math.min(1, self.progress / HELMET_END);
      },
    });
    raw.current = Math.min(1, st.progress / HELMET_END);
    // Stop rendering once the reactor sequence takes over.
    const mo = new MutationObserver(() => setLive((track.dataset.seg ?? "a") === "a"));
    mo.observe(track, { attributes: true, attributeFilter: ["data-seg"] });
    return () => {
      st.kill();
      mo.disconnect();
    };
  }, []);

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
      <ArmorProvider progress={progress} reduced={false} spread={spread}>
        <Rig raw={raw} onStatus={onStatus} />
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
