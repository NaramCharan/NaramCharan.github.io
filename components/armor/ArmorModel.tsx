"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group, PointLight, Material } from "three";
import Part from "./Part";
import { useArmor } from "./context";
import { smooth, win } from "./timeline";

/**
 * Project Aegis — procedural armor rig (placeholder for production GLBs).
 *
 * The character faces +z, feet on y = 0, its left side is +x. The rig is an
 * exposed mechanical skeleton (struts, joints, pistons, cabling) that is
 * always visible; every armor component is a <Part/> with its own scroll
 * window, docking onto the bone it belongs to. Arms are hierarchical
 * (shoulder → elbow → wrist → fingers), so the reaching start pose and the
 * symmetric hero pose are just bone rotations — the plates follow.
 *
 * Every Part `id` doubles as the node name a replacement GLB should use.
 */

const PI = Math.PI;
type V3 = [number, number, number];

/* ── small building blocks ─────────────────────────────────────────── */

function Seg({
  r,
  phi,
  theta,
  mat,
  scale,
  position,
  rotation,
}: {
  r: number;
  phi: [number, number];
  theta: [number, number];
  mat: Material;
  scale?: V3;
  position?: V3;
  rotation?: V3;
}) {
  return (
    <mesh material={mat} scale={scale} position={position} rotation={rotation} castShadow receiveShadow>
      <sphereGeometry args={[r, 48, 32, phi[0], phi[1], theta[0], theta[1]]} />
    </mesh>
  );
}

function Sleeve({ rt, rb, h, mat, position }: { rt: number; rb: number; h: number; mat: Material; position?: V3 }) {
  return (
    <mesh material={mat} position={position} castShadow receiveShadow>
      <cylinderGeometry args={[rt, rb, h, 32, 1, false]} />
    </mesh>
  );
}

function Box({ size, mat, radius = 0.012, position, rotation }: { size: V3; mat: Material; radius?: number; position?: V3; rotation?: V3 }) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={3} material={mat} position={position} rotation={rotation} castShadow receiveShadow />
  );
}

function Joint({ r, position }: { r: number; position?: V3 }) {
  const { mats } = useArmor();
  return (
    <group position={position}>
      <mesh material={mats.steel} castShadow>
        <sphereGeometry args={[r, 20, 14]} />
      </mesh>
      <mesh material={mats.frame} rotation={[PI / 2, 0, 0]}>
        <torusGeometry args={[r * 1.05, r * 0.22, 8, 24]} />
      </mesh>
    </group>
  );
}

