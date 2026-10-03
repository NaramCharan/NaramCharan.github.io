"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import Part from "./Part";
import { useArmor } from "./context";
import { smooth, win } from "./timeline";

/**
 * Project Aegis — the helmet.
 *
 * Built like a sculpted relief: each plate is traced as a 2D outline in a
 * 512-unit front-view sketch space, extruded with a rounded bevel, finely
 * tessellated, then warped onto a curved head form (z falls away with x² and
 * y²). Layers keep their own base depth, so plates stack and cast real seams
 * on each other — red shell → forehead tab → gold faceplate → chin plate,
 * eyes recessed behind the faceplate cut-outs. A red dome behind gives the
 * head its volume from the side.
 *
 * Outlines are original — traced to the classic Mark III proportions, not
 * copied from any asset. Every <Part id> can be replaced by a GLB node of the
 * same name (see assets.tsx).
 */

type P2 = [number, number];
const S = 2 / 500; // sketch px → world units (helmet ≈ 2.0 tall)
const v = ([x, y]: P2) => new THREE.Vector2((x - 256) * S, (256 - y) * S);
const mirror = (pts: P2[]): P2[] => pts.map(([x, y]) => [512 - x, y] as P2);

/** Full symmetric outline from a right half traced top-centre → bottom-centre. */
function symmetric(rightHalf: P2[]): P2[] {
  const left = mirror(rightHalf).reverse();
  return [...rightHalf, ...left.slice(1, -1)];
}

function polyShape(pts: P2[], { smoothCurve = false } = {}) {
  const s = new THREE.Shape();
  if (smoothCurve) {
    s.moveTo(...v(pts[0]).toArray());
    s.splineThru(pts.slice(1).map(v));
    s.closePath();
  } else {
    s.setFromPoints(pts.map(v));
  }
  return s;
}

/* ── Sketch outlines (512 × 512 front view, centre x = 256) ────────── */

const SHELL_R: P2[] = [
  [256, 6], [316, 8], [350, 16], [372, 46], [392, 100], [406, 160], [412, 230],
  [405, 300], [390, 360], [368, 410], [342, 448], [314, 485], [286, 503], [256, 508],
];

/** Shell split down the centre into two halves that dock together. */
function shellHalf(side: 1 | -1) {
  const half = side > 0 ? SHELL_R : mirror(SHELL_R);
  const s = new THREE.Shape();
  s.moveTo(...v(half[0]).toArray());
  s.splineThru(half.slice(1).map(v));
  s.lineTo(...v(half[0]).toArray());
  return s;
}

// Faceplate upper: forehead notch at the top, eyes cut out, lower edge
// following the cheek line down to the nose bridge.
const FACE_R: P2[] = [
  [256, 202], [314, 202], [320, 90], [352, 94], [382, 110], [395, 162], [399, 240],
  [394, 302], [388, 330], [344, 350], [314, 396], [256, 396],
];
const EYE_R: P2[] = [[374, 270], [282, 288], [288, 306], [362, 300]];
// Jaw: wraps from the cheek line to the chin, leaving red shell at the edges.
const JAW_R: P2[] = [
  [256, 396], [314, 396], [344, 350], [388, 330], [382, 368], [364, 404], [342, 436], [318, 470], [256, 470],
];
const CHIN: P2[] = [[204, 428], [308, 428], [302, 474], [210, 474]];
const TAB: P2[] = [[200, 14], [312, 14], [318, 30], [312, 214], [200, 214], [194, 30]];

function faceShape() {
  const s = polyShape(symmetric(FACE_R));
  s.holes.push(new THREE.Path(EYE_R.map(v)), new THREE.Path(mirror(EYE_R).map(v)));
  return s;
}

/* ── Geometry: extrude → tessellate → warp onto the head form ───────── */

const bulge = (x: number, y: number) => -(1.1 * x * x + 0.26 * y * y + 0.35 * Math.max(0, -y - 0.35) ** 2);

function plate(shape: THREE.Shape, { z, depth, bevel }: { z: number; depth: number; bevel: number }) {
  let g: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 28,
  });
  g = new TessellateModifier(0.03, 8).modify(g);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g, 1e-4);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) + z + bulge(x, y));
  }
  g.computeVertexNormals();
  return g;
}

