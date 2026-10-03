"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useArmor } from "./context";
import { lockIn, win } from "./timeline";

type V3 = [number, number, number];

/**
 * One independently animated armor component.
 *
 *   <Part id="faceplate" at={[0.16, 0.22]} from={[0, 0.25, 0.7]} spin={[-0.8, 0, 0]}>
 *     …procedural geometry…
 *   </Part>
 *
 * The outer group holds the part's FINAL pose in its parent bone's space;
 * the inner group carries the scroll-driven offset, which decays from
 * `from`/`spin` to zero across the window `at` (in global progress) with a
 * lock-in overshoot. Before its window a part floats at its offset with a
 * slight idle drift; after it, it is locked.
 *
 * GLB swap: if an asset map is supplied to <ArmorProvider assets={…}> and it
 * contains a node named `id`, that node replaces the procedural children —
 * same socket, same animation. See ArmorAssets in ./assets.tsx.
 */
export default function Part({
  id,
  at,
  from = [0, 0, 0],
  spin = [0, 0, 0],
  position,
  rotation,
  children,
}: {
  id: string;
  at: [number, number];
  from?: V3;
  spin?: V3;
  position?: V3;
  rotation?: V3;
  children: ReactNode;
}) {
  const { progressRef, assets, reduced } = useArmor();
  const inner = useRef<Group>(null);
  // Deterministic per-part phase for the idle drift (no Math.random).
  const seed = useMemo(() => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7), [id]);
  const override = assets?.[id];
  const replacement = useMemo(() => override?.clone(true) ?? null, [override]);

  useFrame(({ clock }) => {
    const g = inner.current;
    if (!g) return;
    const t = win(progressRef.current, at[0], at[1]);
    const k = t <= 0 ? 0 : t >= 1 ? 1 : lockIn(t);
    const r = 1 - k; // residual offset (goes slightly negative on overshoot)
    const drift = reduced || t >= 1 ? 0 : Math.sin(clock.elapsedTime * 0.9 + seed) * 0.018 * (1 - t);
    g.position.set(from[0] * r, from[1] * r + drift, from[2] * r);
    g.rotation.set(spin[0] * r, spin[1] * r + drift * 2, spin[2] * r);
  });

  return (
    <group position={position} rotation={rotation} name={id}>
      <group ref={inner}>{replacement ? <primitive object={replacement} /> : children}</group>
    </group>
  );
}