/** A bone: frame strut down -y with twin hydraulic pistons alongside it. */
function Strut({ len, r = 0.018 }: { len: number; r?: number }) {
  const { mats } = useArmor();
  return (
    <group>
      <mesh material={mats.frame} position={[0, -len / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r * 0.85, len, 12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[r * 1.9 * s, 0, r * 0.7]}>
          <mesh material={mats.steel} position={[0, -len * 0.38, 0]}>
            <cylinderGeometry args={[r * 0.3, r * 0.3, len * 0.5, 8]} />
          </mesh>
          <mesh material={mats.frame} position={[0, -len * 0.7, 0]}>
            <cylinderGeometry args={[r * 0.55, r * 0.55, len * 0.34, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Thin rod between two points (actuators, cabling). */
function Rod({ a, b, r, mat }: { a: V3; b: V3; r: number; mat: Material }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  // Cylinder is +y; yaw/pitch it onto the a→b direction.
  const rotZ = -Math.atan2(dx, dy);
  const rotX = Math.atan2(dz, Math.hypot(dx, dy));
  return (
    <mesh material={mat} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={[rotX, 0, rotZ]}>
      <cylinderGeometry args={[r, r, len, 8]} />
    </mesh>
  );
}

/* Helmet surface helper: a point on the faceplate ellipsoid + the rotation
   that makes a flat detail sit tangent to it. */
const HELM_R = 0.147;
const HELM_SCALE: V3 = [0.9, 1.18, 1.08];
function onFace(phi: number, theta: number, lift = 0) {
  const r = HELM_R + lift;
  const pos: V3 = [
    -r * Math.cos(phi) * Math.sin(theta) * HELM_SCALE[0],
    r * Math.cos(theta) * HELM_SCALE[1],
    r * Math.sin(phi) * Math.sin(theta) * HELM_SCALE[2],
  ];
  const rot: V3 = [theta - PI / 2, phi - PI / 2, 0];
  return { pos, rot };
}

/* ── Helmet (scene 02, 0.10–0.25) ───────────────────────────────────── */

function Helmet() {
  const { mats } = useArmor();
  const eyeL = onFace(PI / 2 + 0.33, 1.42, 0.004);
  const eyeR = onFace(PI / 2 - 0.33, 1.42, 0.004);
  const mouth = onFace(PI / 2, 2.0, 0.003);
  const brow = onFace(PI / 2, 0.78, 0.004);
  return (
    <group position={[0, 1.7, 0]}>
      {/* skull frame + optic sensors — visible before the shell arrives */}
      <mesh material={mats.frame} scale={[0.92, 1.05, 1]} castShadow>
        <sphereGeometry args={[0.11, 24, 18]} />
      </mesh>
      <mesh material={mats.black} position={[0, 0.01, 0.09]} scale={[1.6, 0.5, 0.5]}>
        <sphereGeometry args={[0.03, 16, 12]} />
      </mesh>

      {/* rear shell */}
      <Part id="helmet_back" at={[0.1, 0.15]} from={[0, 0.18, -0.75]} spin={[0.8, 0, 0]}>
        <Seg r={0.135} phi={[PI + 0.45, PI - 0.9]} theta={[0, 2.3]} scale={HELM_SCALE} mat={mats.red} />
        <Box size={[0.018, 0.2, 0.05]} mat={mats.redDark} radius={0.006} position={[0, 0.07, -0.14]} rotation={[-0.5, 0, 0]} />
      </Part>

      {/* side panels with ear housings */}
      {([1, -1] as const).map((s) => (
        <Part
          key={s}
          id={s > 0 ? "helmet_side_l" : "helmet_side_r"}
          at={s > 0 ? [0.12, 0.17] : [0.13, 0.18]}
          from={[s * 0.62, 0.06, -0.12]}
          spin={[0, s * 0.9, 0]}
        >
          <Seg
            r={0.141}
            phi={s > 0 ? [PI / 2 + 0.68, PI / 2 - 0.16] : [-0.52, PI / 2 - 0.16]}
            theta={[0.3, 1.95]}
            scale={HELM_SCALE}
            mat={mats.red}
          />
          <group position={[s * 0.143, -0.01, -0.012]} rotation={[0, 0, PI / 2]}>
            <mesh material={mats.red} castShadow>
              <cylinderGeometry args={[0.034, 0.036, 0.02, 28]} />
            </mesh>
            <mesh material={mats.gold} position={[0, s * 0.006, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.022, 24]} />
            </mesh>
          </group>
        </Part>
      ))}

      {/* gold faceplate — swings down and forward into lock */}
      <Part id="faceplate" at={[0.16, 0.215]} from={[0, 0.24, 0.62]} spin={[-0.95, 0, 0]}>
        <Seg r={HELM_R} phi={[PI / 2 - 0.72, 1.44]} theta={[0.55, 1.6]} scale={HELM_SCALE} mat={mats.gold} />
        {/* optics: dark slits until ignition drives the emissive */}
        <mesh material={mats.eye} position={eyeL.pos} rotation={[eyeL.rot[0], eyeL.rot[1], 0.16]}>
          <boxGeometry args={[0.046, 0.013, 0.006]} />
        </mesh>
        <mesh material={mats.eye} position={eyeR.pos} rotation={[eyeR.rot[0], eyeR.rot[1], -0.16]}>
          <boxGeometry args={[0.046, 0.013, 0.006]} />
        </mesh>
        <mesh material={mats.black} position={mouth.pos} rotation={mouth.rot}>
          <boxGeometry args={[0.062, 0.005, 0.004]} />
        </mesh>
        <Box size={[0.05, 0.05, 0.01]} mat={mats.gold} radius={0.004} position={brow.pos} rotation={brow.rot} />
      </Part>

      {/* jaw rises to meet it */}
      <Part id="jaw" at={[0.18, 0.225]} from={[0, -0.36, 0.34]} spin={[0.8, 0, 0]}>
        <Seg r={HELM_R + 0.002} phi={[PI / 2 - 0.58, 1.16]} theta={[2.08, 0.5]} scale={HELM_SCALE} mat={mats.gold} />
      </Part>
    </group>
  );
}

/* ── Torso (scene 03, 0.25–0.45) ────────────────────────────────────── */

function Torso() {
  const { mats } = useArmor();
  return (
    <group>
      {/* ── exposed skeleton ── */}
      <Box size={[0.24, 0.08, 0.12]} mat={mats.frame} position={[0, 0.97, 0]} radius={0.02} />
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[0, 1.03 + i * 0.055, -0.035]}>
          <Box size={[0.052, 0.034, 0.042]} mat={mats.frame} radius={0.006} />
          <mesh material={mats.steel} position={[0, 0.027, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.012, 14]} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} position={[0, 1.2 + i * 0.05, -0.01]} scale={[1.15, 1, 0.82]} rotation={[PI / 2, 0, 0]}>
          <mesh material={mats.frame} rotation={[0, 0, -0.075 * PI]}>
            <torusGeometry args={[0.12 - i * 0.004, 0.0065, 6, 32, PI * 1.15]} />
          </mesh>
        </group>
      ))}
      <mesh material={mats.steel} position={[0, 1.47, 0]} rotation={[0, 0, PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.46, 10]} />
      </mesh>
      <mesh material={mats.frame} position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.03, 0.036, 0.13, 14]} />
      </mesh>
      {[1.53, 1.58].map((y) => (
        <mesh key={y} material={mats.steel} position={[0, y, 0]} rotation={[PI / 2, 0, 0]}>
          <torusGeometry args={[0.036, 0.006, 6, 20]} />
        </mesh>
      ))}
      {([1, -1] as const).map((s) => (
        <group key={s}>
          <Rod a={[s * 0.09, 1.28, 0.02]} b={[s * 0.21, 1.44, 0]} r={0.008} mat={mats.steel} />
          <Rod a={[s * 0.08, 1.24, 0.0]} b={[s * 0.19, 1.42, -0.02]} r={0.012} mat={mats.frame} />
          <Rod a={[s * 0.035, 1.05, -0.06]} b={[s * 0.04, 1.46, -0.05]} r={0.006} mat={mats.cable} />
          <Rod a={[s * 0.06, 1.08, -0.05]} b={[s * 0.1, 1.42, -0.03]} r={0.005} mat={mats.cable} />
          <Joint r={0.034} position={[s * 0.1, 0.95, 0]} />
        </group>
      ))}

      {/* ── armor ── */}
      <Part id="back_plate" at={[0.27, 0.32]} from={[0, 0.1, -0.7]}>
        <Box size={[0.34, 0.36, 0.06]} mat={mats.red} radius={0.025} position={[0, 1.31, -0.095]} />
        <Box size={[0.12, 0.2, 0.03]} mat={mats.redDark} radius={0.01} position={[0, 1.3, -0.13]} />
      </Part>

      {([1, -1] as const).map((s) => (
        <Part
          key={`chest${s}`}
          id={s > 0 ? "chest_l" : "chest_r"}
          at={s > 0 ? [0.28, 0.33] : [0.29, 0.34]}
          from={[s * 0.78, 0.06, 0.25]}
          spin={[0, s * 0.8, 0]}
        >
          <Box size={[0.17, 0.19, 0.075]} mat={mats.red} radius={0.03} position={[s * 0.088, 1.37, 0.075]} rotation={[0, -s * 0.32, 0]} />
          <Box size={[0.1, 0.022, 0.03]} mat={mats.gold} radius={0.008} position={[s * 0.1, 1.27, 0.1]} rotation={[0, -s * 0.3, s * 0.15]} />
        </Part>
      ))}

      <Part id="collar" at={[0.3, 0.35]} from={[0, 0.3, 0.3]}>
        <mesh material={mats.gold} position={[0, 1.465, 0.01]} rotation={[PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.1, 0.014, 10, 32, PI]} />
        </mesh>
      </Part>

      <Part id="reactor" at={[0.33, 0.37]} from={[0, 0, 0.65]} spin={[0, 0, 3]}>
        <group position={[0, 1.355, 0.125]}>
          <mesh material={mats.steel} castShadow>
            <torusGeometry args={[0.042, 0.011, 12, 36]} />
          </mesh>
          <mesh material={mats.reactor} rotation={[PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.033, 0.033, 0.01, 32]} />
          </mesh>
          <mesh material={mats.reactor} position={[0, 0, 0.007]} rotation={[PI / 2, PI, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.006, 3]} />
          </mesh>
        </group>
      </Part>

      {[0, 1, 2].map((i) => (
        <Part key={`abs${i}`} id={`abdomen_${i}`} at={[0.35 + i * 0.015, 0.39 + i * 0.015]} from={[0, 0, 0.5]}>
          <Box size={[0.19 - i * 0.012, 0.048, 0.07]} mat={i % 2 ? mats.redDark : mats.red} radius={0.015} position={[0, 1.235 - i * 0.058, 0.055]} />
        </Part>
      ))}

      {([1, -1] as const).map((s) => (
        <group key={`side${s}`}>
          <Part id={s > 0 ? "flank_l" : "flank_r"} at={[0.36, 0.41]} from={[s * 0.6, 0, 0]}>
            <Box size={[0.05, 0.2, 0.16]} mat={mats.red} radius={0.018} position={[s * 0.165, 1.27, 0]} rotation={[0, 0, s * 0.08]} />
          </Part>
          <Part
            id={s > 0 ? "pauldron_l" : "pauldron_r"}
            at={s > 0 ? [0.39, 0.44] : [0.395, 0.445]}
            from={[s * 0.7, 0.45, 0]}
            spin={[0, 0, -s * 1.2]}
          >
            <group position={[s * 0.245, 1.47, 0]} rotation={[0, 0, -s * 0.5]}>
              <Seg r={0.085} phi={[0, 2 * PI]} theta={[0, 1.2]} scale={[1.1, 0.85, 1.05]} mat={mats.red} />
              <Seg r={0.088} phi={[0, 2 * PI]} theta={[1.05, 0.14]} scale={[1.1, 0.85, 1.05]} mat={mats.gold} />
            </group>
            <Box size={[0.07, 0.03, 0.12]} mat={mats.gold} radius={0.01} position={[s * 0.13, 1.49, 0]} />
          </Part>
        </group>
      ))}
    </group>
  );
}

