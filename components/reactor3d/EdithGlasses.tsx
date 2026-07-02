"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The EDITH smart-glasses — the opening shot. A full, real-looking pair of
 * squared aviators (Tony-Stark style): rimmed tinted lenses, a solid brow bar,
 * a double bridge, hinges and temple arms swept back. They hover front-and-
 * centre while the welcome line shows (progress 0), then the camera "pushes
 * through" them — scaling toward the viewer and fading — as the reactor begins
 * to assemble (~0.06–0.28). Built entirely from primitives, no external asset.
 */
type Props = { progress: React.MutableRefObject<number> };

const win = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));
const easeIn = (t: number) => t * t;

// Squared-aviator lens outline as a rounded rect.
function lensPoints(w: number, h: number, r: number) {
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
  return s;
}

const LW = 0.7, LH = 0.56, LR = 0.16;

export default function EdithGlasses({ progress }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const { frame, frameEdge, lens, tint } = useMemo(() => {
    const frame = new THREE.MeshStandardMaterial({
      color: "#15171c",
      metalness: 1,
      roughness: 0.25,
    });
    const frameEdge = new THREE.MeshStandardMaterial({
      color: "#2a2d33",
      metalness: 1,
      roughness: 0.18,
      emissive: "#0e3a44",
      emissiveIntensity: 0.6,
    });
    const lens = new THREE.MeshStandardMaterial({
      color: "#061119",
      metalness: 0.8,
      roughness: 0.05,
      transparent: true,
      opacity: 0.88,
      emissive: "#0a2f39",
      emissiveIntensity: 0.32,
    });
    const tint = new THREE.MeshStandardMaterial({
      color: "#22d3ee",
      emissive: "#22d3ee",
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.16,
    });
    return { frame, frameEdge, lens, tint };
  }, []);

  const lensGeo = useMemo(() => new THREE.ShapeGeometry(lensPoints(LW, LH, LR)), []);
  const rimGeo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          lensPoints(LW, LH, LR).getPoints(64).map((pt) => new THREE.Vector3(pt.x, pt.y, 0)),
          true
        ),
        140,
        0.05,
        10,
        true
      ),
    []
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = progress.current;
    const exit = win(p, 0.06, 0.28);
    const e = easeIn(exit);
    g.scale.setScalar(1 + e * 2.6);
    g.position.z = e * 5;
    g.position.y = e * 0.7;
    const vis = 1 - exit;
    lens.opacity = 0.88 * vis;
    tint.opacity = 0.16 * vis;
    frame.opacity = vis;
    frame.transparent = true;
    frameEdge.opacity = vis;
    frameEdge.transparent = true;
    g.visible = vis > 0.01;
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.09 * (1 - e);
    g.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.04 * (1 - e);
  });

  const cx = LW + 0.28; // lens centre offset from origin

  return (
    <group ref={groupRef} position={[0, 0, 1.3]} scale={0.95}>
      {/* Lenses + rims */}
      {[-cx, cx].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh geometry={lensGeo} material={lens} />
          <mesh geometry={lensGeo} material={tint} position={[0, 0, 0.012]} />
          <mesh geometry={rimGeo} material={frame} />
        </group>
      ))}

      {/* Solid brow bar across the top (the EDITH signature) */}
      <mesh material={frameEdge} position={[0, LH - 0.02, 0.02]}>
        <boxGeometry args={[cx * 2 + LW + 0.1, 0.09, 0.09]} />
      </mesh>

      {/* Double bridge between the lenses */}
      <mesh material={frame} position={[0, 0.12, 0]}>
        <boxGeometry args={[cx * 2 - LW * 2 + 0.06, 0.06, 0.07]} />
      </mesh>
      <mesh material={frame} position={[0, -0.06, 0]}>
        <boxGeometry args={[cx * 2 - LW * 2 + 0.06, 0.05, 0.07]} />
      </mesh>

      {/* Nose pads */}
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} material={frame} position={[x, -0.34, 0.06]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
          <boxGeometry args={[0.04, 0.18, 0.04]} />
        </mesh>
      ))}

      {/* Hinges + temple arms swept back */}
      {[-1, 1].map((s) => {
        const hx = s * (cx + LW - 0.02);
        return (
          <group key={s}>
            {/* hinge block */}
            <mesh material={frameEdge} position={[hx, LH - 0.08, 0]}>
              <boxGeometry args={[0.12, 0.14, 0.12]} />
            </mesh>
            {/* temple arm */}
            <mesh
              material={frame}
              position={[hx + s * 0.5, LH - 0.12, -0.5]}
              rotation={[0, s * 0.62, -0.04]}
            >
              <boxGeometry args={[0.06, 0.07, 1.15]} />
            </mesh>
            {/* ear tip */}
            <mesh
              material={frame}
              position={[hx + s * 0.72, LH - 0.2, -1.02]}
              rotation={[0.25, s * 0.62, -0.04]}
            >
              <boxGeometry args={[0.055, 0.07, 0.32]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
