"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useArmor } from "./context";
import { BODY, smooth, win } from "./timeline";

/**
 * The full suit on /armor: "Iron Man" by Grant Riley
 * (https://sketchfab.com/3d-models/iron-man-69dde1ad49e94852984e3d83928efd65),
 * licensed CC-BY-NC-4.0 — credited on the page; non-commercial use only.
 * Optimised from 12 MB with gltf-transform (2048² WebP textures, meshopt).
 *
 * The model ships as three arbitrary 65k-vertex chunks, so the armor plates
 * are recovered at load time: vertices are welded by position and grouped
 * into connected components (~670 plates). Each plate gets its own scroll
 * window, fly-in vector and spin, written into vertex attributes, and a
 * small vertex-shader patch moves it — hundreds of independently animated
 * plates in three draw calls, with no per-frame JavaScript per plate.
 *
 * Build order follows a suit-up: boots and legs → torso → arms (shoulder to
 * gauntlet) → helmet, then the eyes and reactor ignite.
 */

export const SUIT_URL = "/models/iron-man-suit.glb";

/** Scroll windows (global progress) per region — kept in step with SCENES. */
const W = {
  legs: [0.08, 0.28],
  torso: [0.28, 0.44],
  arms: [0.44, 0.62],
  helmet: [0.62, 0.78],
  ignite: [0.78, 0.86],
} as const;

const PLATE_DUR = 0.09;

/* Deterministic PRNG so every load (and SSR/CSR) builds the same suit. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function toFloat(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, size: number) {
  const out = new Float32Array(attr.count * size);
  for (let i = 0; i < attr.count; i++) {
    out[i * size] = attr.getX(i);
    if (size > 1) out[i * size + 1] = attr.getY(i);
    if (size > 2) out[i * size + 2] = attr.getZ(i);
    if (size > 3) out[i * size + 3] = attr.getW(i);
  }
  return out;
}

/** Bake a mesh into normalised world space as plain Float32 attributes. */
function bake(mesh: THREE.Mesh, m: THREE.Matrix4) {
  const src = mesh.geometry;
  const g = new THREE.BufferGeometry();
  const pos = new THREE.Float32BufferAttribute(toFloat(src.attributes.position, 3), 3);
  pos.applyMatrix4(m);
  g.setAttribute("position", pos);
  const nm = new THREE.Matrix3().getNormalMatrix(m);
  if (src.attributes.normal) {
    const n = new THREE.Float32BufferAttribute(toFloat(src.attributes.normal, 3), 3);
    n.applyNormalMatrix(nm);
    const v = new THREE.Vector3();
    for (let i = 0; i < n.count; i++) {
      v.fromBufferAttribute(n, i).normalize();
      n.setXYZ(i, v.x, v.y, v.z);
    }
    g.setAttribute("normal", n);
  }
  if (src.attributes.tangent) {
    const t = toFloat(src.attributes.tangent, 4);
    const v = new THREE.Vector3();
    const m3 = new THREE.Matrix3().setFromMatrix4(m);
    for (let i = 0; i < t.length; i += 4) {
      v.set(t[i], t[i + 1], t[i + 2]).applyMatrix3(m3).normalize();
      t[i] = v.x;
      t[i + 1] = v.y;
      t[i + 2] = v.z;
    }
    g.setAttribute("tangent", new THREE.Float32BufferAttribute(t, 4));
  }
  if (src.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(toFloat(src.attributes.uv, 2), 2));
  if (src.index) g.setIndex(Array.from(src.index.array as ArrayLike<number>));
  return g;
}

