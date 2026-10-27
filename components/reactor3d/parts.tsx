"use client";

import { useMemo } from "react";
import * as THREE from "three";

/* Shared materials — memoised so all instances share GPU programs. */
export function useReactorMaterials() {
  return useMemo(() => {
    const darkMetal = new THREE.MeshPhysicalMaterial({
      color: "#08131a",
      metalness: 0.95,
      roughness: 0.35,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
    });
    const brightMetal = new THREE.MeshPhysicalMaterial({
      color: "#18404c",
      metalness: 1,
      roughness: 0.2,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
    });
    // Glowing cyan frame / glass accents
    const cyanGlass = new THREE.MeshStandardMaterial({
      color: "#22d3ee",
      emissive: "#22d3ee",
      emissiveIntensity: 2.2,
      metalness: 0.2,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92,
    });
    // Orange/amber copper border for the coil blocks
    const copper = new THREE.MeshPhysicalMaterial({
      color: "#ea7a24",
      metalness: 0.85,
      roughness: 0.3,
      emissive: "#8a3a05",
      emissiveIntensity: 0.45,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
    });
    // Dark oxidized bronze/copper interior of each coil
    const copperDark = new THREE.MeshStandardMaterial({
      color: "#2e1507",
      metalness: 0.9,
      roughness: 0.5,
      emissive: "#190a03",
      emissiveIntensity: 0.2,
    });
    // Intense emissive white-cyan for the central upward triangle
    const coreGlow = new THREE.MeshStandardMaterial({
      color: "#eafdff",
      emissive: "#bdf3fb",
      emissiveIntensity: 2.8,
      metalness: 0,
      roughness: 0.1,
    });
    // Machined steel for the concentric rings & gear collar
    const steel = new THREE.MeshPhysicalMaterial({
      color: "#284b57",
      metalness: 1,
      roughness: 0.24,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    });
    // The cold white-blue plasma spilling from between the coils & divider slots
    const slotGlow = new THREE.MeshStandardMaterial({
      color: "#eafdff",
      emissive: "#22d3ee",
      emissiveIntensity: 2.0,
      metalness: 0,
      roughness: 0.2,
    });
    return {
      darkMetal,
      brightMetal,
      copper,
      copperDark,
      cyanGlass,
      coreGlow,
      steel,
      slotGlow,
    };
  }, []);
}

/**
 * A single radial coil trapezoid (narrow inner edge, wide outer edge) extruded in z.
 * Length runs along local +Y (outward).
 */
export function useTrapezoidGeometry(
  innerW = 0.34,
  outerW = 0.54,
  length = 0.56,
  depth = 0.14
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
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
    });
    geo.center();
    return geo;
  }, [innerW, outerW, length, depth]);
}

/**
 * Downward-pointing hollow triangular frame (equilateral inverted triangle).
 * Apex points straight DOWN at -Y; top edge is horizontal between top-left and top-right.
 * Created using THREE.Shape with a hole so the center is completely open/hollow.
 */
export function useHollowTriangleGeometry(
  outerRadius = 1.25,
  innerRadius = 1.02,
  depth = 0.16
) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    // Angles for inverted equilateral triangle:
    // Top-Right: 30 deg (pi/6)
    // Top-Left: 150 deg (5pi/6)
    // Bottom: 270 deg (3pi/2)
    // CCW order: 30 -> 150 -> 270 -> 30
    const angles = [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2];

    angles.forEach((a, i) => {
      const x = Math.cos(a) * outerRadius;
      const y = Math.sin(a) * outerRadius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();

    // Inner hole in CW (opposite) order: 30 -> 270 -> 150 -> 30
    const holeAngles = [Math.PI / 6, (3 * Math.PI) / 2, (5 * Math.PI) / 6];
    const hole = new THREE.Path();
    holeAngles.forEach((a, i) => {
      const x = Math.cos(a) * innerRadius;
      const y = Math.sin(a) * innerRadius;
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    });
    hole.closePath();
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, [outerRadius, innerRadius, depth]);
}

/**
 * Upward-pointing solid triangular prism (the glowing core triangle).
 * Apex points straight UP at +Y (90 deg / pi/2); base is horizontal at -Y.
 */
export function useUpwardTriangleGeometry(radius = 0.44, depth = 0.12) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    // CCW order: 90 deg -> 210 deg -> 330 deg
    const angles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
    angles.forEach((a, i) => {
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, [radius, depth]);
}
