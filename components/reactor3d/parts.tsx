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
    return { darkMetal, brightMetal, copper, cyanGlass, coreGlow };
  }, []);
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