/** Split into plates and write the per-vertex animation attributes. */
function plateAttributes(g: THREE.BufferGeometry, seed: number) {
  const pos = g.attributes.position.array as Float32Array;
  const n = pos.length / 3;
  const idx = g.index!.array as ArrayLike<number>;

  // Weld by position (UV seams duplicate vertices), then union-find on tris.
  const key = new Map<string, number>();
  const weld = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const k = `${Math.round(pos[i * 3] * 1e4)},${Math.round(pos[i * 3 + 1] * 1e4)},${Math.round(pos[i * 3 + 2] * 1e4)}`;
    let w = key.get(k);
    if (w === undefined) key.set(k, (w = i));
    weld[i] = w;
  }
  const parent = new Int32Array(n).map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  for (let t = 0; t < idx.length; t += 3) {
    const a = weld[idx[t]];
    union(a, weld[idx[t + 1]]);
    union(a, weld[idx[t + 2]]);
  }

  // Per-plate centroid.
  const sums = new Map<number, [number, number, number, number]>();
  for (let i = 0; i < n; i++) {
    const r = find(weld[i]);
    const s = sums.get(r) ?? [0, 0, 0, 0];
    s[0] += pos[i * 3];
    s[1] += pos[i * 3 + 1];
    s[2] += pos[i * 3 + 2];
    s[3]++;
    sums.set(r, s);
  }

  type Plate = { c: THREE.Vector3; off: THREE.Vector3; axis: THREE.Vector3; win: [number, number] };
  const plates = new Map<number, Plate>();
  const rand = rng(seed);
  const half = BODY.height / 2;
  for (const [r, s] of [...sums.entries()].sort((a, b) => a[0] - b[0])) {
    const c = new THREE.Vector3(s[0] / s[3], s[1] / s[3], s[2] / s[3]);
    const yN = (c.y + half) / BODY.height; // 0 = soles, 1 = top of helmet
    const ax = Math.abs(c.x);
    let start: number;
    if (yN > 0.87) start = W.helmet[0] + rand() * (W.helmet[1] - W.helmet[0] - PLATE_DUR);
    else if (ax > 0.26 && yN > 0.38) {
      // arms: shoulder first, gauntlet last
      const k = THREE.MathUtils.clamp((ax - 0.26) / 0.2 + (0.87 - yN) * 0.6, 0, 1);
      start = W.arms[0] + k * (W.arms[1] - W.arms[0] - PLATE_DUR) + (rand() - 0.5) * 0.02;
    } else if (yN < 0.45) {
      start = W.legs[0] + (yN / 0.45) * (W.legs[1] - W.legs[0] - PLATE_DUR) + (rand() - 0.5) * 0.03;
    } else {
      start = W.torso[0] + ((yN - 0.45) / 0.42) * (W.torso[1] - W.torso[0] - PLATE_DUR) + (rand() - 0.5) * 0.02;
    }
    // Fly in from outside the body: radially out, a little up/down, and
    // helmet plates from above and in front.
    const radial = new THREE.Vector3(c.x, 0, c.z);
    if (radial.lengthSq() < 1e-4) radial.set(rand() - 0.5, 0, 1);
    radial.normalize();
    const dist = 0.75 + rand() * 0.9;
    const off = radial.multiplyScalar(dist).add(new THREE.Vector3(0, (rand() - 0.5) * 0.9, 0));
    if (yN > 0.87) off.add(new THREE.Vector3(0, 0.6, 0.4));
    const axis = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize().multiplyScalar(1.2 + rand() * 1.8);
    plates.set(r, { c, off, axis, win: [start, start + PLATE_DUR] });
  }

  const aCenter = new Float32Array(n * 3);
  const aOffset = new Float32Array(n * 3);
  const aAxis = new Float32Array(n * 3);
  const aWin = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const p = plates.get(find(weld[i]))!;
    p.c.toArray(aCenter, i * 3);
    p.off.toArray(aOffset, i * 3);
    p.axis.toArray(aAxis, i * 3);
    aWin[i * 2] = p.win[0];
    aWin[i * 2 + 1] = p.win[1];
  }
  g.setAttribute("aCenter", new THREE.BufferAttribute(aCenter, 3));
  g.setAttribute("aOffset", new THREE.BufferAttribute(aOffset, 3));
  g.setAttribute("aAxis", new THREE.BufferAttribute(aAxis, 3));
  g.setAttribute("aWin", new THREE.BufferAttribute(aWin, 2));
  return plates.size;
}

