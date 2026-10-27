/* eslint-disable react-hooks/immutability -- R3F useFrame updates owned Three.js material instances outside React rendering. */
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useReactorMaterials,
  useHollowTriangleGeometry,
  useUpwardTriangleGeometry,
  useTrapezoidGeometry,
} from "./parts";

/**
 * The 3D Arc Reactor (Avengers / Mark VI triangular core design),
 * assembled smoothly via the scroll-progress ref (0..1).
 *
 * Architecture:
 * 1. Outer machined bezel + rotating tick ring.
 * 2. Recessed housing well + concentric circular boundary rings.
 * 3. 8 copper coil blocks (with orange bevels & center radial grooves)
 *    and 5 glowing cyan radial dividers arranged in 3 sectors.
 * 4. Hollow inverted triangular frame (truss) with 3 circular corner nodes
 *    and nested inner HUD wireframes.
 * 5. Center toothed gear collar.
 * 6. Central upward-pointing glowing triangle core with nested luminous layers.
 * 7. Robotic assembly arms that reach in during build and retract on ignition.
 */
type Props = { progress: React.MutableRefObject<number> };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const backOut = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const win = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));
const lerp = THREE.MathUtils.lerp;

// Radius for the coil and divider band
const COIL_R = 1.40;

// 8 Copper Coil Angles (radians) grouped in 3 sectors:
// Top sector (between 30° and 150°): 2 coils (116°, 64°)
// Left sector (between 150° and 270°): 3 coils (172°, 210°, 248°)
// Right sector (between 270° and 30°): 3 coils (292°, 330°, 10°)
const COIL_ANGLES = [
  (116 * Math.PI) / 180,
  (64 * Math.PI) / 180,
  (172 * Math.PI) / 180,
  (210 * Math.PI) / 180,
  (248 * Math.PI) / 180,
  (292 * Math.PI) / 180,
  (330 * Math.PI) / 180,
  (10 * Math.PI) / 180,
];

// 5 Cyan Radial Divider Angles (radians):
// Top: 90° (12 o'clock)
// Left: 190°, 230°
// Right: 310°, 350°
const DIVIDER_ANGLES = [
  (90 * Math.PI) / 180,
  (190 * Math.PI) / 180,
  (230 * Math.PI) / 180,
  (310 * Math.PI) / 180,
  (350 * Math.PI) / 180,
];

// 3 Corner Node Angles for the inverted equilateral triangle:
// Top-Right: 30° (pi/6)
// Top-Left: 150° (5pi/6)
// Bottom: 270° (3pi/2 / -pi/2)
const CORNER_ANGLES = [
  Math.PI / 6,
  (5 * Math.PI) / 6,
  (3 * Math.PI) / 2,
];
const CORNER_R = 1.24;

