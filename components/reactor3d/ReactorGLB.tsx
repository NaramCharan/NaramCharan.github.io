"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * The hero's arc reactor: "Arc Reactor bundle" by OPREXT
 * (https://sketchfab.com/3d-models/arc-reactor-bundle-ff38bee0ad2f4d63b9f77a59369eef4d),
 * licensed CC-BY-4.0 — credited in the Contact footer.
 *
 * Only the bundle's assembled reactor is shipped (the exploded copy and the
 * display boxes were stripped), simplified to ~50% and meshopt/WebP
 * compressed with gltf-transform (≈ 2.5 MB, decoder bundled with drei).
 *
 * Assembly is driven by the scroll-progress ref (0..1, read in useFrame, no
 * React re-render). At rest the reactor is an exploded stack — every layer
 * hovering above the one beneath it, the way the bundle's own "unassembled"
 * copy lays it out. Through segment B the stack collapses back-to-front:
 * housing, motors, radiator, capacitors, regulator, then the nine copper
 * coils swirl into their sockets, the wiring rings and glass seat, and the
 * centre bracket and bolts lock it shut. Then the core ignites and calms.
 */

export const REACTOR_URL = "/models/arc-reactor.glb";

type Props = { progress: React.MutableRefObject<number> };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const win = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));
const lerp = THREE.MathUtils.lerp;

/** World-space diameter the reactor is scaled to (the old procedural bezel). */
const DIAMETER = 4.4;
const AXIS = new THREE.Vector3(0, 1, 0); // reactor axis in the model's space

/** Assembly order, back to front. Names are three's sanitised node names;
 *  matched by prefix so the trailing export ids don't matter. */
const STAGES = [
  "base_1", // cage housing — the only part that comes from behind
  "motor_3",
  "radiator_1",
  "motor_2",
  "capacitors_2",
  "base_support_2",
  "amplifier_2",
  "REGULATOR_1",
  "regulator_shield_1",
  "coils", // the nine copper coils, staggered
  "Tube_6",
  "Tube_5",
  "glass",
  "base_support_top_1",
  "screws_1",
] as const;

type Unit = {
  pivot: THREE.Object3D;
  base: THREE.Vector3;
  from: THREE.Vector3; // start offset (model space)
  spin: number; // start rotation about the axis
  swirl: number; // start orbit angle about the axis (coils)
  a: number;
  b: number;
};

/** White dielectric surfaces read as plastic in a dark scene — retint them as
 *  brushed steel so the prop sits in the site's gunmetal / cyan / gold palette. */
function retint(m: THREE.MeshStandardMaterial) {
  const white = m.color.r > 0.9 && m.color.g > 0.9 && m.color.b > 0.9;
  if (white && m.metalness < 0.5 && !m.map && m.transparent === false) {
    m.color.set("#9aa7b1");
    m.metalness = 0.85;
    m.roughness = 0.34;
  }
  m.envMapIntensity = 1.15;
}

function useReactorRig() {
  const { scene } = useGLTF(REACTOR_URL, false, true);
  return useMemo(() => {
    const src = scene.clone(true);
    src.updateMatrixWorld(true);
    const assembled = src.getObjectByName("arc_reactor_assembled_120") ?? src;
    const top = [...assembled.children];
    const find = (prefix: string) => top.find((o) => o.name.startsWith(prefix));
    const reactor = find("arc_reactor_1");
    const wires = reactor?.getObjectByName("wires_128");
    const sub = (root: THREE.Object3D | undefined, prefix: string) =>
      root?.children.find((o) => o.name.startsWith(prefix));

    // Materials are cloned so the emissive drive never touches drei's cache.
    const glassMats: THREE.MeshStandardMaterial[] = [];
    const seen = new Map<THREE.Material, THREE.Material>();
    src.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const orig = mesh.material as THREE.MeshStandardMaterial;
      let m = seen.get(orig) as THREE.MeshStandardMaterial | undefined;
      if (!m) {
        m = orig.clone();
        retint(m);
        if (m.emissive.getHex() !== 0) {
          // The reactor glass: dark smoked cyan until the core ignites it.
          m.color.set("#0b2f3a");
          m.opacity = 0.5;
          glassMats.push(m);
        }
        seen.set(orig, m);
      }
      mesh.material = m;
    });

    // Every animated unit is re-parented into one flat rig (preserving its
    // world transform) under a pivot at its own bbox centre, so spins turn a
    // part in place rather than swinging it around a far-off export origin.
    const rig = new THREE.Group();
    // Measure before the parts are pulled out of `assembled` below.
    const box = new THREE.Box3().setFromObject(assembled);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = DIAMETER / Math.max(size.x, size.z);
    const units: Unit[] = [];
    const add = (obj: THREE.Object3D | undefined, stage: number, extra: Partial<Unit> = {}, slot = 0, slots = 1) => {
      if (!obj) return;
      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      const pivot = new THREE.Group();
      pivot.position.copy(c);
      rig.add(pivot);
      pivot.updateMatrixWorld(true);
      pivot.attach(obj);
      const a = 0.3 + stage * 0.025 + (slot / slots) * 0.07;
      // Back-to-front: later layers hover higher above the stack (capped, so
      // the front glass/bracket don't loom over the camera).
      const lift = stage === 0 ? -0.3 : 0.12 + Math.min(stage, 9) * 0.085;
      units.push({
        pivot,
        base: c.clone(),
        from: AXIS.clone().multiplyScalar(lift),
        spin: (stage % 2 ? 1 : -1) * (0.5 + stage * 0.06),
        swirl: 0,
        a,
        b: a + 0.11,
        ...extra,
      });
    };

    STAGES.forEach((name, stage) => {
      if (name === "coils") {
        const coils = [...(sub(wires, "Group_1")?.children ?? [])];
        coils.forEach((coil, i) =>
          add(coil, stage, {}, i, coils.length)
        );
        // radial fly-in + swirl for the coils (set after `add` computed base)
        units.slice(-coils.length).forEach((u, i) => {
          const radial = new THREE.Vector3(u.base.x - center.x, 0, u.base.z - center.z).normalize();
          u.from.add(radial.multiplyScalar(0.6));
          u.spin = 0;
          u.swirl = (i % 2 ? 1 : -1) * 0.55;
        });
        return;
      }
      if (name === "Tube_6" || name === "Tube_5") return add(sub(wires, name), stage);
      if (name === "glass") {
        add(sub(reactor, "glass"), stage);
        add(sub(reactor, "BEAM"), stage);
        return;
      }
      add(find(name), stage);
    });

    return { rig, units, center, scale, glassMats };
  }, [scene]);
}