/* ── Arms (scene 04, 0.45–0.65) ─────────────────────────────────────── */

// Bone poses: [shoulderX, shoulderZ, elbowX]. The near arm starts reaching
// out (the reference's outstretched gauntlet); both settle symmetric.
const POSE = {
  startL: [-1.3, 0.18, -0.25],
  startR: [0.2, -0.32, -0.35],
  rest: [0.04, 0.14, -0.14],
};

function Arm({ s }: { s: 1 | -1 }) {
  const { mats, progressRef } = useArmor();
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  const o = s > 0 ? 0 : 0.008; // right side trails the left slightly

  useFrame(() => {
    const k = smooth(win(progressRef.current, 0.47, 0.62));
    const st = s > 0 ? POSE.startL : POSE.startR;
    const rx = st[0] + (POSE.rest[0] - st[0]) * k;
    const rz = st[1] + (s * POSE.rest[1] - st[1]) * k;
    const ex = st[2] + (POSE.rest[2] - st[2]) * k;
    shoulder.current?.rotation.set(rx, 0, rz);
    elbow.current?.rotation.set(ex, 0, 0);
  });

  return (
    <group ref={shoulder} position={[s * 0.235, 1.44, 0]}>
      <Joint r={0.04} />
      <Strut len={0.28} r={0.02} />
      <Part id={s > 0 ? "upperarm_l" : "upperarm_r"} at={[0.46 + o, 0.51 + o]} from={[s * 0.5, 0, 0.25]} spin={[0, 0, s * 0.9]}>
        <Sleeve rt={0.052} rb={0.046} h={0.2} mat={mats.red} position={[0, -0.13, 0]} />
        <mesh material={mats.gold} position={[0, -0.236, 0]} rotation={[PI / 2, 0, 0]}>
          <torusGeometry args={[0.047, 0.008, 8, 28]} />
        </mesh>
      </Part>

      <group ref={elbow} position={[0, -0.28, 0]}>
        <Joint r={0.033} />
        <Part id={s > 0 ? "elbow_l" : "elbow_r"} at={[0.51 + o, 0.545 + o]} from={[0, 0, -0.35]}>
          <Seg r={0.04} phi={[PI, PI]} theta={[0.2, 2.2]} mat={mats.gold} scale={[1, 1, 1.1]} position={[0, 0, -0.008]} />
        </Part>
        <Strut len={0.26} r={0.018} />
        <Part id={s > 0 ? "forearm_l" : "forearm_r"} at={[0.53 + o, 0.575 + o]} from={[s * 0.45, -0.15, 0.2]} spin={[0, s * 1.4, 0]}>
          <Sleeve rt={0.047} rb={0.04} h={0.2} mat={mats.red} position={[0, -0.12, 0]} />
          <Box size={[0.012, 0.16, 0.024]} mat={mats.gold} radius={0.004} position={[s * 0.045, -0.12, 0]} />
        </Part>

        {/* hand — palm faces the body */}
        <group position={[0, -0.26, 0]}>
          <Joint r={0.022} />
          <Box size={[0.028, 0.085, 0.075]} mat={mats.frame} radius={0.008} position={[0, -0.05, 0]} />
          <mesh material={mats.reactor} position={[-s * 0.016, -0.05, 0]} rotation={[0, 0, PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.004, 20]} />
          </mesh>
          <Part id={s > 0 ? "gauntlet_l" : "gauntlet_r"} at={[0.56 + o, 0.6 + o]} from={[s * 0.3, -0.1, 0]} spin={[0, 0, s]}>
            <Box size={[0.014, 0.075, 0.078]} mat={mats.red} radius={0.006} position={[s * 0.02, -0.047, 0]} />
          </Part>
          {[0, 1, 2, 3].map((i) => (
            <Part
              key={i}
              id={`finger_${i}_${s > 0 ? "l" : "r"}`}
              at={[0.585 + i * 0.008 + o, 0.615 + i * 0.008 + o]}
              from={[s * 0.12, -0.09, (i - 1.5) * 0.06]}
              spin={[0, 0, s * 1.3]}
            >
              <group position={[0, -0.09, (i - 1.5) * 0.019]} rotation={[0, 0, -s * 0.18]}>
                <Box size={[0.017, 0.036, 0.016]} mat={mats.red} radius={0.005} position={[0, -0.018, 0]} />
                <Box size={[0.016, 0.03, 0.015]} mat={mats.redDark} radius={0.005} position={[-s * 0.004, -0.051, 0]} rotation={[0, 0, -s * 0.25]} />
              </group>
            </Part>
          ))}
          <Part id={`thumb_${s > 0 ? "l" : "r"}`} at={[0.62 + o, 0.645]} from={[0, -0.05, 0.12]} spin={[0.9, 0, 0]}>
            <group position={[-s * 0.006, -0.035, 0.042]} rotation={[0.55, 0, -s * 0.45]}>
              <Box size={[0.017, 0.045, 0.017]} mat={mats.red} radius={0.005} position={[0, -0.022, 0]} />
            </group>
          </Part>
        </group>
      </group>
    </group>
  );
}

