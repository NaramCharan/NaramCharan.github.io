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
 * The Mark III helmet beside the Origin Story — "It started with a man in a
 * suit of armor". Scroll-driven like /armor: the pieces float apart until the
 * whole helmet is in view, then lock together as it reaches the centre
 * (scrolling back up takes it apart). The helmet itself is the trigger, so
 * this holds whether it sits beside the story (desktop) or above it (phone). The canvas renders only while the
 * section is on screen.
 */

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
    const next = progressRef.current > 0.99 ? "MARK III · ONLINE" : "MARK III · ASSEMBLING";
    if (next !== status.current) {
      status.current = next;
      onStatus?.(next);
    }
    // 3/4 view while the plates fly in, dead front once they lock.
    const k = smooth(Math.min(1, progressRef.current / 0.85));
    const az = 34 * (1 - k) * DEG;
    const el = 8 * (1 - k) * DEG;
    const r = (2.04 / Math.tan((FOV / 2) * DEG)) * 0.92 + (1 - k) * 0.6;
    camera.position.set(r * Math.sin(az) * Math.cos(el), r * Math.sin(el), r * Math.cos(az) * Math.cos(el));
    camera.lookAt(target);
  }, -1);
  return null;
}

export default function OriginHelmetCanvas({
  reduced,
  onStatus,
}: {
  reduced: boolean;
  onStatus?: (s: string) => void;
}) {
  const progress = useRef(reduced ? 1 : 0);
  const raw = useRef(reduced ? 1 : 0);
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [spread] = useState(() => (typeof window !== "undefined" && window.innerWidth < 640 ? 0.4 : 0.5));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // Render only while on screen.
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    if (reduced) return () => io.disconnect();
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      // Start only once the whole helmet is on screen (its bottom edge has
      // cleared the viewport), so the visitor sees it fully apart first;
      // finish as it passes the middle of the screen.
      start: "bottom 92%",
      end: "center 45%",
      onUpdate: (self) => {
        raw.current = self.progress;
      },
    });
    raw.current = st.progress;
    return () => {
      io.disconnect();
      st.kill();
    };
  }, [reduced]);

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        className="!absolute inset-0"
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ fov: FOV, near: 0.1, far: 30, position: [0, 0, 8] }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ArmorProvider progress={progress} reduced={reduced} spread={spread}>
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
    </div>
  );
}