const tmpQ = new THREE.Quaternion();

export default function ReactorGLB({ progress }: Props) {
  const { rig, units, center, scale, glassMats } = useReactorRig();
  const rootRef = useRef<THREE.Group>(null);
  const stackRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  // Remember each unit's assembled orientation once (the rig is cloned per mount).
  const baseQuats = useMemo(() => units.map((u) => u.pivot.quaternion.clone()), [units]);

  useFrame((state) => {
    // Dev-only: pin assembly progress via window.__pin for inspection.
    let p = progress.current;
    if (process.env.NODE_ENV !== "production") {
      const pin = (globalThis as { __pin?: number }).__pin;
      if (typeof pin === "number") p = pin;
    }
    const t = state.clock.elapsedTime;
    const asm = win(p, 0.3, 0.72);

    let lifted = 0;
    units.forEach((u, i) => {
      const k = easeOut(win(p, u.a, u.b));
      const r = 1 - k;
      const pos = u.pivot.position;
      pos.copy(u.base).addScaledVector(u.from, r);
      if (u.swirl) {
        // orbit the coil around the reactor axis as it flies in
        const ang = u.swirl * r;
        const x = pos.x - center.x, z = pos.z - center.z;
        pos.x = center.x + x * Math.cos(ang) - z * Math.sin(ang);
        pos.z = center.z + x * Math.sin(ang) + z * Math.cos(ang);
      }
      tmpQ.setFromAxisAngle(AXIS, u.spin * r + (u.swirl ? u.swirl * r : 0));
      u.pivot.quaternion.copy(tmpQ).multiply(baseQuats[i]);
      lifted = Math.max(lifted, u.from.y * r);
    });

    // Keep the exploded stack centred in frame as it collapses.
    if (stackRef.current) {
      stackRef.current.position.set(-center.x, -center.y - lifted * 0.5, -center.z);
    }

    // Core ignites, then CALMS once the name/copy arrives (segment C).
    const ign = win(p, 0.66, 0.78);
    const calm = win(p, 0.78, 0.92);
    const flicker = 1 + Math.sin(t * 5.3) * 0.04;
    glassMats.forEach((m) => {
      m.emissiveIntensity = ign * (1.7 - 0.5 * calm) * flicker;
    });
    if (coreLightRef.current) {
      coreLightRef.current.intensity = ign * (1 - 0.8 * calm) * 2 * (0.9 + Math.sin(t * 8) * 0.08);
    }

    if (rootRef.current) {
      const intro = easeOut(win(p, 0, 0.3));
      // As the core calms the assembly settles smaller + higher, parking clear
      // of the identity copy below (narrow screens stack taller copy).
      const small = state.size.width < 640;
      const settle = easeOut(win(p, 0.72, 0.88));
      // Phones: build at a size that fits the narrow width, park at 0.58.
      const fit = small ? 0.62 : 1;
      rootRef.current.scale.setScalar(lerp(0.7, 1, intro) * fit * lerp(1, small ? 0.94 : 0.74, settle));
      rootRef.current.position.y = lerp(0, small ? 1.0 : 0.8, settle);
      // Exploded: tipped back so the stack reads as a tower; assembled: face-on.
      const face = easeOut(asm);
      rootRef.current.rotation.x = -lerp(1.2, 0, face) + Math.sin(t * 0.2) * 0.02;
      rootRef.current.rotation.y = Math.sin(t * 0.25) * 0.06 + (1 - face) * 0.35;
    }
  });

  return (
    <group ref={rootRef}>
      <group rotation-x={Math.PI / 2} scale={scale}>
        <group ref={stackRef}>
          <primitive object={rig} />
        </group>
      </group>
      <pointLight ref={coreLightRef} color="#7de7f5" distance={9} intensity={0} position={[0, 0, 1.4]} />
    </group>
  );
}

useGLTF.preload(REACTOR_URL, false, true);
