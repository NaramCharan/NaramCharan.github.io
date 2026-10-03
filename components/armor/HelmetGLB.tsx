"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Part from "./Part";
import { useArmor } from "./context";
import { BODY, smooth, win } from "./timeline";

/**
 * The real helmet: "Ironman Mark III Helmet *free*" by Demonic Arts
 * (https://sketchfab.com/3d-models/ironman-mark-iii-helmet-free-71a03274781145699ac9f88d03609c43),
 * licensed CC-BY-4.0 — credited on the pages that render it.
 *
 * Optimised from the 18 MB download with gltf-transform: textures resized to
 * 1024² and re-encoded as WebP, geometry meshopt-compressed (≈ 0.59 MB). The
 * meshopt decoder ships with drei, so nothing is fetched from a CDN.
 *
 * The model comes as five separate pieces, each of which becomes a <Part/>
 * with its own fly-in window, so the scroll/timed build assembles the actual
 * helmet. The whole model is normalised to BODY.height and centred on the
 * origin, so cameras framed for the old procedural helmet still fit.
 */

export const HELMET_URL = "/models/mark3-helmet.glb";

/** Source node → assembly order. `from`/`spin` are fly-in offsets in the
 *  normalised (≈ 2-unit-tall) space; `at` is the window in progress. */
const PIECES = [
  { node: "Back_low", id: "helmet_back", at: [0.08, 0.24], from: [0, 0.35, -1.5], spin: [0.7, 0, 0] },
  { node: "Middle_low", id: "helmet_middle", at: [0.2, 0.36], from: [0.95, 0.15, -0.4], spin: [0, 0.9, 0.3] },
  { node: "Bottom_low", id: "jaw", at: [0.34, 0.52], from: [-0.3, -1.3, 0.5], spin: [0.9, 0, 0] },
  { node: "Front_low", id: "faceplate", at: [0.56, 0.72], from: [-0.35, 1.0, 1.2], spin: [-1.1, 0.3, 0] },
  // the eye glass rides in with the faceplate it sits behind
  { node: "Glas_low", id: "optics", at: [0.56, 0.72], from: [-0.35, 1.0, 1.2], spin: [-1.1, 0.3, 0] },
] as const;

function usePieces() {
  const { scene } = useGLTF(HELMET_URL, false, true);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = BODY.height / size.y;

    // One material for every piece (the model shares a single texture set);
    // cloned so the emissive drive never leaks into drei's GLTF cache.
    let material: THREE.MeshStandardMaterial | null = null;
    const pieces = PIECES.map((p) => {
      const src = scene.getObjectByName(p.node);
      const group = new THREE.Group();
      src?.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        if (!material) {
          material = (m.material as THREE.MeshStandardMaterial).clone();
          material.envMapIntensity = 1.1;
        }
        const mesh = new THREE.Mesh(m.geometry, material);
        // Bake the node's world transform into the clone, then normalise.
        mesh.matrixAutoUpdate = false;
        mesh.matrix
          .makeScale(scale, scale, scale)
          .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z))
          .multiply(m.matrixWorld);
        group.add(mesh);
      });
      return { ...p, object: group };
    });
    return { pieces, material: material as THREE.MeshStandardMaterial | null };
  }, [scene]);
}

/** Optics: the model's emissive map lights the eyes; we drive its intensity
 *  so they flicker on after the faceplate seals and surge for the hero shot. */
function Optics({ material }: { material: THREE.MeshStandardMaterial | null }) {
  const { progressRef } = useArmor();
  const mat = useRef(material);
  useFrame(() => {
    const m = mat.current;
    if (!m) return;
    const p = progressRef.current;
    const e = win(p, 0.72, 0.8);
    const flick = e > 0 && e < 1 ? e * (0.45 + 0.55 * Math.abs(Math.sin(e * 29))) : e;
    m.emissiveIntensity = flick * 2.6 + smooth(win(p, 0.86, 0.97)) * 1.4;
  });
  return null;
}

export default function HelmetGLB() {
  const { pieces, material } = usePieces();
  return (
    <group>
      {pieces.map((p) => (
        <Part
          key={p.id}
          id={p.id}
          at={p.at as unknown as [number, number]}
          from={p.from as unknown as [number, number, number]}
          spin={p.spin as unknown as [number, number, number]}
        >
          <primitive object={p.object} />
        </Part>
      ))}
      <Optics material={material} />
    </group>
  );
}

useGLTF.preload(HELMET_URL, false, true);