/* ── Lower body (scene 05, 0.65–0.80) ───────────────────────────────── */

function Leg({ s }: { s: 1 | -1 }) {
  const { mats } = useArmor();
  const o = s > 0 ? 0 : 0.008;
  return (
    <group position={[s * 0.1, 0.95, 0]}>
      <Strut len={0.43} r={0.028} />
      <Part id={s > 0 ? "thigh_l" : "thigh_r"} at={[0.68 + o, 0.72 + o]} from={[s * 0.6, 0.2, 0.3]} spin={[0, 0, s * 0.6]}>
        <Sleeve rt={0.075} rb={0.058} h={0.32} mat={mats.red} position={[0, -0.2, 0]} />
        <Box size={[0.014, 0.22, 0.04]} mat={mats.gold} radius={0.005} position={[s * 0.07, -0.2, 0]} />
      </Part>
      <group position={[0, -0.43, 0]}>
        <Joint r={0.038} />
        <Part id={s > 0 ? "knee_l" : "knee_r"} at={[0.715 + o, 0.75 + o]} from={[0, 0, 0.5]}>
          <Seg r={0.05} phi={[PI / 2 - 1.1, 2.2]} theta={[0.3, 2.3]} mat={mats.gold} position={[0, 0, 0.012]} />
        </Part>
        <Strut len={0.44} r={0.024} />
        <Part id={s > 0 ? "shin_l" : "shin_r"} at={[0.73 + o, 0.77 + o]} from={[s * 0.5, -0.2, 0.2]} spin={[0, s * 0.8, 0]}>
          <Sleeve rt={0.058} rb={0.045} h={0.34} mat={mats.red} position={[0, -0.22, 0]} />
          <Box size={[0.04, 0.18, 0.012]} mat={mats.gold} radius={0.005} position={[0, -0.2, 0.052]} />
          <mesh material={mats.gold} position={[0, -0.41, 0]} rotation={[PI / 2, 0, 0]}>
            <torusGeometry args={[0.046, 0.008, 8, 28]} />
          </mesh>
        </Part>
        <Joint r={0.026} position={[0, -0.44, 0]} />
        <Part id={s > 0 ? "foot_l" : "foot_r"} at={[0.755 + o, 0.8]} from={[0, -0.3, 0.5]} spin={[0.6, 0, 0]}>
          <Box size={[0.1, 0.07, 0.25]} mat={mats.red} radius={0.025} position={[0, -0.475, 0.05]} />
          <Box size={[0.07, 0.03, 0.06]} mat={mats.gold} radius={0.01} position={[0, -0.45, 0.15]} />
          <Box size={[0.104, 0.015, 0.252]} mat={mats.black} radius={0.005} position={[0, -0.505, 0.05]} />
        </Part>
      </group>
    </group>
  );
}