/** Vertex-shader patch: each plate eases from its offset/spin to rest. */
function patchMaterial(mat: THREE.MeshStandardMaterial, uniforms: { uP: { value: number }; uSpread: { value: number } }) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uP = uniforms.uP;
    shader.uniforms.uSpread = uniforms.uSpread;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uP;
        uniform float uSpread;
        attribute vec3 aCenter;
        attribute vec3 aOffset;
        attribute vec3 aAxis;
        attribute vec2 aWin;
        float plateR() {
          float t = clamp((uP - aWin.x) / max(aWin.y - aWin.x, 1e-4), 0.0, 1.0);
          float u = t - 1.0;
          float k = 1.0 + 2.2 * u * u * u + 1.2 * u * u; // ease-out with lock-in overshoot
          return 1.0 - k;
        }
        vec3 plateRot(vec3 v, float r) {
          float ang = length(aAxis) * r;
          if (abs(ang) < 1e-5) return v;
          vec3 a = normalize(aAxis);
          float c = cos(ang), s = sin(ang);
          return v * c + cross(a, v) * s + a * dot(a, v) * (1.0 - c);
        }`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        float pr = plateR();
        objectNormal = plateRot(objectNormal, pr);
        #ifdef USE_TANGENT
          objectTangent = plateRot(objectTangent, pr);
        #endif`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        transformed = aCenter + plateRot(transformed - aCenter, pr) + aOffset * pr * uSpread;`,
      );
  };
  mat.customProgramCacheKey = () => "suit-plates-v1";
}

function useSuit() {
  const { scene } = useGLTF(SUIT_URL, false, true);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = BODY.height / size.y;
    const norm = new THREE.Matrix4().makeScale(s, s, s).multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));

    const uniforms = { uP: { value: 0 }, uSpread: { value: 1 } };
    let material: THREE.MeshStandardMaterial | null = null;
    const geometries: THREE.BufferGeometry[] = [];
    let plates = 0;
    let seed = 7;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (!material) {
        material = (mesh.material as THREE.MeshStandardMaterial).clone();
        material.envMapIntensity = 1.0;
        // the KHR specular extension makes the gold faceplate flare to white
        // under the key light; tame it so the helmet reads as metal.
        if ("specularIntensity" in material) (material as THREE.MeshPhysicalMaterial).specularIntensity = 0.55;
        patchMaterial(material, uniforms);
      }
      const g = bake(mesh, new THREE.Matrix4().multiplyMatrices(norm, mesh.matrixWorld));
      plates += plateAttributes(g, seed++);
      g.computeBoundingSphere();
      geometries.push(g);
    });
    const baseEmissive = (material as THREE.MeshStandardMaterial | null)?.emissiveIntensity ?? 1;
    return { geometries, material: material as THREE.MeshStandardMaterial | null, uniforms, plates, baseEmissive };
  }, [scene]);
}

export default function SuitGLB() {
  const { progressRef, spread } = useArmor();
  const { geometries, material, uniforms, baseEmissive } = useSuit();
  const mat = useRef(material);
  const u = useRef(uniforms);
  useFrame(() => {
    const p = progressRef.current;
    u.current.uP.value = p;
    u.current.uSpread.value = spread;
    const m = mat.current;
    if (!m) return;
    // Eyes + reactor: dark until the helmet seals, flicker on, then hold.
    const e = win(p, W.ignite[0], W.ignite[1]);
    const flick = e > 0 && e < 1 ? e * (0.45 + 0.55 * Math.abs(Math.sin(e * 29))) : e;
    m.emissiveIntensity = baseEmissive * (flick * 0.85 + smooth(win(p, 0.88, 0.98)) * 0.35);
  });
  if (!material) return null;
  return (
    <group>
      {geometries.map((g, i) => (
        // Plates fly from well outside the static bounds — never cull.
        <mesh key={i} geometry={g} material={material} frustumCulled={false} />
      ))}
    </group>
  );
}

useGLTF.preload(SUIT_URL, false, true);
