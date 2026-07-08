"use client";

import { useMemo } from "react";
import * as THREE from "three";

/* Shared materials — memoised so all instances share GPU programs. */
export function useReactorMaterials() {
  return useMemo(() => {
    const darkMetal = new THREE.MeshStandardMaterial({
      color: "#0c1a22",
      metalness: 0.95,
      roughness: 0.34,
    });
    const brightMetal = new THREE.MeshStandardMaterial({
      color: "#173a44",
      metalness: 1,
      roughness: 0.22,
    });
    const copper = new THREE.MeshStandardMaterial({
      color: "#c9772e",
      metalness: 1,
      roughness: 0.32,
      emissive: "#3a1e08",
      emissiveIntensity: 0.4,
    });
    const cyanGlass = new THREE.MeshStandardMaterial({
      color: "#22d3ee",
      emissive: "#22d3ee",
      emissiveIntensity: 2.2,
      metalness: 0.2,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92,
    });
    const coreGlow = new THREE.MeshStandardMaterial({
      color: "#eafdff",
      emissive: "#bdf3fb",
      emissiveIntensity: 2.6,
      metalness: 0,
      roughness: 0.1,
    });
    // Machined steel for the concentric rings + core tooth-ring — reads as a
    // milled part catching the rim light, distinct from the near-black darkMetal.
    const steel = new THREE.MeshStandardMaterial({
      color: "#2a4a55",
      metalness: 1,
      roughness: 0.26,
    });
    // The cold white-blue plasma spilling from between the coils — the real
    // prop's light source. Kept separate from cyanGlass so the gap-glow can
    // stay luminous at idle while decorative cyan bits calm down.
    const slotGlow = new THREE.MeshStandardMaterial({
      color: "#eafdff",
      emissive: "#a8ecf9",
      emissiveIntensity: 0.5,
      metalness: 0,
      roughness: 0.4,
    });
    // Darker enamelled copper for the wire-wrap bands across each coil.
    const copperDark = new THREE.MeshStandardMaterial({
      color: "#7a4517",
      metalness: 1,
      roughness: 0.45,
    });
    return { darkMetal, brightMetal, copper, cyanGlass, coreGlow, steel, slotGlow, copperDark };
  }, []);
}

/**
 * A single radial coil segment — a trapezoid (narrow inner edge, wide outer
 * edge) extruded in z, so ten of them fan around the ring like the copper
 * windings of a real arc reactor. Length runs along local +Y (outward).
 */
export function useTrapezoidGeometry(
  innerW = 0.3,
  outerW = 0.46,
  length = 0.62,
  depth = 0.16
) {
  return useMemo(() => {
    const h = length / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-innerW / 2, -h);
    shape.lineTo(innerW / 2, -h);
    shape.lineTo(outerW / 2, h);
    shape.lineTo(-outerW / 2, h);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 1,
    });
    geo.center();
    return geo;
  }, [innerW, outerW, length, depth]);
}

/* Downward-pointing triangular prism (the Mark XLII "new element" core rotor). */
export function useTriangleGeometry(radius = 1.15, depth = 0.26) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    // pointing down: apex at bottom
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3 + Math.PI; // rotate so apex down
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, [radius, depth]);
}