function useHelmetGeometry() {
  return useMemo(() => {
    const ear = (side: 1 | -1) => {
      const s = new THREE.Shape();
      const c = v(side > 0 ? [416, 232] : [96, 232]);
      s.absellipse(c.x, c.y, 20 * S, 62 * S, 0, Math.PI * 2, false, 0);
      return s;
    };
    return {
      shellR: plate(shellHalf(1), { z: 0, depth: 0.1, bevel: 0.03 }),
      shellL: plate(shellHalf(-1), { z: 0, depth: 0.1, bevel: 0.03 }),
      earR: plate(ear(1), { z: 0.02, depth: 0.08, bevel: 0.02 }),
      earL: plate(ear(-1), { z: 0.02, depth: 0.08, bevel: 0.02 }),
      tab: plate(polyShape(TAB), { z: 0.11, depth: 0.04, bevel: 0.018 }),
      face: plate(faceShape(), { z: 0.14, depth: 0.05, bevel: 0.022 }),
      jaw: plate(polyShape(symmetric(JAW_R)), { z: 0.13, depth: 0.05, bevel: 0.022 }),
      chin: plate(polyShape(CHIN), { z: 0.2, depth: 0.035, bevel: 0.016 }),
      eyeR: plate(polyShape(EYE_R), { z: 0.12, depth: 0.03, bevel: 0.006 }),
      eyeL: plate(polyShape(mirror(EYE_R)), { z: 0.12, depth: 0.03, bevel: 0.006 }),
    };
  }, []);
}

/* ── Optics: ignite after the faceplate seals, surge for the hero shot ── */

function Optics() {
  const { mats, progressRef } = useArmor();
  const eyeMat = useRef(mats.eye);
  useFrame(() => {
    const p = progressRef.current;
    const e = win(p, 0.72, 0.8);
    const flick = e > 0 && e < 1 ? e * (0.45 + 0.55 * Math.abs(Math.sin(e * 29))) : e;
    const i = flick * 3.2 + smooth(win(p, 0.86, 0.97)) * 1.8;
    eyeMat.current.emissiveIntensity = i;
  });
  return null;
}

export default function HelmetModel() {
  const { mats } = useArmor();
  const g = useHelmetGeometry();
  return (
    <group>
      {/* ── inner frame: what the plates close over ── */}
      <mesh material={mats.frame} position={[0, 0, -0.42]} scale={[0.5, 0.8, 0.46]}>
        <sphereGeometry args={[1, 40, 28]} />
      </mesh>
      {[-0.45, -0.1, 0.25].map((y) => (
        <mesh key={y} material={mats.steel} position={[0, y, -0.42]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.95, 1]}>
          <torusGeometry args={[0.5 - Math.abs(y) * 0.35, 0.012, 8, 48]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.cable} position={[s * 0.22, -0.15, -0.02]} rotation={[0.2, 0, s * 0.25]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
        </mesh>
      ))}

      {/* rear dome — the head's volume from the side */}
      <Part id="helmet_back" at={[0.06, 0.18]} from={[0, 0.3, -1.2]} spin={[0.6, 0, 0]}>
        <mesh material={mats.red} position={[0, 0.02, -0.56]} scale={[0.6, 0.96, 0.58]}>
          <sphereGeometry args={[1, 48, 36]} />
        </mesh>
      </Part>

      <Part id="shell_l" at={[0.1, 0.2]} from={[1.05, 0.3, -0.7]} spin={[0, 0.9, 0.25]}>
        <mesh geometry={g.shellR} material={mats.red} />
      </Part>
      <Part id="shell_r" at={[0.12, 0.22]} from={[-1.1, 0.25, -0.3]} spin={[0, -0.9, -0.25]}>
        <mesh geometry={g.shellL} material={mats.red} />
      </Part>

      <Part id="ear_l" at={[0.2, 0.28]} from={[0.85, -0.25, -0.5]} spin={[0, 0, 1.6]}>
        <mesh geometry={g.earR} material={mats.red} />
      </Part>
      <Part id="ear_r" at={[0.22, 0.3]} from={[-0.9, -0.2, 0.1]} spin={[0, 0, -1.6]}>
        <mesh geometry={g.earL} material={mats.red} />
      </Part>

      <Part id="forehead_tab" at={[0.28, 0.38]} from={[-0.1, 1.15, 0.2]} spin={[-0.8, 0, 0]}>
        <mesh geometry={g.tab} material={mats.red} />
      </Part>

      <Part id="jaw" at={[0.38, 0.5]} from={[-0.2, -1.15, 0.45]} spin={[0.9, 0, 0]}>
        <mesh geometry={g.jaw} material={mats.gold} />
      </Part>
      <Part id="chin" at={[0.47, 0.57]} from={[-0.15, -0.95, 0.6]} spin={[0.6, 0, 0]}>
        <mesh geometry={g.chin} material={mats.gold} />
      </Part>

      {/* the faceplate — the moment the sequence builds toward */}
      <Part id="faceplate" at={[0.56, 0.72]} from={[-0.35, 0.95, 0.75]} spin={[-1.1, 0.3, 0]}>
        <mesh geometry={g.face} material={mats.gold} />
      </Part>

      <mesh geometry={g.eyeR} material={mats.eye} />
      <mesh geometry={g.eyeL} material={mats.eye} />
      <Optics />
    </group>
  );
}