function Hips() {
  const { mats } = useArmor();
  return (
    <group>
      <Part id="belt" at={[0.65, 0.69]} from={[0, 0.4, 0]}>
        <mesh material={mats.redDark} position={[0, 0.99, 0]} scale={[1.15, 0.82, 1]} rotation={[PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.125, 0.022, 10, 40]} />
        </mesh>
        <Box size={[0.06, 0.04, 0.02]} mat={mats.gold} position={[0, 0.99, 0.105]} />
      </Part>
      {([1, -1] as const).map((s) => (
        <Part key={s} id={s > 0 ? "hip_l" : "hip_r"} at={[0.66, 0.7]} from={[s * 0.6, 0.1, 0]} spin={[0, 0, s * 0.7]}>
          <Box size={[0.07, 0.13, 0.17]} mat={mats.red} radius={0.02} position={[s * 0.15, 0.91, 0]} rotation={[0, 0, s * 0.12]} />
        </Part>
      ))}
      <Part id="codpiece" at={[0.67, 0.71]} from={[0, -0.3, 0.5]}>
        <Box size={[0.1, 0.1, 0.05]} mat={mats.red} radius={0.018} position={[0, 0.9, 0.075]} />
        <Box size={[0.02, 0.08, 0.01]} mat={mats.gold} radius={0.004} position={[0, 0.9, 0.102]} />
      </Part>
      <Part id="seat" at={[0.67, 0.71]} from={[0, 0, -0.5]}>
        <Box size={[0.2, 0.11, 0.05]} mat={mats.red} radius={0.018} position={[0, 0.92, -0.08]} />
      </Part>
    </group>
  );
}

