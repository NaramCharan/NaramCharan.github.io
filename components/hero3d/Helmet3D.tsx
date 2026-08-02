"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReactorMaterials } from "../reactor3d/parts";
import { useHelmetShellGeometries, useEyeSlitGeometry } from "./helmetParts";

/**
 * The 3D helmet, assembled by a scroll-progress ref (0..1). Same contract as
 * the reactor it replaces: each part lerps from a scattered start pose to its
 * locked pose across its own progress window, read inside useFrame so nothing
 * re-renders per frame.
 *
 * STAGE 0 — locked pose only. The progress windows land in stage 2; right now
 * every part sits assembled so the silhouette can be judged on its own.
 */
type Props = { progress: React.MutableRefObject<number> };

export default function Helmet3D({ progress }: Props) {
  const mat = useReactorMaterials();
  const g = useHelmetShellGeometries();
  const eyeGeo = useEyeSlitGeometry();

  const rootRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Dev-only: pin assembly progress via window.__pin to inspect a pose
    // without scrolling (preview screenshots black out when scrolled).
    if (process.env.NODE_ENV !== "production") {
      const pin = (globalThis as { __pin?: number }).__pin;
      if (typeof pin === "number") progress.current = pin;
    }
    if (rootRef.current) {
      // Idle yaw so the form reads as a volume rather than a flat card.
      rootRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.16;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Back/top dome */}
      <mesh geometry={g.skull} material={mat.darkMetal} position={[0, 0.05, -0.1]} />

      {/* Crown spine */}
      <mesh geometry={g.crown} material={mat.steel} position={[0, 0.06, 0.62]} />

      {/* Faceplate — the one dominant clean surface */}
      <mesh geometry={g.faceplate} material={mat.brightMetal} position={[0, 0.04, 0.98]} />
      <mesh geometry={g.nose} material={mat.steel} position={[0, 0.02, 1.09]} />

      {/* Scowl: two raked brow bars meeting in a shallow V */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          geometry={g.brow}
          material={mat.steel}
          position={[s * 0.42, 0.66, 1.06]}
          rotation={[0, 0, s * 0.2]}
        />
      ))}

      {/* Jaw + mouth vent slats */}
      <mesh geometry={g.jaw} material={mat.brightMetal} position={[0, 0.02, 0.9]} />
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          geometry={g.slat}
          material={mat.steel}
          position={[0, -0.62 - i * 0.12, 1.02 - i * 0.06]}
          scale={[1 - i * 0.2, 1, 1]}
        />
      ))}

      {/* Cheek plates deliberately omitted: at every position tried they cut
          across the faceplate as bright wedges and turned the mid-face into
          polygon soup. The dome's own edge already frames the mask. */}

      {/* Eye slits — raked, mirrored, lit from behind */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          geometry={eyeGeo}
          material={mat.cyanGlass}
          position={[s * 0.42, 0.44, 1.06]}
          rotation={[0, 0, s * 0.16]}
          scale={[s, 1, 1]}
        />
      ))}
      <pointLight position={[0, 0.44, 0.7]} intensity={2.4} distance={4} color="#7de7f5" />

      {/* Neck collar */}
      <mesh geometry={g.collar} material={mat.darkMetal} position={[0, -1.34, -0.05]} />
    </group>
  );
}
