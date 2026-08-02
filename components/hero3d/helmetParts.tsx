"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Helmet geometry factories. Materials come from `../reactor3d/parts` — the
 * helmet is deliberately milled from the same palette as the reactor was, so
 * it reads as the same fabrication.
 *
 * Every shape is authored in final XY position (front view, +Y up, +X right)
 * and extruded along Z, so panels line up without per-part offsets. Nothing
 * here uses Math.random — geometry must be deterministic for SSR safety.
 */

type Pt = [number, number];

/**
 * Build a closed shape symmetric about x=0 from a right-hand outline given
 * top-centre → bottom-centre. First and last points must sit on the axis.
 */
function symShape(half: Pt[]) {
  const shape = new THREE.Shape();
  shape.moveTo(half[0][0], half[0][1]);
  for (let i = 1; i < half.length; i++) shape.lineTo(half[i][0], half[i][1]);
  for (let i = half.length - 2; i >= 1; i--) shape.lineTo(-half[i][0], half[i][1]);
  shape.closePath();
  return shape;
}

/**
 * Extrude a shape and bend it into compound curvature by pushing each vertex
 * back along -Z as a function of x² and y². Without this, extruded panels read
 * as flat cardboard; with it they read as pressed armour.
 */
function extrudeBent(shape: THREE.Shape, depth: number, bendX: number, bendY: number) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) - (bendX * x * x + bendY * y * y));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/* ── Outlines ────────────────────────────────────────────────────────────
   Proportions are deliberately our own: a taller brow, a narrower jaw and a
   steeper cheek line than the screen sculpt. See the IP note in the plan. */

// Faceplate: the flip-up mask — brow down to just above the mouth vent. Kept
// as ONE dominant clean surface; side plates sit outboard of it, never across
// it, or the face turns to visual noise.
// Densely sampled on purpose: ExtrudeGeometry triangulates the cap with earcut,
// so a sparse outline yields a few huge uneven facets and the per-vertex bend
// below turns them into hard bright wedges under the rim light.
const FACE: Pt[] = [
  [0, 1.2],
  [0.22, 1.19],
  [0.42, 1.14],
  [0.58, 1.05],
  [0.72, 0.92],
  [0.81, 0.72],
  [0.86, 0.5],
  [0.86, 0.28],
  [0.84, 0.05],
  [0.8, -0.09],
  [0.74, -0.22],
  [0.64, -0.31],
  [0.52, -0.36],
  [0.28, -0.39],
  [0, -0.4],
];

// Jaw: mouth vent down to the chin, seating flush under the faceplate.
const JAW: Pt[] = [
  [0, -0.34],
  [0.28, -0.32],
  [0.5, -0.3],
  [0.55, -0.48],
  [0.56, -0.66],
  [0.5, -0.86],
  [0.42, -1.02],
  [0.32, -1.16],
  [0.22, -1.26],
  [0, -1.32],
];

// Nose/centre ridge — the spine that stops the mid-face reading as a slab.
const NOSE: Pt[] = [
  [0, 0.76],
  [0.1, 0.6],
  [0.11, 0.04],
  [0.07, -0.2],
  [0, -0.24],
];

// Crown ridge: a narrow spine hugging the top of the skull. Kept below the
// dome's own apex (1.5) — poking above it read as a party hat.
const CROWN: Pt[] = [
  [0, 1.38],
  [0.15, 1.3],
  [0.19, 1.0],
  [0.17, 0.62],
  [0, 0.56],
];

// Cheek plate: sits OUTBOARD of the faceplate edge (x ≥ 0.8) and further back,
// so it frames the face instead of cutting across it.
const CHEEK: Pt[] = [
  [0.8, 0.58],
  [0.99, 0.3],
  [1.0, -0.16],
  [0.88, -0.58],
  [0.74, -0.52],
  [0.78, 0.12],
];

/** Asymmetric side plates are authored as an explicit loop, not mirrored. */
function loopShape(pts: Pt[]) {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  return shape;
}

export function useHelmetShellGeometries() {
  return useMemo(() => {
    // Skull: lathe profile revolved around Y, then squashed into an ovoid that
    // is deeper than it is wide (a head, not a ball).
    const profile = [
      new THREE.Vector2(0.03, 1.5),
      new THREE.Vector2(0.34, 1.46),
      new THREE.Vector2(0.62, 1.3),
      new THREE.Vector2(0.83, 1.04),
      new THREE.Vector2(0.96, 0.68),
      new THREE.Vector2(1.02, 0.24),
      new THREE.Vector2(1.02, -0.22),
      new THREE.Vector2(0.96, -0.62),
      new THREE.Vector2(0.82, -0.98),
      new THREE.Vector2(0.6, -1.18),
    ];
    // Partial lathe: three.js maps phi=0 to +Z, so starting at 0.30π leaves a
    // ~108° gap facing the camera for the faceplate to fill. A full revolution
    // would enclose the face panels inside the dome.
    const skull = new THREE.LatheGeometry(profile, 24, Math.PI * 0.3, Math.PI * 1.4);
    // Narrower than tall, and deliberately SHALLOWER than the faceplate's front
    // face. At z-scale > 1 the dome bulged past the mask and the whole thing
    // read as an egg with a face painted on it.
    skull.scale(0.92, 1, 0.95);
    skull.computeVertexNormals();

    // Gentle bends: the mask is meant to read angular and machined, and heavy
    // curvature on a faceted cap just amplifies the facet seams.
    const faceplate = extrudeBent(symShape(FACE), 0.16, 0.2, 0.07);
    const jaw = extrudeBent(symShape(JAW), 0.15, 0.22, 0.09);
    const crown = extrudeBent(symShape(CROWN), 0.14, 0.5, 0.16);
    const nose = extrudeBent(symShape(NOSE), 0.1, 0.6, 0.05);
    const cheek = extrudeBent(loopShape(CHEEK), 0.13, 0.24, 0.08);

    // Neck collar — a shallow ring the helmet seats onto.
    const collar = new THREE.CylinderGeometry(0.66, 0.78, 0.22, 20, 1, true);

    // Mouth vent slat (instanced across the jaw).
    const slat = new THREE.BoxGeometry(0.52, 0.045, 0.08);

    // One half of the scowl: two of these, mirrored and raked, form the brow's
    // shallow V. A single straight bar reads blank rather than angry.
    const brow = new THREE.BoxGeometry(0.62, 0.1, 0.11);

    return { skull, faceplate, jaw, crown, nose, cheek, collar, slat, brow };
  }, []);
}

/**
 * Eye slit — a raked trapezoid, thicker at the inner (nose) end so the helmet
 * reads as scowling rather than surprised. Length runs along local +X.
 */
export function useEyeSlitGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.28, -0.055);
    shape.lineTo(0.28, -0.085);
    shape.lineTo(0.28, 0.085);
    shape.lineTo(-0.28, 0.045);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: false });
    geo.center();
    return geo;
  }, []);
}