export default function Reactor3D({ progress }: Props) {
  const mat = useReactorMaterials();

  // Geometries
  const hollowTriGeo = useHollowTriangleGeometry(1.25, 1.03, 0.16);
  const hollowTriTrimGeo = useHollowTriangleGeometry(1.23, 1.05, 0.04);
  const nestTriGeo1 = useHollowTriangleGeometry(0.88, 0.85, 0.03);
  const nestTriGeo2 = useHollowTriangleGeometry(0.72, 0.70, 0.03);

  const coreTriOuter = useUpwardTriangleGeometry(0.44, 0.10);
  const coreTriMid = useUpwardTriangleGeometry(0.30, 0.12);
  const coreTriInner = useUpwardTriangleGeometry(0.16, 0.14);

  const coilGeo = useTrapezoidGeometry(0.34, 0.54, 0.56, 0.14);
  const coilCoreGeo = useTrapezoidGeometry(0.26, 0.44, 0.48, 0.15);

  // Group references
  const rootRef = useRef<THREE.Group>(null);
  const bezelRef = useRef<THREE.Group>(null);
  const tickRef = useRef<THREE.Group>(null);
  const housingRef = useRef<THREE.Group>(null);
  const coilsRef = useRef<THREE.Group>(null);
  const dividersRef = useRef<THREE.Group>(null);
  const gearCollarRef = useRef<THREE.Group>(null);
  const triFrameRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const armsRef = useRef<THREE.Group>(null);

  // Scattered initial positions for the 8 coils
  const coilStarts = useMemo(
    () =>
      COIL_ANGLES.map((a, i) => ({
        angle: a,
        from: new THREE.Vector3(
          Math.cos(a) * 6.5 + (i % 2 ? 1.5 : -1.5),
          Math.sin(a) * 6.5 + (i % 3 === 0 ? 2 : -2),
          (i % 2 === 0 ? 3.5 : -3.5)
        ),
        spin: (i % 2 ? 1 : -1) * Math.PI * 2.2,
      })),
    []
  );

  // Scattered initial positions for the 5 dividers
  const dividerStarts = useMemo(
    () =>
      DIVIDER_ANGLES.map((a, i) => ({
        angle: a,
        from: new THREE.Vector3(
          Math.cos(a) * 5.5,
          Math.sin(a) * 5.5,
          i % 2 ? 3 : -3
        ),
      })),
    []
  );

  useFrame((state) => {
    const pin =
      process.env.NODE_ENV !== "production"
        ? (globalThis as { __pin?: number }).__pin
        : undefined;
    const p = typeof pin === "number" ? pin : progress.current;
    const t = state.clock.elapsedTime;
    const asm = win(p, 0.3, 0.74);

    // 1 — Outer Bezel
    if (bezelRef.current) {
      const k = easeOut(win(p, 0.3, 0.46));
      const g = bezelRef.current;
      g.position.set(lerp(-9, 0, k), lerp(5, 0, k), lerp(-4, 0, k));
      g.rotation.z = lerp(-Math.PI, 0, k);
      g.rotation.x = lerp(0.8, 0, k);
      g.scale.setScalar(lerp(0.5, 1, k));
    }

    // 2 — Tick Ring
    if (tickRef.current) {
      const k = easeOut(win(p, 0.34, 0.5));
      const g = tickRef.current;
      g.position.set(lerp(9, 0, k), lerp(5, 0, k), lerp(-3, 0, k));
      g.rotation.z = lerp(Math.PI * 1.2, 0, k) + t * 0.22;
      g.scale.setScalar(lerp(0.5, 1, k));
    }

    // 3 — Housing & Well
    if (housingRef.current) {
      const k = easeOut(win(p, 0.38, 0.54));
      const g = housingRef.current;
      g.position.set(lerp(-7, 0, k), lerp(-6.5, 0, k), lerp(-2, 0, k));
      g.rotation.z = lerp(-Math.PI * 0.9, 0, k) - t * 0.15;
      g.scale.setScalar(lerp(0.5, 1, k));
    }

    // 4 — 8 Copper Coils Fly-In
    if (coilsRef.current) {
      coilsRef.current.children.forEach((child, i) => {
        const s = coilStarts[i];
        const start = 0.4 + (i / 8) * 0.15;
        const k = easeOut(win(p, start, start + 0.15));
        child.position.set(
          lerp(s.from.x, Math.cos(s.angle) * COIL_R, k),
          lerp(s.from.y, Math.sin(s.angle) * COIL_R, k),
          lerp(s.from.z, 0.02, k)
        );
        child.rotation.z = lerp(s.spin, s.angle - Math.PI / 2, k);
        child.scale.setScalar(Math.max(0.001, k));
      });
    }

    // 5 — 5 Cyan Radial Dividers
    if (dividersRef.current) {
      dividersRef.current.children.forEach((child, i) => {
        const s = dividerStarts[i];
        const k = easeOut(win(p, 0.46 + i * 0.025, 0.62 + i * 0.025));
        child.position.set(
          lerp(s.from.x, Math.cos(s.angle) * COIL_R, k),
          lerp(s.from.y, Math.sin(s.angle) * COIL_R, k),
          lerp(s.from.z, 0.08, k)
        );
        child.rotation.z = s.angle - Math.PI / 2;
        child.scale.setScalar(Math.max(0.001, k));
      });
    }

    // 6 — Toothed Gear Collar
    if (gearCollarRef.current) {
      const k = win(p, 0.5, 0.66);
      gearCollarRef.current.scale.setScalar(Math.max(0.001, backOut(k)));
      gearCollarRef.current.rotation.z =
        lerp(Math.PI * 1.5, 0, easeOut(k)) + (asm > 0.95 ? -t * 0.05 : 0);
      gearCollarRef.current.position.z = 0.1;
    }

    // 7 — Hollow Inverted Triangular Frame
    if (triFrameRef.current) {
      const kk = win(p, 0.54, 0.70);
      triFrameRef.current.scale.setScalar(Math.max(0.001, backOut(kk)));
      triFrameRef.current.rotation.z = lerp(-Math.PI * 0.8, 0, easeOut(kk));
      triFrameRef.current.position.z = 0.16;
    }

    // 8 — Corner Circular Nodes
    if (nodesRef.current) {
      nodesRef.current.children.forEach((child, i) => {
        const start = 0.58 + i * 0.035;
        const k = win(p, start, start + 0.10);
        child.scale.setScalar(Math.max(0.001, backOut(k)));
      });
    }

    // 9 — Upward Core Triangle
    if (coreRef.current) {
      const kk = win(p, 0.62, 0.76);
      coreRef.current.scale.setScalar(Math.max(0.001, backOut(kk)));
      coreRef.current.position.z = 0.22;
    }

    // 10 — Ignition & Glow Dynamics
    const ign = win(p, 0.66, 0.80);
    const calm = win(p, 0.80, 0.94);
    const glow = ign * (1 - 0.92 * calm);

    if (coreLightRef.current) {
      coreLightRef.current.intensity =
        glow * 4.8 * (0.92 + Math.sin(t * 8) * 0.08);
    }

    // Dynamic emissive levels for materials
    mat.coreGlow.emissiveIntensity =
      0.6 + ign * (1.6 - 0.7 * calm) + (asm > 0.95 ? Math.sin(t * 5.3) * 0.12 : 0);
    mat.cyanGlass.emissiveIntensity = 2.0 - 0.9 * calm;
    mat.slotGlow.emissiveIntensity =
      (0.5 + ign * (2.4 - 0.6 * calm)) * (1 + Math.sin(t * 5.3) * 0.06);

    if (tickRef.current && asm > 0.95) {
      tickRef.current.rotation.z += 0.002;
    }

    // Robotic Arms Reach and Retract
    if (armsRef.current) {
      const reach = easeOut(win(p, 0.34, 0.5));
      const retract = easeOut(win(p, 0.68, 0.84));
      const engage = reach * (1 - retract);
      armsRef.current.children.forEach((arm, i) => {
        arm.scale.setScalar(engage < 0.02 ? 0.001 : 1);
        const forearm = arm.children[1] as THREE.Object3D | undefined;
        if (forearm) {
          forearm.rotation.z =
            lerp(-0.5, -1.0, engage) + Math.sin(t * 1.5 + i) * 0.05;
        }
        arm.position.z = 0.4;
      });
    }

    // Root Group Idle Parallax & Settle
    if (rootRef.current) {
      const intro = easeOut(win(p, 0, 0.3));
      const small = state.size.width < 640;
      const settle = easeOut(win(p, 0.8, 0.96));
      rootRef.current.scale.setScalar(
        lerp(0.62, 1, intro) * lerp(1, small ? 0.58 : 0.74, settle)
      );
      rootRef.current.position.y = lerp(0, small ? 1.0 : 0.8, settle);
      rootRef.current.rotation.y =
        Math.sin(t * 0.25) * 0.06 + (1 - asm) * 0.25;
      rootRef.current.rotation.x =
        lerp(0.35, 0, easeOut(win(p, 0.3, 0.7))) + Math.sin(t * 0.2) * 0.02;
    }
  });

  const armAngles = [
    Math.PI * 0.25,
    Math.PI * 0.75,
    Math.PI * 1.25,
    Math.PI * 1.75,
  ];

  return (
    <group ref={rootRef}>
      {/* 1 — Outer Bezel: machined outer rim + cyan edge ring + hex bolts */}
      <group ref={bezelRef} scale={0.001}>
        <mesh material={mat.darkMetal}>
          <torusGeometry args={[2.16, 0.13, 20, 80]} />
        </mesh>
        <mesh material={mat.steel} position={[0, 0, -0.06]}>
          <ringGeometry args={[1.98, 2.16, 80]} />
        </mesh>
        <mesh material={mat.cyanGlass}>
          <torusGeometry args={[2.16, 0.045, 12, 80]} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={mat.brightMetal}
              position={[Math.cos(a) * 2.06, Math.sin(a) * 2.06, -0.02]}
              rotation={[Math.PI / 2, 0, a]}
            >
              <cylinderGeometry args={[0.045, 0.045, 0.05, 6]} />
            </mesh>
          );
        })}
      </group>

      {/* 2 — Dashed Tick Ring */}
      <group ref={tickRef} scale={0.001}>
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={i % 2 === 0 ? mat.slotGlow : mat.brightMetal}
              position={[Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.025, 0.08, 0.04]} />
            </mesh>
          );
        })}
      </group>

      {/* 3 — Housing Well & Boundary Rings */}
      <group ref={housingRef} scale={0.001}>
        {/* Outer boundary torus of the coil well */}
        <mesh material={mat.darkMetal}>
          <torusGeometry args={[1.82, 0.14, 20, 72]} />
        </mesh>
        {/* Recessed well floor */}
        <mesh
          material={mat.darkMetal}
          position={[0, 0, -0.16]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[1.82, 1.82, 0.12, 72]} />
        </mesh>
        {/* Steel floor facing */}
        <mesh material={mat.steel} position={[0, 0, -0.09]}>
          <ringGeometry args={[0.62, 1.78, 72]} />
        </mesh>
        {/* Inner boundary ring of the coil well */}
        <mesh material={mat.darkMetal} position={[0, 0, -0.02]}>
          <torusGeometry args={[1.12, 0.04, 14, 64]} />
        </mesh>
        {/* Concentric machined cyan ring */}
        <mesh material={mat.cyanGlass} position={[0, 0, 0.02]}>
          <torusGeometry args={[1.08, 0.025, 12, 64]} />
        </mesh>
        <mesh material={mat.steel} position={[0, 0, 0.03]}>
          <torusGeometry args={[0.88, 0.03, 12, 64]} />
        </mesh>
      </group>

      {/* 4 — 8 Copper Coil Blocks */}
      <group ref={coilsRef}>
        {coilStarts.map((_, i) => (
          <group key={i} scale={0.001}>
            {/* Outer orange/copper raised border */}
            <mesh geometry={coilGeo} material={mat.copper} />
            {/* Dark oxidized core inset */}
            <mesh
              geometry={coilCoreGeo}
              material={mat.copperDark}
              position={[0, 0, 0.02]}
            />
            {/* Center radial split groove */}
            <mesh material={mat.darkMetal} position={[0, 0, 0.08]}>
              <boxGeometry args={[0.025, 0.54, 0.04]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5 — 5 Glowing Cyan Radial Dividers */}
      <group ref={dividersRef}>
        {dividerStarts.map((_, i) => (
          <group key={i} scale={0.001}>
            <mesh material={mat.slotGlow}>
              <boxGeometry args={[0.045, 0.56, 0.08]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6 — Center Toothed Gear Collar */}
      <group ref={gearCollarRef} scale={0.001}>
        {/* Circular hub ring */}
        <mesh material={mat.steel} position={[0, 0, 0.02]}>
          <torusGeometry args={[0.62, 0.04, 14, 48]} />
        </mesh>
        <mesh material={mat.cyanGlass} position={[0, 0, 0.04]}>
          <torusGeometry args={[0.54, 0.02, 10, 48]} />
        </mesh>
        {/* 20 radial gear teeth */}
        {Array.from({ length: 20 }).map((_, i) => {
          const a = (i / 20) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={mat.steel}
              position={[Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.02]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.07, 0.12, 0.06]} />
            </mesh>
          );
        })}
      </group>

      {/* 7 — Inverted Hollow Triangular Frame (Truss Structure) */}
      <group ref={triFrameRef} scale={0.001}>
        {/* Main beveled structural metal frame */}
        <mesh geometry={hollowTriGeo} material={mat.brightMetal} />
        {/* Cyan luminous face rail / edge trim */}
        <mesh
          geometry={hollowTriTrimGeo}
          material={mat.cyanGlass}
          position={[0, 0, 0.09]}
        />
        {/* Nested HUD wireframe inverted triangles inside the frame */}
        <mesh
          geometry={nestTriGeo1}
          material={mat.cyanGlass}
          position={[0, 0, 0.06]}
        />
        <mesh
          geometry={nestTriGeo2}
          material={mat.slotGlow}
          position={[0, 0, 0.08]}
        />
      </group>

      {/* 8 — 3 Circular Corner Nodes at Triangle Vertices */}
      <group ref={nodesRef}>
        {CORNER_ANGLES.map((a, i) => {
          const x = Math.cos(a) * CORNER_R;
          const y = Math.sin(a) * CORNER_R;
          return (
            <group key={i} position={[x, y, 0.18]} scale={0.001}>
              {/* Outer cyan glass torus ring */}
              <mesh material={mat.cyanGlass}>
                <torusGeometry args={[0.18, 0.035, 16, 32]} />
              </mesh>
              {/* Dark recessed cylinder hub */}
              <mesh
                material={mat.darkMetal}
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0, -0.02]}
              >
                <cylinderGeometry args={[0.17, 0.17, 0.10, 32]} />
              </mesh>
              {/* Steel inset washer */}
              <mesh
                material={mat.steel}
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0, 0.02]}
              >
                <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
              </mesh>
              {/* Center glowing cyan pin/dot */}
              <mesh
                material={mat.coreGlow}
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0, 0.05]}
              >
                <cylinderGeometry args={[0.06, 0.06, 0.08, 20]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 9 — Central Glowing Upward-Pointing Triangle Core */}
      <group ref={coreRef} scale={0.001}>
        {/* Outer glowing triangle casing */}
        <mesh geometry={coreTriOuter} material={mat.cyanGlass} />
        {/* Middle radiant glowing triangle */}
        <mesh
          geometry={coreTriMid}
          material={mat.coreGlow}
          position={[0, 0, 0.04]}
        />
        {/* Innermost white-hot triangle heart */}
        <mesh
          geometry={coreTriInner}
          material={mat.coreGlow}
          position={[0, 0, 0.08]}
        />
        {/* Radiant point light */}
        <pointLight
          ref={coreLightRef}
          color="#7de7f5"
          distance={9}
          intensity={0}
          position={[0, 0, 0.45]}
        />
      </group>

      {/* 10 — Robotic Assembly Arms */}
      <group ref={armsRef}>
        {armAngles.map((a, i) => {
          const R = 4.2;
          return (
            <group
              key={i}
              position={[Math.cos(a) * R, Math.sin(a) * R, 0.4]}
              rotation={[0, 0, a + Math.PI]}
              scale={0.001}
            >
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
