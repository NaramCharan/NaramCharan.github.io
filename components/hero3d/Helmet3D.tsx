"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReactorMaterials } from "../reactor3d/parts";
import { useHelmetShellGeometries, useEyeSlitGeometry } from "./helmetParts";

/**
 * The 3D helmet, assembled by a scroll-progress ref (0..1).
 *
 * Scene map (from the design brief, shifted so the at-rest identity block keeps
 * 0–28% of the track):
 *   1. 0.00–0.28  fragments scattered in the dark, motes drifting, slow approach
 *   2. 0.28–0.52  inner steel frame lands FIRST, then dome / crown / collar
 *   3. 0.46–0.68  jaw locks, vent + brow + ridge seat, faceplate arrives OPEN
 *   4. 0.68–0.84  faceplate closes, eyes ignite, sparks settle
 *   5. 0.84–1.00  calm, settle, slow orbit with a tilt toward the viewer
 *
 * Each part lerps from a scattered start pose to its locked pose across its own
 * window, read inside useFrame — no React re-render and no per-frame allocation.
 */
type Props = { progress: React.MutableRefObject<number> };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const backOut = (t: number) => {
  const c1 = 1.70158,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const win = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));
const lerp = THREE.MathUtils.lerp;

/* Deterministic pseudo-random so particle fields never differ run to run. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

export default function Helmet3D({ progress }: Props) {
  const mat = useReactorMaterials();
  const g = useHelmetShellGeometries();
  const eyeGeo = useEyeSlitGeometry();

  const rootRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Group>(null);
  const domeRef = useRef<THREE.Group>(null);
  const crownRef = useRef<THREE.Group>(null);
  const collarRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const faceRef = useRef<THREE.Group>(null);
  const detailRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const eyeLightRef = useRef<THREE.PointLight>(null);
  const motesRef = useRef<THREE.Points>(null);

  // Desktop-only particle field — skipped under 640px to protect the mobile
  // frame budget. Safe to read innerWidth: the canvas mounts client-only.
  const motes = useMemo(() => {
    if (typeof window === "undefined" || window.innerWidth < 640) return null;
    const COUNT = 140;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (hash(i + 1) - 0.5) * 11;
      pos[i * 3 + 1] = (hash(i + 41) - 0.5) * 8;
      pos[i * 3 + 2] = (hash(i + 97) - 0.5) * 7 - 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const moteMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#7de7f5",
        size: 0.035,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    // Dev-only: pin progress via window.__pin to inspect a pose without
    // scrolling (preview screenshots black out when the page is scrolled).
    if (process.env.NODE_ENV !== "production") {
      const pin = (globalThis as { __pin?: number }).__pin;
      if (typeof pin === "number") progress.current = pin;
    }
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const small = state.size.width < 640;

    /* ── Scene 2 — inner steel frame lands first, then the outer dome ── */
    if (frameRef.current) {
      const k = easeOut(win(p, 0.28, 0.42));
      const o = frameRef.current;
      o.position.set(lerp(-6.5, 0, k), lerp(4.2, 0.05, k), lerp(-5.5, -0.1, k));
      o.rotation.set(lerp(1.1, 0, k), lerp(-1.4, 0, k), lerp(0.7, 0, k));
      o.scale.setScalar(lerp(0.55, 0.9, k));
    }
    if (domeRef.current) {
      const k = easeOut(win(p, 0.36, 0.52));
      const o = domeRef.current;
      o.position.set(lerp(6.8, 0, k), lerp(3.4, 0.05, k), lerp(-5, -0.1, k));
      o.rotation.set(lerp(-0.9, 0, k), lerp(1.6, 0, k), lerp(-0.8, 0, k));
      o.scale.setScalar(lerp(0.6, 1, k));
    }
    if (crownRef.current) {
      const k = easeOut(win(p, 0.4, 0.54));
      const o = crownRef.current;
      o.position.set(0, lerp(7, 0.06, k), lerp(-3, 0.62, k));
      o.rotation.x = lerp(-1.2, 0, k);
      o.scale.setScalar(Math.max(0.001, k));
    }
    if (collarRef.current) {
      const k = easeOut(win(p, 0.38, 0.52));
      const o = collarRef.current;
      o.position.set(0, lerp(-6.5, -1.34, k), lerp(-2.5, -0.05, k));
      o.rotation.y = lerp(Math.PI * 1.6, 0, k);
      o.scale.setScalar(Math.max(0.001, k));
    }

    /* ── Scene 3 — jaw locks with a clack, details seat, faceplate arrives ── */
    if (jawRef.current) {
      const k = win(p, 0.46, 0.62);
      const b = backOut(k);
      const o = jawRef.current;
      o.position.set(0, lerp(-5.2, 0.02, b), lerp(4.4, 0.9, b));
      o.rotation.x = lerp(-0.95, 0, b);
      o.scale.setScalar(Math.max(0.001, easeOut(k)));
    }
    if (detailRef.current) {
      const k = easeOut(win(p, 0.52, 0.66));
      detailRef.current.scale.setScalar(Math.max(0.001, k));
      detailRef.current.position.z = lerp(0.5, 0, k);
    }
    if (faceRef.current) {
      // Approach (stays OPEN) …
      const a = easeOut(win(p, 0.52, 0.68));
      // … then the close, the money beat.
      const c = backOut(win(p, 0.68, 0.82));
      const o = faceRef.current;
      o.position.set(
        0,
        lerp(5.6, lerp(0.5, 0.04, c), a),
        lerp(5.2, lerp(1.5, 0.98, c), a)
      );
      // Held open at ~0.55 rad through scene 3, hinging shut in scene 4.
      o.rotation.x = lerp(1.25, lerp(0.55, 0, c), a);
      o.scale.setScalar(Math.max(0.001, a));
    }

    /* ── Scene 4 — ignition, then calm so the copy stays readable ── */
    const ignite = win(p, 0.72, 0.84);
    const calm = win(p, 0.84, 0.96);
    const flicker = 1 + Math.sin(t * 2.4) * 0.04;
    const emissive = lerp(0, 3.0, ignite) * lerp(1, 0.36, calm) * flicker;
    mat.cyanGlass.emissiveIntensity = emissive;
    if (eyeLightRef.current) {
      eyeLightRef.current.intensity = lerp(0, 3.0, ignite) * lerp(1, 0.12, calm);
    }
    if (eyesRef.current) {
      eyesRef.current.scale.setScalar(Math.max(0.001, easeOut(win(p, 0.56, 0.68))));
    }

    /* ── Scene 1 + 4 — motes drift, then settle downward like dust ── */
    if (motesRef.current) {
      const m = motesRef.current;
      m.rotation.y = t * 0.02;
      m.position.y = -win(p, 0.72, 1) * 1.4;
      (m.material as THREE.PointsMaterial).opacity =
        0.5 * (1 - win(p, 0.62, 0.95)) + 0.12 * win(p, 0.74, 0.86);
    }

    /* ── Root — approach, settle, and the scene-5 orbit ── */
    if (rootRef.current) {
      const o = rootRef.current;
      const intro = easeOut(win(p, 0, 0.3));
      const approach = easeInOut(win(p, 0.62, 0.76));
      const settle = easeOut(win(p, 0.84, 0.98));
      const orbit = easeInOut(win(p, 0.86, 1));

      // Comes toward the camera as it seals, then eases back as it settles.
      o.position.z = lerp(0, small ? 2.0 : 3.2, approach) * (1 - settle);
      o.position.y = lerp(0, small ? 1.15 : 0.9, settle);
      o.scale.setScalar(lerp(0.62, 1, intro) * lerp(1, small ? 0.55 : 0.72, settle));

      // Scene 5: rotate the helmet rather than the camera — identical on screen,
      // and it leaves the declarative camera and the fog framing alone.
      o.rotation.y = lerp(0, 0.55, orbit) + Math.sin(t * 0.25) * 0.05 * settle;
      o.rotation.x = lerp(0, -0.12, orbit); // tilts toward the viewer
    }
  });

  return (
    <group ref={rootRef}>
      {motes && <points ref={motesRef} geometry={motes} material={moteMat} />}

      {/* Inner steel frame — lands first, stays visible through the dome gap */}
      <group ref={frameRef}>
        <mesh geometry={g.skull} material={mat.steel} />
      </group>

      {/* Outer dome */}
      <group ref={domeRef}>
        <mesh geometry={g.skull} material={mat.darkMetal} />
      </group>

      <group ref={crownRef}>
        <mesh geometry={g.crown} material={mat.steel} />
      </group>

      <group ref={collarRef}>
        <mesh geometry={g.collar} material={mat.darkMetal} />
      </group>

      {/* Jaw + mouth vent */}
      <group ref={jawRef}>
        <mesh geometry={g.jaw} material={mat.brightMetal} />
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            geometry={g.slat}
            material={mat.steel}
            position={[0, -0.64 - i * 0.12, 0.14 - i * 0.06]}
            scale={[1 - i * 0.2, 1, 1]}
          />
        ))}
      </group>

      {/* Faceplate — hinges shut in scene 4 */}
      <group ref={faceRef}>
        <mesh geometry={g.faceplate} material={mat.brightMetal} />
        <group ref={detailRef}>
          <mesh geometry={g.nose} material={mat.steel} position={[0, -0.02, 0.11]} />
          {[1, -1].map((s) => (
            <mesh
              key={s}
              geometry={g.brow}
              material={mat.steel}
              position={[s * 0.42, 0.62, 0.08]}
              rotation={[0, 0, s * 0.2]}
            />
          ))}
        </group>
        {/* Eye slits ride the faceplate so they stay aligned while it swings */}
        <group ref={eyesRef}>
          {[1, -1].map((s) => (
            <mesh
              key={s}
              geometry={eyeGeo}
              material={mat.cyanGlass}
              position={[s * 0.42, 0.4, 0.08]}
              rotation={[0, 0, s * 0.16]}
              scale={[s, 1, 1]}
            />
          ))}
        </group>
      </group>

      {/* Light spilling out from behind the slits */}
      <pointLight
        ref={eyeLightRef}
        position={[0, 0.44, 0.5]}
        intensity={0}
        distance={5}
        color="#7de7f5"
      />
    </group>
  );
}
