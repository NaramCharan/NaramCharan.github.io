"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReactorMaterials, useTriangleGeometry } from "./parts";

/**
 * The 3D Mark XLII arc reactor, assembled by a scroll-progress ref (0..1).
 * Each part interpolates from a scattered start pose to its locked pose across
 * its own progress window, so scrubbing forward assembles / backward disassembles.
 * Robotic arms reach in during the build and retract as the core ignites.
 *
 * Parts are hidden either by starting off-camera (the big rings fly in) or by
 * scaling from ~0 (coils, triangle, nodes, core) — no per-material opacity, so
 * shared materials stay conflict-free. `progress` is a live ref updated by
 * ScrollTrigger and read in useFrame (no React re-render per frame).
 */
type Props = { progress: React.MutableRefObject<number> };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const backOut = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const win = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));
const lerp = THREE.MathUtils.lerp;

const COIL_COUNT = 18;
const CORNER_ANGLES = [
  -Math.PI / 2,
  -Math.PI / 2 + (2 * Math.PI) / 3,
  -Math.PI / 2 + (4 * Math.PI) / 3,
];

export default function Reactor3D({ progress }: Props) {
  const mat = useReactorMaterials();
  const triGeo = useTriangleGeometry(1.15, 0.28);

  const rootRef = useRef<THREE.Group>(null);
  const bezelRef = useRef<THREE.Group>(null);
  const tickRef = useRef<THREE.Group>(null);
  const housingRef = useRef<THREE.Group>(null);
  const coilsRef = useRef<THREE.Group>(null);
  const triRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const armsRef = useRef<THREE.Group>(null);

  const coilStarts = useMemo(
    () =>
      Array.from({ length: COIL_COUNT }, (_, i) => {
        const a = (i / COIL_COUNT) * Math.PI * 2;
        return {
          angle: a,
          from: new THREE.Vector3(
            Math.cos(a) * 6.5 + (i % 2 ? 1.5 : -1.5),
            Math.sin(a) * 6.5 + 2,
            (i % 3) - 1 > 0 ? 4 : -4
          ),
          spin: (i % 2 ? 1 : -1) * Math.PI * 2,
        };
      }),
    []
  );

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const asm = win(p, 0.3, 0.72);

    if (bezelRef.current) {
      const k = easeOut(win(p, 0.3, 0.46));
      const g = bezelRef.current;
      g.position.set(lerp(-9, 0, k), lerp(5, 0, k), lerp(-4, 0, k));
      g.rotation.z = lerp(-Math.PI, 0, k);
      g.rotation.x = lerp(0.9, 0, k);
      g.scale.setScalar(lerp(0.5, 1, k));
    }
    if (tickRef.current) {
      const k = easeOut(win(p, 0.34, 0.5));
      const g = tickRef.current;
      g.position.set(lerp(9, 0, k), lerp(5, 0, k), lerp(-3, 0, k));
      g.rotation.z = lerp(Math.PI * 1.2, 0, k) + t * 0.25;
      g.scale.setScalar(lerp(0.5, 1, k));
    }
    if (housingRef.current) {
      const k = easeOut(win(p, 0.38, 0.54));
      const g = housingRef.current;
      g.position.set(lerp(-7, 0, k), lerp(-6.5, 0, k), lerp(-2, 0, k));
      g.rotation.z = lerp(-Math.PI * 0.9, 0, k) - t * 0.18;
      g.scale.setScalar(lerp(0.5, 1, k));
    }
    if (coilsRef.current) {
      coilsRef.current.children.forEach((child, i) => {
        const s = coilStarts[i];
        const start = 0.4 + (i / COIL_COUNT) * 0.16;
        const k = easeOut(win(p, start, start + 0.16));
        child.position.set(
          lerp(s.from.x, Math.cos(s.angle) * 1.62, k),
          lerp(s.from.y, Math.sin(s.angle) * 1.62, k),
          lerp(s.from.z, 0, k)
        );
        child.rotation.z = lerp(s.spin, s.angle + Math.PI / 2, k);
        child.scale.setScalar(Math.max(0.001, k));
      });
    }
    if (triRef.current) {
      const kk = win(p, 0.56, 0.7);
      triRef.current.scale.setScalar(Math.max(0.001, backOut(kk)));
      triRef.current.rotation.z = lerp(Math.PI, 0, easeOut(kk));
      triRef.current.position.z = 0.12;
    }
    if (nodesRef.current) {
      nodesRef.current.children.forEach((child, i) => {
        const start = 0.62 + i * 0.03;
        child.scale.setScalar(Math.max(0.001, backOut(win(p, start, start + 0.08))));
      });
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(Math.max(0.001, backOut(win(p, 0.66, 0.76))));
      coreRef.current.position.z = 0.2;
    }
    // Core ignites, then CALMS once the name/text arrives (segment C) so the
    // copy reads — the reactor settles to a quiet idle glow instead of blaring.
    const ign = win(p, 0.66, 0.8);
    const calm = win(p, 0.8, 0.94);
    const glow = ign * (1 - 0.93 * calm);
    if (coreLightRef.current) {
      coreLightRef.current.intensity = glow * 10 * (0.9 + Math.sin(t * 8) * 0.08);
    }
    mat.coreGlow.emissiveIntensity = 0.3 + glow * 2.1;   // ~2.4 flash → ~0.44 idle
    mat.cyanGlass.emissiveIntensity = 2.2 - 1.85 * calm; // coils/ring settle to ~0.35

    if (tickRef.current && asm > 0.95) tickRef.current.rotation.z += 0.002;

    if (armsRef.current) {
      const reach = easeOut(win(p, 0.34, 0.5));
      const retract = easeOut(win(p, 0.68, 0.84));
      const engage = reach * (1 - retract);
      armsRef.current.children.forEach((arm, i) => {
        arm.scale.setScalar(engage < 0.02 ? 0.001 : 1);
        const forearm = arm.children[1] as THREE.Object3D | undefined;
        if (forearm)
          forearm.rotation.z = lerp(-0.5, -1.0, engage) + Math.sin(t * 1.5 + i) * 0.05;
        // arms slide inward along their own axis as they engage
        arm.position.z = 0.4;
      });
    }

    if (rootRef.current) {
      const intro = easeOut(win(p, 0, 0.3));
      rootRef.current.scale.setScalar(lerp(0.62, 1, intro));
      rootRef.current.rotation.y = Math.sin(t * 0.25) * 0.06 + (1 - asm) * 0.25;
      rootRef.current.rotation.x =
        lerp(0.35, 0, easeOut(win(p, 0.3, 0.7))) + Math.sin(t * 0.2) * 0.02;
    }
  });

  const armAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];

  return (
    <group ref={rootRef}>
      {/* 1 — Outer bezel */}
      <group ref={bezelRef} scale={0.001}>
        <mesh material={mat.darkMetal}>
          <torusGeometry args={[2.15, 0.14, 20, 80]} />
        </mesh>
        <mesh material={mat.cyanGlass}>
          <torusGeometry args={[2.15, 0.05, 12, 80]} />
        </mesh>
      </group>

      {/* 2 — Tick ring */}
      <group ref={tickRef} scale={0.001}>
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={mat.brightMetal}
              position={[Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.02, 0.1, 0.05]} />
            </mesh>
          );
        })}
      </group>

      {/* 3 — Coil housing */}
      <group ref={housingRef} scale={0.001}>
        <mesh material={mat.darkMetal}>
          <torusGeometry args={[1.78, 0.2, 20, 72]} />
        </mesh>
      </group>

      {/* Coils — copper windings with cyan faces */}
      <group ref={coilsRef}>
        {coilStarts.map((_, i) => (
          <group key={i} scale={0.001}>
            <mesh material={mat.copper} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.34, 16]} />
            </mesh>
            <mesh material={mat.cyanGlass} position={[0, 0, 0.19]}>
              <boxGeometry args={[0.12, 0.24, 0.03]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4 — Rotor triangle */}
      <group ref={triRef} scale={0.001}>
        <mesh geometry={triGeo} material={mat.brightMetal} />
        <mesh geometry={triGeo} material={mat.darkMetal} scale={0.82} position={[0, 0, 0.14]} />
      </group>

      {/* Corner nodes */}
      <group ref={nodesRef}>
        {CORNER_ANGLES.map((a, i) => (
          <mesh
            key={i}
            material={mat.brightMetal}
            position={[Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.18]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.001}
          >
            <cylinderGeometry args={[0.16, 0.16, 0.16, 20]} />
          </mesh>
        ))}
      </group>

      {/* 6 — Core */}
      <group ref={coreRef} scale={0.001}>
        <mesh geometry={triGeo} material={mat.coreGlow} rotation={[0, 0, Math.PI]} scale={0.5} position={[0, 0, 0.22]} />
        <pointLight ref={coreLightRef} color="#7de7f5" distance={9} intensity={0} position={[0, 0, 0.6]} />
      </group>

      {/* Robotic assembly arms */}
      <group ref={armsRef}>
        {armAngles.map((a, i) => {
          const R = 4.2;
          return (
            <group key={i} position={[Math.cos(a) * R, Math.sin(a) * R, 0.4]} rotation={[0, 0, a + Math.PI]} scale={0.001}>
              <mesh material={mat.darkMetal}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
              </mesh>
              <group>
                <mesh material={mat.darkMetal} position={[1.1, 0, 0]}>
                  <boxGeometry args={[2.2, 0.16, 0.16]} />
                </mesh>
                <mesh material={mat.brightMetal} position={[2.2, 0, 0]}>
                  <boxGeometry args={[0.2, 0.34, 0.34]} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
