"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The EDITH smart-glasses — the opening shot. They hover front-and-centre while
 * the welcome line shows (progress 0), then the camera "pushes through" them:
 * they scale up toward the viewer and fade as the reactor begins to assemble
 * (progress ~0.06–0.26). Built from primitives — two tinted lenses + a metal
 * frame + bridge + arms — no external asset.
 */
type Props = { progress: React.MutableRefObject<number> };

const win = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));
const easeIn = (t: number) => t * t;

export default function EdithGlasses({ progress }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const { frame, lens, tint } = useMemo(() => {
    const frame = new THREE.MeshStandardMaterial({
      color: "#1a1d22",
      metalness: 1,
      roughness: 0.28,
    });
    const lens = new THREE.MeshStandardMaterial({
      color: "#0a1a22",
      metalness: 0.6,
      roughness: 0.08,
      transparent: true,
      opacity: 0.78,
      emissive: "#0e4a58",
      emissiveIntensity: 0.5,
    });
    const tint = new THREE.MeshStandardMaterial({
      color: "#22d3ee",
      emissive: "#22d3ee",
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.35,
    });
    return { frame, lens, tint };
  }, []);

  // Aviator-ish squared lens outline as a rounded rect shape.
  const lensGeo = useMemo(() => {
    const w = 0.62, h = 0.5, r = 0.12;
    const s = new THREE.Shape();
    s.moveTo(-w + r, -h);
    s.lineTo(w - r, -h);
    s.quadraticCurveTo(w, -h, w, -h + r);
    s.lineTo(w, h - r);
    s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h);
    s.quadraticCurveTo(-w, h, -w, h - r);
    s.lineTo(-w, -h + r);
    s.quadraticCurveTo(-w, -h, -w + r, -h);
    return new THREE.ShapeGeometry(s);
  }, []);

  const ringGeo = useMemo(() => {
    const w = 0.62, h = 0.5, r = 0.12;
    const s = new THREE.Shape();
    s.moveTo(-w + r, -h);
    s.lineTo(w - r, -h);
    s.quadraticCurveTo(w, -h, w, -h + r);
    s.lineTo(w, h - r);
    s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h);
    s.quadraticCurveTo(-w, h, -w, h - r);
    s.lineTo(-w, -h + r);
    s.quadraticCurveTo(-w, -h, -w + r, -h);
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        s.getPoints(60).map((pt) => new THREE.Vector3(pt.x, pt.y, 0)),
        true
      ),
      120,
      0.035,
      8,
      true
    );
  }, []);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = progress.current;
    const exit = win(p, 0.05, 0.26); // push-through window
    const e = easeIn(exit);
    // scale up toward viewer + drift up, fading via material opacity
    const scale = 1 + e * 2.4;
    g.scale.setScalar(scale);
    g.position.z = e * 4.5;
    g.position.y = e * 0.6;
    const vis = 1 - exit;
    lens.opacity = 0.78 * vis;
    tint.opacity = 0.35 * vis;
    frame.opacity = vis;
    frame.transparent = true;
    g.visible = vis > 0.01;
    // gentle idle bob while showing
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08 * (1 - e);
    g.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.04 * (1 - e);
  });

  return (
    <group ref={groupRef} position={[0, 0, 1.2]}>
      {[-0.72, 0.72].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh geometry={lensGeo} material={lens} />
          <mesh geometry={lensGeo} material={tint} position={[0, 0, 0.01]} />
          <mesh geometry={ringGeo} material={frame} />
        </group>
      ))}
      {/* bridge */}
      <mesh material={frame} position={[0, 0.12, 0]}>
        <boxGeometry args={[0.28, 0.06, 0.06]} />
      </mesh>
      {/* brow bar */}
      <mesh material={frame} position={[0, 0.5, 0]}>
        <boxGeometry args={[2.1, 0.05, 0.05]} />
      </mesh>
      {/* temple arms */}
      {[-1.34, 1.34].map((x) => (
        <mesh key={x} material={frame} position={[x, 0.24, -0.35]} rotation={[0, x > 0 ? -0.5 : 0.5, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.8]} />
        </mesh>
      ))}
    </group>
  );
}