/* ── Systems: optics + reactor driven by progress ───────────────────── */

function Systems() {
  const { mats, progressRef } = useArmor();
  const reactorLight = useRef<PointLight>(null);
  // Mutated per frame — held in refs so the React Compiler treats them as
  // escape hatches rather than render values.
  const eyeMat = useRef(mats.eye);
  const reactorMat = useRef(mats.reactor);
  useFrame(() => {
    const p = progressRef.current;
    // Optics ignite once the faceplate has locked — a deterministic flicker
    // keyed to progress, so it scrubs backwards too.
    const e = win(p, 0.215, 0.25);
    const flick = e > 0 && e < 1 ? e * (0.5 + 0.5 * Math.abs(Math.sin(e * 31))) : e;
    eyeMat.current.emissiveIntensity = flick * 3 + win(p, 0.86, 0.97) * 1.2;
    // Reactor: activates in the torso scene, surges for the hero shot.
    const r = smooth(win(p, 0.37, 0.42)) * 1.7 + smooth(win(p, 0.84, 0.96)) * 2.1;
    reactorMat.current.emissiveIntensity = r;
    if (reactorLight.current) reactorLight.current.intensity = r * 0.1;
  });
  return (
    <>
      <pointLight ref={reactorLight} position={[0, 1.36, 0.45]} color="#9ef3ff" distance={1.4} decay={2} intensity={0} />
    </>
  );
}

export default function ArmorModel() {
  return (
    <group>
      <Helmet />
      <Torso />
      <Arm s={1} />
      <Arm s={-1} />
      <Hips />
      <Leg s={1} />
      <Leg s={-1} />
      <Systems />
    </group>
  );
}
