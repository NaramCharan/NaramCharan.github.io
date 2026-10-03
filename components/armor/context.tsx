"use client";

import { createContext, useContext, useMemo, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";

/* ── Shared PBR materials ─────────────────────────────────────────────
 * One instance per material so ~120 meshes share a handful of programs.
 * The two emissive materials (optics, reactor) are driven per-frame by
 * <Systems/> from scroll progress. */
export function createMaterials() {
  const red = new THREE.MeshPhysicalMaterial({
    color: "#a8101a",
    metalness: 0.85,
    roughness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
  });
  const redDark = new THREE.MeshPhysicalMaterial({
    color: "#5c070d",
    metalness: 0.85,
    roughness: 0.35,
    clearcoat: 0.6,
    side: THREE.DoubleSide,
  });
  const gold = new THREE.MeshPhysicalMaterial({
    color: "#c99532",
    metalness: 1,
    roughness: 0.32,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });
  const steel = new THREE.MeshStandardMaterial({ color: "#9aa0a8", metalness: 1, roughness: 0.3 });
  const frame = new THREE.MeshStandardMaterial({ color: "#2b2e34", metalness: 0.9, roughness: 0.45 });
  const cable = new THREE.MeshStandardMaterial({ color: "#b07a2a", metalness: 0.9, roughness: 0.4 });
  const black = new THREE.MeshStandardMaterial({ color: "#0b0c0f", metalness: 0.5, roughness: 0.6 });
  const eye = new THREE.MeshStandardMaterial({
    color: "#0d1418",
    emissive: new THREE.Color("#dffbff"),
    emissiveIntensity: 0,
    toneMapped: false,
  });
  const reactor = new THREE.MeshStandardMaterial({
    color: "#0c1a1e",
    emissive: new THREE.Color("#9ef3ff"),
    emissiveIntensity: 0,
    toneMapped: false,
  });
  return { red, redDark, gold, steel, frame, cable, black, eye, reactor };
}
export type ArmorMaterials = ReturnType<typeof createMaterials>;

type Ctx = {
  /** Smoothed scroll progress 0..1 (read inside useFrame, never in render). */
  progressRef: MutableRefObject<number>;
  mats: ArmorMaterials;
  reduced: boolean;
  /** Optional GLB replacements keyed by part id — see <Part/>. */
  assets: Record<string, THREE.Object3D> | null;
};

const ArmorCtx = createContext<Ctx | null>(null);

export function ArmorProvider({
  progress,
  reduced,
  assets = null,
  children,
}: {
  progress: MutableRefObject<number>;
  reduced: boolean;
  assets?: Record<string, THREE.Object3D> | null;
  children: ReactNode;
}) {
  const mats = useMemo(() => createMaterials(), []);
  const value = useMemo(() => ({ progressRef: progress, mats, reduced, assets }), [progress, mats, reduced, assets]);
  return <ArmorCtx.Provider value={value}>{children}</ArmorCtx.Provider>;
}

export function useArmor() {
  const c = useContext(ArmorCtx);
  if (!c) throw new Error("useArmor must be used inside <ArmorProvider>");
  return c;
}
